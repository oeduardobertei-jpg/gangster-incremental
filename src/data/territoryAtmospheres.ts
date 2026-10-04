export interface TerritoryAtmosphereProfile {
  ambientLight: string;
  shadowStrength: number;
  hazeAmount: number;
  particleDensity: number;
  buildingTint: string;
  streetTint: string;
}

export const TERRITORY_ATMOSPHERES: Record<number, TerritoryAtmosphereProfile> = {
  1: {
    // 0.9.5M: base fria controlada; calor vem das luzes práticas e do comércio.
    ambientLight: 'rgba(22,28,34,.48)',
    shadowStrength: .60,
    hazeAmount: .20,
    particleDensity: .16,
    buildingTint: 'rgba(255,176,108,.012)',
    streetTint: 'rgba(22,31,34,.055)'
  },
  2: {
    ambientLight: 'rgba(30,25,45,.60)',
    shadowStrength: .70,
    hazeAmount: .50,
    particleDensity: .40,
    buildingTint: 'rgba(250,204,21,.05)',
    streetTint: 'rgba(20,15,30,.20)'
  },
  3: {
    ambientLight: 'rgba(40,30,25,.70)',
    shadowStrength: .85,
    hazeAmount: .70,
    particleDensity: .90,
    buildingTint: 'rgba(249,115,22,.08)',
    streetTint: 'rgba(30,20,15,.30)'
  },
  4: {
    ambientLight: 'rgba(48,30,24,.50)',
    shadowStrength: .72,
    hazeAmount: .30,
    particleDensity: .42,
    buildingTint: 'rgba(239,110,72,.03)',
    streetTint: 'rgba(48,30,20,.12)'
  },
  5: {
    ambientLight: 'rgba(15,20,45,.50)',
    shadowStrength: .65,
    hazeAmount: .20,
    particleDensity: .10,
    buildingTint: 'rgba(167,139,250,.04)',
    streetTint: 'rgba(15,20,40,.10)'
  },
  6: {
    ambientLight: 'rgba(35,10,20,.80)',
    shadowStrength: .90,
    hazeAmount: .60,
    particleDensity: .70,
    buildingTint: 'rgba(244,63,94,.06)',
    streetTint: 'rgba(30,5,15,.25)'
  }
};

export const getTerritoryAtmosphereProfile = (territoryId: number): TerritoryAtmosphereProfile =>
  TERRITORY_ATMOSPHERES[territoryId] ?? TERRITORY_ATMOSPHERES[1];
