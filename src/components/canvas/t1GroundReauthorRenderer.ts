import type { ScenePath, SceneRect } from '../../data/territoryScenes';

type GroundFootprint={x:number;y:number;w:number;h:number};

const seeded=(n:number)=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
const linePath=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{
  ctx.beginPath();
  path.points.forEach((p,i)=>{const x=p.x*W,y=p.y*H;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
};
const strokePath=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number,color:string,width:number,alpha=1)=>{
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';
  linePath(ctx,path,W,H);ctx.stroke();ctx.restore();
};
const irregularBlob=(ctx:CanvasRenderingContext2D,W:number,H:number,pts:readonly (readonly [number,number])[],fill:string,stroke?:string)=>{
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
};

const drawTerrainFields=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  // Large, low-contrast terrain fields replace the old rectangular biome tiles.
  irregularBlob(ctx,W,H,[[.00,.00],[.38,.00],[.40,.12],[.34,.24],[.18,.28],[.00,.23]],'rgba(97,76,52,.095)');
  irregularBlob(ctx,W,H,[[.63,.00],[1,.00],[1,.28],[.83,.25],[.70,.20],[.61,.10]],'rgba(78,83,66,.075)');
  irregularBlob(ctx,W,H,[[.00,.62],[.17,.58],[.32,.67],[.39,.84],[.34,1],[.00,1]],'rgba(91,68,47,.085)');
  irregularBlob(ctx,W,H,[[.63,.67],[.79,.60],[1,.64],[1,1],[.62,1],[.58,.84]],'rgba(66,79,61,.065)');
  irregularBlob(ctx,W,H,[[.06,.31],[.21,.27],[.34,.34],[.31,.52],[.18,.59],[.04,.51]],'rgba(109,91,67,.055)');
  irregularBlob(ctx,W,H,[[.68,.30],[.84,.27],[.97,.34],[.95,.53],[.82,.59],[.68,.51]],'rgba(91,82,68,.055)');
  ctx.restore();
};


const drawNeighborhoodMaterialBridge=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  // 1.1B: occupied material pockets reach farther toward the circulation spine.
  // Buildings should read as part of a neighborhood, not isolated sprites on a dark field.
  const fields=[
    [[[.020,.225],[.175,.205],[.365,.265],[.405,.390],[.345,.500],[.135,.485],[.018,.365]],'rgba(126,94,58,.145)','rgba(184,146,99,.075)'],
    [[[.595,.220],[.785,.200],[.975,.265],[.988,.405],[.930,.510],[.715,.490],[.585,.365]],'rgba(99,91,65,.125)','rgba(157,146,106,.065)'],
    [[[.025,.525],[.175,.500],[.350,.555],[.405,.715],[.320,.850],[.120,.835],[.018,.705]],'rgba(121,85,52,.135)','rgba(178,137,92,.068)'],
    [[[.595,.520],[.785,.495],[.978,.560],[.988,.735],[.900,.855],[.700,.835],[.585,.690]],'rgba(74,94,65,.115)','rgba(132,158,106,.060)']
  ] as const;
  for(const [pts,fill,stroke] of fields) irregularBlob(ctx,W,H,pts,fill,stroke);

  // Broad worn aprons are deliberately low-contrast: density without stealing unit silhouettes.
  ctx.fillStyle='rgba(145,105,63,.105)';
  for(const [x,y,rx,ry,r] of [[.255,.355,.105,.040,-.18],[.745,.360,.098,.038,.16],[.225,.710,.105,.040,.10],[.790,.695,.102,.038,-.12]] as const){
    ctx.beginPath();ctx.ellipse(x*W,y*H,rx*W,ry*H,r,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};

const drawFineGroundDebris=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  for(let i=0;i<92;i++){
    const nx=.025+seeded(9001+i*37)*.95,ny=.035+seeded(12011+i*43)*.92;
    if(nx>.385&&nx<.615&&ny>.145&&ny<.865) continue;
    const x=nx*W,y=ny*H,s=.65+seeded(15013+i*17)*1.45;
    const tone=i%4===0?'rgba(180,151,108,.15)':i%4===1?'rgba(80,105,72,.15)':i%4===2?'rgba(43,48,45,.24)':'rgba(151,139,119,.12)';
    ctx.fillStyle=tone;ctx.save();ctx.translate(x,y);ctx.rotate((seeded(17021+i*29)-.5)*1.5);
    ctx.fillRect(-s,-.55,s*2,1.1);ctx.restore();
    if(i%7===0){
      ctx.strokeStyle='rgba(72,103,67,.19)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(i%2?2:-2),y-3-s);ctx.stroke();
    }
  }
  ctx.restore();
};

