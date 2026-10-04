import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const {evaluate,send}=s; mkdirSync('docs/screenshots/0.8o-access',{recursive:true});
try{
 await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=6;g.runHighestTerritoryReached=6;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 for(let i=0;i<30;i++){if(await evaluate(`!!document.querySelector('canvas')`))break;await sleep(120);}
 await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`); await sleep(900);
 await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('title')?.includes('Diminuir Zoom'));if(b){b.click();b.click();}return true})()`); await sleep(160);
 const r=await evaluate(`(()=>{const c=document.querySelector('canvas');const q=c.parentElement.getBoundingClientRect();return{x:q.x,y:q.y,width:q.width,height:q.height}})()`);
 const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...r,scale:1}});
 writeFileSync('docs/screenshots/0.8o-access/territory-6.png',Buffer.from(shot.data,'base64')); console.log('captured 6');
}finally{try{await s.close();}catch{}}
