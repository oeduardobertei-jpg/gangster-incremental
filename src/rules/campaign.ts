import type { RivalType } from '../types/game';
import type { CampaignMilestone, ReinforcementDoctrine, TerritoryCampaignProfile, WeightedRivalType } from '../data/territoryCampaigns';

export const pickWeightedRivalType = (
  composition: readonly WeightedRivalType[],
  random = Math.random()
): RivalType => {
  const total = composition.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  if (total <= 0) return 'soldado_pistola';
  let cursor = Math.max(0, Math.min(.999999, random)) * total;
  for (const entry of composition) {
    cursor -= Math.max(0, entry.weight);
    if (cursor < 0) return entry.type;
  }
  return composition[composition.length - 1]?.type ?? 'soldado_pistola';
};

export const getReinforcementBatchSize = (
  doctrine: ReinforcementDoctrine,
  severelyDepleted: boolean,
  dominated: boolean,
  availableSlots: number
): number => {
  const desired = dominated
    ? doctrine.dominatedBatch
    : severelyDepleted ? doctrine.depletedBatch : doctrine.normalBatch;
  return Math.max(0, Math.min(Math.max(0, availableSlots), Math.max(1, Math.floor(desired))));
};

export const getDoctrineInterval = (baseIntervalMs: number, doctrine: ReinforcementDoctrine): number =>
  Math.max(350, baseIntervalMs * Math.max(.55, doctrine.intervalMultiplier));

export const selectExternalEntryIndex = (
  doctrine: ReinforcementDoctrine,
  entryCount: number,
  cursor: number,
  random = Math.random()
): number => {
  const count = Math.max(1, Math.floor(entryCount));
  const step = Math.max(0, Math.floor(cursor));
  if (doctrine.entryPattern === 'cycle') return step % count;
  if (doctrine.entryPattern === 'flanks') {
    if (count < 3) return step % count;
    return step % 5 === 4 ? 2 : step % 2;
  }
  if (doctrine.entryPattern === 'command') {
    if (count < 3) return step % count;
    return [2, 0, 2, 1][step % 4];
  }
  return Math.min(count - 1, Math.floor(Math.max(0, Math.min(.999999, random)) * count));
};

export const getDoctrineComposition = (
  doctrine: ReinforcementDoctrine,
  progressRatio: number
): readonly WeightedRivalType[] => {
  const progress = Math.max(0, Math.min(1, progressRatio));
  return progress >= doctrine.escalationAt ? doctrine.lateComposition : doctrine.composition;
};

export const getPendingCampaignMilestones = (
  profile: TerritoryCampaignProfile,
  progressRatio: number,
  triggered: ReadonlySet<string>
): readonly CampaignMilestone[] => {
  const progress = Math.max(0, Math.min(1, progressRatio));
  return profile.milestones.filter(milestone => progress >= milestone.at && !triggered.has(milestone.id));
};
