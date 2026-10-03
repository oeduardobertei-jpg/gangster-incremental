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
