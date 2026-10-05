import type { FactionConfig } from '../../types/game';
import type { SupportPointVisualProfile } from '../../rules/supportPointVisualProgression';
import { getStageFeatureProgress } from '../../rules/incrementalBuildingVisuals';

type SupportPointMaterial = {
  body: string;
  inner: string;
  slab: string;
  metal: string;
  ground: string;
  wear: string;
};

const SUPPORT_MATERIALS: Record<number, SupportPointMaterial> = {
  1: { body:'#44372d', inner:'#5a493a', slab:'#6b5a49', metal:'#59636a', ground:'rgba(91,72,55,.34)', wear:'rgba(151,116,78,.18)' },
  2: { body:'#4a4031', inner:'#5d503b', slab:'#77674a', metal:'#657078', ground:'rgba(104,86,55,.30)', wear:'rgba(194,155,77,.16)' },
  3: { body:'#343b40', inner:'#465057', slab:'#59636a', metal:'#727d84', ground:'rgba(65,73,78,.32)', wear:'rgba(150,106,65,.14)' },
  4: { body:'#453d35', inner:'#574c41', slab:'#695d50', metal:'#687178', ground:'rgba(87,72,58,.31)', wear:'rgba(151,111,72,.15)' },
  5: { body:'#75716a', inner:'#88837a', slab:'#a09a90', metal:'#707a80', ground:'rgba(129,122,107,.23)', wear:'rgba(186,167,130,.13)' },
  6: { body:'#252d33', inner:'#343e45', slab:'#46525b', metal:'#65727b', ground:'rgba(48,59,67,.34)', wear:'rgba(105,138,148,.12)' }
};

export const SUPPORT_POINT_BASE_OFFSET_X = 142;
export const SUPPORT_POINT_MAX_CENTERWARD_EXTENT = 59;
export const SUPPORT_POINT_MIN_CENTER_GAP = SUPPORT_POINT_BASE_OFFSET_X - SUPPORT_POINT_MAX_CENTERWARD_EXTENT;


const SUPPORT_POINT_RASTER_W = 190;
const SUPPORT_POINT_RASTER_H = 120;
const SUPPORT_POINT_RASTER_BASE_X = 240;
const SUPPORT_POINT_RASTER_BASE_Y = 95;
const SUPPORT_POINT_RASTER_CACHE_LIMIT = 72;
const supportPointRasterCache = new Map<string, HTMLCanvasElement>();
let supportPointRasterizing = false;

const getSupportPointRasterKey = (
  faction: FactionConfig,
  visual: SupportPointVisualProfile,
  territoryId: number
) => [
  territoryId,
  faction.tag,
  faction.color,
  visual.score,
  visual.stage,
  visual.stageProgress.toFixed(3),
  visual.tiers.fortification,
  visual.tiers.barricades,
  visual.tiers.riflemen,
  visual.tiers.ammoLogistics
].join('|');

const getSupportPointRaster = (
  faction: FactionConfig,
  visual: SupportPointVisualProfile,
  territoryId: number
): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const key = getSupportPointRasterKey(faction, visual, territoryId);
  const cached = supportPointRasterCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = SUPPORT_POINT_RASTER_W;
  canvas.height = SUPPORT_POINT_RASTER_H;
  const rasterCtx = canvas.getContext('2d');
  if (!rasterCtx) return null;

  supportPointRasterizing = true;
  try {
    // Render once through the authored detailed path. A fixed time keeps the cache deterministic.
    drawSupportPointProgression(
      rasterCtx,
      SUPPORT_POINT_RASTER_BASE_X,
      SUPPORT_POINT_RASTER_BASE_Y,
      faction,
      visual,
      0,
      territoryId,
      1.2
    );
  } finally {
    supportPointRasterizing = false;
  }

  if (supportPointRasterCache.size >= SUPPORT_POINT_RASTER_CACHE_LIMIT) {
    const oldestKey = supportPointRasterCache.keys().next().value as string | undefined;
    if (oldestKey) supportPointRasterCache.delete(oldestKey);
  }
  supportPointRasterCache.set(key, canvas);
  return canvas;
};

const drawCrate = (ctx:CanvasRenderingContext2D,x:number,y:number,accent:string,wideLod:boolean) => {
  ctx.fillStyle='#5d4630';ctx.fillRect(x,y,13,9);
  ctx.strokeStyle='#9d7648';ctx.lineWidth=wideLod?1.2:.8;ctx.strokeRect(x,y,13,9);
  if(!wideLod){ctx.strokeStyle=accent;ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(x+2,y+4.5);ctx.lineTo(x+11,y+4.5);ctx.stroke();ctx.globalAlpha=1;}
};

