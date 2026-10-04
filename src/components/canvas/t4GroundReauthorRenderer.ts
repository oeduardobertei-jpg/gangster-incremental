import type { ScenePath } from '../../data/territoryScenes';

type GroundFootprint={x:number;y:number;w:number;h:number};
const seeded=(n:number)=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
const linePath=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{
  ctx.beginPath();path.points.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H):ctx.moveTo(p.x*W,p.y*H));
};
const strokePath=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number,color:string,width:number,alpha=1)=>{
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';linePath(ctx,path,W,H);ctx.stroke();ctx.restore();
};
const blob=(ctx:CanvasRenderingContext2D,W:number,H:number,pts:readonly (readonly [number,number])[],fill:string,stroke?:string)=>{
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
};

const drawSlopeFields=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  blob(ctx,W,H,[[0,.04],[.35,.03],[.38,.16],[.29,.24],[.08,.22],[0,.18]],'rgba(116,78,49,.10)');
  blob(ctx,W,H,[[.62,.03],[1,.04],[1,.23],[.85,.25],[.68,.18]],'rgba(92,68,48,.085)');
  blob(ctx,W,H,[[0,.33],[.31,.30],[.38,.43],[.28,.52],[.07,.50],[0,.45]],'rgba(105,72,47,.085)');
  blob(ctx,W,H,[[.64,.31],[1,.34],[1,.53],[.82,.50],[.66,.43]],'rgba(88,64,46,.075)');
  blob(ctx,W,H,[[0,.61],[.30,.58],[.38,.70],[.29,.82],[.08,.80],[0,.75]],'rgba(97,65,43,.09)');
  blob(ctx,W,H,[[.63,.59],[1,.61],[1,.84],[.83,.81],[.66,.71]],'rgba(82,61,44,.075)');
  ctx.restore();
};
const drawHillRoad=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{
  const w=Math.max(66,path.width*.78);
  strokePath(ctx,path,W,H,'#604730',w+20,.43);
  strokePath(ctx,path,W,H,'#2b2928',w+12,.88);
  strokePath(ctx,path,W,H,'#343337',w,1);
  strokePath(ctx,path,W,H,'#414046',Math.max(10,w-18),.34);
};
const drawRoadDamage=(ctx:CanvasRenderingContext2D,path:ScenePath,W:number,H:number)=>{
  if(path.points.length<2)return;ctx.save();
  for(let s=0;s<path.points.length-1;s++){
    const a=path.points[s],b=path.points[s+1],ax=a.x*W,ay=a.y*H,bx=b.x*W,by=b.y*H,angle=Math.atan2(by-ay,bx-ax);
    for(let k=0;k<2;k++){
      const r=seeded(401+s*31+k*19),t=.25+k*.46+r*.08,x=ax+(bx-ax)*t,y=ay+(by-ay)*t;
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.translate(0,(r-.5)*path.width*.35);
      const rw=10+r*14,rh=3+r*2.5;ctx.fillStyle='rgba(11,13,15,.25)';
      ctx.beginPath();ctx.moveTo(-rw,0);ctx.lineTo(-rw*.36,-rh);ctx.lineTo(rw*.52,-rh*.42);ctx.lineTo(rw,rh*.18);ctx.lineTo(rw*.24,rh);ctx.lineTo(-rw*.68,rh*.52);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(143,133,120,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-rw*.6,-1);ctx.lineTo(-2,1);ctx.lineTo(rw*.55,-1);ctx.stroke();ctx.restore();
    }
  }
  ctx.restore();
};
const drawSlopeGrade=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'rgba(155,101,65,.055)');g.addColorStop(.48,'rgba(116,76,50,.018)');g.addColorStop(1,'rgba(16,12,10,.075)');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();
};
const drawExposedEarthCuts=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const cuts=[
    [[.05,.30],[.16,.285],[.25,.31],[.22,.35],[.09,.355]],[[.70,.29],[.82,.28],[.94,.31],[.90,.35],[.76,.345]],
    [[.08,.56],[.19,.545],[.30,.57],[.26,.61],[.12,.615]],[[.67,.57],[.78,.55],[.92,.58],[.88,.62],[.73,.615]],
    [[.10,.82],[.20,.805],[.30,.83],[.26,.87],[.13,.865]]
  ] as const;
  for(const pts of cuts){blob(ctx,W,H,pts,'rgba(132,78,45,.095)','rgba(184,125,81,.075)');}
};

