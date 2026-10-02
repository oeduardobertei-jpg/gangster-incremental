import type { TacticalBuilding } from './favelaRenderer';

type Args = {
  ctx: CanvasRenderingContext2D;
  b: TacticalBuilding;
  territoryId: number;
  roofY: number;
  facadeY: number;
  height: number;
  controlColor: string;
  time: number;
};

const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const poly=(ctx:CanvasRenderingContext2D,pts:[number,number][],fill:string,stroke?:string)=>{
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
};const rail=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h=9)=>{
  line(ctx,x,y,x+w,y,'#cbd5e1',1.2);line(ctx,x,y+h,x+w,y+h,'#94a3b8',1);
  for(let xx=x;xx<=x+w;xx+=10)line(ctx,xx,y,xx,y+h,'#94a3b8',1);
};
const posts=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,count=3,c='#64748b')=>{
  for(let i=0;i<count;i++){const px=x+(w*i)/(Math.max(1,count-1));line(ctx,px,y,px,y+h,c,1.5);}
};
const gable=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke='#94a3b8')=>{
  poly(ctx,[[x,y+h],[x+w/2,y],[x+w,y+h]],fill,stroke);
};
const sawRoof=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,teeth=4)=>{
  const step=w/teeth;ctx.beginPath();ctx.moveTo(x,y+h);
  for(let i=0;i<teeth;i++){ctx.lineTo(x+i*step+step*.58,y);ctx.lineTo(x+(i+1)*step,y+h);}
  ctx.lineTo(x+w,y+h+3);ctx.lineTo(x,y+h+3);ctx.closePath();ctx.fillStyle='#3f4852';ctx.fill();ctx.strokeStyle='#88939f';ctx.stroke();
};
const rooftopRoom=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke='#94a3b8')=>{
  rect(ctx,x,y,w,h,fill,stroke);rect(ctx,x+w*.62,y+h*.32,w*.20,h*.42,'#111827','#64748b');
};
const stair=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,dir:1|-1=1)=>{
  const n=5;for(let i=0;i<n;i++){const yy=y+i*(h/n),ww=w*(i+1)/n;rect(ctx,dir>0?x:x+w-ww,yy,ww,h/n,'#5b6470');}
};const underT1=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height}=a;
  if(n.includes('laje do ponto')){rect(ctx,b.x-7,facadeY+7,15,height-7,'#4d5662');stair(ctx,b.x-17,facadeY+height-18,18,18,1);}
  else if(n.includes('barraquinha')){poly(ctx,[[b.x-8,roofY+8],[b.x+b.w+8,roofY+8],[b.x+b.w-1,roofY+19],[b.x-1,roofY+19]],'#4b5563','#9ca3af');}
  else if(n.includes('esconderijo')){rect(ctx,b.x+b.w-2,facadeY+9,17,height-9,'#29323b','#4b5563');}
  else if(n.includes('torre de guarda')){posts(ctx,b.x+b.w*.34,roofY-19,b.w*.32,25,3,'#6b7280');}
  else if(n.includes('mirante')){rect(ctx,b.x-6,roofY+15,b.w+12,5,'rgba(15,23,42,.55)');posts(ctx,b.x+8,roofY-3,b.w-16,18,4,'#64748b');}
};

