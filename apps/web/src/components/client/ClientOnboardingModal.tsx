'use client';

import React, { useState } from 'react';
import { MascotIcon } from '../shared/MascotIcon';
import {
  MessageSquare,
  Bot,
  Wifi,
  Sparkles,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientOnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'MoreAI Ecosystem',
      subtitle: 'Satu Platform AI untuk Berpikir, Berkarya, dan Bertindak.',
      desc: 'Solusi lengkap AI Workspace, Agent cerdas otomatis, dan model router multi-provider.',
      color: 'bg-[#C9F2D5]',
      illustration: (
        <div className="w-24 h-24 rounded-3xl bg-white border-3 border-[#171717] neo-shadow flex items-center justify-center">
          <MascotIcon size={76} mood="excited" />
        </div>
      ),
    },
    {
      title: 'Ruang Kerja AI Serba Lengkap',
      subtitle: 'Chat, Analisis & Otomasi',
      desc: 'Chat cerdas, buat konten promosi, analisis data XLSX/PDF, dan jalankan tugas kompleks dalam hitungan detik.',
      color: 'bg-[#FBE7B2]',
      illustration: (
        <div className="w-24 h-24 rounded-3xl bg-white border-3 border-[#171717] neo-shadow flex items-center justify-center">
          <MessageSquare className="w-12 h-12 text-amber-700" />
        </div>
      ),
    },
    {
      title: 'AI Agents untuk Berbagai Kebutuhan',
      subtitle: 'Eksekusi Otomatis Multi-Langkah',
      desc: 'Research Agent, Content Creator, Data Analyst hingga Document Builder siap mengeksekusi instruksi Anda secara mandiri.',
      color: 'bg-[#D9D5FF]',
      illustration: (
        <div className="w-24 h-24 rounded-3xl bg-white border-3 border-[#171717] neo-shadow flex items-center justify-center">
          <Bot className="w-12 h-12 text-indigo-700" />
        </div>
      ),
    },
    {
      title: 'Akses AI di Mana Saja',
      subtitle: 'Free AI Credit di Jaringan Mitra',
      desc: 'Nikmati kuota gratis AI saat terhubung ke Wi-Fi mitra MoreAI (kafe, kampus, kantor, ruang publik, dan lainnya).',
      color: 'bg-[#D8ECFF]',
      illustration: (
        <div className="w-24 h-24 rounded-3xl bg-white border-3 border-[#171717] neo-shadow flex items-center justify-center">
          <Wifi className="w-12 h-12 text-blue-700" />
        </div>
      ),
    },
  ];

  const isLast = currentStep === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const slide = slides[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-6 neo-shadow-xl text-center relative animate-in fade-in zoom-in-95 duration-200">
        {/* Skip button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl border border-[#171717] bg-white dark:bg-gray-800 text-xs font-bold hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot / Icon Badge */}
        <div className="flex justify-center mb-5 mt-2">{slide.illustration}</div>

        {/* Step indicator dots */}
        <div className="flex justify-center items-center gap-1.5 mb-4">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2.5 rounded-full transition-all border border-[#171717] ${
                currentStep === idx ? 'w-6 bg-[#171717]' : 'w-2.5 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Texts */}
        <h2 className="text-lg font-black text-[#171717] dark:text-[#F7F4EC] leading-tight mb-1">
          {slide.title}
        </h2>
        <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 mb-2">
          {slide.subtitle}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed px-2 mb-6">
          {slide.desc}
        </p>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            onClick={handleNext}
            className="w-full neo-btn bg-[#C9F2D5] hover:bg-[#b0f0bf] text-[#171717] py-3 text-xs font-black flex items-center justify-center gap-2 neo-shadow"
          >
            <span>{isLast ? 'Mulai Sekarang 🚀' : 'Lanjut'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isLast && (
            <button
              onClick={onClose}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white py-1"
            >
              Lewati Pengenalan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
