import { writeFileSync } from 'node:fs';
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237/json';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch(endpoint)).json();
const target = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
if (!target) throw new Error('Game page not found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let seq = 0;
const pending = new Map();
ws.onmessage = event => {
  const msg = JSON.parse(event.data);
  if (!msg.id || !pending.has(msg.id)) return;
  const p = pending.get(msg.id); pending.delete(msg.id);
  msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq; pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1.25, mobile: false });
const inject = `(() => {
  const key='factions_war_pt_br_save_v2';
  const s=JSON.parse(localStorage.getItem(key));
  if(!s) return false;
  s.gameSpeed=0; s.currentTerritoryId=1; s.territoryTakes=0; s.maxAllies=15;
  const ally=(id,type,x,y,vx,vy,color='#ef4444')=>({id,type,name:type,x,y,vx,vy,hp:55,maxHp:55,speed:1.2,damage:14,attackRange:100,attackCooldown:.85,attackTimer:0,targetId:null,color,radius:12,variant:0});
  const rival=(id,type,x,y,vx,vy,color='#3b82f6')=>({id,type,name:type,x,y,vx,vy,hp:75,maxHp:75,speed:1,damage:12,attackRange:100,attackCooldown:.9,attackTimer:0,targetId:null,state:'patrol',color,radius:12,factionTag:'PCC',variant:0,patrolTargetX:x,patrolTargetY:y,patrolWaitTimer:1});
  s.battleSnapshot={version:1,runId:s.runId,territoryId:1,faction:s.playerFaction,capturedAt:Date.now(),
    allies:[ally('a1','soldado_base',520,510,1,0),ally('a2','soldado_fuzil',660,470,-1,0),ally('a3','batedor_moto',790,590,.8,-.2),ally('behind','soldado_base',995,305,0,1)],
    rivals:[rival('r1','soldado_pistola',980,500,-1,0),rival('front','soldado_pistola',995,350,0,-1),rival('r2','atirador_fuzil',1020,320,-.7,.2),rival('r3','chefe_morro',430,300,.4,.3)],
    fallen:[{id:'loot-visual',x:845,y:430,type:'soldado_pistola',name:'EspÃ³lio Rival',decayTime:12,maxDecayTime:16,harvested:false,bountyCash:12,bountyAmmo:1}],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
  localStorage.setItem(key,JSON.stringify(s)); location.reload(); return true;
})()`;
await send('Runtime.evaluate', { expression: inject, returnByValue: true });
await sleep(1400);
const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
writeFileSync('C:/Users/Eduardo Bertei/Desktop/gangster-incremental/25d-preview.png', Buffer.from(shot.data, 'base64'));
console.log('captured 25d-preview.png');
ws.close();