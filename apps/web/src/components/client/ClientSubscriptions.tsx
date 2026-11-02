'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Crown, ShieldCheck } from 'lucide-react';

export const ClientSubscriptions: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'business'>('pro');

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight">
          Pilihan Paket Langganan
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Tingkatkan produktivitas kerja dengan kuota AI lebih besar dan fitur prioritas.
        </p>
      </div>

      {/* Monthly / Annual Toggle */}
      <div className="flex items-center justify-center p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-[#171717] neo-shadow-sm max-w-xs mx-auto">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`flex-1 py-1.5 text-xs font-black rounded-xl transition ${
            billingCycle === 'monthly'
              ? 'bg-white dark:bg-[#232522] text-[#171717] dark:text-white border border-[#171717] neo-shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-300'
          }`}
        >
          Bulanan
        </button>
        <button
          onClick={() => setBillingCycle('annual')}
          className={`flex-1 py-1.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 ${
            billingCycle === 'annual'
              ? 'bg-[#FBE7B2] text-[#171717] border border-[#171717] neo-shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-300'
          }`}
        >
          <span>Tahunan</span>
          <span className="text-[9px] bg-[#C9F2D5] text-[#171717] px-1 py-0.2 rounded font-extrabold border border-[#171717]">
            -20%
          </span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="space-y-3">
        {/* Free Plan */}
        <div
          onClick={() => setSelectedPlan('free')}
          className={`neo-card p-3.5 cursor-pointer transition ${
            selectedPlan === 'free'
              ? 'bg-[#F7F4EC] dark:bg-[#232522] ring-2 ring-[#171717]'
              : 'bg-white dark:bg-[#1E201D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider block">
                Paket Free
              </span>
              <span className="text-xl font-black font-mono">Rp 0</span>
              <span className="text-[10px] text-gray-500 ml-1">/ selamanya</span>
            </div>
            <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-300">
              Paket Dasar
            </span>
          </div>

          <ul className="mt-3 space-y-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100 credit per 6 jam (reset otomatis)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Akses model dasar (Gemini Flash)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Free AI Credit di lokasi mitra berpartisipasi</span>
            </li>
          </ul>
        </div>

        {/* Pro Plan (Popular) */}
        <div
          onClick={() => setSelectedPlan('pro')}
          className={`neo-card p-4 cursor-pointer relative overflow-hidden transition ${
            selectedPlan === 'pro'
              ? 'bg-[#C9F2D5] text-[#171717] ring-3 ring-[#171717]'
              : 'bg-white dark:bg-[#1E201D]'
          }`}
        >
          <div className="absolute top-2.5 right-3">
            <span className="text-[10px] font-black bg-[#FBE7B2] text-[#171717] px-2.5 py-0.5 rounded-full border border-[#171717] neo-shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-700 fill-amber-700" />
              <span>Paling Populer</span>
            </span>
          </div>

          <div>
            <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
              MoreAI Pro
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono">
                {billingCycle === 'monthly' ? 'Rp 49.000' : 'Rp 39.200'}
              </span>
              <span className="text-[10px] text-gray-700">/ bulan</span>
            </div>
          </div>

          <ul className="mt-3 space-y-1.5 text-xs text-gray-800 dark:text-gray-900 font-semibold">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-900 shrink-0" />
              <span>Kredit AI berlimpah (5.000 kredit/bulan)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-900 shrink-0" />
              <span>Akses semua model (GPT-4o, Claude 3.5, Gemini Pro)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-900 shrink-0" />
              <span>Eksekutor tools premium & Python Sandbox</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-900 shrink-0" />
              <span>Prioritas antrean server tanpa batas</span>
            </li>
          </ul>
        </div>

        {/* Business Plan */}
        <div
          onClick={() => setSelectedPlan('business')}
          className={`neo-card p-3.5 cursor-pointer transition ${
            selectedPlan === 'business'
              ? 'bg-[#D9D5FF] text-[#171717] ring-2 ring-[#171717]'
              : 'bg-white dark:bg-[#1E201D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                Business & Tim
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black font-mono">
                  {billingCycle === 'monthly' ? 'Rp 149.000' : 'Rp 119.200'}
                </span>
                <span className="text-[10px] text-gray-600">/ bulan</span>
              </div>
            </div>
            <Crown className="w-5 h-5 text-indigo-700" />
          </div>

          <ul className="mt-3 space-y-1.5 text-xs text-gray-800 dark:text-gray-200 font-medium">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>Semua fitur Pro untuk hingga 5 anggota tim</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>Workspace bersama & shared prompts</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>Laporan analitik dan manajemen kuota tim</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => {
          alert(`Berhasil memilih paket ${selectedPlan.toUpperCase()} (${billingCycle})!`);
        }}
        className="w-full neo-btn bg-[#C9F2D5] hover:bg-[#b0f0c0] text-[#171717] py-3 text-sm font-black flex items-center justify-center gap-2"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-800" />
        <span>Langganan Sekarang</span>
      </button>
    </div>
  );
};
