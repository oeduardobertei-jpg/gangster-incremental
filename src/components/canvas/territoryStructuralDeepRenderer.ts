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
  // 0.9.6F: old map-high ruler-straight drainage guides are replaced by short runoff cuts.
  ctx.save();ctx.lineCap='round';
  for(const [x1,y1,cx,cy,x2,y2] of [[.168,.18,.176,.27,.164,.35],[.182,.56,.169,.66,.178,.75],[.738,.17,.726,.27,.741,.36],[.724,.58,.742,.68,.731,.78]] as const){
    ctx.strokeStyle='rgba(18,27,28,.28)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*x1,h*y1);ctx.quadraticCurveTo(w*cx,h*cy,w*x2,h*y2);ctx.stroke();
    ctx.strokeStyle='rgba(135,139,126,.09)';ctx.lineWidth=1;ctx.stroke();
  }
  ctx.restore();
  // Building-to-ground contact now belongs to the dedicated 0.9.6 surface renderer.
  const laje=building(buildings,'laje do ponto');if(laje)stairRun(ctx,laje.x+laje.w+5,laje.y+laje.h-8,24,34,7);
};
const drawT2=(_ctx:CanvasRenderingContext2D,_w:number,_h:number,_buildings:readonly TacticalBuilding[])=>{};

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
const drawT3=(_ctx:CanvasRenderingContext2D,_w:number,_h:number,_buildings:readonly TacticalBuilding[])=>{};

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
