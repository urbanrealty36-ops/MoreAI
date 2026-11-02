import { CaptivePortalReferencePreview } from '@/components/screens/CaptivePortalReferencePreview';

export default function CaptiveHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-4 text-[#171717]">
      <section className="mx-auto max-w-md rounded-2xl border-2 border-amber-700 bg-amber-50 p-4 text-sm text-amber-950">
        <h1 className="font-black">MoreAI Network Access</h1>
        <p className="mt-2">Gateway belum terhubung. Setiap network harus memiliki tepat satu metode verifikasi terpilih. Portal hanya akan menggunakan adapter tersebut setelah FastAPI memvalidasi konfigurasi, bukti gateway, dan kesiapan kredensial. Metode yang belum siap tidak akan memberikan akses partner atau reward.</p>
        <p className="mt-3 text-xs font-bold">Status: NETWORK_GATEWAY_NOT_CONFIGURED</p>
      </section>
      <details className="mx-auto mt-4 max-w-md rounded-xl border-2 border-[#171717] bg-white p-3">
        <summary className="cursor-pointer text-sm font-bold">Buka UI reference preview (non-produksi)</summary>
        <p className="my-3 text-xs text-amber-900">Simulasi gateway dan venue contoh hanya untuk inspeksi visual; tidak terhubung ke jaringan atau entitlement nyata.</p>
        <CaptivePortalReferencePreview />
      </details>
    </main>
  );
}
