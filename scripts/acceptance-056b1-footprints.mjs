import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const session=await openTestSession({url:'http://localhost:3001',width:1440,height:900});
const {evaluate,send}=session,results=[],hashes=new Set();
const hash=b=>createHash('sha256').update(b).digest('hex');
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
mkdirSync('docs/screenshots/0.5.6b1',{recursive:true});
try{
 for(let t=1;t<=6;t++){
  await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=${t};s.runHighestTerritoryReached=${t};s.gameSpeed=0;s.soundMuted=true;s.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true})()`);
  await sleep(1150);await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);await sleep(180);
  const perf=await evaluate('window.__GAME_PERF__');check(`T${t} physics`,(perf?.solidWorldViolations??99)===0,`violations=${perf?.solidWorldViolations}; colliders=${perf?.worldColliders}`);
  const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
  const shot=Buffer.from((await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}})).data,'base64');
  writeFileSync(`docs/screenshots/0.5.6b1/territory-${t}.png`,shot);const h=hash(shot);hashes.add(h);
  const old=hash(readFileSync(`docs/screenshots/0.5.6/territory-${t}.png`));check(`T${t} legacy footprint cleanup changed frame`,h!==old,'0.5.6b1 differs from 0.5.6');
 }
 check('six distinct clean-footprint territories',hashes.size===6,`images=${hashes.size}`);check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
 const fail=results.filter(r=>!r.passed);writeFileSync('docs/acceptance-056b-architecture.json',JSON.stringify(results,null,2));console.log(`ACCEPTANCE_056B passed=${results.length-fail.length} failed=${fail.length}`);if(fail.length)process.exitCode=1;
}finally{await session.close();}
