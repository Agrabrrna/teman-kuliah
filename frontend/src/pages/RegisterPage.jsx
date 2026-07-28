import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, Lock, EyeOff, Eye, XCircle } from 'lucide-react';
import api from '../lib/api';

export default function RegisterPage({ onLogin }) {
  const navigate = useNavigate();
  const [name, setName]         = useState("");
  const [username, setUsername] = useState("");
  const [prodi, setProdi]       = useState("");
  const [semester, setSemester] = useState("1");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const uname = username.trim().toLowerCase();
    if (!name.trim() || !uname || !prodi.trim() || !password) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        username: uname,
        prodi: prodi.trim(),
        semester: Number(semester),
        password,
      });

      // Setelah register berhasil, langsung login otomatis
      const loginResp = await api.post('/auth/login', { username: uname, password });
      const { token, user } = loginResp.data;
      
      localStorage.setItem('token', token);
      onLogin(user);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Gagal terhubung ke server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #2D1B69 0%, #4C1D95 40%, #7C3AED 80%, #06B6D4 100%)" }}
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 right-16 w-80 h-80 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-none">TemanKuliah</p>
            <p className="text-violet-300 text-xs mt-0.5">Platform Belajar Mahasiswa</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Gabung dan<br />Mulai Belajar<br />Bersama. ✨
          </h1>
          <p className="text-violet-200 mt-4 text-sm leading-relaxed max-w-xs">
            Buat akun gratis untuk mulai mengelola jadwal, catatan, tugas,
            dan progres belajarmu sendiri.
          </p>
        </div>

        <p className="relative text-violet-300/60 text-xs">© 2026 TemanKuliah · Semua hak dilindungi</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <p className="text-foreground font-extrabold">TemanKuliah</p>
          </div>

          <h2 className="text-2xl font-extrabold text-foreground">Buat Akun Baru</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-8">Daftar untuk mulai menggunakan TemanKuliah</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">
                Nama Lengkap
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="contoh: Andi Pratama"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-foreground placeholder-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: andi.pratama"
                required
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-foreground placeholder-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">
                  Program Studi
                </label>
                <input
                  type="text"
                  value={prodi}
                  onChange={(e) => setProdi(e.target.value)}
                  placeholder="cth: Teknik Informatika"
                  required
                  className="w-full px-3 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-foreground cursor-pointer"
                >
                  {Array.from({ length: 14 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-foreground placeholder-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">
                Konfirmasi Password
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password"
                required
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-foreground placeholder-muted-foreground"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <XCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat akun...
                </>
              ) : "Daftar & Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-violet-600 font-semibold hover:underline"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
