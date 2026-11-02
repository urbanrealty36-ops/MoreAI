import { PartnerPortalView } from "@/components/partner/PartnerPortalView";

export default function PartnerHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-3 text-[#171717]">
      <section className="mx-auto mb-3 max-w-5xl rounded-xl border-2 border-amber-700 bg-amber-50 p-3 text-xs font-semibold text-amber-950">
        UI REFERENCE PREVIEW — nama mitra, cabang, campaign, reward dan statistik pada komponen referensi bukan data live. Aksi bisnis tidak boleh digunakan sebelum API mitra aktif.
      </section>
      <details className="mx-auto max-w-5xl rounded-xl border border-[#171717] bg-white p-3">
        <summary className="cursor-pointer text-sm font-bold">Buka preview UI Partner Portal (non-produksi)</summary>
        <div className="mt-3"><PartnerPortalView /></div>
      </details>
    </main>
  );
}
