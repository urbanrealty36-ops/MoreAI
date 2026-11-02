'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Plus,
  Mic,
  Sparkles,
  FileText,
  Download,
  Copy,
  Check,
  ChevronDown,
  ArrowRight,
  Workflow,
} from 'lucide-react';
import { MascotIcon } from '../shared/MascotIcon';
import { ManusAgentWorkflowView } from '../manus/ManusAgentWorkflowView';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  steps?: { name: string; status: 'completed' | 'running' | 'queued' }[];
  artifact?: {
    title: string;
    type: string;
    summary: string;
  };
  hasAgentWorkflow?: boolean;
}

interface ClientChatProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onDeductCredit: (amount: number) => void;
}

export const ClientChat: React.FC<ClientChatProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  onDeductCredit,
}) => {
  const [subTab, setSubTab] = useState<'chat' | 'workflow' | 'proyek'>('chat');
  const [selectedAgent, setSelectedAgent] = useState<'content' | 'research' | 'data' | 'general'>('content');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [agentGoal, setAgentGoal] = useState<string>(
    'Riset pasar kedai kopi lokal 2026, analisis kompetitor di Kemang, dan buatkan proyeksi margin serta dokumen strategi 30 hari.'
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Buatkan rencana konten promosi kafe selama 1 bulan.',
      timestamp: '10:24',
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      text: 'Berikut rencana konten promosi kafe selama 1 bulan dengan 4 tema utama, lengkap dengan ide konten harian, format, dan caption singkat. 🌟\n\n• Minggu 1: Signature Coffee & Bean Origin\n• Minggu 2: Suasana Co-Working & Komunitas\n• Minggu 3: Menu Pastry & Promo Bundle Sore\n• Minggu 4: Testimoni Pengunjung & Event Musik Akustik',
      timestamp: '10:25',
      hasAgentWorkflow: true,
      steps: [
        { name: 'Menganalisis profil target pengunjung kafe', status: 'completed' },
        { name: 'Menyusun kalender editorial 4 minggu', status: 'completed' },
        { name: 'Menyiapkan rekomendasi hook & visual asset', status: 'completed' },
      ],
      artifact: {
        title: 'Rencana Konten Kafe (30 Hari)',
        type: 'Kalender Editorial & Caption',
        summary: '30 ide konten, format Reels/Carousels, dan copywriting siap posting.',
      },
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (subTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, subTab]);

  const handleSendPrompt = useCallback(
    async (textToSend: string, asAgent = false) => {
      if (!textToSend.trim() || isLoading) return;

      if (asAgent) {
        setAgentGoal(textToSend);
        setSubTab('workflow');
        setInputMessage('');
        return;
      }

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: textToSend,
        timestamp: '10:26',
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputMessage('');
      setIsLoading(true);

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        const apiBaseUrl = process.env.NEXT_PUBLIC_MOREAI_API_URL;
        if (!supabaseUrl || !publishableKey || !apiBaseUrl) {
          throw new Error('Layanan belum dikonfigurasi. Silakan hubungi administrator.');
        }
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(supabaseUrl, publishableKey);
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session?.access_token) {
          throw new Error('Silakan masuk ke akun MoreAI sebelum menggunakan AI Workspace.');
        }
        const response = await fetch(new URL('/api/v1/llm/generate', apiBaseUrl), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ prompt: textToSend, model: selectedModel, max_output_tokens: 2048 }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(typeof data.detail === 'string' ? data.detail : 'Permintaan AI belum dapat diproses.');
        }
        const botResponse = typeof data.text === 'string' ? data.text : 'Provider tidak mengembalikan teks.');

        const isComplex =
          textToSend.toLowerCase().includes('buat') ||
          textToSend.toLowerCase().includes('riset') ||
          textToSend.toLowerCase().includes('rencana') ||
          textToSend.toLowerCase().includes('analisis');

        const assistantMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: botResponse,
          timestamp: '10:27',
          hasAgentWorkflow: false,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const fallbackMsg: Message = {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Terjadi kendala jaringan saat menghubungi AI Engine. Pastikan koneksi internet atau kuota Anda aktif.',
          timestamp: '10:28',
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, onDeductCredit, selectedModel, selectedAgent]
  );

  // If initialPrompt was passed from home quick actions, send it
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      const promptToRun = initialPrompt.trim();
      const timer = setTimeout(() => {
        handleSendPrompt(promptToRun);
        if (onClearInitialPrompt) onClearInitialPrompt();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt, handleSendPrompt, onClearInitialPrompt]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSwitchToWorkflow = (goal?: string) => {
    if (goal) {
      setAgentGoal(goal);
    }
    setSubTab('workflow');
  };

  return (
    <div className="relative min-h-[calc(100vh-125px)] flex flex-col max-w-md mx-auto">
      {/* Top Header: Subtab Switcher & Brand Model Router (MoreAI F.01) */}
      <div className="sticky top-[58px] z-20 p-2.5 bg-white dark:bg-[#232522] border-b-2 border-[#171717] dark:border-[#4A4A46] shrink-0 space-y-2">
        {/* 3 Subtabs: Chat AI / Workflow Agen Otonom / Proyek & Artefak */}
        <div className="flex items-center justify-between gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-[#171717]">
          <button
            onClick={() => setSubTab('chat')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition flex items-center justify-center gap-1 ${
              subTab === 'chat'
                ? 'bg-[#D9D5FF] text-[#171717] border border-[#171717] neo-shadow-sm'
                : 'text-gray-500 hover:text-[#171717] dark:text-gray-400'
            }`}
          >
            <span>Chat AI</span>
          </button>

          <button
            onClick={() => setSubTab('workflow')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition flex items-center justify-center gap-1 ${
              subTab === 'workflow'
                ? 'bg-[#C9F2D5] text-[#171717] border border-[#171717] neo-shadow-sm'
                : 'text-gray-500 hover:text-[#171717] dark:text-gray-400'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Agen Otonom</span>
          </button>

          <button
            onClick={() => setSubTab('proyek')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition flex items-center justify-center gap-1 ${
              subTab === 'proyek'
                ? 'bg-[#FBE7B2] text-[#171717] border border-[#171717] neo-shadow-sm'
                : 'text-gray-500 hover:text-[#171717] dark:text-gray-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Proyek</span>
          </button>
        </div>

        {/* Brand Model Router: MoreAI F.01 Selector & Agent Role */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Model Dropdown: MoreAI F.01 */}
          <div className="relative flex-1">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full text-[11px] font-black bg-[#C9F2D5] text-[#171717] border-2 border-[#171717] rounded-xl px-2.5 py-1.5 appearance-none pr-6 cursor-pointer neo-shadow-sm outline-none"
            >
              <option value="gemini-2.5-flash">MoreAI F.01 (Cepat & Cerdas)</option>
              <option value="gemini-2.5-pro">MoreAI F.01 Pro (Reasoning & Riset)</option>
              <option value="gemini-2.5-flash-lite">MoreAI F.01 Speed (Ultra Cepat)</option>
              <option value="gemini-2.5-flash">MoreAI F.01 Vision (Multimodal)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#171717] absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Agent Role Pill */}
          <div className="relative flex-1">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value as any)}
              className="w-full text-[11px] font-black bg-[#D9D5FF] text-[#171717] border-2 border-[#171717] rounded-xl px-2.5 py-1.5 appearance-none pr-6 cursor-pointer neo-shadow-sm outline-none"
            >
              <option value="content">Content Creator</option>
              <option value="research">Research Agent</option>
              <option value="data">Data Analyst</option>
              <option value="general">General Assistant</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#171717] absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* VIEW 1: CHAT AI TAB */}
      {subTab === 'chat' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[92%]">
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-[#C9F2D5] border-2 border-[#171717] flex items-center justify-center neo-shadow-sm shrink-0 mb-1">
                      <MascotIcon size={26} mood="happy" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-3.5 border-2 border-[#171717] neo-shadow-sm text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#D9D5FF] text-[#171717] rounded-br-xs font-semibold'
                        : 'bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] rounded-bl-xs'
                    }`}
                  >
                    {/* Assistant Header: Model and steps */}
                    {!isUser && (
                      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-[10px] text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-300">
                            MoreAI F.01
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold">
                            {selectedAgent.toUpperCase()}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="text-[10px] text-gray-600 hover:text-black dark:text-gray-300 flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Disalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Step progress pills if available */}
                    {!isUser && msg.steps && (
                      <div className="mb-2.5 p-2 bg-gray-50 dark:bg-[#1E201D] rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 mb-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Alur Pengerjaan MoreAI Agent:</span>
                        </div>
                        {msg.steps.map((st, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-1.5 text-[10px] font-medium text-gray-700 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{st.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Seamless Workflow Quick-Link */}
                    {!isUser && msg.hasAgentWorkflow && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => handleSwitchToWorkflow(msg.text.slice(0, 80))}
                          className="w-full neo-btn bg-[#C9F2D5] hover:bg-[#b0f0bf] text-[#171717] py-1.5 text-[11px] font-black flex items-center justify-center gap-1.5 neo-shadow-sm"
                        >
                          <Workflow className="w-3.5 h-3.5 text-emerald-900" />
                          <span>Buka Detail di Workflow Agen Otonom</span>
                          <ArrowRight className="w-3 h-3 ml-0.5" />
                        </button>
                      </div>
                    )}

                    {/* Artifact Deliverable Card */}
                    {!isUser && msg.artifact && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#FBE7B2] border-2 border-[#171717] neo-shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white border border-[#171717] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-amber-800" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-[#171717] leading-tight">
                                {msg.artifact.title}
                              </p>
                              <p className="text-[10px] text-gray-700">
                                {msg.artifact.type}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const element = document.createElement('a');
                              const file = new Blob([msg.text], { type: 'text/markdown' });
                              element.href = URL.createObjectURL(file);
                              element.download = `${msg.artifact?.title || 'moreai-result'}.md`;
                              document.body.appendChild(element);
                              element.click();
                              document.body.removeChild(element);
                            }}
                            className="p-1.5 rounded-lg border border-[#171717] bg-white hover:bg-gray-100 transition"
                            title="Unduh Markdown"
                          >
                            <Download className="w-3.5 h-3.5 text-[#171717]" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    {isUser && (
                      <div className="text-right mt-1">
                        <span className="text-[9px] text-gray-600 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#C9F2D5] border-2 border-[#171717] flex items-center justify-center neo-shadow-sm shrink-0 mb-1">
                <MascotIcon size={26} mood="thinking" />
              </div>
              <div className="neo-card p-3 bg-white dark:bg-[#232522] border-2 border-[#171717] text-xs flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="font-extrabold text-[11px] text-gray-700 dark:text-gray-300">
                  MoreAI F.01 sedang memproses tugas...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* VIEW 2: WORKFLOW AGEN OTONOM TAB (SEAMLESSLY INTEGRATED) */}
      {subTab === 'workflow' && (
        <div className="flex-1 overflow-y-auto px-2 py-3 pb-36">
          <ManusAgentWorkflowView isEmbedded={true} initialGoal={agentGoal} />
        </div>
      )}

      {/* VIEW 3: PROYEK & ARTEFAK TAB */}
      {subTab === 'proyek' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-36">
          <div className="neo-card p-3.5 bg-white dark:bg-[#232522]">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
              Berkas & Hasil Selesai (Deliverables)
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Dokumen strategi, skrip kode, dan laporan yang di-generate oleh MoreAI Agent Engine.
            </p>
          </div>

          {[
            {
              title: 'strategi_pemasaran_kafe_30hari.md',
              type: 'Dokumen Markdown',
              size: '14.2 KB',
              date: 'Hari ini, 10:25',
              badge: 'Siap Dipakai',
            },
            {
              title: 'proyeksi_unit_economics.py',
              type: 'Python Model Sandbox',
              size: '3.8 KB',
              date: 'Hari ini, 10:20',
              badge: 'Terverifikasi',
            },
            {
              title: 'benchmark_kompetitor_kemang.json',
              type: 'Dataset Web Scraper',
              size: '8.4 KB',
              date: 'Hari ini, 10:18',
              badge: 'Raw Data',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between border-2 border-[#171717] neo-shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FBE7B2] border border-[#171717] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    {item.type} · {item.size} · {item.date}
                  </p>
                </div>
              </div>

              <button
                onClick={() => alert(`Mengunduh berkas: ${item.title}`)}
                className="neo-btn bg-[#C9F2D5] hover:bg-[#b0f0bf] text-[#171717] p-2 text-xs font-black"
                title="Unduh Berkas"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button
            onClick={() => setSubTab('workflow')}
            className="w-full neo-btn bg-[#D9D5FF] hover:bg-[#c9c4ff] text-[#171717] py-2.5 text-xs font-black flex items-center justify-center gap-1.5 mt-2"
          >
            <Workflow className="w-4 h-4 text-indigo-900" />
            <span>Buka Workflow Engine untuk Buat Proyek Baru</span>
          </button>
        </div>
      )}

      {/* PERMANENT CHAT / ASK-AI INPUT BAR DOCKED DIRECTLY ABOVE BOTTOM NAV */}
      <div className="fixed bottom-16 left-0 right-0 z-30 pointer-events-none px-3 pb-2 pt-1 bg-gradient-to-t from-[#F7F4EC] via-[#F7F4EC]/95 to-transparent dark:from-[#1E201D] dark:via-[#1E201D]/95">
        <div className="max-w-md mx-auto pointer-events-auto">
          {/* Quick mode pill */}
          <div className="flex items-center justify-between px-1 mb-1 text-[10px] font-bold text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#171717] dark:text-gray-300 font-extrabold">
                MoreAI F.01 Active
              </span>
            </div>

            <button
              onClick={() => handleSendPrompt(inputMessage || 'Jalankan riset kompetitor', true)}
              className="hover:underline text-indigo-700 dark:text-indigo-400 font-black flex items-center gap-1"
            >
              <span>Jalankan sebagai Agen Mandiri ➔</span>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputMessage);
            }}
            className="flex items-center gap-1.5 neo-card p-1.5 bg-white dark:bg-[#232522] border-2 border-[#171717] neo-shadow-sm"
          >
            {/* Plus action (add tool or attachment) */}
            <button
              type="button"
              onClick={() => alert('Lampirkan berkas dokumen (PDF, XLSX, DOCX) atau pilih tool analisis.')}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 border border-[#171717] flex items-center justify-center text-[#171717] dark:text-[#F7F4EC] hover:bg-gray-200 transition shrink-0"
              title="Tambah Lampiran atau Tool"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Text input with MoreAI F.01 placeholder */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tulis instruksi atau tanya ke MoreAI F.01..."
                disabled={isLoading}
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-transparent text-[#171717] dark:text-[#F7F4EC] border-none outline-none placeholder-gray-400 disabled:opacity-60"
              />
            </div>

            {/* Mic Button */}
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 flex items-center justify-center text-gray-700 dark:text-gray-300 transition shrink-0"
              title="Input Suara"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-8 h-8 rounded-xl bg-[#C9F2D5] hover:bg-[#b0f0bf] disabled:opacity-50 border border-[#171717] neo-shadow-sm flex items-center justify-center text-[#171717] transition shrink-0 active:translate-x-[1px] active:translate-y-[1px]"
              title="Kirim Pesan"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
