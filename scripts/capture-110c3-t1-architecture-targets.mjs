import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const out='docs/screenshots/1.1c-architecture-b'; mkdirSync(out,{recursive:true});
const s=await openTestSession({url:'http://127.0.0.1:3001',width:1536,height:864});
const click=async(x,y)=>{await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});};
const shot=async name=>{const x=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`${out}/${name}.png`,Buffer.from(x.data,'base64'));};
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true})()`);await sleep(1800);
 await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Foco');b?.click();return true})()`);await sleep(350);
 const plus=()=>s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title?.startsWith('Aumentar Zoom'));b?.click();return !!b})()`);
 for(let i=0;i<5;i++){await plus();await sleep(70);} await sleep(250);
 const mm=await s.evaluate(`(()=>document.querySelectorAll('canvas')[1].getBoundingClientRect().toJSON())()`);
 const points=[['left-upper',.18,.34],['right-upper',.82,.34],['left-lower',.18,.72],['right-lower',.82,.72]];
 for(const [name,nx,ny] of points){await click(mm.x+mm.width*nx,mm.y+mm.height*ny);await sleep(320);await shot(`t1-architecture-b-${name}-close`);}
 console.log('targeted architecture review captured'); if(s.errors.length) console.log('errors',JSON.stringify(s.errors));
}finally{await s.close();}