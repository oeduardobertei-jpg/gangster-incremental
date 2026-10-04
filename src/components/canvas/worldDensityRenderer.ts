import type { TacticalBuilding } from './favelaRenderer';
import { getTerritoryPurposeProps } from '../../data/territoryPurposeProps';

const seeded=(n:number)=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
const rgba=(hex:string,a:number)=>{const h=hex.replace('#','');if(h.length!==6)return hex;return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};

type Rect={x:number;y:number;w:number;h:number};
const overlaps=(a:Rect,b:Rect,pad=0)=>a.x<a.x+a.w&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;
const pointBlocked=(x:number,y:number,W:number,H:number,buildings:readonly TacticalBuilding[])=>{
  for(const b of buildings) if(x>b.x-18&&x<b.x+b.w+18&&y>b.y-18&&y<b.y+b.h+18) return true;
  for(const p of getTerritoryPurposeProps(1)) void p;
  return false;
};

const crack=(ctx:CanvasRenderingContext2D,x:number,y:number,len:number,angle:number,color='rgba(15,23,42,.30)')=>{
  ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);
  for(let i=1;i<=3;i++){const d=len*i/3;ctx.lineTo(x+Math.cos(angle+i*.18)*d,y+Math.sin(angle+i*.18)*d);}ctx.stroke();
};

const drain=(ctx:CanvasRenderingContext2D,x:number,y:number,w=18)=>{
  ctx.fillStyle='rgba(15,23,42,.52)';ctx.fillRect(x,y,w,5);ctx.strokeStyle='rgba(148,163,184,.24)';
  for(let i=3;i<w;i+=4){ctx.beginPath();ctx.moveTo(x+i,y+1);ctx.lineTo(x+i,y+4);ctx.stroke();}
};
const weed=(ctx:CanvasRenderingContext2D,x:number,y:number,scale=1,color='#637b4b')=>{
  ctx.strokeStyle=color;ctx.globalAlpha=.62;ctx.lineWidth=1;
  for(let i=0;i<5;i++){const dx=(i-2)*2*scale;ctx.beginPath();ctx.moveTo(x+dx,y);ctx.lineTo(x+dx+(i%2?2:-2)*scale,y-(4+i%3)*scale);ctx.stroke();}
  ctx.globalAlpha=1;
};

const litter=(ctx:CanvasRenderingContext2D,x:number,y:number,seed:number)=>{
  const colors=['#64748b','#9a6b45','#d1d5db','#475569'];
  for(let i=0;i<3;i++){ctx.fillStyle=colors[(seed+i)%colors.length];ctx.globalAlpha=.38;ctx.fillRect(x+i*5,y+(i%2)*3,3+(i%2),2);}
  ctx.globalAlpha=1;
};

const pole=(ctx:CanvasRenderingContext2D,x:number,y:number,h=34,light='#fde68a')=>{
  ctx.strokeStyle='#49515c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-h);ctx.stroke();
  ctx.strokeStyle='rgba(148,163,184,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-7,y-h+4);ctx.lineTo(x+7,y-h+4);ctx.stroke();
  ctx.fillStyle=light;ctx.globalAlpha=.62;ctx.beginPath();ctx.arc(x,y-h+2,2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
};

const utilityBox=(ctx:CanvasRenderingContext2D,x:number,y:number,w=16,h=20,accent='#64748b')=>{
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(x+3,y+3,w,h);ctx.fillStyle='#343b46';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=accent;ctx.globalAlpha=.5;ctx.strokeRect(x,y,w,h);ctx.globalAlpha=1;ctx.fillStyle='#111827';ctx.fillRect(x+4,y+5,w-8,3);
};

const cable=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,sag=8)=>{
  ctx.strokeStyle='rgba(15,23,42,.65)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+sag,x2,y2);ctx.stroke();
};
const manhole=(ctx:CanvasRenderingContext2D,x:number,y:number,r=8)=>{
  ctx.fillStyle='rgba(17,24,39,.62)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(148,163,184,.25)';ctx.stroke();
  ctx.beginPath();ctx.arc(x,y,r*.55,0,Math.PI*2);ctx.stroke();
};

