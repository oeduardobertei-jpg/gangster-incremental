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
import {
  describeSupportPointPreview,
  getSupportPointPreviewProfile,
  type SupportPointPreviewSelection,
  type SupportPointVisualProfile
} from './supportPointVisualProgression';

export type BaseVisualStage = 0 | 1 | 2 | 3;
export type BaseUpgradeVisualKey =
  | 'vest' | 'heavyCalibers' | 'motorcycles' | 'medics'
  | 'fortification' | 'barricades' | 'riflemen' | 'ammoLogistics'
  | 'radioNetwork' | 'centralCommand'
  | 'autoRecruit' | 'doubleReinforcements';
export type BaseUpgradeGroup = 'armory' | 'boca' | 'intel' | 'sindicato';
export type BaseVisualTier = 0 | 1 | 2 | 3 | 4 | 5;

export interface BaseUpgradeVisualSpec extends IncrementalVisualSpec {
  label: string;
  group: BaseUpgradeGroup;
}

export const BASE_STAGE_THRESHOLDS = [0, 20, 70, 150] as const;
export const BASE_UPGRADE_VISUAL_SPECS: Record<BaseUpgradeVisualKey, BaseUpgradeVisualSpec> = {
  vest: { id: 'armory_bulletproof_vest', max: 50, group: 'armory', label: 'Coletes' },
  heavyCalibers: { id: 'armory_heavy_calibers', max: 50, group: 'armory', label: 'Calibres pesados' },
  motorcycles: { id: 'armory_motorcycle_squad', max: 30, group: 'armory', label: 'Bonde das motos' },
  medics: { id: 'armory_medics_safehouse', max: 25, group: 'armory', label: 'Médicos' },
  fortification: { id: 'boca_fortified_bunkers', max: 40, group: 'boca', label: 'Fortificação' },
  barricades: { id: 'boca_barricades', max: 20, group: 'boca', label: 'Barricadas' },
  riflemen: { id: 'boca_fuzileiros_elite', max: 10, group: 'boca', label: 'Fuzileiros' },
  ammoLogistics: { id: 'boca_auto_ammo_scavenge', max: 15, group: 'boca', label: 'Logística de munição' },
  radioNetwork: { id: 'intel_radio_network', max: 50, group: 'intel', label: 'Rede de rádio' },
  centralCommand: { id: 'intel_central_command', max: 40, group: 'intel', label: 'Central de comando' },
  autoRecruit: { id: 'sindicato_auto_recruit', max: 10, group: 'sindicato', label: 'Auto-recrutamento' },
  doubleReinforcements: { id: 'sindicato_double_reinforcements', max: 10, group: 'sindicato', label: 'Reforços em dobro' }
};

export interface BaseCommandVisualProfile {
  score: number;
  stage: BaseVisualStage;
  levels: Record<BaseUpgradeVisualKey, number>;
  tiers: Record<BaseUpgradeVisualKey, BaseVisualTier>;
  hegemonyHonors: number;
  stageProgress: number;
  maturity: number;
  supportPointOverride?: SupportPointVisualProfile;
}

export type BaseCommandPreviewSelection =
  | { kind: 'stage'; stage: BaseVisualStage }
  | { kind: 'branch'; group: BaseUpgradeGroup }
  | { kind: 'tier'; key: BaseUpgradeVisualKey; tier: BaseVisualTier }
  | { kind: 'max' }
  | { kind: 'honors'; count: number }
  | SupportPointPreviewSelection;

export const BASE_VISUAL_MAX_SCORE = getIncrementalMaxScore(BASE_UPGRADE_VISUAL_SPECS);
export const getBaseVisualScore = (state: GameState): number =>
  sumIncrementalLevels(state.upgrades, BASE_UPGRADE_VISUAL_SPECS);
export const getBaseVisualStage = (score: number): BaseVisualStage =>
  getIncrementalStage(score, BASE_STAGE_THRESHOLDS) as BaseVisualStage;
export const getBaseStageProgress = (score: number, stage = getBaseVisualStage(score)): number =>
  getIncrementalStageProgress(score, stage, BASE_STAGE_THRESHOLDS, BASE_VISUAL_MAX_SCORE);
