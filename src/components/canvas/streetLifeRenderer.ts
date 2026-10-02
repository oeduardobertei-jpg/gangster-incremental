import type { TacticalBuilding } from './favelaRenderer';

const hash01=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return((h>>>0)%1000)/1000;};
const crate=(ctx:CanvasRenderingContext2D,x:number,y:number,w=12,h=9)=>{ctx.fillStyle='#6b4a2d';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#a97846';ctx.strokeRect(x,y,w,h);ctx.beginPath();ctx.moveTo(x+2,y+2);ctx.lineTo(x+w-2,y+h-2);ctx.moveTo(x+w-2,y+2);ctx.lineTo(x+2,y+h-2);ctx.stroke();};
const bag=(ctx:CanvasRenderingContext2D,x:number,y:number,r=5)=>{ctx.fillStyle='#20262d';ctx.beginPath();ctx.ellipse(x,y,r,r*.72,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(148,163,184,.16)';ctx.fillRect(x-1,y-r*.7,2,2);};
const bucket=(ctx:CanvasRenderingContext2D,x:number,y:number,c='#64748b')=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,5,2,0,0,Math.PI*2);ctx.fill();ctx.fillRect(x-5,y,10,7);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x-3,y+1,2,4);};
const tyre=(ctx:CanvasRenderingContext2D,x:number,y:number,r=6)=>{ctx.strokeStyle='#111827';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#475569';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r-2,0,Math.PI*2);ctx.stroke();};
const planter=(ctx:CanvasRenderingContext2D,x:number,y:number)=>{ctx.fillStyle='#425466';ctx.fillRect(x-8,y-3,16,6);ctx.fillStyle='#2f5b43';for(const dx of [-5,0,5]){ctx.beginPath();ctx.arc(x+dx,y-5-Math.abs(dx)*.15,4,0,Math.PI*2);ctx.fill();}};
const bollard=(ctx:CanvasRenderingContext2D,x:number,y:number,color:string)=>{ctx.fillStyle='#1f2937';ctx.fillRect(x-2,y-8,4,8);ctx.fillStyle=color;ctx.fillRect(x-2,y-7,4,2);};

const drawT1=(ctx:CanvasRenderingContext2D,x:number,y:number,seed:number)=>{bag(ctx,x,y);bucket(ctx,x+10,y+2,seed>.5?'#0e7490':'#64748b');if(seed>.45)crate(ctx,x-16,y-6,11,8);};
const drawT2=(ctx:CanvasRenderingContext2D,x:number,y:number,seed:number)=>{crate(ctx,x-14,y-7,12,9);crate(ctx,x,y-4,10,7);if(seed>.38){ctx.fillStyle='#8a6a3d';ctx.beginPath();ctx.ellipse(x+13,y+1,6,4,0,0,Math.PI*2);ctx.fill();}};
const drawT3=(ctx:CanvasRenderingContext2D,x:number,y:number,seed:number)=>{tyre(ctx,x-5,y,6);if(seed>.34)tyre(ctx,x+7,y-1,5);bucket(ctx,x+17,y+2,'#b45309');ctx.fillStyle='rgba(15,23,42,.20)';ctx.beginPath();ctx.ellipse(x+4,y+7,18,4,.08,0,Math.PI*2);ctx.fill();};
const drawT4=(ctx:CanvasRenderingContext2D,x:number,y:number,seed:number)=>{ctx.fillStyle='#7c5a3b';for(let i=0;i<3;i++)ctx.fillRect(x-14+i*9,y-5-(i%2)*3,8,5);bucket(ctx,x+15,y+1,'#78716c');if(seed>.42){ctx.strokeStyle='rgba(148,163,184,.38)';ctx.beginPath();ctx.moveTo(x-10,y-10);ctx.lineTo(x+8,y-16);ctx.stroke();}};
const drawT5=(ctx:CanvasRenderingContext2D,x:number,y:number,seed:number)=>{planter(ctx,x,y);ctx.fillStyle='#334155';ctx.fillRect(x+15,y-8,8,11);ctx.fillStyle='#94a3b8';ctx.fillRect(x+16,y-7,6,2);if(seed>.55){ctx.strokeStyle='#64748b';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x-17,y-2,5,0,Math.PI*2);ctx.arc(x-7,y-2,5,0,Math.PI*2);ctx.moveTo(x-17,y-2);ctx.lineTo(x-12,y-10);ctx.lineTo(x-7,y-2);ctx.stroke();}};
const drawT6=(ctx:CanvasRenderingContext2D,x:number,y:number,seed:number,color:string)=>{ctx.fillStyle='#1f2937';ctx.fillRect(x-11,y-9,17,10);ctx.strokeStyle='rgba(148,163,184,.30)';ctx.strokeRect(x-11,y-9,17,10);ctx.fillStyle=color;ctx.globalAlpha=.42;ctx.fillRect(x-8,y-6,6,2);ctx.globalAlpha=1;bollard(ctx,x+13,y,color);if(seed>.48)bollard(ctx,x+21,y+2,color);};

export function drawStreetLifeClusters(ctx:CanvasRenderingContext2D,buildings:readonly TacticalBuilding[],territoryId:number,controlColor:string){
  ctx.save();
  for(const b of buildings){
    const seed=hash01(`${territoryId}:${b.id}:street`);
    if(seed<.18)continue;
    const doorRight=b.doorX>b.x+b.w/2;
    const x=doorRight?b.x-14:b.x+b.w+14;
    const y=b.y+b.h*.72+(seed-.5)*8;
    ctx.fillStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.ellipse(x,y+5,20,6,0,0,Math.PI*2);ctx.fill();
    if(territoryId===1)drawT1(ctx,x,y,seed);
    else if(territoryId===2)drawT2(ctx,x,y,seed);
    else if(territoryId===3)drawT3(ctx,x,y,seed);
    else if(territoryId===4)drawT4(ctx,x,y,seed);
    else if(territoryId===5)drawT5(ctx,x,y,seed);
    else drawT6(ctx,x,y,seed,controlColor);
  }
  ctx.restore();
}
