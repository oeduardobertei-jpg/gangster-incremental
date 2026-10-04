import type { TacticalBuilding } from './favelaRenderer';

const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

const stain=(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,c:string,rot=0)=>{
  ctx.fillStyle=c;
  ctx.beginPath();
  ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);
  ctx.fill();
};

const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1,dash:number[]=[] )=>{
  ctx.save();
  ctx.strokeStyle=c;
  ctx.lineWidth=w;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  ctx.restore();
};const doorEdge=(b:TacticalBuilding)=>{
  const cx=b.x+b.w/2;
  const cy=b.y+b.h/2;
  const dx=b.doorX-cx;
  const dy=b.doorY-cy;
  const horizontal=Math.abs(dx)>Math.abs(dy);
  if(horizontal){
    const d=dx>0?1:-1;
    return {x:d>0?b.x+b.w:b.x,y:Math.max(b.y+8,Math.min(b.y+b.h-8,b.doorY)),dx:d,dy:0};
  }
  const d=dy>0?1:-1;
  return {x:Math.max(b.x+8,Math.min(b.x+b.w-8,b.doorX)),y:d>0?b.y+b.h:b.y,dx:0,dy:d};
};

const footWear=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,c='rgba(15,23,42,.12)',len=26)=>{
  const e=doorEdge(b);
  stain(ctx,e.x+e.dx*len*.55,e.y+e.dy*len*.55,e.dx?len*.45:7,e.dy?len*.45:7,c,e.dx?0:.05);
};

const parallelMarks=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,c:string,len=34,gap=7)=>{
  const e=doorEdge(b);
  for(const side of [-1,1]) line(ctx,e.x-e.dy*gap*side,e.y+e.dx*gap*side,e.x+e.dx*len-e.dy*gap*side,e.y+e.dy*len+e.dx*gap*side,c,1.2);
};const serviceSpecks=(ctx:CanvasRenderingContext2D,x:number,y:number,count:number,color:string)=>{
  ctx.fillStyle=color;
  for(let i=0;i<count;i++) ctx.fillRect(x+(i%4)*6,y+Math.floor(i/4)*4,2+(i%2),2);
};

export function drawGroundStoryUseZones(
  ctx:CanvasRenderingContext2D,
  buildings:readonly TacticalBuilding[],
  territoryId:number,
  controlColor:string
){
  ctx.save();
  for(const b of buildings){
    const n=norm(b.label);
    const e=doorEdge(b);
    if(territoryId===1){
      if(n.includes('barraquinha')) footWear(ctx,b,'rgba(76,55,38,.12)',22);
      else if(n.includes('boca')) footWear(ctx,b,'rgba(76,55,38,.18)',30);
      else if(n.includes('beco')||n.includes('esconderijo')) footWear(ctx,b,'rgba(30,41,35,.17)',26);
      else if(n.includes('laje')) line(ctx,e.x,e.y,e.x+e.dx*24,e.y+e.dy*24,'rgba(56,82,70,.18)',2);
      else footWear(ctx,b,'rgba(15,23,42,.10)',22);
    } else if(territoryId===2){
      if(n.includes('box')||n.includes('banca')) parallelMarks(ctx,b,'rgba(113,84,48,.18)',27,5);
      else if(n.includes('armazem')||n.includes('deposito')) parallelMarks(ctx,b,'rgba(15,23,42,.22)',38,7);
      else if(n.includes('estacao')||n.includes('passarela')) footWear(ctx,b,'rgba(30,41,59,.15)',36);
      else {footWear(ctx,b,'rgba(92,67,45,.14)',24);serviceSpecks(ctx,e.x+6,e.y+6,5,'rgba(154,52,18,.16)');}
    }    else if(territoryId===3){
      if(n.includes('oficina')){parallelMarks(ctx,b,'rgba(15,23,42,.24)',36,7);stain(ctx,e.x+e.dx*25,e.y+e.dy*25,10,4,'rgba(15,23,42,.18)',.12);}
      else if(n.includes('serralheria')){footWear(ctx,b,'rgba(51,65,85,.18)',28);serviceSpecks(ctx,e.x+5,e.y+5,6,'rgba(180,83,9,.20)');}
      else if(n.includes('galpao')||n.includes('deposito')) parallelMarks(ctx,b,'rgba(30,41,59,.20)',42,8);
      else if(n.includes('portaria')) footWear(ctx,b,'rgba(71,85,105,.15)',30);
      else footWear(ctx,b,'rgba(71,85,105,.12)',24);
    } else if(territoryId===4){
      if(n.includes('beco')||n.includes('barraco')) footWear(ctx,b,'rgba(88,65,45,.20)',30);
      else if(n.includes('laje')||n.includes('reduto')) stain(ctx,e.x+e.dx*19,e.y+e.dy*19,12,5,'rgba(120,94,69,.15)',.1);
      else footWear(ctx,b,'rgba(92,67,45,.16)',26);
    } else if(territoryId===5){
      parallelMarks(ctx,b,'rgba(51,65,85,.10)',34,7);
      if(n.includes('casa')||n.includes('mansao')||n.includes('condominio')) stain(ctx,b.x+b.w*.22,b.y+b.h+10,14,3,'rgba(42,91,66,.10)');
      if(n.includes('portaria')||n.includes('guarita')) line(ctx,e.x,e.y,e.x+e.dx*34,e.y+e.dy*34,'rgba(226,232,240,.14)',1);
    } else if(territoryId===6){
      footWear(ctx,b,'rgba(15,23,42,.18)',28);
      line(ctx,e.x,e.y,e.x+e.dx*34,e.y+e.dy*34,'rgba(148,163,184,.12)',1);
      if(n.includes('centro operacional')||n.includes('comando')||n.includes('qg')) serviceSpecks(ctx,b.x+b.w*.35,b.y+b.h+7,6,`${controlColor}22`);
    }
  }
  ctx.restore();
}
