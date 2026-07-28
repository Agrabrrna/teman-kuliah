import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Gagal memuat pengguna", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Kelola Pengguna</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau username..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:border-violet-400 outline-none text-foreground w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Nama & Username</th>
                <th className="px-4 py-3 font-medium">Program Studi</th>
                <th className="px-4 py-3 font-medium text-center">Tugas</th>
                <th className="px-4 py-3 font-medium text-center">Jadwal</th>
                <th className="px-4 py-3 font-medium text-center">Kuis</th>
                <th className="px-4 py-3 font-medium text-right">Terdaftar Pada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">Memuat data...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">Tidak ada pengguna ditemukan.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.prodi || '-'} (Smt {user.semester})</td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">{user._count.todos}</td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">{user._count.schedules}</td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">{user._count.quizAttempts}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
