import type { TacticalBuilding } from './favelaRenderer';
import { drawCityVivaContextBuilding } from './buildingSkins';
import { getTerritoryPurposeProps } from '../../data/territoryPurposeProps';

type Rect = { x:number; y:number; w:number; h:number };
export type UnifiedSupportSolid = Rect & {
  id:string;
  kind:'building'|'cover'|'wall';
  material:'brick'|'metal'|'concrete'|'mixed';
};

type Args = {
  ctx:CanvasRenderingContext2D;
  width:number;
  height:number;
  territoryId:number;
  buildings:readonly TacticalBuilding[];
  controlColor:string;
};

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const rect=(ctx:CanvasRenderingContext2D,r:Rect,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(r.x,r.y,r.w,r.h);
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.strokeRect(r.x,r.y,r.w,r.h);}
};
const shadow=(ctx:CanvasRenderingContext2D,r:Rect,a=.24)=>{
  ctx.fillStyle=`rgba(0,0,0,${a})`;ctx.fillRect(r.x+6,r.y+7,r.w,r.h);
};
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const smallWindows=(ctx:CanvasRenderingContext2D,r:Rect,color='#202c36')=>{
  ctx.fillStyle=color;for(let x=r.x+9;x<r.x+r.w-8;x+=17)ctx.fillRect(x,r.y+r.h*.45,7,6);
};
const stairToDoor=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,color:string)=>{
  const cx=b.x+b.w/2,cy=b.y+b.h/2,dx=b.doorX-cx,dy=b.doorY-cy;
  if(Math.abs(dx)>Math.abs(dy)){
    const sx=dx>0?b.x+b.w:b.x,ex=sx+(dx>0?24:-24),y=b.doorY;
    line(ctx,sx,y,ex,y,color,7);
    for(let i=1;i<5;i++)line(ctx,sx+(ex-sx)*i/5,y-5,sx+(ex-sx)*i/5,y+5,'rgba(22,28,32,.55)',1);
  }else{
    const sy=dy>0?b.y+b.h:b.y,ey=sy+(dy>0?24:-24),x=b.doorX;
    line(ctx,x,sy,x,ey,color,7);
    for(let i=1;i<5;i++)line(ctx,x-5,sy+(ey-sy)*i/5,x+5,sy+(ey-sy)*i/5,'rgba(22,28,32,.55)',1);
  }
};

