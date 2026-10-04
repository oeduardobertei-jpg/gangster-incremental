import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/camera-099',{recursive:true});
try{
 await sleep(1800);
 const controls=await s.evaluate(`(()=>{const buttons=[...document.querySelectorAll('button')];return buttons.map((b,i)=>({i,title:b.title,text:b.textContent?.trim(),r:b.getBoundingClientRect().toJSON()})).filter(x=>x.title?.includes('Zoom')||x.title?.includes('mapa inteiro'))})()`);
 console.log('controls',JSON.stringify(controls));
 // Reset to 100 then zoom out repeatedly.
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(b=>b.title==='Redefinir Zoom para 100%')?.click();const minus=[...document.querySelectorAll('button')].find(b=>b.title?.startsWith('Diminuir Zoom'));for(let i=0;i<20;i++)minus?.click();return true})()`); await sleep(400);
 const minLabel=await s.evaluate(`(()=>[...document.querySelectorAll('button')].find(b=>b.title==='Redefinir Zoom para 100%')?.textContent?.trim())()`);
 console.log('minZoomLabel',minLabel);
 let shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync('docs/screenshots/camera-099/min-zoom.png',Buffer.from(shot.data,'base64'));
 // Max zoom.
 await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(b=>b.title==='Redefinir Zoom para 100%')?.click();const plus=[...document.querySelectorAll('button')].find(b=>b.title?.startsWith('Aumentar Zoom'));for(let i=0;i<20;i++)plus?.click();return true})()`); await sleep(400);
 const maxLabel=await s.evaluate(`(()=>[...document.querySelectorAll('button')].find(b=>b.title==='Redefinir Zoom para 100%')?.textContent?.trim())()`);
 console.log('maxZoomLabel',maxLabel);
 const rect=await s.evaluate(`(()=>document.querySelector('canvas')?.getBoundingClientRect().toJSON())()`);
 console.log('canvasRect',JSON.stringify(rect));
 if(rect){
   const sx=rect.x+rect.width*.52, sy=rect.y+rect.height*.58;
   await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x:sx,y:sy,button:'left',clickCount:1});
   await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:sx+900,y:sy+520,button:'left',buttons:1});
   await sleep(150);
   await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:sx+900,y:sy+520,button:'left',clickCount:1});
   await sleep(500);
 }
 shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync('docs/screenshots/camera-099/max-zoom-pan.png',Buffer.from(shot.data,'base64'));
}finally{await s.close();}
