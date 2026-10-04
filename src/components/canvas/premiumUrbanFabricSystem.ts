import { drawCityVivaContextBuilding } from './buildingSkins';

export type FabricHouse=readonly [x:number,y:number,w:number,h:number,variant:number];
export type FabricWall=readonly [x:number,y:number,w:number];
export type FabricStair=readonly [x:number,y:number,w:number,steps:number,flip:boolean];
export type FabricFoliage=readonly [x:number,y:number,scale:number];
export type FabricCanopy=readonly [x:number,y:number,w:number,h:number,color:string];
export type FabricStringLight=readonly [x1:number,y1:number,x2:number,y2:number,count:number];

export interface PremiumUrbanFabricConfig{
  houses:readonly FabricHouse[];
  walls:readonly FabricWall[];
  stairs:readonly FabricStair[];
  foliage:readonly FabricFoliage[];
  canopies:readonly FabricCanopy[];
  stringLights?:readonly FabricStringLight[];
  accent:string;
}

const ROLES=['Casa com Varanda','Sobrado da Viela','Moradia Geminada','Puxadinho de Zinco','Laje Residencial','Mercadinho de Esquina'] as const;
const MATERIALS=['brick','concrete','brick','metal','concrete','brick'] as const;

const drawHouse=(ctx:CanvasRenderingContext2D,W:number,H:number,h:FabricHouse,accent:string)=>{
  const [nx,ny,nw,nh,v]=h,x=nx*W,y=ny*H,w=nw*W,hh=nh*H;
  drawCityVivaContextBuilding(ctx,{
    id:`premium-fabric-${v}-${Math.round(x)}-${Math.round(y)}`,x,y,w,h:hh,
    role:ROLES[v%ROLES.length],material:MATERIALS[v%MATERIALS.length],    hasWaterTank:v%3===0,door:v%2===0?'bottom':'right'
  },v*731,1,1,accent);
  if(v%3!==1){
    const gx=x+w*.5,gy=y+hh+3,r=26+v%4*6;
    const g=ctx.createRadialGradient(gx,gy,1,gx,gy,r);
    g.addColorStop(0,'rgba(255,220,142,.20)');g.addColorStop(.45,'rgba(245,158,11,.085)');g.addColorStop(1,'rgba(245,158,11,0)');
    ctx.save();ctx.globalCompositeOperation='screen';ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(gx,gy,r,r*.36,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
};

const drawWall=(ctx:CanvasRenderingContext2D,W:number,H:number,[x,y,w]:FabricWall)=>{
  ctx.fillStyle='rgba(0,0,0,.19)';ctx.fillRect(x*W+3,y*H+4,w*W,8);
  ctx.fillStyle='#6b6256';ctx.fillRect(x*W,y*H,w*W,8);ctx.fillStyle='rgba(214,202,178,.13)';ctx.fillRect(x*W,y*H,w*W,2);
};
const drawStair=(ctx:CanvasRenderingContext2D,W:number,H:number,[x,y,w,steps,flip]:FabricStair)=>{
  ctx.save();ctx.fillStyle='rgba(102,98,89,.66)';
  for(let i=0;i<steps;i++){
    const yy=y*H+i*5,ww=w*W-i*1.8,xx=flip?x*W+(w*W-ww):x*W;
    ctx.fillRect(xx,yy,ww,4);ctx.fillStyle='rgba(207,201,187,.10)';ctx.fillRect(xx,yy,ww,1);ctx.fillStyle='rgba(102,98,89,.66)';
  }
  ctx.restore();
};

const drawFoliage=(ctx:CanvasRenderingContext2D,W:number,H:number,[x,y,s]:FabricFoliage)=>{
  const px=x*W,py=y*H;ctx.save();ctx.fillStyle='rgba(20,57,38,.30)';ctx.beginPath();ctx.ellipse(px,py,17*s,7*s,0,0,Math.PI*2);ctx.fill();
  for(let i=0;i<7;i++){    const a=i*.89,d=(5+(i%3)*4)*s;
    ctx.fillStyle=i%2?'rgba(50,112,67,.72)':'rgba(72,130,73,.62)';
    ctx.beginPath();ctx.arc(px+Math.cos(a)*d,py+Math.sin(a)*d*.45,3.5*s,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};

const drawStringLight=(ctx:CanvasRenderingContext2D,W:number,H:number,[x1,y1,x2,y2,count]:FabricStringLight)=>{
  const ax=x1*W,ay=y1*H,bx=x2*W,by=y2*H;ctx.save();
  ctx.strokeStyle='rgba(25,29,31,.72)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax,ay);ctx.quadraticCurveTo((ax+bx)/2,(ay+by)/2+8,bx,by);ctx.stroke();
  ctx.globalCompositeOperation='screen';
  for(let i=1;i<count;i++){const u=i/count,x=ax+(bx-ax)*u,y=ay+(by-ay)*u+Math.sin(Math.PI*u)*8;const g=ctx.createRadialGradient(x,y,1,x,y,9);g.addColorStop(0,'rgba(255,236,173,.78)');g.addColorStop(.25,'rgba(245,158,11,.28)');g.addColorStop(1,'rgba(245,158,11,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();}
  ctx.restore();
};

const drawCanopy=(ctx:CanvasRenderingContext2D,W:number,H:number,[x,y,w,h,c]:FabricCanopy)=>{
  ctx.fillStyle='rgba(0,0,0,.20)';ctx.fillRect(W*x+3,H*y+4,W*w,H*h);
  ctx.fillStyle=c;ctx.fillRect(W*x,H*y,W*w,H*h);ctx.fillStyle='rgba(238,225,194,.25)';ctx.fillRect(W*x,H*y,W*w,2);
};

export const drawPremiumUrbanFabric=(ctx:CanvasRenderingContext2D,W:number,H:number,config:PremiumUrbanFabricConfig)=>{
  ctx.save();
  config.houses.forEach(h=>drawHouse(ctx,W,H,h,config.accent));
  config.walls.forEach(w=>drawWall(ctx,W,H,w));
  config.stairs.forEach(s=>drawStair(ctx,W,H,s));
  config.foliage.forEach(f=>drawFoliage(ctx,W,H,f));
  config.canopies.forEach(c=>drawCanopy(ctx,W,H,c));  config.stringLights?.forEach(s=>drawStringLight(ctx,W,H,s));
  ctx.restore();
};
