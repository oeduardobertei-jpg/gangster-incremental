import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/t1-cleanup-final',{recursive:true});
const shot=async name=>{const p=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`docs/screenshots/t1-cleanup-final/${name}.png`,Buffer.from(p.data,'base64'));};
const drag=async(x1,y1,x2,y2)=>{await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x:x1,y:y1,button:'left',clickCount:1});await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x2,y:y2,button:'left',buttons:1});await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x2,y:y2,button:'left',clickCount:1});await sleep(450);};
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`); await sleep(2300);
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='+');for(let i=0;i<5;i++)b?.click();return true})()`); await sleep(500);
 await drag(610,430,760,650); await shot('mirante-175');
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='+');for(let i=0;i<5;i++)b?.click();return true})()`); await sleep(450);
 await drag(610,430,930,270); await shot('beco-175');
}finally{await s.close();}
