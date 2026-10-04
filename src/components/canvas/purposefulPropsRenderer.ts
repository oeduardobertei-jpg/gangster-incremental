import { getTerritoryPurposeProps, PurposeProp } from '../../data/territoryPurposeProps';
import { WORLD_MATERIALS } from '../../data/visualTokens';
import { drawCityVivaContextBuilding } from './buildingSkins';

const rectOf = (p: PurposeProp, w: number, h: number) => ({
  x:p.x*w, y:p.y*h, w:p.w*w, h:p.h*h
});


export const isArchitecturalPurposeProp=(p:PurposeProp)=>
  p.kind==='stall'||p.kind==='security_booth'||p.kind==='watch_post'||p.kind==='service_unit';
export const isDepthSortedPurposeProp=(p:PurposeProp)=>
  !isArchitecturalPurposeProp(p) && p.solid;
const architectureRole=(territoryId:number,p:PurposeProp)=>{
  if(p.kind==='stall') return territoryId===2?'Box da Feira':territoryId===1&&p.label==='MERCEARIA'?'Mercadinho de Esquina':'Barraquinha';
  if(p.kind==='security_booth') return 'Guarita Oeste';
  if(p.kind==='watch_post') return 'Posto de Vigia';
  if(territoryId===3) return 'Oficina 01';
  if(territoryId===4) return 'Boca do Alto';
  if(territoryId===6) return 'Anexo do QG';
  return 'Esconderijo';
};

const drawServiceArchitecture=(ctx:CanvasRenderingContext2D,p:PurposeProp,W:number,H:number,territoryId:number,time:number)=>{
  const r=rectOf(p,W,H), accent=territoryId===6?'#788187':territoryId===4?'#88735f':territoryId===3?'#c2672d':'#70808a';
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.roundRect(r.x+6,r.y+8,r.w,r.h+4,3);ctx.fill();
  // Concrete/steel plinth anchors the utility to the world.
  ctx.fillStyle=territoryId===4?'#675a4e':'#555f68';ctx.fillRect(r.x-4,r.y+r.h-2,r.w+8,7);
  ctx.fillStyle=territoryId===4?'#4b433b':'#2d3740';ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,3);ctx.fill();
  ctx.strokeStyle=accent;ctx.lineWidth=1.4;ctx.strokeRect(r.x+.5,r.y+.5,r.w-1,r.h-1);
  // Service doors / vent banks.
  ctx.fillStyle='#111820';ctx.fillRect(r.x+5,r.y+6,Math.max(10,r.w*.48),Math.max(8,r.h*.42));
  ctx.strokeStyle='rgba(148,163,184,.48)';ctx.lineWidth=.8;
  for(let yy=r.y+9;yy<r.y+Math.max(12,r.h*.42);yy+=4){ctx.beginPath();ctx.moveTo(r.x+7,yy);ctx.lineTo(r.x+Math.max(12,r.w*.47),yy);ctx.stroke();}
  ctx.fillStyle=accent;ctx.globalAlpha=.62;ctx.fillRect(r.x+r.w-9,r.y+7,4,4);ctx.globalAlpha=1;
  ctx.fillStyle='#d5a43a';ctx.fillRect(r.x+r.w-9,r.y+14,4,3);
  if(territoryId===3){
    // Generator exhaust and cable trunk.
    ctx.fillStyle='#4b5563';ctx.fillRect(r.x+r.w-12,r.y-8,7,10);ctx.fillStyle='#1f2937';ctx.fillRect(r.x+r.w-10,r.y-11,3,4);
    ctx.strokeStyle='#1f2937';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r.x+4,r.y+r.h);ctx.quadraticCurveTo(r.x-5,r.y+r.h+8,r.x-8,r.y+r.h+13);ctx.stroke();
  } else if(territoryId===4||territoryId===6){
    // Radio/comms mast, physically attached to the cabinet.
    const mx=r.x+r.w*.72;ctx.strokeStyle='#8b949d';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(mx,r.y+4);ctx.lineTo(mx,r.y-18);ctx.stroke();
    ctx.strokeStyle=accent;ctx.beginPath();ctx.moveTo(mx-6,r.y-11);ctx.lineTo(mx+6,r.y-11);ctx.stroke();
    ctx.fillStyle=accent;ctx.globalAlpha=.55+.20*Math.sin(time*.004);ctx.beginPath();ctx.arc(mx,r.y-20,2.2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  } else {
    // T1 utility meter and conduit: clearly infrastructure, not a tiny house.
    ctx.strokeStyle='#65727c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r.x+r.w-7,r.y+4);ctx.lineTo(r.x+r.w-7,r.y-12);ctx.stroke();
    ctx.fillStyle='#cbd5e1';ctx.fillRect(r.x+r.w-12,r.y+8,7,6);ctx.strokeStyle='#334155';ctx.strokeRect(r.x+r.w-12,r.y+8,7,6);
  }
  ctx.restore();
};

