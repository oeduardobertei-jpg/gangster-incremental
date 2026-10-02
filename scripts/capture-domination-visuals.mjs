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
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1.25,mobile:false});
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
await evaluate(`localStorage.clear(); location.href='http://localhost:3000/?visual=domination'; true`);
await sleep(5600);
const key='factions_war_pt_br_save_v2';
let state=await evaluate(`JSON.parse(localStorage.getItem('${key}'))`);
if(!state) throw new Error('save not initialized');
async function setTakes(takes){
  state.territoryTakes=takes;
  state.currentTerritoryId=1;
  state.runHighestTerritoryReached=1;
  state.gameSpeed=0;
  state.battleSnapshot=undefined;
  await evaluate(`localStorage.setItem('${key}',${JSON.stringify(JSON.stringify(state))});location.reload();true`);
  await sleep(1000);
}
async function capture(path){
  const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
  writeFileSync(path,Buffer.from(shot.data,'base64'));
}
await setTakes(39);
await capture('C:/Users/Eduardo Bertei/Desktop/gangster-incremental/domination-before.png');
const beforeText=await evaluate(`document.body.innerText.includes('Território dominado')`);
const beforeOperation=await evaluate(`window.__DISTRICT_OPERATION__`);
await setTakes(40);
await capture('C:/Users/Eduardo Bertei/Desktop/gangster-incremental/domination-after.png');
const afterText=await evaluate(`document.body.innerText.includes('Território dominado')`);
const afterCta=await evaluate(`Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('CONQUISTADO!'))`);
const afterOperation=await evaluate(`window.__DISTRICT_OPERATION__`);
console.log(JSON.stringify({beforeText,beforeOperation,afterText,afterCta,afterOperation},null,2));
ws.close();
