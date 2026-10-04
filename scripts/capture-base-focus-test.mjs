import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
mkdirSync('docs/screenshots/base-incremental-0910NO/focus',{recursive:true});
try{
  await sleep(1000);
  await s.evaluate(`(()=>{window.__BASE_VISUAL_PREVIEW__?.set({kind:'stage',stage:3});[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='+');for(let i=0;i<6;i++)b?.click();return true})()`);
  await sleep(250);
  await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x:760,y:330,button:'left',clickCount:1});
  await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:760,y:620,button:'left',buttons:1});
  await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:760,y:620,button:'left',clickCount:1});
  await sleep(350);
  const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});
  writeFileSync('docs/screenshots/base-incremental-0910NO/focus/stage3-focus.png',Buffer.from(shot.data,'base64'));
  console.log('FOCUS_OK');
}finally{await s.close();}
