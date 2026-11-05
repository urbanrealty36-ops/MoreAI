'use client';

import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Info,
} from 'lucide-react';

interface ClientSettingsProps {
  isDark: boolean;
  onToggleDark: () => void;
  onOpenAuth: () => void;
}

export const ClientSettings: React.FC<ClientSettingsProps> = ({
  isDark,
  onToggleDark,
  onOpenAuth,
}) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-base font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span>Pengaturan Sistem & Preferensi</span>
        </h1>
        <p className="text-[11px] text-gray-500">Sesuaikan pengalaman workspace AI sesuai kebutuhan Anda.</p>
      </div>

      {/* Group 1: Preferensi AI */}
      <div className="neo-card p-3.5 bg-white dark:bg-[#232522] space-y-3">
        <h3 className="text-xs font-black uppercase text-gray-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Preferensi AI & Bahasa</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div>
            <label className="text-[11px] font-bold block mb-1">Bahasa Komunikasi</label>
            <select className="w-full text-xs font-bold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl outline-none">
              <option>Bahasa Indonesia (Formal & Ramah)</option>
              <option>English (Professional Business)</option>
              <option>Bahasa Indonesia (Santai / Kasual)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold block mb-1">Default Model Router</label>
            <select className="w-full text-xs font-bold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl outline-none">
              <option>Otomatis (Seimbang Biaya & Kualitas)</option>
              <option>Gemini 2.5 Flash (Hemat Kredit)</option>
              <option>GPT-4o (Frontier Akurasi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Group 2: Notifikasi & Keamanan */}
      <div className="neo-card p-3.5 bg-white dark:bg-[#232522] space-y-3">
        <h3 className="text-xs font-black uppercase text-gray-500 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-blue-500" />
          <span>Notifikasi & Privasi</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-bold">Notifikasi Email Kuota</p>
              <p className="text-[10px] text-gray-500">Peringatkan saat kredit tersisa &lt; 200</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-1 border-t border-gray-100 dark:border-gray-800">
            <div>
              <p className="font-bold">Anonimkan Log Eksekusi</p>
              <p className="text-[10px] text-gray-500">Hapus prompt sensitif dari log analitik</p>
            </div>
            <input
              type="checkbox"
              checked={dataCollection}
              onChange={(e) => setDataCollection(e.target.checked)}
              className="w-4 h-4 rounded"
            />
          </div>
        </div>
      </div>

      {/* Group 3: Tampilan */}
      <div className="neo-card p-3.5 bg-white dark:bg-[#232522] space-y-3">
        <h3 className="text-xs font-black uppercase text-gray-500 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-pink-500" />
          <span>Tampilan Antarmuka</span>
        </h3>

        <button
          onClick={onToggleDark}
          className="w-full flex items-center justify-between py-1 text-xs"
        >
          <div className="flex items-center gap-2">
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-700" />}
            <span className="font-bold">Mode Tampilan Gelap (Dark Mode)</span>
          </div>
          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-[#171717]">
            {isDark ? 'Gelap' : 'Terang'}
          </span>
        </button>
      </div>

      {/* Logout button */}
      <button
        onClick={onOpenAuth}
        className="w-full neo-btn bg-white dark:bg-[#232522] hover:bg-rose-50 text-[#B83232] py-2.5 text-xs font-black flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar dari Akun</span>
      </button>

      <p className="text-[10px] text-center text-gray-400 font-mono">
        MoreAI v1.0 · Build ID: 2f5fa0c2 · MIT License
      </p>
    </div>
  );
};
