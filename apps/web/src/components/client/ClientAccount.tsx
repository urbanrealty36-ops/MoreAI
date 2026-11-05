'use client';

import React, { useState } from 'react';
import {
  User,
  Shield,
  CreditCard,
  Crown,
  History,
  Brain,
  Bell,
  Lock,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Sparkles,
  Settings,
  HardDrive,
} from 'lucide-react';
import { MascotIcon } from '../shared/MascotIcon';
import { formatNumber } from '@/lib/utils';

interface ClientAccountProps {
  creditBalance: number;
  partnerActive: boolean;
  onOpenSubscriptions: () => void;
  onOpenWallet: () => void;
  onOpenMemory: () => void;
  onOpenHistory: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenFiles?: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenOnboarding: () => void;
  onOpenAuth: () => void;
}

export const ClientAccount: React.FC<ClientAccountProps> = ({
  creditBalance,
  partnerActive,
  onOpenSubscriptions,
  onOpenWallet,
  onOpenMemory,
  onOpenHistory,
  onOpenNotifications,
  onOpenSettings,
  onOpenFiles,
  isDark,
  onToggleDark,
  onOpenOnboarding,
  onOpenAuth,
}) => {
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Profile Card */}
      <div className="neo-card p-4 bg-white dark:bg-[#232522]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D9D5FF] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center overflow-hidden">
              <MascotIcon size={38} mood="happy" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-[#171717] dark:text-[#F7F4EC]">
                  Budi Santoso
                </h2>
                <span className="text-[9px] font-black bg-[#C9F2D5] text-[#171717] px-1.5 py-0.2 rounded border border-[#171717]">
                  Paket Pro
                </span>
              </div>
              <p className="text-[11px] text-gray-500">budi@moreai.id</p>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[#171717] bg-gray-50 dark:bg-gray-800 hover:bg-gray-100"
          >
            Ubah
          </button>
        </div>

        {/* Quick summary grid */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
          <div
            onClick={onOpenWallet}
            className="p-2 rounded-xl bg-[#FBE7B2]/40 border border-[#171717] cursor-pointer hover:bg-[#FBE7B2]/60 transition"
          >
            <span className="text-[10px] text-gray-600 font-semibold block">AI Credit</span>
            <span className="font-mono font-black text-sm">{formatNumber(creditBalance)}</span>
          </div>

          <div
            onClick={onOpenSubscriptions}
            className="p-2 rounded-xl bg-[#C9F2D5]/40 border border-[#171717] cursor-pointer hover:bg-[#C9F2D5]/60 transition"
          >
            <span className="text-[10px] text-gray-600 font-semibold block">Langganan</span>
            <span className="font-black text-sm">Pro (Aktif)</span>
          </div>
        </div>
      </div>

      {/* Primary Feature Hub Grid: Memory, Riwayat, Notifikasi, Pengaturan */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpenMemory}
          className="neo-card p-3 bg-white dark:bg-[#232522] hover:bg-[#D9D5FF]/20 text-left transition"
        >
          <div className="w-8 h-8 rounded-xl bg-[#D9D5FF] border border-[#171717] neo-shadow-sm flex items-center justify-center mb-1.5">
            <Brain className="w-4 h-4 text-indigo-700" />
          </div>
          <p className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
            Kelola Memory
          </p>
          <p className="text-[10px] text-gray-500">Preferensi & konteks</p>
        </button>

        <button
          onClick={onOpenHistory}
          className="neo-card p-3 bg-white dark:bg-[#232522] hover:bg-[#FBE7B2]/20 text-left transition"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FBE7B2] border border-[#171717] neo-shadow-sm flex items-center justify-center mb-1.5">
            <History className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
            Riwayat Aktivitas
          </p>
          <p className="text-[10px] text-gray-500">Chat & tugas selesai</p>
        </button>

        <button
          onClick={onOpenNotifications}
          className="neo-card p-3 bg-white dark:bg-[#232522] hover:bg-[#C9F2D5]/20 text-left transition"
        >
          <div className="w-8 h-8 rounded-xl bg-[#C9F2D5] border border-[#171717] neo-shadow-sm flex items-center justify-center mb-1.5">
            <Bell className="w-4 h-4 text-emerald-800" />
          </div>
          <p className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
            Pusat Notifikasi
          </p>
          <p className="text-[10px] text-gray-500">Kredit & info mitra</p>
        </button>

        <button
          onClick={onOpenSettings}
          className="neo-card p-3 bg-white dark:bg-[#232522] hover:bg-[#D8ECFF]/20 text-left transition"
        >
          <div className="w-8 h-8 rounded-xl bg-[#D8ECFF] border border-[#171717] neo-shadow-sm flex items-center justify-center mb-1.5">
            <Settings className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
            Pengaturan Sistem
          </p>
          <p className="text-[10px] text-gray-500">Bahasa & privasi</p>
        </button>
      </div>

      {/* Preferences & Settings Menu Group */}
      <div className="neo-card p-2 bg-white dark:bg-[#232522] divide-y divide-gray-100 dark:divide-gray-800 text-xs font-bold">
        <button
          onClick={onToggleDark}
          className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-700" />}
            </div>
            <span>Mode Gelap (Dark Theme)</span>
          </div>
          <span className="text-[11px] text-gray-500">{isDark ? 'Aktif' : 'Nonaktif'}</span>
        </button>

        <button
          onClick={onOpenSubscriptions}
          className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FBE7B2] flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-800" />
            </div>
            <span>Kelola Paket Langganan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={onOpenWallet}
          className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#C9F2D5] flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-800" />
            </div>
            <span>Riwayat Dompet & Mutasi Kredit</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {onOpenFiles && (
          <button
            onClick={onOpenFiles}
            className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#D8ECFF] flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-blue-700" />
              </div>
              <span>Berkas & Artefak Workspace</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        )}

        <button
          onClick={onOpenOnboarding}
          className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#D9D5FF] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-700" />
            </div>
            <span>Panduan Pengenalan (Onboarding)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Logout / Switch Account */}
      <button
        onClick={onOpenAuth}
        className="w-full neo-btn bg-white dark:bg-[#232522] hover:bg-rose-50 text-[#B83232] py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar / Ganti Akun</span>
      </button>

      <p className="text-[10px] text-center text-gray-400 font-medium pt-2">
        MoreAI Ecosystem v1.0 · AI Workspace & Network Ecosystem
      </p>
    </div>
  );
};
