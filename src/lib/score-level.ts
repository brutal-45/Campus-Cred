import { LEVEL_THRESHOLDS, SCORE_BREAKDOWN } from './constants';

/** Pure score-to-level mapping shared by both client UI and server services. */
export function getLevelForScore(score: number): { level: string; icon: string } {
  const clampedScore = Math.min(Math.max(score, 0), SCORE_BREAKDOWN.MAX_SCORE);

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (clampedScore >= LEVEL_THRESHOLDS[i].minScore) {
      return { level: LEVEL_THRESHOLDS[i].level, icon: LEVEL_THRESHOLDS[i].icon };
    }
  }

  return { level: 'Starter', icon: '🌱' };
}
