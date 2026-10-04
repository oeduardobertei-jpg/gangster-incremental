export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 720;
// 0.9.9-camera: keep tactical zoom useful instead of allowing a tiny 35% battlefield.
// Close inspection now reaches 350%; controlled overscan keeps edge navigation from feeling hard-clamped.
export const CAMERA_MIN_ZOOM = 0.80;
export const CAMERA_MAX_ZOOM = 3.5;
const CAMERA_MAX_OVERSCAN_PX = 220;

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
  centerY: WORLD_HEIGHT / 2,
  zoom: 1
});

export function clampZoom(zoom: number): number {
  return Math.min(CAMERA_MAX_ZOOM, Math.max(CAMERA_MIN_ZOOM, zoom));
}

function getPanOverscanPx(zoom: number): number {
  if (zoom <= 1) return 0;
  const t = Math.min(1, Math.max(0, (zoom - 1) / (CAMERA_MAX_ZOOM - 1)));
  // Smooth growth: no leak at 100%, generous movement at tactical close zoom.
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
