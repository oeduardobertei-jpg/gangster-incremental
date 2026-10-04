import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const baseUrl=process.env.BASE_URL || 'http://127.0.0.1:3001';
const outDir='docs/screenshots/1.1m-t4-thirdcut'; mkdirSync(outDir,{recursive:true});
const s=await openTestSession({url:baseUrl,width:1536,height:864});
const shot=async name=>{const image=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`${outDir}/${name}.png`,Buffer.from(image.data,'base64'));};
const clickTitle=title=>s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title===${JSON.stringify(title)});b?.click();return !!b})()`);
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=4;g.runHighestTerritoryReached=4;g.stats.highestTerritoryReached=4;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 await sleep(2200); await clickTitle('Redefinir Zoom para 100%'); await sleep(350); await shot('t4-thirdcut-100');
 await clickTitle('Centralizar em visão tática ampla'); await sleep(350); await shot('t4-thirdcut-wide');
 await clickTitle('Redefinir Zoom para 100%'); for(let i=0;i<4;i++){await clickTitle('Aumentar Zoom (ou role a roda do mouse para cima)');await sleep(100);} await sleep(350); await shot('t4-thirdcut-close');
 const hud=await s.evaluate(`(()=>({perf:window.__GAME_PERF__,canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON(),text:document.querySelector('.battle-hud')?.textContent?.replace(/\\s+/g,' ').trim()}))()`);
 writeFileSync(`${outDir}/metrics.json`,JSON.stringify({hud,runtimeErrors:s.errors},null,2)); if(s.errors.length) throw new Error(s.errors.join(' | ')); console.log('1.1M T4 third cut captured');
}finally{await s.close();}
