import type { TacticalBuilding } from './favelaRenderer';

const alpha = (hex: string, a: number) => {
  const value = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return hex;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const districtApron = (territoryId: number) => {
  if (territoryId === 1) return { fill:'rgba(91,82,70,.18)', edge:'rgba(148,135,116,.20)' };
  if (territoryId === 2) return { fill:'rgba(115,91,53,.16)', edge:'rgba(214,179,92,.20)' };
  if (territoryId === 3) return { fill:'rgba(55,65,81,.22)', edge:'rgba(148,163,184,.16)' };
  if (territoryId === 4) return { fill:'rgba(91,70,54,.20)', edge:'rgba(154,133,112,.17)' };
  if (territoryId === 5) return { fill:'rgba(148,163,184,.15)', edge:'rgba(226,232,240,.18)' };
  return { fill:'rgba(51,65,85,.18)', edge:'rgba(148,163,184,.18)' };
};
const drawEntryPath = (
  ctx:CanvasRenderingContext2D,b:TacticalBuilding,territoryId:number,controlColor:string
) => {
  const cx=b.x+b.w/2, cy=b.y+b.h/2;
  const dx=b.doorX-cx, dy=b.doorY-cy;
  const horizontal=Math.abs(dx)>Math.abs(dy);
  const sx=horizontal?(dx>0?b.x+b.w:b.x):Math.max(b.x+10,Math.min(b.x+b.w-10,b.doorX));
  const sy=horizontal?Math.max(b.y+10,Math.min(b.y+b.h-10,b.doorY)):(dy>0?b.y+b.h:b.y);
  const reach=territoryId>=5?30:territoryId===3?26:22;
  const ex=horizontal?sx+(dx>0?reach:-reach):sx;
  const ey=horizontal?sy:sy+(dy>0?reach:-reach);
  ctx.strokeStyle=territoryId===5?'rgba(226,232,240,.24)':territoryId===6?alpha(controlColor,.24):'rgba(203,213,225,.14)';
  ctx.lineWidth=territoryId>=5?10:8;ctx.lineCap='butt';
  ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
  ctx.strokeStyle='rgba(15,23,42,.26)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
};

const drawContextGround = (ctx:CanvasRenderingContext2D,b:TacticalBuilding,territoryId:number,controlColor:string) => {
  const pad=territoryId===5?18:territoryId===6?16:territoryId===3?14:11;
  const x=b.x-pad,y=b.y-pad,w=b.w+pad*2,h=b.h+pad*2;
  if(territoryId===1){ctx.fillStyle='rgba(91,82,70,.12)';ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();ctx.strokeStyle='rgba(100,116,139,.13)';ctx.beginPath();ctx.moveTo(x+4,y+h-6);ctx.lineTo(x+w-4,y+h-6);ctx.stroke();ctx.fillStyle='rgba(42,74,48,.30)';for(const cx of [x+5,x+w-7]){ctx.beginPath();ctx.arc(cx,y+h-3,4,0,Math.PI*2);ctx.fill();}}
  else if(territoryId===2){ctx.fillStyle='rgba(97,76,48,.10)';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(157,129,79,.12)';ctx.strokeRect(x+3,y+3,w-6,h-6);ctx.fillStyle='rgba(120,83,48,.14)';ctx.fillRect(x+5,y+h-8,w-10,4);}
  else if(territoryId===3){ctx.fillStyle='rgba(71,85,105,.12)';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(148,163,184,.13)';ctx.strokeRect(x,y,w,h);ctx.strokeStyle='rgba(249,115,22,.18)';for(let xx=x+5;xx<x+w-6;xx+=13){ctx.beginPath();ctx.moveTo(xx,y+h-5);ctx.lineTo(xx+7,y+h-12);ctx.stroke();}ctx.fillStyle='rgba(15,23,42,.24)';ctx.fillRect(x+w*.62,y+h-10,Math.min(24,w*.22),4);}
  else if(territoryId===4){ctx.fillStyle='rgba(83,62,45,.14)';ctx.beginPath();ctx.roundRect(x,y,w,h,3);ctx.fill();ctx.strokeStyle='rgba(120,94,69,.16)';for(let xx=x+8;xx<x+w-8;xx+=14){ctx.beginPath();ctx.moveTo(xx,y+h-4);ctx.lineTo(xx+6,y+h-7);ctx.stroke();}}
  else if(territoryId===5){ctx.fillStyle='rgba(203,213,225,.09)';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(226,232,240,.15)';ctx.strokeRect(x,y,w,h);ctx.fillStyle='rgba(42,91,66,.35)';ctx.fillRect(x+4,y+h-8,w*.30,5);ctx.fillRect(x+w*.66,y+h-8,w*.30,5);ctx.strokeStyle='rgba(148,163,184,.12)';for(let xx=x+10;xx<x+w-10;xx+=16){ctx.beginPath();ctx.moveTo(xx,y+2);ctx.lineTo(xx,y+h-2);ctx.stroke();}}
  else {ctx.fillStyle='rgba(51,65,85,.11)';ctx.fillRect(x,y,w,h);ctx.strokeStyle=alpha(controlColor,.16);ctx.strokeRect(x,y,w,h);ctx.strokeStyle='rgba(148,163,184,.08)';ctx.strokeRect(x+5,y+5,w-10,h-10);ctx.fillStyle=alpha(controlColor,.13);ctx.fillRect(x+w*.38,y+h-7,w*.24,3);}
};

const drawServiceMarks = (ctx:CanvasRenderingContext2D,b:TacticalBuilding,territoryId:number) => {
  const y=b.y+b.h+8;
  if(territoryId===2){ctx.strokeStyle='rgba(157,129,79,.16)';ctx.strokeRect(b.x+8,y,b.w-16,8);}
  else if(territoryId===3){ctx.strokeStyle='rgba(249,115,22,.20)';for(let x=b.x+8;x<b.x+b.w-8;x+=13){ctx.beginPath();ctx.moveTo(x,y+7);ctx.lineTo(x+8,y);ctx.stroke();}}
  else if(territoryId===4){ctx.strokeStyle='rgba(120,113,108,.25)';ctx.beginPath();ctx.moveTo(b.x+4,y);ctx.lineTo(b.x+b.w-4,y);ctx.stroke();}
  else if(territoryId===5){ctx.strokeStyle='rgba(226,232,240,.18)';ctx.strokeRect(b.x+10,y,b.w-20,7);}
  else if(territoryId===6){ctx.strokeStyle='rgba(148,163,184,.12)';ctx.strokeRect(b.x+8,y,b.w-16,8);}
};
export function drawArchitectureGrounding(
  ctx:CanvasRenderingContext2D,
  buildings:readonly TacticalBuilding[],
  territoryId:number,
  controlColor:string
) {
  const apron=districtApron(territoryId);
  ctx.save();
  for(const b of buildings){
    drawContextGround(ctx,b,territoryId,controlColor);
    const pad=territoryId===5?8:territoryId===6?7:5;
    if(territoryId===1){
      const j=([...b.id].reduce((a,c)=>a+c.charCodeAt(0),0)%7)-3;
      const x=b.x-pad,y=b.y-pad,w=b.w+pad*2,h=b.h+pad*2;
      ctx.beginPath();ctx.moveTo(x+3,y+j*.35);ctx.lineTo(x+w-4,y+2);ctx.lineTo(x+w+1,y+h-5);
      ctx.lineTo(x+w-8,y+h+1);ctx.lineTo(x+5,y+h-1);ctx.lineTo(x-1,y+6);ctx.closePath();
      ctx.fillStyle='rgba(0,0,0,.20)';ctx.save();ctx.translate(4,5);ctx.fill();ctx.restore();
      ctx.fillStyle=apron.fill;ctx.fill();ctx.strokeStyle='rgba(148,135,116,.12)';ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle='rgba(15,23,42,.18)';ctx.beginPath();ctx.ellipse(b.x+b.w*.58,b.y+b.h+5,Math.max(12,b.w*.30),4,.05,0,Math.PI*2);ctx.fill();
    }else{
      ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(b.x-pad+4,b.y-pad+5,b.w+pad*2,b.h+pad*2);
      ctx.fillStyle=apron.fill;ctx.fillRect(b.x-pad,b.y-pad,b.w+pad*2,b.h+pad*2);
      ctx.strokeStyle=apron.edge;ctx.lineWidth=1;ctx.strokeRect(b.x-pad,b.y-pad,b.w+pad*2,b.h+pad*2);
    }
    drawEntryPath(ctx,b,territoryId,controlColor);
    drawServiceMarks(ctx,b,territoryId);
  }
  ctx.restore();
}
