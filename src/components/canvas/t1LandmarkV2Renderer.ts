import type { TacticalBuilding } from './favelaRenderer';

type Args={ctx:CanvasRenderingContext2D;b:TacticalBuilding;roofY:number;facadeY:number;height:number;controlColor:string;time:number;renderZoom:number};
const rect=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,f:string,s?:string)=>{c.fillStyle=f;c.fillRect(x,y,w,h);if(s){c.strokeStyle=s;c.strokeRect(x,y,w,h);}};
const line=(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
const glow=(c:CanvasRenderingContext2D,x:number,y:number,r:number,a:number)=>{const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(255,211,128,${a})`);g.addColorStop(1,'rgba(245,158,11,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
const rail=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h=9)=>{line(c,x,y,x+w,y,'rgba(207,214,218,.72)',1.2);line(c,x,y+h,x+w,y+h,'rgba(130,141,148,.64)',1);for(let xx=x;xx<=x+w;xx+=12)line(c,xx,y,xx,y+h,'rgba(139,151,158,.58)',1);};

const drawMirante=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,controlColor,renderZoom}=a;
  ctx.save();
  // 0.9.10E: silhueta horizontal e aberta; o Mirante observa, não compete com a Base.
  rect(ctx,b.x-7,roofY-9,b.w+14,7,'#59635d','rgba(169,180,174,.40)');
  rect(ctx,b.x-3,roofY-14,b.w+6,4,'#707066','rgba(197,193,178,.20)');
  line(ctx,b.x-1,roofY-18,b.x+b.w+1,roofY-18,'rgba(190,200,195,.66)',1.2);
  for(let xx=b.x+2;xx<=b.x+b.w-2;xx+=14) line(ctx,xx,roofY-18,xx,roofY-10,'rgba(128,143,136,.52)',1);
  const shadeX=b.x+b.w*.58, shadeW=b.w*.30;
  rect(ctx,shadeX,roofY-28,shadeW,7,'#695a49','rgba(174,149,115,.30)');
  for(const px of [shadeX+3,shadeX+shadeW-3]) line(ctx,px,roofY-21,px,roofY-9,'rgba(112,119,114,.58)',1.3);
  rect(ctx,b.x+7,roofY-6,b.w*.30,3,'#747166');
  ctx.fillStyle=controlColor;ctx.globalAlpha=.35;ctx.fillRect(b.x+8,roofY-12,16,2);ctx.globalAlpha=1;
  glow(ctx,b.x+b.w*.26,facadeY+height*.73,renderZoom>1.4?26:18,.038);
  ctx.fillStyle='#ddb767';ctx.beginPath();ctx.arc(b.x+b.w*.26,facadeY+height*.73,1.9,0,Math.PI*2);ctx.fill();
  ctx.restore();
};

const drawBeco=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,controlColor}=a;
  ctx.save();
  // 0.9.10E: massa assimétrica e acesso estreito; mais beco, menos "prédio genérico".
  rect(ctx,b.x-5,roofY-11,b.w*.54,8,'#704b3a','rgba(164,108,77,.42)');
  rect(ctx,b.x+b.w*.43,roofY-6,b.w*.34,5,'#58453a','rgba(145,118,98,.28)');
  ctx.fillStyle='#493c34';ctx.beginPath();ctx.moveTo(b.x-7,roofY-3);ctx.lineTo(b.x+b.w*.49,roofY-3);ctx.lineTo(b.x+b.w*.44,roofY+5);ctx.lineTo(b.x-2,roofY+5);ctx.closePath();ctx.fill();
  rect(ctx,b.x+6,facadeY+height-22,20,19,'#322824','rgba(126,92,74,.42)');
  rect(ctx,b.x+10,facadeY+height-18,10,15,'#16191a','rgba(91,94,92,.30)');
  line(ctx,b.x+28,facadeY+height-20,b.x+28,facadeY+height-3,'rgba(109,119,120,.52)',1.5);
  rect(ctx,b.x+b.w-25,facadeY+height-14,19,6,'#654936','rgba(164,122,83,.24)');
  ctx.fillStyle='rgba(58,43,36,.34)';ctx.fillRect(b.x+b.w*.55,facadeY+7,b.w*.27,4);
  ctx.fillStyle=controlColor;ctx.globalAlpha=.34;ctx.fillRect(b.x+7,facadeY+height-5,24,2);ctx.globalAlpha=1;
  ctx.restore();
};

const drawMarket=(a:Args)=>{
  const {ctx,b,facadeY,height,renderZoom}=a;
  ctx.save();
  // 0.9.10E: comércio baixo, quente e frontal; a silhueta permanece subordinada à Base.
  const openingX=b.x+8,openingY=facadeY+height-29,openingW=b.w-16,openingH=16;
  rect(ctx,b.x+4,openingY-12,b.w-8,4,'#6a513d','rgba(158,124,89,.32)');
  rect(ctx,openingX-2,openingY-2,openingW+4,openingH+4,'#3a2d26','rgba(133,101,73,.42)');
  rect(ctx,openingX,openingY,openingW,openingH,'#151718','rgba(91,82,72,.52)');
  const g=ctx.createLinearGradient(openingX,openingY,openingX,openingY+openingH);
  g.addColorStop(0,'rgba(250,199,104,.23)');g.addColorStop(1,'rgba(118,69,39,.07)');ctx.fillStyle=g;ctx.fillRect(openingX+2,openingY+2,openingW-4,openingH-4);
  const awX=b.x+4,awY=openingY-8,awW=b.w-8;
  for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#e6d4a8':'#9d4b39';ctx.fillRect(awX+i*(awW/6),awY,awW/6+1,7);}
  rect(ctx,awX-1,awY-2,awW+2,2,'#44392f');
  rect(ctx,openingX-4,openingY+openingH-1,openingW+8,5,'#6b4934','rgba(150,101,68,.44)');
  rect(ctx,openingX+2,openingY+openingH+4,openingW-4,3,'#3b3029');
  if(renderZoom>=1.20){
    const shelfY=openingY+openingH-7;line(ctx,openingX+5,shelfY,openingX+openingW-5,shelfY,'rgba(188,151,104,.40)',1);
    const goods=['#d2a05b','#76936f','#b96f51','#d2ba6e'];
    for(let i=0;i<4;i++) rect(ctx,openingX+7+i*((openingW-16)/4),shelfY-5,5,4,goods[i],'rgba(30,28,25,.26)');
  }
  glow(ctx,b.x+b.w*.5,openingY+openingH*.55,renderZoom>1.45?36:24,.062);
  ctx.fillStyle='#edc16a';ctx.beginPath();ctx.arc(b.x+b.w*.5,openingY-3,1.8,0,Math.PI*2);ctx.fill();
  ctx.restore();
};

const drawLajePonto=(a:Args)=>{
  const {ctx,b,roofY,controlColor}=a;ctx.save();
  // Utilitário e habitável: concreto frio, cobertura leve e poucos acentos.
  rect(ctx,b.x+5,roofY+4,b.w-10,9,'#59646a','rgba(150,163,170,.22)');
  rail(ctx,b.x+3,roofY-5,b.w-6,8);
  rect(ctx,b.x+10,roofY-21,23,13,'#5f6a70','rgba(143,157,164,.34)');
  rect(ctx,b.x+8,roofY-24,28,4,'#706554','rgba(170,149,116,.24)');
  ctx.fillStyle=controlColor;ctx.globalAlpha=.30;ctx.fillRect(b.x+b.w-23,roofY+7,14,2);ctx.globalAlpha=1;
  ctx.restore();
};

const drawBocaLeste=(a:Args)=>{
  const {ctx,b,facadeY,height,controlColor}=a;ctx.save();
  // Tijolo/metal escuro: fortificação de bairro integrada ao volume existente.
  rect(ctx,b.x+7,facadeY+height-23,b.w*.43,19,'#3e2d28','rgba(128,91,75,.38)');
  rect(ctx,b.x+11,facadeY+height-19,b.w*.27,12,'#171b1d','rgba(100,108,111,.34)');
  rect(ctx,b.x+b.w*.59,facadeY+height-15,b.w*.23,8,'#5a3b31','rgba(120,80,64,.34)');
  line(ctx,b.x+b.w*.57,facadeY+height-20,b.x+b.w*.57,facadeY+height-4,'rgba(92,100,104,.56)',1.4);
  ctx.fillStyle=controlColor;ctx.globalAlpha=.38;ctx.fillRect(b.x+9,facadeY+height-5,b.w*.28,2);ctx.globalAlpha=1;ctx.restore();
};

const drawEsconderijo=(a:Args)=>{
  const {ctx,b,facadeY,height,roofY}=a;ctx.save();
  // Paleta apagada e recuada: o esconderijo deve ser o landmark menos chamativo.
  rect(ctx,b.x+8,facadeY+height-24,23,21,'#252a2b','rgba(84,94,98,.42)');
  for(let x=b.x+12;x<b.x+29;x+=6) line(ctx,x,facadeY+height-21,x,facadeY+height-5,'rgba(94,105,109,.30)',1);
  rect(ctx,b.x+5,facadeY+height-28,33,4,'#484f52','rgba(116,126,130,.24)');
  rect(ctx,b.x+b.w-26,facadeY+height-17,16,8,'#172027','rgba(71,85,91,.36)');
  line(ctx,b.x+b.w-18,roofY+8,b.x+b.w-18,facadeY+height-17,'rgba(66,78,84,.48)',1.1);
  ctx.fillStyle='rgba(8,12,14,.18)';ctx.fillRect(b.x+4,facadeY+height-3,b.w-8,3);ctx.restore();
};

const drawTorreGuarda=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,controlColor}=a;ctx.save();
  // Metal e estrutura: vertical, porém estreita para não disputar massa com a Base.
  const cx=b.x+b.w*.5, cabinW=b.w*.34;
  rect(ctx,cx-cabinW*.5,roofY-33,cabinW,19,'#3b454c','rgba(139,152,160,.46)');
  rect(ctx,cx-cabinW*.62,roofY-37,cabinW*1.24,4,'#59636a','rgba(177,188,194,.26)');
  for(const px of [cx-b.w*.14,cx+b.w*.14]) line(ctx,px,roofY-14,px,facadeY+height-4,'rgba(87,99,106,.58)',1.7);
  line(ctx,cx-b.w*.14,roofY-4,cx+b.w*.14,facadeY+height-8,'rgba(87,99,106,.34)',1);
  line(ctx,cx+b.w*.14,roofY-4,cx-b.w*.14,facadeY+height-8,'rgba(87,99,106,.34)',1);
  ctx.fillStyle=controlColor;ctx.globalAlpha=.34;ctx.fillRect(cx-cabinW*.36,roofY-29,cabinW*.72,2);ctx.globalAlpha=1;
  ctx.fillStyle='#e7bd68';ctx.beginPath();ctx.arc(cx+cabinW*.28,roofY-21,1.8,0,Math.PI*2);ctx.fill();ctx.restore();
};

export function drawT1LandmarkV2(args:Args){
  if(args.b.id==='mirante') drawMirante(args);
  else if(args.b.id==='beco_01') drawBeco(args);
  else if(args.b.id==='barraquinha') drawMarket(args);
  else if(args.b.id==='laje_ponto') drawLajePonto(args);
  else if(args.b.id==='boca_leste') drawBocaLeste(args);
  else if(args.b.id==='esconderijo') drawEsconderijo(args);
  else if(args.b.id==='torre_guarda') drawTorreGuarda(args);
}