const supportPiecesFor = (territoryId:number,b:TacticalBuilding,index:number,W:number,H:number):UnifiedSupportSolid[] => {
  const out:UnifiedSupportSolid[]=[];
  const add=(suffix:string,r:Rect,kind:UnifiedSupportSolid['kind'],material:UnifiedSupportSolid['material'])=>out.push({id:`u:${territoryId}:${b.id}:${suffix}`,...r,kind,material});
  if(territoryId===1||territoryId===4){
    const side=index%2===0?-1:1;
    const aw=Math.max(territoryId===4?50:48,b.w*.46), ah=34+(index%3)*4;
    const gap=territoryId===4?26:22;
    const ax=clamp(side<0?b.x-aw-gap:b.x+b.w+gap,6,W-aw-6);
    const ay=clamp(b.y+b.h-ah+4,8,H-ah-8);
    add('annex-a',{x:ax,y:ay,w:aw,h:ah},'building',index%2?'brick':'concrete');
    const bw=Math.max(40,aw*.72), bh=28+(index%2)*4;
    const bx=clamp(side<0?ax-bw-18:ax+aw+18,6,W-bw-6);
    const by=clamp(ay-bh+9,6,H-bh-6);
    if(b.id!=='mirante'&&bx>10&&bx+bw<W-10) add('annex-b',{x:bx,y:by,w:bw,h:bh},'building',index%3===0?'metal':'brick');
    if(territoryId===4) add('retaining',{x:clamp(b.x-10,4,W-b.w-20),y:clamp(b.y+b.h+12,4,H-10),w:Math.min(b.w+20,W-8),h:8},'wall','concrete');
  } else if(territoryId===2){
    const sx=clamp(index%2?b.x+b.w+6:b.x-48,5,W-47), sy=clamp(b.y+b.h-30,5,H-30);
    add('stall',{x:sx,y:sy,w:48,h:34},'building','concrete');
  } else if(territoryId===3){
    const sx=clamp(index%2?b.x+b.w+8:b.x-54,5,W-51), sy=clamp(b.y+b.h-32,5,H-32);
    add('service',{x:sx,y:sy,w:52,h:36},'building','metal');
  } else if(territoryId===5){
    const side=index%2===0?-1:1, ww=48, wh=30, sx=clamp(side<0?b.x-ww-12:b.x+b.w+12,5,W-ww-5);
    add('wing',{x:sx,y:clamp(b.y+8,5,H-wh-5),w:ww,h:wh},'building','concrete');
  } else if(territoryId===6){
    const side=index%2===0?-1:1, mw=50, mh=34, sx=clamp(side<0?b.x-mw-12:b.x+b.w+12,5,W-mw-5);
    add('module',{x:sx,y:clamp(b.y+4,5,H-mh-5),w:mw,h:mh},'building','metal');
  }
  return out;
};
const districtPiecesFor=(territoryId:number,W:number,H:number):UnifiedSupportSolid[]=>{
  const out:UnifiedSupportSolid[]=[];
  const n=(id:string,x:number,y:number,w:number,h:number,kind:UnifiedSupportSolid['kind']='building',material:UnifiedSupportSolid['material']='brick')=>out.push({id:`d:${territoryId}:${id}`,x:x*W,y:y*H,w:w*W,h:h*H,kind,material});
  if(territoryId===1){
    [
      ['ul1',.075,.075,.060,.072],['ul2',.145,.070,.055,.082],['ul3',.210,.090,.052,.068],['ul4',.273,.082,.050,.078],
      ['ur1',.610,.070,.056,.078],['ur2',.676,.084,.052,.070],['ur3',.738,.072,.054,.082],['ur4',.802,.096,.048,.066],
      ['ml1',.055,.315,.060,.074],['ml2',.125,.335,.055,.082],['ml3',.190,.445,.058,.075],['ml4',.255,.520,.052,.070],
      ['mr1',.735,.320,.056,.078],['mr2',.803,.355,.052,.072],['mr3',.715,.500,.060,.080],['mr4',.825,.535,.050,.070],
      ['ll1',.105,.760,.060,.078],['ll2',.175,.785,.055,.072],['ll3',.240,.815,.052,.075],['ll4',.300,.755,.050,.068],
      ['lr1',.635,.765,.058,.078],['lr2',.703,.795,.052,.072],['lr3',.765,.755,.056,.080],['lr4',.830,.805,.048,.068]
    ].forEach((a,i)=>n(a[0] as string,a[1] as number,a[2] as number,a[3] as number,a[4] as number,'building',i%5===0?'metal':i%3===0?'concrete':'brick'));
  } else if(territoryId===4){
    [['lu1',.17,.145,.055,.070],['lu2',.235,.137,.050,.080],['lu3',.295,.155,.050,.064],['ru1',.65,.145,.052,.070],['ru2',.712,.137,.046,.080],['ru3',.770,.155,.045,.064],['lm1',.27,.40,.055,.068],['lm2',.335,.395,.052,.072],['rm1',.62,.40,.055,.068],['rm2',.685,.395,.052,.072]].forEach((a,i)=>n(a[0] as string,a[1] as number,a[2] as number,a[3] as number,a[4] as number,'building',i%3===1?'concrete':'brick'));
  } else if(territoryId===2){
    for(const [id,x,y] of [['m1',.15,.56],['m2',.20,.56],['m3',.25,.56],['m4',.70,.56],['m5',.75,.56],['m6',.80,.56]] as const)n(id,x,y,.046,.055,'building','concrete');
  } else if(territoryId===3){
    for(const [id,x,y] of [['s1',.18,.39],['s2',.24,.39],['s3',.64,.43],['s4',.69,.43]] as const)n(id,x,y,.050,.058,'building','metal');
  } else if(territoryId===5){
    for(const [id,x,y] of [['w1',.25,.13],['w2',.30,.13],['w3',.65,.13],['w4',.70,.13]] as const)n(id,x,y,.042,.040,'building','concrete');
  } else if(territoryId===6){
    for(const [id,x,y] of [['m1',.27,.31],['m2',.27,.61],['m3',.69,.31],['m4',.69,.61]] as const)n(id,x,y,.035,.045,'building','metal');
  }
  return out;
};

