import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const session=await openTestSession({url:'http://localhost:3001',width:1536,height:864});
const {evaluate,send}=session;
const out='docs/screenshots/1.1g-combat';
mkdirSync(out,{recursive:true});
const metrics=[];
try {
  for (const territory of [1,3,6]) {
    await installFixture(session,{territory,allies:24,rivals:16,speed:1});
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Foco'));if(b&&!b.textContent?.includes('ativo'))b.click();return true})()`);
    await sleep(2800);
    const state=await evaluate(`(()=>({perf:(window.__PERF_METRICS__||window.__GAME_PERF__||null),canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON()}))()`);
    metrics.push({territory,...state});
    const rect=state.canvas;
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{x:rect.x,y:rect.y,width:rect.width,height:rect.height,scale:1}});
    writeFileSync(`${out}/territory-${territory}.png`,Buffer.from(shot.data,'base64'));
    console.log('captured 1.1G combat',territory);
  }
  writeFileSync(`${out}/metrics.json`,JSON.stringify(metrics,null,2));
  if(session.errors.length){console.error(session.errors);process.exitCode=1;}
} finally { await session.close(); }
