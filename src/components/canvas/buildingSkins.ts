import type { TacticalBuilding } from './favelaRenderer';
import { WORLD_LIGHTING, WORLD_MATERIALS, WORLD_SCALE } from '../../data/visualTokens';
import { drawBuildingLifeDetails } from './buildingLifeRenderer';
import { drawSemanticBuildingIdentity } from './semanticBuildingRenderer';
import { drawBespokeArchitectureUnderlay, drawBespokeArchitectureOverlay } from './bespokeArchitectureRenderer';
import { drawRooftopLife } from './rooftopLifeRenderer';
import { drawBuildingMaterialBlend } from './materialHarmonizationRenderer';
import { drawCariocaBuildingIdentity } from './cariocaIdentityRenderer';
import { drawContextArchitectureFinish } from './contextArchitectureFinishRenderer';

export interface BuildingSkinOptions {
  showLabel?: boolean;
  showFaction?: boolean;
  contextual?: boolean;
  controlColorOverride?: string;
}

export interface ContextBuildingSpec {
  id:string; x:number; y:number; w:number; h:number;
  role?:string; material?:'brick'|'concrete'|'metal';
  hasWaterTank?:boolean; door?:'left'|'right'|'top'|'bottom';
}

const drawFlag = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  tag: string,
  time: number
) => {
  const wave = Math.sin(time * 0.004 + x * 0.02) * 2;
  ctx.strokeStyle = '#a8b1bc';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x, y + 25); ctx.lineTo(x, y); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 20, y + 4 + wave);
  ctx.lineTo(x + 20, y + 15 + wave);
  ctx.lineTo(x, y + 11);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '800 6px "Chakra Petch", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(tag, x + 3, y + 9 + wave * .35);
};