const drawTerraceLips=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();ctx.lineCap='round';
  const lips=[
    [.045,.255,.18,.248,.31,.263],[.66,.245,.76,.252,.93,.244],
    [.055,.515,.19,.505,.34,.522],[.64,.505,.77,.516,.94,.508],
    [.07,.755,.19,.744,.31,.762],[.67,.752,.79,.764,.92,.754]
  ] as const;
  lips.forEach(([x1,y1,cx,cy,x2,y2],idx)=>{
    // 0.9.7D: terrace edges are broken by erosion rather than one continuous contour line.
    for(const [a,b] of [[0,.42],[.54,1]] as const){
      const q=(t:number)=>{const mt=1-t;return [mt*mt*x1+2*mt*t*cx+t*t*x2,mt*mt*y1+2*mt*t*cy+t*t*y2] as const;};
      const p1=q(a),p2=q((a+b)/2),p3=q(b),j=(idx%2?1:-1)*.002;
      ctx.strokeStyle='rgba(35,27,22,.24)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(W*p1[0],H*(p1[1]+.006));ctx.quadraticCurveTo(W*p2[0],H*(p2[1]+.006+j),W*p3[0],H*(p3[1]+.006));ctx.stroke();
      ctx.strokeStyle='rgba(139,107,80,.40)';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(W*p1[0],H*p1[1]);ctx.quadraticCurveTo(W*p2[0],H*(p2[1]+j),W*p3[0],H*p3[1]);ctx.stroke();
      ctx.strokeStyle='rgba(205,166,126,.12)';ctx.lineWidth=.8;ctx.stroke();
    }
  });
  ctx.restore();
};
const drawRoadShoulderSpills=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const spills=[
    [[.405,.18],[.445,.16],[.468,.19],[.452,.23],[.414,.225]],
    [[.535,.37],[.575,.35],[.595,.39],[.578,.43],[.545,.42]],
    [[.405,.56],[.448,.54],[.470,.58],[.452,.62],[.414,.615]],
    [[.515,.77],[.552,.75],[.574,.79],[.553,.83],[.522,.82]]
  ] as const;
  for(const pts of spills)blob(ctx,W,H,pts,'rgba(121,78,46,.11)','rgba(177,119,74,.06)');
};
const drawRubbleFans=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  const fans=[[.31,.265,701],[.66,.245,711],[.34,.525,721],[.64,.515,731],[.31,.765,741],[.68,.755,751]] as const;
  for(const [nx,ny,seed] of fans){
    for(let i=0;i<6;i++){const r=seeded(seed+i*17),a=(r-.5)*1.7,d=5+seeded(seed+i*31)*20,x=nx*W+Math.cos(a)*d,y=ny*H+Math.sin(a)*d*.38;
      const rr=1.4+seeded(seed+i*43)*2.3;ctx.fillStyle=i%3===0?'rgba(151,124,96,.22)':'rgba(91,77,65,.24)';ctx.beginPath();ctx.moveTo(x-rr,y+1);ctx.lineTo(x,y-rr);ctx.lineTo(x+rr*1.3,y);ctx.lineTo(x+rr*.3,y+rr);ctx.closePath();ctx.fill();}
  }
  ctx.restore();
};

