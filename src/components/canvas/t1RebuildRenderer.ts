import type { TacticalBuilding } from './favelaRenderer';

const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string,width=1)=>{
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const poly=(ctx:CanvasRenderingContext2D,pts:Array<[number,number]>,fill:string,stroke?:string)=>{
  if(!pts.length)return;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
};
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const bush=(ctx:CanvasRenderingContext2D,x:number,y:number,s:number)=>{
  ctx.fillStyle='rgba(8,18,13,.24)';ctx.beginPath();ctx.ellipse(x+3,y+s*.52,s*1.05,s*.36,-.08,0,Math.PI*2);ctx.fill();
  line(ctx,x,y+s*.35,x-1,y-s*.25,'#514a32',Math.max(1.5,s*.10));
  const dots:[[number,number,number,number],...Array<[number,number,number,number]>]=[[0,0,1,.72],[-.52,.10,.72,.56],[.48,.06,.78,.52],[-.18,-.38,.66,.48],[.22,-.31,.60,.44]];
  for(const [dx,dy,rx,ry] of dots){ctx.fillStyle=dy<0?'#4d7043':'#365c3c';ctx.beginPath();ctx.ellipse(x+dx*s,y+dy*s,s*rx,s*ry,dx*.18,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='rgba(184,201,125,.18)';ctx.beginPath();ctx.ellipse(x-s*.18,y-s*.30,s*.44,s*.22,-.2,0,Math.PI*2);ctx.fill();
};
const palm=(ctx:CanvasRenderingContext2D,x:number,y:number,s:number)=>{
  ctx.strokeStyle='#4c422d';ctx.lineWidth=Math.max(2,s*.12);ctx.beginPath();ctx.moveTo(x,y+s*.7);ctx.quadraticCurveTo(x+s*.05,y,x-s*.04,y-s*.55);ctx.stroke();
  ctx.strokeStyle='#446b3f';ctx.lineWidth=Math.max(2,s*.09);
  for(const a of [-2.7,-2.15,-1.55,-.95,-.35,.25]){ctx.beginPath();ctx.moveTo(x-s*.04,y-s*.55);ctx.lineTo(x+Math.cos(a)*s*.68,y-s*.55+Math.sin(a)*s*.32);ctx.stroke();}
};
const roofY=(b:TacticalBuilding)=>b.y-(b.type==='laje'?34:28);
const find=(buildings:readonly TacticalBuilding[],id:string)=>buildings.find(b=>b.id===id);

const pole=(ctx:CanvasRenderingContext2D,x:number,y:number,s=1)=>{
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x+5,y+5,9*s,3*s,-.2,0,Math.PI*2);ctx.fill();
  line(ctx,x,y,x-2,y-31*s,'#4c463d',3*s);line(ctx,x-9*s,y-27*s,x+6*s,y-29*s,'#5d5549',2*s);
  ctx.fillStyle='#d9b96c';ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(x+4*s,y-27*s,2.2*s,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
};
const deterministic=(i:number)=>{const x=Math.sin(i*91.733+17.11)*43758.5453;return x-Math.floor(x);};

/** 1.2A: visual-only terrain/topography rebuild. No collision or gameplay geometry is changed. */
export function drawT1RebuildFoundation(
  ctx:CanvasRenderingContext2D,width:number,height:number,territoryId:number,
  buildings:readonly TacticalBuilding[],controlColor:string
){
  if(territoryId!==1)return;
  ctx.save();

  const grade=ctx.createLinearGradient(0,0,0,height);
  grade.addColorStop(0,'rgba(64,86,55,.18)');grade.addColorStop(.48,'rgba(104,82,57,.05)');grade.addColorStop(1,'rgba(37,56,46,.17)');
  ctx.fillStyle=grade;ctx.fillRect(0,0,width,height);

  // Distant hillside band lives mostly outside the playable world, adding city depth without fake obstacles.
  const ridgeXs=[-18,42,108,184,1010,1082,1154,1222];
  for(let i=0;i<ridgeXs.length;i++){
    const x=ridgeXs[i], rw=54+(i%3)*9, rh=34+(i%4)*7;
    ctx.fillStyle=i%2?'rgba(84,75,65,.34)':'rgba(66,78,70,.32)';ctx.fillRect(x,-8,rw,rh);
    ctx.fillStyle='rgba(31,35,34,.30)';ctx.fillRect(x+8,rh-22,10,8);ctx.fillRect(x+rw-19,rh-18,9,7);
    ctx.strokeStyle='rgba(190,168,132,.12)';ctx.strokeRect(x,-8,rw,rh);
  }

  poly(ctx,[[0,height*.05],[width*.29,height*.04],[width*.27,height*.27],[0,height*.34]],'rgba(48,72,48,.34)','rgba(139,111,78,.18)');
  poly(ctx,[[width*.71,height*.05],[width,height*.03],[width,height*.35],[width*.74,height*.29]],'rgba(51,73,50,.31)','rgba(139,111,78,.18)');
  poly(ctx,[[0,height*.60],[width*.25,height*.55],[width*.27,height*.83],[0,height*.88]],'rgba(82,69,48,.21)','rgba(142,110,75,.16)');

  const wallBands=[[0,height*.325,width*.245,height*.292],[width*.755,height*.302,width,height*.337],[0,height*.585,width*.235,height*.55],[width*.765,height*.605,width,height*.565]] as const;
  for(const [x1,y1,x2,y2] of wallBands){
    line(ctx,x1,y1,x2,y2,'rgba(41,34,29,.48)',8);line(ctx,x1,y1-2,x2,y2-2,'rgba(177,146,107,.30)',2);
    for(let i=0;i<8;i++){const t=(i+.4)/8;const x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;line(ctx,x,y-3,x+7,y+4,'rgba(33,29,26,.24)',1);}
  }

  // Narrow stair flights cut through the terraces and sell the hillside elevation.
  for(const [sx,sy,dir] of [[width*.235,height*.305,1],[width*.765,height*.322,-1],[width*.225,height*.568,1]] as const){
    ctx.save();ctx.translate(sx,sy);ctx.rotate(dir*.10);for(let i=0;i<6;i++){ctx.fillStyle=i%2?'rgba(86,76,64,.72)':'rgba(108,94,76,.66)';ctx.fillRect(dir*i*5,-i*3,26,4);}ctx.restore();
  }

  const road=(points:Array<[number,number]>,outer:number,inner:number)=>{
    const path=()=>{ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++){const [px,py]=points[i-1],[x,y]=points[i];const mx=(px+x)/2,my=(py+y)/2;ctx.quadraticCurveTo(px,py,mx,my);}const last=points[points.length-1];ctx.lineTo(last[0],last[1]);};
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(46,47,43,.48)';ctx.lineWidth=outer;path();ctx.stroke();
    ctx.strokeStyle='rgba(105,96,82,.34)';ctx.lineWidth=inner;path();ctx.stroke();ctx.strokeStyle='rgba(204,178,137,.11)';ctx.lineWidth=1.5;path();ctx.stroke();
  };
  road([[width*.50,height*1.02],[width*.50,height*.82],[width*.485,height*.63],[width*.51,height*.45],[width*.49,height*.26],[width*.50,-18]],82,60);
  road([[width*.49,height*.69],[width*.38,height*.66],[width*.27,height*.65],[width*.16,height*.69]],30,19);
  road([[width*.51,height*.65],[width*.62,height*.63],[width*.73,height*.65],[width*.84,height*.70]],30,19);
  road([[width*.49,height*.45],[width*.38,height*.41],[width*.27,height*.40],[width*.15,height*.46]],27,17);
  road([[width*.51,height*.41],[width*.62,height*.38],[width*.72,height*.39],[width*.84,height*.43]],27,17);
  road([[width*.49,height*.245],[width*.38,height*.205],[width*.29,height*.18],[width*.19,height*.16]],23,14);
  road([[width*.51,height*.235],[width*.61,height*.205],[width*.70,height*.18],[width*.80,height*.15]],23,14);

  for(const sx of [-1,1]){const x=width*.50+sx*42;line(ctx,x,height*.94,x+sx*4,height*.73,'rgba(28,34,32,.45)',3);line(ctx,x+sx*2,height*.70,x-sx*7,height*.48,'rgba(28,34,32,.34)',2);}
  for(const y of [height*.31,height*.52,height*.75]){ctx.fillStyle='rgba(118,92,62,.16)';ctx.beginPath();ctx.ellipse(width*.50,y,48,10,-.04,0,Math.PI*2);ctx.fill();}

  // Cached deterministic wear: patched concrete, moisture and small cracks unify the ground.
  for(let i=0;i<52;i++){
    const x=35+deterministic(i)* (width-70), y=46+deterministic(i+101)*(height-92);
    const rx=4+deterministic(i+203)*15, ry=2+deterministic(i+307)*6;
    ctx.fillStyle=i%3===0?'rgba(38,54,45,.10)':'rgba(126,101,72,.075)';ctx.beginPath();ctx.ellipse(x,y,rx,ry,deterministic(i+401)*.8-.4,0,Math.PI*2);ctx.fill();
    if(i%4===0){line(ctx,x-rx*.5,y,x+rx*.45,y+(i%2?3:-3),'rgba(32,35,32,.13)',1);}
  }

  const greens:Array<[number,number,number]>=[
    [.025,.18,12],[.06,.24,15],[.02,.37,14],[.09,.55,13],[.03,.68,16],[.12,.88,13],
    [.965,.16,14],[.92,.25,12],[.98,.39,16],[.91,.54,14],[.97,.70,15],[.89,.87,13],
    [.29,.08,9],[.71,.08,10],[.31,.88,8],[.69,.86,9]
  ];
  for(const [nx,ny,s] of greens)bush(ctx,width*nx,height*ny,s);
  palm(ctx,width*.15,height*.29,22);palm(ctx,width*.89,height*.31,20);palm(ctx,width*.11,height*.61,19);

  // Utility infrastructure follows the alleys and creates vertical rhythm between the houses.
  const poles:Array<[number,number,number]>=[[.31,.29,.9],[.70,.29,.95],[.34,.57,.9],[.69,.58,.9],[.24,.80,.8],[.78,.79,.8]];
  for(const [nx,ny,ps] of poles)pole(ctx,width*nx,height*ny,ps);
  ctx.strokeStyle='rgba(35,38,36,.25)';ctx.lineWidth=1;
  const cable=(a:[number,number],b:[number,number],dip:number)=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2+dip,b[0],b[1]);ctx.stroke();};
  cable([width*.31,height*.29-26],[width*.70,height*.29-28],18);cable([width*.34,height*.57-26],[width*.69,height*.58-26],20);cable([width*.24,height*.80-23],[width*.78,height*.79-23],24);

  for(const b of buildings){
    ctx.fillStyle=b.isRivalHub?'rgba(77,69,60,.20)':'rgba(91,80,67,.17)';ctx.beginPath();ctx.roundRect(b.x-10,b.y+b.h-10,b.w+20,24,6);ctx.fill();
    ctx.strokeStyle='rgba(188,164,128,.13)';ctx.stroke();
  }

  const boca=find(buildings,'boca_leste');
  if(boca){ctx.fillStyle='rgba(249,115,22,.08)';ctx.beginPath();ctx.ellipse(boca.x+boca.w*.4,boca.y+boca.h+18,86,24,-.08,0,Math.PI*2);ctx.fill();}
  const mirante=find(buildings,'mirante');
  if(mirante){line(ctx,mirante.x-28,mirante.y+mirante.h+20,mirante.x+mirante.w+28,mirante.y+mirante.h+20,'rgba(210,188,150,.22)',4);}

  ctx.fillStyle=controlColor;ctx.globalAlpha=.10;ctx.fillRect(width*.448,height*.905,width*.104,3);ctx.globalAlpha=1;
  ctx.fillStyle='rgba(23,29,27,.38)';ctx.fillRect(-18,height-18,width*.20,28);ctx.fillRect(width*.82,height-16,width*.20,26);
  ctx.fillStyle='rgba(126,102,71,.14)';ctx.fillRect(0,height-19,width*.18,3);ctx.fillRect(width*.84,height-17,width*.16,3);
  ctx.restore();
}

