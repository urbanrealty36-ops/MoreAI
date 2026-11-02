from __future__ import annotations
import asyncio, logging, os, signal, socket, uuid
from dataclasses import dataclass
from typing import Any, Protocol
import httpx
LOG=logging.getLogger("moreai.worker")

@dataclass(frozen=True)
class WorkerConfig:
    supabase_url:str
    service_key:str
    poll_seconds:float=2
    lease_seconds:int=90
    heartbeat_seconds:int=20
    max_concurrency:int=4
    @classmethod
    def from_env(cls):
        url=os.getenv("SUPABASE_URL","").rstrip("/")
        key=os.getenv("SUPABASE_SECRET_KEY","")
        if not url.startswith("https://") or not key: raise RuntimeError("SUPABASE_URL (https) and SUPABASE_SECRET_KEY are required")
        return cls(url,key,max(.5,float(os.getenv("WORKER_POLL_SECONDS","2"))),max(15,min(900,int(os.getenv("WORKER_LEASE_SECONDS","90")))),max(5,int(os.getenv("WORKER_HEARTBEAT_SECONDS","20"))),max(1,min(32,int(os.getenv("WORKER_MAX_CONCURRENCY","4")))))

class Store:
    def __init__(self,c):
        self.config=c
        self.client=httpx.AsyncClient(base_url=f"{c.supabase_url}/rest/v1/",timeout=httpx.Timeout(15,connect=5),headers={"apikey":c.service_key,"Authorization":f"Bearer {c.service_key}","Content-Type":"application/json"})
    async def rpc(self,n,p):
        r=await self.client.post(f"rpc/{n}",json=p);r.raise_for_status();return r.json() if r.content else None
    async def claim(self,w): return await self.rpc("moreai_worker_claim_run",{"p_worker_id":w,"p_lease_seconds":self.config.lease_seconds})
    async def heartbeat(self,r,w): return await self.rpc("moreai_worker_heartbeat",{"p_run_id":r,"p_worker_id":w,"p_lease_seconds":self.config.lease_seconds})
    async def checkpoint(self,r,w,k,s): return await self.rpc("moreai_worker_checkpoint",{"p_run_id":r,"p_worker_id":w,"p_checkpoint_key":k,"p_state":s})
    async def latest_checkpoint(self,r):
        x=await self.client.get("agent_run_checkpoints",params={"select":"checkpoint_key,state,created_at","run_id":f"eq.{r}","order":"created_at.desc","limit":"1"});x.raise_for_status();a=x.json();return a[0] if a else None
    async def finish(self,r,w,s,o=None,e=None): return await self.rpc("moreai_worker_finish_run",{"p_run_id":r,"p_worker_id":w,"p_status":s,"p_output":o,"p_error":e,"p_retry_delay_seconds":30})
    async def close(self): await self.client.aclose()

class Executor(Protocol):
    async def execute(self,run:dict[str,Any],checkpoint:dict[str,Any]|None=None)->dict[str,Any]: ...

class OpenManusExecutor:
    """OpenManus adapter. Upstream shell/Python/browser/filesystem tools are deny-by-default."""
    async def execute(self,run,checkpoint=None):
        prompt=(run.get("input") or {}).get("prompt") or (run.get("input") or {}).get("message")
        if not isinstance(prompt,str) or not prompt.strip(): raise ValueError("Agent run requires input.prompt or input.message")
        if os.getenv("OPENMANUS_RUNTIME_ENABLED","false").lower()!="true": raise RuntimeError("OpenManus runtime disabled until gateway/tool adapters are configured")
        if os.getenv("OPENMANUS_GATEWAY_ADAPTER")!="enabled": raise RuntimeError("OpenManus gateway adapter is not configured")
        try:
            from app.agent.manus import Manus
            from app.tool import Terminate,ToolCollection
        except ImportError as e: raise RuntimeError("OpenManus source dependencies are not installed in worker image") from e
        agent=Manus(max_steps=max(1,min(int((run.get("input") or {}).get("max_steps",8)),20)))
        agent.available_tools=ToolCollection(Terminate())
        agent.tool_choices="none"
        if checkpoint and isinstance(checkpoint.get("state"),dict) and isinstance(checkpoint["state"].get("messages"),list):
            from app.schema import Message
            agent.memory.messages=[Message.model_validate(m) for m in checkpoint["state"]["messages"]]
        return {"text":await agent.run(prompt),"engine":"openmanus","attempt":run.get("attempt",1)}

