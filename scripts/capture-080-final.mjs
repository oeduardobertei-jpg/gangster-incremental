import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const session=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const {evaluate,send}=session;
mkdirSync('docs/screenshots/0.8-final',{recursive:true});
try{
  for(let territory=1;territory<=6;territory++){
    await evaluate(`(async()=>{
      const {createDefaultState}=await import('/src/state/defaultGameState.ts');
      const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};
      s.gameSpeed=0;s.soundMuted=true;s.battleSnapshot=undefined;
      localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
    })()`);
    for(let wait=0;wait<30;wait++){
      if(await evaluate(`!!document.querySelector('canvas')`)) break;
      await sleep(150);
    }
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    await sleep(1450);
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('title')?.includes('Diminuir Zoom'));if(b){b.click();b.click();}return true})()`);
    await sleep(180);
    const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
    writeFileSync(`docs/screenshots/0.8-final/territory-${territory}.png`,Buffer.from(shot.data,'base64'));
    console.log('captured',territory);
  }
  if(session.errors.length){console.error(session.errors);process.exitCode=1;}
} finally {
  await session.close();
}
