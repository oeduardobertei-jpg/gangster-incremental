import type { ScenePath } from '../../data/territoryScenes';

type GroundFootprint={x:number;y:number;w:number;h:number;id?:string;label?:string};
const seeded=(n:number)=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
const pathLine=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{ctx.beginPath();path.points.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H):ctx.moveTo(p.x*W,p.y*H));};
const strokePath=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number,color:string,width:number,alpha=1)=>{ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';pathLine(ctx,path,W,H);ctx.stroke();ctx.restore();};
const blob=(ctx:CanvasRenderingContext2D,W:number,H:number,pts:readonly (readonly [number,number])[],fill:string,stroke?:string)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}};

const drawAccessRoad=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{
  const w=Math.max(72,path.width*.72);
  strokePath(ctx,path,W,H,'#5a5145',w+18,.42);
  strokePath(ctx,path,W,H,'#292d30',w+10,.91);
  strokePath(ctx,path,W,H,'#404347',w,1);
  strokePath(ctx,path,W,H,'#515054',Math.max(12,w-24),.28);
};

const drawMarketGround=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  blob(ctx,W,H,[[.055,.455],[.205,.435],[.405,.455],[.495,.505],[.610,.455],[.835,.438],[.945,.475],[.955,.655],[.900,.805],[.655,.825],[.465,.790],[.275,.825],[.095,.805],[.045,.650]],'rgba(47,44,48,.54)');
  blob(ctx,W,H,[[.075,.515],[.245,.495],[.405,.520],[.455,.610],[.375,.735],[.185,.760],[.070,.690]],'rgba(100,82,61,.075)');
  blob(ctx,W,H,[[.565,.515],[.760,.490],[.925,.535],[.930,.700],[.805,.770],[.610,.735]],'rgba(74,83,75,.065)');
  ctx.strokeStyle='rgba(187,174,151,.10)';ctx.lineCap='round';
  for(const [x1,y1,x2,y2] of [[.13,.565,.39,.57],[.61,.56,.86,.55],[.19,.72,.41,.69],[.59,.70,.83,.73]] as const){ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(W*x1,H*y1);ctx.lineTo(W*x2,H*y2);ctx.stroke();}
  ctx.restore();
};

const drawRailBed=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const y=H*.29;
  ctx.save();
  ctx.fillStyle='rgba(67,62,57,.56)';ctx.fillRect(0,y-31,W,62);
  ctx.fillStyle='rgba(37,39,42,.78)';ctx.fillRect(0,y-24,W,48);
  for(let x=-6,i=0;x<W+16;x+=23,i++){
    const r=seeded(500+i*17),sw=7+r*2;
    ctx.fillStyle=i%4===0?'rgba(115,87,61,.78)':'rgba(86,69,55,.82)';
    ctx.save();ctx.translate(x,y);ctx.rotate((r-.5)*.025);ctx.fillRect(-sw*.5,-21,sw,42);ctx.restore();
  }
  ctx.strokeStyle='#7f8b98';ctx.lineWidth=3.5;
  for(const off of [-10,10]){ctx.beginPath();ctx.moveTo(0,y+off);ctx.lineTo(W,y+off);ctx.stroke();ctx.strokeStyle='rgba(211,219,223,.22)';ctx.lineWidth=.8;ctx.stroke();ctx.strokeStyle='#7f8b98';ctx.lineWidth=3.5;}
  ctx.fillStyle='rgba(128,113,91,.18)';
  for(let i=0;i<90;i++){const x=seeded(801+i*31)*W,yy=y-27+seeded(901+i*41)*54,rr=.7+seeded(1001+i*19)*1.8;ctx.beginPath();ctx.arc(x,yy,rr,0,Math.PI*2);ctx.fill();}
  ctx.restore();
};

const drawRailVerge=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  const y=H*.29;
  ctx.fillStyle='rgba(98,79,57,.09)';ctx.fillRect(0,y-47,W,14);ctx.fillRect(0,y+33,W,15);
  const pockets=[[.035,-40],[.105,40],[.185,-39],[.345,40],[.655,-39],[.775,40],[.905,-40],[.965,39]] as const;
  for(const [nx,dy] of pockets){const x=nx*W,py=y+dy;ctx.strokeStyle='rgba(93,119,66,.55)';ctx.lineWidth=1;for(let i=0;i<7;i++){const dx=(i-3)*2;ctx.beginPath();ctx.moveTo(x+dx,py);ctx.lineTo(x+dx+(i%2?2:-2),py-4-(i%3)*2);ctx.stroke();}}
  ctx.restore();
};

