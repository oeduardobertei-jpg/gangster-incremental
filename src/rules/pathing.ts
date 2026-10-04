import { pointHasWorldClearance, segmentAabbHitT, type WorldCollider } from './collision';

export interface PathingMover {
  x:number; y:number; radius:number; speed:number;
  detourX?:number; detourY?:number; detourTimer?:number; detourTargetId?:string;
  pathCheckTimer?:number;
}

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

const firstMovementBlocker=(
  x1:number,y1:number,x2:number,y2:number,radius:number,colliders:readonly WorldCollider[]
):WorldCollider|null=>{
  let best:WorldCollider|null=null,bestT=Number.POSITIVE_INFINITY;
  for(const c of colliders){
    if(!c.blocksMovement) continue;
    const pad=radius+6;
    const t=segmentAabbHitT(x1,y1,x2,y2,c.minX-pad,c.minY-pad,c.maxX+pad,c.maxY+pad);
    if(t!==null&&t>0.025&&t<bestT){best=c;bestT=t;}
  }
  return best;
};

const waypointCandidates=(c:WorldCollider,radius:number,worldWidth:number,worldHeight:number)=>{
  const gap=radius+18;
  return [
    {x:c.minX-gap,y:c.minY-gap},{x:c.maxX+gap,y:c.minY-gap},
    {x:c.minX-gap,y:c.maxY+gap},{x:c.maxX+gap,y:c.maxY+gap}
  ].map(p=>({x:clamp(p.x,radius+5,worldWidth-radius-5),y:clamp(p.y,radius+5,worldHeight-radius-5)}));
};


const fallbackAroundBlocker=(
  mover:PathingMover,targetX:number,targetY:number,blocker:WorldCollider,biasSeed:number
):{x:number;y:number}=>{
  const vertical=(blocker.maxY-blocker.minY)>=(blocker.maxX-blocker.minX);
  const gap=mover.radius+22;
  if(vertical){
    const center=(blocker.minY+blocker.maxY)/2;
    const goDown=Math.abs(targetY-(blocker.maxY+gap))<Math.abs(targetY-(blocker.minY-gap))
      ? true : Math.abs(targetY-(blocker.maxY+gap))>Math.abs(targetY-(blocker.minY-gap)) ? false : (biasSeed%2===0);
    return {x:mover.x,y:goDown?blocker.maxY+gap:blocker.minY-gap};
  }
  const goRight=Math.abs(targetX-(blocker.maxX+gap))<Math.abs(targetX-(blocker.minX-gap))
    ? true : Math.abs(targetX-(blocker.maxX+gap))>Math.abs(targetX-(blocker.minX-gap)) ? false : (biasSeed%2===0);
  return {x:goRight?blocker.maxX+gap:blocker.minX-gap,y:mover.y};
};

const chooseDetour=(
  mover:PathingMover,targetX:number,targetY:number,blocker:WorldCollider,
  colliders:readonly WorldCollider[],worldWidth:number,worldHeight:number,biasSeed:number
):{x:number;y:number}|null=>{
  const candidates=waypointCandidates(blocker,mover.radius,worldWidth,worldHeight);
  let best:{x:number;y:number;score:number}|null=null;
  for(let i=0;i<candidates.length;i++){
    const c=candidates[i];
    if(!pointHasWorldClearance(c.x,c.y,mover.radius+3,colliders)) continue;
    const firstLeg=firstMovementBlocker(mover.x,mover.y,c.x,c.y,mover.radius,colliders);
    if(firstLeg) continue;
    const d1=Math.hypot(c.x-mover.x,c.y-mover.y);
    const d2=Math.hypot(targetX-c.x,targetY-c.y);
    const parityPenalty=((i+biasSeed)&1)===0?0:5;
    const score=d1+d2+parityPenalty;
    if(!best||score<best.score) best={...c,score};
  }
  return best?{x:best.x,y:best.y}:null;
};

export const applyBlockedTargetDetour=(
  mover:PathingMover,targetX:number,targetY:number,targetId:string|undefined,dt:number,
  colliders:readonly WorldCollider[],worldWidth:number,worldHeight:number,biasSeed:number
):{vx:number;vy:number;active:boolean;created:boolean}=>{
  mover.detourTimer=Math.max(0,(mover.detourTimer??0)-dt);
  mover.pathCheckTimer=Math.max(0,(mover.pathCheckTimer??0)-dt);

  if((mover.detourTimer??0)>0&&mover.detourX!==undefined&&mover.detourY!==undefined&&
     (!targetId||mover.detourTargetId===targetId)){
    const dx=mover.detourX-mover.x,dy=mover.detourY-mover.y;
    const dist=Math.hypot(dx,dy);
    if(dist>14){const speed=Math.max(.35,mover.speed);return{vx:dx/dist*speed,vy:dy/dist*speed,active:true,created:false};}
    mover.detourTimer=0; mover.detourX=undefined; mover.detourY=undefined;
  }

  if((mover.pathCheckTimer??0)>0){
    const dx=targetX-mover.x,dy=targetY-mover.y,dist=Math.hypot(dx,dy)||1;
    return{vx:dx/dist*mover.speed,vy:dy/dist*mover.speed,active:false,created:false};
  }
  mover.pathCheckTimer=.16+(biasSeed%5)*.018;
  const blocker=firstMovementBlocker(mover.x,mover.y,targetX,targetY,mover.radius,colliders);
  if(!blocker){
    const dx=targetX-mover.x,dy=targetY-mover.y,dist=Math.hypot(dx,dy)||1;
    return{vx:dx/dist*mover.speed,vy:dy/dist*mover.speed,active:false,created:false};
  }
  let detour=chooseDetour(mover,targetX,targetY,blocker,colliders,worldWidth,worldHeight,biasSeed);
  if(!detour){
    const fallback=fallbackAroundBlocker(mover,targetX,targetY,blocker,biasSeed);
    const fx=clamp(fallback.x,mover.radius+5,worldWidth-mover.radius-5);
    const fy=clamp(fallback.y,mover.radius+5,worldHeight-mover.radius-5);
    if(pointHasWorldClearance(fx,fy,mover.radius+2,colliders)) detour={x:fx,y:fy};
  }
  if(!detour){
    // Never push directly into a known solid. Hold a small tangent until the next path check.
    const vertical=(blocker.maxY-blocker.minY)>=(blocker.maxX-blocker.minX);
    const side=biasSeed%2===0?1:-1;
    return vertical
      ? {vx:0,vy:mover.speed*.55*side,active:true,created:false}
      : {vx:mover.speed*.55*side,vy:0,active:true,created:false};
  }
  mover.detourX=detour.x; mover.detourY=detour.y; mover.detourTimer=1.65; mover.detourTargetId=targetId;
  const dx=detour.x-mover.x,dy=detour.y-mover.y,dist=Math.hypot(dx,dy)||1;
  return{vx:dx/dist*mover.speed,vy:dy/dist*mover.speed,active:true,created:true};
};
