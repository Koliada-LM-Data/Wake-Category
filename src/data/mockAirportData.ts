import { FlightMovement, WakeCategory, RunwayDirection, OperationType, WakeMatrixStandard } from '../types';

export const WAKE_COLORS: Record<WakeCategory, string> = {
  Heavy: '#0E4D64', // Deep Teal / Navy (H)
  Medium: '#3DB964', // Vibrant Emerald Green (M)
  Light: '#A82B82', // Vibrant Magenta / Orchid (L)
  Jet: '#17B8CC', // Bright Cyan / Turquoise (J)
};

export const RUNWAY_LIST: RunwayDirection[] = ['15L', '33R', '15C', '33C', '15R', '33L'];

export const RUNWAY_DETAILS: Record<RunwayDirection, { name: string; opposite: RunwayDirection; role: string; lengthM: number }> = {
  '15L': { name: 'Runway 15L', opposite: '33R', role: 'Primary Arrival / Long-Haul', lengthM: 3800 },
  '33R': { name: 'Runway 33R', opposite: '15L', role: 'North Flow Mixed / Departures', lengthM: 3800 },
  '15C': { name: 'Runway 15C', opposite: '33C', role: 'Center Mixed Mode', lengthM: 3500 },
  '33C': { name: 'Runway 33C', opposite: '15C', role: 'Center Mixed Operations', lengthM: 3500 },
  '15R': { name: 'Runway 15R', opposite: '33L', role: 'Dedicated Departures / Regional', lengthM: 3200 },
  '33L': { name: 'Runway 33L', opposite: '15R', role: 'North Flow Primary Arrival', lengthM: 3200 },
};

// ICAO / FAA wake vortex separation standards matrix (NM and approximate time in seconds on final approach ~140-160 kts)
export const WAKE_SEPARATION_STANDARDS: Record<string, { nm: number; sec: number; recatNM: number; severity: 'High' | 'Moderate' | 'Standard' | 'Minimum' }> = {
  'Heavy-Heavy': { nm: 4.0, sec: 105, recatNM: 3.5, severity: 'Standard' },
  'Heavy-Medium': { nm: 5.0, sec: 135, recatNM: 4.0, severity: 'High' },
  'Heavy-Light': { nm: 6.0, sec: 175, recatNM: 5.0, severity: 'High' },
  'Heavy-Jet': { nm: 5.0, sec: 135, recatNM: 4.0, severity: 'High' },
  
  'Medium-Heavy': { nm: 3.0, sec: 80, recatNM: 2.5, severity: 'Minimum' },
  'Medium-Medium': { nm: 3.0, sec: 80, recatNM: 2.5, severity: 'Minimum' },
  'Medium-Light': { nm: 5.0, sec: 135, recatNM: 4.0, severity: 'Moderate' },
  'Medium-Jet': { nm: 3.0, sec: 80, recatNM: 2.5, severity: 'Minimum' },

  'Light-Heavy': { nm: 3.0, sec: 80, recatNM: 2.5, severity: 'Minimum' },
  'Light-Medium': { nm: 3.0, sec: 80, recatNM: 2.5, severity: 'Minimum' },
  'Light-Light': { nm: 3.0, sec: 80, recatNM: 2.5, severity: 'Minimum' },
  'Light-Jet': { nm: 3.0, sec: 80, recatNM: 2.5, severity: 'Minimum' },

  'Jet-Heavy': { nm: 4.0, sec: 105, recatNM: 3.0, severity: 'Standard' },
  'Jet-Medium': { nm: 4.0, sec: 105, recatNM: 3.5, severity: 'Moderate' },
  'Jet-Light': { nm: 5.5, sec: 155, recatNM: 4.5, severity: 'High' },
  'Jet-Jet': { nm: 3.5, sec: 95, recatNM: 3.0, severity: 'Standard' },
};

const AIRCRAFT_MODELS: Record<WakeCategory, string[]> = {
  Heavy: ['B77W', 'A359', 'B789', 'A333', 'B748', 'A388', 'B763', 'MD11F'],
  Medium: ['A320', 'B738', 'A321', 'B739', 'A220', 'E195', 'CRJ9', 'A319'],
  Light: ['C172', 'BE20', 'PA28', 'PC12', 'DA42', 'C208', 'SR22', 'P68'],
  Jet: ['GLF6', 'CL60', 'C56X', 'E55P', 'FA7X', 'G280', 'LJ45', 'HA4T'],
};

const AIRLINES = ['BAW', 'DLH', 'AFR', 'KLM', 'UAE', 'QFA', 'UAL', 'AAL', 'DAL', 'SAS', 'THY', 'SIA'];

export interface MonthOption {
  id: string; // 'YYYY-MM'
  label: string; // 'Sep 2025'
  year: number;
  monthIndex: number; // 0-11
  quarter: string; // 'Q3 2025'
}

