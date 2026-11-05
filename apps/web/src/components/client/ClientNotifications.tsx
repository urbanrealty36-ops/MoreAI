'use client';

import React, { useState } from 'react';
import {
  Bell,
  Wifi,
  Zap,
  Gift,
  Sparkles,
  CheckCheck,
  ChevronRight,
} from 'lucide-react';

export const ClientNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'semua' | 'sistem' | 'mitra' | 'akun'>('semua');

  const [notifs, setNotifs] = useState([
    {
      id: 'n-1',
      category: 'mitra',
      title: 'Akses Mitra Aktif! 🎉',
      desc: 'Kamu mendapatkan 5.000 Free AI Credit sponsor di Kafe MoreAI Kemang.',
      time: 'Baru saja · 5 menit lalu',
      unread: true,
      icon: Wifi,
      color: 'bg-[#C9F2D5]',
    },
    {
      id: 'n-2',
      category: 'akun',
      title: 'Credit Ditambahkan ⚡',
      desc: '+1.000 credit bonus reward aktivasi akun baru.',
      time: '1 jam yang lalu',
      unread: true,
      icon: Zap,
      color: 'bg-[#FBE7B2]',
    },
    {
      id: 'n-3',
      category: 'mitra',
      title: 'Campaign Promo Baru ☕',
      desc: 'Promo Ngopi & AI aktif di 4.328 lokasi mitra berpartisipasi.',
      time: 'Kemarin, 10:20',
      unread: false,
      icon: Gift,
      color: 'bg-[#F9D8E5]',
    },
    {
      id: 'n-4',
      category: 'sistem',
      title: 'Pembaruan Fitur v1.0 🚀',
      desc: 'Fitur baru telah tersedia: analisis dokumen PDF/XLSX dan isolated Python Runner sandbox.',
      time: '2 hari yang lalu',
      unread: false,
      icon: Sparkles,
      color: 'bg-[#D9D5FF]',
    },
  ]);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filtered = notifs.filter(
    (n) => activeTab === 'semua' || n.category === activeTab
  );

  return (
    <div className="space-y-3.5 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <span>Pusat Notifikasi</span>
          </h1>
          <p className="text-[10px] text-gray-500">Pemberitahuan kuota, sesi mitra, dan pembaruan</p>
        </div>

        <button
          onClick={markAllRead}
          className="text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center gap-1 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded-lg"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Tandai Dibaca</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'semua', label: 'Semua' },
          { id: 'mitra', label: 'Mitra' },
          { id: 'akun', label: 'Akun & Kredit' },
          { id: 'sistem', label: 'Sistem' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition border-2 border-[#171717] neo-shadow-sm ${
              activeTab === tab.id
                ? 'bg-[#171717] text-white'
                : 'bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={`neo-card p-3 flex items-start justify-between gap-3 transition ${
                item.unread
                  ? 'bg-white dark:bg-[#232522] border-2 border-[#171717]'
                  : 'bg-gray-50 dark:bg-[#1E201D] opacity-90'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${item.color} border border-[#171717] neo-shadow-sm flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Icon className="w-4 h-4 text-[#171717]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] leading-tight">
                      {item.title}
                    </h3>
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                  <span className="text-[9px] font-mono text-gray-400 block mt-1">
                    {item.time}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 self-center" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
