import { openTestSession, sleep } from './cdp-session.mjs';
const s=await openTestSession({url:'http://127.0.0.1:3001',width:1536,height:864});
const {evaluate,errors}=s;
try{
 await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=4;g.runHighestTerritoryReached=4;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 await sleep(2500);
 console.log('errors',JSON.stringify(errors,null,2));
 console.log('canvas',await evaluate(`(()=>{const c=document.querySelector('canvas');return c?{w:c.width,h:c.height,rect:c.getBoundingClientRect().toJSON()}:null})()`));
}finally{await s.close();}
