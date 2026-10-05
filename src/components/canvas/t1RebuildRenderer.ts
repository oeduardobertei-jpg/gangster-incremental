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


const backdropHouse=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,seed:number)=>{
  const roofs=['#625448','#76513f','#4f5b58','#6a5f50','#7b4936'];
  const walls=['#544a40','#6d4b3b','#48524f','#5d5549','#6a4537'];
  const roof=roofs[seed%roofs.length],wall=walls[(seed*3)%walls.length];
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(x+8,y+10,w,h);
  ctx.fillStyle=wall;ctx.fillRect(x,y+h*.58,w,h*.42);
  ctx.fillStyle=roof;ctx.fillRect(x,y,w,h*.68);
  ctx.fillStyle='rgba(255,255,255,.045)';ctx.fillRect(x+2,y+2,w-4,2);
  ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(x+w-6,y+4,6,h-4);
  ctx.strokeStyle='rgba(204,187,160,.14)';ctx.strokeRect(x,y,w,h);
  const windows=Math.max(1,Math.floor(w/24));
  for(let i=0;i<windows;i++){
    const wx=x+8+i*(w-16)/Math.max(1,windows-1)-3;
    ctx.fillStyle=(seed+i)%4===0?'rgba(234,190,105,.55)':'rgba(18,28,31,.78)';ctx.fillRect(wx,y+h*.72,7,6);
  }
  if(seed%3===0){
    const tw=Math.max(18,w*.42),tx=x+(seed%2?6:w-tw-6),ty=y-12;
    ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(tx+4,ty+5,tw,16);
    ctx.fillStyle=seed%2?'#4b5450':'#655044';ctx.fillRect(tx,ty,tw,16);
    ctx.strokeStyle='rgba(198,187,168,.13)';ctx.strokeRect(tx,ty,tw,16);
  }
  if(seed%4===0){
    const tx=x+w*.72,ty=y-7;ctx.fillStyle='#26363b';ctx.fillRect(tx-5,ty,10,9);ctx.fillStyle='#4d6870';ctx.beginPath();ctx.ellipse(tx,ty,5,2,0,0,Math.PI*2);ctx.fill();
  }
};

const drawT1BackdropCity=(ctx:CanvasRenderingContext2D,width:number,height:number)=>{
  ctx.save();ctx.globalAlpha=.72;
  // Two terraced rows above the playable edge. They are background only and remain behind real solids.
  for(let row=0;row<2;row++){
    let x=-28+(row?24:0),i=0;
    while(x<width+24){
      const seed=row*41+i*7+3,w=48+(seed%4)*10,h=30+(seed%3)*7;
      const y=-30+row*38+((i%3)-1)*5;
      backdropHouse(ctx,x,y,w,h,seed);x+=w+6+(seed%3)*3;i++;
    }
  }
  // Side escarpments keep the neighborhood visually continuous while staying mostly outside traversal space.
  const ys=[.18,.31,.46,.61,.76,.90];
  ys.forEach((ny,i)=>{
    const h=34+(i%3)*7,w=58+(i%2)*10;
    backdropHouse(ctx,-30+(i%2)*8,height*ny-h*.5,w,h,101+i*9);
    backdropHouse(ctx,width-w+28-(i%2)*9,height*ny-h*.5,w,h,151+i*11);
  });
  // Partial roofs at the southern edge imply another descending tier below the command area.
  for(let i=0;i<8;i++){
    const w=54+(i%3)*9,h=32+(i%2)*6,x=-12+i*(width+20)/7-w*.25;
    backdropHouse(ctx,x,height-10,w,h,201+i*13);
  }
  ctx.restore();
};

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
  drawT1BackdropCity(ctx,width,height);

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

