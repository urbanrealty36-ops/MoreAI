"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { getPortalApi } from "../../lib/client";

type Data = {
  overview?: Record<string, number>;
  users?: unknown[];
  models: any[];
  providers: any[];
  audit: any[];
  permissionMatrix?: { roles: any[]; permissions: any[] } | null;
  llmRouting: any[];
  partners: any[];
  verificationMethods: any[];
  networkPolicies: any[];
  error?: string;
  loading: boolean;
};

export function AdminOperations() {
  const [data, setData] = useState<Data>({
    loading: true, models: [], providers: [], audit: [], llmRouting: [],
    partners: [], verificationMethods: [], networkPolicies: [],
  });
  const [providerKey, setProviderKey] = useState<"google" | "openai" | "anthropic">("google");
  const [providerName, setProviderName] = useState("");
  const [modelProviderId, setModelProviderId] = useState("");
  const [modelKey, setModelKey] = useState("");
  const [modelName, setModelName] = useState("");
  const [inputCost, setInputCost] = useState("0");
  const [outputCost, setOutputCost] = useState("0");
  const [maxInput, setMaxInput] = useState("");
  const [maxOutput, setMaxOutput] = useState("");
  const [capabilities, setCapabilities] = useState("general");
  const [routeModelId, setRouteModelId] = useState("");
  const [fallbackModelId, setFallbackModelId] = useState("");
  const [routePriority, setRoutePriority] = useState("100");
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const api = getPortalApi();
    const [overview, users, models, providers, audit, verification, policies, permissionMatrix, llmRouting, partners] = await Promise.all([
      api.admin.overview(), api.admin.users(), api.admin.models(), api.admin.providers(),
      api.admin.audit(), api.admin.verificationMethods(), api.admin.networkPolicies(),
      api.admin.permissionMatrix().catch(() => null), api.admin.llmRouting().catch(() => null),
      api.admin.partners("pending").catch(() => null),
    ]);
    setData({
      loading: false, overview, users: users.items, models: models.items as any[],
      providers: providers.items, audit: audit.items, verificationMethods: verification.items,
      networkPolicies: policies.items, permissionMatrix, llmRouting: llmRouting?.items ?? [],
      partners: partners?.items ?? [],
    });
  }, []);

  useEffect(() => {
    let live = true;
    refresh().catch((error) => {
      if (live) setData((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : "Admin data unavailable" }));
    });
    return () => { live = false; };
  }, [refresh]);

  async function runAction(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    setData((current) => ({ ...current, error: undefined }));
    try { await action(); await refresh(); }
    catch (error) { setData((current) => ({ ...current, error: error instanceof Error ? error.message : "Operasi gagal" })); }
    finally { setBusy(null); }
  }

  async function createProvider(event: FormEvent) {
    event.preventDefault();
    await runAction("provider-create", () => getPortalApi().admin.createProvider({ key: providerKey, display_name: providerName.trim(), enabled: false }));
    setProviderName("");
  }

  async function createModel(event: FormEvent) {
    event.preventDefault();
    if (!modelProviderId) return;
    await runAction("model-create", () => getPortalApi().admin.createModel({
      provider_id: modelProviderId, key: modelKey.trim(), display_name: modelName.trim(),
      input_cost_per_million: Number(inputCost), output_cost_per_million: Number(outputCost),
      max_input_tokens: maxInput ? Number(maxInput) : null,
      max_output_tokens: maxOutput ? Number(maxOutput) : null,
      capabilities: capabilities.split(",").map((value) => value.trim()).filter(Boolean),
      enabled: false,
    }));
    setModelKey(""); setModelName("");
  }

  async function createRoute(event: FormEvent) {
    event.preventDefault();
    if (!routeModelId) return;
    await runAction("route-create", () => getPortalApi().admin.createRouting({
      task_type: "general", model_id: routeModelId,
      fallback_model_id: fallbackModelId || null, priority: Number(routePriority), enabled: false,
    }));
  }

  async function toggleProvider(provider: any, enabled: boolean) {
    await runAction(`provider-${provider.id}`, () => getPortalApi().admin.updateProvider(provider.id, { display_name: provider.display_name, enabled }));
  }

  async function toggleModel(model: any, enabled: boolean) {
    await runAction(`model-${model.id}`, () => getPortalApi().admin.updateModel(model.id, {
      provider_id: model.provider_id, key: model.key, display_name: model.display_name,
      input_cost_per_million: Number(model.input_cost_per_million), output_cost_per_million: Number(model.output_cost_per_million),
      max_input_tokens: model.max_input_tokens ?? null, max_output_tokens: model.max_output_tokens ?? null,
      capabilities: model.capabilities ?? [], enabled,
    }));
  }

  async function toggleRoute(route: any, enabled: boolean) {
    await runAction(`route-${route.id}`, () => getPortalApi().admin.updateRouting(route.id, {
      task_type: "general", model_id: route.model_id, fallback_model_id: route.fallback_model_id ?? null,
      priority: route.priority, enabled,
    }));
  }

  async function reviewPartner(partnerId: string, decision: "approve" | "reject") {
    await runAction(`partner-${partnerId}`, () => getPortalApi().admin.reviewPartner(partnerId, { decision }));
  }

  async function toggleMethod(methodKey: string, enabled: boolean) {
    await runAction(`method-${methodKey}`, () => getPortalApi().admin.setVerificationMethodAvailability(methodKey as any, enabled));
  }

  async function saveSecretReference(networkId: string, secretReference: string) {
    await runAction(`secret-${networkId}`, () => getPortalApi().admin.setMikrotikSecretReference(networkId, secretReference));
  }

  if (data.loading) return <p className="rounded-xl border border-[#171717] bg-white p-4 text-sm">Memuat data operasional dari FastAPI…</p>;

  const stats = [["Pengguna", data.overview?.users ?? 0], ["Mitra", data.overview?.partners ?? 0], ["Agent Runs", data.overview?.agent_runs ?? 0], ["Model", data.models.length]];

  return <section className="space-y-3">
    {data.error && <div className="rounded-xl border-2 border-amber-700 bg-amber-50 p-3 text-xs text-amber-950">{data.error}</div>}
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{stats.map(([label, value]) => <div key={String(label)} className="rounded-xl border-2 border-[#171717] bg-white p-3"><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-black">{value}</p></div>)}</div>

    <div className="rounded-xl border-2 border-[#171717] bg-white p-3">
      <h2 className="font-black">LLM Provider Registry</h2>
      <p className="text-xs text-gray-500">Credential tetap berada pada environment server. Provider baru dibuat nonaktif.</p>
      <form onSubmit={createProvider} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <select value={providerKey} onChange={(event) => setProviderKey(event.target.value as typeof providerKey)} className="rounded border p-2 text-xs"><option value="google">Google</option><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option></select>
        <input required minLength={2} maxLength={120} value={providerName} onChange={(event) => setProviderName(event.target.value)} placeholder="Nama provider" className="rounded border p-2 text-xs"/>
        <button disabled={busy !== null || !providerName.trim()} className="rounded border-2 border-[#171717] bg-[#D9D5FF] p-2 text-xs font-black disabled:opacity-50">{busy === "provider-create" ? "Menyimpan…" : "Tambah Provider"}</button>
      </form>
      <div className="mt-2 space-y-1">{data.providers.map((provider: any) => <div key={provider.id} className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-xs"><div><strong>{provider.display_name}</strong><p className="text-gray-500">{provider.key} · Credential {provider.credentials_configured ? "tersedia di server" : "belum dikonfigurasi"}</p></div><label className="flex items-center gap-2"><input type="checkbox" checked={provider.enabled} disabled={!provider.credentials_configured || busy !== null} onChange={(event) => void toggleProvider(provider, event.target.checked)}/>Enabled</label></div>)}
      {!data.providers.length && <p className="py-2 text-xs text-gray-500">Belum ada provider terdaftar. Tidak ada provider contoh yang dibuat.</p>}
    </div>

    <div className="rounded-xl border-2 border-[#171717] bg-white p-3">
      <h2 className="font-black">Model Registry</h2>
      <p className="text-xs text-gray-500">Biaya per satu juta token. Model baru nonaktif sampai provider dan credential siap.</p>
      <form onSubmit={createModel} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <select required value={modelProviderId} onChange={(event) => setModelProviderId(event.target.value)} className="rounded border p-2 text-xs"><option value="">Pilih provider</option>{data.providers.map((provider: any) => <option key={provider.id} value={provider.id}>{provider.display_name} ({provider.key})</option>)}</select>
        <input required value={modelKey} onChange={(event) => setModelKey(event.target.value)} placeholder="Provider model key" className="rounded border p-2 text-xs"/>
        <input required value={modelName} onChange={(event) => setModelName(event.target.value)} placeholder="Nama model" className="rounded border p-2 text-xs"/>
        <input required type="number" min="0" step="0.000001" value={inputCost} onChange={(event) => setInputCost(event.target.value)} placeholder="Input cost / 1M" className="rounded border p-2 text-xs"/>
        <input required type="number" min="0" step="0.000001" value={outputCost} onChange={(event) => setOutputCost(event.target.value)} placeholder="Output cost / 1M" className="rounded border p-2 text-xs"/>
        <input type="number" min="1" value={maxInput} onChange={(event) => setMaxInput(event.target.value)} placeholder="Max input tokens" className="rounded border p-2 text-xs"/>
        <input type="number" min="1" value={maxOutput} onChange={(event) => setMaxOutput(event.target.value)} placeholder="Max output tokens" className="rounded border p-2 text-xs"/>
        <input value={capabilities} onChange={(event) => setCapabilities(event.target.value)} placeholder="Capabilities, pisahkan koma" className="rounded border p-2 text-xs"/>
        <button disabled={busy !== null || !modelProviderId || !modelKey.trim() || !modelName.trim()} className="rounded border-2 border-[#171717] bg-[#C9F2D5] p-2 text-xs font-black disabled:opacity-50 sm:col-span-2">{busy === "model-create" ? "Menyimpan…" : "Tambah Model (Nonaktif)"}</button>
      </form>
      <div className="mt-3 space-y-1">{data.models.map((model: any) => <div key={model.id} className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-xs"><div><strong>{model.display_name}</strong><p className="text-gray-500">{model.provider?.key ?? model.provider_id} · {model.key} · Input {model.input_cost_per_million}/1M · Output {model.output_cost_per_million}/1M</p></div><label className="flex items-center gap-2"><input type="checkbox" checked={model.enabled} disabled={busy !== null || !model.provider?.enabled} onChange={(event) => void toggleModel(model, event.target.checked)}/>Enabled</label></div>)}
      {!data.models.length && <p className="py-2 text-xs text-gray-500">Belum ada model terdaftar. Tambahkan model yang sesuai dengan provider aktif.</p>}
    </div>

    <div className="rounded-xl border-2 border-[#171717] bg-white p-3">
      <h2 className="font-black">LLM Routing Policies</h2>
      <p className="text-xs text-gray-500">Routing general platform. Policy baru nonaktif; enable hanya jika primary dan fallback model siap.</p>
      <form onSubmit={createRoute} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <select required value={routeModelId} onChange={(event) => setRouteModelId(event.target.value)} className="rounded border p-2 text-xs"><option value="">Primary model</option>{data.models.map((model: any) => <option key={model.id} value={model.id}>{model.display_name}</option>)}</select>
        <select value={fallbackModelId} onChange={(event) => setFallbackModelId(event.target.value)} className="rounded border p-2 text-xs"><option value="">Tanpa fallback</option>{data.models.map((model: any) => <option key={model.id} value={model.id}>{model.display_name}</option>)}</select>
        <input type="number" min="0" value={routePriority} onChange={(event) => setRoutePriority(event.target.value)} className="rounded border p-2 text-xs" aria-label="Priority"/>
        <button disabled={busy !== null || !routeModelId} className="rounded border-2 border-[#171717] bg-[#FBE7B2] p-2 text-xs font-black disabled:opacity-50 sm:col-span-3">{busy === "route-create" ? "Menyimpan…" : "Tambah Routing (Nonaktif)"}</button>
      </form>
      <div className="mt-3 space-y-1">{data.llmRouting.map((route: any) => <div key={route.id} className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-xs"><div><strong>{route.model?.display_name ?? route.model?.key ?? route.model_id}</strong><p className="text-gray-500">Fallback: {route.fallback_model?.key ?? "—"} · Priority {route.priority} · {route.task_type}</p></div><label className="flex items-center gap-2"><input type="checkbox" checked={route.enabled} disabled={busy !== null} onChange={(event) => void toggleRoute(route, event.target.checked)}/>Enabled</label></div>)}
      {!data.llmRouting.length && <p className="py-2 text-xs text-gray-500">Belum ada routing policy. Tidak ada route default buatan.</p>}
    </div>

    <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Katalog Integrasi Verifikasi Network</h2><p className="text-xs text-gray-500">Ketersediaan opsi tidak berarti adapter sudah siap atau aktif.</p><div className="mt-2 space-y-2">{data.verificationMethods.map((method: any) => <div key={method.method_key} className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-xs"><div><strong>{method.display_name}</strong><p className="text-gray-500">Adapter: {method.adapter_key} · {method.adapter_ready ? "Ready" : "Belum siap"}{method.requires_secret ? " · Memerlukan secret" : ""}</p></div><label className="flex items-center gap-2"><input type="checkbox" checked={method.enabled} disabled={busy !== null} onChange={(event) => void toggleMethod(method.method_key, event.target.checked)}/>Opsi tersedia untuk mitra</label></div>)}</div></div>

    <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Kesiapan MikroTik per Network</h2><p className="text-xs text-gray-500">Secret reference saja; credential tidak pernah dikirim atau ditampilkan di browser. Validasi perangkat ditunda.</p><div className="mt-2 space-y-3">{data.networkPolicies.filter((item: any) => item.method_key === "mikrotik_hotspot").map((item: any) => <div key={item.id} className="border-t py-2 text-xs"><strong>Network {item.network_id}</strong><p className="text-gray-500">Secret reference: {item.secret_reference ?? "Belum diatur"} · {item.enabled ? "Config enabled" : "Config disabled"}</p><input aria-label="Secret reference" className="mt-2 w-full rounded border p-2" placeholder="vault://moreai/network/..." defaultValue={item.secret_reference ?? ""} onBlur={(event) => {if(event.target.value && event.target.value !== item.secret_reference) void saveSecretReference(item.network_id,event.target.value);}}/></div>)}</div></div>

    <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Approval Mitra</h2><p className="text-xs text-gray-500">Persetujuan dan audit dicatat dalam satu transaksi database.</p><div className="mt-2 space-y-1">{data.partners.map((partner: any) => <div key={partner.id} className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-xs"><div><strong>{partner.display_name ?? partner.legal_name}</strong><span className="ml-2 text-amber-800">{partner.status}</span><p className="text-[10px] text-gray-500">{partner.legal_name}</p></div><div className="flex gap-1"><button disabled={busy !== null} className="rounded border border-[#171717] bg-[#C9F2D5] px-2 py-1 text-[10px] font-bold disabled:opacity-50" onClick={() => void reviewPartner(partner.id,"approve")}>Approve</button><button disabled={busy !== null} className="rounded border border-[#171717] bg-[#F9D8E5] px-2 py-1 text-[10px] font-bold disabled:opacity-50" onClick={() => void reviewPartner(partner.id,"reject")}>Reject</button></div></div>)}
      {!data.partners.length && <p className="py-2 text-xs text-gray-500">Tidak ada permohonan pending.</p>}</div></div>

    {data.permissionMatrix && <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Permission Matrix</h2><p className="text-xs text-gray-500">Role dan permission aktif pada database.</p><div className="mt-2 space-y-2">{data.permissionMatrix.roles.map((role: any) => <div key={role.id} className="border-t py-2 text-xs"><strong>{role.key}</strong><span className="ml-2 text-gray-500">({role.scope})</span><p className="mt-1 text-gray-600">{role.permissions.join(" · ") || "Tidak ada permission"}</p></div>)}</div></div>}

    <div className="rounded-xl border-2 border-[#171717] bg-white p-3"><h2 className="font-black">Audit Terbaru</h2><p className="text-xs text-gray-500">{data.audit.length} catatan yang dapat diakses</p><div className="mt-2 space-y-1">{data.audit.slice(0,8).map((item: any) => <div key={item.id} className="border-t py-2 text-xs"><strong>{item.action}</strong><span className="ml-2 text-gray-500">{item.resource_type} · {item.outcome}</span></div>)}</div></div>
    <p className="text-xs text-gray-500">Provider credentials tetap di environment server. Perubahan provider/model/routing dan approval tercatat secara atomik pada audit log.</p>
  </section>;
}
