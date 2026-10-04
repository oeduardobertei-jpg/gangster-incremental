import type { TacticalBuilding } from './favelaRenderer';

const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const find=(buildings:readonly TacticalBuilding[],id:string)=>buildings.find(b=>b.id===id);

export function drawT1ForegroundFraming(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,
  buildings:readonly TacticalBuilding[]
){
  if(territoryId!==1) return;
  ctx.save();
  // 0.9.5P: framing lives at the margins; combat lanes remain visually open.
  const left=ctx.createLinearGradient(0,0,w*.12,0);
  left.addColorStop(0,'rgba(5,9,12,.16)');left.addColorStop(1,'rgba(5,9,12,0)');
  ctx.fillStyle=left;ctx.fillRect(0,0,w*.14,h);
  const bottom=ctx.createLinearGradient(0,h,0,h*.86);
  bottom.addColorStop(0,'rgba(4,7,10,.13)');bottom.addColorStop(1,'rgba(4,7,10,0)');
  ctx.fillStyle=bottom;ctx.fillRect(0,h*.84,w,h*.16);
  // Cleanup final: detached lower-left foreground bar/posts retired.

  // Service cluster near safehouse: a quiet frame, not another landmark.
  const safe=find(buildings,'esconderijo');
  if(safe){
    rect(ctx,safe.x+safe.w+15,safe.y+safe.h-12,26,7,'rgba(61,70,74,.48)','rgba(120,130,134,.18)');
    line(ctx,safe.x+safe.w+21,safe.y+safe.h-12,safe.x+safe.w+21,safe.y+safe.h-29,'rgba(89,101,111,.52)',2);
    ctx.fillStyle='rgba(36,61,45,.48)';ctx.beginPath();ctx.arc(safe.x+safe.w+39,safe.y+safe.h+1,8,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

export function drawT1CharacterGrounding(
  ctx:CanvasRenderingContext2D,territoryId:number,x:number,y:number,
  radius:number,isRival:boolean,time:number,zoom:number
){
  if(territoryId!==1) return;
  ctx.save();
  const scale=Math.max(.72,Math.min(1.25,zoom));
  const pulse=.5+.5*Math.sin(time*.002+x*.017+y*.013);
  // 0.9.5Q: directional cast shadow + local bounce ties sprites to the same light field as buildings.
  ctx.fillStyle='rgba(0,0,0,.10)';ctx.beginPath();
  ctx.ellipse(x+5*scale,y+7*scale,Math.max(8,radius*.92+3)*scale,3.4*scale,-.16,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=isRival?`rgba(255,116,73,${.018+.010*pulse})`:`rgba(91,200,255,${.014+.008*pulse})`;
  ctx.beginPath();ctx.ellipse(x,y+4*scale,Math.max(7,radius*.78)*scale,2.5*scale,0,0,Math.PI*2);ctx.fill();
  if(zoom>1.35){
    ctx.strokeStyle=isRival?'rgba(255,151,112,.075)':'rgba(148,216,255,.060)';ctx.lineWidth=.7;
    ctx.beginPath();ctx.arc(x,y+1,Math.max(8,radius*.74),0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}
export function drawT1LandmarkReadability(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,
  buildings:readonly TacticalBuilding[],zoom:number
){
  if(territoryId!==1) return;
  ctx.save();
  // 0.9.5R: landmarks receive small contrast pockets instead of floating UI markers.
  const ids=['barraquinha','boca_leste','esconderijo'] as const;
  for(const id of ids){
    const b=find(buildings,id);if(!b) continue;
    const cx=b.x+b.w*.5,cy=b.y+b.h*.54;
    const g=ctx.createRadialGradient(cx,cy,4,cx,cy,Math.max(b.w,b.h)*.82);
    g.addColorStop(0,'rgba(255,183,92,.022)');g.addColorStop(.58,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(2,6,10,.055)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx,cy,b.w*.80,b.h*.76,0,0,Math.PI*2);ctx.fill();
  }
  if(zoom>=1.45){
    // Thin edge highlights make landmark materials survive close zoom without bright outlines.
    for(const id of ['barraquinha','boca_leste'] as const){const b=find(buildings,id);if(!b)continue;
      line(ctx,b.x+4,b.y-2,b.x+b.w-5,b.y-2,'rgba(255,189,125,.09)',.8);
    }
  }
  ctx.restore();
}

export function drawT1AtmosphericContrast(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,zoom:number
){
  if(territoryId!==1) return;
  ctx.save();
  // 0.9.5S: crisp center, atmospheric edges. No global fog over units.
  const center=ctx.createRadialGradient(w*.51,h*.53,Math.min(w,h)*.11,w*.51,h*.53,Math.min(w,h)*.52);
  center.addColorStop(0,'rgba(12,19,25,0)');
  center.addColorStop(.70,'rgba(7,14,20,.009)');center.addColorStop(1,'rgba(4,10,16,.038)');
  ctx.fillStyle=center;ctx.fillRect(0,0,w,h);
  if(zoom<1.35){
    const horizon=ctx.createLinearGradient(0,h*.08,0,h*.34);
    horizon.addColorStop(0,'rgba(113,143,160,.020)');horizon.addColorStop(1,'rgba(113,143,160,0)');
    ctx.fillStyle=horizon;ctx.fillRect(0,h*.06,w,h*.30);
  }
  ctx.restore();
}
export function drawT1MicroBeauty(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,time:number,zoom:number
){
  if(territoryId!==1||zoom<1.18) return;
  ctx.save();
  // 0.9.5T: details are sparse and material-specific; no confetti/noise field.
  const shimmer=.5+.5*Math.sin(time*.0028);
  for(const [nx,ny] of [[.155,.409],[.812,.394],[.742,.766],[.095,.742]] as const){
    const x=w*nx,y=h*ny;ctx.fillStyle=`rgba(224,191,151,${.055+.018*shimmer})`;
    ctx.fillRect(x,y,2,2);ctx.fillRect(x+5,y+2,1.5,1.5);
  }
  ctx.strokeStyle=`rgba(183,212,226,${.045+.020*shimmer})`;ctx.lineWidth=.7;
  for(const [nx,ny,len] of [[.427,.723,21],[.583,.472,15],[.286,.684,13],[.676,.817,17]] as const){
    const x=w*nx,y=h*ny;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+len,y+1);ctx.stroke();
  }
  if(zoom>=1.75){
    // Tiny wall chips/bolts only exist where the close-up can resolve them.
    ctx.fillStyle='rgba(214,224,229,.085)';
    for(const [nx,ny] of [[.261,.248],[.718,.305],[.094,.584],[.858,.530],[.790,.681],[.160,.825]] as const){
      ctx.beginPath();ctx.arc(w*nx,h*ny,1.15,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
}

