export type WakeCategory = 'Heavy' | 'Medium' | 'Light' | 'Jet';

export type RunwayDirection = '15L' | '33R' | '15C' | '33C' | '15R' | '33L';

export type OperationType = 'Arrival' | 'Departure';

export type FlowDirection = 'All' | 'South (15s)' | 'North (33s)';

export type TimeFilterMode = 'last12months' | 'selectMonths' | 'selectDay';

export interface TimeFilterState {
  mode: TimeFilterMode;
  selectedMonths: string[]; // e.g. ['2026-08']
  selectedDate: string; // e.g. '2026-08-27'
}

export interface FlightMovement {
  id: string;
  callsign: string;
  aircraftType: string; // e.g., 'B77W', 'A320', 'C172', 'GLF6'
  wakeCategory: WakeCategory;
  runway: RunwayDirection;
  operation: OperationType;
  timestamp: string; // ISO string
  date: string; // 'YYYY-MM-DD'
  month: string; // 'YYYY-MM'
  hour: number; // 0-23
  sequenceNumber: number;
  leadingAircraftWake?: WakeCategory;
  separationDistanceNM?: number;
  separationTimeSec?: number;
  capacityImpactBufferSec?: number;
}

export interface WakeDistributionItem {
  name: WakeCategory;
  count: number;
  percentage: number;
  color: string;
  exampleTypes: string[];
  avgGrossWeightTonnes: number;
}

export interface LeaderFollowerPairMetric {
  leaderCategory: WakeCategory;
  followerCategory: WakeCategory;
  pairKey: string;
  count: number;
  proportionOfLeader: number; // % among all followers of this leader
  proportionOfAllArrivals: number; // % among all arrival pairs in dataset (e.g. 62.9%, 14.8%)
  requiredSeparationNM: number;
  requiredSeparationSec: number;
  capacityImpactIndex: number; // Scale 1-100 where higher means bigger separation penalty
}

export interface RunwayTrafficMix {
  runway: RunwayDirection;
  displayName: string;
  headingDeg: number;
  totalMovements: number;
  heavy: number;
  medium: number;
  light: number;
  jet: number;
  heavyPct: number;
  mediumPct: number;
  lightPct: number;
  jetPct: number;
  primaryRole: 'Arrivals' | 'Departures' | 'Mixed';
}

export interface RunwayHourlyDataPoint {
  hour: number;
  hourLabel: string;
  Heavy: number;
  Medium: number;
  Light: number;
  Jet: number;
  total: number;
}

export interface RunwayHourlyTraffic {
  runway: RunwayDirection;
  displayName: string;
  data: RunwayHourlyDataPoint[];
  peakHour: number;
  peakVolume: number;
}

export interface DashboardFilterState {
  flowDirection: FlowDirection;
  operationType: 'All' | 'Arrival' | 'Departure';
  selectedWakeCategory: WakeCategory | 'All';
  selectedRunway: RunwayDirection | 'All';
  timeWindow: 'All 24h' | 'Morning Peak (06-10)' | 'Midday (11-15)' | 'Evening Peak (16-20)' | 'Night (21-05)';
  searchQuery: string;
}

export interface WakeMatrixStandard {
  leader: WakeCategory;
  follower: WakeCategory;
  standardNM: number;
  standardSeconds: number;
  recatEuStandardNM: number;
  severity: 'High' | 'Moderate' | 'Standard' | 'Minimum';
}
