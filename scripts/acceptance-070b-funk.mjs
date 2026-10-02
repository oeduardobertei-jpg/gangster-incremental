import { openTestSession, sleep } from './cdp-session.mjs';
const session=await openTestSession({url:'http://localhost:3000',width:1536,height:900});
const {evaluate}=session; const checks=[];
const check=(n,o,d='')=>{checks.push(!!o);console.log(`${o?'PASS':'FAIL'} | ${n} | ${d}`)};
try {
  await evaluate(`(()=>{localStorage.setItem('gdf_radio_v1',JSON.stringify({stationId:'madrugada',trackIndex:0,volume:.28,playing:false}));location.reload();return true})()`);
  await sleep(750);
  const migrated=await evaluate(`(()=>{const s=document.querySelector('select[aria-label="Escolher estação de rádio"]');return{value:s?.value,text:s?.parentElement?.textContent,opts:[...s.options].map(o=>o.textContent)}})()`);
  check('legacy Madrugada migrates to Baile',migrated.value==='baile',migrated.value);
  check('funk station visible',migrated.opts.some(x=>x?.includes('Baile da Cidade')),JSON.stringify(migrated.opts));
  check('funk identity shown',migrated.text?.includes('Funk brasileiro'),migrated.text);
  await evaluate(`document.querySelector('button[title="Tocar música"]')?.click()`); await sleep(300);
  check('funk station plays',await evaluate(`!!document.querySelector('button[title="Pausar música"]' )`),'playback active');
  check('no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=checks.filter(x=>!x).length;console.log(`ACCEPTANCE_070B_FUNK passed=${checks.length-failed} failed=${failed}`);if(failed)process.exitCode=1;
} finally { await session.close(); }