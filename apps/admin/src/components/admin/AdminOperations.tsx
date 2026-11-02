"use client";
import { useEffect,useState } from "react";
import { getPortalApi } from "../../lib/client";

type Data={overview?:Record<string,number>;users?:unknown[];models?:unknown[];audit?:unknown[];verificationMethods:any[];error?:string;loading:boolean};
export function AdminOperations(){
 const [data,setData]=useState<Data>({loading:true,verificationMethods:[]});
 useEffect(()=>{let live=true;(async()=>{
  try{
   const api=getPortalApi();
   const [overview,users,models,audit,verification]=await Promise.all([api.admin.overview(),api.admin.users(),api.admin.models(),api.admin.audit(),api.admin.verificationMethods()]);
   if(live)setData({loading:false,overview,users:users.items,models:models.items,audit:audit.items,verificationMethods:verification.items});
  }catch(e){if(live)setData({loading:false,error:e instanceof Error?e.message:"Admin data unavailable"});}
 })();return()=>{live=false;};},[]);
 if(data.loading)return <p className="rounded-xl border border-[#171717] bg-white p-4 text-sm">Memuat data operasional dari FastAPI…</p>;
 async function toggleMethod(methodKey:string,enabled:boolean){try{await getPortalApi().admin.setVerificationMethodAvailability(methodKey as any,enabled);setData(v=>({...v,verificationMethods:v.verificationMethods.map(m=>m.method_key===methodKey?{...m,enabled}:m)}));}catch(e){setData(v=>({...v,error:e instanceof Error?e.message:"Gagal memperbarui katalog metode"}));}}
 if(data.error)return <section className="rounded-xl border-2 border-amber-700 bg-amber-50 p-4 text-sm text-amber-950"><strong>Data operasional belum tersedia</strong><p className="mt-1">{data.error}</p></section>;
 const stats=[["Pengguna",data.overview?.users??0],["Mitra",data.overview?.partners??0],["Agent Runs",data.overview?.agent_runs??0],["Model",data.models?.length??0]];
 return <section className="space-y-3">
  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{stats.map(([label,value])=><div key={String(label)} className="rounded-xl border-2 border-[#171717] bg-white p-3"><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-black">{value}</p></div>)}</div>
  <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Model Registry</h2><p className="text-xs text-gray-500">Dibaca dari FastAPI · {data.models?.length??0} model</p><div className="mt-2 space-y-1">{(data.models??[]).slice(0,8).map((item:any)=><div key={item.id} className="flex justify-between border-t py-2 text-xs"><span>{item.display_name??item.key}</span><span>{item.enabled?"Enabled":"Disabled"}</span></div>)}</div></div>
  <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Katalog Integrasi Verifikasi Network</h2><p className="text-xs text-gray-500">Super Admin mengatur opsi yang dapat dipilih mitra. Ketersediaan opsi tidak berarti adapter sudah siap atau aktif.</p><div className="mt-2 space-y-2">{data.verificationMethods.map((m:any)=><div key={m.method_key} className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-xs"><div><strong>{m.display_name}</strong><p className="text-gray-500">Adapter: {m.adapter_key} · {m.adapter_ready?"Ready":"Belum siap"}{m.requires_secret?" · Memerlukan secret":" "}</p></div><label className="flex items-center gap-2"><input type="checkbox" checked={m.enabled} onChange={e=>void toggleMethod(m.method_key,e.target.checked)}/>Opsi tersedia untuk mitra</label></div>)}</div></div>
  <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Audit Terbaru</h2><p className="text-xs text-gray-500">{data.audit?.length??0} catatan yang dapat diakses</p><div className="mt-2 space-y-1">{(data.audit??[]).slice(0,8).map((item:any)=><div key={item.id} className="border-t py-2 text-xs"><strong>{item.action}</strong><span className="ml-2 text-gray-500">{item.resource_type} · {item.outcome}</span></div>)}</div></div>
  <p className="text-xs text-gray-500">Perubahan katalog tercatat pada audit log. Adapter readiness dan aktivasi network tidak dapat diubah dari toggle ini.</p>
 </section>;
}
