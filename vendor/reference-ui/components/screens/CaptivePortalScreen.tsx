'use client';

import React, { useState } from 'react';
import {
  Wifi,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Coffee,
  Ticket,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  Globe,
  Radio,
  Clock,
  Zap,
  Info,
} from 'lucide-react';
import { MascotIcon } from '../shared/MascotIcon';

interface CaptivePortalScreenProps {
  onSuccessConnect: (venueName: string, creditBonus: number) => void;
  onGoToPwa: () => void;
}

export const CaptivePortalScreen: React.FC<CaptivePortalScreenProps> = ({
  onSuccessConnect,
  onGoToPwa,
}) => {
  // Venue multi-tenancy selection for demonstration
  const [selectedVenue, setSelectedVenue] = useState<'kemang' | 'bogor' | 'kampus'>('kemang');
  const [authMode, setAuthMode] = useState<'quick' | 'account' | 'code'>('quick');
  const [accessCode, setAccessCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [verificationStep, setVerificationStep] = useState(0);
  const [showFaq, setShowFaq] = useState(false);

  const venues = {
    kemang: {
      name: 'Cafe MoreAI Kemang',
      address: 'Jl. Melati No. 12, Jakarta Selatan',
      ssid: 'MoreAI_Free_Guest',
      creditBonus: 5000,
      duration: '3 Jam Akses Penuh',
      router: 'MikroTik CCR2004 (Gateway 192.168.88.1)',
      isp: 'XL-Home Enterprise Fiber 200 Mbps',
    },
    bogor: {
      name: 'MoreAI Coffee & Workspace Bogor',
      address: 'Jl. Pajajaran No. 8, Bogor Tengah',
      ssid: 'MoreAI_Guest_HighSpeed',
      creditBonus: 3500,
      duration: '2.5 Jam Akses',
      router: 'MikroTik RB4011',
      isp: 'IndiHome Bisnis 150 Mbps',
    },
    kampus: {
      name: 'Perpustakaan Kampus Nusantara',
      address: 'Gedung Rektorat Lt. 2, Depok',
      ssid: 'Kampus_MoreAI_Academic',
      creditBonus: 6000,
      duration: '4 Jam Akses Edukasi',
      router: 'Cisco Catalyst / RADIUS 802.1X',
      isp: 'Biznet Dedicated 500 Mbps',
    },
  };

  const currentVenue = venues[selectedVenue];

  const handleConnect = () => {
    if (!agreeTerms) {
      alert('Mohon setujui Syarat & Ketentuan serta Kebijakan Privasi.');
      return;
    }

    setStatus('verifying');
    setVerificationStep(1);

    setTimeout(() => {
      setVerificationStep(2);
      setTimeout(() => {
        setVerificationStep(3);
        setTimeout(() => {
          setStatus('success');
          onSuccessConnect(currentVenue.name, currentVenue.creditBonus);
        }, 800);
      }, 800);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EC] dark:bg-[#171817] py-4 px-3 sm:px-4 flex flex-col justify-between max-w-md mx-auto">
      {/* Top Bar / Status Line */}
      <div className="w-full">
        {/* Captive Portal Network Header Banner */}
        <div className="bg-[#171717] text-white px-3 py-1.5 rounded-2xl flex items-center justify-between text-[11px] font-bold border-2 border-[#171717] mb-3">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-emerald-300">SSID: {currentVenue.ssid}</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/40">
            Captive Gateway Online
          </span>
        </div>

        {/* Venue Selector Switcher (Multi-tenant test toggle) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-3">
          <span className="text-[10px] font-black text-gray-500 shrink-0">Simulasi Venue:</span>
          {(['kemang', 'bogor', 'kampus'] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setSelectedVenue(v);
                setStatus('idle');
              }}
              className={`px-2 py-1 text-[10px] font-extrabold rounded-lg border border-[#171717] transition shrink-0 ${
                selectedVenue === v
                  ? 'bg-[#171717] text-white'
                  : 'bg-white dark:bg-[#232522] text-gray-700 dark:text-gray-300'
              }`}
            >
              {v === 'kemang' ? 'Kemang' : v === 'bogor' ? 'Bogor' : 'Kampus'}
            </button>
          ))}
        </div>

        {/* Hero Card */}
        <div className="neo-card p-4 bg-white dark:bg-[#232522] border-2 border-[#171717] relative overflow-hidden mb-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C9F2D5] border border-[#171717] text-[10px] font-black text-[#171717] mb-1.5">
                <Coffee className="w-3 h-3 text-emerald-800" />
                <span>Wi-Fi Tamu & Mitra Resmi</span>
              </div>
              <h1 className="text-lg font-black text-[#171717] dark:text-[#F7F4EC] leading-tight">
                {currentVenue.name}
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {currentVenue.address}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBE7B2] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center shrink-0">
              <MascotIcon size={40} mood="happy" />
            </div>
          </div>

          {/* Reward Highlight Box */}
          <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-[#D9D5FF]/60 to-[#C9F2D5]/60 border-2 border-[#171717] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-200 tracking-wider block">
                Bonus Pelanggan Venue
              </span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-base font-black font-mono text-[#171717] dark:text-[#F7F4EC]">
                  +{currentVenue.creditBonus.toLocaleString('id-ID')} Free AI Credit
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-extrabold text-gray-500 block">Masa Aktif</span>
              <span className="text-[11px] font-black text-[#171717] dark:text-[#F7F4EC]">
                {currentVenue.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Verification / Success View */}
        {status === 'verifying' && (
          <div className="neo-card p-5 bg-white dark:bg-[#232522] border-2 border-[#171717] text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#D9D5FF] border-2 border-[#171717] flex items-center justify-center animate-spin">
              <Wifi className="w-6 h-6 text-[#171717]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#171717] dark:text-[#F7F4EC]">
                Menghubungkan ke Gateway...
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Sedang memverifikasi router venue dan mengklaim kuota sponsor AI Anda.
              </p>
            </div>

            {/* Steps indicator */}
            <div className="space-y-2 text-left text-xs font-bold pt-2">
              <div className={`flex items-center gap-2 ${verificationStep >= 1 ? 'text-emerald-700' : 'text-gray-400'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Handshake MikroTik Captive Gateway ({currentVenue.ssid})</span>
              </div>
              <div className={`flex items-center gap-2 ${verificationStep >= 2 ? 'text-emerald-700' : 'text-gray-400'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Validasi RADIUS & Alokasi IP Tamu</span>
              </div>
              <div className={`flex items-center gap-2 ${verificationStep >= 3 ? 'text-emerald-700' : 'text-gray-400'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Penerbitan {currentVenue.creditBonus.toLocaleString('id-ID')} AI Credit ke Akun</span>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="neo-card p-5 bg-[#C9F2D5] border-2 border-[#171717] text-center space-y-3.5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white border-2 border-[#171717] neo-shadow-sm flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <span className="text-[10px] font-black bg-white px-2.5 py-0.5 rounded-full border border-[#171717] uppercase tracking-wider">
                Terhubung Sukses
              </span>
              <h2 className="text-base font-black text-[#171717] mt-2">
                Wi-Fi & Free AI Credit Aktif!
              </h2>
              <p className="text-xs text-gray-800 mt-1">
                Selamat! Anda dapat langsung mengakses internet cepat dan menggunakan workspace MoreAI dengan bonus kredit gratis.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#171717] text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Sponsor Venue:</span>
                <span className="font-bold">{currentVenue.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kredit Diberikan:</span>
                <span className="font-mono font-black text-emerald-700">+{currentVenue.creditBonus.toLocaleString('id-ID')} Credit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durasi Sesi:</span>
                <span className="font-bold">{currentVenue.duration}</span>
              </div>
            </div>

            <button
              onClick={onGoToPwa}
              className="w-full neo-btn bg-[#171717] text-white py-3 text-xs font-black flex items-center justify-center gap-2"
            >
              <span>Buka MoreAI Workspace (PWA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'idle' && (
          <>
            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-200/80 dark:bg-gray-800 rounded-xl mb-3">
              <button
                onClick={() => setAuthMode('quick')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition ${
                  authMode === 'quick'
                    ? 'bg-white dark:bg-[#1E201D] text-[#171717] dark:text-white neo-shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                1-Klik Connect
              </button>
              <button
                onClick={() => setAuthMode('account')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition ${
                  authMode === 'account'
                    ? 'bg-white dark:bg-[#1E201D] text-[#171717] dark:text-white neo-shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Akun MoreAI
              </button>
              <button
                onClick={() => setAuthMode('code')}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition ${
                  authMode === 'code'
                    ? 'bg-white dark:bg-[#1E201D] text-[#171717] dark:text-white neo-shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Kode Meja
              </button>
            </div>

            {/* Mode 1: 1-Click Connect */}
            {authMode === 'quick' && (
              <div className="neo-card p-4 bg-white dark:bg-[#232522] border-2 border-[#171717] space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#C9F2D5] border border-[#171717] flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-emerald-800" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
                      Akses Cepat Pengunjung
                    </h3>
                    <p className="text-[10px] text-gray-500">
                      Langsung terhubung tanpa password ribet
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F7F4EC] dark:bg-[#1A1C19] border border-gray-200 dark:border-gray-800 text-[11px] text-gray-700 dark:text-gray-300">
                  Perangkat Anda akan didaftarkan otomatis ke gateway router venue dengan alokasi bandwidth prioritas dan {currentVenue.creditBonus.toLocaleString('id-ID')} bonus token AI.
                </div>
              </div>
            )}

            {/* Mode 2: Account Login */}
            {authMode === 'account' && (
              <div className="neo-card p-4 bg-white dark:bg-[#232522] border-2 border-[#171717] space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D9D5FF] border border-[#171717] flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
                      Tautkan ke Akun MoreAI
                    </h3>
                    <p className="text-[10px] text-gray-500">
                      Sinkronkan history chat & riwayat kerja Anda
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-600 block mb-1">
                    Email Akun
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full text-xs p-2 rounded-xl border-2 border-[#171717] bg-white dark:bg-[#1E201D] text-[#171717] dark:text-[#F7F4EC] outline-none"
                  />
                </div>
              </div>
            )}

            {/* Mode 3: Table Voucher Code */}
            {authMode === 'code' && (
              <div className="neo-card p-4 bg-white dark:bg-[#232522] border-2 border-[#171717] space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FBE7B2] border border-[#171717] flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-amber-800" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
                      Kode Akses Meja / Barista
                    </h3>
                    <p className="text-[10px] text-gray-500">
                      Tercetak di struk kasir atau standee meja
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-600 block mb-1">
                    Masukkan 6-Karakter Kode Voucher
                  </label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="CONTOH: KEMANG-88"
                    className="w-full text-xs font-mono font-black p-2 uppercase rounded-xl border-2 border-[#171717] bg-white dark:bg-[#1E201D] text-[#171717] dark:text-[#F7F4EC] outline-none text-center tracking-widest"
                  />
                </div>
              </div>
            )}

            {/* Terms and Consent Checkbox (PRD Section 17.4 #3) */}
            <div className="mt-3 flex items-start gap-2 px-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-2 border-[#171717] text-emerald-600 focus:ring-0"
              />
              <label htmlFor="terms" className="text-[10px] text-gray-600 dark:text-gray-300 font-medium leading-tight">
                Saya menyetujui <span className="font-bold underline text-[#171717] dark:text-white">Syarat & Ketentuan Jaringan Tamu</span> dan Kebijakan Privasi MoreAI serta venue {currentVenue.name}.
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleConnect}
              className="w-full mt-3.5 neo-btn bg-[#C9F2D5] hover:bg-[#b0efbe] text-[#171717] py-3 text-xs font-black flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Wifi className="w-4 h-4 text-emerald-800" />
              <span>Sambungkan Wi-Fi & Ambil Free AI Credit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Technical Diagnostics Info Pill */}
        <div className="mt-4 p-2.5 rounded-xl bg-gray-100 dark:bg-[#20221F] border border-gray-300 dark:border-gray-800 text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Router Gateway:</span>
            <span className="font-mono text-[9px]">{currentVenue.router}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Provider / Uplink:</span>
            <span className="font-mono text-[9px]">{currentVenue.isp}</span>
          </div>
        </div>

        {/* FAQ & Help Accordion (PRD Section 17.4 #8) */}
        <div className="mt-3 border-t border-gray-200 dark:border-gray-800 pt-3">
          <button
            onClick={() => setShowFaq(!showFaq)}
            className="w-full flex items-center justify-between text-xs font-black text-gray-700 dark:text-gray-300"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Butuh Bantuan Sambungan Wi-Fi?</span>
            </span>
            {showFaq ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFaq && (
            <div className="mt-2 text-[10px] text-gray-600 dark:text-gray-300 space-y-1.5 pl-5 border-l-2 border-amber-400">
              <p>• <strong>Layar login tidak muncul?</strong> Buka browser Anda dan ketik <code>http://captive.moreai.id</code>.</p>
              <p>• <strong>Kode akses meja:</strong> Tanyakan kepada barista atau kasir {currentVenue.name}.</p>
              <p>• <strong>Bebas Quota:</strong> Setelah terhubung, kuota AI berlaku selama Anda di lokasi dan dapat diperpanjang otomatis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 text-center">
        <p className="text-[10px] text-gray-400 font-semibold">
          Powered by MoreAI Unified Verification Engine · MikroTik & RADIUS Multi-Tenant
        </p>
      </div>
    </div>
  );
};
