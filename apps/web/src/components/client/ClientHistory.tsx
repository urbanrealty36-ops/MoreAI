'use client';

import React, { useEffect, useState } from 'react';
import { getMoreAIApi } from '../../lib/api';
import {
  History,
  Search,
  MessageSquare,
  Bot,
  FolderGit2,
  Star,
  Clock,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';

interface ClientHistoryProps {
  onOpenSession: (title: string) => void;
}

export const ClientHistory: React.FC<ClientHistoryProps> = ({ onOpenSession }) => {
  const [activeTab, setActiveTab] = useState<'semua' | 'chat' | 'tugas' | 'proyek'>('semua');
  const [search, setSearch] = useState('');

  const [historyItems, setHistoryItems] = useState<Array<{
    id: string; title: string; category: 'chat' | 'tugas' | 'proyek'; date: string;
    starred: boolean; preview: string;
  }>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const api = getMoreAIApi();
        const [conversations, runs] = await Promise.all([api.workspace.conversations(), api.agents.list()]);
        if (!live) return;
        const chatItems = conversations.items.map((item) => ({
          id: item.id, title: item.title || 'Percakapan tanpa judul', category: 'chat' as const,
          date: new Date(item.updated_at).toLocaleString('id-ID'), starred: false,
          preview: `Status percakapan: ${item.status}`,
        }));
        const taskItems = runs.items.map((item) => ({
          id: item.id, title: `Agent Run · ${item.id.slice(0, 8)}`, category: 'tugas' as const,
          date: new Date(item.created_at).toLocaleString('id-ID'), starred: false,
          preview: `Status: ${item.status} · Percobaan ${item.attempt}/${item.max_attempts}`,
        }));
        setHistoryItems([...chatItems, ...taskItems].sort((a, b) => b.date.localeCompare(a.date)));
      } catch (error) {
        if (live) setLoadError(error instanceof Error ? error.message : 'Riwayat tidak dapat dimuat');
      }
    })();
    return () => { live = false; };
  }, []);

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistoryItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, starred: !item.starred } : item
      )
    );
  };

  const filtered = historyItems.filter((item) => {
    const matchCat = activeTab === 'semua' || item.category === activeTab;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.preview.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-3.5 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Header & Search */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-700" />
            <span>Riwayat Aktivitas AI</span>
          </h1>
          <span className="text-[10px] font-extrabold bg-[#D9D5FF] text-[#171717] px-2 py-0.5 rounded-full border border-[#171717]">
            {filtered.length} Sesi
          </span>
        </div>

        {/* Search Bar */}
        <div className="neo-card p-1.5 bg-white dark:bg-[#232522] flex items-center gap-2 border-2 border-[#171717]">
          <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari percakapan atau tugas..."
            className="w-full text-xs font-semibold px-1 py-1 bg-transparent border-none outline-none text-[#171717] dark:text-[#F7F4EC] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'semua', label: 'Semua' },
          { id: 'chat', label: 'Chat' },
          { id: 'tugas', label: 'Tugas Agent' },
          { id: 'proyek', label: 'Proyek' },
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

      {loadError && <p className="rounded-xl border border-amber-600 bg-amber-50 p-3 text-xs text-amber-900">{loadError}</p>}
      {/* History Items */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenSession(item.title)}
            className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2A2C28] transition group"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                {item.category === 'chat' && <MessageSquare className="w-4 h-4 text-indigo-700" />}
                {item.category === 'tugas' && <Bot className="w-4 h-4 text-pink-700" />}
                {item.category === 'proyek' && <FolderGit2 className="w-4 h-4 text-amber-700" />}
              </div>
              <div>
                <h3 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                  {item.title}
                </h3>
                <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                  {item.preview}
                </p>
                <span className="text-[9px] font-mono text-gray-400 block mt-1">
                  {item.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={(e) => toggleStar(item.id, e)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                title="Bintangi Sesi"
              >
                <Star
                  className={`w-4 h-4 ${
                    item.starred
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-300 hover:text-gray-500'
                  }`}
                />
              </button>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#171717] group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
