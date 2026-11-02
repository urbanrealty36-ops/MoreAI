'use client';

import React, { useState } from 'react';
import {
  Coffee,
  MapPin,
  Wifi,
  QrCode,
  Gift,
  Award,
  BarChart3,
  FileText,
  Users,
  Settings,
  Plus,
  Download,
  Share2,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  X,
} from 'lucide-react';
import { MascotIcon } from '../shared/MascotIcon';

export const PartnerPortalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'cabang' | 'wifi' | 'verifikasi' | 'qr' | 'campaign' | 'reward' | 'stats' | 'laporan' | 'akun'
  >('dashboard');

  // Wizard state for partner onboarding
  const [showRegisterWizard, setShowRegisterWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [orgName, setOrgName] = useState('Cafe MoreAI');
  const [orgCategory, setOrgCategory] = useState('Kafe & Restoran');
  const [orgEmail, setOrgEmail] = useState('info@cafemoreai.id');
  const [orgPhone, setOrgPhone] = useState('+62 812-3456-7890');

  // Modals
  const [showLocationDetailModal, setShowLocationDetailModal] = useState(false);
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);

  const [campaignList, setCampaignList] = useState([
    {
      id: 'c1',
      title: 'Promo Ngopi & AI',
      desc: 'Free 2.000 credit untuk setiap pelanggan',
      validity: 'Hingga 31 Jan 2026',
      active: true,
      color: 'bg-[#FBE7B2]',
    },
    {
      id: 'c2',
      title: 'Member Weekend Bonus',
      desc: 'Bonus 5.000 credit khusus Sabtu - Minggu',
      validity: 'Setiap Akhir Pekan',
      active: true,
      color: 'bg-[#C9F2D5]',
    },
    {
      id: 'c3',
      title: 'Ulang Tahun Member',
      desc: 'Bonus 10.000 credit spesial hari ulang tahun',
      validity: 'Sepanjang Tahun',
      active: false,
      color: 'bg-[#F9D8E5]',
    },
  ]);

  const toggleCampaign = (id: string) => {
    setCampaignList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Top Banner Card: Partner Organization */}
      <div className="neo-card p-4 bg-white dark:bg-[#232522]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FBE7B2] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center">
              <Coffee className="w-6 h-6 text-amber-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-[#171717] dark:text-[#F7F4EC]">
                  Cafe MoreAI Kemang
                </h1>
                <span className="text-[9px] font-bold bg-[#C9F2D5] text-[#171717] px-1.5 py-0.2 rounded border border-[#171717]">
                  Mitra Aktif
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">ID: P-10423 · Jakarta Selatan</p>
            </div>
          </div>
          <button
            onClick={() => setShowRegisterWizard(true)}
            className="text-[10px] font-bold px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg border border-[#171717]"
          >
            Wizard
          </button>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1E201D] border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Pengunjung</span>
            <span className="text-lg font-black font-mono">1.284</span>
            <span className="text-[9px] font-bold text-emerald-600 block">↑ +12,8%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#C9F2D5]/40 border border-[#171717]">
            <span className="text-[10px] text-gray-700 font-bold block uppercase">Sesi Aktif</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black font-mono">352</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-800">Live</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1E201D] border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">AI Credit Dipakai</span>
            <span className="text-lg font-black font-mono">3,2M</span>
            <span className="text-[9px] font-bold text-emerald-600 block">↑ +18,4%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FBE7B2]/40 border border-[#171717]">
            <span className="text-[10px] text-gray-700 font-bold block uppercase">Reward Mitra</span>
            <span className="text-base font-black font-mono">Rp 250.000</span>
            <span className="text-[9px] font-bold text-amber-900 block">↑ +25,0%</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'dashboard', label: 'Ringkasan' },
          { id: 'cabang', label: 'Lokasi & Cabang' },
          { id: 'wifi', label: 'Jaringan WiFi' },
          { id: 'verifikasi', label: 'Metode Verifikasi' },
          { id: 'qr', label: 'Kode Akses & QR' },
          { id: 'campaign', label: 'Campaign' },
          { id: 'reward', label: 'Reward & Insentif' },
          { id: 'stats', label: 'Statistik' },
          { id: 'laporan', label: 'Laporan' },
          { id: 'akun', label: 'Akun Mitra' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition border-2 border-[#171717] neo-shadow-sm ${
              activeTab === tab.id
                ? 'bg-[#171717] text-white'
                : 'bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. SUB-TAB: DASHBOARD RINGKASAN */}
      {activeTab === 'dashboard' && (
        <div className="space-y-3">
          {/* QR Code Quick Card */}
          <div className="neo-card p-3.5 bg-gradient-to-r from-[#D9D5FF] to-[#D8ECFF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#171717] neo-shadow-sm flex items-center justify-center shrink-0">
                <QrCode className="w-7 h-7 text-[#171717]" />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#171717]">
                  Standee QR Code Meja
                </h3>
                <p className="text-[10px] text-gray-700 leading-snug">
                  Pengunjung cukup scan untuk terhubung dan mendapatkan Free AI Credit.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('qr')}
              className="neo-btn bg-white hover:bg-gray-50 text-[10px] font-black px-2.5 py-1.5 shrink-0"
            >
              Lihat QR
            </button>
          </div>

          {/* Quick detail button */}
          <button
            onClick={() => setShowLocationDetailModal(true)}
            className="w-full neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between text-left hover:bg-gray-50"
          >
            <div>
              <p className="text-xs font-black">Pengaturan Detail Lokasi</p>
              <p className="text-[10px] text-gray-500">WiFi (2), Captive Portal Aktif, Campaign (2)</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Active Campaigns Preview */}
          <div className="neo-card p-3.5 bg-white dark:bg-[#232522]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black">Program Campaign Aktif</h3>
              <button
                onClick={() => setActiveTab('campaign')}
                className="text-[10px] font-bold text-emerald-700 hover:underline"
              >
                Kelola Semua
              </button>
            </div>
            <div className="space-y-2">
              {campaignList.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1E201D] border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-pink-600" />
                    <div>
                      <p className="text-xs font-black">{c.title}</p>
                      <p className="text-[10px] text-gray-500">{c.desc}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black bg-[#C9F2D5] px-2 py-0.5 rounded-full border border-[#171717]">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUB-TAB: LOKASI & CABANG */}
      {activeTab === 'cabang' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase text-gray-500">Cabang Bisnis Terdaftar</h2>
            <button
              onClick={() => alert('Formulir pendaftaran cabang baru dibuka.')}
              className="neo-btn bg-[#C9F2D5] px-2.5 py-1 text-[11px] font-black flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Cabang</span>
            </button>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Cafe MoreAI Kemang', address: 'Jl. Melati No. 12, Jakarta Selatan', status: 'Aktif' },
              { name: 'Cafe MoreAI Bogor', address: 'Jl. Pajajaran No. 8, Bogor', status: 'Aktif' },
              { name: 'Cafe MoreAI Depok', address: 'Jl. Margonda Raya No. 45, Depok', status: 'Persiapan' },
            ].map((cab, idx) => (
              <div key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black">{cab.name}</h4>
                  <p className="text-[10px] text-gray-500">{cab.address}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[#171717] ${cab.status === 'Aktif' ? 'bg-[#C9F2D5]' : 'bg-[#FBE7B2]'}`}>
                  {cab.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: JARINGAN WIFI */}
      {activeTab === 'wifi' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase text-gray-500">SSID WiFi Terdaftar</h2>
            <button className="neo-btn bg-[#C9F2D5] px-2.5 py-1 text-[11px] font-black flex items-center gap-1">
              <Plus className="w-3 h-3" />
              <span>Tambah SSID</span>
            </button>
          </div>

          {[
            { ssid: 'MoreAI_Guest', target: 'Tamu / Pengunjung Kafe', status: 'Aktif', users: '284 Terkoneksi' },
            { ssid: 'MoreAI_Staff', target: 'Operasional Kasir & Barista', status: 'Aktif', users: '12 Terkoneksi' },
            { ssid: 'MoreAI_VIP', target: 'Member / VIP Meeting Room', status: 'Nonaktif', users: '0' },
          ].map((w, idx) => (
            <div key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D8ECFF] border border-[#171717] flex items-center justify-center neo-shadow-sm">
                  <Wifi className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <h4 className="text-xs font-black font-mono">{w.ssid}</h4>
                  <p className="text-[10px] text-gray-500">{w.target} · {w.users}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[#171717] ${w.status === 'Aktif' ? 'bg-[#C9F2D5]' : 'bg-gray-200'}`}>
                {w.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 4. SUB-TAB: METODE VERIFIKASI */}
      {activeTab === 'verifikasi' && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase text-gray-500">Pilih Metode Aktivasi Akses di Lokasi Ini</h2>
          <div className="space-y-2">
            {[
              { title: 'Captive Portal (MikroTik / Gateway)', desc: 'Autentikasi langsung saat membuka browser di jaringan WiFi.', active: true },
              { title: 'Geo-WiFi (Lokasi + Jaringan)', desc: 'Verifikasi GPS koordinat + SSID WiFi mitra.', active: false },
              { title: 'RADIUS (Enterprise WiFi)', desc: 'Autentikasi 802.1X terpusat untuk kampus/hotel.', active: false },
              { title: 'Integrasi ISP (API Provider)', desc: 'Verifikasi pelanggan ISP mitra langsung.', active: false },
            ].map((item, idx) => (
              <label key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-start justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-black">{item.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <input type="radio" name="method" defaultChecked={item.active} className="mt-1" />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 5. SUB-TAB: KODE AKSES & QR CODE */}
      {activeTab === 'qr' && (
        <div className="space-y-3.5">
          <div className="neo-card p-5 bg-white dark:bg-[#232522] text-center">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
              Akses WiFi & Free AI Credit
            </span>
            <h2 className="text-base font-black mt-1">Cafe MoreAI Kemang</h2>

            <div className="w-48 h-48 mx-auto my-4 p-3 bg-white border-3 border-[#171717] rounded-3xl neo-shadow flex flex-col items-center justify-center">
              <div className="w-36 h-36 bg-gradient-to-br from-[#FBE7B2] via-white to-[#C9F2D5] border-2 border-[#171717] rounded-2xl p-2 flex flex-col items-center justify-center relative">
                <QrCode className="w-24 h-24 text-[#171717]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 bg-white rounded-lg border-2 border-[#171717] flex items-center justify-center neo-shadow-sm">
                    <MascotIcon size={18} mood="happy" />
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black mt-2 text-[#171717]">
                KODE: MA-5729
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              Cetak dan letakkan standee ini di meja kafe atau dekat kasir untuk mempermudah pengunjung.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => alert('Mengunduh standee cetak PDF resolusi tinggi...')}
                className="neo-btn bg-[#C9F2D5] text-[#171717] py-2 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Standee</span>
              </button>
              <button
                onClick={() => alert('Link aktivasi disalin ke clipboard!')}
                className="neo-btn bg-white hover:bg-gray-50 text-[#171717] py-2 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB: CAMPAIGN */}
      {activeTab === 'campaign' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase text-gray-500">Program Campaign Venue</h2>
            <button
              onClick={() => setShowAddCampaignModal(true)}
              className="neo-btn bg-[#C9F2D5] px-2.5 py-1 text-[11px] font-black"
            >
              + Buat Campaign
            </button>
          </div>

          <div className="space-y-2.5">
            {campaignList.map((c) => (
              <div key={c.id} className="neo-card p-3.5 bg-white dark:bg-[#232522]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-black">{c.title}</h3>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">{c.desc}</p>
                    <span className="text-[10px] font-mono text-gray-500 block mt-1">
                      Masa Berlaku: {c.validity}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCampaign(c.id)}
                    className={`w-10 h-6 rounded-full border-2 border-[#171717] transition-colors p-0.5 ${
                      c.active ? 'bg-[#C9F2D5]' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#171717] transition-transform ${
                        c.active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SUB-TAB: REWARD & INSENTIF */}
      {activeTab === 'reward' && (
        <div className="space-y-3">
          <div className="neo-card p-4 bg-[#FBE7B2] text-[#171717]">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-900" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Reward Mitra</span>
                <h3 className="text-2xl font-black font-mono">Rp 2.540.000</h3>
                <span className="text-[10px] text-emerald-800 font-bold">↑ +18,7% dari bulan lalu</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-amber-800/20 text-xs">
              <div>
                <span className="text-[10px] text-gray-700 block">3 Campaign Aktif</span>
                <span className="font-mono font-bold">Rp 2.540.000 Klaim</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-700 block">Reward Pending</span>
                <span className="font-mono font-bold text-amber-900">Rp 450.000</span>
              </div>
            </div>
            <button
              onClick={() => alert('Permintaan pencairan dana reward sebesar Rp 2.540.000 sedang diproses ke rekening bank mitra.')}
              className="mt-3 w-full neo-btn bg-white hover:bg-gray-100 text-[#171717] py-2 text-xs font-black"
            >
              Cairkan Reward ke Rekening Bank
            </button>
          </div>
        </div>
      )}

      {/* 8. SUB-TAB: STATISTIK */}
      {activeTab === 'stats' && (
        <div className="space-y-3">
          <div className="neo-card p-4 bg-white dark:bg-[#232522]">
            <h3 className="text-xs font-black mb-1">Statistik Kunjungan Pengguna</h3>
            <p className="text-[10px] text-gray-500 mb-3">Tren aktivitas 7 hari terakhir di Cafe MoreAI Kemang</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border">
                <span className="text-[10px] text-gray-500 block">Pengunjung 7 Hari</span>
                <span className="text-lg font-black font-mono">8.420</span>
                <span className="text-[9px] text-emerald-600 font-bold block">↑ +14,2%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border">
                <span className="text-[10px] text-gray-500 block">Penggunaan AI</span>
                <span className="text-lg font-black font-mono">2,8M Cr</span>
                <span className="text-[9px] text-emerald-600 font-bold block">↑ +17,9%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. SUB-TAB: LAPORAN */}
      {activeTab === 'laporan' && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase text-gray-500">Pusat Laporan & Ekspor Data</h2>
          <div className="space-y-2">
            {[
              'Ringkasan Aktivitas Penggunaan & Sesi',
              'Laporan Performa Setiap Campaign',
              'Laporan Reward & Insentif Mitra',
            ].map((lap, idx) => (
              <div key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between">
                <span className="text-xs font-black">{lap}</span>
                <button
                  onClick={() => alert(`Mengunduh berkas ${lap} (CSV)...`)}
                  className="neo-btn bg-[#C9F2D5] px-2.5 py-1 text-[10px] font-black flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Ekspor</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. SUB-TAB: AKUN MITRA */}
      {activeTab === 'akun' && (
        <div className="space-y-3">
          <div className="neo-card p-4 bg-white dark:bg-[#232522]">
            <h3 className="text-xs font-black">Budi Santoso</h3>
            <p className="text-[11px] text-gray-500">admin@cafemoreai.id · Owner Mitra</p>
          </div>
          <div className="neo-card p-2 bg-white dark:bg-[#232522] divide-y divide-gray-100 dark:divide-gray-800 text-xs font-bold">
            <button className="w-full p-2.5 text-left flex justify-between">
              <span>Profil Organisasi</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full p-2.5 text-left flex justify-between">
              <span>Anggota Tim Cabang</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full p-2.5 text-left flex justify-between">
              <span>Pengaturan Notifikasi</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full p-2.5 text-left flex justify-between">
              <span>Integrasi & API Gateway</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PENGATURAN DETAIL LOKASI */}
      {showLocationDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-5 neo-shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-sm">Pengaturan Lokasi (Detail)</h3>
              <button onClick={() => setShowLocationDetailModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border">
                <span className="font-bold block">Informasi Lokasi</span>
                <span className="text-gray-500">Cafe MoreAI Kemang, Jl. Melati No. 12</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border">
                <span className="font-bold block">Jaringan WiFi (2 SSID)</span>
                <span className="text-gray-500">MoreAI_Guest & MoreAI_Staff</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border">
                <span className="font-bold block">Metode Verifikasi</span>
                <span className="text-emerald-700 font-bold">Captive Portal (Aktif)</span>
              </div>
            </div>
            <button
              onClick={() => setShowLocationDetailModal(false)}
              className="mt-4 w-full neo-btn bg-[#C9F2D5] py-2 text-xs font-black"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL: WIZARD REGISTRASI MITRA */}
      {showRegisterWizard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-5 neo-shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase text-gray-500">
                Pendaftaran Mitra (Tahap {wizardStep} dari 3)
              </span>
              <button onClick={() => setShowRegisterWizard(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-sm">Data Organisasi</h4>
                <div>
                  <label className="font-bold block mb-1">Nama Bisnis / Organisasi</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full p-2 bg-white rounded-xl border border-[#171717]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Kategori</label>
                  <select
                    value={orgCategory}
                    onChange={(e) => setOrgCategory(e.target.value)}
                    className="w-full p-2 bg-white rounded-xl border border-[#171717]"
                  >
                    <option>Kafe & Restoran</option>
                    <option>Coworking Space</option>
                    <option>Kampus & Universitas</option>
                    <option>Hotel & Ruang Publik</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Email Bisnis</label>
                  <input
                    type="email"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="w-full p-2 bg-white rounded-xl border border-[#171717]"
                  />
                </div>
                <button
                  onClick={() => setWizardStep(2)}
                  className="w-full neo-btn bg-[#C9F2D5] py-2 text-xs font-black mt-2"
                >
                  Lanjut ke Pengaturan Lokasi
                </button>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-sm">Pengaturan Lokasi & Cabang</h4>
                <div className="p-2.5 bg-white rounded-xl border">
                  <span className="font-bold block">Cafe MoreAI Kemang</span>
                  <span className="text-gray-500">Jl. Melati No. 12, Jakarta</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border">
                  <span className="font-bold block">Cafe MoreAI Bogor</span>
                  <span className="text-gray-500">Jl. Pajajaran No. 8, Bogor</span>
                </div>
                <button
                  onClick={() => setWizardStep(3)}
                  className="w-full neo-btn bg-[#C9F2D5] py-2 text-xs font-black mt-2"
                >
                  Selesaikan Pendaftaran
                </button>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="text-center space-y-3 py-2">
                <div className="w-14 h-14 bg-[#C9F2D5] border-2 border-[#171717] rounded-2xl mx-auto flex items-center justify-center neo-shadow-sm">
                  <MascotIcon size={42} mood="excited" />
                </div>
                <h4 className="font-black text-base">Registrasi Berhasil! 🎉</h4>
                <p className="text-xs text-gray-600">
                  Mitra MoreAI kamu sudah aktif. Lengkapi pengaturan jaringan, akses, dan campaign.
                </p>
                <button
                  onClick={() => {
                    setShowRegisterWizard(false);
                    setWizardStep(1);
                  }}
                  className="w-full neo-btn bg-[#171717] text-white py-2.5 text-xs font-black"
                >
                  Buka Dashboard Mitra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH CAMPAIGN */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-5 neo-shadow-lg">
            <h3 className="font-black text-sm mb-2">Buat Campaign Mitra</h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Program</label>
                <input type="text" placeholder="mis. Promo Ngopi Sore" className="w-full p-2 bg-white rounded-xl border border-[#171717]" />
              </div>
              <div>
                <label className="font-bold block mb-1">Kredit AI Per Pelanggan</label>
                <input type="number" defaultValue={2500} className="w-full p-2 bg-white rounded-xl border border-[#171717] font-mono" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAddCampaignModal(false)} className="flex-1 py-1.5 rounded-xl border bg-white">Batal</button>
              <button
                onClick={() => {
                  setCampaignList((prev) => [
                    ...prev,
                    {
                      id: `c-${Date.now()}`,
                      title: 'Promo Baru',
                      desc: 'Bonus kredit sponsor kafe',
                      validity: '30 Hari',
                      active: true,
                      color: 'bg-[#C9F2D5]',
                    },
                  ]);
                  setShowAddCampaignModal(false);
                }}
                className="flex-1 neo-btn bg-[#C9F2D5] py-1.5 font-black text-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
