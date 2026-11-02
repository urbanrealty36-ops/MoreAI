export default function CaptiveHome() {
  return (
    <main className="min-h-screen bg-[#F7F4EC] p-4 text-[#171717]">
      <section className="mx-auto max-w-md rounded-2xl border-2 border-amber-700 bg-amber-50 p-4 text-sm text-amber-950">
        <h1 className="font-black">MoreAI Network Access</h1>
        <p className="mt-2">Gateway belum terhubung. Portal tidak akan mengklaim Wi-Fi aktif, menerbitkan reward, atau mengubah entitlement tanpa bukti verifikasi yang valid dari FastAPI dan captive gateway.</p>
        <p className="mt-3 text-xs">Status: NETWORK_GATEWAY_NOT_CONFIGURED</p>
      </section>
    </main>
  );
}
