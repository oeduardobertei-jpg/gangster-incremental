import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3013',width:1536,height:864});
mkdirSync('docs/screenshots/t1-redesign',{recursive:true});
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`); await sleep(2500);
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();return true})()`); await sleep(300);
 for(let i=0;i<8;i++){await s.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:270,y:670,deltaX:0,deltaY:-125});await sleep(100);} await sleep(500);
 const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true}); writeFileSync('docs/screenshots/t1-redesign/t1-redesign-pass1.png',Buffer.from(shot.data,'base64'));
}finally{await s.close();}
