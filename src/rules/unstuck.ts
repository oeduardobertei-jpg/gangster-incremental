import { pointHasWorldClearance, WorldCollider } from './collision';

export interface UnstuckMover {
  x: number; y: number; vx: number; vy: number; radius: number; speed: number;
  stuckTimer?: number; stuckSampleX?: number; stuckSampleY?: number;
  unstuckTimer?: number; unstuckTargetX?: number; unstuckTargetY?: number;
  unstuckCooldown?: number; unstuckAttempts?: number;
}

export interface CrowdPoint { x: number; y: number; radius: number; hp?: number; }

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const crowdPenaltyAt = (x: number, y: number, crowd: readonly CrowdPoint[], self: UnstuckMover) => {
  let penalty = 0;
  // Large battles only need a representative crowd sample for escape scoring.
  // This keeps 135+ unit stress cases from turning rare unstuck events into O(N²) spikes.
  const stride = crowd.length > 90 ? 4 : crowd.length > 50 ? 2 : 1;
  for (let i = 0; i < crowd.length; i += stride) {
    const other = crowd[i];
    if (other === self || other.hp === 0) continue;
    const dx = x - other.x, dy = y - other.y;
    const desired = self.radius + other.radius + 12;
    if (dx * dx + dy * dy >= desired * desired) continue;
    const distance = Math.hypot(dx, dy);
    penalty += (desired - distance) * 2.4 * stride;
  }
  return penalty;
};

const chooseEscapeTarget = (
  mover: UnstuckMover, intentX: number, intentY: number,
  colliders: readonly WorldCollider[], crowd: readonly CrowdPoint[],
  worldWidth: number, worldHeight: number, seed: number
) => {
  const intentLength = Math.hypot(intentX, intentY) || 1;
  const goalX = intentX / intentLength;
  const goalY = intentY / intentLength;
  let best: { x: number; y: number; score: number } | null = null;
  const rings = [44, 74];
  const directions = 10;

  for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
    const distance = rings[ringIndex];
    for (let step = 0; step < directions; step++) {
      const angle = ((step + seed * 3) % directions) * Math.PI * 2 / directions;
      const dirX = Math.cos(angle), dirY = Math.sin(angle);
      const x = clamp(mover.x + dirX * distance, mover.radius + 6, worldWidth - mover.radius - 6);
      const y = clamp(mover.y + dirY * distance, mover.radius + 6, worldHeight - mover.radius - 6);
      if (!pointHasWorldClearance(x, y, mover.radius + 5, colliders)) continue;
      const progress = (dirX * goalX + dirY * goalY) * 34;
      const sideStep = Math.abs(dirX * goalY - dirY * goalX) * 9;
      const crowdPenalty = crowdPenaltyAt(x, y, crowd, mover);
      const score = progress + sideStep + ringIndex * 2 - crowdPenalty;
      if (!best || score > best.score) best = { x, y, score };
    }
  }
  return best;
};

export const applyUnstuckNavigation = (
  mover: UnstuckMover, intentVx: number, intentVy: number, dt: number,
  colliders: readonly WorldCollider[], crowd: readonly CrowdPoint[],
  worldWidth: number, worldHeight: number, seed: number
): { vx: number; vy: number; triggered: boolean; hardTriggered: boolean } => {
  mover.unstuckCooldown = Math.max(0, (mover.unstuckCooldown ?? 0) - dt);

  if ((mover.unstuckTimer ?? 0) > 0 && mover.unstuckTargetX !== undefined && mover.unstuckTargetY !== undefined) {
    mover.unstuckTimer = Math.max(0, (mover.unstuckTimer ?? 0) - dt);
    const dx = mover.unstuckTargetX - mover.x;
    const dy = mover.unstuckTargetY - mover.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 7 && mover.unstuckTimer > 0) {
      const speed = Math.max(mover.speed * 1.08, Math.hypot(intentVx, intentVy));
      return { vx: dx / distance * speed, vy: dy / distance * speed, triggered: false, hardTriggered: false };
    }
    mover.unstuckTimer = 0;
    mover.unstuckTargetX = undefined;
    mover.unstuckTargetY = undefined;
  }

  const intentSpeed = Math.hypot(intentVx, intentVy);
  if (intentSpeed < mover.speed * 0.18) {
    mover.stuckTimer = 0; mover.stuckSampleX = mover.x; mover.stuckSampleY = mover.y;
    return { vx: intentVx, vy: intentVy, triggered: false, hardTriggered: false };
  }

  if (mover.stuckSampleX === undefined || mover.stuckSampleY === undefined) {
    mover.stuckSampleX = mover.x; mover.stuckSampleY = mover.y; mover.stuckTimer = 0;
  }
  const progress = Math.hypot(mover.x - mover.stuckSampleX, mover.y - mover.stuckSampleY);
  if (progress >= 8) {
    mover.stuckSampleX = mover.x; mover.stuckSampleY = mover.y; mover.stuckTimer = 0; mover.unstuckAttempts = 0;
    return { vx: intentVx, vy: intentVy, triggered: false, hardTriggered: false };
  }

  mover.stuckTimer = (mover.stuckTimer ?? 0) + dt;
  if (mover.stuckTimer < 0.56 || (mover.unstuckCooldown ?? 0) > 0) return { vx: intentVx, vy: intentVy, triggered: false, hardTriggered: false };
  const escape = chooseEscapeTarget(mover, intentVx, intentVy, colliders, crowd, worldWidth, worldHeight, seed);
  mover.stuckTimer = 0;
  mover.stuckSampleX = mover.x;
  mover.stuckSampleY = mover.y;
  mover.unstuckCooldown = 1.05;
  if (!escape) return { vx: intentVx, vy: intentVy, triggered: false, hardTriggered: false };

  mover.unstuckAttempts = (mover.unstuckAttempts ?? 0) + 1;
  if (mover.unstuckAttempts >= 3) {
    mover.x = escape.x; mover.y = escape.y;
    mover.unstuckAttempts = 0; mover.unstuckCooldown = 1.8;
    mover.unstuckTimer = 0; mover.unstuckTargetX = undefined; mover.unstuckTargetY = undefined;
    return { vx: intentVx * .35, vy: intentVy * .35, triggered: true, hardTriggered: true };
  }
  mover.unstuckTargetX = escape.x;
  mover.unstuckTargetY = escape.y;
  mover.unstuckTimer = 0.62;
  const dx = escape.x - mover.x;
  const dy = escape.y - mover.y;
  const distance = Math.hypot(dx, dy) || 1;
  const speed = Math.max(mover.speed * 1.12, intentSpeed);
  return { vx: dx / distance * speed, vy: dy / distance * speed, triggered: true, hardTriggered: false };
};
