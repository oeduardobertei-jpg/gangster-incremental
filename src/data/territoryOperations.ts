import type { TerritoryControlPoint } from '../types/game';

export interface TerritoryOperationStage {
  id: string;
  label: string;
  buildingIds: readonly string[];
}

export interface TerritoryOperationProfile {
  territoryId: number;
  codename: 'sweep' | 'interdiction' | 'rupture' | 'siege' | 'encirclement' | 'decapitation';
  title: string;
  stages: readonly TerritoryOperationStage[];
  reinforcementCapacityFloor: number;
}

const STAGE = (id:string,label:string,...buildingIds:string[]):TerritoryOperationStage => ({ id,label,buildingIds });

export const TERRITORY_OPERATIONS: Record<number,TerritoryOperationProfile> = {
  1: {
    territoryId:1, codename:'sweep', title:'Varredura', reinforcementCapacityFloor:.60,
    stages:[STAGE('t1-varredura','VARREDURA','laje_ponto','boca_leste','mirante')]
  },
  2: {
    territoryId:2, codename:'interdiction', title:'Interdição', reinforcementCapacityFloor:.45,
    stages:[STAGE('t2-ferrovia','EIXO FERROVIÁRIO','laje_ponto','boca_leste','torre_guarda','mirante')]
  },
  3: {
    territoryId:3, codename:'rupture', title:'Ruptura', reinforcementCapacityFloor:.30,
    stages:[STAGE('t3-producao','CAPACIDADE INDUSTRIAL','laje_ponto','barraquinha','esconderijo','boca_leste','torre_guarda','mirante')]
  },
  4: {
    territoryId:4, codename:'siege', title:'Cerco', reinforcementCapacityFloor:.42,
    stages:[
      STAGE('t4-base','BASE DO MORRO','esconderijo'),
      STAGE('t4-miolo','POSIÇÕES INTERMEDIÁRIAS','laje_ponto','boca_leste'),
      STAGE('t4-alto','ALTO DO MORRO','barraquinha','torre_guarda','mirante')
    ]
  },
  5: {
    territoryId:5, codename:'encirclement', title:'Encurralamento', reinforcementCapacityFloor:.38,
    stages:[
      STAGE('t5-portarias','PORTARIAS E SEGURANÇA','barraquinha','boca_leste','torre_guarda'),
      STAGE('t5-interior','INTERIOR EXPOSTO','laje_ponto','esconderijo','mirante')
    ]
  },
  6: {
    territoryId:6, codename:'decapitation', title:'Decapitação', reinforcementCapacityFloor:.35,
    stages:[
      STAGE('t6-seguranca','SEGURANÇA EXTERNA','barraquinha','torre_guarda'),
      STAGE('t6-comando','INFRAESTRUTURA DE COMANDO','laje_ponto','esconderijo','boca_leste'),
      STAGE('t6-qg','NÚCLEO DO QG','mirante')
    ]
  }
};

export const getTerritoryOperationProfile = (territoryId:number):TerritoryOperationProfile =>
  TERRITORY_OPERATIONS[territoryId] ?? TERRITORY_OPERATIONS[1];

export const getOperationBuildingIds = (profile:TerritoryOperationProfile):readonly string[] =>
  profile.stages.flatMap(stage => [...stage.buildingIds]);

export const getOperationStageIndexForBuilding = (profile:TerritoryOperationProfile, buildingId:string):number =>
  profile.stages.findIndex(stage => stage.buildingIds.includes(buildingId));

export const getActiveOperationStageIndex = (
  profile:TerritoryOperationProfile,
  points:readonly TerritoryControlPoint[]
):number => {
  for(let i=0;i<profile.stages.length;i++){
    const stage=profile.stages[i];
    const complete=stage.buildingIds.every(id => points.some(point => point.buildingId===id && point.status==='captured'));
    if(!complete) return i;
  }
  return Math.max(0,profile.stages.length-1);
};

export const isOperationPointUnlocked = (
  profile:TerritoryOperationProfile,
  points:readonly TerritoryControlPoint[],
  buildingId:string
):boolean => {
  const pointStage=getOperationStageIndexForBuilding(profile,buildingId);
  if(pointStage<0) return false;
  return pointStage<=getActiveOperationStageIndex(profile,points);
};
