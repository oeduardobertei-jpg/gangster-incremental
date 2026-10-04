import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3013',width:1280,height:720});
mkdirSync('docs/screenshots/t1-095OT',{recursive:true});
try{
 await installFixture(s,{territory:1,allies:12,rivals:8,speed:1});await sleep(1800);
 await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title?.includes('Aumentar Zoom'));if(b){b.click();b.click();b.click();}return true})()`);await sleep(1000);
 const r=await s.evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};})()`);
 const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...r,scale:1}});
 writeFileSync('docs/screenshots/t1-095OT/t1-combat-grounding.png',Buffer.from(shot.data,'base64'));
 const perf=await s.evaluate('window.__GAME_PERF__');console.log(JSON.stringify({fps:perf?.fps,violations:perf?.solidWorldViolations,allies:perf?.allies,rivals:perf?.rivals}));
 if(s.errors.length){console.error(s.errors);process.exitCode=1;}
}finally{await s.close();}
