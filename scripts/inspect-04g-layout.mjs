import { openTestSession, sleep } from './cdp-session.mjs';
const session=await openTestSession();
const {send,evaluate}=session;
try {
  for(const [width,height] of [[1440,600],[1024,700],[390,740]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await sleep(350);
    console.log(JSON.stringify(await evaluate(`(()=>{
      const canvas=document.querySelector('canvas'),r=canvas.getBoundingClientRect(),p=canvas.parentElement.parentElement.getBoundingClientRect();
      const hud=canvas.parentElement.querySelector('.pointer-events-none'),h=hud.getBoundingClientRect();
      const camera=document.querySelector('button[title^="Centralizar"]').parentElement.getBoundingClientRect();
      return {width:innerWidth,height:innerHeight,canvasBottom:r.bottom,availableBottom:p.bottom,
        hudCameraOverlap:h.left<camera.right&&h.right>camera.left&&h.top<camera.bottom&&h.bottom>camera.top};
    })()`)));
  }
} finally {await session.close();}
