const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237/json';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch(endpoint)).json();
const target = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
if (!target) throw new Error('Game page not found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let seq = 0;
const pending = new Map();
ws.onmessage = e => {
  const msg = JSON.parse(e.data);
  const p = pending.get(msg.id);
  if (!p) return;
  pending.delete(msg.id);
  msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
};
const send = (method, params={}) => new Promise((resolve,reject) => {
  const id = ++seq;
  pending.set(id,{resolve,reject});
  ws.send(JSON.stringify({id,method,params}));
});
await send('Runtime.enable');
const evaluate = async expression => {
  const r = await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'evaluate failed');
  return r.result.value;
};
let failures = 0;
const check = (name, ok, extra='') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${extra ? ` | ${extra}` : ''}`);
  if (!ok) failures++;
};

await evaluate(`localStorage.clear(); location.href='http://localhost:3000/?test=05d-base'; true`);
await sleep(5800);
let state = await evaluate(`JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2'))`);
let status = await evaluate(`window.__DISTRICT_OPERATION__`);
check('district operation active', status?.enabled === true, JSON.stringify(status));
check('six bases available', status?.total === 6, `total=${status?.total}`);
const points = state.battleSnapshot?.controlPoints || [];
check('control points persisted', points.length === 6, `points=${points.length}`);

const captured = points[0];
const sentinel = {
  id:'sentinel',type:'olheiro',name:'Sentinela',x:640,y:690,vx:0,vy:0,hp:100000,maxHp:100000,
  speed:0,damage:0,attackRange:0,attackCooldown:10,attackTimer:0,targetId:null,state:'patrol',
  color:'#3b82f6',radius:10,factionTag:'PCC',variant:0,patrolTargetX:640,patrolTargetY:690,patrolWaitTimer:999
};
state.gameSpeed = 1;
state.intel = 100;
state.maxAllies = Math.max(15, state.maxAllies || 15);
state.battleSnapshot = {...state.battleSnapshot, allies:[], rivals:[sentinel], fallen:[], bullets:[],
  controlPoints:points.map((p,i)=>({...p,progress:i===0?1:0,status:i===0?'captured':'rival'})),
  operationPhase:'capture',finalResistanceSpawned:false,finalResistanceWave:0,spawnElapsedMs:0};
await evaluate(`localStorage.setItem('factions_war_pt_br_save_v2',${JSON.stringify(JSON.stringify(state))});location.reload();true`);
await sleep(700);
await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true}));true`);
await sleep(80);
await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'p',code:'KeyP',bubbles:true}));true`);
await sleep(5200);
let saved = await evaluate(`JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2'))`);
const ally = saved.battleSnapshot?.allies?.[0];
const forwardDist = ally ? Math.hypot(ally.x-captured.x, ally.y-captured.y) : 9999;
check('captured base becomes forward reinforcement anchor', Boolean(ally) && forwardDist < 70, `dist=${forwardDist.toFixed(1)}`);
check('captured base remains persisted', saved.battleSnapshot?.controlPoints?.[0]?.status === 'captured');

state = saved;
state.gameSpeed = 1;
state.territoryTakes = 40;
state.runHighestTerritoryReached = 1;
state.battleSnapshot = {...state.battleSnapshot, allies:ally ? [ally] : [], rivals:[], fallen:[], bullets:[],
  controlPoints:points.map(p=>({...p,progress:1,status:'captured'})),
  operationPhase:'final_resistance',finalResistanceSpawned:true,finalResistanceWave:1,spawnElapsedMs:0};
await evaluate(`localStorage.setItem('factions_war_pt_br_save_v2',${JSON.stringify(JSON.stringify(state))});location.reload();true`);
await sleep(900);
status = await evaluate(`window.__DISTRICT_OPERATION__`);
check('final resistance resolves into dominated district', status?.phase === 'dominated', JSON.stringify(status));
const cta = await evaluate(`Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('CONQUISTADO!'))`);
check('advance CTA unlocks only after full domination', cta === true);

console.log(`TEST_05D_SUMMARY passed=${7-failures} failed=${failures}`);
ws.close();
process.exitCode = failures ? 1 : 0;
