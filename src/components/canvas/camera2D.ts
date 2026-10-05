export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 720;
// 1.1E Camera 2.0: useful tactical range without turning the canvas into pixel inspection.
export const CAMERA_MIN_ZOOM = 0.78;
export const CAMERA_DEFAULT_ZOOM = 0.94;
export const CAMERA_MAX_ZOOM = 2.35;
const CAMERA_MAX_OVERSCAN_PX = 150;

export interface ViewportSize {
  width: number;
  height: number;
}

export interface Camera2D {
  centerX: number;
  centerY: number;
  zoom: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface WorldPoint {
  x: number;
  y: number;
}

export const createDefaultCamera = (): Camera2D => ({
  centerX: WORLD_WIDTH / 2,
  // A slight upward world bias leaves more breathing room below top-left HUD overlays.
  centerY: WORLD_HEIGHT / 2 - 10,
  zoom: CAMERA_DEFAULT_ZOOM
});


// 1.2 T1-R: authored first impression. Other districts keep the GOLD framing.
export const createTerritoryCamera = (territoryId: number): Camera2D => territoryId === 1 ? ({
  centerX: WORLD_WIDTH / 2,
  centerY: WORLD_HEIGHT / 2 - 12,
  zoom: 1.04
}) : createDefaultCamera();

export function clampZoom(zoom: number): number {
  return Math.min(CAMERA_MAX_ZOOM, Math.max(CAMERA_MIN_ZOOM, zoom));
}

/** Perceptual button step: equal-feeling increments at wide and close zoom. */
export function stepCameraZoom(zoom: number, direction: -1 | 1): number {
  const factor = direction > 0 ? 1.12 : 1 / 1.12;
  return clampZoom(Number((zoom * factor).toFixed(3)));
}

/** Continuous wheel/trackpad curve, capped so a single noisy wheel event cannot jump the scene. */
export function zoomFromWheelDelta(zoom: number, deltaY: number): number {
  const exponent = Math.max(-.18, Math.min(.18, -deltaY * .0012));
  return clampZoom(Number((zoom * Math.exp(exponent)).toFixed(3)));
}

function getPanOverscanPx(zoom: number): number {
  if (zoom <= 1.05) return 0;
  const t = Math.min(1, Math.max(0, (zoom - 1.05) / (CAMERA_MAX_ZOOM - 1.05)));
  // Smooth growth starts only after close inspection begins. Camera edges stay grounded near 100%.
  const eased = t * t * (3 - 2 * t);
  return CAMERA_MAX_OVERSCAN_PX * eased;
}

export function fitCameraToWorld(viewport: ViewportSize, padding = 24): Camera2D {
  const usableWidth = Math.max(1, viewport.width - padding * 2);
  const usableHeight = Math.max(1, viewport.height - padding * 2);
  const fitZoom = clampZoom(Math.min(usableWidth / WORLD_WIDTH, usableHeight / WORLD_HEIGHT));
  return clampCamera({ centerX: WORLD_WIDTH / 2, centerY: WORLD_HEIGHT / 2, zoom: fitZoom }, viewport);
}

export function clampCamera(camera: Camera2D, viewport: ViewportSize): Camera2D {
  const zoom = clampZoom(camera.zoom);
  const halfVisibleW = viewport.width > 0 ? viewport.width / (2 * zoom) : WORLD_WIDTH / 2;
  const halfVisibleH = viewport.height > 0 ? viewport.height / (2 * zoom) : WORLD_HEIGHT / 2;
  const overscanWorld = getPanOverscanPx(zoom) / zoom;

  // At close zoom, allow a controlled amount of empty-space overscan so edge content
  // can be pulled away from HUD/minimap overlays instead of feeling hard-clamped.
  const minCenterX = halfVisibleW - overscanWorld;
  const maxCenterX = WORLD_WIDTH - halfVisibleW + overscanWorld;
  const minCenterY = halfVisibleH - overscanWorld;
  const maxCenterY = WORLD_HEIGHT - halfVisibleH + overscanWorld;

  const centerX = halfVisibleW >= WORLD_WIDTH / 2
    ? WORLD_WIDTH / 2
    : Math.min(maxCenterX, Math.max(minCenterX, camera.centerX));
  const centerY = halfVisibleH >= WORLD_HEIGHT / 2
    ? WORLD_HEIGHT / 2
    : Math.min(maxCenterY, Math.max(minCenterY, camera.centerY));

  return { centerX, centerY, zoom };
}

export function screenToWorld(point: ScreenPoint, camera: Camera2D, viewport: ViewportSize): WorldPoint {
  return {
    x: camera.centerX + (point.x - viewport.width / 2) / camera.zoom,
    y: camera.centerY + (point.y - viewport.height / 2) / camera.zoom
  };
}

export function worldToScreen(point: WorldPoint, camera: Camera2D, viewport: ViewportSize): ScreenPoint {
  return {
    x: viewport.width / 2 + (point.x - camera.centerX) * camera.zoom,
    y: viewport.height / 2 + (point.y - camera.centerY) * camera.zoom
  };
}

export function panCameraByScreenDelta(
  start: Camera2D,
  deltaX: number,
  deltaY: number,
  viewport: ViewportSize
): Camera2D {
  return clampCamera({
    ...start,
    centerX: start.centerX - deltaX / start.zoom,
    centerY: start.centerY - deltaY / start.zoom
  }, viewport);
}

export function zoomCameraAtScreenPoint(
  camera: Camera2D,
  nextZoom: number,
  anchor: ScreenPoint,
  viewport: ViewportSize
): Camera2D {
  const before = screenToWorld(anchor, camera, viewport);
  const zoom = clampZoom(nextZoom);
  const proposed: Camera2D = { ...camera, zoom };
  const after = screenToWorld(anchor, proposed, viewport);

  return clampCamera({
    ...proposed,
    centerX: proposed.centerX + (before.x - after.x),
    centerY: proposed.centerY + (before.y - after.y)
  }, viewport);
}
