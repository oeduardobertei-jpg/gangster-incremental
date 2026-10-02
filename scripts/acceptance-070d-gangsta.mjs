import { openTestSession, sleep } from './cdp-session.mjs';
const session=await openTestSession({url:'http://localhost:3000',width:1536,height:900});
const {evaluate}=session;
const results=[];
const check=(name,ok,detail='')=>{results.push(Boolean(ok));console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
try {
  await evaluate(`(()=>{localStorage.removeItem('gdf_radio_v1');location.reload();return true})()`);
  await sleep(1800);
  const initial=await evaluate(`(()=>{const s=document.querySelector('select[aria-label="Escolher estaÃ§Ã£o de rÃ¡dio"]');return{value:s?.value,text:s?.parentElement?.textContent||'',disabled:document.querySelector('button[title^="Carregando rÃ¡dio"]')!==null}})()`);
  check('Brazilian Gangsta is default',initial.value==='central',initial.text);
  check('clean station identity visible',initial.text.includes('RAP BRASILEIRO DE RUA') && initial.text.includes('Vida Loka Parte 1'),initial.text);
  await sleep(1200);
  const ready=await evaluate(`window.__GDF_GANGSTA_RADIO_STATE__ || null`);
  check('YouTube player ready',Boolean(ready?.ready),JSON.stringify(ready));
  await evaluate(`(()=>{document.querySelector('button[title="PrÃ³xima faixa"]')?.click();return true})()`);
  await sleep(250);
  const next=await evaluate(`(()=>({text:document.querySelector('select[aria-label="Escolher estaÃ§Ã£o de rÃ¡dio"]')?.parentElement?.textContent||'',state:window.__GDF_GANGSTA_RADIO_STATE__||null}))()`);
  check('next selects Vida Loka Parte 2',next.text.includes('Vida Loka Parte 2') && next.state?.trackIndex===1,next.text);
  await evaluate(`(()=>{document.querySelector('button[title="Faixa anterior"]')?.click();return true})()`);
  await sleep(200);
  const back=await evaluate(`window.__GDF_GANGSTA_RADIO_STATE__ || null`);
  check('previous returns track 1',back?.trackIndex===0 && back?.title?.includes('Vida Loka Parte 1'),JSON.stringify(back));
  check('no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(Boolean).length===results.length?0:results.length-results.filter(Boolean).length;
  console.log(`ACCEPTANCE_070D_GANGSTA passed=${results.length-failed} failed=${failed}`);
  if(failed)process.exitCode=1;
} finally { await session.close(); }

