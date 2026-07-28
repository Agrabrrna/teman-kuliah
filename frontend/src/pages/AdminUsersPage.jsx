import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

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

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingRole(userId);
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Gagal memperbarui role", error);
      alert(error.response?.data?.error || "Gagal memperbarui role");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      setUpdatingStatus(userId);
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (error) {
      console.error("Gagal memperbarui status", error);
      alert(error.response?.data?.error || "Gagal memperbarui status");
    } finally {
      setUpdatingStatus(null);
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
                <th className="px-4 py-3 font-medium text-center">Role</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
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
                    <td className="px-4 py-3 text-center">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingRole === user.id}
                        className={`text-xs px-2 py-1 rounded-md outline-none bg-card border ${user.role === 'ADMIN' ? 'border-violet-500/50 text-violet-500 font-bold' : 'border-border text-foreground'}`}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        disabled={updatingStatus === user.id}
                        className={`text-xs px-2 py-1 rounded-md transition-colors font-medium ${
                          user.isActive 
                            ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        }`}
                      >
                        {user.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">{user._count?.todos || 0}</td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">{user._count?.schedules || 0}</td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">{user._count?.quizAttempts || 0}</td>
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
