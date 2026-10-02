import type { TacticalBuilding } from './favelaRenderer';

const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1,dash:number[]=[] )=>{
  ctx.save();ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
};
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const rounded=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string)=>{
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
};
const building=(buildings:readonly TacticalBuilding[],label:string)=>buildings.find(b=>norm(b.label).includes(label));
const stairRun=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,steps=6)=>{
  ctx.save();for(let i=0;i<steps;i++){const yy=y+i*h/steps;rect(ctx,x,yy,w,h/steps,'rgba(100,116,139,.20)');line(ctx,x,yy,x+w,yy,'rgba(203,213,225,.16)',1);}ctx.restore();
};

const drawT1=(ctx:CanvasRenderingContext2D,w:number,h:number,buildings:readonly TacticalBuilding[])=>{
  const terraces=[[.055,.19,.14],[.055,.56,.16],[.73,.18,.15],[.72,.58,.18]] as const;
  for(const [x,y,len] of terraces){line(ctx,w*x,h*y,w*(x+len),h*(y+.018),'rgba(116,92,72,.32)',4);line(ctx,w*x,h*y-3,w*(x+len),h*(y+.018)-3,'rgba(180,151,120,.14)',1);}
  for(const x of [w*.175,w*.735]){
    line(ctx,x,h*.10,x-4,h*.88,'rgba(15,23,42,.45)',5);line(ctx,x+1,h*.10,x-3,h*.88,'rgba(148,163,184,.16)',1);
    for(let y=h*.16;y<h*.86;y+=54)line(ctx,x-7,y,x+5,y,'rgba(100,116,139,.22)',1);
  }
  for(const key of ['laje do ponto','beco 01','boca da leste','esconderijo']){
    const b=building(buildings,key);if(!b)continue;rounded(ctx,b.x-10,b.y+b.h+4,b.w+20,10,3,'rgba(86,75,63,.17)','rgba(148,135,116,.14)');
  }
  const laje=building(buildings,'laje do ponto');if(laje)stairRun(ctx,laje.x+laje.w+5,laje.y+laje.h-8,24,34,7);
};
const fence=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number)=>{
  line(ctx,x1,y1,x2,y2,'rgba(148,163,184,.35)',1.4);const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),nx=dx/len,ny=dy/len;
  for(let d=0;d<=len;d+=18){const x=x1+nx*d,y=y1+ny*d;line(ctx,x,y-5,x,y+5,'rgba(100,116,139,.38)',1);}
};
const platform=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{
  rect(ctx,x,y,w,14,'rgba(82,91,101,.30)','rgba(214,179,92,.25)');rect(ctx,x,y,w,3,'rgba(250,204,21,.34)');
  for(let xx=x+8;xx<x+w-8;xx+=18)line(ctx,xx,y+5,xx,y+12,'rgba(203,213,225,.14)',1);
};
const drawT2=(ctx:CanvasRenderingContext2D,w:number,h:number,buildings:readonly TacticalBuilding[])=>{
  const railY=h*.37;
  // Ballast/service strip visually ties every railway structure to the same system.
  rect(ctx,w*.055,railY-22,w*.89,44,'rgba(71,63,54,.16)');
  for(let x=w*.06;x<w*.94;x+=26){ctx.fillStyle='rgba(148,128,96,.16)';ctx.beginPath();ctx.ellipse(x,railY+17,5,2,0,0,Math.PI*2);ctx.fill();}
  fence(ctx,w*.06,railY-29,w*.43,railY-29);fence(ctx,w*.57,railY-29,w*.94,railY-29);
  const armazem=building(buildings,'armazem do trilho');if(armazem){
    const dockY=armazem.y+armazem.h+6;rect(ctx,armazem.x-12,dockY,armazem.w+24,16,'rgba(87,67,46,.25)','rgba(214,179,92,.25)');
    for(let x=armazem.x;x<armazem.x+armazem.w;x+=22)rect(ctx,x,dockY+4,13,4,'rgba(146,100,54,.26)');
    line(ctx,armazem.x+armazem.w*.5,dockY+16,armazem.x+armazem.w*.5,railY-20,'rgba(214,179,92,.28)',8);
  }
  const estacao=building(buildings,'estacao leste');if(estacao)platform(ctx,estacao.x-24,railY-16,estacao.w+48);
  const cabine=building(buildings,'cabine ferroviaria');if(cabine){
    rect(ctx,cabine.x-9,cabine.y+cabine.h+5,cabine.w+18,9,'rgba(51,65,85,.20)');
    line(ctx,cabine.x+cabine.w*.5,cabine.y+cabine.h+14,cabine.x+cabine.w*.5,railY-20,'rgba(100,116,139,.24)',2);
  }
  const passarela=building(buildings,'passarela');if(passarela){
    const cx=passarela.x+passarela.w*.5,top=passarela.y+passarela.h-2,bottom=railY+34,deckW=22;
    rect(ctx,cx-deckW/2,top,deckW,bottom-top,'rgba(71,85,105,.24)','rgba(203,213,225,.26)');
    line(ctx,cx-deckW/2+4,top,cx-deckW/2+4,bottom,'rgba(203,213,225,.35)',1.2);
    line(ctx,cx+deckW/2-4,top,cx+deckW/2-4,bottom,'rgba(203,213,225,.35)',1.2);
    for(let y=top+8;y<bottom;y+=11)line(ctx,cx-deckW/2+4,y,cx+deckW/2-4,y,'rgba(203,213,225,.14)',1);
    stairRun(ctx,cx-deckW/2-16,bottom-28,16,28,7);
  }
  // Freight staging remains asymmetric so the district reads as a used rail yard, not a grid editor.
  rounded(ctx,w*.18,h*.61,w*.17,h*.13,4,'rgba(92,67,45,.09)','rgba(214,179,92,.10)');
  rounded(ctx,w*.61,h*.62,w*.20,h*.11,4,'rgba(71,85,105,.08)','rgba(214,179,92,.08)');
};

