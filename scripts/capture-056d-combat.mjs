import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const session=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const {evaluate,send}=session;
mkdirSync('docs/screenshots/0.5.6d/combat',{recursive:true});
try {
  for (const territory of [1,3,6]) {
    await installFixture(session,{territory,allies:24,rivals:16,speed:1});
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    await sleep(2500);
    const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
    writeFileSync(`docs/screenshots/0.5.6d/combat/territory-${territory}.png`,Buffer.from(shot.data,'base64'));
    const perf=await evaluate('window.__GAME_PERF__');
    console.log(`captured combat T${territory} fps=${perf?.fps?.toFixed?.(1)} violations=${perf?.solidWorldViolations}`);
  }
  if(session.errors.length){console.error(session.errors);process.exitCode=1;}
} finally { await session.close(); }
