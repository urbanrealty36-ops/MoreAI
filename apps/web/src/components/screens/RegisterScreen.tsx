'use client';

import React, { useState } from 'react';
import { MengguCharacter } from '../shared/MengguCharacter';
import { User, Mail, Lock, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';

interface RegisterScreenProps {
  onSuccess: (name: string, email: string, password: string) => void | Promise<void>;
  busy?: boolean;
  error?: string;
  notice?: string;
  onGoToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onSuccess,
  onGoToLogin,
  busy = false,
  error,
  notice,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setValidationError('Konfirmasi kata sandi tidak sama.');
      return;
    }
    setValidationError('');
    void onSuccess(name, email, password);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#F7F4EC] dark:bg-[#1E201D] flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onGoToLogin}
          className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1"
        >
          ← Masuk
        </button>
        <span className="font-black text-sm text-[#171717] dark:text-[#F7F4EC]">
          More<span className="text-emerald-600">AI</span>
        </span>
        <div className="w-8" />
      </div>

      {/* Main Form Content */}
      <div className="my-auto py-3">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-1">
            <MengguCharacter size={88} mood="excited" />
          </div>
          <h1 className="text-2xl font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight">
            Buat Akun MoreAI
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
            Mulai perjalanan AI kamu dengan Workspace dan Agent MoreAI.
          </p>
        </div>

        {error && <p role="alert" className="mb-3 rounded-xl border-2 border-[#171717] bg-[#F9D8E5] p-3 text-xs font-bold text-[#7D1F35]">{error}</p>}
        {validationError && <p role="alert" className="mb-3 rounded-xl border-2 border-[#171717] bg-[#F9D8E5] p-3 text-xs font-bold text-[#7D1F35]">{validationError}</p>}
        {notice && <p role="status" className="mb-3 rounded-xl border-2 border-[#171717] bg-[#C9F2D5] p-3 text-xs font-bold text-[#174E2C]">{notice}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] block mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Budi Santoso"
                className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none pr-8"
              />
              <User className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] block mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@moreai.id"
                className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none pr-8"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] block mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none pr-8 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] block mb-1">
                Konfirmasi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none pr-8 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
              className="w-4 h-4 rounded border-2 border-[#171717] accent-emerald-500 mt-0.5"
            />
            <span className="text-[11px] text-gray-700 dark:text-gray-300 leading-tight">
              Saya setuju dengan <strong>Syarat & Ketentuan</strong> serta{' '}
              <strong>Kebijakan Privasi</strong> MoreAI.
            </span>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full neo-btn bg-[#C9F2D5] hover:bg-[#b0f0bf] text-[#171717] py-3 text-xs font-black mt-2 neo-shadow text-sm disabled:opacity-50"
          >
            {busy ? 'Memproses…' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          Sudah punya akun?{' '}
          <button
            onClick={onGoToLogin}
            className="font-black text-[#171717] dark:text-white underline"
          >
            Masuk ke Akun
          </button>
        </p>
      </div>
    </div>
  );
};