/** 1.2B: id-specific architecture finish applied to real tactical buildings only. */
export function drawT1RebuildBuildingFinish(
  ctx:CanvasRenderingContext2D,b:TacticalBuilding,time:number,controlColor:string,renderZoom=1
){
  const rY=roofY(b), detail=renderZoom>=.82, close=renderZoom>=1.18;
  ctx.save();
  const parapet=(h=5)=>{ctx.fillStyle='#5e584f';ctx.fillRect(b.x-2,rY-4,b.w+4,h);ctx.fillStyle='rgba(231,220,198,.16)';ctx.fillRect(b.x,rY-3,b.w,1);};
  const lamp=(x:number,y:number)=>{const p=.78+.16*Math.sin(time*.004+b.x);ctx.fillStyle=controlColor;ctx.globalAlpha=.14*p;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#f5d98c';ctx.fillRect(x-1,y-1,3,3);};

  if(b.id==='beco_01'){
    parapet(4);rect(ctx,b.x+9,rY+8,28,16,'#6a5847','#2c3134');line(ctx,b.x+12,rY+2,b.x+12,rY-14,'#596269',2);line(ctx,b.x+12,rY-12,b.x+28,rY-16,'rgba(173,191,194,.55)',1);
    if(detail)line(ctx,b.x+42,rY+17,b.x+b.w-10,rY+8,'rgba(221,213,198,.36)',1);
  }else if(b.id==='laje_ponto'){
    parapet(7);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(b.x+18,rY-15,b.w*.46,23);ctx.fillStyle='#4b443b';ctx.fillRect(b.x+14,rY-19,b.w*.46,23);ctx.fillStyle='#403c36';ctx.fillRect(b.x+10,rY+7,b.w*.38,20);for(const x of [b.x+8,b.x+18,b.x+b.w-16])line(ctx,x,rY-3,x,rY-18,'#5f574e',2);ctx.fillStyle='rgba(177,126,64,.20)';ctx.fillRect(b.x+6,rY+b.h-13,b.w-12,7);
  }else if(b.id==='barraquinha'){
    ctx.fillStyle='#7a3f2e';ctx.beginPath();ctx.moveTo(b.x-9,rY+19);ctx.lineTo(b.x+b.w+9,rY+15);ctx.lineTo(b.x+b.w+4,rY+26);ctx.lineTo(b.x-5,rY+29);ctx.closePath();ctx.fill();ctx.strokeStyle='#d6a45f';ctx.stroke();
    if(detail){ctx.fillStyle='#ead8b8';ctx.font='900 7px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText('BAR DO BECO',b.x+b.w/2,rY+24);}
  }else if(b.id==='esconderijo'){
    parapet(8);rect(ctx,b.x+b.w*.47,rY-15,b.w*.39,24,'#2c3438','#68747a');rect(ctx,b.x+b.w*.50,rY+7,b.w*.36,22,'#323b40','#667078');rect(ctx,b.x+10,rY+b.h-16,32,8,'#242b2f','#4b555c');line(ctx,b.x+b.w*.68,rY+7,b.x+b.w*.68,rY-19,'#59656a',2);lamp(b.x+14,rY+b.h+2);
    if(close){for(let x=b.x+8;x<b.x+b.w-8;x+=12)line(ctx,x,rY+4,x+7,rY+11,'rgba(178,191,194,.24)',1);}
  }else if(b.id==='boca_leste'){
    parapet(9);ctx.fillStyle='rgba(0,0,0,.30)';ctx.fillRect(b.x+24,rY-19,b.w-38,25);ctx.fillStyle='#743f30';ctx.fillRect(b.x+20,rY-23,b.w-38,25);ctx.fillStyle='#5c392d';ctx.fillRect(b.x+8,rY+7,b.w-16,18);ctx.fillStyle='#1c2224';ctx.fillRect(b.x+16,rY+10,b.w-32,10);ctx.strokeStyle=controlColor;ctx.strokeRect(b.x+16,rY+10,b.w-32,10);
    if(detail){ctx.fillStyle='#f0dfc7';ctx.font='900 8px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText('BOCA DA LESTE',b.x+b.w/2,rY+17);}
    ctx.fillStyle='#7d4d34';ctx.beginPath();ctx.moveTo(b.x-13,rY+b.h-11);ctx.lineTo(b.x+b.w+8,rY+b.h-14);ctx.lineTo(b.x+b.w+5,rY+b.h-5);ctx.lineTo(b.x-10,rY+b.h-2);ctx.closePath();ctx.fill();lamp(b.x+b.w-12,rY+27);
  }else if(b.id==='torre_guarda'){
    parapet(5);const cx=b.x+b.w/2;rect(ctx,cx-19,rY-16,38,24,'#3b454a','#859098');rect(ctx,cx-14,rY-11,28,8,'#141b1e');line(ctx,cx,rY-16,cx,rY-39,'#68767d',2);line(ctx,cx-10,rY-30,cx+10,rY-34,'rgba(180,196,200,.55)',1);
  }else if(b.id==='mirante'){
    parapet(6);ctx.fillStyle='#4d5c57';ctx.fillRect(b.x+b.w*.16,rY-11,b.w*.34,16);for(const x of [b.x+8,b.x+b.w-10])line(ctx,x,rY+2,x,rY-13,'#69736f',2);line(ctx,b.x+8,rY-12,b.x+b.w-10,rY-12,'rgba(190,203,193,.55)',2);rect(ctx,b.x+b.w*.58,rY+8,b.w*.24,13,'#4e5a55','#82918b');
    if(detail){ctx.fillStyle='rgba(225,216,197,.55)';ctx.font='800 6px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText('MIRANTE',b.x+b.w/2,rY+b.h-8);}
  }

  ctx.strokeStyle='rgba(236,220,193,.11)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(b.x+5,rY+4);ctx.lineTo(b.x+b.w-6,rY+4);ctx.stroke();ctx.restore();
}
