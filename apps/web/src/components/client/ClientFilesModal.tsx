'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Search,
  X,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  HardDrive,
} from 'lucide-react';

interface ClientFilesModalProps {
  onClose: () => void;
  onOpenInChat: (filename: string) => void;
}

export const ClientFilesModal: React.FC<ClientFilesModalProps> = ({
  onClose,
  onOpenInChat,
}) => {
  const [filterType, setFilterType] = useState<'semua' | 'pdf' | 'doc' | 'code' | 'sheet'>('semua');
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const files = [
    {
      id: 'f-1',
      name: 'Rencana_Konten_Kafe_30_Hari.md',
      type: 'doc',
      size: '24.5 KB',
      createdAt: 'Hari ini, 10:25',
      author: 'Content Creator Agent (MoreAI F.01)',
      icon: FileText,
      badgeColor: 'bg-[#D9D5FF]',
      content: `# Rencana Konten Kafe & Co-Working (30 Hari)
**Klien:** Cafe MoreAI Kemang
**Target Audiens:** Mahasiswa, remote workers, dan komunitas lokal.

---
### Minggu 1: Signature Beans & Craftsmanship
- **Hari 1 (Reels):** Behind the scenes: Proses roasting biji kopi specialty Aceh Gayo.
- **Hari 2 (Carousel):** Panduan memesan kopi sesuai preferensi rasa (Acidity vs Bitterness).
- **Hari 3 (Story):** Polling rasa favorit: Aren Latte vs Oat Milk Cappuccino.

### Minggu 2: Co-Working Friendly & Fast Wi-Fi
- **Hari 8 (Reels):** Review meja kerja kafe, colokan di tiap sudut, dan Free Wi-Fi 5.000 AI Credit.
- **Hari 9 (Post):** Promo bundle kopi + pastry jam 14.00 - 17.00 WIB.`,
    },
    {
      id: 'f-2',
      name: 'Analisis_Kompetitor_Kafe_Kemang_2026.pdf',
      type: 'pdf',
      size: '1.2 MB',
      createdAt: 'Kemarin, 16:40',
      author: 'Research Agent (MoreAI F.01 Pro)',
      icon: FileText,
      badgeColor: 'bg-[#F9D8E5]',
      content: `# Laporan Riset Pasar Kafe Specialty Jakarta Selatan 2026
**Ringkasan Eksekutif:**
Ditemukan 42 kafe di radius 3 km dari Kemang. Hanya 18% yang menyediakan fasilitas colokan dan internet stabil untuk remote workers.

**Peluang Utama:**
1. Menyediakan loyalty berbasis Free AI Credit terintegrasi Wi-Fi.
2. Menu artisan manual brew dengan origin beans rotasi mingguan.
3. Jam operasional pagi hari (07.00 WIB) untuk breakfast seekers.`,
    },
    {
      id: 'f-3',
      name: 'Proyeksi_Keuangan_dan_ROI_Cabang.xlsx',
      type: 'sheet',
      size: '88.2 KB',
      createdAt: 'Kemarin, 14:15',
      author: 'Data Analyst Agent',
      icon: FileSpreadsheet,
      badgeColor: 'bg-[#C9F2D5]',
      content: `KOLOM 1: Bulan | KOLOM 2: Proyeksi Pengunjung | KOLOM 3: Gross Revenue | KOLOM 4: Net Margin
-------------------------------------------------------------------------------------------------
Bulan 1       | 3.200 Orang               | Rp 96.000.000        | Rp 28.800.000 (30%)
Bulan 2       | 3.850 Orang               | Rp 115.500.000       | Rp 38.115.000 (33%)
Bulan 3       | 4.600 Orang               | Rp 138.000.000       | Rp 48.300.000 (35%)
Bulan 4       | 5.200 Orang               | Rp 156.000.000       | Rp 56.160.000 (36%)
Estimasi BEP: Tercapai pada Bulan ke-7 Operasional.`,
    },
    {
      id: 'f-4',
      name: 'cleaner_transaksi_kasir.py',
      type: 'code',
      size: '4.8 KB',
      createdAt: '12 Jan 2026',
      author: 'Code & Automation Agent',
      icon: FileCode,
      badgeColor: 'bg-[#FBE7B2]',
      content: `import pandas as pd

def clean_sales_receipts(csv_path):
    df = pd.read_csv(csv_path)
    # Hapus transaksi batal
    df = df[df['status'] == 'BERHASIL']
    # Konversi nominal ke integer
    df['total_bayar'] = df['total_bayar'].str.replace('Rp', '').str.replace('.', '').astype(int)
    print(f"Total Transaksi Bersih: {len(df)}")
    return df

if __name__ == '__main__':
    clean_sales_receipts('raw_pos_data.csv')`,
    },
  ];

  const filteredFiles = files.filter((f) => {
    const matchType = filterType === 'semua' || f.type === filterType;
    const matchQuery =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.author.toLowerCase().includes(search.toLowerCase());
    return matchType && matchQuery;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-lg bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-4 sm:p-5 neo-shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D9D5FF] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#171717] dark:text-[#F7F4EC]">
                Berkas & Artefak Workspace
              </h2>
              <p className="text-[11px] text-gray-500">
                Dokumen, dataset, & script hasil eksekusi AI Agent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center text-gray-600 hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="py-3 space-y-2 shrink-0">
          <div className="neo-card p-1.5 bg-white dark:bg-[#232522] flex items-center gap-2 border-2 border-[#171717]">
            <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama berkas atau agent pembuat..."
              className="w-full text-xs font-semibold px-1 py-0.5 bg-transparent border-none outline-none text-[#171717] dark:text-[#F7F4EC]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['semua', 'doc', 'pdf', 'sheet', 'code'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 text-[11px] font-black rounded-lg border border-[#171717] uppercase transition shrink-0 ${
                  filterType === t
                    ? 'bg-[#171717] text-white'
                    : 'bg-white dark:bg-[#232522] text-gray-700 dark:text-gray-300'
                }`}
              >
                {t === 'semua' ? 'Semua Berkas' : t}
              </button>
            ))}
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredFiles.map((file) => {
            const Icon = file.icon;

            return (
              <div
                key={file.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#232522] border-2 border-[#171717] neo-shadow-sm flex items-center justify-between gap-3 hover:translate-x-0.5 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl ${file.badgeColor} border border-[#171717] flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-[#171717]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] truncate">
                      {file.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 truncate">
                      {file.size} · {file.author}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="p-1.5 rounded-lg border border-[#171717] bg-[#D8ECFF] hover:bg-[#c6e4ff] text-[#171717]"
                    title="Pratinjau Berkas"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onOpenInChat(file.name);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg border border-[#171717] bg-[#C9F2D5] hover:bg-[#b0efbe] text-[#171717]"
                    title="Buka di Chat AI"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed File Preview Drawer */}
        {previewFile && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="w-full max-w-lg bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-4 neo-shadow-xl max-h-[85vh] flex flex-col">
              <div className="flex items-start justify-between pb-2.5 border-b-2 border-gray-200 dark:border-gray-800 shrink-0">
                <div>
                  <h3 className="text-sm font-black text-[#171717] dark:text-[#F7F4EC]">
                    {previewFile.name}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-bold">
                    Dibuat oleh: {previewFile.author}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="w-7 h-7 rounded-xl bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3">
                <pre className="text-xs font-mono bg-white dark:bg-[#232522] p-3 rounded-2xl border-2 border-[#171717] whitespace-pre-wrap leading-relaxed text-[#171717] dark:text-[#F7F4EC]">
                  {previewFile.content}
                </pre>
              </div>

              <div className="pt-2 border-t-2 border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(previewFile.content)}
                  className="neo-btn bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Konten'}</span>
                </button>

                <button
                  onClick={() => {
                    onOpenInChat(previewFile.name);
                    setPreviewFile(null);
                    onClose();
                  }}
                  className="neo-btn bg-[#C9F2D5] text-[#171717] px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buka di Chat AI</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
