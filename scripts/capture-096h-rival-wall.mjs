import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/t1-096h-control',{recursive:true});
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`); await sleep(2500);
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();return true})()`); await sleep(600);
 const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{x:20,y:245,width:390,height:210,scale:2}}); writeFileSync('docs/screenshots/t1-096h-control/t1-rival-wall-close.png',Buffer.from(shot.data,'base64'));
}finally{await s.close();}