const underT2=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height}=a;
  if(n.includes('armazem do trilho')){rect(ctx,b.x-12,facadeY+height-5,b.w+24,11,'#544534','#8b7355');posts(ctx,b.x-9,facadeY+height-17,b.w+18,12,4,'#6b7280');}
  else if(n.includes('banca coberta')){posts(ctx,b.x+5,roofY-2,b.w-10,24,4,'#6b7280');}
  else if(n.includes('deposito da praca')){rect(ctx,b.x+b.w-2,facadeY+10,18,height-10,'#51402f','#7c6849');}
  else if(n.includes('estacao leste')){rect(ctx,b.x-22,facadeY+height-6,b.w+44,9,'#5b6470','#d6b35c');posts(ctx,b.x-16,roofY-4,b.w+32,facadeY-roofY+height-2,5,'#737f8b');}
  else if(n.includes('cabine ferroviaria')){stair(ctx,b.x-17,facadeY+height-16,18,16,1);rect(ctx,b.x-5,facadeY+height-4,b.w+10,5,'#4b5563');}
  else if(n.includes('passarela')){const cx=b.x+b.w/2,top=facadeY+height-2;rect(ctx,cx-12,top,24,62,'#414b56','#94a3b8');posts(ctx,cx-8,top+4,16,54,2,'#64748b');stair(ctx,cx-30,top+34,18,28,1);stair(ctx,cx+12,top+34,18,28,-1);}
};const underT3=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height}=a;
  if(n.includes('oficina')){rect(ctx,b.x-9,facadeY+9,18,height-9,'#2a3139','#59636f');poly(ctx,[[b.x-10,roofY+13],[b.x+b.w*.55,roofY+13],[b.x+b.w*.48,roofY+24],[b.x-10,roofY+24]],'#3a434d','#64748b');}
  else if(n.includes('galpao de pecas')){rect(ctx,b.x-12,facadeY+height-8,b.w+24,10,'#303943','#64748b');}
  else if(n.includes('serralheria')){rect(ctx,b.x+b.w-2,facadeY+5,20,height-5,'#313841','#64748b');line(ctx,b.x+b.w+8,roofY+4,b.x+b.w+8,facadeY+height,'#a8b1bc',2);}
  else if(n.includes('deposito industrial')){rect(ctx,b.x-10,facadeY+height-6,b.w+20,9,'#353d46','#64748b');}
  else if(n.includes('portaria do patio')){rect(ctx,b.x-8,facadeY+5,b.w*.52,height-3,'#2b343e','#64748b');}
  else if(n.includes('torre da fabrica')){rect(ctx,b.x+b.w*.43,roofY-42,b.w*.14,46,'#414b56','#94a3b8');}
};

const underT4=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height}=a;
  if(n.includes('beco da subida')){stair(ctx,b.x-17,facadeY+height-26,22,26,1);rect(ctx,b.x-5,facadeY+10,12,height-10,'#4e433a');}
  else if(n.includes('laje fortificada')){rect(ctx,b.x-7,roofY+15,b.w+14,9,'#453e38','#77706a');}
  else if(n.includes('barraco alto')){rect(ctx,b.x+b.w-3,facadeY+7,18,height-7,'#5a493d','#7d6a5b');}
  else if(n.includes('reduto do morro')){rect(ctx,b.x-7,facadeY+6,b.w+14,height-4,'#332f2b','#736b64');}
  else if(n.includes('posto de vigia')){posts(ctx,b.x+b.w*.32,roofY-18,b.w*.36,28,3,'#706b66');}
  else if(n.includes('mirante do morro')){posts(ctx,b.x+8,roofY-4,b.w-16,22,4,'#68635f');}
};

const underT5=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height}=a;
  if(n.includes('casa da orla')){rect(ctx,b.x-12,facadeY+10,20,height-10,'#9faab6','#dce3ea');}
  else if(n.includes('condominio norte')){rect(ctx,b.x+b.w*.18,roofY-8,b.w*.64,10,'#c8d0d9','#e2e8f0');}
  else if(n.includes('guarita')){rect(ctx,b.x-7,facadeY+7,b.w*.52,height-5,'#cbd5df','#edf2f7');}
  else if(n.includes('mansao reservada')){rect(ctx,b.x-14,facadeY+10,b.w+28,height-8,'#aeb8c4','#e2e8f0');}
  else if(n.includes('portaria leste')){rect(ctx,b.x-18,facadeY+height-8,b.w+36,9,'#aab5c0','#e2e8f0');}
  else if(n.includes('cobertura')){rect(ctx,b.x-10,roofY+12,b.w+20,7,'#d7dee6','#f8fafc');}
};

const underT6=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height}=a;
  if(n.includes('anexo do qg')){rect(ctx,b.x+b.w-2,facadeY+8,20,height-6,'#202933','#586575');}
  else if(n.includes('centro operacional')){rect(ctx,b.x-10,facadeY+9,b.w+20,height-7,'#17202a','#536170');}
  else if(n.includes('posto blindado')){rect(ctx,b.x-8,facadeY+height-13,b.w+16,15,'#111923','#465463');}
  else if(n.includes('alojamento central')){rect(ctx,b.x-9,facadeY+10,b.w+18,height-8,'#202a35','#5d6976');}
  else if(n.includes('comando leste')){rect(ctx,b.x+b.w*.22,roofY-12,b.w*.56,14,'#1a2430','#607080');}
  else if(n.includes('torre de seguranca')){posts(ctx,b.x+b.w*.38,roofY-32,b.w*.24,39,3,'#64748b');}
  else if(n.includes('qg central')){rect(ctx,b.x-11,facadeY+10,b.w+22,height-7,'#131c26','#506173');}
};export function drawBespokeArchitectureUnderlay(args:Args){
  const n=norm(args.b.label);args.ctx.save();
  if(args.territoryId===1)underT1(args,n);
  else if(args.territoryId===2)underT2(args,n);
  else if(args.territoryId===3)underT3(args,n);
  else if(args.territoryId===4)underT4(args,n);
  else if(args.territoryId===5)underT5(args,n);
  else if(args.territoryId===6)underT6(args,n);
  args.ctx.restore();
}

