'use client';

import React, { useState } from 'react';
import {
  Bot,
  Search,
  Sparkles,
  ArrowRight,
  Plus,
  BookOpen,
  PenTool,
  BarChart3,
  Image as ImageIcon,
  FileText,
  Code2,
  X,
  Workflow,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';

interface ClientAgentsProps {
  onSelectAgent: (agentName: string, defaultPrompt: string, mode?: 'chat' | 'workflow') => void;
}

export const ClientAgents: React.FC<ClientAgentsProps> = ({ onSelectAgent }) => {
  const [activeCategory, setActiveCategory] = useState<'semua' | 'produktivitas' | 'kreatif' | 'bisnis'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingAgent, setInspectingAgent] = useState<any | null>(null);

  const agents = [
    {
      id: 'research',
      name: 'Research Agent',
      category: 'produktivitas',
      desc: 'Riset, rangkum, dan analisis informasi dari berbagai sumber web dan dokumen ilmiah.',
      longDesc: 'Didesain khusus untuk menggali fakta terverifikasi, mengekstrak data dari sumber multi-domain, dan menyusun laporan sintesis yang obyektif dengan sitasi jelas.',
      tags: ['Riset', 'Analisis', 'Fakta'],
      icon: BookOpen,
      color: 'bg-[#D9D5FF]',
      accentColor: 'border-[#171717]',
      creditCost: 30,
      modelEngine: 'MoreAI F.01 Pro (Grounded Search)',
      attachedTools: ['Google Search Connector', 'Web Browser Tool', 'File Analyzer'],
      recipes: [
        'Tolong riset komprehensif mengenai strategi adopsi AI di sektor UMKM tahun 2026.',
        'Bandingkan 3 model bisnis kedai kopi specialty di Jakarta Selatan.',
        'Analisis regulasi perlindungan data pribadi untuk platform loyalty pelanggan.',
      ],
      defaultPrompt: 'Tolong riset komprehensif mengenai strategi adopsi AI di sektor UMKM tahun 2026.',
    },
    {
      id: 'content',
      name: 'Content Creator Agent',
      category: 'kreatif',
      desc: 'Buat ide, naskah video pendek, copy iklan, dan konten media sosial yang siap publikasi.',
      longDesc: 'Membantu marketer dan kreator merancang konsep kreatif, script Reels/TikTok berdurasi 30-60 detik, caption Instagram engaging, dan newsletter mingguan.',
      tags: ['Konten', 'Sosial Media', 'Copywriting'],
      icon: PenTool,
      color: 'bg-[#F9D8E5]',
      accentColor: 'border-[#171717]',
      creditCost: 25,
      modelEngine: 'MoreAI F.01 Creative Speed',
      attachedTools: ['Document Builder', 'Web Browser Tool'],
      recipes: [
        'Buatkan kalender konten 1 bulan untuk akun Instagram kafe estetik.',
        'Tulis 5 hook video Reels viral untuk promosi kopi susu gula aren.',
        'Rancang copy iklan Meta Ads dengan pendekatan storytelling emosional.',
      ],
      defaultPrompt: 'Buatkan kalender konten 1 bulan untuk akun Instagram kafe estetik.',
    },
    {
      id: 'data',
      name: 'Data Analyst Agent',
      category: 'bisnis',
      desc: 'Analisis data mentah, visualisasi insight angka, dan hitung proyeksi metrik bisnis.',
      longDesc: 'Memproses dataset CSV/Excel, menemukan anomali penjualan, menghitung cohort retention, dan memberikan rekomendasi aksi nyata berbasis angka.',
      tags: ['Data', 'Laporan', 'Insight'],
      icon: BarChart3,
      color: 'bg-[#C9F2D5]',
      accentColor: 'border-[#171717]',
      creditCost: 35,
      modelEngine: 'MoreAI F.01 Pro (Reasoning)',
      attachedTools: ['Python Runner Sandbox', 'File Analyzer', 'Document Builder'],
      recipes: [
        'Analisis data retensi pengguna dan rekomendasikan strategi penurunan churn rate.',
        'Hitung proyeksi pendapatan kafe jika menambah cabang baru di Bogor.',
        'Identifikasi produk dengan margin kontribusi tertinggi dari data penjualan.',
      ],
      defaultPrompt: 'Analisis data retensi pengguna dan rekomendasikan strategi penurunan churn rate.',
    },
    {
      id: 'image',
      name: 'Image Creator Agent',
      category: 'kreatif',
      desc: 'Deskripsikan dan render prompt gambar berkualitas tinggi dengan berbagai gaya artistik.',
      longDesc: 'Mengubah ide abstrak menjadi prompt visual detail, konsep ilustrasi neo-brutalisme, asset banner promo, dan palet warna brand.',
      tags: ['Gambar', 'Desain', 'Visual'],
      icon: ImageIcon,
      color: 'bg-[#FBE7B2]',
      accentColor: 'border-[#171717]',
      creditCost: 40,
      modelEngine: 'MoreAI F.01 Vision & Image',
      attachedTools: ['Image Processing Engine', 'Document Builder'],
      recipes: [
        'Buatkan konsep visual prompt untuk robot barista MoreAI bergaya neo-brutalism.',
        'Rancang ilustrasi kemasan biji kopi single origin Flores Bajawa.',
        'Buat panduan palet warna pastel playful untuk aplikasi mobile.',
      ],
      defaultPrompt: 'Buatkan konsep visual prompt untuk robot barista MoreAI bergaya neo-brutalism.',
    },
    {
      id: 'document',
      name: 'Document Builder Agent',
      category: 'produktivitas',
      desc: 'Buat dokumen terstruktur, proposal penawaran, SOP operasional, dan presentasi PDF.',
      longDesc: 'Menyusun berkas bisnis resmi, draft perjanjian kerja sama, dokumen SOP pembukaan outlet, dan format presentasi terstandar.',
      tags: ['Dokumen', 'Proposal', 'PDF'],
      icon: FileText,
      color: 'bg-[#D8ECFF]',
      accentColor: 'border-[#171717]',
      creditCost: 25,
      modelEngine: 'MoreAI F.01 Document Engine',
      attachedTools: ['Document Builder', 'File Analyzer'],
      recipes: [
        'Susun dokumen SOP pelayanan tamu kafe untuk standarisasi cabang baru.',
        'Buatkan draft proposal penawaran paket catering kopi untuk kantor korporat.',
        'Rancang perjanjian kerahasiaan data (NDA) sederhana dalam Bahasa Indonesia.',
      ],
      defaultPrompt: 'Susun dokumen SOP pelayanan tamu kafe untuk standarisasi cabang baru.',
    },
    {
      id: 'automation',
      name: 'Code & Automation Agent',
      category: 'bisnis',
      desc: 'Bantu penulisan script Python, otomasi pengolahan file, dan integrasi workflow API.',
      longDesc: 'Membangun script otomasi data, scraper etis, cron job penjadwalan, dan integrasi webhook antar layanan digital.',
      tags: ['Python', 'Otomasi', 'API'],
      icon: Code2,
      color: 'bg-[#FFDCCB]',
      accentColor: 'border-[#171717]',
      creditCost: 30,
      modelEngine: 'MoreAI F.01 Code Execution',
      attachedTools: ['Python Runner Sandbox', 'Web Browser Tool'],
      recipes: [
        'Buat script Python untuk memfilter data transaksi penjualan harian.',
        'Tulis kode parser format struk kasir menjadi JSON terstruktur.',
        'Buat skrip pengingat otomatis via webhook saat stok barang menipis.',
      ],
      defaultPrompt: 'Buat script Python untuk memfilter data transaksi penjualan harian.',
    },
  ];

  const filteredAgents = agents.filter((agent) => {
    const matchesCategory =
      activeCategory === 'semua' || agent.category === activeCategory;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-3.5 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Title & Search Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-700" />
            <span>AI Agents Marketplace</span>
          </h1>
          <span className="text-[10px] font-extrabold bg-[#C9F2D5] text-[#171717] px-2 py-0.5 rounded-full border border-[#171717]">
            {filteredAgents.length} Agent
          </span>
        </div>

        {/* Search Input */}
        <div className="neo-card p-1.5 bg-white dark:bg-[#232522] flex items-center gap-2 border-2 border-[#171717]">
          <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari agent berdasarkan kemampuan..."
            className="w-full text-xs font-semibold px-1 py-1 bg-transparent border-none outline-none text-[#171717] dark:text-[#F7F4EC] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(['semua', 'produktivitas', 'kreatif', 'bisnis'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize whitespace-nowrap transition border-2 border-[#171717] neo-shadow-sm ${
              activeCategory === cat
                ? 'bg-[#171717] text-white'
                : 'bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agents List */}
      <div className="space-y-3">
        {filteredAgents.map((agent) => {
          const Icon = agent.icon;

          return (
            <div
              key={agent.id}
              onClick={() => setInspectingAgent(agent)}
              className="neo-card p-3.5 bg-white dark:bg-[#232522] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-2xl ${agent.color} border-2 border-[#171717] flex items-center justify-center shrink-0 neo-shadow-sm`}
                  >
                    <Icon className="w-5 h-5 text-[#171717]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#171717] dark:text-[#F7F4EC] leading-tight">
                      {agent.name}
                    </h3>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                      {agent.desc}
                    </p>
                  </div>
                </div>

                {/* Quick Inspect Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectingAgent(agent);
                  }}
                  className="w-8 h-8 rounded-xl bg-[#C9F2D5] hover:bg-[#b2f0c1] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center shrink-0 active:translate-x-[1px] active:translate-y-[1px]"
                  title={`Detail ${agent.name}`}
                >
                  <Plus className="w-4 h-4 text-[#171717]" />
                </button>
              </div>

              {/* Tags & Action row */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="text-[11px] font-black text-[#171717] dark:text-[#C9F2D5] hover:underline flex items-center gap-1">
                  <span>Lihat Profil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Detail & Capability Inspector Drawer */}
      {inspectingAgent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-4 sm:p-5 neo-shadow-xl animate-in slide-in-from-bottom max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b-2 border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl ${inspectingAgent.color} border-2 border-[#171717] neo-shadow-sm flex items-center justify-center shrink-0`}
                >
                  {React.createElement(inspectingAgent.icon, {
                    className: 'w-6 h-6 text-[#171717]',
                  })}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#171717] dark:text-[#F7F4EC]">
                    {inspectingAgent.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-gray-500">
                      {inspectingAgent.creditCost} Credit / Task
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-900 px-1.5 py-0.2 rounded border border-indigo-400 font-bold">
                      {inspectingAgent.category}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectingAgent(null)}
                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-gray-600 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {inspectingAgent.longDesc}
            </p>

            {/* Technical Spec Box */}
            <div className="p-3 bg-white dark:bg-[#232522] border-2 border-[#171717] rounded-2xl mb-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-500 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Model Engine:</span>
                </span>
                <span className="font-mono font-black text-[#171717] dark:text-[#F7F4EC]">
                  {inspectingAgent.modelEngine}
                </span>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-1.5">
                <span className="font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tools Terintegrasi:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {inspectingAgent.attachedTools.map((t: string) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D8ECFF] text-blue-900 border border-blue-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Prompt Recipes / Quick Starts */}
            <div className="mb-4">
              <label className="text-[11px] font-black text-gray-700 dark:text-gray-300 block mb-1.5">
                Contoh Instruksi / Prompt Recipe:
              </label>
              <div className="space-y-1.5">
                {inspectingAgent.recipes.map((recipe: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSelectAgent(inspectingAgent.name, recipe, 'chat');
                      setInspectingAgent(null);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-[#C9F2D5]/30 border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200 transition flex items-center justify-between group"
                  >
                    <span className="line-clamp-1 flex-1 pr-2">&ldquo;{recipe}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-black shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectAgent(inspectingAgent.name, inspectingAgent.defaultPrompt, 'chat');
                  setInspectingAgent(null);
                }}
                className="neo-btn bg-[#C9F2D5] hover:bg-[#b2f0c1] text-[#171717] py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                <span>Mulai Chat AI</span>
              </button>

              <button
                onClick={() => {
                  onSelectAgent(inspectingAgent.name, inspectingAgent.defaultPrompt, 'workflow');
                  setInspectingAgent(null);
                }}
                className="neo-btn bg-[#D9D5FF] hover:bg-[#c9c4ff] text-[#171717] py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Workflow className="w-3.5 h-3.5 text-indigo-700" />
                <span>Workflow Otonom</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
