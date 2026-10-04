import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/t2-098',{recursive:true});
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=2;g.runHighestTerritoryReached=2;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`); await sleep(2400);
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();return true})()`); await sleep(500);
 let shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true}); writeFileSync('docs/screenshots/t2-098/t2-098a-100.png',Buffer.from(shot.data,'base64'));
 await s.evaluate(`(()=>{const btn=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='+');for(let i=0;i<15;i++)btn?.click();return true})()`); await sleep(700);
 shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true}); writeFileSync('docs/screenshots/t2-098/t2-098a-250.png',Buffer.from(shot.data,'base64'));
}finally{await s.close();}