const stencil=(_ctx:CanvasRenderingContext2D,_text:string,_x:number,_y:number,_color:string,_size=8)=>{};

const tree=(ctx:CanvasRenderingContext2D,x:number,y:number,r=14)=>{
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x+4,y+8,r*.85,r*.38,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#375f46';ctx.beginPath();ctx.arc(x,y-r*.15,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#47775a';ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(x-r*.25,y-r*.35,r*.58,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
};

const hazard=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{
  const stripe=8;for(let i=0;i<w;i+=stripe){ctx.fillStyle=(i/stripe)%2<1?'rgba(249,115,22,.22)':'rgba(15,23,42,.28)';ctx.fillRect(x+i,y,Math.min(stripe,w-i),4);}
};

const clothesline=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number)=>{ctx.strokeStyle='rgba(148,163,184,.28)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();for(let i=1;i<5;i++){const t=i/5,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;ctx.fillStyle=i%2?'rgba(59,130,246,.32)':'rgba(239,68,68,.30)';ctx.fillRect(x-2,y+2,4,6);}};
const drums=(ctx:CanvasRenderingContext2D,x:number,y:number)=>{for(let i=0;i<3;i++){ctx.fillStyle=i===1?'#7c3f22':'#46515d';ctx.beginPath();ctx.arc(x+i*9,y,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(226,232,240,.18)';ctx.stroke();}};
const stairs=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,steps=6)=>{
  const hh=steps*5;
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.moveTo(x+4,y+3);ctx.lineTo(x+w+4,y-7);ctx.lineTo(x+w+4,y+hh-2);ctx.lineTo(x+4,y+hh+8);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(107,114,116,.48)';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y-10);ctx.lineTo(x+w,y+hh-5);ctx.lineTo(x,y+hh+5);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(218,222,224,.26)';ctx.lineWidth=1;
  for(let i=0;i<=steps;i++){ctx.beginPath();ctx.moveTo(x,y+i*5);ctx.lineTo(x+w,y+i*5-10);ctx.stroke();}
  ctx.strokeStyle='rgba(55,65,70,.60)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+hh+5);ctx.stroke();
  ctx.restore();
};
const hedge=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{ctx.fillStyle='#214f39';ctx.fillRect(x,y,w,8);for(let i=4;i<w;i+=10){ctx.fillStyle=i%20?'#346a4b':'#2b5d42';ctx.beginPath();ctx.arc(x+i,y+2,6,0,Math.PI*2);ctx.fill();}};
const cameraPole=(ctx:CanvasRenderingContext2D,x:number,y:number,accent:string)=>{ctx.strokeStyle='#64748b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-24);ctx.stroke();ctx.fillStyle='#1f2937';ctx.fillRect(x-2,y-26,11,5);ctx.fillStyle=accent;ctx.globalAlpha=.55;ctx.fillRect(x+5,y-25,2,2);ctx.globalAlpha=1;};
const crosswalk=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{for(let i=0;i<6;i++){ctx.fillStyle='rgba(226,232,240,.16)';ctx.fillRect(x+i*w/6,y,w/12,10);}};

const scatterMicro=(ctx:CanvasRenderingContext2D,W:number,H:number,seed:number,count:number,buildings:readonly TacticalBuilding[],mode:'urban'|'rail'|'industrial'|'dry'|'clean'|'secure')=>{
  for(let i=0;i<count;i++){
    const x=(.04+seeded(seed+i*7)*.92)*W,y=(.08+seeded(seed+i*13+5)*.84)*H;
    if(pointBlocked(x,y,W,H,buildings)) continue;
    const pick=Math.floor(seeded(seed+i*29)*4);
    if(mode==='clean'||mode==='secure'){if(pick===0) drain(ctx,x,y,14);else if(pick===1) crack(ctx,x,y,8+seeded(i)*9,seeded(i+2)*6.2,'rgba(15,23,42,.16)');else if(pick===2) manhole(ctx,x,y,5);}
    else if(mode==='industrial'){if(pick===0) weed(ctx,x,y,.7,'#566448');else if(pick===1) litter(ctx,x,y,i);else if(pick===2) crack(ctx,x,y,10+seeded(i)*14,seeded(i+1)*6.2,'rgba(0,0,0,.26)');else drain(ctx,x,y,16);}
    else if(mode==='rail'){if(pick===0||pick===1) weed(ctx,x,y,.75,'#657348');else if(pick===2) litter(ctx,x,y,i);else crack(ctx,x,y,9,seeded(i)*6.2);}
    else if(mode==='dry'){if(pick<2) weed(ctx,x,y,.8,'#7b7849');else if(pick===2) litter(ctx,x,y,i);else crack(ctx,x,y,12,seeded(i)*6.2,'rgba(44,25,18,.30)');}
    else {if(pick===0) weed(ctx,x,y,.7);else if(pick===1) litter(ctx,x,y,i);else if(pick===2) crack(ctx,x,y,10,seeded(i)*6.2);else drain(ctx,x,y,14);}
  }
};
const groundZone=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,edge:string,_label?:string)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=1;ctx.stroke();};
const parkingBays=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,count=5)=>{ctx.strokeStyle='rgba(226,232,240,.12)';ctx.strokeRect(x,y,w,h);for(let i=1;i<count;i++){const xx=x+w*i/count;ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+h);ctx.stroke();}};
const curbDots=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,count=8,color='rgba(148,163,184,.18)')=>{ctx.fillStyle=color;for(let i=0;i<count;i++){const t=(i+.5)/count;ctx.beginPath();ctx.arc(x1+(x2-x1)*t,y1+(y2-y1)*t,2,0,Math.PI*2);ctx.fill();}};

