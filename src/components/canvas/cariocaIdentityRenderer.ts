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

const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const poly=(ctx:CanvasRenderingContext2D,pts:[number,number][],fill:string,stroke?:string)=>{
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
};
const palette=['#b86f5d','#c99553','#6f9a91','#879e63','#9b8170','#7c8fa1'];
const buildingTone=(b:TacticalBuilding)=>palette[Math.abs([...b.id].reduce((a,c)=>a+c.charCodeAt(0),0))%palette.length];
const barredWindow=(ctx:CanvasRenderingContext2D,x:number,y:number,w=13,h=8)=>{
  rect(ctx,x,y,w,h,'#1e3442','#8a949e');for(let xx=x+3;xx<x+w;xx+=4)line(ctx,xx,y+1,xx,y+h-1,'rgba(226,232,240,.45)',.7);
};
const rebar=(ctx:CanvasRenderingContext2D,x:number,y:number,count=3)=>{
  for(let i=0;i<count;i++){line(ctx,x+i*7,y,x+i*7,y-13,'#6b5144',1.2);line(ctx,x+i*7-2,y-8,x+i*7+2,y-8,'#6b5144',.8);}
};
const tank=(ctx:CanvasRenderingContext2D,x:number,y:number,scale=1)=>{
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+3*scale,y+5*scale,9*scale,4*scale,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#087ea4';ctx.fillRect(x-7*scale,y-5*scale,14*scale,10*scale);ctx.beginPath();ctx.ellipse(x,y-5*scale,7*scale,3*scale,0,0,Math.PI*2);ctx.fill();
};
const rail=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h=8)=>{
  line(ctx,x,y,x+w,y,'#aab3bc',1);line(ctx,x,y+h,x+w,y+h,'#7d8791',1);for(let xx=x;xx<=x+w;xx+=10)line(ctx,xx,y,xx,y+h,'#8b949e',.8);
};
const zinc=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,tilt=0)=>{
  poly(ctx,[[x,y+h],[x+5,y+tilt],[x+w-3,y+3-tilt],[x+w,y+h]],'#59636c','#89939d');
  for(let xx=x+8;xx<x+w-5;xx+=8)line(ctx,xx,y+4,xx+1,y+h-2,'rgba(226,232,240,.16)',.8);
};
const stair=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,dir:1|-1=1)=>{
  const steps=6;for(let i=0;i<steps;i++){const sw=w*(i+1)/steps,sy=y+i*h/steps;rect(ctx,dir>0?x:x+w-sw,sy,sw,h/steps,'#626b73');}
  line(ctx,dir>0?x+2:x+w-2,y,dir>0?x+2:x+w-2,y+h,'#c1a23c',1.2);
};
const patchFacade=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,facadeY:number,height:number,tone:string)=>{
  ctx.globalAlpha=.78;rect(ctx,b.x+5,facadeY+3,b.w*.44,height-8,tone);ctx.globalAlpha=1;
  ctx.fillStyle='rgba(124,45,18,.45)';ctx.fillRect(b.x+b.w*.52,facadeY+4,b.w*.34,height-9);
  ctx.strokeStyle='rgba(67,20,7,.38)';for(let y=facadeY+8;y<facadeY+height-4;y+=6){line(ctx,b.x+b.w*.52,y,b.x+b.w*.86,y,'rgba(67,20,7,.34)',.8);}
};
const terracePlants=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{
  for(let px=x+4;px<x+w-3;px+=11){rect(ctx,px,y,7,4,'#5d4030');ctx.fillStyle='#49745a';ctx.beginPath();ctx.arc(px+3,y-2,3,0,Math.PI*2);ctx.fill();}
};

