import type { AllyEntity, AllyType } from '../types/game';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const BASE_CLEARANCE = 5;

const spacingPaddingForType = (type: AllyType): number => {
  switch (type) {
    case 'batedor_moto': return 11;
    case 'seguranca_pesado': return 8;
    case 'soldado_fuzil': return 6;
    default: return BASE_CLEARANCE;
  }
};

export const getPreferredAllyDistance = (
  a: Pick<AllyEntity, 'type' | 'radius'>,
  b: Pick<AllyEntity, 'type' | 'radius'>
): number => a.radius + b.radius + Math.max(
  spacingPaddingForType(a.type),
  spacingPaddingForType(b.type)
);

export interface OrganicSpawnOptions {
  desiredX: number;
  desiredY: number;
  radius: number;
  type: AllyType;
  allies: readonly AllyEntity[];
  worldWidth: number;
  worldHeight: number;
  sequence?: number;
  maxAttempts?: number;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const candidateClearance = (
  x: number,
  y: number,
  radius: number,
  type: AllyType,
  allies: readonly AllyEntity[]
): number => {
  let minimum = Number.POSITIVE_INFINITY;
  for (const other of allies) {
    if (other.hp <= 0) continue;
    const preferred = radius + other.radius + Math.max(
      spacingPaddingForType(type),
      spacingPaddingForType(other.type)
    );
    minimum = Math.min(minimum, Math.hypot(x - other.x, y - other.y) - preferred);
  }
  return minimum;
};

export const findOrganicSpawnPosition = (options: OrganicSpawnOptions): { x: number; y: number } => {
  const attempts = options.maxAttempts ?? 48;
  const sequence = options.sequence ?? 0;
  let best = {
    x: clamp(options.desiredX, options.radius, options.worldWidth - options.radius),
    y: clamp(options.desiredY, options.radius, options.worldHeight - options.radius),
    clearance: Number.NEGATIVE_INFINITY
  };

  for (let attempt = 0; attempt < attempts; attempt++) {
    const distance = attempt === 0 ? 0 : 18 + Math.sqrt(attempt) * 14;
    const angle = (sequence + attempt) * GOLDEN_ANGLE;
    const x = clamp(options.desiredX + Math.cos(angle) * distance, options.radius, options.worldWidth - options.radius);
    const y = clamp(options.desiredY + Math.sin(angle) * distance * 0.72, options.radius, options.worldHeight - options.radius);
    const clearance = candidateClearance(x, y, options.radius, options.type, options.allies);

    if (clearance >= 0) return { x, y };
    if (clearance > best.clearance) best = { x, y, clearance };
  }

  return { x: best.x, y: best.y };
};

const stableAngleFromId = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return ((hash >>> 0) % 6283) / 1000;
};
export const computeAllySeparationVector = (
  ally: AllyEntity,
  allies: readonly AllyEntity[]
): { x: number; y: number } => {
  let pushX = 0;
  let pushY = 0;
  let contributors = 0;

  for (const other of allies) {
    if (other === ally || other.hp <= 0) continue;
    const dx = ally.x - other.x;
    const dy = ally.y - other.y;
    const preferred = getPreferredAllyDistance(ally, other);
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq >= preferred * preferred) continue;

    let nx: number;
    let ny: number;
    let distance: number;
    if (distanceSq < 0.0001) {
      const angle = stableAngleFromId(`${ally.id}:${other.id}`);
      nx = Math.cos(angle);
      ny = Math.sin(angle);
      distance = 0;
    } else {
      distance = Math.sqrt(distanceSq);
      nx = dx / distance;
      ny = dy / distance;
    }
    const overlap = (preferred - distance) / preferred;
    pushX += nx * overlap;
    pushY += ny * overlap;
    contributors += 1;
  }

  if (contributors === 0) return { x: 0, y: 0 };
  const length = Math.hypot(pushX, pushY);
  if (length <= 1) return { x: pushX, y: pushY };
  return { x: pushX / length, y: pushY / length };
};



export interface AllyMassFlowVector {
  separationX: number;
  separationY: number;
  cohesionX: number;
  cohesionY: number;
  alignmentX: number;
  alignmentY: number;
  neighborCount: number;
}

/**
 * Low-frequency local flock sample for 1.1D.
 * It intentionally shares the same O(A?) sampling cadence as personal-space separation,
 * so faction cohesion does not add another full neighbor scan every frame.
 */