const drawT1=(ctx:CanvasRenderingContext2D,W:number,H:number,b:readonly TacticalBuilding[])=>{
  scatterMicro(ctx,W,H,101,34,b,'urban');
  for(const [x,y] of [[.10,.30],[.17,.57],[.86,.34],[.83,.66],[.58,.18],[.37,.82]] as const) pole(ctx,W*x,H*y,30+((x*100)%2)*8);
  cable(ctx,W*.10,H*.25,W*.17,H*.52,10);cable(ctx,W*.17,H*.52,W*.37,H*.77,14);cable(ctx,W*.86,H*.29,W*.83,H*.61,11);
  for(const [x,y] of [[.25,.27],[.72,.31],[.29,.75],[.68,.77]] as const) utilityBox(ctx,W*x,H*y,13,18,'#8b5e3c');
  for(const [x,y] of [[.22,.44],[.74,.57],[.09,.67],[.89,.50]] as const) stencil(ctx,'RUA',W*x,H*y,'rgba(248,250,252,.10)',7);
  clothesline(ctx,W*.055,H*.62,W*.19,H*.59);clothesline(ctx,W*.70,H*.72,W*.86,H*.69);
};

const drawT2=(ctx:CanvasRenderingContext2D,W:number,H:number,b:readonly TacticalBuilding[])=>{
  scatterMicro(ctx,W,H,202,72,b,'rail');
  for(const y of [.17,.25,.33]){ctx.strokeStyle='rgba(148,163,184,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.03,H*y);ctx.lineTo(W*.97,H*y);ctx.stroke();
    for(let x=.04;x<.97;x+=.035){ctx.fillStyle='rgba(71,85,105,.30)';ctx.fillRect(W*x-2,H*y-5,4,10);}}
  for(const [x,y] of [[.08,.15],[.27,.15],[.72,.15],[.92,.15]] as const) pole(ctx,W*x,H*y,27,'#fde68a');
  for(const [x,y] of [[.12,.39],[.35,.40],[.64,.40],[.87,.39]] as const) utilityBox(ctx,W*x,H*y,14,19,'#eab308');
  stencil(ctx,'PLATAFORMA',W*.50,H*.405,'rgba(250,204,21,.16)',9);stencil(ctx,'LINHA 02',W*.50,H*.115,'rgba(226,232,240,.11)',8);
  for(const x of [.18,.42,.62,.84]){ctx.strokeStyle='rgba(226,232,240,.24)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*x,H*.10);ctx.lineTo(W*x,H*.35);ctx.stroke();ctx.fillStyle='#eab308';ctx.beginPath();ctx.arc(W*x,H*.14,3,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='rgba(234,179,8,.08)';ctx.fillRect(W*.08,H*.42,W*.24,H*.035);ctx.fillRect(W*.68,H*.42,W*.24,H*.035);
  groundZone(ctx,W*.08,H*.50,W*.24,H*.12,'rgba(63,55,68,.12)','rgba(234,179,8,.14)','FEIRA OESTE');
  groundZone(ctx,W*.68,H*.50,W*.24,H*.12,'rgba(63,55,68,.12)','rgba(20,184,166,.13)','FEIRA LESTE');
  curbDots(ctx,W*.05,H*.36,W*.95,H*.36,18,'rgba(226,232,240,.15)');
};

const drawT3=(ctx:CanvasRenderingContext2D,W:number,H:number,b:readonly TacticalBuilding[])=>{
  scatterMicro(ctx,W,H,303,78,b,'industrial');
  for(const [x,y] of [[.08,.22],[.18,.60],[.82,.24],[.90,.66],[.35,.18],[.67,.80]] as const) utilityBox(ctx,W*x,H*y,18,22,'#f97316');
  for(const [x,y,w] of [[.12,.46,.13],[.72,.36,.14],[.38,.72,.15]] as const) hazard(ctx,W*x,H*y,W*w);
  for(const [x,y] of [[.14,.53],[.28,.18],[.76,.55],[.86,.31]] as const) manhole(ctx,W*x,H*y,7);
  stencil(ctx,'ZONA INDUSTRIAL',W*.50,H*.16,'rgba(249,115,22,.13)',10);stencil(ctx,'ACESSO TÉCNICO',W*.50,H*.86,'rgba(226,232,240,.10)',8);
  drums(ctx,W*.16,H*.72);drums(ctx,W*.76,H*.29);drums(ctx,W*.82,H*.70);
  ctx.strokeStyle='rgba(100,116,139,.11)';ctx.lineWidth=2;for(const y of [.20,.82]){ctx.beginPath();ctx.moveTo(W*.08,H*y);ctx.lineTo(W*.92,H*y);ctx.stroke();for(let x=.12;x<.9;x+=.12){ctx.beginPath();ctx.arc(W*x,H*y,4,0,Math.PI*2);ctx.stroke();}}
  groundZone(ctx,W*.10,H*.32,W*.20,H*.12,'rgba(55,65,81,.13)','rgba(249,115,22,.15)','OFICINA');
  groundZone(ctx,W*.70,H*.57,W*.20,H*.12,'rgba(55,65,81,.13)','rgba(148,163,184,.13)','SERVIÇO');
  parkingBays(ctx,W*.33,H*.25,W*.16,H*.08,4);parkingBays(ctx,W*.54,H*.67,W*.15,H*.08,4);
};
const drawT4=(ctx:CanvasRenderingContext2D,W:number,H:number,b:readonly TacticalBuilding[],_control:string)=>{
  // 0.9.7B: density pass contributes utility/life only; terrain belongs to t4GroundReauthorRenderer.
  scatterMicro(ctx,W,H,404,30,b,'dry');
  for(const [x,y] of [[.11,.30],[.24,.51],[.79,.29],[.87,.58]] as const) pole(ctx,W*x,H*y,27,'#fecaca');
  cable(ctx,W*.11,H*.26,W*.24,H*.47,10);cable(ctx,W*.79,H*.25,W*.87,H*.54,9);
  clothesline(ctx,W*.07,H*.56,W*.21,H*.53);clothesline(ctx,W*.76,H*.67,W*.91,H*.64);
};
const drawT5=(ctx:CanvasRenderingContext2D,W:number,H:number,b:readonly TacticalBuilding[])=>{
  scatterMicro(ctx,W,H,505,54,b,'clean');
  for(const [x,y] of [[.12,.18],[.12,.45],[.12,.72],[.88,.18],[.88,.45],[.88,.72]] as const){tree(ctx,W*x,H*y,13);pole(ctx,W*(x+(x<.5?.025:-.025)),H*(y+.025),28,'#e0f2fe');}
  for(const [x,y] of [[.27,.24],[.73,.24],[.27,.66],[.73,.66]] as const) utilityBox(ctx,W*x,H*y,12,17,'#38bdf8');
  // Gold pass: parking/use is communicated by physical bays and landscaping, not a CAD grid.
  stencil(ctx,'VISITANTES',W*.34,H*.43,'rgba(226,232,240,.065)',8);stencil(ctx,'MORADORES',W*.66,H*.43,'rgba(226,232,240,.065)',8);
  for(const [x,y] of [[.42,.30],[.58,.57],[.50,.76]] as const) manhole(ctx,W*x,H*y,6);
  groundZone(ctx,W*.24,H*.18,W*.18,H*.12,'rgba(148,163,184,.030)','rgba(226,232,240,.070)');
  groundZone(ctx,W*.58,H*.57,W*.18,H*.12,'rgba(148,163,184,.030)','rgba(125,211,252,.065)');
  parkingBays(ctx,W*.27,H*.34,W*.14,H*.075,4);parkingBays(ctx,W*.59,H*.34,W*.14,H*.075,4);
  curbDots(ctx,W*.18,H*.14,W*.18,H*.84,15,'rgba(226,232,240,.13)');curbDots(ctx,W*.82,H*.14,W*.82,H*.84,15,'rgba(226,232,240,.13)');
  hedge(ctx,W*.05,H*.27,W*.17);hedge(ctx,W*.78,H*.27,W*.17);hedge(ctx,W*.05,H*.60,W*.17);hedge(ctx,W*.78,H*.60,W*.17);
  crosswalk(ctx,W*.455,H*.34,W*.09);crosswalk(ctx,W*.455,H*.70,W*.09);
  for(const [x,y] of [[.20,.50],[.80,.50],[.20,.82],[.80,.82]] as const) pole(ctx,W*x,H*y,24,'#bae6fd');
};

const drawT6=(ctx:CanvasRenderingContext2D,W:number,H:number,b:readonly TacticalBuilding[],control:string)=>{
  scatterMicro(ctx,W,H,606,46,b,'secure');
  for(const [x,y] of [[.31,.17],[.69,.17],[.31,.47],[.69,.47],[.31,.77],[.69,.77]] as const){pole(ctx,W*x,H*y,30,'#e5e7eb');ctx.strokeStyle='rgba(148,153,156,.30)';ctx.strokeRect(W*x-5,H*y-34,10,7);}
  for(const [x,y] of [[.39,.24],[.61,.24],[.39,.58],[.61,.58],[.50,.73]] as const) utilityBox(ctx,W*x,H*y,14,18,'#777d80');
  stencil(ctx,'PERÍMETRO RESTRITO',W*.50,H*.12,'rgba(203,213,225,.13)',9);stencil(ctx,'EIXO DE COMANDO',W*.50,H*.90,'rgba(226,232,240,.11)',8);
  drain(ctx,W*.43,H*.52,22);drain(ctx,W*.55,H*.52,22);
  groundZone(ctx,W*.38,H*.19,W*.24,H*.085,'rgba(120,124,126,.020)','rgba(180,184,186,.060)');
  groundZone(ctx,W*.38,H*.73,W*.24,H*.085,'rgba(62,64,65,.040)','rgba(184,188,190,.055)');
  parkingBays(ctx,W*.07,H*.36,W*.18,H*.12,4);parkingBays(ctx,W*.75,H*.36,W*.18,H*.12,4);
  curbDots(ctx,W*.33,H*.12,W*.33,H*.88,14,'rgba(176,181,184,.12)');curbDots(ctx,W*.67,H*.12,W*.67,H*.88,14,'rgba(176,181,184,.12)');
  for(const [x,y] of [[.285,.30],[.715,.30],[.285,.61],[.715,.61],[.285,.86],[.715,.86]] as const) cameraPole(ctx,W*x,H*y,'#777d80');
  stencil(ctx,'SETOR A',W*.39,H*.36,'rgba(203,213,225,.055)',7);stencil(ctx,'SETOR B',W*.61,H*.74,'rgba(203,213,225,.055)',7);
};
const liveGlow=(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,alpha:number)=>{
  const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,rgba(color,alpha));g.addColorStop(1,rgba(color,0));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
};

