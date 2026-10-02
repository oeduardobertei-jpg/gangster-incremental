import type { TacticalBuilding } from './favelaRenderer';

type Args={ctx:CanvasRenderingContext2D;b:TacticalBuilding;territoryId:number;roofY:number;facadeY:number;height:number;controlColor:string;time:number};
const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}};
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
const tank=(ctx:CanvasRenderingContext2D,x:number,y:number,c='#0e7490')=>{ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x+3,y+5,10,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=c;ctx.fillRect(x-8,y-5,16,10);ctx.beginPath();ctx.ellipse(x,y-5,8,3,0,0,Math.PI*2);ctx.fill();};
const rebar=(ctx:CanvasRenderingContext2D,x:number,y:number,n=4)=>{for(let i=0;i<n;i++){line(ctx,x+i*7,y,x+i*7,y-15-(i%2)*4,'#6b7280',1.3);line(ctx,x+i*7-2,y-10,x+i*7+2,y-10,'#475569',1);}};
const condenser=(ctx:CanvasRenderingContext2D,x:number,y:number,w=18)=>{rect(ctx,x,y,w,9,'#4b5563','#94a3b8');ctx.strokeStyle='#cbd5e1';ctx.beginPath();ctx.arc(x+w*.55,y+4.5,3,0,Math.PI*2);ctx.stroke();};
const skylight=(ctx:CanvasRenderingContext2D,x:number,y:number,w=14)=>{rect(ctx,x,y,w,6,'rgba(125,211,252,.18)','#94a3b8');line(ctx,x+2,y+5,x+w-2,y+1,'rgba(226,232,240,.35)',1);};
const vent=(ctx:CanvasRenderingContext2D,x:number,y:number,h=18)=>{rect(ctx,x-3,y-h,6,h,'#475569','#94a3b8');rect(ctx,x-6,y-h-3,12,4,'#64748b','#cbd5e1');};
const antenna=(ctx:CanvasRenderingContext2D,x:number,y:number,c:string)=>{line(ctx,x,y,x,y-24,'#94a3b8',1.4);for(const off of [-8,0,8])line(ctx,x,y-13,x+off,y-18,c,1);};
const panel=(ctx:CanvasRenderingContext2D,x:number,y:number,w=22)=>{rect(ctx,x,y,w,9,'#173b52','#67b7d8');line(ctx,x+w/2,y,x+w/2,y+9,'rgba(226,232,240,.32)',1);line(ctx,x,y+4.5,x+w,y+4.5,'rgba(226,232,240,.24)',1);};const roofT1=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor}=a;
  if(n.includes('beco 01')){rebar(ctx,b.x+15,roofY+4,3);tank(ctx,b.x+b.w-18,roofY+14);}
  else if(n.includes('laje do ponto')){rebar(ctx,b.x+9,roofY+2,3);line(ctx,b.x+18,roofY+18,b.x+b.w-18,roofY+15,'rgba(226,232,240,.30)',1);}
  else if(n.includes('barraquinha')){rect(ctx,b.x+9,roofY+4,b.w-18,5,'#59636d','#94a3b8');}
  else if(n.includes('esconderijo')){rect(ctx,b.x+b.w*.58,roofY+12,b.w*.22,8,'#26313d','#64748b');antenna(ctx,b.x+b.w*.70,roofY+10,controlColor);}
  else if(n.includes('boca da leste')){condenser(ctx,b.x+b.w-30,roofY+10,17);line(ctx,b.x+12,roofY+4,b.x+b.w-12,roofY+4,'rgba(71,85,105,.45)',2);}
  else if(n.includes('torre de guarda')){antenna(ctx,b.x+b.w*.50,roofY-20,controlColor);}
  else if(n.includes('mirante')){rect(ctx,b.x+12,roofY+10,b.w*.32,5,'#475569','#94a3b8');}
};
const roofT2=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor}=a;
  if(n.includes('armazem do trilho')){for(const x of [b.x+18,b.x+b.w*.46,b.x+b.w-29])skylight(ctx,x,roofY+10,15);vent(ctx,b.x+b.w-17,roofY+20,15);}
  else if(n.includes('estacao leste')){rect(ctx,b.x+8,roofY+9,b.w-16,5,'#737f8b','#d6b35c');for(const x of [b.x+18,b.x+b.w-28])skylight(ctx,x,roofY+16,12);}
  else if(n.includes('cabine ferroviaria')){antenna(ctx,b.x+b.w*.58,roofY+5,controlColor);condenser(ctx,b.x+10,roofY+14,15);}
  else if(n.includes('passarela')){for(const x of [b.x+b.w*.34,b.x+b.w*.66]){line(ctx,x,roofY-12,x,roofY-25,'#94a3b8',1.2);ctx.fillStyle='#fde68a';ctx.beginPath();ctx.arc(x,roofY-26,2,0,Math.PI*2);ctx.fill();}}
  else if(n.includes('box da feira')||n.includes('banca coberta')){rect(ctx,b.x+8,roofY+6,b.w-16,4,'#8b6b3e','#facc15');}
  else if(n.includes('deposito da praca')){vent(ctx,b.x+b.w-19,roofY+18,13);skylight(ctx,b.x+14,roofY+12,14);}
};const roofT3=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor}=a;
  if(n.includes('oficina 01')){vent(ctx,b.x+18,roofY+18,18);condenser(ctx,b.x+b.w-30,roofY+11,18);}
  else if(n.includes('oficina leste')){rect(ctx,b.x+10,roofY+9,b.w*.42,5,'#475569','#94a3b8');vent(ctx,b.x+b.w*.72,roofY+20,20);}
  else if(n.includes('galpao de pecas')){for(const x of [b.x+15,b.x+b.w*.40,b.x+b.w*.67])skylight(ctx,x,roofY+9,16);}
  else if(n.includes('serralheria')){vent(ctx,b.x+b.w-18,roofY+15,23);rect(ctx,b.x+9,roofY+12,b.w*.35,5,'#59636d','#94a3b8');}
  else if(n.includes('deposito industrial')){for(const x of [b.x+16,b.x+b.w-29])vent(ctx,x,roofY+18,14);}
  else if(n.includes('portaria do patio')){condenser(ctx,b.x+10,roofY+12,15);rect(ctx,b.x+b.w*.62,roofY+10,b.w*.20,4,controlColor);}
  else if(n.includes('torre da fabrica')){vent(ctx,b.x+b.w*.50,roofY-38,22);}
};
const roofT4=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor}=a;
  if(n.includes('beco da subida')){tank(ctx,b.x+b.w-18,roofY+14,'#475569');rebar(ctx,b.x+9,roofY+2,3);}
  else if(n.includes('laje fortificada')){rebar(ctx,b.x+b.w-33,roofY+3,4);rect(ctx,b.x+10,roofY+12,b.w*.28,5,'#5f564e','#8b8178');}
  else if(n.includes('barraco alto')){tank(ctx,b.x+18,roofY+13,'#59636d');rect(ctx,b.x+b.w*.55,roofY+8,b.w*.28,4,'#6b5a4a');}
  else if(n.includes('reduto do morro')){antenna(ctx,b.x+b.w*.50,roofY-6,controlColor);}
  else if(n.includes('boca do alto')){condenser(ctx,b.x+b.w-28,roofY+11,16);}
  else if(n.includes('posto de vigia')){antenna(ctx,b.x+b.w*.50,roofY-24,controlColor);}
  else if(n.includes('mirante do morro')){antenna(ctx,b.x+b.w*.72,roofY-2,controlColor);rect(ctx,b.x+8,roofY+11,b.w*.24,5,'#5d5650','#8b8178');}
};const roofT5=(a:Args,n:string)=>{const {ctx,b,roofY}=a;
  if(n.includes('casa da orla')){panel(ctx,b.x+12,roofY+9,20);condenser(ctx,b.x+b.w-29,roofY+12,16);}
  else if(n.includes('condominio norte')){for(const x of [b.x+15,b.x+b.w-31])condenser(ctx,x,roofY+12,16);panel(ctx,b.x+b.w*.40,roofY+9,22);}
  else if(n.includes('guarita oeste')||n.includes('guarita principal')){condenser(ctx,b.x+b.w-25,roofY+11,14);}
  else if(n.includes('mansao reservada')){panel(ctx,b.x+12,roofY+11,22);panel(ctx,b.x+38,roofY+11,22);rect(ctx,b.x+b.w-30,roofY+18,18,5,'#315b46','#6ba576');}
  else if(n.includes('portaria leste')){condenser(ctx,b.x+12,roofY+12,15);rect(ctx,b.x+b.w-31,roofY+11,19,5,'#315b46','#6ba576');}
  else if(n.includes('cobertura')){panel(ctx,b.x+9,roofY+10,20);rect(ctx,b.x+b.w-32,roofY+14,20,5,'#315b46','#6ba576');}
};
const roofT6=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor,time}=a;
  if(n.includes('anexo do qg')){for(const x of [b.x+13,b.x+b.w-31])condenser(ctx,x,roofY+11,16);}
  else if(n.includes('centro operacional')){antenna(ctx,b.x+b.w*.50,roofY-20,controlColor);for(const x of [b.x+12,b.x+b.w-30])condenser(ctx,x,roofY+13,16);}
  else if(n.includes('posto blindado')){for(const x of [b.x+17,b.x+b.w-22])vent(ctx,x,roofY+16,12);}
  else if(n.includes('alojamento central')){for(const x of [b.x+12,b.x+b.w*.43,b.x+b.w-28])condenser(ctx,x,roofY+12,15);}
  else if(n.includes('comando leste')){antenna(ctx,b.x+b.w*.50,roofY-26,controlColor);rect(ctx,b.x+10,roofY+12,b.w*.22,6,'#263544','#64748b');}
  else if(n.includes('torre de seguranca')){antenna(ctx,b.x+b.w*.50,roofY-44,controlColor);ctx.fillStyle=controlColor;ctx.globalAlpha=.45+.25*Math.sin(time*.005);ctx.beginPath();ctx.arc(b.x+b.w*.50,roofY-47,2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
  else if(n.includes('qg central')){antenna(ctx,b.x+b.w*.50,roofY-38,controlColor);for(const x of [b.x+13,b.x+b.w-31])condenser(ctx,x,roofY+11,16);}
};
export function drawRooftopLife(args:Args){const n=norm(args.b.label);args.ctx.save();if(args.territoryId===1)roofT1(args,n);else if(args.territoryId===2)roofT2(args,n);else if(args.territoryId===3)roofT3(args,n);else if(args.territoryId===4)roofT4(args,n);else if(args.territoryId===5)roofT5(args,n);else if(args.territoryId===6)roofT6(args,n);args.ctx.restore();}
