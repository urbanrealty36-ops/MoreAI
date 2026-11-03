'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { getMoreAIApi } from '../../lib/api';

export const ClientSubscriptions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getMoreAIApi().workspace.subscription()
      .then((result) => { if (live) setSubscription(result); })
      .catch((reason) => {
        if (!live) return;
        const detail = reason && typeof reason === 'object' && 'payload' in reason
          ? (reason as {payload?: {detail?: {message?: string}}}).payload?.detail?.message
          : undefined;
        setError(detail || (reason instanceof Error ? reason.message : 'Status langganan tidak tersedia'));
      })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      <div><h1 className="text-lg font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight">Pilihan Paket Langganan</h1><p className="text-xs text-gray-600 dark:text-gray-300">Status entitlement dan paket berlangganan dari backend MoreAI.</p></div>
      <div className="neo-card p-4 bg-white dark:bg-[#232522]">
        <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-[#C9F2D5] border-2 border-[#171717] flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-emerald-800"/></div><div><strong className="text-sm">Status Langganan</strong><p className="text-[10px] text-gray-500">Data dibaca melalui FastAPI, bukan harga contoh.</p></div></div>
        {loading&&<p className="mt-3 text-xs text-gray-500">Memeriksa status akun…</p>}
        {error&&<div className="mt-3 rounded-xl border-2 border-[#171717] bg-[#FBE7B2] p-3"><div className="flex items-center gap-2"><AlertCircle className="w-4 h-4"/><strong className="text-xs">Subscription belum tersedia</strong></div><p className="mt-2 text-xs">{error}</p><p className="mt-2 text-[10px] font-semibold">Tabel subscription, definisi paket, periode tagihan, payment provider, dan aturan refund belum tersedia pada schema aktif. Tidak ada tombol pembayaran yang akan membuat transaksi palsu.</p></div>}
        {subscription&&<pre className="mt-3 overflow-auto rounded-xl bg-gray-100 p-3 text-[10px]">{JSON.stringify(subscription,null,2)}</pre>}
      </div>
      <div className="neo-card p-4 bg-[#D9D5FF] text-[#171717]"><div className="flex items-center gap-2"><Sparkles className="w-5 h-5"/><strong className="text-sm">Paket dan Benefit</strong></div><p className="mt-2 text-xs">Katalog paket akan ditampilkan setelah produk langganan dan kebijakan entitlement disimpan pada Supabase serta tersedia melalui endpoint operasional.</p></div>
    </div>
  );
};
