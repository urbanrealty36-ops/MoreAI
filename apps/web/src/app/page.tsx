import ReferenceWorkspace from "@/components/reference/ReferenceWorkspace";

export default function WebHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-4 text-[#171717]">
      <header className="mx-auto max-w-3xl rounded-xl border-2 border-[#171717] bg-white p-4">
        <h1 className="text-lg font-black">MoreAI · Source UI Reference</h1>
        <p className="text-xs text-gray-500">Phase 02 mengintegrasikan source UI sebagai referensi non-operasional. Identity dan business workflows tetap menunggu phase resmi masing-masing.</p>
      </header>
      <details open className="mx-auto mt-4 max-w-3xl rounded-xl border-2 border-[#171717] bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold">Buka UI reference preview (non-produksi)</summary>
        <p className="my-3 text-xs text-amber-900">Preview mempertahankan source layout dan komponen referensi. Data contoh di dalamnya bukan data operasional dan tidak dikirim sebagai data produksi.</p>
        <ReferenceWorkspace />
      </details>
    </main>
  );
}
