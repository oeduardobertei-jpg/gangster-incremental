import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync } from 'node:fs';

const session = await openTestSession();
const { evaluate } = session;
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, passed: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};
const saveBattle = async () => {
  await evaluate(`document.querySelector('button[title="Configurações e Salvamento"]')?.click()`);
  await sleep(80);
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Salvar Agora'))?.click()`);
  await sleep(80);
  const state = await evaluate(`JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2'))`);
  await evaluate(`document.querySelector('.fixed.inset-0 button')?.click()`);
  await sleep(80);
  return state;
};
const outside = (entity, box, radius = entity.radius ?? 12) =>
  entity.x <= box.minX - radius || entity.x >= box.maxX + radius ||
  entity.y <= box.minY - radius || entity.y >= box.maxY + radius;

try {
  await evaluate(`(async()=>{
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const s = createDefaultState(); s.gameSpeed=1; s.soundMuted=true; s.maxAllies=20;
    s.currentTerritoryId=1; s.runHighestTerritoryReached=1; s.battleSnapshot=undefined;
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s)); location.reload(); return true;
  })()`);  await sleep(1100);
  const collisionUnit = await evaluate(`(async()=>{
    const mod=await import('/src/rules/collision.ts');
    const wall={id:'wall',minX:100,minY:100,maxX:180,maxY:180,blocksMovement:true,blocksProjectiles:true,kind:'wall',material:'concrete'};
    const move=mod.resolveCircleMotionAgainstWorld(80,140,10,60,0,[wall]);
    const hit=mod.segmentWorldHit(50,140,220,140,2,[wall]);
    return {move,hit:hit?{t:hit.t,id:hit.collider.id}:null};
  })()`);
  check('world collision stops a moving unit before a wall', collisionUnit.move.x <= 90.01 && collisionUnit.move.hitX, JSON.stringify(collisionUnit.move));
  check('world collision catches projectiles before they cross a wall', Boolean(collisionUnit.hit), JSON.stringify(collisionUnit.hit));

  await evaluate(`(async()=>{
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const s=createDefaultState();s.gameSpeed=1;s.soundMuted=true;s.currentTerritoryId=1;s.runHighestTerritoryReached=1;
    const ally={id:'solid-a',type:'soldado_base',name:'A',x:350,y:115,vx:0,vy:0,hp:55,maxHp:55,speed:0,damage:25,attackRange:260,attackCooldown:.25,attackTimer:0,scavengeCooldown:0,targetId:null,color:'#ef4444',radius:12,variant:0};
    const rival={id:'solid-r',type:'soldado_pistola',name:'R',x:545,y:115,vx:0,vy:0,hp:500,maxHp:500,speed:0,damage:25,attackRange:260,attackCooldown:.25,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:0,patrolTargetX:350,patrolTargetY:115,patrolWaitTimer:0};
    s.battleSnapshot={version:1,runId:s.runId,territoryId:1,faction:s.playerFaction,capturedAt:Date.now(),allies:[ally],rivals:[rival],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
  })()`);
  await sleep(1500);
  let state=await saveBattle();
  const a=state.battleSnapshot.allies.find(x=>x.id==='solid-a');
  const r=state.battleSnapshot.rivals.find(x=>x.id==='solid-r');  const t1Lot={minX:.30*1280,minY:.102*720,maxX:.40*1280,maxY:.217*720};
  check('opponents cannot shoot through a solid neighborhood building', a?.hp===55 && r?.hp===500, `ally=${a?.hp}, rival=${r?.hp}`);
  check('T1 units remain outside the solid decorative lot', outside(a,t1Lot) && outside(r,t1Lot), JSON.stringify({a:{x:a?.x,y:a?.y},r:{x:r?.x,y:r?.y}}));

  await evaluate(`(async()=>{
    const { createDefaultState }=await import('/src/state/defaultGameState.ts');
    const s=createDefaultState();s.gameSpeed=1;s.soundMuted=true;s.currentTerritoryId=3;s.runHighestTerritoryReached=3;
    const ally={id:'inside-warehouse',type:'soldado_base',name:'A',x:90,y:230,vx:0,vy:0,hp:500,maxHp:500,speed:0,damage:1,attackRange:1,attackCooldown:1,attackTimer:0,scavengeCooldown:0,targetId:null,color:'#ef4444',radius:12,variant:0};
    s.battleSnapshot={version:1,runId:s.runId,territoryId:3,faction:s.playerFaction,capturedAt:Date.now(),allies:[ally],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
  })()`);
  await sleep(900);
  state=await saveBattle();
  const escaped=state.battleSnapshot.allies.find(x=>x.id==='inside-warehouse');
  const warehouse={minX:.02*1280,minY:.22*720,maxX:.18*1280,maxY:.50*720};
  check('legacy/save entities embedded in new geometry are pushed outside safely', outside(escaped,warehouse), JSON.stringify({x:escaped?.x,y:escaped?.y}));

  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  writeFileSync('docs/acceptance-051-solid-field.json',JSON.stringify(results,null,2));
  const failures=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_051_SOLID passed=${results.length-failures.length} failed=${failures.length}`);
  if(failures.length)process.exitCode=1;
} finally { await session.close(); }