export const PAST_12_MONTHS: MonthOption[] = [
  { id: '2025-09', label: 'Sep 2025', year: 2025, monthIndex: 8, quarter: 'Q3 2025' },
  { id: '2025-10', label: 'Oct 2025', year: 2025, monthIndex: 9, quarter: 'Q4 2025' },
  { id: '2025-11', label: 'Nov 2025', year: 2025, monthIndex: 10, quarter: 'Q4 2025' },
  { id: '2025-12', label: 'Dec 2025', year: 2025, monthIndex: 11, quarter: 'Q4 2025' },
  { id: '2026-01', label: 'Jan 2026', year: 2026, monthIndex: 0, quarter: 'Q1 2026' },
  { id: '2026-02', label: 'Feb 2026', year: 2026, monthIndex: 1, quarter: 'Q1 2026' },
  { id: '2026-03', label: 'Mar 2026', year: 2026, monthIndex: 2, quarter: 'Q1 2026' },
  { id: '2026-04', label: 'Apr 2026', year: 2026, monthIndex: 3, quarter: 'Q2 2026' },
  { id: '2026-05', label: 'May 2026', year: 2026, monthIndex: 4, quarter: 'Q2 2026' },
  { id: '2026-06', label: 'Jun 2026', year: 2026, monthIndex: 5, quarter: 'Q2 2026' },
  { id: '2026-07', label: 'Jul 2026', year: 2026, monthIndex: 6, quarter: 'Q3 2026' },
  { id: '2026-08', label: 'Aug 2026', year: 2026, monthIndex: 7, quarter: 'Q3 2026' },
];

export const SAMPLE_DAYS: { date: string; label: string; tag: string }[] = [
  { date: '2026-08-27', label: 'Aug 27, 2026 (Today / Peak Summer)', tag: 'Peak Day' },
  { date: '2026-08-26', label: 'Aug 26, 2026 (Wednesday South Flow)', tag: 'Weekday' },
  { date: '2026-08-20', label: 'Aug 20, 2026 (Heavy Long-Haul Hub)', tag: 'Hub Wave' },
  { date: '2026-08-15', label: 'Aug 15, 2026 (Weekend Charter Peak)', tag: 'Weekend' },
  { date: '2026-07-28', label: 'Jul 28, 2026 (High Capacity Test)', tag: 'High Volume' },
  { date: '2026-07-15', label: 'Jul 15, 2026 (Midsummer Arrival Rush)', tag: 'Summer Bank' },
  { date: '2026-06-20', label: 'Jun 20, 2026 (Summer Solstice)', tag: 'Clear Weather' },
  { date: '2026-05-12', label: 'May 12, 2026 (Spring Mixed Operations)', tag: 'Mixed Flow' },
  { date: '2026-03-24', label: 'Mar 24, 2026 (Equinox Wind Shift)', tag: '33s Flow' },
  { date: '2026-01-18', label: 'Jan 18, 2026 (Winter North Flow 33s)', tag: 'Winter North' },
  { date: '2025-11-20', label: 'Nov 20, 2025 (Autumn High Density)', tag: 'Autumn Peak' },
  { date: '2025-09-15', label: 'Sep 15, 2025 (Annual Baseline)', tag: 'Baseline' },
];

