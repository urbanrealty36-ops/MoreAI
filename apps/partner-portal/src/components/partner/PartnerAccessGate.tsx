'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { Building2, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { getPortalApi } from '../../lib/client';
import { PartnerOperations } from './PartnerOperations';

type Status = 'loading' | 'not_submitted' | 'pending' | 'active' | 'rejected' | 'suspended' | 'error';

export function PartnerAccessGate() {
  const [status, setStatus] = useState<Status>('loading');
  const [partnerName, setPartnerName] = useState('');
  const [membershipStatus, setMembershipStatus] = useState('');
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const result = await getPortalApi().partner.onboardingStatus();
      setPartnerName(String(result.partner?.display_name ?? result.partner?.legal_name ?? ''));
      setMembershipStatus(String(result.membership?.status ?? ''));
      setStatus(result.status as Status);
    } catch (reason) {
      setStatus('error');
      setError(reason instanceof Error ? reason.message : 'Status kemitraan tidak dapat dimuat');
    }
  };

  useEffect(() => { void load(); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await getPortalApi().partner.submitApplication({ legal_name: legalName.trim(), display_name: displayName.trim() });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pengajuan kemitraan gagal');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') return <p className="rounded-xl border-2 border-[#171717] bg-white p-4 text-sm">Memeriksa status pendaftaran mitra…</p>;
  if (status === 'active' && membershipStatus === 'active') return <PartnerOperations />;

  return (
    <section className="mx-auto max-w-xl rounded-2xl border-2 border-[#171717] bg-white p-4 shadow-[4px_4px_0_#171717]">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#171717] bg-[#D9D5FF]"><Building2 className="h-6 w-6"/></div><div><h2 className="text-base font-black">MoreAI Partner Onboarding</h2><p className="text-xs text-gray-500">Pengajuan dan persetujuan mitra melalui FastAPI.</p></div></div>
      {status === 'not_submitted' && <form onSubmit={submit} className="mt-4 space-y-3">
        <label className="block text-xs font-bold">Nama legal badan usaha<input required minLength={2} maxLength={160} value={legalName} onChange={e=>setLegalName(e.target.value)} className="mt-1 w-full rounded-lg border-2 border-[#171717] p-2 text-sm" placeholder="Nama sesuai dokumen legal"/></label>
        <label className="block text-xs font-bold">Nama brand / usaha<input required minLength={2} maxLength={120} value={displayName} onChange={e=>setDisplayName(e.target.value)} className="mt-1 w-full rounded-lg border-2 border-[#171717] p-2 text-sm" placeholder="Nama yang tampil di Partner Portal"/></label>
        <p className="text-[11px] text-gray-500">Pengajuan akan disimpan dengan status pending dan diaudit dalam satu transaksi database. Data kontak/legal tambahan belum diminta karena belum tersedia pada skema saat ini.</p>
        <button disabled={busy} className="w-full rounded-xl border-2 border-[#171717] bg-[#C9F2D5] py-2.5 text-xs font-black disabled:opacity-50">{busy?'Mengirim pengajuan…':'Ajukan Kemitraan'}</button>
      </form>}
      {status === 'pending' && <div className="mt-4 rounded-xl border-2 border-[#171717] bg-[#FBE7B2] p-3"><div className="flex items-center gap-2"><Clock className="h-5 w-5"/><strong className="text-sm">Menunggu persetujuan</strong></div><p className="mt-2 text-xs">Pengajuan {partnerName} sudah tersimpan. Partner Portal operasional dibuka setelah Super Admin menyetujui pengajuan.</p></div>}
      {(status === 'rejected' || status === 'suspended' || (status === 'active' && membershipStatus !== 'active')) && <div className="mt-4 rounded-xl border-2 border-[#171717] bg-[#F9D8E5] p-3"><div className="flex items-center gap-2"><AlertCircle className="h-5 w-5"/><strong className="text-sm">Akses mitra belum aktif</strong></div><p className="mt-2 text-xs">Organisasi: {partnerName || '—'} · Status organisasi: {status} · Status keanggotaan: {membershipStatus || '—'}. Hubungi tim MoreAI untuk tindak lanjut.</p></div>}
      {status === 'error' && <div className="mt-4 rounded-xl border-2 border-amber-700 bg-amber-50 p-3 text-xs text-amber-950">{error}</div>}
      {error && status !== 'error' && <p className="mt-3 text-xs text-red-700">{error}</p>}
      <div className="mt-4 flex items-start gap-2 border-t pt-3 text-[10px] text-gray-500"><ShieldCheck className="h-4 w-4 shrink-0"/><p>Persetujuan dan audit dilakukan server-side. Pengguna tidak dapat mengaktifkan organisasi sendiri.</p></div>
    </section>
  );
}