const drawAsphalt=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{
  // 1.1B: T1 is a community access road, not an avenue. The physical/pathing corridor
  // is untouched; only the authored visual carriageway becomes narrower and more local.
  const w=Math.max(56,path.width*.69);
  strokePath(ctx,path,W,H,'#695843',w+18,.70);
  strokePath(ctx,path,W,H,'#252a29',w+10,.94);
  strokePath(ctx,path,W,H,'#3d403c',w,1);
  strokePath(ctx,path,W,H,'#54544d',Math.max(8,w-18),.28);
};
const drawAlley=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{
  const w=path.width;
  // Side alleys need to survive wide zoom: warmer shoulders + a slightly lighter walked core.
  strokePath(ctx,path,W,H,'#765d41',w+12,.66);
  strokePath(ctx,path,W,H,'#59544a',w+6,.98);
  strokePath(ctx,path,W,H,'#776a58',Math.max(6,w-6),.58);
};
const drawConcretePath=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{
  const w=path.width;
  strokePath(ctx,path,W,H,'#373737',w+10,.55);
  strokePath(ctx,path,W,H,'#62615b',w,1);
};

const drawSurfaceGrain=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number,pathIndex:number)=>{
  if(path.points.length<2)return;
  ctx.save();
  for(let seg=0;seg<path.points.length-1;seg++){
    const a=path.points[seg],b=path.points[seg+1],ax=a.x*W,ay=a.y*H,bx=b.x*W,by=b.y*H;
    const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    for(let i=0;i<7;i++){
      const r=seeded(701+pathIndex*97+seg*31+i*17),t=(i+.6+r*.35)/7;
      const side=(seeded(733+pathIndex*53+seg*19+i*29)-.5)*path.width*.62;
      const x=ax+dx*t+nx*side,y=ay+dy*t+ny*side;
      if(path.surface==='asphalt'){
        ctx.strokeStyle=r>.55?'rgba(184,184,174,.075)':'rgba(8,12,14,.18)';ctx.lineWidth=.8;
        ctx.beginPath();ctx.moveTo(x-2,y);ctx.lineTo(x+2+r*3,y+(r-.5)*1.5);ctx.stroke();
      }else{
        ctx.fillStyle=r>.60?'rgba(166,139,103,.13)':'rgba(54,45,37,.15)';
        ctx.beginPath();ctx.ellipse(x,y,1.2+r*1.8,.7+r*.8,r*.8,0,Math.PI*2);ctx.fill();
      }
    }
  }
  ctx.restore();
};
const drawPathRepairs=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number,pathIndex:number)=>{
  if(path.points.length<2)return;
  ctx.save();
  for(let s=0;s<path.points.length-1;s++){
    const a=path.points[s],b=path.points[s+1];
    const ax=a.x*W,ay=a.y*H,bx=b.x*W,by=b.y*H;
    const angle=Math.atan2(by-ay,bx-ax);
    for(let k=0;k<2;k++){
      const t=.28+k*.43+seeded(91+pathIndex*17+s*11+k)*.08;
      const x=ax+(bx-ax)*t,y=ay+(by-ay)*t;
      const side=(seeded(119+pathIndex*13+s*7+k)-.5)*path.width*.42;
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.translate(0,side);
      if(path.surface==='asphalt'){
        const rw=11+seeded(s+k)*15,rh=3+seeded(s+k+2)*3;
        ctx.fillStyle='rgba(15,18,19,.24)';ctx.beginPath();ctx.moveTo(-rw,0);ctx.lineTo(-rw*.45,-rh);ctx.lineTo(rw*.18,-rh*.55);ctx.lineTo(rw,rh*.15);ctx.lineTo(rw*.38,rh);ctx.lineTo(-rw*.58,rh*.62);ctx.closePath();ctx.fill();
        ctx.strokeStyle='rgba(132,133,126,.13)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-rw*.72,-rh*.15);ctx.lineTo(-rw*.12,rh*.18);ctx.lineTo(rw*.32,-rh*.08);ctx.lineTo(rw*.76,rh*.22);ctx.stroke();
      }else{
        const rw=7+seeded(s+k)*10,rh=2.5+seeded(s+k+4)*2;
        ctx.fillStyle='rgba(112,81,49,.15)';ctx.beginPath();ctx.moveTo(-rw,0);ctx.lineTo(-rw*.30,-rh);ctx.lineTo(rw*.65,-rh*.45);ctx.lineTo(rw,rh*.25);ctx.lineTo(rw*.18,rh);ctx.lineTo(-rw*.70,rh*.55);ctx.closePath();ctx.fill();
      }
      ctx.restore();
    }
  }
  ctx.restore();
};

