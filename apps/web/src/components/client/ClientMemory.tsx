'use client';

import React, { useEffect, useState } from 'react';
import { Brain, Info, ShieldAlert } from 'lucide-react';
import { getMoreAIApi } from '../../lib/api';

export const ClientMemory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [message, setMessage] = useState('Memeriksa layanan memory melalui FastAPI…');

  useEffect(() => {
    let live = true;
    getMoreAIApi().workspace.memory()
      .then(() => { if (live) { setAvailable(true); setMessage('Layanan memory tersedia.'); } })
      .catch((error) => {
        if (!live) return;
        setAvailable(false);
        const detail = error && typeof error === 'object' && 'payload' in error
          ? (error as {payload?: {detail?: {message?: string}}}).payload?.detail?.message
          : undefined;
        setMessage(detail || (error instanceof Error ? error.message : 'Memory belum tersedia.'));
      })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      <div className="neo-card p-4 bg-white dark:bg-[#232522]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#D9D5FF] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center"><Brain className="w-5 h-5 text-indigo-800" /></div>
          <div><h1 className="text-base font-black text-[#171717] dark:text-[#F7F4EC]">Memory Kontekstual AI</h1><p className="text-[11px] text-gray-500">Penyimpanan konteks dan preferensi pengguna</p></div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"><Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" /><p>Memory hanya dapat digunakan setelah tabel, retensi, kontrol privasi, dan kebijakan embedding tersedia pada skema MoreAI.</p></div>
      </div>
      <div className={`neo-card p-4 border-2 border-[#171717] ${available?'bg-[#C9F2D5]':'bg-[#FBE7B2]'}`}>
        <div className="flex items-center gap-2"><ShieldAlert className="w-5 h-5" /><strong className="text-sm">{loading?'Memeriksa status':available?'Memory tersedia':'Memory belum diaktifkan'}</strong></div>
        <p className="mt-2 text-xs leading-relaxed">{message}</p>
        {!available && <p className="mt-2 text-[10px] font-semibold">Tidak ada contoh memori, tombol hapus, atau toggle yang mengubah data karena persistence belum disediakan.</p>}
      </div>
    </div>
  );
};