export const drawPurposefulArchitecture=(ctx:CanvasRenderingContext2D,p:PurposeProp,W:number,H:number,territoryId:number,time:number,renderZoom=1)=>{
  if(!isArchitecturalPurposeProp(p)) return;
  if(p.kind==='service_unit'){drawServiceArchitecture(ctx,p,W,H,territoryId,time);return;}
  const r=rectOf(p,W,H);
  drawCityVivaContextBuilding(ctx,{id:`prop:${p.id}`,x:r.x,y:r.y,w:r.w,h:r.h,role:architectureRole(territoryId,p),
    material:p.material==='metal'?'metal':p.material==='brick'?'brick':'concrete',door:'bottom'},time,territoryId,renderZoom);
};

const materialColors = (material: PurposeProp['material']) => {
  if (material === 'brick') return WORLD_MATERIALS.brick;
  if (material === 'metal') return WORLD_MATERIALS.steel;
  if (material === 'glass') return WORLD_MATERIALS.glass;
  if (material === 'vegetation') return WORLD_MATERIALS.vegetation;
  if (material === 'concrete') return WORLD_MATERIALS.concrete;
  return { base:'#6b5843', highlight:'#b08a62', shadow:'#35291f', edge:'#d0a574', wear:'#49382a' };
};

const shadowRect = (ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,alpha=.34) => {
  ctx.fillStyle=`rgba(0,0,0,${alpha})`; ctx.fillRect(x+7,y+8,w,h);
};

