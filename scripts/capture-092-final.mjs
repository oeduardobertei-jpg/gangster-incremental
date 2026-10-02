import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3001',width:1536,height:864});
mkdirSync('docs/screenshots/0.9.2-final',{recursive:true});
try{for(const territory of [1,2,4]){
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=${territory};g.runHighestTerritoryReached=${territory};g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 await sleep(1900);
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();return true})()`);await sleep(350);
 const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});
 writeFileSync(`docs/screenshots/0.9.2-final/territory-${territory}.png`,Buffer.from(shot.data,'base64'));
}}finally{await s.close();}
