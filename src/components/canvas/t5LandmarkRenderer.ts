import type { TacticalBuilding } from './favelaRenderer';

const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const alpha=(hex:string,a:number)=>{const h=hex.replace('#','');if(!/^[0-9a-f]{6}$/i.test(h))return hex;return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};

export function drawT5LandmarkFinish(ctx:CanvasRenderingContext2D,b:TacticalBuilding,time:number,controlColor:string,renderZoom:number){
  if(renderZoom<.76) return;
  const name=norm(b.label), lift=25, roofY=b.y-lift;
  ctx.save();
  if(name.includes('cobertura')){
    // Rooftop pergola + private deck create a unique top-center silhouette.
    const x=b.x+10,y=roofY+6,w=Math.max(26,b.w-20);
    ctx.fillStyle='rgba(226,232,240,.72)';ctx.fillRect(x,y,w,3);
    ctx.strokeStyle='rgba(51,65,85,.62)';ctx.lineWidth=1.2;
    for(let px=x+3;px<x+w-2;px+=11){ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(px,y+18);ctx.stroke();}
    ctx.fillStyle='rgba(39,120,149,.46)';ctx.beginPath();ctx.roundRect(x+w*.56,y+7,Math.max(13,w*.30),7,3);ctx.fill();
    ctx.fillStyle='#315b46';ctx.fillRect(x+4,y+14,Math.max(12,w*.30),5);
  }else if(name.includes('mansao reservada')){
    // Warm stone entrance, glass patio and asymmetric garden distinguish the mansion.
    ctx.fillStyle='rgba(235,226,211,.64)';ctx.fillRect(b.x+7,roofY+8,b.w-14,5);
    ctx.fillStyle='rgba(23,59,82,.56)';ctx.fillRect(b.x+10,roofY+15,Math.max(17,b.w*.36),8);
    ctx.fillStyle='#315b46';ctx.beginPath();ctx.roundRect(b.x+b.w*.58,roofY+9,Math.max(14,b.w*.27),13,4);ctx.fill();
    ctx.strokeStyle='rgba(226,232,240,.34)';ctx.strokeRect(b.x+10,roofY+15,Math.max(17,b.w*.36),8);
  }else if(name.includes('condominio norte')){
    // Twin rooftop cores imply a larger multi-unit residential complex.
    const tw=Math.max(15,b.w*.22);ctx.fillStyle='#d5d0c8';ctx.fillRect(b.x+8,roofY+7,tw,16);ctx.fillRect(b.x+b.w-8-tw,roofY+7,tw,16);
    ctx.fillStyle='rgba(36,75,87,.65)';ctx.fillRect(b.x+10+tw,roofY+11,Math.max(12,b.w-tw*2-20),7);
    ctx.strokeStyle='rgba(226,232,240,.28)';ctx.strokeRect(b.x+8,roofY+7,tw,16);ctx.strokeRect(b.x+b.w-8-tw,roofY+7,tw,16);
  }else if(name.includes('portaria')||name.includes('guarita')){
    // Security buildings get an unmistakable controlled canopy.
    ctx.fillStyle='#17202a';ctx.fillRect(b.x+6,roofY+10,b.w-12,9);
    ctx.fillStyle=alpha(controlColor,.50);ctx.fillRect(b.x+6,roofY+10,b.w-12,3);
    ctx.fillStyle='rgba(155,212,228,.40)';ctx.fillRect(b.x+12,roofY+14,Math.max(12,b.w-24),4);
    ctx.strokeStyle='rgba(226,232,240,.38)';ctx.strokeRect(b.x+6,roofY+10,b.w-12,9);
    if(renderZoom>=.95){ctx.fillStyle=alpha(controlColor,.65+.15*Math.sin(time*.004));ctx.beginPath();ctx.arc(b.x+b.w-10,roofY+7,2.2,0,Math.PI*2);ctx.fill();}
  }else if(name.includes('casa da orla')){
    // Low coastal house: terrace shade + green roof strip.
    ctx.fillStyle='rgba(235,230,219,.62)';ctx.fillRect(b.x+8,roofY+10,b.w-16,4);
    ctx.strokeStyle='rgba(71,85,105,.42)';for(let x=b.x+11;x<b.x+b.w-10;x+=12){ctx.beginPath();ctx.moveTo(x,roofY+9);ctx.lineTo(x,roofY+19);ctx.stroke();}
    ctx.fillStyle='#315b46';ctx.fillRect(b.x+10,roofY+18,Math.max(15,b.w*.42),5);
  }
  ctx.restore();
}
