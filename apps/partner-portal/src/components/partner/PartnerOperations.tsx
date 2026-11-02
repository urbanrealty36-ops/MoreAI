"use client";
import { useEffect,useState } from "react";
import { getPortalApi } from "../../lib/client";
type State={partner?:any;branches:any[];networks:any[];campaigns:any[];rewards:any[];analytics?:any;loading:boolean;error?:string};
export function PartnerOperations(){
 const [data,setData]=useState<State>({branches:[],networks:[],campaigns:[],rewards:[],loading:true});
 useEffect(()=>{let live=true;(async()=>{
  try{const api=getPortalApi();const [me,branches,networks,campaigns,rewards,analytics]=await Promise.all([api.partner.me(),api.partner.branches(),api.partner.networks(),api.partner.campaigns(),api.partner.rewards(),api.partner.analytics()]);
   if(live)setData({partner:me.partner,branches:branches.items,networks:networks.items,campaigns:campaigns.items,rewards:rewards.items,analytics,loading:false});
  }catch(e){if(live)setData(v=>({...v,loading:false,error:e instanceof Error?e.message:"Partner data unavailable"}));}
 })();return()=>{live=false;};},[]);
 if(data.loading)return <p className="rounded-xl border border-[#171717] bg-white p-4 text-sm">Memuat data mitra dari FastAPI…</p>;
 if(data.error)return <section className="rounded-xl border-2 border-amber-700 bg-amber-50 p-4 text-sm text-amber-950"><strong>Data mitra belum tersedia</strong><p className="mt-1">{data.error}</p></section>;
 const stats=[["Cabang",data.branches.length],["Jaringan",data.networks.length],["Campaign",data.campaigns.length],["Reward",data.rewards.length]];
 return <section className="space-y-3">
  <div className="rounded-xl border-2 border-[#171717] bg-white p-4"><p className="text-xs text-gray-500">Organisasi mitra</p><h2 className="text-lg font-black">{data.partner?.display_name??data.partner?.legal_name}</h2><p className="text-xs text-gray-500">Status: {data.partner?.status}</p></div>
  <div className="grid grid-cols-2 gap-2">{stats.map(([label,value])=><div key={String(label)} className="rounded-xl border-2 border-[#171717] bg-white p-3"><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-black">{value}</p></div>)}</div>
  <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Cabang & jaringan</h2>{data.branches.map((b:any)=><div key={b.id} className="border-t py-2 text-xs"><strong>{b.name}</strong><span className="ml-2 text-gray-500">{b.status}</span></div>)}{data.networks.map((n:any)=><div key={n.id} className="border-t py-2 text-xs"><strong>{n.name}</strong><span className="ml-2 text-gray-500">{n.ssid_label??"SSID tersembunyi"} · {n.status}</span></div>)}</div>
  <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Campaign & reward</h2>{data.campaigns.map((c:any)=><div key={c.id} className="border-t py-2 text-xs"><strong>{c.name}</strong><span className="ml-2 text-gray-500">{c.status}</span></div>)}<p className="mt-2 text-xs text-gray-500">Reward tersedia: {data.rewards.length}</p></div>
  <p className="text-xs text-gray-500">Tampilan ini read-only. CRUD lokasi, jaringan, metode verifikasi, campaign, reward, dan staf menunggu endpoint mutation yang diaudit.</p>
 </section>;
}
