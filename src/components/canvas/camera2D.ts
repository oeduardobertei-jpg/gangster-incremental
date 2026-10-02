export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 720;
export const CAMERA_MIN_ZOOM = 0.35;
export const CAMERA_MAX_ZOOM = 2.5;

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

  const centerX = halfVisibleW >= WORLD_WIDTH / 2
    ? WORLD_WIDTH / 2
    : Math.min(WORLD_WIDTH - halfVisibleW, Math.max(halfVisibleW, camera.centerX));
  const centerY = halfVisibleH >= WORLD_HEIGHT / 2
    ? WORLD_HEIGHT / 2
    : Math.min(WORLD_HEIGHT - halfVisibleH, Math.max(halfVisibleH, camera.centerY));

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
