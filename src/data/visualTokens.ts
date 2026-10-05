export type WorldMaterialId =
  | 'asphalt'
  | 'concrete'
  | 'brick'
  | 'plaster'
  | 'zinc'
  | 'steel'
  | 'glass'
  | 'vegetation';

export interface WorldMaterialToken {
  base: string;
  highlight: string;
  shadow: string;
  edge: string;
  wear: string;
}

export const WORLD_MATERIALS: Record<WorldMaterialId, WorldMaterialToken> = {
  asphalt: { base: '#20242c', highlight: '#343a45', shadow: '#101319', edge: '#4b5563', wear: '#141820' },
  concrete: { base: '#626974', highlight: '#8a929e', shadow: '#363c45', edge: '#a5adb8', wear: '#4b515a' },
  brick: { base: '#7c3521', highlight: '#a44b2d', shadow: '#421d16', edge: '#c26b43', wear: '#5d271b' },
  plaster: { base: '#a59c89', highlight: '#d6cbb2', shadow: '#665f52', edge: '#ece2ca', wear: '#7b7262' },
  zinc: { base: '#596573', highlight: '#8795a4', shadow: '#303945', edge: '#aab6c2', wear: '#46515d' },
  steel: { base: '#384250', highlight: '#6b7a8d', shadow: '#1c2530', edge: '#93a4b7', wear: '#29333f' },
  glass: { base: '#173b52', highlight: '#67b7d8', shadow: '#0c2331', edge: '#8ed6ec', wear: '#123244' },
  vegetation: { base: '#214d39', highlight: '#4f8b63', shadow: '#112d22', edge: '#6ba576', wear: '#173c2c' }
};
export const WORLD_LIGHTING = {
  shadowOffsetX: 9,
  shadowOffsetY: 12,
  lowShadowAlpha: 0.20,
  mediumShadowAlpha: 0.30,
  highShadowAlpha: 0.40,
  contactShadowAlpha: 0.45,
  ambientWarm: 'rgba(245,158,11,0.10)',
  ambientCool: 'rgba(56,189,248,0.07)'
} as const;

export const WORLD_SCALE = {
  doorWidth: 11,
  doorHeight: 21,
  windowWidth: 11,
  windowHeight: 8,
  lampHeight: 31,
  curbWidth: 4,
  signHeight: 13,
  barricadeHeight: 9,
  roofLip: 5
} as const;

export const VISUAL_TIER_THRESHOLDS = [0, 0.01, 0.25, 0.50, 0.75, 1] as const;
export type VisualTier = 0 | 1 | 2 | 3 | 4 | 5;

export function getVisualTier(level: number, maxLevel: number): VisualTier {
  if (maxLevel <= 0 || level <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, level / maxLevel));
  if (ratio >= 1) return 5;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.50) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}

export function getVisualTierMinLevel(tier: VisualTier, maxLevel: number): number {
  if (tier <= 0 || maxLevel <= 0) return 0;
  return Math.min(maxLevel, Math.max(1, Math.ceil(maxLevel * VISUAL_TIER_THRESHOLDS[tier])));
}

export function getNextVisualTierLevel(level: number, maxLevel: number): number | null {
  const current = getVisualTier(level, maxLevel);
  if (current >= 5) return null;
  return getVisualTierMinLevel((current + 1) as VisualTier, maxLevel);
}

export const CITY_VIVA_VISUAL_REVISION = '1.2t-t3-materials-atmosphere-v1';

