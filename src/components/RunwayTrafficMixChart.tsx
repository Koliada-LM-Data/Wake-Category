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
import { RunwayTrafficMix, RunwayDirection } from '../types';
import { PowerBiVisualWrapper } from './PowerBiVisualWrapper';
import { WAKE_COLORS, RUNWAY_DETAILS } from '../data/mockAirportData';

interface RunwayTrafficMixChartProps {
  runwayMixes: RunwayTrafficMix[];
}

const ORDERED_RUNWAYS: RunwayDirection[] = ['15L', '33R', '15C', '33C', '15R', '33L'];

export const RunwayTrafficMixChart: React.FC<RunwayTrafficMixChartProps> = ({
  runwayMixes,
}) => {
  // Total traffic across all runways = 100%
  const totalAllRunways = runwayMixes.reduce((acc, m) => acc + m.totalMovements, 0) || 1;

  // Calculate percentage of total airport traffic for each runway and category
  const chartData = ORDERED_RUNWAYS.map((rwy) => {
    const details = RUNWAY_DETAILS[rwy];
    const defaultHeading = parseInt(rwy.slice(0, 2), 10) * 10;
    const mix = runwayMixes.find((m) => m.runway === rwy) || {
      runway: rwy,
      headingDeg: defaultHeading,
      primaryRole: details?.role || 'Operations',
      totalMovements: 0,
      heavy: 0,
      medium: 0,
      light: 0,
      jet: 0,
      heavyPct: 0,
      mediumPct: 0,
      lightPct: 0,
      jetPct: 0,
    };

    const heavyShare = Number(((mix.heavy / totalAllRunways) * 100).toFixed(1));
    const mediumShare = Number(((mix.medium / totalAllRunways) * 100).toFixed(1));
    const lightShare = Number(((mix.light / totalAllRunways) * 100).toFixed(1));
    const jetShare = Number(((mix.jet / totalAllRunways) * 100).toFixed(1));
    const totalShare = Number(((mix.totalMovements / totalAllRunways) * 100).toFixed(1));

    return {
      runway: rwy,
      displayName: `RWY ${rwy}`,
      heading: `${mix.headingDeg || defaultHeading}°`,
      role: mix.primaryRole || details?.role || 'Operations',
      totalFlights: mix.totalMovements,
      totalShare,
      // Stacked values as % of ALL airport traffic across all runways
      H: heavyShare,
      J: jetShare,
      L: lightShare,
      M: mediumShare,
      counts: {
        H: mix.heavy,
        J: mix.jet,
        L: mix.light,
        M: mix.medium,
      },
    };
  });

  // Custom data label renderer for values inside stacked segments
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!value || value < 4 || height < 15 || width < 20) return null;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight="600"
        className="select-none pointer-events-none"
      >
        {value.toFixed(1)}%
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = chartData.find((d) => d.runway === label);
      if (!item) return null;

      return (
        <div className="bg-white text-slate-800 text-xs p-3 rounded-md shadow-lg border border-slate-200 min-w-[220px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
            <div>
              <span className="font-bold text-slate-900 text-sm">RWY {item.runway}</span>
              <span className="text-[11px] text-slate-500 ml-1.5">({item.role})</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-slate-900 font-bold text-xs">{item.totalShare}%</span>
              <span className="text-[10px] text-slate-500 block font-normal">({item.totalFlights} flights)</span>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { code: 'M', name: 'Medium', color: WAKE_COLORS.Medium, val: item.M, count: item.counts.M },
              { code: 'H', name: 'Heavy', color: WAKE_COLORS.Heavy, val: item.H, count: item.counts.H },
              { code: 'L', name: 'Light', color: WAKE_COLORS.Light, val: item.L, count: item.counts.L },
              { code: 'J', name: 'Jet', color: WAKE_COLORS.Jet, val: item.J, count: item.counts.J },
            ].map((cat) => {
              if (cat.val <= 0 && cat.count <= 0) return null;
              return (
                <div key={cat.code} className="flex items-center justify-between text-[11px] py-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-700 font-medium">{cat.name} ({cat.code})</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-900 text-right">
                    {cat.val.toFixed(1)}% <span className="text-slate-400 font-normal text-[10px]">({cat.count})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <PowerBiVisualWrapper
      id="visual-runway-mix-single-chart"
      title="Traffic Mix Distribution by Runway Direction"
      subtitle=""
      className="h-full"
    >
      <div className="flex-1 w-full min-h-[260px] flex flex-col justify-between pt-1">
        {/* Main Bar Chart */}
        <div className="w-full h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="runway"
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{
                  value: 'Runway Direction',
                  position: 'insideBottom',
                  offset: -6,
                  fill: '#64748b',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 40]}
                ticks={[0, 10, 20, 30, 40]}
                tickFormatter={(val) => `${val}%`}
                label={{
                  value: 'Proportion',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 12,
                  fill: '#64748b',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Stacked in matching order: H (bottom), J, L, M (top) */}
              <Bar
                dataKey="H"
                stackId="runwayStack"
                fill={WAKE_COLORS.Heavy}
                name="H"
                label={renderCustomLabel}
              />
              <Bar
                dataKey="J"
                stackId="runwayStack"
                fill={WAKE_COLORS.Jet}
                name="J"
                label={renderCustomLabel}
              />
              <Bar
                dataKey="L"
                stackId="runwayStack"
                fill={WAKE_COLORS.Light}
                name="L"
                label={renderCustomLabel}
              />
              <Bar
                dataKey="M"
                stackId="runwayStack"
                fill={WAKE_COLORS.Medium}
                name="M"
                label={renderCustomLabel}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend matching unified wake category format */}
        <div className="flex items-center justify-center gap-4 pt-2 pb-1 text-xs text-slate-700 select-none">
          <span className="text-slate-600 font-normal">Wake Category</span>
          {[
            { code: 'H', color: WAKE_COLORS.Heavy },
            { code: 'J', color: WAKE_COLORS.Jet },
            { code: 'L', color: WAKE_COLORS.Light },
            { code: 'M', color: WAKE_COLORS.Medium },
          ].map((item) => (
            <div key={item.code} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-slate-700 text-xs">{item.code}</span>
            </div>
          ))}
        </div>
      </div>
    </PowerBiVisualWrapper>
  );
};