const drawPlatforms=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const railY=H*.29, y=railY-65;
  ctx.save();
  for(const [nx,nw] of [[.24,.205],[.555,.205]] as const){const x=W*nx,w=W*nw;ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(x+5,y+8,w,24);ctx.fillStyle='#514f49';ctx.fillRect(x,y,w,25);ctx.fillStyle='#68645b';ctx.fillRect(x,y,w,5);ctx.fillStyle='#303236';ctx.fillRect(x+5,y+8,w-10,13);ctx.fillStyle='rgba(219,184,91,.48)';ctx.fillRect(x,y+22,w,3);ctx.strokeStyle='rgba(203,213,225,.10)';for(let xx=x+26;xx<x+w-8;xx+=34){ctx.beginPath();ctx.moveTo(xx,y+5);ctx.lineTo(xx,y+22);ctx.stroke();}}
  const x=W*.445,w=W*.11;ctx.fillStyle='#46494c';ctx.fillRect(x,y,w,25);ctx.fillStyle='rgba(216,181,91,.40)';ctx.fillRect(x,y+22,w,3);
  ctx.restore();
};

const drawCrossing=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const y=H*.29,x=W*.445,w=W*.11;
  ctx.save();
  ctx.fillStyle='rgba(63,65,65,.96)';ctx.fillRect(x,y-31,w,62);
  ctx.fillStyle='rgba(129,119,100,.22)';
  for(let xx=x+7;xx<x+w-5;xx+=12)ctx.fillRect(xx,y-28,7,56);
  ctx.strokeStyle='rgba(225,199,103,.42)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+4,y-29);ctx.lineTo(x+4,y+29);ctx.moveTo(x+w-4,y-29);ctx.lineTo(x+w-4,y+29);ctx.stroke();
  ctx.fillStyle='#b94843';for(const sx of [x-10,x+w+10]){ctx.beginPath();ctx.arc(sx,y-42,4,0,Math.PI*2);ctx.fill();}
  ctx.restore();
};

const drawPaverClusters=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  for(const [nx,ny,seed] of [[.145,.515,1201],[.335,.755,1301],[.685,.515,1401],[.825,.735,1501]] as const){
    const ox=nx*W,oy=ny*H;
    for(let r=0;r<3;r++)for(let c=0;c<5;c++){const n=seeded(seed+r*19+c*31);if(n<.18)continue;ctx.fillStyle=n>.72?'rgba(151,137,113,.20)':'rgba(112,109,101,.19)';ctx.fillRect(ox+c*8+(r%2)*3,oy+r*5,6,3.5);}
  }
  ctx.restore();
};