const roofUnit=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,c='#4b5563')=>{
  rect(ctx,x,y,w,h,c,'#94a3b8');rect(ctx,x+3,y+3,w-6,3,'rgba(226,232,240,.14)');
};
const planter=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{
  rect(ctx,x,y,w,5,'#475569');ctx.fillStyle='#315b46';for(let px=x+4;px<x+w-2;px+=7){ctx.beginPath();ctx.arc(px,y-2,3,0,Math.PI*2);ctx.fill();}
};
const waterTank=(ctx:CanvasRenderingContext2D,x:number,y:number)=>{
  ctx.fillStyle='#087ea4';ctx.fillRect(x-8,y-5,16,11);ctx.beginPath();ctx.ellipse(x,y-5,8,3.5,0,0,Math.PI*2);ctx.fill();
};const overT1=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor}=a;
  if(n.includes('beco 01')){poly(ctx,[[b.x+4,roofY+4],[b.x+b.w-4,roofY+4],[b.x+b.w-10,roofY-5],[b.x+10,roofY-5]],'#6b4b37','#a56b45');}
  else if(n.includes('laje do ponto')){rooftopRoom(ctx,b.x+12,roofY+14,30,18,'#59636d');waterTank(ctx,b.x+b.w-18,roofY+12);rail(ctx,b.x+5,roofY+3,b.w-10,8);}
  else if(n.includes('barraquinha')){gable(ctx,b.x-5,roofY-11,b.w+10,12,'#69737d');line(ctx,b.x+8,roofY-2,b.x+b.w-8,roofY-2,'#d1d5db',1);}
  else if(n.includes('esconderijo')){roofUnit(ctx,b.x+b.w-23,roofY+8,14,10,'#303944');line(ctx,b.x+8,roofY+6,b.x+b.w-8,roofY+6,'#475569',2);}
  else if(n.includes('boca da leste')){poly(ctx,[[b.x+7,roofY+15],[b.x+b.w*.52,roofY+15],[b.x+b.w*.45,roofY+24],[b.x+7,roofY+24]],'#4a5159','#787f87');line(ctx,b.x+b.w*.75,roofY+8,b.x+b.w*.75,roofY-12,controlColor,1.4);}
  else if(n.includes('torre de guarda')){rooftopRoom(ctx,b.x+b.w*.27,roofY-22,b.w*.46,19,'#414a54');rail(ctx,b.x+b.w*.22,roofY-25,b.w*.56,8);}
  else if(n.includes('mirante')){rail(ctx,b.x+4,roofY,b.w-8,9);posts(ctx,b.x+10,roofY+7,b.w-20,17,4);rect(ctx,b.x+7,roofY+5,b.w-14,3,'#606872');}
};

