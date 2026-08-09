import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search, 
  RefreshCw,
  Phone,
  Lock,
  User as UserIcon,
  X
} from 'lucide-react';
import { userService, type UserItem } from '../../services/userService';

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal form states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF'>('STAFF');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.message || 'Unable to fetch team user list from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setPhone('');
    setPassword('');
    setRole('STAFF');
    setError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (user: UserItem) => {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setPassword(''); // Leave blank if not updating
    setRole(user.role);
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError('First name, last name, and phone number are required.');
      return;
    }

    if (!editingUser && !password.trim()) {
      setError('Password/PIN is required for new user creation.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        // Update user
        const updated = await userService.updateUser(editingUser.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          password: password.trim().length > 0 ? password.trim() : undefined,
          role,
        });

        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
        setSuccessMsg(t('users.updateSuccess'));
      } else {
        // Create user
        const created = await userService.createUser({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          password: password.trim(),
          role,
        });

        setUsers((prev) => [created, ...prev]);
        setSuccessMsg(t('users.createSuccess'));
      }

      setShowModal(false);
    } catch (err: any) {
      console.error('Save user failed:', err);
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join('. '));
      } else if (typeof msg === 'string') {
        setError(msg);
      } else {
        setError('Failed to save user account.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    const fullName = `${user.firstName} ${user.lastName}`;
    if (!window.confirm(`${t('users.deleteConfirm')} "${fullName}" (${user.phone})?`)) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccessMsg(t('users.deleteSuccess'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user account.');
    }
  };

  // Filtered users search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const phoneStr = (u.phone || '').toLowerCase();
    const roleStr = (u.role || '').toLowerCase();
    return name.includes(q) || phoneStr.includes(q) || roleStr.includes(q);
  });

  const renderRoleBadge = (userRole: UserItem['role']) => {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold uppercase tracking-wider">
            {t('common.roles.superAdmin')}
          </span>
        );
      case 'OWNER':
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider">
            {t('common.roles.owner')}
          </span>
        );
      case 'MANAGER':
        return (
          <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold uppercase tracking-wider">
            {t('common.roles.manager')}
          </span>
        );
      case 'STAFF':
      default:
        return (
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
            {t('common.roles.staff')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto antialiased">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20">
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('users.title')}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('users.subtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('users.addUser')}</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users Data Grid Section */}
      <div className="bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-white">
              {t('users.registeredUsers')} ({filteredUsers.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('users.searchPlaceholder')}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors"
              title={t('common.refresh')}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span>Fetching team members...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No user accounts found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">{t('users.fullName')}</th>
                  <th className="py-3 px-4">{t('users.phone')}</th>
                  <th className="py-3 px-4">{t('users.role')}</th>
                  <th className="py-3 px-4">{t('users.organization')}</th>
                  <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 font-extrabold text-xs flex items-center justify-center border border-slate-700 uppercase">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {user.phone}
                    </td>

                    <td className="py-3.5 px-4">
                      {renderRoleBadge(user.role)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {user.organization?.name || 'SafeKitchen SaaS'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                          title={t('common.edit')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-emerald-400" />
                <span>{editingUser ? t('users.editUser') : t('users.addUser')}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">{t('users.firstName')}</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Alex"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">{t('users.lastName')}</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Manager"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{t('users.phone')}</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="099111111"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{t('users.password')}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editingUser}
                    placeholder={editingUser ? t('users.passwordEditHint') : '1234'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{t('users.role')}</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="STAFF">{t('common.roles.staff')}</option>
                  <option value="MANAGER">{t('common.roles.manager')}</option>
                  <option value="OWNER">{t('common.roles.owner')}</option>
                  <option value="SUPER_ADMIN">{t('common.roles.superAdmin')}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{t('common.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
