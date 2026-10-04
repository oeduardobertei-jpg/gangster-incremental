import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const session = await openTestSession({ width: 1440, height: 900 });
const { send, evaluate } = session;
const results=[];
const signatures=new Set();
const imageHashes=new Set();
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
mkdirSync('docs/screenshots/0.5.2',{recursive:true});

const expectedKinds={
  1:['low_wall','stall','dumpster','bench'],
  2:['stall','barricade','crate_stack'],
  3:['container','pallets','service_unit'],
  4:['sandbags','watch_post','barricade'],
  5:['planter','security_booth','parked_car'],
  6:['checkpoint','sandbags','service_unit']
};

try{
  for(let territory=1;territory<=6;territory++){
    const inspection=await evaluate(`(async()=>{
      const {getTerritoryPurposeProps}=await import('/src/data/territoryPurposeProps.ts');
      const {getTacticalBuildings}=await import('/src/components/canvas/favelaRenderer.ts');
      const {FACTION_CONFIGS}=await import('/src/data/gameData.ts');
      const props=getTerritoryPurposeProps(${territory});
      const buildings=getTacticalBuildings(1280,720,FACTION_CONFIGS.vermelha,${territory});
      return {props:props.map(p=>({id:p.id,kind:p.kind,solid:!!p.solid})),buildings:buildings.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h,label:b.label}))};
    })()`);
    const kinds=new Set(inspection.props.map(p=>p.kind));
    check(`T${territory} purposeful prop set`,inspection.props.length>=7,`props=${inspection.props.length}`);
    check(`T${territory} functional solids`,inspection.props.filter(p=>p.solid).length>=6,`solids=${inspection.props.filter(p=>p.solid).length}`);
    check(`T${territory} identity props`,expectedKinds[territory].every(k=>kinds.has(k)),[...kinds].join(','));
    const signature=JSON.stringify(inspection.buildings.map(b=>[Math.round(b.x),Math.round(b.y),b.w,b.h]));
    signatures.add(signature);
    await evaluate(`(async()=>{
      const {createDefaultState}=await import('/src/state/defaultGameState.ts');
      const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};
      s.gameSpeed=0;s.soundMuted=true;s.maxAllies=80;s.cash=5000;s.ammo=5000;s.respect=5000;s.contacts=5000;
      s.upgrades={boca_fortified_bunkers:15,intel_radio_network:18,intel_central_command:12,armory_motorcycle_squad:9,armory_medics_safehouse:7,boca_auto_ammo_scavenge:5,sindicato_auto_recruit:2};
      s.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
    })()`);
    await sleep(1350);
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    await sleep(220);
    const perf=await evaluate(`window.__GAME_PERF__`);
    check(`T${territory} visual scene stays physically valid`,(perf?.solidWorldViolations??99)===0,`colliders=${perf?.worldColliders},violations=${perf?.solidWorldViolations}`);
    const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
    const buffer=Buffer.from(shot.data,'base64');
    writeFileSync(`docs/screenshots/0.5.2/territory-${territory}.png`,buffer);
    imageHashes.add(createHash('sha256').update(buffer).digest('hex'));
  }

  check('all six districts use distinct authored building layouts',signatures.size===6,`layouts=${signatures.size}`);
  check('all six visual captures are distinct',imageHashes.size===6,`images=${imageHashes.size}`);
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failures=results.filter(r=>!r.passed);
  writeFileSync('docs/acceptance-052-purpose.json',JSON.stringify(results,null,2));
  console.log(`ACCEPTANCE_052_PURPOSE passed=${results.length-failures.length} failed=${failures.length}`);
  if(failures.length)process.exitCode=1;
}finally{await session.close();}
