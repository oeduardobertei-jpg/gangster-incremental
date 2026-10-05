import type { GameState } from '../types/game';
import { getVisualTier, getVisualTierMinLevel } from '../data/visualTokens';
import {
  getIncrementalMaxScore,
  getIncrementalStage,
  getIncrementalStageProgress,
  getIncrementalStageState,
  sumIncrementalLevels,
  type IncrementalVisualSpec
} from './incrementalBuildingVisuals';

export type SupportPointVisualStage = 0 | 1 | 2 | 3;
export type SupportPointVisualTier = 0 | 1 | 2 | 3 | 4 | 5;
export type SupportPointUpgradeVisualKey =
  | 'fortification'
  | 'barricades'
  | 'riflemen'
  | 'ammoLogistics'
  | 'medics';

export interface SupportPointUpgradeVisualSpec extends IncrementalVisualSpec {
  label: string;
}

/**
 * 1.1.1 vertical slice: Bocas & Esconderijos.
 *
 * Unlike Base de Comando, support points intentionally listen only to upgrades
 * that have a physical meaning at a safehouse/boca. This keeps world growth
 * semantic instead of making every structure mirror the full upgrade tree.
 */
export const SUPPORT_POINT_STAGE_THRESHOLDS = [0, 12, 40, 80] as const;

export const SUPPORT_POINT_UPGRADE_VISUAL_SPECS: Record<SupportPointUpgradeVisualKey, SupportPointUpgradeVisualSpec> = {
  fortification: {
    id: 'boca_fortified_bunkers',
    max: 40,
    label: 'Fortificação'
  },
  barricades: {
    id: 'boca_barricades',
    max: 20,
    label: 'Barricadas'
  },
  riflemen: {
    id: 'boca_fuzileiros_elite',
    max: 10,
    label: 'Fuzileiros'
  },
  ammoLogistics: {
    id: 'boca_auto_ammo_scavenge',
    max: 15,
    label: 'Logística de munição'
  },
  medics: {
    id: 'armory_medics_safehouse',
    max: 25,
    label: 'Médicos de plantão'
  }
};

export interface SupportPointVisualProfile {
  score: number;
  stage: SupportPointVisualStage;
  stageProgress: number;
  maturity: number;
  levels: Record<SupportPointUpgradeVisualKey, number>;
  tiers: Record<SupportPointUpgradeVisualKey, SupportPointVisualTier>;
}

export type SupportPointPreviewSelection =
  | { kind: 'stage'; stage: SupportPointVisualStage }
  | { kind: 'tier'; key: SupportPointUpgradeVisualKey; tier: SupportPointVisualTier }
  | { kind: 'max' };

export const SUPPORT_POINT_VISUAL_MAX_SCORE = getIncrementalMaxScore(SUPPORT_POINT_UPGRADE_VISUAL_SPECS);

export const getSupportPointVisualScore = (state: GameState): number =>
  sumIncrementalLevels(state.upgrades, SUPPORT_POINT_UPGRADE_VISUAL_SPECS);

export const getSupportPointVisualStage = (score: number): SupportPointVisualStage =>
  getIncrementalStage(score, SUPPORT_POINT_STAGE_THRESHOLDS) as SupportPointVisualStage;

export const getSupportPointStageProgress = (
  score: number,
  stage = getSupportPointVisualStage(score)
): number => getIncrementalStageProgress(
  score,
  stage,
  SUPPORT_POINT_STAGE_THRESHOLDS,
  SUPPORT_POINT_VISUAL_MAX_SCORE
);

const profileFromKeyLevels = (
  keyLevels: Partial<Record<SupportPointUpgradeVisualKey, number>>,
  stageOverride?: SupportPointVisualStage
): SupportPointVisualProfile => {
  const levels = {} as Record<SupportPointUpgradeVisualKey, number>;
  const tiers = {} as Record<SupportPointUpgradeVisualKey, SupportPointVisualTier>;
  let score = 0;

  (Object.keys(SUPPORT_POINT_UPGRADE_VISUAL_SPECS) as SupportPointUpgradeVisualKey[]).forEach(key => {
    const spec = SUPPORT_POINT_UPGRADE_VISUAL_SPECS[key];
    const level = Math.max(0, Math.min(spec.max, keyLevels[key] || 0));
    levels[key] = level;
    tiers[key] = getVisualTier(level, spec.max);
    score += level;
  });

  const stageState = getIncrementalStageState(
    score,
    SUPPORT_POINT_STAGE_THRESHOLDS,
    SUPPORT_POINT_VISUAL_MAX_SCORE
  );
  const stage = stageOverride ?? (stageState.stage as SupportPointVisualStage);
  const stageProgress = stageOverride === undefined
    ? stageState.stageProgress
    : stage === 3 ? .55 : .50;

  return {
    score,
    stage,
    stageProgress,
    maturity: stage + stageProgress,
    levels,
    tiers
  };
};

export const getSupportPointVisualProfile = (state: GameState): SupportPointVisualProfile => {
  const levels = {} as Partial<Record<SupportPointUpgradeVisualKey, number>>;
  (Object.keys(SUPPORT_POINT_UPGRADE_VISUAL_SPECS) as SupportPointUpgradeVisualKey[]).forEach(key => {
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
  if (selection.kind === 'stage') return profileFromKeyLevels({}, selection.stage);
  if (selection.kind === 'tier') {
    const spec = SUPPORT_POINT_UPGRADE_VISUAL_SPECS[selection.key];
    return profileFromKeyLevels({ [selection.key]: tierToLevel(selection.tier, spec.max) }, 2);
  }

  const levels = {} as Partial<Record<SupportPointUpgradeVisualKey, number>>;
  (Object.keys(SUPPORT_POINT_UPGRADE_VISUAL_SPECS) as SupportPointUpgradeVisualKey[]).forEach(key => {
    levels[key] = SUPPORT_POINT_UPGRADE_VISUAL_SPECS[key].max;
  });
  return profileFromKeyLevels(levels);
};

export const isSupportPointBuildingId = (buildingId: string): boolean =>
  buildingId === 'esconderijo' || buildingId === 'boca_leste';

export const describeSupportPointPreview = (selection: SupportPointPreviewSelection): string => {
  if (selection.kind === 'stage') return `Estágio ${selection.stage}`;
  if (selection.kind === 'tier') {
    return `${SUPPORT_POINT_UPGRADE_VISUAL_SPECS[selection.key].label} · T${selection.tier}`;
  }
  return 'Tudo máximo';
};
