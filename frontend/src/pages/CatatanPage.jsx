import React, { useState, useEffect } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import api from '../lib/api';

const SUBJECTS = ["Kalkulus II", "Fisika Dasar", "Pemrograman Web", "Basis Data", "Bahasa Indonesia"];

const ACCENT_COLORS = ["border-l-violet-500", "border-l-cyan-500", "border-l-emerald-500", "border-l-amber-500"];

export default function CatatanPage() {
  const [notes, setNotes]       = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing]   = useState(false);
  const [isNew, setIsNew]       = useState(false);
  const [draft, setDraft]       = useState({ title: "", subject: SUBJECTS[0], content: "" });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      // Add visual accents to notes
      const notesWithAccent = res.data.map((n, i) => ({
        ...n,
        accent: ACCENT_COLORS[i % ACCENT_COLORS.length]
      }));
      setNotes(notesWithAccent);
      if (notesWithAccent.length > 0 && !selectedId && !isNew) {
        setSelectedId(notesWithAccent[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setLoading(false);
    }
  };

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const saveNew = async () => {
    if (!draft.title.trim()) return;
    try {
      const res = await api.post('/notes', draft);
      const newNote = { ...res.data, accent: ACCENT_COLORS[0] };
      setNotes((prev) => [newNote, ...prev]);
      setSelectedId(newNote.id);
      setIsNew(false);
      setDraft({ title: "", subject: SUBJECTS[0], content: "" });
    } catch (error) {
      console.error("Failed to save note", error);
    }
  };

  const updateNote = async (patch) => {
    if (!selectedId) return;
    try {
      // Optimistic update
      setNotes((prev) => prev.map((n) => (n.id === selectedId ? { ...n, ...patch } : n)));
      await api.put(`/notes/${selectedId}`, patch);
    } catch (error) {
      console.error("Failed to update note", error);
      fetchNotes(); // rollback
    }
  };

  const deleteNote = async () => {
    if (!selectedId) return;
    try {
      await api.delete(`/notes/${selectedId}`);
      setNotes((ns) => ns.filter((n) => n.id !== selectedId));
      setSelectedId(null);
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-4" style={{ height: "calc(100vh - 9rem)" }}>
      <div className="w-64 flex-shrink-0 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-border flex items-center justify-between flex-shrink-0">
          <h3 className="font-bold text-foreground text-sm">Catatan</h3>
          <button
            onClick={() => { setIsNew(true); setSelectedId(null); setEditing(false); }}
            className="w-7 h-7 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {notes.length === 0 && !isNew ? (
            <p className="text-center text-xs text-muted-foreground mt-8 p-4">Belum ada catatan.</p>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => { setSelectedId(note.id); setIsNew(false); setEditing(false); }}
                className={`w-full text-left p-3.5 hover:bg-muted/40 transition-colors border-l-4 ${note.accent || 'border-l-violet-500'} ${selectedId === note.id ? "bg-muted/50" : ""}`}
              >
                <p className="font-semibold text-xs text-foreground truncate">{note.title}</p>
                <p className="text-xs text-violet-600 mt-0.5">{note.subject}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 opacity-70">{note.content.split("\n")[0]}</p>
                <p className="text-xs text-muted-foreground/50 mt-1">{formatDate(note.updatedAt || note.createdAt)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
        {isNew ? (
          <div className="flex-1 p-6 flex flex-col gap-4">
            <input autoFocus placeholder="Judul catatan..." value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="text-xl font-extrabold bg-transparent border-b border-border pb-3 outline-none text-foreground placeholder-muted-foreground/50" />
            <select value={draft.subject} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} className="text-sm text-violet-600 bg-transparent outline-none font-semibold w-fit cursor-pointer">
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <textarea placeholder="Tulis catatanmu di sini..." value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} className="flex-1 bg-transparent outline-none resize-none text-sm text-foreground placeholder-muted-foreground/50 leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }} />
            <div className="flex gap-2 justify-end flex-shrink-0">
              <button onClick={() => setIsNew(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Batal</button>
              <button onClick={saveNew} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors">Simpan</button>
            </div>
          </div>
        ) : selected ? (
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            <div className="flex items-start justify-between mb-1 flex-shrink-0">
              {editing
                ? <input value={selected.title} onChange={(e) => updateNote({ title: e.target.value })} className="text-xl font-extrabold bg-transparent outline-none border-b border-border pb-1 text-foreground flex-1 mr-4" />
                : <h2 className="text-xl font-extrabold text-foreground">{selected.title}</h2>
              }
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <button onClick={() => setEditing((e) => !e)} className="px-3 py-1.5 text-xs font-semibold text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">{editing ? "Selesai" : "Edit"}</button>
                <button onClick={deleteNote} className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors">Hapus</button>
              </div>
            </div>
            <p className="text-xs text-violet-600 font-semibold mb-0.5">{selected.subject}</p>
            <p className="text-xs text-muted-foreground mb-5">{formatDate(selected.updatedAt || selected.createdAt)}</p>
            {editing
              ? <textarea value={selected.content} onChange={(e) => updateNote({ content: e.target.value })} className="flex-1 bg-muted/30 rounded-xl p-4 outline-none resize-none text-sm text-foreground leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }} />
              : <pre className="flex-1 text-sm text-foreground whitespace-pre-wrap leading-relaxed overflow-y-auto" style={{ fontFamily: "'DM Mono', monospace" }}>{selected.content}</pre>
            }
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Pilih catatan atau buat baru</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
