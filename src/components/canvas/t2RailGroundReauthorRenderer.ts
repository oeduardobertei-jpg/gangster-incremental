import type { ScenePath } from '../../data/territoryScenes';

type GroundFootprint={x:number;y:number;w:number;h:number;id?:string;label?:string};
const seeded=(n:number)=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
const pathLine=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{ctx.beginPath();path.points.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H):ctx.moveTo(p.x*W,p.y*H));};
const strokePath=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number,color:string,width:number,alpha=1)=>{ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';pathLine(ctx,path,W,H);ctx.stroke();ctx.restore();};
const blob=(ctx:CanvasRenderingContext2D,W:number,H:number,pts:readonly (readonly [number,number])[],fill:string,stroke?:string)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}};

const drawAccessRoad=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{
  const w=Math.max(62,path.width*.58);
  strokePath(ctx,path,W,H,'#5a5145',w+18,.42);
  strokePath(ctx,path,W,H,'#292d30',w+10,.91);
  strokePath(ctx,path,W,H,'#404347',w,1);
  strokePath(ctx,path,W,H,'#515054',Math.max(12,w-24),.28);
};

const drawMarketGround=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  // 1.1K: distinct market islands replace the old almost-map-wide slab.
  blob(ctx,W,H,[[.045,.475],[.16,.445],[.31,.455],[.405,.505],[.435,.61],[.39,.735],[.27,.79],[.11,.775],[.035,.68]],'rgba(92,68,50,.52)','rgba(136,116,86,.16)');
  blob(ctx,W,H,[[.565,.49],[.69,.45],[.86,.455],[.95,.505],[.965,.625],[.92,.745],[.80,.80],[.64,.775],[.555,.66]],'rgba(68,70,59,.50)','rgba(125,119,101,.15)');
  blob(ctx,W,H,[[.34,.72],[.42,.675],[.50,.695],[.59,.675],[.665,.73],[.65,.86],[.56,.91],[.43,.91],[.345,.845]],'rgba(67,57,51,.42)','rgba(122,111,91,.12)');
  for(const [x,y,rx,ry,a] of [[.14,.57,58,18,.10],[.30,.69,72,20,.08],[.73,.56,62,18,.08],[.84,.69,70,19,.075],[.24,.78,45,13,.07],[.58,.82,48,14,.06]] as const){ctx.fillStyle=`rgba(137,111,76,${a})`;ctx.beginPath();ctx.ellipse(W*x,H*y,rx,ry,(x-y)*.24,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='rgba(184,166,132,.07)';ctx.lineWidth=1;
  for(const [x0,x1,y] of [[.08,.39,.54],[.10,.40,.66],[.61,.93,.55],[.60,.90,.68],[.39,.63,.79]] as const){for(let x=x0;x<x1;x+=.042){ctx.beginPath();ctx.moveTo(W*x,H*(y-.035));ctx.lineTo(W*(x+.012),H*(y+.035));ctx.stroke();}}
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

const drawMarketAisles=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  ctx.lineCap='round';ctx.lineJoin='round';
  const lanes=[
    [[.10,.62],[.24,.60],[.36,.63],[.445,.60]],
    [[.555,.60],[.66,.58],[.79,.61],[.90,.64]],
    [[.23,.76],[.36,.72],[.46,.76],[.50,.82]],
    [[.50,.82],[.57,.75],[.71,.73],[.83,.76]]
  ] as const;
  for(const pts of lanes){
    ctx.strokeStyle='rgba(18,20,22,.18)';ctx.lineWidth=15;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.stroke();
    ctx.strokeStyle='rgba(144,132,112,.13)';ctx.lineWidth=9;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.stroke();
    ctx.strokeStyle='rgba(210,190,151,.065)';ctx.lineWidth=1;ctx.setLineDash([7,11]);ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.stroke();ctx.setLineDash([]);
  }
  // The central crossing becomes a gently bending freight/pedestrian spine.
  const spine=[[.50,.38],[.485,.50],[.515,.63],[.50,.82]] as const;
  ctx.strokeStyle='rgba(74,72,68,.46)';ctx.lineWidth=20;ctx.beginPath();spine.forEach(([x,y],i)=>i?ctx.lineTo(W*x,H*y):ctx.moveTo(W*x,H*y));ctx.stroke();
  ctx.strokeStyle='rgba(168,151,122,.12)';ctx.lineWidth=11;ctx.beginPath();spine.forEach(([x,y],i)=>i?ctx.lineTo(W*x,H*y):ctx.moveTo(W*x,H*y));ctx.stroke();
  // Two lateral market approaches physically explain how the rail edge feeds the feira.
  for(const [x0,x1,side] of [[.285,.255,-1],[.715,.748,1]] as const){
    ctx.strokeStyle='rgba(31,32,31,.24)';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(W*x0,H*.355);ctx.quadraticCurveTo(W*(x0+side*.018),H*.43,W*x1,H*.515);ctx.stroke();
    ctx.strokeStyle='rgba(145,127,99,.22)';ctx.lineWidth=12;ctx.stroke();
    ctx.strokeStyle='rgba(219,195,151,.11)';ctx.lineWidth=1;for(let t=.12;t<.94;t+=.16){const x=x0+(x1-x0)*t+side*.010*Math.sin(t*3.14),y=.355+(.515-.355)*t;ctx.beginPath();ctx.moveTo(W*x-6,H*y);ctx.lineTo(W*x+6,H*y+1);ctx.stroke();}
    for(const [x,y,w,h,c] of [[x0,.352,.040,.020,'rgba(82,80,73,.72)'],[x1,.515,.052,.024,'rgba(112,91,64,.56)']] as const){ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(W*(x-w*.5)+4,H*(y-h*.5)+4,W*w,H*h);ctx.fillStyle=c;ctx.fillRect(W*(x-w*.5),H*(y-h*.5),W*w,H*h);ctx.fillStyle='rgba(214,189,125,.28)';ctx.fillRect(W*(x-w*.5),H*(y+h*.5)-2,W*w,2);}
  }
  ctx.restore();
};

const drawRailAccessStory=(ctx:CanvasRenderingContext2D,W:number,H:number,items:readonly GroundFootprint[])=>{
  const railY=H*.29;ctx.save();
  const armazem=findBuilding(items,'armazem');
  if(armazem){
    const x=armazem.x-10,w=armazem.w+42,y=railY-38;
    ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(x+6,y+7,w,20);
    ctx.fillStyle='#554b3f';ctx.fillRect(x,y,w,20);ctx.fillStyle='#716555';ctx.fillRect(x,y,w,4);
    ctx.fillStyle='rgba(222,187,83,.62)';ctx.fillRect(x,y+17,w,3);
    ctx.strokeStyle='rgba(195,177,151,.14)';for(let xx=x+12;xx<x+w-6;xx+=22){ctx.beginPath();ctx.moveTo(xx,y+4);ctx.lineTo(xx,y+17);ctx.stroke();}
  }
  const station=findBuilding(items,'estacao');
  if(station){
    const x=Math.max(W*.70,station.x-46),w=Math.min(W-x-9,station.w+74),y=railY-38;
    ctx.fillStyle='rgba(0,0,0,.23)';ctx.fillRect(x+5,y+6,w,21);
    ctx.fillStyle='#55565a';ctx.fillRect(x,y,w,20);ctx.fillStyle='#6a6862';ctx.fillRect(x,y+4,w,13);
    ctx.fillStyle='rgba(236,199,89,.70)';ctx.fillRect(x,y+17,w,3);
    ctx.strokeStyle='rgba(219,226,230,.14)';for(let xx=x+14;xx<x+w-7;xx+=27){ctx.beginPath();ctx.moveTo(xx,y+5);ctx.lineTo(xx,y+17);ctx.stroke();}
  }
  const passarela=findBuilding(items,'passarela');
  if(passarela){
    const cx=passarela.x+passarela.w*.5,top=passarela.y+passarela.h+7,bottom=railY+51,dw=20;
    ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(cx-dw*.5+6,top+6,dw,bottom-top);
    ctx.fillStyle='rgba(71,81,89,.92)';ctx.fillRect(cx-dw*.5,top,dw,bottom-top);
    ctx.strokeStyle='rgba(207,216,221,.68)';ctx.lineWidth=1.2;for(const dx of [-dw*.5+2,dw*.5-2]){ctx.beginPath();ctx.moveTo(cx+dx,top);ctx.lineTo(cx+dx,bottom);ctx.stroke();}
    ctx.strokeStyle='rgba(196,205,210,.30)';ctx.lineWidth=1;for(let y=top+7;y<bottom-3;y+=9){ctx.beginPath();ctx.moveTo(cx-dw*.5+3,y);ctx.lineTo(cx+dw*.5-3,y);ctx.stroke();}
    for(const y of [railY-36,railY+36]){ctx.fillStyle='#4e5961';ctx.fillRect(cx-dw*.5-4,y-3,dw+8,6);}
    ctx.fillStyle='#c9a53e';ctx.globalAlpha=.65;ctx.fillRect(cx-dw*.5,bottom-3,dw,3);ctx.globalAlpha=1;
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

const overlapsFootprint=(x:number,y:number,w:number,h:number,items:readonly GroundFootprint[],pad=10)=>
  items.some(b=>x<b.x+b.w+pad&&x+w>b.x-pad&&y<b.y+b.h+pad&&y+h>b.y-pad);

const drawMarketFixtures=(ctx:CanvasRenderingContext2D,W:number,H:number,items:readonly GroundFootprint[])=>{
  ctx.save();
  const cloth=['#b8673c','#c59a3b','#4f7b73','#77647d','#c7ad82'];
  const stall=(nx:number,ny:number,variant:number)=>{
    const w=48,h=28,x=W*nx-w/2,y=H*ny-h/2;if(overlapsFootprint(x,y,w,h,items,11))return;
    ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(x+w*.52,y+h+5,w*.54,5,.03,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#6d5943';ctx.lineWidth=2.2;for(const px of [x+5,x+w-5]){ctx.beginPath();ctx.moveTo(px,y+4);ctx.lineTo(px,y+h+4);ctx.stroke();}
    ctx.fillStyle='#4f3928';ctx.fillRect(x+4,y+h*.52,w-8,h*.42);ctx.fillStyle='#815d3d';ctx.fillRect(x+7,y+h*.57,w-14,3);
    const c=cloth[variant%cloth.length],alt=variant%2?'#ead9b0':'#d9c99d';
    ctx.beginPath();ctx.moveTo(x-4,y+5);ctx.lineTo(x+w*.5,y-6);ctx.lineTo(x+w+4,y+5);ctx.lineTo(x+w,y+12);ctx.lineTo(x,y+12);ctx.closePath();ctx.fillStyle=c;ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(x+3,y+5,w-6,2);
    for(let i=0;i<6;i++){ctx.fillStyle=i%2?alt:c;ctx.globalAlpha=.88;ctx.fillRect(x+i*w/6,y+8,w/6+1,5);}ctx.globalAlpha=1;
    const goods=variant%3===0?'#739555':variant%3===1?'#c88346':'#b85c52';
    for(let i=0;i<4;i++){ctx.fillStyle=goods;ctx.fillRect(x+8+i*8,y+h*.68,5,3+(i%2));}
    ctx.fillStyle='rgba(255,211,122,.72)';ctx.beginPath();ctx.arc(x+w*.5,y+15,1.7,0,Math.PI*2);ctx.fill();
  };
  const tarp=(a:number,b:number,y:number,c:string)=>{const x1=W*a,x2=W*b,yy=H*y;if(overlapsFootprint(x1,yy-12,x2-x1,24,items,5))return;ctx.fillStyle=c;ctx.globalAlpha=.20;ctx.beginPath();ctx.moveTo(x1,yy-7);ctx.lineTo(x2,yy-4);ctx.lineTo(x2-5,yy+9);ctx.lineTo(x1+4,yy+7);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='rgba(222,205,174,.28)';ctx.beginPath();ctx.moveTo(x1,yy-7);ctx.lineTo(x2,yy-4);ctx.stroke();for(let i=1;i<6;i++){const t=i/6,x=x1+(x2-x1)*t,y=yy-7+3*t;ctx.fillStyle='rgba(255,215,139,.62)';ctx.beginPath();ctx.arc(x,y+2,1.3,0,Math.PI*2);ctx.fill();}};
  const cart=(nx:number,ny:number,rot:number)=>{const x=W*nx,y=H*ny;if(overlapsFootprint(x-16,y-9,32,18,items,8))return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(-15,6,31,5);ctx.fillStyle='#6d5338';ctx.fillRect(-14,-5,28,12);ctx.strokeStyle='#a98352';ctx.strokeRect(-14,-5,28,12);ctx.fillStyle='#2d3336';for(const wx of [-10,10]){ctx.beginPath();ctx.arc(wx,9,3,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#838b8e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,-1);ctx.lineTo(23,-5);ctx.stroke();ctx.restore();};
  const pallet=(nx:number,ny:number,variant:number)=>{const x=W*nx,y=H*ny;if(overlapsFootprint(x-14,y-8,28,16,items,7))return;ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(x-13,y+5,28,5);ctx.fillStyle='#725238';ctx.fillRect(x-14,y-5,28,10);ctx.strokeStyle='#a77b4d';ctx.strokeRect(x-14,y-5,28,10);ctx.strokeStyle='rgba(47,35,26,.55)';for(let xx=x-9;xx<x+13;xx+=7){ctx.beginPath();ctx.moveTo(xx,y-5);ctx.lineTo(xx,y+5);ctx.stroke();}if(variant%2===0){ctx.fillStyle='#8b6b45';ctx.fillRect(x-8,y-13,12,8);ctx.strokeStyle='#b28b5b';ctx.strokeRect(x-8,y-13,12,8);}};

  tarp(.075,.385,.545,'#b8673c');tarp(.615,.925,.545,'#4f7b73');tarp(.11,.36,.695,'#c59a3b');tarp(.64,.91,.695,'#77647d');
  [[.10,.57,0],[.18,.59,1],[.28,.57,2],[.36,.60,3],[.64,.57,2],[.72,.59,4],[.82,.57,1],[.90,.60,3],[.14,.72,4],[.24,.70,0],[.34,.73,2],[.66,.73,3],[.76,.70,1],[.87,.72,4]].forEach(([x,y,v])=>stall(x as number,y as number,v as number));
  [[.20,.79,-.10],[.38,.68,.06],[.62,.68,-.05],[.80,.79,.12]].forEach(([x,y,r])=>cart(x as number,y as number,r as number));
  [[.09,.50,0],[.31,.80,1],[.69,.80,0],[.91,.52,1]].forEach(([x,y,v])=>pallet(x as number,y as number,v as number));
  for(const side of [-1,1])for(const ny of [.47,.57,.68,.78]){const x=W*(.50+side*.045),y=H*ny;ctx.fillStyle='rgba(0,0,0,.20)';ctx.beginPath();ctx.ellipse(x,y+4,4,2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6b6e6e';ctx.fillRect(x-2,y-7,4,10);ctx.fillStyle='#d1a63a';ctx.fillRect(x-2,y-5,4,2);}
  ctx.restore();
};

const drawRailSignals=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const y=H*.29;ctx.save();
  for(const [nx,side] of [[.405,-1],[.595,1]] as const){
    const x=W*nx, mastY=y+(side*48);
    ctx.strokeStyle='#69747b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,mastY);ctx.lineTo(x,mastY-31*side);ctx.stroke();
    ctx.fillStyle='#242b30';ctx.fillRect(x-6,mastY-25*side-6,12,18);
    const lights=side<0?['#ef4444','#d19a2b','#344b3c']:['#334d3c','#d19a2b','#ef4444'];
    lights.forEach((c,i)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,mastY-22*side+i*6*side,2.2,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle='rgba(213,181,92,.48)';ctx.fillRect(x-9,mastY-3,18,3);
  }
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
  for(const term of ['box','banca','deposito'] as const){const b=findBuilding(items,term);if(!b)continue;const pad=term==='deposito'?11:8,x=b.x-pad,y=b.y+b.h-2,w=b.w+pad*2,h=12;ctx.beginPath();ctx.moveTo(x+4,y);ctx.lineTo(x+w-5,y+1);ctx.lineTo(x+w,y+h-3);ctx.lineTo(x+w-7,y+h);ctx.lineTo(x+3,y+h-1);ctx.closePath();ctx.fillStyle=term==='deposito'?'rgba(84,79,69,.17)':'rgba(112,86,58,.16)';ctx.fill();ctx.strokeStyle='rgba(186,151,91,.15)';ctx.stroke();}  ctx.restore();
};
export function drawT2ReauthoredSurface(ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[],footprints:readonly GroundFootprint[]=[]){
  ctx.save();
  drawMarketGround(ctx,W,H);
  drawGroundContact(ctx,footprints);
  paths.forEach(path=>drawAccessRoad(ctx,path,W,H));
  drawRailBed(ctx,W,H);
  drawRailVerge(ctx,W,H);
  drawRailDrainage(ctx,W,H);
  drawMarketAisles(ctx,W,H);
  drawBuildingRailLinks(ctx,W,H,footprints);
  drawRailAccessStory(ctx,W,H,footprints);
  drawCrossing(ctx,W,H);
  drawRailFence(ctx,W,H);
  drawRailSignals(ctx,W,H);
  drawPaverClusters(ctx,W,H);
  drawFootTraffic(ctx,W,H);
  drawMarketWear(ctx,W,H);
  drawMarketFixtures(ctx,W,H,footprints);
  drawMarketMicroLife(ctx,W,H);
  ctx.restore();
}
