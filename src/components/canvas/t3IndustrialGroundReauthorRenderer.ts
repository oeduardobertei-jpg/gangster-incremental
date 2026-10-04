import type { ScenePath } from '../../data/territoryScenes';

type GroundFootprint={x:number;y:number;w:number;h:number;id?:string;label?:string};
const seeded=(n:number)=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
const norm=(s='')=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const find=(items:readonly GroundFootprint[],term:string)=>items.find(b=>norm(b.label).includes(term)||norm(b.id).includes(term));
const pathLine=(ctx:CanvasRenderingContext2D,p:ScenePath,W:number,H:number)=>{ctx.beginPath();p.points.forEach((q,i)=>i?ctx.lineTo(q.x*W,q.y*H):ctx.moveTo(q.x*W,q.y*H));};
const strokePath=(ctx:CanvasRenderingContext2D,p:ScenePath,W:number,H:number,c:string,w:number,a=1)=>{ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';pathLine(ctx,p,W,H);ctx.stroke();ctx.restore();};
const blob=(ctx:CanvasRenderingContext2D,W:number,H:number,pts:readonly (readonly [number,number])[],fill:string)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.closePath();ctx.fillStyle=fill;ctx.fill();};

const drawIndustrialField=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  blob(ctx,W,H,[[.06,.18],[.31,.145],[.49,.18],[.68,.14],[.93,.20],[.96,.42],[.91,.82],[.68,.86],[.49,.82],[.27,.87],[.055,.79],[.035,.47]],'rgba(45,47,50,.54)');
  blob(ctx,W,H,[[.055,.25],[.32,.21],[.43,.35],[.34,.53],[.075,.52]],'rgba(70,64,58,.10)');
  blob(ctx,W,H,[[.61,.22],[.91,.25],[.93,.52],[.72,.54],[.58,.42]],'rgba(55,63,66,.10)');
  blob(ctx,W,H,[[.08,.60],[.35,.57],[.48,.72],[.37,.84],[.08,.79]],'rgba(62,58,55,.09)');
  blob(ctx,W,H,[[.59,.59],[.91,.57],[.92,.80],[.65,.84],[.55,.72]],'rgba(52,59,61,.10)');
  ctx.restore();
};

const drawMainRoad=(ctx:CanvasRenderingContext2D,p:ScenePath,W:number,H:number)=>{
  const w=Math.max(76,p.width*.76);strokePath(ctx,p,W,H,'#191d20',w+16,.62);strokePath(ctx,p,W,H,'#303438',w+8,.96);strokePath(ctx,p,W,H,'#424447',w,1);
  strokePath(ctx,p,W,H,'rgba(99,102,105,.24)',Math.max(18,w-30),1);ctx.save();pathLine(ctx,p,W,H);ctx.setLineDash([19,24]);ctx.strokeStyle='rgba(214,169,61,.38)';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);ctx.restore();
};
const drawSlabJoints=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();ctx.strokeStyle='rgba(151,151,145,.095)';ctx.lineWidth=1;
  for(const [x1,y1,x2,y2] of [[.09,.28,.35,.27],[.65,.28,.91,.30],[.10,.48,.34,.47],[.67,.48,.90,.46],[.11,.67,.37,.66],[.63,.67,.89,.69],[.14,.80,.39,.78],[.61,.80,.87,.79]] as const){ctx.beginPath();ctx.moveTo(W*x1,H*y1);ctx.lineTo(W*x2,H*y2);ctx.stroke();}
  for(const [x,y1,y2] of [[.22,.22,.50],[.78,.23,.49],[.25,.59,.82],[.75,.58,.83]] as const){ctx.beginPath();ctx.moveTo(W*x,H*y1);ctx.lineTo(W*x,H*y2);ctx.stroke();}
  ctx.restore();
};

const drawServiceDrainage=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();ctx.strokeStyle='rgba(18,23,25,.37)';ctx.lineWidth=4;ctx.lineCap='round';
  for(const [x1,y1,x2,y2] of [[.075,.515,.31,.505],[.69,.505,.925,.515],[.10,.825,.37,.805],[.64,.805,.90,.825]] as const){ctx.beginPath();ctx.moveTo(W*x1,H*y1);ctx.lineTo(W*x2,H*y2);ctx.stroke();}
  ctx.strokeStyle='rgba(147,153,151,.19)';ctx.lineWidth=1;
  for(const [x,y] of [[.18,.51],[.80,.51],[.24,.815],[.76,.815]] as const){const px=W*x,py=H*y;ctx.strokeRect(px-10,py-3,20,6);for(let i=-7;i<=7;i+=5){ctx.beginPath();ctx.moveTo(px+i,py-2);ctx.lineTo(px+i,py+2);ctx.stroke();}}
  ctx.restore();
};

