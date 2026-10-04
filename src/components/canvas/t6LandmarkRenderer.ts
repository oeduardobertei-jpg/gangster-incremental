import type { TacticalBuilding } from './favelaRenderer';

const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const alpha=(hex:string,a:number)=>{const h=hex.replace('#','');if(!/^[0-9a-f]{6}$/i.test(h))return hex;return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};

export function drawT6LandmarkFinish(ctx:CanvasRenderingContext2D,b:TacticalBuilding,time:number,controlColor:string,renderZoom:number){
  if(renderZoom<.74) return;
  const n=norm(b.label), roofY=b.y-34;
  ctx.save();
  if(n.includes('qg central')){
    // Command crown: communications mast + twin antenna banks + illuminated command slit.
    const cx=b.x+b.w*.5;
    ctx.fillStyle='#111820';ctx.fillRect(b.x+8,roofY+7,b.w-16,18);
    ctx.strokeStyle=alpha(controlColor,.52);ctx.lineWidth=1.5;ctx.strokeRect(b.x+8,roofY+7,b.w-16,18);
    ctx.strokeStyle='#8a949c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,roofY+7);ctx.lineTo(cx,roofY-16);ctx.stroke();
    for(const side of [-1,1]){const ax=cx+side*17;ctx.strokeStyle='#6f7a83';ctx.beginPath();ctx.moveTo(ax,roofY+5);ctx.lineTo(ax,roofY-8);ctx.stroke();ctx.beginPath();ctx.arc(ax,roofY-8,6,Math.PI*1.05,Math.PI*1.95);ctx.stroke();}
    ctx.fillStyle=alpha(controlColor,.48+.18*Math.sin(time*.004));ctx.fillRect(cx-12,roofY+15,24,4);
  }else if(n.includes('torre de seguranca')){
    const cx=b.x+b.w*.5;
    ctx.fillStyle='#171d22';ctx.fillRect(cx-11,roofY+3,22,22);ctx.strokeStyle='#7b868d';ctx.strokeRect(cx-11,roofY+3,22,22);
    ctx.strokeStyle='#8d989f';ctx.beginPath();ctx.moveTo(cx,roofY+3);ctx.lineTo(cx,roofY-13);ctx.stroke();
    ctx.fillStyle=alpha(controlColor,.62);ctx.beginPath();ctx.arc(cx,roofY-14,2.5,0,Math.PI*2);ctx.fill();
    for(const x of [cx-7,cx+4]){ctx.fillStyle='#223540';ctx.fillRect(x,roofY+8,4,7);}
  }else if(n.includes('centro operacional')){
    ctx.fillStyle='#17212a';ctx.fillRect(b.x+8,roofY+8,b.w-16,13);ctx.strokeStyle='#697780';ctx.strokeRect(b.x+8,roofY+8,b.w-16,13);
    ctx.fillStyle='rgba(96,165,250,.28)';for(let x=b.x+12;x<b.x+b.w-12;x+=12)ctx.fillRect(x,roofY+12,7,4);
    ctx.fillStyle='#4b555d';ctx.fillRect(b.x+b.w-22,roofY+3,12,7);
  }else if(n.includes('posto blindado')){
    ctx.fillStyle='#1c2226';ctx.fillRect(b.x+7,roofY+10,b.w-14,14);ctx.strokeStyle='#59636b';ctx.strokeRect(b.x+7,roofY+10,b.w-14,14);
    ctx.fillStyle='#0e1419';ctx.fillRect(b.x+12,roofY+14,b.w-24,4);
    ctx.fillStyle=alpha(controlColor,.38);ctx.fillRect(b.x+10,roofY+10,Math.max(10,b.w*.22),3);
  }else if(n.includes('alojamento central')){
    ctx.fillStyle='#293036';ctx.fillRect(b.x+8,roofY+8,b.w-16,8);
    ctx.strokeStyle='rgba(148,163,184,.36)';for(let x=b.x+12;x<b.x+b.w-11;x+=13){ctx.beginPath();ctx.moveTo(x,roofY+8);ctx.lineTo(x,roofY+18);ctx.stroke();}
    ctx.fillStyle='#49545c';ctx.fillRect(b.x+b.w-19,roofY+18,10,6);
  }else if(n.includes('comando leste')){
    ctx.fillStyle='#151e26';ctx.fillRect(b.x+7,roofY+8,b.w-14,12);
    ctx.strokeStyle=alpha(controlColor,.46);ctx.strokeRect(b.x+7,roofY+8,b.w-14,12);
    const mx=b.x+b.w-15;ctx.strokeStyle='#7b8790';ctx.beginPath();ctx.moveTo(mx,roofY+8);ctx.lineTo(mx,roofY-11);ctx.stroke();
    ctx.fillStyle=alpha(controlColor,.65+.12*Math.sin(time*.005));ctx.fillRect(mx-2,roofY-12,4,3);
  }else if(n.includes('anexo do qg')){
    ctx.fillStyle='#20272d';ctx.fillRect(b.x+8,roofY+11,b.w-16,11);ctx.strokeStyle='#59636b';ctx.strokeRect(b.x+8,roofY+11,b.w-16,11);
    ctx.fillStyle='#33404a';ctx.fillRect(b.x+12,roofY+14,Math.max(11,b.w*.30),5);
  }
  ctx.restore();
}
