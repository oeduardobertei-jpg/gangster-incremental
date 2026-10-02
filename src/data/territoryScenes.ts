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
    codename: 'periferia-organica',
    subtitle: 'Vielas, comércio e lajes da comunidade',
    accent: '#f59e0b',
    paths: [
      { surface: 'asphalt', width: 92, edge: true, points: [
        { x: .50, y: 1.04 }, { x: .47, y: .84 }, { x: .50, y: .66 },
        { x: .46, y: .48 }, { x: .51, y: .31 }, { x: .53, y: -.04 }
      ]},
      { surface: 'alley', width: 42, edge: true, points: [
        { x: .13, y: 1.02 }, { x: .14, y: .76 }, { x: .10, y: .58 },
        { x: .16, y: .39 }, { x: .12, y: .18 }, { x: .18, y: -.02 }
      ]},
      { surface: 'alley', width: 38, edge: true, points: [
        { x: .81, y: 1.02 }, { x: .78, y: .78 }, { x: .83, y: .59 },
        { x: .79, y: .42 }, { x: .86, y: .23 }, { x: .82, y: -.02 }
      ]},
      { surface: 'concrete', width: 26, points: [
        { x: .13, y: .52 }, { x: .27, y: .50 }, { x: .37, y: .45 }
      ]},
      { surface: 'concrete', width: 24, points: [
        { x: .50, y: .64 }, { x: .63, y: .67 }, { x: .80, y: .61 }
      ]}
    ],
    plaza: { x: .31, y: .40, w: .22, h: .18 },
    mural: { x: .29, y: .35, w: .18, h: .025 },
    lamps: [
      { x: .19, y: .27, warmth: 'warm', intensity: .85 },
      { x: .28, y: .57, warmth: 'warm', intensity: .72 },
      { x: .63, y: .22, warmth: 'warm', intensity: .76 },
      { x: .69, y: .58, warmth: 'warm', intensity: .88 },
      { x: .38, y: .79, warmth: 'warm', intensity: .64 }
    ],
    lots: [
      { x: .20, y: .08, w: .13, h: .12, material: 'brick', height: 'mid', roof: 'mixed' },
      { x: .30, y: .12, w: .10, h: .09, material: 'plaster', height: 'low', roof: 'zinc' },
      { x: .62, y: .08, w: .11, h: .11, material: 'brick', height: 'mid', roof: 'slab' },
      { x: .18, y: .68, w: .14, h: .12, material: 'plaster', height: 'low', roof: 'zinc' },
      { x: .64, y: .73, w: .12, h: .10, material: 'brick', height: 'mid', roof: 'mixed' },
      { x: .22, y: .29, w: .10, h: .10, material: 'plaster', height: 'low', roof: 'mixed' },
      { x: .61, y: .27, w: .105, h: .11, material: 'brick', height: 'mid', roof: 'slab' },
      { x: .27, y: .84, w: .12, h: .09, material: 'brick', height: 'mid', roof: 'slab' },
      { x: .57, y: .55, w: .09, h: .10, material: 'plaster', height: 'low', roof: 'zinc' }
    ]
  },
  2: {
    id: 2, codename: 'feira-ferrovia', subtitle: 'Comércio comprimido pela linha férrea', accent: '#eab308',
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