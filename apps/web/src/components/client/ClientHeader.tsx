'use client';

import React from 'react';
import { MascotIcon } from '../shared/MascotIcon';
import { Bell, Zap, Wifi, Moon, Sun } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ClientHeaderProps {
  creditBalance: number;
  partnerActive: boolean;
  partnerName?: string;
  onOpenNotifications: () => void;
  onOpenWallet: () => void;
  onOpenPartnerAccess: () => void;
  unreadCount?: number;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  creditBalance,
  partnerActive,
  partnerName = 'Kafe MoreAI',
  onOpenNotifications,
  onOpenWallet,
  onOpenPartnerAccess,
  unreadCount = 2,
  isDark = false,
  onToggleDark,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F7F4EC] dark:bg-[#1E201D] border-b-2 border-[#171717] dark:border-[#4A4A46] px-4 py-2.5 flex items-center justify-between gap-2">
      {/* Brand & Greeting */}
      <div className="flex items-center gap-2.5">
        <div className="p-0.5 rounded-xl bg-white dark:bg-[#2A2C28] border-2 border-[#171717] dark:border-[#555] neo-shadow-sm flex items-center justify-center">
          <MascotIcon size={32} mood={partnerActive ? 'excited' : 'happy'} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-base tracking-tight text-[#171717] dark:text-[#F7F4EC]">
              More<span className="text-emerald-600 dark:text-emerald-400">AI</span>
            </span>
          </div>
          <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 leading-none">
            Halo, Budi! ✨
          </p>
        </div>
      </div>

      {/* Action Pills & Indicators */}
      <div className="flex items-center gap-1.5">
        {/* Partner Wi-Fi status pill */}
        <button
          onClick={onOpenPartnerAccess}
          className={`neo-btn px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition ${
            partnerActive
              ? 'bg-[#C9F2D5] text-[#171717] hover:bg-[#b0f0c0]'
              : 'bg-[#D8ECFF] text-[#171717] hover:bg-[#c2e2ff]'
          }`}
          title={partnerActive ? `Terhubung: ${partnerName}` : 'Aktifkan Akses Mitra'}
        >
          <Wifi className={`w-3.5 h-3.5 ${partnerActive ? 'text-emerald-700 animate-pulse' : 'text-blue-700'}`} />
          <span className="hidden sm:inline">
            {partnerActive ? 'Akses Mitra' : 'WiFi Mitra'}
          </span>
          <span className="sm:hidden font-extrabold text-[10px]">
            {partnerActive ? 'Mitra' : 'WiFi'}
          </span>
        </button>

        {/* AI Credit Pill */}
        <button
          onClick={onOpenWallet}
          className="neo-btn bg-[#FBE7B2] hover:bg-[#f8dc94] text-[#171717] px-2.5 py-1 text-[11px] font-extrabold flex items-center gap-1"
          title="Lihat AI Credit & Wallet"
        >
          <Zap className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
          <span className="font-mono tabular-nums">{formatNumber(creditBalance)}</span>
        </button>

        {/* Dark Mode Button */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            className="w-8 h-8 rounded-xl bg-white dark:bg-[#2A2C28] border-2 border-[#171717] dark:border-[#555] neo-shadow-sm flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Toggle Tema"
            title="Ganti Tema Terang/Gelap"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-800" />
            )}
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative ml-1.5 md:ml-0 w-8 h-8 rounded-xl bg-white dark:bg-[#2A2C28] border-2 border-[#171717] dark:border-[#555] neo-shadow-sm flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Notifikasi"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4 text-[#171717] dark:text-[#F7F4EC]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#B83232] text-white border border-[#171717] text-[9px] font-black flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
