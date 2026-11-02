import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";
import type { AgentRun } from "@moreai/api-client";
import { getMobileApi, getMobileAuth } from "../src/lib/api";

const palette = { ink: "#171717", paper: "#F7F4EC", mint: "#C9F2D5", yellow: "#FBE7B2", muted: "#6B6B65" };

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prompt, setPrompt] = useState("");
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      const result = await getMobileApi().agents.list();
      setRuns(result.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Data agent tidak dapat dimuat.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    try {
      const auth = getMobileAuth();
      auth.auth.getSession().then(({ data }) => {
        if (active && data.session) {
          setSignedIn(true);
          void refresh();
        }
      });
      const { data } = auth.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setSignedIn(Boolean(session));
        if (session) void refresh();
        else setRuns([]);
      });
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Konfigurasi Auth tidak tersedia.");
    }
  }, [refresh]);

  const signIn = async () => {
    setBusy(true); setError(""); setNotice("");
    try {
      const { error: authError } = await getMobileAuth().auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      setSignedIn(true); setPassword(""); setNotice("Berhasil masuk.");
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Login gagal."); }
    finally { setBusy(false); }
  };

  const signOut = async () => {
    setBusy(true);
    try { await getMobileAuth().auth.signOut(); setSignedIn(false); setRuns([]); }
    catch (e) { setError(e instanceof Error ? e.message : "Logout gagal."); }
    finally { setBusy(false); }
  };

  const createRun = async () => {
    if (!prompt.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await getMobileApi().agents.create({ prompt: prompt.trim(), agent_key: "manus" }, Crypto.randomUUID());
      setPrompt(""); setNotice("Tugas masuk antrean worker."); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Tugas gagal dikirim."); }
    finally { setBusy(false); }
  };

  const runAction = async (run: AgentRun, action: "cancel" | "resume") => {
    setBusy(true); setError(""); setNotice("");
    try {
      if (action === "cancel") await getMobileApi().agents.cancel(run.id);
      else await getMobileApi().agents.resume(run.id);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Aksi agent gagal."); }
    finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.paper }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ backgroundColor: palette.mint, borderWidth: 2, borderColor: palette.ink, borderRadius: 18, padding: 18 }}>
          <Text style={{ color: palette.ink, fontSize: 24, fontWeight: "900" }}>MoreAI</Text>
          <Text style={{ color: palette.ink, marginTop: 4 }}>AI Workspace · Agent Runtime</Text>
        </View>

        {!!error && <Text accessibilityRole="alert" style={{ color: "#9B1C1C", fontWeight: "700" }}>{error}</Text>}
        {!!notice && <Text style={{ color: "#176B3A", fontWeight: "700" }}>{notice}</Text>}

        {!signedIn ? (
          <View style={{ backgroundColor: "white", borderWidth: 2, borderColor: palette.ink, borderRadius: 16, padding: 16, gap: 12 }}>
            <Text style={{ color: palette.ink, fontSize: 18, fontWeight: "800" }}>Masuk ke MoreAI</Text>
            <TextInput accessibilityLabel="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email" style={{ borderWidth: 1, borderColor: palette.ink, borderRadius: 10, padding: 12 }} />
            <TextInput accessibilityLabel="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" style={{ borderWidth: 1, borderColor: palette.ink, borderRadius: 10, padding: 12 }} />
            <Pressable disabled={busy || !email || !password} onPress={signIn} style={{ backgroundColor: palette.ink, borderRadius: 10, padding: 14, alignItems: "center", opacity: busy ? 0.6 : 1 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>{busy ? "Memproses…" : "Masuk"}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: palette.ink, fontSize: 18, fontWeight: "900" }}>Agent Workspace</Text>
              <Pressable onPress={signOut}><Text style={{ color: palette.ink, fontWeight: "700" }}>Keluar</Text></Pressable>
            </View>
            <View style={{ backgroundColor: "white", borderWidth: 2, borderColor: palette.ink, borderRadius: 16, padding: 16, gap: 12 }}>
              <Text style={{ color: palette.ink, fontWeight: "800" }}>Buat tugas baru</Text>
              <TextInput multiline value={prompt} onChangeText={setPrompt} placeholder="Jelaskan tugas yang ingin dikerjakan agent…" style={{ minHeight: 100, textAlignVertical: "top", borderWidth: 1, borderColor: palette.ink, borderRadius: 10, padding: 12, color: palette.ink }} />
              <Pressable disabled={busy || !prompt.trim()} onPress={createRun} style={{ backgroundColor: palette.mint, borderWidth: 2, borderColor: palette.ink, borderRadius: 10, padding: 13, alignItems: "center", opacity: busy ? 0.6 : 1 }}>
                <Text style={{ color: palette.ink, fontWeight: "900" }}>{busy ? "Memproses…" : "Jalankan Agent"}</Text>
              </Pressable>
            </View>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: palette.ink, fontSize: 18, fontWeight: "900" }}>Riwayat Tugas</Text>
                <Pressable onPress={refresh}><Text style={{ color: palette.ink, fontWeight: "700" }}>Refresh</Text></Pressable>
              </View>
              {runs.length === 0 ? <Text style={{ color: palette.muted }}>Belum ada tugas agent.</Text> : runs.map((run) => (
                <View key={run.id} style={{ backgroundColor: "white", borderWidth: 1, borderColor: palette.ink, borderRadius: 12, padding: 13, gap: 8 }}>
                  <Text style={{ color: palette.ink, fontWeight: "800" }}>{run.status.toUpperCase()}</Text>
                  <Text numberOfLines={3} style={{ color: palette.muted }}>{run.id}</Text>
                  <Text style={{ color: palette.muted }}>Percobaan {run.attempt}/{run.max_attempts}</Text>
                  {run.status === "running" || run.status === "queued" ? <Pressable onPress={() => runAction(run, "cancel")}><Text style={{ color: "#9B1C1C", fontWeight: "700" }}>Batalkan</Text></Pressable> : null}
                  {run.status === "failed" || run.status === "cancelled" || run.status === "expired" ? <Pressable onPress={() => runAction(run, "resume")}><Text style={{ color: palette.ink, fontWeight: "700" }}>Lanjutkan</Text></Pressable> : null}
                </View>
              ))}
            </View>
          </>
        )}
        {busy ? <ActivityIndicator color={palette.ink} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
