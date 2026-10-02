import { openTestSession, sleep } from './cdp-session.mjs';

const session = await openTestSession({ url:'http://localhost:3000', width:1440, height:900 });
const { evaluate } = session;
const results=[];
const check=(name,ok,detail='')=>{
  results.push({name,passed:Boolean(ok),detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`);
};

const install = async (takes) => {
  await evaluate(`(async()=>{
    const {createDefaultState}=await import('/src/state/defaultGameState.ts');
    const s=createDefaultState();
    s.currentTerritoryId=3;s.runHighestTerritoryReached=3;s.territoryTakes=${takes};
    s.gameSpeed=1;s.soundMuted=true;
    s.battleSnapshot={version:1,runId:s.runId,territoryId:3,faction:s.playerFaction,capturedAt:Date.now(),
      allies:[],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:99999,autoRecruitElapsedMs:0};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));
    location.reload();return true;
  })()`);
  await sleep(1500);
  return evaluate(`({spawn:window.__LAST_RIVAL_SPAWN__??null,perf:window.__GAME_PERF__??null})`);
};
try {
  const rivalOwned=await install(0);
  check('rival-owned district reinforces from active structures',rivalOwned.spawn?.source!=='external' && !/^Acesso /.test(rivalOwned.spawn?.label??''),JSON.stringify(rivalOwned.spawn));
  check('rival-owned reinforcement actually spawns', (rivalOwned.perf?.rivals??0)>0,`rivals=${rivalOwned.perf?.rivals}`);

  const playerOwned=await install(80);
  check('player-owned district silences captured structures',playerOwned.spawn?.source==='external',JSON.stringify(playerOwned.spawn));
  check('external pressure continues after domination',(playerOwned.perf?.rivals??0)>0,`rivals=${playerOwned.perf?.rivals}`);
  check('external entry identifies district perimeter',/(Oeste|Leste|Norte|Nordeste|Noroeste)/.test(playerOwned.spawn?.label??''),playerOwned.spawn?.label??'missing');
  check('dominated spawn debug state is coherent',playerOwned.spawn?.dominated===true,JSON.stringify(playerOwned.spawn));

  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_057_SPAWN passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length)process.exitCode=1;
} finally {
  await session.close();
}