const drawT1=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,controlColor}=a;
  const heroTones:Record<string,string>={
    beco_01:'#a45f49',laje_ponto:'#648985',barraquinha:'#a47b43',esconderijo:'#655c55',
    boca_leste:'#9b5c43',torre_guarda:'#5c6770',mirante:'#687b67'
  };
  const tone=heroTones[b.id]??buildingTone(b);
  patchFacade(ctx,b,facadeY,height,tone);
  if(b.id==='beco_01'){
    rect(ctx,b.x+7,roofY-15,b.w*.46,25,'#785344','#9a7766');barredWindow(ctx,b.x+15,roofY-7);stair(ctx,b.x+b.w-20,facadeY+height-25,20,25,-1);rebar(ctx,b.x+12,roofY-15,3);
    rect(ctx,b.x+5,facadeY+height-7,b.w*.34,4,'#6f3e31');
  } else if(b.id==='laje_ponto'){
    rect(ctx,b.x+9,roofY+8,b.w*.38,21,'#5e6871','#8d98a2');rail(ctx,b.x+3,roofY-3,b.w-6,8);tank(ctx,b.x+b.w-19,roofY+12);tank(ctx,b.x+b.w-36,roofY+13,.82);rebar(ctx,b.x+16,roofY+2,3);
    terracePlants(ctx,b.x+8,roofY+b.h-8,b.w*.34);
  } else if(b.id==='barraquinha'){
    // Frontage ownership moved to t1LandmarkV2Renderer; keep only the roof material language.
    zinc(ctx,b.x-7,roofY-10,b.w+14,13,-3);
  }
  else if(b.id==='esconderijo'){
    rect(ctx,b.x+b.w*.48,roofY-9,b.w*.42,19,'#6b6058','#8c8179');zinc(ctx,b.x+3,roofY+5,b.w*.47,12,2);barredWindow(ctx,b.x+b.w*.59,roofY-1);rect(ctx,b.x-8,facadeY+8,18,height-8,'#5b493d','#7d6a5b');
    for(let yy=facadeY+10;yy<facadeY+height-4;yy+=5) line(ctx,b.x-6,yy,b.x+7,yy,'rgba(203,213,225,.15)',.7);
  } else if(b.id==='boca_leste'){
    rect(ctx,b.x+8,roofY-12,b.w*.52,23,'#726052','#9a8678');zinc(ctx,b.x+3,facadeY+1,b.w*.60,9,-2);barredWindow(ctx,b.x+18,roofY-3);line(ctx,b.x+b.w-14,roofY+5,b.x+b.w-14,roofY-18,controlColor,1.4);
    rect(ctx,b.x+b.w*.58,facadeY+height-13,b.w*.28,9,'#2c211c','#6f4a38');
  } else if(b.id==='torre_guarda'){
    rect(ctx,b.x+b.w*.32,roofY-34,b.w*.36,29,'#4e5963','#9aa5af');rail(ctx,b.x+b.w*.25,roofY-38,b.w*.50,8);for(const px of [b.x+b.w*.34,b.x+b.w*.66])line(ctx,px,roofY-5,px,facadeY+height,'#69737d',2);
  } else if(b.id==='mirante'){
    rail(ctx,b.x+2,roofY-5,b.w-4,10);for(let px=b.x+10;px<b.x+b.w-10;px+=16)line(ctx,px,roofY+5,px,roofY+25,'#7d8791',1.3);rect(ctx,b.x+10,roofY+4,b.w-20,4,'#5e6871');terracePlants(ctx,b.x+10,roofY+b.h-9,b.w-20);
  }
};

