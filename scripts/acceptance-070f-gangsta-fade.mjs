import { openTestSession, sleep } from './cdp-session.mjs';
const session=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const {evaluate}=session; const results=[];
const check=(name,ok,detail='')=>{results.push(!!ok);console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
try {
  await evaluate(`(()=>{localStorage.removeItem('gdf_radio_v1');location.reload();return true})()`);
  let ready=false;
  for(let i=0;i<20;i++){ await sleep(250); ready=await evaluate(`!!window.__GDF_GANGSTA_RADIO_STATE__?.ready`); if(ready) break; }
  check('YouTube player ready before interaction',ready,JSON.stringify(await evaluate(`window.__GDF_GANGSTA_RADIO_STATE__`)));
  await evaluate(`(()=>{document.querySelector('button[title="Tocar música"]')?.click();return true})()`); await sleep(120);
  const uiPlaying=await evaluate(`!!document.querySelector('button[title="Pausar música"]')`);
  check('radio UI enters playing mode',uiPlaying,'pause control visible');
  await evaluate(`(()=>{document.querySelector('button[title="Próxima faixa"]')?.click();return true})()`); await sleep(220);
  const during=await evaluate(`window.__GDF_GANGSTA_RADIO_STATE__`);
  check('fade-out keeps current track briefly',during?.trackIndex===0,JSON.stringify(during));
  await sleep(520);
  const after=await evaluate(`window.__GDF_GANGSTA_RADIO_STATE__`);
  check('next track changes after fade',after?.trackIndex===1 && after?.title?.includes('Vida Loka Parte 2'),JSON.stringify(after));
  check('no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(v=>!v).length;
  console.log(`ACCEPTANCE_070F passed=${results.length-failed} failed=${failed}`);
  if(failed) process.exitCode=1;
} finally { await session.close(); }
