import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const outDir='docs/screenshots/1.1j-performance'; mkdirSync(outDir,{recursive:true});
const s=await openTestSession({url:'http://127.0.0.1:3001',width:1536,height:864});
const shot=async name=>{const image=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`${outDir}/${name}.png`,Buffer.from(image.data,'base64'));};
const clickTitle=title=>s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title===${JSON.stringify(title)});b?.click();return !!b})()`);
try{
  for(const territory of [5,6]){
    await installFixture(s,{territory,allies:48,rivals:20,speed:0}); await sleep(1800); await shot(`t${territory}-mass-lod-wide`);
    if(territory===5){for(let i=0;i<4;i++){await clickTitle('Aumentar Zoom (ou role a roda do mouse para cima)');await sleep(120);} await sleep(500); await shot('t5-mass-close-full-detail');}
  }
  const metrics=await s.evaluate(`(()=>({perf:window.__GAME_PERF__,canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON(),errors:[]}))()`);
  writeFileSync(`${outDir}/metrics.json`,JSON.stringify({metrics,runtimeErrors:s.errors},null,2));
  if(s.errors.length) throw new Error(s.errors.join(' | '));
  console.log('1.1J captures complete');
}finally{await s.close();}
