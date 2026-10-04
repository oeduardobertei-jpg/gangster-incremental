import type { FactionConfig } from '../../types/game';
import { getTerritoryScene, ScenePath } from '../../data/territoryScenes';
import { getTerritoryPurposeProps } from '../../data/territoryPurposeProps';
import { WORLD_LIGHTING, WORLD_MATERIALS } from '../../data/visualTokens';
import { drawLivingGroundFoundation, drawLivingGroundOverlay } from './groundRenderer';
import { drawT1ReauthoredSurface } from './t1GroundReauthorRenderer';
import { drawT2ReauthoredSurface } from './t2RailGroundReauthorRenderer';
import { drawT3ReauthoredSurface } from './t3IndustrialGroundReauthorRenderer';
import { drawT4ReauthoredSurface } from './t4GroundReauthorRenderer';
import { drawT5ReauthoredSurface } from './t5GatedGroundReauthorRenderer';
import { drawT6ReauthoredSurface } from './t6CentralGroundReauthorRenderer';

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
  const isAsphalt=path.surface==='asphalt', isAlley=path.surface==='alley';
  const material=isAsphalt?WORLD_MATERIALS.asphalt:WORLD_MATERIALS.concrete;
  const base=isAlley?'#393a39':material.base;
  const edge=isAlley?'#74685b':(isAsphalt?'#7a7569':material.edge);
  linePath(ctx,path,width,height);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=isAlley?'rgba(5,7,8,.44)':'rgba(0,0,0,.30)';
  ctx.lineWidth=path.width+(isAlley?7:9);ctx.stroke();
  linePath(ctx,path,width,height);ctx.strokeStyle=base;ctx.lineWidth=path.width;ctx.stroke();
  if(path.edge){
    linePath(ctx,path,width,height);ctx.strokeStyle=edge;ctx.globalAlpha=isAlley?.24:.32;
    ctx.lineWidth=path.width+(isAlley?4:5);ctx.stroke();
    linePath(ctx,path,width,height);ctx.strokeStyle=base;ctx.globalAlpha=1;ctx.lineWidth=path.width;ctx.stroke();
  }
  if(isAsphalt){
    linePath(ctx,path,width,height);ctx.setLineDash([17,19]);ctx.strokeStyle='rgba(250,204,21,.30)';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
  }
  if(isAlley){
    linePath(ctx,path,width,height);ctx.strokeStyle='rgba(226,232,240,.045)';ctx.lineWidth=1;ctx.stroke();
    linePath(ctx,path,width,height);ctx.strokeStyle='rgba(120,94,65,.08)';ctx.lineWidth=Math.max(1,path.width-7);ctx.stroke();
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
        // Repaired asphalt and oil wear stay concentrated on the main road.
        ctx.fillStyle = 'rgba(4,8,12,.15)';
        ctx.beginPath(); ctx.ellipse(0, 0, 10 + (seed % 8), 3 + slot * 2, .08, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle='rgba(71,85,105,.07)';ctx.fillRect(-7,-1,14,2);
      } else if(path.surface === 'alley') {
        ctx.fillStyle='rgba(92,70,48,.16)';ctx.beginPath();ctx.ellipse(-7,4,10+(seed%5),2.5+slot,.12,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(20,25,28,.30)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(-9,-3);ctx.lineTo(-2,0);ctx.lineTo(5,-2);ctx.lineTo(11,2);ctx.stroke();
        ctx.fillStyle='rgba(110,125,91,.13)';ctx.fillRect(8,-path.width*.32,4,2);
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

  // Fachada leg?vel em zoom normal: porta, duas aberturas e infraestrutura de laje.
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
  // Rodap?/AO amarra o volume ao ch?o e evita apar?ncia de "adesivo".
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

const drawPeripheryLightStory = (ctx:CanvasRenderingContext2D,width:number,height:number) => {
  ctx.save();
  ctx.globalCompositeOperation='screen';
  const pools=[
    [.135,.155,128,.22], // Barraquinha
    [.300,.205,108,.14], // comercio/contexto oeste
    [.445,.105,108,.16], // Mirante
    [.105,.455,118,.18], // Laje do Ponto
    [.105,.785,110,.17], // Beco 01
    [.805,.405,126,.19], // Boca da Leste
    [.835,.755,112,.16], // Esconderijo
    [.675,.165,108,.15]  // comercio/contexto leste
  ] as const;
  for(const [x,y,r,a] of pools){
    const px=width*x,py=height*y;
    const g=ctx.createRadialGradient(px,py,2,px,py,r);
    g.addColorStop(0,`rgba(255,208,104,${a})`);
    g.addColorStop(.32,`rgba(245,158,11,${a*.52})`);
    g.addColorStop(1,'rgba(245,158,11,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();
  }
  // Door/shop spill pools are directional so buildings feel occupied, not globally tinted.
  ctx.fillStyle='rgba(255,190,72,.055)';
  ctx.beginPath();ctx.moveTo(width*.145,height*.405);ctx.lineTo(width*.245,height*.435);ctx.lineTo(width*.220,height*.505);ctx.lineTo(width*.125,height*.458);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,176,66,.040)';
  ctx.beginPath();ctx.moveTo(width*.115,height*.725);ctx.lineTo(width*.235,height*.705);ctx.lineTo(width*.255,height*.785);ctx.lineTo(width*.105,height*.800);ctx.closePath();ctx.fill();
  ctx.restore();
};

const drawPeripheryMicroDetails = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  controlColor: string,
  controlTag: string
) => {
  // 0.9.6G: the old map-high drainage trench was retired.
  // Drainage now belongs to the authored surface and appears only in short roadside runs.

  // Postes e transformadores: pontos fixos que organizam a leitura do bairro.
  for(const [x,y,t] of [[.14,.22,1],[.31,.40,0],[.69,.30,1],[.84,.54,0],[.29,.74,0],[.70,.78,1]] as const){
    const px=width*x,py=height*y;ctx.strokeStyle='#535a5f';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(px,py+24);ctx.lineTo(px,py-28);ctx.stroke();
    ctx.strokeStyle='#697177';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px-9,py-23);ctx.lineTo(px+9,py-23);ctx.stroke();
    ctx.fillStyle='#a8a29e';ctx.fillRect(px-8,py-25,3,3);ctx.fillRect(px+5,py-25,3,3);
    ctx.fillStyle='#2b3136';ctx.fillRect(px-5,py-31,10,6);
    if(t){ctx.fillStyle='#60666a';ctx.fillRect(px-9,py-19,18,10);ctx.strokeStyle='#9aa0a4';ctx.strokeRect(px-9,py-19,18,10);}
    ctx.fillStyle='#f3d486';ctx.fillRect(px-2,py-34,4,3);
  }

  // Muros baixos, degraus e remendos junto ?s casas: detalhe visual, sem virar collider fantasma.
  ctx.fillStyle='rgba(111,87,66,.48)';
  for(const [x,y,w] of [[.055,.295,.11],[.80,.405,.12],[.08,.675,.10],[.72,.865,.12]] as const){
    ctx.fillRect(width*x,height*y,width*w,5);ctx.fillStyle='rgba(203,213,225,.08)';ctx.fillRect(width*x,height*y,width*w,1);ctx.fillStyle='rgba(111,87,66,.48)';
  }
  ctx.fillStyle='rgba(71,85,105,.28)';
  for(const [x,y] of [[.18,.47],[.79,.63],[.33,.83]] as const){for(let i=0;i<3;i++)ctx.fillRect(width*x+i*8,height*y+i*3,22-i*5,3);}

  // Pequenos sinais de uso: sacos, latas e vegeta??o espont?nea nas bordas.
  for(const [x,y] of [[.10,.60],[.86,.70],[.19,.88],[.91,.32]] as const){
    ctx.fillStyle='rgba(40,54,45,.64)';ctx.beginPath();ctx.arc(width*x,height*y,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(139,116,82,.55)';ctx.fillRect(width*x+5,height*y+3,5,4);
  }
  // 0.9.6K: ownership moved from a ground label to physical architecture.

};
const drawT1DominatedOccupation=(ctx:CanvasRenderingContext2D,width:number,height:number,color:string)=>{
  ctx.save();
  // Fresh cloth ties attach to existing utility poles after conquest; no floating banners/UI plates.
  for(const [x,y,r] of [[.14,.22,-.08],[.69,.30,.07],[.29,.74,-.06],[.70,.78,.05]] as const){
    const px=width*x,py=height*y-11;ctx.save();ctx.translate(px,py);ctx.rotate(r);
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(-5,2,12,5);
    ctx.fillStyle=color;ctx.globalAlpha=.78;ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(7,-2);ctx.lineTo(5,5);ctx.lineTo(-2,3);ctx.lineTo(-5,8);ctx.closePath();ctx.fill();
    ctx.globalAlpha=.35;ctx.fillStyle='#f8fafc';ctx.fillRect(-4,-1,7,1);ctx.restore();
  }
  ctx.restore();
};

const drawOverheadWires = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.save();
  ctx.strokeStyle='rgba(8,13,18,.28)';ctx.lineWidth=.78;
  // 0.9.5P2: keep the cable language, but route it around the combat-readable center.
  const wires=[
    [.14,.19,.34,.23,.74,.24],
    [.14,.20,.18,.47,.24,.71],
    [.73,.28,.83,.48,.80,.75]
  ];
  for(const [x1,y1,cx,cy,x2,y2] of wires){ctx.beginPath();ctx.moveTo(width*x1,height*y1);ctx.quadraticCurveTo(width*cx,height*cy,width*x2,height*y2);ctx.stroke();}
  ctx.strokeStyle='rgba(20,28,35,.25)';ctx.lineWidth=.65;
  for(const [x,y,len] of [[.18,.47,.070],[.83,.48,.060],[.24,.71,.052]] as const){
    ctx.beginPath();ctx.moveTo(width*x,height*y);ctx.quadraticCurveTo(width*(x+.015),height*(y+len*.55),width*(x+.005),height*(y+len));ctx.stroke();
  }
  ctx.strokeStyle='rgba(226,232,240,.10)';ctx.lineWidth=.7;
  for(const [x,y] of [[.14,.19],[.18,.47],[.74,.24],[.83,.48],[.24,.71],[.80,.75]] as const){ctx.beginPath();ctx.arc(width*x,height*y,3,0,Math.PI*2);ctx.stroke();}
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
    // Tampas, grelhas e remendos concentrados perto das rotas reais.
    ctx.strokeStyle='rgba(148,163,184,.14)';ctx.lineWidth=1;
    for(const [x,y] of [[.30,.38],[.69,.29],[.27,.72],[.82,.54]] as const){
      ctx.strokeRect(width*x,height*y,24,13);ctx.beginPath();ctx.moveTo(width*x+4,height*y+6);ctx.lineTo(width*x+20,height*y+6);ctx.stroke();
    }
    ctx.fillStyle='rgba(2,6,23,.48)';
    for(const [x,y] of [[.55,.24],[.53,.69],[.47,.48]] as const){for(let i=0;i<4;i++)ctx.fillRect(width*x+i*5,height*y,2,10);}
    ctx.strokeStyle='rgba(120,113,108,.22)';
    for(const [x,y] of [[.18,.58],[.76,.73]] as const){ctx.beginPath();ctx.arc(width*x,height*y,8,0,Math.PI*2);ctx.stroke();}
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

  // 0.9.6A: one coherent T1 surface language. Legacy plaza/path/patch stacks are retired here.
  drawT1ReauthoredSurface(ctx, width, height, scene.paths, scene.plaza, reservedFootprints);
  drawPeripheryMicroDetails(ctx, width, height, controlColor, controlTag);
  if(territoryDominated) drawT1DominatedOccupation(ctx,width,height,controlColor);

  for (const lamp of scene.lamps) {
    drawWarmLamp(ctx, lamp.x * width, lamp.y * height, lamp.intensity);
  }
  drawPeripheryLightStory(ctx,width,height);

  drawOverheadWires(ctx, width, height);
  // 0.9.6A: T1 ground storytelling is owned by t1GroundReauthorRenderer.


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
    // Short curb remnants follow occupied pockets instead of reading like editor guides.
    ctx.strokeStyle='rgba(121,112,99,.24)';ctx.lineWidth=3;
    for(const [x1,y1,x2,y2] of [[.10,.52,.19,.515],[.63,.61,.74,.625],[.37,.81,.45,.80],[.77,.42,.86,.43]] as const){
      ctx.beginPath();ctx.moveTo(width*x1,height*y1);ctx.quadraticCurveTo(width*((x1+x2)/2),height*((y1+y2)/2+.008),width*x2,height*y2);ctx.stroke();
    }
    // Drainage grates are small physical details near route edges.
    ctx.fillStyle='rgba(18,24,29,.58)';
    for(const [x,y] of [[.205,.37],[.695,.345],[.72,.742]] as const){
      for(let i=0;i<4;i++)ctx.fillRect(width*x+i*5,height*y,2,9);
    }
    // Crumbled edge patches give the side lanes a built-over, repaired feel.
    ctx.fillStyle='rgba(105,84,60,.16)';
    for(const [x,y,rx,ry] of [[.18,.57,18,5],[.75,.70,15,4],[.31,.33,13,4],[.82,.31,12,4]] as const){ctx.beginPath();ctx.ellipse(width*x,height*y,rx,ry,.12,0,Math.PI*2);ctx.fill();}
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

function drawMarketRailScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(2);
  drawLivingGroundFoundation(ctx, width, height, 2, controlColor);
  // 0.9.8A: one authored rail/market surface replaces stacked generic road, rail-board and plaza overlays.
  drawT2ReauthoredSurface(ctx, width, height, scene.paths, reserved);
  drawSceneTitle(ctx, width, height, `FEIRA • LINHA DO TREM · ${controlTag}`, scene.subtitle, controlColor);
}
function drawIndustrialScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(3);
  drawLivingGroundFoundation(ctx, width, height, 3, controlColor);
  // 0.9.9A: one authored industrial surface replaces stacked yard rectangles and repeated loading-zone language.
  drawT3ReauthoredSurface(ctx, width, height, scene.paths, reserved);
  drawLivingGroundOverlay(ctx, width, height, 3, controlColor);
  drawPurposefulGroundTexture(ctx, width, height, 3, controlColor);
  drawDistrictGroundStory(ctx, width, height, 3, controlColor);
  drawSceneTitle(ctx,width,height,`AVENIDA DAS OFICINAS • GALPÕES · ${controlTag}`,scene.subtitle,controlColor);
}function drawFortifiedHillScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(4);
  drawLivingGroundFoundation(ctx, width, height, 4, controlColor);
  // 0.9.7A: one authored hillside surface replaces stacked terraces, generic road and repeated ground overlays.
  drawT4ReauthoredSurface(ctx, width, height, scene.paths, reserved);
  drawSceneTitle(ctx,width,height,`MORRO ALTO • REDUTO FORTIFICADO · ${controlTag}`,scene.subtitle,controlColor);
}
function drawGatedDistrictScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(5);
  drawLivingGroundFoundation(ctx, width, height, 5, controlColor);
  // 1.1N: authored residential/orla surface replaces the old mirrored CAD-like composition.
  drawT5ReauthoredSurface(ctx, width, height, scene.paths, reserved, controlColor);
  drawLivingGroundOverlay(ctx, width, height, 5, controlColor);
  drawPurposefulGroundTexture(ctx, width, height, 5, controlColor);
  drawDistrictGroundStory(ctx, width, height, 5, controlColor);
  drawSceneTitle(ctx,width,height,`ORLA • CONDOMÍNIOS · ${controlTag}`,scene.subtitle,controlColor);
}
function drawCentralHqScene(ctx: CanvasRenderingContext2D, width: number, height: number, controlColor: string, controlTag: string, reserved: readonly ReservedFootprint[]) {
  const scene = getTerritoryScene(6);
  drawLivingGroundFoundation(ctx, width, height, 6, controlColor);
  // 1.1O: visual command hierarchy is reauthored without changing validated T6 collider geometry.
  drawT6ReauthoredSurface(ctx, width, height, scene.paths, reserved, controlColor);
  drawLivingGroundOverlay(ctx, width, height, 6, controlColor);
  drawPurposefulGroundTexture(ctx, width, height, 6, controlColor);
  drawDistrictGroundStory(ctx, width, height, 6, controlColor);
  drawSceneTitle(ctx,width,height,`COMPLEXO CENTRAL ? QUARTEL-GENERAL ? ${controlTag}`,scene.subtitle,controlColor);
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
    // Cleanup final: detached animated clothesline retired; ambient T1 overlay stays intentionally quiet.
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
