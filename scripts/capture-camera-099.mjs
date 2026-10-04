import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/camera-099',{recursive:true});
const shot=async name=>{const r=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`docs/screenshots/camera-099/${name}.png`,Buffer.from(r.data,'base64'));};
const zoomText=()=>s.evaluate(`(()=>[...document.querySelectorAll('button')].find(b=>/%$/.test(b.textContent?.trim()||''))?.textContent?.trim())()`);
try{
 await sleep(1800);
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(b=>b.title==='Centralizar em visão tática ampla')?.click();return true})()`); await sleep(350);
 console.log('wide',await zoomText()); await shot('wide');
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(b=>b.title==='Redefinir Zoom para 100%')?.click();const p=[...document.querySelectorAll('button')].find(b=>b.title?.startsWith('Aumentar Zoom'));for(let i=0;i<30;i++)p?.click();return true})()`); await sleep(350);
 console.log('max',await zoomText()); await shot('max');
 const rect=await s.evaluate(`(()=>{const r=document.querySelector('canvas')?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height}:null})()`);
 if(rect){const x=rect.x+rect.w*.5,y=rect.y+rect.h*.5;await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+420,y:y+220,button:'left'});await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+420,y:y+220,button:'left',clickCount:1});await sleep(300);await shot('max-pan-edge');}
}finally{await s.close();}
