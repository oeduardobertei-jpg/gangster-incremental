export type PurposePropKind =
  | 'low_wall' | 'stall' | 'dumpster' | 'bench' | 'crate_stack'
  | 'container' | 'pallets' | 'sandbags' | 'barricade' | 'planter'
  | 'security_booth' | 'parked_car' | 'checkpoint' | 'watch_post'
  | 'bollards' | 'service_unit';

export type PurposeMaterial = 'concrete' | 'brick' | 'metal' | 'glass' | 'mixed' | 'vegetation';

export interface PurposeProp {
  id: string;
  kind: PurposePropKind;
  x: number; y: number; w: number; h: number;
  solid?: boolean;
  blocksProjectiles?: boolean;
  occludes?: boolean;
  material?: PurposeMaterial;
  accent?: string;
  label?: string;
  rotation?: number;
}

const T1: PurposeProp[] = [
  {id:'t1-entry-wall',kind:'low_wall',x:.045,y:.305,w:.100,h:.020,solid:true,blocksProjectiles:true,material:'brick'},
  {id:'t1-mercearia',kind:'stall',x:.145,y:.365,w:.060,h:.060,solid:true,blocksProjectiles:true,occludes:true,material:'mixed',label:'MERCADO'},
  {id:'t1-barricade-center',kind:'barricade',x:.455,y:.575,w:.090,h:.020,solid:true,blocksProjectiles:true,material:'metal',accent:'#92400e'},
  {id:'t1-dumpster',kind:'dumpster',x:.875,y:.585,w:.044,h:.032,solid:true,blocksProjectiles:true,material:'metal'},
  {id:'t1-bench',kind:'bench',x:.365,y:.675,w:.060,h:.018,solid:true,blocksProjectiles:false,material:'mixed'},
  {id:'t1-service',kind:'service_unit',x:.705,y:.245,w:.040,h:.034,solid:true,blocksProjectiles:true,occludes:true,material:'metal',label:'REDE'},
  {id:'t1-car',kind:'parked_car',x:.615,y:.705,w:.080,h:.038,solid:true,blocksProjectiles:true,material:'metal',accent:'#374151'},
  {id:'t1-planter',kind:'planter',x:.885,y:.315,w:.055,h:.038,solid:true,blocksProjectiles:true,material:'vegetation'},
  {id:'t1-wall-back',kind:'low_wall',x:.835,y:.900,w:.120,h:.020,solid:true,blocksProjectiles:true,material:'brick'},
  // 0.9.4 storytelling: decorative/non-solid life around the occupied pockets.
  {id:'t1-entry-planter',kind:'planter',x:.235,y:.345,w:.034,h:.027,solid:false,blocksProjectiles:false,material:'vegetation'},
  {id:'t1-back-bench',kind:'bench',x:.615,y:.875,w:.050,h:.016,solid:false,blocksProjectiles:false,material:'mixed'}
];
const T2: PurposeProp[] = [
  { id:'t2-stall-a', kind:'stall', x:.14,y:.53,w:.050,h:.060,solid:true,blocksProjectiles:true,occludes:true,material:'mixed',accent:'#f59e0b' },
  { id:'t2-stall-b', kind:'stall', x:.77,y:.54,w:.050,h:.060,solid:true,blocksProjectiles:true,occludes:true,material:'mixed',accent:'#0f766e' },
  { id:'t2-crates-a', kind:'crate_stack', x:.24,y:.68,w:.036,h:.034,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t2-crates-b', kind:'crate_stack', x:.68,y:.69,w:.036,h:.034,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t2-barricade', kind:'barricade', x:.46,y:.39,w:.080,h:.020,solid:true,blocksProjectiles:true,material:'metal',accent:'#eab308' },
  { id:'t2-dumpster', kind:'dumpster', x:.87,y:.72,w:.042,h:.030,solid:true,blocksProjectiles:true,material:'metal' },
  { id:'t2-bench', kind:'bench', x:.49,y:.59,w:.050,h:.018,solid:true,blocksProjectiles:false,material:'mixed' }
];

