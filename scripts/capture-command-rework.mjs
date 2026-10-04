import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/t1-command',{recursive:true});
try{
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  await sleep(2300);
  await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();return true})()`); await sleep(500);
  let shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true}); writeFileSync('docs/screenshots/t1-command/command-100.png',Buffer.from(shot.data,'base64'));
  await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='+');for(let i=0;i<11;i++)b?.click();return true})()`); await sleep(500);
  await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x:760,y:570,button:'left',clickCount:1});
  await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:760,y:365,button:'left',buttons:1});
  await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:760,y:365,button:'left',clickCount:1}); await sleep(600);
  shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true}); writeFileSync('docs/screenshots/t1-command/command-close.png',Buffer.from(shot.data,'base64'));
}finally{await s.close();}
