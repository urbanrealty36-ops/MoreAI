'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Wrench,
  MoreHorizontal,
  Sparkles,
  Zap,
  Wifi,
  ArrowRight,
  Send,
  Mic,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { MascotIcon } from '../shared/MascotIcon';
import { formatNumber } from '@/lib/utils';

interface ClientHomeProps {
  creditBalance: number;
  partnerActive: boolean;
  partnerName: string;
  onNavigate: (tab: 'beranda' | 'chat' | 'agents' | 'tools' | 'akun', promptPreset?: string) => void;
  onOpenPartnerModal: () => void;
  onOpenWallet: () => void;
}

export const ClientHome: React.FC<ClientHomeProps> = ({
  creditBalance,
  partnerActive,
  partnerName,
  onNavigate,
  onOpenPartnerModal,
  onOpenWallet,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onNavigate('chat', quickInput.trim());
      setQuickInput('');
    }
  };

  const handlePresetClick = (preset: string) => {
    onNavigate('chat', preset);
  };

  return (
    <div className="space-y-4 pb-36 px-4 pt-3 max-w-md mx-auto">
      {/* Top Greeting Card */}
      <div className="neo-card p-4 bg-white dark:bg-[#232522]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FBE7B2] border border-[#171717] text-[10px] font-extrabold text-[#171717] mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>MoreAI Workspace v1.0</span>
            </div>
            <h1 className="text-xl font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight leading-snug">
              Halo, Budi! 👋
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              Siap berkarya dan otomatisasi tugas dengan AI hari ini?
            </p>
          </div>
          <div className="shrink-0 p-1 rounded-2xl bg-[#C9F2D5] border-2 border-[#171717] neo-shadow-sm">
            <MascotIcon size={48} mood="excited" />
          </div>
        </div>

        {/* Quick Balance & Partner Badges */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t-2 border-gray-100 dark:border-gray-800">
          {/* Credit balance box */}
          <button
            onClick={onOpenWallet}
            className="neo-btn bg-[#FBE7B2] hover:bg-[#fae29d] p-2.5 text-left flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold text-gray-700 block uppercase tracking-wide">
                AI Credit
              </span>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-700 fill-amber-700" />
                <span className="text-base font-black font-mono tabular-nums text-[#171717]">
                  {formatNumber(creditBalance)}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#171717]" />
          </button>

          {/* Partner status box */}
          <button
            onClick={onOpenPartnerModal}
            className={`neo-btn p-2.5 text-left flex items-center justify-between transition ${
              partnerActive
                ? 'bg-[#C9F2D5] hover:bg-[#b5eec5]'
                : 'bg-[#D8ECFF] hover:bg-[#c4e4ff]'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold text-gray-700 block uppercase tracking-wide">
                Akses Mitra
              </span>
              <div className="flex items-center gap-1 text-xs font-black text-[#171717]">
                <Wifi className={`w-3.5 h-3.5 ${partnerActive ? 'text-emerald-700 animate-pulse' : 'text-blue-700'}`} />
                <span className="truncate max-w-[90px]">
                  {partnerActive ? 'Aktif' : 'Sambungkan'}
                </span>
              </div>
            </div>
            <CheckCircle2
              className={`w-4 h-4 ${
                partnerActive ? 'text-emerald-700' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4 Feature Shortcuts Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          onClick={() => onNavigate('chat')}
          className="neo-btn bg-[#D9D5FF] hover:bg-[#cdc7ff] p-3 flex flex-col items-center justify-center text-center gap-1.5"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#171717] flex items-center justify-center neo-shadow-sm">
            <MessageSquare className="w-5 h-5 text-indigo-700" />
          </div>
          <span className="text-[11px] font-extrabold text-[#171717] leading-none">
            Chat AI
          </span>
        </button>

        <button
          onClick={() => onNavigate('agents')}
          className="neo-btn bg-[#F9D8E5] hover:bg-[#f6cadc] p-3 flex flex-col items-center justify-center text-center gap-1.5"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#171717] flex items-center justify-center neo-shadow-sm">
            <Bot className="w-5 h-5 text-pink-700" />
          </div>
          <span className="text-[11px] font-extrabold text-[#171717] leading-none">
            Agents
          </span>
        </button>

        <button
          onClick={() => onNavigate('tools')}
          className="neo-btn bg-[#FBE7B2] hover:bg-[#f6deb1] p-3 flex flex-col items-center justify-center text-center gap-1.5"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#171717] flex items-center justify-center neo-shadow-sm">
            <Wrench className="w-5 h-5 text-amber-700" />
          </div>
          <span className="text-[11px] font-extrabold text-[#171717] leading-none">
            Tools
          </span>
        </button>

        <button
          onClick={() => onNavigate('akun')}
          className="neo-btn bg-[#D8ECFF] hover:bg-[#cae6ff] p-3 flex flex-col items-center justify-center text-center gap-1.5"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-[#171717] flex items-center justify-center neo-shadow-sm">
            <MoreHorizontal className="w-5 h-5 text-blue-700" />
          </div>
          <span className="text-[11px] font-extrabold text-[#171717] leading-none">
            Lainnya
          </span>
        </button>
      </div>

      {/* Partner Wi-Fi Promo Banner */}
      <div className="neo-card p-3.5 bg-gradient-to-br from-[#C9F2D5] to-[#A7F3D0] relative overflow-hidden">
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white border-2 border-[#171717] flex items-center justify-center shrink-0 neo-shadow-sm">
            <Coffee className="w-6 h-6 text-emerald-800" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider mb-0.5">
              <Zap className="w-3 h-3 fill-emerald-800 text-emerald-800" />
              <span>Program Kemitraan MoreAI</span>
            </div>
            <h3 className="text-sm font-black text-[#171717] leading-tight">
              {partnerActive
                ? `Terhubung di ${partnerName}`
                : 'Akses Free AI Credit di Jaringan Mitra'}
            </h3>
            <p className="text-[11px] text-gray-800 mt-1 leading-snug">
              {partnerActive
                ? 'Nikmati 5.000 sponsor credit gratis selama berada di area mitra.'
                : 'Dapatkan 2.000 - 5.000 Free AI Credit di kafe, resto, kampus & coworking favorit kamu!'}
            </p>

            <button
              onClick={onOpenPartnerModal}
              className="mt-2.5 neo-btn bg-white hover:bg-gray-50 text-[#171717] px-3 py-1.5 text-xs font-black inline-flex items-center gap-1.5"
            >
              <span>{partnerActive ? 'Kelola Sesi Mitra' : 'Aktifkan Free AI Credit'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Ideas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Coba Ide Populer</span>
          </h2>
          <span className="text-[10px] text-gray-500 font-semibold">Sekali klik</span>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handlePresetClick('Buatkan rencana konten promosi kafe selama 1 bulan dengan 4 tema utama')}
            className="w-full neo-card p-3 bg-white dark:bg-[#232522] hover:bg-[#F9D8E5]/30 text-left flex items-center justify-between group transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#F9D8E5] border border-[#171717] flex items-center justify-center neo-shadow-sm text-xs font-black">
                🎨
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#171717] dark:text-[#F7F4EC] leading-tight">
                  Buat rencana konten promosi kafe (30 hari)
                </p>
                <p className="text-[10px] text-gray-500">
                  Jadwal konten, copy caption & hashtag
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#171717] group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => handlePresetClick('Rangkum dokumen strategi bisnis ini menjadi 5 poin aksi terpenting')}
            className="w-full neo-card p-3 bg-white dark:bg-[#232522] hover:bg-[#FBE7B2]/30 text-left flex items-center justify-between group transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#FBE7B2] border border-[#171717] flex items-center justify-center neo-shadow-sm text-xs font-black">
                📄
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#171717] dark:text-[#F7F4EC] leading-tight">
                  Ringkas dokumen & analisis insight bisnis
                </p>
                <p className="text-[10px] text-gray-500">
                  Ekstrak poin penting dan rekomendasi
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#171717] group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => handlePresetClick('Jelaskan tren AI agent autonomous tahun 2026 dan dampaknya ke industri')}
            className="w-full neo-card p-3 bg-white dark:bg-[#232522] hover:bg-[#D9D5FF]/30 text-left flex items-center justify-between group transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#D9D5FF] border border-[#171717] flex items-center justify-center neo-shadow-sm text-xs font-black">
                🔍
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#171717] dark:text-[#F7F4EC] leading-tight">
                  Riset tren AI Agent & otomasi masa depan
                </p>
                <p className="text-[10px] text-gray-500">
                  Data terkini & analisis komprehensif
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#171717] group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* Permanent Fixed Prompt Composer directly above Bottom Nav */}
      <div className="fixed bottom-16 left-0 right-0 z-30 pointer-events-none px-3 pb-2 pt-1 bg-gradient-to-t from-[#F7F4EC] via-[#F7F4EC]/95 to-transparent dark:from-[#1E201D] dark:via-[#1E201D]/95">
        <div className="max-w-md mx-auto pointer-events-auto">
          <form onSubmit={handleQuickSubmit}>
            <div className="neo-card px-1.5 py-0 bg-white dark:bg-[#232522] flex items-center gap-1.5 border-2 border-[#171717] neo-shadow-sm">
              <span className="hidden sm:inline-block text-[9px] font-black bg-[#C9F2D5] text-[#171717] px-2 py-0.5 rounded-md border border-[#171717] shrink-0">
                MoreAI F.01
              </span>
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Tanyakan apa saja ke MoreAI F.01..."
                className="h-11 min-h-[44px] flex-1 text-xs px-2 py-1.5 bg-transparent border-none outline-none font-medium text-[#171717] dark:text-[#F7F4EC] placeholder-gray-400 min-w-0"
              />
              <button
                type="button"
                className="ml-1.5 md:ml-0 w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 flex items-center justify-center text-gray-600 dark:text-gray-300 transition shrink-0"
                title="Voice input"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="ml-1.5 md:ml-0 w-8 h-8 rounded-xl bg-[#C9F2D5] hover:bg-[#b0efbe] border border-[#171717] neo-shadow-sm flex items-center justify-center text-[#171717] transition shrink-0 active:translate-x-[1px] active:translate-y-[1px]"
                title="Kirim ke Chat AI"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
