import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/t1-096-ground',{recursive:true});
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);await sleep(2200);
 await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title?.includes('Aumentar Zoom'));if(b){b.click();b.click();b.click();}return true})()`);await sleep(900);
 const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync('docs/screenshots/t1-096-ground/t1-096-ground-close.png',Buffer.from(shot.data,'base64'));
}finally{await s.close();}
