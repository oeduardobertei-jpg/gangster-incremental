import { RivalType, TerritoryZone } from '../types/game';
import { getCashTalentMultiplier } from './hegemonyTalents';

export interface EconomicReward {
  cash: number;
  ammo: number;
  respect: number;
  contacts: number;
}

export interface RivalEliminationReward extends EconomicReward {}

const BASE_CASH: Record<RivalType, number> = {
  olheiro: 15,
  soldado_pistola: 30,
  atirador_fuzil: 50,
  gerente_boca: 70,
  blindado_choque: 90,
  chefe_morro: 160
};

export const applyCashTalent = (cash: number, cashTalentLevel = 0): number =>
  Math.max(0, Math.round(cash * getCashTalentMultiplier(cashTalentLevel)));

export const getRivalEliminationReward = (
  type: RivalType,
  territory: TerritoryZone,
  cashTalentLevel = 0
): RivalEliminationReward => {
  const rewardMultiplier = territory.rewardMultiplier;
  const baseAmmo = type === 'olheiro' ? 1
    : type === 'blindado_choque' ? 4
      : type === 'chefe_morro' ? 6
        : type === 'gerente_boca' ? 3 : 2;
  const baseRespect = type === 'chefe_morro' ? 8
    : type === 'gerente_boca' ? 4
      : type === 'blindado_choque' ? 3 : 1;
  return {
    cash: applyCashTalent(BASE_CASH[type] * rewardMultiplier, cashTalentLevel),
    ammo: Math.max(0, Math.round(baseAmmo * rewardMultiplier)),
    respect: baseRespect,
    contacts: type === 'chefe_morro' ? 4 : type === 'gerente_boca' ? 1 : 0
  };
};

export const scaleScavengeLoot = (
  cash: number,
  ammo: number,
  territory: TerritoryZone
): { cash: number; ammo: number } => ({
  cash: Math.max(0, Math.round(cash * territory.rewardMultiplier)),
  ammo: Math.max(0, Math.round(ammo * territory.rewardMultiplier))
});

export const getScavengeCredit = (
  cash: number,
  ammo: number,
  cashTalentLevel = 0
): EconomicReward => ({
  cash: applyCashTalent(cash, cashTalentLevel),
  ammo: Math.max(0, Math.round(ammo)),
  respect: 0,
  contacts: 0
});

export const formatEconomicRewardFeedback = (reward: EconomicReward): string => {
  const parts: string[] = [];
  if (reward.cash > 0) parts.push(`+$${reward.cash}`);
  if (reward.ammo > 0) parts.push(`+${reward.ammo} Mun`);
  if (reward.respect > 0) parts.push(`+${reward.respect} Respeito`);
  if (reward.contacts > 0) parts.push(`+${reward.contacts} Contato${reward.contacts === 1 ? '' : 's'}`);
  return parts.length > 0 ? parts.join(' · ') : 'Sem recompensa';
};
