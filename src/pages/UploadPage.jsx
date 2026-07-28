import React, { useState, useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';

const SUBJECTS = ["Kalkulus II", "Fisika Dasar", "Pemrograman Web", "Basis Data", "Bahasa Indonesia"];

export default function UploadPage({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([
    { name: "Slide_Kalkulus_Week5.pdf",       size: "2.4 MB", subject: "Kalkulus II",     date: "24 Jun 2026", type: "pdf" },
    { name: "Modul_Pemweb_HTML_CSS.pdf",       size: "5.1 MB", subject: "Pemrograman Web", date: "22 Jun 2026", type: "pdf" },
    { name: "Laporan_Praktikum_Fisika.docx",  size: "1.8 MB", subject: "Fisika Dasar",    date: "20 Jun 2026", type: "doc" },
    { name: "ERD_Basis_Data.png",              size: "340 KB", subject: "Basis Data",      date: "19 Jun 2026", type: "img" },
  ]);
  const fileInputRef = useRef(null);

  const typeStyle = {
    pdf: "bg-red-100 text-red-600", doc: "bg-blue-100 text-blue-600", img: "bg-emerald-100 text-emerald-600",
  };
  const typeLabel = { pdf: "PDF", doc: "DOC", img: "IMG" };

  const addFiles = (fileList) => {
    Array.from(fileList).forEach((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const type = ext === "pdf" ? "pdf" : ["jpg","jpeg","png","gif"].includes(ext) ? "img" : "doc";
      setFiles((prev) => [
        { name: f.name, size: `${(f.size/1024/1024).toFixed(1)} MB`, subject: "Pilih matkul", date: "Baru saja", type },
        ...prev,
      ]);
      onUploaded && onUploaded(f.name);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handlePickChange = (e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = ""; // reset supaya file yg sama bisa dipilih ulang
  };

  const updateSubject = (idx, subject) =>
    setFiles((prev) => prev.map((f, i) => (i === idx ? { ...f, subject } : f)));

  return (
    <div className="max-w-2xl space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handlePickChange}
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer select-none ${
          dragging ? "border-violet-500 bg-violet-50" : "border-border hover:border-violet-400 hover:bg-muted/40"
        }`}
      >
        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload size={22} className="text-violet-600" />
        </div>
        <p className="font-bold text-foreground text-sm">Drag & drop file di sini</p>
        <p className="text-xs text-muted-foreground mt-1">atau klik tombol untuk memilih file</p>
        <p className="text-xs text-muted-foreground mt-2 opacity-60">PDF, DOCX, PPT, PNG, JPG · Maks 50 MB</p>
        <button
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="mt-5 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Pilih File
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm">Materi Terupload</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{files.length} file</span>
        </div>
        <div className="divide-y divide-border">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors group">
              <div
                className={`w-9 h-9 rounded-lg ${typeStyle[f.type]} flex items-center justify-center text-xs font-bold flex-shrink-0`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {typeLabel[f.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <select
                    value={f.subject}
                    onChange={(e) => updateSubject(i, e.target.value)}
                    className="text-xs text-muted-foreground bg-transparent border-none outline-none -ml-1 cursor-pointer hover:text-violet-600"
                  >
                    <option value="Pilih matkul">Pilih matkul</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="text-xs text-muted-foreground">· {f.size} · {f.date}</span>
                </div>
              </div>
              <button
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
