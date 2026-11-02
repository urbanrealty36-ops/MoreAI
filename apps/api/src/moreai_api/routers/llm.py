from __future__ import annotations
import asyncio,hashlib,json,secrets,time
from decimal import Decimal
from typing import Annotated
from uuid import UUID
import httpx
from fastapi import APIRouter,Depends,Header,HTTPException
from pydantic import BaseModel,Field
from moreai_api.auth import require_authenticated_user
from moreai_api.db import rpc,select_rows
from moreai_api.settings import settings

router=APIRouter(prefix="/llm",tags=["llm"])
internal_router=APIRouter(prefix="/internal/llm",tags=["internal-llm"])
Claims=Annotated[dict,Depends(require_authenticated_user)]

class GenerateRequest(BaseModel):
    prompt:str=Field(min_length=1,max_length=12000)
    model:str|None=Field(default=None,max_length=120)
    max_output_tokens:int=Field(default=2048,ge=1,le=4096)
class InternalGenerateRequest(GenerateRequest):
    user_id:UUID
    run_id:UUID
class CompatRequest(BaseModel):
    model:str="moreai-router"
    messages:list[dict]=Field(min_length=1,max_length=64)
    max_tokens:int=Field(default=2048,ge=1,le=4096)
    user_id:UUID
    run_id:UUID
class GenerateResponse(BaseModel):
    text:str
    model:str
    provider:str
    request_id:str
    usage:dict[str,int]
class ProviderFailure(Exception):
    def __init__(self,code:str,ambiguous:bool=False,retryable:bool=False):
        self.code,self.ambiguous,self.retryable=code,ambiguous,retryable
        super().__init__(code)

def _cost(input_tokens:int,output_tokens:int,model:dict)->Decimal:
    return (Decimal(input_tokens)*Decimal(str(model["input_cost_per_million"]))+Decimal(output_tokens)*Decimal(str(model["output_cost_per_million"])))/Decimal(1_000_000)

def _key(provider:str)->str|None:
    return {"google":settings.llm_provider_api_key,"openai":settings.llm_openai_api_key,"anthropic":settings.llm_anthropic_api_key}.get(provider)

async def _model(model_id:str)->dict|None:
    rows=await select_rows("llm_models",f"select=id,key,input_cost_per_million,output_cost_per_million,max_output_tokens,enabled,provider:llm_providers(key,enabled)&id=eq.{model_id}&enabled=eq.true&limit=1")
    if not rows:return None
    m=rows[0];p=m.get("provider") or {}
    return m if p.get("enabled") and p.get("key") in {"google","openai","anthropic"} else None

async def _routes(requested:str|None)->list[dict]:
    policies=await select_rows("llm_routing_policies","select=model_id,fallback_model_id,model:llm_models(id,key,input_cost_per_million,output_cost_per_million,max_output_tokens,enabled,provider:llm_providers(key,enabled))&scope_type=eq.platform&scope_id=is.null&task_type=eq.general&enabled=eq.true&order=priority.asc&limit=20")
    for policy in policies:
        primary=policy.get("model") or {};provider=primary.get("provider") or {}
        if not primary.get("enabled") or not provider.get("enabled"):continue
        choices=[primary]
        if policy.get("fallback_model_id"):
            fallback=await _model(str(policy["fallback_model_id"]))
            if fallback:choices.append(fallback)
        if requested:choices=[m for m in choices if m.get("key")==requested]
        if choices:return choices
    raise HTTPException(503,detail={"code":"LLM_ROUTE_UNAVAILABLE","message":"No enabled provider route is configured."})

