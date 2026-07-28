import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import api from '../lib/api';

const SUBJECTS = ["Kalkulus II", "Fisika Dasar", "Pemrograman Web", "Basis Data", "Bahasa Indonesia"];

export default function UploadPage({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials');
      setFiles(res.data.map(m => {
        const ext = m.fileName.split(".").pop()?.toLowerCase() ?? "";
        const type = ext === "pdf" ? "pdf" : ["jpg","jpeg","png","gif"].includes(ext) ? "img" : "doc";
        return {
          id: m.id,
          name: m.fileName,
          size: "—", // Backend doesn't store size currently
          subject: m.subject || "Umum",
          date: new Date(m.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          type,
          url: m.fileUrl
        };
      }));
    } catch (error) {
      console.error("Failed to fetch materials", error);
    } finally {
      setLoading(false);
    }
  };

  const typeStyle = {
    pdf: "bg-red-100 text-red-600", doc: "bg-blue-100 text-blue-600", img: "bg-emerald-100 text-emerald-600",
  };
  const typeLabel = { pdf: "PDF", doc: "DOC", img: "IMG" };

  const addFiles = async (fileList) => {
    setIsUploading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i];
        const formData = new FormData();
        formData.append('file', f);
        formData.append('subject', 'Umum');

        const res = await api.post('/materials/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const m = res.data;
        const ext = m.fileName.split(".").pop()?.toLowerCase() ?? "";
        const type = ext === "pdf" ? "pdf" : ["jpg","jpeg","png","gif"].includes(ext) ? "img" : "doc";
        
        setFiles((prev) => [
          {
            id: m.id,
            name: m.fileName,
            size: `${(f.size/1024/1024).toFixed(1)} MB`,
            subject: m.subject,
            date: new Date(m.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            type,
            url: m.fileUrl
          },
          ...prev,
        ]);
        onUploaded && onUploaded(f.name);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
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

  const updateSubject = async (idx, subject) => {
    // Ideally you want a PUT /materials/:id endpoint to update subject
    // For now we just update local UI to not break the design
    setFiles((prev) => prev.map((f, i) => (i === idx ? { ...f, subject } : f)));
  };

  const deleteFile = async (id) => {
    try {
      await api.delete(`/materials/${id}`);
      setFiles((prev) => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

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
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer select-none ${
          dragging ? "border-violet-500 bg-violet-50" : "border-border hover:border-violet-400 hover:bg-muted/40"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload size={22} className={`text-violet-600 ${isUploading ? 'animate-bounce' : ''}`} />
        </div>
        <p className="font-bold text-foreground text-sm">{isUploading ? "Mengunggah..." : "Drag & drop file di sini"}</p>
        <p className="text-xs text-muted-foreground mt-1">{isUploading ? "Harap tunggu sebentar" : "atau klik tombol untuk memilih file"}</p>
        <p className="text-xs text-muted-foreground mt-2 opacity-60">PDF, DOCX, PPT, PNG, JPG · Maks 50 MB</p>
        <button
          disabled={isUploading}
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="mt-5 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {isUploading ? "Mengunggah..." : "Pilih File"}
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm">Materi Terupload</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{files.length} file</span>
        </div>
        <div className="divide-y divide-border">
          {files.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground mt-8 mb-8">Belum ada file yang diupload.</p>
          ) : (
            files.map((f, i) => (
              <div key={f.id || i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors group">
                <div
                  className={`w-9 h-9 rounded-lg ${typeStyle[f.type]} flex items-center justify-center text-xs font-bold flex-shrink-0`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {typeLabel[f.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <a href={f.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-foreground truncate hover:underline block">{f.name}</a>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <select
                      value={f.subject}
                      onChange={(e) => updateSubject(i, e.target.value)}
                      className="text-xs text-muted-foreground bg-transparent border-none outline-none -ml-1 cursor-pointer hover:text-violet-600"
                    >
                      <option value="Umum">Umum</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="text-xs text-muted-foreground">· {f.size} · {f.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteFile(f.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