const drawShoulderTransitions=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  // Authored broken shoulders where asphalt/alley meets occupied ground.
  const fragments=[
    [.405,.17,.042,.018,-.20],[.566,.25,.050,.016,.15],[.405,.39,.055,.018,-.08],[.574,.48,.046,.015,.18],
    [.404,.64,.052,.017,.08],[.570,.72,.050,.016,-.14],[.405,.85,.044,.016,.20],[.572,.88,.048,.015,-.10]
  ] as const;
  fragments.forEach(([x,y,w,h,r],i)=>{
    const rw=w*W,rh=h*H;ctx.save();ctx.translate(x*W,y*H);ctx.rotate(r);
    ctx.fillStyle='rgba(126,99,66,.17)';ctx.beginPath();ctx.moveTo(-rw,0);ctx.lineTo(-rw*.58,-rh*.72);ctx.lineTo(-rw*.08,-rh);ctx.lineTo(rw*.70,-rh*.42);ctx.lineTo(rw,rh*.15);ctx.lineTo(rw*.34,rh);ctx.lineTo(-rw*.64,rh*.58);ctx.closePath();ctx.fill();
    if(i%2===0){ctx.strokeStyle='rgba(92,116,75,.16)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-rw*.5,rh*.35);ctx.lineTo(rw*.18,rh*.45);ctx.stroke();}
    ctx.restore();
  });
  ctx.restore();
};
const drawDrainage=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  const drains=[[.438,.20,-.05],[.558,.34,.04],[.440,.53,-.04],[.559,.69,.05],[.443,.84,-.03]] as const;
  for(const [x,y,r] of drains){
    ctx.save();ctx.translate(x*W,y*H);ctx.rotate(r);ctx.fillStyle='rgba(10,14,16,.66)';ctx.fillRect(-12,-3,24,6);
    ctx.strokeStyle='rgba(151,157,153,.28)';ctx.lineWidth=1;for(let i=-9;i<=9;i+=4){ctx.beginPath();ctx.moveTo(i,-2);ctx.lineTo(i,2);ctx.stroke();}ctx.restore();
  }
  // Damp gutters follow short sections of the road edge rather than random puddles in the field.
  ctx.strokeStyle='rgba(18,38,38,.24)';ctx.lineWidth=5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(W*.435,H*.28);ctx.quadraticCurveTo(W*.42,H*.39,W*.438,H*.49);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W*.565,H*.57);ctx.quadraticCurveTo(W*.58,H*.68,W*.558,H*.79);ctx.stroke();
  ctx.restore();
};

const drawEdgeVegetation=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  const pockets=[
    [.045,.20,1.0],[.11,.55,.8],[.27,.30,.72],[.34,.88,.85],[.66,.15,.75],[.73,.58,.8],[.90,.33,.9],[.93,.78,1.0],
    [.405,.29,.55],[.588,.61,.55]
  ] as const;
  for(const [x,y,s] of pockets){
    const px=x*W,py=y*H;ctx.strokeStyle='rgba(57,91,60,.68)';ctx.lineWidth=1;
    for(let i=0;i<7;i++){const dx=(i-3)*2.1*s,lean=(i%2?2:-2)*s;ctx.beginPath();ctx.moveTo(px+dx,py);ctx.lineTo(px+dx+lean,py-(5+(i%3)*2)*s);ctx.stroke();}
    if(s>.8){ctx.fillStyle='rgba(54,94,67,.36)';for(const ox of [-6,3]){ctx.beginPath();ctx.arc(px+ox,py-2,4*s,0,Math.PI*2);ctx.fill();}}
  }
  ctx.restore();
};

