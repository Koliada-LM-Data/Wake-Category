import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarRange,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  X,
  Plane,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { TimeFilterState, TimeFilterMode } from '../types';
import { PAST_12_MONTHS, SAMPLE_DAYS } from '../data/mockAirportData';

const KPI_DATA = [
  {
    name: 'Total Movements',
    definition: 'Total count of flight movements (arrivals & departures) across the selected filter scope.',
    formula: 'Total Movements = COUNTROWS(FactFlightMovements)',
    element: 'Card / KPI Badge (Header Sub-bar & Tooltips)',
  },
  {
    name: 'Wake Category Volume',
    definition: 'Number of flights classified under a specific wake category (Heavy, Medium, Light, Jet).',
    formula: 'Wake Category Movements = CALCULATE([Total Movements], FactFlightMovements[WakeCategory] = SELECTEDVALUE(DimWakeCategory[WakeCategory]))',
    element: 'Donut Chart / Clustered Bar Chart (Visual 1 & Visual 3)',
  },
  {
    name: 'Wake Category Share (%)',
    definition: 'Proportion of flights belonging to a specific wake category relative to all filtered flights.',
    formula: 'Wake Share % = DIVIDE([Wake Category Movements], CALCULATE([Total Movements], ALLSELECTED(DimWakeCategory)), 0)',
    element: 'Donut Chart (Flight Distribution by Wake Category)',
  },
  {
    name: 'Arrival Leader-Follower Pair Volume',
    definition: 'Count of consecutive arrival pairs on the same runway with a specific Leader and Follower wake category.',
    formula: 'Pair Count = CALCULATE(COUNTROWS(FactArrivalPairs), FactArrivalPairs[LeaderWake] = SELECTEDVALUE(DimLeaderWake[LeaderWake]), FactArrivalPairs[FollowerWake] = SELECTEDVALUE(DimFollowerWake[FollowerWake]))',
    element: 'Stacked Column Chart (Proportion of Arrival Wake Category Pairs)',
  },
  {
    name: 'Arrival Wake Pair Proportion (%)',
    definition: 'Percentage share of an arrival wake category pair (e.g., M-M, H-M, M-H) relative to total arrival pairs.',
    formula: 'Arrival Pair % = DIVIDE([Pair Count], CALCULATE(COUNTROWS(FactArrivalPairs), ALLSELECTED(FactArrivalPairs)), 0)',
    element: 'Stacked Column Chart (Proportion of Arrival Wake Category Pairs)',
  },
  {
    name: 'High Wake Separation Penalty Rate (%)',
    definition: 'Share of arrival pairs subject to maximum wake turbulence spacing penalties (e.g., Light following Heavy/Medium, Jet following Heavy).',
    formula: 'High Penalty Pair % = DIVIDE(CALCULATE([Pair Count], DimWakeStandard[SeparationNM] >= 5.0), CALCULATE(COUNTROWS(FactArrivalPairs), ALLSELECTED(FactArrivalPairs)), 0)',
    element: 'KPI Card / Tooltip Callout',
  },
  {
    name: 'Runway Traffic Volume',
    definition: 'Total flight movements handled on a specific runway direction (15L, 33R, 15C, 33C, 15R, 33L).',
    formula: 'Runway Volume = CALCULATE([Total Movements], FactFlightMovements[RunwayDirection] = SELECTEDVALUE(DimRunway[RunwayDirection]))',
    element: 'Stacked Bar / Column Chart (Visual 3 & Visual 4)',
  },
  {
    name: 'Runway Wake Share of Total Airport Traffic (%)',
    definition: 'Proportion of total airport movements across all runways attributed to a specific runway and wake category.',
    formula: 'Runway Wake Share % = DIVIDE(CALCULATE([Total Movements], FactFlightMovements[RunwayDirection] = SELECTEDVALUE(DimRunway[RunwayDirection]), FactFlightMovements[WakeCategory] = SELECTEDVALUE(DimWakeCategory[WakeCategory])), CALCULATE([Total Movements], ALLSELECTED(DimRunway), ALLSELECTED(DimWakeCategory)), 0)',
    element: 'Stacked Bar / Column Chart (Traffic Mix Distribution by Runway Direction)',
  },
  {
    name: 'Hourly Runway Traffic Volume',
    definition: 'Number of flight movements recorded on a runway during a specific hour of the day (0-23).',
    formula: 'Hourly Runway Volume = CALCULATE([Total Movements], FactFlightMovements[HourOfDay] = SELECTEDVALUE(DimTime[HourOfDay]))',
    element: 'Stacked Column Chart Grid (6 Visuals) (Traffic Mix Distribution by Runway Direction by Hour)',
  },
  {
    name: 'Runway Peak Hourly Volume',
    definition: 'The highest number of movements observed in a single one-hour window on a runway.',
    formula: 'Runway Peak Volume = MAXX(VALUES(DimTime[HourOfDay]), [Hourly Runway Volume])',
    element: 'Visual Header / Subtitle Tag on each of the 6 hourly runway charts',
  },
];

