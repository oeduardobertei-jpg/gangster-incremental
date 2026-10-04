import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const out='docs/screenshots/base-incremental-0910NO';
mkdirSync(out,{recursive:true});
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});

const capture=async(name,selection)=>{
  await s.evaluate(`(()=>{window.__BASE_VISUAL_PREVIEW__?.set(${JSON.stringify(selection)});return true})()`);
  await sleep(450);
  const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});
  writeFileSync(`${out}/${name}.png`,Buffer.from(shot.data,'base64'));
};

try{
  await sleep(1600);
  await s.evaluate(`(()=>{[...document.querySelectorAll('button')].find(x=>x.title==='Redefinir Zoom para 100%')?.click();return true})()`);
  await sleep(350);
  for(const stage of [0,1,2,3]) await capture(`stage-${stage}`,{kind:'stage',stage});
  for(const group of ['armory','boca','intel','sindicato']) {
    await capture(`branch-${group}`,{kind:'branch',group});
  }
  await capture('all-max',{kind:'max'});
  await capture('honors-5',{kind:'honors',count:5});
  await s.evaluate(`(()=>{window.__BASE_VISUAL_PREVIEW__?.clear();return true})()`);
  console.log('BASE_INCREMENTAL_GALLERY_OK');
  if(s.errors.length) console.log('RUNTIME_ERRORS',s.errors);
} finally {
  await s.close();
}
