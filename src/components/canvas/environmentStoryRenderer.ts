import type { TacticalBuilding } from './favelaRenderer';

const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}};
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
const shadow=(ctx:CanvasRenderingContext2D,x:number,y:number,rx=18)=>{ctx.fillStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.ellipse(x,y,rx,5,.08,0,Math.PI*2);ctx.fill();};
const crate=(ctx:CanvasRenderingContext2D,x:number,y:number,w=12,h=9)=>{rect(ctx,x,y,w,h,'#6b4a2d','#a97846');line(ctx,x+2,y+2,x+w-2,y+h-2,'#4b321f',1);line(ctx,x+w-2,y+2,x+2,y+h-2,'#4b321f',1);};
const pallet=(ctx:CanvasRenderingContext2D,x:number,y:number,w=24)=>{for(let i=0;i<3;i++)rect(ctx,x,y+i*4,w,2,'#795739');for(const px of [x+3,x+w-5])rect(ctx,px,y,w>20?3:2,11,'#4f3827');};
const barrel=(ctx:CanvasRenderingContext2D,x:number,y:number,c='#475569')=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,6,3,0,0,Math.PI*2);ctx.fill();ctx.fillRect(x-6,y,12,12);ctx.strokeStyle='rgba(226,232,240,.18)';ctx.strokeRect(x-6,y+3,12,5);};
const tyre=(ctx:CanvasRenderingContext2D,x:number,y:number,r=6)=>{ctx.strokeStyle='#111827';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#475569';ctx.lineWidth=1;ctx.stroke();};
const bench=(ctx:CanvasRenderingContext2D,x:number,y:number,w=24)=>{rect(ctx,x,y,w,5,'#60452f','#8b6a4b');rect(ctx,x+3,y+5,3,7,'#374151');rect(ctx,x+w-6,y+5,3,7,'#374151');};
const planter=(ctx:CanvasRenderingContext2D,x:number,y:number,w=22)=>{rect(ctx,x,y,w,5,'#475569');ctx.fillStyle='#315b46';for(let px=x+4;px<x+w-2;px+=7){ctx.beginPath();ctx.arc(px,y-2,3,0,Math.PI*2);ctx.fill();}};
const cabinet=(ctx:CanvasRenderingContext2D,x:number,y:number,c='#64748b')=>{rect(ctx,x,y,14,18,'#303946',c);rect(ctx,x+3,y+4,8,3,'#111827');rect(ctx,x+5,y+11,4,2,c);};const cone=(ctx:CanvasRenderingContext2D,x:number,y:number)=>{ctx.fillStyle='#f97316';ctx.beginPath();ctx.moveTo(x,y-10);ctx.lineTo(x-5,y);ctx.lineTo(x+5,y);ctx.closePath();ctx.fill();rect(ctx,x-6,y,12,2,'#f8fafc');};
const metalRack=(ctx:CanvasRenderingContext2D,x:number,y:number,w=26)=>{line(ctx,x,y,x+w,y,'#64748b',2);line(ctx,x,y-8,x,y+3,'#94a3b8',1.5);line(ctx,x+w,y-8,x+w,y+3,'#94a3b8',1.5);for(let i=0;i<4;i++)line(ctx,x+2,y-7+i*3,x+w-2,y-7+i*3,i%2?'#8b5a36':'#7c8794',1.2);};
const chair=(ctx:CanvasRenderingContext2D,x:number,y:number)=>{rect(ctx,x,y,10,7,'#cbd5e1','#64748b');line(ctx,x+1,y+7,x-1,y+13,'#64748b',1);line(ctx,x+9,y+7,x+11,y+13,'#64748b',1);line(ctx,x,y,x,y-7,'#64748b',1);line(ctx,x+10,y,x+10,y-7,'#64748b',1);};
const cart=(ctx:CanvasRenderingContext2D,x:number,y:number,w=20)=>{rect(ctx,x,y,w,8,'#475569','#94a3b8');line(ctx,x+w,y,x+w+6,y-8,'#64748b',1.5);for(const wx of [x+4,x+w-4]){ctx.strokeStyle='#111827';ctx.lineWidth=2;ctx.beginPath();ctx.arc(wx,y+10,3,0,Math.PI*2);ctx.stroke();}};
const anchor=(b:TacticalBuilding)=>{const right=b.doorX>b.x+b.w/2;return {x:right?b.x-24:b.x+b.w+12,y:b.y+b.h*.70,dir:right?-1:1};};
const t1=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,n:string)=>{const a=anchor(b);shadow(ctx,a.x+8,a.y+11,22);
  if(n.includes('beco 01')){crate(ctx,a.x,a.y);barrel(ctx,a.x+18,a.y-2,'#0e7490');}
  else if(n.includes('laje do ponto')){chair(ctx,a.x,a.y);barrel(ctx,a.x+18,a.y-3,'#64748b');}
  else if(n.includes('barraquinha')){crate(ctx,a.x,a.y);crate(ctx,a.x+13,a.y+2,10,7);}
  else if(n.includes('esconderijo')){crate(ctx,a.x,a.y,15,8);pallet(ctx,a.x+15,a.y+2,20);}
  else if(n.includes('boca da leste')){chair(ctx,a.x,a.y);crate(ctx,a.x+14,a.y+2,10,7);}
  else if(n.includes('torre')||n.includes('mirante'))bench(ctx,a.x,a.y,23);
};
const t2=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,n:string)=>{const a=anchor(b);shadow(ctx,a.x+10,a.y+10,24);
  if(n.includes('armazem')){pallet(ctx,a.x,a.y+2,26);cart(ctx,a.x+4,a.y-10,20);}
  else if(n.includes('estacao')){bench(ctx,a.x,a.y,28);rect(ctx,a.x+31,a.y-8,8,14,'#334155','#94a3b8');}
  else if(n.includes('cabine'))cabinet(ctx,a.x,a.y-8,'#eab308');
  else if(n.includes('passarela')){cabinet(ctx,a.x,a.y-8,'#94a3b8');rect(ctx,a.x+18,a.y-2,11,3,'#facc15');}
  else if(n.includes('box')||n.includes('banca')){crate(ctx,a.x,a.y);crate(ctx,a.x+13,a.y+2,11,7);}
  else if(n.includes('deposito')){pallet(ctx,a.x,a.y+3,24);crate(ctx,a.x+4,a.y-7,14,9);}
};const t3=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,n:string)=>{const a=anchor(b);shadow(ctx,a.x+10,a.y+10,25);
  if(n.includes('oficina')){tyre(ctx,a.x+4,a.y,6);tyre(ctx,a.x+16,a.y+1,5);barrel(ctx,a.x+28,a.y-3,'#92400e');}
  else if(n.includes('serralheria'))metalRack(ctx,a.x,a.y+2,30);
  else if(n.includes('galpao')){pallet(ctx,a.x,a.y+3,26);crate(ctx,a.x+5,a.y-7,15,9);}
  else if(n.includes('deposito')){pallet(ctx,a.x,a.y+3,27);crate(ctx,a.x+3,a.y-9,14,10);crate(ctx,a.x+18,a.y-5,11,8);}
  else if(n.includes('portaria')){cone(ctx,a.x+4,a.y+4);cone(ctx,a.x+18,a.y+5);}
  else if(n.includes('torre'))cabinet(ctx,a.x,a.y-8,'#f97316');
};
const t4=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,n:string)=>{const a=anchor(b);shadow(ctx,a.x+9,a.y+10,22);
  if(n.includes('beco')){crate(ctx,a.x,a.y);barrel(ctx,a.x+16,a.y-3,'#64748b');}
  else if(n.includes('laje')){pallet(ctx,a.x,a.y+2,22);crate(ctx,a.x+4,a.y-7,11,8);}
  else if(n.includes('barraco')){barrel(ctx,a.x+5,a.y-3,'#475569');chair(ctx,a.x+17,a.y);}
  else if(n.includes('reduto')){crate(ctx,a.x,a.y,14,8);crate(ctx,a.x+15,a.y+2,11,7);}
  else if(n.includes('boca'))chair(ctx,a.x,a.y);
  else if(n.includes('posto')||n.includes('mirante'))bench(ctx,a.x,a.y,24);
};
const t5=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,n:string)=>{const a=anchor(b);shadow(ctx,a.x+10,a.y+10,23);
  if(n.includes('casa')){planter(ctx,a.x,a.y,22);chair(ctx,a.x+27,a.y);}
  else if(n.includes('condominio')){cart(ctx,a.x,a.y-3,20);planter(ctx,a.x+27,a.y+2,18);}
  else if(n.includes('guarita')){cone(ctx,a.x+3,a.y+4);rect(ctx,a.x+12,a.y-6,9,13,'#334155','#cbd5e1');}
  else if(n.includes('mansao')){planter(ctx,a.x,a.y,26);bench(ctx,a.x+31,a.y,22);}
  else if(n.includes('portaria')){cart(ctx,a.x,a.y-3,20);cone(ctx,a.x+29,a.y+5);}
  else if(n.includes('cobertura')){planter(ctx,a.x,a.y,24);}
};
const t6=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,n:string,color:string)=>{const a=anchor(b);shadow(ctx,a.x+10,a.y+10,23);
  if(n.includes('anexo')){cabinet(ctx,a.x,a.y-8,color);crate(ctx,a.x+18,a.y+1,12,8);}
  else if(n.includes('centro operacional')){cabinet(ctx,a.x,a.y-8,color);cabinet(ctx,a.x+17,a.y-5,'#64748b');}
  else if(n.includes('posto blindado')){cone(ctx,a.x+3,a.y+4);cone(ctx,a.x+16,a.y+5);rect(ctx,a.x+25,a.y-3,16,5,'#475569',color);}
  else if(n.includes('alojamento'))bench(ctx,a.x,a.y,26);
  else if(n.includes('comando')){cabinet(ctx,a.x,a.y-8,color);rect(ctx,a.x+18,a.y-5,16,8,'#1f2937','#64748b');}
  else if(n.includes('torre'))cabinet(ctx,a.x,a.y-8,color);
  else if(n.includes('qg central')){cabinet(ctx,a.x,a.y-8,color);cone(ctx,a.x+22,a.y+5);cone(ctx,a.x+34,a.y+5);}
};
export function drawAuthoredStoryClusters(ctx:CanvasRenderingContext2D,buildings:readonly TacticalBuilding[],territoryId:number,controlColor:string){ctx.save();for(const b of buildings){const n=norm(b.label);if(territoryId===1)t1(ctx,b,n);else if(territoryId===2)t2(ctx,b,n);else if(territoryId===3)t3(ctx,b,n);else if(territoryId===4)t4(ctx,b,n);else if(territoryId===5)t5(ctx,b,n);else if(territoryId===6)t6(ctx,b,n,controlColor);}ctx.restore();}
