import {
  FlightMovement,
  WakeCategory,
  RunwayDirection,
  DashboardFilterState,
  TimeFilterState,
  WakeDistributionItem,
  LeaderFollowerPairMetric,
  RunwayTrafficMix,
  RunwayHourlyTraffic,
  RunwayHourlyDataPoint,
} from '../types';
import { WAKE_COLORS, RUNWAY_LIST, RUNWAY_DETAILS, WAKE_SEPARATION_STANDARDS } from '../data/mockAirportData';

export function filterMovementsByTimeFilter(
  movements: FlightMovement[],
  timeFilter: TimeFilterState
): FlightMovement[] {
  if (timeFilter.mode === 'last12months') {
    return movements;
  }

  if (timeFilter.mode === 'selectMonths') {
    if (!timeFilter.selectedMonths || timeFilter.selectedMonths.length === 0) {
      return movements;
    }
    const monthSet = new Set(timeFilter.selectedMonths);
    return movements.filter((m) => m.month && monthSet.has(m.month));
  }

  if (timeFilter.mode === 'selectDay') {
    if (!timeFilter.selectedDate) {
      return movements;
    }
    return movements.filter((m) => m.date === timeFilter.selectedDate);
  }

  return movements;
}

export function filterMovements(
  movements: FlightMovement[],
  filters: DashboardFilterState
): FlightMovement[] {
  return movements.filter((m) => {
    // Flow Direction
    if (filters.flowDirection === 'South (15s)') {
      if (!['15L', '15C', '15R'].includes(m.runway)) return false;
    } else if (filters.flowDirection === 'North (33s)') {
      if (!['33L', '33C', '33R'].includes(m.runway)) return false;
    }

    // Operation Type
    if (filters.operationType !== 'All') {
      if (m.operation !== filters.operationType) return false;
    }

    // Selected Wake Category
    if (filters.selectedWakeCategory !== 'All') {
      if (m.wakeCategory !== filters.selectedWakeCategory) return false;
    }

    // Selected Runway
    if (filters.selectedRunway !== 'All') {
      if (m.runway !== filters.selectedRunway) return false;
    }

    // Time window
    if (filters.timeWindow === 'Morning Peak (06-10)') {
      if (m.hour < 6 || m.hour > 10) return false;
    } else if (filters.timeWindow === 'Midday (11-15)') {
      if (m.hour < 11 || m.hour > 15) return false;
    } else if (filters.timeWindow === 'Evening Peak (16-20)') {
      if (m.hour < 16 || m.hour > 20) return false;
    } else if (filters.timeWindow === 'Night (21-05)') {
      if (m.hour >= 6 && m.hour <= 20) return false;
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        m.callsign.toLowerCase().includes(q) ||
        m.aircraftType.toLowerCase().includes(q) ||
        m.runway.toLowerCase().includes(q) ||
        m.wakeCategory.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

// 1. Distribution of flight by Wake Category: Heavy, Medium, Light, Jet (Pie Chart)
export function getWakeDistribution(movements: FlightMovement[]): WakeDistributionItem[] {
  const counts: Record<WakeCategory, number> = {
    Heavy: 0,
    Medium: 0,
    Light: 0,
    Jet: 0,
  };

  for (const m of movements) {
    counts[m.wakeCategory] = (counts[m.wakeCategory] || 0) + 1;
  }

  const total = movements.length || 1;
  const categories: WakeCategory[] = ['Heavy', 'Medium', 'Light', 'Jet'];

  const exampleMap: Record<WakeCategory, { examples: string[]; avgWeight: number }> = {
    Heavy: { examples: ['B77W', 'A359', 'B789', 'A388'], avgWeight: 265 },
    Medium: { examples: ['A320', 'B738', 'A321', 'E195'], avgWeight: 72 },
    Light: { examples: ['C172', 'BE20', 'PA28', 'PC12'], avgWeight: 3.5 },
    Jet: { examples: ['GLF6', 'CL60', 'FA7X', 'G280'], avgWeight: 38 },
  };

  return categories.map((cat) => ({
    name: cat,
    count: counts[cat],
    percentage: Number(((counts[cat] / total) * 100).toFixed(1)),
    color: WAKE_COLORS[cat],
    exampleTypes: exampleMap[cat].examples,
    avgGrossWeightTonnes: exampleMap[cat].avgWeight,
  }));
}

// 2. Proportion of arrival wake category pairs Leader – Follower per wake category (Bar Chart)
export function getLeaderFollowerPairAnalysis(
  movements: FlightMovement[]
): {
  pairMetrics: LeaderFollowerPairMetric[];
  groupedByLeader: Record<WakeCategory, LeaderFollowerPairMetric[]>;
  totalArrivalPairs: number;
  averageRequiredSeparationSec: number;
  highPenaltyPairPercentage: number;
} {
  // Only look at arrivals that have a leading aircraft
  const arrivalPairs = movements.filter((m) => m.operation === 'Arrival' && m.leadingAircraftWake);
  const pairCounts: Record<string, number> = {};
  const leaderTotals: Record<WakeCategory, number> = {
    Heavy: 0,
    Medium: 0,
    Light: 0,
    Jet: 0,
  };

  for (const m of arrivalPairs) {
    const leader = m.leadingAircraftWake!;
    const follower = m.wakeCategory;
    const key = `${leader} → ${follower}`;
    pairCounts[key] = (pairCounts[key] || 0) + 1;
    leaderTotals[leader] = (leaderTotals[leader] || 0) + 1;
  }

  const categories: WakeCategory[] = ['Heavy', 'Medium', 'Light', 'Jet'];
  const pairMetrics: LeaderFollowerPairMetric[] = [];
  const groupedByLeader: Record<WakeCategory, LeaderFollowerPairMetric[]> = {
    Heavy: [],
    Medium: [],
    Light: [],
    Jet: [],
  };

  let totalSepSecondsSum = 0;
  let highPenaltyCount = 0;

  const totalPairsCount = arrivalPairs.length || 1;

  for (const leader of categories) {
    const totalForLeader = leaderTotals[leader] || 0;

    for (const follower of categories) {
      const key = `${leader} → ${follower}`;
      const count = pairCounts[key] || 0;
      const proportionOfLeader = totalForLeader > 0 ? Number(((count / totalForLeader) * 100).toFixed(1)) : 0;
      const proportionOfAllArrivals = Number(((count / totalPairsCount) * 100).toFixed(1));
      const stdKey = `${leader}-${follower}`;
      const standard = WAKE_SEPARATION_STANDARDS[stdKey] || { nm: 3.0, sec: 80 };

      // Capacity Impact Index: 100 = 6NM, 0 = 3NM baseline
      const impactIndex = Math.round(((standard.nm - 3.0) / 3.0) * 100);

      const metric: LeaderFollowerPairMetric = {
        leaderCategory: leader,
        followerCategory: follower,
        pairKey: key,
        count,
        proportionOfLeader,
        proportionOfAllArrivals,
        requiredSeparationNM: standard.nm,
        requiredSeparationSec: standard.sec,
        capacityImpactIndex: impactIndex,
      };

      pairMetrics.push(metric);
      groupedByLeader[leader].push(metric);

      totalSepSecondsSum += count * standard.sec;
      if (standard.nm >= 5.0) {
        highPenaltyCount += count;
      }
    }
  }
  const avgSepSec = Number((totalSepSecondsSum / totalPairsCount).toFixed(1));
  const highPenaltyPct = Number(((highPenaltyCount / totalPairsCount) * 100).toFixed(1));

  return {
    pairMetrics,
    groupedByLeader,
    totalArrivalPairs: arrivalPairs.length,
    averageRequiredSeparationSec: avgSepSec,
    highPenaltyPairPercentage: highPenaltyPct,
  };
}

// 3. Traffic mix distribution by runway direction (6 bar charts: 15L, 33R, 15C, 33C, 15R, 33L)
export function getRunwayTrafficMixSix(movements: FlightMovement[]): RunwayTrafficMix[] {
  const mixMap: Record<RunwayDirection, { Heavy: number; Medium: number; Light: number; Jet: number; total: number; arrivals: number }> = {
    '15L': { Heavy: 0, Medium: 0, Light: 0, Jet: 0, total: 0, arrivals: 0 },
    '33R': { Heavy: 0, Medium: 0, Light: 0, Jet: 0, total: 0, arrivals: 0 },
    '15C': { Heavy: 0, Medium: 0, Light: 0, Jet: 0, total: 0, arrivals: 0 },
    '33C': { Heavy: 0, Medium: 0, Light: 0, Jet: 0, total: 0, arrivals: 0 },
    '15R': { Heavy: 0, Medium: 0, Light: 0, Jet: 0, total: 0, arrivals: 0 },
    '33L': { Heavy: 0, Medium: 0, Light: 0, Jet: 0, total: 0, arrivals: 0 },
  };

  for (const m of movements) {
    if (mixMap[m.runway]) {
      mixMap[m.runway][m.wakeCategory]++;
      mixMap[m.runway].total++;
      if (m.operation === 'Arrival') {
        mixMap[m.runway].arrivals++;
      }
    }
  }

  const headings: Record<RunwayDirection, number> = {
    '15L': 150,
    '33R': 330,
    '15C': 150,
    '33C': 330,
    '15R': 150,
    '33L': 330,
  };

  return RUNWAY_LIST.map((rwy) => {
    const data = mixMap[rwy];
    const total = data.total || 1;
    const arrPct = (data.arrivals / total) * 100;
    let role: 'Arrivals' | 'Departures' | 'Mixed' = 'Mixed';
    if (arrPct >= 65) role = 'Arrivals';
    else if (arrPct <= 35) role = 'Departures';

    return {
      runway: rwy,
      displayName: RUNWAY_DETAILS[rwy].name,
      headingDeg: headings[rwy],
      totalMovements: data.total,
      heavy: data.Heavy,
      medium: data.Medium,
      light: data.Light,
      jet: data.Jet,
      heavyPct: Number(((data.Heavy / total) * 100).toFixed(1)),
      mediumPct: Number(((data.Medium / total) * 100).toFixed(1)),
      lightPct: Number(((data.Light / total) * 100).toFixed(1)),
      jetPct: Number(((data.Jet / total) * 100).toFixed(1)),
      primaryRole: role,
    };
  });
}

// 4. Traffic mix distribution by runway direction by hour (6 bar charts: 15L, 33R, 15C, 33C, 15R, 33L)
export function getRunwayHourlyTrafficSix(movements: FlightMovement[]): RunwayHourlyTraffic[] {
  // Initialize 24-hour grid for each of the 6 runways
  const runwayData: Record<RunwayDirection, RunwayHourlyDataPoint[]> = {
    '15L': [],
    '33R': [],
    '15C': [],
    '33C': [],
    '15R': [],
    '33L': [],
  };

  for (const rwy of RUNWAY_LIST) {
    for (let h = 0; h < 24; h++) {
      const hStr = h.toString().padStart(2, '0') + ':00';
      runwayData[rwy].push({
        hour: h,
        hourLabel: hStr,
        Heavy: 0,
        Medium: 0,
        Light: 0,
        Jet: 0,
        total: 0,
      });
    }
  }

  // Populate data
  for (const m of movements) {
    if (runwayData[m.runway] && runwayData[m.runway][m.hour]) {
      runwayData[m.runway][m.hour][m.wakeCategory]++;
      runwayData[m.runway][m.hour].total++;
    }
  }

  return RUNWAY_LIST.map((rwy) => {
    const list = runwayData[rwy];
    let maxHour = 0;
    let maxVol = 0;
    for (const item of list) {
      if (item.total > maxVol) {
        maxVol = item.total;
        maxHour = item.hour;
      }
    }

    return {
      runway: rwy,
      displayName: RUNWAY_DETAILS[rwy].name,
      data: list,
      peakHour: maxHour,
      peakVolume: maxVol,
    };
  });
}

// Dashboard Top KPI Summaries
export interface DashboardKpis {
  totalMovements: number;
  arrivalCount: number;
  departureCount: number;
  heavySharePct: number;
  mediumSharePct: number;
  lightSharePct: number;
  jetSharePct: number;
  avgSeparationBufferSec: number;
  capacityImpactIndex: number;
  busiestRunway: RunwayDirection;
  busiestRunwayVolume: number;
  peakHourTotalMovements: number;
  peakHourLabel: string;
}

export function computeDashboardKpis(movements: FlightMovement[]): DashboardKpis {
  const total = movements.length || 1;
  let arrivals = 0;
  let departures = 0;
  const wakeCounts: Record<WakeCategory, number> = { Heavy: 0, Medium: 0, Light: 0, Jet: 0 };
  const runwayCounts: Record<RunwayDirection, number> = {
    '15L': 0,
    '33R': 0,
    '15C': 0,
    '33C': 0,
    '15R': 0,
    '33L': 0,
  };
  const hourlyCounts = new Array(24).fill(0);
  let totalSepSeconds = 0;
  let arrivalPairsCount = 0;

  for (const m of movements) {
    if (m.operation === 'Arrival') arrivals++;
    else departures++;

    wakeCounts[m.wakeCategory]++;
    runwayCounts[m.runway] = (runwayCounts[m.runway] || 0) + 1;
    hourlyCounts[m.hour]++;

    if (m.operation === 'Arrival' && m.separationTimeSec) {
      totalSepSeconds += m.separationTimeSec;
      arrivalPairsCount++;
    }
  }

  let busiestRwy: RunwayDirection = '15L';
  let maxRwyVol = 0;
  for (const rwy of RUNWAY_LIST) {
    if (runwayCounts[rwy] > maxRwyVol) {
      maxRwyVol = runwayCounts[rwy];
      busiestRwy = rwy;
    }
  }

  let peakHour = 0;
  let peakHourVol = 0;
  for (let h = 0; h < 24; h++) {
    if (hourlyCounts[h] > peakHourVol) {
      peakHourVol = hourlyCounts[h];
      peakHour = h;
    }
  }

  const avgSepSec = arrivalPairsCount > 0 ? Number((totalSepSeconds / arrivalPairsCount).toFixed(1)) : 80;
  // Baseline minimum radar spacing is 80 sec (~3NM). Capacity penalty index is % time lost to wake vortex constraints
  const capacityPenalty = Math.max(0, Math.round(((avgSepSec - 80) / 80) * 100));

  return {
    totalMovements: movements.length,
    arrivalCount: arrivals,
    departureCount: departures,
    heavySharePct: Number(((wakeCounts.Heavy / total) * 100).toFixed(1)),
    mediumSharePct: Number(((wakeCounts.Medium / total) * 100).toFixed(1)),
    lightSharePct: Number(((wakeCounts.Light / total) * 100).toFixed(1)),
    jetSharePct: Number(((wakeCounts.Jet / total) * 100).toFixed(1)),
    avgSeparationBufferSec: avgSepSec,
    capacityImpactIndex: capacityPenalty,
    busiestRunway: busiestRwy,
    busiestRunwayVolume: maxRwyVol,
    peakHourTotalMovements: peakHourVol,
    peakHourLabel: `${peakHour.toString().padStart(2, '0')}:00 - ${(peakHour + 1).toString().padStart(2, '0')}:00`,
  };
}
