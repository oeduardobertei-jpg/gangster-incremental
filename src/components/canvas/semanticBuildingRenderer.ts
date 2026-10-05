import type { TacticalBuilding } from './favelaRenderer';

type SemanticArgs = {
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
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const box=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const crate=(ctx:CanvasRenderingContext2D,x:number,y:number,w=13,h=9)=>{
  box(ctx,x,y,w,h,'#76502f','#a77946');line(ctx,x+2,y+2,x+w-2,y+h-2,'#4a321f');
};
const tyre=(ctx:CanvasRenderingContext2D,x:number,y:number,r=6)=>{ctx.strokeStyle='#111827';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};

const rail=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h=10)=>{
  line(ctx,x,y,x+w,y,'#cbd5e1',1.4);line(ctx,x,y+h,x+w,y+h,'#94a3b8',1);
  for(let xx=x;xx<=x+w;xx+=10)line(ctx,xx,y,xx,y+h,'#94a3b8',1);
};
const shutter=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,accent='#64748b')=>{
  box(ctx,x,y,w,h,'#1f2937',accent);for(let yy=y+4;yy<y+h;yy+=5)line(ctx,x+1,yy,x+w-1,yy,'rgba(148,163,184,.28)');
};
const canopy=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,colorA:string,colorB:string)=>{
  const stripes=6,sw=w/stripes;for(let i=0;i<stripes;i++)box(ctx,x+i*sw,y,sw,7,i%2?colorA:colorB);
  box(ctx,x-2,y+7,w+4,2,'rgba(15,23,42,.45)');
};
const lamp=(ctx:CanvasRenderingContext2D,x:number,y:number,color='#fde68a')=>{
  line(ctx,x,y,x,y-14,'#64748b',1.4);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y-16,3,0,Math.PI*2);ctx.fill();
};
const barrier=(ctx:CanvasRenderingContext2D,x:number,y:number,len:number)=>{
  box(ctx,x,y-2,len,4,'#f8fafc');for(let xx=x+4;xx<x+len;xx+=12)box(ctx,xx,y-2,6,4,'#ef4444');
  box(ctx,x-4,y-8,5,12,'#334155');
};
const antenna=(ctx:CanvasRenderingContext2D,x:number,y:number,color:string)=>{
  line(ctx,x,y,x,y-25,'#94a3b8',1.5);line(ctx,x-8,y-16,x+8,y-16,color,1.4);line(ctx,x-6,y-21,x+6,y-21,color,1.1);
};

const drawT1=({ctx,b,roofY,facadeY,height,controlColor}:SemanticArgs,name:string)=>{
  if(name.includes('beco 01')){
    box(ctx,b.x+8,facadeY+5,16,height-7,'#2b211b','#8b5e3c');
    line(ctx,b.x+26,facadeY+4,b.x+26,facadeY+height,'#475569',2);
  } else if(name.includes('laje do ponto')){
    rail(ctx,b.x+8,roofY+8,b.w-16,9);antenna(ctx,b.x+b.w*.45,roofY+9,controlColor);
  } else if(name.includes('barraquinha')){
    canopy(ctx,b.x+5,facadeY+1,b.w-10,'#fef3c7','#ef4444');box(ctx,b.x+12,facadeY+13,b.w-24,7,'#5b3b24');
  } else if(name.includes('esconderijo')){
    shutter(ctx,b.x+12,facadeY+7,b.w-24,height-9,'#334155');box(ctx,b.x+b.w-18,roofY+8,9,7,'#111827');
  } else if(name.includes('boca da leste')){
    shutter(ctx,b.x+10,facadeY+6,b.w*.42,height-8,controlColor);lamp(ctx,b.x+b.w-13,facadeY+12,controlColor);
  } else if(name.includes('torre de guarda')){
    box(ctx,b.x+b.w*.26,roofY-14,b.w*.48,20,'#3f4651','#94a3b8');rail(ctx,b.x+b.w*.22,roofY-16,b.w*.56,10);
  } else if(name.includes('mirante')){
    rail(ctx,b.x+7,roofY+7,b.w-14,11);box(ctx,b.x+b.w*.35,roofY+20,b.w*.30,10,'rgba(15,23,42,.55)');
  }
};

