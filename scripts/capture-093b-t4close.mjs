import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3001',width:1536,height:864});
mkdirSync('docs/screenshots/0.9.3b',{recursive:true});
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=4;g.runHighestTerritoryReached=4;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);await sleep(2400);
 for(let i=0;i<9;i++){await s.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:300,y:220,deltaX:0,deltaY:-130});await sleep(90);}await sleep(300);
 const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync('docs/screenshots/0.9.3b/t4-context-250.png',Buffer.from(shot.data,'base64'));
}finally{await s.close();}