const drawFootTraffic=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();ctx.fillStyle='rgba(19,21,23,.16)';
  for(const [x,y,rx,ry,r] of [[.18,.59,42,9,-.08],[.38,.64,34,8,.08],[.66,.62,38,8,-.06],[.82,.60,31,7,.10],[.48,.76,35,8,.03]] as const){ctx.beginPath();ctx.ellipse(W*x,H*y,rx,ry,r,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='rgba(149,111,65,.11)';
  for(const [x,y,rx,ry] of [[.10,.68,28,9],[.29,.50,24,7],[.73,.75,30,9],[.91,.64,22,7]] as const){ctx.beginPath();ctx.ellipse(W*x,H*y,rx,ry,.08,0,Math.PI*2);ctx.fill();}
  ctx.restore();
};

const drawGroundContact=(ctx:CanvasRenderingContext2D,footprints:readonly GroundFootprint[]=[])=>{
  ctx.save();footprints.forEach((b,i)=>{const pad=5+seeded(1801+i*37)*4,x=b.x-pad,y=b.y-pad,w=b.w+pad*2,h=b.h+pad*2;ctx.beginPath();ctx.moveTo(x+4,y);ctx.lineTo(x+w-6,y+2);ctx.lineTo(x+w,y+h-6);ctx.lineTo(x+w-7,y+h+2);ctx.lineTo(x+5,y+h);ctx.lineTo(x-2,y+7);ctx.closePath();ctx.fillStyle=i%3===0?'rgba(111,91,66,.075)':'rgba(84,91,82,.060)';ctx.fill();ctx.fillStyle='rgba(20,22,23,.15)';ctx.beginPath();ctx.ellipse(b.x+b.w*.5,b.y+b.h+3,Math.max(10,b.w*.29),3.5,.03,0,Math.PI*2);ctx.fill();});ctx.restore();
};

const drawMarketWear=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  const patches=[
    [.15,.62,44,14,-.12,'rgba(73,69,67,.24)'],[.31,.55,34,11,.10,'rgba(117,91,63,.15)'],
    [.69,.60,46,13,-.06,'rgba(68,75,72,.22)'],[.84,.70,38,12,.12,'rgba(113,88,60,.14)'],
    [.25,.76,31,9,-.08,'rgba(57,61,61,.22)'],[.59,.78,37,10,.05,'rgba(70,66,65,.20)']
  ] as const;
  for(const [nx,ny,rx,ry,rot,fill] of patches){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(W*nx,H*ny,rx,ry,rot,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(172,158,135,.08)';ctx.lineWidth=1;ctx.stroke();}
  ctx.strokeStyle='rgba(23,27,28,.25)';ctx.lineWidth=1;ctx.lineCap='round';
  for(const [x,y,len,a] of [[.19,.66,34,.25],[.37,.73,28,-.18],[.63,.57,31,.20],[.78,.65,26,-.25],[.52,.82,22,.15]] as const){ctx.beginPath();ctx.moveTo(W*x,H*y);ctx.lineTo(W*x+Math.cos(a)*len,H*y+Math.sin(a)*len);ctx.lineTo(W*x+Math.cos(a)*len*.62+5,H*y+Math.sin(a)*len*.62+4);ctx.stroke();}
  ctx.strokeStyle='rgba(102,113,105,.20)';ctx.lineWidth=3;
  for(const [x1,x2,y] of [[.08,.29,.805],[.35,.45,.805],[.58,.72,.805],[.79,.92,.805]] as const){ctx.beginPath();ctx.moveTo(W*x1,H*y);ctx.lineTo(W*x2,H*y);ctx.stroke();}
  ctx.restore();
};
const drawRailDrainage=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const y=H*.29;ctx.save();ctx.strokeStyle='rgba(18,28,30,.30)';ctx.lineWidth=4;ctx.lineCap='round';
  for(const [x1,x2,dy] of [[.03,.39,43],[.61,.97,43],[.05,.40,-43],[.60,.95,-43]] as const){ctx.beginPath();ctx.moveTo(W*x1,y+dy);ctx.lineTo(W*x2,y+dy);ctx.stroke();}
  ctx.strokeStyle='rgba(137,145,143,.17)';ctx.lineWidth=1;
  for(const nx of [.18,.36,.66,.84]){const x=nx*W;ctx.strokeRect(x,y+37,22,6);for(let i=4;i<20;i+=5){ctx.beginPath();ctx.moveTo(x+i,y+38);ctx.lineTo(x+i,y+42);ctx.stroke();}}
  ctx.restore();
};

const drawMarketMicroLife=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  for(let i=0;i<60;i++){
    const nx=.055+seeded(2201+i*31)*.89,ny=.47+seeded(2301+i*37)*.34;
    if(nx>.43&&nx<.57)continue;
    const x=nx*W,y=ny*H,s=.6+seeded(2401+i*19)*1.2;
    ctx.fillStyle=i%4===0?'rgba(184,137,67,.14)':i%4===1?'rgba(67,105,73,.13)':'rgba(128,117,101,.12)';
    ctx.save();ctx.translate(x,y);ctx.rotate((seeded(2501+i*23)-.5)*1.4);ctx.fillRect(-s,-.55,s*2,1.1);ctx.restore();
  }
  const weeds=[[.075,.475],[.225,.815],[.405,.465],[.615,.465],[.785,.815],[.925,.49]] as const;
  ctx.strokeStyle='rgba(78,114,68,.46)';ctx.lineWidth=1;
  for(const [nx,ny] of weeds){for(let i=0;i<6;i++){const x=nx*W+(i-3)*2,y=ny*H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(i%2?2:-2),y-4-(i%3)*2);ctx.stroke();}}
  ctx.restore();
};

