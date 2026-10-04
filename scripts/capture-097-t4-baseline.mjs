import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/t4-097-baseline',{recursive:true});
const snap=async name=>{const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`docs/screenshots/t4-097-baseline/${name}.png`,Buffer.from(shot.data,'base64'));};
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=4;g.runHighestTerritoryReached=4;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);await sleep(2500);
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();return true})()`);await sleep(600);await snap('t4-baseline-100');
 await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title?.includes('Aumentar Zoom'));if(b){b.click();b.click();b.click();}return true})()`);await sleep(700);await snap('t4-baseline-close');
}finally{await s.close();}
