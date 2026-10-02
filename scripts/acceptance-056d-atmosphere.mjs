import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const session = await openTestSession({ url:'http://localhost:3000', width:1440, height:900 });
const { evaluate, send } = session;
const results = [], hashes = new Set();
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const check = (name, ok, detail='') => {
  results.push({ name, passed:Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};
mkdirSync('docs/screenshots/0.5.6d', { recursive:true });
try {
  for (let territory=1; territory<=6; territory++) {
    await evaluate(`(async()=>{
      const {createDefaultState}=await import('/src/state/defaultGameState.ts');
      const s=createDefaultState(); s.currentTerritoryId=${territory};
      s.runHighestTerritoryReached=${territory}; s.gameSpeed=0; s.soundMuted=true;
      s.battleSnapshot=undefined;
      localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));
      location.reload(); return true;
    })()`);
    await sleep(1200);
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    await sleep(220);
    const perf=await evaluate('window.__GAME_PERF__');
    check(`T${territory} atmosphere physics`,(perf?.solidWorldViolations??99)===0,`violations=${perf?.solidWorldViolations}; fps=${perf?.fps?.toFixed?.(1)}`);
    const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const shot=Buffer.from((await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}})).data,'base64');
    const output=`docs/screenshots/0.5.6d/territory-${territory}.png`;
    writeFileSync(output,shot); const currentHash=hash(shot); hashes.add(currentHash);
    const baseline=`docs/screenshots/0.5.6b1/territory-${territory}.png`;
    const changed=existsSync(baseline) ? currentHash!==hash(readFileSync(baseline)) : true;
    check(`T${territory} atmosphere changed frame`,changed,existsSync(baseline)?'differs from 0.5.6b1':'baseline unavailable');
  }
  check('six distinct atmosphere territories',hashes.size===6,`images=${hashes.size}`);
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.passed);
  writeFileSync('docs/acceptance-056d-atmosphere.json',JSON.stringify(results,null,2));
  console.log(`ACCEPTANCE_056D passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length) process.exitCode=1;
} finally { await session.close(); }