const visualLift=(territoryId:number)=>territoryId===6?38:territoryId===3?32:(territoryId===1||territoryId===4)?40:30;
const expanded=(r:Rect,lift:number,pad=0):Rect=>({x:r.x-pad,y:r.y-lift-pad,w:r.w+pad*2,h:r.h+lift+pad*2});
const intersects=(a:Rect,b:Rect)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const heroPad=(territoryId:number)=>territoryId===1?8:territoryId===4?18:territoryId===2||territoryId===3?14:16;
const tacticalVisual=(b:TacticalBuilding,territoryId:number)=>expanded({x:b.x,y:b.y,w:b.w,h:b.h},visualLift(territoryId),heroPad(territoryId));
const pieceClear=(p:UnifiedSupportSolid,territoryId:number,buildings:readonly TacticalBuilding[])=>{
  if(p.kind==='wall') return true;
  const lift=p.kind==='building'?visualLift(territoryId):12;
  const vr=expanded(p,lift,p.kind==='building'?6:4);
  return !buildings.some(b=>intersects(vr,tacticalVisual(b,territoryId)));
};
const purposeClear=(p:UnifiedSupportSolid,territoryId:number,W:number,H:number)=>{
  if(p.kind==='wall') return true;
  const vr=expanded(p,p.kind==='building'?visualLift(territoryId):8,4);
  return !getTerritoryPurposeProps(territoryId).some(q=>q.solid&&intersects(vr,{x:q.x*W-5,y:q.y*H-5,w:q.w*W+10,h:q.h*H+10}));
};

// 0.9.1E: context lives in authored urban pockets instead of any free rectangle.
// Roads, rail crossings, boulevards and command spines remain visually readable.
const inCompositionZone=(p:UnifiedSupportSolid,territoryId:number,W:number,H:number)=>{
  if(p.kind!=='building'&&p.kind!=='cover') return true;
  const cx=(p.x+p.w*.5)/W, cy=(p.y+p.h*.5)/H;
  if(territoryId===1) return cx<.39||cx>.61||cy<.16||cy>.76;
  if(territoryId===2) return cy>.45||cy<.25||cx<.20||cx>.80;
  if(territoryId===3) return cx<.42||cx>.58||cy<.20||cy>.80;
  if(territoryId===4) return cx<.41||cx>.59||cy<.18||cy>.78;
  if(territoryId===5) return cx<.40||cx>.60||cy<.17||cy>.82;
  if(territoryId===6) return cx<.35||cx>.65||cy<.18||cy>.82;
  return true;
};

export const getUnifiedSupportSolids=(territoryId:number,buildings:readonly TacticalBuilding[],W:number,H:number)=>{
  const valid=(p:UnifiedSupportSolid)=>pieceClear(p,territoryId,buildings)&&purposeClear(p,territoryId,W,H)&&inCompositionZone(p,territoryId,W,H);
  const district=districtPiecesFor(territoryId,W,H).filter(valid);
  const attached=buildings.flatMap((b,index)=>supportPiecesFor(territoryId,b,index,W,H).filter(valid));
  return [...district,...attached];
};

const brickCourses=(ctx:CanvasRenderingContext2D,p:UnifiedSupportSolid,color:string)=>{
  ctx.strokeStyle=color;ctx.lineWidth=.7;ctx.globalAlpha=.32;
  for(let y=p.y+8;y<p.y+p.h-5;y+=7){ctx.beginPath();ctx.moveTo(p.x+3,y);ctx.lineTo(p.x+p.w-3,y);ctx.stroke();}
  ctx.globalAlpha=1;
};

