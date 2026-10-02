import { getTerritoryPurposeProps, PurposeProp } from '../../data/territoryPurposeProps';
import { WORLD_MATERIALS } from '../../data/visualTokens';
import { drawCityVivaContextBuilding } from './buildingSkins';

const rectOf = (p: PurposeProp, w: number, h: number) => ({
  x:p.x*w, y:p.y*h, w:p.w*w, h:p.h*h
});


export const isArchitecturalPurposeProp=(p:PurposeProp)=>
  p.kind==='stall'||p.kind==='security_booth'||p.kind==='watch_post'||p.kind==='service_unit';
const architectureRole=(territoryId:number,p:PurposeProp)=>{
  if(p.kind==='stall') return territoryId===2?'Box da Feira':'Barraquinha';
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
    ctx.fillStyle='rgba(0,0,0,.34)';ctx.fillRect(r.x+5,r.y+6,r.w,r.h+5);
    ctx.fillStyle='#6f4b38';ctx.fillRect(r.x,r.y+2,r.w,r.h-2);
    ctx.fillStyle='#8b6a55';ctx.fillRect(r.x+2,r.y,r.w-4,4);
    ctx.strokeStyle='rgba(45,31,25,.48)';ctx.lineWidth=1;
    for(let y=r.y+8;y<r.y+r.h-1;y+=7){ctx.beginPath();ctx.moveTo(r.x+3,y);ctx.lineTo(r.x+r.w-3,y);ctx.stroke();}
    for(let x=r.x+17;x<r.x+r.w-4;x+=24){ctx.beginPath();ctx.moveTo(x,r.y+4);ctx.lineTo(x-3,r.y+r.h);ctx.stroke();}
    ctx.fillStyle='#5d5148';ctx.fillRect(r.x-3,r.y-1,5,r.h+3);ctx.fillRect(r.x+r.w-2,r.y-1,5,r.h+3);
    if(controlTag&&p.id==='t1-wall-a'){
      ctx.save();ctx.translate(r.x+r.w*.58,r.y+r.h*.55);ctx.rotate(-.08);
      ctx.font='900 11px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.lineWidth=2.5;ctx.strokeStyle='rgba(12,14,13,.72)';ctx.strokeText(controlTag,0,0);
      ctx.fillStyle=accent;ctx.globalAlpha=.78;ctx.fillText(controlTag,0,0);ctx.globalAlpha=1;ctx.restore();
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
    ctx.fillStyle='#1f2937';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(r.x,r.y,r.w,r.h);
    const stripe=Math.max(8,r.w/8);for(let x=r.x;x<r.x+r.w;x+=stripe){ctx.fillStyle=((x-r.x)/stripe)%2<1?accent:'#f8fafc';ctx.globalAlpha=.72;ctx.fillRect(x,r.y+3,Math.min(stripe,r.x+r.w-x),Math.max(3,r.h-6));}ctx.globalAlpha=1;
  } else if(p.kind==='planter'){
    ctx.fillStyle='#5b6470';ctx.fillRect(r.x,r.y+r.h*.55,r.w,r.h*.45);ctx.fillStyle='#2b6a4b';ctx.fillRect(r.x+3,r.y+3,r.w-6,r.h*.62);
    ctx.strokeStyle='#8b96a3';ctx.strokeRect(r.x,r.y+r.h*.55,r.w,r.h*.45);
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
  (territoryId===4 && (p.kind==='watch_post'||p.kind==='barricade')) ||
  (territoryId===5 && (p.kind==='security_booth'||p.kind==='bollards')) ||
  (territoryId===6 && (p.kind==='checkpoint'||p.kind==='service_unit'||p.kind==='bollards'));

export const drawPurposefulPropsFoundation = (
  ctx:CanvasRenderingContext2D,width:number,height:number,territoryId:number,controlColor?:string,controlTag?:string
) => {
  for(const prop of getTerritoryPurposeProps(territoryId)) {
    if(isArchitecturalPurposeProp(prop)){
      drawPropContext(ctx,prop,width,height,territoryId);
      continue;
    }
    drawPropContext(ctx,prop,width,height,territoryId);
    drawBaseProp(ctx,prop,width,height,usesTerritoryControlAccent(territoryId,prop)?controlColor:undefined,controlTag);
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
