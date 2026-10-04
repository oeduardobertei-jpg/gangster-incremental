import { readFileSync, writeFileSync } from 'node:fs';
import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
let passed=0,failed=0;const results=[];
const check=(ok,label,detail='')=>{results.push({ok,label,detail});console.log(`${ok?'PASS':'FAIL'} | ${label}${detail?` | ${detail}`:''}`);ok?passed++:failed++;};
const median=xs=>[...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)];
const ground=readFileSync('src/components/canvas/t6CentralGroundReauthorRenderer.ts','utf8');
const env=readFileSync('src/components/canvas/environmentRenderer.ts','utf8');
const context=readFileSync('src/components/canvas/contextArchitectureFinishRenderer.ts','utf8');
const landmark=readFileSync('src/components/canvas/t6LandmarkRenderer.ts','utf8');
check(ground.includes('drawPortalLanguage')&&ground.includes("[.41,.67]"),'T6 portal visuals retain validated portal levels');
check(ground.includes('drawCheckpointHierarchy')&&ground.includes("y:.78")&&ground.includes("y:.54")&&ground.includes("y:.31"),'T6 checkpoint hierarchy retains validated rows');
check(ground.includes('drawSectorIdentity')&&ground.includes('drawFunctionalCourts'),'T6 command sectors and operational courts authored');
check(ground.includes('drawCommandApron'),'T6 command apron authored without collider mutation');
check(env.includes('drawT6ReauthoredSurface'),'T6 environment uses dedicated command surface');
check(landmark.includes("n.includes('qg central')")&&landmark.includes("n.includes('torre de seguranca')"),'T6 QG and security tower have distinct finishes');
check(landmark.includes("n.includes('centro operacional')")&&landmark.includes("n.includes('alojamento central')"),'T6 operations and lodging landmarks vary');
check(context.includes("n.includes('operacoes')")&&context.includes("n.includes('comunicacoes')"),'T6 contextual modules vary by function');
const s=await openTestSession({url:process.env.BASE_URL||'http://127.0.0.1:3001',width:1536,height:864});
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=6;g.runHighestTerritoryReached=6;g.stats.highestTerritoryReached=6;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 await sleep(2200);let state=await s.evaluate(`(()=>({text:document.querySelector('.battle-hud')?.textContent||'',perf:window.__GAME_PERF__}))()`);
 check(/Complexo Central|Quartel-General/.test(state.text),'T6 HUD identity preserved',state.text.replace(/\s+/g,' ').slice(0,105));
 check((state.perf?.solidWorldViolations??0)===0,'paused T6 physically clean',`violations=${state.perf?.solidWorldViolations??0}`);
 await installFixture(s,{territory:6,allies:42,rivals:28,speed:1});await sleep(2400);
 const perfSamples=[];for(let sample=0;sample<3;sample++){await sleep(700);perfSamples.push(await s.evaluate(`(()=>({perf:window.__GAME_PERF__}))()`));}
 state=perfSamples[perfSamples.length-1];
 const fpsSamples=perfSamples.map(x=>x.perf?.fps??0), renderSamples=perfSamples.map(x=>x.perf?.avgRenderMs??99), simSamples=perfSamples.map(x=>x.perf?.avgSimulationMs??99);
 const stableFps=median(fpsSamples), stableRender=median(renderSamples), stableSim=median(simSamples);
 const performanceOk=stableFps>=35||(stableFps>=30&&stableRender<=6.5&&stableSim<=3.0);
 check((state.perf?.allies??0)>0&&(state.perf?.rivals??0)>0,'T6 mass fixture active',`allies=${state.perf?.allies}; rivals=${state.perf?.rivals}`);
 check((state.perf?.bullets??0)+(state.perf?.particles??0)>0,'T6 combat presentation active',`bullets=${state.perf?.bullets}; particles=${state.perf?.particles}`);
 check((state.perf?.solidWorldViolations??99)===0,'T6 mass combat remains physically clean',`violations=${state.perf?.solidWorldViolations}`);
 check(performanceOk,'T6 heavy fixture keeps performance budget',`fps=${stableFps.toFixed(1)}; render=${stableRender.toFixed(2)}ms; sim=${stableSim.toFixed(2)}ms; samples=${fpsSamples.map(v=>v.toFixed(1)).join('/')}`);
 check(s.errors.length===0,'T6 runtime has no browser errors',JSON.stringify(s.errors));
}finally{await s.close();}
writeFileSync('docs/acceptance-110o-t6-polish.json',JSON.stringify({passed,failed,results},null,2));
console.log(`T6_POLISH_11O ${passed}/${passed+failed} PASS`);if(failed)process.exitCode=1;
