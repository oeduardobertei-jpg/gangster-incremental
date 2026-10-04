import type { TacticalBuilding } from './favelaRenderer';

const drawReadabilityBreathing = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.save();
  // Negative-space pockets keep mass combat readable without flattening the whole map.
  const zones = [
    [.50, .50, width * .12, height * .16],
    [.50, .70, width * .10, height * .10],
    [.50, .29, width * .09, height * .09]
  ] as const;
  for (const [nx, ny, rx, ry] of zones) {
    const g = ctx.createRadialGradient(width * nx, height * ny, 2, width * nx, height * ny, Math.max(rx, ry));
    g.addColorStop(0, 'rgba(4,8,12,.10)');
    g.addColorStop(.58, 'rgba(4,8,12,.045)');
    g.addColorStop(1, 'rgba(4,8,12,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(width * nx, height * ny, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

const drawGroundGrade = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.save();
  const edge = ctx.createRadialGradient(
    width * .50, height * .52, Math.min(width, height) * .16,
    width * .50, height * .52, Math.max(width, height) * .67
  );
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(.70, 'rgba(8,16,23,.018)');
  edge.addColorStop(1, 'rgba(8,16,23,.085)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, width, height);

  const warm = ctx.createLinearGradient(0, 0, width, height);
  warm.addColorStop(0, 'rgba(154,83,39,.020)');
  warm.addColorStop(.48, 'rgba(0,0,0,0)');
  warm.addColorStop(1, 'rgba(15,45,55,.018)');
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

/**
 * Final static grade inherited from 1.0 GOLD.
 * 1.1A removed historical helpers that were no longer called by this pass.
 */
export function drawT1GoldFoundation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  _buildings: readonly TacticalBuilding[],
  _controlColor: string
) {
  if (territoryId !== 1) return;
  drawReadabilityBreathing(ctx, width, height);
  drawGroundGrade(ctx, width, height);
}