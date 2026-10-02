import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync } from 'node:fs';

const session = await openTestSession({url:'http://localhost:3000'});
const { evaluate } = session;
const results = [];
const check = (name, ok, detail='') => {
  results.push({ name, passed:Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};

try {
  await evaluate(`(async()=>{
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const s=createDefaultState(); s.currentTerritoryId=5; s.runHighestTerritoryReached=5;
    s.gameSpeed=5; s.soundMuted=true; s.maxAllies=80; s.intel=900; s.maxIntel=900;
    s.upgrades={ armory_bulletproof_vest:50, boca_fortified_bunkers:22 };
    const allies=Array.from({length:40},(_,i)=>({id:'jam-a-'+i,type:i%7===0?'soldado_fuzil':'soldado_base',name:'Recruta',
      x:116+(i%3)*8,y:62+(i%14)*43,vx:0,vy:0,hp:850,maxHp:850,speed:1.2,damage:8,attackRange:210,
      attackCooldown:.7,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:i%3}));
    const rivals=Array.from({length:14},(_,i)=>({id:'jam-r-'+i,type:'soldado_pistola',name:'Rival',
      x:760+(i%5)*70,y:120+Math.floor(i/5)*160,vx:0,vy:0,hp:99999,maxHp:99999,speed:.8,damage:.01,
      attackRange:150,attackCooldown:1,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,
      factionTag:'PCC',variant:i%3,patrolTargetX:680,patrolTargetY:360,patrolWaitTimer:0}));
    s.battleSnapshot={version:1,runId:s.runId,territoryId:5,faction:s.playerFaction,capturedAt:Date.now(),
      allies,rivals,fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s)); location.reload(); return true;
  })()`);
  await sleep(1500);
  const first=await evaluate(`window.__GAME_PERF__`);
  check('T5 jam fixture starts solid', first?.solidWorldViolations===0, JSON.stringify(first));  const samples=[];
  for(let i=0;i<7;i++){
    await sleep(1000);
    samples.push(await evaluate(`window.__GAME_PERF__`));
  }
  const last=samples.at(-1);
  const totalUnstuck=samples.reduce((n,s)=>n+(s?.unstuckTriggers??0),0);
  const maxViolations=Math.max(...samples.map(s=>s?.solidWorldViolations??99));
  const maxPressure=Math.max(...samples.map(s=>s?.stuckPressure??99));
  const centroidGain=(last?.allyCentroidX??0)-(first?.allyCentroidX??0);
  check('anti-stuck resolver is exercised in crowded T5', totalUnstuck>0, `triggers=${totalUnstuck}`);
  check('T5 crowded flow never penetrates solids', maxViolations===0, `maxViolations=${maxViolations}`);
  check('T5 crowd makes measurable progress out of the west-side choke', centroidGain>35, `centroidGain=${centroidGain.toFixed(1)}`);
  check('T5 anti-stuck does not thrash indefinitely', totalUnstuck<500, `triggers=${totalUnstuck}`);
  check('T5 final stuck pressure is controlled', (last?.stuckPressure??99)<=4, `final=${last?.stuckPressure}, max=${maxPressure}`);
  check('T5 hotfix stays above 30 FPS', samples.every(s=>(s?.fps??0)>=30), `minFPS=${Math.min(...samples.map(s=>s?.fps??0)).toFixed(1)}`);
  check('no browser runtime errors', session.errors.length===0, JSON.stringify(session.errors));
  writeFileSync('docs/acceptance-051b-t5.json',JSON.stringify({first,samples,results},null,2));
  const failed=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_051B_T5 passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length) process.exitCode=1;
} finally { await session.close(); }
