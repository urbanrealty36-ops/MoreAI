'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  MapPin,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Coffee,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { MascotIcon } from '../shared/MascotIcon';

interface ClientPartnerAccessProps {
  partnerActive: boolean;
  onActivate: (partnerName: string, credits: number) => void;
  onDeactivate: () => void;
  onNavigateChat: () => void;
}

export const ClientPartnerAccess: React.FC<ClientPartnerAccessProps> = ({
  partnerActive,
  onActivate,
  onDeactivate,
  onNavigateChat,
}) => {
  const [accessCode, setAccessCode] = useState(['M', 'A', '5', '7', '2', '9']);
  const [geoChecking, setGeoChecking] = useState(false);
  const [geoVerified, setGeoVerified] = useState(true);
  const [wifiConnected, setWifiConnected] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10740); // 2 hours 59 mins in seconds

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (partnerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [partnerActive, timeLeft]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h} jam ${m} menit ${s < 10 ? '0' : ''}${s} detik`;
  };

  const handleVerifyGeo = () => {
    setGeoChecking(true);
    setTimeout(() => {
      setGeoChecking(false);
      setGeoVerified(true);
    }, 1200);
  };

  const handleCodeChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...accessCode];
    updated[index] = val.toUpperCase();
    setAccessCode(updated);
  };

  const handleActivateClick = () => {
    onActivate('Kafe MoreAI Kemang', 5000);
  };

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* If Active, show Active Session Screen */}
      {partnerActive ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="neo-card p-5 bg-gradient-to-br from-[#C9F2D5] to-[#A7F3D0] border-3 border-[#171717] text-center">
            <div className="w-16 h-16 rounded-3xl bg-white border-2 border-[#171717] neo-shadow flex items-center justify-center mx-auto mb-3">
              <MascotIcon size={52} mood="excited" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171717] text-white text-[11px] font-black mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C9F2D5]" />
              <span>Akses Mitra Aktif! 🎉</span>
            </div>

            <h2 className="text-xl font-black text-[#171717] leading-tight">
              Kafe MoreAI Kemang
            </h2>
            <p className="text-xs text-gray-800 font-medium mt-1">
              Kamu sedang menikmati sponsor akses AI resmi selama terhubung di lokasi ini.
            </p>

            {/* Benefit Grid */}
            <div className="bg-white/90 rounded-2xl border-2 border-[#171717] p-3.5 my-4 text-left space-y-2 neo-shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold border-b border-gray-200 pb-2">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
                  <span>Free AI Credit</span>
                </span>
                <span className="font-mono font-black text-sm text-[#171717]">
                  +5.000 Credit
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold border-b border-gray-200 pb-2">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Fitur AI Tersedia</span>
                </span>
                <span className="font-black text-[#171717]">Mode Lengkap (Pro)</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Sisa Waktu Sesi</span>
                </span>
                <span className="font-mono font-black text-[#171717]">
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <button
                onClick={onNavigateChat}
                className="w-full neo-btn bg-[#171717] text-white py-3 text-xs font-black neo-shadow"
              >
                Gunakan MoreAI Sekarang
              </button>

              <button
                onClick={onDeactivate}
                className="w-full neo-btn bg-white hover:bg-gray-100 text-[#171717] py-2.5 text-xs font-bold"
              >
                Akhiri Sesi Mitra
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Activation Form */
        <div className="space-y-3.5">
          {/* Header Card with Venue info */}
          <div className="neo-card p-4 bg-white dark:bg-[#232522]">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FBE7B2] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center shrink-0">
                <Coffee className="w-6 h-6 text-amber-900" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider block">
                  Lokasi Mitra Terdeteksi
                </span>
                <h2 className="text-base font-black text-[#171717] dark:text-[#F7F4EC] leading-snug">
                  Cafe MoreAI Kemang
                </h2>
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>Jl. Melati No. 12, Kemang, Jakarta</span>
                </p>
              </div>
            </div>
          </div>

          {/* Verification Steps Card */}
          <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Syarat & Verifikasi Sesi
            </h3>

            {/* Step 1: Wi-Fi proof */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#1E201D] border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-[#F7F4EC]">
                    Terhubung ke Wi-Fi Mitra
                  </p>
                  <p className="text-[10px] text-gray-500">SSID: CafeMoreAI_Gratis</p>
                </div>
              </div>
              <span className="w-5 h-5 rounded-full bg-[#C9F2D5] border border-[#171717] flex items-center justify-center text-[10px] font-black">
                ✓
              </span>
            </div>

            {/* Step 2: Geo-location proof */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#1E201D] border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-[#F7F4EC]">
                    Radius Geofence Lokasi
                  </p>
                  <p className="text-[10px] text-gray-500">Dalam radius 500 meter</p>
                </div>
              </div>
              {geoVerified ? (
                <span className="w-5 h-5 rounded-full bg-[#C9F2D5] border border-[#171717] flex items-center justify-center text-[10px] font-black">
                  ✓
                </span>
              ) : (
                <button
                  onClick={handleVerifyGeo}
                  disabled={geoChecking}
                  className="neo-btn bg-[#D8ECFF] text-[10px] px-2 py-0.5"
                >
                  {geoChecking ? 'Mengecek...' : 'Cek GPS'}
                </button>
              )}
            </div>

            {/* Step 3: Access Code */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Masukkan Kode Akses Meja / Kasir</span>
                </label>
                <span className="text-[10px] text-gray-500 font-medium">6 Karakter</span>
              </div>

              {/* 6 Inputs Grid */}
              <div className="grid grid-cols-6 gap-1.5">
                {accessCode.map((char, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    className="h-11 text-center font-mono font-black text-base bg-[#F7F4EC] dark:bg-[#1A1C19] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none focus:ring-2 focus:ring-emerald-400 uppercase"
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5 text-center">
                Minta kode voucher harian kepada staf kasir jika belum memilikinya.
              </p>
            </div>
          </div>

          {/* Activate Button */}
          <button
            onClick={handleActivateClick}
            className="w-full neo-btn bg-[#C9F2D5] hover:bg-[#b0f0bf] text-[#171717] py-3 text-sm font-black flex items-center justify-center gap-2 neo-shadow"
          >
            <Sparkles className="w-4 h-4 text-emerald-900" />
            <span>Aktifkan Free AI Credit</span>
          </button>
        </div>
      )}
    </div>
  );
};
