import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const session=await openTestSession({url:'http://localhost:3001',width:1440,height:900});
const {send,evaluate}=session; mkdirSync('docs/screenshots/0.5.6b1',{recursive:true});
try{
  for(let territory=1;territory<=6;territory++){
    await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.gameSpeed=0;s.soundMuted=true;s.maxAllies=90;s.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;})()`);
    await sleep(1200);
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    await sleep(180);
    const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
    writeFileSync(`docs/screenshots/0.5.6b1/territory-${territory}.png`,Buffer.from(shot.data,'base64'));
    console.log('captured',territory);
  }
}finally{await session.close();}