const T3: PurposeProp[] = [
  { id:'t3-container-a', kind:'container', x:.20,y:.26,w:.070,h:.050,solid:true,blocksProjectiles:true,occludes:true,material:'metal',accent:'#9a3412' },
  { id:'t3-container-b', kind:'container', x:.61,y:.68,w:.072,h:.050,solid:true,blocksProjectiles:true,occludes:true,material:'metal',accent:'#334155' },
  { id:'t3-pallets-a', kind:'pallets', x:.31,y:.31,w:.045,h:.032,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t3-pallets-b', kind:'pallets', x:.69,y:.39,w:.045,h:.032,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t3-barricade', kind:'barricade', x:.46,y:.53,w:.085,h:.022,solid:true,blocksProjectiles:true,material:'metal',accent:'#f97316' },
  { id:'t3-service', kind:'service_unit', x:.52,y:.23,w:.035,h:.035,solid:true,blocksProjectiles:true,occludes:true,material:'metal',label:'GERADOR' },
  { id:'t3-dumpster', kind:'dumpster', x:.36,y:.72,w:.042,h:.030,solid:true,blocksProjectiles:true,material:'metal' },
  // 1.1L: physical yard density. These replace decorative fake containers from the ground pass.
  { id:'t3-container-c', kind:'container', x:.095,y:.62,w:.064,h:.047,solid:true,blocksProjectiles:true,occludes:true,material:'metal',accent:'#3f5962' },
  { id:'t3-container-d', kind:'container', x:.805,y:.61,w:.064,h:.047,solid:true,blocksProjectiles:true,occludes:true,material:'metal',accent:'#704731' },
  { id:'t3-pallets-c', kind:'pallets', x:.235,y:.735,w:.042,h:.030,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t3-pallets-d', kind:'pallets', x:.765,y:.745,w:.042,h:.030,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t3-dumpster-east', kind:'dumpster', x:.875,y:.52,w:.040,h:.030,solid:true,blocksProjectiles:true,material:'metal' },
  { id:'t3-service-north', kind:'service_unit', x:.835,y:.155,w:.036,h:.033,solid:true,blocksProjectiles:true,occludes:true,material:'metal',label:'FORÇA' }
];
const T4: PurposeProp[] = [
  { id:'t4-sandbags-a', kind:'sandbags', x:.28,y:.33,w:.075,h:.025,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t4-sandbags-b', kind:'sandbags', x:.64,y:.60,w:.075,h:.025,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t4-watch-a', kind:'watch_post', x:.16,y:.18,w:.050,h:.055,solid:true,blocksProjectiles:true,occludes:true,material:'metal' },
  { id:'t4-watch-b', kind:'watch_post', x:.90,y:.45,w:.050,h:.055,solid:true,blocksProjectiles:true,occludes:true,material:'metal' },
  { id:'t4-barricade', kind:'barricade', x:.43,y:.74,w:.12,h:.022,solid:true,blocksProjectiles:true,material:'metal' },
  { id:'t4-crates', kind:'crate_stack', x:.54,y:.27,w:.040,h:.034,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t4-service', kind:'service_unit', x:.39,y:.48,w:.034,h:.032,solid:true,blocksProjectiles:true,material:'metal',label:'RÁDIO' }
];

const T5: PurposeProp[] = [
  { id:'t5-planter-a', kind:'planter', x:.20,y:.36,w:.070,h:.045,solid:true,blocksProjectiles:true,occludes:true,material:'vegetation' },
  { id:'t5-planter-b', kind:'planter', x:.73,y:.48,w:.070,h:.045,solid:true,blocksProjectiles:true,occludes:true,material:'vegetation' },
  { id:'t5-booth-a', kind:'security_booth', x:.18,y:.76,w:.050,h:.052,solid:true,blocksProjectiles:true,occludes:true,material:'glass',accent:'#a855f7',label:'PORTARIA' },
  { id:'t5-car-a', kind:'parked_car', x:.32,y:.55,w:.070,h:.036,solid:true,blocksProjectiles:true,material:'metal',accent:'#475569' },
  { id:'t5-car-b', kind:'parked_car', x:.62,y:.31,w:.070,h:.036,solid:true,blocksProjectiles:true,material:'metal',accent:'#1e3a5f' },
  { id:'t5-bollards', kind:'bollards', x:.455,y:.80,w:.090,h:.020,solid:true,blocksProjectiles:false,material:'metal',accent:'#a855f7' },
  { id:'t5-bench', kind:'bench', x:.58,y:.63,w:.052,h:.018,solid:true,blocksProjectiles:false,material:'mixed' }
];
const T6: PurposeProp[] = [
  { id:'t6-check-a', kind:'checkpoint', x:.405,y:.70,w:.075,h:.028,solid:true,blocksProjectiles:true,material:'metal',accent:'#f43f5e' },
  { id:'t6-check-b', kind:'checkpoint', x:.52,y:.47,w:.075,h:.028,solid:true,blocksProjectiles:true,material:'metal',accent:'#f43f5e' },
  { id:'t6-van', kind:'parked_car', x:.42,y:.59,w:.082,h:.040,solid:true,blocksProjectiles:true,material:'metal',accent:'#374151' },
  { id:'t6-sandbags-a', kind:'sandbags', x:.36,y:.38,w:.070,h:.026,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t6-sandbags-b', kind:'sandbags', x:.57,y:.38,w:.070,h:.026,solid:true,blocksProjectiles:true,material:'mixed' },
  { id:'t6-service', kind:'service_unit', x:.47,y:.28,w:.055,h:.040,solid:true,blocksProjectiles:true,occludes:true,material:'metal',accent:'#f43f5e',label:'COMMS' },
  { id:'t6-bollards', kind:'bollards', x:.455,y:.84,w:.090,h:.020,solid:true,blocksProjectiles:false,material:'metal',accent:'#f43f5e' }
];

const BY_TERRITORY: Record<number, PurposeProp[]> = { 1:T1, 2:T2, 3:T3, 4:T4, 5:T5, 6:T6 };

export const getTerritoryPurposeProps = (territoryId: number): readonly PurposeProp[] =>
  BY_TERRITORY[territoryId] ?? T1;
