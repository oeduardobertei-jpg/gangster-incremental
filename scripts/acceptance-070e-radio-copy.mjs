import { openTestSession, sleep } from './cdp-session.mjs';
const s=await openTestSession({url:'http://localhost:3000',width:1536,height:900});
const {evaluate}=s; const checks=[];
const check=(n,ok,d='')=>{checks.push(!!ok);console.log(`${ok?'PASS':'FAIL'} | ${n} | ${d}`)};
try{
  await evaluate(`localStorage.removeItem('gdf_radio_v1'); location.reload(); true`);
  await sleep(650);
  const main=await evaluate(`document.querySelector('select[aria-label="Escolher estação de rádio"]')?.parentElement?.textContent||''`);
  check('Brazilian clean copy',main.includes('RAP BRASILEIRO DE RUA')&&!/autorizad|Instrumental|YouTube/i.test(main),main);
  await evaluate(`(()=>{const x=document.querySelector('select[aria-label="Escolher estação de rádio"]');x.value='baile';x.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
  await sleep(300);
  const lofi=await evaluate(`document.querySelector('select[aria-label="Escolher estação de rádio"]')?.parentElement?.textContent||''`);
  check('Lofi clean copy',lofi.includes('Lofi Funk Brazil')&&lofi.includes('LOFI FUNK BRASILEIRO')&&!/autorizad|YouTube/i.test(lofi),lofi);
  check('no runtime errors',s.errors.length===0,JSON.stringify(s.errors));
  const failed=checks.filter(x=>!x).length; console.log(`ACCEPTANCE_070E passed=${checks.length-failed} failed=${failed}`); if(failed)process.exitCode=1;
} finally { await s.close(); }
