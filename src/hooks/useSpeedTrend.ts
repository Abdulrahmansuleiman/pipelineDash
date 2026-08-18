// src/hooks/useSpeedTrend.ts — GET /api/speed-trend?timeframe= (follow-up speed chart)
import { api } from '../api/client';
import type { SpeedBucket, Timeframe } from '../types/events';
import { useFetch } from './useFetch';

export function useSpeedTrend(timeframe: Timeframe) {
  return useFetch<{ timeframe: string; buckets: SpeedBucket[] }>(
    (signal) => api.speedTrend(timeframe, signal),
    [timeframe],
  );
}