export function drawWorldDensityFoundation(
  ctx:CanvasRenderingContext2D,W:number,H:number,territoryId:number,controlColor:string,
  buildings:readonly TacticalBuilding[]
){
  ctx.save();
  if(territoryId===1) drawT1(ctx,W,H,buildings);
  else if(territoryId===2) drawT2(ctx,W,H,buildings);
  else if(territoryId===3) drawT3(ctx,W,H,buildings);
  else if(territoryId===4) drawT4(ctx,W,H,buildings,controlColor);
  else if(territoryId===5) drawT5(ctx,W,H,buildings);
  else if(territoryId===6) drawT6(ctx,W,H,buildings,controlColor);
  ctx.restore();
}
export function drawWorldDensityOverlay(
  ctx:CanvasRenderingContext2D,W:number,H:number,territoryId:number,time:number,controlColor:string
){
  const pulse=.5+.5*Math.sin(time*.0042);ctx.save();
  if(territoryId===1){
    // Keep only cheap emissive cores animated; the expensive radial falloff is cached above.
    ctx.fillStyle=`rgba(251,191,36,${.11+.05*pulse})`;ctx.beginPath();ctx.arc(W*.255,H*.585,2.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(251,191,36,${.09+.04*(1-pulse)})`;ctx.beginPath();ctx.arc(W*.69,H*.36,1.8,0,Math.PI*2);ctx.fill();
  } else if(territoryId===2){
    const green=Math.sin(time*.002)>0;for(const x of [.18,.42,.62,.84]){ctx.fillStyle=green?'rgba(34,197,94,.55)':'rgba(239,68,68,.52)';ctx.beginPath();ctx.arc(W*x,H*.14,2.6,0,Math.PI*2);ctx.fill();}
  } else if(territoryId===3){
    if(Math.sin(time*.019)>0.72){liveGlow(ctx,W*.82,H*.24,18,'#60a5fa',.13);ctx.fillStyle='rgba(191,219,254,.8)';ctx.fillRect(W*.82,H*.24,2,2);}liveGlow(ctx,W*.35,H*.18,18,'#f97316',.025+.025*pulse);
  } else if(territoryId===4){
    for(const [x,y] of [[.16,.18],[.79,.42]] as const) liveGlow(ctx,W*x,H*y,17,controlColor,.025+.035*pulse);
  } else if(territoryId===5){
    for(const [x,y] of [[.12,.18],[.12,.45],[.12,.72],[.88,.18],[.88,.45],[.88,.72]] as const) liveGlow(ctx,W*x,H*y,18,'#bae6fd',.018+.014*pulse);
  } else if(territoryId===6){
    const sweep=(time*.00009)%1;ctx.strokeStyle=`rgba(229,231,235,${.018+.012*pulse})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W*(.36+.28*sweep),H*.16);ctx.lineTo(W*(.36+.28*sweep),H*.82);ctx.stroke();
  }
  ctx.restore();
}
