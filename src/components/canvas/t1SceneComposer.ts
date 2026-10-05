import type { TacticalBuilding } from './favelaRenderer';
import { drawT1HeroLandmarkFoundation } from './t1HeroLandmarkRenderer';
import { drawT1GoldFoundation } from './t1GoldFoundationRenderer';
import { drawT1GoldOverlay } from './t1GoldOverlayRenderer';
import { drawT1BeautyCoherence } from './t1BeautyCoherenceRenderer';
import {
  drawT1ForegroundFraming,
  drawT1CharacterGrounding,
  drawT1LandmarkReadability,
  drawT1MicroBeauty
} from './t1FinalPolishRenderer';


/**
 * 1.1A compositor boundary for T1.
 *
 * The order below intentionally matches the 1.0.0 GOLD render order. 1.1 can now
 * replace or retire individual passes without growing GameCanvas or silently
 * changing layer order.
 */
export function drawT1StaticComposition(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  buildings: readonly TacticalBuilding[],
  controlColor: string
) {
  if (territoryId !== 1) return;
  drawT1HeroLandmarkFoundation(ctx, width, height, territoryId, buildings, controlColor);
  drawT1GoldFoundation(ctx, width, height, territoryId, buildings, controlColor);
  drawT1BeautyCoherence(ctx, territoryId, buildings);
  drawT1ForegroundFraming(ctx, width, height, territoryId, buildings);
}

export function drawT1PreWorldOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  time: number,
  controlColor: string,
  renderZoom: number
) {
  if (territoryId !== 1) return;
  drawT1GoldOverlay(ctx, width, height, territoryId, time, controlColor, renderZoom);
}

export function drawT1ReadabilityOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  buildings: readonly TacticalBuilding[],
  time: number,
  renderZoom: number
) {
  if (territoryId !== 1) return;
  drawT1LandmarkReadability(ctx, width, height, territoryId, buildings, renderZoom);
  drawT1MicroBeauty(ctx, width, height, territoryId, time, renderZoom);
}

export function drawT1UnitGrounding(
  ctx: CanvasRenderingContext2D,
  territoryId: number,
  x: number,
  y: number,
  radius: number,
  isRival: boolean,
  time: number,
  renderZoom: number,
  factionColor?: string
) {
  if (territoryId !== 1) return;
  drawT1CharacterGrounding(ctx, territoryId, x, y, radius, isRival, time, renderZoom, factionColor);
}