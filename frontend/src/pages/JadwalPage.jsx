import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../lib/api';

const SUBJECTS = ["Kalkulus II", "Fisika Dasar", "Pemrograman Web", "Basis Data", "Bahasa Indonesia"];

const JADWAL_COLORS = {
  "Kalkulus II":      { dot:"bg-violet-500",  cell:"bg-violet-100 border-l-violet-500 text-violet-900" },
  "Fisika Dasar":     { dot:"bg-amber-500",   cell:"bg-amber-100 border-l-amber-500 text-amber-900" },
  "Pemrograman Web":  { dot:"bg-cyan-500",    cell:"bg-cyan-100 border-l-cyan-500 text-cyan-900" },
  "Basis Data":       { dot:"bg-emerald-500", cell:"bg-emerald-100 border-l-emerald-500 text-emerald-900" },
  "Bahasa Indonesia": { dot:"bg-pink-500",    cell:"bg-pink-100 border-l-pink-500 text-pink-900" },
};
const jadwalColorFor = (subject) => JADWAL_COLORS[subject] || { dot:"bg-slate-500", cell:"bg-slate-100 border-l-slate-500 text-slate-900" };

const EMPTY_SCHEDULE = {
  Senin:  [null, null, null, null],
  Selasa: [null, null, null, null],
  Rabu:   [null, null, null, null],
  Kamis:  [null, null, null, null],
  Jumat:  [null, null, null, null],
};

const TIME_SLOTS_MAP = [
  { start: "08:00", end: "10:00", label: "08:00–10:00" },
  { start: "10:00", end: "12:00", label: "10:00–12:00" },
  { start: "13:00", end: "15:00", label: "13:00–15:00" },
  { start: "15:00", end: "17:00", label: "15:00–17:00" },
];

export default function JadwalPage({ onScheduleChange }) {
  const days      = ["Senin","Selasa","Rabu","Kamis","Jumat"];

  const [timeSlotsMap, setTimeSlotsMap] = useState(TIME_SLOTS_MAP);
  const [schedule, setSchedule] = useState(EMPTY_SCHEDULE);
  const [customSubjects, setCustomSubjects] = useState([]); // matkul tambahan yang diketik manual oleh user
  const [modal, setModal]       = useState(null); // { day, rowIdx, subject, newSubjectName, room, startTime, endTime, isEdit, id }
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/schedules');
      
      const slotsSet = new Map();
      TIME_SLOTS_MAP.forEach(s => slotsSet.set(`${s.start}-${s.end}`, s));
      
      res.data.forEach(sch => {
        const key = `${sch.startTime}-${sch.endTime}`;
        if (!slotsSet.has(key)) {
          slotsSet.set(key, { start: sch.startTime, end: sch.endTime, label: `${sch.startTime}–${sch.endTime}` });
        }
      });
      
      const sortedSlots = Array.from(slotsSet.values()).sort((a, b) => a.start.localeCompare(b.start));
      setTimeSlotsMap(sortedSlots);
      
      const newSchedule = {
        Senin: Array(sortedSlots.length).fill(null),
        Selasa: Array(sortedSlots.length).fill(null),
        Rabu: Array(sortedSlots.length).fill(null),
        Kamis: Array(sortedSlots.length).fill(null),
        Jumat: Array(sortedSlots.length).fill(null),
      };
      
      const customSubs = new Set();
      
      res.data.forEach((sch) => {
        const rowIdx = sortedSlots.findIndex(t => t.start === sch.startTime && t.end === sch.endTime);
        if (rowIdx !== -1 && newSchedule[sch.day]) {
          newSchedule[sch.day][rowIdx] = { id: sch.id, subject: sch.subject, room: sch.room, startTime: sch.startTime, endTime: sch.endTime };
          if (!SUBJECTS.includes(sch.subject)) {
            customSubs.add(sch.subject);
          }
        }
      });
      
      setSchedule(newSchedule);
      setCustomSubjects(Array.from(customSubs));
    } catch (error) {
      console.error("Failed to fetch schedules", error);
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = [...SUBJECTS, ...customSubjects];

  const openCell = (day, rowIdx) => {
    const cls = schedule[day][rowIdx];
    const slot = timeSlotsMap[rowIdx];
    setModal({ 
      day, 
      rowIdx, 
      id: cls?.id, 
      subject: cls?.subject || subjectOptions[0], 
      newSubjectName: "", 
      room: cls?.room || "", 
      startTime: cls?.startTime || slot.start,
      endTime: cls?.endTime || slot.end,
      isEdit: !!cls 
    });
  };

  const saveCell = async () => {
    const isNew = modal.subject === "__new__";
    const finalSubject = isNew ? modal.newSubjectName.trim() : modal.subject;
    if (!finalSubject) return;

    try {
      const payload = {
        subject: finalSubject,
        day: modal.day,
        startTime: modal.startTime,
        endTime: modal.endTime,
        room: modal.room || "—"
      };

      if (modal.isEdit) {
        await api.put(`/schedules/${modal.id}`, payload);
      } else {
        await api.post('/schedules', payload);
      }

      await fetchSchedules();

      onScheduleChange && onScheduleChange(finalSubject);
      setModal(null);
    } catch (error) {
      console.error("Failed to save schedule", error);
    }
  };

  const deleteCell = async () => {
    if (!modal.id) return;
    try {
      await api.delete(`/schedules/${modal.id}`);
      await fetchSchedules();
      
      onScheduleChange && onScheduleChange(modal.subject);
      setModal(null);
    } catch (error) {
      console.error("Failed to delete schedule", error);
    }
  };

  const usedSubjects = [...new Set(Object.values(schedule).flat().filter(Boolean).map((c) => c.subject))];

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

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
        {timeSlotsMap.map((slot, rowIdx) => (
          <div key={slot.label} className="grid grid-cols-6 border-b border-border last:border-b-0 min-w-[720px]">
            <div className="p-4 text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{slot.label}</div>
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
              {modal.isEdit ? "Edit" : "Tambah"} Jadwal — {modal.day}, {timeSlotsMap[modal.rowIdx]?.label}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Waktu Mulai</label>
                  <input
                    type="time"
                    value={modal.startTime}
                    onChange={(e) => setModal((m) => ({ ...m, startTime: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Waktu Selesai</label>
                  <input
                    type="time"
                    value={modal.endTime}
                    onChange={(e) => setModal((m) => ({ ...m, endTime: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground"
                  />
                </div>
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
