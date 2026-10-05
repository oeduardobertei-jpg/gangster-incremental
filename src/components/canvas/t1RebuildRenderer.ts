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
const banana=(ctx:CanvasRenderingContext2D,x:number,y:number,s:number)=>{
  ctx.fillStyle='rgba(12,25,16,.22)';ctx.beginPath();ctx.ellipse(x+3,y+s*.28,s*.85,s*.24,-.1,0,Math.PI*2);ctx.fill();
  line(ctx,x,y+s*.32,x,y-s*.20,'#4c5b35',2);
  const leaves=[[-1.25,-.16,.95,.23],[-.72,-.45,.90,.22],[-.15,-.56,.88,.20],[.43,-.46,.90,.21],[1.02,-.18,.84,.20],[.70,.05,.76,.18]] as const;
  for(const [dx,dy,len,wid] of leaves){ctx.save();ctx.translate(x,y-s*.20);const a=Math.atan2(dy,dx);ctx.rotate(a);ctx.fillStyle=dy<-.4?'#5f824b':'#4f7543';ctx.beginPath();ctx.ellipse(len*s*.48,0,len*s*.52,wid*s,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(185,205,139,.18)';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len*s,0);ctx.stroke();ctx.restore();}
};
const vinePatch=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,flip=false)=>{
  ctx.strokeStyle='rgba(50,89,52,.60)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+(flip?-w*.2:w*.2),y+8,x+(flip?-w*.55:w*.55),y+16,x+(flip?-w:w),y+26);ctx.stroke();
  for(let i=1;i<=5;i++){const t=i/6,px=x+(flip?-w:w)*t,py=y+26*t+Math.sin(i*1.7)*2;ctx.fillStyle=i%2?'#55784a':'#698751';ctx.beginPath();ctx.ellipse(px,py,4,2.1,flip?-.5:.5,0,Math.PI*2);ctx.fill();}
};
const treeCanopy=(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,variant=0)=>{
  ctx.fillStyle='rgba(6,16,10,.28)';ctx.beginPath();ctx.ellipse(x+5,y+s*.46,s*.92,s*.30,-.12,0,Math.PI*2);ctx.fill();
  line(ctx,x,y+s*.34,x-1,y-s*.22,'#544630',Math.max(2,s*.11));
  line(ctx,x-1,y-s*.04,x-s*.28,y-s*.28,'rgba(85,72,48,.72)',Math.max(1.2,s*.055));
  line(ctx,x,y-s*.08,x+s*.30,y-s*.30,'rgba(85,72,48,.68)',Math.max(1.2,s*.05));
  const dark=variant%2?'#31583b':'#2f5d3b',mid=variant%3?'#497848':'#427446',light=variant%2?'#6f9658':'#638d52';
  const blobs=[[-.44,.05,.34,.25],[-.17,.12,.38,.29],[.17,.10,.39,.28],[.42,.01,.31,.23],[-.31,-.22,.36,.29],[-.03,-.32,.39,.30],[.31,-.24,.34,.26],[.03,-.08,.47,.34],[-.16,-.08,.36,.29]] as const;
  for(let i=0;i<blobs.length;i++){const [dx,dy,rx,ry]=blobs[i];ctx.fillStyle=dy<-.20?light:(i%3===0?dark:mid);ctx.beginPath();ctx.ellipse(x+dx*s,y+dy*s,rx*s,ry*s,(dx+(i%2?-.15:.11))*.34,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='rgba(212,225,151,.16)';for(const [dx,dy,rx] of [[-.36,-.28,.12],[-.04,-.43,.14],[.29,-.31,.11],[.11,-.18,.08]] as const){ctx.beginPath();ctx.ellipse(x+dx*s,y+dy*s,s*rx,s*rx*.45,-.22,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='rgba(31,68,39,.26)';ctx.lineWidth=.8;for(const [dx,dy] of [[-.28,-.05],[.24,-.10],[.02,.08]] as const){ctx.beginPath();ctx.moveTo(x+dx*s,y+dy*s);ctx.lineTo(x+(dx+.10)*s,y+(dy-.05)*s);ctx.stroke();}
};
const grassClump=(ctx:CanvasRenderingContext2D,x:number,y:number,s=1)=>{
  for(let i=0;i<5;i++){const dx=(i-2)*2.1*s;line(ctx,x+dx,y,x+dx+(i%2?3:-2)*s,y-(6+(i%3)*2)*s,i%2?'rgba(83,125,67,.62)':'rgba(105,143,74,.52)',1.1*s);}
};
const flowerVine=(ctx:CanvasRenderingContext2D,x:number,y:number,h:number,flip=false)=>{
  ctx.strokeStyle='rgba(55,100,55,.62)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+(flip?-8:8),y-h*.28,x+(flip?6:-6),y-h*.62,x+(flip?-4:4),y-h);ctx.stroke();
  const cols=['#b45c72','#c86f77','#d08c72'];for(let i=0;i<7;i++){const t=(i+1)/8,px=x+(flip?-1:1)*Math.sin(i*1.6)*5,py=y-h*t;ctx.fillStyle=cols[i%cols.length];ctx.beginPath();ctx.arc(px,py,1.8+(i%2)*.4,0,Math.PI*2);ctx.fill();}
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
  const roofs=['#705542','#824a37','#46646a','#756343','#6b4f69','#5b6660'];
  const walls=['#625044','#7b4e3c','#4b6661','#71624a','#66546b','#59686a'];
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
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(46,47,43,.39)';ctx.lineWidth=outer;path();ctx.stroke();
    ctx.strokeStyle='rgba(121,108,88,.28)';ctx.lineWidth=inner;path();ctx.stroke();ctx.strokeStyle='rgba(204,178,137,.10)';ctx.lineWidth=1.5;path();ctx.stroke();
  };
  // 1.2D: the central circulation reads as a lived-in hillside spine, not a radial boulevard.
  road([[width*.515,height*1.03],[width*.505,height*.86],[width*.478,height*.73],[width*.505,height*.61],[width*.475,height*.49],[width*.512,height*.36],[width*.486,height*.23],[width*.525,height*.11],[width*.50,-20]],68,47);
  road([[width*.494,height*.76],[width*.432,height*.735],[width*.355,height*.685],[width*.285,height*.705],[width*.215,height*.665],[width*.145,height*.705]],27,17);
  road([[width*.505,height*.665],[width*.575,height*.638],[width*.655,height*.615],[width*.735,height*.645],[width*.845,height*.605]],25,15);
  road([[width*.488,height*.535],[width*.425,height*.505],[width*.348,height*.470],[width*.274,height*.418],[width*.190,height*.448]],23,14);
  road([[width*.510,height*.445],[width*.585,height*.405],[width*.665,height*.425],[width*.755,height*.365],[width*.855,height*.395]],22,13);
  road([[width*.496,height*.315],[width*.425,height*.285],[width*.350,height*.245],[width*.285,height*.218],[width*.195,height*.165]],19,11);
  road([[width*.516,height*.252],[width*.605,height*.220],[width*.695,height*.195],[width*.790,height*.140]],18,10);

  // Short pedestrian cuts and stairs break the road hierarchy into believable favela circulation.
  const stairPath=(pts:Array<[number,number]>)=>{
    ctx.strokeStyle='rgba(94,84,70,.54)';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();
    ctx.strokeStyle='rgba(192,168,130,.24)';ctx.lineWidth=1;for(let i=0;i<pts.length-1;i++){const [x1,y1]=pts[i],[x2,y2]=pts[i+1];for(let t=.16;t<1;t+=.18){const x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1;ctx.beginPath();ctx.moveTo(x-dy/l*5,y+dx/l*5);ctx.lineTo(x+dy/l*5,y-dx/l*5);ctx.stroke();}}
  };
  stairPath([[width*.372,height*.66],[width*.345,height*.60],[width*.320,height*.555]]);
  stairPath([[width*.690,height*.535],[width*.720,height*.485],[width*.742,height*.445]]);
  stairPath([[width*.330,height*.305],[width*.305,height*.265],[width*.280,height*.235]]);

  // Irregular contact patches, drains and worn thresholds give intersections scale without geometric rings.
  const pockets:Array<[number,number,number,number,number]>=[
    [.494,.735,38,11,-.10],[.507,.605,34,9,.08],[.481,.488,32,8,-.12],[.510,.355,29,8,.10],[.495,.238,27,7,-.08],
    [.292,.525,42,12,.05],[.712,.505,40,11,-.06],[.318,.765,34,10,-.04],[.696,.772,36,10,.05]
  ];
  for(const [nx,ny,rx,ry,rot] of pockets){ctx.fillStyle='rgba(116,91,62,.14)';ctx.beginPath();ctx.ellipse(width*nx,height*ny,rx,ry,rot,0,Math.PI*2);ctx.fill();line(ctx,width*nx-rx*.35,height*ny+ry*.25,width*nx+rx*.38,height*ny-ry*.15,'rgba(24,31,29,.25)',2);}
  for(const sx of [-1,1]){const x=width*.50+sx*34;line(ctx,x,height*.94,x+sx*7,height*.79,'rgba(28,34,32,.38)',2);line(ctx,x+sx*4,height*.72,x-sx*9,height*.56,'rgba(28,34,32,.28)',2);}

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
  const bananas:Array<[number,number,number]>=[[.078,.34,15],[.18,.20,13],[.265,.58,14],[.20,.86,15],[.915,.35,15],[.82,.20,13],[.745,.60,14],[.85,.82,15]];
  for(const [nx,ny,bs] of bananas)banana(ctx,width*nx,height*ny,bs);
  vinePatch(ctx,width*.245,height*.294,38,false);vinePatch(ctx,width*.755,height*.303,40,true);
  vinePatch(ctx,width*.233,height*.555,34,false);vinePatch(ctx,width*.770,height*.565,36,true);

  // 1.2K: vegetation reads as hillside ecology, not isolated decorative dots.
  const edgeTrees:Array<[number,number,number,number]>=[
    [.012,.20,24,0],[.055,.31,28,1],[.018,.48,30,2],[.070,.64,25,0],[.020,.80,31,1],[.105,.91,23,2],
    [.988,.19,25,1],[.945,.30,29,0],[.985,.47,31,2],[.932,.63,25,1],[.982,.79,30,0],[.895,.91,22,2]
  ];
  for(const [nx,ny,ts,v] of edgeTrees)treeCanopy(ctx,width*nx,height*ny,ts,v);

  const bananaClusters:Array<[number,number,number]>=[
    [.105,.23,15],[.135,.26,13],[.095,.29,12],[.875,.22,15],[.905,.26,13],[.852,.30,12],
    [.125,.70,14],[.155,.73,12],[.855,.70,14],[.885,.74,12]
  ];
  for(const [nx,ny,bs] of bananaClusters)banana(ctx,width*nx,height*ny,bs);

  const grass:Array<[number,number,number]>=[
    [.18,.34,1.1],[.205,.36,.9],[.25,.31,1],[.29,.59,.9],[.22,.61,1.1],[.16,.55,.9],
    [.82,.34,1.1],[.795,.36,.9],[.75,.31,1],[.71,.59,.9],[.78,.61,1.1],[.84,.55,.9],
    [.12,.84,1.0],[.88,.84,1.0],[.31,.12,.8],[.69,.12,.8]
  ];
  for(const [nx,ny,gs] of grass)grassClump(ctx,width*nx,height*ny,gs);

  const fb=find(buildings,'beco_01');if(fb)flowerVine(ctx,fb.x+fb.w-5,fb.y+fb.h-2,30,true);
  const fl=find(buildings,'laje_ponto');if(fl)flowerVine(ctx,fl.x+6,fl.y+fl.h-2,34,false);
  const fbo=find(buildings,'boca_leste');if(fbo)flowerVine(ctx,fbo.x+fbo.w-8,fbo.y+fbo.h-4,38,true);
  const fs=find(buildings,'esconderijo');if(fs)flowerVine(ctx,fs.x+7,fs.y+fs.h-3,30,false);

  // Utility infrastructure follows the alleys and creates vertical rhythm between the houses.
  const poles:Array<[number,number,number]>=[[.31,.29,.9],[.70,.29,.95],[.34,.57,.9],[.69,.58,.9],[.24,.80,.8],[.78,.79,.8]];
  for(const [nx,ny,ps] of poles){
    pole(ctx,width*nx,height*ny,ps);
    const lx=width*nx+4*ps,ly=height*ny-27*ps;const glow=ctx.createRadialGradient(lx,ly,1,lx,ly,54*ps);
    glow.addColorStop(0,'rgba(246,196,105,.115)');glow.addColorStop(.35,'rgba(230,164,78,.045)');glow.addColorStop(1,'rgba(230,164,78,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(lx,ly,54*ps,0,Math.PI*2);ctx.fill();
  }
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


/** 1.2H: cached material/light separation for the rebuilt T1. */
export function drawT1MaterialDepthFoundation(
  ctx:CanvasRenderingContext2D,width:number,height:number,territoryId:number,
  buildings:readonly TacticalBuilding[]
){
  if(territoryId!==1)return;
  ctx.save();

  // One authored daylight direction: warm upper-left, cooler/deeper lower-right.
  const daylight=ctx.createLinearGradient(0,0,width,height);
  daylight.addColorStop(0,'rgba(255,221,170,.115)');
  daylight.addColorStop(.42,'rgba(239,205,158,.018)');
  daylight.addColorStop(1,'rgba(20,35,43,.155)');
  ctx.fillStyle=daylight;ctx.fillRect(0,0,width,height);

  // Atmospheric depth keeps the distant ridge flatter while the playable middle stays readable.
  const upper=ctx.createLinearGradient(0,0,0,height*.34);
  upper.addColorStop(0,'rgba(44,61,66,.22)');upper.addColorStop(1,'rgba(44,61,66,0)');
  ctx.fillStyle=upper;ctx.fillRect(0,0,width,height*.36);
  const lower=ctx.createLinearGradient(0,height*.64,0,height);
  lower.addColorStop(0,'rgba(33,40,36,0)');lower.addColorStop(1,'rgba(15,25,25,.105)');
  ctx.fillStyle=lower;ctx.fillRect(0,height*.60,width,height*.40);

  // Broad sun/shadow planes give the hillside a readable direction instead of flat global tint.
  const sunPlanes:Array<Array<[number,number]>>=[
    [[width*.04,height*.20],[width*.31,height*.13],[width*.43,height*.47],[width*.20,height*.55]],
    [[width*.58,height*.08],[width*.81,height*.04],[width*.73,height*.38],[width*.53,height*.43]]
  ];
  for(const pts of sunPlanes)poly(ctx,pts,'rgba(255,219,165,.035)');
  const shadePlanes:Array<Array<[number,number]>>=[
    [[width*.29,height*.16],[width*.40,height*.13],[width*.58,height*.59],[width*.48,height*.63]],
    [[width*.72,height*.43],[width*.84,height*.39],[width*.76,height*.83],[width*.65,height*.80]]
  ];
  for(const pts of shadePlanes)poly(ctx,pts,'rgba(10,22,29,.075)');

  // Footprint contact and material-colour bounce: static, so this costs nothing per frame.
  for(const b of buildings){
    const cx=b.x+b.w/2,fy=b.y+b.h+5;
    ctx.fillStyle='rgba(7,12,13,.16)';ctx.beginPath();ctx.ellipse(cx+5,fy+3,b.w*.48+10,7,-.06,0,Math.PI*2);ctx.fill();
    const mat=b.type==='brick'?'rgba(176,93,56,.055)':b.type==='zinc'?'rgba(101,157,172,.05)':'rgba(201,182,148,.045)';
    const g=ctx.createRadialGradient(cx,b.y+b.h,2,cx,b.y+b.h,Math.max(42,b.w*.72));
    g.addColorStop(0,mat);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,b.y+b.h,Math.max(42,b.w*.72),0,Math.PI*2);ctx.fill();
  }

  // Damp/cool pockets and warm exposed terraces stop the terrain reading as one brown material.
  const coolPockets:[[number,number,number,number],...Array<[number,number,number,number]>]=[
    [.50,.47,96,34],[.42,.69,74,25],[.63,.61,66,24]
  ];
  for(const [nx,ny,rx,ry] of coolPockets){ctx.fillStyle='rgba(62,92,94,.055)';ctx.beginPath();ctx.ellipse(width*nx,height*ny,rx,ry,-.10,0,Math.PI*2);ctx.fill();}
  const warmPockets:[[number,number,number,number],...Array<[number,number,number,number]>]=[
    [.24,.41,70,23],[.77,.36,82,26],[.23,.75,64,20]
  ];
  for(const [nx,ny,rx,ry] of warmPockets){ctx.fillStyle='rgba(197,133,75,.055)';ctx.beginPath();ctx.ellipse(width*nx,height*ny,rx,ry,.08,0,Math.PI*2);ctx.fill();}

  ctx.restore();
}


/** 1.2J: ground-level urban integration. Visual-only markings never imply new blockers. */
export function drawT1UrbanIntegrationFoundation(
  ctx:CanvasRenderingContext2D,width:number,height:number,territoryId:number,
  buildings:readonly TacticalBuilding[]
){
  if(territoryId!==1)return;
  ctx.save();
  const tuft=(x:number,y:number,flip=1)=>{
    line(ctx,x,y,x-3*flip,y-7,'rgba(73,111,62,.62)',1.2);line(ctx,x,y,x+4*flip,y-5,'rgba(89,129,67,.56)',1.1);
    ctx.fillStyle='rgba(91,135,72,.46)';ctx.beginPath();ctx.ellipse(x-3*flip,y-7,3,1.7,-.35*flip,0,Math.PI*2);ctx.fill();
  };
  for(const b of buildings){
    const hash=Math.abs([...b.id].reduce((a,c)=>((a*31)+c.charCodeAt(0))|0,11));
    const dTop=Math.abs(b.doorY-b.y),dBottom=Math.abs(b.doorY-(b.y+b.h));
    const dLeft=Math.abs(b.doorX-b.x),dRight=Math.abs(b.doorX-(b.x+b.w));
    const m=Math.min(dTop,dBottom,dLeft,dRight);
    const tone=b.type==='brick'?'rgba(133,92,65,.30)':b.type==='zinc'?'rgba(80,99,102,.28)':'rgba(111,105,91,.28)';
    ctx.fillStyle=tone;
    if(m===dTop||m===dBottom){ctx.beginPath();ctx.roundRect(b.doorX-13,b.doorY-5,26,10,2);ctx.fill();line(ctx,b.doorX-10,b.doorY+2,b.doorX+9,b.doorY-1,'rgba(208,184,147,.16)',1);}
    else{ctx.beginPath();ctx.roundRect(b.doorX-5,b.doorY-13,10,26,2);ctx.fill();line(ctx,b.doorX+1,b.doorY-10,b.doorX-2,b.doorY+9,'rgba(208,184,147,.16)',1);}

    // Thin drainage channel and damp base stain read as ground treatment, never wall geometry.
    const drainY=b.y+b.h+5;
    line(ctx,b.x+5,drainY,b.x+b.w-7,drainY,'rgba(22,34,34,.28)',1.5);
    ctx.fillStyle='rgba(50,79,70,.08)';ctx.beginPath();ctx.ellipse(b.x+b.w*(.25+(hash%4)*.14),drainY-2,Math.max(8,b.w*.14),4,.05,0,Math.PI*2);ctx.fill();
    const gx=hash%2===0?b.x+5:b.x+b.w-6;tuft(gx,b.y+b.h+3,hash%2===0?1:-1);

    // Small service paint/wear at the facade edge adds human scale without occupying walkable space.
    ctx.fillStyle=hash%3===0?'rgba(189,137,76,.10)':'rgba(103,137,126,.075)';
    ctx.fillRect(b.x+4+(hash%3)*5,b.y+b.h-3,Math.max(10,b.w*.18),3);
  }

  const boca=find(buildings,'boca_leste');
  if(boca){ctx.fillStyle='rgba(145,75,47,.13)';ctx.beginPath();ctx.roundRect(boca.x-10,boca.y+boca.h+7,boca.w+20,12,4);ctx.fill();line(ctx,boca.x+5,boca.y+boca.h+13,boca.x+boca.w-8,boca.y+boca.h+11,'rgba(227,169,111,.16)',1);}
  const safe=find(buildings,'esconderijo');
  if(safe){ctx.fillStyle='rgba(66,79,79,.14)';ctx.fillRect(safe.x+safe.w-9,safe.y+5,15,safe.h-8);line(ctx,safe.x+safe.w+3,safe.y+7,safe.x+safe.w+3,safe.y+safe.h-7,'rgba(145,165,162,.15)',1);}
  const laje=find(buildings,'laje_ponto');
  if(laje){ctx.fillStyle='rgba(58,83,75,.09)';ctx.beginPath();ctx.ellipse(laje.doorX,laje.doorY+7,26,8,-.12,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

/** 1.2B: vertical architecture built above real physical footprints only. */
export function drawT1RebuildBuildingFinish(
  ctx:CanvasRenderingContext2D,b:TacticalBuilding,time:number,controlColor:string,renderZoom=1
){
  const rY=roofY(b), detail=renderZoom>=.82, close=renderZoom>=1.18;
  ctx.save();

  // Directional facade cue shared by every authored landmark. It changes perceived depth without changing footprint.
  const facadeBottom=b.y+b.h,facadeH=Math.max(18,facadeBottom-rY);
  ctx.fillStyle='rgba(255,224,177,.075)';ctx.fillRect(b.x+1,rY+3,2.5,Math.max(8,facadeH-6));
  ctx.fillStyle='rgba(8,20,27,.14)';ctx.fillRect(b.x+b.w-6,rY+4,6,Math.max(8,facadeH-5));
  ctx.fillStyle='rgba(5,12,16,.16)';ctx.beginPath();
  ctx.moveTo(b.x+8,facadeBottom+2);ctx.lineTo(b.x+b.w+4,facadeBottom+2);ctx.lineTo(b.x+b.w+18,facadeBottom+11);ctx.lineTo(b.x+20,facadeBottom+11);ctx.closePath();ctx.fill();

  const slab=(x:number,y:number,w:number,depth=5,color='#665d52')=>{
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x+5,y+5,w,depth+2);
    ctx.fillStyle=color;ctx.fillRect(x,y,w,depth);
    const sg=ctx.createLinearGradient(x,y,x+w,y+depth);sg.addColorStop(0,'rgba(255,224,180,.18)');sg.addColorStop(1,'rgba(14,25,29,.12)');ctx.fillStyle=sg;ctx.fillRect(x,y,w,depth);
    ctx.fillStyle='rgba(240,220,188,.20)';ctx.fillRect(x+2,y+1,w-4,1);
  };
  const floor=(x:number,y:number,w:number,h:number,wall:string,edge:string,windowColor='#17222a',material:'brick'|'metal'|'concrete'='concrete')=>{
    ctx.fillStyle='rgba(0,0,0,.30)';ctx.fillRect(x+6,y+7,w,h);
    ctx.fillStyle=wall;ctx.fillRect(x,y,w,h);
    const fg=ctx.createLinearGradient(x,y,x+w,y+h);fg.addColorStop(0,'rgba(255,225,184,.115)');fg.addColorStop(.46,'rgba(255,255,255,.015)');fg.addColorStop(1,'rgba(10,24,30,.22)');ctx.fillStyle=fg;ctx.fillRect(x,y,w,h);
    if(detail&&material==='brick'){ctx.strokeStyle='rgba(231,180,139,.145)';ctx.lineWidth=.7;for(let yy=y+7;yy<y+h-4;yy+=8){ctx.beginPath();ctx.moveTo(x+3,yy);ctx.lineTo(x+w-4,yy);ctx.stroke();}}
    if(detail&&material==='metal'){ctx.strokeStyle='rgba(174,210,218,.17)';ctx.lineWidth=.7;for(let xx=x+10;xx<x+w-5;xx+=13){ctx.beginPath();ctx.moveTo(xx,y+3);ctx.lineTo(xx,y+h-4);ctx.stroke();}}
    if(detail&&material==='concrete'){ctx.fillStyle='rgba(229,215,188,.075)';ctx.fillRect(x+5,y+6,Math.max(8,w*.28),3);ctx.fillStyle='rgba(37,55,53,.07)';ctx.fillRect(x+w*.58,y+h*.68,Math.max(7,w*.22),4);}
    // 1.2I: roof cap is a material signature, not one generic slab.
    const roofCap=material==='brick'?'#875239':material==='metal'?'#506970':'#6b665d';
    ctx.fillStyle='rgba(0,0,0,.20)';ctx.fillRect(x+2,y-6,w+3,6);ctx.fillStyle=roofCap;ctx.fillRect(x-2,y-6,w+4,5);
    if(detail&&material==='brick'){for(let xx=x;xx<x+w;xx+=9)line(ctx,xx,y-6,xx+4,y-1,'rgba(245,192,137,.16)',.8);}
    if(detail&&material==='metal'){for(let xx=x+6;xx<x+w-4;xx+=11)line(ctx,xx,y-6,xx,y-1,'rgba(203,229,231,.18)',.8);}
    if(detail&&material==='concrete'){ctx.fillStyle='rgba(226,214,189,.13)';ctx.fillRect(x+4,y-5,w*.38,1);}
    ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(x+w-6,y+3,6,h-3);ctx.strokeStyle=edge;ctx.strokeRect(x,y,w,h);
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
  const tileCanopy=(x:number,y:number,w:number,d=11)=>{
    ctx.fillStyle='rgba(0,0,0,.24)';poly(ctx,[[x+5,y+5],[x+w+5,y+2],[x+w,y+d+6],[x+2,y+d+8]],'rgba(0,0,0,.20)');
    poly(ctx,[[x,y],[x+w,y-3],[x+w-4,y+d],[x+4,y+d+3]],'#98563a','#c58258');
    for(let xx=x+7;xx<x+w-5;xx+=10)line(ctx,xx,y+1,xx-2,y+d+1,'rgba(245,183,126,.24)',1);
  };
  const zincCanopy=(x:number,y:number,w:number,d=10)=>{
    poly(ctx,[[x,y],[x+w,y-2],[x+w-3,y+d],[x+3,y+d+2]],'#536a70','#8da1a4');
    for(let xx=x+5;xx<x+w-4;xx+=9)line(ctx,xx,y,xx-1,y+d+1,'rgba(203,228,229,.22)',.8);
  };
  const dish=(x:number,y:number,s=1)=>{
    ctx.strokeStyle='#829196';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,7*s,.18,Math.PI*1.18);ctx.stroke();
    line(ctx,x-1*s,y+1*s,x+5*s,y+8*s,'#66757a',1.2);ctx.fillStyle='#9aa7aa';ctx.beginPath();ctx.arc(x+1*s,y,1.4*s,0,Math.PI*2);ctx.fill();
  };

  const clothesline=(x:number,y:number,w:number,seed=0)=>{
    line(ctx,x,y,x+w,y+2,'rgba(193,199,190,.38)',.8);
    const cols=['#9f5e48','#557c83','#b39a61','#77738a'];
    for(let i=0;i<3;i++){const xx=x+w*(.22+i*.26);ctx.fillStyle=cols[(seed+i)%cols.length];ctx.fillRect(xx,y+1+i%2,5,5+i%2);}
  };
  const planter=(x:number,y:number,w=14)=>{
    ctx.fillStyle='#655544';ctx.fillRect(x,y,w,4);ctx.fillStyle='#43643d';for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x+3+i*4,y-2-(i%2),3,2,-.2,0,Math.PI*2);ctx.fill();}
  };

  if(b.id==='beco_01'){
    const x=b.x+8,y=rY-25,w=b.w*.48,h=25;
    floor(x,y,w,h,'#725342','#4a4037','#17222a','brick');slab(b.x-3,rY-5,b.w+6,6);
    tileCanopy(b.x-5,rY+6,b.w*.62,10);waterTank(b.x+b.w-19,y-8,.82);rebar(b.x+b.w*.56,rY-2,2);
    if(detail){line(ctx,x+6,y+8,b.x+b.w-10,y+1,'rgba(218,208,190,.30)',1);clothesline(x+5,y-8,w*.72,1);}
  }else if(b.id==='laje_ponto'){
    const x=b.x+10,w=b.w*.68,h=29,y=rY-h+1;
    floor(x,y,w,h,'#514a40','#756b5d','#17222a','concrete');
    const x2=x+w*.32,w2=w*.58,h2=22,y2=y-h2+2;floor(x2,y2,w2,h2,'#4a514d','#727b72','#17222a','concrete');
    balcony(x-4,y+h-4,w*.72);rebar(x+w+6,y+5,3);waterTank(x2+w2-12,y2-9,.75);factionBand(x+8,y+h-8,w*.38);
    ctx.fillStyle='rgba(120,143,130,.42)';ctx.fillRect(x+4,y2-5,w2*.48,4);line(ctx,x+4,y2-5,x+4,y2-18,'#5e645c',1.5);line(ctx,x+4+w2*.48,y2-5,x+4+w2*.48,y2-18,'#5e645c',1.5);
    if(detail){ctx.fillStyle='rgba(202,176,126,.18)';ctx.fillRect(x+5,y+6,w-10,3);clothesline(x+2,y2-14,w2*.80,2);planter(x+w*.08,y-5,16);}
  }else if(b.id==='barraquinha'){
    const aw=b.w+28,ax=b.x-14,ay=rY+13;
    ctx.fillStyle='rgba(0,0,0,.26)';poly(ctx,[[ax+5,ay+7],[ax+aw+5,ay+3],[ax+aw-2,ay+18],[ax+3,ay+22]],'rgba(0,0,0,.24)');
    poly(ctx,[[ax,ay],[ax+aw,ay-4],[ax+aw-6,ay+12],[ax+5,ay+16]],'#874832','#d3a35c');
    for(let i=0;i<5;i++){ctx.fillStyle=i%2?'rgba(236,198,130,.34)':'rgba(104,49,39,.34)';ctx.fillRect(ax+8+i*(aw-16)/5,ay+3,(aw-16)/5,4);}
    if(detail){ctx.fillStyle='#ead9bb';ctx.font='900 7px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText('BAR DO BECO',b.x+b.w/2,ay+9);}
    rect(ctx,b.x+b.w-23,rY-7,17,13,'#5c5b50','#838379');
  }else if(b.id==='esconderijo'){
    const x=b.x+7,w=b.w*.76,h=31,y=rY-h+2;floor(x,y,w,h,'#394246','#647079','#17222a','concrete');
    const x2=b.x+b.w*.42,w2=b.w*.48,h2=24,y2=y-h2+3;floor(x2,y2,w2,h2,'#303a3e','#66757a','#17222a','metal');
    balcony(x+w*.05,y+h-2,w*.46);waterTank(x2+w2-13,y2-10,.82);antenna(x2+w2*.58,y2,30);dish(x2+9,y2-5,.78);
    zincCanopy(b.x+5,rY+9,b.w*.44,9);rect(ctx,b.x+9,rY+b.h-17,34,9,'#20282c','#4c585d');factionBand(x+7,y+h-7,w*.28);lamp(b.x+15,rY+b.h+2);if(detail)planter(x+w-20,y-5,15);
  }else if(b.id==='boca_leste'){
    const x=b.x+4,w=b.w*.86,h=35,y=rY-h+3;floor(x,y,w,h,'#7a4433','#9d6249','#211d1b','brick');
    const x2=b.x+b.w*.31,w2=b.w*.57,h2=25,y2=y-h2+4;floor(x2,y2,w2,h2,'#694033','#925c49','#181c1d','brick');
    balcony(x+5,y+h-2,w*.64);waterTank(x2+w2-14,y2-9,.86);antenna(x2+11,y2,25);factionBand(x+8,y+h-8,w*.42);
    tileCanopy(b.x-8,rY+23,b.w*.54,11);ctx.fillStyle='rgba(40,46,43,.72)';ctx.fillRect(x2+w2*.18,y2-8,w2*.38,5);
    const signX=b.x+15,signY=rY+10,signW=b.w-30;ctx.fillStyle='#171c1e';ctx.fillRect(signX,signY,signW,13);ctx.strokeStyle=controlColor;ctx.strokeRect(signX,signY,signW,13);
    if(detail){ctx.fillStyle='#f0dfc7';ctx.font='900 8px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillText('BOCA DA LESTE',b.x+b.w/2,signY+7.5);planter(x+7,y-5,18);}
    poly(ctx,[[b.x-14,rY+b.h-12],[b.x+b.w+10,rY+b.h-15],[b.x+b.w+6,rY+b.h-3],[b.x-9,rY+b.h]],'#824d35','#a76d48');lamp(b.x+b.w-13,rY+26);
  }else if(b.id==='torre_guarda'){
    const cx=b.x+b.w/2;
    ctx.fillStyle='rgba(0,0,0,.26)';ctx.fillRect(cx-24,rY-51,52,58);
    for(const sx of [-18,18]){line(ctx,cx+sx,rY+7,cx+sx*.72,rY-44,'#4d5557',4);line(ctx,cx+sx,rY-7,cx-sx*.4,rY-28,'rgba(125,139,141,.46)',2);}
    floor(cx-24,rY-57,48,22,'#3d484c','#879398','#11191d','metal');
    zincCanopy(cx-30,rY-65,60,9);balcony(cx-28,rY-35,56);antenna(cx,rY-57,34);factionBand(cx-18,rY-39,36);
    ctx.fillStyle='rgba(244,205,118,.82)';ctx.fillRect(cx+18,rY-47,4,3);
  }else if(b.id==='mirante'){
    const x=b.x+7,w=b.w*.78,h=25,y=rY-h+3;floor(x,y,w,h,'#52615a','#7f8e86','#17211f','metal');
    const deckY=y-8;ctx.fillStyle='#5a5145';ctx.fillRect(b.x-8,deckY,b.w+16,6);ctx.strokeStyle='rgba(190,205,195,.48)';for(let xx=b.x-6;xx<b.x+b.w+6;xx+=10)line(ctx,xx,deckY-11,xx,deckY,'rgba(190,205,195,.48)',1);line(ctx,b.x-7,deckY-11,b.x+b.w+8,deckY-11,'rgba(190,205,195,.48)',2);
    rect(ctx,b.x+b.w*.57,y+5,b.w*.25,13,'#46534e','#7c8b84');antenna(b.x+b.w*.30,deckY,36);waterTank(b.x+b.w-14,y-8,.72);factionBand(x+5,y+h-7,w*.34);
    zincCanopy(b.x-2,deckY-16,b.w*.46,9);dish(b.x+b.w*.70,y-6,.68);
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
    ? ['#7b4936','#8b5239','#6d4638']
    : spec.material==='metal'
      ? ['#4b6268','#587077','#40545a']
      : ['#676a61','#7b776a','#5d6660'];
  const wall=wallPalette[hash%wallPalette.length],edge='rgba(193,184,165,.28)';
  const floor=(x:number,y:number,w:number,h:number)=>{
    ctx.fillStyle='rgba(0,0,0,.26)';ctx.fillRect(x+5,y+6,w,h);
    ctx.fillStyle=wall;ctx.fillRect(x,y,w,h);
    const lg=ctx.createLinearGradient(x,y,x+w,y+h);lg.addColorStop(0,'rgba(255,224,181,.105)');lg.addColorStop(.5,'rgba(255,255,255,.012)');lg.addColorStop(1,'rgba(9,24,29,.20)');ctx.fillStyle=lg;ctx.fillRect(x,y,w,h);
    if(detail&&spec.material==='brick'){for(let yy=y+7;yy<y+h-3;yy+=8)line(ctx,x+3,yy,x+w-4,yy,'rgba(225,174,132,.135)',.7);}
    if(detail&&spec.material==='metal'){for(let xx=x+10;xx<x+w-4;xx+=13)line(ctx,xx,y+3,xx,y+h-4,'rgba(176,211,219,.16)',.7);}
    if(detail&&spec.material==='concrete'){ctx.fillStyle='rgba(223,210,185,.07)';ctx.fillRect(x+5,y+6,Math.max(8,w*.24),3);}
    ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(x+w-5,y+3,5,h-3);ctx.strokeStyle=edge;ctx.strokeRect(x,y,w,h);
    const n=w>=54?3:2;for(let i=0;i<n;i++){const wx=x+8+i*(w-16)/Math.max(1,n-1)-4;ctx.fillStyle=(hash+i)%4===0?'#d4ad65':'#1a2930';ctx.fillRect(wx,y+h*.45,8,7);}
    const capPalette=spec.material==='brick'?['#8b573d','#975f43','#744d3e']:spec.material==='metal'?['#536d74','#60777a','#475f66']:['#6e6a61','#777163','#626a63'];
    const cap=capPalette[hash%capPalette.length];
    ctx.fillStyle='rgba(0,0,0,.20)';ctx.fillRect(x+2,y-5,w+3,6);ctx.fillStyle=cap;ctx.fillRect(x-2,y-5,w+4,5);
    if(detail&&spec.material!=='brick'&&hash%4!==0){const faded=['rgba(69,126,130,.12)','rgba(171,116,69,.11)','rgba(142,150,101,.10)','rgba(121,111,146,.09)'][hash%4];ctx.fillStyle=faded;ctx.fillRect(x+3,y+4,Math.max(10,w*(.24+(hash%3)*.08)),Math.max(8,h-8));}
    if(detail&&spec.material==='brick'&&hash%3===0){ctx.fillStyle='rgba(197,145,94,.10)';ctx.fillRect(x+w*.58,y+4,w*.26,Math.max(8,h-8));}
    if(detail&&hash%2===0){line(ctx,x+w-3,y+4,x+w-3,y+h-2,'rgba(61,75,76,.34)',1.2);ctx.fillStyle='rgba(75,93,91,.28)';ctx.fillRect(x+w-5,y+h-4,5,2);}
    if(detail&&hash%5===0){ctx.fillStyle='#615244';ctx.fillRect(x+6,y-8,14,4);ctx.fillStyle='#46623e';ctx.beginPath();ctx.ellipse(x+10,y-10,4,2.5,-.2,0,Math.PI*2);ctx.ellipse(x+16,y-10,4,2.5,.2,0,Math.PI*2);ctx.fill();}
    if(detail&&hash%7===0){line(ctx,x+7,y-10,x+w-8,y-8,'rgba(195,199,190,.30)',.7);ctx.fillStyle='#9b6a54';ctx.fillRect(x+w*.42,y-9,4,5);ctx.fillStyle='#5d7f83';ctx.fillRect(x+w*.58,y-8,5,4);}
    if(detail&&spec.material==='brick'){for(let xx=x;xx<x+w;xx+=9)line(ctx,xx,y-5,xx+4,y,'rgba(244,190,137,.14)',.7);}
    if(detail&&spec.material==='metal'){for(let xx=x+6;xx<x+w-4;xx+=11)line(ctx,xx,y-5,xx,y,'rgba(198,226,230,.16)',.7);}
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

