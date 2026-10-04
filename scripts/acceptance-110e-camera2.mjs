import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const url=process.env.BASE_URL||'http://127.0.0.1:3001';
const out='docs/screenshots/1.1e-camera';mkdirSync(out,{recursive:true});
const s=await openTestSession({url,width:1536,height:864});
const results=[];const check=(name,ok,detail='')=>{results.push({name,ok:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
const shot=async name=>{const im=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`${out}/${name}.png`,Buffer.from(im.data,'base64'));};
const button=(prefix)=>s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.title||'').startsWith(${JSON.stringify(prefix)}));b?.click();return b?.textContent?.trim()??null})()`);
const camera=()=>s.evaluate(`(()=>({perf:window.__GAME_PERF__??null,label:[...document.querySelectorAll('button')].find(b=>b.title==='Redefinir Zoom para 100%')?.textContent?.trim()??null,canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON()}))()`);
try{
  const pure=await s.evaluate(`(async()=>{const c=await import('/src/components/canvas/camera2D.ts');const vp={width:1130,height:649};const d=c.createDefaultCamera();const min=c.clampZoom(-10),max=c.clampZoom(99);const a={x:273,y:188};const w0=c.screenToWorld(a,{centerX:640,centerY:350,zoom:1.08},vp);const z=c.zoomCameraAtScreenPoint({centerX:640,centerY:350,zoom:1.08},1.44,a,vp);const w1=c.screenToWorld(a,z,vp);const small=c.zoomFromWheelDelta(1,-10),large=c.zoomFromWheelDelta(1,-120);return{d,min,max,stepIn:c.stepCameraZoom(1,1),stepOut:c.stepCameraZoom(1,-1),small,large,anchorDrift:Math.hypot(w1.x-w0.x,w1.y-w0.y),fit:c.fitCameraToWorld(vp,28)}})()`);
  check('default camera is intentionally tactical',Math.abs(pure.d.zoom-.94)<.001&&pure.d.centerY===350,JSON.stringify(pure.d));
  check('camera zoom range is 78% to 235%',pure.min===.78&&pure.max===2.35,`min=${pure.min} max=${pure.max}`);
  check('button zoom uses perceptual steps',pure.stepIn>1.11&&pure.stepIn<1.13&&pure.stepOut>.88&&pure.stepOut<.90,`in=${pure.stepIn} out=${pure.stepOut}`);
  check('wheel curve distinguishes small from large deltas',pure.small>1&&pure.small<1.03&&pure.large>pure.small,`small=${pure.small} large=${pure.large}`);
  check('cursor anchored zoom preserves world point',pure.anchorDrift<.001,`drift=${pure.anchorDrift}`);
  check('wide fit stays inside tactical range',pure.fit.zoom>=.78&&pure.fit.zoom<.90,JSON.stringify(pure.fit));

  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true})()`);
  await sleep(2100);
  await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Foco');b?.click();return true})()`);await sleep(400);
  let c=await camera();
  check('runtime opens near 94% framing',c.perf?.camera?.zoom>=.935&&c.perf?.camera?.zoom<=.945,`zoom=${c.perf?.camera?.zoom} label=${c.label}`);
  await shot('t1-camera-default-94');

  await button('Redefinir Zoom para 100%');await sleep(180);
  c=await camera();check('100% reset remains exact',c.label==='100%',`perfZoom=${c.perf?.camera?.zoom} label=${c.label}`);
  if(c.canvas){
    const x=c.canvas.x+c.canvas.width*.64,y=c.canvas.y+c.canvas.height*.55;
    await s.send('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaY:-10,deltaX:0});await sleep(220);
    const small=await camera();check('small wheel input no longer jumps 12%',small.label==='101%'||small.label==='102%',`perfZoom=${small.perf?.camera?.zoom} label=${small.label}`);
  }

  await button('Redefinir Zoom para 100%');for(let i=0;i<30;i++)await button('Aumentar Zoom');await sleep(1200);c=await camera();check('zoom-in clamps at 235%',Math.abs(c.perf?.camera?.zoom-2.35)<.002,`zoom=${c.perf?.camera?.zoom} label=${c.label}`);await shot('t1-camera-close-235');

  if(c.canvas){
    const sx=c.canvas.x+c.canvas.width*.52,sy=c.canvas.y+c.canvas.height*.55;
    await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x:sx,y:sy,button:'left',clickCount:1});
    await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:sx+780,y:sy+440,button:'left',buttons:1});
    await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:sx+780,y:sy+440,button:'left',clickCount:1});await sleep(250);
    const edge=await camera();check('close pan remains clamped and finite',Number.isFinite(edge.perf?.camera?.centerX)&&Number.isFinite(edge.perf?.camera?.centerY),JSON.stringify(edge.perf?.camera));await shot('t1-camera-close-edge');
  }

  await button('Centralizar em visão tática ampla');await sleep(1200);c=await camera();check('wide control fits the whole tactical world',c.perf?.camera?.zoom>=.78&&c.perf?.camera?.zoom<.9,`zoom=${c.perf?.camera?.zoom}`);await shot('t1-camera-wide');
  check('camera session has no runtime errors',s.errors.length===0,JSON.stringify(s.errors));
  writeFileSync(`${out}/metrics.json`,JSON.stringify({pure,runtime:c},null,2));
  const failed=results.filter(r=>!r.ok);console.log(`ACCEPTANCE_110E_CAMERA passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await s.close();}