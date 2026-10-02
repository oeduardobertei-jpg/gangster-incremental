import { FACTION_CONFIGS } from '../src/data/gameData';
import { getTacticalBuildings } from '../src/components/canvas/favelaRenderer';
import { getTerritoryPurposeProps } from '../src/data/territoryPurposeProps';
const W=1280,H=720;
for(const t of [1,2,3,4]){
 console.log('\nT'+t);
 for(const b of getTacticalBuildings(W,H,FACTION_CONFIGS.vermelha,t)) console.log('hero',b.id,b.label,Math.round(b.x),Math.round(b.y),b.w,b.h);
 for(const p of getTerritoryPurposeProps(t)) console.log('prop',p.id,p.kind,Math.round(p.x*W),Math.round(p.y*H),Math.round(p.w*W),Math.round(p.h*H));
}
