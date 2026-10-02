import { writeFileSync } from 'node:fs';
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237/json';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch(endpoint)).json();
const target = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
if (!target) throw new Error('Game page not found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
let seq=0; const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);};
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evalJs=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text||'eval failed');return r.result.value;};
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const key='factions_war_pt_br_save_v2';
for (let territoryId=1; territoryId<=6; territoryId++) {
  await evalJs(`(()=>{const s=JSON.parse(localStorage.getItem('${key}'));s.currentTerritoryId=${territoryId};s.territoryTakes=0;s.battleSnapshot=undefined;s.runHighestTerritoryReached=Math.max(s.runHighestTerritoryReached||1,${territoryId});localStorage.setItem('${key}',JSON.stringify(s));location.href='http://localhost:3000/?gallery04e=${territoryId}';return true;})()`);
  await sleep(1200);
  const rect=await evalJs(`(()=>{const c=document.querySelector('canvas');if(!c)return null;const r=c.parentElement.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()`);
  if(!rect) throw new Error('canvas container not found');
  const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
  const path=`C:/Users/Eduardo Bertei/Desktop/gangster-incremental/04e-territory-${territoryId}.png`;
  writeFileSync(path,Buffer.from(shot.data,'base64'));
  console.log(`captured territory ${territoryId}`);
}
ws.close();
