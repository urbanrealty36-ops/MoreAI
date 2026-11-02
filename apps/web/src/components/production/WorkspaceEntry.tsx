"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AgentRun } from "@moreai/api-client";
import { ApiRequestError } from "@moreai/api-client";
import { getMoreAIApi } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "register" | "reset";

const inputClass =
  "w-full rounded-xl border-2 border-[#171717] bg-white px-3 py-3 text-sm text-[#171717] outline-none focus:ring-2 focus:ring-[#8BCF9D]";
const buttonClass =
  "neo-btn inline-flex min-h-11 items-center justify-center px-4 py-2 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50";

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) {
    const detail = error.payload as { detail?: { code?: string; message?: string }; message?: string } | undefined;
    return detail?.detail?.message ?? detail?.message ?? "Permintaan API MoreAI gagal.";
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba kembali.";
}

export default function WorkspaceEntry() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState("");

  const refreshRuns = useCallback(async () => {
    setRunsLoading(true);
    setRunsError("");
    try {
      const result = await getMoreAIApi().agents.list();
      setRuns(result.items);
    } catch (cause) {
      setRunsError(messageFor(cause));
      setRuns([]);
    } finally {
      setRunsLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Konfigurasi Supabase Auth belum tersedia pada environment aplikasi.");
      setSessionReady(true);
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError("Sesi autentikasi tidak dapat dibaca.");
      setUserEmail(data.session?.user.email ?? null);
      setSessionReady(true);
      if (data.session) void refreshRuns();
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUserEmail(session?.user.email ?? null);
      if (session) void refreshRuns();
      else setRuns([]);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [refreshRuns]);

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase Auth belum dikonfigurasi.");
      if (mode === "register") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim() } },
        });
        if (authError) throw authError;
        if (data.session) {
          setUserEmail(data.user?.email ?? email.trim());
          setNotice("Pendaftaran berhasil. Akun Anda sudah masuk.");
        } else {
          setNotice("Pendaftaran diterima. Periksa email untuk menyelesaikan verifikasi sebelum masuk.");
          setMode("login");
        }
      } else if (mode === "reset") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (authError) throw authError;
        setNotice("Jika email terdaftar, instruksi pemulihan akan dikirim.");
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        setUserEmail(data.user.email ?? email.trim());
        setPassword("");
        setNotice("Berhasil masuk ke MoreAI.");
        await refreshRuns();
      }
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase Auth belum dikonfigurasi.");
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      setUserEmail(null);
      setRuns([]);
      setAnswer("");
      setNotice("Anda telah keluar.");
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };

  const askAI = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    setBusy(true);
    setError("");
    setAnswer("");
    try {
      const result = await getMoreAIApi().llm.generate(
        { prompt: prompt.trim(), max_output_tokens: 2048 },
        crypto.randomUUID(),
      );
      setAnswer(result.text);
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };

  const createAgentRun = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setError("");
    try {
      await getMoreAIApi().agents.create({ prompt: prompt.trim(), agent_key: "manus" }, crypto.randomUUID());
      setNotice("Tugas berhasil dikirim ke antrean agent.");
      setPrompt("");
      await refreshRuns();
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };

  if (!sessionReady) {
    return <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6"><p className="text-sm font-bold">Memeriksa sesi MoreAI…</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#F7F4EC] px-4 py-6 text-[#171717] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#526257]">AI Workspace & Agent Platform</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">More<span className="text-emerald-700">AI</span></h1>
          </div>
          {userEmail && (
            <div className="flex items-center gap-3">
              <span className="max-w-56 truncate text-xs font-bold text-[#5D625B]">{userEmail}</span>
              <button className={buttonClass} disabled={busy} onClick={() => void signOut()}>Keluar</button>
            </div>
          )}
        </header>

        {(error || notice) && (
          <div role={error ? "alert" : "status"} className={`mb-4 rounded-xl border-2 border-[#171717] p-3 text-sm font-semibold ${error ? "bg-[#F9D8E5] text-[#7D1F35]" : "bg-[#C9F2D5] text-[#174E2C]"}`}>
            {error || notice}
          </div>
        )}

        {!userEmail ? (
          <section className="neo-card mx-auto max-w-md p-5 sm:p-7">
            <h2 className="text-xl font-black">{mode === "register" ? "Buat akun MoreAI" : mode === "reset" ? "Pulihkan akses akun" : "Masuk ke MoreAI"}</h2>
            <p className="mt-1 text-sm text-[#66645E]">Autentikasi menggunakan Supabase Auth. Tidak ada akun contoh atau kredensial bawaan.</p>
            <form className="mt-5 space-y-3" onSubmit={submitAuth}>
              {mode === "register" && <input className={inputClass} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Nama lengkap" aria-label="Nama lengkap" autoComplete="name" required />}
              <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" aria-label="Email" autoComplete="email" required />
              {mode !== "reset" && <input className={inputClass} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Kata sandi" aria-label="Kata sandi" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={8} required />}
              <button className={`${buttonClass} w-full bg-[#C9F2D5]`} disabled={busy}>{busy ? "Memproses…" : mode === "register" ? "Daftar" : mode === "reset" ? "Kirim instruksi pemulihan" : "Masuk"}</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold">
              <button onClick={() => { setMode("login"); setError(""); setNotice(""); }}>Masuk</button>
              <button onClick={() => { setMode("register"); setError(""); setNotice(""); }}>Daftar akun</button>
              <button onClick={() => { setMode("reset"); setError(""); setNotice(""); }}>Lupa kata sandi</button>
            </div>
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="neo-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-black">Workspace</h2>
                <span className="rounded-full border border-[#171717] bg-[#D8ECFF] px-3 py-1 text-[11px] font-black">API FastAPI</span>
              </div>
              <form className="mt-4 space-y-3" onSubmit={askAI}>
                <label className="block text-xs font-extrabold" htmlFor="workspace-prompt">Apa yang ingin Anda kerjakan?</label>
                <textarea id="workspace-prompt" className={`${inputClass} min-h-36 resize-y`} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Tulis pertanyaan atau instruksi…" maxLength={12000} required />
                <div className="flex flex-wrap gap-2">
                  <button className={`${buttonClass} bg-[#C9F2D5]`} disabled={busy || !prompt.trim()}>{busy ? "Memproses…" : "Kirim ke AI"}</button>
                  <button type="button" className={`${buttonClass} bg-[#D9D5FF]`} disabled={busy || !prompt.trim()} onClick={() => void createAgentRun()}>Buat tugas Agent</button>
                </div>
              </form>
              {answer && <article className="mt-5 rounded-xl border-2 border-[#171717] bg-[#F1EFE8] p-4"><h3 className="text-xs font-black uppercase">Jawaban</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{answer}</p></article>}
              <p className="mt-4 text-[11px] text-[#66645E]">Jawaban AI diproses melalui API MoreAI. Riwayat percakapan persisten belum diaktifkan pada tahap migrasi ini.</p>
            </section>

            <section className="neo-card p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-black">Tugas Agent</h2>
                <button className="text-xs font-extrabold underline" onClick={() => void refreshRuns()} disabled={runsLoading}>Muat ulang</button>
              </div>
              {runsLoading ? <p className="mt-4 text-sm text-[#66645E]">Memuat tugas…</p> : runsError ? <p role="alert" className="mt-4 text-sm font-semibold text-[#9B1C1C]">{runsError}</p> : runs.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-[#AAA69B] p-4 text-sm text-[#66645E]">Belum ada tugas Agent untuk akun ini.</p> : (
                <ul className="mt-4 space-y-2">
                  {runs.map(run => <li key={run.id} className="rounded-xl border border-[#D2CFC6] bg-white p-3"><div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] text-[#66645E]">{run.id.slice(0, 8)}</span><span className="rounded-full bg-[#FBE7B2] px-2 py-1 text-[10px] font-black">{run.status}</span></div><p className="mt-1 text-[11px] text-[#66645E]">Dibuat {new Date(run.created_at).toLocaleString("id-ID")}</p></li>)}
                </ul>
              )}
              <p className="mt-4 text-[11px] text-[#66645E]">Data daftar tugas berasal dari endpoint terautentikasi FastAPI.</p>
            </section>
          </div>
        )}
        <footer className="mt-8 text-center text-[10px] font-semibold text-[#77736A]">MoreAI · Production integration in progress · Tidak menggunakan data demo</footer>
      </div>
    </main>
  );
}
