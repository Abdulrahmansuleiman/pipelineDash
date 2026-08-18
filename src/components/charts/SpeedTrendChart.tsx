// src/components/charts/SpeedTrendChart.tsx — avg follow-up speed (hours) per day.
// Days with no paired follow-up render as gaps (null) — never as fabricated 0s.
import styled from 'styled-components';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { theme as globalTheme } from '../../theme';
import type { SpeedBucket } from '../../types/events';
import { formatDayKey } from '../../utils/format';
import { EmptyState } from '../EmptyState';

interface SpeedTrendChartProps {
  buckets: SpeedBucket[];
  variant?: 'dark' | 'light';
}

const ChartWrap = styled.div`
  width: 100%;
  height: 240px;
`;

function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} min`;
  return `${h}h`;
}

export function SpeedTrendChart({ buckets, variant = 'dark' }: SpeedTrendChartProps) {
  const hasData = buckets.some((b) => b.speedHours !== null);
  if (!hasData) {
    return (
      <EmptyState
        title="No follow-up speed data"
        message="Avg time from conversation to follow-up will appear here once leads have both a conversation and a follow-up webhook."
      />
    );
  }

  const isDark = variant === 'dark';
  const tickFill = isDark ? globalTheme.colors.onDarkMuted : globalTheme.colors.textMuted;
  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.09)' : globalTheme.colors.chartGrid;
  const cursorFill = isDark ? 'rgba(96, 165, 250, 0.12)' : 'rgba(96, 165, 250, 0.06)';

  const data = buckets.map((b) => ({ day: formatDayKey(b.date), hours: b.speedHours }));

  return (
    <ChartWrap>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11.5, fill: tickFill }}
            interval="preserveStartEnd"
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11.5, fill: tickFill }} />
          <Tooltip
            cursor={{ stroke: cursorFill }}
            formatter={(value) => {
              const v = value as number | null;
              return [v === null || Number.isNaN(v) ? 'No follow-ups' : formatHours(v), 'Avg follow-up time'];
            }}
            contentStyle={{
              background: '#0c2440',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              fontSize: 12.5,
            }}
            itemStyle={{ color: '#f2f7fc' }}
            labelStyle={{ color: '#9db3cc' }}
          />
          <Line
            type="monotone"
            dataKey="hours"
            connectNulls={false}
            stroke={globalTheme.colors.accent}
            strokeWidth={2.5}
            dot={{ r: 4, fill: globalTheme.colors.accent, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrap>
  );
}