interface ControlPanelProps {
  timeFilter: TimeFilterState;
  onTimeFilterChange: (newFilter: TimeFilterState) => void;
  totalFilteredCount: number;
  totalDatasetCount: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  timeFilter,
  onTimeFilterChange,
  totalFilteredCount,
  totalDatasetCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<'months' | 'day' | null>(null);
  const [showKpiModal, setShowKpiModal] = useState(false);

  const monthsRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        monthsRef.current &&
        !monthsRef.current.contains(event.target as Node) &&
        dayRef.current &&
        !dayRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSetDefault12Months = () => {
    setOpenDropdown(null);
    onTimeFilterChange({
      mode: 'last12months',
      selectedMonths: PAST_12_MONTHS.map((m) => m.id),
      selectedDate: '2026-08-27',
    });
  };

  const handleToggleMonth = (monthId: string) => {
    let newMonths = [...timeFilter.selectedMonths];
    if (newMonths.includes(monthId)) {
      newMonths = newMonths.filter((id) => id !== monthId);
    } else {
      newMonths.push(monthId);
    }

    // Don't allow empty, fallback to this month
    if (newMonths.length === 0) {
      newMonths = [monthId];
    }

    onTimeFilterChange({
      ...timeFilter,
      mode: 'selectMonths',
      selectedMonths: newMonths,
    });
  };

  const handleSelectSingleMonth = (monthId: string) => {
    onTimeFilterChange({
      ...timeFilter,
      mode: 'selectMonths',
      selectedMonths: [monthId],
    });
  };

  const handleSelectQuarter = (quarterMonths: string[]) => {
    onTimeFilterChange({
      ...timeFilter,
      mode: 'selectMonths',
      selectedMonths: quarterMonths,
    });
  };

  const handleSelectDay = (dateStr: string) => {
    setOpenDropdown(null);
    onTimeFilterChange({
      ...timeFilter,
      mode: 'selectDay',
      selectedDate: dateStr,
    });
  };