export function drawPeripheryBuildingSkin(
  ctx: CanvasRenderingContext2D,
  b: TacticalBuilding,
  time: number,
  capturedByPlayer: boolean,
  playerColor: string,
  playerTag: string,
  renderZoom = 1,
  options: BuildingSkinOptions = {}
): boolean {  const controlColor = options.controlColorOverride ?? (capturedByPlayer ? playerColor : b.graffitiColor);
  const controlTag = capturedByPlayer ? playerTag : b.graffiti;
  const showLabel = options.showLabel !== false;
  const showFaction = options.showFaction !== false;
  const detailLod = renderZoom >= .82;
  const microLod = renderZoom >= .94;
  const wall = b.type === 'brick' ? WORLD_MATERIALS.brick : b.type === 'zinc' ? WORLD_MATERIALS.zinc : WORLD_MATERIALS.concrete;
  const heroHeight = b.type === 'laje' ? 30 : 24;
  const visualHeight = options.contextual ? (b.type === 'laje' ? 38 : 32) : heroHeight; // T1 depth pass: stronger contextual massing.
  const roofY = b.y - visualHeight;
  const facadeY = b.y + b.h - visualHeight;
  const sideDoor = b.doorX > b.x + b.w / 2;
  const doorX = sideDoor ? b.x + b.w - 18 : b.x + 8;

  ctx.save();
  // Sombra projetada 2.5D consistente com o restante da cidade.
  ctx.fillStyle = `rgba(0,0,0,${WORLD_LIGHTING.highShadowAlpha})`;
  ctx.beginPath();
  ctx.moveTo(b.x + 5, facadeY + visualHeight);
  ctx.lineTo(b.x + b.w + 5, facadeY + visualHeight);
  ctx.lineTo(b.x + b.w + 18, facadeY + visualHeight + 12);
  ctx.lineTo(b.x + 16, facadeY + visualHeight + 12);
  ctx.closePath(); ctx.fill();

  // Fachada inferior.
  ctx.fillStyle = wall.shadow;
  ctx.fillRect(b.x, facadeY, b.w, visualHeight);
  ctx.fillStyle = wall.base;
  ctx.fillRect(b.x, facadeY, b.w, visualHeight - 5);

  if (b.type === 'brick') {
    ctx.strokeStyle = 'rgba(49,20,12,0.72)';
    ctx.lineWidth = 1;
    for (let yy = facadeY + 5; yy < facadeY + visualHeight - 4; yy += 6) {
      ctx.beginPath(); ctx.moveTo(b.x, yy); ctx.lineTo(b.x + b.w, yy); ctx.stroke();
    }
  } else {
    ctx.strokeStyle = wall.edge;
    ctx.globalAlpha = 0.20;
    for (let yy = facadeY + 7; yy < facadeY + visualHeight; yy += 7) {
      ctx.beginPath(); ctx.moveTo(b.x, yy); ctx.lineTo(b.x + b.w, yy); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Porta, janelas e faixa de controle integradas Ã  arquitetura.
  ctx.fillStyle = '#101720';
  ctx.fillRect(doorX, facadeY + visualHeight - WORLD_SCALE.doorHeight, WORLD_SCALE.doorWidth, WORLD_SCALE.doorHeight);
  ctx.fillStyle = controlColor;
  ctx.fillRect(b.x, facadeY + visualHeight - 4, b.w, 4);
  // Threshold/contact pad makes the entrance meet the ground instead of floating over it.
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.roundRect(doorX-4,facadeY+visualHeight-1,19,7,2);ctx.fill();
  ctx.fillStyle=wall.highlight;ctx.globalAlpha=.18;ctx.fillRect(doorX-2,facadeY+visualHeight,15,2);ctx.globalAlpha=1;  const windowXs = [b.x + 12, b.x + b.w - 24];
  for (let i = 0; i < windowXs.length; i++) {
    const wx = windowXs[i];
    if (Math.abs(wx - doorX) < 16) continue;
    const lit = Math.sin(time * .0018 + b.x * .03 + i * 2.1) > -.55;
    ctx.fillStyle = lit ? '#f5d77f' : '#142332';
    ctx.fillRect(wx, facadeY + 7, WORLD_SCALE.windowWidth, WORLD_SCALE.windowHeight);
    ctx.strokeStyle = '#243241'; ctx.strokeRect(wx, facadeY + 7, WORLD_SCALE.windowWidth, WORLD_SCALE.windowHeight);
  }

  // Telhado com beiral e volume.
  ctx.fillStyle = wall.base;
  ctx.fillRect(b.x, roofY, b.w, b.h);
  ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(b.x+b.w-6,roofY+4,6,Math.max(0,b.h-4));
  ctx.fillStyle='rgba(255,255,255,.055)';ctx.fillRect(b.x+2,roofY+2,Math.max(0,b.w-4),2);
  ctx.strokeStyle = wall.edge;
  ctx.globalAlpha = .26;
  ctx.strokeRect(b.x, roofY, b.w, b.h);
  ctx.globalAlpha = 1;

  // T1 architectural depth pass: visible massing for contextual architecture.
  if (options.contextual) {
    const hash=[...b.id].reduce((a,c)=>a+c.charCodeAt(0),0);
    ctx.fillStyle='rgba(12,18,24,.46)';ctx.fillRect(b.x-2,roofY-2,b.w+4,6);
    ctx.fillStyle=wall.highlight;ctx.globalAlpha=.42;ctx.fillRect(b.x,roofY-4,b.w,3);ctx.globalAlpha=1;
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(b.x+b.w-5,roofY-1,5,b.h+1);
    const blockW=Math.max(22,Math.min(34,b.w*.34));
    const blockH=Math.max(14,Math.min(22,b.h*.42));
    const blockX=hash%2===0?b.x+8:b.x+b.w-blockW-8;
    const blockY=roofY+8;
    ctx.fillStyle='rgba(0,0,0,.34)';ctx.fillRect(blockX+5,blockY+5,blockW,blockH);
    ctx.fillStyle=b.type==='brick'?'#6c382b':'#4b5864';ctx.fillRect(blockX,blockY,blockW,blockH);
    ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(blockX+2,blockY+2,blockW-4,2);
    ctx.strokeStyle='rgba(226,232,240,.22)';ctx.strokeRect(blockX,blockY,blockW,blockH);
    const awningY=facadeY+8;
    ctx.fillStyle='rgba(8,12,18,.52)';ctx.fillRect(b.x-3,awningY+4,b.w+6,5);
    ctx.fillStyle=b.type==='brick'?'#8a4b35':'#667786';ctx.fillRect(b.x-4,awningY,b.w+8,5);
    ctx.strokeStyle='rgba(226,232,240,.18)';ctx.beginPath();ctx.moveTo(b.x-4,awningY);ctx.lineTo(b.x+b.w+4,awningY);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.055)';for(let xx=b.x+10;xx<b.x+b.w-8;xx+=18)ctx.fillRect(xx,facadeY+3,2,visualHeight-9);
  }

  if (b.type === 'zinc') {
    ctx.strokeStyle = WORLD_MATERIALS.zinc.highlight;
    ctx.globalAlpha = .36;
    for (let xx = b.x + 5; xx < b.x + b.w; xx += 7) {
      ctx.beginPath(); ctx.moveTo(xx, roofY); ctx.lineTo(xx, roofY + b.h); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = WORLD_MATERIALS.concrete.highlight;
    ctx.globalAlpha = .42;
    ctx.fillRect(b.x - 2, roofY - 3, b.w + 4, 5);
    ctx.globalAlpha = 1;
  }

  // 0.5.6B: lajes recebem recortes, beiral e infraestrutura sem criar obstÃ¡culo fantasma.
  ctx.fillStyle='rgba(0,0,0,.20)';ctx.fillRect(b.x+5,roofY+b.h-8,b.w-5,8);
  ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(b.x+5,roofY+5,b.w-10,2);
  ctx.strokeStyle='rgba(148,163,184,.18)';ctx.strokeRect(b.x+8,roofY+9,Math.max(18,b.w*.28),Math.max(12,b.h*.22));
  const hatchW=Math.max(18,b.w*.25),hatchX=b.x+b.w-hatchW-9,hatchY=roofY+b.h-22;
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(hatchX+3,hatchY+3,hatchW,12);
  ctx.fillStyle=b.type==='brick'?'#5a3025':'#46515d';ctx.fillRect(hatchX,hatchY,hatchW,12);
  ctx.strokeStyle='rgba(226,232,240,.16)';ctx.strokeRect(hatchX,hatchY,hatchW,12);
  const drainX=sideDoor?b.x+6:b.x+b.w-6;
  ctx.strokeStyle='#475569';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(drainX,facadeY+4);ctx.lineTo(drainX,facadeY+visualHeight-3);ctx.stroke();
  ctx.fillStyle='rgba(15,23,42,.44)';ctx.fillRect(doorX-3,facadeY+visualHeight-1,18,3);
  ctx.fillStyle='rgba(203,213,225,.12)';ctx.fillRect(doorX-1,facadeY+visualHeight+2,14,2);

  // Caixa d'Ã¡gua cilÃ­ndrica com pequena sombra.
  if (b.hasWaterTank) {
    const tx = b.x + b.w - 20;
    const ty = roofY + 17;
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.beginPath(); ctx.ellipse(tx + 4, ty + 5, 11, 6, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#087ea4';
    ctx.fillRect(tx - 9, ty - 6, 18, 12);
    ctx.beginPath(); ctx.ellipse(tx, ty - 6, 9, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.globalAlpha = .55;
    ctx.beginPath(); ctx.ellipse(tx - 2, ty - 7, 5, 2, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Varal/antena dÃ£o silhueta domÃ©stica Ã  periferia.
  if (b.type === 'laje') {
    ctx.strokeStyle = 'rgba(226,232,240,.30)';
    ctx.lineWidth = .8;
    ctx.beginPath();
    ctx.moveTo(b.x + 10, roofY + 20);
    ctx.quadraticCurveTo(b.x + b.w/2, roofY + 26, b.x + b.w - 12, roofY + 19);
    ctx.stroke();
    const cloth = ['#f97316','#38bdf8','#fde047'];
    cloth.forEach((c,i) => { ctx.fillStyle=c; ctx.fillRect(b.x+18+i*13,roofY+20+i,7,6); });
  }

  drawCariocaBuildingIdentity({ctx,b,territoryId:1,roofY,facadeY,height:visualHeight,controlColor,time});
  drawBuildingMaterialBlend({ctx,b,territoryId:1,roofY,facadeY,height:visualHeight});
  drawBespokeArchitectureOverlay({ctx,b,territoryId:1,roofY,facadeY,height:visualHeight,controlColor,time});
  if(detailLod) drawRooftopLife({ctx,b,territoryId:1,roofY,facadeY,height:visualHeight,controlColor,time});
  drawSemanticBuildingIdentity({ctx,b,territoryId:1,roofY,facadeY,height:visualHeight,controlColor,time});
  if(microLod) drawBuildingLifeDetails(ctx,b,1,time);

  if (showFaction && (b.isRivalHub || capturedByPlayer)) {
    drawFlag(ctx, b.x + 8, roofY - 23, controlColor, controlTag, time);
  }

  if (showLabel && b.label) {
    ctx.fillStyle = 'rgba(9,14,22,.88)';
    ctx.fillRect(b.x + 8, roofY + 5, Math.min(b.w - 16, 74), WORLD_SCALE.signHeight);
    ctx.strokeStyle = controlColor; ctx.globalAlpha = .72;
    ctx.strokeRect(b.x + 8, roofY + 5, Math.min(b.w - 16, 74), WORLD_SCALE.signHeight);
    ctx.globalAlpha = 1; ctx.fillStyle = '#f8fafc';
    ctx.font = '700 7px "Plus Jakarta Sans", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(b.label, b.x + 8 + Math.min(b.w - 16, 74)/2, roofY + 11.5);
  }

  ctx.restore();
  return true;
}
interface BuildingTheme {
  wall: string;
  wallDark: string;
  roof: string;
  edge: string;
  window: string;
  detail: string;
  silhouette: 'market' | 'industrial' | 'fortified' | 'gated' | 'hq';
}

const THEMES: Record<number, BuildingTheme> = {
  2: { wall:'#66513b', wallDark:'#3c3026', roof:'#374151', edge:'#d6b35c', window:'#f5d77f', detail:'#eab308', silhouette:'market' },
  3: { wall:'#343d48', wallDark:'#1d2630', roof:'#27303a', edge:'#596675', window:'#e8a66d', detail:'#d96d2e', silhouette:'industrial' },
  4: { wall:'#493d35', wallDark:'#28231f', roof:'#35302c', edge:'#756d66', window:'#c2bfbc', detail:'#806d5c', silhouette:'fortified' },
  5: { wall:'#b8b0a5', wallDark:'#746f67', roof:'#d1c8bc', edge:'#e3d9ca', window:'#234b56', detail:'#66886d', silhouette:'gated' },
  6: { wall:'#35393b', wallDark:'#202426', roof:'#2b3032', edge:'#646b6e', window:'#71838a', detail:'#6c7376', silhouette:'hq' }
};

const drawArchitecturalDepth = (
  ctx:CanvasRenderingContext2D,b:TacticalBuilding,roofY:number,facadeY:number,height:number,
  theme:BuildingTheme,territoryId:number,controlColor:string,time:number
) => {
  const inset=Math.max(5,Math.min(9,b.w*.08));
  const roofDepth=Math.max(7,Math.min(12,b.h*.18));
  const roofGradient=ctx.createLinearGradient(b.x,roofY,b.x+b.w,roofY+b.h);
  roofGradient.addColorStop(0,'rgba(255,255,255,.075)');
  roofGradient.addColorStop(.48,'rgba(255,255,255,.015)');
  roofGradient.addColorStop(1,'rgba(0,0,0,.18)');
  ctx.fillStyle=roofGradient;ctx.fillRect(b.x+inset,roofY+inset,b.w-inset*2,Math.max(8,b.h-inset*2));
  ctx.fillStyle='rgba(0,0,0,.26)';ctx.fillRect(b.x+4,roofY+b.h-roofDepth,b.w-4,roofDepth);
  ctx.fillStyle='rgba(255,255,255,.075)';ctx.fillRect(b.x+5,roofY+5,b.w-10,2);
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(b.x+b.w-6,facadeY+4,6,Math.max(8,height-8));
  ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(b.x+5,facadeY+4);ctx.lineTo(b.x+5,facadeY+height-5);ctx.stroke();
  if(territoryId===2){
    ctx.fillStyle='#5b4631';ctx.fillRect(b.x+inset,roofY+11,b.w-inset*2,7);
    ctx.strokeStyle='#d6b35c';for(let x=b.x+inset+5;x<b.x+b.w-inset;x+=14){ctx.beginPath();ctx.moveTo(x,roofY+11);ctx.lineTo(x,roofY+18);ctx.stroke();}
  } else if(territoryId===3){
    const ux=b.x+b.w*.52,uy=roofY+12;
    ctx.fillStyle='#111827';ctx.fillRect(ux-16,uy,32,18);ctx.fillStyle='#64748b';ctx.fillRect(ux-13,uy+3,26,12);
    ctx.strokeStyle='#cbd5e1';ctx.beginPath();ctx.arc(ux,uy+9,7,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#94a3b8';ctx.beginPath();ctx.moveTo(ux+16,uy+9);ctx.lineTo(b.x+b.w-7,uy+9);ctx.lineTo(b.x+b.w-7,roofY+28);ctx.stroke();
  } else if(territoryId===4){
    ctx.fillStyle=theme.wallDark;for(const x of [b.x+7,b.x+b.w-19])ctx.fillRect(x,roofY+8,12,12);
    const bunkerX=b.x+b.w*.25,bunkerW=b.w*.50;
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(bunkerX+4,roofY+25,bunkerW,14);
    ctx.fillStyle='#29251f';ctx.fillRect(bunkerX,roofY+21,bunkerW,14);
    ctx.strokeStyle='#78716c';ctx.strokeRect(bunkerX,roofY+21,bunkerW,14);
    ctx.fillStyle='#111827';ctx.fillRect(b.x+b.w*.38,roofY+25,b.w*.24,5);
    ctx.strokeStyle=controlColor;ctx.globalAlpha=.55;ctx.strokeRect(b.x+b.w*.38,roofY+25,b.w*.24,5);ctx.globalAlpha=1;
  } else if(territoryId===5){
    ctx.fillStyle='#173b52';ctx.globalAlpha=.72;ctx.fillRect(b.x+inset+4,roofY+10,b.w-inset*2-8,10);ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(226,232,240,.38)';ctx.strokeRect(b.x+inset+4,roofY+10,b.w-inset*2-8,10);
    ctx.fillStyle='#315b46';ctx.fillRect(b.x+inset,roofY+b.h-13,b.w-inset*2,7);
  } else if(territoryId===6){
    const coreW=Math.max(18,b.w*.25),coreX=b.x+(b.w-coreW)/2;
    ctx.fillStyle='#0f1720';ctx.fillRect(coreX,roofY+7,coreW,Math.max(12,b.h-15));
    ctx.strokeStyle=controlColor;ctx.globalAlpha=.36;ctx.strokeRect(coreX,roofY+7,coreW,Math.max(12,b.h-15));ctx.globalAlpha=1;
    for(const x of [b.x+10,b.x+b.w-14]){ctx.fillStyle=controlColor;ctx.globalAlpha=.5+.25*Math.sin(time*.004+x);ctx.fillRect(x,roofY+9,4,4);ctx.globalAlpha=1;}
  }
};

const drawGenericCityVivaBuilding = (
  ctx: CanvasRenderingContext2D,
  b: TacticalBuilding,
  time: number,
  territoryId: number,
  capturedByPlayer: boolean,
  playerColor: string,
  playerTag: string,
  renderZoom = 1,
  options: BuildingSkinOptions = {}
) => {
  const theme = THEMES[territoryId] ?? THEMES[3];
  const controlColor = options.controlColorOverride ?? (capturedByPlayer ? playerColor : b.graffitiColor);
  const controlTag = capturedByPlayer ? playerTag : b.graffiti;
  const showLabel = options.showLabel !== false;
  const showFaction = options.showFaction !== false;
  const structuralAccent = territoryId === 6 ? '#72797d' : controlColor;
  const detailLod = renderZoom >= .82;
  const microLod = renderZoom >= .94;
  const heroHeight = theme.silhouette === 'hq' ? 34 : theme.silhouette === 'industrial' ? 28 : 25;
  const height = heroHeight; // 0.9.3: parity with hero architecture at every zoom.
  const roofY = b.y - height;
  const facadeY = b.y + b.h - height;
  ctx.save();

  ctx.fillStyle='rgba(0,0,0,.38)';
  ctx.beginPath();ctx.moveTo(b.x+7,facadeY+height);ctx.lineTo(b.x+b.w+7,facadeY+height);
  ctx.lineTo(b.x+b.w+20,facadeY+height+12);ctx.lineTo(b.x+20,facadeY+height+12);ctx.closePath();ctx.fill();
  drawBespokeArchitectureUnderlay({ctx,b,territoryId,roofY,facadeY,height,controlColor,time});
  ctx.fillStyle=theme.wallDark;ctx.fillRect(b.x,facadeY,b.w,height);
  ctx.fillStyle=theme.wall;ctx.fillRect(b.x,facadeY,b.w,height-5);
  ctx.fillStyle=territoryId===6?'#596064':controlColor;ctx.fillRect(b.x,facadeY+height-4,b.w,4);
  if(territoryId===6){ctx.fillStyle=controlColor;ctx.globalAlpha=.72;ctx.fillRect(b.x+8,facadeY+height-4,Math.min(22,b.w*.22),2);ctx.globalAlpha=1;}
  const entranceX=Math.max(b.x+7,Math.min(b.x+b.w-18,b.doorX-6));
  ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.roundRect(entranceX-4,facadeY+height-1,22,7,2);ctx.fill();
  ctx.fillStyle='rgba(226,232,240,.16)';ctx.fillRect(entranceX-1,facadeY+height,16,2);

  // Fachada muda de linguagem por distrito.
  if(theme.silhouette==='industrial'){
    ctx.fillStyle='#12171e';ctx.fillRect(b.x+10,facadeY+8,b.w-20,height-10);
    ctx.strokeStyle='#64748b';for(let yy=facadeY+10;yy<facadeY+height-3;yy+=6){ctx.beginPath();ctx.moveTo(b.x+11,yy);ctx.lineTo(b.x+b.w-11,yy);ctx.stroke();}
  } else if(theme.silhouette==='gated'){
    ctx.fillStyle=theme.window;ctx.globalAlpha=.78;ctx.fillRect(b.x+12,facadeY+7,b.w-24,9);ctx.globalAlpha=1;
    ctx.fillStyle='#dbe2ea';ctx.fillRect(b.x+5,facadeY+height-9,b.w-10,3);
  } else if(theme.silhouette==='fortified'){
    ctx.fillStyle='#171c24';ctx.fillRect(b.x+9,facadeY+7,12,9);ctx.fillRect(b.x+b.w-22,facadeY+7,12,9);
    ctx.fillStyle=controlColor;for(let xx=b.x+6;xx<b.x+b.w-6;xx+=16)ctx.fillRect(xx,facadeY+height-9,9,3);
  } else {
    ctx.fillStyle=theme.window;ctx.fillRect(b.x+12,facadeY+8,12,8);ctx.fillRect(b.x+b.w-24,facadeY+8,12,8);
  }

  // Volume superior / cobertura.
  ctx.fillStyle=theme.roof;ctx.fillRect(b.x,roofY,b.w,b.h);
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(b.x+b.w-7,roofY+4,7,Math.max(0,b.h-4));
  ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(b.x+2,roofY+2,Math.max(0,b.w-4),2);
  ctx.strokeStyle=theme.edge;ctx.globalAlpha=.42;ctx.strokeRect(b.x,roofY,b.w,b.h);ctx.globalAlpha=1;
  if(theme.silhouette==='market'){
    ctx.fillStyle='#d6b35c';ctx.fillRect(b.x-4,roofY-5,b.w+8,7);
    for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#fef3c7':'#eab308';ctx.fillRect(b.x+i*(b.w/6),roofY-5,b.w/6,7);}
  }
  if(theme.silhouette==='fortified'){
    ctx.fillStyle=theme.wallDark;for(let xx=b.x;xx<b.x+b.w;xx+=18)ctx.fillRect(xx,roofY-7,12,8);
  }
  if(theme.silhouette==='gated'){
    ctx.fillStyle='#173b52';ctx.globalAlpha=.75;ctx.fillRect(b.x+8,roofY+8,b.w-16,16);ctx.globalAlpha=1;
  }
  if(theme.silhouette==='hq'){
    ctx.fillStyle='#242831';ctx.fillRect(b.x+b.w*.38,roofY+10,b.w*.24,b.h-10);
    ctx.strokeStyle=structuralAccent;ctx.globalAlpha=.42;ctx.lineWidth=1.2;ctx.strokeRect(b.x-2,roofY-2,b.w+4,b.h+4);ctx.globalAlpha=1;
  }

  // 0.5.6B: volume secundÃ¡rio, beiral e equipamento de cobertura dÃ£o leitura 2.5D sem ampliar collider.
  drawArchitecturalDepth(ctx,b,roofY,facadeY,height,theme,territoryId,controlColor,time);

  // Distritos deixam de compartilhar apenas uma paleta: cada famÃ­lia recebe funÃ§Ã£o e silhueta prÃ³prias.
  if(theme.silhouette==='industrial'){
    // Exaustores, dutos e faixa de risco vendem uma oficina funcional.
    for(const ox of [b.x+16,b.x+b.w-28]){
      ctx.fillStyle='#111827';ctx.fillRect(ox,roofY+9,14,12);
      ctx.fillStyle='#64748b';ctx.fillRect(ox+2,roofY+6,10,4);
      ctx.strokeStyle='#94a3b8';ctx.beginPath();ctx.arc(ox+7,roofY+15,4,0,Math.PI*2);ctx.stroke();
    }
    for(let xx=b.x+5;xx<b.x+b.w-6;xx+=12){ctx.fillStyle=((xx/12)|0)%2?'#111827':'#f59e0b';ctx.fillRect(xx,facadeY+height-8,12,4);}
  }
  if(theme.silhouette==='market'){
    // Toldinho frontal e caixas empilhadas dÃ£o leitura imediata de comÃ©rcio/depÃ³sito.
    const awningY=facadeY+2;
    for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#fef3c7':'#d97706';ctx.fillRect(b.x+8+i*((b.w-16)/5),awningY,(b.w-16)/5,6);}
    ctx.fillStyle='#4b3621';ctx.fillRect(b.x+b.w-24,facadeY+height-14,10,10);ctx.fillRect(b.x+b.w-35,facadeY+height-11,10,7);
  }
  if(theme.silhouette==='fortified'){
    // Parapeito, sacos e refletor: este prÃ©dio existe para defender uma posiÃ§Ã£o.
    for(let xx=b.x+5;xx<b.x+b.w-10;xx+=15){
      ctx.fillStyle='#78716c';ctx.beginPath();ctx.ellipse(xx,facadeY+height-5,8,4,0,0,Math.PI*2);ctx.fill();
    }
    const lampX=b.x+b.w-12, lampY=roofY-8;
    ctx.strokeStyle='#94a3b8';ctx.beginPath();ctx.moveTo(lampX,roofY+4);ctx.lineTo(lampX,lampY);ctx.stroke();
    ctx.fillStyle=controlColor;ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(lampX,lampY,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
  if(theme.silhouette==='gated'){
    // Portaria limpa, cÃ¢mera e jardineira dÃ£o linguagem de seguranÃ§a privada.
    ctx.fillStyle='#334155';ctx.fillRect(b.x+5,facadeY+height-8,b.w-10,4);
    ctx.fillStyle='#245a41';ctx.fillRect(b.x+8,facadeY+height-13,18,5);
    const camX=b.x+b.w-12, camY=roofY+2;
    ctx.strokeStyle='#64748b';ctx.beginPath();ctx.moveTo(camX,roofY+10);ctx.lineTo(camX,camY-8);ctx.stroke();
    ctx.fillStyle='#cbd5e1';ctx.fillRect(camX-1,camY-10,9,5);ctx.fillStyle='#38bdf8';ctx.fillRect(camX+5,camY-9,2,2);
  }
  if(theme.silhouette==='hq'){
    // Antena, beacon e porta blindada reforÃ§am o clÃ­max sem partÃ­culas excessivas.
    const mastX=b.x+b.w/2;
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(mastX,roofY+4);ctx.lineTo(mastX,roofY-22);ctx.stroke();
    ctx.strokeStyle=controlColor;ctx.beginPath();ctx.arc(mastX,roofY-17,9,Math.PI,Math.PI*2);ctx.stroke();
    ctx.fillStyle=controlColor;ctx.globalAlpha=.7+.25*Math.sin(time*.004);ctx.beginPath();ctx.arc(mastX,roofY-24,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='#0b0f16';ctx.fillRect(b.x+b.w*.42,facadeY+height-22,b.w*.16,22);
    ctx.strokeStyle=controlColor;ctx.strokeRect(b.x+b.w*.42,facadeY+height-22,b.w*.16,22);
  }

  drawCariocaBuildingIdentity({ctx,b,territoryId,roofY,facadeY,height,controlColor:structuralAccent,time});
  drawBuildingMaterialBlend({ctx,b,territoryId,roofY,facadeY,height});
  drawBespokeArchitectureOverlay({ctx,b,territoryId,roofY,facadeY,height,controlColor:structuralAccent,time});
  if(detailLod) drawRooftopLife({ctx,b,territoryId,roofY,facadeY,height,controlColor:structuralAccent,time});
  drawSemanticBuildingIdentity({ctx,b,territoryId,roofY,facadeY,height,controlColor:structuralAccent,time});
  if(microLod) drawBuildingLifeDetails(ctx,b,territoryId,time);

  if (b.hasWaterTank && territoryId < 5) {
    ctx.fillStyle=territoryId===4?'#4b5563':'#087ea4';ctx.beginPath();ctx.ellipse(b.x+b.w-18,roofY+17,10,7,0,0,Math.PI*2);ctx.fill();
  }
  if (showFaction && (b.isRivalHub || capturedByPlayer)) drawFlag(ctx,b.x+8,roofY-24,controlColor,controlTag,time);

  if (showLabel && b.label) {
    ctx.fillStyle='rgba(7,12,20,.90)';ctx.fillRect(b.x+7,roofY+5,Math.min(b.w-14,76),13);
    ctx.strokeStyle=controlColor;ctx.strokeRect(b.x+7,roofY+5,Math.min(b.w-14,76),13);
    ctx.fillStyle='#f8fafc';ctx.font='700 7px "Plus Jakarta Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(b.label,b.x+7+Math.min(b.w-14,76)/2,roofY+11.5);
  }
  ctx.restore();
};

export function drawCityVivaBuildingSkin(
  ctx: CanvasRenderingContext2D, b: TacticalBuilding, time: number, territoryId: number,
  capturedByPlayer: boolean, playerColor: string, playerTag: string, renderZoom = 1,
  options: BuildingSkinOptions = {}
) {
  if (territoryId === 1) return drawPeripheryBuildingSkin(ctx,b,time,capturedByPlayer,playerColor,playerTag,renderZoom,options);
  drawGenericCityVivaBuilding(ctx,b,time,territoryId,capturedByPlayer,playerColor,playerTag,renderZoom,options);
  return true;
}

const CONTEXT_ACCENTS:Record<number,string>={1:'#8e765f',2:'#a98145',3:'#737d86',4:'#826a58',5:'#728b7a',6:'#737b80'};
export function drawCityVivaContextBuilding(
  ctx:CanvasRenderingContext2D,spec:ContextBuildingSpec,time:number,territoryId:number,renderZoom=1
){
  const type:TacticalBuilding['type']=spec.material==='metal'?'zinc':spec.material==='brick'?'brick':'laje';
  const door=spec.door??'bottom',x=spec.x,y=spec.y,w=spec.w,h=spec.h;
  const doorX=door==='left'?x-10:door==='right'?x+w+10:x+w/2;
  const doorY=door==='top'?y-10:door==='bottom'?y+h+10:y+h/2;
  const neutral=CONTEXT_ACCENTS[territoryId]??'#737b80';
  const hash=[...spec.id].reduce((a,c)=>a+c.charCodeAt(0),0);
  const b:TacticalBuilding={id:spec.id,label:spec.role??'',x,y,w,h,doorX,doorY,type,
    hasWaterTank:spec.hasWaterTank??((territoryId===1||territoryId===4)&&w>=52&&h>=34&&hash%4===0),
    isRivalHub:false,graffiti:'',graffitiColor:neutral};
  drawCityVivaBuildingSkin(ctx,b,time,territoryId,false,neutral,'',renderZoom,
    {showLabel:false,showFaction:false,contextual:true,controlColorOverride:neutral});
  const visualHeight=territoryId===1?(type==='laje'?30:24):territoryId===6?34:territoryId===3?28:25;
  drawContextArchitectureFinish({ctx,b,territoryId,roofY:y-visualHeight,facadeY:y+h-visualHeight,height:visualHeight,
    role:spec.role??'',renderZoom,controlColor:neutral});
  return true;
}

