import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMaterials: 0,
    totalSchedules: 0,
    totalQuizzes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error("Gagal memuat statistik", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse flex gap-4"><div className="w-full h-32 bg-card rounded-xl"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Overview Sistem</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border flex items-start gap-4">
          <div className="p-3 bg-violet-500/10 text-violet-500 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Mahasiswa</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="bg-card p-5 rounded-xl border border-border flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Materi</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalMaterials}</p>
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Jadwal</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalSchedules}</p>
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Kuis Diambil</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalQuizzes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
