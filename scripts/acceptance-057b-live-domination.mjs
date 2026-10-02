import { openTestSession, sleep } from './cdp-session.mjs';

const session = await openTestSession({ url:'http://localhost:3000', width:1440, height:900 });
const { evaluate } = session;
const results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};

try {
  await evaluate(`(async()=>{
    const {createDefaultState}=await import('/src/state/defaultGameState.ts');
    const {TERRITORIES}=await import('/src/data/gameData.ts');
    const s=createDefaultState(); const next=TERRITORIES.find(t=>t.id===2);
    s.currentTerritoryId=1; s.runHighestTerritoryReached=1;
    s.territoryTakes=Math.max(0,next.requiredTakes-1); s.gameSpeed=0; s.soundMuted=true;
    s.battleSnapshot=undefined; s.talents={...s.talents,talent_starter_gang:5};
    s.upgrades={...s.upgrades,armory_bulletproof_vest:50,armory_heavy_calibers:50};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s)); location.reload(); return true;
  })()`);
  await sleep(1500);
  const before=await evaluate(`({hud:document.querySelector('.battle-hud')?.innerText??'',perf:window.__GAME_PERF__})`);
  check('starter troops are present before domination',(before.perf?.allies??0)>0,JSON.stringify(before));
  check('district is still rival before final neutralization',!before.hud.toLowerCase().includes('territÃƒÂ³rio dominado'),before.hud.replace(/\n/g,' | '));
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',key:'p'}));true`);
  let dominated=false;
  for(let i=0;i<240;i++){
    const hud=await evaluate(`document.querySelector('.battle-hud')?.innerText??''`);
    if(hud.toLowerCase().includes('territÃƒÂ³rio dominado')){dominated=true;break;}
    await sleep(120);
  }
  if(!dominated){await sleep(350);const hud=await evaluate("document.querySelector('.battle-hud')?.innerText??''");dominated=hud.toLowerCase().includes('território dominado');}
  check('neutralization threshold flips ownership in place',dominated);
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',key:'p'}));true`);
  await sleep(250);
  const after=await evaluate(`({hud:document.querySelector('.battle-hud')?.innerText??'',perf:window.__GAME_PERF__})`);
  check('player troops survive domination transition',(after.perf?.allies??0)===(before.perf?.allies??-1),`before=${before.perf?.allies}; after=${after.perf?.allies}; hud=${after.hud.replace(/\n/g,' | ')}`);
  check('domination preserves live battlefield instead of reinitializing it',(after.perf?.loot??0)>=1&&after.perf?.allies===before.perf?.allies,`allies=${after.perf?.allies}; fallen=${after.perf?.loot}; rivals=${after.perf?.rivals}`);
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',key:'p'}));true`);
  let external=null;
  for(let i=0;i<80;i++){
    external=await evaluate(`window.__LAST_RIVAL_SPAWN__??null`);
    if(external?.dominated===true) break;
    await sleep(120);
  }
  check('post-domination reinforcement uses external lane',external?.dominated===true&&external?.source==='external',JSON.stringify(external));
  check('external lane is authored for the district',/Viela|Subida|Acesso|Entrada|PortÃƒÂ£o/.test(external?.label??''),external?.label??'');
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_057B_LIVE_DOMINATION passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length)process.exitCode=1;
} finally { await session.close(); }
