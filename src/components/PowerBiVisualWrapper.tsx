import React from 'react';

interface PowerBiVisualWrapperProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  className?: string;
  actionElement?: React.ReactNode;
}

export const PowerBiVisualWrapper: React.FC<PowerBiVisualWrapperProps> = ({
  id,
  title,
  subtitle,
  badge,
  badgeColor = 'bg-slate-100 text-slate-700 border border-slate-200',
  children,
  className = '',
  actionElement,
}) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-lg border border-slate-200 shadow-2xs p-3 transition-all duration-150 flex flex-col ${className}`}
    >
      {/* Visual Header */}
      <div className="flex items-start justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight leading-tight">
              {title}
            </h3>
            {badge && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        {actionElement && (
          <div className="flex items-center gap-1 shrink-0">
            {actionElement}
          </div>
        )}
      </div>

      {/* Visual Content Body */}
      <div className="flex-1 w-full min-h-0 flex flex-col">{children}</div>
    </div>
  );
};