const drawPaverPocket=(ctx:CanvasRenderingContext2D,W:number,H:number,nx:number,ny:number,scale:number,rot:number,seed:number)=>{
  ctx.save();ctx.translate(nx*W,ny*H);ctx.rotate(rot);
  const cols=5,rows=3,tileW=8*scale,tileH=5*scale;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const n=seeded(seed+r*17+c*23);if(n<.22)continue;
    const x=(c-cols*.5)*tileW+(r%2)*tileW*.35,y=(r-1)*tileH;
    ctx.fillStyle=n>.72?'rgba(143,131,113,.23)':'rgba(114,112,104,.21)';
    ctx.beginPath();ctx.roundRect(x,y,tileW-1.5,tileH-1.3,1);ctx.fill();
    if(n>.84){ctx.strokeStyle='rgba(183,174,156,.10)';ctx.lineWidth=.7;ctx.stroke();}
  }
  ctx.restore();
};
const drawBrokenPaving=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const pockets=[
    [.135,.285,.90,-.08,11],[.295,.565,.78,.10,21],[.685,.265,.82,-.06,31],
    [.815,.475,.72,.07,41],[.205,.855,.85,-.10,51],[.755,.825,.78,.08,61]
  ] as const;
  for(const [x,y,s,r,seed] of pockets)drawPaverPocket(ctx,W,H,x,y,s,r,seed);
};
const drawPlantCluster=(ctx:CanvasRenderingContext2D,W:number,H:number,nx:number,ny:number,scale:number,seed:number)=>{
  const x=nx*W,y=ny*H;
  ctx.save();
  ctx.fillStyle='rgba(83,68,48,.16)';ctx.beginPath();ctx.ellipse(x,y+2,18*scale,6*scale,.08,0,Math.PI*2);ctx.fill();
  for(let i=0;i<9;i++){
    const a=seeded(seed+i*13)*Math.PI*2,d=(4+seeded(seed+i*19)*12)*scale;
    const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.36;
    const rr=(2.5+seeded(seed+i*29)*4.2)*scale;
    ctx.fillStyle=i%3===0?'rgba(76,126,80,.58)':i%3===1?'rgba(55,107,70,.64)':'rgba(91,134,79,.50)';
    ctx.beginPath();ctx.arc(px,py-rr*.35,rr,0,Math.PI*2);ctx.fill();
  }
  ctx.strokeStyle='rgba(79,120,72,.58)';ctx.lineWidth=1;
  for(let i=0;i<8;i++){
    const dx=(i-3.5)*2.1*scale,len=(5+(i%4)*2)*scale;
    ctx.beginPath();ctx.moveTo(x+dx,y);ctx.quadraticCurveTo(x+dx+(i%2?2:-2)*scale,y-len*.55,x+dx+(i%2?3:-3)*scale,y-len);ctx.stroke();
  }
  ctx.restore();
};

const drawUrbanColorAccents=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  // Muted ceramic/paint remnants: color belongs to materials, never to floating UI decoration.
  const patches=[
    [.105,.272,.040,.010,'rgba(35,139,161,.19)'],[.285,.615,.034,.009,'rgba(204,103,58,.18)'],
    [.705,.292,.036,.009,'rgba(211,157,53,.17)'],[.835,.535,.042,.010,'rgba(42,133,147,.16)'],
    [.155,.785,.038,.009,'rgba(190,83,57,.16)'],[.735,.805,.040,.010,'rgba(212,161,66,.15)']
  ] as const;
  for(const [nx,ny,nw,nh,col] of patches){
    ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(nx*W,ny*H,nw*W,Math.max(3,nh*H),2);ctx.fill();
  }
  ctx.restore();
};

const drawVegetationCorridors=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  // Connected green seams make vegetation follow drainage/lot edges instead of reading as scatter.
  const seams=[
    [.03,.18,.12,.24,.19,.31],[.04,.67,.12,.72,.20,.80],
    [.80,.17,.88,.23,.96,.30],[.81,.69,.90,.74,.97,.82]
  ] as const;
  ctx.strokeStyle='rgba(48,91,58,.24)';ctx.lineWidth=5;ctx.lineCap='round';
  for(const [x1,y1,cx,cy,x2,y2] of seams){
    ctx.beginPath();ctx.moveTo(x1*W,y1*H);ctx.quadraticCurveTo(cx*W,cy*H,x2*W,y2*H);ctx.stroke();
  }
  ctx.strokeStyle='rgba(82,132,76,.48)';ctx.lineWidth=1;
  seams.forEach(([x1,y1,cx,cy,x2,y2],si)=>{
    for(let i=0;i<9;i++){
      const t=(i+.25)/9,u=1-t;
      const x=(u*u*x1+2*u*t*cx+t*t*x2)*W;
      const y=(u*u*y1+2*u*t*cy+t*t*y2)*H;
      const lean=((i+si)%2?2:-2);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+lean,y-5-(i%3)*2);ctx.stroke();
    }
  });
  ctx.restore();
};

