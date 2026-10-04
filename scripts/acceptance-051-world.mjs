import { openTestSession, sleep } from './cdp-session.mjs';

const session = await openTestSession();
const { evaluate } = session;
const results = [];
const check = (name, ok, detail='') => {
  results.push({ name, passed: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};

try {
  for (let territory = 1; territory <= 6; territory++) {
    await evaluate(`(async()=>{
      const { createDefaultState } = await import('/src/state/defaultGameState.ts');
      const s = createDefaultState();
      s.currentTerritoryId=${territory}; s.runHighestTerritoryReached=${territory};
      s.gameSpeed=5; s.soundMuted=true; s.intel=2000; s.maxIntel=2000; s.maxAllies=75;
      s.upgrades={ intel_central_command:30, boca_fortified_bunkers:20 };
      s.battleSnapshot=undefined;
      localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s)); location.reload(); return true;
    })()`);
    await sleep(1700);
    const first = await evaluate(`window.__GAME_PERF__`);
    check(`T${territory} declares solid scenery`, (first?.worldColliders ?? 0) >= 8, JSON.stringify(first));
    check(`T${territory} opening garrison is outside solids`, (first?.solidWorldViolations ?? -1) === 0, `violations=${first?.solidWorldViolations}`);
    await sleep(1800);
    const second = await evaluate(`window.__GAME_PERF__`);
    check(`T${territory} moving rivals remain outside solids`, (second?.solidWorldViolations ?? -1) === 0, `fps=${second?.fps?.toFixed?.(1)}, violations=${second?.solidWorldViolations}`);
  }

  // Legacy-save migration: intentionally restore units inside the T1 mural/building region.
  await evaluate(`(async()=>{
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const s=createDefaultState(); s.gameSpeed=0; s.soundMuted=true;
    const ally={id:'legacy-a',type:'recruta',name:'Legacy',x:400,y:260,vx:0,vy:0,hp:55,maxHp:55,speed:1.2,damage:14,attackRange:95,attackCooldown:.8,attackTimer:0,targetId:null,state:'idle',color:'#ef4444',radius:11,factionTag:'CV',variant:0};
    const rival={id:'legacy-r',type:'soldado_pistola',name:'Legacy R',x:400,y:260,vx:0,vy:0,hp:75,maxHp:75,speed:.95,damage:12,attackRange:110,attackCooldown:.9,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:0};
    s.battleSnapshot={version:1,runId:s.runId,territoryId:1,faction:s.playerFaction,capturedAt:Date.now(),allies:[ally],rivals:[rival],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s)); location.reload(); return true;
  })()`);
  await sleep(1500);
  const migrated=await evaluate(`window.__GAME_PERF__`);
  check('legacy/restored troops are ejected from new solid geometry', (migrated?.solidWorldViolations ?? -1)===0, JSON.stringify(migrated));

  check('no browser runtime errors', session.errors.length===0, JSON.stringify(session.errors));
  const failures=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_051_WORLD passed=${results.length-failures.length} failed=${failures.length}`);
  if(failures.length) process.exitCode=1;
} finally { await session.close(); }
