import type { ScenePath } from '../../data/territoryScenes';
import type { PremiumUrbanProfile } from '../../data/premiumUrbanProfiles';

const pathLine=(ctx:CanvasRenderingContext2D,p:ScenePath,W:number,H:number)=>{
  ctx.beginPath();
  p.points.forEach((q,i)=>i?ctx.lineTo(q.x*W,q.y*H):ctx.moveTo(q.x*W,q.y*H));
};

export const drawPremiumRoadUnderlay=(
  ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[],profile:PremiumUrbanProfile
)=>{
  const main=paths.find(p=>p.surface==='asphalt');
  if(!main) return;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  pathLine(ctx,main,W,H);ctx.strokeStyle=profile.road.shoulderColor;
  ctx.lineWidth=Math.max(main.width+profile.road.shoulderExtra,92);ctx.stroke();
  pathLine(ctx,main,W,H);ctx.strokeStyle=profile.road.roadBedColor;
  ctx.lineWidth=Math.max(main.width+profile.road.roadBedExtra,78);ctx.stroke();
  ctx.restore();
};
const drawPlanter=(ctx:CanvasRenderingContext2D,x:number,y:number,s:number)=>{
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='rgba(78,62,45,.88)';ctx.fillRect(-12*s,2*s,24*s,7*s);
  ctx.fillStyle='rgba(164,132,87,.28)';ctx.fillRect(-12*s,2*s,24*s,2*s);
  for(let i=0;i<7;i++){
    const px=(i-3)*3.2*s,hh=(5+(i%3)*3)*s;    ctx.strokeStyle=i%2?'rgba(60,118,72,.80)':'rgba(76,137,80,.74)';ctx.lineWidth=1.2*s;
    ctx.beginPath();ctx.moveTo(px,2*s);ctx.lineTo(px+(i%2?2:-2)*s,-hh);ctx.stroke();
    ctx.fillStyle=i%3===0?'rgba(112,163,87,.68)':'rgba(61,117,70,.70)';
    ctx.beginPath();ctx.arc(px+(i%2?2:-2)*s,-hh,2.8*s,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};

export const drawPremiumPlanters=(ctx:CanvasRenderingContext2D,W:number,H:number,profile:PremiumUrbanProfile)=>{
  profile.planters.forEach(([x,y,s])=>drawPlanter(ctx,W*x,H*y,s));
};
const drawVegetationCluster=(ctx:CanvasRenderingContext2D,x:number,y:number,s:number)=>{
  ctx.save();ctx.fillStyle='rgba(21,62,41,.28)';ctx.beginPath();ctx.ellipse(x,y,30*s,13*s,.08,0,Math.PI*2);ctx.fill();
  for(let i=0;i<9;i++){
    const a=(i/9)*Math.PI*2+(i%2)*.18,d=(8+(i%4)*5)*s;
    const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.48;
    ctx.fillStyle=i%3===0?'rgba(53,116,66,.72)':i%3===1?'rgba(41,91,60,.72)':'rgba(72,129,70,.62)';
    ctx.beginPath();ctx.arc(px,py,4.5*s,0,Math.PI*2);ctx.fill();
  }
  if(s>1.1){
    ctx.strokeStyle='rgba(89,70,45,.82)';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x+8*s,y+4*s);ctx.lineTo(x+6*s,y-22*s);ctx.stroke();
    ctx.strokeStyle='rgba(47,111,68,.72)';ctx.lineWidth=3;
    for(let j=0;j<6;j++){const a=-2.6+j*.62;ctx.beginPath();ctx.moveTo(x+6*s,y-22*s);ctx.lineTo(x+6*s+Math.cos(a)*18*s,y-22*s+Math.sin(a)*8*s);ctx.stroke();}
  }
  ctx.restore();
};
export const drawPremiumVegetation=(ctx:CanvasRenderingContext2D,W:number,H:number,profile:PremiumUrbanProfile)=>{
  profile.vegetation.forEach(([x,y,s])=>drawVegetationCluster(ctx,W*x,H*y,s));
};
export const drawPremiumBenches=(ctx:CanvasRenderingContext2D,W:number,H:number,profile:PremiumUrbanProfile)=>{
  ctx.save();
  for(const [x,y,r] of profile.benches){
    ctx.save();ctx.translate(W*x,H*y);ctx.rotate(r);
    ctx.fillStyle='rgba(52,43,34,.88)';ctx.fillRect(-14,-2,28,4);
    ctx.fillStyle='rgba(117,89,59,.82)';ctx.fillRect(-12,-5,24,4);
    ctx.fillRect(-10,2,2,7);ctx.fillRect(8,2,2,7);ctx.restore();
  }
  ctx.restore();
};

const warmPool=(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,a:number)=>{
  const g=ctx.createRadialGradient(x,y,1,x,y,r);
  g.addColorStop(0,`rgba(255,225,148,${a})`);
  g.addColorStop(.25,`rgba(255,180,70,${a*.62})`);
  g.addColorStop(.65,`rgba(232,126,35,${a*.20})`);
  g.addColorStop(1,'rgba(232,126,35,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
};
export const drawPremiumAmbientOverlay=(
  ctx:CanvasRenderingContext2D,W:number,H:number,time:number,profile:PremiumUrbanProfile
)=>{
  ctx.save();ctx.globalCompositeOperation='screen';
  const pulse=.96+Math.sin(time*.0015)*.04;  profile.lights.forEach(([x,y,r,a])=>warmPool(ctx,W*x,H*y,r*pulse,a));
  ctx.fillStyle=profile.ambientWash;ctx.fillRect(0,0,W,H);
  ctx.restore();
};

export const drawPremiumFoundationDetails=(
  ctx:CanvasRenderingContext2D,W:number,H:number,profile:PremiumUrbanProfile
)=>{
  drawPremiumVegetation(ctx,W,H,profile);
  drawPremiumPlanters(ctx,W,H,profile);
  drawPremiumBenches(ctx,W,H,profile);
};
