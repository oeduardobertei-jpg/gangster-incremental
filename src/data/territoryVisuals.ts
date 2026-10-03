export type TerritoryVisualIdentity =
  | 'periphery'
  | 'market_rail'
  | 'industrial'
  | 'fortified_hill'
  | 'gated_district'
  | 'central_hq';

export interface TerritoryVisualProfile {
  id: number;
  identity: TerritoryVisualIdentity;
  groundTop: string;
  groundMid: string;
  groundBottom: string;
  alley: string;
  road: string;
  roadMarking: string;
  curb: string;
  lampCore: string;
  lampGlow: string;
  accent: string;
}

export const TERRITORY_VISUALS: Record<number, TerritoryVisualProfile> = {
  1: {
    id: 1, identity: 'periphery',
    groundTop: '#0a0d14', groundMid: '#131822', groundBottom: '#090c12',
    alley: '#171e2b', road: '#1e2330', roadMarking: 'rgba(234,179,8,0.40)',
    curb: 'rgba(148,163,184,0.35)', lampCore: '#fef08a', lampGlow: '245,158,11', accent: '#94a3b8'
  },
  2: {
    id: 2, identity: 'market_rail',
    groundTop: '#12111b', groundMid: '#1d1a28', groundBottom: '#0e0d16',
    alley: '#211d2a', road: '#242331', roadMarking: 'rgba(250,204,21,0.46)',
    curb: 'rgba(203,213,225,0.32)', lampCore: '#fde68a', lampGlow: '234,179,8', accent: '#eab308'
  },
  3: {
    id: 3, identity: 'industrial',
    groundTop: '#151416', groundMid: '#242124', groundBottom: '#101012',
    alley: '#282629', road: '#29282d', roadMarking: 'rgba(249,115,22,0.42)',
    curb: 'rgba(148,163,184,0.30)', lampCore: '#fdba74', lampGlow: '249,115,22', accent: '#f97316'
  },
  4: {
    id: 4, identity: 'fortified_hill',
    groundTop: '#181115', groundMid: '#27191d', groundBottom: '#120c0f',
    alley: '#25191d', road: '#2a2023', roadMarking: 'rgba(239,68,68,0.38)',
    curb: 'rgba(248,113,113,0.24)', lampCore: '#fecaca', lampGlow: '239,68,68', accent: '#ef4444'
  },
  5: {
    id: 5, identity: 'gated_district',
    groundTop: '#111817', groundMid: '#1b2422', groundBottom: '#0d1312',
    alley: '#222a28', road: '#272d2c', roadMarking: 'rgba(226,211,170,0.34)',
    curb: 'rgba(226,232,224,0.40)', lampCore: '#fde68a', lampGlow: '245,158,11', accent: '#a855f7'
  },
  6: {
    id: 6, identity: 'central_hq',
    groundTop: '#150b10', groundMid: '#241219', groundBottom: '#0d080b',
    alley: '#24151b', road: '#241a20', roadMarking: 'rgba(244,63,94,0.50)',
    curb: 'rgba(251,113,133,0.32)', lampCore: '#fecdd3', lampGlow: '244,63,94', accent: '#f43f5e'
  }
};

export function getTerritoryVisualProfile(territoryId: number): TerritoryVisualProfile {
  return TERRITORY_VISUALS[territoryId] ?? TERRITORY_VISUALS[1];
}