const drawErosionRuns=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();ctx.lineCap='round';
  for(const [x1,y1,cx,cy,x2,y2] of [[.16,.29,.14,.39,.18,.49],[.29,.57,.25,.66,.28,.74],[.82,.29,.86,.39,.81,.48],[.72,.58,.76,.66,.73,.73]] as const){
    ctx.strokeStyle='rgba(42,29,21,.24)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(W*x1,H*y1);ctx.quadraticCurveTo(W*cx,H*cy,W*x2,H*y2);ctx.stroke();
    ctx.strokeStyle='rgba(148,111,75,.10)';ctx.lineWidth=1;ctx.stroke();
  }
  ctx.restore();
};
const drawDryTuft=(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,seed:number)=>{
  ctx.save();ctx.fillStyle='rgba(75,58,39,.16)';ctx.beginPath();ctx.ellipse(x,y+2,12*s,4*s,.1,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(121,122,69,.62)';ctx.lineWidth=1;
  for(let i=0;i<7;i++){const r=seeded(seed+i*17),dx=(i-3)*2*s;ctx.beginPath();ctx.moveTo(x+dx,y);ctx.lineTo(x+dx+(r-.5)*5*s,y-(4+r*6)*s);ctx.stroke();}
  ctx.restore();
};
const drawDryNature=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const tufts=[
    [.05,.20,.85,501],[.12,.47,.72,511],[.23,.31,.62,521],[.31,.86,.80,531],
    [.69,.18,.66,541],[.79,.45,.74,551],[.91,.28,.82,561],[.92,.72,.90,571],[.71,.86,.70,581]
  ] as const;
  tufts.forEach(([x,y,s,seed])=>drawDryTuft(ctx,x*W,y*H,s,seed));
  ctx.fillStyle='rgba(150,104,59,.14)';
  for(const [x,y] of [[.12,.50],[.30,.87],[.80,.47],[.91,.74]] as const){for(let i=0;i<4;i++){ctx.save();ctx.translate(x*W+i*4,y*H+(i%2)*2);ctx.rotate((i-1)*.32);ctx.fillRect(-2,-1,4,2);ctx.restore();}}
};
const drawDryShrub=(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,seed:number)=>{
  ctx.save();ctx.fillStyle='rgba(40,31,24,.18)';ctx.beginPath();ctx.ellipse(x+3,y+5,15*s,5*s,.08,0,Math.PI*2);ctx.fill();
  const cols=['rgba(67,83,49,.58)','rgba(82,96,53,.54)','rgba(105,104,58,.46)'];
  for(let i=0;i<6;i++){const a=seeded(seed+i*23)*Math.PI*2,d=(3+seeded(seed+i*37)*8)*s,r=(3+seeded(seed+i*41)*4)*s;ctx.fillStyle=cols[i%cols.length];ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y-2+Math.sin(a)*d*.4,r,0,Math.PI*2);ctx.fill();}
  ctx.restore();
};
const drawSlopeShrubs=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  for(const [x,y,s,seed] of [[.10,.255,.72,801],[.26,.515,.58,811],[.14,.755,.68,821],[.88,.245,.64,831],[.76,.515,.62,841],[.86,.755,.72,851]] as const)drawDryShrub(ctx,x*W,y*H,s,seed);
};

const drawErosionFans=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const fans=[
    [[.13,.36],[.18,.39],[.16,.45],[.10,.42]],[[.82,.34],[.88,.37],[.86,.43],[.80,.40]],
    [[.22,.63],[.28,.66],[.25,.72],[.19,.68]],[[.74,.63],[.80,.66],[.78,.72],[.71,.69]]
  ] as const;
  for(const pts of fans){blob(ctx,W,H,pts,'rgba(126,79,45,.070)');
    const [a,b,c]=pts;ctx.strokeStyle='rgba(84,53,35,.16)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(W*a[0],H*a[1]);ctx.lineTo(W*b[0],H*b[1]);ctx.lineTo(W*c[0],H*c[1]);ctx.stroke();
  }
};
const drawConcreteLandings=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const patches=[
    [[.165,.765],[.215,.735],[.236,.758],[.190,.792]],
    [[.744,.445],[.790,.412],[.812,.438],[.766,.472]],
    [[.295,.205],[.338,.198],[.348,.222],[.309,.232]]
  ] as const;
  for(const pts of patches){blob(ctx,W,H,pts,'rgba(111,108,101,.085)','rgba(176,164,148,.07)');}
};
const drawSlopeMicroLife=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  const clusters=[
    [.065,.425,.75,1201],[.185,.285,.58,1211],[.305,.545,.62,1221],[.115,.835,.78,1231],
    [.925,.405,.72,1241],[.845,.285,.58,1251],[.705,.555,.62,1261],[.885,.835,.78,1271]
  ] as const;
  for(const [x,y,s,seed] of clusters){drawDryShrub(ctx,x*W,y*H,s,seed);drawDryTuft(ctx,(x+.018)*W,(y+.018)*H,s*.72,seed+7);}
  ctx.fillStyle='rgba(133,115,89,.18)';
  for(const [x,y,seed] of [[.12,.37,1301],[.31,.62,1311],[.82,.38,1321],[.72,.68,1331]] as const){
    for(let i=0;i<5;i++){const r=seeded(seed+i*13),px=x*W+(r-.5)*20,py=y*H+(seeded(seed+i*19)-.5)*8,rr=1+seeded(seed+i*23)*1.8;ctx.beginPath();ctx.arc(px,py,rr,0,Math.PI*2);ctx.fill();}
  }
};

