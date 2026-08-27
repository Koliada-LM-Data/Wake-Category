import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RunwayHourlyTraffic, WakeCategory, RunwayDirection } from '../types';
import { PowerBiVisualWrapper } from './PowerBiVisualWrapper';
import { WAKE_COLORS, RUNWAY_DETAILS } from '../data/mockAirportData';
import { Clock } from 'lucide-react';

interface RunwayHourlySixChartsProps {
  hourlyTraffic: RunwayHourlyTraffic[];
  selectedWakeCategory: WakeCategory | 'All';
  selectedRunway: RunwayDirection | 'All';
  onSelectRunway: (rwy: RunwayDirection | 'All') => void;
}

// Order for 3 columns x 2 rows:
// Col 1: Upper 15L, Lower 33R
// Col 2: Upper 15C, Lower 33C
// Col 3: Upper 15R, Lower 33L
const ORDERED_HOURLY_RUNWAYS: RunwayDirection[] = [
  '15L', '15C', '15R', // Row 1
  '33R', '33C', '33L', // Row 2
];

export const RunwayHourlySixCharts: React.FC<RunwayHourlySixChartsProps> = ({
  hourlyTraffic,
  selectedWakeCategory,
  selectedRunway,
  onSelectRunway,
}) => {
  // Sort items to match exactly: Row 1 = [15L, 15C, 15R], Row 2 = [33R, 33C, 33L]
  const sortedHourlyTraffic = ORDERED_HOURLY_RUNWAYS.map(
    (rwy) => hourlyTraffic.find((item) => item.runway === rwy)
  ).filter((item): item is RunwayHourlyTraffic => Boolean(item));

  return (
    <PowerBiVisualWrapper
      id="visual-runway-hourly-six-charts"
      title="Traffic Mix Distribution by Runway Direction by Hour (6 Visuals)"
      subtitle="24-hour temporal wake category profile across runway pairs"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
        {sortedHourlyTraffic.map((item) => {
          const isRunwaySelected = selectedRunway === item.runway;
          const isRunwayDimmed = selectedRunway !== 'All' && !isRunwaySelected;
          const details = RUNWAY_DETAILS[item.runway];
          const chartData = item.data;

          const totalMovementOnRunway = item.data.reduce((acc, curr) => acc + curr.total, 0);

          const CustomHourlyTooltip = ({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              const dataPoint = payload[0].payload;
              return (
                <div className="bg-white text-slate-800 text-xs p-2 rounded-md shadow-lg border border-slate-200 min-w-[150px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
                    <span className="font-bold text-slate-900">
                      RWY {item.runway} @ {label}:00
                    </span>
                    <span className="font-mono text-slate-900 font-bold">
                      {dataPoint.total} flights
                    </span>
                  </div>
                  <div className="space-y-0.5 text-slate-600 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: WAKE_COLORS.Heavy }} />
                        Heavy (H):
                      </span>
                      <span className="font-mono font-semibold text-slate-800">{dataPoint.Heavy}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: WAKE_COLORS.Jet }} />
                        Jet (J):
                      </span>
                      <span className="font-mono font-semibold text-slate-800">{dataPoint.Jet}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: WAKE_COLORS.Light }} />
                        Light (L):
                      </span>
                      <span className="font-mono font-semibold text-slate-800">{dataPoint.Light}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: WAKE_COLORS.Medium }} />
                        Medium (M):
                      </span>
                      <span className="font-mono font-semibold text-slate-800">{dataPoint.Medium}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          };

          return (
            <div
              key={`hourly-${item.runway}`}
              className={`rounded-lg border transition-all p-2.5 flex flex-col justify-between ${
                isRunwaySelected
                  ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/40 shadow-xs'
                  : isRunwayDimmed
                  ? 'bg-slate-50/60 border-slate-200 opacity-40'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Runway Header Info */}
              <div className="flex items-start justify-between gap-1.5 mb-1.5 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectRunway(isRunwaySelected ? 'All' : item.runway)}
                    className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded border border-slate-200 shadow-2xs hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors cursor-pointer"
                  >
                    RWY {item.runway}
                  </button>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-800 block leading-tight">
                      Hourly Traffic Stack
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {details.role}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-blue-700 font-mono block">
                    Peak: {item.peakVolume} @ {item.peakHour.toString().padStart(2, '0')}:00
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {totalMovementOnRunway} flights
                  </span>
                </div>
              </div>

              {/* Stacked Hourly Bar Chart */}
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    stackOffset="none"
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 8, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                      tickFormatter={(hour) => `${hour}h`}
                      interval={3}
                    />
                    <YAxis
                      tick={{ fontSize: 8, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomHourlyTooltip />} />

                    {/* Stacked Bars in unified order: H, J, L, M */}
                    <Bar
                      dataKey="Heavy"
                      stackId="wake"
                      fill={WAKE_COLORS.Heavy}
                      opacity={selectedWakeCategory === 'All' || selectedWakeCategory === 'Heavy' ? 1 : 0.25}
                      name="Heavy"
                    />
                    <Bar
                      dataKey="Jet"
                      stackId="wake"
                      fill={WAKE_COLORS.Jet}
                      opacity={selectedWakeCategory === 'All' || selectedWakeCategory === 'Jet' ? 1 : 0.25}
                      name="Jet"
                    />
                    <Bar
                      dataKey="Light"
                      stackId="wake"
                      fill={WAKE_COLORS.Light}
                      opacity={selectedWakeCategory === 'All' || selectedWakeCategory === 'Light' ? 1 : 0.25}
                      name="Light"
                    />
                    <Bar
                      dataKey="Medium"
                      stackId="wake"
                      fill={WAKE_COLORS.Medium}
                      opacity={selectedWakeCategory === 'All' || selectedWakeCategory === 'Medium' ? 1 : 0.25}
                      radius={[1, 1, 0, 0]}
                      name="Medium"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Mini Legend */}
              <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100 text-[10px] text-slate-500">
                <span className="flex items-center gap-1 font-mono text-slate-400">
                  <Clock className="w-3 h-3 text-slate-400" /> 00:00 - 23:00
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-xs" style={{ backgroundColor: WAKE_COLORS.Heavy }} /> H
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-xs" style={{ backgroundColor: WAKE_COLORS.Jet }} /> J
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-xs" style={{ backgroundColor: WAKE_COLORS.Light }} /> L
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-xs" style={{ backgroundColor: WAKE_COLORS.Medium }} /> M
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PowerBiVisualWrapper>
  );
};
