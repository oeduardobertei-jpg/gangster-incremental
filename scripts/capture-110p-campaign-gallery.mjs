import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const baseUrl=process.env.BASE_URL || 'http://127.0.0.1:3001';
const outDir='docs/screenshots/1.1p-campaign-gallery';mkdirSync(outDir,{recursive:true});
const s=await openTestSession({url:baseUrl,width:1536,height:864});
const metrics=[];
const shot=async name=>{const im=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`${outDir}/${name}.png`,Buffer.from(im.data,'base64'));};
const resetZoom=()=>s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title?.includes('Redefinir Zoom'));b?.click();return !!b})()`);
try{
 for(let territory=1;territory<=6;territory++){
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=${territory};g.runHighestTerritoryReached=${territory};g.stats.highestTerritoryReached=${territory};g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  await sleep(1850);await resetZoom();await sleep(250);await shot(`t${territory}-final-100`);
  const m=await s.evaluate(`(()=>({territory:${territory},perf:window.__GAME_PERF__??null,text:document.querySelector('.battle-hud')?.textContent?.replace(/\\s+/g,' ').trim()??'',canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON()??null,body:document.body.innerText}))()`);
  metrics.push({...m,mojibake:['\u00c3\u0192','\u00e2\u20ac','\u00c2\u00b7','\ufffd'].some(token=>m.body.includes(token))});
 }
 writeFileSync(`${outDir}/metrics.json`,JSON.stringify({metrics,runtimeErrors:s.errors},null,2));
 for(const m of metrics) console.log(`T${m.territory} fps=${m.perf?.fps?.toFixed?.(1)} render=${m.perf?.avgRenderMs?.toFixed?.(2)} viol=${m.perf?.solidWorldViolations} mojibake=${m.mojibake}`);
 if(s.errors.length) throw new Error(s.errors.join(' | '));
}finally{await s.close();}
