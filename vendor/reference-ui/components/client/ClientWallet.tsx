'use client';

import React, { useState } from 'react';
import {
  Zap,
  CreditCard,
  History,
  Gift,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ClientWalletProps {
  creditBalance: number;
  partnerCredits?: number;
  onTopUp: (amount: number) => void;
}

export const ClientWallet: React.FC<ClientWalletProps> = ({
  creditBalance,
  partnerCredits = 5000,
  onTopUp,
}) => {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number>(500);

  const transactions = [
    {
      id: 'tx-1',
      title: 'Bonus Kampanye Kafe MoreAI Kemang',
      type: 'in',
      amount: 5000,
      category: 'Sponsor Mitra',
      date: 'Hari ini, 09:12',
    },
    {
      id: 'tx-2',
      title: 'Eksekusi Research Agent (Tren AI)',
      type: 'out',
      amount: 30,
      category: 'AI Agent',
      date: 'Hari ini, 10:15',
    },
    {
      id: 'tx-3',
      title: 'Chat AI & Rencana Konten',
      type: 'out',
      amount: 25,
      category: 'Chat Workspace',
      date: 'Hari ini, 10:25',
    },
    {
      id: 'tx-4',
      title: 'Top Up AI Credit Starter',
      type: 'in',
      amount: 1000,
      category: 'Pembelian',
      date: 'Kemarin, 14:30',
    },
  ];

  const packages = [
    { credits: 500, price: 'Rp 15.000', popular: false },
    { credits: 1500, price: 'Rp 39.000', popular: true },
    { credits: 5000, price: 'Rp 99.000', popular: false },
  ];

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* Total Balance Card */}
      <div className="neo-card p-4 bg-gradient-to-br from-[#FBE7B2] to-[#f8dc94] text-[#171717]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-amber-800 text-amber-800" />
            <span>Total AI Credit</span>
          </span>
          <span className="text-[10px] font-extrabold bg-white px-2 py-0.5 rounded-full border border-[#171717]">
            Wallet Dompet
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-black font-mono tracking-tight tabular-nums">
            {formatNumber(creditBalance)}
          </span>
          <span className="text-xs font-bold text-gray-700">Credits</span>
        </div>

        <div className="mt-2 pt-2 border-t border-amber-800/20 flex items-center justify-between text-[11px] font-semibold text-gray-800">
          <span>Kredit Berbayar: <strong>2.500</strong></span>
          <span>Sponsor Mitra: <strong className="text-emerald-800">+{partnerCredits}</strong></span>
        </div>
      </div>

      {/* 4 Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => setShowTopUpModal(true)}
          className="neo-btn bg-[#C9F2D5] hover:bg-[#b5f0c4] p-2.5 flex flex-col items-center justify-center text-center gap-1"
        >
          <CreditCard className="w-4 h-4 text-emerald-800" />
          <span className="text-[10px] font-black text-[#171717] leading-tight">
            Top Up
          </span>
        </button>

        <button
          onClick={() => {}}
          className="neo-btn bg-[#D9D5FF] hover:bg-[#cdc7ff] p-2.5 flex flex-col items-center justify-center text-center gap-1"
        >
          <History className="w-4 h-4 text-indigo-800" />
          <span className="text-[10px] font-black text-[#171717] leading-tight">
            Riwayat
          </span>
        </button>

        <button
          onClick={() => {}}
          className="neo-btn bg-[#F9D8E5] hover:bg-[#f5cadc] p-2.5 flex flex-col items-center justify-center text-center gap-1"
        >
          <Gift className="w-4 h-4 text-pink-800" />
          <span className="text-[10px] font-black text-[#171717] leading-tight">
            Voucher
          </span>
        </button>

        <button
          onClick={() => {}}
          className="neo-btn bg-[#D8ECFF] hover:bg-[#c6e3ff] p-2.5 flex flex-col items-center justify-center text-center gap-1"
        >
          <Send className="w-4 h-4 text-blue-800" />
          <span className="text-[10px] font-black text-[#171717] leading-tight">
            Transfer
          </span>
        </button>
      </div>

      {/* Usage Bar Card */}
      <div className="neo-card p-3.5 bg-white dark:bg-[#232522]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
            Penggunaan (7 hari terakhir)
          </span>
          <span className="text-xs font-mono font-bold text-gray-500">
            1.240 / 5.000 Credit
          </span>
        </div>

        {/* Neo-brutalist progress track */}
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full border-2 border-[#171717] overflow-hidden p-0.5">
          <div
            className="h-full bg-[#C9F2D5] rounded-full border-r border-[#171717]"
            style={{ width: '25%' }}
          />
        </div>

        {/* Breakdown Items */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
          <div className="p-1.5 rounded-xl bg-gray-50 dark:bg-[#1E201D] border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-500 font-semibold block">Chat AI</span>
            <span className="text-xs font-black font-mono tabular-nums">600</span>
          </div>
          <div className="p-1.5 rounded-xl bg-gray-50 dark:bg-[#1E201D] border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-500 font-semibold block">AI Agents</span>
            <span className="text-xs font-black font-mono tabular-nums">320</span>
          </div>
          <div className="p-1.5 rounded-xl bg-gray-50 dark:bg-[#1E201D] border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-500 font-semibold block">Tools</span>
            <span className="text-xs font-black font-mono tabular-nums">180</span>
          </div>
        </div>
      </div>

      {/* Transaction History List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Riwayat Mutasi Kredit
          </h2>
          <span className="text-[10px] text-gray-500 font-medium">Buku Kas (Immutable)</span>
        </div>

        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="neo-card p-2.5 bg-white dark:bg-[#232522] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl border border-[#171717] flex items-center justify-center neo-shadow-sm ${
                    tx.type === 'in' ? 'bg-[#C9F2D5]' : 'bg-[#F9D8E5]'
                  }`}
                >
                  {tx.type === 'in' ? (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-800" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-pink-800" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] leading-tight">
                    {tx.title}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {tx.category} · {tx.date}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-black tabular-nums ${
                  tx.type === 'in' ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#171717] dark:text-gray-200'
                }`}
              >
                {tx.type === 'in' ? `+${formatNumber(tx.amount)}` : `-${formatNumber(tx.amount)}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-5 neo-shadow-lg animate-in slide-in-from-bottom">
            <h3 className="text-base font-black text-[#171717] dark:text-[#F7F4EC] mb-1">
              Beli Paket AI Credit
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
              Kredit dapat digunakan untuk seluruh AI Models & Agents tanpa batas waktu kedaluwarsa.
            </p>

            <div className="space-y-2 mb-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.credits}
                  onClick={() => setSelectedPackage(pkg.credits)}
                  className={`p-3 rounded-2xl border-2 border-[#171717] flex items-center justify-between cursor-pointer transition ${
                    selectedPackage === pkg.credits
                      ? 'bg-[#C9F2D5] neo-shadow-sm font-bold'
                      : 'bg-white dark:bg-[#232522]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-700" />
                    <div>
                      <p className="text-xs font-extrabold leading-tight">
                        +{formatNumber(pkg.credits)} Credit
                      </p>
                      {pkg.popular && (
                        <span className="text-[9px] bg-[#FBE7B2] text-amber-900 px-1.5 py-0.2 rounded border border-[#171717]">
                          Paling Hemat
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black">{pkg.price}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 py-2 text-xs font-bold rounded-xl border-2 border-[#171717] bg-white dark:bg-gray-800"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onTopUp(selectedPackage);
                  setShowTopUpModal(false);
                }}
                className="flex-1 neo-btn bg-[#C9F2D5] text-[#171717] py-2 text-xs font-black"
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