const overT2=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height,controlColor}=a;
  if(n.includes('box da feira')){gable(ctx,b.x-4,roofY-12,b.w+8,12,'#8b6b3e','#facc15');}
  else if(n.includes('armazem do trilho')){sawRoof(ctx,b.x-5,roofY-12,b.w+10,12,4);roofUnit(ctx,b.x+b.w*.62,roofY+10,22,11,'#4b5563');}
  else if(n.includes('banca coberta')){gable(ctx,b.x-8,roofY-13,b.w+16,13,'#72563a','#fbbf24');}
  else if(n.includes('deposito da praca')){gable(ctx,b.x-3,roofY-10,b.w+6,10,'#5b4937','#b89762');roofUnit(ctx,b.x+12,roofY+12,16,8,'#40372f');}
  else if(n.includes('estacao leste')){const y=roofY-12;rect(ctx,b.x-18,y,b.w+36,5,'#d6b35c','#fef3c7');posts(ctx,b.x-14,y+5,b.w+28,facadeY+height-y-5,5,'#7c8793');}
  else if(n.includes('cabine ferroviaria')){gable(ctx,b.x+4,roofY-12,b.w-8,11,'#48525d','#cbd5e1');rect(ctx,b.x+11,roofY+8,b.w-22,10,'#23303d','#93c5fd');}
  else if(n.includes('passarela')){const cx=b.x+b.w/2,landingY=roofY-14;rect(ctx,b.x+b.w*.28,landingY,b.w*.44,11,'#58636f','#cbd5e1');rail(ctx,b.x+b.w*.24,landingY-9,b.w*.52,9);line(ctx,cx-9,facadeY+height,cx-9,facadeY+height+60,'#cbd5e1',1.4);line(ctx,cx+9,facadeY+height,cx+9,facadeY+height+60,'#cbd5e1',1.4);for(let y=facadeY+height+7;y<facadeY+height+58;y+=10)line(ctx,cx-9,y,cx+9,y,'rgba(203,213,225,.55)',1);rect(ctx,cx-5,landingY+3,10,3,controlColor);}
};const overT3=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor}=a;
  if(n.includes('oficina')){gable(ctx,b.x+4,roofY-9,b.w*.54,10,'#3b4651','#6b7280');roofUnit(ctx,b.x+b.w-30,roofY+9,20,11,'#26313d');}
  else if(n.includes('galpao de pecas')){sawRoof(ctx,b.x-4,roofY-13,b.w+8,13,5);for(const x of [b.x+18,b.x+b.w-30])roofUnit(ctx,x,roofY+12,18,9,'#303944');}
  else if(n.includes('serralheria')){poly(ctx,[[b.x-4,roofY+6],[b.x+b.w+6,roofY+6],[b.x+b.w,roofY-6],[b.x+2,roofY-6]],'#48515a','#94a3b8');line(ctx,b.x+b.w+8,roofY+2,b.x+b.w+8,roofY-23,controlColor,1.5);}
  else if(n.includes('deposito industrial')){sawRoof(ctx,b.x-3,roofY-10,b.w+6,10,3);roofUnit(ctx,b.x+b.w*.42,roofY+11,24,10,'#252e38');}
  else if(n.includes('portaria do patio')){gable(ctx,b.x-7,roofY-10,b.w*.62,10,'#46515c','#cbd5e1');rect(ctx,b.x+b.w*.58,roofY+18,b.w*.28,4,'#f59e0b');}
  else if(n.includes('torre da fabrica')){rect(ctx,b.x+b.w*.42,roofY-46,b.w*.16,28,'#515c68','#94a3b8');rect(ctx,b.x+b.w*.45,roofY-54,b.w*.10,8,'#65717d');line(ctx,b.x+b.w*.5,roofY-54,b.x+b.w*.5,roofY-69,'#94a3b8',2);}
};

