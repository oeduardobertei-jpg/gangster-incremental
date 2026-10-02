import type { TacticalBuilding } from './favelaRenderer';

const hash01=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return((h>>>0)%1000)/1000;};
const grass=(ctx:CanvasRenderingContext2D,x:number,y:number,s=1,c='#4f6b45')=>{ctx.save();ctx.strokeStyle=c;ctx.globalAlpha=.65;ctx.lineWidth=1;for(let i=0;i<5;i++){const dx=(i-2)*2*s;ctx.beginPath();ctx.moveTo(x+dx,y);ctx.lineTo(x+dx+(i%2?2:-2)*s,y-(5+i%3)*s);ctx.stroke();}ctx.restore();};
const shrub=(ctx:CanvasRenderingContext2D,x:number,y:number,r=6,c='#315b46')=>{ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(x+2,y+3,r*.9,r*.35,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=c;for(const [dx,dy,k] of [[0,0,1],[-4,1,.72],[4,1,.68]] as const){ctx.beginPath();ctx.arc(x+dx,y+dy,r*k,0,Math.PI*2);ctx.fill();}};
const dryTuft=(ctx:CanvasRenderingContext2D,x:number,y:number,s=1)=>grass(ctx,x,y,s,'#80764a');
const vine=(ctx:CanvasRenderingContext2D,x:number,y:number,h:number)=>{ctx.strokeStyle='rgba(47,91,67,.60)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-5,y-h*.45,x+2,y-h);ctx.stroke();ctx.fillStyle='#3f6b4d';for(let i=1;i<=4;i++){const yy=y-h*i/5;ctx.beginPath();ctx.ellipse(x+(i%2?3:-2),yy,3,1.8,i%2?.4:-.4,0,Math.PI*2);ctx.fill();}};
const leaf=(ctx:CanvasRenderingContext2D,x:number,y:number,c='#56724f')=>{ctx.fillStyle=c;ctx.globalAlpha=.42;ctx.beginPath();ctx.ellipse(x,y,3,1.4,.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;};
const planter=(ctx:CanvasRenderingContext2D,x:number,y:number,w=18)=>{ctx.fillStyle='#475569';ctx.fillRect(x,y,w,5);for(let px=x+4;px<x+w-2;px+=7)shrub(ctx,px,y-2,3.2,'#346a4b');};

export function drawVegetationNeglect(ctx:CanvasRenderingContext2D,buildings:readonly TacticalBuilding[],territoryId:number){ctx.save();for(const b of buildings){const s=hash01(`${territoryId}:${b.id}:veg`),y=b.y+b.h+4;const lx=b.x+7,rx=b.x+b.w-8;
  if(territoryId===1){grass(ctx,lx,y,.8);if(s>.34)grass(ctx,rx,y,.7);if(s>.62)vine(ctx,s>.8?b.x+3:b.x+b.w-3,b.y+b.h-3,18+Math.floor(s*14));}
  else if(territoryId===2){if(s>.28)grass(ctx,lx,y,.65,'#66744c');if(s>.58)grass(ctx,rx,y,.6,'#6f7950');}
  else if(territoryId===3){if(s>.58)grass(ctx,s>.8?lx:rx,y,.55,'#596448');}
  else if(territoryId===4){dryTuft(ctx,lx,y,.8);if(s>.42)dryTuft(ctx,rx,y,.7);}
  else if(territoryId===5){if(s>.22)planter(ctx,b.x+8,y,b.w>80?22:16);if(s>.66){leaf(ctx,rx+5,y+4);leaf(ctx,rx+11,y+1,'#63815b');}}
  else if(territoryId===6){if((b.label.toLowerCase().includes('alojamento')||b.label.toLowerCase().includes('anexo'))&&s>.45)shrub(ctx,rx+5,y,4,'#2f5b43');}
}ctx.restore();}