const drawT2=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,controlColor}=a;
  if(b.id==='beco_01'){
    zinc(ctx,b.x-8,roofY-10,b.w+16,13,-2);
    for(const x of [b.x+5,b.x+b.w-6])line(ctx,x,roofY+2,x,facadeY+height,'#6b5541',2);
    rect(ctx,b.x+4,facadeY+height-18,b.w-8,15,'#4b3325','#9c7548');
    for(let x=b.x+7,i=0;x<b.x+b.w-6;x+=14,i++){ctx.fillStyle=i%2?'#e6d2a4':'#b65f3d';ctx.fillRect(x,facadeY+height-23,13,7);}
    for(let x=b.x+10;x<b.x+b.w-10;x+=18){ctx.fillStyle='#799253';ctx.fillRect(x,facadeY+height-12,7,4);}
  } else if(b.id==='laje_ponto'){
    zinc(ctx,b.x-4,roofY-13,b.w+8,12,1);
    rect(ctx,b.x+b.w*.54,facadeY+height-18,b.w*.38,15,'#3e342d','#8b745e');
    line(ctx,b.x+b.w*.57,facadeY+height-20,b.x+b.w+34,facadeY+height-20,'#d0a94e',2);
    for(let x=b.x+b.w*.60;x<b.x+b.w+28;x+=14)line(ctx,x,facadeY+height-17,x,facadeY+height-6,'rgba(91,72,52,.55)',1);
  } else if(b.id==='barraquinha'){
    poly(ctx,[[b.x-12,roofY+4],[b.x+b.w*.5,roofY-17],[b.x+b.w+12,roofY+4],[b.x+b.w+7,roofY+12],[b.x-7,roofY+12]],'#4f7773','#d2b56a');
    for(let x=b.x-2,i=0;x<b.x+b.w+2;x+=15,i++){ctx.fillStyle=i%2?'#eadbb7':'#c9953f';ctx.fillRect(x,roofY+5,14,7);}
    for(const x of [b.x+4,b.x+b.w-5])line(ctx,x,roofY+10,x,facadeY+height,'#765d45',2);
    ctx.fillStyle='rgba(255,213,132,.70)';for(const x of [b.x+15,b.x+b.w*.5,b.x+b.w-15]){ctx.beginPath();ctx.arc(x,roofY+15,1.7,0,Math.PI*2);ctx.fill();}
  } else if(b.id==='esconderijo'){
    zinc(ctx,b.x+2,roofY-8,b.w-4,11,0);
    rect(ctx,b.x+7,facadeY+8,b.w*.58,height-11,'#4a514d','#768079');
    rect(ctx,b.x+13,facadeY+height-25,b.w*.42,22,'#263039','#69757c');
    ctx.strokeStyle='rgba(203,213,225,.18)';for(let y=facadeY+height-21;y<facadeY+height-5;y+=5)line(ctx,b.x+15,y,b.x+b.w*.50,y,'rgba(203,213,225,.18)',1);
    rect(ctx,b.x+b.w*.68,facadeY+height-16,b.w*.22,13,'#72543a','#a87b4d');
  } else if(b.id==='boca_leste'){
    rect(ctx,b.x-14,roofY-12,b.w+28,7,'#70644f','#d9bd68');
    for(const x of [b.x-6,b.x+b.w*.28,b.x+b.w*.72,b.x+b.w+6])line(ctx,x,roofY-5,x,facadeY+height,'#77818a',2);
    rect(ctx,b.x+b.w*.30,facadeY+7,b.w*.40,11,'#17222d','#d8b64f');
    ctx.fillStyle=controlColor;ctx.globalAlpha=.22;ctx.fillRect(b.x+b.w*.34,facadeY+10,b.w*.12,3);ctx.globalAlpha=1;
  } else if(b.id==='torre_guarda'){
    rect(ctx,b.x+9,roofY-12,b.w-18,18,'#34404a','#8e9aa4');
    for(let x=b.x+15;x<b.x+b.w-12;x+=15)rect(ctx,x,roofY-7,9,6,'#162b38','#83919b');
    line(ctx,b.x+b.w-10,roofY-10,b.x+b.w-10,roofY-34,'#77818a',2);
    for(const [dy,c] of [[-31,'#ef4444'],[-23,'#f59e0b'],[-15,'#22c55e']] as const){ctx.fillStyle=c;ctx.beginPath();ctx.arc(b.x+b.w-10,roofY+dy,2.6,0,Math.PI*2);ctx.fill();}
  } else if(b.id==='mirante'){
    const deckY=roofY-11;rect(ctx,b.x-16,deckY,b.w+32,8,'#4b555e','#aeb8c1');rail(ctx,b.x-16,deckY-10,b.w+32,10);
    for(const x of [b.x-11,b.x+b.w+11]){line(ctx,x,deckY+7,x,facadeY+height+18,'#737e87',2.2);line(ctx,x-5,facadeY+height+18,x+5,facadeY+height+18,'#aab2b9',1.2);}
  }
};

