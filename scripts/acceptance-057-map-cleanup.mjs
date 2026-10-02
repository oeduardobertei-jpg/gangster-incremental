import { openTestSession, sleep } from './cdp-session.mjs';
import { existsSync, writeFileSync } from 'node:fs';

const session=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const {evaluate}=session,results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:Boolean(ok),detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
try{
  for(let territory=1;territory<=6;territory++){
    await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.gameSpeed=0;s.soundMuted=true;s.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true})()`);
    let perf=null;
    for(let wait=0;wait<30;wait++){
      perf=await evaluate(`window.__GAME_PERF__??null`);
      if(perf?.worldColliders>0) break;
      await sleep(150);
    }
    check(`T${territory} cleaned map keeps units outside solids`,(perf?.solidWorldViolations??99)===0,`violations=${perf?.solidWorldViolations}; rivals=${perf?.rivals}`);
    check(`T${territory} cleanup reference exists`,existsSync(`docs/screenshots/0.5.7-cleanup/territory-${territory}.png`),`territory-${territory}.png`);
  }
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.passed);
  writeFileSync('docs/acceptance-057-map-cleanup.json',JSON.stringify(results,null,2));
  console.log(`ACCEPTANCE_057_MAP passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length)process.exitCode=1;
} finally { await session.close(); }
