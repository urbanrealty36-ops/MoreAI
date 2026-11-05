'use client';

import React, { useState } from 'react';
import { usePWA } from '@/hooks/use-pwa';
import { Download, Share, X, WifiOff, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isOnline, install, mounted } = usePWA();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Offline Status Alert */}
      {!isOnline && (
        <div className="bg-[#FBE7B2] text-[#171717] px-4 py-2 border-b-2 border-[#171717] flex items-center justify-between text-xs font-bold neo-shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-[#B83232]" />
            <span>Mode Offline: Anda menggunakan data cache lokal MoreAI.</span>
          </div>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#171717]">
            Tersimpan
          </span>
        </div>
      )}

      {/* PWA In-App Prompt Banner (Shown when not standalone and installable/iOS) */}
      {!isInstalled && !dismissed && (isInstallable || isIOS) && (
        <div className="bg-[#C9F2D5] border-b-2 border-[#171717] px-3 py-2 text-xs flex items-center justify-between gap-2 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-[#171717] flex items-center justify-center neo-shadow-sm shrink-0">
              <Smartphone className="w-4 h-4 text-[#171717]" />
            </div>
            <div>
              <p className="font-extrabold text-[#171717] leading-tight">
                Pasang MoreAI App (PWA)
              </p>
              <p className="text-[10px] text-gray-700">
                Akses cepat, hemat kuota & layar penuh seperti aplikasi native!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isInstallable && (
              <button
                onClick={() => install()}
                className="neo-btn bg-white hover:bg-[#FBE7B2] text-[#171717] text-xs px-2.5 py-1 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pasang</span>
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="neo-btn bg-white hover:bg-[#FBE7B2] text-[#171717] text-xs px-2.5 py-1 flex items-center gap-1"
              >
                <Share className="w-3.5 h-3.5" />
                <span>Panduan iOS</span>
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-black/10 rounded-md transition"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guided Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#F7F4EC] border-3 border-[#171717] rounded-3xl p-5 neo-shadow-lg animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C9F2D5] border-2 border-[#171717] flex items-center justify-center neo-shadow-sm">
                  <Smartphone className="w-5 h-5 text-[#171717]" />
                </div>
                <h3 className="font-black text-base text-[#171717]">
                  Pasang di iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 hover:bg-gray-200 rounded-lg border border-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="text-xs text-gray-800 space-y-2.5 my-4 bg-white p-3.5 rounded-2xl border-2 border-[#171717]">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FBE7B2] border border-[#171717] text-[11px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Buka website MoreAI di browser <strong>Safari</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D9D5FF] border border-[#171717] text-[11px] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Tekan ikon <strong>Share</strong> (kotak dengan panah atas di
                  bawah layar).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#C9F2D5] border border-[#171717] text-[11px] font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Gulir ke bawah dan pilih{' '}
                  <strong>&quot;Add to Home Screen&quot; (Tambah ke Layar Utama)</strong>.
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full neo-btn bg-[#C9F2D5] hover:bg-[#aef1bf] text-[#171717] py-2.5 text-xs font-bold"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
