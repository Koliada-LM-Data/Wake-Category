import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { WakeDistributionItem, WakeCategory } from '../types';
import { PowerBiVisualWrapper } from './PowerBiVisualWrapper';

interface WakeDistributionPieProps {
  data: WakeDistributionItem[];
  selectedCategory: WakeCategory | 'All';
  onSelectCategory: (category: WakeCategory | 'All') => void;
  totalMovements: number;
}

export const WakeDistributionPie: React.FC<WakeDistributionPieProps> = ({
  data,
  selectedCategory,
  onSelectCategory,
  totalMovements,
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: WakeDistributionItem = payload[0].payload;
      return (
        <div className="bg-white text-slate-800 text-xs p-2.5 rounded-md shadow-lg border border-slate-200 min-w-[150px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1 mb-1">
            <span className="font-bold flex items-center gap-1.5" style={{ color: item.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-mono font-semibold text-slate-700">{item.percentage}%</span>
          </div>
          <div className="space-y-0.5 text-slate-600 text-[11px]">
            <div className="flex justify-between">
              <span>Flight Volume:</span>
              <strong className="text-slate-900 font-mono">{item.count.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <PowerBiVisualWrapper
      id="visual-wake-distribution-pie"
      title="Flight Distribution by Wake Category"
      subtitle=""
      className="h-full"
    >
      <div className="flex-1 w-full min-h-[260px] flex flex-col justify-between pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center flex-1">
          {/* Pie Chart Canvas */}
          <div className="sm:col-span-6 h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                  onClick={(entry) => {
                    const clickedName = entry.name as WakeCategory;
                    if (selectedCategory === clickedName) {
                      onSelectCategory('All');
                    } else {
                      onSelectCategory(clickedName);
                    }
                  }}
                  cursor="pointer"
                >
                  {data.map((entry) => {
                    const isSelected = selectedCategory === entry.name;
                    const isDimmed = selectedCategory !== 'All' && !isSelected;
                    return (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        opacity={isDimmed ? 0.3 : 1}
                        stroke={isSelected ? '#1e293b' : '#ffffff'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
              <span className="text-sm font-bold text-slate-800 font-mono">100%</span>
            </div>
          </div>

          {/* Breakdown Table / Legend */}
          <div className="sm:col-span-6 flex flex-col justify-center space-y-1.5 text-xs pr-1">
            {data.map((item) => {
              const isSelected = selectedCategory === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    if (selectedCategory === item.name) onSelectCategory('All');
                    else onSelectCategory(item.name);
                  }}
                  className={`w-full text-left p-1.5 px-2 rounded-md transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 border-slate-400 font-medium shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-xs text-slate-800 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="font-mono font-bold text-xs block leading-tight text-slate-900">
                      {item.percentage}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {item.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Legend Spacer/Aligner */}
        <div className="flex items-center justify-center gap-2 pt-2 pb-1 text-[11px] text-slate-500 select-none border-t border-slate-100 mt-1">
          <span>{totalMovements.toLocaleString()} total movements</span>
        </div>
      </div>
    </PowerBiVisualWrapper>
  );
};
