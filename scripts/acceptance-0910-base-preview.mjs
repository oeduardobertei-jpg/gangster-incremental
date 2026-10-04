import { openTestSession, sleep } from './cdp-session.mjs';

const session = await openTestSession({ url:'http://127.0.0.1:3000', width:1440, height:900 });
const { evaluate } = session;
const results=[];
const check=(name,ok,detail='')=>{
  results.push({name,passed:Boolean(ok),detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`);
};

try {
  await sleep(1200);
  const before = await evaluate(`localStorage.getItem('factions_war_pt_br_save_v2')`);
  check('DEV preview API is exposed', await evaluate(`!!window.__BASE_VISUAL_PREVIEW__`));

  await evaluate(`window.__BASE_VISUAL_PREVIEW__.set({kind:'stage',stage:3})`);
  await sleep(180);
  check('stage preview badge reflects E3', await evaluate(`document.body.innerText.includes('DEV · Base: Estágio 3')`));
  await evaluate(`window.__BASE_VISUAL_PREVIEW__.set({kind:'tier',key:'fortification',tier:5})`);
  await sleep(180);
  check('isolated tier preview badge reflects T5', await evaluate(`document.body.innerText.includes('Fortificação · T5')`));

  await evaluate(`window.__BASE_VISUAL_PREVIEW__.set({kind:'max'})`);
  await sleep(180);
  check('max preview badge is visible', await evaluate(`document.body.innerText.includes('DEV · Base: Tudo máximo')`));

  const afterPreview = await evaluate(`localStorage.getItem('factions_war_pt_br_save_v2')`);
  check('preview does not mutate persisted save', before === afterPreview);

  await evaluate(`window.__BASE_VISUAL_PREVIEW__.clear()`);
  await sleep(180);
  check('clear removes preview badge', !(await evaluate(`document.body.innerText.includes('DEV · Base:')`)));
  check('no browser runtime errors', session.errors.length===0, JSON.stringify(session.errors));

  const failed=results.filter(result=>!result.passed);
  console.log(`ACCEPTANCE_0910_BASE_PREVIEW passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length) process.exitCode=1;
} finally {
  await session.close();
}
