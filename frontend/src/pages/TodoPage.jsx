import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import api from '../lib/api';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter]   = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todos');
      setTodos(res.data);
    } catch (error) {
      console.error("Failed to fetch todos", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = todos.filter((t) => filter==="active" ? !t.completed : filter==="done" ? t.completed : true);
  const priorityStyle = { high:"text-red-600 bg-red-50", medium:"text-amber-600 bg-amber-50", low:"text-emerald-600 bg-emerald-50" };
  const priorityLabel = { high:"Penting", medium:"Sedang", low:"Rendah" };
  const doneCount = todos.filter((t) => t.completed).length;

  const addTodo = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await api.post('/todos', { title: newTask, subject: "Umum", priority: "medium" });
      setTodos((prev) => [res.data, ...prev]);
      setNewTask("");
    } catch (error) {
      console.error("Failed to add todo", error);
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      const res = await api.put(`/todos/${id}`, { completed: !currentStatus });
      setTodos((prev) => prev.map((t) => t.id === id ? res.data : t));
    } catch (error) {
      console.error("Failed to toggle todo", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete todo", error);
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
    <div className="max-w-xl space-y-4">
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">Selesai Hari Ini</p>
          <p className="text-sm font-bold text-violet-600">{doneCount}/{todos.length} tugas</p>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: todos.length === 0 ? '0%' : `${(doneCount/todos.length)*100}%` }} />
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
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter===f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {f==="all" ? "Semua" : f==="active" ? "Aktif" : "Selesai"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-8">Tidak ada tugas di sini.</p>
        ) : (
          filtered.map((todo) => (
            <div key={todo.id} className={`flex items-start gap-3 p-4 bg-card rounded-xl border border-border hover:border-violet-200 transition-all group ${todo.completed ? "opacity-55" : ""}`}>
              <button onClick={() => toggleTodo(todo.id, todo.completed)} className="mt-0.5 flex-shrink-0">
                {todo.completed ? <CheckCircle2 size={17} className="text-emerald-500" /> : <Circle size={17} className="text-muted-foreground hover:text-violet-500 transition-colors" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-foreground ${todo.completed ? "line-through" : ""}`}>{todo.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{todo.subject} {todo.deadline ? `· Tenggat: ${new Date(todo.deadline).toLocaleDateString('id-ID')}` : ''}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${priorityStyle[todo.priority]}`}>{priorityLabel[todo.priority]}</span>
                <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