const drawT3=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,controlColor}=a;
  const roller=(x:number,y:number,w:number,h:number)=>{rect(ctx,x,y,w,h,'#27323a','#65727b');ctx.strokeStyle='rgba(203,213,225,.15)';for(let yy=y+4;yy<y+h-2;yy+=5)line(ctx,x+2,yy,x+w-2,yy,'rgba(203,213,225,.15)',.8);};
  const ventBox=(x:number,y:number,w=16)=>{rect(ctx,x,y,w,8,'#3a454d','#69757e');for(let xx=x+3;xx<x+w-2;xx+=4)line(ctx,xx,y+2,xx,y+6,'#182128',.8);};
  if(b.id==='beco_01'){
    // Oficina 01: shallow service canopy + two roller bays.
    zinc(ctx,b.x-8,roofY-9,b.w+16,11,-2);roller(b.x+7,facadeY+height-23,b.w*.34,20);roller(b.x+b.w*.53,facadeY+height-19,b.w*.30,16);
    rect(ctx,b.x+b.w*.40,facadeY+7,b.w*.20,8,'#5c3b2b','#9b5c32');ventBox(b.x+b.w-27,roofY+7,17);
  } else if(b.id==='laje_ponto'){
    // Galpão de Peças: saw-tooth industrial roof + broad loading frontage.
    const seg=b.w/4;for(let i=0;i<4;i++)poly(ctx,[[b.x+i*seg-2,roofY+4],[b.x+i*seg+seg*.62,roofY-15],[b.x+(i+1)*seg+2,roofY+4]],i%2?'#505c64':'#455159','#8a959d');
    roller(b.x+8,facadeY+height-27,b.w*.42,24);ctx.fillStyle='rgba(154,83,45,.18)';ctx.fillRect(b.x+7,facadeY+height-31,b.w*.43,3);roller(b.x+b.w*.55,facadeY+height-23,b.w*.32,20);ventBox(b.x+b.w*.72,roofY+8,18);
    ctx.strokeStyle='#91613c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x+4,facadeY+height-3);ctx.lineTo(b.x+b.w-4,facadeY+height-3);ctx.stroke();
  } else if(b.id==='barraquinha'){
    // Serralheria: open metal shed with stock rack silhouette.
    zinc(ctx,b.x-10,roofY-13,b.w+20,13,1);for(const x of [b.x-4,b.x+b.w*.48,b.x+b.w+4])line(ctx,x,roofY,x,facadeY+height,'#66727a',2);
    rect(ctx,b.x+5,facadeY+height-15,b.w-10,11,'#26343a','#5d6870');
    for(let yy=facadeY+height-12;yy<facadeY+height-4;yy+=4)line(ctx,b.x+9,yy,b.x+b.w-9,yy,yy%8===0?'#9a5b36':'#6e777c',1.4);
  } else if(b.id==='esconderijo'){
    // Depósito Industrial: closed volume, roof vents and deep loading bay.
    rect(ctx,b.x-4,roofY-10,b.w+8,12,'#4d5961','#808b93');ventBox(b.x+12,roofY-18,17);ventBox(b.x+b.w-30,roofY-18,17);
    roller(b.x+9,facadeY+height-28,b.w*.48,25);rect(ctx,b.x+b.w*.64,facadeY+height-18,b.w*.22,15,'#3f3127','#815a3b');
  } else if(b.id==='boca_leste'){
    // Oficina Leste: larger repair shop with side canopy and service signage.
    zinc(ctx,b.x-7,roofY-10,b.w+14,12,-1);roller(b.x+7,facadeY+height-25,b.w*.38,22);roller(b.x+b.w*.51,facadeY+height-20,b.w*.31,17);
    rect(ctx,b.x+b.w*.24,facadeY+6,b.w*.52,10,'#5b3b2c','#a35d32');ctx.fillStyle='#d7b06a';ctx.globalAlpha=.45;ctx.fillRect(b.x+b.w*.32,facadeY+9,b.w*.14,3);ctx.globalAlpha=1;
  } else if(b.id==='torre_guarda'){
    // Portaria do Pátio: glazed control booth + boom gate.
    rect(ctx,b.x+8,roofY-12,b.w-16,20,'#35434d','#87949d');for(let x=b.x+14;x<b.x+b.w-14;x+=16)rect(ctx,x,roofY-7,11,8,'#183140','#708691');
    const armY=facadeY+height-9;line(ctx,b.x+b.w*.60,armY,b.x+b.w+39,armY,'#d8d4c6',4);line(ctx,b.x+b.w*.72,armY,b.x+b.w*.84,armY,'#b95b35',4);rect(ctx,b.x+b.w*.54,armY-6,7,12,'#4d555b','#8d969c');
  } else if(b.id==='mirante'){
    // Torre da Fábrica: lattice tower + elevated service tank and warning mast.
    const cx=b.x+b.w*.5;for(const dx of [-18,18])line(ctx,cx+dx,facadeY+height,cx+dx,roofY-38,'#68747c',2.2);
    for(let y=facadeY+height-7;y>roofY-34;y-=11){line(ctx,cx-18,y,cx+18,y-9,'rgba(148,163,184,.42)',1);line(ctx,cx+18,y,cx-18,y-9,'rgba(148,163,184,.35)',1);}
    rect(ctx,cx-24,roofY-45,48,13,'#39464f','#8b979f');ctx.fillStyle='#475760';ctx.beginPath();ctx.ellipse(cx,roofY-45,24,6,0,0,Math.PI*2);ctx.fill();
    line(ctx,cx,roofY-51,cx,roofY-72,'#879098',1.5);ctx.fillStyle=controlColor;ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(cx,roofY-74,2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
};

const sandbag=(ctx:CanvasRenderingContext2D,x:number,y:number,w=12)=>{
  ctx.fillStyle='#71675e';ctx.beginPath();ctx.ellipse(x,y,w*.5,3.2,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(226,232,240,.12)';ctx.stroke();
};
const drawT4=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,controlColor}=a;
  const tones:Record<string,string>={beco_01:'#74503f',laje_ponto:'#706353',barraquinha:'#765447',esconderijo:'#62564d',boca_leste:'#6e5042',torre_guarda:'#5f5b55',mirante:'#695d50'};
  patchFacade(ctx,b,facadeY,height,tones[b.id]??buildingTone(b));
  if(b.id==='beco_01'){
    rect(ctx,b.x+5,roofY-13,b.w*.50,23,'#6b5244','#8b6e5c');stair(ctx,b.x+b.w-23,facadeY+height-29,23,29,-1);zinc(ctx,b.x+2,roofY-15,b.w*.55,10,2);
  } else if(b.id==='laje_ponto'){
    rail(ctx,b.x+3,roofY-5,b.w-6,8);for(let x=b.x+10;x<b.x+b.w-10;x+=15)sandbag(ctx,x,roofY+8,13);rect(ctx,b.x+b.w*.60,roofY+10,b.w*.24,12,'#514a44','#7b726b');
  } else if(b.id==='barraquinha'){
    rect(ctx,b.x+b.w*.46,roofY-18,b.w*.40,28,'#695244','#8d7464');zinc(ctx,b.x-5,roofY-12,b.w+10,14,-3);barredWindow(ctx,b.x+b.w*.58,roofY-8);
  }
  else if(b.id==='esconderijo'){
    rect(ctx,b.x+7,roofY-10,b.w*.58,20,'#4c4139','#76695f');for(let x=b.x+13;x<b.x+b.w*.58;x+=15)sandbag(ctx,x,roofY+5,12);rect(ctx,b.x+b.w*.67,facadeY+7,b.w*.23,height-8,'#372f2a','#665b52');
  } else if(b.id==='boca_leste'){
    rect(ctx,b.x+7,roofY-12,b.w*.48,22,'#59483d','#7d695b');zinc(ctx,b.x+4,facadeY+1,b.w*.58,8,-2);barredWindow(ctx,b.x+16,roofY-3);line(ctx,b.x+b.w-13,roofY+5,b.x+b.w-13,roofY-17,controlColor,1.5);
  } else if(b.id==='torre_guarda'){
    for(const px of [b.x+b.w*.34,b.x+b.w*.66])line(ctx,px,roofY-7,px,facadeY+height,'#716960',2.2);rect(ctx,b.x+b.w*.29,roofY-35,b.w*.42,27,'#47413c','#81776e');rail(ctx,b.x+b.w*.23,roofY-39,b.w*.54,8);
  } else if(b.id==='mirante'){
    rail(ctx,b.x+2,roofY-7,b.w-4,10);for(let px=b.x+9;px<b.x+b.w-9;px+=17)line(ctx,px,roofY+3,px,roofY+26,'#726c66',1.4);rect(ctx,b.x+8,roofY+5,b.w-16,4,'#5b554f');line(ctx,b.x+b.w*.72,roofY+4,b.x+b.w*.72,roofY-20,controlColor,1.4);
  }
};

