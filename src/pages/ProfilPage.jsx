import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ProfilPage({ user, onUpdateUser }) {
  const [form, setForm] = useState({
    name: user.name || "",
    prodi: user.prodi || "",
    semester: String(user.semester || "1"),
    email: user.email || "",
    phone: user.phone || "",
    bio: user.bio || "",
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const saveProfile = (e) => {
    e.preventDefault();
    onUpdateUser && onUpdateUser({ ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const savePassword = (e) => {
    e.preventDefault();
    setPwError("");
    if (user.password && pw.current !== user.password) {
      setPwError("Password saat ini tidak sesuai.");
      return;
    }
    if (pw.next.length < 6) {
      setPwError("Password baru minimal 6 karakter.");
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwError("Konfirmasi password baru tidak cocok.");
      return;
    }
    onUpdateUser && onUpdateUser({ password: pw.next });
    setPw({ current: "", next: "", confirm: "" });
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl font-bold">{user.initials}</span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-foreground text-base truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user.prodi} · Semester {user.semester}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5" style={{ fontFamily:"'DM Mono', monospace" }}>@{user.username}</p>
        </div>
      </div>

      <form onSubmit={saveProfile} className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h3 className="font-bold text-foreground text-sm">Edit Profil</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Nama Lengkap</label>
            <input value={form.name} onChange={set("name")} required
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Program Studi</label>
            <input value={form.prodi} onChange={set("prodi")} required
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Semester</label>
            <select value={form.semester} onChange={set("semester")}
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground">
              {Array.from({ length: 14 }, (_, i) => i + 1).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">No. HP</label>
            <input value={form.phone} onChange={set("phone")} placeholder="08xx-xxxx-xxxx"
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground placeholder-muted-foreground" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="nama@kampus.ac.id"
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground placeholder-muted-foreground" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Bio Singkat</label>
            <textarea value={form.bio} onChange={set("bio")} rows={3} placeholder="Ceritakan sedikit tentang kamu..."
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground placeholder-muted-foreground resize-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Simpan Perubahan
          </button>
          {saved && <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} />Profil tersimpan</span>}
        </div>
      </form>

      <form onSubmit={savePassword} className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h3 className="font-bold text-foreground text-sm">Ubah Password</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Password Saat Ini</label>
            <input type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Password Baru</label>
              <input type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Konfirmasi Password</label>
              <input type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-violet-400 text-foreground" />
            </div>
          </div>
        </div>
        {pwError && <p className="text-xs font-semibold text-red-500">{pwError}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" className="px-5 py-2 bg-foreground hover:opacity-90 text-white text-sm font-semibold rounded-lg transition-colors">
            Perbarui Password
          </button>
          {pwSaved && <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} />Password diperbarui</span>}
        </div>
      </form>
    </div>
  );
}
