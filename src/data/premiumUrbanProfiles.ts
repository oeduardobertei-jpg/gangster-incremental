export type PremiumLightPool=readonly [x:number,y:number,radius:number,alpha:number];
export type PremiumScalePoint=readonly [x:number,y:number,scale:number];
export type PremiumBench=readonly [x:number,y:number,rotation:number];

export interface PremiumUrbanProfile{
  road:{
    shoulderColor:string;
    shoulderExtra:number;
    roadBedColor:string;
    roadBedExtra:number;
  };
  lights:readonly PremiumLightPool[];
  vegetation:readonly PremiumScalePoint[];
  planters:readonly PremiumScalePoint[];
  benches:readonly PremiumBench[];
  ambientWash:string;
}

const T1:PremiumUrbanProfile={
  road:{shoulderColor:'rgba(171,157,132,.20)',shoulderExtra:42,roadBedColor:'rgba(67,63,57,.62)',roadBedExtra:26},
  lights:[
    [.135,.155,126,.18],[.10,.47,106,.12],[.10,.80,108,.12],[.445,.10,110,.14],
    [.805,.42,118,.15],[.845,.76,108,.12],[.77,.13,98,.10],[.64,.15,112,.14]
  ],  vegetation:[
    [.055,.16,1.20],[.11,.43,1.05],[.09,.83,1.18],[.29,.17,.82],
    [.945,.17,1.15],[.91,.43,1.05],[.92,.82,1.22],[.71,.17,.82]
  ],  planters:[
    [.39,.29,1.00],[.61,.30,1.05],[.39,.59,.95],
    [.62,.60,1.05],[.31,.78,.92],[.70,.78,.95]
  ],
  benches:[
    [.365,.44,-.08],[.635,.47,.06],[.34,.73,.05],[.68,.72,-.06]
  ],
  ambientWash:'rgba(96,64,30,.050)'
};

const PROFILES:Partial<Record<number,PremiumUrbanProfile>>={1:T1};

export const getPremiumUrbanProfile=(territoryId:number)=>PROFILES[territoryId];
