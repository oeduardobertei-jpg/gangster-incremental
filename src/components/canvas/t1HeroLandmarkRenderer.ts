import type { TacticalBuilding } from './favelaRenderer';

const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const glow=(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,c:string,a:number)=>{
  const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,c.replace(')',`,${a})`).replace('rgb','rgba'));
  g.addColorStop(.42,c.replace(')',`,${a*.30})`).replace('rgb','rgba'));g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
};
const find=(buildings:readonly TacticalBuilding[],id:string)=>buildings.find(b=>b.id===id);

export function drawT1HeroLandmarkFoundation(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,
  buildings:readonly TacticalBuilding[],controlColor:string
){
  if(territoryId!==1) return;
  ctx.save();
  // Entrada do bairro: pórtico leve, passagem totalmente livre e assinatura legível.
  const gy=h*.885,gx1=w*.435,gx2=w*.565;
  ctx.fillStyle='rgba(92,63,43,.22)';ctx.beginPath();ctx.ellipse(w*.50,gy+18,w*.09,18,0,0,Math.PI*2);ctx.fill();
  rect(ctx,gx1-6,gy-3,12,34,'#5b4a3f','#8a7160');rect(ctx,gx2-6,gy-3,12,34,'#5b4a3f','#8a7160');
  line(ctx,gx1,gy-3,gx2,gy-3,'#7a6250',5);line(ctx,gx1+2,gy-7,gx2-2,gy-7,'rgba(220,201,179,.28)',1);
  rect(ctx,w*.458,gy-24,w*.084,18,'#201b18','#aa6f43');
  ctx.fillStyle='#f1dfc5';ctx.font='900 8px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('BECO DOS DESCALÇOS',w*.50,gy-15);
  ctx.fillStyle=controlColor;ctx.globalAlpha=.55;ctx.fillRect(w*.478,gy-7,w*.044,2);ctx.globalAlpha=1;

  // Boca da Leste e Esconderijo: cada um ganha um apron próprio e uma assinatura luminosa.
  const boca=find(buildings,'boca_leste');
  if(boca){
    ctx.fillStyle='rgba(86,52,39,.13)';ctx.beginPath();ctx.ellipse(boca.x+boca.w*.52,boca.y+boca.h+10,boca.w*.64,13,-.04,0,Math.PI*2);ctx.fill();
    line(ctx,boca.x-8,boca.y+boca.h+13,boca.x+boca.w+12,boca.y+boca.h+13,'rgba(171,91,57,.34)',3);
    glow(ctx,boca.x+boca.w*.20,boca.y+boca.h*.68,68,'rgb(249,115,22)',.06);
  }
  const safe=find(buildings,'esconderijo');
  if(safe){
    ctx.fillStyle='rgba(45,55,61,.13)';ctx.beginPath();ctx.ellipse(safe.x+safe.w*.52,safe.y+safe.h+10,safe.w*.62,12,.03,0,Math.PI*2);ctx.fill();
    line(ctx,safe.x+8,safe.y+safe.h+14,safe.x+safe.w-8,safe.y+safe.h+14,'rgba(148,163,184,.12)',2);
    glow(ctx,safe.x+safe.w*.75,safe.y+safe.h*.72,64,'rgb(245,158,11)',.052);
  }
  ctx.restore();
}
