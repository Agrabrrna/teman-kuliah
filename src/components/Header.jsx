import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Upload, Calendar, CheckSquare, Star } from 'lucide-react';

export default function Header({ onMenuToggle, user, notifs, unreadCount, onMarkAllRead, onMarkOneRead, onClearNotifs }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const page = location.pathname;

  const titles = {
    "/": "Dashboard", 
    "/upload": "Upload Materi", 
    "/catatan": "Catatan",
    "/jadwal": "Jadwal Kuliah", 
    "/todo": "To-Do List", 
    "/progress": "Progress Belajar", 
    "/kuis": "Kuis",
    "/profil": "Profil Saya",
  };
  
  const title = titles[page] || "Dashboard";
  const typeIcon = { upload: Upload, jadwal: Calendar, todo: CheckSquare, nilai: Star };
  const typeColor = { upload: "text-cyan-600 bg-cyan-100", jadwal: "text-violet-600 bg-violet-100", todo: "text-red-600 bg-red-100", nilai: "text-amber-600 bg-amber-100" };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-5 gap-4 flex-shrink-0 relative">
      <button onClick={onMenuToggle} className="text-muted-foreground hover:text-foreground transition-colors">
        <Menu size={20} />
      </button>
      <h1 className="font-bold text-foreground text-base">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 w-80 max-h-[26rem] bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
                  <p className="font-bold text-sm text-foreground">Notifikasi</p>
                  {notifs.length > 0 && (
                    <button onClick={onMarkAllRead} className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifs.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">Tidak ada notifikasi</p>
                  )}
                  {notifs.map((n) => {
                    const IconC = typeIcon[n.type] || Bell;
                    return (
                      <button
                        key={n.id}
                        onClick={() => onMarkOneRead(n.id)}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors ${!n.read ? "bg-violet-50/50" : ""}`}
                      >
                        <div className={`w-7 h-7 rounded-lg ${typeColor[n.type] || "text-violet-600 bg-violet-100"} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <IconC size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs leading-snug ${!n.read ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{n.desc}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />}
                      </button>
                    );
                  })}
                </div>
                {notifs.length > 0 && (
                  <button onClick={onClearNotifs} className="flex-shrink-0 text-xs font-semibold text-muted-foreground hover:text-red-500 py-2.5 border-t border-border transition-colors">
                    Hapus semua notifikasi
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => navigate("/profil")}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center hover:ring-2 hover:ring-violet-300 transition-all"
          title="Profil Saya"
        >
          <span className="text-white text-xs font-bold">{user.initials}</span>
        </button>
      </div>
    </header>
  );
}
