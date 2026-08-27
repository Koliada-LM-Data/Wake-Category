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
import { LeaderFollowerPairMetric, WakeCategory } from '../types';
import { PowerBiVisualWrapper } from './PowerBiVisualWrapper';

interface LeaderFollowerBarChartProps {
  pairMetrics: LeaderFollowerPairMetric[];
  groupedByLeader: Record<WakeCategory, LeaderFollowerPairMetric[]>;
  totalArrivalPairs: number;
  averageSeparationSec: number;
  highPenaltyPct: number;
}

// Colors exactly matching the reference image:
// H: Deep Teal Navy (#0E4D64)
// J: Bright Cyan (#17B8CC)
// L: Vibrant Magenta / Orchid (#A82B82)
// M: Bright Green (#3DB964)
const FOLLOWER_COLORS: Record<string, string> = {
  H: '#0E4D64',
  J: '#17B8CC',
  L: '#A82B82',
  M: '#3DB964',
};

const FOLLOWER_FULL_NAMES: Record<string, string> = {
  H: 'Heavy',
  J: 'Jet',
  L: 'Light',
  M: 'Medium',
};

export const LeaderFollowerBarChart: React.FC<LeaderFollowerBarChartProps> = ({
  groupedByLeader,
  totalArrivalPairs,
}) => {
  // Order of leader columns matching the image: M, H, L, J
  const leaderOrder: { key: WakeCategory; label: string }[] = [
    { key: 'Medium', label: 'M' },
    { key: 'Heavy', label: 'H' },
    { key: 'Light', label: 'L' },
    { key: 'Jet', label: 'J' },
  ];

  const chartData = leaderOrder.map(({ key, label }) => {
    const followers = groupedByLeader[key] || [];

    const getProportion = (followerCat: WakeCategory) => {
      const metric = followers.find((f) => f.followerCategory === followerCat);
      return metric ? metric.proportionOfAllArrivals : 0;
    };

    const getCount = (followerCat: WakeCategory) => {
      const metric = followers.find((f) => f.followerCategory === followerCat);
      return metric ? metric.count : 0;
    };

    return {
      leaderKey: key,
      leader: label,
      H: getProportion('Heavy'),
      J: getProportion('Jet'),
      L: getProportion('Light'),
      M: getProportion('Medium'),
      counts: {
        H: getCount('Heavy'),
        J: getCount('Jet'),
        L: getCount('Light'),
        M: getCount('Medium'),
      },
    };
  });

  // Custom data label renderer for values inside stacked segments
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!value || value < 8 || height < 16) return null;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="600"
        className="select-none pointer-events-none"
      >
        {value.toFixed(1)}%
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentItem = chartData.find((d) => d.leader === label);
      const leaderFullName =
        label === 'M'
          ? 'Medium'
          : label === 'H'
          ? 'Heavy'
          : label === 'L'
          ? 'Light'
          : 'Jet';

      return (
        <div className="bg-white text-slate-800 text-xs p-2.5 rounded-md shadow-lg border border-slate-200 min-w-[200px]">
          <div className="border-b border-slate-100 pb-1 mb-1.5 font-bold text-slate-900 flex items-center justify-between">
            <span>Leader: {leaderFullName} ({label})</span>
            <span className="text-[10px] text-slate-500 font-normal">All Arrivals Share</span>
          </div>

          <div className="space-y-1">
            {['M', 'L', 'J', 'H'].map((followerCode) => {
              const val = currentItem ? (currentItem as any)[followerCode] : 0;
              const count = currentItem?.counts ? (currentItem.counts as any)[followerCode] : 0;
              const color = FOLLOWER_COLORS[followerCode];
              const name = FOLLOWER_FULL_NAMES[followerCode];

              if (val <= 0 && count <= 0) return null;

              return (
                <div
                  key={followerCode}
                  className="flex items-center justify-between gap-2 text-[11px] py-0.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-slate-700">
                      Follower {name} ({followerCode})
                    </span>
                  </div>
                  <div className="text-right font-mono font-semibold text-slate-900">
                    {val.toFixed(1)}% <span className="text-slate-400 font-normal text-[10px]">({count})</span>
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
      id="visual-leader-follower-bars"
      title="Proportion of Arrival Wake Category Pairs"
      subtitle=""
      className="h-full"
    >
      <div className="flex-1 w-full min-h-[260px] flex flex-col justify-between pt-1">
        {/* Main Chart Canvas */}
        <div className="w-full h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="leader"
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{
                  value: 'Leader',
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
                domain={[0, 80]}
                ticks={[0, 20, 40, 60, 80]}
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

              {/* Stacked Bars in order from bottom to top: H, J, L, M */}
              <Bar
                dataKey="H"
                stackId="followerStack"
                fill={FOLLOWER_COLORS.H}
                name="H"
                label={renderCustomLabel}
              />
              <Bar
                dataKey="J"
                stackId="followerStack"
                fill={FOLLOWER_COLORS.J}
                name="J"
                label={renderCustomLabel}
              />
              <Bar
                dataKey="L"
                stackId="followerStack"
                fill={FOLLOWER_COLORS.L}
                name="L"
                label={renderCustomLabel}
              />
              <Bar
                dataKey="M"
                stackId="followerStack"
                fill={FOLLOWER_COLORS.M}
                name="M"
                label={renderCustomLabel}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend matching the exact style in the image */}
        <div className="flex items-center justify-center gap-4 pt-2 pb-1 text-xs text-slate-700 select-none">
          <span className="text-slate-600 font-normal">Follower</span>
          {['H', 'J', 'L', 'M'].map((code) => (
            <div key={code} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: FOLLOWER_COLORS[code] }}
              />
              <span className="font-medium text-slate-700 text-xs">{code}</span>
            </div>
          ))}
        </div>
      </div>
    </PowerBiVisualWrapper>
  );
};
