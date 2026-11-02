"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoginScreen } from "@/components/screens/LoginScreen";
import { RegisterScreen } from "@/components/screens/RegisterScreen";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "register" | "recovery";

export default function WorkspaceAuth() {
  const [mode, setMode] = useState<Mode>("login");
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase Auth belum dikonfigurasi pada environment ini.");
      setReady(true);
      return;
    }
    let active = true;
    if (window.location.hash.includes("type=recovery")) setMode("recovery");
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError("Sesi autentikasi tidak dapat dibaca.");
      setSignedInAs(data.session?.user.email ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setSignedInAs(session?.user.email ?? null);
      if (event === "PASSWORD_RECOVERY") setMode("recovery");
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (userEmail: string, password: string, rememberEmail: boolean) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase Auth belum dikonfigurasi.");
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail.trim(),
        password,
      });
      if (authError) throw authError;
      setSignedInAs(data.user.email ?? userEmail.trim());
      if (rememberEmail) window.localStorage.setItem("moreai_login_email", userEmail.trim());
      else window.localStorage.removeItem("moreai_login_email");
      setNotice("Berhasil masuk. Data bisnis tetap diakses melalui FastAPI.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
  };

  const register = async (name: string, userEmail: string, password: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase Auth belum dikonfigurasi.");
      const { data, error: authError } = await supabase.auth.signUp({
        email: userEmail.trim(),
        password,
        options: { data: { display_name: name.trim() } },
      });
      if (authError) throw authError;
      if (data.session) {
        setSignedInAs(data.user?.email ?? userEmail.trim());
        setNotice("Akun berhasil dibuat dan sesi aktif.");
      } else {
        setMode("login");
        setNotice("Pendaftaran diterima. Verifikasi email diperlukan sebelum masuk.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pendaftaran gagal.");
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase Auth belum dikonfigurasi.");
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (authError) throw authError;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login OAuth gagal.");
      setBusy(false);
    }
  };

  const forgotPassword = async (userEmail: string) => {
    if (!userEmail.trim()) {
      setError("Masukkan email terlebih dahulu.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase Auth belum dikonfigurasi.");
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        userEmail.trim(),
        { redirectTo: window.location.origin },
      );
      if (authError) throw authError;
      setNotice("Jika email terdaftar, instruksi pemulihan akan dikirim.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Permintaan pemulihan gagal.");
    } finally {
      setBusy(false);
    }
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase Auth belum dikonfigurasi.");
      const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
      if (authError) throw authError;
      setNewPassword("");
      setMode("login");
      setNotice("Kata sandi berhasil diperbarui.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pembaruan kata sandi gagal.");
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
      setSignedInAs(null);
      setMode("login");
      setNotice("Anda telah keluar.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Logout gagal.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return <div className="min-h-screen bg-[#F7F4EC] p-6 text-center text-xs font-bold">Memeriksa sesi MoreAI…</div>;

  if (mode === "recovery") {
    return (
      <section className="mx-auto max-w-md bg-[#F7F4EC] p-5 text-[#171717]">
        <h1 className="text-xl font-black">Atur kata sandi baru</h1>
        {error && <p role="alert" className="mt-3 rounded-xl border-2 border-[#171717] bg-[#F9D8E5] p-3 text-xs font-bold">{error}</p>}
        <form onSubmit={updatePassword} className="mt-4 space-y-3">
          <input className="w-full rounded-xl border-2 border-[#171717] bg-white px-3 py-3 text-sm" type="password" minLength={8} value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="Kata sandi baru" required />
          <button className="neo-btn w-full bg-[#C9F2D5] p-3 text-sm font-black disabled:opacity-50" disabled={busy}>{busy ? "Menyimpan…" : "Perbarui kata sandi"}</button>
        </form>
      </section>
    );
  }

  if (signedInAs) {
    return (
      <section className="mx-auto max-w-md bg-[#F7F4EC] p-5 text-[#171717]">
        <div className="rounded-2xl border-2 border-[#171717] bg-white p-5 neo-shadow">
          <h1 className="text-xl font-black">Sesi MoreAI aktif</h1>
          <p className="mt-2 text-sm">{signedInAs}</p>
          <p className="mt-3 text-xs text-[#66645E]">Autentikasi berhasil. Workspace bisnis belum diaktifkan sampai chat history, agent runtime dan API persistence lulus acceptance. Tidak ada data contoh yang ditampilkan.</p>
          {notice && <p role="status" className="mt-3 rounded-lg bg-[#C9F2D5] p-2 text-xs font-bold">{notice}</p>}
          {error && <p role="alert" className="mt-3 rounded-lg bg-[#F9D8E5] p-2 text-xs font-bold">{error}</p>}
          <button className="neo-btn mt-4 w-full bg-[#D9D5FF] p-3 text-sm font-black disabled:opacity-50" onClick={() => void signOut()} disabled={busy}>Keluar</button>
        </div>
      </section>
    );
  }

  if (mode === "register") {
    return (
      <RegisterScreen
        onSuccess={register}
        onGoToLogin={() => { setMode("login"); setError(""); setNotice(""); }}
        busy={busy}
        error={error}
        notice={notice}
      />
    );
  }

  return (
    <LoginScreen
      onSuccess={signIn}
      onOAuth={provider => void oauth(provider)}
      onForgotPassword={userEmail => void forgotPassword(userEmail)}
      onGoToRegister={() => { setMode("register"); setError(""); setNotice(""); }}
      onBackToOnboarding={() => { setMode("login"); setError(""); }}
      busy={busy}
      error={error}
      notice={notice}
    />
  );
}
