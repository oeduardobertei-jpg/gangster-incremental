import { GameState } from '../types/game';

export const AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS = 100;

export interface CampaignMilestoneResult {
  state: GameState;
  autoRecruitGranted: boolean;
}

export const getAutoRecruitMilestoneProgress = (state: GameState): number => {
  if ((state.upgrades['sindicato_auto_recruit'] || 0) > 0) return AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS;
  return Math.min(
    AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS,
    Math.max(0, state.runRivalsNeutralized || 0)
  );
};

export const hasReachedAutoRecruitMilestone = (state: GameState): boolean =>
  getAutoRecruitMilestoneProgress(state) >= AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS;

export const applyCampaignMilestones = (state: GameState): CampaignMilestoneResult => {
  const currentLevel = state.upgrades['sindicato_auto_recruit'] || 0;
  if (currentLevel > 0 || !hasReachedAutoRecruitMilestone(state)) {
    return { state, autoRecruitGranted: false };
  }

  return {
    autoRecruitGranted: true,
    state: {
      ...state,
      upgrades: { ...state.upgrades, sindicato_auto_recruit: 1 },
      autoRecruitFallen: true
    }
  };
};
