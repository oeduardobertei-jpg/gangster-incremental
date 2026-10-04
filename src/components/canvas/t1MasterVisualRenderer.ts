import type { ScenePath } from '../../data/territoryScenes';
import { getPremiumUrbanProfile } from '../../data/premiumUrbanProfiles';
import {
  drawPremiumAmbientOverlay,
  drawPremiumFoundationDetails,
  drawPremiumRoadUnderlay
} from './premiumUrbanSystem';
import { drawT1UrbanFabric } from './t1UrbanFabricRenderer';

const PROFILE=getPremiumUrbanProfile(1)!;

const blob=(ctx:CanvasRenderingContext2D,W:number,H:number,pts:readonly (readonly [number,number])[],fill:string,stroke?:string)=>{
  ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
};

export const drawT1MasterGroundUnderlay=(ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[])=>{
  drawPremiumRoadUnderlay(ctx,W,H,paths,PROFILE);
};
const drawCornerPockets=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  const pockets=[
    [[.36,.24],[.43,.22],[.445,.31],[.405,.35],[.355,.32]],
    [[.56,.25],[.64,.23],[.655,.32],[.61,.36],[.555,.33]],
    [[.34,.55],[.42,.53],[.445,.61],[.405,.66],[.345,.63]],    [[.56,.55],[.64,.53],[.66,.62],[.615,.67],[.555,.63]]
  ] as const;
  pockets.forEach((pts,i)=>{
    blob(ctx,W,H,pts,i%2?'rgba(87,82,70,.045)':'rgba(102,90,72,.040)','rgba(184,167,137,.065)');
  });
  ctx.restore();
};

const drawCrosswalkHints=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();ctx.fillStyle='rgba(222,217,204,.13)';
  for(const y of [.34,.67])for(let i=0;i<5;i++)ctx.fillRect(W*(.465+i*.014),H*y,8,H*.012);
  ctx.restore();
};
export const drawT1MasterFoundationDetails=(ctx:CanvasRenderingContext2D,W:number,H:number)=>{
  ctx.save();
  drawCornerPockets(ctx,W,H);
  drawCrosswalkHints(ctx,W,H);
  drawT1UrbanFabric(ctx,W,H);
  drawPremiumFoundationDetails(ctx,W,H,PROFILE);
  ctx.restore();
};

export const drawT1MasterAmbientOverlay=(ctx:CanvasRenderingContext2D,W:number,H:number,time:number)=>{
  drawPremiumAmbientOverlay(ctx,W,H,time,PROFILE);
};
