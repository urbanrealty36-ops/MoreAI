from __future__ import annotations
import asyncio,hashlib,json,logging,os,signal,socket,sys,uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any,Protocol
import httpx
LOG=logging.getLogger("moreai.worker")
@dataclass(frozen=True)
class WorkerConfig:
    supabase_url:str;service_key:str;api_base_url:str;worker_token:str
    poll_seconds:float=2;lease_seconds:int=90;heartbeat_seconds:int=20;max_concurrency:int=4
    @classmethod
    def from_env(cls):
        u=os.getenv("SUPABASE_URL","").rstrip("/");k=os.getenv("SUPABASE_SECRET_KEY","");a=os.getenv("MOREAI_API_BASE_URL","").rstrip("/");t=os.getenv("WORKER_INTERNAL_TOKEN","")
        if not u.startswith("https://") or not k:raise RuntimeError("Supabase URL/secret key required")
        if not a.startswith("https://") or not t:raise RuntimeError("MoreAI API URL/worker token required")
        return cls(u,k,a,t,max(.5,float(os.getenv("WORKER_POLL_SECONDS","2"))),max(15,min(900,int(os.getenv("WORKER_LEASE_SECONDS","90")))),max(5,int(os.getenv("WORKER_HEARTBEAT_SECONDS","20"))),max(1,min(32,int(os.getenv("WORKER_MAX_CONCURRENCY","4")))))
class Store:
    def __init__(self,c):
        self.c=c;self.client=httpx.AsyncClient(base_url=f"{c.supabase_url}/rest/v1/",timeout=httpx.Timeout(15,connect=5),headers={"apikey":c.service_key,"Authorization":f"Bearer {c.service_key}","Content-Type":"application/json"})
    async def rpc(self,n,p):
        r=await self.client.post(f"rpc/{n}",json=p);r.raise_for_status();return r.json() if r.content else None
    async def claim(self,w):return await self.rpc("moreai_worker_claim_run",{"p_worker_id":w,"p_lease_seconds":self.c.lease_seconds})
    async def heartbeat(self,r,w):return await self.rpc("moreai_worker_heartbeat",{"p_run_id":r,"p_worker_id":w,"p_lease_seconds":self.c.lease_seconds})
    async def checkpoint(self,r,w,k,s):return await self.rpc("moreai_worker_checkpoint",{"p_run_id":r,"p_worker_id":w,"p_checkpoint_key":k,"p_state":s})
    async def latest_checkpoint(self,r):
        x=await self.client.get("agent_run_checkpoints",params={"select":"checkpoint_key,state,created_at","run_id":f"eq.{r}","order":"created_at.desc","limit":"1"});x.raise_for_status();rows=x.json();return rows[0] if rows else None
    async def finish(self,r,w,s,o=None,e=None):return await self.rpc("moreai_worker_finish_run",{"p_run_id":r,"p_worker_id":w,"p_status":s,"p_output":o,"p_error":e,"p_retry_delay_seconds":30})
    async def close(self):await self.client.aclose()
class Executor(Protocol):
    async def execute(self,run:dict[str,Any],checkpoint:dict[str,Any]|None=None)->dict[str,Any]:...
class GatewayLLM:
    def __init__(self,c,user_id,run_id,worker_id):
        from openai import AsyncOpenAI
        self.c=c;self.user_id=user_id;self.run_id=run_id;self.worker_id=worker_id
        self.client=AsyncOpenAI(base_url=f"{c.api_base_url}/api/v1/internal/llm",api_key=c.worker_token,default_headers={"X-Worker-Token":c.worker_token},timeout=55,max_retries=0)
    async def ask(self,messages,system_msgs=None,stream=False,temperature=None):
        from app.llm import LLM
        formatted=LLM.format_messages((system_msgs or [])+messages);digest=hashlib.sha256(json.dumps(formatted,sort_keys=True,default=str).encode()).hexdigest()
        response=await self.client.chat.completions.create(model="moreai-router",messages=formatted,max_tokens=2048,extra_body={"user_id":self.user_id,"run_id":self.run_id},extra_headers={"Idempotency-Key":f"agent:{self.run_id}:{digest}"})
        content=response.choices[0].message.content or ""
        async with httpx.AsyncClient(timeout=15) as client:
            saved=await client.post(f"{self.c.api_base_url}/api/v1/internal/agents/runs/{self.run_id}/checkpoint",headers={"X-Worker-Token":self.c.worker_token,"X-Worker-ID":self.worker_id},json={"checkpoint_key":f"llm:{digest}","state":{"messages":formatted+[{"role":"assistant","content":content}]}})
            saved.raise_for_status()
        return content
