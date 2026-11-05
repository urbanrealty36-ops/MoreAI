'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FileText, FileSpreadsheet, FileCode, Image as ImageIcon, Search, X, Calendar, HardDrive } from 'lucide-react';
import { getMoreAIApi } from '../../lib/api';

interface ClientFilesModalProps {
  onClose: () => void;
  onOpenInChat: (filename: string) => void;
}

type WorkspaceFile = {
  id: string;
  file_name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  checksum_sha256?: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
};

const fileKind = (file: WorkspaceFile) => {
  const mime = file.mime_type || '';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('spreadsheet') || mime.includes('excel')) return 'sheet';
  if (mime.includes('json') || mime.includes('python') || mime.includes('javascript') || mime.includes('text/plain')) return 'code';
  return 'doc';
};

export const ClientFilesModal: React.FC<ClientFilesModalProps> = ({ onClose, onOpenInChat }) => {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [filterType, setFilterType] = useState<'semua' | 'pdf' | 'doc' | 'code' | 'sheet'>('semua');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<WorkspaceFile | null>(null);

  useEffect(() => {
    let live = true;
    getMoreAIApi().workspace.files()
      .then((result) => { if (live) setFiles(result.items as WorkspaceFile[]); })
      .catch((reason) => { if (live) setError(reason instanceof Error ? reason.message : 'Berkas tidak dapat dimuat'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const filtered = useMemo(() => files.filter((file) => {
    const name = file.file_name.toLowerCase();
    const kind = fileKind(file);
    return (filterType === 'semua' || kind === filterType) && name.includes(search.toLowerCase());
  }), [files, filterType, search]);

  const iconFor = (file: WorkspaceFile) => {
    const kind = fileKind(file);
    if (kind === 'sheet') return FileSpreadsheet;
    if (kind === 'code') return FileCode;
    if (file.mime_type?.startsWith('image/')) return ImageIcon;
    return FileText;
  };
  const formatSize = (bytes?: number | null) => {
    if (bytes == null) return 'Ukuran tidak tercatat';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-lg bg-[#F7F4EC] dark:bg-[#1E201D] border-3 border-[#171717] rounded-3xl p-4 sm:p-5 neo-shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D9D5FF] border-2 border-[#171717] neo-shadow-sm flex items-center justify-center"><HardDrive className="w-5 h-5 text-indigo-700" /></div>
            <div><h2 className="text-base font-black text-[#171717] dark:text-[#F7F4EC]">Berkas & Artefak Workspace</h2><p className="text-[11px] text-gray-500">Metadata berkas tersimpan dari FastAPI</p></div>
          </div>
          <button onClick={onClose} aria-label="Tutup berkas" className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border-2 border-[#171717] flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="py-3 space-y-2 shrink-0">
          <div className="neo-card p-1.5 bg-white dark:bg-[#232522] flex items-center gap-2 border-2 border-[#171717]"><Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama berkas..." className="w-full text-xs font-semibold px-1 py-0.5 bg-transparent border-none outline-none" /></div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">{(['semua','doc','pdf','sheet','code'] as const).map((kind) => <button key={kind} onClick={() => setFilterType(kind)} className={`px-2.5 py-1 text-[11px] font-black rounded-lg border border-[#171717] uppercase shrink-0 ${filterType===kind?'bg-[#171717] text-white':'bg-white dark:bg-[#232522]'}`}>{kind==='semua'?'Semua Berkas':kind}</button>)}</div>
        </div>
        {loading && <p className="py-8 text-center text-xs text-gray-500">Memuat metadata berkas…</p>}
        {error && <p className="rounded-xl border border-amber-600 bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}
        {!loading && !error && <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map((file) => { const Icon = iconFor(file); return <div key={file.id} className="p-3 rounded-2xl bg-white dark:bg-[#232522] border-2 border-[#171717] neo-shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0"><div className="w-9 h-9 rounded-xl bg-[#D9D5FF] border border-[#171717] flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-[#171717]" /></div><div className="min-w-0"><h3 className="text-xs font-black truncate">{file.file_name}</h3><p className="text-[10px] text-gray-500 truncate">{formatSize(file.size_bytes)} · {file.mime_type || 'Tipe tidak tercatat'}</p><span className="text-[9px] text-gray-400">{new Date(file.created_at).toLocaleString('id-ID')}</span></div></div>
            <div className="flex gap-1 shrink-0"><button onClick={() => setSelected(file)} className="rounded-lg border border-[#171717] px-2 py-1 text-[10px] font-bold">Detail</button><button onClick={() => onOpenInChat(file.file_name)} className="rounded-lg border border-[#171717] bg-[#C9F2D5] px-2 py-1 text-[10px] font-bold">Chat</button></div>
          </div>; })}
          {filtered.length===0 && <p className="py-8 text-center text-xs text-gray-500">Belum ada artefak yang tersimpan.</p>}
        </div>}
        {selected && <div className="mt-3 rounded-xl border-2 border-[#171717] bg-white dark:bg-[#232522] p-3 text-xs"><div className="flex justify-between gap-2"><strong className="break-all">{selected.file_name}</strong><button onClick={() => setSelected(null)} aria-label="Tutup detail"><X className="w-4 h-4" /></button></div><p className="mt-2 break-all text-gray-500">File: {selected.file_name}</p><p className="mt-1 text-gray-500">Checksum: {String(selected.checksum_sha256 ?? 'Tidak tersedia')}</p><button onClick={async()=>{try{setError(null);const result=await getMoreAIApi().workspace.fileDownload(selected.id);window.open(result.url,"_blank","noopener,noreferrer");}catch(reason){setError(reason instanceof Error?reason.message:"Unduhan tidak tersedia");}}} className="mt-3 rounded-lg border-2 border-[#171717] bg-[#C9F2D5] px-3 py-2 font-bold">Download file (URL aman 5 menit)</button></div>}
      </div>
    </div>
  );
};