// Deterministic Pseudo-random Generator to have stable, realistic multi-runway distribution
function createPseudoRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateFlightMovements(): FlightMovement[] {
  const rand = createPseudoRandom(42);
  const movements: FlightMovement[] = [];
  let seq = 1000;

  // We generate a dataset representing the 12-month period:
  // - Key daily profiles across months for deep day-level fidelity (Aug 27, Aug 26, Aug 20, Aug 15, Jul 28, Jul 15, etc.)
  // - Monthly representative flight blocks for every month from Sep 2025 to Aug 2026
  
  PAST_12_MONTHS.forEach((monthItem, mIdx) => {
    // Generate flights for representative sample days in this month
    const daysInThisMonth = [1, 5, 10, 15, 20, 25, 27].filter(d => monthItem.id !== '2026-08' || d <= 27);
    
    // Seasonal factor: summer months (Jun-Aug) have higher long-haul Heavy arrivals, winter (Dec-Feb) more North flow 33s
    const isWinter = monthItem.monthIndex >= 11 || monthItem.monthIndex <= 1;
    const isSummer = monthItem.monthIndex >= 5 && monthItem.monthIndex <= 7;

    daysInThisMonth.forEach((dayNum) => {
      const dateStr = `${monthItem.id}-${dayNum.toString().padStart(2, '0')}`;
      const isPrimaryDetailedDay = dateStr === '2026-08-27';

      // For each day, simulate 24 hourly buckets
      for (let hour = 0; hour < 24; hour++) {
        let hourlyIntensity = 25;
        if (hour >= 6 && hour <= 9) hourlyIntensity = 88;
        else if (hour >= 10 && hour <= 12) hourlyIntensity = 65;
        else if (hour >= 13 && hour <= 15) hourlyIntensity = 72;
        else if (hour >= 16 && hour <= 19) hourlyIntensity = 94;
        else if (hour >= 20 && hour <= 22) hourlyIntensity = 48;
        else hourlyIntensity = 16;

        // Density scaling: Full day for Aug 27 (1,450 movements), and compact sampled slices for other days
        const countThisHour = isPrimaryDetailedDay
          ? Math.floor(hourlyIntensity * (0.85 + rand() * 0.3))
          : Math.floor(hourlyIntensity * 0.35 * (0.8 + rand() * 0.4));

        const lastArrivalOnRunway: Partial<Record<RunwayDirection, WakeCategory>> = {};

        for (let i = 0; i < Math.max(1, countThisHour); i++) {
          seq++;
          const minute = Math.floor(rand() * 60);
          
          // Winter has 55% North flow; Summer has 80% South flow
          const southFlowProb = isWinter ? 0.45 : isSummer ? 0.82 : 0.68;
          const isSouthFlow = hour < 18 ? (rand() < southFlowProb) : (rand() < (southFlowProb - 0.3));

          // Select runway
          let runway: RunwayDirection;
          if (isSouthFlow) {
            const rRoll = rand();
            if (rRoll < 0.42) runway = '15L';
            else if (rRoll < 0.72) runway = '15C';
            else runway = '15R';
          } else {
            const rRoll = rand();
            if (rRoll < 0.42) runway = '33L';
            else if (rRoll < 0.72) runway = '33C';
            else runway = '33R';
          }

          // Operation
          let operation: OperationType = 'Arrival';
          if (runway === '15L' || runway === '33L') {
            operation = rand() < 0.82 ? 'Arrival' : 'Departure';
          } else if (runway === '15R' || runway === '33R') {
            operation = rand() < 0.85 ? 'Departure' : 'Arrival';
          } else {
            operation = rand() < 0.50 ? 'Arrival' : 'Departure';
          }

          // Wake Category mix
          let wake: WakeCategory = 'Medium';
          const wRoll = rand();
          if (operation === 'Arrival') {
            const heavyThreshold = isSummer ? 0.21 : 0.175;
            if (wRoll < heavyThreshold) wake = 'Heavy';
            else if (wRoll < 0.976) wake = 'Medium';
            else if (wRoll < 0.994) wake = 'Light';
            else wake = 'Jet';
          } else {
            if (wRoll < 0.22) wake = 'Heavy';
            else if (wRoll < 0.88) wake = 'Medium';
            else if (wRoll < 0.96) wake = 'Jet';
            else wake = 'Light';
          }

          const aircraftList = AIRCRAFT_MODELS[wake];
          const aircraftType = aircraftList[Math.floor(rand() * aircraftList.length)];
          const airline = AIRLINES[Math.floor(rand() * AIRLINES.length)];
          const flightNum = Math.floor(100 + rand() * 899);
          const callsign = `${airline}${flightNum}`;

          let leadingWake: WakeCategory | undefined = undefined;
          let sepNM = 3.0;
          let sepSec = 80;
          let impactBuffer = 0;

          if (operation === 'Arrival') {
            if (lastArrivalOnRunway[runway]) {
              leadingWake = lastArrivalOnRunway[runway];
              const standardKey = `${leadingWake}-${wake}`;
              const std = WAKE_SEPARATION_STANDARDS[standardKey] || { nm: 3.0, sec: 80 };
              sepNM = std.nm;
              sepSec = std.sec;
              impactBuffer = Math.max(0, std.sec - 80);
            } else {
              leadingWake = rand() < 0.28 ? 'Heavy' : (rand() < 0.75 ? 'Medium' : 'Jet');
              const standardKey = `${leadingWake}-${wake}`;
              const std = WAKE_SEPARATION_STANDARDS[standardKey] || { nm: 3.0, sec: 80 };
              sepNM = std.nm;
              sepSec = std.sec;
              impactBuffer = Math.max(0, std.sec - 80);
            }
            lastArrivalOnRunway[runway] = wake;
          }

          const isoTime = new Date(monthItem.year, monthItem.monthIndex, dayNum, hour, minute).toISOString();

          movements.push({
            id: `FL-${seq}`,
            callsign,
            aircraftType,
            wakeCategory: wake,
            runway,
            operation,
            timestamp: isoTime,
            date: dateStr,
            month: monthItem.id,
            hour,
            sequenceNumber: seq,
            leadingAircraftWake: leadingWake,
            separationDistanceNM: sepNM,
            separationTimeSec: sepSec,
            capacityImpactBufferSec: impactBuffer,
          });
        }
      }
    });
  });

  return movements;
}

export const INITIAL_MOVEMENTS = generateFlightMovements();
