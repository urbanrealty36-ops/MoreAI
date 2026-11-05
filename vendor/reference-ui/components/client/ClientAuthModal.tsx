'use client';

import React, { useState } from 'react';
import { MascotIcon } from '../shared/MascotIcon';
import { X, Lock, Mail, User, Check, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string, email: string) => void;
}

export const ClientAuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('Budi Santoso');
  const [email, setEmail] = useState('budi@moreai.id');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(name, email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-6 neo-shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl border border-[#171717] bg-white dark:bg-gray-800 text-xs font-bold hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="p-1 rounded-2xl bg-white border-2 border-[#171717] neo-shadow-sm mb-2">
            <MascotIcon size={46} mood="happy" />
          </div>
          <h2 className="text-lg font-black text-[#171717] dark:text-[#F7F4EC]">
            {mode === 'login' ? 'Masuk ke Akunmu' : 'Buat Akun MoreAI'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {mode === 'login'
              ? 'Mulai perjalanan AI kamu bersama MoreAI.'
              : 'Daftar gratis dan dapatkan 100 AI Credit pertama.'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-[#171717] mb-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition ${
              mode === 'login'
                ? 'bg-white dark:bg-[#232522] text-[#171717] dark:text-white border border-[#171717] neo-shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition ${
              mode === 'register'
                ? 'bg-white dark:bg-[#232522] text-[#171717] dark:text-white border border-[#171717] neo-shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none"
                />
                <User className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@moreai.id"
                className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none"
              />
              <Mail className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                Kata Sandi
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="text-[10px] text-gray-500 hover:text-black hover:underline"
                >
                  Lupa kata sandi?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border border-[#171717]"
              />
              <span className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">
                Saya setuju dengan <strong>Syarat & Ketentuan</strong> serta <strong>Kebijakan Privasi</strong> MoreAI.
              </span>
            </label>
          )}

          <button
            type="submit"
            className="w-full neo-btn bg-[#C9F2D5] hover:bg-[#b0f0bf] text-[#171717] py-2.5 text-xs font-black mt-2 neo-shadow"
          >
            {mode === 'login' ? 'Masuk ke MoreAI' : 'Daftar Sekarang'}
          </button>
        </form>

        {/* Social Logins */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-[10px] text-gray-500 font-semibold mb-2">atau masuk dengan</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSuccess('Google User', 'user@gmail.com');
                onClose();
              }}
              className="neo-btn bg-white dark:bg-gray-800 text-xs py-1.5 flex items-center justify-center gap-1.5"
            >
              <span className="font-bold text-red-600">G</span>
              <span>Google</span>
            </button>
            <button
              onClick={() => {
                onSuccess('Apple User', 'user@apple.com');
                onClose();
              }}
              className="neo-btn bg-white dark:bg-gray-800 text-xs py-1.5 flex items-center justify-center gap-1.5"
            >
              <span className="font-bold"></span>
              <span>Apple</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
