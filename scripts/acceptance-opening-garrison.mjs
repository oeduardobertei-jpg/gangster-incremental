import { openTestSession, sleep } from './cdp-session.mjs';

const expected = new Map([[1,10],[2,14],[3,18],[4,22],[5,26],[6,30]]);
const session = await openTestSession();
const { evaluate } = session;
const results = [];
const check = (name, ok, detail='') => {
  results.push({ name, passed: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
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
    await sleep(1350);
    const field = await evaluate(`({rivals:window.__GAME_PERF__?.rivals ?? -1,allies:window.__GAME_PERF__?.allies ?? -1})`);
    check(`T${territory} starts with fixed rival garrison`, field.rivals === count, `expected=${count}, actual=${field.rivals}`);
    check(`T${territory} gives no free player troops`, field.allies === 0, `allies=${field.allies}`);
  }

  await evaluate(`(async()=>{
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const s = createDefaultState();
    s.currentTerritoryId = 1; s.runHighestTerritoryReached = 1;
    s.territoryTakes = 40; s.gameSpeed = 0; s.soundMuted = true;
    s.battleSnapshot = undefined;
    localStorage.setItem('factions_war_pt_br_save_v2', JSON.stringify(s));
    location.reload(); return true;
  })()`);
  await sleep(1000);
  const advanced = await evaluate(`(()=>{const b=document.querySelector('.battle-advance'); if(!b)return false; b.click(); return true;})()`);
  await sleep(1400);
  const afterAdvance = await evaluate(`({hud: document.querySelector('.battle-hud')?.innerText ?? '', rivals: window.__GAME_PERF__?.rivals ?? -1, allies: window.__GAME_PERF__?.allies ?? -1})`);
  check(
    'advancing T1 -> T2 creates only the T2 rival garrison',
    advanced && afterAdvance.hud.includes('Praça da Feira') && afterAdvance.rivals === 14 && afterAdvance.allies === 0,
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
  await sleep(1400);
  const starterAllies = await evaluate(`window.__GAME_PERF__?.allies ?? -1`);
  check(
    'Hegemony starter-gang talent is the only free-entry exception',
    starterAllies === 4,
    `allies=${starterAllies}`
  );

  check('no browser runtime errors', session.errors.length === 0, JSON.stringify(session.errors));
  const failures = results.filter(result => !result.passed);
  console.log(`OPENING_GARRISON passed=${results.length - failures.length} failed=${failures.length}`);
  if (failures.length > 0) process.exitCode = 1;
} finally {
  await session.close();
}
