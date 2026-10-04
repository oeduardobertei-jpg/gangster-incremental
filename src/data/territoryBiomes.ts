export type GroundPatchKind =
  | 'dirt'
  | 'concrete'
  | 'grass'
  | 'pavers'
  | 'ballast'
  | 'industrial'
  | 'mud'
  | 'restricted';

export interface GroundPatchSpec {
  kind: GroundPatchKind;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  alpha?: number;
}

export interface TerritoryBiomeProfile {
  id: number;
  codename: string;
  baseTop: string;
  baseMid: string;
  baseBottom: string;
  dust: string;
  dirt: string;
  concrete: string;
  edge: string;
  crack: string;
  damp: string;
  vegetation: string;
  accent: string;
  noiseDensity: number;
  crackDensity: number;
  seamDensity: number;
  wetness: number;
  patches: readonly GroundPatchSpec[];
}

export const TERRITORY_BIOMES: Record<number, TerritoryBiomeProfile> = {
  1: {
    id:1,codename:'beco-dos-descalcos',
    baseTop:'#393229',baseMid:'#41392f',baseBottom:'#30372e',
    dust:'#b79268',dirt:'#7b563b',concrete:'#6b6961',edge:'#a99a85',
    crack:'#15191a',damp:'#1d2d29',vegetation:'#416d4d',accent:'#d97706',
    noiseDensity:.72,crackDensity:.72,seamDensity:.45,wetness:.42,
    patches:[]
  },
  2: {
    id: 2,
    codename: 'ferrovia-comercial',
    baseTop: '#211c20', baseMid: '#28242a', baseBottom: '#171519',
    dust: '#8f7251', dirt: '#5a4638', concrete: '#5d5a57', edge: '#b8a77c',
    crack: '#171419', damp: '#172127', vegetation: '#3b5544', accent: '#eab308',
    noiseDensity: 1.05, crackDensity: .72, seamDensity: .8, wetness: .42,
    patches: [
      { kind:'ballast', x:0,y:.245,w:1,h:.09,alpha:.95 },
      { kind:'pavers', x:.06,y:.43,w:.88,h:.39,alpha:.70 },
      { kind:'dirt', x:.03,y:.06,w:.19,h:.14,rotation:.04,alpha:.55 },
      { kind:'concrete', x:.27,y:.13,w:.46,h:.16,alpha:.72 },
      { kind:'mud', x:.72,y:.54,w:.19,h:.16,rotation:.08,alpha:.46 }
    ]
  },
  3: {
    id: 3,
    codename: 'patio-industrial',
    baseTop: '#1a1a1b', baseMid: '#242526', baseBottom: '#161718',
    dust: '#766d63', dirt: '#4d433d', concrete: '#55585a', edge: '#8e9396',
    crack: '#0c0d0e', damp: '#11181a', vegetation: '#30493b', accent: '#f97316',
    noiseDensity: .86, crackDensity: 1.0, seamDensity: 1.35, wetness: .78,
    patches: [
      { kind:'industrial', x:.08,y:.15,w:.84,h:.70,alpha:.80 },
      { kind:'concrete', x:.13,y:.20,w:.26,h:.23,alpha:.48 },
      { kind:'mud', x:.58,y:.56,w:.28,h:.20,rotation:-.04,alpha:.54 },
      { kind:'dirt', x:.02,y:.72,w:.18,h:.20,rotation:.08,alpha:.44 }
    ]
  },
  4: {
    id: 4,
    codename: 'morro-terroso',
    baseTop: '#34271f', baseMid: '#3b2c23', baseBottom: '#27211c',
    dust: '#9a7655', dirt: '#6d4d34', concrete: '#625b54', edge: '#a18b73',
    crack: '#17120e', damp: '#201c18', vegetation: '#4a5b39', accent: '#9a6a48',
    noiseDensity: .78, crackDensity: .62, seamDensity: .36, wetness: .18,
    patches: []
  },
  5: {
    id: 5,
    codename: 'residencial-paisagistico',
    baseTop: '#172028', baseMid: '#202b34', baseBottom: '#131b22',
    dust: '#89959b', dirt: '#4d5b55', concrete: '#707981', edge: '#c6d0d6',
    crack: '#1c252b', damp: '#12313b', vegetation: '#275d48', accent: '#a855f7',
    noiseDensity: .62, crackDensity: .25, seamDensity: 1.05, wetness: .82,
    patches: [
      { kind:'pavers', x:.18,y:.10,w:.64,h:.80,alpha:.60 },
      { kind:'grass', x:.03,y:.14,w:.13,h:.20,alpha:.88 },
      { kind:'grass', x:.84,y:.14,w:.13,h:.20,alpha:.88 },
      { kind:'grass', x:.03,y:.60,w:.13,h:.21,alpha:.86 },
      { kind:'grass', x:.84,y:.60,w:.13,h:.21,alpha:.86 },
      { kind:'concrete', x:.36,y:.80,w:.28,h:.14,alpha:.72 }
    ]
  },
  6: {
    id: 6,
    codename: 'complexo-operacional',
    baseTop: '#15181e', baseMid: '#1d2027', baseBottom: '#111318',
    dust: '#747981', dirt: '#464950', concrete: '#61636a', edge: '#a7a9b1',
    crack: '#0d0f13', damp: '#151b22', vegetation: '#33483d', accent: '#64748b',
    noiseDensity: .70, crackDensity: .38, seamDensity: 1.5, wetness: .46,
    patches: [
      { kind:'restricted', x:.31,y:.05,w:.38,h:.90,alpha:.78 },
      { kind:'industrial', x:.36,y:.09,w:.28,h:.25,alpha:.56 },
      { kind:'concrete', x:.36,y:.38,w:.28,h:.18,alpha:.54 },
      { kind:'concrete', x:.36,y:.62,w:.28,h:.18,alpha:.54 },
      { kind:'pavers', x:.05,y:.18,w:.20,h:.62,alpha:.42 },
      { kind:'pavers', x:.75,y:.18,w:.20,h:.62,alpha:.42 }
    ]
  }
};

export function getTerritoryBiome(territoryId: number): TerritoryBiomeProfile {
  return TERRITORY_BIOMES[territoryId] ?? TERRITORY_BIOMES[1];
}
