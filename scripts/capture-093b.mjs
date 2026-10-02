import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3001',width:1536,height:864});
mkdirSync('docs/screenshots/0.9.3b',{recursive:true});
const spots={1:[315,220],2:[300,500],3:[310,330],4:[330,220],5:[330,190],6:[300,330]};
try{for(const territory of [1,2,3,4,5,6]){
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=${territory};g.runHighestTerritoryReached=${territory};g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);await sleep(2400);
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();return true})()`);await sleep(250);
 let shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`docs/screenshots/0.9.3b/t${territory}-100.png`,Buffer.from(shot.data,'base64'));
 const [x,y]=spots[territory];for(let i=0;i<9;i++){await s.send('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:0,deltaY:-130});await sleep(90);}await sleep(300);
 shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`docs/screenshots/0.9.3b/t${territory}-250.png`,Buffer.from(shot.data,'base64'));
}}finally{await s.close();}
