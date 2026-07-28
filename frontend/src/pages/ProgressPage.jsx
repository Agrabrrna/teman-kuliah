import React, { useState, useEffect } from 'react';
import { Clock, Star, Target } from 'lucide-react';
import SimpleBarChart from '../components/SimpleBarChart';
import api from '../lib/api';

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);

  // Mock data for charts and tables to maintain UI structure
  const studyTargets = [
    { subject:"Kalkulus II",     jam:14, target:20, color:"#7C3AED" },
    { subject:"Fisika Dasar",    jam:8,  target:16, color:"#06B6D4" },
    { subject:"Pemrograman Web", jam:18, target:20, color:"#10B981" },
    { subject:"Basis Data",      jam:11, target:16, color:"#F59E0B" },
    { subject:"Bahasa Indonesia",jam:5,  target:10, color:"#EF4444" },
  ];

  const weeklyData = [
    { day:"Sen", jam:4 }, { day:"Sel", jam:2.5 }, { day:"Rab", jam:5 },
    { day:"Kam", jam:3 }, { day:"Jum", jam:4.5 }, { day:"Sab", jam:6 }, { day:"Min", jam:1 },
  ];

  const [nilai, setNilai] = useState([
    { mk:"Kalkulus II",     tugas:75, uts:82, uas:null },
    { mk:"Fisika Dasar",    tugas:88, uts:79, uas:null },
    { mk:"Pemrograman Web", tugas:92, uts:90, uas:null },
    { mk:"Basis Data",      tugas:85, uts:88, uas:null },
    { mk:"Bahasa Indonesia",tugas:78, uts:82, uas:null },
  ]);
  const [editingNilai, setEditingNilai] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, quizRes] = await Promise.all([
          api.get('/todos'),
          api.get('/quiz/attempts')
        ]);
        setTodos(todosRes.data);
        setQuizAttempts(quizRes.data);
      } catch (error) {
        console.error("Failed to fetch progress data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateNilai = (mk, field, raw) => {
    const val = raw === "" ? null : Math.max(0, Math.min(100, Number(raw)));
    setNilai((prev) => prev.map((n) => (n.mk === mk ? { ...n, [field]: val } : n)));
  };

  // Logic calculation based on API data instead of purely mock data
  const completedTodos = todos.filter(t => t.completed).length;
  const totalTodos = todos.length;
  
  // Calculate average from quiz attempts if available, otherwise fallback to local grades
  let rataRata = 0;
  if (quizAttempts.length > 0) {
    const totalPercentage = quizAttempts.reduce((sum, q) => sum + (q.score / q.totalQuestions * 100), 0);
    rataRata = Math.round(totalPercentage / quizAttempts.length);
  } else {
    rataRata = Math.round(
      nilai.reduce((sum, n) => {
        const vals = [n.tugas, n.uts, n.uas].filter((v) => v !== null && v !== undefined);
        const avg = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
        return sum + avg;
      }, 0) / nilai.length
    );
  }

  // Calculate task completion percentage
  const taskCompletionPct = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  // Estimated hours (e.g., 2 hours per completed task)
  const estimatedHours = completedTodos * 2;

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Tugas Selesai", value:`${completedTodos} / ${totalTodos}`, sub:`~${estimatedHours} jam dedikasi`,          icon:Clock,  color:"text-violet-600 bg-violet-100" },
          { label:"Nilai Rata-rata",   value:String(rataRata),   sub:"Berdasarkan Kuis/Tugas", icon:Star,   color:"text-amber-600 bg-amber-100" },
          { label:"Target Penyelesaian",   value:`${taskCompletionPct}%`,    sub:"Dari total tugasmu",   icon:Target, color:"text-emerald-600 bg-emerald-100" },
        ].map(({ label, value, sub, icon:IconC, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-5">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}><IconC size={18} /></div>
            <p className="text-2xl font-extrabold text-foreground">{value}</p>
            <p className="text-xs font-semibold text-foreground mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">Jam Belajar Minggu Ini</h3>
          <SimpleBarChart data={weeklyData} xKey="day" yKey="jam" />
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold text-foreground text-sm mb-4">Progress per Mata Kuliah</h3>
          <div className="space-y-4">
            {studyTargets.map(({ subject, jam, target, color }) => (
              <div key={subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-foreground">{subject}</p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily:"'DM Mono', monospace" }}>{jam}/{target}j</p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width:`${(jam/target)*100}%`, background:color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-sm">Rekap Nilai Saya</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Isi sendiri nilai kamu untuk melihat rata-rata & grade otomatis</p>
          </div>
          <button
            onClick={() => setEditingNilai((v) => !v)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex-shrink-0 ${editingNilai ? "bg-violet-600 text-white" : "bg-muted text-foreground hover:bg-violet-100"}`}
          >
            {editingNilai ? "Selesai Edit" : "Edit Nilai"}
          </button>
        </div>
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Mata Kuliah","Tugas","UTS","UAS","Grade"].map((h) => (
                <th key={h} className={`py-3 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider ${h==="Mata Kuliah" ? "text-left" : "text-center"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {nilai.map(({ mk, tugas, uts, uas }) => {
              const vals = [tugas, uts, uas].filter((v) => v !== null && v !== undefined);
              const avg = vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length) : null;
              const grade = avg===null ? "—" : avg>=85?"A":avg>=75?"B":avg>=65?"C":"D";
              const gs = avg===null ? "text-muted-foreground bg-muted" : avg>=85?"text-emerald-700 bg-emerald-100":avg>=75?"text-blue-700 bg-blue-100":"text-amber-700 bg-amber-100";
              const cellInput = (field, value) => editingNilai ? (
                <input
                  type="number" min="0" max="100"
                  value={value ?? ""}
                  onChange={(e) => updateNilai(mk, field, e.target.value)}
                  placeholder="—"
                  className="w-14 text-center bg-violet-50 border border-violet-200 rounded-md py-1 outline-none focus:border-violet-500 text-foreground"
                  style={{ fontFamily:"'DM Mono', monospace" }}
                />
              ) : (
                <span style={{ fontFamily:"'DM Mono', monospace" }}>{value ?? "—"}</span>
              );
              return (
                <tr key={mk} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-5 font-semibold text-foreground">{mk}</td>
                  <td className="py-3 px-5 text-center text-foreground">{cellInput("tugas", tugas)}</td>
                  <td className="py-3 px-5 text-center text-foreground">{cellInput("uts", uts)}</td>
                  <td className="py-3 px-5 text-center text-foreground">{cellInput("uas", uas)}</td>
                  <td className="py-3 px-5 text-center"><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${gs}`}>{grade}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
