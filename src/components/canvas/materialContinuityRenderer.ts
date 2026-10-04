import type { TacticalBuilding } from './favelaRenderer';

const hash01=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return((h>>>0)%1000)/1000;};
const stain=(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,.08,0,Math.PI*2);ctx.fill();};
const seamGrass=(ctx:CanvasRenderingContext2D,x:number,y:number,n:number)=>{ctx.strokeStyle='rgba(67,110,73,.42)';ctx.lineWidth=1;for(let i=0;i<n;i++){const xx=x+i*5;ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx-1,y-4-(i%3));ctx.stroke();}};

export function drawMaterialContinuity(ctx:CanvasRenderingContext2D,buildings:readonly TacticalBuilding[],territoryId:number){
  ctx.save();
  for(const b of buildings){
    const s=hash01(`${territoryId}:${b.id}:material`), baseY=b.y+b.h+3;
    if(territoryId===1){
      stain(ctx,b.x+b.w*(.25+s*.45),baseY,b.w*.18,4,'rgba(42,53,48,.16)');
      if(s>.28)seamGrass(ctx,b.x+7,baseY+2,3+Math.floor(s*4));
    } else if(territoryId===2){
      ctx.fillStyle='rgba(120,83,48,.10)';ctx.fillRect(b.x+5,baseY,b.w-10,4);
      stain(ctx,b.x+b.w*.65,baseY+4,14,3,'rgba(91,68,42,.11)');
    } else if(territoryId===3){
      stain(ctx,b.x+b.w*(.35+s*.25),baseY+2,18+s*10,4,'rgba(15,23,42,.20)');
      ctx.fillStyle='rgba(154,52,18,.12)';ctx.fillRect(b.x+b.w-9,b.y+b.h-6,3,12+s*8);
    } else if(territoryId===4){
      stain(ctx,b.x+b.w*.5,baseY+3,b.w*.24,5,'rgba(92,67,45,.18)');
      ctx.fillStyle='rgba(120,94,69,.15)';for(let i=0;i<4;i++)ctx.fillRect(b.x+8+i*11,baseY+3+(i%2)*2,5,2);
    } else if(territoryId===5){
      ctx.fillStyle='rgba(226,232,240,.08)';ctx.fillRect(b.x+5,baseY,b.w-10,3);
      if(s>.34)seamGrass(ctx,b.x+b.w*.18,baseY+2,2+Math.floor(s*3));
      stain(ctx,b.x+b.w*.72,baseY+3,12,3,'rgba(46,88,66,.08)');
    } else if(territoryId===6){
      ctx.strokeStyle='rgba(96,165,250,.10)';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(b.x+8,baseY+3);ctx.lineTo(b.x+b.w-8,baseY+3);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='rgba(30,41,59,.18)';ctx.fillRect(b.x+b.w*.42,baseY,b.w*.16,4);
    }
  }
  ctx.restore();
}
