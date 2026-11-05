'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Cpu,
  Bot,
  Wrench,
  CreditCard,
  Crown,
  Network,
  ShieldCheck,
  MapPin,
  Wifi,
  Radio,
  Globe2,
  Gift,
  BarChart3,
  FileClock,
  Settings,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  Download,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Server,
  Zap,
  Lock,
  Layers,
  Sparkles,
  Coffee,
  Check,
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [geoRadius, setGeoRadius] = useState<number>(500);
  const [geoEnabled, setGeoEnabled] = useState(true);
  const [captiveEnabled, setCaptiveEnabled] = useState(true);
  const [ispEnabled, setIspEnabled] = useState(true);
  const [radiusEnabled, setRadiusEnabled] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [auditFilter, setAuditFilter] = useState<'semua' | 'sistem' | 'pengguna' | 'mitra'>('semua');
  const [savedNotice, setSavedNotice] = useState(false);

  // New Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pengguna', label: 'Manajemen Pengguna', icon: Users },
    { id: 'engine', label: 'AI Engine & Model', icon: Cpu },
    { id: 'agents', label: 'Manajemen Agent', icon: Bot },
    { id: 'tools', label: 'Tools Registry', icon: Wrench },
    { id: 'billing', label: 'Credit & Billing', icon: CreditCard },
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
    { id: 'network', label: 'Network Partnership', icon: Network },
    { id: 'verification', label: 'Metode Verifikasi', icon: ShieldCheck },
    { id: 'geowifi', label: 'Geo-WiFi (Radius)', icon: MapPin },
    { id: 'captive', label: 'Captive Portal', icon: Wifi },
    { id: 'radius', label: 'Server RADIUS', icon: Radio },
    { id: 'isp', label: 'Integrasi ISP', icon: Globe2 },
    { id: 'campaign', label: 'Campaign & Reward', icon: Gift },
    { id: 'analytics', label: 'Analytics & Laporan', icon: BarChart3 },
    { id: 'audit', label: 'Audit & Log', icon: FileClock },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
  ];

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F7F4EC] dark:bg-[#171817] text-[#171717] dark:text-[#F7F4EC] flex flex-col md:flex-row pb-20">
      {/* Sidebar for Desktop / Horizontal Nav for Mobile */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#1E201D] border-b-2 md:border-b-0 md:border-r-2 border-[#171717] dark:border-[#4A4A46] p-3 shrink-0">
        <div className="flex items-center gap-2 px-2 py-2 mb-2 bg-[#FBE7B2] rounded-xl border border-[#171717] neo-shadow-sm">
          <ShieldCheck className="w-5 h-5 text-amber-900" />
          <div>
            <span className="text-xs font-black block leading-none">Super Admin</span>
            <span className="text-[10px] text-gray-700">admin@moreai.id</span>
          </div>
        </div>

        {/* Scrollable Nav Item List */}
        <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar md:overflow-y-auto max-h-[60vh] pt-1.5 pb-1.5 -my-0.5 md:my-0 md:py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition text-left border ${
                  isActive
                    ? 'bg-[#C9F2D5] text-[#171717] border-[#171717] neo-shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#171717]' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 md:p-6 max-w-4xl overflow-y-auto">
        {/* Save confirmation toast */}
        {savedNotice && (
          <div className="fixed top-14 right-4 z-50 bg-[#C9F2D5] border-2 border-[#171717] text-[#171717] px-4 py-2 rounded-xl text-xs font-black neo-shadow animate-in slide-in-from-top">
            ✓ Perubahan konfigurasi berhasil disimpan ke sistem!
          </div>
        )}

        {/* 1. TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black tracking-tight">Dashboard Ringkasan Super Admin</h2>
              <p className="text-xs text-gray-500">
                Pemantauan real-time sistem, metrik AI credit, dan jaringan mitra MoreAI.
              </p>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="neo-card p-3 bg-white dark:bg-[#232522]">
                <span className="text-[10px] font-bold text-gray-500 block uppercase">Total Pengguna</span>
                <span className="text-xl font-black font-mono">1.248.320</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">↑ +12,4%</span>
              </div>

              <div className="neo-card p-3 bg-[#FBE7B2] text-[#171717]">
                <span className="text-[10px] font-bold text-amber-900 block uppercase">Total AI Credit</span>
                <span className="text-xl font-black font-mono">98.6M</span>
                <span className="text-[10px] text-amber-900 font-bold block mt-0.5">↑ +18,7%</span>
              </div>

              <div className="neo-card p-3 bg-white dark:bg-[#232522]">
                <span className="text-[10px] font-bold text-gray-500 block uppercase">Lokasi Mitra</span>
                <span className="text-xl font-black font-mono">4.328</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">↑ +6,8%</span>
              </div>

              <div className="neo-card p-3 bg-[#D8ECFF] text-[#171717]">
                <span className="text-[10px] font-bold text-blue-900 block uppercase">Provider (ISP)</span>
                <span className="text-xl font-black font-mono">12 ISP</span>
                <span className="text-[10px] text-blue-900 font-bold block mt-0.5">Nasional</span>
              </div>
            </div>

            {/* Chart Simulation */}
            <div className="neo-card p-4 bg-white dark:bg-[#232522]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-black">Konsumsi AI Credit (7 Hari Terakhir)</h3>
                  <p className="text-[10px] text-gray-500">Total volume komputasi LLM & Tools</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-[#C9F2D5] rounded-md border border-[#171717]">
                  78.4M Terpakai
                </span>
              </div>

              <div className="h-36 flex items-end justify-between gap-2 pt-6 border-b border-gray-200 dark:border-gray-700 px-2">
                {[
                  { day: 'Sen', val: 55 },
                  { day: 'Sel', val: 68 },
                  { day: 'Rab', val: 60 },
                  { day: 'Kam', val: 82 },
                  { day: 'Jum', val: 75 },
                  { day: 'Sab', val: 92 },
                  { day: 'Min', val: 88 },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-mono font-bold text-gray-500">{item.val}M</span>
                    <div
                      className="w-full bg-[#D9D5FF] hover:bg-[#C9F2D5] border-2 border-[#171717] rounded-t-lg transition-all"
                      style={{ height: `${item.val}%` }}
                    />
                    <span className="text-[10px] font-bold text-gray-600">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Status */}
            <div className="neo-card p-4 bg-white dark:bg-[#232522]">
              <h3 className="text-xs font-black mb-2 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Kesehatan Layanan (Service Status)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: 'API Gateway (FastAPI)', status: 'Operational' },
                  { name: 'AI Model Router', status: 'Operational' },
                  { name: 'Supabase PostgreSQL', status: 'Operational' },
                  { name: 'Execution Sandbox', status: 'Operational' },
                  { name: 'Queue & Background Worker', status: 'Operational' },
                  { name: 'Unified Verification Engine', status: 'Operational' },
                ].map((s, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-[11px] font-bold">{s.name}</span>
                    <span className="text-[9px] bg-[#C9F2D5] text-emerald-950 font-black px-1.5 py-0.2 rounded border border-[#171717]">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Network Events Table */}
            <div className="neo-card p-4 bg-white dark:bg-[#232522]">
              <h3 className="text-xs font-black mb-2">Event Jaringan & Verifikasi Terbaru</h3>
              <div className="space-y-1.5 text-xs font-medium">
                {[
                  { time: '13 Jan 10:24', venue: 'Cafe MoreAI Kemang', isp: 'CafeMoreAI_Gratis', event: 'Aktivasi Akses (Kode)', status: 'Berhasil' },
                  { time: '13 Jan 10:18', venue: 'Kampus Nusantara', isp: 'KampusNusantara', event: 'Sesi Dimulai (Geo-WiFi)', status: 'Berhasil' },
                  { time: '13 Jan 10:05', venue: 'Resto Rasa Lokal', isp: 'RasaLokal_Free', event: 'Sesi Berakhir (Timeout)', status: 'Selesai' },
                ].map((ev, i) => (
                  <div key={i} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs">{ev.venue}</span>
                      <span className="text-[10px] text-gray-500 block">{ev.time} · {ev.isp} · {ev.event}</span>
                    </div>
                    <span className="text-[9px] bg-[#C9F2D5] text-emerald-900 font-bold px-2 py-0.5 rounded border border-[#171717]">
                      ✓ {ev.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB: PENGGUNA */}
        {activeTab === 'pengguna' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Manajemen Pengguna</h2>
                <p className="text-xs text-gray-500">Kelola akun pengguna, status verifikasi, dan alokasi peran.</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="neo-btn bg-[#C9F2D5] px-3 py-1.5 text-xs font-black flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pengguna</span>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 neo-card p-1.5 bg-white dark:bg-[#232522] flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400 ml-2" />
                <input
                  type="text"
                  placeholder="Cari pengguna berdasarkan nama atau email..."
                  className="w-full text-xs font-semibold bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Budi Santoso', email: 'budi@moreai.id', role: 'Pengguna Pro', status: 'Aktif', credits: '2.500' },
                { name: 'Siti Rahma', email: 'siti@moreai.id', role: 'Pengguna Free', status: 'Aktif', credits: '100' },
                { name: 'Andi Pratama', email: 'andi@moreai.id', role: 'Business Owner', status: 'Aktif', credits: '14.800' },
                { name: 'Dewi Lestari', email: 'dewi@moreai.id', role: 'Partner Operator', status: 'Pending', credits: '0' },
                { name: 'Rizky Maulana', email: 'rizky@moreai.id', role: 'Pengguna Free', status: 'Aktif', credits: '450' },
              ].map((user, idx) => (
                <div key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D9D5FF] border border-[#171717] flex items-center justify-center font-bold text-xs neo-shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black">{user.name}</p>
                      <p className="text-[10px] text-gray-500">{user.email} · {user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                      {user.credits} Cr
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[#171717] ${user.status === 'Aktif' ? 'bg-[#C9F2D5]' : 'bg-[#FBE7B2]'}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. TAB: AI ENGINE & MODEL ROUTER */}
        {activeTab === 'engine' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black">AI Engine & Model Router</h2>
              <p className="text-xs text-gray-500">Konfigurasi load balancing, fallback routing, dan kuota provider LLM.</p>
            </div>

            <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-500">Strategi Routing Otomatis</h3>
              <div className="space-y-2">
                {[
                  { title: 'Otomatis (Rekomendasi)', desc: 'Pilih model cerdas berdasarkan kompleksitas prompt dan beban server' },
                  { title: 'Prioritas Biaya Rendah', desc: 'Gunakan model hemat kuota (Gemini Flash / GPT-4o-mini)' },
                  { title: 'Prioritas Kualitas Maksimal', desc: 'Gunakan frontier model terbaik (Claude 3.5 Sonnet / GPT-4o)' },
                ].map((strat, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input type="radio" name="routing" defaultChecked={idx === 0} className="mt-1" />
                    <div>
                      <p className="text-xs font-black">{strat.title}</p>
                      <p className="text-[10px] text-gray-500">{strat.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-2">
              <h3 className="text-xs font-black uppercase text-gray-500 mb-2">Daftar Provider & Model Aktif</h3>
              {[
                { name: 'Google Cloud Vertex / GenAI', models: 'Gemini 2.5 Flash, Gemini 1.5 Pro', active: true },
                { name: 'OpenAI API Gateway', models: 'GPT-4o, GPT-4o-mini', active: true },
                { name: 'Anthropic Claude Engine', models: 'Claude 3.5 Sonnet, Claude 3 Haiku', active: true },
              ].map((prov, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black">{prov.name}</p>
                    <p className="text-[10px] text-gray-500">{prov.models}</p>
                  </div>
                  <span className="text-[10px] font-black bg-[#C9F2D5] px-2 py-0.5 rounded-full border border-[#171717]">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. TAB: MANAJEMEN AGENT */}
        {activeTab === 'agents' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Manajemen Agent</h2>
                <p className="text-xs text-gray-500">Buat, kelola, dan publikasikan AI Agent ke marketplace pengguna.</p>
              </div>
              <button
                onClick={() => setShowAddAgentModal(true)}
                className="neo-btn bg-[#C9F2D5] px-3 py-1.5 text-xs font-black flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Buat Agent</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Research Agent', desc: 'Riset, rangkum, dan analisis informasi dari berbagai sumber.', status: 'Aktif', runs: '124.500 runs' },
                { name: 'Content Creator Agent', desc: 'Buat ide, naskah, dan konten siap publikasi.', status: 'Aktif', runs: '98.200 runs' },
                { name: 'Data Analyst Agent', desc: 'Analisis data, buat insight, dan visualisasi.', status: 'Aktif', runs: '76.400 runs' },
                { name: 'Image Creator Agent', desc: 'Buat gambar dari teks (text-to-image).', status: 'Aktif', runs: '54.100 runs' },
                { name: 'Document Builder', desc: 'Buat dokumen, laporan, dan presentasi PDF.', status: 'Draft', runs: '0 runs' },
              ].map((ag, idx) => (
                <div key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black">{ag.name}</h4>
                    <p className="text-[10px] text-gray-500">{ag.desc}</p>
                    <span className="text-[9px] font-mono text-gray-400 mt-0.5 block">{ag.runs}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[#171717] ${ag.status === 'Aktif' ? 'bg-[#C9F2D5]' : 'bg-[#FBE7B2]'}`}>
                    {ag.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. TAB: TOOLS REGISTRY */}
        {activeTab === 'tools' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Tools Registry</h2>
                <p className="text-xs text-gray-500">Kelola izin dan integrasi alat eksekusi yang dipanggil oleh AI Agent.</p>
              </div>
              <button
                onClick={() => setShowAddToolModal(true)}
                className="neo-btn bg-[#C9F2D5] px-3 py-1.5 text-xs font-black flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Tool</span>
              </button>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Web Browser Tool', desc: 'Jelajahi web & ambil informasi real-time.', env: 'Browser Worker', status: 'Aktif' },
                { name: 'File Analyzer', desc: 'Baca dan analisis PDF, DOCX, XLSX, dan lainnya.', env: 'Storage & Parser', status: 'Aktif' },
                { name: 'Python Runner Sandbox', desc: 'Jalankan kode Python untuk analisis & otomasi.', env: 'Isolated Container', status: 'Aktif' },
                { name: 'Document Builder', desc: 'Buat dokumen, laporan, dan presentasi PDF.', env: 'PDF Generator', status: 'Aktif' },
              ].map((tl, idx) => (
                <div key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black">{tl.name}</h4>
                    <p className="text-[10px] text-gray-500">{tl.desc}</p>
                    <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 block">Env: {tl.env}</span>
                  </div>
                  <span className="text-[10px] font-black bg-[#C9F2D5] px-2 py-0.5 rounded-full border border-[#171717]">
                    {tl.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TAB: CREDIT & BILLING */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black">Credit & Billing Explorer</h2>
              <p className="text-xs text-gray-500">Kelola buku kas kredit AI, alokasi paket, dan riwayat transaksi platform.</p>
            </div>

            {/* Total AI Credit Card */}
            <div className="neo-card p-4 bg-[#FBE7B2] text-[#171717]">
              <span className="text-[10px] font-bold uppercase tracking-wider block">Total AI Credit Beredar</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono">98.600.000</span>
                <span className="text-xs font-bold text-emerald-800">↑ +18,7%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="neo-card p-2.5 bg-white dark:bg-[#232522] text-center">
                <span className="text-[10px] text-gray-500 font-bold block">Top Up Credit</span>
                <span className="text-sm font-black font-mono">Rp 480M</span>
              </div>
              <div className="neo-card p-2.5 bg-white dark:bg-[#232522] text-center">
                <span className="text-[10px] text-gray-500 font-bold block">Alokasi Mitra</span>
                <span className="text-sm font-black font-mono">21.5M Cr</span>
              </div>
              <div className="neo-card p-2.5 bg-white dark:bg-[#232522] text-center">
                <span className="text-[10px] text-gray-500 font-bold block">Harga & Paket</span>
                <span className="text-sm font-black font-mono">3 Paket</span>
              </div>
              <div className="neo-card p-2.5 bg-white dark:bg-[#232522] text-center">
                <span className="text-[10px] text-gray-500 font-bold block">Transaksi</span>
                <span className="text-sm font-black font-mono">48.200 Tx</span>
              </div>
            </div>

            {/* Penggunaan 7 hari */}
            <div className="neo-card p-3.5 bg-white dark:bg-[#232522]">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-black">Penggunaan (7 hari terakhir)</span>
                <span className="font-mono font-bold text-gray-500">78.400.000 / 100.000.000 (78%)</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full border border-[#171717] overflow-hidden">
                <div className="h-full bg-[#C9F2D5]" style={{ width: '78%' }} />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">Chat AI</span>
                  <span className="font-mono font-black">34.200.000</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">AI Agents</span>
                  <span className="font-mono font-black">28.500.000</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Tools</span>
                  <span className="font-mono font-black">15.700.000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. TAB: SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Subscriptions Management</h2>
                <p className="text-xs text-gray-500">Kelola paket berlangganan dan benefit pengguna MoreAI.</p>
              </div>
              <button className="neo-btn bg-[#C9F2D5] px-3 py-1.5 text-xs font-black">
                + Kelola Paket
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="neo-card p-3.5 bg-white dark:bg-[#232522] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black">Paket Free</h4>
                  <span className="text-[9px] bg-[#C9F2D5] px-1.5 py-0.2 rounded font-bold border border-[#171717]">Aktif</span>
                </div>
                <p className="text-base font-black font-mono">Rp 0</p>
                <p className="text-[11px] text-gray-500">• 100 credit / 6 jam<br/>• Fitur dasar</p>
              </div>

              <div className="neo-card p-3.5 bg-[#C9F2D5] text-[#171717] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black">Paket Pro</h4>
                  <span className="text-[9px] bg-[#FBE7B2] px-1.5 py-0.2 rounded font-black border border-[#171717]">Populer</span>
                </div>
                <p className="text-base font-black font-mono">Rp 49.000/bln</p>
                <p className="text-[11px] text-gray-800 font-medium">• Credit lebih besar (5.000)<br/>• Semua fitur AI & Tools</p>
              </div>

              <div className="neo-card p-3.5 bg-[#D9D5FF] text-[#171717] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black">Paket Business</h4>
                  <span className="text-[9px] bg-white px-1.5 py-0.2 rounded font-bold border border-[#171717]">Tim</span>
                </div>
                <p className="text-base font-black font-mono">Rp 149.000/bln</p>
                <p className="text-[11px] text-gray-800 font-medium">• Untuk tim & organisasi<br/>• Kolaborasi tim & kuota</p>
              </div>
            </div>
          </div>
        )}

        {/* 8. TAB: NETWORK PARTNERSHIP */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Network Partnership Hub</h2>
                <p className="text-xs text-gray-500">Kelola kerja sama jaringan, lokasi, dan metode akses Wi-Fi.</p>
              </div>
              <button className="neo-btn bg-[#C9F2D5] px-3 py-1.5 text-xs font-black">
                + Tambah Lokasi
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="neo-card p-3.5 bg-white dark:bg-[#232522]">
                <span className="text-[10px] font-bold text-gray-500 block">Lokasi Mitra</span>
                <span className="text-xl font-black font-mono">4.328</span>
              </div>
              <div className="neo-card p-3.5 bg-[#D8ECFF] text-[#171717]">
                <span className="text-[10px] font-bold text-blue-900 block">Pengguna Akses</span>
                <span className="text-xl font-black font-mono">1.284.320</span>
              </div>
            </div>

            {/* Provider ISP Management from Image 1 */}
            <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-gray-500">Provider ISP Mitra Nasional</h3>
                <span className="text-[10px] font-bold bg-[#C9F2D5] px-2 py-0.5 rounded-full border border-[#171717]">12 ISP</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'XLHome', desc: 'ISP Nasional Serat Optik', status: 'Aktif' },
                  { name: 'IndiHome', desc: 'Telkom Indonesia Consumer Network', status: 'Aktif' },
                  { name: 'Biznet', desc: 'ISP Bisnis & Hospitality', status: 'Aktif' },
                  { name: 'MyRepublic', desc: 'ISP Kecepatan Tinggi Residensial', status: 'Aktif' },
                ].map((isp, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black">{isp.name}</p>
                      <p className="text-[10px] text-gray-500">{isp.desc}</p>
                    </div>
                    <span className="text-[9px] font-black bg-[#C9F2D5] px-2 py-0.5 rounded-full border border-[#171717]">
                      {isp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. TAB: METODE VERIFIKASI */}
        {activeTab === 'verification' && (
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-black">Metode Verifikasi Network</h2>
              <p className="text-xs text-gray-500">Pilih dan atur metode aktivasi akses AI di lokasi mitra.</p>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Geo-WiFi (Radius Lokasi)', desc: 'Verifikasi berdasarkan lokasi (geofence) & koneksi WiFi.', active: true },
                { name: 'Captive Portal', desc: 'Autentikasi melalui portal login (MikroTik/Router).', active: true },
                { name: 'RADIUS 802.1X', desc: 'Integrasi dengan RADIUS (Enterprise WiFi).', active: false },
                { name: 'Gateway Connector', desc: 'Integrasi via API / gateway vendor router.', active: false },
                { name: 'Integrasi ISP', desc: 'Kerja sama dengan provider pusat (ISP).', active: false },
              ].map((m, idx) => (
                <div key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black">{m.name}</h4>
                    <p className="text-[10px] text-gray-500">{m.desc}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[#171717] ${m.active ? 'bg-[#C9F2D5]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {m.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. TAB: GEO-WIFI (RADIUS) */}
        {activeTab === 'geowifi' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Konfigurasi Geo-WiFi (Radius)</h2>
                <p className="text-xs text-gray-500">Verifikasi akses berdasarkan lokasi geografis (radius).</p>
              </div>
              <input
                type="checkbox"
                checked={geoEnabled}
                onChange={(e) => setGeoEnabled(e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>

            <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-4">
              <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-[#171717] relative flex items-center justify-center overflow-hidden">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-emerald-600/60 bg-emerald-400/20 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-700 bg-emerald-500/40 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-700 border-2 border-white shadow-md flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-3 bg-white/90 dark:bg-black/80 px-2.5 py-1 rounded-lg border border-[#171717] text-[10px] font-bold">
                  Radius: {geoRadius} Meter
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1">Lokasi Mitra</label>
                  <input
                    type="text"
                    defaultValue="Cafe MoreAI Kemang"
                    className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold block mb-1">Koordinat</label>
                  <input
                    type="text"
                    defaultValue="-6.2615, 106.8106"
                    className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>Radius Akses</span>
                  <span className="font-mono">{geoRadius} Meter</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={geoRadius}
                  onChange={(e) => setGeoRadius(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <button
                onClick={handleSave}
                className="neo-btn bg-[#C9F2D5] px-4 py-2 text-xs font-black flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        )}

        {/* 11. TAB: CAPTIVE PORTAL */}
        {activeTab === 'captive' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Captive Portal</h2>
                <p className="text-xs text-gray-500">Gunakan portal login MoreAI melalui router (mis. MikroTik).</p>
              </div>
              <input
                type="checkbox"
                checked={captiveEnabled}
                onChange={(e) => setCaptiveEnabled(e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>

            <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1">Gateway</label>
                  <select className="w-full text-xs font-bold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl">
                    <option>MikroTik</option>
                    <option>UniFi</option>
                    <option>Cisco Meraki</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold block mb-1">Mode Autentikasi</label>
                  <select className="w-full text-xs font-bold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl">
                    <option>Login MoreAI (Akun / Kode Akses)</option>
                    <option>Kode Akses Voucher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1">Redirect Setelah Login</label>
                <input
                  type="text"
                  defaultValue="Aplikasi MoreAI"
                  className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl"
                />
              </div>

              <button
                onClick={handleSave}
                className="neo-btn bg-[#C9F2D5] px-4 py-2 text-xs font-black flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        )}

        {/* 12. TAB: RADIUS */}
        {activeTab === 'radius' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">RADIUS Server Configuration</h2>
                <p className="text-xs text-gray-500">Gunakan server RADIUS untuk autentikasi kampus / enterprise.</p>
              </div>
              <input
                type="checkbox"
                checked={radiusEnabled}
                onChange={(e) => setRadiusEnabled(e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>

            <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1">RADIUS Server</label>
                  <input
                    type="text"
                    defaultValue="radius.moreai.id"
                    className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold block mb-1">Port</label>
                  <input
                    type="text"
                    defaultValue="1812"
                    className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1">Shared Secret</label>
                <input
                  type="password"
                  defaultValue="secret12345678"
                  className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Status: Terhubung</span>
                </span>
                <button
                  onClick={handleSave}
                  className="neo-btn bg-[#C9F2D5] px-4 py-2 text-xs font-black"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 13. TAB: INTEGRASI ISP */}
        {activeTab === 'isp' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Integrasi ISP</h2>
                <p className="text-xs text-gray-500">Verifikasi akses melalui API provider pusat.</p>
              </div>
              <input
                type="checkbox"
                checked={ispEnabled}
                onChange={(e) => setIspEnabled(e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>

            <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-3">
              <div>
                <label className="text-[11px] font-bold block mb-1">Provider ISP</label>
                <select className="w-full text-xs font-bold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl">
                  <option>XL-Home</option>
                  <option>IndiHome</option>
                  <option>Biznet</option>
                  <option>MyRepublic</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1">API Endpoint</label>
                <input
                  type="text"
                  defaultValue="https://api.xlhome.co.id"
                  className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1">API Key</label>
                <input
                  type="password"
                  defaultValue="apikey_secure_live_98124"
                  className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#171717] rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Status: Terhubung</span>
                </span>
                <button
                  onClick={handleSave}
                  className="neo-btn bg-[#C9F2D5] px-4 py-2 text-xs font-black"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 14. TAB: CAMPAIGN */}
        {activeTab === 'campaign' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Campaign & Program Reward</h2>
                <p className="text-xs text-gray-500">Buat campaign, kode akses, dan program reward untuk pelanggan mitra.</p>
              </div>
              <button
                onClick={() => setShowAddCampaignModal(true)}
                className="neo-btn bg-[#C9F2D5] px-3 py-1.5 text-xs font-black"
              >
                + Buat Campaign Baru
              </button>
            </div>

            <div className="neo-card p-4 bg-[#FBE7B2] text-[#171717]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black">Promo Ngopi & AI</h4>
                  <p className="text-xs text-gray-800">Free 2.000 credit untuk setiap pelanggan · Berlaku s/d 31 Jan 2026</p>
                </div>
                <span className="text-[10px] font-black bg-[#C9F2D5] px-2 py-0.5 rounded-full border border-[#171717]">Aktif</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-white dark:bg-[#232522] border-2 border-[#171717] text-center">
                <span className="text-xs font-black block">Daftar Campaign</span>
                <span className="text-[10px] text-gray-500">8 Program Aktif</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#232522] border-2 border-[#171717] text-center">
                <span className="text-xs font-black block">Kode Akses</span>
                <span className="text-[10px] text-gray-500">12.000 Tergenerate</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#232522] border-2 border-[#171717] text-center">
                <span className="text-xs font-black block">Reward & Benefit</span>
                <span className="text-[10px] text-gray-500">Aturan Klaim</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#232522] border-2 border-[#171717] text-center">
                <span className="text-xs font-black block">Laporan Campaign</span>
                <span className="text-[10px] text-gray-500">Analitik Konversi</span>
              </div>
            </div>
          </div>
        )}

        {/* 15. TAB: ANALYTICS & LAPORAN */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Analytics & Laporan Ekosistem</h2>
                <p className="text-xs text-gray-500">Statistik performa, konsumsi credit, dan data kunjungan mitra.</p>
              </div>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-[#171717]">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAnalyticsPeriod(p)}
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${analyticsPeriod === p ? 'bg-white dark:bg-black font-black border border-[#171717]' : 'text-gray-500'}`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="neo-card p-3 bg-white dark:bg-[#232522]">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Pengguna Aktif</span>
                <span className="text-2xl font-black font-mono">248.320</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">↑ +12,4%</span>
              </div>
              <div className="neo-card p-3 bg-[#FBE7B2] text-[#171717]">
                <span className="text-[10px] text-amber-900 block uppercase font-bold">Konsumsi Credit</span>
                <span className="text-2xl font-black font-mono">78,4M</span>
                <span className="text-[10px] text-amber-900 font-bold block mt-0.5">↑ +18,7%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button className="neo-btn bg-white dark:bg-[#232522] p-2.5 text-center text-xs font-black">
                Laporan Penggunaan AI
              </button>
              <button className="neo-btn bg-white dark:bg-[#232522] p-2.5 text-center text-xs font-black">
                Laporan Mitra & Lokasi
              </button>
              <button className="neo-btn bg-white dark:bg-[#232522] p-2.5 text-center text-xs font-black">
                Laporan Campaign
              </button>
              <button className="neo-btn bg-[#C9F2D5] text-[#171717] p-2.5 text-center text-xs font-black flex items-center justify-center gap-1">
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor (CSV / XLSX)</span>
              </button>
            </div>
          </div>
        )}

        {/* 16. TAB: AUDIT & LOG */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Audit & Log Keamanan</h2>
                <p className="text-xs text-gray-500">Riwayat aktivitas sistem, perubahan konfigurasi, dan keamanan.</p>
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {(['semua', 'sistem', 'pengguna', 'mitra'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setAuditFilter(f)}
                  className={`px-3 py-1 rounded-xl text-xs font-black capitalize border border-[#171717] ${auditFilter === f ? 'bg-[#171717] text-white' : 'bg-white dark:bg-gray-800'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {[
                { title: 'Perubahan konfigurasi', desc: 'Metode verifikasi Geo-WiFi diperbarui', time: 'Hari ini, 10:24', cat: 'sistem' },
                { title: 'Login Super Admin', desc: 'admin@moreai.id (IP: 103.28.12.9)', time: 'Hari ini, 09:12', cat: 'sistem' },
                { title: 'Penambahan mitra baru', desc: 'Cafe MoreAI Kemang terdaftar', time: 'Kemarin, 15:30', cat: 'mitra' },
                { title: 'Update campaign promo', desc: 'Promo Ngopi & AI diperpanjang', time: 'Kemarin, 11:05', cat: 'mitra' },
              ].map((log, idx) => (
                <div key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black">{log.title}</h4>
                    <p className="text-[10px] text-gray-500">{log.desc}</p>
                    <span className="text-[9px] font-mono text-gray-400 mt-0.5 block">{log.time}</span>
                  </div>
                  <span className="text-[9px] font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border">
                    {log.cat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 17. TAB: PENGATURAN SISTEM */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-black">Pengaturan Sistem</h2>
              <p className="text-xs text-gray-500">Konfigurasi tata kelola platform, keamanan, dan integrasi API.</p>
            </div>

            <div className="space-y-2">
              {[
                { title: 'Profil Organisasi', desc: 'MoreAI Platform & Legal entity' },
                { title: 'Akses & Peran (RBAC)', desc: 'Kelola role SuperAdmin, Finance, Partner Manager' },
                { title: 'Konfigurasi API & Rate Limit', desc: 'API key, rate limit, dan integrasi FastAPI' },
                { title: 'Keamanan Platform', desc: '2FA, IP allowlist, dan kebijakan session timeout' },
                { title: 'Notifikasi Sistem', desc: 'Email, push alert, dan webhook' },
                { title: 'Preferensi Sistem', desc: 'Bahasa, zona waktu (WIB), dan tema' },
                { title: 'Tentang Sistem', desc: 'Versi 1.0, lisensi MIT, dan status layanan' },
              ].map((s, idx) => (
                <div key={idx} className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div>
                    <h4 className="text-xs font-black">{s.title}</h4>
                    <p className="text-[10px] text-gray-500">{s.desc}</p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: TAMBAH USER */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-5 neo-shadow-lg">
              <h3 className="font-black text-sm mb-2">Tambah Pengguna Baru</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold block mb-1">Nama</label>
                  <input type="text" placeholder="Nama pengguna" className="w-full p-2 bg-white rounded-xl border border-[#171717]" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Email</label>
                  <input type="email" placeholder="user@moreai.id" className="w-full p-2 bg-white rounded-xl border border-[#171717]" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Peran</label>
                  <select className="w-full p-2 bg-white rounded-xl border border-[#171717]">
                    <option>Pengguna Free</option>
                    <option>Pengguna Pro</option>
                    <option>Partner Manager</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAddUserModal(false)} className="flex-1 py-1.5 rounded-xl border border-[#171717] bg-white">Batal</button>
                <button onClick={() => { setShowAddUserModal(false); handleSave(); }} className="flex-1 neo-btn bg-[#C9F2D5] py-1.5 font-black text-xs">Simpan</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TAMBAH AGENT */}
        {showAddAgentModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-5 neo-shadow-lg">
              <h3 className="font-black text-sm mb-2">Buat Agent AI Baru</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold block mb-1">Nama Agent</label>
                  <input type="text" placeholder="mis. Coding Specialist Agent" className="w-full p-2 bg-white rounded-xl border border-[#171717]" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Kategori</label>
                  <select className="w-full p-2 bg-white rounded-xl border border-[#171717]">
                    <option>Produktivitas</option>
                    <option>Kreatif</option>
                    <option>Bisnis</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">System Prompt Instruksi</label>
                  <textarea rows={3} placeholder="Instruksi spesialisasi tugas..." className="w-full p-2 bg-white rounded-xl border border-[#171717]" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAddAgentModal(false)} className="flex-1 py-1.5 rounded-xl border border-[#171717] bg-white">Batal</button>
                <button onClick={() => { setShowAddAgentModal(false); handleSave(); }} className="flex-1 neo-btn bg-[#C9F2D5] py-1.5 font-black text-xs">Publikasikan</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TAMBAH TOOL */}
        {showAddToolModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-5 neo-shadow-lg">
              <h3 className="font-black text-sm mb-2">Daftarkan Tool Baru</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold block mb-1">Nama Tool</label>
                  <input type="text" placeholder="mis. SQL Query Runner" className="w-full p-2 bg-white rounded-xl border border-[#171717]" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Environment Eksekusi</label>
                  <select className="w-full p-2 bg-white rounded-xl border border-[#171717]">
                    <option>Python Sandbox Container</option>
                    <option>Isolated Browser Worker</option>
                    <option>API Webhook Adapter</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAddToolModal(false)} className="flex-1 py-1.5 rounded-xl border border-[#171717] bg-white">Batal</button>
                <button onClick={() => { setShowAddToolModal(false); handleSave(); }} className="flex-1 neo-btn bg-[#C9F2D5] py-1.5 font-black text-xs">Simpan Tool</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TAMBAH CAMPAIGN */}
        {showAddCampaignModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-5 neo-shadow-lg">
              <h3 className="font-black text-sm mb-2">Buat Program Campaign</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold block mb-1">Nama Campaign</label>
                  <input type="text" placeholder="mis. Promo Ramadhan AI" className="w-full p-2 bg-white rounded-xl border border-[#171717]" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Bonus Credit</label>
                  <input type="number" defaultValue={2000} className="w-full p-2 bg-white rounded-xl border border-[#171717] font-mono" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Masa Berlaku</label>
                  <input type="date" defaultValue="2026-04-30" className="w-full p-2 bg-white rounded-xl border border-[#171717]" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAddCampaignModal(false)} className="flex-1 py-1.5 rounded-xl border border-[#171717] bg-white">Batal</button>
                <button onClick={() => { setShowAddCampaignModal(false); handleSave(); }} className="flex-1 neo-btn bg-[#C9F2D5] py-1.5 font-black text-xs">Aktifkan Campaign</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
