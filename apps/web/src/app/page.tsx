import WorkspaceAuth from "@/components/auth/WorkspaceAuth";
import ReferenceWorkspace from "@/components/reference/ReferenceWorkspace";

export default function WebHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-4 text-[#171717]">
      <WorkspaceAuth />
      <details className="mx-auto mt-4 max-w-3xl rounded-xl border-2 border-[#171717] bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold">Buka UI reference preview (non-produksi)</summary>
        <p className="my-3 text-xs text-amber-900">Preview mempertahankan source layout dan komponen referensi. Data contoh di dalamnya bukan data operasional dan tidak dikirim ke API produksi.</p>
        <ReferenceWorkspace />
      </details>
    </main>
  );
}
