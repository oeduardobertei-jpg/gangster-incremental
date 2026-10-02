import type { FactionConfig } from '../../types/game';
import { getTerritoryScene, ScenePath } from '../../data/territoryScenes';
import { getTerritoryPurposeProps } from '../../data/territoryPurposeProps';
import { WORLD_LIGHTING, WORLD_MATERIALS } from '../../data/visualTokens';
import { drawLivingGroundFoundation, drawLivingGroundOverlay } from './groundRenderer';

type ReservedFootprint = { x:number; y:number; w:number; h:number };

const overlapsReserved=(x:number,y:number,w:number,h:number,reserved:readonly ReservedFootprint[]=[],margin=18)=>
  reserved.some(r=>x < r.x+r.w+margin && x+w > r.x-margin && y < r.y+r.h+margin && y+h > r.y-margin);

const colorWithAlpha = (color: string, alpha: number) => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const linePath = (
  ctx: CanvasRenderingContext2D,
  path: ScenePath,
  width: number,
  height: number
) => {
  ctx.beginPath();
  path.points.forEach((point, index) => {
    const x = point.x * width;
    const y = point.y * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
};

const drawScenePath = (
  ctx: CanvasRenderingContext2D,
  path: ScenePath,
  width: number,
  height: number
) => {
  const material = path.surface === 'asphalt' ? WORLD_MATERIALS.asphalt : WORLD_MATERIALS.concrete;
  linePath(ctx, path, width, height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';  ctx.strokeStyle = 'rgba(0,0,0,0.30)';
  ctx.lineWidth = path.width + 9;
  ctx.stroke();
  linePath(ctx, path, width, height);
  ctx.strokeStyle = material.base;
  ctx.lineWidth = path.width;
  ctx.stroke();

  if (path.edge) {
    linePath(ctx, path, width, height);
    ctx.strokeStyle = path.surface === 'asphalt' ? '#7a7569' : material.edge;
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = path.width + 5;
    ctx.stroke();
    linePath(ctx, path, width, height);
    ctx.strokeStyle = material.base;
    ctx.globalAlpha = 1;
    ctx.lineWidth = path.width;
    ctx.stroke();
  }

  if (path.surface === 'asphalt') {
    linePath(ctx, path, width, height);
    ctx.setLineDash([17, 19]);
    ctx.strokeStyle = 'rgba(250,204,21,0.34)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

const drawScenePathWear = (
  ctx: CanvasRenderingContext2D,
  path: ScenePath,
  width: number,
  height: number,
  territoryId: number,
  pathIndex: number
) => {
  if (path.points.length < 2) return;
  ctx.save();
  for (let segment = 0; segment < path.points.length - 1; segment++) {
    const a = path.points[segment], b = path.points[segment + 1];
    const ax = a.x * width, ay = a.y * height;
    const bx = b.x * width, by = b.y * height;
    const angle = Math.atan2(by - ay, bx - ax);
    const seed = territoryId * 31 + pathIndex * 17 + segment * 13;
    for (const [slot, t] of [0.34, 0.69].entries()) {
      const x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      const lateral = ((seed + slot * 7) % 3 - 1) * Math.min(16, path.width * .16);
      ctx.translate(0, lateral);
      if (path.surface === 'asphalt') {
        // 0.8C: wear reads as repaired asphalt/oil, not random floating scratches.
        ctx.fillStyle = 'rgba(4,8,12,.15)';
        ctx.beginPath(); ctx.ellipse(0, 0, 10 + (seed % 8), 3 + slot * 2, .08, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle='rgba(71,85,105,.07)';ctx.fillRect(-7,-1,14,2);
      } else {
        ctx.strokeStyle = 'rgba(15,23,42,.18)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-12,-5); ctx.lineTo(12,-5); ctx.moveTo(-12,5); ctx.lineTo(12,5); ctx.stroke();
      }
      ctx.restore();
    }
  }
  ctx.restore();
};

const drawDecorativeLot = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  materialId: 'brick' | 'plaster' | 'zinc' | 'concrete',
  roof: 'slab' | 'zinc' | 'mixed',
  heightClass: 'low' | 'mid'
) => {  const material = WORLD_MATERIALS[materialId];
  const visualHeight = heightClass === 'mid' ? 18 : 10;
  ctx.fillStyle = `rgba(0,0,0,${heightClass === 'mid' ? 0.30 : 0.20})`;
  ctx.fillRect(x + WORLD_LIGHTING.shadowOffsetX, y + WORLD_LIGHTING.shadowOffsetY, w, h);

  ctx.fillStyle = material.shadow;
  ctx.fillRect(x, y + visualHeight, w, Math.max(8, h - visualHeight));
  ctx.fillStyle = material.base;
  ctx.fillRect(x, y, w, h - visualHeight * 0.25);
  ctx.strokeStyle = material.edge;
  ctx.globalAlpha = 0.28;
  ctx.strokeRect(x, y, w, h);
  ctx.globalAlpha = 1;

  if (roof === 'zinc' || roof === 'mixed') {
    ctx.fillStyle = WORLD_MATERIALS.zinc.base;
    ctx.fillRect(x - 2, y - 4, w + 4, 8);
    ctx.strokeStyle = WORLD_MATERIALS.zinc.highlight;
    ctx.globalAlpha = 0.32;
    for (let rx = x + 3; rx < x + w; rx += 8) {
      ctx.beginPath(); ctx.moveTo(rx, y - 3); ctx.lineTo(rx, y + 3); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = WORLD_MATERIALS.concrete.highlight;
    ctx.globalAlpha = 0.38;
    ctx.fillRect(x - 2, y - 3, w + 4, 5);
    ctx.globalAlpha = 1;
  }

  // Fachada legível em zoom normal: porta, duas aberturas e infraestrutura de laje.
  ctx.fillStyle = '#14202b';
  ctx.fillRect(x + 8, y + h - 21, 11, 19);
  const windowY = y + h - 29;
  for (const wx of [x + w * .42, x + w - 22]) {
    ctx.fillStyle = '#f4d88a';
    ctx.globalAlpha = 0.48;
    ctx.fillRect(wx, windowY, 10, 8);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(15,23,42,.65)';
    ctx.strokeRect(wx, windowY, 10, 8);
  }
  // Rodapé/AO amarra o volume ao chão e evita aparência de "adesivo".
  ctx.fillStyle = 'rgba(0,0,0,.26)';
  ctx.fillRect(x + 2, y + h - 4, w - 4, 4);
  if (heightClass === 'mid') {
    const tankX = x + w * .68;
    ctx.fillStyle = 'rgba(0,0,0,.26)';
    ctx.beginPath(); ctx.ellipse(tankX + 3, y + 8, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0e7490';
    ctx.fillRect(tankX - 8, y - 2, 16, 12);
    ctx.beginPath(); ctx.ellipse(tankX, y - 2, 8, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(226,232,240,.36)';
    ctx.beginPath(); ctx.moveTo(x + w * .30, y + 5); ctx.lineTo(x + w * .30, y - 11); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w * .30, y - 11, 5, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  }
};
const drawWarmLamp = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  intensity: number
) => {
  const glow = ctx.createRadialGradient(x, y, 2, x, y, 72 * intensity);
  glow.addColorStop(0, 'rgba(254,240,138,0.20)');
  glow.addColorStop(0.35, 'rgba(245,158,11,0.09)');
  glow.addColorStop(1, 'rgba(245,158,11,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, 72 * intensity, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = '#5b6470';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y + 28); ctx.lineTo(x, y - 4); ctx.stroke();
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(x - 4, y - 7, 8, 5);
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(x - 2, y - 6, 4, 3);
};

const drawPeripheryMicroDetails = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  controlColor: string,
  controlTag: string
) => {
  // Canaleta irregular de drenagem.
  ctx.strokeStyle = 'rgba(4,10,18,0.85)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(width * .545, height * .99);
  ctx.bezierCurveTo(width * .53, height * .78, width * .57, height * .54, width * .555, height * .05);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(100,116,139,0.20)';
  ctx.lineWidth = 1;
  ctx.stroke();


  // O comércio físico é desenhado pelo purposefulPropsRenderer (t1-kiosk);
  // não duplicar aqui evita balcões/toldos sobrepostos.

  // 0.9.2: ownership graffiti now lives on an existing physical wall; no extra faction panel here.
};
const drawOverheadWires = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(15,23,42,0.58)';
  ctx.lineWidth = 1.2;
  const wires = [
    [0.03, 0.23, 0.38, 0.31, 0.77, 0.25],
    [0.14, 0.46, 0.44, 0.52, 0.89, 0.45],
    [0.08, 0.73, 0.42, 0.67, 0.86, 0.73]
  ];
  for (const [x1,y1,cx,cy,x2,y2] of wires) {
    ctx.beginPath();
    ctx.moveTo(width*x1, height*y1);
    ctx.quadraticCurveTo(width*cx, height*cy, width*x2, height*y2);
    ctx.stroke();
  }
  ctx.restore();
};

const drawGroundWear = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.save();
  // 0.8C: grouped pavement repairs replace mathematically scattered zig-zag scratches.
  ctx.fillStyle='rgba(15,23,42,.18)';
  for (const [x,y,w,h] of [[.12,.22,16,4],[.26,.61,22,5],[.73,.31,18,4],[.82,.69,20,5],[.41,.84,15,4]] as const){
    ctx.beginPath();ctx.roundRect(width*x,height*y,w,h,2);ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  for (const [x,y,rx,ry] of [[.44,.73,13,5],[.54,.43,10,4],[.33,.28,8,3],[.66,.82,11,4]] as const) {
    ctx.beginPath(); ctx.ellipse(width*x,height*y,rx,ry,0.2,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
};

const drawPurposefulGroundTexture = (ctx:CanvasRenderingContext2D,width:number,height:number,territoryId:number,controlColor?:string) => {
  ctx.save(); ctx.lineWidth=1;
  if(territoryId===1){
    ctx.strokeStyle='rgba(148,163,184,.18)';
    for(const [x,y] of [[.14,.29],[.62,.24],[.22,.67],[.73,.54]] as const){
      ctx.strokeRect(width*x,height*y,28,16);ctx.beginPath();ctx.moveTo(width*x+4,height*y+8);ctx.lineTo(width*x+24,height*y+8);ctx.stroke();
    }
    ctx.fillStyle='rgba(2,6,23,.42)';for(const [x,y] of [[.52,.22],[.57,.67],[.36,.52]] as const){for(let i=0;i<5;i++)ctx.fillRect(width*x+i*5,height*y,2,11);}
  } else if(territoryId===2){
    ctx.strokeStyle='rgba(250,204,21,.12)';for(let x=.10;x<.91;x+=.08)ctx.strokeRect(width*x,height*.46,width*.045,height*.33);
    ctx.fillStyle='rgba(245,158,11,.13)';for(const [x,y] of [[.18,.61],[.36,.55],[.64,.61],[.82,.57]] as const){ctx.beginPath();ctx.arc(width*x,height*y,12,0,Math.PI*2);ctx.fill();}
  } else if(territoryId===3){
    // Loading-zone rectangles were decorative duplicates with no gameplay meaning.
    // Containers and pallets now carry the industrial story; keep only one traffic cue.
    drawGroundArrow(ctx,width*.50,height*.61,Math.PI/2,'rgba(249,115,22,.34)',1.0);
  } else if(territoryId===4){
    ctx.strokeStyle=colorWithAlpha(controlColor ?? '#ef4444',.07);ctx.lineWidth=1;
    for(const [x1,y1,x2,y2] of [[.09,.29,.28,.30],[.70,.52,.89,.515],[.18,.73,.37,.72]] as const){ctx.beginPath();ctx.moveTo(width*x1,height*y1);ctx.lineTo(width*x2,height*y2);ctx.stroke();}
  } else if(territoryId===5){
    ctx.fillStyle='rgba(168,85,247,.08)';ctx.fillRect(width*.455,height*.78,width*.09,4);
  } else if(territoryId===6){
    // 0.9H: remove blueprint/debug language. Only short concrete floor joints remain.
    ctx.strokeStyle='rgba(203,213,225,.055)';ctx.lineWidth=1;
    for(const [y,x1,x2] of [[.31,.40,.45],[.56,.55,.60],[.80,.42,.47]] as const){ctx.beginPath();ctx.moveTo(width*x1,height*y);ctx.lineTo(width*x2,height*y);ctx.stroke();}
  }
  ctx.restore();
};
export function drawTerritorySceneFoundation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  factionConfig: FactionConfig,
  territoryDominated = false,
  reservedFootprints: readonly ReservedFootprint[] = []
): boolean {
  const controlColor = territoryDominated ? factionConfig.color : factionConfig.rivalColor;
  const controlTag = territoryDominated ? factionConfig.tag : factionConfig.rivalTag;
  if (territoryId === 2) { drawMarketRailScene(ctx, width, height, controlColor, controlTag, reservedFootprints); return true; }
  if (territoryId === 3) { drawIndustrialScene(ctx, width, height, controlColor, controlTag, reservedFootprints); return true; }
  if (territoryId === 4) { drawFortifiedHillScene(ctx, width, height, controlColor, controlTag, reservedFootprints); return true; }
  if (territoryId === 5) { drawGatedDistrictScene(ctx, width, height, controlColor, controlTag, reservedFootprints); return true; }
  if (territoryId === 6) { drawCentralHqScene(ctx, width, height, controlColor, controlTag, reservedFootprints); return true; }
  if (territoryId !== 1) return false;

  const scene = getTerritoryScene(territoryId);
  ctx.save();

  drawLivingGroundFoundation(ctx, width, height, 1, controlColor);

  // 0.9.1A: isolated decorative lots replaced by unified physical support clusters.

  // 0.9.1F: pátio/quadra comunitária física, desgastada e sem aparência de wireframe.
  if (scene.plaza) {
    const p=scene.plaza,px=p.x*width,py=p.y*height,pw=p.w*width,ph=p.h*height;
    ctx.save();
    ctx.fillStyle='#292e33';ctx.beginPath();ctx.roundRect(px,py,pw,ph,9);ctx.fill();
    ctx.fillStyle='rgba(101,85,66,.20)';ctx.beginPath();ctx.ellipse(px+pw*.24,py+ph*.68,pw*.16,ph*.12,-.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(16,20,24,.24)';ctx.beginPath();ctx.ellipse(px+pw*.72,py+ph*.33,pw*.13,ph*.10,.16,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(226,232,240,.14)';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(px+pw*.5,py+12);ctx.lineTo(px+pw*.5,py+ph-12);ctx.stroke();
    ctx.beginPath();ctx.arc(px+pw*.5,py+ph*.5,Math.min(20,ph*.16),0,Math.PI*2);ctx.stroke();
    for(const side of [0,1]){const gx=side?px+pw-14:px+14;ctx.strokeStyle='rgba(203,213,225,.32)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(gx,py+ph*.36);ctx.lineTo(gx,py+ph*.64);ctx.stroke();ctx.beginPath();ctx.moveTo(gx,py+ph*.36);ctx.lineTo(gx+(side?-10:10),py+ph*.36);ctx.stroke();}
    ctx.fillStyle='rgba(73,54,39,.35)';ctx.fillRect(px+7,py+ph-6,pw*.22,4);ctx.fillRect(px+pw*.72,py+ph-6,pw*.20,4);
    ctx.restore();
  }

  scene.paths.forEach((path,index) => { drawScenePath(ctx, path, width, height); drawScenePathWear(ctx, path, width, height, 1, index); });
  drawGroundWear(ctx, width, height);
  drawLivingGroundOverlay(ctx, width, height, 1, controlColor);
  drawPurposefulGroundTexture(ctx, width, height, 1, controlColor);
  drawPeripheryMicroDetails(ctx, width, height, controlColor, controlTag);

  for (const lamp of scene.lamps) {
    drawWarmLamp(ctx, lamp.x * width, lamp.y * height, lamp.intensity);
  }

  drawOverheadWires(ctx, width, height);
  drawDistrictGroundStory(ctx, width, height, 1, controlColor);


  ctx.restore();
  return true;
}
function drawSceneTitle(
  _ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  _title: string,
  _subtitle: string,
  _accent: string
) {
  // 0.5.5A: the territory name already lives in the HUD. Repeating it inside the
  // world caused large text to sit behind roofs and bases, so the decorative
  // backdrop title is intentionally suppressed. Functional labels stay local.
}

const drawGroundArrow = (
  ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, scale = 1
) => {
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle=color;ctx.lineWidth=2*scale;
  ctx.beginPath();ctx.moveTo(-12*scale,0);ctx.lineTo(12*scale,0);ctx.lineTo(5*scale,-6*scale);
  ctx.moveTo(12*scale,0);ctx.lineTo(5*scale,6*scale);ctx.stroke();ctx.restore();
};

const drawDistrictGroundStory = (
  ctx: CanvasRenderingContext2D, width: number, height: number, territoryId: number, controlColor?: string
) => {
  ctx.save();
  ctx.textAlign='center';
  if(territoryId===1){
    ctx.strokeStyle='rgba(148,163,184,.20)';ctx.lineWidth=2;
    for(const [x,y,w] of [[.12,.51,.13],[.60,.61,.16],[.38,.80,.10]] as const){
      ctx.beginPath();ctx.moveTo(width*x,height*y);ctx.lineTo(width*(x+w),height*y);ctx.stroke();
    }
    ctx.fillStyle='rgba(148,163,184,.16)';
    for(const [x,y] of [[.20,.37],[.69,.34],[.72,.74]] as const){
      for(let i=0;i<4;i++)ctx.fillRect(width*x+i*6,height*y,3,11);
    }
    ctx.fillStyle='rgba(226,232,240,.22)';ctx.font='700 8px "Chakra Petch",sans-serif';
    
  } else if(territoryId===2){
    ctx.strokeStyle='rgba(157,129,79,.10)';ctx.lineWidth=1;
    for(const y of [.49,.62,.76]){ctx.beginPath();ctx.moveTo(width*.09,height*y);ctx.lineTo(width*.91,height*y);ctx.stroke();}
    ctx.fillStyle='rgba(254,243,199,.16)';ctx.font='700 8px "Chakra Petch",sans-serif';
    
    drawGroundArrow(ctx,width*.50,height*.43,-Math.PI/2,'rgba(250,204,21,.42)',1.1);
  } else if(territoryId===3){
    // Industrial storytelling now comes from physical bays, stains, docks and service props.
    // Long dashed guides were removed because they read as editor/debug geometry.
  } else if(territoryId===4){
    ctx.fillStyle=colorWithAlpha(controlColor ?? '#ef4444',.16);ctx.font='800 9px "Chakra Petch",sans-serif';
    
    for(const [x,y,a] of [[.35,.28,-.35],[.64,.57,.35],[.39,.83,-.35]] as const){drawGroundArrow(ctx,width*x,height*y,a,colorWithAlpha(controlColor ?? '#ef4444',.36),1.1);}
  } else if(territoryId===5){
    // Parking and resident flow are now carried by physical bays, curbs and portarias instead of blueprint marks.
    ctx.fillStyle='rgba(203,213,225,.10)';ctx.font='700 7px "Chakra Petch",sans-serif';
    
  } else if(territoryId===6){
    // 0.9H: checkpoints read through physical barriers and guard architecture, not floor labels.
  }
  ctx.restore();
};

function drawMarketRailScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, _reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(2);
  drawLivingGroundFoundation(ctx, width, height, 2, controlColor);

  // Avenida de acesso central, propositalmente mais retilínea que o T1.
  scene.paths.forEach((path,index) => { drawScenePath(ctx, path, width, height); drawScenePathWear(ctx, path, width, height, 2, index); });

  // Eixo ferroviário dominante.
  const railY = height * .29;
  ctx.fillStyle = '#0d1016';
  ctx.fillRect(0, railY - 24, width, 48);
  ctx.fillStyle = '#2f3138';
  for (let x = 0; x < width; x += 24) ctx.fillRect(x, railY - 18, 7, 36);
  ctx.strokeStyle = '#8b98a8';
  ctx.lineWidth = 4;
  for (const off of [-10, 10]) {
    ctx.beginPath(); ctx.moveTo(0, railY + off); ctx.lineTo(width, railY + off); ctx.stroke();
  }

  // Plataforma/estação: dois volumes sólidos e uma travessia central realmente livre.
  const platformY = railY - 65;
  const platformPieces = [
    { x: .24, w: .205 },
    { x: .555, w: .205 }
  ];
  for (const piece of platformPieces) {
    const px=width*piece.x,pw=width*piece.w;
    ctx.fillStyle='rgba(0,0,0,.34)';ctx.fillRect(px+6,platformY+9,pw,27);
    ctx.fillStyle='#4b4b47';ctx.fillRect(px,platformY,pw,27);
    ctx.fillStyle='#65625a';ctx.fillRect(px,platformY,pw,5);
    ctx.fillStyle='#25282c';ctx.fillRect(px+6,platformY+8,pw-12,15);
    ctx.fillStyle='rgba(214,179,92,.62)';ctx.fillRect(px,platformY+24,pw,3);
    ctx.strokeStyle='rgba(203,213,225,.12)';ctx.lineWidth=1;
    for(let xx=px+28;xx<px+pw-8;xx+=34){ctx.beginPath();ctx.moveTo(xx,platformY+5);ctx.lineTo(xx,platformY+24);ctx.stroke();}
  }
  const crossX=width*.445,crossW=width*.11;
  ctx.fillStyle='#393d42';ctx.fillRect(crossX,platformY,crossW,27);
  ctx.fillStyle='rgba(250,204,21,.48)';ctx.fillRect(crossX,platformY+24,crossW,3);
  ctx.strokeStyle='rgba(203,213,225,.16)';
  for(let xx=crossX+12;xx<crossX+crossW-4;xx+=18){ctx.beginPath();ctx.moveTo(xx,platformY+5);ctx.lineTo(xx,platformY+22);ctx.stroke();}


  // Praça da feira: blocos abertos e corredores entre barracas.
  ctx.beginPath();ctx.moveTo(width*.07,height*.47);ctx.lineTo(width*.91,height*.45);ctx.lineTo(width*.94,height*.62);
  ctx.lineTo(width*.89,height*.80);ctx.lineTo(width*.11,height*.81);ctx.lineTo(width*.065,height*.64);ctx.closePath();
  ctx.fillStyle='rgba(39,35,47,.72)';ctx.fill();ctx.strokeStyle='rgba(226,232,240,.09)';ctx.stroke();
  ctx.strokeStyle='rgba(203,213,225,.10)';ctx.lineWidth=14;ctx.lineCap='round';
  for(const [a,b] of [[[.15,.56],[.39,.57]],[[.61,.56],[.85,.55]],[[.20,.72],[.43,.69]],[[.58,.70],[.82,.73]]] as const){ctx.beginPath();ctx.moveTo(width*a[0],height*a[1]);ctx.lineTo(width*b[0],height*b[1]);ctx.stroke();}
  ctx.strokeStyle='rgba(74,85,91,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(width*.10,height*.79);ctx.lineTo(width*.89,height*.79);ctx.stroke();

  // Barracas físicas da feira vêm apenas do purposefulPropsRenderer.
  // Assim não existem barracas visuais sem a mesma geometria física.

  // Alambrado e passagem de pedestres: a abertura visual coincide com a abertura física.
  ctx.strokeStyle = 'rgba(148,163,184,.50)';
  ctx.lineWidth = 1.5;
  for (const y of [railY - 31, railY + 31]) {
    for (const [x1, x2] of [[0, .445], [.555, 1]] as const) {
      ctx.beginPath(); ctx.moveTo(width * x1, y); ctx.lineTo(width * x2, y); ctx.stroke();
      for (let x = width * x1 + 8; x < width * x2; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7); ctx.stroke();
      }
    }
  }
  const crossingX = width * .445;
  const crossingW = width * .11;
  ctx.fillStyle = 'rgba(250,204,21,.12)';
  ctx.fillRect(crossingX, railY - 31, crossingW, 62);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  for (let x = crossingX + 7; x < crossingX + crossingW - 4; x += 14) {
    ctx.beginPath(); ctx.moveTo(x, railY - 29); ctx.lineTo(x + 6, railY + 29); ctx.stroke();
  }
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(crossingX - 10, railY - 42, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(crossingX + crossingW + 10, railY - 42, 5, 0, Math.PI * 2); ctx.fill();
  drawLivingGroundOverlay(ctx, width, height, 2, controlColor);
  drawPurposefulGroundTexture(ctx, width, height, 2, controlColor);
  drawDistrictGroundStory(ctx, width, height, 2, controlColor);

  drawSceneTitle(ctx, width, height, `FEIRA • LINHA DO TREM · ${controlTag}`, scene.subtitle, controlColor);
}
function drawIndustrialScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(3);
  drawLivingGroundFoundation(ctx, width, height, 3, controlColor);

  // Pátio industrial integrado ao terreno: base ampla, mas com bordas e tons menos artificiais.
  const yardX=width*.10, yardY=height*.17, yardW=width*.80, yardH=height*.66;
  const yardGradient=ctx.createLinearGradient(yardX,yardY,yardX+yardW,yardY+yardH);
  yardGradient.addColorStop(0,'rgba(47,49,53,.62)'); yardGradient.addColorStop(.55,'rgba(38,43,49,.58)'); yardGradient.addColorStop(1,'rgba(49,44,42,.55)');
  ctx.beginPath();ctx.moveTo(width*.09,height*.19);ctx.lineTo(width*.84,height*.15);ctx.lineTo(width*.91,height*.25);
  ctx.lineTo(width*.90,height*.77);ctx.lineTo(width*.82,height*.84);ctx.lineTo(width*.14,height*.83);ctx.lineTo(width*.075,height*.70);ctx.lineTo(width*.08,height*.31);ctx.closePath();
  ctx.fillStyle=yardGradient;ctx.fill();ctx.strokeStyle='rgba(148,163,184,.10)';ctx.stroke();
  ctx.strokeStyle='rgba(148,163,184,.095)';ctx.lineWidth=18;ctx.lineCap='round';
  for(const [a,b] of [[[.18,.36],[.36,.43]],[[.63,.35],[.78,.43]],[[.24,.67],[.40,.61]],[[.62,.65],[.78,.70]]] as const){ctx.beginPath();ctx.moveTo(width*a[0],height*a[1]);ctx.lineTo(width*b[0],height*b[1]);ctx.stroke();}
  ctx.strokeStyle='rgba(22,27,31,.50)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(width*.13,height*.79);ctx.lineTo(width*.84,height*.81);ctx.stroke();
  ctx.fillStyle='rgba(15,23,42,.10)';
  for(const [x,y,rx,ry] of [[.19,.31,54,18],[.72,.42,72,21],[.38,.72,66,17],[.82,.70,43,13]] as const){ctx.beginPath();ctx.ellipse(width*x,height*y,rx,ry,.12,0,Math.PI*2);ctx.fill();}
  scene.paths.forEach((path,index) => { drawScenePath(ctx, path, width, height); drawScenePathWear(ctx, path, width, height, 3, index); });

  // Marcações extensas removidas: bays e faixas de risco agora pertencem apenas às estruturas funcionais.

  // 0.9.3: legacy baked warehouses retired; all visible architecture now belongs to the live 2.5D pipeline.

  // Containers físicos pertencem ao purposefulPropsRenderer. Mantemos apenas uma pequena
  // Low industrial cover comes exclusively from purposefulPropsRenderer.
  // Removed decorative tire rack: it had no tactical or architectural role.
  drawLivingGroundOverlay(ctx, width, height, 3, controlColor);
  drawPurposefulGroundTexture(ctx, width, height, 3, controlColor);
  drawDistrictGroundStory(ctx, width, height, 3, controlColor);

  drawSceneTitle(ctx,width,height,`AVENIDA DAS OFICINAS • GALPÕES · ${controlTag}`,scene.subtitle,controlColor);
}
function drawFortifiedHillScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, _reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(4);
  drawLivingGroundFoundation(ctx, width, height, 4, controlColor);

  // Gold composition: terraced pads hug each hillside side instead of forming map-wide bands.
  const terraces = [
    {p:[[.04,.12],[.35,.13],[.33,.25],[.08,.27]],c:'rgba(67,54,43,.29)'},
    {p:[[.63,.12],[.96,.14],[.92,.25],[.66,.24]],c:'rgba(63,51,42,.27)'},
    {p:[[.03,.29],[.38,.28],[.35,.41],[.07,.43]],c:'rgba(57,46,38,.27)'},
    {p:[[.62,.28],[.97,.30],[.94,.42],[.65,.40]],c:'rgba(55,45,38,.25)'},
    {p:[[.04,.55],[.37,.54],[.34,.67],[.08,.69]],c:'rgba(47,39,33,.29)'},
    {p:[[.61,.54],[.96,.56],[.92,.68],[.64,.67]],c:'rgba(49,40,34,.27)'},
    {p:[[.06,.80],[.33,.79],[.30,.94],[.10,.92]],c:'rgba(45,37,32,.30)'},
    {p:[[.64,.79],[.94,.80],[.90,.93],[.67,.94]],c:'rgba(47,38,33,.28)'}
  ] as const;
  for(const t of terraces){ctx.beginPath();t.p.forEach(([x,y],i)=>i?ctx.lineTo(width*x,height*y):ctx.moveTo(width*x,height*y));ctx.closePath();ctx.fillStyle=t.c;ctx.fill();ctx.strokeStyle='rgba(139,115,92,.075)';ctx.lineWidth=1.25;ctx.stroke();}
  // 0.9.1A: isolated hill houses replaced by unified physical support clusters.
  scene.paths.forEach((path,index) => { drawScenePath(ctx, path, width, height); drawScenePathWear(ctx, path, width, height, 4, index); });

  // Escadarias em zigue-zague e muros de arrimo.
  const stairs = [
    [[.18,.80],[.31,.70]], [[.31,.70],[.22,.58]],
    [[.69,.55],[.82,.45]], [[.82,.45],[.72,.34]]
  ] as const;
  ctx.strokeStyle='#8a827c';ctx.lineWidth=9;
  for(const [a,b] of stairs){
    ctx.beginPath();ctx.moveTo(width*a[0],height*a[1]);ctx.lineTo(width*b[0],height*b[1]);ctx.stroke();
    ctx.strokeStyle='rgba(15,23,42,.55)';ctx.lineWidth=1;
    for(let i=1;i<7;i++){
      const x=width*(a[0]+(b[0]-a[0])*i/7),y=height*(a[1]+(b[1]-a[1])*i/7);
      ctx.beginPath();ctx.moveTo(x-6,y+3);ctx.lineTo(x+6,y-3);ctx.stroke();
    }
    ctx.strokeStyle='#8a827c';ctx.lineWidth=9;
  }

  // Linhas fortificadas: muros de arrimo com aberturas reais para o fluxo de tropas.
  const retaining = [
    [.02,.255,.18],[.25,.255,.15],[.61,.255,.14],[.82,.255,.16],
    [.02,.525,.23],[.31,.525,.10],[.59,.525,.13],[.78,.525,.20],
    [.02,.77,.16],[.25,.77,.10],[.64,.77,.12],[.83,.77,.15]
  ] as const;
  for(const [x,y,w] of retaining){
    const rx=width*x, ry=height*y, rw=width*w;
    ctx.fillStyle='rgba(0,0,0,.42)';ctx.fillRect(rx+5,ry+10,rw,13);
    ctx.fillStyle='#55402f';ctx.fillRect(rx,ry,rw,18);
    ctx.fillStyle='#7b6755';ctx.fillRect(rx,ry,rw,3);
    ctx.strokeStyle='rgba(36,27,22,.45)';
    for(let xx=rx+18;xx<rx+rw;xx+=42){ctx.beginPath();ctx.moveTo(xx,ry+3);ctx.lineTo(xx,ry+17);ctx.stroke();}
    // Faction ownership is a local paint/graffiti mark on the physical wall, not a full UI-colored strip.
    const markW=Math.min(26,Math.max(14,rw*.18));ctx.fillStyle=controlColor;ctx.globalAlpha=.42;ctx.fillRect(rx+rw*.18,ry+5,markW,3);ctx.globalAlpha=1;
  }
  // Guard-post landmarks are represented by the physical tactical buildings and watch-post props.
  // Do not add extra decorative towers here: they read as empty/duplicate structures.
  drawLivingGroundOverlay(ctx, width, height, 4, controlColor);
  drawPurposefulGroundTexture(ctx, width, height, 4, controlColor);
  drawDistrictGroundStory(ctx, width, height, 4, controlColor);

  drawSceneTitle(ctx,width,height,`MORRO ALTO • REDUTO FORTIFICADO · ${controlTag}`,scene.subtitle,controlColor);
}
function drawGatedDistrictScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, _reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(5);
  drawLivingGroundFoundation(ctx, width, height, 5, controlColor);

  // Boulevard largo e limpo, contrastando com os territórios anteriores.
  scene.paths.forEach((path,index) => { drawScenePath(ctx, path, width, height); drawScenePathWear(ctx, path, width, height, 5, index); });
  ctx.strokeStyle='rgba(226,232,240,.22)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(width*.44,0);ctx.lineTo(width*.44,height);ctx.stroke();
  ctx.beginPath();ctx.moveTo(width*.56,0);ctx.lineTo(width*.56,height);ctx.stroke();

  // Muros dos condomínios agora são segmentados por portarias reais. Além de melhorar
  // a composição, os vãos visuais correspondem exatamente aos corredores da física.
  const wallSegments = [
    { x:.18, ranges:[[.19,.17],[.52,.16],[.84,.06]] as const },
    { x:.82, ranges:[[.16,.19],[.47,.20],[.81,.09]] as const }
  ];
  for (const side of wallSegments) {
    const wx=width*side.x;
    for (const [yRatio,hRatio] of side.ranges) {
      const wy=height*yRatio, wh=height*hRatio;
      ctx.fillStyle='rgba(0,0,0,.38)';ctx.fillRect(wx+6,wy+5,14,wh);
      ctx.fillStyle='#566372';ctx.fillRect(wx-8,wy,16,wh);
      ctx.fillStyle='#cbd5e1';ctx.fillRect(wx-8,wy,16,3);
      ctx.strokeStyle='rgba(226,232,240,.30)';ctx.lineWidth=1;
      for(let y=wy+26;y<wy+wh;y+=54){ctx.beginPath();ctx.moveTo(wx-7,y);ctx.lineTo(wx+7,y);ctx.stroke();}
      ctx.fillStyle='#111827';
      for(let y=wy+40;y<wy+wh;y+=120){ctx.fillRect(wx-10,y,20,9);ctx.fillStyle='#38bdf8';ctx.fillRect(wx-4,y+2,8,3);ctx.fillStyle='#111827';}
    }
  }

  // 0.9F: paisagismo assimétrico de orla/condomínio, com jardins que seguem os lotes em vez de um espelho perfeito.
  const gardens=[
    [[.045,.15],[.155,.13],[.175,.27],[.08,.32]],[[.80,.18],[.93,.16],[.95,.29],[.84,.32]],
    [[.055,.58],[.16,.55],[.18,.75],[.09,.81]],[[.79,.60],[.94,.58],[.93,.78],[.82,.82]]
  ] as const;
  for(const g of gardens){ctx.beginPath();g.forEach(([x,y],i)=>i?ctx.lineTo(width*x,height*y):ctx.moveTo(width*x,height*y));ctx.closePath();ctx.fillStyle='#183b2e';ctx.fill();ctx.strokeStyle='#315b46';ctx.stroke();}
  // Calçada portuguesa discreta acompanha o boulevard sem dominar a leitura tática.
  for(const x of [.425,.565]){ctx.fillStyle='rgba(211,214,207,.13)';ctx.fillRect(width*x,0,width*.018,height);ctx.strokeStyle='rgba(15,23,42,.18)';ctx.lineWidth=1;for(let y=8;y<height;y+=18){ctx.beginPath();ctx.moveTo(width*x,y);ctx.quadraticCurveTo(width*(x+.009),y+5,width*(x+.018),y);ctx.stroke();}}
  // Palmeiras e massas podadas quebram a simetria e dão uma assinatura costeira brasileira.
  for(const [x,y,s] of [[.12,.25,1],[.17,.47,.8],[.86,.24,.9],[.91,.52,.8],[.11,.70,.85],[.84,.72,1]] as const){const px=width*x,py=height*y;ctx.strokeStyle='#65543b';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(px,py+10*s);ctx.lineTo(px,py-9*s);ctx.stroke();ctx.strokeStyle='#2f6b4b';ctx.lineWidth=3*s;for(const a of [-2.6,-1.9,-1.2,-.5,.2,.9]){ctx.beginPath();ctx.moveTo(px,py-9*s);ctx.lineTo(px+Math.cos(a)*12*s,py-9*s+Math.sin(a)*6*s);ctx.stroke();}}

  // Espelhos d'água / piscinas como assinatura fria.
  ctx.fillStyle='rgba(56,189,248,.18)';ctx.strokeStyle='rgba(125,211,252,.50)';
  ctx.fillRect(width*.24,height*.20,width*.15,height*.08);ctx.strokeRect(width*.24,height*.20,width*.15,height*.08);
  ctx.fillRect(width*.62,height*.67,width*.14,height*.09);ctx.strokeRect(width*.62,height*.67,width*.14,height*.09);

  // Portão monumental: folhas laterais sólidas e vão central livre, igual à física.
  const gateY=height*.84;
  for(const [x,w] of [[.36,.10],[.54,.10]] as const){
    ctx.fillStyle='rgba(0,0,0,.34)';ctx.fillRect(width*x+5,gateY+6,width*w,15);
    ctx.fillStyle='#d8dde5';ctx.fillRect(width*x,gateY,width*w,13);
    ctx.strokeStyle=controlColor;ctx.lineWidth=2;ctx.strokeRect(width*x,gateY,width*w,13);
    for(let gx=width*x+8;gx<width*(x+w)-4;gx+=18){ctx.strokeStyle=colorWithAlpha(controlColor,.72);ctx.beginPath();ctx.moveTo(gx,gateY+2);ctx.lineTo(gx,gateY+11);ctx.stroke();}
  }
  ctx.fillStyle='#111827';ctx.fillRect(width*.465,height*.822,width*.07,26);
  ctx.strokeStyle=controlColor;ctx.strokeRect(width*.465,height*.822,width*.07,26);
  drawLivingGroundOverlay(ctx, width, height, 5, controlColor);
  drawPurposefulGroundTexture(ctx, width, height, 5, controlColor);
  drawDistrictGroundStory(ctx, width, height, 5, controlColor);

  drawSceneTitle(ctx,width,height,`ORLA • CONDOMÍNIOS · ${controlTag}`,scene.subtitle,controlColor);
}
function drawCentralHqScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(6);
  drawLivingGroundFoundation(ctx, width, height, 6, controlColor);

  // Eixo axial, checkpoint e pátio interno.
  scene.paths.forEach((path,index) => { drawScenePath(ctx, path, width, height); drawScenePathWear(ctx, path, width, height, 6, index); });
  ctx.fillStyle='rgba(63,68,74,.16)';
  ctx.fillRect(width*.325,height*.06,width*.35,height*.88);
  ctx.strokeStyle='rgba(148,163,184,.10)';ctx.strokeRect(width*.335,height*.07,width*.33,height*.86);
  // Perimetro segmentado: dois portais laterais impedem tropas prensadas fora do QG.
  for(const x of [.325,.657]){
    const px=width*x;
    for(const [yRatio,hRatio] of [[.06,.30],[.46,.16],[.72,.22]] as const){
      const py=height*yRatio, ph=height*hRatio;
      ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(px+6,py+6,16,ph);
      ctx.fillStyle='#30333a';ctx.fillRect(px,py,16,ph);
      ctx.fillStyle=colorWithAlpha(controlColor,.30);ctx.fillRect(px,py,2,ph);
      for(let y=py+20;y<py+ph;y+=48){ctx.fillStyle='#111827';ctx.fillRect(px-3,y,22,6);}
    }
    for(const gateY of [.41,.67]){
      ctx.strokeStyle=colorWithAlpha(controlColor,.55);ctx.lineWidth=2;
      ctx.strokeRect(px-5,height*gateY-18,26,36);
    }
  }

  // Checkpoints sucessivos: duas barreiras sólidas com corredor central deliberado.
  for(const y of [.78,.54,.31]){
    for(const [x,w] of [[.34,.11],[.55,.11]] as const){
      const bx=width*x, by=height*y, bw=width*w;
      ctx.fillStyle='rgba(0,0,0,.42)';ctx.fillRect(bx+5,by+7,bw,16);
      ctx.fillStyle='#343036';ctx.fillRect(bx,by,bw,16);
      ctx.fillStyle='rgba(226,232,240,.26)';ctx.fillRect(bx,by,bw,3);
      for(let xx=bx+8;xx<bx+bw-5;xx+=22){ctx.fillStyle=colorWithAlpha(controlColor,.45);ctx.fillRect(xx,by+6,6,3);}
    }
    ctx.strokeStyle='rgba(148,163,184,.10)';
    ctx.strokeRect(width*.45,height*y,width*.10,16);
  }

  // 0.5.6B.1: the old HQ mass becomes a ground command apron when a physical QG owns this footprint.
  const hqY=height*.11, hqX=width*.39, hqW=width*.22, hqH=112;
  if (!overlapsReserved(hqX,hqY,hqW,hqH,reserved,34)) {
    ctx.fillStyle='rgba(0,0,0,.42)';ctx.fillRect(hqX+12,hqY+14,hqW,122);
    ctx.fillStyle='#18202b';ctx.fillRect(hqX,hqY,hqW,hqH);
    ctx.fillStyle='#222c38';ctx.fillRect(width*.34,hqY+34,width*.08,74);ctx.fillRect(width*.58,hqY+34,width*.08,74);
    ctx.strokeStyle=controlColor;ctx.lineWidth=3;ctx.strokeRect(hqX,hqY,hqW,hqH);
    ctx.fillStyle='#242029';ctx.fillRect(width*.47,hqY+58,width*.06,54);
  } else {
    ctx.fillStyle='rgba(38,45,52,.20)';ctx.fillRect(width*.36,hqY,width*.28,126);
    ctx.strokeStyle='rgba(148,163,184,.14)';ctx.strokeRect(width*.36,hqY,width*.28,126);
    ctx.fillStyle=colorWithAlpha(controlColor,.16);ctx.fillRect(width*.475,hqY+112,width*.05,4);
  }

  // 0.9.1D: decorative ghost towers retired; all architecture now shares physical/context pipeline.

  // Gold pass: only short physical floor joints remain; no schematic guide lines.
  ctx.strokeStyle='rgba(226,232,240,.07)';ctx.lineWidth=1;
  for(const [x1,y,x2] of [[.40,.40,.47],[.53,.68,.60]] as const){ctx.beginPath();ctx.moveTo(width*x1,height*y);ctx.lineTo(width*x2,height*y);ctx.stroke();}
  drawLivingGroundOverlay(ctx, width, height, 6, controlColor);
  drawPurposefulGroundTexture(ctx, width, height, 6, controlColor);
  drawDistrictGroundStory(ctx, width, height, 6, controlColor);

  drawSceneTitle(ctx,width,height,`COMPLEXO CENTRAL • QUARTEL-GENERAL · ${controlTag}`,scene.subtitle,controlColor);
}
export function drawCityVivaMinimapFoundation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  controlColor?: string
) {
  const scene = getTerritoryScene(territoryId);
  const controlAccent = controlColor ?? scene.accent;
  ctx.save();
  ctx.globalAlpha = .72;
  ctx.strokeStyle = scene.accent;
  ctx.fillStyle = `${scene.accent}22`;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (territoryId === 1) {
    for (const path of scene.paths) {
      ctx.beginPath();
      path.points.forEach((p,i)=> i===0 ? ctx.moveTo(p.x*width,p.y*height) : ctx.lineTo(p.x*width,p.y*height));
      ctx.lineWidth = Math.max(1.3, path.width * width / 1280);
      ctx.strokeStyle = path.surface === 'asphalt' ? 'rgba(234,179,8,.55)' : 'rgba(148,163,184,.50)';
      ctx.stroke();
    }
    if(scene.plaza){ctx.fillStyle='rgba(148,163,184,.13)';ctx.fillRect(scene.plaza.x*width,scene.plaza.y*height,scene.plaza.w*width,scene.plaza.h*height);}
  } else if (territoryId === 2) {
    const y=height*.29;ctx.lineWidth=1.2;ctx.strokeStyle='#eab308';
    ctx.beginPath();ctx.moveTo(2,y-2);ctx.lineTo(width-2,y-2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(2,y+2);ctx.lineTo(width-2,y+2);ctx.stroke();
    ctx.fillStyle='rgba(234,179,8,.12)';ctx.fillRect(width*.24,y-11,width*.52,5);
  } else if (territoryId === 3) {
    ctx.strokeStyle='#f97316';ctx.strokeRect(width*.10,height*.17,width*.80,height*.66);
    ctx.fillStyle='rgba(249,115,22,.18)';ctx.fillRect(width*.18,height*.22,width*.15,height*.10);ctx.fillRect(width*.66,height*.66,width*.16,height*.11);
  } else if (territoryId === 4) {
    ctx.strokeStyle=controlAccent;for(const y of [.34,.57,.82]){ctx.beginPath();ctx.moveTo(4,height*y);ctx.lineTo(width-4,height*y);ctx.stroke();}
  } else if (territoryId === 5) {
    ctx.strokeStyle=controlAccent;ctx.strokeRect(5,height*.09,width*.18,height*.82);ctx.strokeRect(width*.79,height*.09,width*.16,height*.82);
    ctx.beginPath();ctx.moveTo(width*.47,0);ctx.lineTo(width*.47,height);ctx.stroke();ctx.beginPath();ctx.moveTo(width*.53,0);ctx.lineTo(width*.53,height);ctx.stroke();
  } else if (territoryId === 6) {
    ctx.strokeStyle=controlAccent;ctx.strokeRect(width*.33,height*.06,width*.34,height*.88);
    ctx.fillStyle=colorWithAlpha(controlAccent,.22);ctx.fillRect(width*.39,height*.11,width*.22,height*.17);
  }

  // 0.5.2: functional cover and landmarks are echoed on the minimap as compact masses.
  for (const prop of getTerritoryPurposeProps(territoryId)) {
    if (!prop.solid) continue;
    const controlledAccent =
      (territoryId===4 && (prop.kind==='watch_post'||prop.kind==='barricade')) ||
      (territoryId===5 && (prop.kind==='security_booth'||prop.kind==='bollards')) ||
      (territoryId===6 && (prop.kind==='checkpoint'||prop.kind==='service_unit'||prop.kind==='bollards'));
    const propAccent = controlledAccent ? controlAccent : (prop.accent ?? scene.accent);
    ctx.fillStyle = colorWithAlpha(propAccent, controlledAccent ? .62 : .48);
    const px = prop.x * width, py = prop.y * height;
    const pw = Math.max(2, prop.w * width), ph = Math.max(2, prop.h * height);
    ctx.fillRect(px, py, pw, ph);
  }
  ctx.restore();
}
export function drawCityVivaAmbientOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  time: number,
  controlColor?: string
) {
  const controlAccent = controlColor ?? getTerritoryScene(territoryId).accent;
  ctx.save();
  if (territoryId === 1) {
    const sway = Math.sin(time * .0025) * 3;
    ctx.strokeStyle='rgba(226,232,240,.24)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(width*.19,height*.31);ctx.quadraticCurveTo(width*.27,height*.34+sway,width*.35,height*.30);ctx.stroke();
    ['#f97316','#38bdf8','#fde047'].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(width*.23+i*22,height*.32+sway*(i*.18),10,7);});
  } else if (territoryId === 2) {
    const on = Math.sin(time * .006) > 0;
    ctx.fillStyle=on?'#ef4444':'#7f1d1d';ctx.beginPath();ctx.arc(width*.79,height*.235,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(239,68,68,.12)';ctx.beginPath();ctx.arc(width*.79,height*.235,on?22:12,0,Math.PI*2);ctx.fill();
  } else if (territoryId === 3) {
    const flash = Math.sin(time * .018) > .68;
    if(flash){
      const x=width*.73,y=height*.61;const g=ctx.createRadialGradient(x,y,1,x,y,34);g.addColorStop(0,'rgba(253,186,116,.55)');g.addColorStop(1,'rgba(249,115,22,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fdba74';ctx.lineWidth=1;for(let i=0;i<5;i++){const a=i*1.27+time*.001;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*(8+i*2),y+Math.sin(a)*(8+i*2));ctx.stroke();}
    }
  } else if (territoryId === 4) {
    const sweep = Math.sin(time * .0007) * .20;
    ctx.fillStyle=colorWithAlpha(controlAccent,.035);ctx.beginPath();ctx.moveTo(width*.83,height*.13);ctx.lineTo(width*(.56+sweep),height*.72);ctx.lineTo(width*(.72+sweep),height*.72);ctx.closePath();ctx.fill();
  } else if (territoryId === 5) {
    ctx.strokeStyle='rgba(125,211,252,.18)';ctx.lineWidth=1;
    const shift=(time*.018)%18;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(width*.24+shift+i*20,height*.24);ctx.lineTo(width*.26+shift+i*20,height*.24);ctx.stroke();}
  } else if (territoryId === 6) {
    const pulse=.35+(.5+.5*Math.sin(time*.006))*.35;
    ctx.fillStyle=colorWithAlpha(controlAccent,pulse);
    for(const x of [.34,.66]){ctx.beginPath();ctx.arc(width*x,height*.53,4,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}
