import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/t1-cleanup-final',{recursive:true});
const drag=async(dx,dy)=>{await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x:520,y:360,button:'left',clickCount:1});await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:520+dx,y:360+dy,button:'left',buttons:1});await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:520+dx,y:360+dy,button:'left',clickCount:1});await sleep(300);};
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);await sleep(2200);
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='+');for(let i=0;i<10;i++)b?.click();return true})()`);await sleep(400);
 await drag(150,280); await drag(150,280);
 const p=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync('docs/screenshots/t1-cleanup-final/mirante-close.png',Buffer.from(p.data,'base64'));
}finally{await s.close();}
