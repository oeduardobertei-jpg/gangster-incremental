import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3001',width:1536,height:864});
const {evaluate,send}=s;
mkdirSync('docs/screenshots/0.9a',{recursive:true});
const snap=async(name)=>{const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`docs/screenshots/0.9a/${name}.png`,Buffer.from(shot.data,'base64'));};
try{
  for(const territory of [1,4]){
    await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=${territory};g.runHighestTerritoryReached=${territory};g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
    for(let i=0;i<30;i++){if(await evaluate(`!!document.querySelector('canvas')`))break;await sleep(120);}
    await sleep(1800);
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Mapa inteiro'));b?.click();return !!b})()`);
    await sleep(400);await snap(`t${territory}-fit`);
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('title')?.includes('Redefinir Zoom'));b?.click();return !!b})()`);
    await sleep(350);await snap(`t${territory}-100`);
  }
}finally{try{await s.close();}catch{}}

