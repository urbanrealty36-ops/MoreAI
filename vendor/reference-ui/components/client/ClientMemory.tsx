'use client';

import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  User,
  FolderGit2,
  FileText,
  Sliders,
  Trash2,
  Plus,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const ClientMemory: React.FC = () => {
  const [memoryActive, setMemoryActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'semua' | 'profil' | 'proyek' | 'file'>('semua');

  const [memoryItems, setMemoryItems] = useState([
    {
      id: 'mem-1',
      category: 'profil',
      title: 'Profil & Preferensi Bahasa',
      content: 'Gaya bahasa ramah, kasual profesional, preferensi jawaban terstruktur dengan poin aksi.',
      icon: User,
      color: 'bg-[#C9F2D5]',
      updated: 'Diperbarui 2 hari lalu',
    },
    {
      id: 'mem-2',
      category: 'proyek',
      title: 'Proyek & Topik Utama',
      content: 'Fokus pada strategi pemasaran digital kafe, kalender konten 30 hari, dan retensi pelanggan.',
      icon: FolderGit2,
      color: 'bg-[#FBE7B2]',
      updated: 'Diperbarui kemarin',
    },
    {
      id: 'mem-3',
      category: 'file',
      title: 'File & Referensi Terhubung',
      content: 'Mengingat dokumen pedoman brand "Cafe MoreAI Kemang", menu kopi, dan daftar harga.',
      icon: FileText,
      color: 'bg-[#D9D5FF]',
      updated: 'Diperbarui 3 jam lalu',
    },
  ]);

  const handleDelete = (id: string) => {
    setMemoryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filtered = memoryItems.filter(
    (item) => activeTab === 'semua' || item.category === activeTab
  );

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Title Card */}
      <div className="neo-card p-4 bg-white dark:bg-[#232522]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D9D5FF] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-800" />
            </div>
            <div>
              <h1 className="text-base font-black text-[#171717] dark:text-[#F7F4EC] leading-tight">
                Memory Kontekstual AI
              </h1>
              <p className="text-[11px] text-gray-500">
                Personalisasi interaksi tanpa perlu menjelaskan ulang
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => setMemoryActive(!memoryActive)}
            className={`w-12 h-6 rounded-full border-2 border-[#171717] transition-colors p-0.5 ${
              memoryActive ? 'bg-[#C9F2D5]' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#171717] transition-transform ${
                memoryActive ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-snug">
            {memoryActive
              ? 'MoreAI mengingat preferensi, minat, dan konteks kerja Anda untuk hasil yang lebih relevan.'
              : 'Memory nonaktif. MoreAI tidak akan menyimpan konteks dari percakapan sebelumnya.'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'semua', label: 'Semua Memori' },
          { id: 'profil', label: 'Profil' },
          { id: 'proyek', label: 'Proyek' },
          { id: 'file', label: 'File' },
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

      {/* Memory Items List */}
      <div className="space-y-2.5">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="neo-card p-3.5 bg-white dark:bg-[#232522] flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${item.color} border border-[#171717] neo-shadow-sm flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Icon className="w-4 h-4 text-[#171717]" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                    {item.content}
                  </p>
                  <span className="text-[9px] font-mono text-gray-400 block mt-1.5">
                    {item.updated}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition shrink-0"
                title="Hapus Memori"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Clear or Add Memory Button */}
      <div className="pt-2">
        <button
          onClick={() => alert('Fitur tambah catatan memori manual berhasil dibuka!')}
          className="w-full neo-btn bg-[#C9F2D5] text-[#171717] py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Preferensi Baru</span>
        </button>
      </div>
    </div>
  );
};
