import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
import { writeFileSync } from 'node:fs';
const session=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
const waitPerf=async()=>{for(let i=0;i<24;i++){const p=await session.evaluate('window.__GAME_PERF__');if(p)return p;await sleep(200);}return null;};
try {
  for (const territory of [1,3,6]) {
    await installFixture(session,{territory,allies:24,rivals:16,speed:1});
    await session.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    const ready=await waitPerf(); check(`T${territory} perf ready`,!!ready,ready?'ready':'timeout');
    await sleep(1600); const perf=await session.evaluate('window.__GAME_PERF__');
    check(`T${territory} combat active`,(perf?.bullets??0)>0 || (perf?.particles??0)>0,`bullets=${perf?.bullets}; particles=${perf?.particles}`);
    check(`T${territory} combat physics`,(perf?.solidWorldViolations??99)===0,`violations=${perf?.solidWorldViolations}; fps=${perf?.fps?.toFixed?.(1)}`);
  }
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.passed);
  writeFileSync('docs/acceptance-056c-combat.json',JSON.stringify(results,null,2));
  console.log(`ACCEPTANCE_056C passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length) process.exitCode=1;
} finally { await session.close(); }
