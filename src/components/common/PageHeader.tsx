import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
}

/**
 * Reusable Modern Enterprise SaaS PageHeader Component
 * Provides standard title, subtitle, badge indicator, and right-aligned action buttons.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm mb-6">
      <div className="flex items-start sm:items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {badge && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
