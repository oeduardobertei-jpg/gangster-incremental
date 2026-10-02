import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const session = await openTestSession({ url:'http://localhost:3000', width:1536, height:900 });
const { evaluate, send } = session;
const checks=[]; const check=(name,ok,detail='')=>{checks.push(Boolean(ok));console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
try {
  await sleep(700);
  const initial = await evaluate(`(()=>{const s=document.querySelector('select[aria-label="Escolher estação de rádio"]');const p=document.querySelector('button[title="Tocar música"]');return{station:s?.value,play:!!p,text:s?.parentElement?.textContent}})()`);
  check('radio player visible',initial.play,initial.text);
  check('default station concrete',initial.station==='concreto',initial.station);
  await evaluate(`(()=>{document.querySelector('button[title="Tocar música"]')?.click();return true})()`);
  await sleep(250);
  const playing=await evaluate(`!!document.querySelector('button[title="Pausar música"]')`);
  check('play pause works',playing,'pause control visible');
  const switched=await evaluate(`(()=>{const s=document.querySelector('select[aria-label="Escolher estação de rádio"]');if(!s)return null;s.value='central';s.dispatchEvent(new Event('change',{bubbles:true}));return s.value})()`);
  await sleep(180); check('station switch works',switched==='central',switched);
  const before=await evaluate(`document.querySelector('select[aria-label="Escolher estação de rádio"]')?.parentElement?.textContent`);
  await evaluate(`(()=>{document.querySelector('button[title="Próxima faixa"]')?.click();document.querySelector('button[title="Aumentar música"]')?.click();return true})()`);
  await sleep(180);
  const after=await evaluate(`(()=>{const p=document.querySelector('select[aria-label="Escolher estação de rádio"]')?.parentElement;return{txt:p?.textContent,stored:localStorage.getItem('gdf_radio_v1')}})()`);
  check('next track updates player',before!==after.txt,after.txt);
  check('radio preferences persist',Boolean(after.stored),after.stored);
  mkdirSync('docs/screenshots/0.7-radio',{recursive:true});
  const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
  writeFileSync('docs/screenshots/0.7-radio/player.png',Buffer.from(shot.data,'base64'));
  check('no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=checks.filter(ok=>!ok).length; console.log(`ACCEPTANCE_070_RADIO passed=${checks.length-failed} failed=${failed}`); if(failed)process.exitCode=1;
} finally { await session.close(); }
