export interface ScenePoint { x: number; y: number; }
export interface SceneRect { x: number; y: number; w: number; h: number; }
export interface ScenePath {
  width: number;
  points: ScenePoint[];
  surface: 'asphalt' | 'concrete' | 'alley';
  edge?: boolean;
}
export interface SceneLamp extends ScenePoint { warmth: 'warm' | 'cool'; intensity: number; }
export interface SceneLot extends SceneRect {
  material: 'brick' | 'plaster' | 'zinc' | 'concrete';
  height: 'low' | 'mid';
  roof: 'slab' | 'zinc' | 'mixed';
}
export interface TerritorySceneBlueprint {
  id: number;
  codename: string;
  subtitle: string;
  paths: ScenePath[];
  lots: SceneLot[];
  lamps: SceneLamp[];
  plaza?: SceneRect;
  mural?: SceneRect;
  accent: string;
}

export const TERRITORY_SCENES: Record<number, TerritorySceneBlueprint> = {
  1: {
    id: 1,
    codename: 'beco-dos-descalcos',
    subtitle: 'Becos apertados, lajes, comércio e oficinas da periferia',
    accent: '#d97706',
    paths: [
      { surface: 'asphalt', width: 88, edge: true, points: [
        {x:.50,y:1.04},{x:.48,y:.84},{x:.51,y:.67},{x:.47,y:.50},{x:.50,y:.32},{x:.53,y:.14},{x:.50,y:-.04}
      ]},
      { surface: 'alley', width: 22, edge: true, points: [
        {x:.22,y:1.02},{x:.23,y:.83},{x:.20,y:.68},{x:.26,y:.54},{x:.22,y:.39},{x:.26,y:.23},{x:.22,y:-.02}
      ]},
      { surface: 'alley', width: 22, edge: true, points: [
        {x:.78,y:1.02},{x:.75,y:.84},{x:.80,y:.68},{x:.74,y:.52},{x:.80,y:.38},{x:.75,y:.21},{x:.80,y:-.02}
      ]},
    ],
    plaza:{x:.285,y:.435,w:.115,h:.14},
    mural:{x:.12,y:.30,w:.16,h:.022},
    lamps:[
      {x:.31,y:.37,warmth:'warm',intensity:.94},
      {x:.68,y:.28,warmth:'warm',intensity:.68},{x:.83,y:.51,warmth:'warm',intensity:.58},
      {x:.30,y:.72,warmth:'warm',intensity:.88},{x:.67,y:.76,warmth:'warm',intensity:.78}
    ],
    lots:[]
  },
  2: {
    id: 2, codename: 'feira-ferrovia', subtitle: 'Comércio comprimido pela linha do trem', accent: '#eab308',
    paths: [{ surface: 'asphalt', width: 108, edge: true, points: [{x:.48,y:1.03},{x:.49,y:.65},{x:.51,y:.32},{x:.50,y:-.03}] }],
    lots: [], lamps: [], plaza: { x:.08,y:.48,w:.84,h:.26 }
  },
  3: {
    id: 3, codename: 'patio-industrial', subtitle: 'Galpões, concreto e corredores de carga', accent: '#f97316',
    paths: [{ surface: 'asphalt', width: 128, edge: true, points: [{x:.50,y:1.03},{x:.47,y:.60},{x:.53,y:.28},{x:.50,y:-.03}] }],
    lots: [], lamps: [], plaza: { x:.12,y:.30,w:.76,h:.48 }
  },
  4: {
    id: 4, codename: 'morro-fortificado', subtitle: 'Terraços, contenções e acessos sob vigilância', accent: '#ef4444',
    paths: [{ surface: 'asphalt', width: 92, edge: true, points: [{x:.49,y:1.03},{x:.45,y:.78},{x:.54,y:.57},{x:.47,y:.34},{x:.52,y:-.03}] }],
    lots: [
      {x:.20,y:.14,w:.12,h:.10,material:'brick',height:'mid',roof:'mixed'},
      {x:.29,y:.30,w:.095,h:.10,material:'plaster',height:'low',roof:'zinc'},
      {x:.27,y:.61,w:.11,h:.10,material:'brick',height:'mid',roof:'slab'},
      {x:.18,y:.84,w:.11,h:.09,material:'plaster',height:'low',roof:'mixed'},
      {x:.66,y:.13,w:.11,h:.10,material:'brick',height:'mid',roof:'slab'},
      {x:.63,y:.31,w:.105,h:.10,material:'plaster',height:'low',roof:'zinc'},
      {x:.59,y:.60,w:.105,h:.10,material:'brick',height:'mid',roof:'mixed'},
      {x:.66,y:.84,w:.10,h:.09,material:'plaster',height:'low',roof:'zinc'}
    ], lamps: []
  },
  5: {
    id: 5, codename: 'orla-controlada', subtitle: 'Avenidas largas, muros e portarias', accent: '#a855f7',
    paths: [{ surface: 'asphalt', width: 140, edge: true, points: [{x:.50,y:1.03},{x:.50,y:-.03}] }],
    lots: [], lamps: [], plaza: { x:.23,y:.16,w:.54,h:.62 }
  },
  6: {
    id: 6, codename: 'complexo-central', subtitle: 'Eixo de comando e perímetro de segurança', accent: '#f43f5e',
    paths: [{ surface: 'asphalt', width: 112, edge: true, points: [{x:.50,y:1.03},{x:.50,y:-.03}] }],
    lots: [], lamps: [], plaza: { x:.34,y:.08,w:.32,h:.82 }
  }
};

export function getTerritoryScene(territoryId: number): TerritorySceneBlueprint {
  return TERRITORY_SCENES[territoryId] ?? TERRITORY_SCENES[1];
}