const overT4=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor}=a;
  if(n.includes('beco da subida')){poly(ctx,[[b.x+2,roofY+6],[b.x+b.w-2,roofY+6],[b.x+b.w-10,roofY-5],[b.x+10,roofY-5]],'#55473b','#7d6a59');}
  else if(n.includes('laje fortificada')){rail(ctx,b.x+4,roofY-3,b.w-8,8);for(let x=b.x+9;x<b.x+b.w-12;x+=17)rect(ctx,x,roofY+9,12,7,'#655d56','#847a72');}
  else if(n.includes('barraco alto')){gable(ctx,b.x-3,roofY-11,b.w+6,11,'#665347','#877467');}
  else if(n.includes('reduto do morro')){rect(ctx,b.x+5,roofY-6,b.w-10,9,'#3d3935','#78716c');rect(ctx,b.x+b.w*.35,roofY-8,b.w*.30,4,'#111827',controlColor);}
  else if(n.includes('boca do alto')){poly(ctx,[[b.x+5,roofY+13],[b.x+b.w*.58,roofY+13],[b.x+b.w*.52,roofY+22],[b.x+5,roofY+22]],'#49423c','#78716c');}
  else if(n.includes('posto de vigia')){rooftopRoom(ctx,b.x+b.w*.28,roofY-23,b.w*.44,20,'#48423d','#8b8178');rail(ctx,b.x+b.w*.23,roofY-26,b.w*.54,8);}
  else if(n.includes('mirante do morro')){rail(ctx,b.x+3,roofY-2,b.w-6,9);posts(ctx,b.x+9,roofY+6,b.w-18,18,4);line(ctx,b.x+b.w*.72,roofY+5,b.x+b.w*.72,roofY-18,controlColor,1.5);}
};const overT5=(a:Args,n:string)=>{const {ctx,b,roofY}=a;
  if(n.includes('casa da orla')){gable(ctx,b.x+7,roofY-11,b.w-14,11,'#d8dee7','#f1f5f9');rail(ctx,b.x+12,roofY+19,b.w-24,7);planter(ctx,b.x+10,roofY+b.h-9,22);}
  else if(n.includes('condominio norte')){rect(ctx,b.x+b.w*.20,roofY-13,b.w*.60,12,'#cbd5e1','#f8fafc');for(let x=b.x+14;x<b.x+b.w-18;x+=22)rect(ctx,x,roofY+11,13,9,'#173b52','#dbeafe');}
  else if(n.includes('guarita oeste')){gable(ctx,b.x+5,roofY-10,b.w*.48,10,'#d9e0e7','#f8fafc');rail(ctx,b.x+b.w*.58,roofY+12,b.w*.30,7);}
  else if(n.includes('mansao reservada')){rect(ctx,b.x-7,roofY-8,b.w+14,10,'#d6dde5','#f8fafc');rail(ctx,b.x+10,roofY+6,b.w-20,8);posts(ctx,b.x+18,roofY+14,b.w-36,18,4,'#cbd5e1');planter(ctx,b.x+b.w-33,roofY+b.h-10,22);}
  else if(n.includes('portaria leste')){poly(ctx,[[b.x-12,roofY+11],[b.x+b.w+12,roofY+11],[b.x+b.w+5,roofY-2],[b.x-5,roofY-2]],'#d7dee6','#f8fafc');posts(ctx,b.x-6,roofY+10,b.w+12,18,4,'#cbd5e1');}
  else if(n.includes('guarita principal')){gable(ctx,b.x+5,roofY-10,b.w*.55,10,'#d9e0e7','#f8fafc');rect(ctx,b.x+b.w*.62,roofY+12,b.w*.25,5,'#334155');}
  else if(n.includes('cobertura')){rail(ctx,b.x+4,roofY-2,b.w-8,8);posts(ctx,b.x+14,roofY+7,b.w-28,18,4,'#d7dee7');rect(ctx,b.x+14,roofY+6,b.w-28,4,'#e2e8f0');rect(ctx,b.x+b.w*.58,roofY+24,b.w*.26,8,'rgba(56,189,248,.35)','#7dd3fc');}
};

