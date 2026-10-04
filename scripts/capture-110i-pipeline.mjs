import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const out='docs/screenshots/1.1i-pipeline'; mkdirSync(out,{recursive:true});
const s=await openTestSession({url:'http://127.0.0.1:3001',width:1536,height:864});
try{
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  await sleep(1800);
  const focus=await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Foco');if(b)b.click();return !!b})()`);
  await sleep(400);
  const reset=await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%');b?.click();return !!b})()`);
  await sleep(350);
  const rect=await s.evaluate(`(()=>document.querySelector('canvas')?.getBoundingClientRect().toJSON())()`);
  const image=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,scale:1}});
  writeFileSync(`${out}/t1-after-pipeline.png`,Buffer.from(image.data,'base64'));
  const hud=await s.evaluate(`(()=>({focus:${JSON.stringify(focus)},reset:${JSON.stringify(reset)},canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON(),errors:window.__RUNTIME_ERRORS__||[]}))()`);
  writeFileSync(`${out}/metrics.json`,JSON.stringify(hud,null,2));
  if(s.errors.length) throw new Error(s.errors.join(' | '));
  console.log('1.1I T1 pipeline capture complete');
}finally{await s.close();}
