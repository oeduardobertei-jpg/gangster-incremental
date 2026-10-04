import type { TacticalBuilding } from './favelaRenderer';

const rgba=(hex:string,a:number)=>{
  const v=hex.replace('#','');
  if(!/^[0-9a-fA-F]{6}$/.test(v)) return hex;
  const r=parseInt(v.slice(0,2),16),g=parseInt(v.slice(2,4),16),b=parseInt(v.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
};
const line=(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string,w=1)=>{
  c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
};
const rect=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.strokeRect(x,y,w,h);}
};
const wheel=(c:CanvasRenderingContext2D,x:number,y:number,r=4)=>{
  c.strokeStyle='rgba(15,23,42,.72)';c.lineWidth=2;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();
};
const chair=(c:CanvasRenderingContext2D,x:number,y:number)=>{
  c.fillStyle='rgba(0,0,0,.20)';c.beginPath();c.ellipse(x+5,y+10,7,2,.08,0,Math.PI*2);c.fill();
  rect(c,x,y,10,4,'#755138','#9a7655');rect(c,x+1,y-8,9,5,'#654631','#8f6b4c');
  c.fillStyle='rgba(235,209,171,.16)';c.fillRect(x+2,y+1,6,1);c.fillRect(x+3,y-7,5,1);
  line(c,x+1,y+4,x,y+11,'#4a3b32',1.8);line(c,x+9,y+4,x+10,y+11,'#4a3b32',1.8);
  line(c,x+1,y-3,x+1,y+1,'#4a3b32',1.6);line(c,x+9,y-3,x+9,y+1,'#4a3b32',1.6);
};

const drawUtilities=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  ctx.save();
  // 0.9.5D: infraestrutura de borda. Cabos terminam em caixas/medidores em vez de flutuar.
  const boxes=[[.286,.402,18,23],[.858,.535,20,25],[.112,.575,17,22],[.716,.805,18,22]] as const;
  for(const [nx,ny,bw,bh] of boxes){
    const x=w*nx,y=h*ny;rect(ctx,x,y,bw,bh,'#303941','#59636d');rect(ctx,x+4,y+5,bw-8,8,'#141b21','#68737e');
    ctx.fillStyle='#c69b45';ctx.globalAlpha=.72;ctx.fillRect(x+bw-6,y+4,2,3);ctx.globalAlpha=1;
    line(ctx,x+bw*.5,y,x+bw*.5,y-17,'#59636d',2);line(ctx,x+bw*.5,y-17,x+bw*.5+9,y-25,'#374151',1.3);
  }
  // Pequenos conduÃƒÂ­tes e descidas de ÃƒÂ¡gua junto ÃƒÂ s bordas residenciais.
  for(const [nx,ny,dir] of [[.065,.46,1],[.905,.40,-1],[.073,.81,1],[.868,.76,-1]] as const){
    const x=w*nx,y=h*ny;line(ctx,x,y-18,x,y+18,'rgba(89,101,111,.72)',2);
    line(ctx,x,y+18,x+dir*10,y+22,'rgba(89,101,111,.58)',2);
    rect(ctx,x-4,y-6,8,7,'#b8c0c7','#4b5563');
  }
  // Um transformador secundÃƒÂ¡rio reforÃƒÂ§a a leitura de rede improvisada.
  const tx=w*.685,ty=h*.305;rect(ctx,tx-13,ty-8,26,16,'#555d61','#899196');
  line(ctx,tx-17,ty-11,tx+17,ty-11,'#59636d',2);line(ctx,tx,ty-11,tx,ty-27,'#59636d',2);
  ctx.restore();
};

const drawGroundMicro=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  ctx.save();
  // 0.9.5E: sarjetas e grelhas curtas seguem pontos de drenagem plausÃƒÂ­veis.
  ctx.strokeStyle='rgba(126,121,113,.25)';ctx.lineWidth=3;
  for(const [x1,y1,x2,y2] of [[.445,.855,.475,.805],[.518,.595,.535,.535],[.476,.355,.488,.295]] as const){
    ctx.beginPath();ctx.moveTo(w*x1,h*y1);ctx.lineTo(w*x2,h*y2);ctx.stroke();
  }
  for(const [nx,ny,ww] of [[.454,.792,29],[.522,.503,25],[.486,.274,23],[.735,.647,26]] as const){
    const x=w*nx,y=h*ny;rect(ctx,x,y,ww,10,'rgba(20,25,27,.52)','rgba(132,138,140,.20)');
    for(let xx=x+4;xx<x+ww-2;xx+=6) line(ctx,xx,y+2,xx,y+8,'rgba(148,163,184,.18)',1);
  }
  // Bordas de buracos e remendos sem criar geometria de colisÃƒÂ£o.
  for(const [nx,ny,rx,ry] of [[.43,.735,21,7],[.58,.474,16,5],[.345,.566,14,5],[.675,.815,18,6]] as const){
    ctx.fillStyle='rgba(6,10,12,.26)';ctx.beginPath();ctx.ellipse(w*nx,h*ny,rx,ry,.16,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(119,113,104,.20)';ctx.lineWidth=1;ctx.stroke();
  }
  ctx.restore();
};

