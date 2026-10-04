import { FACTION_CONFIGS } from '../src/data/gameData';
import { getTacticalBuildings, createDefaultObstacles } from '../src/components/canvas/favelaRenderer';
import { getUnifiedSupportSolids } from '../src/components/canvas/unifiedTerritoryComposer';
import { getTerritoryPurposeProps } from '../src/data/territoryPurposeProps';

const W=1280,H=720;
type R={id:string,x:number,y:number,w:number,h:number,group:string};
const hit=(a:R,b:R,pad=0)=>a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;
const fac=FACTION_CONFIGS.vermelha;
for(let t=1;t<=6;t++){
 const buildings=getTacticalBuildings(W,H,fac,t);
 const hero:R[]=buildings.map(b=>({id:b.id,x:b.x-10,y:b.y-36,w:b.w+20,h:b.h+46,group:'hero'}));
 const support:R[]=getUnifiedSupportSolids(t,buildings,W,H).map(p=>({id:p.id,x:p.x-4,y:p.y-30,w:p.w+8,h:p.h+34,group:'support'}));
 const props:R[]=getTerritoryPurposeProps(t).map(p=>({id:p.id,x:p.x*W-4,y:p.y*H-4,w:p.w*W+8,h:p.h*H+8,group:'prop'}));
 const obs:R[]=createDefaultObstacles(W,H,t).map(o=>({id:o.id,x:o.x-o.w/2-4,y:o.y-o.h/2-4,w:o.w+8,h:o.h+8,group:'obstacle'}));
 const all=[...hero,...support,...props,...obs];
 const bad:string[]=[];
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
   const a=all[i],b=all[j]; if(a.group===b.group&&a.group==='hero')continue;
   if(hit(a,b,2))bad.push(`${a.group}:${a.id} <> ${b.group}:${b.id}`);
 }
 console.log(`T${t}: ${bad.length} overlaps`); for(const x of bad)console.log('  '+x);
}

