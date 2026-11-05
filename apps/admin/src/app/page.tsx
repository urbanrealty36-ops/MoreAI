import { SuperAdminView } from "@/components/admin/SuperAdminView";
import { AdminOperations } from "@/components/admin/AdminOperations";
import { PortalAuthGate } from "@/components/PortalAuthGate";

export default function AdminHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-3 text-[#171717]">
      <header className="mx-auto mb-3 max-w-7xl rounded-xl border-2 border-[#171717] bg-white p-4">
        <h1 className="text-lg font-black">MoreAI · Super Admin</h1>
        <p className="text-xs text-gray-500">Operasional menggunakan FastAPI dan izin platform yang diverifikasi server.</p>
      </header>
      <div className="mx-auto max-w-7xl">
        <PortalAuthGate title="Super Admin · Masuk"><AdminOperations /></PortalAuthGate>
      </div>
      <details className="mx-auto mt-4 max-w-7xl rounded-xl border border-[#171717] bg-white p-3">
        <summary className="cursor-pointer text-sm font-bold">Buka referensi visual Super Admin (non-operasional)</summary>
        <p className="my-3 text-xs text-amber-900">Konten preview adalah data contoh source UI. Tidak mewakili data produksi dan tidak dapat digunakan untuk tindakan bisnis.</p>
        <SuperAdminView />
      </details>
    </main>
  );
}
