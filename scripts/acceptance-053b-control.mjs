import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const session = await openTestSession({ url:'http://localhost:3000', width:1440, height:900 });
const { evaluate, send } = session;
const results=[];
const check=(name,ok,detail='')=>{
  results.push({name,passed:!!ok,detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`);
};
mkdirSync('docs/screenshots/0.5.3/control',{recursive:true});

const install = async (territory, faction, dominated) => {
  await evaluate(`(async()=>{
    const {createDefaultState}=await import('/src/state/defaultGameState.ts');
    const s=createDefaultState();
    s.playerFaction='${faction}';
    s.currentTerritoryId=${territory};
    s.runHighestTerritoryReached=${territory};
    s.territoryTakes=${dominated ? 9999 : 0};
    s.gameSpeed=0;s.soundMuted=true;s.battleSnapshot=undefined;
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));
    location.reload();return true;
  })()`);
  await sleep(1100);
};const capture = async (name) => {
  const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
  const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
  writeFileSync(`docs/screenshots/0.5.3/control/${name}.png`,Buffer.from(shot.data,'base64'));
};

try {
  for (const territory of [4,5,6]) {
    await install(territory,'vermelha',false);
    const preCv=await evaluate(`(()=>document.querySelector('canvas')?.toDataURL('image/png') ?? '')()`);
    await capture(`t${territory}-cv-rival-pcc`);

    await install(territory,'vermelha',true);
    const postCv=await evaluate(`(()=>document.querySelector('canvas')?.toDataURL('image/png') ?? '')()`);
    await capture(`t${territory}-cv-dominado`);
    check(`T${territory} changes when CV conquers`,preCv!==postCv,'rival PCC -> jogador CV');

    await install(territory,'azul',false);
    const prePcc=await evaluate(`(()=>document.querySelector('canvas')?.toDataURL('image/png') ?? '')()`);
    await capture(`t${territory}-pcc-rival-cv`);
    check(`T${territory} inverts with PCC campaign`,prePcc!==preCv,'rival CV vs rival PCC');
  }

  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failures=results.filter(r=>!r.passed);
  writeFileSync('docs/acceptance-053b-control.json',JSON.stringify(results,null,2));
  console.log(`ACCEPTANCE_053B_CONTROL passed=${results.length-failures.length} failed=${failures.length}`);
  if(failures.length)process.exitCode=1;
} finally { await session.close(); }