const drawGroundContact=(ctx:CanvasRenderingContext2D,footprints:readonly GroundFootprint[]=[])=>{
  ctx.save();footprints.forEach((b,i)=>{const r=seeded(901+i*43+Math.round(b.x+b.y)),pad=5+r*5,x=b.x-pad,y=b.y-pad,w=b.w+pad*2,h=b.h+pad*2;
    ctx.beginPath();ctx.moveTo(x+5,y);ctx.lineTo(x+w-8,y+2);ctx.lineTo(x+w,y+h-7);ctx.lineTo(x+w-10,y+h+2);ctx.lineTo(x+6,y+h);ctx.lineTo(x-2,y+7);ctx.closePath();
    ctx.fillStyle=i%3===0?'rgba(116,78,50,.085)':'rgba(89,70,54,.07)';ctx.fill();
    ctx.fillStyle='rgba(35,27,21,.17)';ctx.beginPath();ctx.ellipse(b.x+b.w*.52,b.y+b.h+3,Math.max(11,b.w*.30),3.5,.04,0,Math.PI*2);ctx.fill();
    if(i%2===0)drawDryTuft(ctx,b.x+8,b.y+b.h+2,.55,1100+i*19);
  });ctx.restore();
};
const drawSlopeSteps=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  for(const [x1,y1,x2,y2] of [[.19,.79,.28,.70],[.72,.51,.80,.43]] as const){
    const dx=(x2-x1)*W,dy=(y2-y1)*H,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    ctx.strokeStyle='rgba(111,101,91,.34)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x1*W,y1*H);ctx.lineTo(x2*W,y2*H);ctx.stroke();
    ctx.strokeStyle='rgba(34,28,24,.38)';ctx.lineWidth=1;
    for(let i=1;i<7;i++){const t=i/7,x=(x1+(x2-x1)*t)*W,y=(y1+(y2-y1)*t)*H;ctx.beginPath();ctx.moveTo(x-nx*6,y-ny*6);ctx.lineTo(x+nx*6,y+ny*6);ctx.stroke();}
  }
  ctx.restore();
};
const drawRockFragments=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  for(const [x,y,s] of [[.09,.36,.8],[.34,.46,.65],[.87,.37,.7],[.67,.70,.75],[.18,.88,.7]] as const){
    ctx.fillStyle='rgba(118,104,90,.16)';ctx.beginPath();ctx.moveTo(W*x-8*s,H*y+2);ctx.lineTo(W*x-2,H*y-4*s);ctx.lineTo(W*x+8*s,H*y-2);ctx.lineTo(W*x+5*s,H*y+4*s);ctx.closePath();ctx.fill();
  }
  ctx.restore();
};
export function drawT4ReauthoredSurface(ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[],footprints:readonly GroundFootprint[]=[]){
  ctx.save();drawSlopeFields(ctx,W,H);drawSlopeGrade(ctx,W,H);drawExposedEarthCuts(ctx,W,H);drawGroundContact(ctx,footprints);
  paths.forEach(path=>{if(path.surface==='asphalt')drawHillRoad(ctx,path,W,H);else strokePath(ctx,path,W,H,'#5c5043',path.width,.72);drawRoadDamage(ctx,path,W,H);});
  drawRoadShoulderSpills(ctx,W,H);drawTerraceLips(ctx,W,H);drawRubbleFans(ctx,W,H);drawErosionRuns(ctx,W,H);drawErosionFans(ctx,W,H);drawSlopeSteps(ctx,W,H);drawConcreteLandings(ctx,W,H);drawRockFragments(ctx,W,H);drawDryNature(ctx,W,H);drawSlopeShrubs(ctx,W,H);drawSlopeMicroLife(ctx,W,H);ctx.restore();
}
