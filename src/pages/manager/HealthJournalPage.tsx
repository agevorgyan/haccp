import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  HeartPulse,
  UserCheck,
  Plus,
  Trash2,
  Download,
  Calendar,
  Users,
  ShieldCheck,
} from 'lucide-react';

interface EmployeeAccessItem {
  id: string;
  name: string;
  role: string;
  phone: string;
  hasAccess: boolean;
  medicalBookValid: boolean;
}

type InspectionStatus = 'ALLOWED' | 'DISQUALIFIED' | 'VACATION' | 'NONE';

interface DailyInspection {
  [day: number]: InspectionStatus;
}

const INITIAL_EMPLOYEES: EmployeeAccessItem[] = [
  { id: '1', name: 'Arman Grigoryan', role: 'Head Chef', phone: '099111111', hasAccess: true, medicalBookValid: true },
  { id: '2', name: 'Anahit Sargsyan', role: 'Sous Chef', phone: '099222222', hasAccess: true, medicalBookValid: true },
  { id: '3', name: 'David Mkrtchyan', role: 'Line Cook', phone: '099333333', hasAccess: true, medicalBookValid: true },
  { id: '4', name: 'Lilit Hakobyan', role: 'Pastry Chef', phone: '099444444', hasAccess: false, medicalBookValid: true },
  { id: '5', name: 'Karen Hovhannisyan', role: 'Kitchen Prep Operator', phone: '099555555', hasAccess: false, medicalBookValid: false },
];

