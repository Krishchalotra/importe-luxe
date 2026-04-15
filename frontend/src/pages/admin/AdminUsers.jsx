import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users?sort=-createdAt');
      setUsers(res.data.data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (userId, isActive) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isActive: !isActive });
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-luxury-text">Users</h1>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded" />)}</div>
      ) : (
        <div className="card-luxury overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-luxury-border">
              <tr>
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-luxury-subtext tracking-widest uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-luxury-charcoal transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-luxury-text">{user.name}</p>
                    <p className="text-xs text-luxury-subtext">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="bg-luxury-charcoal border border-luxury-border text-luxury-subtext text-xs px-2 py-1 focus:outline-none focus:border-gold-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-luxury-subtext text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(user._id, user.isActive)}
                      className={`text-xs transition-colors ${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