const drawBarrier = (ctx:CanvasRenderingContext2D,x:number,y:number,w:number,accent:string,tier:number,wideLod:boolean) => {
  ctx.fillStyle='#4d555a';ctx.fillRect(x,y,w,6);
  ctx.strokeStyle='#7c878d';ctx.lineWidth=wideLod?1.4:.9;ctx.strokeRect(x,y,w,6);
  ctx.fillStyle=accent;ctx.globalAlpha=.34;
  for(let xx=x+4;xx<x+w-4;xx+=12)ctx.fillRect(xx,y+1,7,2);
  ctx.globalAlpha=1;
  if(!wideLod && tier>=3){ctx.strokeStyle='rgba(181,192,196,.40)';ctx.beginPath();ctx.moveTo(x+3,y+7);ctx.lineTo(x+8,y+13);ctx.moveTo(x+w-3,y+7);ctx.lineTo(x+w-8,y+13);ctx.stroke();}
};

export function drawSupportPointProgression(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  faction: FactionConfig,
  visual: SupportPointVisualProfile,
  time: number,
  territoryId = 1,
  renderZoom = 1
) {
  const { stage, stageProgress, maturity, tiers } = visual;
  const fortTier = tiers.fortification;
  const barricadeTier = tiers.barricades;
  const riflemenTier = tiers.riflemen;
  const ammoTier = tiers.ammoLogistics;
  const mat = SUPPORT_MATERIALS[territoryId] ?? SUPPORT_MATERIALS[1];

  // At the normal wide camera, reuse a detailed raster instead of rebuilding dozens of paths/text ops every frame.
  if (renderZoom < 1.12 && !supportPointRasterizing) {
    const raster = getSupportPointRaster(faction, visual, territoryId);
    if (raster) {
      ctx.drawImage(
        raster,
        baseX - SUPPORT_POINT_RASTER_BASE_X,
        baseY - SUPPORT_POINT_RASTER_BASE_Y,
        SUPPORT_POINT_RASTER_W,
        SUPPORT_POINT_RASTER_H
      );
      return;
    }
  }
  const wideLod = renderZoom < .92;
  const closeLod = renderZoom >= 1.65;
  const x = baseX - SUPPORT_POINT_BASE_OFFSET_X;
  const y = baseY - 2;
  const wingProgress = getStageFeatureProgress(stage, stageProgress, 2, .28);
  const crownProgress = getStageFeatureProgress(stage, stageProgress, 3, .30);
  const bodyW = 54 + maturity * 10 + stage * 3;
  const bodyH = 25 + maturity * 5 + stage * 1.5;
  const bodyX = x - bodyW / 2;
  const bodyY = y - 9 - bodyH;
  const leftWingW = stage >= 2 ? (12 + 24 * wingProgress) : 0;

  ctx.save();

  // Grounding stays outside the Base spawn corridor: the nearest edge remains >80 world units from center.
  ctx.fillStyle='rgba(0,0,0,.27)';ctx.beginPath();ctx.ellipse(x-5,y+2,48+maturity*5,13+stage*1.5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=mat.ground;ctx.beginPath();ctx.roundRect(bodyX-12-leftWingW,y-14,bodyW+24+leftWingW,27,5);ctx.fill();
  ctx.fillStyle=mat.wear;ctx.beginPath();ctx.ellipse(x-4,y+4,26+maturity*4,7,0,0,Math.PI*2);ctx.fill();

  // E0→E3: the same support house becomes broader, reinforced and eventually operationally crowned.
  ctx.fillStyle=mat.body;ctx.beginPath();ctx.roundRect(bodyX,bodyY,bodyW,bodyH,3);ctx.fill();
  ctx.strokeStyle=wideLod?'rgba(225,214,193,.72)':'rgba(160,148,130,.56)';ctx.lineWidth=wideLod?1.5:1;ctx.stroke();
  ctx.fillStyle=mat.inner;ctx.fillRect(bodyX+4,bodyY+5,bodyW-8,bodyH-9);
  ctx.fillStyle=mat.slab;ctx.fillRect(bodyX-3,bodyY-5,bodyW+6,6);
  ctx.fillStyle='rgba(225,213,190,.13)';ctx.fillRect(bodyX,bodyY-5,bodyW,1.2);

  const doorW=14+Math.min(4,maturity*1.2),doorH=18+Math.min(5,maturity*1.5);
  ctx.fillStyle='#22292c';ctx.fillRect(x-doorW/2,y-9-doorH,doorW,doorH);
  ctx.strokeStyle='rgba(121,137,142,.52)';ctx.strokeRect(x-doorW/2,y-9-doorH,doorW,doorH);
  ctx.fillStyle=faction.color;ctx.globalAlpha=.55;ctx.fillRect(x-doorW/2+2,y-9-doorH+2,doorW-4,2);ctx.globalAlpha=1;

  if(stage>=1){
    const shellProgress=getStageFeatureProgress(stage,stageProgress,1,.35);
    const pierH=(bodyH-9)*shellProgress;
    for(const px of [bodyX+7,bodyX+bodyW-13]){
      ctx.fillStyle=mat.slab;ctx.fillRect(px,bodyY+bodyH-4-pierH,7,pierH);
    }
    const parapetRise=4+4*shellProgress;
    ctx.fillStyle=mat.slab;ctx.fillRect(bodyX-5,bodyY-parapetRise,bodyW+10,4);
    ctx.fillRect(bodyX-5,bodyY-parapetRise,8,parapetRise+4);
    ctx.fillRect(bodyX+bodyW-3,bodyY-parapetRise,8,parapetRise+4);
    ctx.fillStyle=faction.color;ctx.globalAlpha=.22+shellProgress*.12;ctx.fillRect(bodyX+6,bodyY-parapetRise+1,Math.max(12,bodyW-12),1.5);ctx.globalAlpha=1;
    if(!wideLod){
      ctx.fillStyle=mat.metal;ctx.fillRect(x-19,bodyY+bodyH-18,38,4);
      ctx.strokeStyle='rgba(176,185,184,.38)';ctx.beginPath();ctx.moveTo(x-16,bodyY+bodyH-14);ctx.lineTo(x-12,bodyY+bodyH-8);ctx.moveTo(x+16,bodyY+bodyH-14);ctx.lineTo(x+12,bodyY+bodyH-8);ctx.stroke();
    }
  }

  if(stage>=2){
    const wingX=bodyX-leftWingW+2,wingH=18+8*wingProgress,wingY=y-9-wingH;
    ctx.fillStyle=mat.body;ctx.beginPath();ctx.roundRect(wingX,wingY,leftWingW,wingH,2);ctx.fill();
    ctx.strokeStyle='rgba(149,139,124,.52)';ctx.stroke();
    ctx.fillStyle=mat.slab;ctx.fillRect(wingX-2,wingY-3,leftWingW+4,4);
    if(!wideLod){ctx.fillStyle='#1d2428';ctx.fillRect(wingX+5,wingY+6,Math.max(5,leftWingW-10),6);}
  }

  if(stage>=3){
    const crownW=31+10*crownProgress,crownH=9+7*crownProgress;
    const crownX=x-crownW/2,crownY=bodyY-5-crownH;
    ctx.fillStyle=mat.metal;ctx.beginPath();ctx.roundRect(crownX,crownY,crownW,crownH,2);ctx.fill();
    ctx.strokeStyle='rgba(174,185,187,.50)';ctx.stroke();
    ctx.fillStyle='rgba(18,25,29,.62)';ctx.fillRect(crownX+4,crownY+4,crownW-8,4);
    ctx.fillStyle=faction.color;ctx.globalAlpha=.42;ctx.fillRect(crownX+5,crownY+2,crownW-10,2);ctx.globalAlpha=1;
  }

  // Fortification changes the shell itself instead of adding detached clutter.
  if(fortTier>=1){
    const armorH=4+fortTier*.9;
    ctx.fillStyle=fortTier>=4?'#5e5b55':'#686056';
    ctx.fillRect(bodyX-5,bodyY+bodyH-armorH,bodyW+10,armorH);
    if(fortTier>=2){
      for(const px of [bodyX-7,bodyX+bodyW+1]){
        ctx.fillStyle='#59544d';ctx.fillRect(px,bodyY+7,6,bodyH-6);
      }
    }
    if(!wideLod && fortTier>=3){
      ctx.strokeStyle='rgba(188,181,168,.28)';ctx.lineWidth=.7;
      for(let yy=bodyY+10;yy<bodyY+bodyH-5;yy+=6){ctx.beginPath();ctx.moveTo(bodyX-5,yy);ctx.lineTo(bodyX+bodyW+5,yy);ctx.stroke();}
    }
  }

  // Barricades protect only the outer flank; the central reinforcement lane stays visually open.
  if(barricadeTier>=1){
    const barrierW=25+Math.min(18,barricadeTier*3.5);
    drawBarrier(ctx,bodyX-18-barrierW,y-5,barrierW,faction.color,barricadeTier,wideLod);
    if(barricadeTier>=4)drawBarrier(ctx,bodyX-12,y+5,Math.min(28,bodyW*.38),faction.color,barricadeTier,wideLod);
  }

  // Riflemen read as a prepared observation/firing position, never as fake combat units.
  if(riflemenTier>=1){
    const postX=bodyX+bodyW-24,postY=bodyY-10-(riflemenTier>=4?5:0);
    ctx.fillStyle='#30383d';ctx.fillRect(postX,postY,20,10+(riflemenTier>=4?5:0));
    ctx.strokeStyle='rgba(139,153,158,.56)';ctx.strokeRect(postX,postY,20,10+(riflemenTier>=4?5:0));
    ctx.fillStyle='rgba(12,18,21,.72)';ctx.fillRect(postX+4,postY+4,12,3);
    if(!wideLod){
      const marks=Math.min(3,riflemenTier);
      ctx.strokeStyle='#20272a';ctx.lineWidth=1.3;
      for(let i=0;i<marks;i++){ctx.beginPath();ctx.moveTo(postX+5+i*5,postY+9);ctx.lineTo(postX+8+i*5,postY-4);ctx.stroke();}
    }
    if(riflemenTier>=5){ctx.fillStyle=faction.color;ctx.globalAlpha=.34;ctx.fillRect(postX+2,postY+1,16,2);ctx.globalAlpha=1;}
  }

  // Ammo logistics occupies the service wing and grows from a couple of crates into a secured rack.
  if(ammoTier>=1){
    const rackX=bodyX-8-leftWingW,rackY=y-23;
    drawCrate(ctx,rackX,rackY,faction.color,wideLod);
    if(ammoTier>=2)drawCrate(ctx,rackX+14,rackY+2,faction.color,wideLod);
    if(ammoTier>=3){
      ctx.fillStyle='#262e31';ctx.fillRect(rackX-3,rackY-8,33,6);
      ctx.strokeStyle='rgba(130,144,148,.48)';ctx.strokeRect(rackX-3,rackY-8,33,6);
    }
    if(ammoTier>=4)drawCrate(ctx,rackX,rackY-17,faction.color,wideLod);
    if(ammoTier>=5){ctx.fillStyle=faction.color;ctx.globalAlpha=.28;ctx.fillRect(rackX-1,rackY-10,29,2);ctx.globalAlpha=1;}
  }

  // Ownership is architectural signage, not a colored floor zone.
  const signW=Math.min(bodyW-14,48+maturity*2);
  ctx.fillStyle='rgba(20,24,25,.82)';ctx.beginPath();ctx.roundRect(x-signW/2,bodyY+7,signW,9,2);ctx.fill();
  ctx.fillStyle=faction.color;ctx.fillRect(x-signW/2+2,bodyY+8,3,7);
  if(!wideLod){
    ctx.fillStyle='#e8e1d5';ctx.font='800 6px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('PONTO DE APOIO',x+2,bodyY+11.5);
  }

  const lampPulse=.72+.18*Math.sin(time*.004);
  ctx.fillStyle=faction.color;ctx.globalAlpha=.28*lampPulse;ctx.beginPath();ctx.arc(bodyX+bodyW-7,bodyY+4,5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='#f4d98b';ctx.beginPath();ctx.arc(bodyX+bodyW-7,bodyY+4,1.6,0,Math.PI*2);ctx.fill();

  if(closeLod){
    ctx.strokeStyle='rgba(225,214,194,.13)';ctx.lineWidth=.7;
    for(let yy=bodyY+20;yy<bodyY+bodyH-5;yy+=10){ctx.beginPath();ctx.moveTo(bodyX+6,yy);ctx.lineTo(bodyX+bodyW-6,yy);ctx.stroke();}
    ctx.strokeStyle='rgba(92,105,109,.45)';ctx.beginPath();ctx.moveTo(bodyX+10,bodyY+3);ctx.lineTo(bodyX+10,bodyY-10);ctx.lineTo(bodyX+24,bodyY-10);ctx.stroke();
    ctx.fillStyle='rgba(217,204,183,.50)';ctx.beginPath();ctx.arc(x+doorW/2-3,y-18,1.1,0,Math.PI*2);ctx.fill();
  }

  // Tiny faction plate survives wide zoom without turning the whole structure into team color.
  ctx.fillStyle='#171c1f';ctx.fillRect(bodyX+5,bodyY+bodyH-10,15,7);
  ctx.fillStyle=faction.color;ctx.fillRect(bodyX+6,bodyY+bodyH-9,13,5);
  ctx.fillStyle='#fff';ctx.font='900 5px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(faction.tag,bodyX+12.5,bodyY+bodyH-6.4);

  // Defensive modules never cross toward the Base center; geometry is covered by the exported gap invariant.

  ctx.restore();
}
