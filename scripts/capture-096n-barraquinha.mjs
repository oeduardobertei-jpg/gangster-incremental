import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:960});
mkdirSync('docs/screenshots/t1-096n',{recursive:true});
try{
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.territoryTakes=999;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  await sleep(2400);
  await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();const b=[...document.querySelectorAll('button')].find(x=>x.title?.includes('Aumentar Zoom'));if(b)for(let i=0;i<17;i++)b.click();return true})()`);
  await sleep(700);
  const r=await s.evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
  const x=r.x+r.width*.5,y=r.y+r.height*.5;
  for(let i=0;i<6;i++){
    await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
    await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+300,y:y+230,button:'left',buttons:1});
    await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+300,y:y+230,button:'left',clickCount:1});
  }
  await sleep(700);
  const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});
  writeFileSync('docs/screenshots/t1-096n/barraquinha-cleanup.png',Buffer.from(shot.data,'base64'));
}finally{await s.close();}
