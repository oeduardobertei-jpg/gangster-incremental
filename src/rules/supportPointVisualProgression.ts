import type { GameState } from '../types/game';
import { getVisualTier, getVisualTierMinLevel } from '../data/visualTokens';
import {
  getIncrementalMaxScore,
  getIncrementalStageState,
  sumIncrementalLevels,
  type IncrementalVisualSpec
} from './incrementalBuildingVisuals';

export type SupportPointVisualStage = 0 | 1 | 2 | 3;
export type SupportPointVisualKey = 'fortification' | 'barricades' | 'riflemen' | 'ammoLogistics';
export type SupportPointVisualTier = 0 | 1 | 2 | 3 | 4 | 5;

export interface SupportPointUpgradeVisualSpec extends IncrementalVisualSpec {
  label: string;
}

export const SUPPORT_POINT_STAGE_THRESHOLDS = [0, 10, 30, 60] as const;
export const SUPPORT_POINT_UPGRADE_VISUAL_SPECS: Record<SupportPointVisualKey, SupportPointUpgradeVisualSpec> = {
  fortification: { id: 'boca_fortified_bunkers', max: 40, label: 'Fortificação' },
  barricades: { id: 'boca_barricades', max: 20, label: 'Barricadas' },
  riflemen: { id: 'boca_fuzileiros_elite', max: 10, label: 'Fuzileiros' },
  ammoLogistics: { id: 'boca_auto_ammo_scavenge', max: 15, label: 'Logística de munição' }
};

export interface SupportPointVisualProfile {
  score: number;
  stage: SupportPointVisualStage;
  levels: Record<SupportPointVisualKey, number>;
  tiers: Record<SupportPointVisualKey, SupportPointVisualTier>;
  stageProgress: number;
  maturity: number;
}

export type SupportPointPreviewSelection =
  | { kind: 'support-stage'; stage: SupportPointVisualStage }
  | { kind: 'support-tier'; key: SupportPointVisualKey; tier: SupportPointVisualTier }
  | { kind: 'support-max' };

export const SUPPORT_POINT_VISUAL_MAX_SCORE = getIncrementalMaxScore(SUPPORT_POINT_UPGRADE_VISUAL_SPECS);

const profileFromKeyLevels = (
  keyLevels: Partial<Record<SupportPointVisualKey, number>>,
  stageOverride?: SupportPointVisualStage
): SupportPointVisualProfile => {
  const levels = {} as Record<SupportPointVisualKey, number>;
  const tiers = {} as Record<SupportPointVisualKey, SupportPointVisualTier>;
  let score = 0;

  (Object.keys(SUPPORT_POINT_UPGRADE_VISUAL_SPECS) as SupportPointVisualKey[]).forEach(key => {
    const spec = SUPPORT_POINT_UPGRADE_VISUAL_SPECS[key];
    const level = Math.max(0, Math.min(spec.max, keyLevels[key] || 0));
    levels[key] = level;
    tiers[key] = getVisualTier(level, spec.max);
    score += level;
  });

  const stageState = getIncrementalStageState(score, SUPPORT_POINT_STAGE_THRESHOLDS, SUPPORT_POINT_VISUAL_MAX_SCORE);
  const stage = stageOverride ?? (stageState.stage as SupportPointVisualStage);
  const stageProgress = stageOverride === undefined
    ? stageState.stageProgress
    : stage === 3 ? .55 : .5;

  return { score, stage, levels, tiers, stageProgress, maturity: stage + stageProgress };
};

export const getSupportPointVisualProfile = (state: GameState): SupportPointVisualProfile => {
  const levels = {} as Partial<Record<SupportPointVisualKey, number>>;
  (Object.keys(SUPPORT_POINT_UPGRADE_VISUAL_SPECS) as SupportPointVisualKey[]).forEach(key => {
    const spec = SUPPORT_POINT_UPGRADE_VISUAL_SPECS[key];
    levels[key] = Math.max(0, state.upgrades[spec.id] || 0);
  });
  return profileFromKeyLevels(levels);
};

const tierToLevel = (tier: SupportPointVisualTier, max: number): number =>
  getVisualTierMinLevel(tier, max);

export const getSupportPointPreviewProfile = (
  selection: SupportPointPreviewSelection
): SupportPointVisualProfile => {
  if (selection.kind === 'support-stage') return profileFromKeyLevels({}, selection.stage);
  if (selection.kind === 'support-tier') {
    const spec = SUPPORT_POINT_UPGRADE_VISUAL_SPECS[selection.key];
    return profileFromKeyLevels({ [selection.key]: tierToLevel(selection.tier, spec.max) }, 2);
  }
  const levels = {} as Partial<Record<SupportPointVisualKey, number>>;
  (Object.keys(SUPPORT_POINT_UPGRADE_VISUAL_SPECS) as SupportPointVisualKey[]).forEach(key => {
    levels[key] = SUPPORT_POINT_UPGRADE_VISUAL_SPECS[key].max;
  });
  return profileFromKeyLevels(levels);
};

export const describeSupportPointPreview = (selection: SupportPointPreviewSelection): string => {
  if (selection.kind === 'support-stage') return `Ponto de Apoio · Estágio ${selection.stage}`;
  if (selection.kind === 'support-tier') return `Ponto de Apoio · ${SUPPORT_POINT_UPGRADE_VISUAL_SPECS[selection.key].label} · T${selection.tier}`;
  return 'Ponto de Apoio · Tudo máximo';
};
