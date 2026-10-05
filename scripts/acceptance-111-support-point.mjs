import { openTestSession, sleep } from './cdp-session.mjs';

const session=await openTestSession({url:'http://127.0.0.1:3000',width:1440,height:900});
const {evaluate}=session;
const results=[];
const check=(name,ok,detail='')=>{
  results.push({name,passed:Boolean(ok),detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`);
};

const installAndBuy=async(stage,upgrades,upgradeId)=>{
  await evaluate(`(async()=>{
    const {createDefaultState}=await import('/src/state/defaultGameState.ts');
    const s=createDefaultState();
    s.playerFaction='vermelha';s.currentTerritoryId=1;s.gameSpeed=0;s.soundMuted=true;
    s.cash=1e12;s.ammo=1e12;s.respect=1e12;s.contacts=1e12;
    s.upgrades=${JSON.stringify(upgrades)};s.battleSnapshot=undefined;
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
  })()`);
  await sleep(950);
  await evaluate(`document.querySelector('button[aria-label="Bocas & Apoio"]')?.click()`);
  await sleep(120);
  const beforeText=await evaluate(`document.body.innerText`);
  check(`E${stage} precursor is visible`,beforeText.includes(`Ponto de Apoio · E${stage-1}`),`upgrade=${upgradeId}`);
  const clicked=await evaluate(`(()=>{
    const card=document.querySelector('[data-upgrade-id=${JSON.stringify(upgradeId)}]');
    const button=card?.querySelector('button');
    if(!button || button.disabled) return false;button.click();return true;
  })()`);
  check(`E${stage} purchase is available`,clicked,upgradeId);
  await sleep(300);
  check(`E${stage} promotion notice`,await evaluate(`document.body.innerText.includes('Ponto de Apoio evoluiu para o Estágio ${stage}.')`));
  check(`E${stage} support HUD updated`,await evaluate(`document.body.innerText.includes('Ponto de Apoio · E${stage}')`));
};

try{
  await installAndBuy(1,{boca_fortified_bunkers:9},'boca_fortified_bunkers');
  await installAndBuy(2,{boca_fortified_bunkers:29},'boca_fortified_bunkers');
  await installAndBuy(3,{boca_fortified_bunkers:40,boca_barricades:19},'boca_barricades');
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_111_SUPPORT_POINT passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length) process.exitCode=1;
}finally{await session.close();}
