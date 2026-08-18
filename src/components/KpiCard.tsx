// src/components/KpiCard.tsx — dark KPI card: label, value, change badge,
// colored dot, optional subtitle (spec §3.3 / reference-image styling).
//
// Extended for Pipeline: value may be null (render '—' empty state, never 0),
// `format` customizes value text (e.g. "67%" / "4.5h"), `subtitle` adds a
// secondary line, `changeSuffix` relabels the change badge (pts for rates), and
// `lowerIsBetter` inverts the badge tone (faster follow-up speed = positive).
import styled from 'styled-components';
import type { Change } from '../types/changes';

interface KpiCardProps {
  label: string;
  value: number | null;
  change: Change;
  dotColor: string;
  format?: (value: number | null) => string;
  subtitle?: string;
  changeSuffix?: string;
  lowerIsBetter?: boolean;
}

const Card = styled.div`
  background: ${(p) => p.theme.colors.ink};
  border: 1px solid ${(p) => p.theme.colors.inkBorder};
  border-radius: ${(p) => p.theme.radii.card};
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: ${(p) => p.theme.shadows.card};
  min-width: 0;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  flex-shrink: 0;
  box-shadow: 0 0 0 3px ${(p) => p.theme.colors.inkElevated};
`;

const Label = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.onDarkMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Value = styled.div`
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${(p) => p.theme.colors.onDark};
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

const Subtitle = styled.div`
  font-size: 11.5px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.onDarkMuted};
  margin-top: -4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span<{ $tone: 'positive' | 'negative' | 'neutral' }>`
  align-self: flex-start;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: ${(p) => p.theme.radii.pill};
  font-variant-numeric: tabular-nums;
  background: ${(p) => {
    if (p.$tone === 'positive') return 'rgba(96, 165, 250, 0.18)';
    if (p.$tone === 'negative') return 'rgba(232, 106, 95, 0.16)';
    return 'rgba(255, 255, 255, 0.08)';
  }};
  color: ${(p) => {
    if (p.$tone === 'positive') return '#93c5fd';
    if (p.$tone === 'negative') return '#ff9185';
    return p.theme.colors.onDarkMuted;
  }};
`;

function badgeText(change: Change, suffix: string): string {
  if (change.label === 'new') return suffix === 'pts' ? 'new' : '+100% · new';
  if (change.label === 'up') return `+${change.pct}${suffix}`;
  if (change.label === 'down') return `${change.pct}${suffix}`;
  return `0${suffix}`;
}

function badgeTone(change: Change, lowerIsBetter: boolean): 'positive' | 'negative' | 'neutral' {
  if (change.label === 'neutral') return 'neutral';
  if (change.label === 'new') return lowerIsBetter ? 'neutral' : 'positive';
  const up = change.label === 'up';
  if (lowerIsBetter) return up ? 'negative' : 'positive';
  return up ? 'positive' : 'negative';
}

export function KpiCard({
  label,
  value,
  change,
  dotColor,
  format,
  subtitle,
  changeSuffix = '%',
  lowerIsBetter = false,
}: KpiCardProps) {
  const display = value === null ? '—' : format ? format(value) : value.toLocaleString();
  return (
    <Card>
      <LabelRow>
        <Dot $color={dotColor} aria-hidden="true" />
        <Label title={label}>{label}</Label>
      </LabelRow>
      <Value>{display}</Value>
      {subtitle ? <Subtitle title={subtitle}>{subtitle}</Subtitle> : null}
      <Badge $tone={badgeTone(change, lowerIsBetter)} title="Change vs previous period">
        {badgeText(change, changeSuffix)}
      </Badge>
    </Card>
  );
}