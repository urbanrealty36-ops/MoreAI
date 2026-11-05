import { PartnerPortalView } from "@/components/partner/PartnerPortalView";
import { PartnerOperations } from "@/components/partner/PartnerOperations";
import { PortalAuthGate } from "@/components/PortalAuthGate";

export default function PartnerHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-3 text-[#171717]">
      <header className="mx-auto mb-3 max-w-5xl rounded-xl border-2 border-[#171717] bg-white p-4">
        <h1 className="text-lg font-black">MoreAI · Partner Portal</h1>
        <p className="text-xs text-gray-500">Lokasi, jaringan, campaign, reward, dan statistik melalui FastAPI.</p>
      </header>
      <div className="mx-auto max-w-5xl">
        <PortalAuthGate title="Partner Portal · Masuk"><PartnerOperations /></PortalAuthGate>
      </div>
      <details className="mx-auto mt-4 max-w-5xl rounded-xl border border-[#171717] bg-white p-3">
        <summary className="cursor-pointer text-sm font-bold">Buka referensi visual Partner Portal (non-operasional)</summary>
        <p className="my-3 text-xs text-amber-900">Konten preview adalah data contoh source UI, bukan data live. Operasi bisnis tidak diaktifkan.</p>
        <PartnerPortalView />
      </details>
    </main>
  );
}
