import type { TacticalBuilding } from './favelaRenderer';

const hash=(s:string)=>Math.abs([...s].reduce((a,c)=>((a*31)+c.charCodeAt(0))|0,17));
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const doorEdge=(b:TacticalBuilding)=>{
  const cx=b.x+b.w/2,cy=b.y+b.h/2,dx=b.doorX-cx,dy=b.doorY-cy;
  if(Math.abs(dx)>Math.abs(dy)){const dir=dx>=0?1:-1;return {x:dir>0?b.x+b.w:b.x,y:Math.max(b.y+8,Math.min(b.y+b.h-8,b.doorY)),dx:dir,dy:0};}
  const dir=dy>=0?1:-1;return {x:Math.max(b.x+8,Math.min(b.x+b.w-8,b.doorX)),y:dir>0?b.y+b.h:b.y,dx:0,dy:dir};
};

const drawThreshold=(ctx:CanvasRenderingContext2D,b:TacticalBuilding)=>{
  const e=doorEdge(b),len=11,width=13;
  ctx.save();ctx.translate(e.x,e.y);
  if(e.dx){ctx.fillStyle='rgba(126,113,95,.16)';ctx.fillRect(e.dx>0?0:-len,-width/2,len,width);}
  else {ctx.fillStyle='rgba(126,113,95,.16)';ctx.fillRect(-width/2,e.dy>0?0:-len,width,len);}
  ctx.strokeStyle='rgba(197,187,169,.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(e.dx*len,e.dy*len);ctx.stroke();
  ctx.fillStyle='rgba(18,23,24,.16)';ctx.beginPath();ctx.ellipse(e.dx*7,e.dy*7,e.dx?4:7,e.dx?7:4,0,0,Math.PI*2);ctx.fill();ctx.restore();
};

const drawPlanter=(ctx:CanvasRenderingContext2D,x:number,y:number,flip=false)=>{
  ctx.save();
  rect(ctx,x,y,15,4,'#5f4935','rgba(174,139,94,.34)');
  const greens=['rgba(52,103,61,.82)','rgba(72,126,67,.74)','rgba(91,137,72,.66)'];
  for(let i=0;i<4;i++){
    const px=x+3+i*3.1,lean=(flip?-1:1)*(i%2?1.5:-1);
    ctx.strokeStyle='rgba(58,102,61,.72)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(px+lean,y-5-(i%2)*2);ctx.stroke();
    ctx.fillStyle=greens[i%greens.length];ctx.beginPath();ctx.arc(px+lean,y-6-(i%2)*2,2.2,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};

const drawCornerNature=(ctx:CanvasRenderingContext2D,b:TacticalBuilding)=>{
  if(!['mirante','laje_ponto','beco_01','esconderijo'].includes(b.id)) return;
  const h=hash(b.id),left=(h%2)===0;
  const x=left?b.x+3:b.x+b.w-18,y=b.y+b.h+2;
  drawPlanter(ctx,x,y,!left);
};

const drawLandmarkPocket=(ctx:CanvasRenderingContext2D,b:TacticalBuilding)=>{
  const profiles:Record<string,{inner:string;mid:string;line:string;ry:number}>={
    barraquinha:{inner:'rgba(245,158,11,.060)',mid:'rgba(245,158,11,.018)',line:'rgba(180,142,94,.10)',ry:14},
    beco_01:{inner:'rgba(126,113,95,.040)',mid:'rgba(88,83,74,.014)',line:'rgba(160,143,118,.08)',ry:13},
    mirante:{inner:'rgba(151,139,111,.032)',mid:'rgba(88,83,74,.012)',line:'rgba(165,154,132,.07)',ry:13},
    laje_ponto:{inner:'rgba(120,134,128,.030)',mid:'rgba(75,83,80,.010)',line:'rgba(134,149,143,.06)',ry:12},
    boca_leste:{inner:'rgba(224,155,89,.032)',mid:'rgba(108,82,63,.011)',line:'rgba(166,127,94,.07)',ry:12},
    esconderijo:{inner:'rgba(83,94,99,.024)',mid:'rgba(48,57,61,.008)',line:'rgba(112,121,123,.05)',ry:11},
    torre_guarda:{inner:'rgba(120,142,151,.026)',mid:'rgba(68,82,88,.008)',line:'rgba(133,151,158,.055)',ry:11}
  };
  const p=profiles[b.id];if(!p) return;
  const cx=b.x+b.w/2,cy=b.y+b.h+6;
  const g=ctx.createRadialGradient(cx,cy,2,cx,cy,Math.max(30,b.w*.55));
  g.addColorStop(0,p.inner);g.addColorStop(.60,p.mid);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx,cy,b.w*.52,p.ry,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=p.line;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(b.x+10,b.y+b.h+4);ctx.lineTo(b.x+b.w-10,b.y+b.h+4);ctx.stroke();
};

export function drawT1BeautyCoherence(
  ctx:CanvasRenderingContext2D,territoryId:number,buildings:readonly TacticalBuilding[]
){
  if(territoryId!==1) return;
  ctx.save();
  for(const b of buildings){
    drawLandmarkPocket(ctx,b);
    drawThreshold(ctx,b);
    drawCornerNature(ctx,b);
  }
  ctx.restore();
}
