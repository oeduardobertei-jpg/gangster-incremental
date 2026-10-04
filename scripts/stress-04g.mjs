import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
import { writeFileSync } from 'node:fs';
const session = await openTestSession();
const { evaluate, send } = session;
const results=[];
const measure = () => evaluate(`new Promise(resolve=>{
  const started=performance.now(), intervals=[], samples=[]; let previous=started,lastSample=-1;
  const tick=now=>{
    intervals.push(now-previous);previous=now;
    const p=window.__GAME_PERF__;if(p&&p.sampledAt!==lastSample){samples.push(p);lastSample=p.sampledAt;}
    if(now-started<6000){requestAnimationFrame(tick);return;}
    intervals.sort((a,b)=>a-b);
    resolve({fps:intervals.length*1000/(now-started),p95FrameMs:intervals[Math.floor(intervals.length*.95)],samples});
  };requestAnimationFrame(tick);
})`);
const record=(name,result,config)=>{
  const live=result.samples;
  const summary={name,fps:result.fps,p95FrameMs:result.p95FrameMs,
    minAllies:Math.min(...live.map(s=>s.allies)),minRivals:Math.min(...live.map(s=>s.rivals)),
    maxBullets:Math.max(...live.map(s=>s.bullets)),maxParticles:Math.max(...live.map(s=>s.particles)),
    maxLoot:Math.max(...live.map(s=>s.loot)),avgSimulationMs:live.reduce((n,s)=>n+s.avgSimulationMs,0)/live.length,
    avgRenderMs:live.reduce((n,s)=>n+s.avgRenderMs,0)/live.length,
    avgUnstuckTriggers:live.reduce((n,s)=>n+(s.unstuckTriggers??0),0)/live.length,maxStuckPressure:Math.max(...live.map(s=>s.stuckPressure??0)),
    maxWorldViolations:Math.max(...live.map(s=>s.solidWorldViolations??0)),minWorldColliders:Math.min(...live.map(s=>s.worldColliders??0)),
    passed:result.fps>=30&&live.length>=3&&live.every(s=>s.allies>=config.allies&&s.rivals>=config.rivals&&(s.solidWorldViolations??0)===0)};
  results.push({...summary,samples:live});console.log(JSON.stringify(summary));
};
try {
  for(const config of [{name:'A',allies:15,rivals:12,speed:1,territory:1},
    {name:'B',allies:60,rivals:24,speed:2,territory:4},
    {name:'C',allies:135,rivals:32,speed:5,territory:6,loot:60}]) {
    await installFixture(session,config);await sleep(2400);
    record(config.name,await measure(),config);
    if(config.name==='C'){
      const rect=await evaluate("(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()");
      const during=measure();
      for(let i=0;i<100;i++){
        const x=rect.x+rect.w*.35+(i%8)*20,y=rect.y+rect.h*.6;
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
        if(i%20===0)await send('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:0,deltaY:i%40===0?-80:80});
        if(i%25===0){
          await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
          await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+30,y:y+15,buttons:1});
          await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+30,y:y+15,button:'left',clickCount:1});
        }await sleep(40);
      }record('C mouse + pan + zoom',await during,config);
    }
  }
  console.log('STRESS_04G '+(results.every(r=>r.passed)&&session.errors.length===0?'PASS':'FAIL'));
  writeFileSync('docs/acceptance-04g-performance.json',JSON.stringify({viewport:'1440x900 DPR1',build:'development',
    note:'Synthetic sustained combat: high enemy HP and low enemy damage maintain population. Audio muted.',
    minimumFps:30,errors:session.errors,results},null,2));
  if(results.some(r=>!r.passed)||session.errors.length)process.exitCode=1;
} finally {await session.close();}
