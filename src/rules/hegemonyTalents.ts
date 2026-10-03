import { SyndicatePrestigeTalent } from '../types/game';

export interface HegemonyEffectRow {
  label: string;
  current: string;
  next: string;
}

const safeLevel = (level: number): number => Math.max(0, level);
const bonusPct = (level: number, perLevel: number): string => '+' + Math.round(safeLevel(level) * perLevel * 100) + '%';

export const getHegemonyTalentCost = (talent: SyndicatePrestigeTalent, currentLevel: number): number =>
  talent.cost * (safeLevel(currentLevel) + 1);

export const getCashTalentMultiplier = (level: number): number => 1 + safeLevel(level) * 0.5;
export const getIntelTalentMaxBonus = (level: number): number => safeLevel(level) * 25;
export const getIntelTalentRegenMultiplier = (level: number): number => 1 + safeLevel(level) * 0.3;
export const getVeteranTalentMultiplier = (level: number): number => 1 + safeLevel(level) * 0.25;
export const getStarterGangCount = (level: number): number => safeLevel(level) * 2;
export const getHegemonyMonopolyMultiplier = (level: number): number => 1 + safeLevel(level) * 0.2;

export const getHegemonyTalentEffectRows = (talent: SyndicatePrestigeTalent, level: number): HegemonyEffectRow[] => {
  const next = Math.min(talent.maxLevel, safeLevel(level) + 1);
  switch (talent.id) {
    case 'talent_cartel_cash':
      return [{ label: 'Bônus permanente de Grana', current: bonusPct(level, 0.5), next: bonusPct(next, 0.5) }];
    case 'talent_intel_network':
      return [
        { label: 'Inteligência máxima', current: '+' + getIntelTalentMaxBonus(level), next: '+' + getIntelTalentMaxBonus(next) },
        { label: 'Regeneração de Inteligência', current: bonusPct(level, 0.3), next: bonusPct(next, 0.3) }
      ];
    case 'talent_veteran_enforcers':
      return [
        { label: 'Vida dos recrutas', current: bonusPct(level, 0.25), next: bonusPct(next, 0.25) },
        { label: 'Dano dos recrutas', current: bonusPct(level, 0.25), next: bonusPct(next, 0.25) }
      ];
    case 'talent_starter_gang':
      return [{ label: 'Soldados no início da rodada', current: String(getStarterGangCount(level)), next: String(getStarterGangCount(next)) }];
    case 'talent_hegemony_monopoly':
      return [{ label: 'Bônus de Emblemas recebidos', current: bonusPct(level, 0.2), next: bonusPct(next, 0.2) }];
    default:
      return [{ label: 'Efeito', current: '—', next: '—' }];
  }
};
