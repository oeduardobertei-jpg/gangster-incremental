import { AllyEntity, AllyType, GameState, UpgradeItem } from '../types/game';
import { getIntelTalentMaxBonus, getIntelTalentRegenMultiplier, getVeteranTalentMultiplier } from './hegemonyTalents';

export interface DerivedStats {
  maxIntel: number;
  intelRegen: number;
  maxAllies: number;
}

export interface AllyCoreStats {
  maxHp: number;
  damage: number;
  speed: number;
  motorcycleChance: number;
}

export interface UpgradeEffectRow {
  label: string;
  current: string;
  next: string;
}

export const getUpgradeCost = (item: UpgradeItem, currentLevel: number): number =>
  Math.floor(item.baseCost * Math.pow(item.costMultiplier, currentLevel));

export const getBarricadeDamageReduction = (level: number): number =>
  Math.min(0.6, Math.max(0, level) * 0.03);

export const getMedicRegenPerSecond = (level: number): number =>
  Math.max(0, level) * 1.5;

export const getAutoAmmoIntervalSeconds = (level: number): number | null => {
  if (level <= 0) return null;
  return Math.max(2.5, 5 - (level - 1) * 0.18);
};

export const getAutoAmmoYield = (level: number): number =>
  level <= 0 ? 0 : Math.min(16, Math.max(1, Math.floor(level)) + 1);

export const getAutoAmmoPerMinute = (level: number): number => {
  const intervalSeconds = getAutoAmmoIntervalSeconds(level);
  if (intervalSeconds === null) return 0;
  return getAutoAmmoYield(level) * (60 / intervalSeconds);
};

export const getAutoRecruitIntervalSeconds = (level: number): number | null => {
  if (level <= 0) return null;
  return Math.max(1.2, (11 - level) * 0.75);
};

export const getFuzileiroChance = (level: number): number =>
  Math.min(0.5, Math.max(0, level) * 0.05);

export const getDoubleRecruitChance = (level: number): number =>
  Math.min(0.8, Math.max(0, level) * 0.08);

export const getMotorcycleChance = (level: number): number => {
  if (level <= 0) return 0;
  const normalizedLevel = Math.min(30, Math.max(1, level));
  return 0.04 + (normalizedLevel - 1) * (0.14 / 29);
};

export const getBaseRecruitHp = (level: number): number => 55 + Math.max(0, level) * 12;
export const getBaseRecruitDamage = (level: number): number => 14 + Math.max(0, level) * 2.8;
export const getBaseRecruitSpeed = (_level = 0): number => 1.2;

export const computeDerivedStats = (state: GameState): DerivedStats => {
  const centralCommandLvl = state.upgrades['intel_central_command'] || 0;
  const radioNetworkLvl = state.upgrades['intel_radio_network'] || 0;
  const bunkerLvl = state.upgrades['boca_fortified_bunkers'] || 0;
  const primordialIntel = state.talents['talent_intel_network'] || 0;
  return {
    maxIntel: 100 + centralCommandLvl * 20 + getIntelTalentMaxBonus(primordialIntel),
    intelRegen: (2 + radioNetworkLvl * 0.8) * getIntelTalentRegenMultiplier(primordialIntel),
    maxAllies: 15 + bunkerLvl * 3
  };
};

export const getAllyCoreStats = (state: GameState): AllyCoreStats => {
  const hpLvl = state.upgrades['armory_bulletproof_vest'] || 0;
  const dmgLvl = state.upgrades['armory_heavy_calibers'] || 0;
  const spdLvl = state.upgrades['armory_motorcycle_squad'] || 0;
  const veteranLvl = state.talents['talent_veteran_enforcers'] || 0;
  const veteranMult = getVeteranTalentMultiplier(veteranLvl);
  return {
    maxHp: getBaseRecruitHp(hpLvl) * veteranMult,
    damage: getBaseRecruitDamage(dmgLvl) * veteranMult,
    speed: getBaseRecruitSpeed(spdLvl),
    motorcycleChance: getMotorcycleChance(spdLvl)
  };
};

export interface AllyLiveStats {
  maxHp: number;
  damage: number;
  speed: number;
}

const getAllyTypeMultipliers = (type: AllyType): AllyLiveStats => {
  switch (type) {
    case 'soldado_fuzil': return { maxHp: 1, damage: 1.35, speed: 0.9 };
    case 'batedor_moto': return { maxHp: 1, damage: 1.15, speed: 2 };
    default: return { maxHp: 1, damage: 1, speed: 1 };
  }
};

