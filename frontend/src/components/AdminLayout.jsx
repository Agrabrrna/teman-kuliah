import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, HelpCircle, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function AdminLayout({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col transition-colors z-20">
        <div className="p-6">
          <h1 className="text-xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            TemanKuliah
            <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">ADMIN</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <NavLink to="/admin" end className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${isActive ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard Admin</span>
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${isActive ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400'}`}>
            <Users size={18} />
            <span>Kelola Pengguna</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${!user?.avatarUrl ? 'bg-gradient-to-br from-violet-400 to-cyan-400' : ''}`}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">{user?.initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-muted-foreground text-xs truncate">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-xs font-medium">
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="h-16 flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 justify-end sticky top-0 z-10">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
