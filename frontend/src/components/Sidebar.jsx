import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Upload, BookOpen, Calendar, 
  CheckSquare, TrendingUp, HelpCircle, User, GraduationCap, LogOut 
} from 'lucide-react';

const navItems = [
  { path: "/",           label: "Dashboard",        icon: LayoutDashboard },
  { path: "/upload",     label: "Upload Materi",    icon: Upload },
  { path: "/catatan",    label: "Catatan",          icon: BookOpen },
  { path: "/jadwal",     label: "Jadwal Kuliah",    icon: Calendar },
  { path: "/todo",       label: "To-Do List",       icon: CheckSquare },
  { path: "/progress",   label: "Progress Belajar", icon: TrendingUp },
  { path: "/kuis",       label: "Kuis",             icon: HelpCircle },
  { path: "/profil",     label: "Profil Saya",      icon: User },
];

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const page = location.pathname;

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: "#1E1B4B" }}>
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">TemanKuliah</p>
          <p className="text-violet-300 text-xs mt-0.5">Semester {user.semester} · 2026</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, label, icon: IconC }) => {
          const active = page === path;
          return (
            <Link
              key={path}
              to={path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-violet-200/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <IconC size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{user.initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
            <p className="text-violet-300 text-xs truncate">{user.prodi}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-violet-300 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs font-medium"
        >
          <LogOut size={14} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