const profileFromKeyLevels = (
  keyLevels: Partial<Record<BaseUpgradeVisualKey, number>>,
  hegemonyHonors = 0,
  stageOverride?: BaseVisualStage
): BaseCommandVisualProfile => {
  const levels = {} as Record<BaseUpgradeVisualKey, number>;
  const tiers = {} as Record<BaseUpgradeVisualKey, BaseVisualTier>;
  let score = 0;
  (Object.keys(BASE_UPGRADE_VISUAL_SPECS) as BaseUpgradeVisualKey[]).forEach(key => {
    const spec = BASE_UPGRADE_VISUAL_SPECS[key];
    const level = Math.max(0, Math.min(spec.max, keyLevels[key] || 0));
    levels[key] = level;
    tiers[key] = getVisualTier(level, spec.max);
    score += level;
  });
  const stageState = getIncrementalStageState(score, BASE_STAGE_THRESHOLDS, BASE_VISUAL_MAX_SCORE);
  const stage = stageOverride ?? (stageState.stage as BaseVisualStage);
  const stageProgress = stageOverride === undefined
    ? stageState.stageProgress
    : stage === 3 ? .55 : .50;
  return {
    score,
    stage,
    levels,
    tiers,
    stageProgress,
    maturity: stage + stageProgress,
    hegemonyHonors: Math.max(0, Math.floor(hegemonyHonors))
  };
};

export const getBaseCommandVisualProfile = (state: GameState): BaseCommandVisualProfile => {
  const levels = {} as Partial<Record<BaseUpgradeVisualKey, number>>;
  (Object.keys(BASE_UPGRADE_VISUAL_SPECS) as BaseUpgradeVisualKey[]).forEach(key => {
    const spec = BASE_UPGRADE_VISUAL_SPECS[key];
    levels[key] = Math.max(0, state.upgrades[spec.id] || 0);
  });
  return profileFromKeyLevels(levels, state.stats.hegemonyRituals || 0);
};
const tierToLevel = (tier: BaseVisualTier, max: number): number =>
  getVisualTierMinLevel(tier, max);

export const getBaseCommandPreviewProfile = (
  selection: BaseCommandPreviewSelection
): BaseCommandVisualProfile => {
  if (selection.kind === 'support-stage' || selection.kind === 'support-tier' || selection.kind === 'support-max') {
    return {
      ...profileFromKeyLevels({}, 0, 0),
      supportPointOverride: getSupportPointPreviewProfile(selection)
    };
  }
  if (selection.kind === 'stage') {
    return profileFromKeyLevels({}, 0, selection.stage);
  }
  if (selection.kind === 'branch') {
    const levels = {} as Partial<Record<BaseUpgradeVisualKey, number>>;
    (Object.keys(BASE_UPGRADE_VISUAL_SPECS) as BaseUpgradeVisualKey[]).forEach(key => {
      const spec = BASE_UPGRADE_VISUAL_SPECS[key];
      levels[key] = spec.group === selection.group ? spec.max : 0;
    });
    return profileFromKeyLevels(levels, 0, 2);
  }
  if (selection.kind === 'tier') {
    const spec = BASE_UPGRADE_VISUAL_SPECS[selection.key];
    return profileFromKeyLevels(
      { [selection.key]: tierToLevel(selection.tier, spec.max) },
      0,
      2
    );
  }
  if (selection.kind === 'honors') {
    return profileFromKeyLevels({}, selection.count, 0);
  }
  const levels = {} as Partial<Record<BaseUpgradeVisualKey, number>>;
  (Object.keys(BASE_UPGRADE_VISUAL_SPECS) as BaseUpgradeVisualKey[]).forEach(key => {
    levels[key] = BASE_UPGRADE_VISUAL_SPECS[key].max;
  });
  return profileFromKeyLevels(levels, 5);
};

export const BASE_UPGRADE_GROUP_LABELS: Record<BaseUpgradeGroup, string> = {
  armory: 'Arsenal',
  boca: 'Bocas & Apoio',
  intel: 'Rádios & Intel',
  sindicato: 'Sindicato'
};

export const describeBaseCommandPreview = (selection: BaseCommandPreviewSelection): string => {
  if (selection.kind === 'support-stage' || selection.kind === 'support-tier' || selection.kind === 'support-max') return describeSupportPointPreview(selection);
  if (selection.kind === 'stage') return `Estágio ${selection.stage}`;
  if (selection.kind === 'branch') return BASE_UPGRADE_GROUP_LABELS[selection.group];
  if (selection.kind === 'tier') return `${BASE_UPGRADE_VISUAL_SPECS[selection.key].label} · T${selection.tier}`;
  if (selection.kind === 'honors') return `${selection.count} Hegemonias`;
  return 'Tudo máximo';
};