const drawT2=({ctx,b,roofY,facadeY,height,controlColor}:SemanticArgs,name:string)=>{
  if(name.includes('box da feira')){
    canopy(ctx,b.x+3,facadeY,b.w-6,'#fff7d6','#f59e0b');crate(ctx,b.x+9,facadeY+height-12);crate(ctx,b.x+24,facadeY+height-9,11,7);
  } else if(name.includes('armazem do trilho')){
    shutter(ctx,b.x+10,facadeY+6,b.w-20,height-8,'#d6b35c');box(ctx,b.x+7,facadeY+height+1,b.w-14,5,'#5b4631');crate(ctx,b.x+b.w-20,facadeY+height-11);
  } else if(name.includes('banca coberta')){
    canopy(ctx,b.x+4,roofY-4,b.w-8,'#fde68a','#92400e');box(ctx,b.x+12,facadeY+height-12,b.w-24,8,'#6b4a2d');
  } else if(name.includes('deposito da praca')){
    shutter(ctx,b.x+12,facadeY+6,b.w-24,height-8,'#a16207');crate(ctx,b.x+6,facadeY+height-10);crate(ctx,b.x+b.w-19,facadeY+height-10);
  } else if(name.includes('estacao leste')){
    box(ctx,b.x-5,roofY-9,b.w+10,5,'#d6b35c');line(ctx,b.x+5,roofY-4,b.x+5,facadeY+height,'#64748b',2);line(ctx,b.x+b.w-5,roofY-4,b.x+b.w-5,facadeY+height,'#64748b',2);
    box(ctx,b.x+16,facadeY+height-9,b.w-32,4,'#6b7280');box(ctx,b.x+b.w*.38,facadeY+6,b.w*.24,8,'#0f172a','#facc15');
  } else if(name.includes('cabine ferroviaria')){
    box(ctx,b.x+10,facadeY+6,b.w-20,height-9,'#354150','#94a3b8');
    line(ctx,b.x+b.w-12,roofY+5,b.x+b.w-12,roofY-24,'#64748b',2);
    for(const [dy,c] of [[-23,'#ef4444'],[-15,'#f59e0b'],[-7,'#22c55e']] as const){ctx.fillStyle=c;ctx.beginPath();ctx.arc(b.x+b.w-12,roofY+dy,3,0,Math.PI*2);ctx.fill();}
  } else if(name.includes('passarela')){
    const deckY=roofY-10;box(ctx,b.x-12,deckY,b.w+24,8,'#4b5563','#cbd5e1');rail(ctx,b.x-12,deckY-10,b.w+24,10);
    line(ctx,b.x-10,deckY+8,b.x+7,facadeY+height,'#94a3b8',2);line(ctx,b.x+b.w+10,deckY+8,b.x+b.w-7,facadeY+height,'#94a3b8',2);
    box(ctx,b.x+b.w*.43,deckY-1,b.w*.14,3,controlColor);
  }
};

const drawT3=({ctx,b,roofY,facadeY,height,controlColor}:SemanticArgs,name:string)=>{
  if(name.includes('oficina')){
    shutter(ctx,b.x+9,facadeY+5,b.w*.58,height-7,'#f97316');tyre(ctx,b.x+b.w-17,facadeY+height-8);box(ctx,b.x+b.w-30,roofY+9,20,8,'#26313d','#64748b');
  } else if(name.includes('galpao de pecas')){
    shutter(ctx,b.x+10,facadeY+5,b.w-20,height-7,'#64748b');crate(ctx,b.x+8,facadeY+height-11);crate(ctx,b.x+23,facadeY+height-9,11,7);
  } else if(name.includes('serralheria')){
    shutter(ctx,b.x+10,facadeY+5,b.w-20,height-7,'#94a3b8');for(let i=0;i<4;i++)line(ctx,b.x+b.w-27+i*5,facadeY+height-4,b.x+b.w-13+i*5,facadeY+8,'#9ca3af',2);
  } else if(name.includes('deposito industrial')){
    shutter(ctx,b.x+9,facadeY+5,b.w-18,height-7,'#f59e0b');box(ctx,b.x+b.w-20,roofY+8,12,10,'#111827','#64748b');
  } else if(name.includes('portaria do patio')){
    box(ctx,b.x+12,facadeY+5,b.w*.42,height-7,'#27313c','#94a3b8');barrier(ctx,b.x+b.w*.56,facadeY+height-5,Math.min(40,b.w*.45));
  } else if(name.includes('torre da fabrica')){
    box(ctx,b.x+b.w*.40,roofY-24,b.w*.20,30,'#4b5563','#94a3b8');box(ctx,b.x+b.w*.44,roofY-34,b.w*.12,10,'#6b7280');
    line(ctx,b.x+b.w*.5,roofY-34,b.x+b.w*.5,roofY-48,'#64748b',2);
  }
};

