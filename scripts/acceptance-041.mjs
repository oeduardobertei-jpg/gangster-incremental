import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync } from 'node:fs';

const session = await openTestSession();
const { send, evaluate } = session;
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, passed: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};
const key = async (code, keyValue = code) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code, key: keyValue });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code, key: keyValue });
};
const click = async selector => {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await sleep(80);
};
const textClick = async text => {
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes(${JSON.stringify(text)})).click()`);
  await sleep(80);
};
const shot = async name => {
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(`docs/screenshots/${name}.png`, Buffer.from(data, 'base64'));
};
const save = async () => {
  await click('button[title="Configurações e Salvamento"]');
  await textClick('Salvar Agora');
  const state = await evaluate("JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2'))");
  await click('.fixed.inset-0 button');
  return state;
};
const overlapMetrics = allies => {
  let minDistance = Number.POSITIVE_INFINITY;
  let overlaps = 0;
  let severeOverlaps = 0;
  for (let i = 0; i < allies.length; i++) {
    for (let j = i + 1; j < allies.length; j++) {
      const a = allies[i], b = allies[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      minDistance = Math.min(minDistance, distance);
      const bodyDistance = (a.radius ?? 11) + (b.radius ?? 11);
      if (distance < bodyDistance) overlaps += 1;
      if (distance < bodyDistance * 0.72) severeOverlaps += 1;
    }
  }
  return { minDistance, overlaps, severeOverlaps };
};

try {
  await evaluate(`(async()=>{
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const state = createDefaultState();
    state.gameSpeed = 1; state.soundMuted = true;
    state.intel = 700; state.maxIntel = 700; state.maxAllies = 75;
    state.upgrades = { intel_central_command: 30, boca_fortified_bunkers: 20 };
    const rivals = Array.from({length:12}, (_,i)=>({id:'041-r-'+i,type:'soldado_pistola',name:'Rival',
      x:250+(i%6)*130,y:100+Math.floor(i/6)*70,vx:0,vy:0,hp:100000,maxHp:100000,speed:.5,damage:.01,
      attackRange:170,attackCooldown:1,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,
      factionTag:'PCC',variant:i%3,patrolTargetX:640,patrolTargetY:180,patrolWaitTimer:0}));
    state.battleSnapshot={version:1,runId:state.runId,territoryId:1,faction:state.playerFaction,capturedAt:Date.now(),
      allies:[],rivals,fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(state)); location.reload(); return true;
  })()`);
  await sleep(1400);
  await evaluate("document.querySelector('button[aria-label=\"Bocas & Apoio\"]').focus()");
  for (let i = 0; i < 5; i++) await key('Space', ' ');
  await sleep(180);
  let state = await save();
  check('Space recruits while an upgrade tab is focused', state.stats.totalAlliesRecruited === 5, `recruited=${state.stats.totalAlliesRecruited}`);

  await evaluate("document.activeElement?.blur()");
  for (let i = 0; i < 25; i++) await key('Space', ' ');
  await sleep(1200);
  state = await save();
  const keyboardAllies = state.battleSnapshot?.allies ?? [];
  const keyboardMetrics = overlapMetrics(keyboardAllies);
  check('rapid keyboard recruitment creates the full troop wave', keyboardAllies.length >= 30, `allies=${keyboardAllies.length}`);
  check('rapid keyboard recruitment avoids severe sprite stacking', keyboardMetrics.severeOverlaps === 0, JSON.stringify(keyboardMetrics));
  check('rapid keyboard recruitment keeps ordinary overlaps rare', keyboardMetrics.overlaps <= 2, JSON.stringify(keyboardMetrics));
  await shot('041-organic-wave');

  const canvasPoint = await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.getBoundingClientRect();return{x:r.left+r.width*.52,y:r.top+r.height*.78}})()`);
  for (let i = 0; i < 8; i++) {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: canvasPoint.x, y: canvasPoint.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: canvasPoint.x, y: canvasPoint.y, button: 'left', clickCount: 1 });
  }
  await sleep(900);
  state = await save();
  const clickAllies = state.battleSnapshot?.allies ?? [];
  const clickMetrics = overlapMetrics(clickAllies);
  check('repeated map recruitment does not collapse troops into one point', clickMetrics.severeOverlaps === 0, JSON.stringify(clickMetrics));
  await shot('041-repeated-clicks');
  check('no browser runtime errors', session.errors.length === 0, JSON.stringify(session.errors));
  writeFileSync('docs/acceptance-041-organic-movement.json', JSON.stringify(results, null, 2));
  const failures = results.filter(result => !result.passed);
  console.log(`ACCEPTANCE_041 passed=${results.length - failures.length} failed=${failures.length}`);
  if (failures.length) process.exitCode = 1;
} finally {
  await session.close();
}
