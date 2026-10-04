import { getTerritoryAtmosphereProfile } from '../../data/territoryAtmospheres';
import type { TacticalBuilding } from './favelaRenderer';

export interface AtmosphereVisibleRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const colorWithAlpha = (color: string, alpha: number) => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const scaleRgbaAlpha = (rgba: string, scale: number) => rgba.replace(
  /rgba\(([^,]+),([^,]+),([^,]+),\s*([\d.]+)\)/,
  (_m, r, g, b, a) => `rgba(${r},${g},${b},${Math.min(1, Number(a) * scale)})`
);

const seeded = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const practicalLights: Record<number, readonly [number, number, string, number][]> = {
  1: [[.17,.20,'#f59e0b',88],[.31,.37,'#f59e0b',72],[.68,.28,'#f59e0b',80],[.83,.51,'#fb923c',74],[.30,.72,'#f59e0b',68],[.67,.76,'#fb923c',86]],
  2: [[.50,.20,'#facc15',150],[.79,.235,'#ef4444',50]],
  3: [[.73,.61,'#fb923c',90],[.24,.22,'#f97316',64]],
  4: [[.83,.13,'#ef4444',82],[.10,.18,'#f59e0b',62]],
  5: [[.315,.24,'#38bdf8',90],[.69,.71,'#a78bfa',86]],
  6: [[.50,.31,'#f43f5e',96],[.50,.54,'#f43f5e',96],[.50,.78,'#f43f5e',96]]
};

const shadowVector = (territoryId: number) => {
  if (territoryId === 3) return { x: 16, y: 15 };
  if (territoryId === 4) return { x: 13, y: 17 };
  if (territoryId === 5) return { x: 9, y: 13 };
  if (territoryId === 6) return { x: 15, y: 18 };
  return { x: 11, y: 14 };
};

