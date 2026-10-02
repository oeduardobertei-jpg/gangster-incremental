import type { TacticalBuilding } from './favelaRenderer';

const hash01 = (value:string) => {
  let h=2166136261;
  for(let i=0;i<value.length;i++) h=Math.imul(h^value.charCodeAt(i),16777619);
  return ((h>>>0)%1000)/1000;
};
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string,width=1)=>{
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const dish=(ctx:CanvasRenderingContext2D,x:number,y:number,r:number)=>{
  ctx.strokeStyle='rgba(203,213,225,.62)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r,.12,Math.PI*.94);ctx.stroke();
  line(ctx,x,y,x+r*.9,y-r*.65,'rgba(148,163,184,.58)',1);
};
const condenser=(ctx:CanvasRenderingContext2D,x:number,y:number,w=18,h=10)=>{
  ctx.fillStyle='#c7cdd4';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#67727f';ctx.strokeRect(x,y,w,h);
  ctx.strokeStyle='#73808d';ctx.beginPath();ctx.arc(x+w*.48,y+h*.5,h*.32,0,Math.PI*2);ctx.stroke();
  line(ctx,x+w,y+h*.55,x+w+6,y+h*.55,'rgba(71,85,105,.55)',1);
};
const rebar=(ctx:CanvasRenderingContext2D,x:number,y:number,count:number)=>{
  ctx.strokeStyle='rgba(100,116,139,.62)';ctx.lineWidth=1;
  for(let i=0;i<count;i++){const xx=x+i*5;ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y-12-(i%2)*4);ctx.stroke();}
};
const wallWear=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,facadeY:number,height:number,seed:number)=>{
  ctx.save();ctx.fillStyle='rgba(15,23,42,.10)';
  const n=2+Math.floor(seed*3);
  for(let i=0;i<n;i++){
    const x=b.x+8+((seed*(i+1)*97)%1)*(b.w-16), y=facadeY+5+((seed*(i+3)*53)%1)*Math.max(5,height-12);
    ctx.fillRect(x,y,6+(i%2)*7,2+(i%3));
  }
  ctx.restore();
};

export function drawBuildingLifeDetails(
  ctx:CanvasRenderingContext2D,b:TacticalBuilding,territoryId:number,time:number
){
  const seed=hash01(`${territoryId}:${b.id}`);
  const visualHeight=territoryId===6?34:territoryId===3?28:territoryId===1?(b.type==='laje'?30:24):25;
  const roofY=b.y-visualHeight, facadeY=b.y+b.h-visualHeight;
  ctx.save();
  wallWear(ctx,b,facadeY,visualHeight,seed);
  if(territoryId===1){
    if(seed>.26) dish(ctx,b.x+b.w*(.34+seed*.34),roofY+8,7);
    if(seed>.48) condenser(ctx,b.x+b.w-27,facadeY+7,16,9);
    if(b.type==='brick'&&seed>.58) rebar(ctx,b.x+12,roofY+1,4);
    line(ctx,b.x+5,facadeY+visualHeight-6,b.x+b.w-5,facadeY+visualHeight-6,'rgba(89,72,58,.30)',1);
  } else if(territoryId===2){
    if(seed>.42) condenser(ctx,b.x+b.w-26,facadeY+6,15,8);
    if(seed>.55) dish(ctx,b.x+18,roofY+8,6);
    ctx.fillStyle='rgba(120,83,48,.28)';ctx.fillRect(b.x+7,facadeY+visualHeight-7,Math.min(28,b.w*.28),3);
  } else if(territoryId===3){
    if(seed>.28) condenser(ctx,b.x+b.w-28,facadeY+6,17,9);
    ctx.strokeStyle='rgba(148,163,184,.28)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x+10,roofY+10);ctx.lineTo(b.x+10,roofY-5);ctx.lineTo(b.x+18,roofY-5);ctx.stroke();
    ctx.fillStyle='rgba(154,52,18,.20)';ctx.fillRect(b.x+b.w-9,facadeY+5,3,Math.max(8,visualHeight-12));
  } else if(territoryId===4){
    if(seed>.18) dish(ctx,b.x+b.w*(.32+seed*.28),roofY+7,6);
    if(seed>.44) rebar(ctx,b.x+b.w-28,roofY+1,3);
    ctx.fillStyle='rgba(120,113,108,.24)';ctx.fillRect(b.x+7,facadeY+visualHeight-7,20+(seed*16),3);
    ctx.strokeStyle='rgba(17,24,39,.44)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(b.x+5,facadeY+5);ctx.quadraticCurveTo(b.x+b.w*.52,facadeY+11,b.x+b.w-5,facadeY+4);ctx.stroke();
  } else if(territoryId===5){
    if(seed>.20) condenser(ctx,b.x+b.w-28,facadeY+6,16,8);
    ctx.fillStyle='rgba(36,90,65,.34)';ctx.fillRect(b.x+8,facadeY+visualHeight-10,Math.min(26,b.w*.28),4);
    ctx.strokeStyle='rgba(226,232,240,.30)';ctx.lineWidth=1;ctx.strokeRect(b.x+7,facadeY+5,Math.min(34,b.w*.34),8);
  } else if(territoryId===6){
    const px=b.x+b.w-17,py=facadeY+7;
    ctx.fillStyle='#111827';ctx.fillRect(px,py,10,12);ctx.strokeStyle='rgba(203,213,225,.28)';ctx.strokeRect(px,py,10,12);
    ctx.strokeStyle='rgba(100,116,139,.50)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px+5,py);ctx.lineTo(px+5,roofY+8);ctx.stroke();
    ctx.fillStyle=`rgba(245,158,11,${.18+.14*Math.sin(time*.003+seed*8)})`;ctx.fillRect(px+3,py+3,4,3);
  }
  ctx.restore();
}
