'use client';

import React from 'react';
import { MengguCharacter } from '../shared/MengguCharacter';
import {
  Wifi,
  Sparkles,
  Zap,
  Coffee,
  Crown,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface PostAuthAccessChoiceScreenProps {
  userName: string;
  onChoosePartner: () => void;
  onChooseSubscribe: () => void;
  onChooseGeneralFree: () => void;
}

export const PostAuthAccessChoiceScreen: React.FC<PostAuthAccessChoiceScreenProps> = ({
  userName = 'Budi',
  onChoosePartner,
  onChooseSubscribe,
  onChooseGeneralFree,
}) => {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#F7F4EC] dark:bg-[#1E201D] flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Top Welcome Header */}
      <div className="text-center pt-2">
        <div className="flex justify-center mb-1">
          <MengguCharacter size={92} mood="excited" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9F2D5] border border-[#171717] text-[10px] font-black text-[#171717] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
          <span>Akun Berhasil Diverifikasi</span>
        </div>
        <h1 className="text-xl font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight leading-tight">
          Selamat Datang, {userName}! 🎉
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">
          Pilih metode akses AI Anda untuk memulai hari ini:
        </p>
      </div>

      {/* 2 Main Choice Cards (Mitra vs Personal) */}
      <div className="space-y-3.5 my-auto py-3">
        {/* OPTION 1: AKSES MITRA WI-FI (SPONSOR FREE AI CREDIT) */}
        <div className="neo-card p-4 bg-gradient-to-br from-[#C9F2D5] to-[#b3efc2] border-3 border-[#171717] relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#171717] neo-shadow-sm flex items-center justify-center">
                <Coffee className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-950 block tracking-wider">
                  Opsi 1 · Rekomendasi Hemat
                </span>
                <h3 className="text-sm font-black text-[#171717] leading-tight">
                  Free AI Credit di Jaringan Mitra
                </h3>
              </div>
            </div>
            <span className="text-[9px] font-black bg-[#171717] text-white px-2 py-0.5 rounded-full">
              Gratis Sponsor
            </span>
          </div>

          <p className="text-xs text-gray-800 mt-2 font-medium leading-snug">
            Nikmati <strong>5.000 Free AI Credit</strong> saat terhubung ke Wi-Fi kafe, resto, kampus, atau coworking mitra MoreAI terdekat.
          </p>

          <div className="space-y-1 mt-2.5 text-[11px] font-bold text-gray-900">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900" />
              <span>Verifikasi Wi-Fi & Geofence GPS otomatis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900" />
              <span>Dapatkan kode akses meja dari kasir</span>
            </div>
          </div>

          <button
            onClick={onChoosePartner}
            className="w-full neo-btn bg-white hover:bg-gray-100 text-[#171717] py-2.5 text-xs font-black mt-3 flex items-center justify-center gap-1.5 neo-shadow"
          >
            <Wifi className="w-4 h-4 text-emerald-700" />
            <span>Aktifkan Akses Mitra Sekarang</span>
          </button>
        </div>

        {/* OPTION 2: AKSES PERSONAL MANDIRI (SUBSCRIBE / PRO) */}
        <div className="neo-card p-4 bg-gradient-to-br from-[#FBE7B2] to-[#fae092] border-3 border-[#171717] relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#171717] neo-shadow-sm flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-950 block tracking-wider">
                  Opsi 2 · Profesional Mandiri
                </span>
                <h3 className="text-sm font-black text-[#171717] leading-tight">
                  Langganan MoreAI Pro
                </h3>
              </div>
            </div>
            <span className="text-[9px] font-black bg-[#171717] text-[#FBE7B2] px-2 py-0.5 rounded-full">
              Bebas Lokasi
            </span>
          </div>

          <p className="text-xs text-gray-800 mt-2 font-medium leading-snug">
            Akses mandiri tanpa batas dari rumah, kantor, atau di mana pun Anda berada tanpa tergantung jaringan Wi-Fi mitra.
          </p>

          <div className="space-y-1 mt-2.5 text-[11px] font-bold text-gray-900">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-950" />
              <span>5.000 Credit bulanan + Semua frontier model</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-950" />
              <span>Prioritas antrean & tools premium tanpa batas</span>
            </div>
          </div>

          <button
            onClick={onChooseSubscribe}
            className="w-full neo-btn bg-[#171717] hover:bg-gray-800 text-white py-2.5 text-xs font-black mt-3 flex items-center justify-center gap-1.5 neo-shadow"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Pilih Paket Langganan Pro (Rp49rb/bln)</span>
          </button>
        </div>
      </div>

      {/* OPTION 3: GENERAL FREE ESCAPE HATCH */}
      <div className="text-center pt-2">
        <button
          onClick={onChooseGeneralFree}
          className="text-xs font-black text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white inline-flex items-center gap-1 hover:underline"
        >
          <span>Atau lanjut dengan General Free (100 credit/6 jam)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