class OpenManusExecutor:
    def __init__(self,c):self.c=c
    async def execute(self,run,checkpoint=None):
        src=Path(os.getenv("OPENMANUS_SOURCE_PATH","/app/vendor/openmanusweb"))
        if not src.exists():raise RuntimeError("OPENMANUS_SOURCE_PATH is not mounted in worker image")
        sys.path.insert(0,str(src))
        data=run.get("input") or {};prompt=data.get("prompt") or data.get("message")
        if not isinstance(prompt,str) or not prompt.strip():raise ValueError("Agent prompt required")
        try:
            from app.agent.manus import Manus
            from app.schema import Message
            from app.tool import Terminate,ToolCollection
        except ImportError as exc:raise RuntimeError("OpenManus runtime dependencies are missing") from exc
        agent=Manus(max_steps=max(1,min(int(data.get("max_steps",8)),20)))
        agent.available_tools=ToolCollection(Terminate());agent.tool_choices="none"
        agent.llm=GatewayLLM(self.c,str(run["user_id"]),str(run["id"]),str(run["lease_owner"]))
        if checkpoint and isinstance(checkpoint.get("state"),dict) and isinstance(checkpoint["state"].get("messages"),list):
            agent.memory.messages=[Message.model_validate(m) for m in checkpoint["state"]["messages"]]
        return {"text":await agent.run(prompt),"engine":"openmanus","attempt":run.get("attempt",1)}
class Worker:
    def __init__(self,c,e):self.c=c;self.store=Store(c);self.executor=e;self.worker_id=f"{socket.gethostname()}:{uuid.uuid4()}"
    async def heartbeat_loop(self,r,lost,cancel,stop):
        while not stop.is_set():
            try:await asyncio.wait_for(stop.wait(),timeout=self.c.heartbeat_seconds);return
            except TimeoutError:pass
            x=await self.store.heartbeat(r,self.worker_id)
            if x and x.get("cancel_requested"):cancel.set();return
            if not x or not x.get("alive"):lost.set();return
    async def process(self,run):
        rid=str(run["id"]);lost=asyncio.Event();cancel=asyncio.Event();stop=asyncio.Event();beat=asyncio.create_task(self.heartbeat_loop(rid,lost,cancel,stop));task=None
        try:
            cp=await self.store.latest_checkpoint(rid);await self.store.checkpoint(rid,self.worker_id,"worker.started",{"attempt":run.get("attempt",1),"worker_id":self.worker_id})
            task=asyncio.create_task(self.executor.execute({**run,"lease_owner":self.worker_id},cp));wait=asyncio.create_task(cancel.wait());done,_=await asyncio.wait({task,wait},return_when=asyncio.FIRST_COMPLETED)
            if wait in done and cancel.is_set():task.cancel();await asyncio.gather(task,return_exceptions=True);await self.store.finish(rid,self.worker_id,"cancelled",e={"code":"CANCEL_REQUESTED"});return
            wait.cancel();await asyncio.gather(wait,return_exceptions=True);out=await task
            if not lost.is_set():await self.store.finish(rid,self.worker_id,"succeeded",o=out)
        except asyncio.CancelledError:
            if not lost.is_set():await self.store.finish(rid,self.worker_id,"cancelled",e={"code":"WORKER_SHUTDOWN"})
            raise
        except Exception as exc:
            LOG.exception("Run %s failed",rid)
            if not lost.is_set():await self.store.finish(rid,self.worker_id,"failed",e={"code":"EXECUTION_FAILED","message":str(exc)[:500]})
        finally:stop.set();beat.cancel();await asyncio.gather(beat,return_exceptions=True)
    async def reconcile(self):
        try:
            async with httpx.AsyncClient(timeout=20) as client:r=await client.post(f"{self.c.api_base_url}/api/v1/internal/llm/reconcile",headers={"X-Worker-Token":self.c.worker_token});r.raise_for_status()
        except httpx.HTTPError:LOG.exception("LLM settlement reconciliation failed")
    async def serve(self):
        active=set();last=0.0
        try:
            while True:
                active={t for t in active if not t.done()};now=asyncio.get_running_loop().time()
                if now-last>30:await self.reconcile();last=now
                if len(active)>=self.c.max_concurrency:await asyncio.sleep(self.c.poll_seconds);continue
                run=await self.store.claim(self.worker_id)
                if run:active.add(asyncio.create_task(self.process(run)))
                else:await asyncio.sleep(self.c.poll_seconds)
        finally:
            for task in active:task.cancel()
            await asyncio.gather(*active,return_exceptions=True);await self.store.close()
async def _main():
    logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO"));c=WorkerConfig.from_env();w=Worker(c,OpenManusExecutor(c));stop=asyncio.Event();loop=asyncio.get_running_loop()
    for sig in (signal.SIGINT,signal.SIGTERM):loop.add_signal_handler(sig,stop.set)
    task=asyncio.create_task(w.serve());await stop.wait();task.cancel();await asyncio.gather(task,return_exceptions=True)
def main():asyncio.run(_main())
if __name__=="__main__":main()
