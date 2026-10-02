import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const session=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const {evaluate,send}=session;
mkdirSync('docs/screenshots/0.8o-access',{recursive:true});
try{
  for(const territory of [4,5,6]){
    await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.gameSpeed=0;s.soundMuted=true;s.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;})()`);
    for(let i=0;i<30;i++){if(await evaluate(`!!document.querySelector('canvas')`))break;await sleep(120);}
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    await sleep(1000);
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('title')?.includes('Diminuir Zoom'));if(b){b.click();b.click();}return true})()`);
    await sleep(160);
    const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
    writeFileSync(`docs/screenshots/0.8o-access/territory-${territory}.png`,Buffer.from(shot.data,'base64'));
    console.log('captured',territory);
  }
} finally { try{await session.close();}catch{} }
