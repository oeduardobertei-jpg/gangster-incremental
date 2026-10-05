import { mkdirSync, writeFileSync } from 'node:fs';
import { openTestSession, sleep } from './cdp-session.mjs';
const outDir='docs/screenshots/1.2-t1-rebuild';mkdirSync(outDir,{recursive:true});
const session=await openTestSession({url:'http://127.0.0.1:3000',width:1440,height:900});
const {send,evaluate}=session;
try{
  await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.playerFaction='vermelha';s.currentTerritoryId=1;s.gameSpeed=0;s.soundMuted=true;s.upgrades={};s.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;})()`);
  await sleep(1200);
  await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title==='Recolher painel de evolução');if(b)b.click();return true;})()`);
  await sleep(300);
  const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.getBoundingClientRect();return{x:r.left,y:r.top,width:r.width,height:r.height}})()`);
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,clip:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,scale:1}});
  writeFileSync(`${outDir}/rebuild-d.png`,Buffer.from(shot.data,'base64'));
  console.log(`rebuild-d captured ${rect.width}x${rect.height} errors=${session.errors.length}`);
}finally{await session.close();}