export const HealthJournalPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeAccessItem[]>(INITIAL_EMPLOYEES);
  const [selectedMonth, setSelectedMonth] = useState<string>('October 2026');

  // Days of month array (1 to 31)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Matrix state: { [employeeId]: { [dayNumber]: InspectionStatus } }
  const [matrixData, setMatrixData] = useState<Record<string, DailyInspection>>({
    '1': { 1: 'ALLOWED', 2: 'ALLOWED', 3: 'ALLOWED', 4: 'ALLOWED', 5: 'ALLOWED', 6: 'ALLOWED', 7: 'VACATION', 8: 'ALLOWED', 9: 'ALLOWED' },
    '2': { 1: 'ALLOWED', 2: 'ALLOWED', 3: 'DISQUALIFIED', 4: 'ALLOWED', 5: 'ALLOWED', 6: 'ALLOWED', 7: 'ALLOWED', 8: 'ALLOWED', 9: 'ALLOWED' },
    '3': { 1: 'ALLOWED', 2: 'ALLOWED', 3: 'ALLOWED', 4: 'ALLOWED', 5: 'ALLOWED', 6: 'ALLOWED', 7: 'ALLOWED', 8: 'ALLOWED', 9: 'ALLOWED' },
  });

  const toggleAccess = (id: string, accessState: boolean) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, hasAccess: accessState } : emp))
    );
  };

  const handleCellClick = (employeeId: string, day: number) => {
    setMatrixData((prev) => {
      const empData = prev[employeeId] || {};
      const current = empData[day] || 'NONE';

      let next: InspectionStatus = 'NONE';
      if (current === 'NONE') next = 'ALLOWED';
      else if (current === 'ALLOWED') next = 'DISQUALIFIED';
      else if (current === 'DISQUALIFIED') next = 'VACATION';
      else if (current === 'VACATION') next = 'NONE';

      return {
        ...prev,
        [employeeId]: {
          ...empData,
          [day]: next,
        },
      };
    });
  };

  const renderStatusBadge = (status: InspectionStatus) => {
    switch (status) {
      case 'ALLOWED':
        return (
          <span
            className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 transition-transform"
            title="Допущен / Fit for Duty (Allowed)"
          >
            Д
          </span>
        );
      case 'DISQUALIFIED':
        return (
          <span
            className="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer animate-pulse hover:scale-110 transition-transform"
            title="Не допущен / Disqualified (High Temp / Symptoms)"
          >
            Н
          </span>
        );
      case 'VACATION':
        return (
          <span
            className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 transition-transform"
            title="Отпуск / Vacation / Sick Leave"
          >
            О
          </span>
        );
      case 'NONE':
      default:
        return (
          <span
            className="text-slate-300 font-bold text-xs cursor-pointer hover:text-slate-600 transition-colors"
            title="Click to record health inspection"
          >
            -
          </span>
        );
    }
  };

  const activeEmployeesWithAccess = employees.filter((e) => e.hasAccess);
  const inactiveEmployees = employees.filter((e) => !e.hasAccess);

  // Compute column total summary statistics
  const getColStats = (day: number) => {
    let totalInspected = 0;
    let totalAllowed = 0;
    let totalDisqualified = 0;

    activeEmployeesWithAccess.forEach((emp) => {
      const status = matrixData[emp.id]?.[day] || 'NONE';
      if (status !== 'NONE') {
        totalInspected++;
        if (status === 'ALLOWED') totalAllowed++;
        if (status === 'DISQUALIFIED') totalDisqualified++;
      }
    });

    return { totalInspected, totalAllowed, totalDisqualified };
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Reusable PageHeader Component */}
      <PageHeader
        title="Health Journal (Журнал здоровья)"
        subtitle="Sanitation & medical inspection compliance matrix. Record daily staff health checks and track disqualifications."
        icon={HeartPulse}
        badge="FDA & HACCP MANDATORY"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Exporting Health Journal PDF Report...')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export PDF Report</span>
            </button>
          </div>
        }
      />

      {/* SPLIT-VIEW ACCESS CONTROL & PERMISSIONS CARD */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Employees Directory */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>All Employees Directory</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {inactiveEmployees.length} Pending Assignment
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {inactiveEmployees.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">All staff members have journal access assigned.</p>
            ) : (
              inactiveEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center uppercase">
                      {emp.name[0]}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">{emp.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{emp.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAccess(emp.id, true)}
                    className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Grant Access</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Employees with Active Access */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Employees with Active Access</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {activeEmployeesWithAccess.length} Active Users
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {activeEmployeesWithAccess.map((emp) => (
              <div
                key={emp.id}
                className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-2xs">
                    {emp.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 leading-tight">{emp.name}</span>
                      <span title="Medical Book Verified">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{emp.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleAccess(emp.id, false)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                  title="Revoke Journal Access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MONTHLY HEALTH INSPECTION DATE GRID MATRIX */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Matrix Toolbar & Legend */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="October 2026">October 2026</option>
              <option value="November 2026">November 2026</option>
              <option value="December 2026">December 2026</option>
            </select>
          </div>

          {/* Status Legend Badges */}
          <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center">
                Д
              </span>
              <span className="text-slate-700">Allowed (Допущен)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center">
                Н
              </span>
              <span className="text-slate-700">Disqualified (Не допущен)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">
                О
              </span>
              <span className="text-slate-700">Vacation (Отпуск)</span>
            </div>
          </div>
        </div>

        {/* Scrollable Matrix Table with Sticky Left Column */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {/* Sticky Left Column Header */}
                <th className="sticky left-0 bg-slate-50 z-20 py-3 px-4 font-bold text-[11px] text-slate-600 uppercase tracking-wider border-r border-slate-200 min-w-[210px] shadow-xs">
                  Employee (Сотрудник)
                </th>
                {/* Days 1 to 31 Header Columns */}
                {daysInMonth.map((day) => (
                  <th
                    key={day}
                    className="py-3 px-1 text-center font-bold text-[11px] text-slate-600 uppercase border-r border-slate-200/60 min-w-[38px] w-9"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeEmployeesWithAccess.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Sticky Employee Identity Cell */}
                  <td className="sticky left-0 bg-white z-10 py-3 px-4 border-r border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center uppercase shrink-0">
                        {emp.name[0]}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate leading-tight">{emp.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium block truncate">{emp.role}</span>
                      </div>
                    </div>
                  </td>

                  {/* Days 1 to 31 Status Cells */}
                  {daysInMonth.map((day) => {
                    const status = matrixData[emp.id]?.[day] || 'NONE';
                    return (
                      <td
                        key={day}
                        onClick={() => handleCellClick(emp.id, day)}
                        className="py-2 px-1 text-center border-r border-slate-100 select-none hover:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-center">
                          {renderStatusBadge(status)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {/* SUMMARY TOTAL COUNT ROWS AT BOTTOM */}
            <tfoot>
              {/* Row 1: Total Inspected */}
              <tr className="bg-slate-50/90 border-t-2 border-slate-200 text-[11px] font-bold text-slate-700">
                <td className="sticky left-0 bg-slate-100 z-10 py-2.5 px-4 border-r border-slate-200 shadow-xs font-extrabold text-blue-700">
                  Total Inspected (Осмотрено)
                </td>
                {daysInMonth.map((day) => {
                  const stats = getColStats(day);
                  return (
                    <td key={day} className="py-2.5 px-1 text-center border-r border-slate-200/60 font-bold text-slate-800">
                      {stats.totalInspected || '-'}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Total Allowed */}
              <tr className="bg-emerald-50/50 border-t border-slate-200 text-[11px] font-bold text-emerald-800">
                <td className="sticky left-0 bg-emerald-50 z-10 py-2.5 px-4 border-r border-slate-200 shadow-xs font-extrabold text-emerald-800">
                  Fit for Duty (Допущены)
                </td>
                {daysInMonth.map((day) => {
                  const stats = getColStats(day);
                  return (
                    <td key={day} className="py-2.5 px-1 text-center border-r border-slate-200/60 font-extrabold text-emerald-700">
                      {stats.totalAllowed || '-'}
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Total Disqualified */}
              <tr className="bg-rose-50/50 border-t border-slate-200 text-[11px] font-bold text-rose-800">
                <td className="sticky left-0 bg-rose-50 z-10 py-2.5 px-4 border-r border-slate-200 shadow-xs font-extrabold text-rose-800">
                  Disqualified (Не допущены)
                </td>
                {daysInMonth.map((day) => {
                  const stats = getColStats(day);
                  return (
                    <td key={day} className="py-2.5 px-1 text-center border-r border-slate-200/60 font-extrabold text-rose-600">
                      {stats.totalDisqualified || '-'}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthJournalPage;
