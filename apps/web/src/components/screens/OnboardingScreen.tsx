'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MengguCharacter } from '../shared/MengguCharacter';
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  Bot,
  Wifi,
  Coffee,
  CheckCircle2,
  Layers,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
  onGoToLogin: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onGoToLogin,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      badge: 'Selamat Datang di MoreAI',
      badgeColor: 'bg-[#FBE7B2]',
      title: 'Satu Platform AI untuk Berpikir, Berkarya, dan Bertindak.',
      description:
        'Ekosistem lengkap AI Workspace, Agent cerdas multi-langkah, dan model router terbaik untuk produktivitas Anda.',
      themeBg: 'from-[#F7F4EC] to-[#EAE6DA]',
      characterMood: 'waving' as const,
      illustration: (
        <div className="relative flex items-center justify-center py-6">
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-44 h-44 rounded-full bg-[#C9F2D5] border-4 border-[#171717] neo-shadow-lg flex items-center justify-center relative"
          >
            <MengguCharacter size={140} mood="excited" />

            {/* Floating Sparkles & Badges */}
            <motion.div
              animate={{ y: [-4, 4, -4], rotate: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-3 -right-2 bg-[#FBE7B2] border-2 border-[#171717] rounded-xl px-2.5 py-1 text-[10px] font-black neo-shadow-sm flex items-center gap-1 text-[#171717]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>More AI v1.0</span>
            </motion.div>

            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ repeat: Infinity, duration: 2.7 }}
              className="absolute -bottom-2 -left-3 bg-[#D9D5FF] border-2 border-[#171717] rounded-xl px-2.5 py-1 text-[10px] font-black neo-shadow-sm flex items-center gap-1 text-[#171717]"
            >
              <span>AI Workspace & Agent</span>
            </motion.div>
          </motion.div>
        </div>
      ),
    },
    {
      id: 1,
      badge: 'Fitur Unggulan 01',
      badgeColor: 'bg-[#C9F2D5]',
      title: 'Ruang Kerja AI Serba Lengkap',
      description:
        'Chat interaktif, buat ide konten, analisis data dokumen PDF/XLSX, dan jalankan tugas kompleks dalam satu alur terpadu.',
      themeBg: 'from-[#C9F2D5]/30 to-[#F7F4EC]',
      characterMood: 'thinking' as const,
      illustration: (
        <div className="relative flex items-center justify-center py-4">
          <div className="w-52 h-44 rounded-3xl bg-white dark:bg-[#232522] border-3 border-[#171717] neo-shadow-lg p-3 flex flex-col justify-between relative overflow-hidden">
            {/* Header pill */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8080] border border-[#171717]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FBE7B2] border border-[#171717]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9F2D5] border border-[#171717]" />
              </div>
              <span className="text-[9px] font-bold text-gray-500 font-mono">Workspace AI</span>
            </div>

            {/* Bubble cards */}
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-[#D9D5FF] p-2 rounded-xl border border-[#171717] text-[10px] font-black flex items-center gap-2 neo-shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-800" />
              <span>Analisis Laporan Keuangan Q3</span>
            </motion.div>

            <motion.div
              animate={{ x: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.3 }}
              className="bg-[#FBE7B2] p-2 rounded-xl border border-[#171717] text-[10px] font-black flex items-center gap-2 neo-shadow-sm self-end"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>Rencana Konten Kafe 30 Hari</span>
            </motion.div>
          </div>

          <div className="absolute -bottom-2 -right-2">
            <MengguCharacter size={78} mood="working" />
          </div>
        </div>
      ),
    },
    {
      id: 2,
      badge: 'Fitur Unggulan 02',
      badgeColor: 'bg-[#D9D5FF]',
      title: 'AI Agents untuk Berbagai Kebutuhan',
      description:
        'Jalankan riset mendalam, naskah promosi, kalkulasi data Python, dan pembuatan dokumen otomatis menggunakan sistem agent mandiri.',
      themeBg: 'from-[#D9D5FF]/30 to-[#F7F4EC]',
      characterMood: 'excited' as const,
      illustration: (
        <div className="relative flex items-center justify-center py-4">
          <div className="w-56 space-y-2">
            {[
              { name: 'Research Agent', tag: 'Web & Faktual', color: 'bg-[#D9D5FF]' },
              { name: 'Content Creator', tag: 'Copywriting & Sosmed', color: 'bg-[#F9D8E5]' },
              { name: 'Data Analyst Agent', tag: 'Visualisasi Insight', color: 'bg-[#C9F2D5]' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`neo-card p-2.5 ${item.color} flex items-center justify-between border-2 border-[#171717] neo-shadow-sm`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white border border-[#171717] flex items-center justify-center font-bold text-xs">
                    <Bot className="w-3.5 h-3.5 text-[#171717]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#171717] leading-tight">{item.name}</p>
                    <p className="text-[9px] text-gray-700">{item.tag}</p>
                  </div>
                </div>
                <span className="w-5 h-5 rounded-full bg-white border border-[#171717] text-[10px] font-black flex items-center justify-center">
                  ✓
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      badge: 'Fitur Unggulan 03',
      badgeColor: 'bg-[#FFDCCB]',
      title: 'Akses AI di Mana Saja',
      description:
        'Nikmati Free AI Credit di jaringan mitra (kafe, kampus, kantor, ruang publik, dll) cukup dengan menghubungkan Wi-Fi atau masukkan kode akses.',
      themeBg: 'from-[#C9F2D5]/40 via-[#FBE7B2]/30 to-[#F7F4EC]',
      characterMood: 'coffee' as const,
      illustration: (
        <div className="relative flex items-center justify-center py-4">
          <div className="w-56 p-4 rounded-3xl bg-white dark:bg-[#232522] border-3 border-[#171717] neo-shadow-lg text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-[#FBE7B2] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center mx-auto mb-2">
              <Coffee className="w-7 h-7 text-amber-900" />
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-black bg-[#C9F2D5] px-2 py-0.5 rounded-full border border-[#171717] mb-1">
              <Wifi className="w-3 h-3 text-emerald-800 animate-pulse" />
              <span>Cafe MoreAI Kemang</span>
            </div>
            <p className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
              Free 5.000 AI Credit
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Sponsor akses penuh selama di area venue
            </p>
          </div>
          <div className="absolute -bottom-2 -left-2">
            <MengguCharacter size={76} mood="coffee" />
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-65px)] bg-gradient-to-b ${slide.themeBg} flex flex-col justify-between p-5 max-w-md mx-auto transition-colors duration-300`}>
      {/* Top Header / Skip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#171717] neo-shadow-sm flex items-center justify-center font-black text-xs">
            M
          </div>
          <span className="font-black text-sm text-[#171717] dark:text-[#F7F4EC]">
            More<span className="text-emerald-600">AI</span>
          </span>
        </div>

        <button
          onClick={onComplete}
          className="text-xs font-black text-gray-600 dark:text-gray-300 hover:text-black px-2 py-1 rounded-lg border border-transparent hover:border-[#171717] transition"
        >
          Lewati
        </button>
      </div>

      {/* Main Slide Animated Content */}
      <div className="flex-1 flex flex-col justify-center my-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="text-center space-y-3"
          >
            {/* Visual Illustration */}
            {slide.illustration}

            {/* Badge */}
            <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#171717] neo-shadow-sm text-[#171717] ${slide.badgeColor}`}>
              {slide.badge}
            </span>

            {/* Title */}
            <h1 className="text-xl font-black text-[#171717] dark:text-[#F7F4EC] leading-tight px-2">
              {slide.title}
            </h1>

            {/* Description */}
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed px-4">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-4 pt-2">
        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all border border-[#171717] ${
                currentSlide === idx
                  ? 'w-7 bg-[#171717] dark:bg-white'
                  : 'w-2.5 bg-gray-300 dark:bg-gray-700'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            onClick={handleNext}
            className="w-full neo-btn bg-[#C9F2D5] hover:bg-[#b0f0bf] text-[#171717] py-3 text-xs font-black flex items-center justify-center gap-2 neo-shadow text-sm"
          >
            <span>{isLast ? 'Mulai Sekarang 🚀' : 'Lanjutkan'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onGoToLogin}
            className="w-full text-center text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-black py-1"
          >
            Sudah punya akun? <span className="font-black text-[#171717] dark:text-white underline">Masuk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
