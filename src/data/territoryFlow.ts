export interface TerritoryRecoverySide {
  triggerX: number;
  targetX: number;
  targetY: number;
}

export interface TerritoryFlowProfile {
  territoryId: number;
  entryCongestionRadius: number;
  entrySoftCap: number;
  localCrowdRadius: number;
  localCrowdCap: number;
  left: TerritoryRecoverySide;
  right: TerritoryRecoverySide;
}

const FLOW_PROFILES: Partial<Record<number, TerritoryFlowProfile>> = {
  5: {
    territoryId: 5,
    entryCongestionRadius: 122,
    entrySoftCap: 5,
    localCrowdRadius: 92,
    localCrowdCap: 5,
    left: { triggerX: .18, targetX: .29, targetY: .48 },
    right: { triggerX: .82, targetX: .71, targetY: .74 }
  },
  6: {
    territoryId: 6,
    entryCongestionRadius: 132,
    entrySoftCap: 6,
    localCrowdRadius: 98,
    localCrowdCap: 6,
    left: { triggerX: .19, targetX: .37, targetY: .41 },
    right: { triggerX: .81, targetX: .63, targetY: .67 }
  }
};

export const getTerritoryFlowProfile = (territoryId: number): TerritoryFlowProfile | null =>
  FLOW_PROFILES[territoryId] ?? null;