const drawT4=({ctx,b,roofY,facadeY,height,controlColor}:SemanticArgs,name:string)=>{
  if(name.includes('beco da subida')){
    for(let i=0;i<5;i++)box(ctx,b.x+9+i*5,facadeY+height-5-i*4,28,4,'#5d5147');line(ctx,b.x+7,facadeY+height-6,b.x+32,facadeY+height-27,'#94a3b8',1.4);
  } else if(name.includes('laje fortificada')){
    rail(ctx,b.x+6,roofY+6,b.w-12,8);for(let xx=b.x+8;xx<b.x+b.w-12;xx+=15)box(ctx,xx,roofY+16,11,6,'#6b6259','#8b8177');
  } else if(name.includes('barraco alto')){
    for(let xx=b.x+6;xx<b.x+b.w-6;xx+=12)box(ctx,xx,facadeY+6,10,height-9,((xx/12)|0)%2?'#5b463a':'#6b5a4a');
  } else if(name.includes('reduto do morro')){
    box(ctx,b.x+10,facadeY+7,b.w-20,height-10,'#29251f','#78716c');box(ctx,b.x+b.w*.34,facadeY+11,b.w*.32,5,'#111827',controlColor);
  } else if(name.includes('boca do alto')){
    shutter(ctx,b.x+11,facadeY+6,b.w*.52,height-8,controlColor);lamp(ctx,b.x+b.w-13,roofY+8,controlColor);
  } else if(name.includes('posto de vigia')){
    box(ctx,b.x+b.w*.28,roofY-15,b.w*.44,22,'#403a34','#9ca3af');rail(ctx,b.x+b.w*.23,roofY-17,b.w*.54,9);lamp(ctx,b.x+b.w*.72,roofY-9,controlColor);
  } else if(name.includes('mirante do morro')){
    rail(ctx,b.x+5,roofY+7,b.w-10,11);antenna(ctx,b.x+b.w*.72,roofY+7,controlColor);
  }
};

