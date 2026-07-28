import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';

export default function TodoPage() {
  const [todos, setTodos] = useState([
    { id:1, text:"Kerjakan soal Kalkulus hal. 45–50",         subject:"Kalkulus II",     done:true,  priority:"high",   due:"Hari ini" },
    { id:2, text:"Buat laporan praktikum Fisika minggu ini",  subject:"Fisika Dasar",    done:false, priority:"high",   due:"Besok" },
    { id:3, text:"Review materi UTS Pemrograman Web",         subject:"Pemrograman Web", done:false, priority:"medium", due:"3 Jul" },
    { id:4, text:"Submit tugas desain ERD Basis Data",        subject:"Basis Data",      done:false, priority:"high",   due:"Hari ini" },
    { id:5, text:"Baca materi Hukum Newton untuk ujian",      subject:"Fisika Dasar",    done:false, priority:"low",    due:"5 Jul" },
    { id:6, text:"Tulis essay Bahasa Indonesia 500 kata",     subject:"Bahasa Indonesia",done:false, priority:"medium", due:"7 Jul" },
  ]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter]   = useState("all");

  const filtered = todos.filter((t) => filter==="active" ? !t.done : filter==="done" ? t.done : true);
  const priorityStyle = { high:"text-red-600 bg-red-50", medium:"text-amber-600 bg-amber-50", low:"text-emerald-600 bg-emerald-50" };
  const priorityLabel = { high:"Penting", medium:"Sedang", low:"Rendah" };
  const done = todos.filter((t) => t.done).length;

  const addTodo = () => {
    if (!newTask.trim()) return;
    setTodos((prev) => [{ id:Date.now(), text:newTask, subject:"Umum", done:false, priority:"medium", due:"—" }, ...prev]);
    setNewTask("");
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">Selesai Hari Ini</p>
          <p className="text-sm font-bold text-violet-600">{done}/{todos.length} tugas</p>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width:`${(done/todos.length)*100}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key==="Enter" && addTodo()} placeholder="Tambah tugas baru..." className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:border-violet-400 transition-colors text-foreground placeholder-muted-foreground" />
        <button onClick={addTodo} className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors flex items-center gap-1.5 text-sm font-semibold">
          <Plus size={15} />Tambah
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {["all","active","done"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter===f ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {f==="all" ? "Semua" : f==="active" ? "Aktif" : "Selesai"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((todo) => (
          <div key={todo.id} className={`flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-violet-200 transition-all group ${todo.done ? "opacity-55" : ""}`}>
            <button onClick={() => setTodos((prev) => prev.map((t) => t.id===todo.id ? {...t, done:!t.done} : t))} className="mt-0.5 flex-shrink-0">
              {todo.done ? <CheckCircle2 size={17} className="text-emerald-500" /> : <Circle size={17} className="text-muted-foreground hover:text-violet-500 transition-colors" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium text-foreground ${todo.done ? "line-through" : ""}`}>{todo.text}</p>
              <p className="text-xs text-muted-foreground mt-1">{todo.subject} · Tenggat: {todo.due}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${priorityStyle[todo.priority]}`}>{priorityLabel[todo.priority]}</span>
              <button onClick={() => setTodos((prev) => prev.filter((t) => t.id!==todo.id))} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