const drawNatureIntegration=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const clusters=[
    [.035,.165,1.0,101],[.085,.535,.82,111],[.315,.185,.70,121],[.335,.905,.88,131],
    [.655,.145,.72,141],[.905,.305,.92,151],[.925,.705,1.0,161],[.665,.925,.76,171],
    [.165,.335,.52,181],[.225,.645,.50,191],[.785,.185,.48,201],[.825,.645,.52,211],
    [.145,.915,.52,221],[.855,.900,.48,231]
  ] as const;
  clusters.forEach(([x,y,s,seed])=>drawPlantCluster(ctx,W,H,x,y,s,seed));
  // Drainage weeds appear in short runs, not as a global grass scatter.
  const seams=[[.430,.34,.455,.40],[.552,.59,.574,.65],[.214,.61,.236,.64],[.774,.39,.797,.42]] as const;
  ctx.strokeStyle='rgba(70,112,69,.48)';ctx.lineWidth=1;
  for(const [x1,y1,x2,y2] of seams){for(let i=0;i<5;i++){const t=(i+.4)/5,x=(x1+(x2-x1)*t)*W,y=(y1+(y2-y1)*t)*H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(i%2?2:-2),y-5-(i%3)*2);ctx.stroke();}}
  // Leaf litter stays close to the larger plants.
  ctx.fillStyle='rgba(145,104,57,.20)';
  for(const [x,y] of [[.06,.18],[.10,.55],[.91,.32],[.92,.72],[.67,.93]] as const){
    for(let i=0;i<4;i++){ctx.save();ctx.translate(x*W+i*4,y*H+(i%2)*3);ctx.rotate((i-.5)*.4);ctx.fillRect(-2,-1,4,2);ctx.restore();}
  }
};

