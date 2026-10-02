import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const session=await openTestSession({url:'http://localhost:3001',width:1440,height:900});
const {evaluate,send}=session;
const results=[];
const hashes=new Set();
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
mkdirSync('docs/screenshots/0.5.4',{recursive:true});
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');

try {
  for(let territory=1;territory<=6;territory++){
    await evaluate(`(async()=>{
      const {createDefaultState}=await import('/src/state/defaultGameState.ts');
      const s=createDefaultState();
      s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};
      s.gameSpeed=0;s.soundMuted=true;s.maxAllies=80;s.battleSnapshot=undefined;
      localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
    })()`);
    await sleep(1150);    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    await sleep(180);
    const perf=await evaluate(`window.__GAME_PERF__`);
    check(`T${territory} physics`,(perf?.solidWorldViolations??99)===0,`violations=${perf?.solidWorldViolations}; colliders=${perf?.worldColliders}`);

    const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
    const buffer=Buffer.from(shot.data,'base64');
    const out=`docs/screenshots/0.5.4/territory-${territory}.png`;
    writeFileSync(out,buffer);hashes.add(sha(buffer));

    const previous=`docs/screenshots/0.5.3/territory-${territory}.png`;
    const changed=!existsSync(previous)||sha(buffer)!==sha(readFileSync(previous));
    check(`T${territory} visual polish changed frame`,changed,changed?'new 0.5.4 frame':'unexpected identical frame');
  }

  check('six distinct polished territories',hashes.size===6,`images=${hashes.size}`);
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));  const failures=results.filter(r=>!r.passed);
  writeFileSync('docs/acceptance-054-polish.json',JSON.stringify(results,null,2));
  console.log(`ACCEPTANCE_054_POLISH passed=${results.length-failures.length} failed=${failures.length}`);
  if(failures.length)process.exitCode=1;
} finally {
  await session.close();
}
