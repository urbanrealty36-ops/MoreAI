'use client';

import React, { useState } from 'react';
import {
  Wifi,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Coffee,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { MascotIcon } from '../shared/MascotIcon';

export const NetworkAccessExperience: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    { num: 1, title: 'Terhubung WiFi' },
    { num: 2, title: 'Captive Portal' },
    { num: 3, title: 'Verifikasi & Aktivasi' },
    { num: 4, title: 'Akses Aktif' },
    { num: 5, title: 'Gunakan MoreAI' },
    { num: 6, title: 'Peringatan Sesi' },
    { num: 7, title: 'Sesi Berakhir' },
    { num: 8, title: 'Pilih Akses' },
    { num: 9, title: 'Upgrade / Paid' },
  ];

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Simulation Header */}
      <div className="neo-card p-3.5 bg-[#D8ECFF] text-[#171717]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-blue-800" />
            <span>Simulasi Alur Pengalaman Mitra (9 Tahap)</span>
          </span>
          <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-[#171717]">
            Tahap {currentStep} dari 9
          </span>
        </div>
        <p className="text-xs font-medium text-gray-800">
          Uji coba interaktif alur pengguna saat datang ke kafe mitra hingga sesi berakhir dan upgrade.
        </p>
      </div>

      {/* Step Progress Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {steps.map((st) => (
          <button
            key={st.num}
            onClick={() => setCurrentStep(st.num)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap transition border-2 border-[#171717] ${
              currentStep === st.num
                ? 'bg-[#171717] text-white neo-shadow-sm'
                : 'bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] hover:bg-gray-100'
            }`}
          >
            {st.num}. {st.title}
          </button>
        ))}
      </div>

      {/* Screen Frame Simulation Container */}
      <div className="neo-card p-5 bg-white dark:bg-[#232522] border-3 border-[#171717] text-center min-h-[380px] flex flex-col justify-between">
        {/* STEP 1: TERHUBUNG KE WIFI */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="w-16 h-16 rounded-3xl bg-[#D8ECFF] border-2 border-[#171717] neo-shadow flex items-center justify-center mx-auto mt-4">
              <Wifi className="w-8 h-8 text-blue-800 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#171717] dark:text-[#F7F4EC]">
                Terhubung ke MoreAI_Guest
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xs mx-auto">
                Perangkat Anda telah tersambung ke jaringan Wi-Fi Kafe MoreAI Kemang.
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-mono">
              Status Jaringan: WiFi Terkoneksi · IP Diberikan
            </div>
          </div>
        )}

        {/* STEP 2: CAPTIVE PORTAL */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="w-16 h-16 rounded-3xl bg-[#FBE7B2] border-2 border-[#171717] neo-shadow flex items-center justify-center mx-auto mt-2">
              <Coffee className="w-8 h-8 text-amber-900" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-800 bg-[#FBE7B2] px-2 py-0.5 rounded-full border border-[#171717]">
                Captive Portal Gateway
              </span>
              <h3 className="text-base font-black mt-2">Akses AI di Cafe MoreAI Kemang</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Selamat datang! Dapatkan Free AI Credit & akses tools lengkap selama Anda berada di kafe.
              </p>
            </div>
            <div className="space-y-1.5 text-left text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl border border-gray-200">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Free 5.000 AI Credit Sponsor</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Akses fitur AI lengkap tanpa biaya</span>
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: VERIFIKASI & AKTIVASI */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150 text-left">
            <div className="text-center">
              <h3 className="text-base font-black">Verifikasi Akses Mitra</h3>
              <p className="text-xs text-gray-500">Memeriksa kelayakan dan bukti kehadiran fisik.</p>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-700" />
                  <span>Koneksi Wi-Fi CafeMoreAI</span>
                </span>
                <span className="text-emerald-700">Terverifikasi ✓</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Lokasi Geofence (Radius 500m)</span>
                </span>
                <span className="text-emerald-700">Sesuai (65m) ✓</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Kode Akses / Campaign</span>
                </span>
                <span className="text-emerald-700">MA-5729 ✓</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AKSES AKTIF */}
        {currentStep === 4 && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-[#C9F2D5] border-2 border-[#171717] neo-shadow flex items-center justify-center mx-auto">
              <MascotIcon size={42} mood="excited" />
            </div>
            <h3 className="text-base font-black">Akses MoreAI Aktif! 🚀</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Kamu mendapatkan 5.000 Free AI Credit dari Cafe MoreAI Kemang.
            </p>
            <div className="p-3 bg-[#F7F4EC] dark:bg-[#1E201D] rounded-2xl border-2 border-[#171717] text-left text-xs font-bold space-y-1">
              <p>• Kuota Sponsor: <strong>5.000 Credit</strong></p>
              <p>• Durasi Sesi: <strong>3 Jam</strong></p>
              <p>• Sisa Waktu: <strong>2 jam 58 menit</strong></p>
            </div>
          </div>
        )}

        {/* STEP 5: GUNAKAN MOREAI */}
        {currentStep === 5 && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="p-3 rounded-2xl bg-[#D9D5FF] border-2 border-[#171717] text-left">
              <p className="text-[10px] font-mono font-bold text-gray-700">SESI SPONSOR MITRA AKTIF</p>
              <p className="text-sm font-black text-[#171717]">Halo, Budi! AI Workspace Siap Digunakan.</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Pengguna leluasa menggunakan Chat AI, Agents, dan Tools dengan saldo sponsor gratis.
            </p>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 text-xs text-gray-500">
              Akses penuh ke semua model LLM & tools tanpa batasan.
            </div>
          </div>
        )}

        {/* STEP 6: PERINGATAN SESI */}
        {currentStep === 6 && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-[#FBE7B2] border-2 border-[#171717] neo-shadow flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7 text-amber-900 animate-spin" />
            </div>
            <h3 className="text-base font-black text-amber-900 dark:text-amber-400">
              Sesi Akan Berakhir (Tersisa 10 Menit)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Sesi akses Free AI Credit di Cafe MoreAI Kemang akan segera selesai.
            </p>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-xs font-bold text-amber-900 dark:text-amber-300">
              Perpanjang sesi dengan melakukan order tambahan atau hubungi kasir.
            </div>
          </div>
        )}

        {/* STEP 7: SESI BERAKHIR */}
        {currentStep === 7 && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 border-2 border-[#171717] neo-shadow flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-base font-black">Sesi Telah Berakhir</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Akses Free AI di lokasi ini sudah selesai karena durasi telah habis.
            </p>
            <p className="text-[11px] text-gray-500">
              Data chat, dokumen, dan riwayat pekerjaan Anda tetap aman tersimpan di akun MoreAI.
            </p>
          </div>
        )}

        {/* STEP 8: PILIH AKSES LANJUTAN */}
        {currentStep === 8 && (
          <div className="space-y-3 animate-in fade-in duration-150 text-left">
            <h3 className="text-sm font-black text-center">Pilih Opsi Akses Lanjutan</h3>
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border-2 border-[#171717] neo-shadow-sm">
                <span className="text-xs font-black block">1. General Free Access</span>
                <span className="text-[10px] text-gray-500">
                  Gunakan kuota bawaan umum (100 credit per 6 jam gratis).
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBE7B2] border-2 border-[#171717] neo-shadow-sm text-[#171717]">
                <span className="text-xs font-black block">2. Berlangganan MoreAI Pro</span>
                <span className="text-[10px] text-gray-800">
                  Akses tanpa batas di mana saja tanpa tergantung Wi-Fi mitra.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: UPGRADE / PAID ACCESS */}
        {currentStep === 9 && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-[#C9F2D5] border-2 border-[#171717] neo-shadow flex items-center justify-center mx-auto">
              <Crown className="w-7 h-7 text-emerald-900" />
            </div>
            <h3 className="text-base font-black">Upgrade ke MoreAI Pro</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Lanjutkan pekerjaan AI Anda dari rumah, kantor, atau di mana pun Anda berada.
            </p>
            <div className="p-3 bg-[#C9F2D5]/40 rounded-2xl border-2 border-[#171717] text-left text-xs font-bold space-y-1">
              <p>• Kuota AI 5.000 credit / bulan</p>
              <p>• Semua model premium (GPT-4o, Claude 3.5)</p>
              <p>• Prioritas antrean bebas tunggu</p>
            </div>
          </div>
        )}

        {/* Simulation Navigation Controls */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex-1 py-2 rounded-xl border-2 border-[#171717] bg-white dark:bg-gray-800 text-xs font-bold"
            >
              Kembali
            </button>
          )}

          <button
            onClick={() => {
              if (currentStep < 9) setCurrentStep((prev) => prev + 1);
              else setCurrentStep(1);
            }}
            className="flex-1 neo-btn bg-[#C9F2D5] hover:bg-[#b5f0c4] text-[#171717] py-2 text-xs font-black flex items-center justify-center gap-1.5"
          >
            <span>{currentStep === 9 ? 'Ulangi Simulasi ↺' : 'Tahap Selanjutnya →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