const drawPocketGarden=(ctx:CanvasRenderingContext2D,W:number,H:number,nx:number,ny:number,scale:number,seed:number)=>{
  const x=nx*W,y=ny*H;
  ctx.save();
  ctx.fillStyle='rgba(81,59,39,.32)';ctx.beginPath();ctx.ellipse(x,y,22*scale,8*scale,-.08,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(156,131,96,.24)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,y,23*scale,9*scale,-.08,0,Math.PI*2);ctx.fill();
  for(let i=0;i<12;i++){
    const a=seeded(seed+i*31)*Math.PI*2,d=(3+seeded(seed+i*17)*15)*scale;
    const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.38;
    const rr=(2.3+seeded(seed+i*47)*3.4)*scale;
    ctx.fillStyle=i%4===0?'rgba(104,151,82,.78)':i%4===1?'rgba(55,111,67,.82)':i%4===2?'rgba(71,133,79,.76)':'rgba(131,156,84,.62)';
    ctx.beginPath();ctx.arc(px,py-rr*.35,rr,0,Math.PI*2);ctx.fill();
    if(i%3===0){ctx.fillStyle='rgba(210,166,69,.42)';ctx.beginPath();ctx.arc(px+rr*.4,py-rr*.8,Math.max(1,rr*.22),0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
};

const drawDomesticGardens=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const gardens=[
    [.070,.365,1.05,2601],[.275,.245,.78,2701],[.115,.845,.98,2801],
    [.895,.205,.82,2901],[.915,.585,1.08,3001],[.765,.865,.86,3101]
  ] as const;
  gardens.forEach(([x,y,s,seed])=>drawPocketGarden(ctx,W,H,x,y,s,seed));
  // Ceramic fragments and painted doorstep mosaics add color without becoming UI markers.
  const shards=[
    [.118,.335,3201],[.305,.735,3301],[.835,.325,3401],[.845,.785,3501]
  ] as const;
  const colors=['rgba(29,130,154,.40)','rgba(194,99,61,.38)','rgba(205,151,52,.38)','rgba(219,215,191,.28)'] as const;
  for(const [nx,ny,seed] of shards){
    const x=nx*W,y=ny*H;
    for(let i=0;i<5;i++){
      const dx=(i-2)*5+seeded(seed+i*11)*2,dy=(i%2)*3+seeded(seed+i*19)*2;
      ctx.fillStyle=colors[i%colors.length];ctx.save();ctx.translate(x+dx,y+dy);ctx.rotate((seeded(seed+i*23)-.5)*.5);ctx.fillRect(-2.5,-1.5,5,3);ctx.restore();
    }
  }
};

const drawLocalConcreteRepairs=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const repairs=[
    [[.405,.115],[.444,.105],[.459,.135],[.423,.148]],
    [[.540,.445],[.577,.438],[.584,.466],[.548,.478]],
    [[.414,.785],[.449,.774],[.463,.805],[.426,.817]]
  ] as const;
  for(const pts of repairs){
    irregularBlob(ctx,W,H,pts,'rgba(121,120,112,.115)','rgba(174,168,154,.075)');
  }
};
const drawEdgeEmbankments=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  irregularBlob(ctx,W,H,[[0,.10],[.045,.08],[.082,.18],[.065,.36],[.095,.52],[.070,.72],[.10,.88],[.055,1],[0,1]],'rgba(102,76,50,.095)');
  irregularBlob(ctx,W,H,[[1,.08],[.955,.10],[.925,.24],[.945,.40],[.910,.58],[.936,.76],[.905,.90],[.948,1],[1,1]],'rgba(67,88,65,.085)');
  ctx.strokeStyle='rgba(153,124,88,.12)';ctx.lineWidth=2;ctx.lineCap='round';
  for(const [x1,y1,cx,cy,x2,y2] of [[.015,.29,.05,.31,.085,.28],[.02,.61,.055,.59,.095,.63],[.91,.34,.95,.31,.985,.35],[.905,.72,.95,.75,.99,.71]] as const){ctx.beginPath();ctx.moveTo(W*x1,H*y1);ctx.quadraticCurveTo(W*cx,H*cy,W*x2,H*y2);ctx.stroke();}
  ctx.strokeStyle='rgba(35,55,43,.24)';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(W*.018,H*.78);ctx.quadraticCurveTo(W*.055,H*.82,W*.09,H*.80);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W*.91,H*.18);ctx.quadraticCurveTo(W*.95,H*.21,W*.985,H*.19);ctx.stroke();
  ctx.restore();
};
const drawLotMaterialMosaic=(ctx:CanvasRenderingContext2D,footprints:readonly GroundFootprint[]=[])=>{
  ctx.save();footprints.forEach((b,i)=>{if(i%2===1)return;const dir=i%4===0?-1:1,x=dir<0?b.x-17:b.x+b.w+5,y=b.y+b.h-8;
    ctx.fillStyle=i%3===0?'rgba(130,112,88,.09)':'rgba(112,117,108,.075)';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dir*12,y-3);ctx.lineTo(x+dir*15,y+7);ctx.lineTo(x+dir*4,y+11);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(177,165,143,.08)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+dir*3,y+2);ctx.lineTo(x+dir*11,y+4);ctx.stroke();
  });ctx.restore();
};

const drawLotConnections=(ctx:CanvasRenderingContext2D,W:number,H:number,footprints:readonly GroundFootprint[]=[])=>{
  ctx.save();
  footprints.forEach((b,i)=>{
    const cx=b.x+b.w*.5,cy=b.y+b.h*.58;
    const nx=cx/W;
    const targetNx=nx<.34?.22:nx>.66?.78:.50;
    const targetX=targetNx*W;
    const dir=targetX>=cx?1:-1;
    const startX=dir>0?b.x+b.w+2:b.x-2;
    const startY=Math.max(b.y+10,Math.min(b.y+b.h-8,cy+(seeded(4100+i*37)-.5)*14));
    const endY=startY+(seeded(4300+i*41)-.5)*24;
    const midX=(startX+targetX)*.5;
    const midY=(startY+endY)*.5+(seeded(4500+i*43)-.5)*18;

    // Dirt/concrete threshold path, kept deliberately soft so it reads as circulation rather than a collider.
    ctx.strokeStyle=i%3===0?'rgba(134,96,57,.24)':'rgba(126,111,88,.20)';
    ctx.lineWidth=16;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(startX,startY);ctx.quadraticCurveTo(midX,midY,targetX,endY);ctx.stroke();
    ctx.strokeStyle=i%3===0?'rgba(178,141,95,.16)':'rgba(165,157,137,.13)';
    ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(startX,startY);ctx.quadraticCurveTo(midX,midY,targetX,endY);ctx.stroke();
    ctx.strokeStyle='rgba(226,216,196,.055)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(startX,startY);ctx.quadraticCurveTo(midX,midY,targetX,endY);ctx.stroke();
  });
  ctx.restore();
};