/** 1.2B: vertical architecture built above real physical footprints only. */
export function drawT1RebuildBuildingFinish(
  ctx:CanvasRenderingContext2D,b:TacticalBuilding,time:number,controlColor:string,renderZoom=1
){
  const rY=roofY(b), detail=renderZoom>=.82, close=renderZoom>=1.18;
  ctx.save();

  const slab=(x:number,y:number,w:number,depth=5,color='#665d52')=>{
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x+5,y+5,w,depth+2);
    ctx.fillStyle=color;ctx.fillRect(x,y,w,depth);ctx.fillStyle='rgba(232,220,198,.16)';ctx.fillRect(x+2,y+1,w-4,1);
  };
  const floor=(x:number,y:number,w:number,h:number,wall:string,edge:string,windowColor='#17222a')=>{
    ctx.fillStyle='rgba(0,0,0,.30)';ctx.fillRect(x+6,y+7,w,h);
    ctx.fillStyle=wall;ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(255,255,255,.055)';ctx.fillRect(x+2,y+2,w-4,2);
    ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(x+w-6,y+3,6,h-3);ctx.strokeStyle=edge;ctx.strokeRect(x,y,w,h);
    const count=w>64?3:2;for(let i=0;i<count;i++){const wx=x+9+i*(w-18)/Math.max(1,count-1)-5;ctx.fillStyle=windowColor;ctx.fillRect(wx,y+h*.42,10,8);ctx.strokeStyle='rgba(169,184,184,.28)';ctx.strokeRect(wx,y+h*.42,10,8);}
    slab(x-2,y-4,w+4,5,edge);
  };
  const waterTank=(x:number,y:number,s=1)=>{
    ctx.fillStyle='rgba(0,0,0,.27)';ctx.beginPath();ctx.ellipse(x+4,y+12,11*s,4*s,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#26343a';ctx.fillRect(x-8*s,y,16*s,13*s);ctx.fillStyle='#3e555b';ctx.beginPath();ctx.ellipse(x,y,8*s,3*s,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(171,190,193,.35)';ctx.beginPath();ctx.ellipse(x,y,8*s,3*s,0,0,Math.PI*2);ctx.stroke();
  };
  const rebar=(x:number,y:number,count=3)=>{for(let i=0;i<count;i++){const xx=x+i*9;line(ctx,xx,y,xx,y-19-(i%2)*3,'#5b554d',2);line(ctx,xx,y-13,xx+6,y-8,'rgba(96,84,69,.55)',1);}};
  const balcony=(x:number,y:number,w:number)=>{ctx.fillStyle='#48443e';ctx.fillRect(x,y,w,4);ctx.strokeStyle='rgba(178,183,177,.34)';ctx.lineWidth=1;for(let xx=x+3;xx<x+w-2;xx+=8)line(ctx,xx,y-8,xx,y,'rgba(178,183,177,.34)',1);line(ctx,x,y-8,x+w,y-8,'rgba(178,183,177,.34)',1);};
  const lamp=(x:number,y:number)=>{const pulse=.82+.12*Math.sin(time*.004+b.x);const g=ctx.createRadialGradient(x,y,1,x,y,25);g.addColorStop(0,`rgba(250,204,94,${.12*pulse})`);g.addColorStop(1,'rgba(250,204,94,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f2d27d';ctx.fillRect(x-2,y-2,4,3);};
  const factionBand=(x:number,y:number,w:number)=>{ctx.fillStyle=controlColor;ctx.globalAlpha=.55;ctx.fillRect(x,y,w,2);ctx.globalAlpha=1;};
  const antenna=(x:number,y:number,h=28)=>{line(ctx,x,y,x,y-h,'#68747a',2);line(ctx,x-9,y-h+7,x+9,y-h+3,'rgba(186,202,203,.50)',1);line(ctx,x-5,y-h+15,x+7,y-h+13,'rgba(186,202,203,.36)',1);};

  if(b.id==='beco_01'){
    const x=b.x+8,y=rY-25,w=b.w*.48,h=25;
    floor(x,y,w,h,'#725342','#4a4037');slab(b.x-3,rY-5,b.w+6,6);
    waterTank(b.x+b.w-19,y-8,.82);rebar(b.x+b.w*.56,rY-2,2);
    if(detail){line(ctx,x+6,y+8,b.x+b.w-10,y+1,'rgba(218,208,190,.30)',1);}
  }else if(b.id==='laje_ponto'){
    const x=b.x+10,w=b.w*.68,h=29,y=rY-h+1;
    floor(x,y,w,h,'#514a40','#756b5d');
    const x2=x+w*.32,w2=w*.58,h2=22,y2=y-h2+2;floor(x2,y2,w2,h2,'#4a514d','#727b72');
    balcony(x-4,y+h-4,w*.72);rebar(x+w+6,y+5,3);waterTank(x2+w2-12,y2-9,.75);factionBand(x+8,y+h-8,w*.38);
    if(detail){ctx.fillStyle='rgba(202,176,126,.18)';ctx.fillRect(x+5,y+6,w-10,3);}
  }else if(b.id==='barraquinha'){
    const aw=b.w+28,ax=b.x-14,ay=rY+13;
    ctx.fillStyle='rgba(0,0,0,.26)';poly(ctx,[[ax+5,ay+7],[ax+aw+5,ay+3],[ax+aw-2,ay+18],[ax+3,ay+22]],'rgba(0,0,0,.24)');
    poly(ctx,[[ax,ay],[ax+aw,ay-4],[ax+aw-6,ay+12],[ax+5,ay+16]],'#874832','#d3a35c');
    for(let i=0;i<5;i++){ctx.fillStyle=i%2?'rgba(236,198,130,.34)':'rgba(104,49,39,.34)';ctx.fillRect(ax+8+i*(aw-16)/5,ay+3,(aw-16)/5,4);}
    if(detail){ctx.fillStyle='#ead9bb';ctx.font='900 7px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText('BAR DO BECO',b.x+b.w/2,ay+9);}
    rect(ctx,b.x+b.w-23,rY-7,17,13,'#5c5b50','#838379');
  }else if(b.id==='esconderijo'){
    const x=b.x+7,w=b.w*.76,h=31,y=rY-h+2;floor(x,y,w,h,'#394246','#647079');
    const x2=b.x+b.w*.42,w2=b.w*.48,h2=24,y2=y-h2+3;floor(x2,y2,w2,h2,'#303a3e','#66757a');
    balcony(x+w*.05,y+h-2,w*.46);waterTank(x2+w2-13,y2-10,.82);antenna(x2+w2*.58,y2,30);
    rect(ctx,b.x+9,rY+b.h-17,34,9,'#20282c','#4c585d');factionBand(x+7,y+h-7,w*.28);lamp(b.x+15,rY+b.h+2);
  }else if(b.id==='boca_leste'){
    const x=b.x+4,w=b.w*.86,h=35,y=rY-h+3;floor(x,y,w,h,'#7a4433','#9d6249','#211d1b');
    const x2=b.x+b.w*.31,w2=b.w*.57,h2=25,y2=y-h2+4;floor(x2,y2,w2,h2,'#694033','#925c49','#181c1d');
    balcony(x+5,y+h-2,w*.64);waterTank(x2+w2-14,y2-9,.86);antenna(x2+11,y2,25);factionBand(x+8,y+h-8,w*.42);
    const signX=b.x+15,signY=rY+10,signW=b.w-30;ctx.fillStyle='#171c1e';ctx.fillRect(signX,signY,signW,13);ctx.strokeStyle=controlColor;ctx.strokeRect(signX,signY,signW,13);
    if(detail){ctx.fillStyle='#f0dfc7';ctx.font='900 8px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText('BOCA DA LESTE',b.x+b.w/2,signY+7.5);}
    poly(ctx,[[b.x-14,rY+b.h-12],[b.x+b.w+10,rY+b.h-15],[b.x+b.w+6,rY+b.h-3],[b.x-9,rY+b.h]],'#824d35','#a76d48');lamp(b.x+b.w-13,rY+26);
  }else if(b.id==='torre_guarda'){
    const cx=b.x+b.w/2;
    ctx.fillStyle='rgba(0,0,0,.26)';ctx.fillRect(cx-24,rY-51,52,58);
    for(const sx of [-18,18]){line(ctx,cx+sx,rY+7,cx+sx*.72,rY-44,'#4d5557',4);line(ctx,cx+sx,rY-7,cx-sx*.4,rY-28,'rgba(125,139,141,.46)',2);}
    floor(cx-24,rY-57,48,22,'#3d484c','#879398','#11191d');
    balcony(cx-28,rY-35,56);antenna(cx,rY-57,34);factionBand(cx-18,rY-39,36);
  }else if(b.id==='mirante'){
    const x=b.x+7,w=b.w*.78,h=25,y=rY-h+3;floor(x,y,w,h,'#52615a','#7f8e86','#17211f');
    const deckY=y-8;ctx.fillStyle='#5a5145';ctx.fillRect(b.x-8,deckY,b.w+16,6);ctx.strokeStyle='rgba(190,205,195,.48)';for(let xx=b.x-6;xx<b.x+b.w+6;xx+=10)line(ctx,xx,deckY-11,xx,deckY,'rgba(190,205,195,.48)',1);line(ctx,b.x-7,deckY-11,b.x+b.w+8,deckY-11,'rgba(190,205,195,.48)',2);
    rect(ctx,b.x+b.w*.57,y+5,b.w*.25,13,'#46534e','#7c8b84');antenna(b.x+b.w*.30,deckY,36);waterTank(b.x+b.w-14,y-8,.72);factionBand(x+5,y+h-7,w*.34);
    if(detail){ctx.fillStyle='rgba(235,224,202,.68)';ctx.font='800 6px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText('MIRANTE',b.x+b.w/2,y+h-5);}
  }

  if(close){ctx.strokeStyle='rgba(236,220,193,.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(b.x+5,rY+4);ctx.lineTo(b.x+b.w-6,rY+4);ctx.stroke();}
  ctx.restore();
}


/** 1.2C: physically-backed context houses gain varied skyline without changing footprints. */
type T1ContextFinishSpec={id:string;x:number;y:number;w:number;h:number;material:string};
type T1ContextFinishCacheEntry={canvas:HTMLCanvasElement;offsetX:number;offsetY:number};
const t1ContextFinishCache=new Map<string,T1ContextFinishCacheEntry>();

const drawT1RebuildContextFinishRaw=(
  ctx:CanvasRenderingContext2D,
  spec:T1ContextFinishSpec,
  renderZoom=1
)=>{
  const hash=Math.abs([...spec.id].reduce((a,c)=>((a*33)+c.charCodeAt(0))|0,17));
  const tier=hash%5;
  const roofLift=spec.material==='concrete'?34:28;
  const rY=spec.y-roofLift;
  const detail=renderZoom>=.82;
  const wallPalette=spec.material==='brick'
    ? ['#704737','#81503b','#654337']
    : spec.material==='metal'
      ? ['#46545a','#52636a','#39474d']
      : ['#60645f','#717169','#555b58'];
  const wall=wallPalette[hash%wallPalette.length],edge='rgba(193,184,165,.28)';
  const floor=(x:number,y:number,w:number,h:number)=>{
    ctx.fillStyle='rgba(0,0,0,.26)';ctx.fillRect(x+5,y+6,w,h);
    ctx.fillStyle=wall;ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(255,255,255,.055)';ctx.fillRect(x+2,y+2,w-4,2);
    ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(x+w-5,y+3,5,h-3);ctx.strokeStyle=edge;ctx.strokeRect(x,y,w,h);
    const n=w>=54?3:2;for(let i=0;i<n;i++){const wx=x+8+i*(w-16)/Math.max(1,n-1)-4;ctx.fillStyle=(hash+i)%4===0?'#d4ad65':'#1a2930';ctx.fillRect(wx,y+h*.45,8,7);}
    ctx.fillStyle='#62594f';ctx.fillRect(x-2,y-4,w+4,5);
  };
  const tank=(x:number,y:number)=>{ctx.fillStyle='#26363b';ctx.fillRect(x-6,y,12,11);ctx.fillStyle='#496069';ctx.beginPath();ctx.ellipse(x,y,6,2.5,0,0,Math.PI*2);ctx.fill();};
  const rebar=(x:number,y:number,n=2)=>{for(let i=0;i<n;i++){line(ctx,x+i*8,y,x+i*8,y-15-(i%2)*3,'#5f574d',1.5);}};

  ctx.save();
  if(tier===0){
    rebar(spec.x+10,rY+1,3);
    if(detail&&spec.w>48) line(ctx,spec.x+15,rY+12,spec.x+spec.w-10,rY+5,'rgba(215,204,184,.26)',1);
  }else if(tier===1){
    const w=Math.max(24,spec.w*.48),x=spec.x+(hash%2?7:spec.w-w-7),h=20,y=rY-h+2;floor(x,y,w,h);rebar(x+w+4,y+4,2);
  }else if(tier===2){
    const w=Math.max(30,spec.w*.64),x=spec.x+(hash%2?5:spec.w-w-5),h=25,y=rY-h+2;floor(x,y,w,h);tank(x+w-9,y-8);
    if(detail){line(ctx,x+5,y+h-4,x+w-5,y+h-4,'rgba(180,185,174,.30)',2);}
  }else if(tier===3){
    const w=Math.max(34,spec.w*.78),x=spec.x+(spec.w-w)/2,h=27,y=rY-h+2;floor(x,y,w,h);
    const w2=w*.46,x2=x+(hash%2?4:w-w2-4),h2=18,y2=y-h2+2;floor(x2,y2,w2,h2);tank(x2+w2-8,y2-7);
  }else{
    const w=Math.max(32,spec.w*.70),x=spec.x+(hash%2?4:spec.w-w-4),h=29,y=rY-h+2;floor(x,y,w,h);
    rebar(x+w*.12,y+2,3);tank(x+w-10,y-8);
    if(detail){for(let xx=x+5;xx<x+w-4;xx+=9)line(ctx,xx,y+h-11,xx,y+h-3,'rgba(205,195,176,.24)',1);}
  }
  if(detail&&hash%3===0){const lx=spec.x+spec.w*(.28+(hash%4)*.12),ly=rY+spec.h*.55;ctx.fillStyle='rgba(246,203,117,.58)';ctx.fillRect(lx,ly,2.5,2.5);}
  ctx.restore();
};

export function drawT1RebuildContextFinish(
  ctx:CanvasRenderingContext2D,
  spec:T1ContextFinishSpec,
  _time:number,
  renderZoom=1
){
  const detail=renderZoom>=.82?'detail':'low';
  const key=`${spec.id}:${Math.round(spec.w*10)}:${Math.round(spec.h*10)}:${spec.material}:${detail}`;
  if(typeof document==='undefined'){
    drawT1RebuildContextFinishRaw(ctx,spec,renderZoom);return;
  }
  let cached=t1ContextFinishCache.get(key);
  if(!cached){
    const offsetX=18,offsetY=94,bottomPad=18;
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.ceil(spec.w+offsetX*2));
    canvas.height=Math.max(1,Math.ceil(spec.h+offsetY+bottomPad));
    const c=canvas.getContext('2d');
    if(!c){drawT1RebuildContextFinishRaw(ctx,spec,renderZoom);return;}
    drawT1RebuildContextFinishRaw(c,{...spec,x:offsetX,y:offsetY},renderZoom);
    cached={canvas,offsetX,offsetY};t1ContextFinishCache.set(key,cached);
  }
  ctx.drawImage(cached.canvas,spec.x-cached.offsetX,spec.y-cached.offsetY);
}