export function drawCariocaBuildingIdentity(args:Args){
  if(![1,2,3,4,5,6].includes(args.territoryId)) return;
  args.ctx.save();
  if(args.territoryId===1) drawT1(args);
  else if(args.territoryId===2) drawT2(args);
  else if(args.territoryId===3) drawT3(args);
  else if(args.territoryId===4) drawT4(args);
  else if(args.territoryId===5) drawT5(args);
  else drawT6(args);
  args.ctx.restore();
}

const stepsFromDoor=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,territoryId:number)=>{
  const cx=b.x+b.w/2,cy=b.y+b.h/2,dx=b.doorX-cx,dy=b.doorY-cy;
  const horizontal=Math.abs(dx)>Math.abs(dy),count=territoryId===4?5:4;
  ctx.fillStyle=territoryId===4?'#675c52':'#626b71';
  for(let i=0;i<count;i++){
    const size=10+i*2;
    if(horizontal){const x=dx>0?b.x+b.w+i*5:b.x-size-i*5;ctx.fillRect(x,b.doorY-size/2,size,4);}
    else {const y=dy>0?b.y+b.h+i*5:b.y-4-i*5;ctx.fillRect(b.doorX-size/2,y,size,4);}
  }
};
export function drawCariocaGroundIntegration(
  ctx:CanvasRenderingContext2D,b:TacticalBuilding,territoryId:number,controlColor:string
){
  if(territoryId!==1 && territoryId!==4 && territoryId!==5) return;
  ctx.save();
  const pad=territoryId===4?13:11;
  const x=b.x-pad,y=b.y-pad,w=b.w+pad*2,h=b.h+pad*2;
  const fill=territoryId===4?'rgba(92,68,50,.16)':'rgba(103,86,67,.14)';
  const edge=territoryId===4?'rgba(147,113,84,.22)':'rgba(160,145,123,.18)';
  poly(ctx,[[x+5,y],[x+w-2,y+3],[x+w,y+h-6],[x+w-8,y+h],[x+2,y+h-3],[x,y+7]],fill,edge);
  ctx.strokeStyle=territoryId===4?'rgba(90,71,58,.44)':'rgba(52,65,72,.34)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x+4,y+h-5);ctx.lineTo(x+w-4,y+h-5);ctx.stroke();
  stepsFromDoor(ctx,b,territoryId);
  if(territoryId===4){
    ctx.fillStyle='rgba(73,55,43,.52)';ctx.fillRect(x+3,y+h-1,w-6,5);
    for(let xx=x+8;xx<x+w-8;xx+=14)line(ctx,xx,y+h-1,xx+5,y+h+4,'rgba(173,137,104,.22)',1);
  } else {
    const drainY=y+h-2;line(ctx,x+5,drainY,x+w-5,drainY,'rgba(79,91,99,.46)',2);
    ctx.fillStyle='rgba(33,72,48,.32)';for(const px of [x+7,x+w-9]){ctx.beginPath();ctx.arc(px,y+h-4,4,0,Math.PI*2);ctx.fill();}
  }
  ctx.fillStyle=controlColor;ctx.globalAlpha=.10;ctx.fillRect(b.doorX-5,b.doorY-5,10,10);ctx.globalAlpha=1;
  ctx.restore();
}