const overT6=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor,time}=a;
  if(n.includes('anexo do qg')){roofUnit(ctx,b.x+b.w-30,roofY+9,20,11,'#2d3945');rect(ctx,b.x+10,roofY-5,b.w*.42,7,'#3b4754','#64748b');}
  else if(n.includes('centro operacional')){rect(ctx,b.x+b.w*.24,roofY-14,b.w*.52,14,'#1b2733',controlColor);roofUnit(ctx,b.x+12,roofY+12,18,9,'#26313d');}
  else if(n.includes('posto blindado')){poly(ctx,[[b.x+6,roofY+4],[b.x+b.w-6,roofY+4],[b.x+b.w-14,roofY-7],[b.x+14,roofY-7]],'#202a35','#52606e');rect(ctx,b.x+b.w*.37,roofY+8,b.w*.26,7,'#0b0f16',controlColor);}
  else if(n.includes('alojamento central')){for(const x of [b.x+13,b.x+b.w-31])roofUnit(ctx,x,roofY+11,18,9,'#354250');rect(ctx,b.x+8,roofY-5,b.w-16,5,'#455260');}
  else if(n.includes('comando leste')){rect(ctx,b.x+b.w*.27,roofY-21,b.w*.46,20,'#18232e',controlColor);line(ctx,b.x+b.w*.5,roofY-21,b.x+b.w*.5,roofY-42,'#94a3b8',2);}
  else if(n.includes('torre de seguranca')){rooftopRoom(ctx,b.x+b.w*.31,roofY-38,b.w*.38,24,'#222e3a','#64748b');rail(ctx,b.x+b.w*.25,roofY-41,b.w*.50,8);}
  else if(n.includes('qg central')){rect(ctx,b.x+b.w*.18,roofY-18,b.w*.64,18,'#111c27',controlColor);rect(ctx,b.x+b.w*.31,roofY-30,b.w*.38,12,'#192735','#64748b');line(ctx,b.x+b.w*.5,roofY-30,b.x+b.w*.5,roofY-52,'#94a3b8',2);ctx.fillStyle=controlColor;ctx.globalAlpha=.35+.2*Math.sin(time*.004);ctx.fillRect(b.x+b.w*.34,roofY-27,b.w*.32,3);ctx.globalAlpha=1;}
};export function drawBespokeArchitectureOverlay(args:Args){
  const n=norm(args.b.label);args.ctx.save();
  if(args.territoryId===1)overT1(args,n);
  else if(args.territoryId===2)overT2(args,n);
  else if(args.territoryId===3)overT3(args,n);
  else if(args.territoryId===4)overT4(args,n);
  else if(args.territoryId===5)overT5(args,n);
  else if(args.territoryId===6)overT6(args,n);
  if(args.territoryId===3){deepT3(args,n);deepT3b(args,n);}
  else if(args.territoryId===4){deepT4(args,n);deepT4b(args,n);}
  else if(args.territoryId===5){deepT5(args,n);deepT5b(args,n);}
  else if(args.territoryId===6){deepT6(args,n);deepT6b(args,n);}
  args.ctx.restore();
}
const wheel=(ctx:CanvasRenderingContext2D,x:number,y:number,r=5)=>{
  ctx.strokeStyle='#111827';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#475569';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r*.45,0,Math.PI*2);ctx.stroke();
};
const beamRack=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{
  line(ctx,x,y,x+w,y,'#64748b',2);line(ctx,x,y-8,x,y+4,'#94a3b8',1.5);line(ctx,x+w,y-8,x+w,y+4,'#94a3b8',1.5);
  for(let i=0;i<4;i++)line(ctx,x+3,y-7+i*3,x+w-3,y-7+i*3,i%2?'#7c8794':'#a8552c',1.3);
};
const deepT3=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height}=a;
  if(n.includes('oficina 01')){
    poly(ctx,[[b.x+4,roofY+7],[b.x+b.w*.62,roofY+7],[b.x+b.w*.54,roofY+18],[b.x+4,roofY+18]],'#3b454f','#6b7280');
    wheel(ctx,b.x+b.w-20,facadeY+height-7);wheel(ctx,b.x+b.w-31,facadeY+height-7);
  } else if(n.includes('oficina leste')){
    rect(ctx,b.x+5,roofY-7,b.w-10,8,'#4b5563','#94a3b8');posts(ctx,b.x+9,roofY+1,b.w-18,17,4,'#64748b');
    roofUnit(ctx,b.x+b.w-30,roofY+19,20,10,'#2c3640');
  } else if(n.includes('serralheria')){
    beamRack(ctx,b.x+9,facadeY+height-5,b.w-18);rect(ctx,b.x+b.w-16,roofY-5,8,18,'#3c4650','#94a3b8');
  }
};
const deepT3b=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height,controlColor}=a;
  if(n.includes('galpao de pecas')){
    for(const x of [b.x+18,b.x+b.w-32]){rect(ctx,x,roofY+7,18,7,'#59636d','#94a3b8');line(ctx,x+4,roofY+7,x+4,roofY-4,'#64748b',1.2);}
  } else if(n.includes('deposito industrial')){
    rect(ctx,b.x+7,roofY-7,b.w-14,8,'#39434d','#94a3b8');
    for(let x=b.x+15;x<b.x+b.w-18;x+=20)rect(ctx,x,roofY+8,12,5,'#607080','#94a3b8');
    rect(ctx,b.x+8,facadeY+height-9,b.w-16,6,'#252d36',controlColor);
  } else if(n.includes('portaria do patio')){
    rect(ctx,b.x-10,roofY-8,b.w+30,7,'#59636d','#cbd5e1');posts(ctx,b.x-5,roofY-1,b.w+20,17,4,'#64748b');
  } else if(n.includes('torre da fabrica')){
    rail(ctx,b.x+b.w*.34,roofY-48,b.w*.32,8);rect(ctx,b.x+b.w*.46,roofY-62,b.w*.08,14,'#5f6b77','#94a3b8');
  }
};

