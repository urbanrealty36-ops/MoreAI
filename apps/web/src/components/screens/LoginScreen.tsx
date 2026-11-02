'use client';

import React, { useState } from 'react';
import { MengguCharacter } from '../shared/MengguCharacter';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onSuccess: (email: string, password: string, rememberEmail: boolean) => void | Promise<void>;
  onOAuth: (provider: 'google' | 'apple') => void;
  onForgotPassword: (email: string) => void;
  busy?: boolean;
  error?: string;
  notice?: string;
  onGoToRegister: () => void;
  onBackToOnboarding: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onGoToRegister,
  onBackToOnboarding,
  onOAuth,
  onForgotPassword,
  busy = false,
  error,
  notice,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("moreai_login_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSuccess(email, password, rememberMe);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#F7F4EC] dark:bg-[#1E201D] flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToOnboarding}
          className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1"
        >
          ← Kembali
        </button>
        <span className="font-black text-sm text-[#171717] dark:text-[#F7F4EC]">
          More<span className="text-emerald-600">AI</span>
        </span>
        <div className="w-8" />
      </div>

      {/* Main Form Content */}
      <div className="my-auto py-4">
        {/* Cartoon Menggu Header */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-2">
            <MengguCharacter size={100} mood={showPassword ? 'thinking' : 'happy'} />
          </div>
          <h1 className="text-2xl font-black text-[#171717] dark:text-[#F7F4EC] tracking-tight">
            Masuk ke Akunmu
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">
            Gunakan akun MoreAI untuk mengakses Workspace, Agen, dan Kuota.
          </p>
        </div>

        {error && <p role="alert" className="mb-3 rounded-xl border-2 border-[#171717] bg-[#F9D8E5] p-3 text-xs font-bold text-[#7D1F35]">{error}</p>}
      {notice && <p role="status" className="mb-3 rounded-xl border-2 border-[#171717] bg-[#C9F2D5] p-3 text-xs font-bold text-[#174E2C]">{notice}</p>}

      {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-black text-[#171717] dark:text-[#F7F4EC] block mb-1">
              Email atau Username
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@moreai.id"
                className="w-full text-xs font-semibold px-3 py-2.5 bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none pr-8"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black text-[#171717] dark:text-[#F7F4EC]">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => onForgotPassword(email)}
                className="text-[10px] font-bold text-gray-500 hover:text-black hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs font-semibold px-3 py-2.5 bg-white dark:bg-[#232522] text-[#171717] dark:text-[#F7F4EC] border-2 border-[#171717] rounded-xl neo-shadow-sm outline-none pr-9 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-[#171717] accent-emerald-500"
              />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Ingat email</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full neo-btn bg-[#C9F2D5] hover:bg-[#b0f0bf] text-[#171717] py-3 text-xs font-black mt-2 neo-shadow text-sm disabled:opacity-50"
          >
            {busy ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        {/* Social Logins */}
        <div className="mt-5 text-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2.5">
            atau masuk dengan
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOAuth('google')}
              disabled={busy}
              className="neo-btn bg-white dark:bg-[#232522] text-xs py-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="font-black text-red-500">G</span>
              <span className="font-bold">Google</span>
            </button>
            <button
              onClick={() => onOAuth('apple')}
              className="neo-btn bg-white dark:bg-[#232522] text-xs py-2 flex items-center justify-center gap-2"
            >
              <span className="font-black"></span>
              <span className="font-bold">Apple</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          Belum punya akun?{' '}
          <button
            onClick={onGoToRegister}
            className="font-black text-[#171717] dark:text-white underline"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
};