const drawT5=({ctx,b,roofY,facadeY,height,controlColor}:SemanticArgs,name:string)=>{
  if(name.includes('casa da orla')){
    box(ctx,b.x+10,facadeY+6,b.w-20,10,'#173b52','#dbeafe');rail(ctx,b.x+14,facadeY+19,b.w-28,7);box(ctx,b.x+10,roofY+b.h-12,22,6,'#315b46');
  } else if(name.includes('condominio norte')){
    for(let x=b.x+12;x<b.x+b.w-18;x+=22)box(ctx,x,facadeY+6,13,9,'#173b52','#cbd5e1');box(ctx,b.x+b.w*.39,facadeY+height-18,b.w*.22,18,'#334155','#e2e8f0');
  } else if(name.includes('guarita oeste')){
    box(ctx,b.x+12,facadeY+5,b.w*.40,height-7,'#dbe2ea','#64748b');box(ctx,b.x+16,facadeY+9,b.w*.30,8,'#173b52');barrier(ctx,b.x+b.w*.58,facadeY+height-5,Math.min(34,b.w*.38));
  } else if(name.includes('mansao reservada')){
    rail(ctx,b.x+10,roofY+8,b.w-20,8);box(ctx,b.x+16,roofY+20,b.w-32,9,'#173b52','#e2e8f0');box(ctx,b.x+b.w-29,facadeY+height-12,18,6,'#315b46');
  } else if(name.includes('portaria leste')){
    box(ctx,b.x+10,facadeY+5,b.w*.38,height-7,'#cbd5e1','#64748b');barrier(ctx,b.x+b.w*.52,facadeY+height-5,Math.min(42,b.w*.48));lamp(ctx,b.x+b.w-12,roofY+7,'#bfdbfe');
  } else if(name.includes('guarita principal')){
    box(ctx,b.x+10,facadeY+5,b.w*.46,height-7,'#dbe2ea','#64748b');box(ctx,b.x+14,facadeY+9,b.w*.36,8,'#173b52');barrier(ctx,b.x+b.w*.60,facadeY+height-5,Math.min(38,b.w*.40));
  } else if(name.includes('cobertura')){
    rail(ctx,b.x+7,roofY+6,b.w-14,9);for(const x of [b.x+18,b.x+b.w-20])line(ctx,x,roofY+19,x,roofY+36,'#cbd5e1',2);line(ctx,b.x+18,roofY+19,b.x+b.w-20,roofY+19,'#cbd5e1',2);
  }
};

const drawT6=({ctx,b,roofY,facadeY,height,controlColor,time}:SemanticArgs,name:string)=>{
  if(name.includes('anexo do qg')){
    box(ctx,b.x+10,facadeY+6,b.w-20,height-8,'#202a35','#64748b');for(let x=b.x+15;x<b.x+b.w-15;x+=16)box(ctx,x,facadeY+10,8,5,'#0f172a','#38bdf8');
  } else if(name.includes('centro operacional')){
    box(ctx,b.x+9,facadeY+5,b.w-18,height-7,'#111923','#64748b');for(let x=b.x+15;x<b.x+b.w-20;x+=18)box(ctx,x,facadeY+9,12,7,'#0b1320',controlColor);antenna(ctx,b.x+b.w*.72,roofY+7,controlColor);
  } else if(name.includes('posto blindado')){
    box(ctx,b.x+10,facadeY+5,b.w-20,height-7,'#161d26','#475569');box(ctx,b.x+b.w*.34,facadeY+9,b.w*.32,height-13,'#0b0f16',controlColor);box(ctx,b.x+8,roofY+11,b.w-16,5,'#334155');
  } else if(name.includes('alojamento central')){
    for(let x=b.x+12;x<b.x+b.w-20;x+=20)box(ctx,x,facadeY+7,11,8,'#1e3a4a','#64748b');box(ctx,b.x+b.w-26,roofY+10,16,9,'#475569','#94a3b8');
  } else if(name.includes('comando leste')){
    box(ctx,b.x+9,facadeY+5,b.w-18,height-7,'#141d27','#64748b');box(ctx,b.x+14,facadeY+9,b.w-28,7,'#0b1320',controlColor);antenna(ctx,b.x+b.w*.50,roofY+5,controlColor);
  } else if(name.includes('torre de seguranca')){
    box(ctx,b.x+b.w*.35,roofY-26,b.w*.30,34,'#202833','#64748b');rail(ctx,b.x+b.w*.29,roofY-29,b.w*.42,9);antenna(ctx,b.x+b.w*.50,roofY-28,controlColor);
  } else if(name.includes('qg central')){
    box(ctx,b.x+b.w*.28,roofY+8,b.w*.44,b.h-13,'#0d141d',controlColor);antenna(ctx,b.x+b.w*.50,roofY+4,controlColor);
    ctx.fillStyle=controlColor;ctx.globalAlpha=.35+.20*Math.sin(time*.004);ctx.fillRect(b.x+12,facadeY+7,b.w-24,4);ctx.globalAlpha=1;
  }
};

