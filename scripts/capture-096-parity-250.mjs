import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/t1-096-parity',{recursive:true});
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 await sleep(2200);
 await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title?.includes('Aumentar Zoom'));if(b)for(let i=0;i<20;i++)b.click();return true})()`);
 await sleep(700);
 const r=await s.evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
 const x=r.x+r.width*.48,y=r.y+r.height*.50;
 await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
 await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+360,y:y+190,button:'left',buttons:1});
 await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+360,y:y+190,button:'left',clickCount:1});
 await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
 await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+360,y:y+180,button:'left',buttons:1});
 await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+360,y:y+180,button:'left',clickCount:1});
 await sleep(900);
 const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});
 writeFileSync('docs/screenshots/t1-096-parity/t1-upper-left-250.png',Buffer.from(shot.data,'base64'));
}finally{await s.close();}