const radialLight = (
  ctx: CanvasRenderingContext2D, x: number, y: number,
  radius: number, color: string, alpha: number
) => {
  const gradient = ctx.createRadialGradient(x, y, 1, x, y, radius);
  gradient.addColorStop(0, colorWithAlpha(color, alpha));
  gradient.addColorStop(.38, colorWithAlpha(color, alpha * .34));
  gradient.addColorStop(1, colorWithAlpha(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
};
export function drawTerritoryAtmosphereFoundation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  controlColor: string,
  buildings: readonly TacticalBuilding[]
) {
  const profile = getTerritoryAtmosphereProfile(territoryId);
  const shadow = shadowVector(territoryId);
  ctx.save();

  // Faint projected shadows stay in the cached layer: depth without per-frame cost.
  ctx.save();
  ctx.filter = 'blur(2px)';
  ctx.fillStyle = `rgba(0,0,0,${territoryId===1 ? .070 + profile.shadowStrength*.070 : .045 + profile.shadowStrength*.055})`;
  for (const b of buildings) {
    const x = b.x - 3, y = b.y - 3, w = b.w + 6, h = b.h + 6;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w + shadow.x, y + h + shadow.y);
    ctx.lineTo(x + shadow.x, y + h + shadow.y);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Ambient tone is deliberately subtle; combat colors remain untouched later in the pipeline.
  ctx.fillStyle = scaleRgbaAlpha(profile.ambientLight, .16);
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = scaleRgbaAlpha(profile.streetTint, .30);
  ctx.fillRect(0, 0, width, height);
  if (territoryId === 1) {
    const night=ctx.createLinearGradient(0,0,width,height);
    night.addColorStop(0,'rgba(28,45,61,.035)');
    night.addColorStop(.52,'rgba(8,15,24,.012)');
    night.addColorStop(1,'rgba(4,9,15,.065)');
    ctx.fillStyle=night;ctx.fillRect(0,0,width,height);
  }

  for (const [nx, ny, color, radius] of practicalLights[territoryId] ?? []) {
    const resolved = territoryId === 6 ? controlColor : color;
    const lightAlpha=territoryId===1 ? .050 + profile.hazeAmount*.024 : .035 + profile.hazeAmount*.025;
    radialLight(ctx, width * nx, height * ny, radius, resolved, lightAlpha);
  }
  ctx.restore();
}
const inVisibleRect = (x: number, y: number, r: number, visible: AtmosphereVisibleRect) =>
  x + r >= visible.left && x - r <= visible.right &&
  y + r >= visible.top && y - r <= visible.bottom;

const drawIndustrialPlume = (
  ctx:CanvasRenderingContext2D,x:number,y:number,time:number,index:number,alpha:number
) => {
  for(let p=0;p<3;p++){
    const rise=((time*.010 + index*29 + p*23)%72);
    const px=x+Math.sin(time*.0015+index+p)*7;
    const py=y-rise;
    ctx.fillStyle=`rgba(148,163,184,${alpha*(1-rise/80)})`;
    ctx.beginPath();ctx.arc(px,py,7+p*2+rise*.08,0,Math.PI*2);ctx.fill();
  }
};

export function drawTerritoryAtmosphereUnderlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  time: number,
  controlColor: string,
  visible: AtmosphereVisibleRect
) {
  const profile = getTerritoryAtmosphereProfile(territoryId);
  const count = Math.min(24, Math.max(4, Math.round(5 + profile.particleDensity * 13)));
  ctx.save();
  for (let i = 0; i < count; i++) {
    const sx = seeded(territoryId * 101 + i * 17);
    const sy = seeded(territoryId * 211 + i * 31);
    const speed = 5 + seeded(i * 43 + territoryId) * 11;
    const x = (sx * width + time * .001 * speed * (i % 2 ? 1 : -1) + width) % width;
    const y = sy * height + Math.sin(time * .0012 + i * 1.7) * (3 + profile.hazeAmount * 5);
    if (!inVisibleRect(x, y, 24, visible)) continue;

    if (territoryId === 1) {
      ctx.fillStyle = i % 4 === 0 ? 'rgba(226,232,240,.12)' : 'rgba(214,180,132,.08)';
      ctx.fillRect(x, y, i % 4 === 0 ? 5 : 2, i % 4 === 0 ? 2 : 2);
    } else if (territoryId === 2) {
      ctx.fillStyle = i % 5 === 0 ? 'rgba(250,204,21,.10)' : 'rgba(203,213,225,.07)';
      ctx.beginPath();ctx.arc(x,y,1.2 + (i%3)*.6,0,Math.PI*2);ctx.fill();
    } else if (territoryId === 3) {
      ctx.fillStyle='rgba(120,113,108,.08)';ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,Math.PI*2);ctx.fill();
    } else if (territoryId === 4) {
      ctx.strokeStyle='rgba(202,138,82,.10)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x-8,y);ctx.lineTo(x+8,y+2);ctx.stroke();
    } else if (territoryId === 5) {
      ctx.fillStyle='rgba(186,230,253,.08)';ctx.beginPath();ctx.arc(x,y,1+(i%2),0,Math.PI*2);ctx.fill();
    } else {
      ctx.fillStyle=colorWithAlpha(controlColor,.055);ctx.beginPath();ctx.arc(x,y,1.2+(i%2),0,Math.PI*2);ctx.fill();
    }
  }
  if (territoryId === 3) {
    for (const [index, nx, ny] of [[0,.16,.31],[1,.82,.21],[2,.79,.69]] as const) {
      const x=width*nx,y=height*ny;
      if (inVisibleRect(x,y,90,visible)) drawIndustrialPlume(ctx,x,y,time,index,.052+.025*profile.hazeAmount);
    }
  } else if (territoryId === 5) {
    const mist = ctx.createLinearGradient(0,height*.18,0,height*.82);
    mist.addColorStop(0,'rgba(125,211,252,0)');
    mist.addColorStop(.5,`rgba(125,211,252,${.012+.012*profile.hazeAmount})`);
    mist.addColorStop(1,'rgba(125,211,252,0)');
    ctx.fillStyle=mist;ctx.fillRect(Math.max(0,visible.left),height*.18,Math.min(width,visible.right)-Math.max(0,visible.left),height*.64);
  } else if (territoryId === 6) {
    const pulse=.5+.5*Math.sin(time*.0024);
    ctx.strokeStyle=colorWithAlpha(controlColor,.035+.025*pulse);ctx.lineWidth=1;
    for(const x of [width*.39,width*.61]){ctx.beginPath();ctx.moveTo(x,height*.24);ctx.lineTo(x,height*.88);ctx.stroke();}
  }

  ctx.restore();
}
