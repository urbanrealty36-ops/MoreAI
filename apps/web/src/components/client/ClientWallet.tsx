'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, CreditCard, History, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';
import { getMoreAIApi } from '../../lib/api';

interface ClientWalletProps {
  creditBalance: number;
  partnerCredits?: number;
  onTopUp: (amount: number) => void;
}

type WalletResponse = Awaited<ReturnType<ReturnType<typeof getMoreAIApi>['workspace']['wallet']>>;

export const ClientWallet: React.FC<ClientWalletProps> = (props) => {
  void props;
  const [data, setData] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getMoreAIApi().workspace.wallet()
      .then((result) => { if (live) setData(result); })
      .catch((reason) => { if (live) setError(reason instanceof Error ? reason.message : 'Wallet tidak dapat dimuat'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const balance = data?.wallet ? Number(data.wallet.balance) : null;
  const transactions = data?.transactions ?? [];

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      <div className="neo-card p-4 bg-[#FBE7B2] text-[#171717]">
        <div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Wallet className="w-4 h-4" /> Total AI Credit</span><span className="text-[10px] font-extrabold bg-white px-2 py-0.5 rounded-full border border-[#171717]">Wallet</span></div>
        <div className="mt-2 flex items-baseline gap-2"><span className="text-3xl font-black font-mono tracking-tight tabular-nums">{loading?'…':balance===null?'—':balance.toLocaleString('id-ID')}</span><span className="text-xs font-bold text-gray-700">{data?.wallet?.currency ?? 'CREDIT'}</span></div>
        <div className="mt-2 pt-2 border-t border-amber-800/20 text-[11px] font-semibold text-gray-800">{data?.wallet ? `Status wallet: ${data.wallet.status}` : 'Saldo belum tersedia pada akun ini.'}</div>
      </div>

      <div className="neo-card p-3.5 bg-white dark:bg-[#232522]">
        <div className="flex items-center justify-between gap-2"><strong className="text-xs">Top Up Kredit</strong><CreditCard className="w-4 h-4 text-gray-500" /></div>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">Pembelian kredit belum dapat dilakukan. Paket harga, payment provider, dan status transaksi belum dikonfigurasi sebagai data operasional.</p>
        <button disabled className="w-full mt-3 rounded-xl border-2 border-gray-300 bg-gray-100 py-2 text-xs font-black text-gray-400 cursor-not-allowed">Top Up belum tersedia</button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between"><h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5"><History className="w-4 h-4" /> Riwayat Mutasi Kredit</h2><span className="text-[10px] text-gray-500">Ledger</span></div>
        {loading&&<p className="text-xs text-gray-500">Memuat transaksi dari FastAPI…</p>}
        {error&&<p className="rounded-xl border border-amber-600 bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}
        {!loading&&!error&&transactions.map((tx)=>{const incoming=Number(tx.amount)>0;return <div key={tx.id} className="neo-card p-2.5 bg-white dark:bg-[#232522] flex items-center justify-between gap-2"><div className="flex items-center gap-2.5 min-w-0"><div className={`w-8 h-8 rounded-xl border border-[#171717] flex items-center justify-center shrink-0 ${incoming?'bg-[#C9F2D5]':'bg-[#F9D8E5]'}`}>{incoming?<ArrowDownLeft className="w-4 h-4 text-emerald-800"/>:<ArrowUpRight className="w-4 h-4 text-pink-800"/>}</div><div className="min-w-0"><p className="text-xs font-black truncate">{tx.description||tx.entry_type}</p><p className="text-[10px] text-gray-500">{tx.entry_type} · {new Date(tx.created_at).toLocaleString('id-ID')}</p></div></div><span className="text-xs font-mono font-black tabular-nums">{incoming?'+':''}{Number(tx.amount).toLocaleString('id-ID')}</span></div>;})}
        {!loading&&!error&&transactions.length===0&&<div className="neo-card p-4 bg-white dark:bg-[#232522] text-center"><AlertCircle className="w-5 h-5 mx-auto text-gray-400"/><p className="mt-2 text-xs text-gray-500">{data?.available?'Belum ada transaksi kredit.':'Wallet belum dibuat untuk akun ini.'}</p></div>}
      </div>
    </div>
  );
};
