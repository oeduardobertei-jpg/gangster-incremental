import { writeFileSync } from 'node:fs';
import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
const baseUrl=process.env.BASE_URL||'http://127.0.0.1:3001';
const results=[];const browserErrors=[];let passed=0,failed=0;
const check=(ok,label,detail='')=>{results.push({ok:!!ok,label,detail});console.log(`${ok?'PASS':'FAIL'} | ${label}${detail?` | ${detail}`:''}`);ok?passed++:failed++;};
const names={1:'Beco dos Descal\u00e7os',2:'Pra\u00e7a da Feira',3:'Avenida das Oficinas',4:'Morro Alto',5:'Mans\u00f5es da Orla',6:'Complexo Central'};
const median=xs=>[...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)];

for(let territory=1;territory<=6;territory++){
 const s=await openTestSession({url:baseUrl,width:1536,height:864});
 try{
  const allies=territory<=2?26:territory<=4?32:38;
  const rivals=territory<=2?18:territory<=4?22:28;
  await installFixture(s,{territory,allies,rivals,speed:1});
  await sleep(2400);
  const samples=[];
  for(let sample=0;sample<3;sample++){
    await sleep(700);
    samples.push(await s.evaluate(`(()=>({perf:window.__GAME_PERF__??null,hud:document.querySelector('.battle-hud')?.textContent?.replace(/\\s+/g,' ').trim()??'',body:document.body.innerText}))()`));
  }
  const state=samples[samples.length-1];
  const p=state.perf||{};
  const fpsSamples=samples.map(x=>x.perf?.fps??0);
  const stableFps=median(fpsSamples);
  const stableRender=median(samples.map(x=>x.perf?.avgRenderMs??99));
  const stableSim=median(samples.map(x=>x.perf?.avgSimulationMs??99));
  const performanceOk=stableFps>=35||(stableFps>=25&&stableRender<=8.0&&stableSim<=3.0);
  const broken=['\\u00c3\\u0192','\\u00e2\\u20ac','\\u00c2\\u00b7','\\ufffd'].some(token=>state.body.includes(token));
  check(state.hud.includes(names[territory]),`T${territory} identity visible`,state.hud.slice(0,95));
  check((p.allies??0)>0&&(p.rivals??0)>0,`T${territory} faction mass active`,`allies=${p.allies}; rivals=${p.rivals}`);
  check((p.bullets??0)+(p.particles??0)>0,`T${territory} combat presentation active`,`bullets=${p.bullets}; particles=${p.particles}`);
  check((p.solidWorldViolations??99)===0,`T${territory} physical integrity`,`violations=${p.solidWorldViolations}`);
  check(performanceOk,`T${territory} performance budget`,`fps=${stableFps.toFixed(1)}; render=${stableRender.toFixed(2)}ms; sim=${stableSim.toFixed(2)}ms; samples=${fpsSamples.map(v=>v.toFixed(1)).join('/')}`);
  check(!broken,`T${territory} no visible mojibake`);
 }finally{browserErrors.push(...s.errors);await s.close();}
}
check(browserErrors.length===0,'campaign battle audit has no browser runtime errors',JSON.stringify(browserErrors));
writeFileSync('docs/acceptance-110p-campaign-polish.json',JSON.stringify({passed,failed,results},null,2));
console.log(`CAMPAIGN_POLISH_11P ${passed}/${passed+failed} PASS`);if(failed)process.exitCode=1;
