import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3013',width:1280,height:720});
mkdirSync('docs/screenshots/t1-095OT',{recursive:true});
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=2;g.territoryTakes=40;g.gameSpeed=0;g.soundMuted=true;g.maxAllies=24;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 await sleep(2500);
 const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});
 writeFileSync('docs/screenshots/t1-095OT/t1-dominated-full.png',Buffer.from(shot.data,'base64'));
 const r=await s.evaluate(`(()=>{const e=document.querySelector('.battle-hud');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()`);
 if(r){const h=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{x:r.x,y:r.y,width:r.width,height:r.height,scale:1}});writeFileSync('docs/screenshots/t1-095OT/t1-dominated-hud.png',Buffer.from(h.data,'base64'));}
}finally{await s.close();}
