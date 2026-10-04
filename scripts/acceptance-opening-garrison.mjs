import { openTestSession, sleep } from './cdp-session.mjs';

const expected = new Map([[1,10],[2,14],[3,18],[4,22],[5,26],[6,30]]);
const session = await openTestSession();
const { evaluate } = session;
const results = [];
const isNavigationRace = error => /Inspected target navigated or closed|Execution context was destroyed|Cannot find context/i.test(error?.message || '');
const evaluateReady = async (expression, attempts=35) => {
  let lastError;
  for (let i=0; i<attempts; i++) {
    try { return await evaluate(expression); }
    catch (error) {
      if (!isNavigationRace(error)) throw error;
      lastError = error;
      await sleep(100);
    }
  }
  throw lastError ?? new Error('CDP context did not become ready');
};
const check = (name, ok, detail='') => {
  results.push({ name, passed: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};

const readField = async territory => {
  let field = { rivals:-1, allies:-1, hud:'' };
  for (let i=0; i<35; i++) {
    field = await evaluateReady(`({rivals:window.__GAME_PERF__?.rivals ?? -1,allies:window.__GAME_PERF__?.allies ?? -1,hud:document.querySelector('.battle-hud')?.innerText ?? ''})`);
    if (field.rivals >= 0 && field.allies >= 0 && field.hud.includes(`T${territory}`)) return field;
    await sleep(100);
  }
  return field;
};

try {
  for (const [territory, count] of expected) {
    await evaluate(`(async()=>{
      const { createDefaultState } = await import('/src/state/defaultGameState.ts');
      const s = createDefaultState();
      s.currentTerritoryId = ${territory};
      s.runHighestTerritoryReached = ${territory};
      s.gameSpeed = 0;
      s.soundMuted = true;
      s.battleSnapshot = undefined;
      localStorage.setItem('factions_war_pt_br_save_v2', JSON.stringify(s));
      location.reload(); return true;
    })()`);
    const field = await readField(territory);
    check(`T${territory} starts with fixed rival garrison`, field.rivals === count, `expected=${count}, actual=${field.rivals}`);
    check(`T${territory} gives no free player troops`, field.allies === 0, `allies=${field.allies}`);
  }

  await evaluate(`(async()=>{
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const { getTacticalBuildings } = await import('/src/components/canvas/favelaRenderer.ts');
    const { WORLD_WIDTH, WORLD_HEIGHT } = await import('/src/components/canvas/camera2D.ts');
    const { FACTION_CONFIGS } = await import('/src/data/gameData.ts');
    const s = createDefaultState();
    s.currentTerritoryId = 1;
    s.runHighestTerritoryReached = 1;
    s.territoryTakes = 20;
    s.gameSpeed = 0;
    s.soundMuted = true;
    const hubs=getTacticalBuildings(WORLD_WIDTH,WORLD_HEIGHT,FACTION_CONFIGS[s.playerFaction],1).filter(b=>b.isRivalHub);
    const cps=hubs.map(b=>({id:'cp_'+b.id,buildingId:b.id,label:b.label,x:b.doorX,y:b.doorY,progress:1,status:'captured'}));
    s.battleSnapshot={version:1,runId:s.runId,territoryId:1,faction:s.playerFaction,capturedAt:Date.now(),allies:[],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,controlPoints:cps,operationPhase:'dominated',finalResistanceSpawned:true,finalResistanceWave:1,campaignMilestonesTriggered:[]};
    localStorage.setItem('factions_war_pt_br_save_v2', JSON.stringify(s));
    location.reload(); return true;
  })()`);
  let advanceReady = false;
  for (let i=0; i<35; i++) {
    advanceReady = await evaluateReady(`!!document.querySelector('.battle-advance')`);
    if (advanceReady) break;
    await sleep(100);
  }
  const advanced = await evaluate(`(()=>{const b=document.querySelector('.battle-advance'); if(!b)return false; b.click(); return true;})()`);
  const afterAdvance = await readField(2);
  check(
    'physical domination T1 -> T2 creates only the T2 rival garrison',
    advanceReady && advanced && afterAdvance.hud.includes('Praça da Feira') && afterAdvance.rivals === 14 && afterAdvance.allies === 0,
    JSON.stringify(afterAdvance)
  );

  await evaluate(`(async()=>{
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const s = createDefaultState();
    s.currentTerritoryId = 2; s.runHighestTerritoryReached = 2;
    s.gameSpeed = 0; s.soundMuted = true; s.battleSnapshot = undefined;
    s.talents = { ...s.talents, talent_starter_gang: 2 };
    localStorage.setItem('factions_war_pt_br_save_v2', JSON.stringify(s));
    location.reload(); return true;
  })()`);
  let starterField = await readField(2);
  for (let i=0; i<35 && starterField.allies !== 4; i++) {
    await sleep(100);
    starterField = await evaluateReady(`({rivals:window.__GAME_PERF__?.rivals ?? -1,allies:window.__GAME_PERF__?.allies ?? -1,hud:document.querySelector('.battle-hud')?.innerText ?? ''})`);
  }
  check(
    'Hegemony starter-gang talent is the only free-entry exception',
    starterField.allies === 4,
    `allies=${starterField.allies}`
  );

  check('no browser runtime errors', session.errors.length === 0, JSON.stringify(session.errors));
  const failures = results.filter(result => !result.passed);
  console.log(`OPENING_GARRISON passed=${results.length - failures.length} failed=${failures.length}`);
  if (failures.length > 0) process.exitCode = 1;
} finally {
  await session.close();
}