const drawTerraceFootprints=(ctx:CanvasRenderingContext2D,W:number,H:number,footprints:readonly GroundFootprint[]=[])=>{
  ctx.save();
  footprints.forEach((b,i)=>{
    const pad=12+(i%3)*3;
    const x=b.x-pad,y=b.y-pad*.62,w=b.w+pad*2,h=b.h+pad*1.35;
    ctx.strokeStyle=i%2===0?'rgba(194,150,97,.075)':'rgba(155,168,137,.065)';
    ctx.lineWidth=1.2;ctx.setLineDash([9+(i%2)*4,7]);
    ctx.beginPath();ctx.roundRect(x,y,w,h,8);ctx.stroke();ctx.setLineDash([]);
    // Small paver stitches at the occupied edge give the lot a human scale.
    ctx.fillStyle=i%3===0?'rgba(202,118,72,.12)':i%3===1?'rgba(42,140,155,.10)':'rgba(207,164,72,.10)';
    const yy=b.y+b.h+7;
    for(let k=0;k<4;k++)ctx.fillRect(b.x+6+k*7,yy+(k%2),5,3);
  });
  ctx.restore();
};

const drawBuildingGroundContact=(ctx:CanvasRenderingContext2D,W:number,H:number,footprints:readonly GroundFootprint[]=[])=>{
  ctx.save();
  footprints.forEach((b,i)=>{
    const seed=seeded(1701+i*47+Math.round(b.x+b.y)),pad=8+seed*6;
    const x=b.x-pad,y=b.y-pad,w=b.w+pad*2,h=b.h+pad*2,j=(seed-.5)*5;
    ctx.beginPath();ctx.moveTo(x+4,y+j);ctx.lineTo(x+w-7,y+2);ctx.lineTo(x+w+1,y+h-7);ctx.lineTo(x+w-9,y+h+2);ctx.lineTo(x+6,y+h);ctx.lineTo(x-2,y+8);ctx.closePath();
    ctx.fillStyle=i%3===0?'rgba(123,91,57,.135)':i%3===1?'rgba(91,98,79,.112)':'rgba(112,95,70,.115)';ctx.fill();
    ctx.strokeStyle=i%3===0?'rgba(186,143,91,.075)':'rgba(152,153,127,.060)';ctx.lineWidth=1;ctx.stroke();

    // Contact shadow + worn threshold anchor the building to the same ground material.
    ctx.fillStyle='rgba(19,22,20,.21)';ctx.beginPath();ctx.ellipse(b.x+b.w*.52,b.y+b.h+3,Math.max(12,b.w*.34),4.2,.04,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(155,126,89,.14)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(b.x+4,b.y+b.h+1);ctx.lineTo(b.x+b.w-5,b.y+b.h+1+(i%2?1:-1));ctx.stroke();
    if(i%2===0){ctx.strokeStyle='rgba(69,119,72,.43)';for(let k=0;k<3;k++){const px=b.x+7+k*5;ctx.beginPath();ctx.moveTo(px,b.y+b.h+2);ctx.lineTo(px+(k%2?2:-2),b.y+b.h-4-k);ctx.stroke();}}
  });
  ctx.restore();
};


const drawThresholdLife=(ctx:CanvasRenderingContext2D,footprints:readonly GroundFootprint[]=[])=>{
  ctx.save();
  footprints.forEach((b,i)=>{
    if(i%2!==0) return;
    const y=b.y+b.h+4,x=b.x+b.w*(i%3===0?.28:.62);
    ctx.fillStyle=i%4===0?'rgba(153,128,94,.15)':'rgba(127,126,116,.13)';
    for(let k=0;k<3;k++){
      const ox=(k-1)*5+(i%2?1:-1);ctx.beginPath();ctx.roundRect(x+ox,y+(k%2)*2,5,3,1);ctx.fill();
    }
    if(i%3===0){
      const px=b.x+(i%2?b.w-7:7),py=b.y+b.h+2;
      ctx.strokeStyle='rgba(66,111,70,.40)';ctx.lineWidth=1;
      for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(px+k*2,py);ctx.lineTo(px+k*2+(k%2?2:-2),py-5-k);ctx.stroke();}
    }
  });
  ctx.restore();
};