export function drawSemanticBuildingIdentity(args:SemanticArgs){
  const {ctx,b,territoryId}=args;
  const name=norm(b.label);
  ctx.save();
  if(territoryId===1)drawT1(args,name);
  else if(territoryId===2)drawT2(args,name);
  else if(territoryId===3)drawT3(args,name);
  else if(territoryId===4)drawT4(args,name);
  else if(territoryId===5)drawT5(args,name);
  else if(territoryId===6)drawT6(args,name);
  ctx.restore();
}

const groundRect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.save();ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}ctx.restore();
};
const accessMarks=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,color:string)=>{
  ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=.55;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();ctx.globalAlpha=1;ctx.restore();
};

export function drawSemanticBuildingContext(
  ctx:CanvasRenderingContext2D,buildings:readonly TacticalBuilding[],territoryId:number,controlColor:string,
  worldWidth:number,worldHeight:number
){
  ctx.save();
  for(const b of buildings){
    const name=norm(b.label), groundY=b.y+b.h+5;
    if(territoryId===1){
      if(name.includes('beco')){groundRect(ctx,b.x-5,groundY,b.w+10,5,'rgba(82,65,52,.16)');}
      if(name.includes('laje')||name.includes('mirante'))groundRect(ctx,b.x+8,groundY,b.w-16,4,'rgba(148,163,184,.12)');
    } else if(territoryId===2){
      // 1.2N: dedicated T2 surface owns rail/platform/passarela ground context.
    } else if(territoryId===3){
      if(name.includes('oficina')||name.includes('serralheria')){groundRect(ctx,b.x-8,groundY,b.w+16,12,'rgba(15,23,42,.22)');for(let x=b.x;x<b.x+b.w;x+=24)accessMarks(ctx,x,groundY+5,16,'rgba(249,115,22,.18)');}
      if(name.includes('galpao')||name.includes('deposito'))groundRect(ctx,b.x-10,groundY,b.w+20,10,'rgba(71,85,105,.18)','#64748b');
      if(name.includes('portaria'))barrier(ctx,b.x+b.w*.55,groundY+3,Math.min(46,b.w*.48));
      if(name.includes('torre'))groundRect(ctx,b.x+b.w*.30,groundY,b.w*.40,12,'rgba(55,65,81,.24)');
    } else if(territoryId===4){
      if(name.includes('beco')||name.includes('barraco'))groundRect(ctx,b.x-7,groundY,b.w+14,8,'rgba(92,67,45,.20)');
      if(name.includes('laje')||name.includes('reduto'))accessMarks(ctx,b.x+5,groundY+4,b.w-10,'rgba(168,162,158,.18)');
      if(name.includes('posto')||name.includes('mirante'))groundRect(ctx,b.x+10,groundY,b.w-20,6,'rgba(120,113,108,.20)');
    } else if(territoryId===5){
      if(name.includes('casa')||name.includes('mansao')||name.includes('condominio')||name.includes('cobertura')){groundRect(ctx,b.x-8,groundY,b.w+16,9,'rgba(226,232,240,.12)');groundRect(ctx,b.x+8,groundY+9,18,5,'rgba(49,91,70,.22)');}
      if(name.includes('portaria')||name.includes('guarita')){groundRect(ctx,b.x-12,groundY,b.w+24,10,'rgba(148,163,184,.14)');barrier(ctx,b.x+b.w*.54,groundY+3,Math.min(42,b.w*.42));}
    } else if(territoryId===6){
      groundRect(ctx,b.x-6,groundY,b.w+12,8,'rgba(30,41,59,.22)');
      if(name.includes('centro operacional')||name.includes('comando')||name.includes('qg'))accessMarks(ctx,b.x+8,groundY+4,b.w-16,`${controlColor}55`);
      if(name.includes('posto blindado')){ctx.fillStyle='rgba(148,163,184,.16)';for(let x=b.x+8;x<b.x+b.w-8;x+=13)ctx.fillRect(x,groundY+1,7,4);}
      if(name.includes('torre de seguranca'))groundRect(ctx,b.x+b.w*.28,groundY,b.w*.44,10,'rgba(15,23,42,.30)',controlColor);
    }
  }
  ctx.restore();
}