const drawClusterBeds=(ctx:CanvasRenderingContext2D,W:number,H:number,territoryId:number)=>{
  if(territoryId!==1)return;
  if(territoryId===1){
    // 0.9.6A: occupied ground follows irregular neighborhood edges instead of six rounded rectangles.
    const beds=[
      [[.030,.055],[.135,.030],[.260,.050],[.342,.105],[.315,.185],[.205,.218],[.082,.195],[.025,.135]],
      [[.598,.070],[.700,.040],[.845,.055],[.920,.115],[.890,.205],[.770,.225],[.650,.190],[.590,.125]],
      [[.020,.290],[.115,.255],[.245,.290],[.325,.390],[.305,.545],[.220,.615],[.080,.585],[.015,.470]],
      [[.675,.285],[.805,.250],[.935,.305],[.975,.430],[.935,.575],[.805,.620],[.690,.540],[.655,.405]],
      [[.055,.725],[.175,.690],[.320,.720],[.378,.810],[.340,.930],[.205,.955],[.080,.910],[.045,.815]],
      [[.605,.710],[.750,.680],[.900,.725],[.945,.820],[.895,.930],[.760,.952],[.625,.900],[.585,.800]]
    ] as const;
    ctx.save();
    for(const pts of beds){
      ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H));ctx.closePath();
      ctx.fillStyle='rgba(86,76,61,.115)';ctx.fill();
      ctx.strokeStyle='rgba(153,139,114,.075)';ctx.lineWidth=1;ctx.stroke();
    }
    ctx.restore();return;
  }
};
const drawDistrictContinuity=(ctx:CanvasRenderingContext2D,pieces:readonly UnifiedSupportSolid[],territoryId:number)=>{
  if(territoryId!==1)return;
  const rows=[...pieces].filter(p=>p.kind==='building').sort((a,b)=>a.y-b.y||a.x-b.x);
  for(let i=0;i<rows.length-1;i++){
    const a=rows[i],b=rows[i+1],gap=b.x-(a.x+a.w),sameRow=Math.abs(a.y-b.y)<22;
    if(!sameRow||gap<0||gap>55)continue;
    const y=Math.max(a.y+a.h,b.y+b.h)-5;
    ctx.fillStyle='rgba(88,82,70,.34)';ctx.fillRect(a.x+a.w,y,gap,6);
    ctx.strokeStyle='rgba(25,30,32,.50)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x+a.w-3,a.y-3);ctx.quadraticCurveTo((a.x+a.w+b.x)/2,Math.min(a.y,b.y)-10,b.x+3,b.y-3);ctx.stroke();
    if(gap>16){for(let k=1;k<=2;k++){const t=k/3,x=a.x+a.w+gap*t,yy=(a.y-3)*(1-t)+(b.y-3)*t-4;ctx.fillStyle=k%2?'rgba(54,128,150,.48)':'rgba(177,77,55,.42)';ctx.fillRect(x-2,yy,5,7);}}
  }
};

