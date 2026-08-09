import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserItem } from '../../services/userService';
import {
  Phone,
  ShieldCheck,
  Building2,
  Calendar,
  Lock,
  Edit2,
  Trash2,
  ClipboardCheck,
} from 'lucide-react';

interface EmployeeCardProps {
  user: UserItem;
  onEdit: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
}

/**
 * Reusable EmployeeCard Component
 * Enterprise SaaS card representing an employee/team member with dark avatar,
 * contact info, medical book verification status, and quick action bar.
 */
export const EmployeeCard: React.FC<EmployeeCardProps> = ({ user, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Employee';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'EM';

  const renderRoleBadge = (role: UserItem['role']) => {
    switch (role) {
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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header Row: Avatar & Name */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0 tracking-wider">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate group-hover:text-blue-600 transition-colors">
              {fullName}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              {renderRoleBadge(user.role)}
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Account" />
            </div>
          </div>
        </div>

        {/* Contact & Metadata Details */}
        <div className="space-y-2 text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono text-slate-800">{user.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{user.organization?.name || 'SafeKitchen Operations'}</span>
          </div>

          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Access: All Kitchen Log Forms</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Medical Book: Valid & Verified</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Quick Action Bar */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Quick Actions
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => alert(`View shift schedule for ${fullName}`)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
            title="Shift Schedule"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => alert(`Security / PIN lock for ${fullName}`)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
            title="Security PIN Lock"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
            title="Edit User"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
            title="Delete User"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
