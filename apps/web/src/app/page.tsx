export default function WebHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-4 text-[#171717]">
      <section className="mx-auto max-w-3xl rounded-2xl border-2 border-amber-700 bg-amber-50 p-5 text-amber-950">
        <h1 className="text-lg font-black">MoreAI Workspace</h1>
        <p className="mt-2 text-sm">Source UI MoreAI telah dimigrasikan. Production workspace belum diaktifkan karena wiring Auth, persistence chat, agent execution dan seluruh state UI belum lulus acceptance. Tidak ada saldo, session, campaign atau hasil agent contoh yang ditampilkan sebagai data live.</p>
        <p className="mt-3 text-xs font-bold">Status: CUSTOMER_WORKSPACE_INTEGRATION_IN_PROGRESS</p>
      </section>
      <details className="mx-auto mt-4 max-w-3xl rounded-xl border-2 border-[#171717] bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold">Buka UI reference preview (non-produksi)</summary>
        <p className="my-3 text-xs text-amber-900">Preview mempertahankan source UI asli. Semua data contoh di dalamnya hanya untuk inspeksi visual, bukan data operasional.</p>
        <div className="text-xs text-gray-600">Reference workspace components remain in the source tree and are not mounted as production business data.</div>
      </details>
    </main>
  );
}