const drawFavelaPiece=(ctx:CanvasRenderingContext2D,p:UnifiedSupportSolid,territoryId:number,index:number,accent:string)=>{
  if(p.kind==='wall'){
    shadow(ctx,p,.28);rect(ctx,p,'#655b52','#8b8178');
    ctx.fillStyle=accent;ctx.globalAlpha=.14;ctx.fillRect(p.x+5,p.y+2,p.w*.34,3);ctx.globalAlpha=1;return;
  }
  const warm=territoryId===4,variant=Math.abs(index)%4;
  const base=warm?['#774533','#8a543d','#6d493b','#816650'][variant]:['#9d7a5d','#b0a38c','#8b5b43','#938a74'][variant];
  const edge=warm?'#a2745b':'#c5aa8b';
  shadow(ctx,p,.28);rect(ctx,p,base,edge);
  if(variant===0||variant===3) brickCourses(ctx,p,warm?'#3e2c27':'#5a382b');
  const split=p.x+p.w*(variant===1?.42:.58);
  ctx.fillStyle=warm?'rgba(199,165,132,.16)':'rgba(230,220,194,.20)';
  ctx.fillRect(split,p.y+4,p.x+p.w-split-3,p.h-7);
  ctx.fillStyle='#1f2b33';for(let x=p.x+8;x<p.x+p.w-9;x+=18)ctx.fillRect(x,p.y+p.h*.48,7,6);
  ctx.fillStyle=warm?'#4a342c':'#5f4c3d';ctx.fillRect(p.x+5,p.y+p.h-13,9,13);
  const slab=variant%2===0?'#5d666e':'#6b5545';rect(ctx,{x:p.x-3,y:p.y-6,w:p.w+6,h:7},slab);
  if(variant===1){ctx.strokeStyle='rgba(48,35,29,.72)';for(let x=p.x+9;x<p.x+p.w-6;x+=13){ctx.beginPath();ctx.moveTo(x,p.y-6);ctx.lineTo(x,p.y-13);ctx.stroke();}}
  if(variant===2||p.id.endsWith('annex-b')){ctx.fillStyle=warm?'#4b5560':'#15809b';ctx.beginPath();ctx.ellipse(p.x+p.w*.72,p.y-9,7,5,0,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='rgba(20,28,34,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x+2,p.y+p.h-3);ctx.lineTo(p.x+p.w-3,p.y+p.h-5);ctx.stroke();
};

const drawRailPiece=(ctx:CanvasRenderingContext2D,p:UnifiedSupportSolid)=>{
  // Small feira support stall: complete architecture, but visually subordinate to tactical buildings.
  ctx.save();shadow(ctx,p,.24);
  const post='#76583b',counter='#513924';
  ctx.strokeStyle=post;ctx.lineWidth=3;
  for(const x of [p.x+5,p.x+p.w-5]){ctx.beginPath();ctx.moveTo(x,p.y-5);ctx.lineTo(x,p.y+p.h+3);ctx.stroke();}
  ctx.fillStyle=counter;ctx.fillRect(p.x+3,p.y+p.h*.46,p.w-6,p.h*.50);
  ctx.fillStyle='#8b6a45';ctx.fillRect(p.x+5,p.y+p.h*.49,p.w-10,4);
  // Slight pitched canopy, replacing the old floating striped rectangle.
  ctx.fillStyle='#5b4631';ctx.beginPath();ctx.moveTo(p.x-3,p.y-5);ctx.lineTo(p.x+p.w*.5,p.y-13);ctx.lineTo(p.x+p.w+3,p.y-5);ctx.lineTo(p.x+p.w,p.y+1);ctx.lineTo(p.x,p.y+1);ctx.closePath();ctx.fill();
  const stripeW=(p.w+6)/6;for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#eee3c7':'#c27a28';ctx.beginPath();ctx.moveTo(p.x-3+i*stripeW,p.y-5+(i<3?-i:-(6-i))*1.2);ctx.lineTo(p.x-3+(i+1)*stripeW,p.y-5+(i<2?-(i+1):-(5-i))*1.2);ctx.lineTo(p.x-3+(i+1)*stripeW,p.y+1);ctx.lineTo(p.x-3+i*stripeW,p.y+1);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#b88955';for(const x of [p.x+8,p.x+p.w-15])ctx.fillRect(x,p.y+p.h*.28,7,5);
  ctx.fillStyle='rgba(226,232,240,.13)';ctx.fillRect(p.x+5,p.y+p.h-4,p.w-10,2);
  ctx.restore();
};
const drawIndustrialPiece=(ctx:CanvasRenderingContext2D,p:UnifiedSupportSolid)=>{
  shadow(ctx,p,.30);rect(ctx,p,'#3a434b','#66717b');
  rect(ctx,{x:p.x+4,y:p.y+12,w:p.w-8,h:14},'#171d23','#515b65');
  for(let x=p.x+7;x<p.x+p.w-5;x+=10)line(ctx,x,p.y+13,x,p.y+25,'rgba(148,163,184,.28)',1);
  ctx.fillStyle='#a54d25';ctx.fillRect(p.x+p.w-13,p.y-8,9,10);
  ctx.fillStyle='rgba(148,163,184,.20)';ctx.fillRect(p.x+3,p.y+4,p.w*.34,3);
  ctx.strokeStyle='rgba(249,115,22,.20)';ctx.beginPath();ctx.moveTo(p.x+4,p.y+p.h-4);ctx.lineTo(p.x+p.w-4,p.y+p.h-4);ctx.stroke();
};
const drawGatedPiece=(ctx:CanvasRenderingContext2D,p:UnifiedSupportSolid)=>{
  shadow(ctx,p,.22);rect(ctx,p,'#c9c3b8','#e6dfd3');
  rect(ctx,{x:p.x+4,y:p.y+4,w:p.w-8,h:6},'#244b57');
  ctx.fillStyle='#e7e0d5';ctx.fillRect(p.x+5,p.y+13,p.w-10,4);
  ctx.fillStyle='#245a41';ctx.fillRect(p.x,p.y+p.h+3,p.w,4);
  ctx.strokeStyle='rgba(36,90,65,.42)';for(let x=p.x+6;x<p.x+p.w-5;x+=10){ctx.beginPath();ctx.moveTo(x,p.y+p.h+3);ctx.lineTo(x,p.y+p.h+8);ctx.stroke();}
};
const drawHqPiece=(ctx:CanvasRenderingContext2D,p:UnifiedSupportSolid,accent:string)=>{
  shadow(ctx,p,.30);rect(ctx,p,'#34393b','#666e72');
  rect(ctx,{x:p.x+5,y:p.y+6,w:p.w-10,h:10},'#151b20','#7a8286');
  ctx.fillStyle='#5b6266';ctx.fillRect(p.x+6,p.y+p.h-8,p.w-12,3);
  ctx.fillStyle=accent;ctx.globalAlpha=.20;ctx.fillRect(p.x+8,p.y+p.h-7,12,3);ctx.globalAlpha=1;
  line(ctx,p.x+p.w-10,p.y,p.x+p.w-10,p.y-12,'#8a9194',2);
};

const drawUsePad=(ctx:CanvasRenderingContext2D,b:TacticalBuilding,territoryId:number)=>{
  if(territoryId===1||territoryId===4){
    // Authored territories use only threshold wear; no building-sized rectangular pad.
    const cx=b.x+b.w/2,cy=b.y+b.h/2,dx=b.doorX-cx,dy=b.doorY-cy;
    const horizontal=Math.abs(dx)>Math.abs(dy),sx=dx===0?0:Math.sign(dx),sy=dy===0?0:Math.sign(dy);
    const x=b.doorX+sx*9,y=b.doorY+sy*9;
    ctx.fillStyle=territoryId===4?'rgba(112,78,50,.14)':'rgba(99,82,60,.14)';ctx.beginPath();ctx.ellipse(x,y,horizontal?20:9,horizontal?8:18,horizontal?.04:-.05,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(161,143,112,.09)';ctx.lineWidth=1;ctx.stroke();return;
  }
  const pad={x:b.x-20,y:b.y+b.h-8,w:b.w+40,h:30};
  ctx.beginPath();ctx.roundRect(pad.x,pad.y,pad.w,pad.h,5);
  ctx.fillStyle=territoryId===4?'rgba(79,58,42,.22)':territoryId===2?'rgba(86,72,52,.15)':territoryId===3?'rgba(56,60,64,.20)':territoryId===5?'rgba(203,213,225,.06)':'rgba(113,119,122,.08)';ctx.fill();
};
const connectPairs=(ctx:CanvasRenderingContext2D,buildings:readonly TacticalBuilding[],territoryId:number)=>{
  const ordered=[...buildings].sort((a,b)=>a.y-b.y);
  const surface=territoryId===1?'rgba(98,92,82,.30)':territoryId===4?'rgba(110,82,61,.27)':territoryId===2?'rgba(145,116,67,.18)':territoryId===3?'rgba(92,99,105,.18)':territoryId===5?'rgba(176,179,174,.13)':'rgba(130,135,138,.13)';
  for(let i=0;i<ordered.length-1;i+=2){
    const a=ordered[i],b=ordered[i+1],ax=a.x+a.w/2,ay=a.y+a.h+12,bx=b.x+b.w/2,by=b.y+b.h+12;
    const distance=Math.hypot(bx-ax,by-ay), limit=territoryId===1?220:360;
    if(distance>limit) continue;
    const shadowW=territoryId===1?7:(territoryId<=4?11:9), surfaceW=territoryId===1?4:(territoryId<=4?8:6);
    line(ctx,ax+3,ay+4,bx+3,by+4,'rgba(0,0,0,.16)',shadowW);
    line(ctx,ax,ay,bx,by,surface,surfaceW);
  }
};
const contextualRole=(territoryId:number,p:UnifiedSupportSolid,index:number)=>{
  const compact=p.w<52||p.h<34;
  if(territoryId===1){
    if(p.material==='metal') return index%3===0?'Oficina de Fundo':'Puxadinho de Zinco';
    if(!compact&&p.material==='concrete'){
      const roles=['Laje Residencial','Casa de Esquina','Sobrado da Viela'];
      return roles[index%roles.length];
    }
    const brickRoles=['Moradia Geminada','Casa com Varanda','Mercadinho de Esquina','Sobrado de Tijolo'];
    return brickRoles[index%brickRoles.length];
  }
  if(territoryId===2){
    if(compact) return index%2?'Box da Feira':'Banca Coberta';
    return p.w>60?'Armazem do Trilho':'Deposito da Praca';
  }
  if(territoryId===3){
    if(compact) return index%2?'Oficina 01':'Serralheria';
    return p.w>62?'Galpao de Pecas':'Deposito Industrial';
  }
  if(territoryId===4){
    if(p.material==='metal'||compact) return index%2?'Beco da Subida':'Boca do Alto';
    if(p.material==='concrete'&&p.w>=54) return 'Laje Fortificada';
    return 'Reduto do Morro';
  }
  if(territoryId===5){
    if(compact) return index%2?'Casa da Orla':'Portaria Leste';
    return p.w>58?'Condominio Norte':'Mansao Reservada';
  }
  if(territoryId===6){
    if(compact) return index%2?'Anexo do QG':'Posto Blindado';
    return p.w>58?'Centro Operacional':'Alojamento Central';
  }
  return 'Esconderijo';
};

const pieceIndex=(id:string)=>Math.abs([...id].reduce((a,c)=>((a*31)+c.charCodeAt(0))|0,7));
export const drawUnifiedContextArchitecture=(ctx:CanvasRenderingContext2D,p:UnifiedSupportSolid,territoryId:number,time:number,controlColor:string,renderZoom=1)=>{
  if(p.kind==='wall') return;
  const index=pieceIndex(p.id);
  drawCityVivaContextBuilding(ctx,{id:p.id,x:p.x,y:p.y,w:p.w,h:p.h,role:contextualRole(territoryId,p,index),
    material:p.material==='metal'?'metal':p.material==='brick'?'brick':'concrete',door:index%2?'left':'right'},time,territoryId,renderZoom,controlColor);
};
const drawPieceForTerritory=(ctx:CanvasRenderingContext2D,p:UnifiedSupportSolid,territoryId:number,index:number,controlColor:string)=>{
  if(p.kind!=='wall') return;
  drawFavelaPiece(ctx,p,territoryId,index,controlColor);
};

export function drawUnifiedTerritoryComposition({ctx,width,height,territoryId,buildings,controlColor}:Args){
  ctx.save();
  drawClusterBeds(ctx,width,height,territoryId);
  const solids=getUnifiedSupportSolids(territoryId,buildings,width,height);
  const districtPieces=solids.filter(p=>p.id.startsWith('d:'));
  solids.forEach((piece,index)=>drawPieceForTerritory(ctx,piece,territoryId,index,controlColor));
  drawDistrictContinuity(ctx,districtPieces,territoryId);
  if(territoryId!==1&&territoryId!==4) connectPairs(ctx,buildings,territoryId);
  buildings.forEach(b=>{
    drawUsePad(ctx,b,territoryId);
    if(territoryId===1||territoryId===4) stairToDoor(ctx,b,territoryId===4?'#71665d':'#70777b');
  });
  ctx.restore();
}
