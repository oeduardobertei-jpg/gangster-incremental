import type { ScenePath } from '../../data/territoryScenes';

type ReservedFootprint={x:number;y:number;w:number;h:number};
type Pt=readonly[number,number];
const alpha=(hex:string,a:number)=>{const h=hex.replace('#','');if(!/^[0-9a-f]{6}$/i.test(h))return hex;return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};
const rect=(ctx:CanvasRenderingContext2D,W:number,H:number,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{ctx.fillStyle=fill;ctx.fillRect(x*W,y*H,w*W,h*H);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.strokeRect(x*W,y*H,w*W,h*H);}};
const poly=(ctx:CanvasRenderingContext2D,W:number,H:number,pts:readonly Pt[],fill:string,stroke?:string)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}};

function drawAxialComplex(ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[]){
  // Reuse authored traversal axis, but with layered reinforced paving instead of blueprint rectangles.
  for(const path of paths){if(path.points.length<2)continue;ctx.beginPath();path.points.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H):ctx.moveTo(p.x*W,p.y*H));ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(3,7,12,.48)';ctx.lineWidth=path.width+10;ctx.stroke();ctx.beginPath();path.points.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H):ctx.moveTo(p.x*W,p.y*H));ctx.strokeStyle='#24292f';ctx.lineWidth=path.width;ctx.stroke();}
  // Command spine material change gives the center hierarchy without inventing blockers.
  rect(ctx,W,H,.405,.055,.19,.88,'rgba(63,69,75,.18)','rgba(148,163,184,.075)');
  ctx.strokeStyle='rgba(148,163,184,.10)';ctx.lineWidth=1;
  for(let y=.11;y<.91;y+=.085){ctx.beginPath();ctx.moveTo(W*.415,H*y);ctx.lineTo(W*.585,H*y);ctx.stroke();}
}

function drawFunctionalCourts(ctx:CanvasRenderingContext2D,W:number,H:number){
  // Four operational courts replace the one giant blank slab. They are purely surface language.
  const courts=[
    {pts:[[.335,.115],[.455,.105],[.465,.285],[.345,.305]] as const,fill:'rgba(41,50,58,.29)'},
    {pts:[[.545,.105],[.665,.120],[.655,.305],[.535,.285]] as const,fill:'rgba(45,51,57,.27)'},
    {pts:[[.34,.515],[.465,.500],[.465,.690],[.335,.705]] as const,fill:'rgba(43,48,54,.28)'},
    {pts:[[.535,.500],[.66,.515],[.665,.705],[.535,.690]] as const,fill:'rgba(47,52,57,.27)'}
  ];
  for(const c of courts) poly(ctx,W,H,c.pts,c.fill,'rgba(148,163,184,.07)');
  // Service strips and cable trenches make the floor read as occupied infrastructure.
  ctx.strokeStyle='rgba(59,130,246,.10)';ctx.lineWidth=2;
  for(const [x1,y1,x2,y2] of [[.35,.34,.45,.34],[.55,.34,.65,.34],[.35,.73,.45,.73],[.55,.73,.65,.73]] as const){ctx.beginPath();ctx.moveTo(W*x1,H*y1);ctx.lineTo(W*x2,H*y2);ctx.stroke();}
  ctx.fillStyle='rgba(10,15,20,.50)';
  for(const [x,y] of [[.385,.345],[.595,.345],[.385,.735],[.595,.735]] as const){for(let i=0;i<5;i++)ctx.fillRect(W*x+i*5,H*y,2,9);}
}

function drawPortalLanguage(ctx:CanvasRenderingContext2D,W:number,H:number,controlColor:string){
  // EXACTLY aligned to the already validated physical perimeter/gap geometry.
  for(const x of [.325,.657]){
    const px=W*x;
    for(const [yr,hr] of [[.06,.30],[.46,.16],[.72,.22]] as const){const py=H*yr,ph=H*hr;ctx.fillStyle='rgba(0,0,0,.38)';ctx.fillRect(px+7,py+7,17,ph);ctx.fillStyle='#30363b';ctx.fillRect(px,py,17,ph);ctx.fillStyle=alpha(controlColor,.17);ctx.fillRect(px,py,3,ph);ctx.fillStyle='rgba(226,232,240,.11)';for(let y=py+18;y<py+ph;y+=44)ctx.fillRect(px+3,y,11,2);}
    for(const gateY of [.41,.67]){const gy=H*gateY;ctx.strokeStyle=alpha(controlColor,.55);ctx.lineWidth=2;ctx.strokeRect(px-5,gy-18,27,36);ctx.fillStyle='rgba(8,13,18,.55)';ctx.fillRect(px+2,gy-8,13,16);ctx.fillStyle=alpha(controlColor,.42);ctx.fillRect(px+5,gy-4,7,3);}
  }
}

function drawCheckpointHierarchy(ctx:CanvasRenderingContext2D,W:number,H:number,controlColor:string){
  // Same traversable corridor as 1.0, but each checkpoint gets a role instead of three identical bars.
  const rows=[{y:.78,label:'ENTRADA'},{y:.54,label:'PÁTIO'},{y:.31,label:'NÚCLEO'}] as const;
  for(const [idx,row] of rows.entries()){
    for(const [x,w] of [[.34,.11],[.55,.11]] as const){const bx=W*x,by=H*row.y,bw=W*w;ctx.fillStyle='rgba(0,0,0,.38)';ctx.fillRect(bx+5,by+7,bw,15);ctx.fillStyle=idx===0?'#3b4147':idx===1?'#333b43':'#2d343b';ctx.fillRect(bx,by,bw,15);ctx.fillStyle='rgba(226,232,240,.20)';ctx.fillRect(bx,by,bw,2);ctx.fillStyle=alpha(controlColor,.38+idx*.07);for(let xx=bx+9;xx<bx+bw-5;xx+=22)ctx.fillRect(xx,by+6,6,3);}
    if(idx>0){ctx.fillStyle='rgba(148,163,184,.11)';ctx.fillRect(W*.47,H*(row.y-.010),W*.06,2);}
  }
}

