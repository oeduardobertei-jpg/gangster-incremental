import { GameState, RecruitOrigin, RecruitRefusalReason } from '../types/game';

export const MANUAL_RECRUIT_INTEL_COST = 10;

export interface RecruitValidationContext {
  activeAllies: number;
  battleAvailable: boolean;
}

export interface RecruitValidationResult {
  ok: boolean;
  intelCost: number;
  reason?: RecruitRefusalReason;
}

export const validateRecruitCommand = (
  state: GameState,
  origin: RecruitOrigin,
  context: RecruitValidationContext
): RecruitValidationResult => {
  if (!context.battleAvailable) return { ok: false, intelCost: 0, reason: 'battle_unavailable' };
  if (state.gameSpeed === 0) return { ok: false, intelCost: 0, reason: 'paused' };
  if (context.activeAllies >= state.maxAllies) return { ok: false, intelCost: 0, reason: 'capacity' };

  const intelCost = origin === 'auto' ? 0 : MANUAL_RECRUIT_INTEL_COST;
  if (state.intel < intelCost) return { ok: false, intelCost, reason: 'insufficient_intel' };
  return { ok: true, intelCost };
};
