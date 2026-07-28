import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookMarked, CheckSquare, FileText, Star, Clock, Target, CheckCircle2, Circle } from 'lucide-react';
import api from '../lib/api';

export default function DashboardPage({ user }) {
  const navigate = useNavigate();
  
  const [data, setData] = useState({
    stats: {
      mataKuliah: 0,
      tugasAktif: 0,
      catatan: 0,
      nilaiRataRata: 0
    },
    upcomingClasses: [],
    recentTodos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesRes, todosRes, notesRes, quizzesRes] = await Promise.all([
          api.get('/schedules'),
          api.get('/todos'),
          api.get('/notes'),
          api.get('/quiz-attempts')
        ]);

        const schedules = schedulesRes.data;
        const todos = todosRes.data;
        const notes = notesRes.data;
        const quizzes = quizzesRes.data;

        const mataKuliah = new Set(schedules.map(s => s.subject)).size;
        const tugasAktif = todos.filter(t => !t.completed).length;
        const catatanCount = notes.length;
        const avgScore = quizzes.length > 0 
          ? Math.round(quizzes.reduce((acc, q) => acc + q.score, 0) / quizzes.length) 
          : 0;

        const upcomingClasses = schedules.slice(0, 3).map((s, i) => ({
          subject: s.subject,
          time: `${s.timeStart}–${s.timeEnd}`,
          room: s.room,
          dot: i === 0 ? "bg-violet-500" : (i === 1 ? "bg-cyan-500" : "bg-emerald-500")
        }));

        const recentTodos = todos.slice(0, 4).map(t => ({
          text: t.task,
          done: t.completed
        }));

        setData({
          stats: { mataKuliah, tugasAktif, catatan: catatanCount, nilaiRataRata: avgScore },
          upcomingClasses,
          recentTodos
        });
      } catch (err) {
        console.error("Gagal memuat data dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: "Mata Kuliah",   value: data.stats.mataKuliah,  icon: BookMarked, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300" },
    { label: "Tugas Aktif",   value: data.stats.tugasAktif,  icon: CheckSquare, color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-300" },
    { label: "Catatan",       value: data.stats.catatan, icon: FileText, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300" },
    { label: "Nilai Rata-rata", value: data.stats.nilaiRataRata, icon: Star, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300" },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 55%, #06B6D4 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-violet-200 text-sm font-medium">Selamat datang kembali 👋</p>
          <h2 className="text-2xl font-extrabold mt-0.5">{user.name}</h2>
          <p className="text-violet-200 text-sm mt-1.5">
            Senin, 29 Juni 2026 · Semester {user.semester} · {user.prodi}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigate("/jadwal")}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
            >
              Lihat Jadwal
            </button>
            <button
              onClick={() => navigate("/kuis")}
              className="px-4 py-2 bg-white text-violet-700 hover:bg-violet-50 rounded-lg text-sm font-semibold transition-colors"
            >
              Mulai Kuis →
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
        <div className="absolute right-8 -bottom-14 w-36 h-36 rounded-full bg-white/5" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: IconC, color }) => (
          <div key={label} className="bg-card rounded-xl p-4 border border-border">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <IconC size={18} />
            </div>
            <p className="text-2xl font-extrabold text-foreground leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground text-sm">Jadwal Hari Ini</h3>
            <button onClick={() => navigate("/jadwal")} className="text-xs text-violet-600 font-semibold">Lihat semua →</button>
          </div>
          <div className="space-y-2.5">
            {data.upcomingClasses.length === 0 ? (
              <p className="text-xs text-muted-foreground">Tidak ada jadwal</p>
            ) : (
              data.upcomingClasses.map(({ subject, time, room, dot }) => (
                <div key={subject} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                  <div className={`w-1.5 h-10 rounded-full ${dot} flex-shrink-0`} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">{subject}</p>
                    <p className="text-xs text-muted-foreground">{time} · {room}</p>
                  </div>
                  <Clock size={14} className="text-muted-foreground" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground text-sm">To-Do Hari Ini</h3>
            <button onClick={() => navigate("/todo")} className="text-xs text-violet-600 font-semibold">Lihat semua →</button>
          </div>
          <div className="space-y-2">
            {data.recentTodos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Tidak ada tugas aktif</p>
            ) : (
              data.recentTodos.map(({ text, done }) => (
                <div key={text} className={`flex items-start gap-2.5 ${done ? "opacity-50" : ""}`}>
                  {done
                    ? <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    : <Circle size={15} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  }
                  <p className={`text-xs text-foreground leading-relaxed ${done ? "line-through" : ""}`}>{text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
