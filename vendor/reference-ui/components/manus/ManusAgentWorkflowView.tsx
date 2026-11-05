'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Terminal,
  FileText,
  Download,
  Copy,
  Check,
  Send,
  Layers,
  Sparkles,
  Zap,
  Code2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { MengguCharacter } from '../shared/MengguCharacter';

type TaskStatus =
  | 'CREATED'
  | 'PLANNING'
  | 'WAITING_APPROVAL'
  | 'RUNNING'
  | 'CHECKPOINTED'
  | 'COMPLETED';

interface PlanStep {
  id: number;
  title: string;
  tool: 'browser' | 'python' | 'file' | 'search';
  status: 'pending' | 'running' | 'completed' | 'waiting';
  detail: string;
}

interface AgentWorkflowProps {
  initialGoal?: string;
  isEmbedded?: boolean;
}

export const ManusAgentWorkflowView: React.FC<AgentWorkflowProps> = ({
  initialGoal,
  isEmbedded = false,
}) => {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('WAITING_APPROVAL');
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [activePane, setActivePane] = useState<'plan' | 'browser' | 'terminal' | 'artifacts'>('plan');
  const [promptInput, setPromptInput] = useState(
    initialGoal ||
      'Riset pasar kedai kopi lokal 2026, analisis kompetitor di Kemang, dan buatkan proyeksi margin serta dokumen strategi 30 hari.'
  );

  const [steps, setSteps] = useState<PlanStep[]>([
    {
      id: 1,
      title: 'Dekomposisi Masalah & Rencana Riset',
      tool: 'search',
      status: 'completed',
      detail: 'Menentukan 5 target kafe kompetitor utama di area Kemang & Jakarta Selatan.',
    },
    {
      id: 2,
      title: 'Scraping Data Menu & Harga Kompetitor',
      tool: 'browser',
      status: 'running',
      detail: 'Browser Worker mengunjungi situs publik & mengekstrak harga kopi signature.',
    },
    {
      id: 3,
      title: 'Kalkulasi Unit Economics dengan Python',
      tool: 'python',
      status: 'waiting',
      detail: 'Menjalankan skrip Python di isolated container untuk menghitung COGS dan margin laba.',
    },
    {
      id: 4,
      title: 'Kompilasi Dokumen & Artefak Strategi',
      tool: 'file',
      status: 'pending',
      detail: 'Membuat dokumen strategi 30 hari dan berkas laporan analitik.',
    },
  ]);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM] MoreAI Agent Engine v1.0 initialized.',
    '[PLANNER] Generating 4-step execution task graph...',
    '[TOOL:SEARCH] Google Search Connector: query "coffee shop kemang price benchmark 2026"',
    '[TOOL:SEARCH] 12 data points retrieved from public index.',
    '[TOOL:BROWSER] Launching isolated Chromium sandbox (PID: 4092)...',
    '[TOOL:BROWSER] Navigating to https://competitor-benchmark.local/kemang',
    '[TOOL:BROWSER] Extracted: Americano Rp28k, Latte Rp38k, V60 Single Origin Rp45k',
  ]);

  const [artifacts, setArtifacts] = useState([
    {
      name: 'strategi_pemasaran_kafe_30hari.md',
      type: 'Markdown Document',
      size: '14.2 KB',
      summary: 'Kalender editorial 4 minggu, rekomendasi bundling menu, dan proyeksi omset.',
    },
    {
      name: 'proyeksi_unit_economics.py',
      type: 'Python Script',
      size: '3.8 KB',
      summary: 'Model kalkulasi margin laba kotor dan titik impas (break-even point).',
    },
  ]);

  // Simulate execution progress
  const handleApprovePlan = () => {
    setTaskStatus('RUNNING');
    setActivePane('browser');

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        '[APPROVAL] User approved step execution.',
        '[TOOL:PYTHON] Starting Python 3.11 sandbox container...',
        '[TOOL:PYTHON] Executing margin calculation script...',
        '[TOOL:PYTHON] Output: Average Gross Margin = 68.4%, BEP = 42 cups/day.',
      ]);
      setSteps((prev) =>
        prev.map((s) => (s.id === 2 ? { ...s, status: 'completed' } : s.id === 3 ? { ...s, status: 'running' } : s))
      );
      setCurrentStepIndex(2);
    }, 1800);

    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) => (s.id === 3 ? { ...s, status: 'completed' } : s.id === 4 ? { ...s, status: 'completed' } : s))
      );
      setTaskStatus('COMPLETED');
      setActivePane('artifacts');
      setTerminalLogs((prev) => [
        ...prev,
        '[FILE_SAVER] Saved artifact: strategi_pemasaran_kafe_30hari.md',
        '[STATE] Checkpoint written to Supabase task repository.',
        '[COMPLETED] All 4 steps executed successfully. Budget used: 45 credits.',
      ]);
    }, 3800);
  };

  const handleReset = () => {
    setTaskStatus('WAITING_APPROVAL');
    setActivePane('plan');
    setSteps((prev) =>
      prev.map((s) => (s.id === 1 ? { ...s, status: 'completed' } : s.id === 2 ? { ...s, status: 'running' } : { ...s, status: 'pending' }))
    );
  };

  return (
    <div className={`space-y-4 ${isEmbedded ? 'pb-36 px-1 pt-1 w-full' : 'pb-20 px-4 pt-3 max-w-4xl mx-auto'}`}>
      {/* Top Header Card */}
      <div className="neo-card p-4 bg-white dark:bg-[#232522]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D9D5FF] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center">
              <Bot className="w-7 h-7 text-indigo-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-[#171717] dark:text-[#F7F4EC]">
                  MoreAI Autonomous Agent
                </h1>
                <span className="text-[10px] font-black bg-[#C9F2D5] text-[#171717] px-2 py-0.5 rounded-full border border-[#171717]">
                  {taskStatus}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                PlanningFlow, Execution Sandbox & Tool Orchestration Engine
              </p>
            </div>
          </div>

          {/* Action state controls */}
          <div className="flex items-center gap-2">
            {taskStatus === 'WAITING_APPROVAL' && (
              <button
                onClick={handleApprovePlan}
                className="neo-btn bg-[#C9F2D5] hover:bg-[#b0f0bf] text-[#171717] px-3.5 py-1.5 text-xs font-black flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Setujui & Jalankan</span>
              </button>
            )}

            {taskStatus === 'RUNNING' && (
              <button
                onClick={() => setTaskStatus('WAITING_APPROVAL')}
                className="neo-btn bg-[#FBE7B2] hover:bg-[#f6deb1] text-[#171717] px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Jeda Tugas</span>
              </button>
            )}

            {taskStatus === 'COMPLETED' && (
              <button
                onClick={handleReset}
                className="neo-btn bg-white hover:bg-gray-100 text-[#171717] px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi Tugas</span>
              </button>
            )}
          </div>
        </div>

        {/* Task Prompt Overview */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1">
            Instruksi Tugas Pengguna (Goal)
          </span>
          <p className="text-xs font-bold text-[#171717] dark:text-[#F7F4EC] bg-gray-50 dark:bg-[#1E201D] p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 leading-snug">
            &ldquo;{promptInput}&rdquo;
          </p>
        </div>
      </div>

      {/* State Machine Step Bar */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
        {[
          { label: '1. Perencanaan', active: true, done: true },
          { label: '2. Verifikasi Izin', active: taskStatus === 'WAITING_APPROVAL', done: taskStatus === 'RUNNING' || taskStatus === 'COMPLETED' },
          { label: '3. Eksekusi Worker', active: taskStatus === 'RUNNING', done: taskStatus === 'COMPLETED' },
          { label: '4. Hasil & Artefak', active: taskStatus === 'COMPLETED', done: taskStatus === 'COMPLETED' },
        ].map((s, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-xl border-2 border-[#171717] neo-shadow-sm font-extrabold text-[11px] ${
              s.active
                ? 'bg-[#C9F2D5] text-[#171717]'
                : s.done
                ? 'bg-[#FBE7B2] text-[#171717]'
                : 'bg-white dark:bg-[#232522] text-gray-400'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Interactive Tabs for Workstation: Plan / Browser / Terminal / Artifacts */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'plan', label: 'Rencana Tugas (Task Graph)', icon: Layers },
          { id: 'browser', label: 'Live Browser Viewport', icon: Globe },
          { id: 'terminal', label: 'Python Sandbox Terminal', icon: Terminal },
          { id: 'artifacts', label: 'Hasil Artefak & Berkas', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activePane === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePane(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition border-2 border-[#171717] neo-shadow-sm flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#171717] text-white'
                  : 'bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PANE 1: PLAN STEP GRAPH */}
      {activePane === 'plan' && (
        <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-gray-500">
              Daftar Langkah Agen (PlanningFlow)
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-bold">
              Checkpoints: Enabled
            </span>
          </div>

          <div className="space-y-2.5">
            {steps.map((st) => (
              <div
                key={st.id}
                className={`p-3 rounded-2xl border-2 border-[#171717] flex items-start justify-between gap-3 neo-shadow-sm transition ${
                  st.status === 'running'
                    ? 'bg-[#C9F2D5]'
                    : st.status === 'completed'
                    ? 'bg-[#F7F4EC] dark:bg-[#1E201D]'
                    : 'bg-white dark:bg-[#232522]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#171717] flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5">
                    {st.id}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
                      {st.title}
                    </h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">
                      {st.detail}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-mono font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 rounded border">
                      Tool: {st.tool.toUpperCase()}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full border border-[#171717] shrink-0 ${
                    st.status === 'completed'
                      ? 'bg-[#C9F2D5] text-emerald-950'
                      : st.status === 'running'
                      ? 'bg-[#FBE7B2] text-amber-950 animate-pulse'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {st.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {taskStatus === 'WAITING_APPROVAL' && (
            <div className="p-3 rounded-2xl bg-[#FBE7B2] border-2 border-[#171717] flex items-center justify-between gap-2 mt-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-900 shrink-0" />
                <p className="text-xs font-bold text-amber-950">
                  Manus membutuhkan persetujuan Anda untuk menjalankan Browser scraping & Python sandbox.
                </p>
              </div>
              <button
                onClick={handleApprovePlan}
                className="neo-btn bg-[#C9F2D5] px-3 py-1.5 text-xs font-black shrink-0"
              >
                Setujui Rencana
              </button>
            </div>
          )}
        </div>
      )}

      {/* PANE 2: LIVE BROWSER SANDBOX VIEWPORT */}
      {activePane === 'browser' && (
        <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black font-mono">
                https://competitor-benchmark.local/kemang
              </span>
            </div>
            <span className="text-[10px] bg-[#C9F2D5] px-2 py-0.5 rounded font-black border border-[#171717]">
              DOM Scraper Active
            </span>
          </div>

          {/* Browser Mock Screen */}
          <div className="w-full h-56 rounded-2xl bg-gray-50 dark:bg-[#1E201D] border-2 border-[#171717] p-3 overflow-hidden relative font-sans">
            <div className="text-left space-y-2">
              <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                Data Menu & Harga Coffee Shop (Kemang Benchmark 2026):
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-[#2A2C28] border border-gray-300">
                  <p className="font-bold">Kafe A (Single Origin)</p>
                  <p className="text-emerald-600 font-mono font-black">Rp 38.000 / cup</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#2A2C28] border border-gray-300">
                  <p className="font-bold">Kafe B (Commercial Blend)</p>
                  <p className="text-emerald-600 font-mono font-black">Rp 25.000 / cup</p>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#C9F2D5]/50 border border-emerald-600 text-[10px] font-bold">
                ✓ Ekstraksi selesai: 14 menu minuman & 8 pastry berhasil disimpan ke memori agen.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANE 3: PYTHON SANDBOX TERMINAL */}
      {activePane === 'terminal' && (
        <div className="neo-card p-4 bg-[#171717] text-[#C9F2D5] border-3 border-[#171717] space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2 text-gray-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Isolated Python 3.11 Sandbox (microVM)</span>
            </div>
            <span className="text-[10px] text-gray-400">Memory: 256MB / CPU: 1 Core</span>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-56 text-[11px] leading-relaxed pt-1">
            {terminalLogs.map((log, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* PANE 4: ARTIFACTS STUDIO */}
      {activePane === 'artifacts' && (
        <div className="neo-card p-4 bg-white dark:bg-[#232522] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-gray-500">
              Dokumen & Berkas Deliverable
            </h3>
            <span className="text-[10px] font-bold bg-[#FBE7B2] text-[#171717] px-2 py-0.5 rounded-full border border-[#171717]">
              {artifacts.length} File Siap Unduh
            </span>
          </div>

          <div className="space-y-2.5">
            {artifacts.map((art, idx) => (
              <div
                key={idx}
                className="neo-card p-3 bg-white dark:bg-[#232522] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FBE7B2] border border-[#171717] neo-shadow-sm flex items-center justify-center">
                    <FileText className="w-4 h-4 text-amber-900" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
                      {art.name}
                    </h4>
                    <p className="text-[10px] text-gray-500">
                      {art.type} · {art.size}
                    </p>
                    <p className="text-[10px] text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-1">
                      {art.summary}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const blob = new Blob([`# ${art.name}\n\n${art.summary}`], {
                      type: 'text/markdown',
                    });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = art.name;
                    link.click();
                  }}
                  className="neo-btn bg-[#C9F2D5] px-2.5 py-1 text-xs font-black flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