const districtPath=(ctx:CanvasRenderingContext2D,pts:[number,number][],width:number,color:string)=>{
  ctx.save();ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=width+4;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.restore();
};
const districtSteps=(ctx:CanvasRenderingContext2D,a:[number,number],b:[number,number],count=7)=>{
  ctx.save();ctx.strokeStyle='#73777a';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
  ctx.strokeStyle='rgba(20,27,34,.56)';ctx.lineWidth=1;
  for(let i=1;i<count;i++){const t=i/count,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;const dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1;ctx.beginPath();ctx.moveTo(x-dy/m*6,y+dx/m*6);ctx.lineTo(x+dy/m*6,y-dx/m*6);ctx.stroke();}
  ctx.restore();
};
const lowWall=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number)=>{
  ctx.strokeStyle='rgba(26,31,35,.35)';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x1+3,y1+4);ctx.lineTo(x2+3,y2+4);ctx.stroke();
  ctx.strokeStyle='#6c6259';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  ctx.strokeStyle='rgba(213,205,194,.20)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y1-2);ctx.lineTo(x2,y2-2);ctx.stroke();
};
const edgeHome=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,tone:string,variant:number)=>{
  ctx.save();ctx.globalAlpha=.62;
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.fillRect(x+6,y+8,w,h);
  rect(ctx,x,y,w,h,tone,'rgba(190,180,168,.20)');
  const roof=variant%2===0?'#555e64':'#6b5547';rect(ctx,x-2,y-3,w+4,6,roof);
  if(variant%3===0)rebar(ctx,x+10,y,3);else if(variant%3===1)tank(ctx,x+w-15,y+10,.72);
  ctx.fillStyle='#20323e';ctx.fillRect(x+9,y+h-20,11,9);ctx.fillRect(x+w-23,y+h-26,11,8);
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(x+2,y+h-5,w-4,5);ctx.restore();
};
const drawEdgeCommunityMass=(ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number)=>{
  const tones=territoryId===4?['#463832','#514038','#3e3733','#58443a']:['#604c42','#6b5043','#554a43','#66584b'];
  const ys=[.05,.22,.48,.70,.86];
  ys.forEach((yr,i)=>{const hh=38+(i%3)*9,ww=54+(i%2)*13;edgeHome(ctx,-22,h*yr,ww,hh,tones[i%tones.length],i);edgeHome(ctx,w-ww+22,h*(yr+.035*(i%2)),ww,hh,tones[(i+2)%tones.length],i+1);});
  for(const [xr,i] of [[.22,1],[.30,2],[.61,3],[.69,4]] as const){edgeHome(ctx,w*xr,-24,66+(i%2)*10,48+(i%3)*7,tones[i%tones.length],i);}
};
const drawOrlaEdge=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  const g=ctx.createLinearGradient(0,0,0,h*.095);g.addColorStop(0,'#0d2b33');g.addColorStop(1,'#16434b');ctx.fillStyle=g;ctx.fillRect(0,0,w,h*.07);
  ctx.fillStyle='rgba(190,220,224,.16)';for(let x=-20;x<w+30;x+=54){ctx.beginPath();ctx.arc(x,h*.055,30,0,Math.PI);ctx.strokeStyle='rgba(205,230,232,.18)';ctx.stroke();}
  ctx.fillStyle='#c8c1b5';ctx.fillRect(0,h*.07,w,h*.035);ctx.fillStyle='#272b2c';ctx.fillRect(0,h*.102,w,3);
  ctx.strokeStyle='rgba(65,73,75,.35)';ctx.lineWidth=2;for(let x=-30;x<w+30;x+=34){ctx.beginPath();ctx.moveTo(x,h*.074);ctx.quadraticCurveTo(x+17,h*.088,x+34,h*.074);ctx.stroke();}
};