const drawRailFence=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const y=H*.29;ctx.save();ctx.strokeStyle='rgba(141,151,159,.34)';ctx.lineWidth=1.2;
  for(const yy of [y-34,y+34])for(const [a,b] of [[0,.445],[.555,1]] as const){ctx.beginPath();ctx.moveTo(W*a,yy);ctx.lineTo(W*b,yy);ctx.stroke();for(let x=W*a+10;x<W*b;x+=31){ctx.beginPath();ctx.moveTo(x,yy-6);ctx.lineTo(x,yy+6);ctx.stroke();}}
  ctx.restore();
};

const norm=(s='')=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const findBuilding=(items:readonly GroundFootprint[],term:string)=>items.find(b=>norm(b.label).includes(term)||norm(b.id).includes(term));
const drawBuildingRailLinks=(ctx:CanvasRenderingContext2D,W:number,H:number,items:readonly GroundFootprint[])=>{
  const railY=H*.29;ctx.save();
  const armazem=findBuilding(items,'armazem');
  if(armazem){const y=armazem.y+armazem.h+5;ctx.fillStyle='rgba(91,69,47,.30)';ctx.fillRect(armazem.x-10,y,armazem.w+20,14);ctx.strokeStyle='rgba(206,166,92,.26)';ctx.strokeRect(armazem.x-10,y,armazem.w+20,14);ctx.strokeStyle='rgba(130,94,57,.24)';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(armazem.x+armazem.w*.5,y+14);ctx.lineTo(armazem.x+armazem.w*.5,railY-29);ctx.stroke();}
  const station=findBuilding(items,'estacao');
  if(station){const cx=station.x+station.w*.5,sy=station.y+station.h+4;ctx.fillStyle='rgba(84,82,74,.28)';ctx.fillRect(station.x-16,sy,station.w+32,12);ctx.strokeStyle='rgba(213,181,92,.24)';ctx.strokeRect(station.x-16,sy,station.w+32,12);ctx.strokeStyle='rgba(116,112,99,.24)';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(cx,sy+12);ctx.lineTo(cx,railY-30);ctx.stroke();}
  const cabine=findBuilding(items,'cabine');
  if(cabine){const cx=cabine.x+cabine.w*.5,y=cabine.y+cabine.h+4;ctx.fillStyle='rgba(59,68,75,.24)';ctx.fillRect(cabine.x-7,y,cabine.w+14,8);ctx.strokeStyle='rgba(99,111,119,.24)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,y+8);ctx.lineTo(cx,railY-30);ctx.stroke();}
  for(const term of ['box','banca','deposito'] as const){const b=findBuilding(items,term);if(!b)continue;const pad=term==='deposito'?11:8,x=b.x-pad,y=b.y+b.h-2,w=b.w+pad*2,h=12;ctx.beginPath();ctx.moveTo(x+4,y);ctx.lineTo(x+w-5,y+1);ctx.lineTo(x+w,y+h-3);ctx.lineTo(x+w-7,y+h);ctx.lineTo(x+3,y+h-1);ctx.closePath();ctx.fillStyle=term==='deposito'?'rgba(84,79,69,.17)':'rgba(112,86,58,.16)';ctx.fill();ctx.strokeStyle='rgba(186,151,91,.15)';ctx.stroke();}
  const passarela=findBuilding(items,'passarela');if(passarela){const cx=passarela.x+passarela.w*.5;ctx.fillStyle='rgba(74,80,84,.20)';ctx.fillRect(cx-14,railY-35,28,70);ctx.strokeStyle='rgba(186,194,198,.18)';ctx.strokeRect(cx-14,railY-35,28,70);}  ctx.restore();
};
export function drawT2ReauthoredSurface(ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[],footprints:readonly GroundFootprint[]=[]){
  ctx.save();
  drawMarketGround(ctx,W,H);
  drawGroundContact(ctx,footprints);
  paths.forEach(path=>drawAccessRoad(ctx,path,W,H));
  drawRailBed(ctx,W,H);
  drawRailVerge(ctx,W,H);
  drawRailDrainage(ctx,W,H);
  drawBuildingRailLinks(ctx,W,H,footprints);
  drawPlatforms(ctx,W,H);
  drawCrossing(ctx,W,H);
  drawRailFence(ctx,W,H);
  drawPaverClusters(ctx,W,H);
  drawFootTraffic(ctx,W,H);
  drawMarketWear(ctx,W,H);
  drawMarketMicroLife(ctx,W,H);
  ctx.restore();
}
