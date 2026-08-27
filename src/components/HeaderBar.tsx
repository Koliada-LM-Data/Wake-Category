import React from 'react';
import { Plane } from 'lucide-react';

interface HeaderBarProps {
  totalCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ totalCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Branding & Runway System */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 shadow-2xs">
            <Plane className="w-3.5 h-3.5 transform -rotate-45" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
              Airport Traffic Wake Category Analysis
            </h1>
            <p className="text-[11px] text-slate-500">
              Runways 15L/33R, 15C/33C, and 15R/33L
            </p>
          </div>
        </div>

        {/* Right: Total Movement Count */}
        <div className="flex items-center gap-2">
          <div className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md">
            <span>
              <strong className="text-slate-900 font-semibold">{totalCount.toLocaleString()}</strong> movements
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