export function drawCariocaDistrictFoundation(
  ctx:CanvasRenderingContext2D,width:number,height:number,territoryId:number,controlColor:string
){
  if(territoryId!==1 && territoryId!==4 && territoryId!==5) return;
  ctx.save();
  if(territoryId===1){
    // 0.9.1B: detached edge-house strip retired; unified district masses now carry continuity.
    // Branches are short and local: they connect existing alleys to houses instead of drawing another map-wide grid.
    districtPath(ctx,[[width*.17,height*.34],[width*.225,height*.30],[width*.285,height*.31]],13,'rgba(105,100,91,.46)');
    districtPath(ctx,[[width*.72,height*.34],[width*.675,height*.29],[width*.64,height*.28]],12,'rgba(99,95,87,.43)');
    districtPath(ctx,[[width*.18,height*.74],[width*.24,height*.79],[width*.30,height*.84]],12,'rgba(96,92,84,.44)');
    districtPath(ctx,[[width*.70,height*.57],[width*.65,height*.60],[width*.60,height*.61]],11,'rgba(102,96,86,.42)');
    districtSteps(ctx,[width*.205,height*.42],[width*.255,height*.37],7);
    districtSteps(ctx,[width*.675,height*.49],[width*.715,height*.44],6);
    lowWall(ctx,width*.20,height*.255,width*.34,height*.245);
    lowWall(ctx,width*.59,height*.215,width*.72,height*.205);
  } else if(territoryId===4){
    // 0.9.1B: detached edge-house strip retired; unified district masses now carry continuity.
    districtSteps(ctx,[width*.15,height*.67],[width*.24,height*.59],8);
    districtSteps(ctx,[width*.74,height*.64],[width*.82,height*.56],8);
    lowWall(ctx,width*.08,height*.365,width*.30,height*.355);
    lowWall(ctx,width*.69,height*.355,width*.91,height*.365);
  } else if(territoryId===5){
    drawOrlaEdge(ctx,width,height);
  }
  // 0.9.1B: abstract faction-colored control spine removed; ownership lives on physical surfaces.
  ctx.restore();
}
const glassEdge=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{
  rect(ctx,x,y,w,7,'rgba(77,171,199,.16)','rgba(201,232,240,.52)');
  for(let px=x+12;px<x+w;px+=16)line(ctx,px,y,px,y+7,'rgba(226,232,240,.34)',.8);
};
const pergola=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h=15)=>{
  for(let px=x;px<=x+w;px+=Math.max(8,w/4))line(ctx,px,y,px,y+h,'#c9ced3',1.3);
  for(let px=x;px<x+w;px+=9)line(ctx,px,y,px+5,y+h,'rgba(226,232,240,.42)',1);
};
const drawT5=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height}=a;
  if(b.id==='beco_01'){
    rect(ctx,b.x+5,roofY+7,b.w*.48,18,'#d8dde1','#f1f5f9');glassEdge(ctx,b.x+b.w*.50,roofY+18,b.w*.38);pergola(ctx,b.x+b.w*.55,roofY+3,b.w*.30,14);terracePlants(ctx,b.x+8,facadeY+height-7,b.w*.30);
  }else if(b.id==='laje_ponto'){
    rect(ctx,b.x+b.w*.34,roofY-18,b.w*.32,28,'#c8d0d7','#eef2f5');for(let yy=roofY-10;yy<roofY+28;yy+=12)glassEdge(ctx,b.x+10,yy,b.w-20);
  }else if(b.id==='barraquinha'){
    rect(ctx,b.x+7,roofY-8,b.w*.52,20,'#dde2e6','#f8fafc');rect(ctx,b.x+b.w*.50,facadeY+height-10,b.w*.42,6,'#d4d9de','#64748b');
  }else if(b.id==='esconderijo'){
    rect(ctx,b.x+5,roofY-10,b.w*.54,23,'#d3d9df','#f8fafc');glassEdge(ctx,b.x+9,roofY+15,b.w-18);pergola(ctx,b.x+b.w*.56,roofY+3,b.w*.34,17);terracePlants(ctx,b.x+b.w*.58,facadeY+height-7,b.w*.30);
  }else if(b.id==='boca_leste'){
    rect(ctx,b.x-9,roofY-8,b.w+18,10,'#dce2e7','#f8fafc');for(let px=b.x-3;px<b.x+b.w+3;px+=22)line(ctx,px,roofY+2,px,facadeY+height,'#c3cad1',1.5);
  }else if(b.id==='torre_guarda'){
    rect(ctx,b.x+8,roofY-10,b.w*.48,22,'#dce2e6','#f8fafc');rect(ctx,b.x+b.w*.52,roofY+9,b.w*.34,5,'#66727d');
  }else if(b.id==='mirante'){
    glassEdge(ctx,b.x+4,roofY-5,b.w-8);pergola(ctx,b.x+b.w*.16,roofY+5,b.w*.44,18);rect(ctx,b.x+b.w*.65,roofY+11,b.w*.22,9,'rgba(50,151,187,.20)','#7dd3fc');
  }
};
const vent=(ctx:CanvasRenderingContext2D,x:number,y:number,w=18)=>{rect(ctx,x,y,w,9,'#303941','#67737e');for(let px=x+3;px<x+w-2;px+=4)line(ctx,px,y+2,px,y+7,'#111827',1);};
const mast=(ctx:CanvasRenderingContext2D,x:number,y:number,c:string)=>{line(ctx,x,y,x,y-28,'#8d969f',1.5);line(ctx,x-10,y-18,x+10,y-18,'#6e7881',1);ctx.fillStyle=c;ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(x,y-30,2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;};
const drawT6=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,controlColor}=a;
  if(b.id==='beco_01'){
    rect(ctx,b.x+7,roofY+6,b.w*.48,17,'#29333c','#596672');vent(ctx,b.x+b.w-28,roofY+10,18);rect(ctx,b.x+b.w*.58,facadeY+height-11,b.w*.28,8,'#151b21','#64748b');
  }else if(b.id==='laje_ponto'){
    rect(ctx,b.x+b.w*.22,roofY-19,b.w*.56,28,'#17222c','#5d6975');vent(ctx,b.x+10,roofY+13,18);mast(ctx,b.x+b.w*.70,roofY-17,controlColor);
  }else if(b.id==='barraquinha'){
    poly(ctx,[[b.x+5,roofY+5],[b.x+b.w-5,roofY+5],[b.x+b.w-15,roofY-10],[b.x+15,roofY-10]],'#202932','#59636e');rect(ctx,b.x+b.w*.35,facadeY+height-16,b.w*.30,13,'#0d1218','#6b7280');
  }else if(b.id==='esconderijo'){
    for(let px=b.x+10;px<b.x+b.w-20;px+=22)vent(ctx,px,roofY+10,15);rect(ctx,b.x+7,roofY-7,b.w-14,7,'#3a454f','#68747f');
  }else if(b.id==='boca_leste'){
    rect(ctx,b.x+b.w*.24,roofY-22,b.w*.52,30,'#15222d','#5d6975');mast(ctx,b.x+b.w*.50,roofY-20,controlColor);rect(ctx,b.x+9,facadeY+height-9,b.w-18,5,'#303a43');
  }else if(b.id==='torre_guarda'){
    for(const px of [b.x+b.w*.36,b.x+b.w*.64])line(ctx,px,roofY-5,px,facadeY+height,'#59636e',2);rect(ctx,b.x+b.w*.29,roofY-43,b.w*.42,31,'#222d36','#65717c');rail(ctx,b.x+b.w*.24,roofY-47,b.w*.52,8);mast(ctx,b.x+b.w*.50,roofY-44,controlColor);
  }else if(b.id==='mirante'){
    rect(ctx,b.x+b.w*.12,roofY-24,b.w*.76,28,'#101b24','#5a6672');rect(ctx,b.x+b.w*.27,roofY-39,b.w*.46,16,'#192630','#65717c');mast(ctx,b.x+b.w*.50,roofY-38,controlColor);vent(ctx,b.x+10,roofY+10,17);vent(ctx,b.x+b.w-27,roofY+10,17);
  }
};