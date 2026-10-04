import { openTestSession, sleep } from './cdp-session.mjs';

const session=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const {evaluate}=session,results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:Boolean(ok),detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
const openArsenal=async()=>{
  await evaluate(`(()=>{const t=document.querySelector('[aria-controls="evolution-panel"]');if(t&&t.getAttribute('aria-expanded')==='false')t.click();const a=document.querySelector('button[aria-label="Arsenal ($)"]');if(a)a.click();return true})()`);
  await sleep(160);
};
const cardText=()=>evaluate(`(()=>{const title=[...document.querySelectorAll('div')].find(x=>x.textContent?.trim()==='Bonde das Motos (Batedores)');return title?.closest('.rounded-xl')?.innerText||''})()`);
try{
  await openArsenal();
  const level0=await cardText();
  check('motorcycle card removes base-speed row',!level0.includes('Velocidade-base'),level0.replace(/\n/g,' | '));
  check('motorcycle level 1 chance is nerfed to 4%',level0.includes('0%')&&level0.includes('4%'),level0.replace(/\n/g,' | '));
  const rules=await evaluate(`(async()=>{const m=await import('/src/rules/upgrades.ts');return{speed0:m.getBaseRecruitSpeed(0),speed30:m.getBaseRecruitSpeed(30),chance1:m.getMotorcycleChance(1),chance30:m.getMotorcycleChance(30)}})()`);
  check('motorcycle upgrade never raises common troop speed',rules.speed0===1.2&&rules.speed30===1.2,JSON.stringify(rules));
  check('motorcycle chance curve caps at 18%',Math.abs(rules.chance1-.04)<1e-9&&Math.abs(rules.chance30-.18)<1e-9,JSON.stringify(rules));
  await evaluate(`(async()=>{const k='factions_war_pt_br_save_v2';const {createDefaultState}=await import('/src/state/defaultGameState.ts');const raw=localStorage.getItem(k);const s=raw?JSON.parse(raw):createDefaultState();s.upgrades={...s.upgrades,armory_motorcycle_squad:30};s.gameSpeed=0;localStorage.setItem(k,JSON.stringify(s));location.reload();return true})()`);
  await sleep(1200);await openArsenal();
  const maxed=await cardText();
  check('maxed motorcycle card shows 18% and no speed stat',maxed.includes('18%')&&!maxed.includes('Velocidade-base'),maxed.replace(/\n/g,' | '));
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_057_BALANCE passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length)process.exitCode=1;
} finally { await session.close(); }