export const drawT1CommunityYard=(ctx:CanvasRenderingContext2D,W:number,H:number,plaza?:SceneRect)=>{
  if(!plaza)return;
  const x=plaza.x*W,y=plaza.y*H,w=plaza.w*W,h=plaza.h*H;
  ctx.save();
  // 1.1B: irregular community courtyard. It must not read like a clean UI rectangle/camp prototype.
  ctx.beginPath();
  ctx.moveTo(x-4,y+7);ctx.lineTo(x+w*.22,y-5);ctx.lineTo(x+w*.78,y-2);ctx.lineTo(x+w+7,y+10);
  ctx.lineTo(x+w+3,y+h-9);ctx.lineTo(x+w*.72,y+h+5);ctx.lineTo(x+w*.18,y+h+3);ctx.lineTo(x-7,y+h-12);ctx.closePath();
  ctx.fillStyle='rgba(28,30,29,.48)';ctx.fill();
  ctx.strokeStyle='rgba(152,139,117,.10)';ctx.lineWidth=1.4;ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x+3,y+8);ctx.lineTo(x+w*.24,y);ctx.lineTo(x+w*.76,y+2);ctx.lineTo(x+w-2,y+11);
  ctx.lineTo(x+w-5,y+h-10);ctx.lineTo(x+w*.70,y+h-1);ctx.lineTo(x+w*.20,y+h-2);ctx.lineTo(x+1,y+h-12);ctx.closePath();
  ctx.fillStyle='#4e4e47';ctx.fill();

  // Repairs and faded paint give scale while keeping the center free for units.
  ctx.fillStyle='rgba(135,96,57,.20)';ctx.beginPath();ctx.ellipse(x+w*.25,y+h*.73,w*.20,h*.13,-.18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(24,31,31,.24)';ctx.beginPath();ctx.ellipse(x+w*.72,y+h*.34,w*.16,h*.10,.14,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(217,195,151,.075)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+w*.15,y+h*.53);ctx.quadraticCurveTo(x+w*.33,y+h*.48,x+w*.48,y+h*.52);ctx.stroke();
  ctx.fillStyle='rgba(26,122,145,.18)';ctx.fillRect(x+8,y+h-5,w*.12,3);
  ctx.fillStyle='rgba(201,91,55,.16)';ctx.fillRect(x+w*.77,y+h-5,w*.14,3);
  ctx.restore();
};

export function drawT1ReauthoredSurface(
  ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[],plaza?:SceneRect,footprints:readonly GroundFootprint[]=[]
){
  ctx.save();
  drawTerrainFields(ctx,W,H);
  drawNeighborhoodMaterialBridge(ctx,W,H);
  drawEdgeEmbankments(ctx,W,H);
  drawLotConnections(ctx,W,H,footprints);
  drawTerraceFootprints(ctx,W,H,footprints);
  drawBuildingGroundContact(ctx,W,H,footprints);
  drawThresholdLife(ctx,footprints);
  drawLotMaterialMosaic(ctx,footprints);
  drawFineGroundDebris(ctx,W,H);
  paths.forEach((path,index)=>{
    if(path.surface==='asphalt')drawAsphalt(ctx,path,W,H);
    else if(path.surface==='alley')drawAlley(ctx,path,W,H);
    else drawConcretePath(ctx,path,W,H);
    drawSurfaceGrain(ctx,path,W,H,index);
    drawPathRepairs(ctx,path,W,H,index);
  });
  drawShoulderTransitions(ctx,W,H);
  drawDrainage(ctx,W,H);
  drawBrokenPaving(ctx,W,H);
  drawLocalConcreteRepairs(ctx,W,H);
  drawUrbanColorAccents(ctx,W,H);
  drawVegetationCorridors(ctx,W,H);
  drawNatureIntegration(ctx,W,H);
  drawDomesticGardens(ctx,W,H);
  drawT1CommunityYard(ctx,W,H,plaza);
  drawEdgeVegetation(ctx,W,H);
  ctx.restore();
}
