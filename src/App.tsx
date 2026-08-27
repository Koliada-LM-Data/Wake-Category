import React, { useState, useMemo } from 'react';
import { INITIAL_MOVEMENTS, PAST_12_MONTHS } from './data/mockAirportData';
import { TimeFilterState } from './types';
import {
  getWakeDistribution,
  getLeaderFollowerPairAnalysis,
  getRunwayTrafficMixSix,
  getRunwayHourlyTrafficSix,
  filterMovementsByTimeFilter,
} from './utils/wakeAnalytics';
import { ControlPanel } from './components/ControlPanel';
import { WakeDistributionPie } from './components/WakeDistributionPie';
import { LeaderFollowerBarChart } from './components/LeaderFollowerBarChart';
import { RunwayTrafficMixChart } from './components/RunwayTrafficMixChart';
import { RunwayHourlySixCharts } from './components/RunwayHourlySixCharts';

export default function App() {
  // Time filter state with 3 modes: 'last12months', 'selectMonths', 'selectDay'
  const [timeFilter, setTimeFilter] = useState<TimeFilterState>({
    mode: 'last12months',
    selectedMonths: PAST_12_MONTHS.map((m) => m.id),
    selectedDate: '2026-08-27',
  });

  // Filtered movements based on time filter
  const filteredMovements = useMemo(() => {
    return filterMovementsByTimeFilter(INITIAL_MOVEMENTS, timeFilter);
  }, [timeFilter]);

  // Visual 1: Wake Distribution (Pie Chart)
  const wakeDistribution = useMemo(() => {
    return getWakeDistribution(filteredMovements);
  }, [filteredMovements]);

  // Visual 2: Leader-Follower Pair Analysis (Bar Chart)
  const leaderFollowerAnalysis = useMemo(() => {
    return getLeaderFollowerPairAnalysis(filteredMovements);
  }, [filteredMovements]);

  // Visual 3: Traffic mix by runway direction (Bar chart for 15L, 33R, 15C, 33C, 15R, 33L)
  const runwayMixes = useMemo(() => {
    return getRunwayTrafficMixSix(filteredMovements);
  }, [filteredMovements]);

  // Visual 4: Traffic mix by runway direction by hour (6 bar charts: 15L, 33R, 15C, 33C, 15R, 33L)
  const runwayHourlyTraffic = useMemo(() => {
    return getRunwayHourlyTrafficSix(filteredMovements);
  }, [filteredMovements]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header & Control Panel with 3 filter buttons: Default view (last 12 months), Select Months, Select day */}
      <ControlPanel
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        totalFilteredCount={filteredMovements.length}
        totalDatasetCount={INITIAL_MOVEMENTS.length}
      />

      {/* Main Visuals Canvas */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        
        {/* Section 1: 3-Visual Single Row (Flight Distribution, Wake Pairs, Runway Mix) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch" aria-label="Wake Category, Arrival Pairs, and Runway Mix Analysis">
          {/* Visual 1: Flight Distribution by Wake Category */}
          <div className="flex flex-col">
            <WakeDistributionPie
              data={wakeDistribution}
              selectedCategory="All"
              onSelectCategory={() => {}}
              totalMovements={filteredMovements.length}
            />
          </div>

          {/* Visual 2: Proportion of Arrival Wake Category Pairs */}
          <div className="flex flex-col">
            <LeaderFollowerBarChart
              pairMetrics={leaderFollowerAnalysis.pairMetrics}
              groupedByLeader={leaderFollowerAnalysis.groupedByLeader}
              totalArrivalPairs={leaderFollowerAnalysis.totalArrivalPairs}
              averageSeparationSec={leaderFollowerAnalysis.averageRequiredSeparationSec}
              highPenaltyPct={leaderFollowerAnalysis.highPenaltyPairPercentage}
            />
          </div>

          {/* Visual 3: Traffic Mix Distribution by Runway Direction */}
          <div className="flex flex-col">
            <RunwayTrafficMixChart runwayMixes={runwayMixes} />
          </div>
        </section>

        {/* Section 2: Traffic Mix Distribution by Runway Direction by Hour (6 Bar Charts) */}
        <section aria-label="Hourly Traffic Mix by Runway Direction">
          <RunwayHourlySixCharts
            hourlyTraffic={runwayHourlyTraffic}
            selectedWakeCategory="All"
            selectedRunway="All"
            onSelectRunway={() => {}}
          />
        </section>

      </main>
    </div>
  );
}