export function drawTerritoryStructuralDeepFoundation(
  ctx:CanvasRenderingContext2D,width:number,height:number,territoryId:number,
  buildings:readonly TacticalBuilding[], controlColor='#3b82f6'
){
  ctx.save();
  if(territoryId===1)drawT1(ctx,width,height,buildings);
  else if(territoryId===2)drawT2(ctx,width,height,buildings);
  else if(territoryId===3)drawT3(ctx,width,height,buildings);
  else if(territoryId===4)drawT4(ctx,width,height,buildings);
  else if(territoryId===5)drawT5(ctx,width,height,buildings);
  else if(territoryId===6)drawT6(ctx,width,height,buildings,controlColor);
  ctx.restore();
}
const hazardStrip=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{
  for(let i=0;i<w;i+=10)rect(ctx,x+i,y,Math.min(6,w-i),4,(i/10)%2<1?'rgba(245,158,11,.30)':'rgba(15,23,42,.36)');
};
const oil=(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number)=>{
  ctx.fillStyle='rgba(2,6,12,.25)';ctx.beginPath();ctx.ellipse(x,y,rx,ry,.18,0,Math.PI*2);ctx.fill();
};
const drawT3=(ctx:CanvasRenderingContext2D,w:number,h:number,buildings:readonly TacticalBuilding[])=>{
  // Functional service lanes replace the old editor-like grid with purpose-driven circulation.
  for(const [x,y,ww,hh] of [[.08,.22,.27,.18],[.65,.22,.27,.18],[.08,.60,.27,.20],[.65,.59,.27,.20]] as const){
    rounded(ctx,w*x,h*y,w*ww,h*hh,3,'rgba(51,65,85,.075)','rgba(100,116,139,.12)');
    hazardStrip(ctx,w*x+8,h*(y+hh)-8,w*ww-16);
  }
  const oficina1=building(buildings,'oficina 01'),oficinaL=building(buildings,'oficina leste');
  for(const b of [oficina1,oficinaL])if(b){
    const gy=b.y+b.h+6;rect(ctx,b.x-12,gy,b.w+24,14,'rgba(15,23,42,.20)','rgba(249,115,22,.17)');
    oil(ctx,b.x+b.w*.35,gy+7,15,4);oil(ctx,b.x+b.w*.68,gy+8,9,3);
  }
  const galpao=building(buildings,'galpao de pecas');if(galpao){
    rect(ctx,galpao.x-14,galpao.y+galpao.h+5,galpao.w+28,16,'rgba(71,85,105,.18)','rgba(148,163,184,.18)');
    for(let x=galpao.x;x<galpao.x+galpao.w;x+=24)rect(ctx,x,galpao.y+galpao.h+9,14,4,'rgba(166,110,62,.25)');
  }
  const serr=building(buildings,'serralheria');if(serr){for(let i=0;i<5;i++)line(ctx,serr.x+8+i*7,serr.y+serr.h+7,serr.x+30+i*7,serr.y+serr.h+7,'rgba(148,163,184,.28)',3);}
  const deposito=building(buildings,'deposito industrial');if(deposito){
    const gy=deposito.y+deposito.h+5;rect(ctx,deposito.x-16,gy,deposito.w+32,18,'rgba(51,65,85,.20)','rgba(148,163,184,.17)');
    hazardStrip(ctx,deposito.x-10,gy+3,deposito.w+20);
  }
  const portaria=building(buildings,'portaria do patio');if(portaria){
    const gy=portaria.y+portaria.h+5;rect(ctx,portaria.x-10,gy,portaria.w+38,12,'rgba(51,65,85,.15)');
    line(ctx,portaria.x+portaria.w*.55,gy+6,portaria.x+portaria.w+28,gy+6,'rgba(248,250,252,.60)',3);
    line(ctx,portaria.x+portaria.w*.62,gy+6,portaria.x+portaria.w+18,gy+6,'rgba(249,115,22,.42)',2);
  }
  const torre=building(buildings,'torre da fabrica');if(torre){
    rounded(ctx,torre.x+torre.w*.25,torre.y+torre.h+5,torre.w*.50,13,2,'rgba(71,85,105,.20)','rgba(148,163,184,.16)');
    line(ctx,torre.x+torre.w*.5,torre.y+torre.h+18,torre.x+torre.w*.5,torre.y+torre.h+35,'rgba(100,116,139,.22)',2);
  }
  // Utility spine gives the yard a readable industrial hierarchy at open zoom.
  line(ctx,w*.17,h*.47,w*.83,h*.47,'rgba(15,23,42,.22)',5);
  line(ctx,w*.17,h*.47-2,w*.83,h*.47-2,'rgba(148,163,184,.10)',1);
};

