'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Globe,
  FileSearch,
  Terminal,
  FilePlus,
  Compass,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Code2,
  FileText,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface ClientToolsProps {
  onUseTool?: (toolName: string, initialPrompt?: string) => void;
}

export const ClientTools: React.FC<ClientToolsProps> = ({ onUseTool }) => {
  const [activeTab, setActiveTab] = useState<'semua' | 'dokumen' | 'media' | 'data'>('semua');
  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Tool specific test input state
  const [toolInputs, setToolInputs] = useState<Record<string, string>>({
    browser: 'https://kompas.id/tren-ekonomi-kopi-2026',
    file_analyzer: 'Laporan_Keuangan_Kafe_Q1_2026.xlsx',
    python_runner: "import math\n\ndef calculate_roi(invest, revenue):\n    return ((revenue - invest) / invest) * 100\n\nroi = calculate_roi(15000000, 24500000)\nprint(f'Proyeksi ROI: {roi:.2f}%')",
    document_builder: 'Proposal Kemitraan Co-Working & Kafe MoreAI',
    search_connector: 'Prediksi tren konsumsi kopi specialty Indonesia 2026',
    image_engine: 'Analisis visual layout poster promosi promo weekend',
  });

  const tools = [
    {
      id: 'browser',
      name: 'Web Browser Tool',
      category: 'data',
      desc: 'Jelajahi web & ambil informasi real-time dari situs publik secara otomatis.',
      icon: Globe,
      color: 'bg-[#D8ECFF]',
      status: 'Tersedia',
      permissions: 'Read-only web fetch',
      sandboxType: 'Headless Chromium Isolated Container',
      cost: '10 Credit / run',
      sampleOutputs: {
        title: 'Ekstraksi Konten Web Berhasil',
        output: `# Hasil Scraping Web (200 OK)\n**URL:** https://kompas.id/tren-ekonomi-kopi-2026\n\n- Konsumsi kopi specialty naik 24% didorong generasi Z.\n- Konsep hybrid cafe + work hub menjadi preferensi utama.\n- Digital loyalty & AI workspace di kafe meningkatkan repeat visit sebesar 38%.`,
      },
    },
    {
      id: 'file_analyzer',
      name: 'File Analyzer',
      category: 'dokumen',
      desc: 'Baca dan analisis file PDF, DOCX, XLSX, CSV, dan format teks lainnya.',
      icon: FileSearch,
      color: 'bg-[#FBE7B2]',
      status: 'Tersedia',
      permissions: 'Ekstraksi dokumen & teks',
      sandboxType: 'Document Parser & OCR Worker',
      cost: '15 Credit / run',
      sampleOutputs: {
        title: 'Ekstraksi Spreadsheet Selesai',
        output: `## Ringkasan Ekstraksi Data (Laporan_Keuangan_Kafe_Q1_2026.xlsx)\n- Total Revenue: Rp 73.500.000\n- Rata-rata Penjualan Harian: Rp 816.000\n- Produk Terlaris: Iced Aren Latte (38%), Croissant (22%)\n- Rekomendasi: Optimasi stok beans origin Aceh Gayo di weekend.`,
      },
    },
    {
      id: 'python_runner',
      name: 'Python Runner Sandbox',
      category: 'data',
      desc: 'Jalankan script Python dalam lingkungan terisolasi untuk data science dan kalkulasi.',
      icon: Terminal,
      color: 'bg-[#C9F2D5]',
      status: 'Tersedia',
      permissions: 'Isolated ephemeral microVM',
      sandboxType: 'Firecracker MicroVM (Python 3.12, NumPy, Pandas)',
      cost: '20 Credit / run',
      sampleOutputs: {
        title: 'Eksekusi Container Selesai (Exit Code: 0)',
        output: `[Sandbox Container Output]\n====================================\nProyeksi ROI: 63.33%\nEksekusi CPU Time: 0.124s\nMemory Usage: 14.2 MB\nSandbox Status: Cleanly Terminated\n====================================`,
      },
    },
    {
      id: 'document_builder',
      name: 'Document Builder',
      category: 'dokumen',
      desc: 'Kompilasi dan generate dokumen Markdown, laporan terstruktur, dan berkas ekspor.',
      icon: FilePlus,
      color: 'bg-[#D9D5FF]',
      status: 'Tersedia',
      permissions: 'File export & format builder',
      sandboxType: 'PDF & Markdown Engine',
      cost: '15 Credit / run',
      sampleOutputs: {
        title: 'Dokumen Selesai Dibuat',
        output: `# Proposal Kemitraan Co-Working & Kafe MoreAI\n\n**1. Ringkasan Eksekutif**\nMenyediakan fasilitas AI workspace interaktif dengan insentif Free AI Credit bagi pengunjung kafe.\n\n**2. Skema Benefit Mitra**\n- Pertumbuhan pengunjung harian hingga +25%\n- Bagi hasil reward campaign sebesar Rp 250.000 / 1.000 klaim\n- Dashboard monitoring real-time.\n\nDokumen siap diekspor ke PDF / DOCX.`,
      },
    },
    {
      id: 'search_connector',
      name: 'Google Search Connector',
      category: 'data',
      desc: 'Kueri pencarian web dengan perangkingan fakta dan sitasi sumber resmi.',
      icon: Compass,
      color: 'bg-[#FFDCCB]',
      status: 'Tersedia',
      permissions: 'Web grounding engine',
      sandboxType: 'Grounding API Adapter',
      cost: '10 Credit / run',
      sampleOutputs: {
        title: 'Pencarian Web Grounding Selesai',
        output: `1. **Asosiasi Kopi Spesialti Indonesia (2026):** Permintaan biji kopi Arabika lokal diprediksi tumbuh 18% y-o-y.\n2. **Kementerian Perindustrian:** Hilirisasi UMKM kedai kopi modern berkembang pesat di kota lapis kedua.\nSitasi terverifikasi dari 4 domain berita nasional.`,
      },
    },
    {
      id: 'image_engine',
      name: 'Image Processing Engine',
      category: 'media',
      desc: 'Analisis gambar, optical character recognition (OCR), dan manipulasi visual.',
      icon: Sliders,
      color: 'bg-[#F9D8E5]',
      status: 'Tersedia',
      permissions: 'Vision & multimedia parsing',
      sandboxType: 'MoreAI Vision Worker',
      cost: '25 Credit / run',
      sampleOutputs: {
        title: 'Analisis Komposisi Visual Poster',
        output: `- Objek Utama: Cangkir kopi keramik dengan latte art (Fokus tengah)\n- Palet Warna: Warm Pastel Cream (#F7F4EC) dan Dark Roast Brown\n- Keterbacaan Teks: Kontras 8.4:1 (Lulus WCAG AA)\n- Rekomendasi: Perbesar ukuran font penunjuk promo weekend 15%.`,
      },
    },
  ];

  const filtered = tools.filter((t) => {
    const matchCat = activeTab === 'semua' || t.category === activeTab;
    const matchQuery =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleOpenToolDetail = (tool: any) => {
    setSelectedTool(tool);
    setExecutionResult(null);
  };

  const handleRunToolTest = () => {
    if (!selectedTool) return;
    setIsExecuting(true);
    setExecutionResult(null);

    setTimeout(() => {
      setIsExecuting(false);
      setExecutionResult(selectedTool.sampleOutputs.output);
    }, 900);
  };

  const handleLaunchToChat = () => {
    if (!selectedTool) return;
    const prompt = `Gunakan tool ${selectedTool.name} untuk memproses input berikut:\n${toolInputs[selectedTool.id] || ''}\n\nTolong lakukan analisis mendalam.`;
    if (onUseTool) {
      onUseTool(selectedTool.name, prompt);
    }
  };

  const copyResult = () => {
    if (executionResult) {
      navigator.clipboard.writeText(executionResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-3.5 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Title & Search */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <span>Katalog Tools & Eksekutor</span>
          </h1>
          <span className="text-[10px] font-extrabold bg-[#FBE7B2] text-[#171717] px-2 py-0.5 rounded-full border border-[#171717]">
            {filtered.length} Tools
          </span>
        </div>

        {/* Search Input */}
        <div className="neo-card p-1.5 bg-white dark:bg-[#232522] flex items-center gap-2 border-2 border-[#171717]">
          <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tools dan eksekutor..."
            className="w-full text-xs font-semibold px-1 py-1 bg-transparent border-none outline-none text-[#171717] dark:text-[#F7F4EC] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(['semua', 'dokumen', 'media', 'data'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize whitespace-nowrap transition border-2 border-[#171717] neo-shadow-sm ${
              activeTab === tab
                ? 'bg-[#171717] text-white'
                : 'bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tools List */}
      <div className="space-y-2.5">
        {filtered.map((tool) => {
          const Icon = tool.icon;

          return (
            <div
              key={tool.id}
              onClick={() => handleOpenToolDetail(tool)}
              className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#2A2C28] cursor-pointer transition group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl ${tool.color} border-2 border-[#171717] flex items-center justify-center shrink-0 neo-shadow-sm`}
                >
                  <Icon className="w-5 h-5 text-[#171717]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
                      {tool.name}
                    </h3>
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-300">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{tool.status}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-1 mt-0.5">
                    {tool.desc}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#171717] group-hover:translate-x-0.5 transition shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Interactive Tool Execution Drawer / Modal */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-4 sm:p-5 neo-shadow-xl animate-in slide-in-from-bottom max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b-2 border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl ${selectedTool.color} border-2 border-[#171717] neo-shadow-sm flex items-center justify-center shrink-0`}
                >
                  {React.createElement(selectedTool.icon, {
                    className: 'w-6 h-6 text-[#171717]',
                  })}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#171717] dark:text-[#F7F4EC]">
                    {selectedTool.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-gray-500">
                      {selectedTool.cost}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-400 font-bold">
                      {selectedTool.permissions}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTool(null)}
                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-gray-600 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sandbox Architecture Badge */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#232522] border-2 border-[#171717] mb-3 text-[11px] space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-gray-500">Sandbox Runtime:</span>
                <span className="text-[#171717] dark:text-[#F7F4EC] font-mono text-[10px]">
                  {selectedTool.sandboxType}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-[10px] leading-tight">
                {selectedTool.desc}
              </p>
            </div>

            {/* Interactive Test Input Form */}
            <div className="mb-3 space-y-1.5">
              <label className="text-[11px] font-black text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <span>Input / Parameter Uji Coba:</span>
                <span className="text-[10px] text-gray-400">Dapat diedit</span>
              </label>

              {selectedTool.id === 'python_runner' ? (
                <textarea
                  rows={4}
                  value={toolInputs[selectedTool.id] || ''}
                  onChange={(e) =>
                    setToolInputs({ ...toolInputs, [selectedTool.id]: e.target.value })
                  }
                  className="w-full text-xs font-mono p-2.5 rounded-xl border-2 border-[#171717] bg-[#171717] text-emerald-400 outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={toolInputs[selectedTool.id] || ''}
                  onChange={(e) =>
                    setToolInputs({ ...toolInputs, [selectedTool.id]: e.target.value })
                  }
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border-2 border-[#171717] bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] outline-none"
                />
              )}
            </div>

            {/* Action Buttons: Run Test & Launch */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handleRunToolTest}
                disabled={isExecuting}
                className="neo-btn bg-[#FBE7B2] hover:bg-[#f8dd96] text-[#171717] py-2 text-xs font-black flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isExecuting ? (
                  <span className="flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengeksekusi...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Play className="w-3.5 h-3.5 fill-[#171717]" />
                    <span>Uji Coba Tool</span>
                  </span>
                )}
              </button>

              <button
                onClick={handleLaunchToChat}
                className="neo-btn bg-[#C9F2D5] hover:bg-[#b0efbe] text-[#171717] py-2 text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                <span>Buka di Chat AI</span>
              </button>
            </div>

            {/* Simulated Execution Result */}
            {executionResult && (
              <div className="p-3 bg-white dark:bg-[#232522] border-2 border-[#171717] rounded-2xl animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    Hasil Eksekusi Tool
                  </span>
                  <button
                    onClick={copyResult}
                    className="text-[10px] font-bold text-gray-500 hover:text-black flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-gray-50 dark:bg-[#1A1C19] p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
                  {executionResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
