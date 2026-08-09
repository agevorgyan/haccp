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
  X,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
} from 'lucide-react';
import { userService, type UserItem } from '../../services/userService';
import { PageHeader } from '../../components/common/PageHeader';
import { EmployeeCard } from '../../components/common/EmployeeCard';

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

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
    setPassword('');
    setRole(user.role);
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (editingUser) {
        const payload: any = { firstName, lastName, phone, role };
        if (password.trim()) {
          payload.password = password;
        }

        const updated = await userService.updateUser(editingUser.id, payload);
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
        setSuccessMsg(t('users.updateSuccess', 'User updated successfully'));
      } else {
        const created = await userService.createUser({
          firstName,
          lastName,
          phone,
          password,
          role,
        });
        setUsers((prev) => [created, ...prev]);
        setSuccessMsg(t('users.createSuccess', 'User created successfully'));
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
    if (!window.confirm(`Are you sure you want to delete "${fullName}" (${user.phone})?`)) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccessMsg('User deleted successfully.');
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
          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold uppercase tracking-wider">
            {t('common.roles.superAdmin', 'Super Admin')}
          </span>
        );
      case 'OWNER':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider">
            {t('common.roles.owner', 'Owner')}
          </span>
        );
      case 'MANAGER':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-extrabold uppercase tracking-wider">
            {t('common.roles.manager', 'Kitchen Manager')}
          </span>
        );
      case 'STAFF':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
            {t('common.roles.staff', 'Kitchen Staff')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Reusable PageHeader Component */}
      <PageHeader
        title="Team & Role Management"
        subtitle="Manage kitchen operators, managers, roles, medical books, and account access permissions."
        icon={Users}
        badge="STAFF DIRECTORY"
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Team Member</span>
          </button>
        }
      />

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Control Bar: Search & View Mode Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members by name, phone, or role..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Viewport */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span>Fetching team members...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
          No team members found matching your search query.
        </div>
      ) : viewMode === 'GRID' ? (
        /* GRID VIEW USING EMPLOYEE CARD COMPONENT */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((u) => (
            <EmployeeCard
              key={u.id}
              user={u}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteUser}
            />
          ))}
        </div>
      ) : (
        /* REDESIGNED ENTERPRISE DATA TABLE VIEW */
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Medical Book</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs uppercase">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-800 font-medium">
                      {user.phone}
                    </td>

                    <td className="py-3.5 px-4">
                      {renderRoleBadge(user.role)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {user.organization?.name || 'SafeKitchen Operations'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete User"
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
        </div>
      )}

      {/* CREATE/EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Edit User Account' : 'Create User Account'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Smith"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number (Login ID)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 099111111"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {editingUser ? 'New PIN / Password (Optional)' : '4-Digit PIN / Password'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? 'Leave blank to keep existing' : 'e.g. 1234'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Role Permission</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="STAFF">Kitchen Staff (Daily Log Operator)</option>
                  <option value="MANAGER">Kitchen Manager (Approver & Reports)</option>
                  <option value="OWNER">Business Owner (Full Tenant Admin)</option>
                  <option value="SUPER_ADMIN">Super Admin (Global Oversight)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingUser ? 'Update Account' : 'Create Account'}</span>
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
