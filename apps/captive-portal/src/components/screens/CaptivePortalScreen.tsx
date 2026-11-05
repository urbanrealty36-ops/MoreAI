'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, ShieldCheck, ShieldAlert, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { getCaptivePortalApi } from '../../lib/client';

interface CaptivePortalScreenProps {
  onSuccessConnect: (venueName: string, creditBonus: number) => void;
  onGoToPwa: () => void;
}

type PortalStatus = 'checking' | 'missing_context' | 'verified' | 'unavailable' | 'invalid';

export const CaptivePortalScreen: React.FC<CaptivePortalScreenProps> = ({ onGoToPwa }) => {
  const [status, setStatus] = useState<PortalStatus>('checking');
  const [message, setMessage] = useState('Memeriksa signed gateway context…');
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);

  const verify = async () => {
    const params = new URLSearchParams(window.location.search);
    const required = ['network_id','gateway_id','session_id','client_mac','client_ip','username','hotspot_server','timestamp','nonce','signature'] as const;
    const values = Object.fromEntries(required.map((key) => [key, params.get(key)]));
    if (required.some((key) => !values[key])) {
      setStatus('missing_context');
      setMessage('Tidak ditemukan signed gateway context. Portal tidak akan membuat venue, jaringan, bonus kredit, atau status koneksi contoh.');
      return;
    }
    const timestamp = Number(values.timestamp);
    if (!Number.isSafeInteger(timestamp) || timestamp <= 0) {
      setStatus('invalid');
      setMessage('Timestamp gateway tidak valid. Silakan ulangi dari captive gateway.');
      return;
    }
    setNetworkId(values.network_id);
    setStatus('checking');
    setMessage('Memvalidasi signature, nonce, network binding, dan status sesi gateway melalui FastAPI…');
    try {
      const result = await getCaptivePortalApi().network.verifyGatewayContext({
        network_id: values.network_id!,
        gateway_id: values.gateway_id!,
        session_id: values.session_id!,
        client_mac: values.client_mac!,
        client_ip: values.client_ip!,
        username: values.username!,
        hotspot_server: values.hotspot_server!,
        timestamp,
        nonce: values.nonce!,
        signature: values.signature!,
      });
      setStatus('verified');
      setVerifiedAt(new Date(Number(result.verified_at) * 1000).toLocaleString('id-ID'));
      setMessage('Bukti sesi gateway terverifikasi. Benefit partner dan akses internet belum diaktifkan oleh layanan MoreAI.');
    } catch (error) {
      const payload = error && typeof error === 'object' && 'payload' in error
        ? (error as {payload?: {detail?: {code?: string; message?: string}}}).payload?.detail
        : undefined;
      setStatus(payload?.code === 'GATEWAY_CONTEXT_INVALID' || payload?.code === 'GATEWAY_SIGNATURE_INVALID' ? 'invalid' : 'unavailable');
      setMessage(payload?.message || (error instanceof Error ? error.message : 'Gateway verification is unavailable.'));
    }
  };

  useEffect(() => { void verify(); }, []);

  const statusLabel = status === 'verified' ? 'Gateway proof verified' : status === 'checking' ? 'Memeriksa gateway' : status === 'missing_context' ? 'Context tidak tersedia' : status === 'invalid' ? 'Context tidak valid' : 'Layanan belum tersedia';

  return (
    <div className="min-h-screen bg-[#F7F4EC] dark:bg-[#171817] py-6 px-3 sm:px-4 flex flex-col max-w-md mx-auto">
      <div className="neo-card p-4 bg-white dark:bg-[#232522] border-2 border-[#171717]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#D9D5FF] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center"><Wifi className="w-7 h-7 text-indigo-900"/></div>
          <div><p className="text-[10px] font-black uppercase tracking-wider text-gray-500">MoreAI Network Access</p><h1 className="text-lg font-black text-[#171717] dark:text-[#F7F4EC]">Verifikasi Akses Wi-Fi</h1></div>
        </div>
        <div className="mt-4 rounded-xl border-2 border-[#171717] bg-[#FBE7B2] p-3">
          <div className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-amber-900"/><strong className="text-xs text-amber-950">{statusLabel}</strong></div>
          <p className="mt-2 text-xs leading-relaxed text-amber-950">{message}</p>
          {networkId&&<p className="mt-2 break-all text-[10px] text-amber-900">Network ID: {networkId}</p>}
          {verifiedAt&&<p className="mt-1 text-[10px] text-amber-900">Verified at: {verifiedAt}</p>}
        </div>
        {status==='verified'&&<div className="mt-3 rounded-xl border-2 border-[#171717] bg-[#C9F2D5] p-3"><div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-900"/><strong className="text-xs">Bukti gateway diterima</strong></div><p className="mt-1 text-xs">MoreAI belum menerbitkan benefit sponsor atau membuat network access session. Status koneksi tidak boleh dianggap aktif.</p></div>}
        <div className="mt-4 space-y-2">
          <button onClick={() => void verify()} disabled={status==='checking'} className="w-full neo-btn bg-[#D9D5FF] text-[#171717] py-2.5 text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50"><RefreshCw className="w-4 h-4"/>{status==='checking'?'Memverifikasi…':'Coba verifikasi ulang'}</button>
          <button onClick={onGoToPwa} className="w-full neo-btn bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] py-2.5 text-xs font-black flex items-center justify-center gap-2">Kembali ke MoreAI <ArrowRight className="w-4 h-4"/></button>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-500"><Clock className="w-4 h-4 shrink-0"/><p>Verifikasi jaringan, benefit partner, sesi aktif, dan perpindahan ke Free/Paid Access akan aktif setelah adapter dan entitlement lifecycle tersedia. Pengujian router fisik tetap ditunda sesuai keputusan proyek.</p></div>
    </div>
  );
};
