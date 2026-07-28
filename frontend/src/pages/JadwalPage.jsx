import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const SUBJECTS = ["Kalkulus II", "Fisika Dasar", "Pemrograman Web", "Basis Data", "Bahasa Indonesia"];

const JADWAL_COLORS = {
  "Kalkulus II":      { dot:"bg-violet-500",  cell:"bg-violet-100 border-l-violet-500 text-violet-900" },
  "Fisika Dasar":     { dot:"bg-amber-500",   cell:"bg-amber-100 border-l-amber-500 text-amber-900" },
  "Pemrograman Web":  { dot:"bg-cyan-500",    cell:"bg-cyan-100 border-l-cyan-500 text-cyan-900" },
  "Basis Data":       { dot:"bg-emerald-500", cell:"bg-emerald-100 border-l-emerald-500 text-emerald-900" },
  "Bahasa Indonesia": { dot:"bg-pink-500",    cell:"bg-pink-100 border-l-pink-500 text-pink-900" },
};
const jadwalColorFor = (subject) => JADWAL_COLORS[subject] || { dot:"bg-slate-500", cell:"bg-slate-100 border-l-slate-500 text-slate-900" };

const INITIAL_SCHEDULE = {
  Senin:  [
    { subject:"Kalkulus II",     room:"G-201" },
    null,
    { subject:"Pemrograman Web", room:"Lab A" },
    { subject:"Basis Data",      room:"Lab B" },
  ],
  Selasa: [null, { subject:"Fisika Dasar", room:"G-105" }, null, null],
  Rabu:   [
    { subject:"Bahasa Indonesia", room:"G-301" },
    null,
    { subject:"Kalkulus II",      room:"G-201" },
    null,
  ],
  Kamis:  [null, { subject:"Pemrograman Web", room:"Lab A" }, null, { subject:"Fisika Dasar", room:"G-105" }],
  Jumat:  [null, { subject:"Basis Data", room:"Lab B" }, null, null],
};

export default function JadwalPage({ onScheduleChange }) {
  const days      = ["Senin","Selasa","Rabu","Kamis","Jumat"];
  const timeSlots = ["08:00–10:00","10:00–12:00","13:00–15:00","15:00–17:00"];

  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [customSubjects, setCustomSubjects] = useState([]); // matkul tambahan yang diketik manual oleh user
  const [modal, setModal]       = useState(null); // { day, rowIdx, subject, newSubjectName, room, isEdit }

  const subjectOptions = [...SUBJECTS, ...customSubjects];

  const openCell = (day, rowIdx) => {
    const cls = schedule[day][rowIdx];
    setModal({ day, rowIdx, subject: cls?.subject || subjectOptions[0], newSubjectName: "", room: cls?.room || "", isEdit: !!cls });
  };

  const saveCell = () => {
    const isNew = modal.subject === "__new__";
    const finalSubject = isNew ? modal.newSubjectName.trim() : modal.subject;
    if (!finalSubject) return;

    if (isNew && !subjectOptions.includes(finalSubject)) {
      setCustomSubjects((prev) => [...prev, finalSubject]);
    }

    setSchedule((prev) => {
      const next = { ...prev, [modal.day]: [...prev[modal.day]] };
      next[modal.day][modal.rowIdx] = { subject: finalSubject, room: modal.room || "—" };
      return next;
    });
    onScheduleChange && onScheduleChange(finalSubject);
    setModal(null);
  };

  const deleteCell = () => {
    setSchedule((prev) => {
      const next = { ...prev, [modal.day]: [...prev[modal.day]] };
      next[modal.day][modal.rowIdx] = null;
      return next;
    });
    onScheduleChange && onScheduleChange(modal.subject);
    setModal(null);
  };

  const usedSubjects = [...new Set(Object.values(schedule).flat().filter(Boolean).map((c) => c.subject))];

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          {usedSubjects.map((subject) => (
            <div key={subject} className="flex items-center gap-1.5 text-xs text-foreground font-medium">
              <div className={`w-2.5 h-2.5 rounded-sm ${jadwalColorFor(subject).dot}`} />
              {subject}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Klik sel untuk menambah / mengedit jadwal</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
        <div className="grid grid-cols-6 border-b border-border bg-muted/40 min-w-[720px]">
          <div className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Waktu</div>
          {days.map((day) => (
            <div key={day} className={`p-4 text-center text-sm font-bold ${day === "Senin" ? "text-violet-600" : "text-foreground"}`}>
              {day}
              {day === "Senin" && <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mx-auto mt-1" />}
            </div>
          ))}
        </div>
        {timeSlots.map((time, rowIdx) => (
          <div key={time} className="grid grid-cols-6 border-b border-border last:border-b-0 min-w-[720px]">
            <div className="p-4 text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{time}</div>
            {days.map((day) => {
              const cls = schedule[day][rowIdx];
              return (
                <div key={day} className="p-2 min-h-[4rem]">
                  {cls ? (
                    <button
                      onClick={() => openCell(day, rowIdx)}
                      className={`p-2 rounded-lg border-l-4 h-full w-full text-left ${jadwalColorFor(cls.subject).cell} text-xs hover:brightness-95 transition-all`}
                    >
                      <p className="font-bold leading-tight">{cls.subject}</p>
                      <p className="opacity-60 mt-0.5">{cls.room}</p>
                    </button>
                  ) : (
                    <button
                      onClick={() => openCell(day, rowIdx)}
                      className="h-full w-full rounded-lg border-2 border-dashed border-border/70 hover:border-violet-400 hover:bg-violet-50/40 flex items-center justify-center text-muted-foreground hover:text-violet-500 transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4" onClick={() => setModal(null)}>
          <div className="bg-card rounded-2xl border border-border p-5 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-foreground text-sm">
              {modal.isEdit ? "Edit" : "Tambah"} Jadwal — {modal.day}, {timeSlots[modal.rowIdx]}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Mata Kuliah</label>
                <select
                  value={modal.subject}
                  onChange={(e) => setModal((m) => ({ ...m, subject: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground"
                >
                  {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  <option value="__new__">+ Tambah Mata Kuliah Baru…</option>
                </select>
                {modal.subject === "__new__" && (
                  <input
                    autoFocus
                    value={modal.newSubjectName}
                    onChange={(e) => setModal((m) => ({ ...m, newSubjectName: e.target.value }))}
                    placeholder="Nama mata kuliah baru"
                    className="w-full mt-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-lg text-sm outline-none focus:border-violet-500 text-foreground placeholder-muted-foreground"
                  />
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Ruang</label>
                <input
                  value={modal.room}
                  onChange={(e) => setModal((m) => ({ ...m, room: e.target.value }))}
                  placeholder="Contoh: G-201 / Lab A"
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {modal.isEdit && (
                <button onClick={deleteCell} className="px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors mr-auto">
                  Hapus
                </button>
              )}
              <button onClick={() => setModal(null)} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Batal
              </button>
              <button onClick={saveCell} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
