import { openTestSession, sleep } from './cdp-session.mjs';
const session = await openTestSession({ width: 1440, height: 900 });
const { evaluate } = session;
const results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
const expected=[0,10,14,18,22,26,30];
const waitForIntro=async(territory,timeout=1300)=>{
  const start=Date.now();let text='';
  while(Date.now()-start<timeout){
    text=await evaluate(`document.querySelector('[data-testid="territory-intro"]')?.innerText||''`);
    if(text.includes(`DISTRITO 0${territory}`))return text;
    await sleep(50);
  }
  return text;
};
const waitForIntroGone=async(timeout=1900)=>{
  const start=Date.now();
  while(Date.now()-start<timeout){
    if(await evaluate(`!document.querySelector('[data-testid="territory-intro"]')`))return true;
    await sleep(50);
  }
  return false;
};
try {
  for(let territory=1;territory<=6;territory++){
    await evaluate(`(async()=>{
      const {createDefaultState}=await import('/src/state/defaultGameState.ts');
      const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.gameSpeed=0;s.soundMuted=true;s.battleSnapshot=undefined;
      localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
    })()`);
    const intro=await waitForIntro(territory);
    check(`T${territory} arrival card identifies district`,intro.includes(`DISTRITO 0${territory}`),intro.replace(/\n/g,' | '));
    check(`T${territory} arrival card exposes opening pressure`,intro.includes(`GUARNIÇÃO INICIAL ${expected[territory]}`),intro.replace(/\n/g,' | '));
    check(`T${territory} arrival card clears quickly`,await waitForIntroGone());
  }

  await evaluate(`(()=>{const toggle=document.querySelector('[aria-controls="evolution-panel"]');if(toggle&&toggle.getAttribute('aria-expanded')==='false')toggle.click();const arsenal=document.querySelector('button[aria-label="Arsenal ($)"]');if(arsenal)arsenal.click();return true})()`);
  await sleep(150);
  const lowPanel=await evaluate(`document.body.innerText.toLowerCase().includes('oficina de combate')&&document.body.innerText.toLowerCase().includes('tier visual 0/5')`);
  check('upgrade workshop visual language is active',lowPanel);

  await evaluate(`(()=>{const k='factions_war_pt_br_save_v2',s=JSON.parse(localStorage.getItem(k));s.upgrades.armory_bulletproof_vest=50;localStorage.setItem(k,JSON.stringify(s));location.reload();return true})()`);
  await sleep(1400);
  await evaluate(`(()=>{const toggle=document.querySelector('[aria-controls="evolution-panel"]');if(toggle&&toggle.getAttribute('aria-expanded')==='false')toggle.click();const arsenal=document.querySelector('button[aria-label="Arsenal ($)"]');if(arsenal)arsenal.click();return true})()`);
  await sleep(120);
  const maxPanel=await evaluate(`document.body.innerText.toLowerCase().includes('tier visual 5/5')&&document.body.innerText.toLowerCase().includes('estrutura completa')`);
  check('maxed upgrade exposes completed visual tier',maxPanel);
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failures=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_05_VISUAL passed=${results.length-failures.length} failed=${failures.length}`);
  if(failures.length)process.exitCode=1;
}finally{await session.close();}