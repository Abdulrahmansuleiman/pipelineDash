// src/theme.ts — ALL colors/typography as tokens (one-line rebrand).
//
// Palette — "Pipeline", blue:
//   - accent   #2563eb  blue-600
//   - gradient #60a5fa -> #2563eb
//   - sidebar  #0a2540 -> #06182e  deep navy-ink gradient
//   - positive #16a34a  green (semantic up), negative #e86a5f  soft red
//   - page bg  #f2f6fb  blue-tinted off-white; dark KPI/donut/trend cards for the
//     premium contrast that matches the reference dashboard.
export const theme = {
  colors: {
    // page + surfaces
    bg: '#f2f6fb',
    surface: '#ffffff',
    border: '#e3eaf3',
    borderStrong: '#d2dcea',

    // sidebar
    sidebarGradient: 'linear-gradient(180deg, #0a2540 0%, #06182e 100%)',
    sidebarText: '#8fa7c4',
    sidebarTextActive: '#ffffff',
    sidebarActiveBg: 'rgba(96, 165, 250, 0.16)',
    sidebarActiveBar: '#60a5fa',

    // brand accent
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    accentSoft: 'rgba(37, 99, 235, 0.12)',
    accentGradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',

    // semantic
    positive: '#16a34a',
    negative: '#e86a5f',
    warning: '#f5a524',

    // ink (dark cards)
    ink: '#0c2440',
    inkElevated: '#123353',
    inkBorder: 'rgba(255, 255, 255, 0.08)',
    onDark: '#f2f7fc',
    onDarkMuted: '#9db3cc',

    // text on light
    textPrimary: '#101c2b',
    textSecondary: '#4f6279',
    textMuted: '#8495a9',

    // charts
    chartGrid: '#e9eff7',
    chartInk: '#dfe9f4',
    donutTrack: 'rgba(255, 255, 255, 0.08)',

    // KPI card dots (blue-led set)
    kpi: {
      bookings: '#60a5fa',
      conversionRate: '#38bdf8',
      humanTransfers: '#fbbf24',
      totalConversations: '#818cf8',
      followUps: '#c084fc',
      leadsQualified: '#22c55e',
    },

    // conversation channels (table dots — real channel brand identity)
    channels: {
      instagram: '#e1306c',
      website: '#7c5cff',
      shopify: '#7ab55c',
      email: '#4a8fe7',
      other: '#9aa0a6',
      Unknown: '#9aa0a6',
    },

    // donut slice scale (blue monochrome)
    donutScale: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#38bdf8', '#0284c7', '#1d4ed8'],
  },
  layout: {
    sidebarWidth: '220px',
    contentPaddingSides: '28px',
    contentPaddingVert: '16px',
  },
  radii: {
    card: '14px',
    button: '10px',
    pill: '999px',
  },
  shadows: {
    card: '0 1px 2px rgba(12, 36, 64, 0.05), 0 10px 28px rgba(12, 36, 64, 0.07)',
  },
  fonts: {
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
} as const;

export type Theme = typeof theme;
