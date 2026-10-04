import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
import { readFileSync, writeFileSync } from 'node:fs';

let passed=0, failed=0;
const results=[];
const check=(ok,label,detail='')=>{results.push({ok,label,detail}); console.log(`${ok?'PASS':'FAIL'} | ${label}${detail?` | ${detail}`:''}`); ok?passed++:failed++;};
const game=readFileSync('src/components/GameCanvas.tsx','utf8');
const sprites=readFileSync('src/components/canvas/soldier34.ts','utf8');
check(game.includes("battleEntityCount >= 60 && camera.zoom <= 1.15 ? 'low' : 'full'"),'mass LOD requires dense battle and non-close zoom');
check(sprites.includes("p.type === 'soldado_base' || p.type === 'soldado_pistola' || p.type === 'olheiro'"),'low LOD restricted to common infantry');
check(!/commonLowDetail[\s\S]{0,180}chefe_morro/.test(sprites),'boss excluded from low-detail condition');
check(game.includes('avgSceneRenderMs')&&game.includes('avgEntityRenderMs')&&game.includes('avgEffectsRenderMs'),'DEV render phase telemetry present');

const runtime=[];
for(const territory of [5,6]){
  const s=await openTestSession({url:'http://127.0.0.1:3001',width:1536,height:864});
  try{
    await installFixture(s,{territory,allies:48,rivals:20,speed:0});
    await sleep(2800);
    const perf=await s.evaluate('window.__GAME_PERF__');
    const entities=(perf?.allies||0)+(perf?.rivals||0);
    check(entities===68,`T${territory} fixed mass fixture`,`entities=${entities}`);
    check((perf?.fps||0)>=55,`T${territory} paused mass FPS`,`fps=${perf?.fps?.toFixed?.(1)}`);
    check((perf?.avgRenderMs||99)<=5.5,`T${territory} render budget`,`render=${perf?.avgRenderMs?.toFixed?.(2)}ms`);
    check((perf?.avgEntityRenderMs||99)<=4.2,`T${territory} entity render budget`,`entities=${perf?.avgEntityRenderMs?.toFixed?.(2)}ms`);
    check((perf?.p95FrameMs||99)<=34,`T${territory} frame p95 budget`,`p95=${perf?.p95FrameMs?.toFixed?.(1)}ms`);
    check(s.errors.length===0,`T${territory} no runtime errors`,JSON.stringify(s.errors));
    runtime.push({territory,perf,errors:s.errors});
  } finally { await s.close(); }
}
writeFileSync('docs/acceptance-110j-performance.json',JSON.stringify({passed,failed,results,runtime},null,2));
console.log(`PERFORMANCE_11J ${passed}/${passed+failed} PASS`);
if(failed) process.exitCode=1;
