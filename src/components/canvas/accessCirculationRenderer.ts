import type { TacticalBuilding } from './favelaRenderer';

const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1,dash:number[]=[] )=>{
  ctx.save();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
};
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const edge=(b:TacticalBuilding)=>{
  const cx=b.x+b.w/2,cy=b.y+b.h/2,dx=b.doorX-cx,dy=b.doorY-cy,horizontal=Math.abs(dx)>Math.abs(dy);
  if(horizontal){const dir=dx>0?1:-1;return {x:dir>0?b.x+b.w:b.x,y:Math.max(b.y+8,Math.min(b.y+b.h-8,b.doorY)),dx:dir,dy:0};}
  const dir=dy>0?1:-1;return {x:Math.max(b.x+8,Math.min(b.x+b.w-8,b.doorX)),y:dir>0?b.y+b.h:b.y,dx:0,dy:dir};
};
const accessStrip=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,len:number,width:number,fill:string,stroke?:string)=>{
  const e=edge(b),x=e.dx?Math.min(e.x,e.x+e.dx*len):e.x-width/2,y=e.dy?Math.min(e.y,e.y+e.dy*len):e.y-width/2;
  rect(ctx,x,y,e.dx?len:width,e.dy?len:width,fill,stroke);
  return e;
};
const steps=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,len=28,width=16)=>{
  const e=edge(b),n=5;for(let i=0;i<n;i++){const t=i/n,x=e.x+e.dx*len*t,y=e.y+e.dy*len*t;rect(ctx,x-(e.dy?width/2:0),y-(e.dx?width/2:0),e.dx?len/n:width,e.dy?len/n:width,'rgba(100,116,139,.34)');}
};const loadingBay=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,color:string)=>{
  const e=accessStrip(ctx,b,34,24,'rgba(71,85,105,.26)',color);const px=e.x+e.dx*26,py=e.y+e.dy*26;
  for(let i=-1;i<=1;i++)line(ctx,px-e.dy*8+i*5*e.dy,py+e.dx*8-i*5*e.dx,px-e.dy*8+i*5*e.dy-e.dx*9,py+e.dx*8-i*5*e.dx-e.dy*9,'rgba(226,232,240,.20)',1);
};
const driveway=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,color='rgba(226,232,240,.20)',len=34)=>{
  const e=accessStrip(ctx,b,len,18,'rgba(148,163,184,.13)',color);line(ctx,e.x,e.y,e.x+e.dx*len,e.y+e.dy*len,'rgba(15,23,42,.20)',1);
};
const gateLane=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,color:string)=>{
  const e=accessStrip(ctx,b,42,24,'rgba(71,85,105,.17)',color);const ex=e.x+e.dx*35,ey=e.y+e.dy*35;
  line(ctx,ex-e.dy*12,ey+e.dx*12,ex+e.dy*12,ey-e.dx*12,'rgba(248,250,252,.72)',3);
  line(ctx,ex-e.dy*8,ey+e.dx*8,ex+e.dy*8,ey-e.dx*8,color,2);
};
const marketApron=(ctx:CanvasRenderingContext2D,b:TacticalBuilding)=>{
  const e=accessStrip(ctx,b,24,30,'rgba(120,83,48,.17)','rgba(234,179,8,.18)');
  for(let i=-1;i<=1;i++)line(ctx,e.x-e.dy*10+i*6*e.dy,e.y+e.dx*10-i*6*e.dx,e.x+e.dx*20-e.dy*10+i*6*e.dy,e.y+e.dy*20+e.dx*10-i*6*e.dx,'rgba(254,243,199,.12)',1);
};
const secureLane=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,color:string)=>{
  const e=accessStrip(ctx,b,38,20,'rgba(30,41,59,.24)',`${color}55`);line(ctx,e.x,e.y,e.x+e.dx*36,e.y+e.dy*36,'rgba(148,163,184,.16)',1);
};export function drawFunctionalBuildingAccess(
  ctx:CanvasRenderingContext2D,buildings:readonly TacticalBuilding[],territoryId:number,controlColor:string,worldWidth:number,worldHeight:number
){
  ctx.save();
  for(const b of buildings){const n=norm(b.label);
    if(territoryId===1){
      if(n.includes('laje')||n.includes('torre')||n.includes('mirante'))steps(ctx,b,26,15);
      else if(n.includes('boca'))marketApron(ctx,b);
      else if(!n.includes('barraquinha'))driveway(ctx,b,'rgba(203,213,225,.12)',24);
    } else if(territoryId===2){
      // 1.2N: railway landmarks are grounded once by t2RailGroundReauthorRenderer.
      if(n.includes('box')||n.includes('banca'))marketApron(ctx,b);
      else if(n.includes('deposito'))loadingBay(ctx,b,'rgba(214,179,92,.24)');
    } else if(territoryId===3){
      if(n.includes('oficina')||n.includes('serralheria'))loadingBay(ctx,b,'rgba(249,115,22,.26)');
      else if(n.includes('galpao')||n.includes('deposito'))loadingBay(ctx,b,'rgba(148,163,184,.24)');
      else if(n.includes('portaria'))gateLane(ctx,b,'#f59e0b');
      else driveway(ctx,b,'rgba(148,163,184,.15)',28);
    } else if(territoryId===4){steps(ctx,b,n.includes('mirante')||n.includes('posto')?32:26,15);
    } else if(territoryId===5){
      if(n.includes('portaria')||n.includes('guarita'))gateLane(ctx,b,'#e2e8f0');
      else driveway(ctx,b,'rgba(226,232,240,.24)',38);
    } else if(territoryId===6){
      if(n.includes('posto blindado'))gateLane(ctx,b,'#9ca3af');
      else secureLane(ctx,b,'#7c858d');
    }
  }
  ctx.restore();
}