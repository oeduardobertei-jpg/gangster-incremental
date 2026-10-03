export interface IncrementalVisualSpec {
  id: string;
  max: number;
  group?: string;
}

export interface IncrementalStageState {
  score: number;
  stage: number;
  stageProgress: number;
  maturity: number;
  maxScore: number;
}

export const getIncrementalMaxScore = <T extends IncrementalVisualSpec>(specs: Record<string, T>): number =>
  Object.values(specs).reduce((sum, spec) => sum + Math.max(0, spec.max), 0);

export const sumIncrementalLevels = <T extends IncrementalVisualSpec>(
  levels: Record<string, number>,
  specs: Record<string, T>
): number => Object.values(specs).reduce((sum, spec) => sum + Math.max(0, levels[spec.id] || 0), 0);

export const getIncrementalStage = (score: number, thresholds: readonly number[]): number => {
  let stage = 0;
  for (let i = 1; i < thresholds.length; i++) if (score >= thresholds[i]) stage = i;
  return stage;
};
export const getIncrementalStageProgress = (
  score: number,
  stage: number,
  thresholds: readonly number[],
  maxScore: number
): number => {
  const start = thresholds[stage] ?? 0;
  const end = stage < thresholds.length - 1 ? thresholds[stage + 1] : maxScore;
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (score - start) / (end - start)));
};

export const getIncrementalStageState = (
  score: number,
  thresholds: readonly number[],
  maxScore: number
): IncrementalStageState => {
  const stage = getIncrementalStage(score, thresholds);
  const stageProgress = getIncrementalStageProgress(score, stage, thresholds, maxScore);
  return { score, stage, stageProgress, maturity: stage + stageProgress, maxScore };
};

export const allocateBalancedLevels = <T extends IncrementalVisualSpec>(
  targetScore: number,
  specs: Record<string, T>
): Record<string, number> => {
  const entries = Object.entries(specs);
  const levels: Record<string, number> = Object.fromEntries(entries.map(([key]) => [key, 0]));
  let remaining = Math.max(0, Math.min(targetScore, getIncrementalMaxScore(specs)));
  while (remaining > 0) {
    let progressed = false;
    for (const [key, spec] of entries) {
      if (remaining <= 0) break;
      if (levels[key] >= spec.max) continue;
      levels[key] += 1;
      remaining -= 1;
      progressed = true;
    }
    if (!progressed) break;
  }
  return levels;
};

export const getStageFeatureProgress = (
  stage: number,
  stageProgress: number,
  unlockStage: number,
  initialProgress = .30
): number => {
  if (stage < unlockStage) return 0;
  if (stage > unlockStage) return 1;
  const start = Math.min(1, Math.max(0, initialProgress));
  return Math.min(1, Math.max(0, start + (1 - start) * stageProgress));
};
