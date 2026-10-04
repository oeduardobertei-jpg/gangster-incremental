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
  const msg = JSON.parse(e.data); const p = pending.get(msg.id); if (!p) return;
  pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
};
const send = (method, params={}) => new Promise((resolve,reject) => {
  const id=++seq; pending.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params}));
});
await send('Runtime.enable');
const evaluate = async expression => {
  const r = await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'evaluate failed');
  return r.result.value;
};
const check = (name, ok, extra='') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${extra ? ` | ${extra}` : ''}`);
  if (!ok) failures++;
};
let failures = 0;
await evaluate(`localStorage.clear(); location.href='http://localhost:3000/?test=05-base'; true`);
await sleep(5800);
let base = await evaluate(`JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2'))`);
let status = await evaluate(`window.__DISTRICT_OPERATION__`);
check('operation enabled in territory 1', status?.enabled === true, JSON.stringify(status));
check('six tactical hubs exposed', status?.total === 6, `total=${status?.total}`);
const points = base.battleSnapshot?.controlPoints || [];
check('control points persisted in snapshot', points.length === 6, `points=${points.length}`);

// A: five captured hubs must stay silent; only the remaining rival hub may reinforce.
const active = points[points.length - 1];
base.gameSpeed = 5;
base.territoryTakes = 0;
base.runHighestTerritoryReached = 1;
base.battleSnapshot = {
  ...base.battleSnapshot,
  allies: [], rivals: [], fallen: [], bullets: [],
  controlPoints: points.map((p,i)=>({...p,progress:i===points.length-1?0:1,status:i===points.length-1?'rival':'captured'})),
  operationPhase: 'capture', finalResistanceSpawned: false, finalResistanceWave: 0,
  spawnElapsedMs: 99999, autoRecruitElapsedMs: 0
};
await evaluate(`localStorage.setItem('factions_war_pt_br_save_v2',${JSON.stringify(JSON.stringify(base))});location.reload();true`);
await sleep(5800);
let savedA = await evaluate(`JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2'))`);
const origins = (savedA.battleSnapshot?.rivals || []).map(r=>r.originBuilding).filter(Boolean);
check('captured hubs stop rival reinforcements', origins.length > 0 && origins.every(v=>v===active.label), `origins=${JSON.stringify(origins)}`);
// B: kill threshold alone cannot advance; capture the last hub to enter final resistance.
const capturer = {
  id:'capture-ally',type:'soldado_base',name:'Capturador',x:active.x,y:active.y,vx:0,vy:0,
  hp:100000,maxHp:100000,speed:0,damage:0,attackRange:0,attackCooldown:10,attackTimer:0,
  scavengeCooldown:0,targetId:null,color:'#ef4444',radius:12,variant:0
};
const sentinel = {
  id:'sentinel',type:'olheiro',name:'Sentinela',x:640,y:680,vx:0,vy:0,hp:100000,maxHp:100000,
  speed:0,damage:0,attackRange:0,attackCooldown:10,attackTimer:0,targetId:null,state:'patrol',
  color:'#3b82f6',radius:10,factionTag:'PCC',variant:0,patrolTargetX:640,patrolTargetY:680,patrolWaitTimer:999
};
base = savedA;
base.gameSpeed = 0; base.territoryTakes = 40; base.runHighestTerritoryReached = 1;
base.battleSnapshot = {...base.battleSnapshot,allies:[capturer],rivals:[sentinel],fallen:[],bullets:[],
  controlPoints:points.map((p,i)=>({...p,progress:i===points.length-1?0:1,status:i===points.length-1?'rival':'captured'})),
  operationPhase:'capture',finalResistanceSpawned:false,finalResistanceWave:0,spawnElapsedMs:0};
await evaluate(`localStorage.setItem('factions_war_pt_br_save_v2',${JSON.stringify(JSON.stringify(base))});location.reload();true`);
await sleep(700);
let advanceBefore = await evaluate(`Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('CONQUISTADO!'))`);
status = await evaluate(`window.__DISTRICT_OPERATION__`);
check('neutralizations alone do not unlock advance', !advanceBefore && status?.phase === 'capture', JSON.stringify(status));