  // Helper labels for active status
  const getActiveFilterLabel = () => {
    if (timeFilter.mode === 'last12months') {
      return 'Last 12 Months (Sep 2025 – Aug 2026)';
    }
    if (timeFilter.mode === 'selectMonths') {
      if (timeFilter.selectedMonths.length === 1) {
        const m = PAST_12_MONTHS.find((item) => item.id === timeFilter.selectedMonths[0]);
        return `Month: ${m?.label || timeFilter.selectedMonths[0]}`;
      }
      if (timeFilter.selectedMonths.length === 12) {
        return 'All 12 Months';
      }
      return `${timeFilter.selectedMonths.length} Months Selected (${timeFilter.selectedMonths
        .map((id) => PAST_12_MONTHS.find((m) => m.id === id)?.label.split(' ')[0])
        .filter(Boolean)
        .join(', ')})`;
    }
    if (timeFilter.mode === 'selectDay') {
      const sample = SAMPLE_DAYS.find((d) => d.date === timeFilter.selectedDate);
      if (sample) {
        return `Day: ${sample.label.split('(')[0].trim()}`;
      }
      return `Day: ${timeFilter.selectedDate}`;
    }
    return '';
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-30">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 shadow-2xs">
            <Plane className="w-4 h-4 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight">
                Airport Traffic Wake Category Analysis
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                RWY 15s / 33s
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Runways 15L/33R, 15C/33C, and 15R/33L • Wake Separation & Traffic Mix
            </p>
          </div>
        </div>

        {/* Center/Right: Control Panel with 3 Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:block mr-1">
            Time Filter:
          </div>

          {/* Button 1: Default view (last 12 months) */}
          <button
            type="button"
            id="filter-btn-default-12months"
            onClick={handleSetDefault12Months}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border shadow-2xs ${
              timeFilter.mode === 'last12months'
                ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-300'
            }`}
            title="View entire 12-month aggregated dataset"
          >
            <CalendarRange className="w-3.5 h-3.5 shrink-0" />
            <span>Default view (last 12 months)</span>
            {timeFilter.mode === 'last12months' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />
            )}
          </button>

          {/* Button 2: Select Months */}
          <div className="relative" ref={monthsRef}>
            <button
              type="button"
              id="filter-btn-select-months"
              onClick={() => setOpenDropdown(openDropdown === 'months' ? null : 'months')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border shadow-2xs ${
                timeFilter.mode === 'selectMonths'
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-300'
              }`}
              title="Select one or multiple months from the last 12 months"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Select Months</span>
              {timeFilter.mode === 'selectMonths' && (
                <span className="px-1 py-0.2 rounded text-[10px] bg-blue-700 text-white font-mono">
                  {timeFilter.selectedMonths.length}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'months' ? 'rotate-180' : ''}`} />
            </button>

            {/* Months Dropdown Popover */}
            {openDropdown === 'months' && (
              <div className="absolute right-0 sm:left-0 mt-1.5 w-[330px] sm:w-[380px] bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in-50 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">Select Month(s)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1 mb-2.5">
                  <div className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Quick Presets:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleSelectSingleMonth('2026-08')}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                    >
                      Aug 2026 (Peak)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectQuarter(['2026-06', '2026-07', '2026-08'])}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                    >
                      Summer 2026 (Jun-Aug)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectQuarter(['2025-12', '2026-01', '2026-02'])}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                    >
                      Winter (Dec-Feb)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onTimeFilterChange({
                          mode: 'selectMonths',
                          selectedMonths: PAST_12_MONTHS.map((m) => m.id),
                          selectedDate: timeFilter.selectedDate,
                        })
                      }
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                    >
                      All 12 Months
                    </button>
                  </div>
                </div>

                {/* 12 Months Grid */}
                <div className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                  Past 12 Months (Multi-Select):
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-3 max-h-[190px] overflow-y-auto pr-0.5">
                  {PAST_12_MONTHS.map((item) => {
                    const isSelected =
                      timeFilter.mode === 'selectMonths' &&
                      timeFilter.selectedMonths.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleMonth(item.id)}
                        className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all border text-left ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-500">
                    {timeFilter.selectedMonths.length} of 12 months selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-2xs text-xs"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Button 3: Select day */}
          <div className="relative" ref={dayRef}>
            <button
              type="button"
              id="filter-btn-select-day"
              onClick={() => setOpenDropdown(openDropdown === 'day' ? null : 'day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border shadow-2xs ${
                timeFilter.mode === 'selectDay'
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-300'
              }`}
              title="Select a specific day for 24-hour granular profile"
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>Select day</span>
              {timeFilter.mode === 'selectDay' && (
                <span className="px-1 py-0.2 rounded text-[10px] bg-blue-700 text-white font-mono">
                  {timeFilter.selectedDate.slice(5)}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'day' ? 'rotate-180' : ''}`} />
            </button>

            {/* Day Dropdown Popover */}
            {openDropdown === 'day' && (
              <div className="absolute right-0 mt-1.5 w-[320px] sm:w-[360px] bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in-50 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">Select Specific Day</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Direct Date Picker Input */}
                <div className="mb-3">
                  <label htmlFor="calendar-day-picker" className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Pick Any Date (Sep 2025 – Aug 2026):
                  </label>
                  <input
                    id="calendar-day-picker"
                    type="date"
                    min="2025-09-01"
                    max="2026-08-27"
                    value={timeFilter.selectedDate}
                    onChange={(e) => handleSelectDay(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono text-slate-800"
                  />
                </div>

                {/* Sample Operational Days */}
                <div className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                  Operational Days with 24h Profiles:
                </div>
                <div className="space-y-1 max-h-[180px] overflow-y-auto pr-0.5">
                  {SAMPLE_DAYS.map((dayItem) => {
                    const isSelected =
                      timeFilter.mode === 'selectDay' &&
                      timeFilter.selectedDate === dayItem.date;

                    return (
                      <button
                        key={dayItem.date}
                        type="button"
                        onClick={() => handleSelectDay(dayItem.date)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all border text-left ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-slate-900 font-medium truncate">
                            {dayItem.date}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate">
                            ({dayItem.tag})
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Power BI KPIs CSV / Specification Button */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
            <button
              type="button"
              onClick={() => setShowKpiModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-300 transition-colors shadow-2xs cursor-pointer"
              title="View KPI Definitions & DAX Formulas"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="hidden sm:inline">Power BI KPIs</span>
            </button>

            <a
              href="/power_bi_kpis.csv"
              download="power_bi_wake_analysis_kpis.csv"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="Download KPI Table as CSV file"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>.CSV</span>
            </a>
          </div>

          {/* Movement Counter Badge */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md text-xs">
            <span className="text-slate-500 hidden sm:inline">Movements:</span>
            <span className="font-mono font-bold text-slate-900">
              {totalFilteredCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Active Filter Scope Breadcrumb / Sub-bar */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-3 sm:px-4 py-1 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-500 shrink-0">Active Scope:</span>
          <span className="font-medium text-blue-950 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/80 truncate">
            {getActiveFilterLabel()}
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-500 hidden sm:inline font-mono">
            {totalFilteredCount.toLocaleString()} flights analyzed
          </span>
        </div>

        {timeFilter.mode !== 'last12months' && (
          <button
            type="button"
            onClick={handleSetDefault12Months}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline shrink-0 ml-2"
          >
            Reset to Default View (12 Months)
          </button>
        )}
      </div>

      {/* Power BI KPI Modal */}
      {showKpiModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Power BI Dashboard KPIs & DAX Specifications
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comprehensive formulas and visual mappings for airport wake category analytics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/power_bi_kpis.csv"
                  download="power_bi_wake_analysis_kpis.csv"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .CSV</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowKpiModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content / Table */}
            <div className="p-4 sm:p-5 overflow-auto flex-1 text-xs">
              <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                    <th className="py-2.5 px-3 w-[180px]">KPI Name</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Definition</th>
                    <th className="py-2.5 px-3 font-mono min-w-[280px]">Formula / DAX</th>
                    <th className="py-2.5 px-3 min-w-[190px]">Power BI Element</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {KPI_DATA.map((kpi, idx) => (
                    <tr
                      key={kpi.name}
                      className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/60'}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-900 align-top">
                        {kpi.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 leading-relaxed align-top">
                        {kpi.definition}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-blue-900 bg-blue-50/30 rounded align-top leading-tight break-words">
                        {kpi.formula}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 align-top">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-800">
                          {kpi.element}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Saved file: <code className="font-mono text-slate-700 font-semibold">/public/power_bi_kpis.csv</code></span>
              <button
                type="button"
                onClick={() => setShowKpiModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
