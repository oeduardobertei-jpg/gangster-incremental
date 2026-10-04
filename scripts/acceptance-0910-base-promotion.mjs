import { openTestSession, sleep } from './cdp-session.mjs';

const session=await openTestSession({url:'http://127.0.0.1:3000',width:1440,height:900});
const { evaluate }=session;
const results=[];
const check=(name,ok,detail='')=>{
  results.push({name,passed:Boolean(ok),detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`);
};

const run=async(stage,upgrades,upgradeId)=>{
  await evaluate(`(async()=>{
    const {createDefaultState}=await import('/src/state/defaultGameState.ts');
    const s=createDefaultState();
    s.gameSpeed=0;s.soundMuted=true;s.cash=1e12;s.ammo=1e12;s.respect=1e12;s.contacts=1e12;
    s.upgrades=${JSON.stringify(upgrades)};s.battleSnapshot=undefined;
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
  })()`);
  await sleep(900);
  const clicked=await evaluate(`(()=>{
    const card=document.querySelector('[data-upgrade-id=${JSON.stringify(upgradeId)}]');
    const button=card?.querySelector('button');
    if(!button || button.disabled) return false; button.click(); return true;
  })()`);
  check(`E${stage} purchase is available`,clicked,upgradeId);
  await sleep(250);
  check(`E${stage} promotion notice`,await evaluate(`document.body.innerText.includes('Base de Comando evoluiu para o Estágio ${stage}.')`));
  check(`E${stage} progress UI updated`,await evaluate(`document.body.innerText.includes('Base de Comando · E${stage}')`));
};

try{
  await run(1,{armory_bulletproof_vest:19},'armory_bulletproof_vest');
  await run(2,{armory_bulletproof_vest:50,armory_heavy_calibers:19},'armory_heavy_calibers');
  await run(3,{armory_bulletproof_vest:50,armory_heavy_calibers:50,armory_motorcycle_squad:30,armory_medics_safehouse:19},'armory_medics_safehouse');
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_0910_BASE_PROMOTION passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length) process.exitCode=1;
}finally{await session.close();}
