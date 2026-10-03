export const segmentCircleHitT = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  radius: number
): number | null => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;
  const a = dx * dx + dy * dy;
  if (a <= Number.EPSILON) {
    return fx * fx + fy * fy <= radius * radius ? 0 : null;
  }

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;

  const root = Math.sqrt(discriminant);
  const t1 = (-b - root) / (2 * a);
  const t2 = (-b + root) / (2 * a);
  if (t1 >= 0 && t1 <= 1) return t1;
  if (t2 >= 0 && t2 <= 1) return t2;
  return null;
};

export const segmentAabbHitT = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): number | null => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;

  const clipAxis = (start: number, delta: number, min: number, max: number): boolean => {
    if (Math.abs(delta) <= Number.EPSILON) return start >= min && start <= max;
    const inv = 1 / delta;
    let t1 = (min - start) * inv;
    let t2 = (max - start) * inv;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    return tMin <= tMax;
  };

  if (!clipAxis(x1, dx, minX, maxX)) return null;
  if (!clipAxis(y1, dy, minY, maxY)) return null;
  return tMin >= 0 && tMin <= 1 ? tMin : null;
};

export interface WorldCollider {
  id: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  blocksMovement: boolean;
  blocksProjectiles: boolean;
  kind: 'building' | 'wall' | 'barrier' | 'cover' | 'fence';
  material?: 'concrete' | 'brick' | 'metal' | 'glass' | 'mixed';
}

export interface CircleMotionResult {
  x: number;
  y: number;
  hitX: boolean;
  hitY: boolean;
}

const circleIntersectsExpandedAabb = (
  x: number, y: number, radius: number, collider: WorldCollider
) => x > collider.minX - radius + 0.001 && x < collider.maxX + radius - 0.001 &&
  y > collider.minY - radius + 0.001 && y < collider.maxY + radius - 0.001;

export const resolveCircleMotionAgainstWorld = (
  x: number,
  y: number,
  radius: number,
  deltaX: number,
  deltaY: number,
  colliders: readonly WorldCollider[]
): CircleMotionResult => {
  let nextX = x;
  let nextY = y;
  let hitX = false;
  let hitY = false;

  if (Math.abs(deltaX) > Number.EPSILON) {
    const candidateX = x + deltaX;
    nextX = candidateX;
    for (const collider of colliders) {
      if (!collider.blocksMovement || !circleIntersectsExpandedAabb(nextX, y, radius, collider)) continue;
      const expandedMinX = collider.minX - radius;
      const expandedMaxX = collider.maxX + radius;
      nextX = deltaX > 0 ? Math.min(nextX, expandedMinX) : Math.max(nextX, expandedMaxX);
      hitX = true;
    }
  }

  if (Math.abs(deltaY) > Number.EPSILON) {
    const candidateY = y + deltaY;
    nextY = candidateY;
    for (const collider of colliders) {
      if (!collider.blocksMovement || !circleIntersectsExpandedAabb(nextX, nextY, radius, collider)) continue;
      const expandedMinY = collider.minY - radius;
      const expandedMaxY = collider.maxY + radius;
      nextY = deltaY > 0 ? Math.min(nextY, expandedMinY) : Math.max(nextY, expandedMaxY);
      hitY = true;
    }
  }

  // Zero-motion calls sanitize legacy/restored entities. Moving calls normally need
  // no extra work, but when an axis collision happened the clamp can occasionally
  // place the circle inside an overlapping neighbour collider (e.g. wall + building).
  // Run a tiny iterative ejection only in those exceptional cases.
  const zeroMotion = Math.abs(deltaX) <= Number.EPSILON && Math.abs(deltaY) <= Number.EPSILON;
  if (zeroMotion || hitX || hitY) {
    const passes = zeroMotion ? 4 : 2;
    for (let pass = 0; pass < passes; pass++) {
      let adjusted = false;
      for (const collider of colliders) {
        if (!collider.blocksMovement || !circleIntersectsExpandedAabb(nextX, nextY, radius, collider)) continue;
        const left = Math.abs(nextX - (collider.minX - radius));
        const right = Math.abs((collider.maxX + radius) - nextX);
        const top = Math.abs(nextY - (collider.minY - radius));
        const bottom = Math.abs((collider.maxY + radius) - nextY);
        const smallest = Math.min(left, right, top, bottom);
        if (smallest === left) { nextX = collider.minX - radius; hitX = true; }
        else if (smallest === right) { nextX = collider.maxX + radius; hitX = true; }
        else if (smallest === top) { nextY = collider.minY - radius; hitY = true; }
        else { nextY = collider.maxY + radius; hitY = true; }
        adjusted = true;
      }
      if (!adjusted) break;
    }
  }

  return { x: nextX, y: nextY, hitX, hitY };
};

export const pointHasWorldClearance = (
  x: number,
  y: number,
  radius: number,
  colliders: readonly WorldCollider[]
): boolean => !colliders.some(collider => collider.blocksMovement && circleIntersectsExpandedAabb(x, y, radius, collider));

export const segmentWorldHit = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
  colliders: readonly WorldCollider[]
): { t: number; collider: WorldCollider } | null => {
  let closest: { t: number; collider: WorldCollider } | null = null;
  for (const collider of colliders) {
    if (!collider.blocksProjectiles) continue;
    const t = segmentAabbHitT(
      x1, y1, x2, y2,
      collider.minX - radius, collider.minY - radius,
      collider.maxX + radius, collider.maxY + radius
    );
    if (t !== null && (closest === null || t < closest.t)) closest = { t, collider };
  }
  return closest;
};

export const steerVelocityAroundWorld = (
  x: number,
  y: number,
  radius: number,
  vx: number,
  vy: number,
  colliders: readonly WorldCollider[],
  biasSeed = 0
): { vx: number; vy: number } => {
  const speed = Math.hypot(vx, vy);
  if (speed <= 0.02) return { vx, vy };

  const nx = vx / speed;
  const ny = vy / speed;
  const probeDistance = Math.max(radius * 2.4, Math.min(38, 18 + speed * 8));
  const probeX = x + nx * probeDistance;
  const probeY = y + ny * probeDistance;

  let blocking: WorldCollider | null = null;
  let blockingScore = Number.POSITIVE_INFINITY;
  for (const collider of colliders) {
    if (!collider.blocksMovement || !circleIntersectsExpandedAabb(probeX, probeY, radius + 3, collider)) continue;
    const cx = (collider.minX + collider.maxX) / 2;
    const cy = (collider.minY + collider.maxY) / 2;
    const score = (cx - x) * (cx - x) + (cy - y) * (cy - y);
    if (score < blockingScore) { blocking = collider; blockingScore = score; }
  }
  if (!blocking) return { vx, vy };

  const centerX = (blocking.minX + blocking.maxX) / 2;
  const centerY = (blocking.minY + blocking.maxY) / 2;
  const cross = nx * (centerY - y) - ny * (centerX - x);
  const side = Math.abs(cross) > 0.04 ? (cross > 0 ? -1 : 1) : (biasSeed % 2 === 0 ? 1 : -1);
  const tangentX = -ny * side;
  const tangentY = nx * side;

  // Keep part of the original intent so the unit rounds corners instead of orbiting them.
  const blend = 0.78;
  let steeredX = nx * (1 - blend) + tangentX * blend;
  let steeredY = ny * (1 - blend) + tangentY * blend;
  const length = Math.hypot(steeredX, steeredY) || 1;
  steeredX /= length;
  steeredY /= length;
  return { vx: steeredX * speed, vy: steeredY * speed };
};
