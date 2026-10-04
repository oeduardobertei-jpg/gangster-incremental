import type { TacticalBuilding } from './favelaRenderer';

const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rgba=(hex:string,a:number)=>{const h=hex.replace('#','');if(!/^[0-9a-fA-F]{6}$/.test(h))return hex;return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};
const glow=(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,a:number)=>{const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,rgba(color,a));g.addColorStop(.42,rgba(color,a*.38));g.addColorStop(1,rgba(color,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
const lightAt=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,color:string,r:number,a:number,side=.5)=>{const x=b.x+b.w*side,y=b.y+b.h+4;glow(ctx,x,y,r,color,a);ctx.fillStyle=rgba(color,Math.min(.9,a*4));ctx.fillRect(x-2,y-5,4,3);};

export function drawUrbanMoodFoundation(ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,buildings:readonly TacticalBuilding[],controlColor:string){
  ctx.save();
  for(const b of buildings){const n=norm(b.label);
    if(territoryId===1){if(n.includes('barraquinha'))lightAt(ctx,b,'#f59e0b',24,.035);else if(n.includes('boca'))lightAt(ctx,b,'#f59e0b',48,.11);else if(n.includes('laje')||n.includes('mirante'))lightAt(ctx,b,'#fde68a',34,.055);}
    else if(territoryId===2){if(n.includes('estacao')||n.includes('box')||n.includes('banca'))lightAt(ctx,b,'#fbbf24',46,.09);else if(n.includes('passarela')||n.includes('cabine'))lightAt(ctx,b,'#93c5fd',36,.065);}
    else if(territoryId===3){if(n.includes('oficina')||n.includes('serralheria'))lightAt(ctx,b,'#fb923c',46,.09);else if(n.includes('portaria')||n.includes('deposito'))lightAt(ctx,b,'#cbd5e1',34,.05);}
    else if(territoryId===4){if(n.includes('boca'))lightAt(ctx,b,'#f59e0b',38,.075);else if(n.includes('posto')||n.includes('mirante'))lightAt(ctx,b,'#e2e8f0',31,.045);}
    else if(territoryId===5){if(n.includes('casa')||n.includes('mansao'))lightAt(ctx,b,'#fde68a',42,.070);else if(n.includes('portaria')||n.includes('guarita'))lightAt(ctx,b,'#f5e6c8',36,.060);}
    else if(territoryId===6){if(n.includes('qg')||n.includes('comando')||n.includes('centro operacional'))lightAt(ctx,b,'#e5e7eb',44,.052);else if(n.includes('posto blindado')||n.includes('torre'))lightAt(ctx,b,'#f59e0b',32,.042);}
  }
  if(territoryId===1){glow(ctx,w*.28,h*.57,62,'#f59e0b',.035);glow(ctx,w*.69,h*.58,48,'#fde68a',.025);}
  else if(territoryId===2)glow(ctx,w*.50,h*.37,92,'#facc15',.025);
  else if(territoryId===3)glow(ctx,w*.50,h*.47,105,'#94a3b8',.018);
  else if(territoryId===5)glow(ctx,w*.50,h*.82,74,'#fde68a',.022);
  else if(territoryId===6)glow(ctx,w*.50,h*.48,110,'#e5e7eb',.015);
  ctx.restore();
}export function drawUrbanMoodOverlay(ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,time:number,controlColor:string){
  const pulse=.5+.5*Math.sin(time*.004),fast=.5+.5*Math.sin(time*.013);ctx.save();
  if(territoryId===1){glow(ctx,w*.255,h*.585,28,'#f59e0b',.018+.016*pulse);}
  else if(territoryId===2){const green=Math.sin(time*.002)>0;for(const x of [.18,.42,.62,.84]){ctx.fillStyle=green?'rgba(34,197,94,.48)':'rgba(239,68,68,.42)';ctx.beginPath();ctx.arc(w*x,h*.14,2.2,0,Math.PI*2);ctx.fill();}}
  else if(territoryId===3){if(fast>.82){glow(ctx,w*.82,h*.24,22,'#93c5fd',.07);ctx.fillStyle='rgba(219,234,254,.65)';ctx.fillRect(w*.82-1,h*.24-1,2,2);}}
  else if(territoryId===4){for(const [x,y] of [[.16,.18],[.79,.42]] as const)glow(ctx,w*x,h*y,18,'#fde68a',.014+.012*pulse);}
  else if(territoryId===5){for(const [x,y] of [[.18,.84],[.82,.84]] as const)glow(ctx,w*x,h*y,22,'#bae6fd',.012+.010*pulse);}
  else if(territoryId===6){const x=w*(.37+.26*((time*.00008)%1));ctx.strokeStyle='rgba(229,231,235,.018)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,h*.18);ctx.lineTo(x,h*.80);ctx.stroke();}
  ctx.restore();
}