export const getAllyLiveStats = (state: GameState, type: AllyType): AllyLiveStats => {
  const core = getAllyCoreStats(state);
  const typeMult = getAllyTypeMultipliers(type);
  return {
    maxHp: core.maxHp * typeMult.maxHp,
    damage: core.damage * typeMult.damage,
    speed: core.speed * typeMult.speed
  };
};

export const rebaseAllyStatsForState = (ally: AllyEntity, state: GameState): AllyEntity => {
  const target = getAllyLiveStats(state, ally.type);
  const hpRatio = ally.maxHp > 0 ? Math.max(0, Math.min(1, ally.hp / ally.maxHp)) : 1;
  const speedScale = ally.speed > 0 ? target.speed / ally.speed : 1;
  return {
    ...ally,
    hp: target.maxHp * hpRatio,
    maxHp: target.maxHp,
    damage: target.damage,
    speed: target.speed,
    vx: ally.vx * speedScale,
    vy: ally.vy * speedScale
  };
};

const pct = (value: number): string => `${Math.round(value * 100)}%`;
const fixed = (value: number, digits = 1): string => value.toFixed(digits).replace('.', ',');
const interval = (value: number | null): string => value === null ? 'Desligado' : `${fixed(value)} s`;

export const getUpgradeEffectRows = (item: UpgradeItem, level: number): UpgradeEffectRow[] => {
  const next = Math.min(item.maxLevel, level + 1);
  switch (item.id) {
    case 'armory_bulletproof_vest':
      return [{ label: 'Vida-base por recruta', current: `${getBaseRecruitHp(level)} HP`, next: `${getBaseRecruitHp(next)} HP` }];
    case 'armory_heavy_calibers':
      return [{ label: 'Dano-base por tiro', current: fixed(getBaseRecruitDamage(level)), next: fixed(getBaseRecruitDamage(next)) }];
    case 'armory_motorcycle_squad':
      return [{ label: 'Chance de batedor (novas convocações)', current: pct(getMotorcycleChance(level)), next: pct(getMotorcycleChance(next)) }];
    case 'armory_medics_safehouse':
      return [{ label: 'Regeneração', current: `${fixed(getMedicRegenPerSecond(level))} HP/s`, next: `${fixed(getMedicRegenPerSecond(next))} HP/s` }];
    case 'boca_fortified_bunkers':
      return [{ label: 'Limite de tropas', current: `${15 + level * 3}`, next: `${15 + next * 3}` }];
    case 'boca_barricades':
      return [{ label: 'Redução de dano', current: pct(getBarricadeDamageReduction(level)), next: pct(getBarricadeDamageReduction(next)) }];
    case 'boca_fuzileiros_elite':
      return [{ label: 'Chance de fuzileiro (novas convocações)', current: pct(getFuzileiroChance(level)), next: pct(getFuzileiroChance(next)) }];
    case 'boca_auto_ammo_scavenge':
      return [
        { label: 'Caixas por ciclo', current: `${getAutoAmmoYield(level)}`, next: `${getAutoAmmoYield(next)}` },
        { label: 'Intervalo do ciclo', current: interval(getAutoAmmoIntervalSeconds(level)), next: interval(getAutoAmmoIntervalSeconds(next)) },
        { label: 'Produção estimada', current: `${fixed(getAutoAmmoPerMinute(level))}/min`, next: `${fixed(getAutoAmmoPerMinute(next))}/min` }
      ];
    case 'intel_radio_network':
      return [{ label: 'Regen. base de Inteligência', current: `${fixed(2 + level * 0.8)} /s`, next: `${fixed(2 + next * 0.8)} /s` }];
    case 'intel_central_command':
      return [{ label: 'Capacidade-base de Inteligência', current: `${100 + level * 20}`, next: `${100 + next * 20}` }];
    case 'sindicato_auto_recruit':
      return [{ label: 'Intervalo de auto-convocação', current: interval(getAutoRecruitIntervalSeconds(level)), next: interval(getAutoRecruitIntervalSeconds(next)) }];
    case 'sindicato_double_reinforcements':
      return [{ label: 'Chance de reforço extra', current: pct(getDoubleRecruitChance(level)), next: pct(getDoubleRecruitChance(next)) }];
    default:
      return [{ label: 'Efeito', current: item.effectDescription, next: item.effectDescription }];
  }
};
