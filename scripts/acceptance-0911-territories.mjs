import { openTestSession, sleep } from './cdp-session.mjs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1366,height:820});
const results=[];const check=(n,ok,d='')=>{results.push({n,ok:!!ok,d});console.log(`${ok?'PASS':'FAIL'} | ${n} | ${d}`)};
try{
 const requirements=[20,40,60,80,120,200];
 for(let id=1;id<=6;id++){
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=${id};g.runHighestTerritoryReached=${id};g.stats.highestTerritoryReached=${id};g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  let state=null;
  for(let tries=0;tries<25;tries++){
    await sleep(100);
    state=await s.evaluate(`({op:window.__DISTRICT_OPERATION__??null,hud:document.querySelector('.battle-hud')?.innerText||'',perf:window.__GAME_PERF__??null})`);
    if(state?.op?.enabled===true&&state.op.total===6&&state.hud.includes(`T${id}`)&&state.hud.includes(`0/${requirements[id-1]}`)&&state.hud.includes('POSIÇÕES 0/6'))break;
  }
  check(`T${id} physical operation enabled`,state.op?.enabled===true&&state.op?.phase==='capture'&&state.op?.total===6,JSON.stringify(state.op));
  check(`T${id} owns its neutralization threshold`,state.hud.includes(`0/${requirements[id-1]}`)&&state.hud.includes('POSIÇÕES 0/6'),state.hud.replace(/\n/g,' | '));
 }
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=3;g.runHighestTerritoryReached=3;g.stats.highestTerritoryReached=3;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot={version:1,runId:g.runId,territoryId:3,faction:g.playerFaction,capturedAt:Date.now(),allies:[],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,controlPoints:[],operationPhase:'dominated',finalResistanceSpawned:false,finalResistanceWave:0};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 let migrated=null;for(let tries=0;tries<25;tries++){await sleep(100);migrated=await s.evaluate(`({op:window.__DISTRICT_OPERATION__??null,hud:document.querySelector('.battle-hud')?.innerText||''})`);if(migrated?.op?.total===6)break;}
 check('counter-era empty snapshot migrates into physical capture',migrated.op?.phase==='capture'&&migrated.op?.captured===0&&migrated.op?.total===6,JSON.stringify(migrated));
 check('no runtime errors',s.errors.length===0,JSON.stringify(s.errors));
 const failed=results.filter(x=>!x.ok);console.log(`ACCEPTANCE_0911_TERRITORIES passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await s.close();}