const drawT1PropFinish=(ctx:CanvasRenderingContext2D,p:PurposeProp,W:number,H:number,renderZoom=1)=>{
  const r=rectOf(p,W,H), detail=renderZoom>=.82, micro=renderZoom>=1.05;
  ctx.save();
  if(p.kind!=='planter'){ctx.fillStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.ellipse(r.x+r.w*.52,r.y+r.h+3,Math.max(6,r.w*.38),Math.max(2,r.h*.16),-.04,0,Math.PI*2);ctx.fill();}
  if(p.kind==='crate_stack'){
    ctx.fillStyle='rgba(226,232,240,.18)';for(const [x,y] of [[r.x+5,r.y+5],[r.x+r.w*.47,r.y+r.h*.46],[r.x+r.w*.76,r.y+5]] as const){ctx.beginPath();ctx.arc(x,y,1.1,0,Math.PI*2);ctx.fill();}
    if(detail){ctx.strokeStyle='rgba(50,35,25,.52)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(r.x+3,r.y+r.h*.52);ctx.lineTo(r.x+r.w-4,r.y+r.h*.50);ctx.stroke();}
  } else if(p.kind==='pallets'){
    if(detail){ctx.strokeStyle='rgba(38,27,21,.55)';ctx.lineWidth=1;for(let x=r.x+5;x<r.x+r.w-3;x+=9){ctx.beginPath();ctx.moveTo(x,r.y+2);ctx.lineTo(x,r.y+r.h-2);ctx.stroke();}}
    ctx.fillStyle='rgba(222,190,145,.15)';ctx.fillRect(r.x+2,r.y+2,r.w-4,2);
  } else if(p.kind==='bench'){
    ctx.fillStyle='rgba(236,207,166,.16)';ctx.fillRect(r.x+3,r.y+5,r.w-6,2);
    if(detail){ctx.fillStyle='#3d4650';for(const x of [r.x+7,r.x+r.w-8]){ctx.beginPath();ctx.arc(x,r.y+7,1.2,0,Math.PI*2);ctx.fill();}}
  } else if(p.kind==='dumpster'){
    ctx.fillStyle='rgba(203,213,225,.20)';ctx.fillRect(r.x+4,r.y+3,r.w-8,2);ctx.fillStyle='#182521';ctx.fillRect(r.x+r.w-8,r.y+r.h*.36,5,3);
    if(detail){ctx.fillStyle='rgba(154,52,18,.24)';ctx.fillRect(r.x+6,r.y+r.h*.63,7,2);ctx.fillRect(r.x+r.w*.62,r.y+r.h*.28,5,2);}
  } else if(p.kind==='barricade'){
    ctx.fillStyle='#363b42';for(const x of [r.x+7,r.x+r.w-9])ctx.fillRect(x,r.y+r.h,4,6);
    if(detail){ctx.strokeStyle='rgba(226,232,240,.18)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(r.x+5,r.y+r.h-4);ctx.lineTo(r.x+r.w-5,r.y+4);ctx.stroke();}
  } else if(p.kind==='parked_car'){
    ctx.fillStyle='#e5e7eb';ctx.globalAlpha=.55;ctx.fillRect(r.x+2,r.y+r.h*.28,3,4);ctx.fillRect(r.x+r.w-5,r.y+r.h*.28,3,4);ctx.globalAlpha=1;
    ctx.fillStyle='#111827';ctx.fillRect(r.x+r.w*.08,r.y+r.h*.74,r.w*.84,3);if(detail){ctx.fillStyle='rgba(125,211,252,.15)';ctx.fillRect(r.x+r.w*.31,r.y+5,r.w*.38,2);}
  } else if(p.kind==='planter'){
    ctx.strokeStyle='rgba(203,213,225,.24)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(r.x+2,r.y+r.h*.56);ctx.lineTo(r.x+r.w-2,r.y+r.h*.56);ctx.stroke();
    if(detail){ctx.fillStyle='rgba(126,183,137,.24)';for(const x of [r.x+r.w*.28,r.x+r.w*.52,r.x+r.w*.72]){ctx.beginPath();ctx.arc(x,r.y+r.h*.24,2.2,0,Math.PI*2);ctx.fill();}}
  } else if(p.kind==='low_wall'&&p.id!=='t1-entry-wall'){
    if(detail){ctx.fillStyle='rgba(226,214,194,.10)';ctx.fillRect(r.x+r.w*.18,r.y+4,r.w*.18,4);ctx.strokeStyle='rgba(40,31,27,.42)';ctx.beginPath();ctx.moveTo(r.x+r.w*.62,r.y+2);ctx.lineTo(r.x+r.w*.58,r.y+r.h-2);ctx.stroke();}
  }
  if(micro&&p.material==='metal'){ctx.fillStyle='rgba(241,245,249,.20)';ctx.fillRect(r.x+2,r.y+1,Math.max(4,r.w*.22),1);}
  ctx.restore();
};

const drawLabel = (ctx:CanvasRenderingContext2D,label:string|undefined,x:number,y:number,w:number,accent:string) => {
  if(!label) return;
  ctx.fillStyle='rgba(6,10,16,.88)'; ctx.fillRect(x+3,y+3,Math.min(w-6,58),11);
  ctx.strokeStyle=accent; ctx.strokeRect(x+3,y+3,Math.min(w-6,58),11);
  ctx.fillStyle='#f8fafc'; ctx.font='700 6px "Chakra Petch",sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(label,x+3+Math.min(w-6,58)/2,y+8.5);
};
const drawPropContext = (ctx:CanvasRenderingContext2D,p:PurposeProp,W:number,H:number,territoryId:number) => {
  const r=rectOf(p,W,H), cx=r.x+r.w/2, cy=r.y+r.h/2;
  ctx.save();
  if(territoryId===1){
    ctx.fillStyle='rgba(63,55,45,.13)';ctx.beginPath();ctx.ellipse(cx,cy+r.h*.45,r.w*.72+8,r.h*.55+5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(74,95,56,.34)';ctx.lineWidth=1;for(const dx of [-r.w*.42,r.w*.48]){ctx.beginPath();ctx.moveTo(cx+dx,cy+r.h*.55);ctx.lineTo(cx+dx-3,cy+r.h*.28);ctx.stroke();}
    if(p.kind==='parked_car'){
      ctx.fillStyle='rgba(2,6,12,.36)';ctx.beginPath();ctx.ellipse(cx,cy+r.h*.64,r.w*.34,Math.max(3,r.h*.16),-.08,0,Math.PI*2);ctx.fill();
    } else if(p.kind==='stall'){
      ctx.fillStyle='rgba(166,111,48,.11)';ctx.beginPath();ctx.ellipse(cx,cy+r.h*.66,r.w*.72+12,r.h*.38+5,0,0,Math.PI*2);ctx.fill();
    } else if(p.kind==='pallets'||p.kind==='crate_stack'){
      ctx.fillStyle='rgba(126,88,49,.16)';for(const [dx,dy] of [[-8,4],[7,7],[13,1]] as const){ctx.beginPath();ctx.arc(cx+dx,cy+dy,1.5,0,Math.PI*2);ctx.fill();}
    } else if(p.kind==='planter'){
      ctx.fillStyle='rgba(54,103,69,.22)';for(const dx of [-8,0,9]){ctx.beginPath();ctx.arc(cx+dx,cy-r.h*.20,3.2,0,Math.PI*2);ctx.fill();}
    }
  } else if(territoryId===2){
    ctx.fillStyle='rgba(92,70,45,.10)';ctx.beginPath();ctx.roundRect(r.x-7,r.y-6,r.w+14,r.h+16,3);ctx.fill();
    ctx.strokeStyle='rgba(150,125,75,.09)';ctx.strokeRect(r.x-6,r.y-5,r.w+12,r.h+14);
  } else if(territoryId===3){
    ctx.fillStyle='rgba(15,23,42,.17)';ctx.beginPath();ctx.ellipse(cx,cy+r.h*.48,r.w*.72+10,Math.max(5,r.h*.28),-.08,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(100,116,139,.16)';ctx.lineWidth=1;ctx.strokeRect(r.x-9,r.y-7,r.w+18,r.h+18);
    ctx.strokeStyle='rgba(249,115,22,.16)';for(let x=r.x-5;x<r.x+r.w+6;x+=12){ctx.beginPath();ctx.moveTo(x,r.y+r.h+8);ctx.lineTo(x+6,r.y+r.h+3);ctx.stroke();}
    if(p.kind==='pallets'||p.kind==='container'||p.kind==='dumpster'){
      ctx.strokeStyle='rgba(17,24,39,.34)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r.x-8,r.y+r.h+13);ctx.quadraticCurveTo(cx,r.y+r.h+20,r.x+r.w+10,r.y+r.h+10);ctx.stroke();
      ctx.fillStyle='rgba(148,163,184,.25)';for(const [dx,dy] of [[-7,4],[8,8],[14,1]] as const){ctx.beginPath();ctx.arc(cx+dx,cy+dy,1.4,0,Math.PI*2);ctx.fill();}
    }
  } else if(territoryId===4){
    ctx.fillStyle='rgba(78,57,41,.18)';ctx.beginPath();ctx.ellipse(cx,cy+r.h*.52,r.w*.70+9,r.h*.45+6,.05,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(126,107,85,.22)';for(const [dx,dy] of [[-9,5],[11,7],[4,13]] as const){ctx.beginPath();ctx.arc(cx+dx,cy+dy,2.2,0,Math.PI*2);ctx.fill();}
  } else if(territoryId===5){
    ctx.fillStyle='rgba(203,213,225,.065)';ctx.fillRect(r.x-10,r.y-8,r.w+20,r.h+18);ctx.strokeStyle='rgba(226,232,240,.12)';ctx.strokeRect(r.x-10,r.y-8,r.w+20,r.h+18);
    ctx.fillStyle='rgba(43,91,66,.24)';ctx.fillRect(r.x-8,r.y+r.h+5,Math.max(10,r.w*.32),4);ctx.fillRect(r.x+r.w-Math.max(10,r.w*.32)+8,r.y+r.h+5,Math.max(10,r.w*.32),4);
  } else {
    ctx.fillStyle='rgba(51,65,85,.08)';ctx.fillRect(r.x-9,r.y-7,r.w+18,r.h+16);ctx.strokeStyle='rgba(148,163,184,.07)';ctx.strokeRect(r.x-8,r.y-6,r.w+16,r.h+14);
    ctx.fillStyle='rgba(96,165,250,.16)';ctx.fillRect(cx-8,r.y+r.h+5,16,2);
  }
  ctx.restore();
};

const drawBaseProp = (ctx:CanvasRenderingContext2D,p:PurposeProp,W:number,H:number,accentOverride?:string,controlTag?:string) => {
  const r=rectOf(p,W,H), m=materialColors(p.material), accent=accentOverride ?? p.accent ?? m.edge;
  ctx.save();
  const shadowAlpha = (p.kind === 'watch_post' || p.kind === 'security_booth') ? .42 : .30;
  shadowRect(ctx,r.x,r.y,r.w,r.h,shadowAlpha);
  if(p.kind==='low_wall'){
    const controlWall=p.id==='t1-entry-wall';
    const vy=controlWall?r.y-12:r.y, vh=controlWall?r.h+12:r.h;
    ctx.fillStyle='rgba(0,0,0,.36)';ctx.fillRect(r.x+6,vy+7,r.w,vh+5);
    ctx.fillStyle=controlWall?'#68594d':'#6f4b38';ctx.fillRect(r.x,vy+2,r.w,vh-2);
    if(controlWall){
      ctx.fillStyle='#827467';ctx.fillRect(r.x+3,vy+3,r.w*.34,vh-6);
      ctx.fillStyle='#72513f';ctx.fillRect(r.x+r.w*.68,vy+5,r.w*.28,vh-7);
      ctx.fillStyle='rgba(212,199,177,.13)';ctx.fillRect(r.x+r.w*.36,vy+4,r.w*.28,vh*.42);
      ctx.fillStyle='#8b8176';ctx.fillRect(r.x-3,vy-1,r.w+6,5);
      ctx.strokeStyle='rgba(48,37,31,.45)';ctx.lineWidth=1;
      for(let y=vy+9;y<vy+vh-2;y+=7){ctx.beginPath();ctx.moveTo(r.x+4,y);ctx.lineTo(r.x+r.w-4,y);ctx.stroke();}
      for(let x=r.x+20;x<r.x+r.w-5;x+=28){ctx.beginPath();ctx.moveTo(x,vy+5);ctx.lineTo(x-3,vy+vh-2);ctx.stroke();}
      ctx.strokeStyle='rgba(39,31,27,.52)';ctx.beginPath();ctx.moveTo(r.x+13,vy+6);ctx.lineTo(r.x+20,vy+12);ctx.lineTo(r.x+17,vy+18);ctx.stroke();
      ctx.fillStyle='rgba(223,214,194,.15)';ctx.fillRect(r.x+r.w-25,vy+6,15,7);
    } else {
      ctx.fillStyle='#8b6a55';ctx.fillRect(r.x+2,vy,r.w-4,4);
      ctx.strokeStyle='rgba(45,31,25,.48)';ctx.lineWidth=1;
      for(let y=vy+8;y<vy+vh-1;y+=7){ctx.beginPath();ctx.moveTo(r.x+3,y);ctx.lineTo(r.x+r.w-3,y);ctx.stroke();}
    }
    ctx.fillStyle='#5d5148';ctx.fillRect(r.x-3,vy-1,5,vh+3);ctx.fillRect(r.x+r.w-2,vy-1,5,vh+3);
    if(accentOverride){
      ctx.save();ctx.globalAlpha=controlWall?.20:.15;ctx.fillStyle=accent;
      const px=r.x+r.w*(controlWall?.38:.18),pw=r.w*(controlWall?.40:.26);
      ctx.beginPath();ctx.moveTo(px,vy+vh*.28);ctx.lineTo(px+pw,vy+vh*.21);ctx.lineTo(px+pw*.94,vy+vh*.72);ctx.lineTo(px+pw*.08,vy+vh*.78);ctx.closePath();ctx.fill();ctx.restore();
    }
    if(controlTag&&controlWall){
      ctx.save();ctx.translate(r.x+r.w*.57,vy+vh*.54);ctx.rotate(-.075);
      ctx.font='900 15px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.lineWidth=3.2;ctx.strokeStyle='rgba(19,16,14,.78)';ctx.strokeText(controlTag,0,0);
      ctx.fillStyle=accent;ctx.globalAlpha=.92;ctx.fillText(controlTag,0,0);
      ctx.strokeStyle=accent;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-18,9);ctx.quadraticCurveTo(0,12,19,7);ctx.stroke();
      ctx.globalAlpha=.58;for(const dx of [-11,5,14])ctx.fillRect(dx,8,1,4+((dx+20)%5));ctx.globalAlpha=1;ctx.restore();
    }
  } else if(p.kind==='stall'){
    ctx.strokeStyle='#8b6b46';ctx.lineWidth=3;for(const x of [r.x+6,r.x+r.w-6]){ctx.beginPath();ctx.moveTo(x,r.y+8);ctx.lineTo(x,r.y+r.h+10);ctx.stroke();}
    ctx.fillStyle='#4b3624';ctx.fillRect(r.x+3,r.y+r.h*.48,r.w-6,r.h*.48);drawLabel(ctx,p.label,r.x,r.y,r.w,accent);
  } else if(p.kind==='dumpster'){
    ctx.fillStyle=m.shadow;ctx.fillRect(r.x,r.y+4,r.w,r.h);ctx.fillStyle='#35524a';ctx.fillRect(r.x,r.y,r.w,r.h);
    ctx.fillStyle='#5d7c72';ctx.fillRect(r.x,r.y,r.w,4);ctx.strokeStyle='#17211e';ctx.strokeRect(r.x,r.y,r.w,r.h);
    for(let x=r.x+7;x<r.x+r.w;x+=11){ctx.beginPath();ctx.moveTo(x,r.y+5);ctx.lineTo(x,r.y+r.h-3);ctx.stroke();}
  } else if(p.kind==='bench'){
    ctx.fillStyle='#6b442b';ctx.fillRect(r.x,r.y+4,r.w,r.h*.45);ctx.fillRect(r.x,r.y+r.h*.58,r.w,r.h*.25);
    ctx.strokeStyle='#9ca3af';ctx.lineWidth=2;for(const x of [r.x+5,r.x+r.w-5]){ctx.beginPath();ctx.moveTo(x,r.y+r.h*.75);ctx.lineTo(x,r.y+r.h+6);ctx.stroke();}
  } else if(p.kind==='crate_stack'){
    const bw=r.w*.48,bh=r.h*.48;for(let i=0;i<3;i++){const x=r.x+(i%2)*bw*.92,y=r.y+(i>1?0:bh*.82);ctx.fillStyle='#6f5138';ctx.fillRect(x,y,bw,bh);ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillRect(x+2,y+2,bw-4,2);ctx.strokeStyle='#927252';ctx.strokeRect(x,y,bw,bh);ctx.strokeStyle='rgba(54,38,27,.65)';ctx.beginPath();ctx.moveTo(x+3,y+3);ctx.lineTo(x+bw-3,y+bh-3);ctx.moveTo(x+bw-3,y+3);ctx.lineTo(x+3,y+bh-3);ctx.stroke();}
  } else if(p.kind==='container'){
    const body=p.accent??'#475569';ctx.fillStyle=body;ctx.fillRect(r.x,r.y,r.w,r.h);ctx.fillStyle='rgba(255,255,255,.09)';ctx.fillRect(r.x,r.y,r.w,3);ctx.strokeStyle='#111827';ctx.strokeRect(r.x,r.y,r.w,r.h);
    for(let x=r.x+8;x<r.x+r.w;x+=10){ctx.strokeStyle='rgba(226,232,240,.16)';ctx.beginPath();ctx.moveTo(x,r.y+3);ctx.lineTo(x,r.y+r.h-3);ctx.stroke();}
    ctx.fillStyle='rgba(120,53,15,.22)';ctx.fillRect(r.x+r.w*.18,r.y+r.h*.62,r.w*.18,3);ctx.fillRect(r.x+r.w*.70,r.y+r.h*.25,r.w*.12,2);
  }
  else if(p.kind==='pallets'){
    const stacks=Math.max(2,Math.min(3,Math.floor(r.h/8)));for(let s=0;s<stacks;s++){const py=r.y+r.h-5-s*7;ctx.fillStyle='#684b34';ctx.fillRect(r.x,py,r.w,4);ctx.fillStyle='#8a6848';for(let x=r.x+2;x<r.x+r.w-3;x+=8)ctx.fillRect(x,py-3,5,3);ctx.fillStyle='#4b3628';ctx.fillRect(r.x+4,py+4,4,3);ctx.fillRect(r.x+r.w-8,py+4,4,3);}
  } else if(p.kind==='sandbags'){
    ctx.fillStyle='#78716c';const rows=Math.max(1,Math.floor(r.h/7));
    for(let row=0;row<rows;row++){for(let x=r.x+6+(row%2)*5;x<r.x+r.w-2;x+=14){ctx.beginPath();ctx.ellipse(x,r.y+5+row*7,8,4,0,0,Math.PI*2);ctx.fill();}}
    ctx.strokeStyle='rgba(231,229,228,.28)';ctx.strokeRect(r.x,r.y,r.w,r.h);
  } else if(p.kind==='barricade'||p.kind==='checkpoint'){
    if(p.id==='t1-barricade-center'){
      ctx.fillStyle='#54575a';ctx.beginPath();ctx.moveTo(r.x+5,r.y);ctx.lineTo(r.x+r.w-5,r.y);ctx.lineTo(r.x+r.w,r.y+r.h);ctx.lineTo(r.x,r.y+r.h);ctx.closePath();ctx.fill();
      ctx.fillStyle='#747574';ctx.fillRect(r.x+6,r.y+2,r.w-12,3);ctx.strokeStyle='#303438';ctx.lineWidth=1;ctx.strokeRect(r.x+.5,r.y+.5,r.w-1,r.h-1);
      ctx.fillStyle=accent;ctx.globalAlpha=.56;ctx.fillRect(r.x+r.w*.34,r.y+4,r.w*.30,3);ctx.globalAlpha=1;
      ctx.fillStyle='#2e3338';for(const x of [r.x+8,r.x+r.w-11])ctx.fillRect(x,r.y+r.h,4,6);
      ctx.fillStyle='rgba(226,232,240,.30)';for(const x of [r.x+9,r.x+r.w-10]){ctx.beginPath();ctx.arc(x,r.y+4,1.2,0,Math.PI*2);ctx.fill();}
    }else{
      ctx.fillStyle='#1f2937';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(r.x,r.y,r.w,r.h);
      const stripe=Math.max(8,r.w/8);for(let x=r.x;x<r.x+r.w;x+=stripe){ctx.fillStyle=((x-r.x)/stripe)%2<1?accent:'#f8fafc';ctx.globalAlpha=.72;ctx.fillRect(x,r.y+3,Math.min(stripe,r.x+r.w-x),Math.max(3,r.h-6));}ctx.globalAlpha=1;
    }
  } else if(p.kind==='planter'){
    if(p.id.startsWith('t1-')){
      ctx.fillStyle='#5e5b55';ctx.beginPath();ctx.moveTo(r.x+2,r.y+r.h*.42);ctx.lineTo(r.x+r.w-2,r.y+r.h*.42);ctx.lineTo(r.x+r.w-5,r.y+r.h);ctx.lineTo(r.x+5,r.y+r.h);ctx.closePath();ctx.fill();
      ctx.fillStyle='#27231e';ctx.fillRect(r.x+4,r.y+r.h*.34,r.w-8,5);ctx.strokeStyle='#8b8175';ctx.lineWidth=1;ctx.strokeRect(r.x+3,r.y+r.h*.42,r.w-6,r.h*.48);
      ctx.fillStyle='#315d3d';for(const [ox,oy,rr] of [[.24,.31,.18],[.50,.20,.22],[.74,.33,.17]] as const){ctx.beginPath();ctx.arc(r.x+r.w*ox,r.y+r.h*oy,Math.max(3,r.h*rr),0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='rgba(112,166,111,.30)';ctx.beginPath();ctx.arc(r.x+r.w*.48,r.y+r.h*.16,Math.max(2,r.h*.11),0,Math.PI*2);ctx.fill();
    }else{
      ctx.fillStyle='#5b6470';ctx.fillRect(r.x,r.y+r.h*.55,r.w,r.h*.45);ctx.fillStyle='#2b6a4b';ctx.fillRect(r.x+3,r.y+3,r.w-6,r.h*.62);
      ctx.strokeStyle='#8b96a3';ctx.strokeRect(r.x,r.y+r.h*.55,r.w,r.h*.45);
    }
  } else if(p.kind==='security_booth'){
    ctx.fillStyle='#cbd5e1';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.fillStyle='#173b52';ctx.fillRect(r.x+5,r.y+8,r.w-10,r.h*.42);
    ctx.fillStyle='#1f2937';ctx.fillRect(r.x+r.w*.38,r.y+r.h*.55,r.w*.24,r.h*.45);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(r.x,r.y,r.w,r.h);drawLabel(ctx,p.label,r.x,r.y,r.w,accent);
  } else if(p.kind==='parked_car'){
    ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(r.x+4,r.y+5,r.w,r.h);ctx.fillStyle=p.accent??'#475569';ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,6);ctx.fill();
    ctx.fillStyle='#0f172a';ctx.fillRect(r.x+r.w*.23,r.y+3,r.w*.54,r.h*.34);ctx.fillStyle='#94a3b8';ctx.globalAlpha=.34;ctx.fillRect(r.x+r.w*.28,r.y+5,r.w*.42,3);ctx.globalAlpha=1;
    ctx.fillStyle='#111827';for(const x of [r.x+7,r.x+r.w-11]){ctx.fillRect(x,r.y-2,8,4);ctx.fillRect(x,r.y+r.h-2,8,4);}
  }
  else if(p.kind==='watch_post'){
    const deckY=r.y+r.h*.42;
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(r.x+5,deckY+6,r.w,r.h*.46);
    ctx.strokeStyle='#64748b';ctx.lineWidth=4;for(const x of [r.x+7,r.x+r.w-7]){ctx.beginPath();ctx.moveTo(x,deckY+8);ctx.lineTo(x,r.y+r.h+9);ctx.stroke();}
    ctx.fillStyle='#303844';ctx.fillRect(r.x,deckY,r.w,r.h*.44);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(r.x,deckY,r.w,r.h*.44);
    ctx.fillStyle='#111827';ctx.fillRect(r.x+6,deckY+7,r.w-12,Math.max(7,r.h*.15));
    ctx.fillStyle=accent;ctx.globalAlpha=.65;ctx.fillRect(r.x+8,deckY+9,Math.max(8,(r.w-16)*.42),3);ctx.globalAlpha=1;
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(r.x+r.w*.72,deckY);ctx.lineTo(r.x+r.w*.72,deckY-13);ctx.stroke();
  } else if(p.kind==='bollards'){
    const count=Math.max(3,Math.floor(r.w/18));for(let i=0;i<count;i++){const x=r.x+(i+.5)*r.w/count;ctx.fillStyle='#1f2937';ctx.fillRect(x-3,r.y,6,r.h+7);ctx.fillStyle=accent;ctx.fillRect(x-3,r.y+3,6,3);}
  } else if(p.kind==='service_unit'){
    ctx.fillStyle='#252d38';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle=accent;ctx.lineWidth=1.5;ctx.strokeRect(r.x,r.y,r.w,r.h);
    ctx.fillStyle='#111827';ctx.fillRect(r.x+5,r.y+7,r.w-10,r.h*.38);ctx.fillStyle=accent;ctx.globalAlpha=.65;ctx.fillRect(r.x+7,r.y+9,Math.max(4,(r.w-14)*.45),3);ctx.globalAlpha=1;drawLabel(ctx,p.label,r.x,r.y,r.w,accent);
  }
  ctx.restore();
};

const usesTerritoryControlAccent = (territoryId:number,p:PurposeProp) =>
  (territoryId===1 && (p.id==='t1-entry-wall'||p.id==='t1-wall-back'||p.id==='t1-barricade-center')) ||
  (territoryId===4 && (p.kind==='watch_post'||p.kind==='barricade')) ||
  (territoryId===5 && (p.kind==='security_booth'||p.kind==='bollards')) ||
  (territoryId===6 && (p.kind==='checkpoint'||p.kind==='service_unit'||p.kind==='bollards'));

export const drawPurposefulDepthProp = (
  ctx:CanvasRenderingContext2D,p:PurposeProp,width:number,height:number,territoryId:number,controlColor?:string,controlTag?:string,renderZoom=1
) => {
  if(!isDepthSortedPurposeProp(p)) return;
  drawPropContext(ctx,p,width,height,territoryId);
  drawBaseProp(ctx,p,width,height,usesTerritoryControlAccent(territoryId,p)?controlColor:undefined,controlTag);
  if(territoryId===1)drawT1PropFinish(ctx,p,width,height,renderZoom);
};

export const drawPurposefulPropsFoundation = (
  ctx:CanvasRenderingContext2D,width:number,height:number,territoryId:number,controlColor?:string,controlTag?:string
) => {
  for(const prop of getTerritoryPurposeProps(territoryId)) {
    if(isArchitecturalPurposeProp(prop)){
      drawPropContext(ctx,prop,width,height,territoryId);
      continue;
    }
    if(isDepthSortedPurposeProp(prop)) continue;
    drawPropContext(ctx,prop,width,height,territoryId);
    drawBaseProp(ctx,prop,width,height,usesTerritoryControlAccent(territoryId,prop)?controlColor:undefined,controlTag);
    if(territoryId===1)drawT1PropFinish(ctx,prop,width,height,1);
  }
};

export const drawPurposefulPropsOcclusion = (
  ctx:CanvasRenderingContext2D,width:number,height:number,territoryId:number,time:number,controlColor?:string
) => {
  ctx.save();
  for(const p of getTerritoryPurposeProps(territoryId)){
    if(!p.occludes || isArchitecturalPurposeProp(p)) continue;
    const r=rectOf(p,width,height), accent=(usesTerritoryControlAccent(territoryId,p)?controlColor:undefined)??p.accent??'#e2e8f0';
    if(p.kind==='stall'){
      for(let i=0;i<6;i++){ctx.fillStyle=i%2?accent:'#f8fafc';ctx.fillRect(r.x+i*r.w/6,r.y-8,r.w/6,10);}
      ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(r.x,r.y+2,r.w,3);
    } else if(p.kind==='planter'){
      const sway=Math.sin(time*.0018+r.x*.01)*2;ctx.fillStyle='#245a41';ctx.beginPath();ctx.arc(r.x+r.w*.5+sway,r.y+r.h*.30,Math.max(12,r.w*.32),0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#3f7d58';ctx.globalAlpha=.62;ctx.beginPath();ctx.arc(r.x+r.w*.42+sway,r.y+r.h*.22,Math.max(7,r.w*.18),0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    } else if(p.kind==='security_booth'||p.kind==='watch_post'){
      const roofY=p.kind==='watch_post'?r.y+r.h*.42-7:r.y-6;
      ctx.fillStyle=p.kind==='security_booth'?'#d8dee7':'#374151';ctx.fillRect(r.x-3,roofY,r.w+6,10);ctx.strokeStyle=accent;ctx.strokeRect(r.x-3,roofY,r.w+6,10);
    } else if(p.kind==='container'||p.kind==='service_unit'||p.kind==='crate_stack'){
      ctx.fillStyle='rgba(226,232,240,.18)';ctx.fillRect(r.x,r.y,r.w,3);
    }
  }
  ctx.restore();
};