class Worker:
    def __init__(self,c,executor):
        self.config=c;self.store=Store(c);self.executor=executor;self.worker_id=f"{socket.gethostname()}:{uuid.uuid4()}"
    async def _heartbeat(self,r,lost,cancel,stop):
        while not stop.is_set():
            try: await asyncio.wait_for(stop.wait(),timeout=self.config.heartbeat_seconds);return
            except TimeoutError: pass
            result=await self.store.heartbeat(r,self.worker_id)
            if result and result.get("cancel_requested"): cancel.set();return
            if not result or not result.get("alive"): lost.set();return
    async def process(self,run):
        rid=str(run["id"]);lost=asyncio.Event();cancel=asyncio.Event();stop=asyncio.Event()
        beat=asyncio.create_task(self._heartbeat(rid,lost,cancel,stop));execution=None
        try:
            cp=await self.store.latest_checkpoint(rid)
            await self.store.checkpoint(rid,self.worker_id,"worker.started",{"attempt":run.get("attempt",1),"worker_id":self.worker_id})
            execution=asyncio.create_task(self.executor.execute(run,cp));cancel_wait=asyncio.create_task(cancel.wait())
            done,_=await asyncio.wait({execution,cancel_wait},return_when=asyncio.FIRST_COMPLETED)
            if cancel_wait in done and cancel.is_set():
                execution.cancel();await asyncio.gather(execution,return_exceptions=True)
                await self.store.finish(rid,self.worker_id,"cancelled",e={"code":"CANCEL_REQUESTED"});return
            cancel_wait.cancel();await asyncio.gather(cancel_wait,return_exceptions=True)
            output=await execution
            if not lost.is_set(): await self.store.finish(rid,self.worker_id,"succeeded",o=output)
            else: LOG.warning("lease lost; output not committed for %s",rid)
        except asyncio.CancelledError:
            if not lost.is_set(): await self.store.finish(rid,self.worker_id,"cancelled",e={"code":"WORKER_SHUTDOWN"})
            raise
        except Exception as e:
            LOG.exception("run %s failed",rid)
            if not lost.is_set(): await self.store.finish(rid,self.worker_id,"failed",e={"code":"EXECUTION_FAILED","message":str(e)[:500]})
        finally:
            stop.set();beat.cancel();await asyncio.gather(beat,return_exceptions=True)
    async def serve(self):
        active=set()
        try:
            while True:
                active={t for t in active if not t.done()}
                if len(active)>=self.config.max_concurrency: await asyncio.sleep(self.config.poll_seconds);continue
                run=await self.store.claim(self.worker_id)
                if run: active.add(asyncio.create_task(self.process(run)))
                else: await asyncio.sleep(self.config.poll_seconds)
        finally:
            for t in active:t.cancel()
            await asyncio.gather(*active,return_exceptions=True);await self.store.close()

async def _main():
    logging.basicConfig(level=os.getenv("LOG_LEVEL","INFO"));w=Worker(WorkerConfig.from_env(),OpenManusExecutor());stop=asyncio.Event();loop=asyncio.get_running_loop()
    for s in (signal.SIGINT,signal.SIGTERM):loop.add_signal_handler(s,stop.set)
    task=asyncio.create_task(w.serve());await stop.wait();task.cancel();await asyncio.gather(task,return_exceptions=True)
def main(): asyncio.run(_main())
if __name__=="__main__":main()
