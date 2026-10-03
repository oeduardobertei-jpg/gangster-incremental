import { getTerritoryFlowProfile } from '../data/territoryFlow';

export interface FlowUnit {
  id?: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  hp?: number;
  speed?: number;
  stuckTimer?: number;
}

export interface FlowEntry { x: number; y: number; label?: string; }

const live = (unit: FlowUnit) => unit.hp === undefined || unit.hp > 0;

const densityAt = (
  x: number, y: number, units: readonly FlowUnit[], radius: number, excludeId?: string, stopAt = Number.POSITIVE_INFINITY
) => {
  const radiusSq = radius * radius;
  const stalledMotionSq = .14 * .14;
  let score = 0;
  for (const unit of units) {
    if (!live(unit) || (excludeId && unit.id === excludeId)) continue;
    const dx = unit.x - x, dy = unit.y - y;
    if (dx * dx + dy * dy > radiusSq) continue;
    const ux = unit.vx ?? 0, uy = unit.vy ?? 0;
    score += ux * ux + uy * uy < stalledMotionSq ? 1.35 : 1;
    if (score >= stopAt) return score;
  }
  return score;
};
export const selectDecongestedExternalEntry = (
  territoryId: number,
  preferredIndex: number,
  entries: readonly FlowEntry[],
  crowd: readonly FlowUnit[]
): { index: number; redirected: boolean; preferredLoad: number; selectedLoad: number } => {
  const profile = getTerritoryFlowProfile(territoryId);
  if (!profile || entries.length < 2) {
    return { index: Math.max(0, Math.min(entries.length - 1, preferredIndex)), redirected: false, preferredLoad: 0, selectedLoad: 0 };
  }
  const loads = entries.map(entry => densityAt(entry.x, entry.y, crowd, profile.entryCongestionRadius));
  const preferred = Math.max(0, Math.min(entries.length - 1, preferredIndex));
  let best = preferred;
  for (let i = 0; i < loads.length; i++) {
    if (loads[i] < loads[best]) best = i;
  }
  const shouldRedirect = loads[preferred] > profile.entrySoftCap && loads[best] + 1.25 < loads[preferred];
  const index = shouldRedirect ? best : preferred;
  return { index, redirected: shouldRedirect, preferredLoad: loads[preferred], selectedLoad: loads[index] };
};
export const applyTerritoryEdgeRecovery = (
  territoryId: number,
  mover: FlowUnit,
  vx: number,
  vy: number,
  crowd: readonly FlowUnit[],
  worldWidth: number,
  worldHeight: number
): { vx: number; vy: number; active: boolean } => {
  const profile = getTerritoryFlowProfile(territoryId);
  if (!profile) return { vx, vy, active: false };
  const nx = mover.x / Math.max(1, worldWidth);
  const side = nx <= profile.left.triggerX ? profile.left : nx >= profile.right.triggerX ? profile.right : null;
  if (!side) return { vx, vy, active: false };
  // Recovery urgency saturates well before this cap, so avoid scanning the whole crowd once the outcome cannot change.
  const crowdLoad = densityAt(mover.x, mover.y, crowd, profile.localCrowdRadius, mover.id, profile.localCrowdCap + 7);
  const stalled = (mover.stuckTimer ?? 0) > .22;
  if (crowdLoad < profile.localCrowdCap && !stalled) return { vx, vy, active: false };

  const targetX = side.targetX * worldWidth;
  const targetY = side.targetY * worldHeight;
  const dx = targetX - mover.x, dy = targetY - mover.y;
  const distance = Math.hypot(dx, dy) || 1;
  const speed = Math.max(.65, mover.speed ?? Math.hypot(vx, vy) ?? 1);
  const urgency = Math.min(1, .42 + Math.max(0, crowdLoad - profile.localCrowdCap) * .09 + (stalled ? .22 : 0));
  const blend = .42 + urgency * .28;
  return {
    vx: vx * (1 - blend) + (dx / distance) * speed * blend,
    vy: vy * (1 - blend) + (dy / distance) * speed * blend,
    active: true
  };
};

export const countTerritoryEdgePopulation = (
  territoryId: number, units: readonly FlowUnit[], worldWidth: number
): { left: number; right: number } => {
  const profile = getTerritoryFlowProfile(territoryId);
  if (!profile) return { left: 0, right: 0 };
  let left = 0, right = 0;
  for (const unit of units) {
    if (!live(unit)) continue;
    const nx = unit.x / Math.max(1, worldWidth);
    if (nx <= profile.left.triggerX) left += 1;
    else if (nx >= profile.right.triggerX) right += 1;
  }
  return { left, right };
};
