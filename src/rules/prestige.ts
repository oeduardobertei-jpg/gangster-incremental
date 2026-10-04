import { GameState } from '../types/game';
import { createRunId } from '../persistence/saveGame';
import { getHegemonyMonopolyMultiplier, getIntelTalentMaxBonus, getIntelTalentRegenMultiplier } from './hegemonyTalents';

export interface PrestigeResult {
  ok: boolean;
  reward: number;
  state: GameState;
}

export const getHegemonyReward = (state: GameState): number => {
  const eligibleRespect = Math.max(0, state.runRespectEarned || 0);
  if (eligibleRespect <= 0) return 0;

  const monopolyLvl = state.talents['talent_hegemony_monopoly'] || 0;
  const monopolyMultiplier = getHegemonyMonopolyMultiplier(monopolyLvl);
  return Math.max(
    0,
    Math.floor(Math.sqrt(eligibleRespect / 10) * state.currentTerritoryId * monopolyMultiplier)
  );
};

export const performHegemony = (state: GameState): PrestigeResult => {
  const reward = getHegemonyReward(state);
  if (reward <= 0) return { ok: false, reward: 0, state };

  const primordialLvl = state.talents['talent_intel_network'] || 0;
  const maxIntel = 100 + getIntelTalentMaxBonus(primordialLvl);
  const intelRegen = 2.0 * getIntelTalentRegenMultiplier(primordialLvl);

  return {
    ok: true,
    reward,
    state: {
      ...state,
      runId: createRunId(),
      runStartedAt: Date.now(),
      battleSnapshot: undefined,
      intel: maxIntel,
      maxIntel,
      intelRegen,
      cash: 60,
      ammo: 15,
      respect: 0,
      runRespectEarned: 0,
      contacts: 0,
      hegemonyEmblems: state.hegemonyEmblems + reward,
      currentTerritoryId: 1,
      territoryTakes: 0,
      runRivalsNeutralized: 0,
      runHighestTerritoryReached: 1,
      maxAllies: 15,
      upgrades: {},
      autoRecruitFallen: false,
      stats: {
        ...state.stats,
        hegemonyRituals: state.stats.hegemonyRituals + 1
      }
    }
  };
};