function drawCommandApron(ctx:CanvasRenderingContext2D,W:number,H:number,controlColor:string,reserved:readonly ReservedFootprint[]){
  // Surface-only command apron centered on QG Central; reserved footprint stays untouched.
  const qx=W*.36,qy=H*.075,qw=W*.28,qh=150;
  ctx.fillStyle='rgba(25,31,37,.34)';ctx.beginPath();ctx.roundRect(qx,qy,qw,qh,10);ctx.fill();ctx.strokeStyle='rgba(148,163,184,.11)';ctx.stroke();
  ctx.fillStyle=alpha(controlColor,.10);ctx.beginPath();ctx.roundRect(W*.445,H*.205,W*.11,18,5);ctx.fill();
  ctx.strokeStyle=alpha(controlColor,.24);ctx.lineWidth=1;for(let x=.385;x<=.615;x+=.046){ctx.beginPath();ctx.moveTo(W*x,H*.235);ctx.lineTo(W*x,H*.255);ctx.stroke();}
  // Two command light wells create an authored visual focal point without adding colliders.
  for(const x of [.415,.585]){const g=ctx.createRadialGradient(W*x,H*.245,2,W*x,H*.245,48);g.addColorStop(0,alpha(controlColor,.12));g.addColorStop(1,alpha(controlColor,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(W*x,H*.245,48,0,Math.PI*2);ctx.fill();}
  void reserved;
}


function drawSectorIdentity(ctx:CanvasRenderingContext2D,W:number,H:number,controlColor:string){
  // Asymmetric material/function cues prevent the command complex from reading as a mirrored blueprint.
  poly(ctx,W,H,[[.335,.35],[.455,.34],[.465,.48],[.345,.49]],'rgba(38,54,64,.20)','rgba(96,165,250,.08)');
  poly(ctx,W,H,[[.545,.35],[.665,.36],[.655,.48],[.535,.47]],'rgba(49,45,56,.19)','rgba(168,85,247,.06)');
  poly(ctx,W,H,[[.34,.745],[.465,.735],[.47,.88],[.345,.90]],'rgba(55,50,43,.18)','rgba(245,158,11,.055)');
  poly(ctx,W,H,[[.535,.735],[.66,.745],[.655,.90],[.53,.88]],'rgba(37,52,48,.18)','rgba(34,197,94,.055)');
  // Operations service racks west; comms trunk east; logistics apron lower center.
  for(const [x,y,w] of [[.355,.405,.066],[.355,.445,.052],[.575,.405,.054],[.585,.445,.040]] as const){
    ctx.fillStyle='rgba(13,20,26,.42)';ctx.fillRect(W*x,H*y,W*w,8);ctx.strokeStyle='rgba(148,163,184,.12)';ctx.strokeRect(W*x,H*y,W*w,8);
  }
  ctx.strokeStyle=alpha(controlColor,.16);ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(W*.604,H*.365);ctx.lineTo(W*.604,H*.475);ctx.stroke();
  for(const y of [.385,.415,.445]){ctx.beginPath();ctx.moveTo(W*.595,H*y);ctx.lineTo(W*.614,H*y);ctx.stroke();}
  ctx.fillStyle='rgba(148,163,184,.055)';
  for(const [x,y,w,h] of [[.425,.79,.06,.055],[.515,.80,.055,.050]] as const){ctx.beginPath();ctx.roundRect(W*x,H*y,W*w,H*h,4);ctx.fill();}
}

function drawSecurityMicrodetail(ctx:CanvasRenderingContext2D,W:number,H:number,controlColor:string){
  // Cameras, cabinets and floor service nodes add scale around the edges without blocking traversal.
  for(const [x,y,side] of [[.355,.185,-1],[.645,.195,1],[.355,.585,-1],[.645,.595,1]] as const){const px=W*x,py=H*y;ctx.strokeStyle='#65717a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+side*10,py-8);ctx.stroke();ctx.fillStyle='#1b242b';ctx.fillRect(px+side*13-4,py-12,8,6);ctx.fillStyle=alpha(controlColor,.55);ctx.fillRect(px+side*13-2,py-10,3,2);}
  for(const [x,y] of [[.375,.405],[.625,.405],[.375,.815],[.625,.815]] as const){ctx.fillStyle='#1b242b';ctx.fillRect(W*x,H*y,12,8);ctx.strokeStyle='rgba(148,163,184,.26)';ctx.strokeRect(W*x,H*y,12,8);ctx.fillStyle=alpha(controlColor,.48);ctx.fillRect(W*x+3,H*y+2,3,2);}
}

export function drawT6ReauthoredSurface(ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[],reserved:readonly ReservedFootprint[],controlColor:string){
  ctx.save();
  drawAxialComplex(ctx,W,H,paths);
  drawFunctionalCourts(ctx,W,H);
  drawSectorIdentity(ctx,W,H,controlColor);
  drawCommandApron(ctx,W,H,controlColor,reserved);
  drawPortalLanguage(ctx,W,H,controlColor);
  drawCheckpointHierarchy(ctx,W,H,controlColor);
  drawSecurityMicrodetail(ctx,W,H,controlColor);
  ctx.restore();
}