const drawTyreOilWear=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  for(const [x,y,rx,ry,r,a] of [[.18,.37,33,8,-.08,.19],[.34,.62,25,7,.12,.16],[.70,.39,39,9,.05,.20],[.82,.66,31,8,-.13,.17],[.23,.72,22,6,.08,.15],[.72,.73,26,7,-.09,.16]] as const){ctx.fillStyle=`rgba(7,10,12,${a})`;ctx.beginPath();ctx.ellipse(W*x,H*y,rx,ry,r,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='rgba(19,22,23,.18)';ctx.lineWidth=2;
  for(const [x,y,len,a] of [[.12,.43,74,.05],[.65,.43,82,-.04],[.13,.75,61,.06],[.68,.76,75,-.06]] as const){ctx.beginPath();ctx.moveTo(W*x,H*y);ctx.lineTo(W*x+Math.cos(a)*len,H*y+Math.sin(a)*len);ctx.stroke();ctx.beginPath();ctx.moveTo(W*x,H*y+5);ctx.lineTo(W*x+Math.cos(a)*len,H*y+5+Math.sin(a)*len);ctx.stroke();}
  ctx.restore();
};
const drawDock=(ctx:CanvasRenderingContext2D,b:GroundFootprint,accent:string,kind:'heavy'|'shop'|'gate'='heavy')=>{
  const y=b.y+b.h+4,pad=kind==='heavy'?14:9,h=kind==='gate'?10:15,x=b.x-pad,w=b.w+pad*2;
  ctx.save();ctx.fillStyle=kind==='shop'?'rgba(75,65,57,.23)':'rgba(56,62,65,.25)';ctx.fillRect(x,y,w,h);ctx.strokeStyle=accent;ctx.globalAlpha=.40;ctx.strokeRect(x,y,w,h);ctx.globalAlpha=1;
  if(kind==='heavy'){ctx.strokeStyle='rgba(205,119,55,.33)';ctx.lineWidth=3;for(let xx=x+7;xx<x+w-6;xx+=18){ctx.beginPath();ctx.moveTo(xx,y+h-3);ctx.lineTo(Math.min(xx+10,x+w-3),y+h-3);ctx.stroke();}}
  if(kind==='shop'){ctx.fillStyle='rgba(8,11,13,.22)';ctx.beginPath();ctx.ellipse(b.x+b.w*.38,y+h*.60,15,4,.1,0,Math.PI*2);ctx.fill();}
  ctx.restore();
};

const drawBuildingGrounding=(ctx:CanvasRenderingContext2D,items:readonly GroundFootprint[])=>{
  const galpao=find(items,'galpao');if(galpao)drawDock(ctx,galpao,'rgba(167,177,184,.35)','heavy');
  const deposito=find(items,'deposito');if(deposito)drawDock(ctx,deposito,'rgba(167,177,184,.34)','heavy');
  const serr=find(items,'serralheria');if(serr)drawDock(ctx,serr,'rgba(221,119,50,.32)','shop');
  for(const term of ['oficina 01','oficina leste'] as const){const b=find(items,term);if(b)drawDock(ctx,b,'rgba(221,119,50,.35)','shop');}
  const portaria=find(items,'portaria');if(portaria){drawDock(ctx,portaria,'rgba(225,155,45,.34)','gate');const y=portaria.y+portaria.h+17;ctx.strokeStyle='rgba(232,224,207,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(portaria.x+portaria.w*.54,y);ctx.lineTo(portaria.x+portaria.w+34,y);ctx.stroke();ctx.strokeStyle='rgba(221,119,50,.48)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(portaria.x+portaria.w*.62,y);ctx.lineTo(portaria.x+portaria.w+24,y);ctx.stroke();}
  const torre=find(items,'torre');if(torre){ctx.fillStyle='rgba(48,54,57,.20)';ctx.beginPath();ctx.ellipse(torre.x+torre.w*.5,torre.y+torre.h+8,torre.w*.32,6,0,0,Math.PI*2);ctx.fill();}
};

const drawIndustrialMicro=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  for(let i=0;i<96;i++){const nx=.045+seeded(3301+i*29)*.91,ny=.17+seeded(4401+i*37)*.68;if(nx>.42&&nx<.58)continue;const x=nx*W,y=ny*H,s=.5+seeded(5501+i*17)*1.6;ctx.fillStyle=i%5===0?'rgba(164,82,42,.19)':i%5===1?'rgba(101,111,103,.18)':'rgba(118,111,100,.12)';ctx.save();ctx.translate(x,y);ctx.rotate((seeded(6601+i*23)-.5)*1.4);ctx.fillRect(-s,-.55,s*2,1.1);ctx.restore();}
  ctx.strokeStyle='rgba(75,101,65,.40)';ctx.lineWidth=1;for(const [nx,ny] of [[.07,.21],[.92,.31],[.09,.81],[.91,.77],[.33,.84],[.67,.84]] as const){for(let i=0;i<5;i++){const x=nx*W+(i-2)*2,y=ny*H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(i%2?2:-2),y-4-(i%3)*2);ctx.stroke();}}
  ctx.restore();
};
const drawRustRunoff=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();ctx.strokeStyle='rgba(151,70,36,.12)';ctx.lineWidth=3;ctx.lineCap='round';
  for(const [x,y,len] of [[.12,.31,38],[.31,.51,26],[.70,.31,32],[.87,.54,29],[.18,.68,34],[.80,.72,31]] as const){ctx.beginPath();ctx.moveTo(W*x,H*y);ctx.lineTo(W*x+len,H*y+5);ctx.stroke();}
  ctx.restore();
};

export function drawT3ReauthoredSurface(ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[],footprints:readonly GroundFootprint[]=[]){
  ctx.save();
  drawIndustrialField(ctx,W,H);
  drawSlabJoints(ctx,W,H);
  paths.forEach(path=>drawMainRoad(ctx,path,W,H));
  drawServiceDrainage(ctx,W,H);
  drawTyreOilWear(ctx,W,H);
  drawBuildingGrounding(ctx,footprints);
  drawRustRunoff(ctx,W,H);
  drawIndustrialMicro(ctx,W,H);
  ctx.restore();
}
