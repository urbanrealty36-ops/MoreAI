"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { getPortalAuth } from "@/lib/client";

const field = "w-full rounded-xl border-2 border-[#171717] bg-white px-3 py-3 text-sm text-[#171717] outline-none";
const action = "neo-btn min-h-11 rounded-xl border-2 border-[#171717] px-4 py-2 text-sm font-extrabold disabled:opacity-50";

export function PortalAuthGate({ title, children }: { title: string; children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    try {
      const auth = getPortalAuth();
      void auth.auth.getSession().then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError("Sesi tidak dapat dibaca.");
        setSignedInAs(data.session?.user.email ?? null);
        setReady(true);
      });
      const { data } = auth.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setSignedInAs(session?.user.email ?? null);
      });
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Konfigurasi Auth tidak tersedia.");
      setReady(true);
    }
  }, []);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await getPortalAuth().auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      setPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await getPortalAuth().auth.signOut();
      if (authError) throw authError;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Logout gagal.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <p className="rounded-xl border-2 border-[#171717] bg-white p-4 text-sm font-bold">Memeriksa sesi…</p>;

  if (!signedInAs) {
    return (
      <section className="neo-card mx-auto max-w-md p-5">
        <h2 className="text-lg font-black">{title}</h2>
        <p className="mt-1 text-xs text-[#66645E]">Masuk menggunakan akun MoreAI. Izin akses tetap diperiksa oleh FastAPI.</p>
        {error && <p role="alert" className="mt-3 rounded-lg bg-[#F9D8E5] p-2 text-xs font-bold text-[#7D1F35]">{error}</p>}
        <form className="mt-4 space-y-3" onSubmit={signIn}>
          <input className={field} type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email" required />
          <input className={field} type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Kata sandi" required />
          <button className={`${action} w-full bg-[#C9F2D5]`} disabled={busy}>{busy ? "Memproses…" : "Masuk"}</button>
        </form>
      </section>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[#171717] bg-white p-3">
        <p className="text-xs font-bold">Sesi aktif: {signedInAs}</p>
        <button className={action} onClick={() => void signOut()} disabled={busy}>Keluar</button>
      </div>
      {error && <p role="alert" className="mb-3 rounded-lg bg-[#F9D8E5] p-2 text-xs font-bold text-[#7D1F35]">{error}</p>}
      {children}
    </div>
  );
}