const retainingWall=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,flip=false)=>{
  rect(ctx,x,y,w,6,'rgba(99,79,63,.34)','rgba(168,144,119,.22)');
  for(let xx=x+8;xx<x+w-5;xx+=18)line(ctx,xx,y+6,xx+(flip?-5:5),y+13,'rgba(71,55,44,.28)',2);
};
const dryPatch=(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number)=>{
  ctx.fillStyle='rgba(91,65,44,.17)';ctx.beginPath();ctx.ellipse(x,y,rx,ry,.1,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(126,111,70,.20)';for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(x+i*7,y-2+(i%2)*3,2.5,0,Math.PI*2);ctx.fill();}
};
const drawT4=(ctx:CanvasRenderingContext2D,w:number,h:number,buildings:readonly TacticalBuilding[])=>{
  // Contour terraces: the district now reads as a hill first and a combat arena second.
  const terraces=[[.055,.24,.34],[.61,.23,.34],[.055,.48,.29],[.67,.47,.28],[.07,.72,.31],[.62,.70,.33]] as const;
  terraces.forEach(([x,y,ww],i)=>retainingWall(ctx,w*x,h*y,w*ww,i%2===1));
  // Side stair chains connect levels without adding physical colliders.
  stairRun(ctx,w*.19,h*.29,22,h*.15,9);stairRun(ctx,w*.76,h*.31,20,h*.14,8);
  stairRun(ctx,w*.25,h*.58,22,h*.14,8);stairRun(ctx,w*.70,h*.60,20,h*.13,8);
  // Runoff channels descend between terraces and reinforce the slope direction.
  line(ctx,w*.34,h*.18,w*.29,h*.84,'rgba(32,24,20,.34)',5);line(ctx,w*.34,h*.18,w*.29,h*.84,'rgba(148,120,92,.14)',1);
  line(ctx,w*.71,h*.20,w*.74,h*.82,'rgba(32,24,20,.30)',4);line(ctx,w*.71,h*.20,w*.74,h*.82,'rgba(148,120,92,.12)',1);
  for(const [x,y] of [[.12,.35],[.31,.67],[.83,.38],[.78,.76],[.42,.25],[.58,.61]] as const)dryPatch(ctx,w*x,h*y,13,6);
  const reduto=building(buildings,'reduto do morro');if(reduto){
    rounded(ctx,reduto.x-13,reduto.y+reduto.h+4,reduto.w+26,13,3,'rgba(65,50,40,.22)','rgba(139,115,92,.18)');
    retainingWall(ctx,reduto.x-8,reduto.y+reduto.h+15,reduto.w+16);
  }
  const laje=building(buildings,'laje fortificada');if(laje)retainingWall(ctx,laje.x-10,laje.y+laje.h+9,laje.w+20,true);
  const beco=building(buildings,'beco da subida');if(beco)stairRun(ctx,beco.x+beco.w+4,beco.y+beco.h-6,25,38,9);
};

const treePit=(ctx:CanvasRenderingContext2D,x:number,y:number,r=10)=>{
  ctx.fillStyle='rgba(71,85,105,.18)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(226,232,240,.16)';ctx.stroke();
  ctx.fillStyle='rgba(49,91,70,.55)';ctx.beginPath();ctx.arc(x,y-2,r*.56,0,Math.PI*2);ctx.fill();
};
const planterStrip=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{
  rect(ctx,x,y,w,6,'rgba(71,85,105,.20)','rgba(226,232,240,.14)');
  for(let xx=x+5;xx<x+w-3;xx+=11){ctx.fillStyle=xx%22?'rgba(52,106,75,.48)':'rgba(42,91,66,.55)';ctx.beginPath();ctx.arc(xx,y-2,4,0,Math.PI*2);ctx.fill();}
};
const drawT5=(ctx:CanvasRenderingContext2D,w:number,h:number,buildings:readonly TacticalBuilding[])=>{
  // Deliberately asymmetric residential pockets break the CAD-like mirror composition.
  rounded(ctx,w*.075,h*.19,w*.18,h*.16,9,'rgba(203,213,225,.045)','rgba(226,232,240,.10)');
  rounded(ctx,w*.72,h*.21,w*.20,h*.13,7,'rgba(203,213,225,.035)','rgba(125,211,252,.09)');
  rounded(ctx,w*.09,h*.60,w*.16,h*.14,7,'rgba(203,213,225,.04)','rgba(226,232,240,.08)');
  rounded(ctx,w*.69,h*.58,w*.23,h*.17,9,'rgba(203,213,225,.04)','rgba(226,232,240,.09)');
  treePit(ctx,w*.28,h*.26,11);treePit(ctx,w*.74,h*.34,10);treePit(ctx,w*.22,h*.70,9);treePit(ctx,w*.80,h*.67,12);
  planterStrip(ctx,w*.09,h*.36,w*.14);planterStrip(ctx,w*.72,h*.49,w*.17);planterStrip(ctx,w*.10,h*.76,w*.13);
  // Visitor and delivery bays are intentionally different on each side.
  for(const [x,y,ww] of [[.28,.22,.12],[.61,.29,.15],[.30,.68,.10],[.58,.62,.16]] as const){
    rect(ctx,w*x,h*y,w*ww,24,'rgba(148,163,184,.055)','rgba(226,232,240,.11)');
    for(let xx=w*x+10;xx<w*(x+ww)-5;xx+=24)line(ctx,xx,h*y+3,xx,h*y+21,'rgba(226,232,240,.10)',1);
  }
  const portaria=building(buildings,'portaria leste');if(portaria)rounded(ctx,portaria.x-16,portaria.y+portaria.h+5,portaria.w+48,13,4,'rgba(148,163,184,.12)','rgba(226,232,240,.16)');
  const mansao=building(buildings,'mansao reservada');if(mansao)planterStrip(ctx,mansao.x+8,mansao.y+mansao.h+9,mansao.w*.42);
};
const technicalPad=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,accent:string)=>{
  rect(ctx,x,y,w,h,'rgba(30,41,59,.18)',accent);ctx.save();ctx.strokeStyle=accent;ctx.globalAlpha=.22;ctx.strokeRect(x+4,y+4,w-8,h-8);ctx.restore();
};
const bollards=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,accent:string)=>{
  for(let xx=x;xx<=x+w;xx+=12){rect(ctx,xx,y,3,8,'#64748b');rect(ctx,xx,y,3,2,accent);}
};
const drawT6=(ctx:CanvasRenderingContext2D,w:number,h:number,buildings:readonly TacticalBuilding[],accent='#3b82f6')=>{
  // Command spine and functional pads make the HQ read as an organized compound rather than repeated modules.
  technicalPad(ctx,w*.36,h*.15,w*.28,h*.13,'rgba(96,165,250,.15)');
  technicalPad(ctx,w*.36,h*.43,w*.28,h*.11,'rgba(96,165,250,.12)');
  technicalPad(ctx,w*.36,h*.70,w*.28,h*.11,'rgba(96,165,250,.11)');
  line(ctx,w*.50,h*.12,w*.50,h*.86,'rgba(15,23,42,.28)',5);line(ctx,w*.50,h*.12,w*.50,h*.86,'rgba(148,163,184,.10)',1);
  bollards(ctx,w*.38,h*.29,w*.24,accent);bollards(ctx,w*.38,h*.60,w*.24,accent);
  // Separate technical service yards left/right.
  rounded(ctx,w*.065,h*.31,w*.20,h*.13,4,'rgba(30,41,59,.09)','rgba(100,116,139,.12)');
  rounded(ctx,w*.73,h*.31,w*.20,h*.13,4,'rgba(30,41,59,.09)','rgba(100,116,139,.12)');
  rounded(ctx,w*.08,h*.66,w*.18,h*.12,4,'rgba(30,41,59,.08)','rgba(100,116,139,.10)');
  rounded(ctx,w*.72,h*.65,w*.21,h*.13,4,'rgba(30,41,59,.08)','rgba(100,116,139,.10)');
  // Cable trenches/service conduits create technical continuity.
  for(const x of [.30,.70]){line(ctx,w*x,h*.18,w*x,h*.83,'rgba(15,23,42,.42)',6);line(ctx,w*x,h*.18,w*x,h*.83,'rgba(96,165,250,.12)',1);}
  const qg=building(buildings,'qg central');if(qg){technicalPad(ctx,qg.x-18,qg.y+qg.h+4,qg.w+36,16,'rgba(96,165,250,.20)');bollards(ctx,qg.x+8,qg.y+qg.h+20,qg.w-16,accent);}
  const blindado=building(buildings,'posto blindado');if(blindado){technicalPad(ctx,blindado.x-12,blindado.y+blindado.h+5,blindado.w+24,14,'rgba(148,163,184,.16)');}
  const torre=building(buildings,'torre de seguranca');if(torre){rounded(ctx,torre.x+torre.w*.28,torre.y+torre.h+5,torre.w*.44,12,2,'rgba(15,23,42,.24)','rgba(96,165,250,.17)');}
};
