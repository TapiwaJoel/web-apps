/** Direction + magnitude of a period-over-period change. */
export interface Delta {
  /** Signed percentage, e.g. 8.2 or -3.1. */
  pct: number;
  /** Optional absolute change, e.g. +947. */
  abs?: number;
}

/** The signature hero metric. */
export interface KpiSummary {
  label: string;
  value: number;
  delta: Delta;
  previous: number;
  period: string;
}

/** A small stat tile with an inline sparkline. */
export interface StatMetric {
  label: string;
  value: number;
  /** Optional unit/suffix, e.g. '%'. */
  suffix?: string;
  delta: Delta;
  series: number[];
}

/** A named series for the bar chart tab switcher. */
export interface TimeSeries {
  key: string;
  label: string;
  points: number[];
  categories: string[];
}

/** A ranked subject row with a percentage share. */
export interface SubjectRank {
  label: string;
  value: number;
  pct: number;
  /** Categorical accent colour (hex) for the row's dot + bar. */
  color: string;
}

/**
 * Categorical accent palette for distinguishing subjects/series.
 * Validated CVD-safe (dataviz validate_palette.js, light mode): violet, teal,
 * amber, blue, rose. Assigned to entities in fixed order, never cycled.
 * (Dark mode would need a lighter amber ~#e8b45a — app runs light theme only.)
 */
export const CATEGORICAL_COLORS: readonly string[] = [
  '#6d5dd3', // violet
  '#0f9b8e', // teal
  '#c98a2b', // amber
  '#3b82f6', // blue
  '#d94f8a', // rose
];

/**
 * Purple-scale steps (umdzidzisi-300..600) for stepping the activity bars so
 * they read as a real gradient rather than one faded hue.
 */
export const BAR_SCALE: readonly string[] = [
  '#9891b4', // umdzidzisi-300
  '#756d9e', // umdzidzisi-400
  '#544a88', // umdzidzisi-500
  '#3a3166', // umdzidzisi-600
];

/** A row in the examination-boards leaderboard. */
export interface BoardRow {
  board: string;
  level: string;
  candidates: number;
  passRate: number;
  delta: Delta;
}

export interface DashboardData {
  hero: KpiSummary;
  stats: StatMetric[];
  activity: TimeSeries[];
  subjects: SubjectRank[];
  boards: BoardRow[];
}

/**
 * Hardcoded placeholder data. Structured so a future service swap replaces
 * this const with an injected data source without touching components.
 */
export const DASHBOARD_DATA: DashboardData = {
  hero: {
    label: 'Active learners',
    value: 12480,
    delta: { pct: 8.2, abs: 947 },
    previous: 11533,
    period: 'This term',
  },
  stats: [
    {
      label: 'Exams in progress',
      value: 38,
      delta: { pct: 0 },
      series: [22, 26, 24, 30, 28, 34, 38],
    },
    {
      label: 'Active subscriptions',
      value: 2914,
      delta: { pct: 4.6 },
      series: [2600, 2650, 2710, 2760, 2800, 2870, 2914],
    },
    {
      label: 'Pass rate',
      value: 74,
      suffix: '%',
      delta: { pct: 2.1 },
      series: [69, 70, 71, 70, 72, 73, 74],
    },
  ],
  activity: [
    {
      key: 'enrollments',
      label: 'Enrollments',
      points: [420, 510, 480, 640, 720, 690, 810, 940],
      categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    },
    {
      key: 'exams',
      label: 'Exams',
      points: [18, 24, 22, 30, 28, 34, 33, 38],
      categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    },
    {
      key: 'passes',
      label: 'Passes',
      points: [300, 360, 340, 470, 540, 500, 610, 700],
      categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    },
  ],
  subjects: [
    { label: 'Mathematics', value: 1842, pct: 38, color: '#6d5dd3' },
    { label: 'English', value: 1357, pct: 27, color: '#0f9b8e' },
    { label: 'Sciences', value: 918, pct: 19, color: '#c98a2b' },
    { label: 'History', value: 412, pct: 9, color: '#3b82f6' },
    { label: 'Geography', value: 331, pct: 7, color: '#d94f8a' },
  ],
  boards: [
    {
      board: 'Cambridge IGCSE',
      level: 'O-Level',
      candidates: 4210,
      passRate: 76,
      delta: { pct: 3.4 },
    },
    {
      board: 'ZIMSEC',
      level: 'A-Level',
      candidates: 3880,
      passRate: 71,
      delta: { pct: 1.9 },
    },
    {
      board: 'Edexcel',
      level: 'O-Level',
      candidates: 2140,
      passRate: 69,
      delta: { pct: -1.2 },
    },
    {
      board: 'Cambridge International AS',
      level: 'A-Level',
      candidates: 1670,
      passRate: 73,
      delta: { pct: 2.5 },
    },
  ],
};
