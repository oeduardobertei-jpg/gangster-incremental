import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const session = await openTestSession({ url:'http://localhost:3001', width:1440, height:900 });
const { send, evaluate } = session;
const results=[];
const imageHashes=new Set();
const biomeSignatures=new Set();
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
mkdirSync('docs/screenshots/0.5.3',{recursive:true});

try {
  for(let territory=1; territory<=6; territory++) {
    const biome=await evaluate(`(async()=>{
      const {getTerritoryBiome}=await import('/src/data/territoryBiomes.ts');
      const b=getTerritoryBiome(${territory});
      return {id:b.id,codename:b.codename,patches:b.patches,noise:b.noiseDensity,cracks:b.crackDensity,wet:b.wetness};
    })()`);
    check(`T${territory} biome profile`,biome.id===territory && biome.patches.length>=4,`${biome.codename}; patches=${biome.patches.length}`);
    biomeSignatures.add(JSON.stringify(biome));
    await evaluate(`(async()=>{
      const {createDefaultState}=await import('/src/state/defaultGameState.ts');
      const s=createDefaultState();
      s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.gameSpeed=0;s.soundMuted=true;
      s.maxAllies=80;s.cash=5000;s.ammo=5000;s.respect=5000;s.contacts=5000;
      s.battleSnapshot=undefined;
      localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
    })()`);
    await sleep(1200);
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    await sleep(220);
    const perf=await evaluate(`window.__GAME_PERF__`);
    check(`T${territory} physics remains valid`,(perf?.solidWorldViolations??99)===0,`violations=${perf?.solidWorldViolations}; colliders=${perf?.worldColliders}`);
    const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
    const buffer=Buffer.from(shot.data,'base64');
    writeFileSync(`docs/screenshots/0.5.3/territory-${territory}.png`,buffer);
    imageHashes.add(createHash('sha256').update(buffer).digest('hex'));
  }

  check('six authored biome signatures',biomeSignatures.size===6,`biomes=${biomeSignatures.size}`);
  check('six distinct visual captures',imageHashes.size===6,`images=${imageHashes.size}`);
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failures=results.filter(r=>!r.passed);
  writeFileSync('docs/acceptance-053-ground.json',JSON.stringify(results,null,2));
  console.log(`ACCEPTANCE_053_GROUND passed=${results.length-failures.length} failed=${failures.length}`);
  if(failures.length)process.exitCode=1;
} finally {
  await session.close();
}