export const computeAllyMassFlow = (
  ally: AllyEntity,
  allies: readonly AllyEntity[],
  neighborhoodRadius = 168
): AllyMassFlowVector => {
  let pushX = 0;
  let pushY = 0;
  let separationContributors = 0;
  let centerX = 0;
  let centerY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let neighborWeight = 0;
  let neighborCount = 0;
  const neighborhoodSq = neighborhoodRadius * neighborhoodRadius;

  for (const other of allies) {
    if (other === ally || other.hp <= 0) continue;
    const dx = ally.x - other.x;
    const dy = ally.y - other.y;
    const distanceSq = dx * dx + dy * dy;
    const preferred = getPreferredAllyDistance(ally, other);

    if (distanceSq < preferred * preferred) {
      let nx: number;
      let ny: number;
      let distance: number;
      if (distanceSq < 0.0001) {
        const angle = stableAngleFromId(`${ally.id}:${other.id}`);
        nx = Math.cos(angle);
        ny = Math.sin(angle);
        distance = 0;
      } else {
        distance = Math.sqrt(distanceSq);
        nx = dx / distance;
        ny = dy / distance;
      }
      const overlap = (preferred - distance) / preferred;
      pushX += nx * overlap;
      pushY += ny * overlap;
      separationContributors += 1;
    }

    if (distanceSq <= neighborhoodSq) {
      const distance = Math.sqrt(Math.max(0, distanceSq));
      // Near squadmates matter more, but the falloff never becomes zero inside the neighborhood.
      const weight = .36 + .64 * (1 - Math.min(1, distance / neighborhoodRadius));
      centerX += other.x * weight;
      centerY += other.y * weight;
      velocityX += other.vx * weight;
      velocityY += other.vy * weight;
      neighborWeight += weight;
      neighborCount += 1;
    }
  }

  let separationX = 0;
  let separationY = 0;
  if (separationContributors > 0) {
    const length = Math.hypot(pushX, pushY);
    if (length > 1) { separationX = pushX / length; separationY = pushY / length; }
    else { separationX = pushX; separationY = pushY; }
  }

  let cohesionX = 0;
  let cohesionY = 0;
  let alignmentX = 0;
  let alignmentY = 0;
  if (neighborCount >= 2 && neighborWeight > 0) {
    const cx = centerX / neighborWeight;
    const cy = centerY / neighborWeight;
    const dx = cx - ally.x;
    const dy = cy - ally.y;
    const distance = Math.hypot(dx, dy);
    // Personal space remains dominant. Cohesion starts only after the unit is visibly leaving the mass.
    const deadZone = 52 + ally.radius * .45;
    if (distance > deadZone) {
      const strength = Math.min(1, (distance - deadZone) / 90);
      cohesionX = (dx / distance) * strength;
      cohesionY = (dy / distance) * strength;
    }

    const avx = velocityX / neighborWeight;
    const avy = velocityY / neighborWeight;
    const speed = Math.hypot(avx, avy);
    if (speed > .08) {
      alignmentX = avx / speed;
      alignmentY = avy / speed;
    }
  }

  return { separationX, separationY, cohesionX, cohesionY, alignmentX, alignmentY, neighborCount };
};

export const applyFactionMassToVelocity = (
  ally: Pick<AllyEntity, 'type' | 'speed'>,
  vx: number,
  vy: number,
  flow: Pick<AllyMassFlowVector, 'cohesionX' | 'cohesionY' | 'alignmentX' | 'alignmentY' | 'neighborCount'>,
  influence = 1
): { vx: number; vy: number } => {
  if (flow.neighborCount < 2 || influence <= 0) return { vx, vy };
  const typeScale = ally.type === 'batedor_moto' ? .58 : ally.type === 'seguranca_pesado' ? .78 : 1;
  const cohesionStrength = .24 * typeScale * influence;
  const alignmentStrength = .075 * typeScale * influence;
  let nextVx = vx + flow.cohesionX * ally.speed * cohesionStrength + flow.alignmentX * ally.speed * alignmentStrength;
  let nextVy = vy + flow.cohesionY * ally.speed * cohesionStrength + flow.alignmentY * ally.speed * alignmentStrength;
  const maxSpeed = ally.speed * (ally.type === 'batedor_moto' ? 1.24 : 1.14);
  const currentSpeed = Math.hypot(nextVx, nextVy);
  if (currentSpeed > maxSpeed && currentSpeed > 0) {
    const scale = maxSpeed / currentSpeed;
    nextVx *= scale;
    nextVy *= scale;
  }
  return { vx: nextVx, vy: nextVy };
};

const stableUnit01 = (id: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

/** Stable non-grid slot around a shared objective; prevents the whole faction from pathing to one pixel. */
export const getFactionApproachPoint = (
  unitId: string,
  targetX: number,
  targetY: number,
  maxRadius: number
): { x: number; y: number } => {
  if (maxRadius <= 0) return { x: targetX, y: targetY };
  const u = stableUnit01(`${unitId}:ring`);
  const v = stableUnit01(`${unitId}:angle`);
  const radius = maxRadius * (.38 + Math.sqrt(u) * .62);
  const angle = v * Math.PI * 2;
  return { x: targetX + Math.cos(angle) * radius, y: targetY + Math.sin(angle) * radius * .82 };
};

export const applySeparationToVelocity = (
  ally: Pick<AllyEntity, 'type' | 'speed' | 'vx' | 'vy'>,
  separationX: number,
  separationY: number
): { vx: number; vy: number } => {
  const strength = ally.type === 'batedor_moto' ? 1.05 : ally.type === 'seguranca_pesado' ? 0.62 : 0.78;
  let vx = ally.vx + separationX * ally.speed * strength;
  let vy = ally.vy + separationY * ally.speed * strength;
  const maxSpeed = ally.speed * (ally.type === 'batedor_moto' ? 1.28 : 1.16);
  const currentSpeed = Math.hypot(vx, vy);
  if (currentSpeed > maxSpeed && currentSpeed > 0) {
    const scale = maxSpeed / currentSpeed;
    vx *= scale;
    vy *= scale;
  }
  return { vx, vy };
};
