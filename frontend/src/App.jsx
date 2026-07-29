import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './lib/api';
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

// Admin imports
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';

function MainApp({ user, onLogout, onUpdateUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);

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
          {/* Admin Routes - should ideally be handled at App level, but if kept here, ensure no double layout. For now we remove it from MainApp */}
          {/* User Routes */}
          {user?.role !== 'ADMIN' && (
            <>
              <Route path="/" element={<DashboardPage user={user} />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/catatan" element={<CatatanPage />} />
              <Route path="/jadwal" element={<JadwalPage />} />
              <Route path="/todo" element={<TodoPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/kuis" element={<KuisPage user={user} />} />
              <Route path="/profil" element={<ProfilPage user={user} onUpdateUser={onUpdateUser} />} />
            </>
          )}
          
          <Route path="*" element={<Navigate to={user?.role === 'ADMIN' ? "/admin" : "/"} replace />} />
        </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Auto-login dengan JWT
      api.get('/auth/profile')
        .then((res) => {
          setUser(res.data.user);
        })
        .catch((err) => {
          console.error("Session expired or invalid", err);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoadingSession(false);
        });
    } else {
      setLoadingSession(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      const names = next.name.trim().split(" ");
      next.initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0].substring(0, 2);
      next.initials = next.initials.toUpperCase();
      return next;
    });
  };

  if (loadingSession) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/register" element={<RegisterPage onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout user={user} onLogout={logout} />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return <MainApp user={user} onLogout={logout} onUpdateUser={updateUser} />;
}
