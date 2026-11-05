import { SuperAdminView } from "@/components/admin/SuperAdminView";

export default function AdminHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-3 text-[#171717]">
      <header className="mx-auto mb-3 max-w-7xl rounded-xl border-2 border-[#171717] bg-white p-4">
        <h1 className="text-lg font-black">MoreAI · Super Admin</h1>
        <p className="text-xs text-gray-500">Referensi visual hasil migrasi source. Operasi Super Admin belum diaktifkan pada Phase 02.</p>
      </header>
      <details open className="mx-auto max-w-7xl rounded-xl border border-[#171717] bg-white p-3">
        <summary className="cursor-pointer text-sm font-bold">Referensi visual Super Admin (non-operasional)</summary>
        <p className="my-3 text-xs text-amber-900">Konten preview mempertahankan source UI dan dapat berisi data contoh. Tidak mewakili data produksi dan tidak dapat menjalankan tindakan bisnis.</p>
        <SuperAdminView />
      </details>
    </main>
  );
}
