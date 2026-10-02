import type { AllyType, RivalEntity, RivalType } from '../types/game';

export interface CombatRoleProfile {
  holdRangeFactor: number;
  retreatRangeFactor: number;
  strafeFactor: number;
}

const ALLY_ROLES: Record<AllyType, CombatRoleProfile> = {
  soldado_base: { holdRangeFactor:.82, retreatRangeFactor:0, strafeFactor:.10 },
  soldado_fuzil: { holdRangeFactor:.90, retreatRangeFactor:.48, strafeFactor:.08 },
  batedor_moto: { holdRangeFactor:.68, retreatRangeFactor:.28, strafeFactor:.72 },
  seguranca_pesado: { holdRangeFactor:.45, retreatRangeFactor:0, strafeFactor:0 }
};

const RIVAL_ROLES: Record<RivalType, CombatRoleProfile> = {
  olheiro: { holdRangeFactor:0, retreatRangeFactor:1, strafeFactor:0 },
  soldado_pistola: { holdRangeFactor:.82, retreatRangeFactor:0, strafeFactor:.18 },
  atirador_fuzil: { holdRangeFactor:.92, retreatRangeFactor:.52, strafeFactor:.10 },
  gerente_boca: { holdRangeFactor:.92, retreatRangeFactor:.62, strafeFactor:.24 },
  blindado_choque: { holdRangeFactor:.38, retreatRangeFactor:0, strafeFactor:0 },
  chefe_morro: { holdRangeFactor:.74, retreatRangeFactor:.22, strafeFactor:.16 }
};

export const getAllyCombatRole = (type: AllyType): CombatRoleProfile => ALLY_ROLES[type];
export const getRivalCombatRole = (type: RivalType): CombatRoleProfile => RIVAL_ROLES[type];
export const scoreRivalTargetForAlly = (
  allyType: AllyType,
  rival: Pick<RivalEntity, 'type'>,
  distanceSq: number
): number => {
  let priority = 1;
  if (allyType === 'batedor_moto') {
    if (rival.type === 'gerente_boca') priority = .52;
    else if (rival.type === 'atirador_fuzil') priority = .68;
    else if (rival.type === 'olheiro') priority = .78;
  } else if (allyType === 'soldado_fuzil') {
    if (rival.type === 'blindado_choque') priority = .58;
    else if (rival.type === 'chefe_morro') priority = .50;
    else if (rival.type === 'gerente_boca') priority = .74;
  } else if (allyType === 'seguranca_pesado') {
    if (rival.type === 'blindado_choque' || rival.type === 'chefe_morro') priority = .62;
  }
  return distanceSq * priority;
};

export const getRivalSupportDamageMultiplier = (
  rival: Pick<RivalEntity, 'type' | 'x' | 'y'>,
  managers: readonly Pick<RivalEntity, 'x' | 'y'>[]
): number => {
  if (rival.type === 'gerente_boca') return 1;
  for (const manager of managers) {
    const dx = manager.x - rival.x, dy = manager.y - rival.y;
    if (dx * dx + dy * dy <= 145 * 145) return 1.12;
  }
  return 1;
};

export interface BossPhaseProfile {
  phase: 1 | 2 | 3;
  damageMultiplier: number;
  cooldownMultiplier: number;
  label: string;
}

export const getBossPhaseProfile = (hpRatio: number): BossPhaseProfile => {
  const ratio = Math.max(0, Math.min(1, hpRatio));
  if (ratio <= .25) return { phase:3, damageMultiplier:1.22, cooldownMultiplier:.72, label:'ÚLTIMA ORDEM' };
  if (ratio <= .60) return { phase:2, damageMultiplier:1.10, cooldownMultiplier:.86, label:'COMANDO SOB PRESSÃO' };
  return { phase:1, damageMultiplier:1, cooldownMultiplier:1, label:'COMANDO ESTÁVEL' };
};