async def _provider(model:dict,prompt:str,max_tokens:int)->tuple[str,int,int,str|None]:
    provider=model["provider"]["key"];key=_key(provider)
    if not key:raise ProviderFailure("PROVIDER_CREDENTIALS_NOT_CONFIGURED")
    estimate=max(1,(len(prompt)+3)//4)
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(45,connect=5)) as client:
            if provider=="google":
                r=await client.post(f"https://generativelanguage.googleapis.com/v1beta/models/{model['key']}:generateContent",headers={"x-goog-api-key":key},json={"contents":[{"role":"user","parts":[{"text":prompt}]}],"generationConfig":{"maxOutputTokens":max_tokens}})
                r.raise_for_status();data=r.json()
                text="".join(part["text"] for c in data.get("candidates",[])[:1] for part in c.get("content",{}).get("parts",[]) if isinstance(part.get("text"),str))
                usage=data.get("usageMetadata",{});tin=int(usage.get("promptTokenCount",estimate));tout=int(usage.get("candidatesTokenCount",max(1,(len(text)+3)//4)));rid=data.get("responseId")
            elif provider=="openai":
                r=await client.post("https://api.openai.com/v1/chat/completions",headers={"Authorization":f"Bearer {key}"},json={"model":model["key"],"messages":[{"role":"user","content":prompt}],"max_tokens":max_tokens})
                r.raise_for_status();data=r.json();text=data["choices"][0]["message"]["content"];usage=data.get("usage",{});tin=int(usage.get("prompt_tokens",estimate));tout=int(usage.get("completion_tokens",max(1,(len(text)+3)//4)));rid=data.get("id")
            else:
                r=await client.post("https://api.anthropic.com/v1/messages",headers={"x-api-key":key,"anthropic-version":"2023-06-01"},json={"model":model["key"],"max_tokens":max_tokens,"messages":[{"role":"user","content":prompt}]})
                r.raise_for_status();data=r.json();text="".join(x.get("text","") for x in data.get("content",[]) if x.get("type")=="text");usage=data.get("usage",{});tin=int(usage.get("input_tokens",estimate));tout=int(usage.get("output_tokens",max(1,(len(text)+3)//4)));rid=data.get("id")
        if not isinstance(text,str) or not text.strip():raise ProviderFailure("PROVIDER_EMPTY_RESPONSE",ambiguous=True)
        return text,tin,tout,rid
    except httpx.ConnectError as e:raise ProviderFailure("PROVIDER_CONNECT_FAILED",retryable=True) from e
    except httpx.ConnectTimeout as e:raise ProviderFailure("PROVIDER_CONNECT_TIMEOUT",retryable=True) from e
    except httpx.ReadTimeout as e:raise ProviderFailure("PROVIDER_READ_TIMEOUT",ambiguous=True) from e
    except httpx.HTTPStatusError as e:
        code=e.response.status_code
        if code==429:raise ProviderFailure("PROVIDER_RATE_LIMITED",retryable=True) from e
        if code in (404,410):raise ProviderFailure("PROVIDER_MODEL_UNAVAILABLE",retryable=True) from e
        if code>=500:raise ProviderFailure("PROVIDER_SERVER_ERROR",ambiguous=True) from e
        raise ProviderFailure("PROVIDER_REJECTED_REQUEST") from e
    except (KeyError,TypeError,ValueError) as e:raise ProviderFailure("PROVIDER_RESPONSE_INVALID",ambiguous=True) from e
    except httpx.HTTPError as e:raise ProviderFailure("PROVIDER_TRANSPORT_ERROR",ambiguous=True) from e

async def _generate(payload:GenerateRequest,user_id:str,key:str,run_id:str|None=None)->GenerateResponse:
    if not settings.credits_per_usd or settings.credits_per_usd<=0:raise HTTPException(503,detail={"code":"CREDIT_CONVERSION_NOT_CONFIGURED"})
    models=await _routes(payload.model);tin_est=max(1,(len(payload.prompt)+3)//4)
    estimate=max(_cost(tin_est,payload.max_output_tokens,m) for m in models)
    reserve=(estimate*settings.credits_per_usd).quantize(Decimal("0.000001"))
    if reserve<=0:raise HTTPException(503,detail={"code":"MODEL_PRICING_NOT_CONFIGURED"})
    digest=hashlib.sha256(json.dumps({"prompt":payload.prompt,"model":payload.model,"max_tokens":payload.max_output_tokens,"run_id":run_id},sort_keys=True).encode()).hexdigest()
    claim=await rpc("moreai_llm_claim_request",{"p_user_id":user_id,"p_run_id":run_id,"p_idempotency_key":key,"p_request_hash":digest})
    if claim["status"]=="succeeded":
        return GenerateResponse(text=claim["response_text"],model=claim["model_key"],provider=claim["provider_key"],request_id=claim["id"],usage={"input_tokens":claim["input_tokens"],"output_tokens":claim["output_tokens"]})
    if not claim["created"]:
        if claim["status"]=="provider_succeeded":
            credits=(Decimal(str(claim["actual_cost"]))*settings.credits_per_usd).quantize(Decimal("0.000001"))
            await rpc("moreai_llm_finalize_request",{"p_request_id":claim["id"],"p_actual_credits":float(credits),"p_settlement_key":f"llm-settle:{claim['id']}"})
            fresh=await rpc("moreai_llm_claim_request",{"p_user_id":user_id,"p_run_id":run_id,"p_idempotency_key":key,"p_request_hash":digest})
            return GenerateResponse(text=fresh["response_text"],model=fresh["model_key"],provider=fresh["provider_key"],request_id=fresh["id"],usage={"input_tokens":fresh["input_tokens"],"output_tokens":fresh["output_tokens"]})
        raise HTTPException(409,detail={"code":"LLM_REQUEST_OUTCOME_UNKNOWN" if claim["status"]=="unknown" else "LLM_REQUEST_IN_PROGRESS"})
    wallets=await select_rows("wallet_accounts",f"select=id&owner_type=eq.user&owner_id=eq.{user_id}&status=eq.active&limit=1")
    if not wallets:
        await rpc("moreai_llm_fail_request",{"p_request_id":claim["id"],"p_error_code":"CREDIT_WALLET_NOT_CONFIGURED","p_release":True})
        raise HTTPException(409,detail={"code":"CREDIT_WALLET_NOT_CONFIGURED"})
    reservation=await rpc("moreai_credit_reserve",{"p_wallet_id":wallets[0]["id"],"p_user_id":user_id,"p_amount":float(reserve),"p_idempotency_key":f"llm-reserve:{user_id}:{key}","p_run_id":run_id,"p_ttl_seconds":900})
    reservation_id=reservation.get("reservation_id")
    if not reservation_id:
        await rpc("moreai_llm_fail_request",{"p_request_id":claim["id"],"p_error_code":"CREDIT_RESERVATION_FAILED","p_release":True})
        raise HTTPException(409,detail={"code":"CREDIT_RESERVATION_FAILED"})
    await rpc("moreai_llm_set_reservation",{"p_request_id":claim["id"],"p_reservation_id":reservation_id,"p_estimated_cost":float(estimate)})
    started=time.monotonic();selected=None;result=None;failure=None
    for index,m in enumerate(models):
        for attempt in range(2):
            try:result=await _provider(m,payload.prompt,payload.max_output_tokens);selected=m;break
            except ProviderFailure as exc:
                failure=exc
                if exc.ambiguous:
                    await rpc("moreai_llm_fail_request",{"p_request_id":claim["id"],"p_error_code":exc.code,"p_release":False})
                    raise HTTPException(504,detail={"code":"LLM_PROVIDER_OUTCOME_UNKNOWN","message":"Provider result uncertain; reservation retained for reconciliation."}) from exc
                if not exc.retryable:break
                if attempt==0:await asyncio.sleep(.5*(2**attempt))
        if result:break
        if failure and not failure.retryable:break
        if index==len(models)-1:break
    if not result or not selected:
        await rpc("moreai_llm_fail_request",{"p_request_id":claim["id"],"p_error_code":failure.code if failure else "LLM_PROVIDER_UNAVAILABLE","p_release":True,"p_release_key":f"llm-release:{claim['id']}"})
        raise HTTPException(502,detail={"code":failure.code if failure else "LLM_PROVIDER_UNAVAILABLE","message":"Provider route failed; reserved credits released."})
    text,tin,tout,provider_id=result;actual=_cost(tin,tout,selected);credits=(actual*settings.credits_per_usd).quantize(Decimal("0.000001"));latency=int((time.monotonic()-started)*1000)
    await rpc("moreai_llm_mark_provider_result",{"p_request_id":claim["id"],"p_provider_key":selected["provider"]["key"],"p_model_key":selected["key"],"p_response_text":text,"p_input_tokens":tin,"p_output_tokens":tout,"p_actual_cost":float(actual),"p_latency_ms":latency,"p_provider_response_id":provider_id})
    try:await rpc("moreai_llm_finalize_request",{"p_request_id":claim["id"],"p_actual_credits":float(credits),"p_settlement_key":f"llm-settle:{claim['id']}","p_provider_response_id":provider_id})
    except HTTPException as e:raise HTTPException(503,detail={"code":"LLM_SETTLEMENT_PENDING","message":"Provider result stored; settlement will be retried."}) from e
    return GenerateResponse(text=text,model=selected["key"],provider=selected["provider"]["key"],request_id=claim["id"],usage={"input_tokens":tin,"output_tokens":tout})

@router.post("/generate",response_model=GenerateResponse)
async def generate(payload:GenerateRequest,claims:Claims,idempotency_key:Annotated[str|None,Header(alias="Idempotency-Key")]=None):
    user_id=str(UUID(str(claims.get("sub",""))))
    if not idempotency_key or len(idempotency_key.strip())<8 or len(idempotency_key)>200:raise HTTPException(400,detail={"code":"IDEMPOTENCY_KEY_REQUIRED"})
    return await _generate(payload,user_id,idempotency_key)

def _check_worker(token:str|None):
    expected=settings.worker_internal_token or ""
    if not expected or not token or not secrets.compare_digest(token,expected):raise HTTPException(401,detail={"code":"WORKER_AUTH_REQUIRED"})

@internal_router.post("/generate",response_model=GenerateResponse)
async def internal_generate(payload:InternalGenerateRequest,worker_token:Annotated[str|None,Header(alias="X-Worker-Token")]=None,idempotency_key:Annotated[str|None,Header(alias="Idempotency-Key")]=None):
    _check_worker(worker_token)
    if not idempotency_key or len(idempotency_key)<8 or len(idempotency_key)>200:raise HTTPException(400,detail={"code":"IDEMPOTENCY_KEY_REQUIRED"})
    return await _generate(payload,str(payload.user_id),idempotency_key,str(payload.run_id))

@internal_router.post("/openai/chat/completions")
async def internal_openai_compat(payload:CompatRequest,worker_token:Annotated[str|None,Header(alias="X-Worker-Token")]=None,idempotency_key:Annotated[str|None,Header(alias="Idempotency-Key")]=None):
    _check_worker(worker_token)
    if not idempotency_key or len(idempotency_key)<8 or len(idempotency_key)>200:raise HTTPException(400,detail={"code":"IDEMPOTENCY_KEY_REQUIRED"})
    prompt="\n".join(f"{m.get('role','user')}: {m.get('content','')}" for m in payload.messages if isinstance(m.get("content"),str))
    out=await _generate(GenerateRequest(prompt=prompt,max_output_tokens=payload.max_tokens),str(payload.user_id),idempotency_key,str(payload.run_id))
    return {"id":out.request_id,"object":"chat.completion","created":int(time.time()),"model":out.model,"choices":[{"index":0,"message":{"role":"assistant","content":out.text},"finish_reason":"stop"}],"usage":{"prompt_tokens":out.usage["input_tokens"],"completion_tokens":out.usage["output_tokens"],"total_tokens":out.usage["input_tokens"]+out.usage["output_tokens"]}}

@internal_router.post("/reconcile")
async def reconcile(worker_token:Annotated[str|None,Header(alias="X-Worker-Token")]=None):
    _check_worker(worker_token)
    pending=await select_rows("llm_request_records","select=id,actual_cost&status=eq.provider_succeeded&order=updated_at.asc&limit=50")
    completed=0
    for item in pending:
        try:
            credits=(Decimal(str(item["actual_cost"]))*settings.credits_per_usd).quantize(Decimal("0.000001"))
            await rpc("moreai_llm_finalize_request",{"p_request_id":item["id"],"p_actual_credits":float(credits),"p_settlement_key":f"llm-settle:{item['id']}"})
            completed+=1
        except (HTTPException,KeyError,TypeError):continue
    return {"reconciled":completed,"pending_seen":len(pending)}
