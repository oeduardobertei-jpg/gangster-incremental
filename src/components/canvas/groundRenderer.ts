import { getTerritoryBiome, GroundPatchSpec, TerritoryBiomeProfile } from '../../data/territoryBiomes';

const colorWithAlpha = (color: string, alpha: number) => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const mulberry32 = (seed: number) => () => {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const roundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, radius: number
) => {
  const r = Math.min(radius, w * .5, h * .5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};
const patchColor = (biome: TerritoryBiomeProfile, patch: GroundPatchSpec) => {
  switch (patch.kind) {
    case 'dirt': return biome.dirt;
    case 'concrete': return biome.concrete;
    case 'grass': return biome.vegetation;
    case 'mud': return biome.damp;
    case 'ballast': return '#3d3a3c';
    case 'industrial': return '#343638';
    case 'restricted': return '#252a31';
    case 'pavers': return '#474a4d';
  }
};

const drawBaseGradient = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  biome: TerritoryBiomeProfile
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, biome.baseTop);
  gradient.addColorStop(.48, biome.baseMid);
  gradient.addColorStop(1, biome.baseBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};
const drawPatch = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  biome: TerritoryBiomeProfile,
  patch: GroundPatchSpec,
  controlColor?: string
) => {
  const x = patch.x * width;
  const y = patch.y * height;
  const w = patch.w * width;
  const h = patch.h * height;
  const alpha = patch.alpha ?? .65;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(patch.rotation ?? 0);
  ctx.translate(-w / 2, -h / 2);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = patchColor(biome, patch);
  groundPatchPath(ctx, w, h, patch);
  ctx.fill();
  ctx.globalAlpha = Math.min(1, alpha * .95);
  drawPatchTexture(ctx, w, h, patch, biome, controlColor);
  ctx.globalAlpha = Math.min(1, alpha * .32);
  ctx.strokeStyle = biome.edge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = Math.min(1, alpha * .11);
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();
};
const drawPaverGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  biome: TerritoryBiomeProfile
) => {
  const rand = mulberry32(territoryId * 811 + width + height);
  ctx.save();
  ctx.strokeStyle = territoryId === 5 ? 'rgba(226,232,240,.018)' : territoryId === 6 ? 'rgba(226,232,240,.022)' : 'rgba(226,232,240,.045)';
  ctx.lineWidth = 1;
  const stepX = territoryId === 5 ? 56 : territoryId === 6 ? 52 : 42;
  const stepY = territoryId === 5 ? 42 : territoryId === 6 ? 39 : 31;
  for (let y = 0; y < height; y += stepY) {
    const shift = (Math.floor(y / stepY) % 2) * (stepX * .5);
    for (let x = -stepX; x < width + stepX; x += stepX) {
      if (rand() < .18) continue;
      ctx.strokeRect(x + shift, y, stepX - 3, stepY - 3);
    }
  }
  ctx.globalAlpha = .22;
  ctx.fillStyle = biome.dust;
  for (let i = 0; i < 34; i++) {
    const x = rand() * width, y = rand() * height;
    ctx.fillRect(x, y, 1 + rand() * 2, 1 + rand() * 2);
  }
  ctx.restore();
};
const drawSurfaceNoise = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  biome: TerritoryBiomeProfile
) => {
  const rand = mulberry32(territoryId * 1907 + width * 3 + height * 7);
  const count = Math.round(150 * biome.noiseDensity);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rand() * width, y = rand() * height;
    const warm = rand() > .62;
    ctx.fillStyle = warm ? biome.dust : biome.edge;
    ctx.globalAlpha = .035 + rand() * .08;
    const r = .5 + rand() * 1.8;
    ctx.beginPath();
    ctx.ellipse(x, y, r * (1.2 + rand()), r, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
};

const drawCracks = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  biome: TerritoryBiomeProfile
) => {
  const rand = mulberry32(territoryId * 4001 + 77);
  const count = Math.round(11 * biome.crackDensity);
  ctx.save();
  ctx.strokeStyle = biome.crack;
  ctx.globalAlpha = .52;
  ctx.lineWidth = 1.15;
  for (let i = 0; i < count; i++) {
    let x = width * (.08 + rand() * .84);
    let y = height * (.10 + rand() * .80);
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segments = 3 + Math.floor(rand() * 4);
    for (let s = 0; s < segments; s++) {
      x += (rand() - .5) * 18;
      y += 7 + rand() * 13;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (rand() > .48) {
      ctx.beginPath();
      ctx.moveTo(x - 3, y - 8);
      ctx.lineTo(x + (rand() - .5) * 13, y + rand() * 8);
      ctx.stroke();
    }
  }
  ctx.restore();
};

const drawWetness = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  biome: TerritoryBiomeProfile
) => {
  const rand = mulberry32(territoryId * 6113 + 17);
  const count = Math.round(4 + biome.wetness * 6);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = width * (.08 + rand() * .84);
    const y = height * (.12 + rand() * .76);
    const rx = 10 + rand() * 28;
    const ry = 3 + rand() * 8;
    ctx.fillStyle = biome.damp;
    ctx.globalAlpha = .10 + biome.wetness * .10;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, (rand() - .5) * .35, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(186,230,253,.08)'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
};
const drawTerritoryGroundStory = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  biome: TerritoryBiomeProfile,
  controlColor?: string
) => {
  const controlAccent = controlColor ?? biome.accent;
  ctx.save();
  if (territoryId === 1) {
    ctx.strokeStyle = 'rgba(116,93,67,.44)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(width*.03,height*.58); ctx.bezierCurveTo(width*.18,height*.54,width*.30,height*.62,width*.42,height*.55); ctx.stroke();
    ctx.strokeStyle = 'rgba(19,31,36,.78)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(width*.55,height); ctx.bezierCurveTo(width*.53,height*.72,width*.58,height*.42,width*.55,0); ctx.stroke();
    ctx.strokeStyle = 'rgba(128,140,142,.28)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(49,88,68,.38)';
    for (const [x,y,r] of [[.08,.14,18],[.17,.40,12],[.83,.22,15],[.90,.72,17]] as const) {
      ctx.beginPath(); ctx.arc(width*x,height*y,r,0,Math.PI*2); ctx.fill();
    }
  } else if (territoryId === 2) {
    ctx.fillStyle = 'rgba(87,64,43,.32)';
    for (const [x,y,w,h] of [[.08,.48,.18,.08],[.30,.64,.17,.07],[.65,.50,.20,.08]] as const) ctx.fillRect(width*x,height*y,width*w,height*h);
    ctx.strokeStyle = 'rgba(196,140,54,.24)'; ctx.lineWidth = 2;
    for (let x=.05; x<.95; x+=.10) { ctx.beginPath(); ctx.moveTo(width*x,height*.24); ctx.lineTo(width*(x+.02),height*.34); ctx.stroke(); }
  } else if (territoryId === 3) {
    // 0.8H.1: authored slab seams around workshop zones replace the full-yard editor-like grid.
    ctx.strokeStyle='rgba(148,163,184,.042)';ctx.lineWidth=1;
    for(const [x,y,w,h] of [[.14,.20,.24,.22],[.62,.29,.24,.22],[.27,.64,.23,.16]] as const){
      const sx=width*x,sy=height*y,sw=width*w,sh=height*h;ctx.strokeRect(sx,sy,sw,sh);
      ctx.beginPath();ctx.moveTo(sx+sw*.48,sy);ctx.lineTo(sx+sw*.48,sy+sh);ctx.moveTo(sx,sy+sh*.55);ctx.lineTo(sx+sw,sy+sh*.55);ctx.stroke();
    }
    ctx.fillStyle='rgba(15,23,42,.20)';
    for(const [x,y,rx,ry] of [[.34,.34,28,9],[.63,.57,38,12],[.50,.75,21,7]] as const){ctx.beginPath();ctx.ellipse(width*x,height*y,rx,ry,.15,0,Math.PI*2);ctx.fill();}
  } else if (territoryId === 4) {
    ctx.strokeStyle='rgba(110,67,47,.34)';ctx.lineWidth=4;
    for(const y of [.31,.57,.81]){ctx.beginPath();ctx.moveTo(0,height*y);ctx.bezierCurveTo(width*.24,height*(y-.02),width*.71,height*(y+.03),width,height*y);ctx.stroke();}
    ctx.fillStyle='rgba(62,83,57,.32)';
    for(const [x,y,r] of [[.11,.22,14],[.85,.42,12],[.75,.78,16]] as const){ctx.beginPath();ctx.arc(width*x,height*y,r,0,Math.PI*2);ctx.fill();}
  } else if (territoryId === 5) {
    ctx.strokeStyle='rgba(226,232,240,.012)';ctx.lineWidth=1;
    for(const [x,y,w,h] of [[.22,.16,.18,.18],[.59,.55,.18,.20]] as const){const sx=width*x,sy=height*y,sw=width*w,sh=height*h;ctx.strokeRect(sx,sy,sw,sh);ctx.beginPath();ctx.moveTo(sx+sw*.52,sy);ctx.lineTo(sx+sw*.52,sy+sh);ctx.stroke();}
    ctx.fillStyle='rgba(39,93,72,.28)';
    for(const [x,y,w,h] of [[.04,.18,.11,.12],[.85,.18,.11,.12],[.04,.65,.11,.12],[.85,.65,.11,.12]] as const){ctx.fillRect(width*x,height*y,width*w,height*h);}
  } else if (territoryId === 6) {
    ctx.strokeStyle=colorWithAlpha(controlAccent,.09);ctx.lineWidth=1;
    for(const [x1,y,x2] of [[.36,.29,.46],[.54,.53,.64],[.38,.77,.48]] as const){ctx.beginPath();ctx.moveTo(width*x1,height*y);ctx.lineTo(width*x2,height*y);ctx.stroke();}
    ctx.fillStyle=colorWithAlpha(controlAccent,.045);
    for(const y of [.18,.42,.66]) ctx.fillRect(width*.36,height*y,width*.28,height*.07);
  }
  ctx.restore();
};
export function drawLivingGroundFoundation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  controlColor?: string
) {
  const biome = getTerritoryBiome(territoryId);
  ctx.save();
  drawBaseGradient(ctx, width, height, biome);

  for (const patch of biome.patches) drawPatch(ctx, width, height, biome, patch, controlColor);

  if (territoryId === 2) {
    drawPaverGrid(ctx, width, height, territoryId, biome);
  }

  drawSurfaceNoise(ctx, width, height, territoryId, biome);
  // 0.8C: global random cracks removed; wear is authored contextually near roads/structures.
  drawWetness(ctx, width, height, territoryId, biome);
  drawTerritoryGroundStory(ctx, width, height, territoryId, biome, controlColor);
  ctx.restore();
}
const drawPatchTexture = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  patch: GroundPatchSpec,
  biome: TerritoryBiomeProfile,
  controlColor?: string
) => {
  const seed = Math.round((patch.x*997 + patch.y*619 + patch.w*431 + patch.h*271) * 1000);
  const rand = mulberry32(seed + patch.kind.length * 131);
  ctx.save();
  groundPatchPath(ctx, w, h, patch);
  ctx.clip();

  if (patch.kind === 'dirt' || patch.kind === 'mud') {
    for (let i=0;i<Math.max(8,Math.round(w*h/2200));i++) {
      const x=rand()*w,y=rand()*h,r=1+rand()*3;
      ctx.fillStyle=patch.kind==='mud'?'rgba(15,23,42,.18)':'rgba(226,196,150,.10)';
      ctx.beginPath();ctx.ellipse(x,y,r*1.8,r,(rand()-.5)*.5,0,Math.PI*2);ctx.fill();
    }
  } else if (patch.kind === 'grass') {
    ctx.strokeStyle='rgba(110,160,113,.23)';ctx.lineWidth=1;
    for(let i=0;i<Math.max(12,Math.round(w*h/1800));i++){
      const x=rand()*w,y=rand()*h,l=3+rand()*6;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rand()-.5)*3,y-l);ctx.stroke();
    }
  } else if (patch.kind === 'pavers') {
    ctx.strokeStyle=biome.id===5?'rgba(226,232,240,.014)':biome.id===6?'rgba(226,232,240,.032)':'rgba(226,232,240,.065)';ctx.lineWidth=1;
    const sx=26,sy=18;
    for(let y=0;y<h;y+=sy){const shift=(Math.floor(y/sy)%2)*sx*.5;for(let x=-sx;x<w+sx;x+=sx)ctx.strokeRect(x+shift,y,sx-2,sy-2);}
  } else if (patch.kind === 'ballast') {
    for(let i=0;i<Math.max(20,Math.round(w*h/650));i++){
      const x=rand()*w,y=rand()*h,r=1.5+rand()*3.5;
      ctx.fillStyle=rand()>.5?'rgba(148,163,184,.18)':'rgba(15,23,42,.24)';
      ctx.beginPath();ctx.ellipse(x,y,r,r*.65,rand()*Math.PI,0,Math.PI*2);ctx.fill();
    }
  } else if (patch.kind === 'industrial') {
    ctx.strokeStyle=biome.id===3?'rgba(203,213,225,.035)':'rgba(203,213,225,.09)';ctx.lineWidth=1;
    const sx=biome.id===3?96:54,sy=biome.id===3?72:42;
    for(let x=0;x<w;x+=sx){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=sy){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.fillStyle='rgba(15,23,42,.18)';
    for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(rand()*w,rand()*h,8+rand()*18,3+rand()*7,(rand()-.5)*.4,0,Math.PI*2);ctx.fill();}
  } else if (patch.kind === 'restricted') {
    if(biome.id===6){ctx.strokeStyle=colorWithAlpha(controlColor ?? biome.accent,.07);ctx.lineWidth=1;for(const [yy,a,b] of [[.20,.08,.38],[.48,.56,.90],[.76,.14,.44]] as const){ctx.beginPath();ctx.moveTo(w*a,h*yy);ctx.lineTo(w*b,h*yy);ctx.stroke();}}else{ctx.strokeStyle=colorWithAlpha(controlColor ?? biome.accent,.20);ctx.lineWidth=2;ctx.setLineDash([12,10]);for(let y=16;y<h;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}ctx.setLineDash([]);}
  }
  ctx.restore();
};
const groundPatchPath = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  patch: GroundPatchSpec
) => {
  const organic = patch.kind === 'dirt' || patch.kind === 'mud' || patch.kind === 'grass';
  if (!organic) {
    roundedRectPath(ctx, 0, 0, w, h, Math.min(18, Math.min(w, h) * .18));
    return;
  }
  const rand = mulberry32(Math.round((patch.x*811+patch.y*443+patch.w*271+patch.h*163)*1000));
  const pts = [
    [.04,.11],[.25,.025],[.51,.055],[.77,.015],[.96,.12],[.995,.37],[.95,.64],
    [.99,.86],[.78,.965],[.51,.995],[.24,.95],[.025,.85],[.005,.58],[.045,.31]
  ] as const;
  ctx.beginPath();
  pts.forEach(([px,py],i)=>{
    const jitterX=(rand()-.5)*.055, jitterY=(rand()-.5)*.055;
    const x=Math.max(0,Math.min(1,px+jitterX))*w;
    const y=Math.max(0,Math.min(1,py+jitterY))*h;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  });
  ctx.closePath();
};
export function drawLivingGroundOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  controlColor?: string
) {
  const biome = getTerritoryBiome(territoryId);
  const controlAccent = controlColor ?? biome.accent;
  const rand = mulberry32(territoryId * 9029 + width + height * 3);
  ctx.save();

  if (territoryId === 1) {
    ctx.fillStyle='rgba(3,7,12,.36)';ctx.strokeStyle='rgba(120,113,108,.20)';
    for(const [x,y,rx,ry] of [[.43,.74,15,6],[.58,.47,12,5],[.48,.24,10,4],[.33,.57,8,4]] as const){
      ctx.beginPath();ctx.ellipse(width*x,height*y,rx,ry,(x-y)*.7,0,Math.PI*2);ctx.fill();ctx.stroke();
    }
    ctx.strokeStyle='rgba(151,141,125,.16)';ctx.lineWidth=1;
    for(const [x,y] of [[.28,.68],[.67,.57],[.73,.28],[.18,.44]] as const){
      ctx.strokeRect(width*x,height*y,31,18);ctx.beginPath();ctx.moveTo(width*x+3,height*y+9);ctx.lineTo(width*x+28,height*y+9);ctx.stroke();
    }
  } else if (territoryId === 2) {
    const railY=height*.29;
    ctx.strokeStyle='rgba(146,64,14,.28)';ctx.lineWidth=2;
    for(const off of [-10,10]){ctx.beginPath();ctx.moveTo(0,railY+off);ctx.lineTo(width,railY+off);ctx.stroke();}
    ctx.strokeStyle='rgba(161,98,7,.20)';ctx.setLineDash([4,12]);ctx.lineWidth=3;
    for(const y of [.54,.68,.76]){ctx.beginPath();ctx.moveTo(width*.08,height*y);ctx.lineTo(width*.92,height*y);ctx.stroke();}
    ctx.setLineDash([]);
  } else if (territoryId === 3) {
    ctx.fillStyle='rgba(2,6,23,.22)';
    for(const [x,y,rx,ry] of [[.24,.39,22,7],[.56,.63,31,9],[.76,.31,17,5]] as const){ctx.beginPath();ctx.ellipse(width*x,height*y,rx,ry,(x+y)*.2,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='rgba(148,163,184,.065)';ctx.lineWidth=1;
    for(const [x1,y1,x2,y2] of [[.13,.30,.31,.30],[.64,.46,.84,.46],[.28,.70,.47,.70]] as const){ctx.beginPath();ctx.moveTo(width*x1,height*y1);ctx.lineTo(width*x2,height*y2);ctx.stroke();}
  } else if (territoryId === 4) {
    ctx.strokeStyle='rgba(143,99,74,.28)';ctx.lineWidth=2;
    for(const [x1,y1,x2,y2] of [[.09,.20,.18,.34],[.72,.40,.81,.58],[.32,.63,.27,.80],[.88,.66,.80,.84]] as const){
      ctx.beginPath();ctx.moveTo(width*x1,height*y1);ctx.bezierCurveTo(width*((x1+x2)/2+.03),height*((y1+y2)/2),width*((x1+x2)/2-.02),height*((y1+y2)/2+.04),width*x2,height*y2);ctx.stroke();
    }
    ctx.fillStyle='rgba(181,120,77,.22)';
    for(let i=0;i<22;i++){const x=width*(.04+rand()*.92),y=height*(.12+rand()*.78),r=1+rand()*2.2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  } else if (territoryId === 5) {
    ctx.fillStyle='rgba(34,94,66,.18)';
    for(const [x,y] of [[.18,.22],[.79,.28],[.21,.74],[.77,.68]] as const){
      for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(width*x+(rand()-.5)*34,height*y+(rand()-.5)*24,2+rand()*3,1+rand()*2,rand()*Math.PI,0,Math.PI*2);ctx.fill();}
    }
    ctx.strokeStyle='rgba(226,232,240,.035)';ctx.lineWidth=1;
    for(const x of [.38,.62]){ctx.beginPath();ctx.moveTo(width*x,height*.22);ctx.lineTo(width*x,height*.78);ctx.stroke();}
  } else if (territoryId === 6) {
    ctx.strokeStyle=colorWithAlpha(controlAccent,.055);ctx.lineWidth=1;
    for(const y of [.32,.56,.80]){
      for(let x=.35;x<.65;x+=.055){ctx.beginPath();ctx.moveTo(width*x,height*y);ctx.lineTo(width*(x+.025),height*(y-.018));ctx.stroke();}
    }
    ctx.strokeStyle='rgba(226,232,240,.030)';ctx.lineWidth=1;
    for(const x of [.43,.57]){ctx.beginPath();ctx.moveTo(width*x,height*.18);ctx.lineTo(width*x,height*.88);ctx.stroke();}
    ctx.fillStyle=colorWithAlpha(controlAccent,.045);
    for(const [x,y,w,h] of [[.39,.40,.22,.065],[.39,.64,.22,.065]] as const)ctx.fillRect(width*x,height*y,width*w,height*h);
  }

  ctx.restore();
}
