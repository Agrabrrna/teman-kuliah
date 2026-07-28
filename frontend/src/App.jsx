import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import CatatanPage from './pages/CatatanPage';
import JadwalPage from './pages/JadwalPage';
import TodoPage from './pages/TodoPage';
import ProgressPage from './pages/ProgressPage';
import KuisPage from './pages/KuisPage';
import ProfilPage from './pages/ProfilPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function MainApp({ user, onLogout, onUpdateUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState([
    { id:1, title:"Tugas baru ditambahkan", desc:"Tugas Kalkulus II dari Dosen A", time:"10 menit lalu", type:"todo", read:false },
    { id:2, title:"Jadwal pengganti", desc:"Fisika Dasar dipindah ke jam 13:00", time:"1 jam lalu", type:"jadwal", read:false },
    { id:3, title:"Materi baru diupload", desc:"Modul 5 - Pemrograman Web", time:"2 jam lalu", type:"upload", read:true },
    { id:4, title:"Nilai Kuis Keluar", desc:"Kuis Basis Data: 85/100", time:"Kemarin", type:"nilai", read:true },
  ]);

  const location = useLocation();

  useEffect(() => {
    // Close sidebar on mobile when route changes
    setSidebarOpen(false);
  }, [location]);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOneRead = (id) => setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const clearNotifs = () => setNotifs([]);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar user={user} onLogout={onLogout} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          user={user}
          notifs={notifs}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onMarkOneRead={markOneRead}
          onClearNotifs={clearNotifs}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage user={user} />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/catatan" element={<CatatanPage />} />
            <Route path="/jadwal" element={<JadwalPage />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/kuis" element={<KuisPage />} />
            <Route path="/profil" element={<ProfilPage user={user} onUpdateUser={onUpdateUser} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([
    {
      name: "Budi Santoso",
      username: "budi123",
      password: "password123",
      prodi: "Teknik Informatika",
      semester: 3,
      initials: "BS",
    }
  ]);

  const login = (account) => {
    const names = account.name.trim().split(" ");
    const initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);
    setUser({ ...account, initials: initials.toUpperCase() });
  };

  const register = (accData) => {
    setAccounts((prev) => [...prev, accData]);
    return accData;
  };

  const logout = () => setUser(null);

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      const names = next.name.trim().split(" ");
      next.initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);
      next.initials = next.initials.toUpperCase();
      
      setAccounts((accs) => accs.map(a => a.username === prev.username ? { ...a, ...next } : a));
      return next;
    });
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage accounts={accounts} onLogin={login} />} />
        <Route path="/register" element={<RegisterPage accounts={accounts} onRegister={register} onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return <MainApp user={user} onLogout={logout} onUpdateUser={updateUser} />;
}