const sandbag=(ctx:CanvasRenderingContext2D,x:number,y:number,w=12)=>{
  ctx.fillStyle='#756b61';ctx.beginPath();ctx.ellipse(x,y,w*.5,3.5,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(226,232,240,.12)';ctx.stroke();
};
const corrugated=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill='#5b5f61')=>{
  poly(ctx,[[x,y+h],[x+w*.15,y],[x+w,y+3],[x+w,y+h]],fill,'#8b8f91');for(let xx=x+7;xx<x+w;xx+=9)line(ctx,xx,y+3,xx-2,y+h,'rgba(203,213,225,.18)',1);
};
const deepT4=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height,controlColor}=a;
  if(n.includes('beco da subida')){
    corrugated(ctx,b.x+3,roofY-8,b.w*.58,10,'#594c43');stair(ctx,b.x+b.w-18,facadeY+height-23,18,23,-1);
  } else if(n.includes('laje fortificada')){
    for(let x=b.x+10;x<b.x+b.w-10;x+=15)sandbag(ctx,x,roofY+8,13);
    rect(ctx,b.x+b.w*.62,roofY+15,b.w*.22,10,'#4b4743','#78716c');
  } else if(n.includes('barraco alto')){
    corrugated(ctx,b.x-4,roofY-11,b.w+8,13,'#66564b');posts(ctx,b.x+8,roofY+2,b.w-16,22,3,'#6f655d');
  } else if(n.includes('reduto do morro')){
    rect(ctx,b.x+5,roofY-9,b.w-10,11,'#37332f','#78716c');for(let x=b.x+12;x<b.x+b.w-12;x+=17)sandbag(ctx,x,roofY+4,12);
    rect(ctx,b.x+b.w*.38,roofY-3,b.w*.24,4,'#111827',controlColor);
  }
};
const deepT4b=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height,controlColor}=a;
  if(n.includes('boca do alto')){
    poly(ctx,[[b.x+5,facadeY+3],[b.x+b.w*.62,facadeY+3],[b.x+b.w*.57,facadeY+11],[b.x+5,facadeY+11]],'#66584c','#8b8178');
    line(ctx,b.x+b.w-12,roofY+8,b.x+b.w-12,roofY-13,'#94a3b8',1.4);ctx.fillStyle=controlColor;ctx.beginPath();ctx.arc(b.x+b.w-12,roofY-15,3,0,Math.PI*2);ctx.fill();
  } else if(n.includes('posto de vigia')){
    posts(ctx,b.x+b.w*.34,roofY-28,b.w*.32,35,3,'#77716c');rooftopRoom(ctx,b.x+b.w*.27,roofY-31,b.w*.46,18,'#49433e','#8b8178');rail(ctx,b.x+b.w*.22,roofY-34,b.w*.56,8);
  } else if(n.includes('mirante do morro')){
    rail(ctx,b.x+2,roofY-5,b.w-4,9);posts(ctx,b.x+8,roofY+3,b.w-16,25,4,'#706a64');
    rect(ctx,b.x+b.w*.20,roofY+5,b.w*.60,4,'#615a54');line(ctx,b.x+b.w*.75,roofY+2,b.x+b.w*.75,roofY-20,controlColor,1.5);
  }
};
const pergola=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h=14)=>{
  posts(ctx,x,y,w,h,4,'#cbd5e1');for(let xx=x;xx<=x+w;xx+=8)line(ctx,xx,y,xx+5,y+h,'rgba(226,232,240,.45)',1);
};
const glassRail=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{
  rect(ctx,x,y,w,7,'rgba(56,189,248,.16)','rgba(186,230,253,.48)');for(let xx=x+12;xx<x+w;xx+=15)line(ctx,xx,y,xx,y+7,'rgba(226,232,240,.35)',1);
};
const deepT5=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height}=a;
  if(n.includes('casa da orla')){
    rect(ctx,b.x+5,facadeY+height-13,b.w*.40,8,'#e2e8f0','#f8fafc');glassRail(ctx,b.x+b.w*.46,roofY+18,b.w*.42);pergola(ctx,b.x+b.w*.52,roofY+4,b.w*.34,13);
  } else if(n.includes('condominio norte')){
    rect(ctx,b.x+b.w*.40,roofY-18,b.w*.20,18,'#cbd5e1','#f8fafc');
    for(const x of [b.x+12,b.x+b.w-27]){glassRail(ctx,x,roofY+22,15);rect(ctx,x+2,roofY+8,11,8,'#173b52','#dbeafe');}
  } else if(n.includes('guarita oeste')){
    rect(ctx,b.x-5,roofY-8,b.w*.60,8,'#e2e8f0','#f8fafc');posts(ctx,b.x,b.y-2,b.w*.48,18,3,'#cbd5e1');
  }
};
const deepT5b=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height}=a;
  if(n.includes('mansao reservada')){
    glassRail(ctx,b.x+10,roofY+7,b.w-20);pergola(ctx,b.x+b.w*.20,roofY+16,b.w*.38,15);rect(ctx,b.x+b.w*.63,roofY+20,b.w*.22,7,'rgba(56,189,248,.22)','#7dd3fc');
  } else if(n.includes('portaria leste')){
    rect(ctx,b.x-16,roofY-9,b.w+32,9,'#e2e8f0','#f8fafc');posts(ctx,b.x-9,roofY,b.w+18,22,5,'#cbd5e1');
    rect(ctx,b.x+b.w*.16,facadeY+height-8,b.w*.28,8,'#173b52','#cbd5e1');
  } else if(n.includes('guarita principal')){
    rect(ctx,b.x-9,roofY-9,b.w+18,8,'#dfe6ed','#f8fafc');posts(ctx,b.x-4,roofY-1,b.w+8,18,4,'#cbd5e1');
  } else if(n.includes('cobertura')){
    glassRail(ctx,b.x+5,roofY-4,b.w-10);pergola(ctx,b.x+b.w*.18,roofY+7,b.w*.42,16);rect(ctx,b.x+b.w*.65,roofY+12,b.w*.20,8,'rgba(56,189,248,.20)','#7dd3fc');
  }
};
const antennaArray=(ctx:CanvasRenderingContext2D,x:number,y:number,color:string)=>{
  line(ctx,x,y,x,y-25,'#94a3b8',1.5);for(const off of [-8,0,8]){line(ctx,x,y-10+off*.2,x+off,y-18,'#64748b',1);ctx.fillStyle=color;ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(x+off,y-19,2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
};
const deepT6=(a:Args,n:string)=>{const {ctx,b,roofY,facadeY,height,controlColor}=a;
  if(n.includes('anexo do qg')){
    rect(ctx,b.x+5,roofY-7,b.w*.45,8,'#334155','#64748b');rect(ctx,b.x+b.w*.58,roofY+12,b.w*.28,10,'#263544','#64748b');
  } else if(n.includes('centro operacional')){
    rect(ctx,b.x+b.w*.24,roofY-24,b.w*.52,22,'#162330',controlColor);antennaArray(ctx,b.x+b.w*.50,roofY-24,controlColor);
  } else if(n.includes('posto blindado')){
    poly(ctx,[[b.x+3,roofY+6],[b.x+b.w-3,roofY+6],[b.x+b.w-13,roofY-10],[b.x+13,roofY-10]],'#17212c','#64748b');
    rect(ctx,b.x+b.w*.34,facadeY+height-16,b.w*.32,13,'#0b0f16',controlColor);
  } else if(n.includes('alojamento central')){
    for(let x=b.x+11;x<b.x+b.w-20;x+=20){roofUnit(ctx,x,roofY+9,14,8,'#354250');rect(ctx,x+2,facadeY+8,10,7,'#1e3a4a','#64748b');}
  }
};
const deepT6b=(a:Args,n:string)=>{const {ctx,b,roofY,controlColor,time}=a;
  if(n.includes('comando leste')){
    rect(ctx,b.x+b.w*.22,roofY-28,b.w*.56,26,'#142230',controlColor);antennaArray(ctx,b.x+b.w*.50,roofY-28,controlColor);
  } else if(n.includes('torre de seguranca')){
    rect(ctx,b.x+b.w*.37,roofY-52,b.w*.26,18,'#263442','#64748b');rail(ctx,b.x+b.w*.29,roofY-55,b.w*.42,8);antennaArray(ctx,b.x+b.w*.50,roofY-55,controlColor);
  } else if(n.includes('qg central')){
    rect(ctx,b.x+b.w*.14,roofY-25,b.w*.72,24,'#101d2a',controlColor);rect(ctx,b.x+b.w*.29,roofY-41,b.w*.42,16,'#182938','#64748b');
    antennaArray(ctx,b.x+b.w*.50,roofY-41,controlColor);ctx.fillStyle=controlColor;ctx.globalAlpha=.28+.18*Math.sin(time*.004);ctx.fillRect(b.x+b.w*.20,roofY-20,b.w*.60,3);ctx.globalAlpha=1;
  }
};