const drawReadabilityBreathing=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  ctx.save();
  // 0.9.5G: negativos visuais nas ÃƒÂ¡reas de combate; o detalhe fica nas bordas, nÃƒÂ£o sob as unidades.
  const zones=[[.50,.50,w*.12,h*.16],[.50,.70,w*.10,h*.10],[.50,.29,w*.09,h*.09]] as const;
  for(const [nx,ny,rx,ry] of zones){
    const g=ctx.createRadialGradient(w*nx,h*ny,2,w*nx,h*ny,Math.max(rx,ry));
    g.addColorStop(0,'rgba(4,8,12,.10)');g.addColorStop(.58,'rgba(4,8,12,.045)');g.addColorStop(1,'rgba(4,8,12,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(w*nx,h*ny,rx,ry,0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};

const drawFactionLanguage=(ctx:CanvasRenderingContext2D,w:number,h:number,control:string)=>{
  ctx.save();
  // 0.9.5H: cor de facÃƒÂ§ÃƒÂ£o aparece como pintura local, nÃƒÂ£o como interface espalhada pelo chÃƒÂ£o.
  ctx.fillStyle=rgba(control,.42);
  for(const [nx,ny,ww] of [[.097,.316,.060],[.777,.445,.055],[.738,.848,.070],[.042,.690,.052]] as const){
    ctx.fillRect(w*nx,h*ny,w*ww,3);
  }
  ctx.strokeStyle=rgba(control,.30);ctx.lineWidth=2;
  for(const [nx,ny] of [[.135,.322],[.812,.451],[.772,.854]] as const){
    ctx.beginPath();ctx.moveTo(w*nx,h*ny);ctx.lineTo(w*(nx+.018),h*(ny-.010));ctx.lineTo(w*(nx+.034),h*ny);ctx.stroke();
  }
  ctx.restore();
};

const drawCirculation=(ctx:CanvasRenderingContext2D,buildings:readonly TacticalBuilding[],w:number)=>{
  ctx.save();
  // 0.9.5I: cada prÃƒÂ©dio tÃƒÂ¡tico encontra o espaÃƒÂ§o pÃƒÂºblico por um acesso curto e desgastado.
  for(const b of buildings){
    const dx=b.doorX-(b.x+b.w*.5),dy=b.doorY-(b.y+b.h*.5);const horizontal=Math.abs(dx)>Math.abs(dy);
    let ex=b.doorX,ey=b.doorY;
    if(horizontal) ex+=dx>0?Math.min(28,w*.025):-Math.min(28,w*.025); else ey+=dy>0?24:-24;
    ctx.strokeStyle='rgba(121,111,99,.18)';ctx.lineWidth=10;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(b.doorX,b.doorY);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.strokeStyle='rgba(203,213,225,.075)';ctx.lineWidth=1.2;ctx.stroke();
  }
  ctx.restore();
};

const drawGroundGrade=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  ctx.save();
  // 0.9.5M (foundation half): chÃƒÂ£o mais frio nas bordas e discretamente quente nos bolsÃƒÂµes ocupados.
  const edge=ctx.createRadialGradient(w*.50,h*.52,Math.min(w,h)*.16,w*.50,h*.52,Math.max(w,h)*.67);
  edge.addColorStop(0,'rgba(0,0,0,0)');edge.addColorStop(.70,'rgba(8,16,23,.018)');edge.addColorStop(1,'rgba(8,16,23,.085)');
  ctx.fillStyle=edge;ctx.fillRect(0,0,w,h);
  const warm=ctx.createLinearGradient(0,0,w,h);
  warm.addColorStop(0,'rgba(154,83,39,.020)');warm.addColorStop(.48,'rgba(0,0,0,0)');warm.addColorStop(1,'rgba(15,45,55,.018)');
  ctx.fillStyle=warm;ctx.fillRect(0,0,w,h);
  ctx.restore();
};

export function drawT1GoldFoundation(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,
  buildings:readonly TacticalBuilding[],controlColor:string
){
  if(territoryId!==1) return;
  ctx.save();
  drawReadabilityBreathing(ctx,w,h);
  drawGroundGrade(ctx,w,h);
  // Cleanup final: fixed-coordinate utilities/faction strokes were retired;
  // authored ground and building-linked details now own T1 visual storytelling.
  ctx.restore();
}
