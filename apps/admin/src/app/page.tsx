import { SuperAdminView } from "@/components/admin/SuperAdminView";

export default function AdminHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-3 text-[#171717]">
      <section className="mx-auto mb-3 max-w-7xl rounded-xl border-2 border-amber-700 bg-amber-50 p-3 text-xs font-semibold text-amber-950">
        UI REFERENCE PREVIEW — seluruh data di bawah merupakan contoh desain dari source, bukan data operasional MoreAI. Operasi dinonaktifkan sampai backend contract dan otorisasi Super Admin selesai.
      </section>
      <details className="mx-auto max-w-7xl rounded-xl border border-[#171717] bg-white p-3">
        <summary className="cursor-pointer text-sm font-bold">Buka preview UI Super Admin (non-produksi)</summary>
        <div className="mt-3"><SuperAdminView /></div>
      </details>
    </main>
  );
}
