import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, useMemo } from 'react';
import {
  RivalEntity,
  AllyEntity,
  FallenEntity,
  BulletProjectile,
  FloatingText,
  GroundMark,
  CoverObstacle,
  GameState,
  RecruitOrigin,
  RecruitCommandResult,
  BattleSnapshot,
  TerritoryControlPoint,
  DistrictOperationStatus,
  DistrictOperationPhase
} from '../types/game';
import { TERRITORIES, FACTION_CONFIGS } from '../data/gameData';
import { getTerritoryVisualProfile } from '../data/territoryVisuals';
import { getTerritoryScene } from '../data/territoryScenes';
import { getTerritoryPurposeProps, type PurposeProp } from '../data/territoryPurposeProps';
import { getCampaignExternalEntries, getTerritoryCampaignProfile } from '../data/territoryCampaigns';
import { drawPurposefulPropsOcclusion, drawPurposefulArchitecture, drawPurposefulDepthProp, isArchitecturalPurposeProp, isDepthSortedPurposeProp } from './canvas/purposefulPropsRenderer';
import { drawT1UnitGrounding } from './canvas/t1SceneComposer';
import { getUnifiedSupportSolids, drawUnifiedContextArchitecture, type UnifiedSupportSolid } from './canvas/unifiedTerritoryComposer';
import { drawCityVivaBuildingSkin } from './canvas/buildingSkins';
import { drawCommandBaseProgression } from './canvas/worldProgressionVisuals';
import { getBaseCommandVisualProfile, type BaseCommandVisualProfile } from '../rules/baseCommandVisualProgression';
import { CITY_VIVA_VISUAL_REVISION } from '../data/visualTokens';
import { soundEngine } from '../audio/soundEngine';
import {
  segmentAabbHitT,
  segmentCircleHitT,
  pointHasWorldClearance,
  resolveCircleMotionAgainstWorld,
  segmentWorldHit,
  steerVelocityAroundWorld,
  WorldCollider
} from '../rules/collision';
import { buildWorldColliderIndex, queryWorldColliderIndex, WorldColliderIndex } from '../rules/collisionIndex';
import { MANUAL_RECRUIT_INTEL_COST, validateRecruitCommand } from '../rules/recruitment';
import { getAllyCoreStats, getAllyLiveStats, getAutoRecruitIntervalSeconds, getBarricadeDamageReduction, getDoubleRecruitChance, getFuzileiroChance, getMedicRegenPerSecond, rebaseAllyStatsForState } from '../rules/upgrades';
import { getStarterGangCount } from '../rules/hegemonyTalents';
import { EconomicReward, formatEconomicRewardFeedback, RivalEliminationReward, scaleScavengeLoot } from '../rules/rewards';
import { applyFactionMassToVelocity, applySeparationToVelocity, computeAllyMassFlow, findOrganicSpawnPosition, getFactionApproachPoint } from '../rules/troopMovement';
import { getDoctrineComposition, getDoctrineInterval, getPendingCampaignMilestones, getReinforcementBatchSize, pickWeightedRivalType, selectExternalEntryIndex } from '../rules/campaign';
import { getAllyCombatRole, getBossPhaseProfile, getRivalCombatRole, getRivalSupportDamageMultiplier, scoreRivalTargetForAlly } from '../rules/troopRoles';
import { applyUnstuckNavigation } from '../rules/unstuck';
import { applyBlockedTargetDetour } from '../rules/pathing';
import { applyTerritoryEdgeRecovery, countTerritoryEdgePopulation, selectDecongestedExternalEntry } from '../rules/crowdFlow';
import {
  createDefaultObstacles,
  drawCoverObstacle,
  drawFallenSprite,
  drawBulletProjectile,
  CombatParticle,
  getTacticalBuildings,
  TacticalBuilding
} from './canvas/favelaRenderer';
import { drawCityVivaMinimapFoundation } from './canvas/environmentRenderer';
import { drawStaticTerritoryScene, drawTerritoryEnvironmentOverlays } from './canvas/territoryScenePipeline';
import {
  drawAllySprite,
  drawRivalSprite
} from './canvas/soldierSprites';

import {
  Camera2D,
  ViewportSize,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  clampCamera,
  createDefaultCamera,
  fitCameraToWorld,
  panCameraByScreenDelta,
  screenToWorld,
  stepCameraZoom,
  worldToScreen,
  zoomCameraAtScreenPoint,
  zoomFromWheelDelta
} from './canvas/camera2D';

// Vite removes this import and diagnostic UI entirely from production.
const PerformanceOverlay = import.meta.env.DEV
  ? React.lazy(() => import('./dev/PerformanceOverlay')) : null;

const TERRITORY_HUD_DESCRIPTORS: Record<number, string> = {
  1: 'VIELAS • LAJES • COMÉRCIO LOCAL',
  2: 'FEIRA • TRILHOS • COMÉRCIO LOCAL',
  3: 'OFICINAS • GALPÕES • ZONA INDUSTRIAL',
  4: 'MORRO • LAJES • ACESSOS FORTIFICADOS',
  5: 'AVENIDAS • MUROS • PORTARIAS',
  6: 'COMANDO • SEGURANÇA • COMPLEXO CENTRAL'
};
const MAX_COMBAT_PARTICLES = 600;
const MAX_FLOATING_TEXTS = 80;
const CAPTURE_RADIUS = 52;
const CONTEST_RADIUS = 64;
const CAPTURE_SECONDS = 3.2;
const CAPTURE_TICK_SECONDS = 0.10;
const PHYSICAL_TERRITORY_CAPTURE_ENABLED = true;
// 0.9.11: physical district capture is now the canonical conquest model for T1–T6.


type DepthRenderableKind = 'building' | 'contextBuilding' | 'purposeBuilding' | 'purposeProp' | 'obstacle' | 'fallen' | 'ally' | 'rival';
type DepthRenderableEntity = TacticalBuilding | UnifiedSupportSolid | PurposeProp | CoverObstacle | FallenEntity | AllyEntity | RivalEntity;
interface DepthRenderableEntry {
  depthY: number;
  priority: number;
  kind: DepthRenderableKind;
  entity: DepthRenderableEntity;
}

function enqueueDepthRenderable(
  queue: DepthRenderableEntry[], pool: DepthRenderableEntry[],
  kind: DepthRenderableKind, entity: DepthRenderableEntity, depthY: number, priority: number
) {
  const index = queue.length;
  const entry = pool[index] ?? (pool[index] = { depthY, priority, kind, entity });
  entry.depthY = depthY; entry.priority = priority; entry.kind = kind; entry.entity = entity;
  queue.push(entry);
}

function buildCityVivaWorldColliders(territoryId: number, buildings: readonly TacticalBuilding[]): WorldCollider[] {
  const colliders: WorldCollider[] = [];
  const addRect = (
    id: string, x: number, y: number, w: number, h: number,
    kind: WorldCollider['kind'] = 'wall', material: WorldCollider['material'] = 'concrete',
    blocksProjectiles = true
  ) => colliders.push({
    id, minX: x, minY: y, maxX: x + w, maxY: y + h,
    blocksMovement: true, blocksProjectiles, kind, material
  });
  const addNorm = (
    id: string, x: number, y: number, w: number, h: number,
    kind: WorldCollider['kind'] = 'wall', material: WorldCollider['material'] = 'concrete',
    blocksProjectiles = true
  ) => addRect(id, x * WORLD_WIDTH, y * WORLD_HEIGHT, w * WORLD_WIDTH, h * WORLD_HEIGHT, kind, material, blocksProjectiles);

  // Tactical hubs/buildings are no longer visual ghosts. Their rendered roof/facade footprint is solid.
  for (const building of buildings) {
    addRect(
      `building:${building.id}`,
      building.x - 3,
      building.y - 30,
      building.w + 6,
      building.h + 34,
      'building',
      building.type === 'brick' ? 'brick' : building.type === 'zinc' ? 'metal' : 'concrete'
    );
  }

  if (territoryId === 1) {
    // 0.9.1B: legacy isolated-lot colliders removed; unified composer owns physical support masses.
    addNorm('t1:mural-wall', .30, .345, .19, .034, 'wall', 'brick');
    addNorm('t1:kiosk', .245, .588, .057, .055, 'cover', 'mixed');
  } else if (territoryId === 2) {
    // Railway: fenced edges with an intentional central crossing, plus split station platform.
    addNorm('t2:platform-left', .24, .155, .205, .052, 'building', 'metal');
    addNorm('t2:platform-right', .555, .155, .205, .052, 'building', 'metal');
    addNorm('t2:fence-top-left', 0, .244, .445, .012, 'fence', 'metal');
    addNorm('t2:fence-top-right', .555, .244, .445, .012, 'fence', 'metal');
    addNorm('t2:fence-bottom-left', 0, .322, .445, .012, 'fence', 'metal');
    addNorm('t2:fence-bottom-right', .555, .322, .445, .012, 'fence', 'metal');
    for (const [index, x, y] of [[0, .12, .53], [1, .20, .67], [2, .72, .53], [3, .80, .67]] as const) {
      addNorm(`t2:stall:${index}`, x, y - .006, .046, .060, 'cover', 'mixed');
    }
  } else if (territoryId === 3) {
    addNorm('t3:container-a', .19, .23, .064, .048, 'cover', 'metal');
    addNorm('t3:container-b', .65, .69, .064, .048, 'cover', 'metal');
    addNorm('t3:container-c', .58, .23, .064, .048, 'cover', 'metal');
    addNorm('t3:tyres', .23, .70, .115, .045, 'cover', 'mixed');
  } else if (territoryId === 4) {
    // 0.9.1B: legacy isolated-lot colliders removed; unified composer owns physical support masses.
    for (const [id, x, y, w] of [
      ['a',.02,.255,.18],['b',.25,.255,.15],['c',.61,.255,.14],['d',.82,.255,.16],
      ['e',.02,.525,.23],['f',.31,.525,.10],['g',.59,.525,.13],['h',.78,.525,.20],
      ['i',.02,.77,.16],['j',.25,.77,.10],['k',.64,.77,.12],['l',.83,.77,.15]
    ] as const) addNorm(`t4:retaining:${id}`, x, y, w, .025, 'wall', 'concrete');
    addNorm('t4:guard-west', .075, .10, .075, .09, 'building', 'concrete');
    addNorm('t4:guard-east', .80, .10, .075, .09, 'building', 'concrete');
  } else if (territoryId === 5) {
    // 0.5.1b: the old continuous condominium walls created long one-body-width pockets
    // beside the tactical buildings. Segment them around authored entrances instead.
    for (const [side, x, segments] of [
      ['west', .18, [[.19, .17], [.52, .16], [.84, .06]]],
      ['east', .82, [[.16, .19], [.47, .20], [.81, .09]]]
    ] as const) {
      segments.forEach(([y, h], index) => addNorm(`t5:${side}-wall:${index}`, x, y, .020, h, 'wall', 'concrete'));
    }
    addNorm('t5:pool-west', .24, .20, .15, .08, 'barrier', 'glass', false);
    addNorm('t5:pool-east', .62, .67, .14, .09, 'barrier', 'glass', false);
    addNorm('t5:gate-left', .36, .84, .10, .018, 'barrier', 'metal');
    addNorm('t5:gate-right', .54, .84, .10, .018, 'barrier', 'metal');
  } else if (territoryId === 6) {
    addNorm('t6:command-center', .34, .11, .32, .155, 'building', 'concrete');
    // Side perimeter is segmented into service gates; a continuous wall trapped squads outside the HQ.
    for (const [side, x] of [['west', .325], ['east', .657]] as const) {
      for (const [index, y, h] of [[0,.06,.30],[1,.46,.16],[2,.72,.22]] as const) {
        addNorm(`t6:${side}-perimeter:${index}`, x, y, .018, h, 'wall', 'metal');
      }
    }
    for (const [index, y] of [.31, .54, .78].entries()) {
      addNorm(`t6:checkpoint:${index}:left`, .34, y, .11, .022, 'barrier', 'metal');
      addNorm(`t6:checkpoint:${index}:right`, .55, y, .11, .022, 'barrier', 'metal');
    }
  }

  // 0.9.1B: support masses are drawn and collided from the same geometry source.
  for (const solid of getUnifiedSupportSolids(territoryId, buildings, WORLD_WIDTH, WORLD_HEIGHT)) {
    const lift = solid.kind === 'building' ? (territoryId === 6 ? 34 : territoryId === 3 ? 28 : territoryId === 1 ? 30 : 25) : 0;
    addRect(`unified:${solid.id}`, solid.x, solid.y-lift, solid.w, solid.h+lift+4, solid.kind, solid.material);
  }

  // 0.5.2: purposeful props share the same authored geometry as their visuals.
  for (const prop of getTerritoryPurposeProps(territoryId)) {
    if (!prop.solid) continue;
    const architecturalProp = prop.kind === 'stall' || prop.kind === 'security_booth' || prop.kind === 'watch_post' || prop.kind === 'service_unit';
    const propLift = architecturalProp ? (territoryId === 6 ? 34 : territoryId === 3 ? 28 : territoryId === 1 ? 30 : 25) / WORLD_HEIGHT : 0;
    addNorm(
      `prop:${prop.id}`, prop.x, prop.y-propLift, prop.w, prop.h+propLift+(architecturalProp?4/WORLD_HEIGHT:0),
      architecturalProp ? 'building' : prop.kind === 'low_wall' ? 'wall' : prop.kind === 'container' ? 'cover' : 'barrier',
      prop.material === 'brick' ? 'brick'
        : prop.material === 'glass' ? 'glass'
          : prop.material === 'metal' ? 'metal'
            : prop.material === 'mixed' || prop.material === 'vegetation' ? 'mixed' : 'concrete',
      prop.blocksProjectiles !== false
    );
  }

  return colliders;
}

function findClearWorldPosition(
  desiredX: number, desiredY: number, radius: number,
  colliders: readonly WorldCollider[], sequence: number
): { x: number; y: number } {
  const clampedX = Math.max(radius + 3, Math.min(WORLD_WIDTH - radius - 3, desiredX));
  const clampedY = Math.max(radius + 3, Math.min(WORLD_HEIGHT - radius - 3, desiredY));
  if (pointHasWorldClearance(clampedX, clampedY, radius, colliders)) return { x: clampedX, y: clampedY };

  const golden = 2.399963229728653;
  for (let attempt = 1; attempt <= 42; attempt++) {
    const ring = 18 + Math.sqrt(attempt) * 17;
    const angle = (attempt + sequence * 3) * golden;
    const x = Math.max(radius + 3, Math.min(WORLD_WIDTH - radius - 3, clampedX + Math.cos(angle) * ring));
    const y = Math.max(radius + 3, Math.min(WORLD_HEIGHT - radius - 3, clampedY + Math.sin(angle) * ring));
    if (pointHasWorldClearance(x, y, radius, colliders)) return { x, y };
  }
  return { x: clampedX, y: clampedY };
}

function resolveUnitAgainstCoverObstacles(
  x: number,
  y: number,
  radius: number,
  obstacles: readonly CoverObstacle[]
): { x: number; y: number; hitX: boolean; hitY: boolean } {
  let nextX = x;
  let nextY = y;
  let hitX = false;
  let hitY = false;

  for (const obstacle of obstacles) {
    if (obstacle.destroyed) continue;
    const minX = obstacle.x - obstacle.w / 2 - radius;
    const maxX = obstacle.x + obstacle.w / 2 + radius;
    const minY = obstacle.y - obstacle.h / 2 - radius;
    const maxY = obstacle.y + obstacle.h / 2 + radius;
    if (nextX <= minX || nextX >= maxX || nextY <= minY || nextY >= maxY) continue;

    const pushLeft = Math.abs(nextX - minX);
    const pushRight = Math.abs(maxX - nextX);
    const pushTop = Math.abs(nextY - minY);
    const pushBottom = Math.abs(maxY - nextY);
    const smallest = Math.min(pushLeft, pushRight, pushTop, pushBottom);
    if (smallest === pushLeft) { nextX = minX; hitX = true; }
    else if (smallest === pushRight) { nextX = maxX; hitX = true; }
    else if (smallest === pushTop) { nextY = minY; hitY = true; }
    else { nextY = maxY; hitY = true; }
  }

  return { x: nextX, y: nextY, hitX, hitY };
}

function pointHasCoverClearance(
  x: number,
  y: number,
  radius: number,
  obstacles: readonly CoverObstacle[]
): boolean {
  for (const obstacle of obstacles) {
    if (obstacle.destroyed) continue;
    if (
      x > obstacle.x - obstacle.w / 2 - radius &&
      x < obstacle.x + obstacle.w / 2 + radius &&
      y > obstacle.y - obstacle.h / 2 - radius &&
      y < obstacle.y + obstacle.h / 2 + radius
    ) return false;
  }
  return true;
}

function findClearRecruitPosition(
  desiredX: number,
  desiredY: number,
  radius: number,
  allies: readonly AllyEntity[],
  colliders: readonly WorldCollider[],
  obstacles: readonly CoverObstacle[],
  sequence: number
): { x: number; y: number } {
  const margin = radius + 4;
  const candidateClear = (x: number, y: number) => {
    if (!pointHasWorldClearance(x, y, radius + 2, colliders)) return false;
    if (!pointHasCoverClearance(x, y, radius + 2, obstacles)) return false;
    for (const ally of allies) {
      const minDistance = radius + ally.radius + 4;
      const dx = x - ally.x;
      const dy = y - ally.y;
      if (dx * dx + dy * dy < minDistance * minDistance) return false;
    }
    return true;
  };

  const startX = Math.max(margin, Math.min(WORLD_WIDTH - margin, desiredX));
  const startY = Math.max(margin, Math.min(WORLD_HEIGHT - margin, desiredY));
  if (candidateClear(startX, startY)) return { x: startX, y: startY };

  const golden = 2.399963229728653;
  for (let attempt = 1; attempt <= 84; attempt++) {
    const ring = 14 + Math.sqrt(attempt) * 14;
    const angle = (attempt + sequence * 5) * golden;
    const x = Math.max(margin, Math.min(WORLD_WIDTH - margin, startX + Math.cos(angle) * ring));
    const y = Math.max(margin, Math.min(WORLD_HEIGHT - margin, startY + Math.sin(angle) * ring));
    if (candidateClear(x, y)) return { x, y };
  }

  // Extreme crowding fallback: preserve world solidity first; separation will untangle the group afterward.
  const worldSafe = findClearWorldPosition(startX, startY, radius + 2, colliders, sequence);
  const coverSafe = resolveUnitAgainstCoverObstacles(worldSafe.x, worldSafe.y, radius + 2, obstacles);
  return { x: coverSafe.x, y: coverSafe.y };
}

function solveAllyBodyOverlaps(
  allies: AllyEntity[],
  colliderIndex: WorldColliderIndex,
  obstacles: readonly CoverObstacle[]
) {
  const count = allies.length;
  if (count < 2) return;
  const passes = count <= 80 ? 3 : 1;

  // Accumulate pair corrections first, then resolve the world once per entity.
  // This keeps crowded chokepoints solid without multiplying collider scans by
  // every overlapping pair (important at 135 units / 5x speed).
  for (let pass = 0; pass < passes; pass++) {
    const correctionX = new Float32Array(count);
    const correctionY = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const a = allies[i];
      if (a.hp <= 0) continue;
      for (let j = i + 1; j < count; j++) {
        const b = allies[j];
        if (b.hp <= 0) continue;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const targetDistance = a.radius + b.radius + 4;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq >= targetDistance * targetDistance) continue;

        let distance = Math.sqrt(distanceSq);
        if (distance < .001) {
          const angle = ((i + 1) * 2.17 + (j + 1) * 1.31) % (Math.PI * 2);
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distance = 1;
        }
        const nx = dx / distance;
        const ny = dy / distance;
        const correction = (targetDistance - distance) * .66;
        correctionX[i] -= nx * correction;
        correctionY[i] -= ny * correction;
        correctionX[j] += nx * correction;
        correctionY[j] += ny * correction;
      }
    }

    for (let i = 0; i < count; i++) {
      const ally = allies[i];
      if (ally.hp <= 0) continue;
      let dx = correctionX[i];
      let dy = correctionY[i];
      const magnitude = Math.hypot(dx, dy);
      if (magnitude <= .01) continue;
      if (magnitude > 12) {
        const scale = 12 / magnitude;
        dx *= scale;
        dy *= scale;
      }
      const localColliders = queryWorldColliderIndex(colliderIndex, ally.x, ally.y);
      const world = resolveCircleMotionAgainstWorld(
        ally.x, ally.y, ally.radius + .75, dx, dy, localColliders
      );
      const cover = resolveUnitAgainstCoverObstacles(
        world.x, world.y, ally.radius + .75, obstacles
      );
      let finalWorld = cover;
      if (cover.hitX || cover.hitY) {
        const finalColliders = queryWorldColliderIndex(colliderIndex, cover.x, cover.y);
        if (!pointHasWorldClearance(cover.x, cover.y, ally.radius + .75, finalColliders)) {
          finalWorld = resolveCircleMotionAgainstWorld(cover.x, cover.y, ally.radius + .75, 0, 0, finalColliders);
        }
      }
      ally.x = Math.max(ally.radius, Math.min(WORLD_WIDTH - ally.radius, finalWorld.x));
      ally.y = Math.max(ally.radius, Math.min(WORLD_HEIGHT - ally.radius, finalWorld.y));
    }
  }
}

export interface GameCanvasHandle {
  getAllyCount: () => number;
  deployRecruit: (origin: RecruitOrigin, position?: { x: number; y: number }) => { created: number; capacityReached: boolean };
  getBattleSnapshot: () => BattleSnapshot;
  getDistrictOperationStatus: () => DistrictOperationStatus;
}

interface GameCanvasProps {
  gameState: GameState;
  baseVisualPreview?: BaseCommandVisualProfile | null;
  selectedOrderId: string;
  onSpawnRecruit: (origin: RecruitOrigin, position?: { x: number; y: number }) => RecruitCommandResult;
  onDirectCommand: (orderId: string, targetX: number, targetY: number, targetEntityId?: string) => boolean;
  onRivalEliminated: (rival: RivalEntity) => RivalEliminationReward;
  onScavengeDrop?: (cash: number, ammo: number, isAutoSoldier?: boolean) => EconomicReward;
  onAdvanceTerritory?: () => void;
  onTerritoryDominated?: (territoryId: number) => void;
  onAllyDown: (allyId: string) => void;
}

export const GameCanvas = React.forwardRef<GameCanvasHandle, GameCanvasProps>(({
  gameState,
  baseVisualPreview,
  selectedOrderId: _selectedOrderId,
  onSpawnRecruit,
  onDirectCommand: _onDirectCommand,
  onRivalEliminated,
  onScavengeDrop,
  onAdvanceTerritory,
  onTerritoryDominated,
  onAllyDown
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapDraggingRef = useRef<boolean>(false);
  const minimapLastRenderMsRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const baseVisualPreviewRef = useRef<BaseCommandVisualProfile | null | undefined>(baseVisualPreview);
  baseVisualPreviewRef.current = baseVisualPreview;
  const liveBaseStageRef = useRef(getBaseCommandVisualProfile(gameState).stage);
  const baseStageFxRef = useRef<{ stage: number; startedAt: number } | null>(null);
  useEffect(() => {
    const nextStage = getBaseCommandVisualProfile(gameState).stage;
    if (nextStage > liveBaseStageRef.current) {
      baseStageFxRef.current = { stage: nextStage, startedAt: performance.now() };
    }
    liveBaseStageRef.current = nextStage;
  }, [gameState.upgrades]);

  // Entities stored in mutable refs for steady 60fps performance
  const rivalsRef = useRef<RivalEntity[]>([]);
  const alliesRef = useRef<AllyEntity[]>([]);
  const fallenRef = useRef<FallenEntity[]>([]);
  const bulletsRef = useRef<BulletProjectile[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const groundMarksRef = useRef<GroundMark[]>([]);
  const obstaclesRef = useRef<CoverObstacle[]>([]);
  const particlesRef = useRef<CombatParticle[]>([]);
  const staticMapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticMapKeyRef = useRef<string>('');
  const depthRenderQueueRef = useRef<DepthRenderableEntry[]>([]);
  const depthRenderPoolRef = useRef<DepthRenderableEntry[]>([]);
  const recruitSpawnSequenceRef = useRef<number>(0);

  // 0.9.11: operação territorial física compartilhada por T1–T6.
  const controlPointsRef = useRef<TerritoryControlPoint[]>([]);
  const capturedBuildingIdsRef = useRef<Set<string>>(new Set());
  const operationPhaseRef = useRef<DistrictOperationPhase>('capture');
  const finalResistanceSpawnedRef = useRef<boolean>(false);
  const finalResistanceWaveRef = useRef<number>(0);
  const campaignMilestonesTriggeredRef = useRef<Set<string>>(new Set());
  const territoryTakesRef = useRef<number>(gameState.territoryTakes);
  territoryTakesRef.current = gameState.territoryTakes;
  const operationHudSignatureRef = useRef<string>('');
  const [operationHud, setOperationHud] = useState<DistrictOperationStatus>({
    enabled: false, phase: 'capture', captured: 0, total: 0
  });

  // Timers
  const spawnElapsedMsRef = useRef<number>(0);
  const autoRecruitElapsedMsRef = useRef<number>(0);
  const externalSpawnCursorRef = useRef<number>(0);
  const allyBodySolveElapsedRef = useRef<number>(0);
  const captureUpdateElapsedRef = useRef<number>(0);
  const restoredSnapshotRef = useRef<boolean>(false);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const simulationAccumulatorRef = useRef<number>(0);
  const perfRef = useRef({
    sampleStart: performance.now(), frames: 0, simulationMs: 0, renderMs: 0, frameTimes: [] as number[],
    simulationSteps: 0, targetSearches: 0, projectileChecks: 0, unstuckTriggers: 0,
    flowLaneRedirects: 0, edgeRecoveries: 0, hardUnstuckTriggers: 0,
    rivalAiMs: 0, allyAiMs: 0, projectileMs: 0
  });

  // 0.4A: logical world + Camera2D independent from physical canvas size
  const [zoom, setZoom] = useState<number>(1.0);
  const cameraRef = useRef<Camera2D>(createDefaultCamera());
  const didInitialFitRef = useRef(false);
  const viewportRef = useRef<ViewportSize & { dpr: number }>({ width: 800, height: 480, dpr: 1 });
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraStartRef = useRef<Camera2D>(createDefaultCamera());
  const [isDraggingState, setIsDraggingState] = useState<boolean>(false);
  const [showControlGuide, setShowControlGuide] = useState<boolean>(true);
  const pointerInsideRef = useRef<boolean>(false);
  const hoverLastCheckMsRef = useRef<number>(0);

  useEffect(() => {
    if (!showControlGuide) return;
    const timer = window.setTimeout(() => setShowControlGuide(false), 6500);
    return () => window.clearTimeout(timer);
  }, [showControlGuide]);

  // 0.4B: pointer/hover stay in refs so pointer movement never restarts the RAF effect.
  const mousePosRef = useRef<{ x: number; y: number; screenX: number; screenY: number }>({
    x: 0,
    y: 0,
    screenX: 0,
    screenY: 0
  });
  const hoveredEntityRef = useRef<{ type: 'ally' | 'rival' | 'fallen' | 'obstacle' | 'none'; name?: string; entityId?: string } | null>(null);
  const showDamageNumbersRef = useRef(gameState.showDamageNumbers);
  showDamageNumbersRef.current = gameState.showDamageNumbers;

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, screenX: 0, screenY: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const world = screenToWorld({ x: screenX, y: screenY }, cameraRef.current, viewportRef.current);
    return { x: world.x, y: world.y, screenX, screenY };
  }, []);

  const setCameraZoomAt = useCallback((nextZoom: number, anchorX: number, anchorY: number) => {
    cameraRef.current = zoomCameraAtScreenPoint(
      cameraRef.current,
      nextZoom,
      { x: anchorX, y: anchorY },
      viewportRef.current
    );
    setZoom(cameraRef.current.zoom);
  }, []);

  // Mouse-wheel zoom keeps the world point under the cursor fixed.
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setShowControlGuide(false);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCameraZoomAt(
      zoomFromWheelDelta(cameraRef.current.zoom, e.deltaY),
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  }, [setCameraZoomAt]);

  const handleZoomIn = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const viewport = viewportRef.current;
    setCameraZoomAt(stepCameraZoom(cameraRef.current.zoom, 1), viewport.width / 2, viewport.height / 2);
  }, [setCameraZoomAt]);

  const handleZoomOut = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const viewport = viewportRef.current;
    setCameraZoomAt(stepCameraZoom(cameraRef.current.zoom, -1), viewport.width / 2, viewport.height / 2);
  }, [setCameraZoomAt]);

  const handleZoomReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const viewport = viewportRef.current;
    cameraRef.current = clampCamera({ ...cameraRef.current, zoom: 1 }, viewport);
    setZoom(cameraRef.current.zoom);
  }, []);

  const handleResetCamera = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    cameraRef.current = fitCameraToWorld(viewportRef.current, 28);
    setZoom(cameraRef.current.zoom);
    setShowControlGuide(false);
  }, []);

  const currentTerritory = TERRITORIES.find(t => t.id === gameState.currentTerritoryId) || TERRITORIES[0];
  const nextTerritory = TERRITORIES.find(t => t.id === gameState.currentTerritoryId + 1);
  const factionConfig = FACTION_CONFIGS[gameState.playerFaction] || FACTION_CONFIGS.vermelha;
  const territoryScene = useMemo(() => getTerritoryScene(currentTerritory.id), [currentTerritory.id]);
  const territoryVisualProfile = useMemo(
    () => getTerritoryVisualProfile(currentTerritory.id),
    [currentTerritory.id]
  );
  const campaignProfile = useMemo(
    () => getTerritoryCampaignProfile(currentTerritory.id),
    [currentTerritory.id]
  );
  const tacticalBuildings = useMemo(
    () => getTacticalBuildings(WORLD_WIDTH, WORLD_HEIGHT, factionConfig, currentTerritory.id),
    [factionConfig, currentTerritory.id]
  );
  const worldColliders = useMemo(
    () => buildCityVivaWorldColliders(currentTerritory.id, tacticalBuildings),
    [currentTerritory.id, tacticalBuildings]
  );
  const worldColliderIndex = useMemo(
    () => buildWorldColliderIndex(worldColliders, WORLD_WIDTH, WORLD_HEIGHT),
    [worldColliders]
  );
  const dominationRequirement = currentTerritory.requiredNeutralizations;
  const neutralizationProgressReady = gameState.territoryTakes >= dominationRequirement;
  const territoryDominated = PHYSICAL_TERRITORY_CAPTURE_ENABLED ? operationHud.phase === 'dominated' : neutralizationProgressReady;
  // 0.5.7B: domination is an in-place ownership transition, never a battlefield reinitialization.
  // Spawn logic reads this ref so the spawn callback stays stable when control flips.
  const territoryDominatedRef = useRef(territoryDominated);
  territoryDominatedRef.current = territoryDominated;
  useEffect(() => {
    if (territoryDominated) onTerritoryDominated?.(currentTerritory.id);
  }, [territoryDominated, currentTerritory.id, onTerritoryDominated]);
  const environmentControlColor = territoryDominated ? factionConfig.color : factionConfig.rivalColor;
  const operationEnabled = PHYSICAL_TERRITORY_CAPTURE_ENABLED;

  const createDistrictControlPoints = useCallback((): TerritoryControlPoint[] => {
    if (!operationEnabled) return [];
    const anchorRadius = Math.max(16, CAPTURE_RADIUS * .34);
    return tacticalBuildings
      .filter(building => building.isRivalHub)
      .map((building, index) => {
        let x = building.doorX;
        let y = building.doorY;
        if (!pointHasWorldClearance(x, y, anchorRadius, worldColliders)) {
          const centerX = building.x + building.w / 2;
          const centerY = building.y + building.h / 2;
          let dirX = building.doorX - centerX;
          let dirY = building.doorY - centerY;
          const dirLength = Math.hypot(dirX, dirY) || 1;
          dirX /= dirLength;
          dirY /= dirLength;
          let resolved = false;
          for (let distance = 22; distance <= 150; distance += 18) {
            const probeX = Math.max(anchorRadius + 3, Math.min(WORLD_WIDTH - anchorRadius - 3, building.doorX + dirX * distance));
            const probeY = Math.max(anchorRadius + 3, Math.min(WORLD_HEIGHT - anchorRadius - 3, building.doorY + dirY * distance));
            if (!pointHasWorldClearance(probeX, probeY, anchorRadius, worldColliders)) continue;
            x = probeX; y = probeY; resolved = true; break;
          }
          if (!resolved) {
            const fallback = findClearWorldPosition(building.doorX, building.doorY, anchorRadius, worldColliders, index + currentTerritory.id * 17);
            x = fallback.x; y = fallback.y;
          }
        }
        return {
          id: `cp_${building.id}`, buildingId: building.id, label: building.label, x, y,
          progress: 0, status: 'rival' as const
        };
      });
  }, [operationEnabled, tacticalBuildings, worldColliders, currentTerritory.id]);

  const getDistrictStatus = useCallback((): DistrictOperationStatus => {
    if (!operationEnabled) return { enabled: false, phase: 'dominated', captured: 0, total: 0 };
    const points = controlPointsRef.current;
    const active = points
      .filter(point => point.status !== 'captured')
      .sort((a, b) => b.progress - a.progress)[0];
    return {
      enabled: true,
      phase: operationPhaseRef.current,
      captured: points.filter(point => point.status === 'captured').length,
      total: points.length,
      activeLabel: active?.label,
      activeProgress: active?.progress
    };
  }, [operationEnabled]);

  const syncDistrictHud = useCallback(() => {
    const next = getDistrictStatus();
    (window as unknown as { __DISTRICT_OPERATION__?: DistrictOperationStatus }).__DISTRICT_OPERATION__ = next;
    if (import.meta.env.DEV) {
      (window as unknown as { __DISTRICT_CONTROL_POINTS__?: TerritoryControlPoint[] }).__DISTRICT_CONTROL_POINTS__ =
        controlPointsRef.current.map(point => ({ ...point }));
    }
    const quantized = next.activeProgress === undefined ? -1 : Math.floor(next.activeProgress * 20) / 20;
    const signature = `${next.enabled}:${next.phase}:${next.captured}:${next.total}:${next.activeLabel ?? ''}:${quantized}`;
    if (signature === operationHudSignatureRef.current) return;
    operationHudSignatureRef.current = signature;
    setOperationHud({ ...next, activeProgress: next.activeProgress === undefined ? undefined : quantized });
  }, [getDistrictStatus]);

  // Add floating combat text
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    if (!showDamageNumbersRef.current) return;
    // 1.1G: dense faction combat aggregates nearby damage pulses instead of stacking text.
    if (/^-0(?:\D|$)/.test(text)) return;
    const numericDamage = /^-\d/.test(text);
    if (numericDamage) {
      const amount = Number.parseInt(text.slice(1), 10);
      const nearby = floatingTextsRef.current.find(ft =>
        /^-\d/.test(ft.text) && ft.life > .42 && Math.hypot(ft.x - x, ft.y - y) < 20
      );
      if (nearby && Number.isFinite(amount)) {
        const previous = Number.parseInt(nearby.text.slice(1), 10) || 0;
        nearby.text = `-${Math.min(9999, previous + amount)}`;
        nearby.opacity = 1;
        nearby.life = Math.max(nearby.life, .72);
        nearby.x += (x - nearby.x) * .22;
        nearby.y = Math.min(nearby.y, y - 9);
        return;
      }
      if (floatingTextsRef.current.length > 48 && Math.random() < .68) return;
    }
    floatingTextsRef.current.push({
      id: Math.random().toString(36).substring(7),
      text,
      x: x + (Math.random() * 20 - 10),
      y: y - 10,
      color,
      opacity: 1,
      vy: -0.8 - Math.random() * 0.4,
      life: 0.9
    });
    if (floatingTextsRef.current.length > MAX_FLOATING_TEXTS) {
      floatingTextsRef.current.splice(0, floatingTextsRef.current.length - MAX_FLOATING_TEXTS);
    }
  }, []);

  // Add bullet hole or graffiti mark
  const addGroundMark = useCallback((x: number, y: number, type: GroundMark['type'] = 'bullet_mark') => {
    if (!gameState.showCombatSplatters) return;
    const colors = type === 'grafite' ? ['#ef4444', '#3b82f6', '#10b981'] : ['#1e293b', '#0f172a'];
    groundMarksRef.current.push({
      x: x + (Math.random() * 16 - 8),
      y: y + (Math.random() * 16 - 8),
      radius: type === 'grafite' ? 8 + Math.random() * 6 : 2 + Math.random() * 2,
      alpha: 0.5 + Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      type
    });
    if (groundMarksRef.current.length > 100) {
      groundMarksRef.current.shift();
    }
  }, [gameState.showCombatSplatters]);

  // ==========================================
  // PARTICLE EMITTER SYSTEM
  // ==========================================
  const addMuzzleFlash = useCallback((
    x: number, y: number, angle: number, color: string,
    style: NonNullable<BulletProjectile['visualStyle']> = 'pistol'
  ) => {
    const particleLoad = particlesRef.current.length;
    const styleScale = style === 'fuzil' ? 1.24 : style === 'moto' ? .84 : style === 'rival' ? .94 : 1;
    const baseSparkCount = style === 'fuzil' ? 5 : style === 'moto' ? 3 : 4;
    const sparkCount = particleLoad > 420 ? 0 : particleLoad > 280 ? 1 : particleLoad > 140 ? Math.min(2, baseSparkCount) : baseSparkCount;
    // 1. Weapon-class flash: same timing, different silhouette/readability.
    particlesRef.current.push({
      id: Math.random().toString(36).substring(7),
      x: x + Math.cos(angle) * 2,
      y: y + Math.sin(angle) * 2,
      vx: 0,
      vy: 0,
      color: style === 'rival' ? '#fde68a' : '#fef08a',
      alpha: 1,
      size: 6.6 * styleScale,
      life: style === 'fuzil' ? 0.095 : 0.078,
      maxLife: style === 'fuzil' ? 0.095 : 0.078,
      type: 'muzzle',
      rotation: angle
    });

    // 2. High-speed Forward Sparks
    for (let i = 0; i < sparkCount; i++) {
      const spd = 2.5 + Math.random() * 3.5;
      const spread = angle + (Math.random() - 0.5) * 0.7;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7),
        x,
        y,
        vx: Math.cos(spread) * spd,
        vy: Math.sin(spread) * spd,
        color: Math.random() < 0.5 ? color : '#fef08a',
        alpha: 1,
        size: (1.35 + Math.random() * 1.35) * styleScale,
        life: (0.16 + Math.random() * 0.1) * Math.min(1.12, styleScale),
        maxLife: 0.28,
        type: 'spark',
        friction: 0.92
      });
    }

    // 3. A short smoke puff keeps the shot visually attached to the weapon.
    if (particleLoad < 220) {
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7), x, y,
        vx: Math.cos(angle) * .18 + (Math.random() - .5) * .12,
        vy: Math.sin(angle) * .18 - .18,
        color: '#cbd5e1', alpha: style === 'fuzil' ? .38 : .28, size: 2.15 * styleScale, life: .2, maxLife: .2,
        type: 'smoke', friction: .90
      });
    }

    // 4. Casings are low-priority decoration under heavy combat load.
    if (particleLoad < 260) {
      const casingAngle = angle + (Math.PI / 2) * (Math.random() < 0.5 ? 1 : -1) + (Math.random() - 0.5) * 0.4;
      const casingSpd = 1.2 + Math.random() * 1.5;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7), x, y,
        vx: Math.cos(casingAngle) * casingSpd,
        vy: Math.sin(casingAngle) * casingSpd - 0.8,
        color: '#eab308', alpha: 0.82, size: 2.7 * styleScale, life: 0.62, maxLife: 0.62,
        type: 'casing', gravity: 0.15, friction: 0.94,
        rotation: Math.random() * Math.PI * 2, vRot: (Math.random() - 0.5) * 0.4
      });
    }
  }, []);

  const addImpactSparks = useCallback((x: number, y: number, isBlood: boolean, impactColor: string) => {
    const load = particlesRef.current.length;
    const baseCount = isBlood ? 6 : 4;
    const count = load > 420 ? 1 : load > 280 ? Math.ceil(baseCount * 0.35) : load > 160 ? Math.ceil(baseCount * 0.6) : baseCount;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.0 + Math.random() * 2.5;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7),
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: isBlood ? (Math.random() < 0.6 ? '#dc2626' : '#991b1b') : (Math.random() < .55 ? impactColor : '#fef08a'),
        alpha: 1,
        size: isBlood ? (2 + Math.random() * 2) : (1.5 + Math.random() * 1.5),
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        type: isBlood ? 'blood' : 'spark',
        friction: 0.93,
        gravity: isBlood ? 0.08 : 0
      });
    }
    if (!isBlood && load < 240) {
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7), x, y,
        vx: (Math.random() - .5) * .16, vy: -.16 - Math.random() * .10,
        color: impactColor === '#bae6fd' ? '#dbeafe' : '#cbd5e1',
        alpha: .30, size: 2.2 + Math.random() * .9, life: .20, maxLife: .20,
        type: 'smoke', friction: .88
      });
    }
  }, []);

  const addNeutralizationEffects = useCallback((
    x: number,
    y: number,
    isRival: boolean,
    isBoss: boolean,
    hasLoot: boolean,
    factionColor?: string
  ) => {
    const particleLoad = particlesRef.current.length;
    const loadScale = particleLoad > 420 ? 0.35 : particleLoad > 280 ? 0.55 : particleLoad > 160 ? 0.75 : 1;
    // 1. Shockwave Expanding Ring
    particlesRef.current.push({
      id: Math.random().toString(36).substring(7),
      x,
      y,
      vx: 0,
      vy: 0,
      color: isBoss ? '#f43f5e' : (isRival ? '#ef4444' : (factionColor || '#38bdf8')),
      alpha: 1,
      size: isBoss ? 8 : 5,
      life: isBoss ? 0.45 : 0.3,
      maxLife: isBoss ? 0.45 : 0.3,
      type: 'shockwave'
    });

    // 2. Burst Blood / Combat Dust
    const burstCount = isBoss ? Math.max(12, Math.round(18 * loadScale)) : Math.max(3, Math.round(10 * loadScale));
    for (let i = 0; i < burstCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * (isBoss ? 4.5 : 3.0);
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7),
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 0.5,
        color: isRival ? (Math.random() < 0.7 ? '#dc2626' : '#7f1d1d') : (factionColor || '#3b82f6'),
        alpha: 1,
        size: 2.5 + Math.random() * 2.5,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6,
        type: 'blood',
        gravity: 0.12,
        friction: 0.92
      });
    }

    // 3. Smoke Cloud Puffs
    const smokeCount = isBoss ? Math.max(3, Math.round(5 * loadScale)) : Math.max(1, Math.round(3 * loadScale));
    for (let i = 0; i < smokeCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.4 + Math.random() * 0.8;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7),
        x: x + (Math.random() * 8 - 4),
        y: y + (Math.random() * 8 - 4),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 0.4,
        color: 'rgba(148, 163, 184, 0.5)',
        alpha: 0.6,
        size: 6 + Math.random() * 6,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        type: 'smoke',
        friction: 0.95
      });
    }

    // 4. Sparkling Gold/Loot Dust if Carrying Loot
    if (hasLoot) {
      const lootDustCount = Math.max(3, Math.round(7 * loadScale));
      for (let i = 0; i < lootDustCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.0 + Math.random() * 2.0;
        particlesRef.current.push({
          id: Math.random().toString(36).substring(7),
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.2,
          color: Math.random() < 0.5 ? '#fbbf24' : '#34d399',
          alpha: 1,
          size: 2 + Math.random() * 2,
          life: 0.6 + Math.random() * 0.3,
          maxLife: 0.9,
          type: 'gold_dust',
          gravity: 0.04,
          friction: 0.94
        });
      }
    }
  }, []);

  const addExplosion = useCallback((x: number, y: number, radius = 80) => {
    const particleLoad = particlesRef.current.length;
    const explosionScale = particleLoad > 420 ? 0.5 : particleLoad > 280 ? 0.7 : 1;
    // Shockwave
    particlesRef.current.push({
      id: Math.random().toString(36).substring(7),
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#f97316',
      alpha: 1,
      size: radius / 8,
      life: 0.55,
      maxLife: 0.55,
      type: 'shockwave'
    });

    // Fiery blast fragments
    const fragmentCount = Math.max(12, Math.round(24 * explosionScale));
    for (let i = 0; i < fragmentCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2.0 + Math.random() * 6.0;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7),
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1.0,
        color: Math.random() < 0.4 ? '#ea580c' : (Math.random() < 0.7 ? '#facc15' : '#ef4444'),
        alpha: 1,
        size: 3 + Math.random() * 4,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        type: 'spark',
        gravity: 0.15,
        friction: 0.91
      });
    }

    // Heavy black smoke billow
    const explosionSmokeCount = Math.max(4, Math.round(8 * explosionScale));
    for (let i = 0; i < explosionSmokeCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.5 + Math.random() * 1.5;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7),
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 16 - 8),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 0.8,
        color: 'rgba(30, 41, 59, 0.7)',
        alpha: 0.8,
        size: 10 + Math.random() * 12,
        life: 0.7 + Math.random() * 0.4,
        maxLife: 1.1,
        type: 'smoke',
        friction: 0.93
      });
    }
  }, []);

  // Deploy an ally soldier from command base / click
  const deployAllySoldier = useCallback((spawnX?: number, spawnY?: number, isFuzileiro = false) => {
    const width = WORLD_WIDTH;
    const height = WORLD_HEIGHT;

    const baseHubX = width / 2;
    const baseHubY = height - 40;
    // 0.5D: captured strongholds become forward reinforcement bases.
    // Explicit map-click deployment always wins; button/keyboard/auto use a captured hub when available.
    const forwardBases = operationEnabled
      ? tacticalBuildings.filter(building => capturedBuildingIdsRef.current.has(building.id))
      : [];
    const forwardBase = spawnX === undefined && spawnY === undefined && forwardBases.length > 0
      ? forwardBases[Math.floor(Math.random() * forwardBases.length)]
      : undefined;
    const defaultX = forwardBase ? forwardBase.doorX : baseHubX;
    const defaultY = forwardBase ? forwardBase.doorY : baseHubY;

    const coreStats = getAllyCoreStats(gameState);
    const isMoto = !isFuzileiro && Math.random() < coreStats.motorcycleChance;

    let allyType: AllyEntity['type'] = 'soldado_base';
    let allyName = `Recruta (${factionConfig.tag})`;
    let allyRange = 100;
    let allyCooldown = 0.85;
    let allyRadius = 12;

    if (isFuzileiro) {
      allyType = 'soldado_fuzil';
      allyName = `Fuzileiro (${factionConfig.tag})`;
      allyRange = 175;
      allyCooldown = 1.4;
      allyRadius = 11;
    } else if (isMoto) {
      allyType = 'batedor_moto';
      allyName = `Batedor de Moto (${factionConfig.tag})`;
      allyRange = 85;
      allyCooldown = 0.65;
      allyRadius = 10;
    }

    const desiredX = spawnX !== undefined ? spawnX : defaultX;
    const desiredY = spawnY !== undefined ? spawnY : defaultY + (forwardBase ? 0 : -18);
    const spawnSequence = recruitSpawnSequenceRef.current++;
    const organicPosition = findOrganicSpawnPosition({
      desiredX, desiredY, radius: allyRadius, type: allyType, allies: alliesRef.current,
      worldWidth: width, worldHeight: height, sequence: spawnSequence
    });
    const spawnPosition = findClearRecruitPosition(
      organicPosition.x, organicPosition.y, allyRadius,
      alliesRef.current, worldColliders, obstaclesRef.current, spawnSequence
    );
    const posX = spawnPosition.x;
    const posY = spawnPosition.y;

    const liveStats = getAllyLiveStats(gameState, allyType);
    const maxHp = liveStats.maxHp;
    const allySpeed = liveStats.speed;
    const allyDamage = liveStats.damage;

    alliesRef.current.push({
      id: Math.random().toString(36).substring(7),
      type: allyType,
      name: allyName,
      x: posX,
      y: posY,
      vx: (Math.random() - 0.5) * allySpeed,
      vy: -allySpeed,
      hp: maxHp,
      maxHp,
      speed: allySpeed,
      damage: allyDamage,
      attackRange: allyRange,
      attackCooldown: allyCooldown,
      attackTimer: 0,
      scavengeCooldown: 0,
      targetId: null,
      color: factionConfig.color,
      radius: allyRadius,
      variant: Math.floor(Math.random() * 3)
    });

    soundEngine.playRecruitAlly();
    addFloatingText('REFORÇO CONVOCADO!', posX, posY, '#10b981');
  }, [gameState.upgrades, gameState.talents, factionConfig, addFloatingText, operationEnabled, tacticalBuildings, worldColliders]);

  useImperativeHandle(ref, () => ({
    getAllyCount: () => alliesRef.current.length,
    getBattleSnapshot: () => ({
      version: 1,
      runId: gameState.runId,
      territoryId: gameState.currentTerritoryId,
      faction: gameState.playerFaction,
      capturedAt: Date.now(),
      allies: alliesRef.current.map(entity => ({ ...entity })),
      rivals: rivalsRef.current.map(entity => ({ ...entity })),
      fallen: fallenRef.current.map(entity => ({ ...entity })),
      bullets: bulletsRef.current.map(entity => ({ ...entity })),
      obstacles: obstaclesRef.current.map(entity => ({ ...entity })),
      spawnElapsedMs: spawnElapsedMsRef.current,
      autoRecruitElapsedMs: autoRecruitElapsedMsRef.current,
      controlPoints: controlPointsRef.current.map(point => ({ ...point })),
      operationPhase: operationPhaseRef.current,
      finalResistanceSpawned: finalResistanceSpawnedRef.current,
      finalResistanceWave: finalResistanceWaveRef.current,
      campaignMilestonesTriggered: [...campaignMilestonesTriggeredRef.current]
    }),
    getDistrictOperationStatus: () => getDistrictStatus(),
    deployRecruit: (_origin: RecruitOrigin, position?: { x: number; y: number }) => {
      if (alliesRef.current.length >= gameState.maxAllies) {
        return { created: 0, capacityReached: true };
      }

      const fuzilChance = getFuzileiroChance(gameState.upgrades['boca_fuzileiros_elite'] || 0);
      const isFuzil = Math.random() < fuzilChance;
      deployAllySoldier(position?.x, position?.y, isFuzil);
      let created = 1;
      let capacityReached = false;

      const doubleLvl = gameState.upgrades['sindicato_double_reinforcements'] || 0;
      const doubleTriggered = doubleLvl > 0 && Math.random() < getDoubleRecruitChance(doubleLvl);
      if (doubleTriggered) {
        if (alliesRef.current.length < gameState.maxAllies) {
          const extraX = position ? position.x + (Math.random() * 20 - 10) : undefined;
          const extraY = position ? position.y + (Math.random() * 20 - 10) : undefined;
          deployAllySoldier(extraX, extraY, isFuzil);
          created += 1;
          addFloatingText('+1 REFORÇO EXTRA!', position?.x ?? 300, (position?.y ?? 380) - 22, '#38bdf8');
        } else {
          capacityReached = true;
          addFloatingText('CAPACIDADE ATINGIDA', position?.x ?? 300, (position?.y ?? 380) - 22, '#f59e0b');
        }
      }

      return { created, capacityReached };
    }
  }), [gameState.maxAllies, gameState.upgrades, gameState.runId, gameState.currentTerritoryId, gameState.playerFaction, deployAllySoldier, addFloatingText, getDistrictStatus]);

  // Spawn rival soldier based on territory pool (emerges organically from tactical buildings like Incremancer)
  const spawnRival = useCallback((
    width: number,
    height: number,
    customX?: number,
    customY?: number,
    originBuildingName?: string,
    isReinforcement = false,
    forcedType?: RivalEntity['type'],
    forceExternal = false
  ): RivalEntity => {
    const pool = currentTerritory.rivalPool;
    let type: RivalEntity['type'] = forcedType ?? 'olheiro';
    if (!forcedType && isReinforcement) {
      const campaignProgress = territoryTakesRef.current / Math.max(1, dominationRequirement);
      type = pickWeightedRivalType(getDoctrineComposition(campaignProfile.reinforcement, campaignProgress));
    } else if (!forcedType) {
      const rand = Math.random() * 100;
      let cumulative = pool.olheiro;
      if (rand < cumulative) type = 'olheiro';
      else if (rand < (cumulative += pool.soldado_pistola)) type = 'soldado_pistola';
      else if (rand < (cumulative += pool.atirador_fuzil)) type = 'atirador_fuzil';
      else if (rand < (cumulative += pool.gerente_boca)) type = 'gerente_boca';
      else if (rand < (cumulative += pool.blindado_choque)) type = 'blindado_choque';
      else type = 'chefe_morro';
    }
    let x = customX !== undefined ? customX : 0;
    let y = customY !== undefined ? customY : 0;
    let bName = originBuildingName;
    let spawnSource: 'custom' | 'building' | 'external' = customX !== undefined && customY !== undefined ? 'custom' : 'external';

    if (customX === undefined || customY === undefined) {
      const rivalBuildings = tacticalBuildings.filter(building => {
        if (!building.isRivalHub || capturedBuildingIdsRef.current.has(building.id)) return false;
        const point = controlPointsRef.current.find(item => item.buildingId === building.id);
        const occupationSuppressesHub = operationEnabled && point?.status === 'contested' && point.progress > 0.05;
        return !occupationSuppressesHub;
      });
      // 0.5.7: once the district belongs to the player, occupied structures stay silent.
      // Rival pressure continues, but reinforcements enter through the external perimeter.
      if (!forceExternal && !territoryDominatedRef.current && rivalBuildings.length > 0) {
        const picked = rivalBuildings[Math.floor(Math.random() * rivalBuildings.length)];
        x = picked.doorX + (Math.random() * 14 - 7);
        y = picked.doorY + (Math.random() * 10 - 5);
        bName = picked.label;
        spawnSource = 'building';
      } else {
        spawnSource = 'external';
        const entries = getCampaignExternalEntries(currentTerritory.id, width, height);
        const preferredEntryIndex = selectExternalEntryIndex(
          campaignProfile.reinforcement, entries.length, externalSpawnCursorRef.current, Math.random()
        );
        externalSpawnCursorRef.current += 1;
        const flowEntry = selectDecongestedExternalEntry(
          currentTerritory.id, preferredEntryIndex, entries, [...rivalsRef.current, ...alliesRef.current]
        );
        if (flowEntry.redirected) perfRef.current.flowLaneRedirects += 1;
        const picked = entries[flowEntry.index] ?? entries[0];
        x = picked.x;
        y = picked.y;
        bName = picked.label;
      }
    }

    // Door emergence smoke puff
    if (isReinforcement) {
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7),
        x,
        y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.4 - Math.random() * 0.4,
        color: 'rgba(226, 232, 240, 0.6)',
        alpha: 0.7,
        size: 7 + Math.random() * 5,
        life: 0.45,
        maxLife: 0.45,
        type: 'smoke',
        friction: 0.94
      });
      if (bName) {
        addFloatingText(`⚠ REFORÇO · ${bName}`, x, y - 14, factionConfig.rivalColor);
      }
    }

    const healthMult = currentTerritory.healthMultiplier;
    const damageMult = currentTerritory.damageMultiplier;

    let baseHp = 35;
    let baseDmg = 5;
    let speed = 1.1;
    let color = factionConfig.rivalColor;
    let name = 'Olheiro Rival';
    let radius = 10;
    let attackRange = 20;

    switch (type) {
      case 'olheiro':
        baseHp = 35 * healthMult;
        baseDmg = 4 * damageMult;
        speed = 1.25;
        name = `Olheiro do ${factionConfig.rivalTag}`;
        radius = 10;
        attackRange = 22;
        break;
      case 'soldado_pistola':
        baseHp = 75 * healthMult;
        baseDmg = 12 * damageMult;
        speed = 0.95;
        name = `Soldado Pistoleiro (${factionConfig.rivalTag})`;
        radius = 12;
        attackRange = 110;
        break;
      case 'atirador_fuzil':
        baseHp = 55 * healthMult;
        baseDmg = 18 * damageMult;
        speed = 0.9;
        name = `Fuzileiro Fal / AR (${factionConfig.rivalTag})`;
        radius = 11;
        attackRange = 180;
        break;
      case 'gerente_boca':
        baseHp = 95 * healthMult;
        baseDmg = 10 * damageMult;
        speed = 0.85;
        name = `Gerente do Ponto (${factionConfig.rivalTag})`;
        radius = 13;
        attackRange = 130;
        break;
      case 'blindado_choque':
        baseHp = 260 * healthMult;
        baseDmg = 28 * damageMult;
        speed = 0.75;
        name = 'Segurança Pesado Encouraçado';
        radius = 15;
        attackRange = 35;
        break;
      case 'chefe_morro':
        baseHp = 580 * healthMult;
        baseDmg = 42 * damageMult;
        speed = 0.85;
        name = `Chefe de Área (${factionConfig.rivalTag})`;
        radius = 18;
        attackRange = 140;
        break;
    }

    const safeSpawn = findClearWorldPosition(
      x, y, radius + 2, worldColliders,
      rivalsRef.current.length + currentTerritory.id * 17
    );
    const coverSafeSpawn = resolveUnitAgainstCoverObstacles(
      safeSpawn.x, safeSpawn.y, radius + 2, obstaclesRef.current
    );
    x = coverSafeSpawn.x;
    y = coverSafeSpawn.y;

    if (import.meta.env.DEV) {
      (window as unknown as { __LAST_RIVAL_SPAWN__?: { source: string; label?: string; x: number; y: number; territoryId: number; dominated: boolean; type: RivalEntity['type']; doctrine: string } }).__LAST_RIVAL_SPAWN__ = {
        source: spawnSource, label: bName, x, y, territoryId: currentTerritory.id,
        dominated: territoryDominatedRef.current, type, doctrine: campaignProfile.reinforcement.name
      };
    }

    const initialPatrol = findClearWorldPosition(
      x + (Math.random() * 70 - 35), y + (Math.random() * 50 - 25), radius + 2,
      worldColliders, rivalsRef.current.length + 97
    );

    const entity: RivalEntity = {
      id: Math.random().toString(36).substring(7),
      type,
      name,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.25 * speed,
      vy: (Math.random() - 0.5) * 0.25 * speed,
      hp: baseHp,
      maxHp: baseHp,
      speed,
      damage: baseDmg,
      attackRange,
      attackCooldown: type === 'atirador_fuzil' ? 1.7 : 0.9,
      attackTimer: 0,
      targetId: null,
      state: 'patrol',
      color,
      radius,
      factionTag: factionConfig.rivalTag,
      variant: Math.floor(Math.random() * 3),
      originBuilding: bName,
      patrolTargetX: initialPatrol.x,
      patrolTargetY: initialPatrol.y,
      patrolWaitTimer: 1.0 + Math.random() * 2.5
    };
    rivalsRef.current.push(entity);
    return entity;
  }, [currentTerritory, campaignProfile, factionConfig, addFloatingText, tacticalBuildings, worldColliders, operationEnabled]);

  // Initial battlefield or validated snapshot restore
  useEffect(() => {
    floatingTextsRef.current = [];
    groundMarksRef.current = [];
    particlesRef.current = [];
    cameraRef.current = clampCamera(createDefaultCamera(), viewportRef.current);
    setZoom(cameraRef.current.zoom);

    const w = WORLD_WIDTH;
    const h = WORLD_HEIGHT;
    const snapshot = gameState.battleSnapshot;
    const canRestore = Boolean(
      snapshot &&
      snapshot.version === 1 &&
      snapshot.runId === gameState.runId &&
      snapshot.territoryId === gameState.currentTerritoryId &&
      snapshot.faction === gameState.playerFaction
    );

    if (canRestore && snapshot) {
      alliesRef.current = snapshot.allies.map(entity => rebaseAllyStatsForState({ ...entity }, gameState));
      rivalsRef.current = snapshot.rivals.map(entity => ({ ...entity }));
      fallenRef.current = snapshot.fallen.map(entity => ({ ...entity }));
      bulletsRef.current = snapshot.bullets.map(entity => ({ ...entity }));
      const legacyObstacleIds = new Set(['car_main','dumpster_left','wall_right','gas_tank_1','gas_tank_2']);
      // 0.9.2: one-time migration for cover sockets authored before the world-cohesion pass.
      const pre092Sockets: Record<string,[number,number]> = {
        t1_gas_a:[.29,.29],t1_gas_b:[.73,.34],
        t2_car:[.76,.70],t2_gas_a:[.23,.62],t2_gas_b:[.81,.55],
        t3_gas_a:[.25,.36],t3_gas_b:[.73,.37],
        t4_car:[.74,.68],t4_wall_a:[.30,.57],t4_wall_b:[.68,.37],t4_gas:[.18,.62]
      };
      const snapshotUsesPre092Obstacles = snapshot.obstacles.some(entity => {
        const old = pre092Sockets[entity.id];
        return old && Math.abs(entity.x-w*old[0])<2 && Math.abs(entity.y-h*old[1])<2;
      });
      const snapshotUsesLegacyObstacles = snapshotUsesPre092Obstacles || snapshot.obstacles.some(entity => legacyObstacleIds.has(entity.id));
      obstaclesRef.current = snapshot.obstacles.length > 0 && !snapshotUsesLegacyObstacles
        ? snapshot.obstacles.map(entity => ({ ...entity }))
        : createDefaultObstacles(w, h, currentTerritory.id);

      // 0.5.1 migration safety: saves created before the solid-world pass may contain
      // troops inside newly solid architecture. Eject them once on restore instead of
      // letting old coordinates make the new scenery look non-physical.
      for (const ally of alliesRef.current) {
        const worldSafe = resolveCircleMotionAgainstWorld(ally.x, ally.y, ally.radius + 1, 0, 0, worldColliders);
        const coverSafe = resolveUnitAgainstCoverObstacles(worldSafe.x, worldSafe.y, ally.radius + 1, obstaclesRef.current);
        ally.x = coverSafe.x; ally.y = coverSafe.y;
      }
      for (const rival of rivalsRef.current) {
        const worldSafe = resolveCircleMotionAgainstWorld(rival.x, rival.y, rival.radius + 1, 0, 0, worldColliders);
        const coverSafe = resolveUnitAgainstCoverObstacles(worldSafe.x, worldSafe.y, rival.radius + 1, obstaclesRef.current);
        rival.x = coverSafe.x; rival.y = coverSafe.y;
      }
      spawnElapsedMsRef.current = snapshot.spawnElapsedMs;
      autoRecruitElapsedMsRef.current = snapshot.autoRecruitElapsedMs;

      if (operationEnabled) {
        const hasPhysicalOperationSnapshot = Boolean(snapshot.controlPoints && snapshot.controlPoints.length > 0);
        const authoredPoints = createDistrictControlPoints();
        const authoredByBuilding = new Map(authoredPoints.map(point => [point.buildingId, point]));
        const restoredPoints = hasPhysicalOperationSnapshot
          ? snapshot.controlPoints!.map(point => {
              const authored = authoredByBuilding.get(point.buildingId);
              return authored ? { ...point, x: authored.x, y: authored.y, label: authored.label } : { ...point };
            })
          : authoredPoints;
        controlPointsRef.current = restoredPoints;
        capturedBuildingIdsRef.current = new Set(
          restoredPoints.filter(point => point.status === 'captured').map(point => point.buildingId)
        );
        // 0.9.11 migration: counter-only snapshots stored 'dominated' while physical capture was disabled.
        operationPhaseRef.current = hasPhysicalOperationSnapshot ? (snapshot.operationPhase ?? 'capture') : 'capture';
        finalResistanceSpawnedRef.current = hasPhysicalOperationSnapshot && Boolean(snapshot.finalResistanceSpawned);
        finalResistanceWaveRef.current = hasPhysicalOperationSnapshot ? (snapshot.finalResistanceWave ?? 0) : 0;
      } else {
        controlPointsRef.current = [];
        capturedBuildingIdsRef.current = new Set();
        operationPhaseRef.current = 'dominated';
        finalResistanceSpawnedRef.current = false;
        finalResistanceWaveRef.current = 0;
      }
      territoryDominatedRef.current = operationPhaseRef.current === 'dominated';
      const restoredProgress = territoryTakesRef.current / Math.max(1, dominationRequirement);
      campaignMilestonesTriggeredRef.current = new Set(
        snapshot.campaignMilestonesTriggered ??
        campaignProfile.milestones.filter(milestone => restoredProgress >= milestone.at).map(milestone => milestone.id)
      );
      restoredSnapshotRef.current = true;
      syncDistrictHud();
      return;
    }

    restoredSnapshotRef.current = false;
    alliesRef.current = [];
    fallenRef.current = [];
    bulletsRef.current = [];
    obstaclesRef.current = createDefaultObstacles(w, h, currentTerritory.id);
    spawnElapsedMsRef.current = 0;
    autoRecruitElapsedMsRef.current = 0;
    externalSpawnCursorRef.current = 0;
    allyBodySolveElapsedRef.current = 0;
    captureUpdateElapsedRef.current = 0;

    controlPointsRef.current = createDistrictControlPoints();
    capturedBuildingIdsRef.current = new Set();
    operationPhaseRef.current = operationEnabled ? 'capture' : 'dominated';
    territoryDominatedRef.current = operationPhaseRef.current === 'dominated';
    finalResistanceSpawnedRef.current = false;
    finalResistanceWaveRef.current = 0;
    const freshProgress = territoryTakesRef.current / Math.max(1, dominationRequirement);
    campaignMilestonesTriggeredRef.current = new Set(
      campaignProfile.milestones.filter(milestone => freshProgress >= milestone.at).map(milestone => milestone.id)
    );

    const rivalBuildings = tacticalBuildings.filter(b => b.isRivalHub);
    const openingTypes = currentTerritory.openingGarrison.flatMap(group =>
      Array.from({ length: group.count }, () => group.type)
    ).slice(0, currentTerritory.maxRivals);
    const initialGarrison = openingTypes.length;
    rivalsRef.current = [];

    // 0.4.2: every fresh territory starts already defended by a fixed, authored garrison.
    // Later reinforcements remain random and continue to use rivalPool/spawnRate.
    if (rivalBuildings.length > 0) {
      for (let i = 0; i < initialGarrison; i++) {
        const b = rivalBuildings[i % rivalBuildings.length];
        const localSlot = Math.floor(i / rivalBuildings.length);
        const ring = Math.floor(localSlot / 6);
        const angle = (localSlot % 6) * (Math.PI / 3) + (i % rivalBuildings.length) * 0.35;
        const radius = 20 + ring * 18;
        const x = b.doorX + Math.cos(angle) * radius;
        const y = b.doorY + Math.sin(angle) * radius * 0.72;
        spawnRival(w, h, x, y, b.label, false, openingTypes[i]);
      }
    } else {
      for (let i = 0; i < initialGarrison; i++) {
        const columns = Math.max(1, Math.ceil(Math.sqrt(initialGarrison)));
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = 70 + col * ((w - 140) / Math.max(1, columns - 1));
        const y = 70 + row * 42;
        spawnRival(w, h, x, Math.min(h * 0.5, y), undefined, false, openingTypes[i]);
      }
    }
    syncDistrictHud();
  }, [
    gameState.currentTerritoryId, gameState.playerFaction, gameState.runId,
    currentTerritory, spawnRival, tacticalBuildings, worldColliders, operationEnabled,
    createDistrictControlPoints, syncDistrictHud
  ]);

  // D6: upgrades globais recalibram tropas vivas sem conceder cura gratuita.
  useEffect(() => {
    if (alliesRef.current.length === 0) return;
    alliesRef.current = alliesRef.current.map(ally => rebaseAllyStatsForState(ally, gameState));
  }, [
    gameState.upgrades['armory_bulletproof_vest'],
    gameState.upgrades['armory_heavy_calibers'],
    gameState.talents['talent_veteran_enforcers']
  ]);

  // Starter gang talent spawn
  useEffect(() => {
    const starterLvl = gameState.talents['talent_starter_gang'] || 0;
    if (!restoredSnapshotRef.current && starterLvl > 0 && alliesRef.current.length === 0) {
      for (let i = 0; i < getStarterGangCount(starterLvl); i++) {
        deployAllySoldier(WORLD_WIDTH / 2 + (i - 1) * 28, WORLD_HEIGHT - 70 - ((i % 2) * 20));
      }
    }
  }, [gameState.talents, deployAllySoldier]);

  // Canvas Click handler (unprojected from zoom and pan)
  const executeCanvasClick = (clientX: number, clientY: number) => {
    const coords = getCanvasCoords(clientX, clientY);
    const clickX = coords.x;
    const clickY = coords.y;

    // 1. Check if clicking on a fallen rival to scavenge directly
    for (let i = fallenRef.current.length - 1; i >= 0; i--) {
      const f = fallenRef.current[i];
      if (Math.hypot(f.x - clickX, f.y - clickY) <= 18) {
        if (f.bountyCash > 0 || f.bountyAmmo > 0) {
          const credited = onScavengeDrop
            ? onScavengeDrop(f.bountyCash, f.bountyAmmo, false)
            : { cash: f.bountyCash, ammo: f.bountyAmmo, respect: 0, contacts: 0 };
          addFloatingText(formatEconomicRewardFeedback(credited), f.x, f.y, '#38bdf8');
        } else {
          addFloatingText('Sem Espólios Úteis', f.x, f.y, '#94a3b8');
        }
        fallenRef.current.splice(i, 1);
        return;
      }
    }

    // 2. Convocação centralizada: valida e materializa pelo mesmo comando do botão/Espaço/automação
    const result = onSpawnRecruit('canvas', { x: clickX, y: clickY });
    if (!result.ok) {
      const refusalText = result.reason === 'paused'
        ? 'COMBATE PAUSADO'
        : result.reason === 'capacity'
          ? 'BONDE NO LIMITE!'
          : result.reason === 'insufficient_intel'
            ? 'INTELIGÊNCIA INSUFICIENTE'
            : 'COMBATE INDISPONÍVEL';
      addFloatingText(refusalText, clickX, clickY, '#ef4444');
    }
  };

  // Pointer Events: drag pans Camera2D, quick tap/click remains a recruit command.
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    setShowControlGuide(false);
    activePointerIdRef.current = e.pointerId;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    cameraStartRef.current = { ...cameraRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && activePointerIdRef.current === e.pointerId) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > 4) {
        if (!hasDraggedRef.current) {
          hasDraggedRef.current = true;
          setIsDraggingState(true);
        }
        cameraRef.current = panCameraByScreenDelta(
          cameraStartRef.current,
          dx,
          dy,
          viewportRef.current
        );
      }
    }

    pointerInsideRef.current = true;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;
    mousePosRef.current = coords;

    // Hover hit-testing is UI-only; 20 Hz is enough and avoids O(units) work per raw pointer event.
    const hoverNow = e.timeStamp || performance.now();
    if (hoverNow - hoverLastCheckMsRef.current < 50) return;
    hoverLastCheckMsRef.current = hoverNow;

    let found = false;
    for (const r of rivalsRef.current) {
      if ((r.x - x) ** 2 + (r.y - y) ** 2 <= (r.radius + 8) ** 2) {
        hoveredEntityRef.current = { type: 'rival', entityId: r.id, name: `${r.name} (HP: ${Math.round(r.hp)}/${Math.round(r.maxHp)})` };
        found = true;
        break;
      }
    }
    if (!found) {
      for (const a of alliesRef.current) {
        if ((a.x - x) ** 2 + (a.y - y) ** 2 <= (a.radius + 8) ** 2) {
          hoveredEntityRef.current = { type: 'ally', entityId: a.id, name: `${a.name} (HP: ${Math.round(a.hp)}/${Math.round(a.maxHp)})` };
          found = true;
          break;
        }
      }
    }
    if (!found) {
      for (const f of fallenRef.current) {
        if ((f.x - x) ** 2 + (f.y - y) ** 2 <= 256) {
          if (f.bountyCash > 0 || f.bountyAmmo > 0) {
            const lootDesc = f.bountyAmmo > 0
              ? `+$${f.bountyCash} & +${f.bountyAmmo} Mun`
              : `+$${f.bountyCash}`;
            hoveredEntityRef.current = { type: 'fallen', name: `Espólios: ${lootDesc} (Clique ou passe por cima)` };
          } else {
            hoveredEntityRef.current = { type: 'fallen', name: 'Corpo abatido (sem espólios)' };
          }
          found = true;
          break;
        }
      }
    }
    if (!found) {
      for (const obs of obstaclesRef.current) {
        if (!obs.destroyed && Math.abs(obs.x - x) <= obs.w / 2 + 4 && Math.abs(obs.y - y) <= obs.h / 2 + 4) {
          const obsLabel = obs.type === 'carro_abandonado'
            ? 'Carro Abandonado (Sucata de Cobertura)'
            : obs.type === 'cacamba_entulho'
              ? 'Caçamba de Entulho (Blindagem de Concreto)'
              : obs.type === 'muro_concreto'
                ? 'Barricada de Concreto (Proteção Balística)'
                : 'Botijão de Gás P-13 (CUIDADO: EXPLOSIVO AO TIRO!)';
          hoveredEntityRef.current = { type: 'obstacle', entityId: obs.id, name: `${obsLabel} - HP: ${Math.round(obs.hp)}/${obs.maxHp}` };
          found = true;
          break;
        }
      }
    }
    if (!found) {
      hoveredEntityRef.current = null;
    }
  };

  const finishPointerInteraction = (e: React.PointerEvent<HTMLCanvasElement>, allowClick: boolean) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    const wasDragging = hasDraggedRef.current;
    isDraggingRef.current = false;
    hasDraggedRef.current = false;
    activePointerIdRef.current = null;
    setIsDraggingState(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (allowClick && !wasDragging && e.button === 0) {
      executeCanvasClick(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    finishPointerInteraction(e, true);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    finishPointerInteraction(e, false);
    pointerInsideRef.current = false;
    hoveredEntityRef.current = null;
  };

  const handlePointerLeave = () => {
    pointerInsideRef.current = false;
    if (!isDraggingRef.current) hoveredEntityRef.current = null;
  };

  const centerCameraFromMinimap = useCallback((clientX: number, clientY: number) => {
    const minimap = minimapCanvasRef.current;
    if (!minimap) return;
    const rect = minimap.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    const ny = Math.max(0, Math.min(1, (clientY - rect.top) / Math.max(1, rect.height)));
    cameraRef.current = clampCamera({
      ...cameraRef.current,
      centerX: nx * WORLD_WIDTH,
      centerY: ny * WORLD_HEIGHT
    }, viewportRef.current);
  }, []);

  const handleMinimapPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    minimapDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    centerCameraFromMinimap(e.clientX, e.clientY);
    setShowControlGuide(false);
  };
  const handleMinimapPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!minimapDraggingRef.current) return;
    e.stopPropagation();
    centerCameraFromMinimap(e.clientX, e.clientY);
  };
  const handleMinimapPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    minimapDraggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };


  // Main 60 FPS Autonomous Warfare Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const gameLoop = (currentTime: number) => {
      if (!isRunning) return;

      const rawDelta = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      const speed = gameState.gameSpeed;
      const visualDt = Math.min(rawDelta, 0.1) * speed;
      const fixedStep = 1 / 60;
      if (speed > 0) {
        simulationAccumulatorRef.current += Math.min(rawDelta, 0.1) * speed;
      }

      const width = WORLD_WIDTH;
      const height = WORLD_HEIGHT;
      const { width: viewportWidth, height: viewportHeight, dpr } = viewportRef.current;
      let simulationSteps = 0;
      let targetSearchesThisFrame = 0;
      let projectileChecksThisFrame = 0;
      let unstuckTriggersThisFrame = 0;
      let edgeRecoveriesThisFrame = 0;
      let hardUnstuckTriggersThisFrame = 0;
      let rivalAiMsThisFrame = 0;
      let allyAiMsThisFrame = 0;
      let projectileMsThisFrame = 0;
      const perfSimulationStart = import.meta.env.DEV ? performance.now() : 0;
      const allyById = new Map<string, AllyEntity>(alliesRef.current.map(a => [a.id, a]));
      const rivalById = new Map<string, RivalEntity>(rivalsRef.current.map(r => [r.id, r]));

      while (speed > 0 && simulationAccumulatorRef.current >= fixedStep && simulationSteps < 8) {
        const dt = fixedStep;
        // Combat/movement follow simulated time; expensive perception/steering decisions follow
        // wall-clock cadence so 5x speed does not accidentally make O(N²) AI run five times harder.
        const decisionDt = dt / Math.max(1, speed);
        simulationAccumulatorRef.current -= fixedStep;
        simulationSteps += 1;
        const simulatedMs = dt * 1000;
        spawnElapsedMsRef.current += simulatedMs;

        const autoRecruitLvl = gameState.upgrades['sindicato_auto_recruit'] || 0;
        if (autoRecruitLvl > 0 && gameState.autoRecruitFallen) {
          const autoIntervalMs = (getAutoRecruitIntervalSeconds(autoRecruitLvl) || 1.2) * 1000;
          autoRecruitElapsedMsRef.current += simulatedMs;
          if (autoRecruitElapsedMsRef.current >= autoIntervalMs) {
            autoRecruitElapsedMsRef.current -= autoIntervalMs;
            onSpawnRecruit('auto');
          }
        } else {
          autoRecruitElapsedMsRef.current = 0;
        }

        // --- 0.5: CAPTURE POINTS, REINFORCEMENTS & FINAL RESISTANCE ---
        if (operationEnabled && operationPhaseRef.current === 'capture') {
          captureUpdateElapsedRef.current += dt;
          if (captureUpdateElapsedRef.current >= CAPTURE_TICK_SECONDS) {
            const captureDt = Math.min(.25, captureUpdateElapsedRef.current);
            captureUpdateElapsedRef.current = 0;
            for (const point of controlPointsRef.current) {
            if (point.status === 'captured') continue;

            let alliesNear = 0;
            let rivalsNear = 0;
            const captureRadiusSq = CAPTURE_RADIUS * CAPTURE_RADIUS;
            const contestRadiusSq = CONTEST_RADIUS * CONTEST_RADIUS;
            for (const ally of alliesRef.current) {
              const dx = ally.x - point.x;
              const dy = ally.y - point.y;
              if (dx * dx + dy * dy <= captureRadiusSq) alliesNear += 1;
            }
            for (const rival of rivalsRef.current) {
              const dx = rival.x - point.x;
              const dy = rival.y - point.y;
              if (dx * dx + dy * dy <= contestRadiusSq) rivalsNear += 1;
            }

            if (alliesNear > 0 && rivalsNear === 0) {
              point.status = 'contested';
              const captureRate = 1 + Math.min(1.5, Math.max(0, alliesNear - 1) * 0.3);
              point.progress = Math.min(1, point.progress + (captureDt * captureRate) / CAPTURE_SECONDS);
            } else if (alliesNear > 0 && rivalsNear > 0) {
              point.status = 'contested';
              point.progress = Math.max(0, point.progress - captureDt * 0.025);
            } else {
              point.progress = Math.max(0, point.progress - captureDt * 0.05);
              point.status = 'rival';
            }

            if (point.progress >= 1) {
              point.progress = 1;
              point.status = 'captured';
              capturedBuildingIdsRef.current.add(point.buildingId);
              addFloatingText('POSIÇÃO TOMADA', point.x, point.y - 18, factionConfig.color);
              soundEngine.playUpgradeBuy();
            }
          }

          if (controlPointsRef.current.length > 0 && controlPointsRef.current.every(point => point.status === 'captured') && territoryTakesRef.current >= dominationRequirement) {
            operationPhaseRef.current = 'final_resistance';
            finalResistanceSpawnedRef.current = false;
            finalResistanceWaveRef.current = 0;
            spawnElapsedMsRef.current = 0;
            addFloatingText('ULTIMA RESISTENCIA', width / 2, 100, '#fbbf24');
          }
          syncDistrictHud();
          }
        } else {
          captureUpdateElapsedRef.current = 0;
        }

        if (operationEnabled && operationPhaseRef.current === 'final_resistance' && !finalResistanceSpawnedRef.current) {
          const requiredNeutralizations = currentTerritory.requiredNeutralizations;
          const missingNeutralizations = Math.max(0, requiredNeutralizations - territoryTakesRef.current);
          const waveSize = Math.min(6, Math.max(3, missingNeutralizations));
          const waveIndex = finalResistanceWaveRef.current;
          for (let i = 0; i < waveSize; i++) {
            const forcedType: RivalEntity['type'] = waveIndex === 0 && i === 0
              ? 'chefe_morro'
              : i % 3 === 0 ? 'atirador_fuzil' : 'soldado_pistola';
            const entity = spawnRival(
              width, height,
              width / 2 + (i - (waveSize - 1) / 2) * 34,
              78 + (i % 2) * 24,
              'Resistencia Externa',
              false,
              forcedType
            );
            entity.isFinalResistance = true;
          }
          finalResistanceWaveRef.current += 1;
          finalResistanceSpawnedRef.current = true;
          syncDistrictHud();
        }

        if (
          operationEnabled &&
          operationPhaseRef.current === 'final_resistance' &&
          finalResistanceSpawnedRef.current &&
          rivalsRef.current.length === 0
        ) {
          const requiredNeutralizations = currentTerritory.requiredNeutralizations;
          const neutralizationsReady = territoryTakesRef.current >= requiredNeutralizations;
          if (neutralizationsReady) {
            operationPhaseRef.current = 'dominated';
            territoryDominatedRef.current = true;
            addFloatingText('DISTRITO DOMINADO', width / 2, 115, factionConfig.color);
            soundEngine.playUpgradeBuy();
          } else {
            // Captured hubs remain silent; remaining resistance enters from outside the district.
            finalResistanceSpawnedRef.current = false;
            spawnElapsedMsRef.current = 0;
          }
          syncDistrictHud();
        }

        // 0.6E: authored operation milestones create district-specific counterattacks.
        if (!territoryDominatedRef.current) {
          const campaignProgress = territoryTakesRef.current / Math.max(1, dominationRequirement);
          const pendingMilestone = getPendingCampaignMilestones(
            campaignProfile, campaignProgress, campaignMilestonesTriggeredRef.current
          )[0];
          if (pendingMilestone) {
            const availableSlots = Math.max(0, currentTerritory.maxRivals - rivalsRef.current.length);
            const responseTypes = pendingMilestone.forcedTypes.slice(0, availableSlots);
            if (responseTypes.length > 0) {
              campaignMilestonesTriggeredRef.current.add(pendingMilestone.id);
              addFloatingText(pendingMilestone.label, width / 2, 92, '#fbbf24');
              for (const forcedType of responseTypes) {
                spawnRival(width, height, undefined, undefined, pendingMilestone.label, true, forcedType, true);
              }
              if (import.meta.env.DEV) {
                (window as unknown as { __CAMPAIGN_EVENT__?: { id:string; label:string; progress:number; spawned:number } }).__CAMPAIGN_EVENT__ = {
                  id: pendingMilestone.id, label: pendingMilestone.label, progress: campaignProgress, spawned: responseTypes.length
                };
              }
            }
          }
        }

        const fixedMinGarrison = Math.min(currentTerritory.maxRivals, 4 + currentTerritory.id * 2);
        const currentRivals = rivalsRef.current.length;
        const activeRivalBuildings = tacticalBuildings.filter(building => {
          if (!building.isRivalHub || capturedBuildingIdsRef.current.has(building.id)) return false;
          const point = controlPointsRef.current.find(item => item.buildingId === building.id);
          const occupationSuppressesHub = operationEnabled && point?.status === 'contested' && point.progress > 0.05;
          return !occupationSuppressesHub;
        });
        const totalRivalHubs = Math.max(1, operationEnabled ? controlPointsRef.current.length : activeRivalBuildings.length);
        const activeHubRatio = operationEnabled ? activeRivalBuildings.length / totalRivalHubs : 1;
        const normalReinforcementsEnabled = !operationEnabled || operationPhaseRef.current !== 'final_resistance';
        const reinforcementsFromOutside = territoryDominatedRef.current || activeRivalBuildings.length === 0;

        if (normalReinforcementsEnabled && (activeRivalBuildings.length > 0 || reinforcementsFromOutside)) {
          const effectiveMinGarrison = operationEnabled && !reinforcementsFromOutside
            ? Math.max(1, Math.ceil(fixedMinGarrison * activeHubRatio))
            : fixedMinGarrison;

          if (currentRivals === 0) {
            const recoveryBatch = getReinforcementBatchSize(
              campaignProfile.reinforcement, true, territoryDominatedRef.current, currentTerritory.maxRivals
            );
            for (let i = 0; i < recoveryBatch; i++) {
              if (reinforcementsFromOutside) {
                spawnRival(width, height, undefined, undefined, undefined, true);
              } else {
                const building = activeRivalBuildings[i % activeRivalBuildings.length];
                spawnRival(
                  width, height,
                  building.doorX + (Math.random() * 32 - 16),
                  building.doorY + (Math.random() * 24 - 12),
                  building.label, true
                );
              }
            }
            spawnElapsedMsRef.current = 0;
          } else {
            const isSeverelyDepleted = currentRivals < Math.ceil(effectiveMinGarrison * 0.45);
            const needsReinforcements = currentRivals < effectiveMinGarrison;
            const pressureSlowdown = operationEnabled ? 1 + (1 - activeHubRatio) * 0.9 : 1;
            const baseInterval = (isSeverelyDepleted
              ? Math.min(650, currentTerritory.spawnRate * 0.3)
              : (needsReinforcements
                ? Math.min(1200, currentTerritory.spawnRate * 0.5)
                : currentTerritory.spawnRate)) * pressureSlowdown;
            const effectiveInterval = getDoctrineInterval(baseInterval, campaignProfile.reinforcement);

            if (spawnElapsedMsRef.current >= effectiveInterval && currentRivals < currentTerritory.maxRivals) {
              const availableSlots = currentTerritory.maxRivals - currentRivals;
              const batchSize = getReinforcementBatchSize(
                campaignProfile.reinforcement, isSeverelyDepleted, territoryDominatedRef.current, availableSlots
              );
              for (let batchIndex = 0; batchIndex < batchSize; batchIndex++) {
                spawnRival(width, height, undefined, undefined, undefined, true);
              }
              spawnElapsedMsRef.current = 0;
            }
          }
        }

        // --- 2. RIVALS AI & COMBAT ---
        const perfRivalAiStart = import.meta.env.DEV ? performance.now() : 0;
        const rivalManagers = rivalsRef.current.filter(rival => rival.hp > 0 && rival.type === 'gerente_boca');
        for (let i = rivalsRef.current.length - 1; i >= 0; i--) {
          const r = rivalsRef.current[i];

          // Check if eliminated
          if (r.hp <= 0) {
            const isBoss = r.type === 'chefe_morro' || r.type === 'blindado_choque';
            soundEngine.playRivalDown(isBoss);

            // Nerfed corpse scavenging: only some enemies carry loot
            let bountyCash = 0;
            let bountyAmmo = 0;
            const roll = Math.random();

            if (r.type === 'olheiro') {
              if (roll < 0.30) {
                bountyCash = Math.floor(Math.random() * 3) + 2;
                bountyAmmo = Math.random() < 0.10 ? 1 : 0;
              }
            } else if (r.type === 'soldado_pistola') {
              if (roll < 0.40) {
                bountyCash = Math.floor(Math.random() * 3) + 4;
                bountyAmmo = Math.random() < 0.20 ? 1 : 0;
              }
            } else if (r.type === 'atirador_fuzil') {
              if (roll < 0.50) {
                bountyCash = Math.floor(Math.random() * 4) + 6;
                bountyAmmo = Math.random() < 0.30 ? 1 : 0;
              }
            } else if (r.type === 'gerente_boca' || r.type === 'blindado_choque') {
              if (roll < 0.70) {
                bountyCash = Math.floor(Math.random() * 5) + 10;
                bountyAmmo = 1;
              }
            } else if (r.type === 'chefe_morro') {
              bountyCash = Math.floor(Math.random() * 10) + 20;
              bountyAmmo = 2;
            }

            const scaledLoot = scaleScavengeLoot(bountyCash, bountyAmmo, currentTerritory);
            bountyCash = scaledLoot.cash;
            bountyAmmo = scaledLoot.ammo;

            // Visual combat particles & shockwave
            addNeutralizationEffects(r.x, r.y, true, isBoss, bountyCash > 0 || bountyAmmo > 0);
            addGroundMark(r.x, r.y, 'bullet_mark');

            fallenRef.current.push({
              id: Math.random().toString(36).substring(7),
              x: r.x,
              y: r.y,
              type: r.type,
              name: r.name,
              decayTime: 16,
              maxDecayTime: 16,
              harvested: false,
              bountyCash,
              bountyAmmo
            });

            territoryTakesRef.current += 1;
            // Flip ownership immediately in simulation time so even reinforcements spawned
            // before React commits the score update already use external district entries.
            if (!operationEnabled && territoryTakesRef.current >= dominationRequirement) {
              territoryDominatedRef.current = true;
            }
            const reward = onRivalEliminated(r);
            addFloatingText(formatEconomicRewardFeedback(reward), r.x, r.y, '#10b981');
            rivalsRef.current.splice(i, 1);
            continue;
          }

          if (r.type === 'chefe_morro') {
            const bossProfile = getBossPhaseProfile(r.maxHp > 0 ? r.hp / r.maxHp : 1);
            const previousPhase = r.bossPhase ?? 1;
            r.bossPhase = bossProfile.phase;
            if (bossProfile.phase > previousPhase) {
              addFloatingText(bossProfile.label, r.x, r.y - 34, bossProfile.phase === 3 ? '#fb7185' : '#fbbf24');
            }
            if (bossProfile.phase >= 2 && !r.commandReinforcementCalled) {
              r.commandReinforcementCalled = true;
              const availableSlots = Math.max(0, currentTerritory.maxRivals - rivalsRef.current.length);
              const response = ['atirador_fuzil','gerente_boca'].slice(0, Math.min(2, availableSlots)) as RivalEntity['type'][];
              response.forEach(type => spawnRival(width, height, undefined, undefined, 'Comando do Chefe', true, type, true));
              if (import.meta.env.DEV) {
                const debugWindow = window as unknown as { __BOSS_COMMAND_CALLS__?: number };
                debugWindow.__BOSS_COMMAND_CALLS__ = (debugWindow.__BOSS_COMMAND_CALLS__ ?? 0) + (response.length > 0 ? 1 : 0);
              }
            }
            if (bossProfile.phase === 3 && !r.bossLastStandCalled) {
              r.bossLastStandCalled = true;
              const availableSlots = Math.max(0, currentTerritory.maxRivals - rivalsRef.current.length);
              const response = ['blindado_choque','gerente_boca'].slice(0, Math.min(2, availableSlots)) as RivalEntity['type'][];
              response.forEach(type => spawnRival(width, height, undefined, undefined, '?ltima Ordem', true, type, true));
              if (import.meta.env.DEV) {
                const debugWindow = window as unknown as { __BOSS_LAST_STAND_CALLS__?: number };
                debugWindow.__BOSS_LAST_STAND_CALLS__ = (debugWindow.__BOSS_LAST_STAND_CALLS__ ?? 0) + (response.length > 0 ? 1 : 0);
              }
            }
          }

          r.attackTimer -= dt;
          if (r.recoilTimer && r.recoilTimer > 0) {
            r.recoilTimer -= dt;
          }

          // Target caching: keep a valid target and only retarget at a staggered cadence.
          r.targetSearchTimer = (r.targetSearchTimer ?? 0) - decisionDt;
          let closestAlly: AllyEntity | null = r.targetId ? (allyById.get(r.targetId) ?? null) : null;
          if (closestAlly && closestAlly.hp <= 0) closestAlly = null;
          let minDistSq = closestAlly
            ? (closestAlly.x - r.x) ** 2 + (closestAlly.y - r.y) ** 2
            : Number.POSITIVE_INFINITY;
          const rivalDetourTargetLocked = !!closestAlly && (r.detourTimer ?? 0) > 0 && r.detourTargetId === closestAlly.id;
          if (!closestAlly || (r.targetSearchTimer <= 0 && !rivalDetourTargetLocked)) {
            targetSearchesThisFrame += 1;
            let best: AllyEntity | null = null;
            let bestDistSq = Number.POSITIVE_INFINITY;
            let bestScore = Number.POSITIVE_INFINITY;
            for (const a of alliesRef.current) {
              if (a.hp <= 0) continue;
              const dx = a.x - r.x;
              const dy = a.y - r.y;
              const dSq = dx * dx + dy * dy;
              const blockedByWorld = segmentWorldHit(r.x, r.y, a.x, a.y, 2, worldColliders) !== null;
              const score = dSq * (blockedByWorld ? 6.0 : 1);
              if (score < bestScore) { bestScore = score; bestDistSq = dSq; best = a; }
            }
            closestAlly = best;
            minDistSq = bestDistSq;
            r.targetId = best?.id ?? null;
            r.targetSearchTimer = 0.22 + (i % 7) * 0.012 + Math.random() * 0.035;
          }

          if (r.type === 'olheiro') {
            if (closestAlly && minDistSq < 180 * 180) {
              // Olheiro flees away from player troops
              const fleeAngle = Math.atan2(r.y - closestAlly.y, r.x - closestAlly.x);
              r.vx += (Math.cos(fleeAngle) * r.speed * 1.4 - r.vx) * Math.min(1, 10 * dt);
              r.vy += (Math.sin(fleeAngle) * r.speed * 1.4 - r.vy) * Math.min(1, 10 * dt);
              r.state = 'flee';
            } else {
              // Autonomous scout wandering and scanning perimeter
              r.state = 'patrol';
              if (r.patrolWaitTimer && r.patrolWaitTimer > 0) {
                r.patrolWaitTimer -= dt;
                r.vx *= 0.85;
                r.vy *= 0.85;
                r.facingAngle = (r.facingAngle || 0) + Math.sin(Date.now() * 0.003 + i) * 0.04;
              } else {
                const targetX = r.patrolTargetX ?? r.x;
                const targetY = r.patrolTargetY ?? r.y;
                const distToPatrol = Math.hypot(targetX - r.x, targetY - r.y);
                if (distToPatrol < 16 || !r.patrolTargetX) {
                  r.patrolWaitTimer = 1.5 + Math.random() * 2.5;
                  const patrol = findClearWorldPosition(
                    40 + Math.random() * (width - 80),
                    30 + Math.random() * (height * 0.52),
                    r.radius + 2, worldColliders, i + Math.floor(currentTime / 1000)
                  );
                  r.patrolTargetX = patrol.x;
                  r.patrolTargetY = patrol.y;
                  r.vx *= 0.6;
                  r.vy *= 0.6;
                } else {
                  const pAng = Math.atan2(targetY - r.y, targetX - r.x);
                  const desVx = Math.cos(pAng) * (r.speed * 0.75);
                  const desVy = Math.sin(pAng) * (r.speed * 0.75);
                  r.vx += (desVx - r.vx) * Math.min(1, 6 * dt);
                  r.vy += (desVy - r.vy) * Math.min(1, 6 * dt);
                }
              }
            }
          } else {
            // Armed Rival Soldiers
            if (closestAlly) {
              const combatAngle = Math.atan2(closestAlly.y - r.y, closestAlly.x - r.x);
              const combatDistance = Math.sqrt(minDistSq);
              const role = getRivalCombatRole(r.type);
              const preferredRange = r.attackRange * role.holdRangeFactor;
              const retreatRange = r.attackRange * role.retreatRangeFactor;
              const rivalInAttackRange = minDistSq <= r.attackRange * r.attackRange;
              r.lineOfSightTimer = (r.lineOfSightTimer ?? 0) - decisionDt;
              if (rivalInAttackRange && (r.lineOfSightTargetId !== closestAlly.id || r.lineOfSightTimer <= 0)) {
                r.lineOfSightTargetId = closestAlly.id;
                r.lineOfSightClear = segmentWorldHit(
                  r.x, r.y, closestAlly.x, closestAlly.y, 2, worldColliders
                ) === null;
                r.lineOfSightTimer = 0.075 + (i % 5) * 0.006;
              }
              const lineOfSightClear = !rivalInAttackRange || (r.lineOfSightClear ?? true);
              if (rivalInAttackRange && lineOfSightClear) {
                if (retreatRange > 0 && combatDistance < retreatRange) {
                  r.vx = -Math.cos(combatAngle) * r.speed * .82;
                  r.vy = -Math.sin(combatAngle) * r.speed * .82;
                } else if (preferredRange > 0 && combatDistance > preferredRange + 8) {
                  r.vx = Math.cos(combatAngle) * r.speed * .30;
                  r.vy = Math.sin(combatAngle) * r.speed * .30;
                } else {
                  const strafeDir = (i % 2 === 0 ? 1 : -1);
                  const strafeAng = combatAngle + (Math.PI / 2) * strafeDir;
                  const strafeSpd = r.speed * role.strafeFactor * Math.sin(Date.now() * 0.002 + i);
                  r.vx = Math.cos(strafeAng) * strafeSpd;
                  r.vy = Math.sin(strafeAng) * strafeSpd;
                }
                r.state = 'attack';

                if (r.attackTimer <= 0 && segmentWorldHit(r.x, r.y, closestAlly.x, closestAlly.y, 2, worldColliders) === null) {
                  r.recoilTimer = 0.12;
                  const barrelOffset = r.type === 'atirador_fuzil' ? 22 : 12;
                  const muzzleX = r.x + Math.cos(combatAngle) * barrelOffset;
                  const muzzleY = r.y + Math.sin(combatAngle) * barrelOffset;
                  const rivalWeaponStyle: NonNullable<BulletProjectile['visualStyle']> = r.type === 'atirador_fuzil' ? 'fuzil' : 'rival';
                  addMuzzleFlash(muzzleX, muzzleY, combatAngle, r.color, rivalWeaponStyle);
                  soundEngine.playGunfireShot(rivalWeaponStyle, { x: muzzleX, width });

                  bulletsRef.current.push({
                    id: Math.random().toString(36).substring(7),
                    x: muzzleX, y: muzzleY,
                    targetX: closestAlly.x, targetY: closestAlly.y, speed: 6.5,
                    damage: r.damage * getRivalSupportDamageMultiplier(r, rivalManagers) * (r.type === 'chefe_morro' ? getBossPhaseProfile(r.maxHp > 0 ? r.hp / r.maxHp : 1).damageMultiplier : 1),
                    source: 'rival', color: r.color, radius: rivalWeaponStyle === 'fuzil' ? 3.25 : 2.8,
                    visualStyle: rivalWeaponStyle
                  });
                  r.attackTimer = r.attackCooldown * (r.type === 'chefe_morro' ? getBossPhaseProfile(r.maxHp > 0 ? r.hp / r.maxHp : 1).cooldownMultiplier : 1);
                }
              } else {
                r.state = 'patrol';
                const routed = applyBlockedTargetDetour(
                  r, closestAlly.x, closestAlly.y, closestAlly.id, decisionDt,
                  worldColliders, width, height, i + currentTerritory.id * 41
                );
                r.vx += (routed.vx - r.vx) * Math.min(1, 8 * dt);
                r.vy += (routed.vy - r.vy) * Math.min(1, 8 * dt);
              }
            } else {
              // NO ALLIES ON MAP: ORGANIC GUARD & PATROL (Autonomous movement, NEVER march down to bottom border!)
              r.state = 'patrol';
              if (r.patrolWaitTimer && r.patrolWaitTimer > 0) {
                r.patrolWaitTimer -= dt;
                r.vx *= 0.85;
                r.vy *= 0.85;
                r.facingAngle = (r.facingAngle || 0) + Math.sin(Date.now() * 0.0025 + i * 2) * 0.03;
              } else {
                const targetX = r.patrolTargetX ?? r.x;
                const targetY = r.patrolTargetY ?? r.y;
                const pDist = Math.hypot(targetX - r.x, targetY - r.y);
                if (pDist < 16 || !r.patrolTargetX) {
                  r.patrolWaitTimer = 2.0 + Math.random() * 3.5;
                  const patrol = findClearWorldPosition(
                    45 + Math.random() * (width - 90),
                    35 + Math.random() * (height * 0.50),
                    r.radius + 2, worldColliders, i + 211 + Math.floor(currentTime / 1000)
                  );
                  r.patrolTargetX = patrol.x;
                  r.patrolTargetY = patrol.y;
                  r.vx *= 0.6;
                  r.vy *= 0.6;
                } else {
                  const pAng = Math.atan2(targetY - r.y, targetX - r.x);
                  const desVx = Math.cos(pAng) * (r.speed * 0.65);
                  const desVy = Math.sin(pAng) * (r.speed * 0.65);
                  r.vx += (desVx - r.vx) * Math.min(1, 5 * dt);
                  r.vy += (desVy - r.vy) * Math.min(1, 5 * dt);
                }
              }
            }
          }

          // Separation is a decision-layer concern; 8-10 Hz is enough for visual spacing.
          r.aiDecisionTimer = (r.aiDecisionTimer ?? 0) - decisionDt;
          if (r.aiDecisionTimer <= 0) {
            r.aiDecisionTimer = 0.11 + (i % 5) * 0.008;
            for (let j = 0; j < rivalsRef.current.length; j++) {
              if (i === j) continue;
              const other = rivalsRef.current[j];
              const dx = other.x - r.x;
              const dy = other.y - r.y;
              const sepDistSq = dx * dx + dy * dy;
              if (sepDistSq > 0 && sepDistSq < 24 * 24) {
                const sepDist = Math.sqrt(sepDistSq);
                const force = ((24 - sepDist) / 24) * 0.6 * ((r.detourTimer ?? 0) > 0 ? 0.25 : 1);
                r.vx -= (dx / sepDist) * force;
                r.vy -= (dy / sepDist) * force;
              }
            }
          }

          // Query a prebuilt broadphase cell once for navigation + motion. The cell already
          // contains every solid close enough to matter for probes and 74px unstuck escapes.
          const rivalWorldColliders = queryWorldColliderIndex(worldColliderIndex, r.x, r.y);
          const rivalCanRecoverEdge = (r.detourTimer ?? 0) <= 0 && (!closestAlly || minDistSq > (r.attackRange * .82) ** 2);
          const rivalFlow = rivalCanRecoverEdge
            ? applyTerritoryEdgeRecovery(currentTerritory.id, r, r.vx, r.vy, rivalsRef.current, width, height)
            : { vx: r.vx, vy: r.vy, active: false };
          if (rivalFlow.active) edgeRecoveriesThisFrame += 1;
          const rivalEscape = applyUnstuckNavigation(
            r, rivalFlow.vx, rivalFlow.vy, decisionDt, rivalWorldColliders, rivalsRef.current,
            width, height, i + currentTerritory.id * 31
          );
          r.vx = rivalEscape.vx;
          r.vy = rivalEscape.vy;
          if (rivalEscape.triggered) unstuckTriggersThisFrame += 1;
          if (rivalEscape.hardTriggered) hardUnstuckTriggersThisFrame += 1;

          // 0.5.1: proactive steering makes solids feel like part of navigation instead of
          // invisible teleport-correctors. Hard collision below remains the final guarantee.
          const rivalSteered = steerVelocityAroundWorld(
            r.x, r.y, r.radius + 2, r.vx, r.vy, rivalWorldColliders, i + currentTerritory.id * 13
          );
          r.vx = rivalSteered.vx;
          r.vy = rivalSteered.vy;

          // Boundary Repulsion & Safe Bounds (Organic navigation, no stuck units)
          const margin = 35;
          if (r.x < margin) r.vx += (margin - r.x) * 0.12 * dt * 60;
          if (r.x > width - margin) r.vx -= (r.x - (width - margin)) * 0.12 * dt * 60;
          if (r.y < margin) r.vy += (margin - r.y) * 0.12 * dt * 60;

          // Hard clamping safe-guards
          if (r.x < r.radius) { r.x = r.radius; r.vx = Math.abs(r.vx) * 0.5; }
          if (r.x > width - r.radius) { r.x = width - r.radius; r.vx = -Math.abs(r.vx) * 0.5; }
          if (r.y < r.radius) { r.y = r.radius; r.vy = Math.abs(r.vy) * 0.5; }
          if (r.y > height - r.radius - 20) { r.y = height - r.radius - 20; r.vy = -Math.abs(r.vy) * 0.8; }

          // Smooth Facing Rotation (shortest arc interpolation)
          let rTargetAngle = Math.atan2(r.vy, r.vx);
          if (closestAlly && minDistSq <= r.attackRange * r.attackRange && (r.lineOfSightClear ?? false)) {
            rTargetAngle = Math.atan2(closestAlly.y - r.y, closestAlly.x - r.x);
          }
          if (r.facingAngle === undefined) r.facingAngle = rTargetAngle;
          let rDiff = rTargetAngle - r.facingAngle;
          while (rDiff < -Math.PI) rDiff += Math.PI * 2;
          while (rDiff > Math.PI) rDiff -= Math.PI * 2;
          r.facingAngle += rDiff * Math.min(1, 14 * dt);

          // Alternating Footsteps Distance Accumulation
          const rMoveSpd = Math.hypot(r.vx, r.vy);
          if (rMoveSpd > 0.05) {
            r.walkDistance = (r.walkDistance || 0) + rMoveSpd * 60 * dt;
          }

          const previousRivalX = r.x;
          const previousRivalY = r.y;
          const rivalMotion = resolveCircleMotionAgainstWorld(
            previousRivalX, previousRivalY, r.radius + 1,
            r.vx * 60 * dt, r.vy * 60 * dt, rivalWorldColliders
          );
          r.x = rivalMotion.x;
          r.y = rivalMotion.y;
          if (rivalMotion.hitX) {
            r.vx *= 0.22;
            if (Math.abs(r.vy) < r.speed * .16) r.vy = (i % 2 === 0 ? 1 : -1) * r.speed * .48;
          }
          if (rivalMotion.hitY) {
            r.vy *= 0.22;
            if (Math.abs(r.vx) < r.speed * .16) r.vx = (i % 2 === 0 ? -1 : 1) * r.speed * .48;
          }
          const rivalCoverMotion = resolveUnitAgainstCoverObstacles(
            r.x, r.y, r.radius + 1, obstaclesRef.current
          );
          r.x = rivalCoverMotion.x;
          r.y = rivalCoverMotion.y;
          if (rivalCoverMotion.hitX || rivalCoverMotion.hitY) {
            const rivalFinalColliders = queryWorldColliderIndex(worldColliderIndex, r.x, r.y);
            if (!pointHasWorldClearance(r.x, r.y, r.radius + 1, rivalFinalColliders)) {
              const ejected = resolveCircleMotionAgainstWorld(r.x, r.y, r.radius + 1, 0, 0, rivalFinalColliders);
              r.x = ejected.x;
              r.y = ejected.y;
            }
          }
          if (rivalCoverMotion.hitX) {
            r.vx *= 0.18;
            if (Math.abs(r.vy) < r.speed * .18) r.vy = (i % 2 === 0 ? 1 : -1) * r.speed * .55;
          }
          if (rivalCoverMotion.hitY) {
            r.vy *= 0.18;
            if (Math.abs(r.vx) < r.speed * .18) r.vx = (i % 2 === 0 ? -1 : 1) * r.speed * .55;
          }
        }

        if (import.meta.env.DEV) rivalAiMsThisFrame += performance.now() - perfRivalAiStart;

        // --- 3. ALLIES AI & COMBAT ---
        const perfAllyAiStart = import.meta.env.DEV ? performance.now() : 0;
        const medicsLvl = gameState.upgrades['armory_medics_safehouse'] || 0;
        const pendingCapturePoints = operationEnabled && operationPhaseRef.current === 'capture'
          ? controlPointsRef.current.filter(point => point.status !== 'captured')
          : [];
        const hasPendingCaptureObjective = pendingCapturePoints.length > 0;

        for (let i = alliesRef.current.length - 1; i >= 0; i--) {
          const a = alliesRef.current[i];

          if (a.hp <= 0) {
            onAllyDown(a.id);
            soundEngine.playAllyDown();
            addNeutralizationEffects(a.x, a.y, false, false, false, factionConfig.color);
            addFloatingText('Soldado Atingido', a.x, a.y, '#94a3b8');
            alliesRef.current.splice(i, 1);
            continue;
          }

          if (medicsLvl > 0 && a.hp < a.maxHp) {
            a.hp = Math.min(a.maxHp, a.hp + getMedicRegenPerSecond(medicsLvl) * dt);
          }

          // Scavenge at a lower decision cadence; movement/combat remain fixed-step.
          a.scavengeCooldown = (a.scavengeCooldown || 0) - dt;
          a.scavengeCheckTimer = (a.scavengeCheckTimer ?? 0) - decisionDt;
          if (a.scavengeCooldown <= 0 && a.scavengeCheckTimer <= 0 && fallenRef.current.length > 0) {
            a.scavengeCheckTimer = 0.18 + (i % 5) * 0.015;
            for (let fIdx = fallenRef.current.length - 1; fIdx >= 0; fIdx--) {
              const f = fallenRef.current[fIdx];
              const dx = f.x - a.x;
              const dy = f.y - a.y;
              const reach = a.radius + 6;
              if (dx * dx + dy * dy <= reach * reach) {
                a.scavengeCooldown = 2.5;

                if (f.bountyCash > 0 || f.bountyAmmo > 0) {
                  const collectedCash = Math.max(1, Math.floor(f.bountyCash * 0.5));
                  const collectedAmmo = (f.bountyAmmo > 0 && Math.random() < 0.30) ? 1 : 0;

                  const credited = onScavengeDrop
                    ? onScavengeDrop(collectedCash, collectedAmmo, true)
                    : { cash: collectedCash, ammo: collectedAmmo, respect: 0, contacts: 0 };
                  addFloatingText(`${formatEconomicRewardFeedback(credited)} · Tropa`, f.x, f.y, '#34d399');
                }
                fallenRef.current.splice(fIdx, 1);
                break;
              }
            }
          }

          a.attackTimer -= dt;
          if (a.recoilTimer && a.recoilTimer > 0) {
            a.recoilTimer -= dt;
          }

          // Target caching: reacquire only when invalid or when the staggered timer expires.
          a.targetSearchTimer = (a.targetSearchTimer ?? 0) - decisionDt;
          let closestRival: RivalEntity | null = a.targetId ? (rivalById.get(a.targetId) ?? null) : null;
          if (closestRival && closestRival.hp <= 0) closestRival = null;
          let minDistSq = closestRival
            ? (closestRival.x - a.x) ** 2 + (closestRival.y - a.y) ** 2
            : Number.POSITIVE_INFINITY;
          const allyDetourTargetLocked = !!closestRival && (a.detourTimer ?? 0) > 0 && a.detourTargetId === closestRival.id;
          if (a.targetSearchTimer <= 0 && (!closestRival || !allyDetourTargetLocked)) {
            targetSearchesThisFrame += 1;
            let best: RivalEntity | null = null;
            let bestScore = Number.POSITIVE_INFINITY;
            let bestDistSq = Number.POSITIVE_INFINITY;
            for (const r of rivalsRef.current) {
              if (r.hp <= 0) continue;
              const dx = r.x - a.x;
              const dy = r.y - a.y;
              const dSq = dx * dx + dy * dy;
              // 0.9.11D: during physical capture, distant rivals must not trigger expensive
              // LOS scoring only to be discarded in favour of the territorial objective.
              if (hasPendingCaptureObjective && dSq > 190 * 190) continue;
              const blockedByWorld = segmentWorldHit(a.x, a.y, r.x, r.y, 2, worldColliders) !== null;
              const tacticalScore = scoreRivalTargetForAlly(a.type, r, dSq);
              const score = tacticalScore * (blockedByWorld ? 6.5 : 1);
              if (score < bestScore) { bestScore = score; bestDistSq = dSq; best = r; }
            }
            closestRival = best;
            minDistSq = bestDistSq;
            a.targetId = best?.id ?? null;
            a.targetSearchTimer = 0.22 + (i % 9) * 0.01 + Math.random() * 0.035;
          }

          let captureTarget: TerritoryControlPoint | null = null;
          let captureDistanceSq = Number.POSITIVE_INFINITY;
          if (hasPendingCaptureObjective) {
            for (const point of pendingCapturePoints) {
              const dx = point.x - a.x, dy = point.y - a.y;
              const distanceSq = dx * dx + dy * dy;
              if (distanceSq < captureDistanceSq) { captureDistanceSq = distanceSq; captureTarget = point; }
            }
          }
          // Nearby threats always win. Distant threats no longer pull occupiers away from the district objective.
          if (captureTarget && (!closestRival || minDistSq > 190 * 190)) closestRival = null;

          if (closestRival) {
            const angle = Math.atan2(closestRival.y - a.y, closestRival.x - a.x);
            const allyDistance = Math.sqrt(minDistSq);
            const allyRole = getAllyCombatRole(a.type);
            const allyInAttackRange = minDistSq <= a.attackRange * a.attackRange;
            a.lineOfSightTimer = (a.lineOfSightTimer ?? 0) - decisionDt;
            if (allyInAttackRange && (a.lineOfSightTargetId !== closestRival.id || a.lineOfSightTimer <= 0)) {
              a.lineOfSightTargetId = closestRival.id;
              a.lineOfSightClear = segmentWorldHit(
                a.x, a.y, closestRival.x, closestRival.y, 2, worldColliders
              ) === null;
              a.lineOfSightTimer = 0.075 + (i % 7) * 0.005;
            }
            const allyLineOfSightClear = !allyInAttackRange || (a.lineOfSightClear ?? true);

            if (allyInAttackRange && allyLineOfSightClear) {
              const retreatRange = a.attackRange * allyRole.retreatRangeFactor;
              const holdRange = a.attackRange * allyRole.holdRangeFactor;
              if (retreatRange > 0 && allyDistance < retreatRange) {
                a.vx = -Math.cos(angle) * a.speed * .78;
                a.vy = -Math.sin(angle) * a.speed * .78;
              } else if (holdRange > 0 && allyDistance > holdRange + 8) {
                a.vx = Math.cos(angle) * a.speed * .28;
                a.vy = Math.sin(angle) * a.speed * .28;
              } else if (allyRole.strafeFactor > 0) {
                const strafeAngle = angle + (i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2);
                const strafeSpeed = a.speed * allyRole.strafeFactor * Math.sin(Date.now() * .0023 + i);
                a.vx = Math.cos(strafeAngle) * strafeSpeed;
                a.vy = Math.sin(strafeAngle) * strafeSpeed;
              } else {
                a.vx = 0;
                a.vy = 0;
              }
              if (a.attackTimer <= 0 && segmentWorldHit(a.x, a.y, closestRival.x, closestRival.y, 2, worldColliders) === null) {
                // Trigger Weapon Recoil Kickback
                a.recoilTimer = 0.12;

                // Barrel-tip aligned muzzle flash + sound
                const barrelOffset = a.type === 'soldado_fuzil' ? 21 : 13;
                const muzzleX = a.x + Math.cos(angle) * barrelOffset;
                const muzzleY = a.y + Math.sin(angle) * barrelOffset;
                const weaponSound: NonNullable<BulletProjectile['visualStyle']> = a.type === 'soldado_fuzil' ? 'fuzil' : (a.type === 'batedor_moto' ? 'moto' : 'pistol');
                addMuzzleFlash(muzzleX, muzzleY, angle, factionConfig.color, weaponSound);
                soundEngine.playGunfireShot(weaponSound, { x: muzzleX, width });

                bulletsRef.current.push({
                  id: Math.random().toString(36).substring(7),
                  x: muzzleX,
                  y: muzzleY,
                  targetX: closestRival.x,
                  targetY: closestRival.y,
                  speed: 7.0,
                  damage: a.damage,
                  source: 'ally',
                  color: factionConfig.color,
                  radius: weaponSound === 'fuzil' ? 3.25 : weaponSound === 'moto' ? 2.55 : 2.8,
                  visualStyle: weaponSound
                });

                a.attackTimer = a.attackCooldown;
              }
            } else {
              const rivalApproach = getFactionApproachPoint(
                a.id, closestRival.x, closestRival.y, Math.min(22, Math.max(12, a.attackRange * .13))
              );
              const routed = applyBlockedTargetDetour(
                a, rivalApproach.x, rivalApproach.y, closestRival.id, decisionDt,
                worldColliders, width, height, i + currentTerritory.id * 43
              );
              a.vx = routed.vx;
              a.vy = routed.vy;
            }
          } else if (captureTarget) {
            if (captureDistanceSq <= (CAPTURE_RADIUS * .55) ** 2) {
              a.vx = 0; a.vy = 0;
            } else {
              const captureApproach = captureDistanceSq > (CAPTURE_RADIUS * .80) ** 2
                ? getFactionApproachPoint(a.id, captureTarget.x, captureTarget.y, CAPTURE_RADIUS * .34)
                : { x: captureTarget.x, y: captureTarget.y };
              const routed = applyBlockedTargetDetour(
                a, captureApproach.x, captureApproach.y, `capture:${captureTarget.id}`, decisionDt,
                worldColliders, width, height, i + currentTerritory.id * 59
              );
              a.vx = routed.vx; a.vy = routed.vy;
            }
          } else {
            // No objective and no live threat: hold the secured ground instead of drifting
            // north forever. Newly spawned pressure will be acquired on the next target search.
            a.vx *= .72;
            a.vy *= .72;
            if (Math.abs(a.vx) < .04) a.vx = 0;
            if (Math.abs(a.vy) < .04) a.vy = 0;
          }

          // 1.1D: one low-frequency neighbor scan now feeds both personal space and faction-mass behavior.
          // Separation prevents blobs; cohesion/alignment only recover stragglers while the squad is travelling.
          a.separationTimer = (a.separationTimer ?? 0) - decisionDt;
          if (a.separationTimer <= 0) {
            const massFlow = computeAllyMassFlow(a, alliesRef.current);
            a.separationX = massFlow.separationX;
            a.separationY = massFlow.separationY;
            a.cohesionX = massFlow.cohesionX;
            a.cohesionY = massFlow.cohesionY;
            a.alignmentX = massFlow.alignmentX;
            a.alignmentY = massFlow.alignmentY;
            a.massNeighborCount = massFlow.neighborCount;
            a.separationTimer = 0.10 + (i % 7) * 0.009;
          }
          const allyDetouring = (a.detourTimer ?? 0) > 0;
          const spacedVelocity = applySeparationToVelocity(
            a, (a.separationX ?? 0) * (allyDetouring ? .25 : 1), (a.separationY ?? 0) * (allyDetouring ? .25 : 1)
          );
          const travellingToThreat = Boolean(closestRival) && minDistSq > Math.max(64 * 64, (a.attackRange * .92) ** 2);
          const travellingToCapture = Boolean(captureTarget) && captureDistanceSq > (CAPTURE_RADIUS * .70) ** 2;
          const massInfluence = !allyDetouring && (travellingToThreat || travellingToCapture) ? 1 : 0;
          const massVelocity = applyFactionMassToVelocity(a, spacedVelocity.vx, spacedVelocity.vy, {
            cohesionX: a.cohesionX ?? 0, cohesionY: a.cohesionY ?? 0,
            alignmentX: a.alignmentX ?? 0, alignmentY: a.alignmentY ?? 0,
            neighborCount: a.massNeighborCount ?? 0
          }, massInfluence);
          const allyWorldColliders = queryWorldColliderIndex(worldColliderIndex, a.x, a.y);
          const allyCanRecoverEdge = !allyDetouring && (!closestRival || minDistSq > (a.attackRange * .82) ** 2);
          const allyFlow = allyCanRecoverEdge
            ? applyTerritoryEdgeRecovery(currentTerritory.id, a, massVelocity.vx, massVelocity.vy, alliesRef.current, width, height)
            : { vx: massVelocity.vx, vy: massVelocity.vy, active: false };
          if (allyFlow.active) edgeRecoveriesThisFrame += 1;
          const allyEscape = applyUnstuckNavigation(
            a, allyFlow.vx, allyFlow.vy, decisionDt, allyWorldColliders, alliesRef.current,
            width, height, i + currentTerritory.id * 37
          );
          if (allyEscape.triggered) unstuckTriggersThisFrame += 1;
          if (allyEscape.hardTriggered) hardUnstuckTriggersThisFrame += 1;
          const allySteered = steerVelocityAroundWorld(
            a.x, a.y, a.radius + 2, allyEscape.vx, allyEscape.vy,
            allyWorldColliders, i + currentTerritory.id * 17
          );
          a.vx = allySteered.vx;
          a.vy = allySteered.vy;

          // Smooth Facing Rotation (shortest arc interpolation)
          let aTargetAngle = Math.atan2(a.vy, a.vx);
          if (closestRival && minDistSq <= a.attackRange * a.attackRange && (a.lineOfSightClear ?? false)) {
            aTargetAngle = Math.atan2(closestRival.y - a.y, closestRival.x - a.x);
          }
          if (a.facingAngle === undefined) a.facingAngle = aTargetAngle;
          let aDiff = aTargetAngle - a.facingAngle;
          while (aDiff < -Math.PI) aDiff += Math.PI * 2;
          while (aDiff > Math.PI) aDiff -= Math.PI * 2;
          a.facingAngle += aDiff * Math.min(1, 14 * dt);

          // Alternating Footsteps Distance Accumulation
          const aMoveSpd = Math.hypot(a.vx, a.vy);
          if (aMoveSpd > 0.05) {
            a.walkDistance = (a.walkDistance || 0) + aMoveSpd * 60 * dt;
          }

          const previousAllyX = a.x;
          const previousAllyY = a.y;
          const allyMotion = resolveCircleMotionAgainstWorld(
            previousAllyX, previousAllyY, a.radius + 1,
            a.vx * 60 * dt, a.vy * 60 * dt, allyWorldColliders
          );
          a.x = allyMotion.x;
          a.y = allyMotion.y;
          if (allyMotion.hitX) {
            a.vx *= 0.22;
            if (Math.abs(a.vy) < a.speed * .16) a.vy = (i % 2 === 0 ? -1 : 1) * a.speed * .48;
          }
          if (allyMotion.hitY) {
            a.vy *= 0.22;
            if (Math.abs(a.vx) < a.speed * .16) a.vx = (i % 2 === 0 ? 1 : -1) * a.speed * .48;
          }
          const allyCoverMotion = resolveUnitAgainstCoverObstacles(
            a.x, a.y, a.radius + 1, obstaclesRef.current
          );
          a.x = allyCoverMotion.x;
          a.y = allyCoverMotion.y;
          if (allyCoverMotion.hitX || allyCoverMotion.hitY) {
            const allyFinalColliders = queryWorldColliderIndex(worldColliderIndex, a.x, a.y);
            if (!pointHasWorldClearance(a.x, a.y, a.radius + 1, allyFinalColliders)) {
              const ejected = resolveCircleMotionAgainstWorld(a.x, a.y, a.radius + 1, 0, 0, allyFinalColliders);
              a.x = ejected.x;
              a.y = ejected.y;
            }
          }
          if (allyCoverMotion.hitX) {
            a.vx *= 0.18;
            if (Math.abs(a.vy) < a.speed * .18) a.vy = (i % 2 === 0 ? -1 : 1) * a.speed * .55;
          }
          if (allyCoverMotion.hitY) {
            a.vy *= 0.18;
            if (Math.abs(a.vx) < a.speed * .18) a.vx = (i % 2 === 0 ? 1 : -1) * a.speed * .55;
          }

          let allyBoundaryAdjusted = false;
          if (a.x < a.radius) { a.x = a.radius; a.vx *= -1; allyBoundaryAdjusted = true; }
          if (a.x > width - a.radius) { a.x = width - a.radius; a.vx *= -1; allyBoundaryAdjusted = true; }
          if (a.y < a.radius) { a.y = a.radius; a.vy *= -1; allyBoundaryAdjusted = true; }
          if (a.y > height - a.radius) { a.y = height - a.radius; a.vy *= -1; allyBoundaryAdjusted = true; }
          if (allyBoundaryAdjusted) {
            const boundaryColliders = queryWorldColliderIndex(worldColliderIndex, a.x, a.y);
            if (!pointHasWorldClearance(a.x, a.y, a.radius + 1, boundaryColliders)) {
              const ejected = resolveCircleMotionAgainstWorld(a.x, a.y, a.radius + 1, 0, 0, boundaryColliders);
              a.x = ejected.x; a.y = ejected.y;
            }
          }
        }

        // 0.5.1: a low-frequency positional solver prevents solid-world chokepoints
        // from reintroducing sprite stacking after the organic spawn pass.
        allyBodySolveElapsedRef.current += dt / Math.max(1, gameState.gameSpeed);
        const bodySolveInterval = alliesRef.current.length > 100 ? 0.14 : 0.09;
        if (allyBodySolveElapsedRef.current >= bodySolveInterval) {
          solveAllyBodyOverlaps(alliesRef.current, worldColliderIndex, obstaclesRef.current);
          allyBodySolveElapsedRef.current = 0;
        }

        if (import.meta.env.DEV) allyAiMsThisFrame += performance.now() - perfAllyAiStart;

        // --- 4. PROJECTILES, COVER OBSTACLES & DETONATIONS ---
        const perfProjectileStart = import.meta.env.DEV ? performance.now() : 0;
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];

          if (b.dirX === undefined || b.dirY === undefined || b.remainingDistance === undefined) {
            const initialDx = b.targetX - b.x;
            const initialDy = b.targetY - b.y;
            const initialDistance = Math.hypot(initialDx, initialDy);
            if (initialDistance <= 0.001) {
              bulletsRef.current.splice(i, 1);
              continue;
            }
            b.dirX = initialDx / initialDistance;
            b.dirY = initialDy / initialDistance;
            b.remainingDistance = Math.max(60, initialDistance + 24);
          }

          const prevX = b.x;
          const prevY = b.y;
          const travelDistance = Math.min(b.speed * 60 * dt, b.remainingDistance);
          const nextX = prevX + b.dirX * travelDistance;
          const nextY = prevY + b.dirY * travelDistance;

          type ProjectileImpact =
            | { t: number; kind: 'world'; collider: WorldCollider }
            | { t: number; kind: 'obstacle'; obstacle: CoverObstacle }
            | { t: number; kind: 'ally'; ally: AllyEntity }
            | { t: number; kind: 'rival'; rival: RivalEntity };
          let impact: ProjectileImpact | null = null;

          const projectileWorldColliders = queryWorldColliderIndex(worldColliderIndex, prevX, prevY);
          const worldImpact = segmentWorldHit(prevX, prevY, nextX, nextY, b.radius, projectileWorldColliders);
          if (worldImpact) impact = { t: worldImpact.t, kind: 'world', collider: worldImpact.collider };

          for (const obs of obstaclesRef.current) {
            if (obs.destroyed) continue;
            const t = segmentAabbHitT(
              prevX, prevY, nextX, nextY,
              obs.x - obs.w / 2 - b.radius,
              obs.y - obs.h / 2 - b.radius,
              obs.x + obs.w / 2 + b.radius,
              obs.y + obs.h / 2 + b.radius
            );
            if (t !== null && (impact === null || t < impact.t)) impact = { t, kind: 'obstacle', obstacle: obs };
          }

          const minBX = Math.min(prevX, nextX);
          const minBY = Math.min(prevY, nextY);
          const maxBX = Math.max(prevX, nextX);
          const maxBY = Math.max(prevY, nextY);

          if (b.source === 'rival') {
            for (const ally of alliesRef.current) {
              if (ally.hp <= 0) continue;
              const reach = ally.radius + b.radius;
              if (ally.x < minBX - reach || ally.x > maxBX + reach || ally.y < minBY - reach || ally.y > maxBY + reach) continue;
              projectileChecksThisFrame += 1;
              const t = segmentCircleHitT(prevX, prevY, nextX, nextY, ally.x, ally.y, reach);
              if (t !== null && (impact === null || t < impact.t)) impact = { t, kind: 'ally', ally };
            }
          } else {
            for (const rival of rivalsRef.current) {
              if (rival.hp <= 0) continue;
              const reach = rival.radius + b.radius;
              if (rival.x < minBX - reach || rival.x > maxBX + reach || rival.y < minBY - reach || rival.y > maxBY + reach) continue;
              projectileChecksThisFrame += 1;
              const t = segmentCircleHitT(prevX, prevY, nextX, nextY, rival.x, rival.y, reach);
              if (t !== null && (impact === null || t < impact.t)) impact = { t, kind: 'rival', rival };
            }
          }

          if (impact) {
            b.x = prevX + (nextX - prevX) * impact.t;
            b.y = prevY + (nextY - prevY) * impact.t;

            if (impact.kind === 'world') {
              const material = impact.collider.material;
              const sparkColor = material === 'metal' ? '#fde68a'
                : material === 'glass' ? '#bae6fd'
                  : material === 'brick' ? '#fdba74' : '#cbd5e1';
              addImpactSparks(b.x, b.y, false, sparkColor);
              soundEngine.playBulletImpact(false, { x: b.x, width });
              if (material === 'brick' || material === 'concrete') {
                addGroundMark(b.x, b.y);
              }
            } else if (impact.kind === 'obstacle') {
              const obs = impact.obstacle;
              obs.hp -= b.damage;
              addImpactSparks(b.x, b.y, false, '#fef08a');
              soundEngine.playBulletImpact(false, { x: b.x, width });
              addFloatingText(`-${Math.round(b.damage)}`, obs.x, obs.y - 10, '#94a3b8');

              if (obs.hp <= 0 && !obs.destroyed) {
                obs.destroyed = true;
                if (obs.isExplosive) {
                  soundEngine.playExplosion();
                  addExplosion(obs.x, obs.y, 90);
                  const blastText = obs.type === 'botijao_gas' ? '💥 EXPLOSÃO DE GÁS!' : '💥 VEÍCULO EXPLODIU!';
                  addFloatingText(blastText, obs.x, obs.y - 18, '#f97316');

                  for (const rival of rivalsRef.current) {
                    const distToBlast = Math.hypot(rival.x - obs.x, rival.y - obs.y);
                    if (distToBlast <= 90) {
                      const blastDmg = Math.round(95 * (1 - distToBlast / 110));
                      rival.hp -= blastDmg;
                      const blastAng = Math.atan2(rival.y - obs.y, rival.x - obs.x);
                      rival.vx += Math.cos(blastAng) * 4;
                      rival.vy += Math.sin(blastAng) * 4;
                      addFloatingText(`-${blastDmg} Dano Explosivo`, rival.x, rival.y, '#f97316');
                    }
                  }

                  for (const ally of alliesRef.current) {
                    const distToBlast = Math.hypot(ally.x - obs.x, ally.y - obs.y);
                    if (distToBlast <= 90) {
                      const blastDmg = Math.round(75 * (1 - distToBlast / 110));
                      ally.hp -= blastDmg;
                      const blastAng = Math.atan2(ally.y - obs.y, ally.x - obs.x);
                      ally.vx += Math.cos(blastAng) * 3;
                      ally.vy += Math.sin(blastAng) * 3;
                    }
                  }
                }
              }
            } else if (impact.kind === 'ally') {
              const ally = impact.ally;
              const barricadeLvl = gameState.upgrades['boca_barricades'] || 0;
              const reduction = getBarricadeDamageReduction(barricadeLvl);
              const finalDmg = b.damage * (1 - reduction);
              ally.hp -= finalDmg;
              addImpactSparks(b.x, b.y, true, '#ef4444');
              soundEngine.playBulletImpact(true, { x: b.x, width });
              addFloatingText(`-${Math.round(finalDmg)}`, ally.x, ally.y, '#f87171');
            } else {
              const rival = impact.rival;
              rival.hp -= b.damage;
              addImpactSparks(b.x, b.y, true, b.color);
              soundEngine.playBulletImpact(true, { x: b.x, width });
              addFloatingText(`-${Math.round(b.damage)}`, rival.x, rival.y, b.color);
              addGroundMark(rival.x, rival.y, 'bullet_mark');
            }

            bulletsRef.current.splice(i, 1);
            continue;
          }

          b.x = nextX;
          b.y = nextY;
          b.remainingDistance -= travelDistance;
          if (b.remainingDistance <= 0 || b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
            bulletsRef.current.splice(i, 1);
          }
        }

        if (import.meta.env.DEV) projectileMsThisFrame += performance.now() - perfProjectileStart;

        // --- 5. FALLEN DECAY ---
        for (let i = fallenRef.current.length - 1; i >= 0; i--) {
          const f = fallenRef.current[i];
          f.decayTime -= dt;
          if (f.decayTime <= 0) {
            fallenRef.current.splice(i, 1);
          }
        }

        // --- 6. FLOATING TEXTS ---
        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatingTextsRef.current[i];
          ft.y += ft.vy * 60 * dt;
          ft.life -= dt;
          ft.opacity = Math.max(0, ft.life / 0.9);
          if (ft.life <= 0) {
            floatingTextsRef.current.splice(i, 1);
          }
        }
      }
      if (simulationSteps >= 8) {
        simulationAccumulatorRef.current = Math.min(simulationAccumulatorRef.current, fixedStep);
      }
      const perfSimulationMs = import.meta.env.DEV ? performance.now() - perfSimulationStart : 0;
      const perfRenderStart = import.meta.env.DEV ? performance.now() : 0;

      // ==========================================
      // RENDERING (Layered Favela Map + Sprites + Particles)
      // ==========================================
      // Clear physical pixels, then render in CSS-pixel coordinates for HiDPI clarity.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Camera transform: viewport is only a window into the fixed logical world.
      ctx.save();
      const camera = cameraRef.current;
      const battleEntityCount = alliesRef.current.length + rivalsRef.current.length;
      const visualLoadZoom = battleEntityCount >= 100 ? Math.min(camera.zoom, .70) : battleEntityCount >= 70 ? Math.min(camera.zoom, .85) : camera.zoom;
      ctx.translate(viewportWidth / 2, viewportHeight / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.centerX, -camera.centerY);

      const halfVisibleW = viewportWidth / (2 * camera.zoom);
      const halfVisibleH = viewportHeight / (2 * camera.zoom);
      const cullMargin = 90;
      const visibleLeft = camera.centerX - halfVisibleW - cullMargin;
      const visibleRight = camera.centerX + halfVisibleW + cullMargin;
      const visibleTop = camera.centerY - halfVisibleH - cullMargin;
      const visibleBottom = camera.centerY + halfVisibleH + cullMargin;
      const isVisible = (x: number, y: number, radius = 0) =>
        x + radius >= visibleLeft && x - radius <= visibleRight &&
        y + radius >= visibleTop && y - radius <= visibleBottom;

      // 1. Static map cache: rebuild the procedural city only when its identity changes.
      const staticMapKey = `${CITY_VIVA_VISUAL_REVISION}:${currentTerritory.id}:${factionConfig.tag}:${territoryDominated ? 'player' : 'rival'}:${environmentControlColor}:${width}x${height}`;
      if (!staticMapCanvasRef.current || staticMapKeyRef.current !== staticMapKey) {
        const layer = document.createElement('canvas');
        layer.width = width;
        layer.height = height;
        const layerCtx = layer.getContext('2d');
        if (layerCtx) {
          drawStaticTerritoryScene({
            ctx: layerCtx,
            width,
            height,
            territoryId: currentTerritory.id,
            factionConfig,
            territoryDominated,
            buildings: tacticalBuildings,
            controlColor: environmentControlColor
          });
        }
        staticMapCanvasRef.current = layer;
        staticMapKeyRef.current = staticMapKey;
      }
      if (staticMapCanvasRef.current) {
        ctx.drawImage(staticMapCanvasRef.current, 0, 0, width, height);
      }
      drawTerritoryEnvironmentOverlays({
        ctx,
        width,
        height,
        territoryId: currentTerritory.id,
        time: currentTime,
        controlColor: environmentControlColor,
        buildings: tacticalBuildings,
        renderZoom: visualLoadZoom,
        visibleBounds: { left: visibleLeft, right: visibleRight, top: visibleTop, bottom: visibleBottom }
      });

      // 2. Ground bullet marks & blood stains
      groundMarksRef.current.forEach(gm => {
        if (!isVisible(gm.x, gm.y, gm.radius)) return;
        ctx.fillStyle = gm.color;
        ctx.globalAlpha = gm.alpha;
        ctx.beginPath();
        ctx.arc(gm.x, gm.y, gm.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 0.5 capture zones: world-space rings communicate ownership without text spam.
      if (operationEnabled) {
        for (const point of controlPointsRef.current) {
          if (!isVisible(point.x, point.y, CAPTURE_RADIUS + 8)) continue;
          const controlColor = point.status === 'captured'
            ? factionConfig.color
            : point.status === 'contested' ? '#fbbf24' : factionConfig.rivalColor;
          const activelyCapturing = point.status === 'contested' || point.progress > 0;
          const ringRadius = point.status === 'captured' ? 18 : activelyCapturing ? CAPTURE_RADIUS : 28;
          if (activelyCapturing) {
            ctx.fillStyle = `${controlColor}10`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, ringRadius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.save();
          ctx.strokeStyle = point.status === 'captured' ? `${controlColor}66` : `${controlColor}${activelyCapturing ? '99' : '44'}`;
          ctx.lineWidth = activelyCapturing ? 2 : 1;
          if (!activelyCapturing && point.status !== 'captured') ctx.setLineDash([4, 5]);
          ctx.beginPath();
          ctx.arc(point.x, point.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          if (point.status !== 'captured' && point.progress > 0) {
            ctx.strokeStyle = controlColor;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(
              point.x, point.y, CAPTURE_RADIUS - 4, -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * point.progress
            );
            ctx.stroke();
          }
          ctx.fillStyle = controlColor;
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.status === 'captured' ? 4.5 : 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. 0.5 Cidade Viva: o ponto de comando agora reflete visualmente os upgrades da organização.
      const baseHubX = width / 2;
      const baseHubY = height - 48;
      let baseStageCelebration = 0;
      if (!baseVisualPreviewRef.current && baseStageFxRef.current) {
        const age = Math.max(0, (currentTime - baseStageFxRef.current.startedAt) / 1200);
        if (age < 1) baseStageCelebration = 1 - age;
        else baseStageFxRef.current = null;
      }
      drawCommandBaseProgression(ctx, baseHubX, baseHubY, factionConfig, gameState, currentTime, currentTerritory.id, camera.zoom, baseVisualPreviewRef.current ?? undefined, baseStageCelebration);

      // 4. 2.5D depth pass: pooled entries avoid per-entity closures/garbage every frame.
      const depthRenderables = depthRenderQueueRef.current;
      const depthPool = depthRenderPoolRef.current;
      depthRenderables.length = 0;

      for (const b of tacticalBuildings) {
        if (!isVisible(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) + 36)) continue;
        enqueueDepthRenderable(depthRenderables, depthPool, 'building', b, b.y + b.h, 1);
      }
      for (const p of getUnifiedSupportSolids(currentTerritory.id, tacticalBuildings, width, height)) {
        if (p.kind === 'wall' || !isVisible(p.x+p.w/2,p.y+p.h/2,Math.max(p.w,p.h)+42)) continue;
        enqueueDepthRenderable(depthRenderables,depthPool,'contextBuilding',p,p.y+p.h,1);
      }
      for (const p of getTerritoryPurposeProps(currentTerritory.id)) {
        if (!isArchitecturalPurposeProp(p) && !isDepthSortedPurposeProp(p)) continue;
        const px=p.x*width,py=p.y*height,pw=p.w*width,ph=p.h*height;
        if (!isVisible(px+pw/2,py+ph/2,Math.max(pw,ph)+42)) continue;
        enqueueDepthRenderable(depthRenderables,depthPool,isArchitecturalPurposeProp(p)?'purposeBuilding':'purposeProp',p,py+ph,1);
      }
      for (const obs of obstaclesRef.current) {
        if (!isVisible(obs.x, obs.y, Math.max(obs.w, obs.h) + 12)) continue;
        enqueueDepthRenderable(depthRenderables, depthPool, 'obstacle', obs, obs.y + obs.h / 2, 2);
      }
      for (const f of fallenRef.current) {
        if (!isVisible(f.x, f.y, 24)) continue;
        enqueueDepthRenderable(depthRenderables, depthPool, 'fallen', f, f.y + 4, 0);
      }
      for (const a of alliesRef.current) {
        if (!isVisible(a.x, a.y, 42)) continue;
        enqueueDepthRenderable(depthRenderables, depthPool, 'ally', a, a.y + 9, 3);
      }
      for (const r of rivalsRef.current) {
        if (!isVisible(r.x, r.y, r.radius + 38)) continue;
        enqueueDepthRenderable(depthRenderables, depthPool, 'rival', r, r.y + 9, 3);
      }

      depthRenderables.sort((a, b) => a.depthY - b.depthY || a.priority - b.priority);
      for (const item of depthRenderables) {
        switch (item.kind) {
          case 'building': {
            const building = item.entity as TacticalBuilding;
            const captured = territoryDominated || capturedBuildingIdsRef.current.has(building.id);
            drawCityVivaBuildingSkin(
              ctx, building, currentTime, currentTerritory.id, captured,
              factionConfig.color, factionConfig.tag, visualLoadZoom
            );
            break;
          }
          case 'contextBuilding':
            drawUnifiedContextArchitecture(ctx,item.entity as UnifiedSupportSolid,currentTerritory.id,currentTime,environmentControlColor,visualLoadZoom);
            break;
          case 'purposeBuilding':
            drawPurposefulArchitecture(ctx,item.entity as PurposeProp,width,height,currentTerritory.id,currentTime,visualLoadZoom);
            break;
          case 'purposeProp':
            drawPurposefulDepthProp(ctx,item.entity as PurposeProp,width,height,currentTerritory.id,environmentControlColor,territoryDominated ? factionConfig.tag : factionConfig.rivalTag,visualLoadZoom);
            break;
          case 'obstacle': drawCoverObstacle(ctx, item.entity as CoverObstacle, currentTime); break;
          case 'fallen': drawFallenSprite(ctx, item.entity as FallenEntity, currentTime); break;
          case 'ally': {
            const ally = item.entity as AllyEntity;
            drawT1UnitGrounding(ctx,currentTerritory.id,ally.x,ally.y,10,false,currentTime,visualLoadZoom);
            drawAllySprite(ctx, ally, currentTime); break;
          }
          case 'rival': {
            const rival = item.entity as RivalEntity;
            drawT1UnitGrounding(ctx,currentTerritory.id,rival.x,rival.y,rival.radius,true,currentTime,visualLoadZoom);
            if (rival.type === 'gerente_boca') {
              const pulse = .5 + .5 * Math.sin(currentTime * .004 + rival.x * .01);
              ctx.save(); ctx.strokeStyle = `${factionConfig.rivalColor}${pulse > .5 ? '55' : '33'}`;
              ctx.lineWidth = 1.5; ctx.setLineDash([4,5]); ctx.beginPath();
              ctx.arc(rival.x, rival.y + 4, 32 + pulse * 4, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
            } else if (rival.type === 'chefe_morro') {
              const phase = getBossPhaseProfile(rival.maxHp > 0 ? rival.hp / rival.maxHp : 1).phase;
              const pulse = .5 + .5 * Math.sin(currentTime * .006);
              ctx.save(); ctx.strokeStyle = phase === 3 ? '#fb7185' : phase === 2 ? '#fbbf24' : `${factionConfig.rivalColor}88`;
              ctx.lineWidth = phase === 3 ? 2.5 : 1.5; ctx.beginPath();
              ctx.arc(rival.x, rival.y + 4, rival.radius + 9 + pulse * 3, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
            }
            drawRivalSprite(ctx, rival, currentTime); break;
          }
        }
      }
      // 0.5.2: only the elevated cap/canopy is redrawn here, creating cheap 2.5D occlusion.
      drawPurposefulPropsOcclusion(ctx, width, height, currentTerritory.id, currentTime, environmentControlColor);

      // 5. Bullets & Tracers
      bulletsRef.current.forEach(b => {
        if (!isVisible(b.x, b.y, 16)) return;
        drawBulletProjectile(ctx, b);
      });

      // 9. Combat Particles (Muzzle flashes, sparks, bullet casings, blood, smoke, shockwaves)
      const particleBudget = battleEntityCount >= 110 ? 240 : battleEntityCount >= 70 ? 360 : MAX_COMBAT_PARTICLES;
      if (particlesRef.current.length > particleBudget) {
        particlesRef.current.splice(0, particlesRef.current.length - particleBudget);
      }
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * 60 * visualDt;
        p.y += p.vy * 60 * visualDt;
        if (p.gravity) p.vy += p.gravity * 60 * visualDt;
        if (p.friction) {
          p.vx *= Math.pow(p.friction, 60 * visualDt);
          p.vy *= Math.pow(p.friction, 60 * visualDt);
        }
        if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot * 60 * visualDt;
        }
        p.life -= visualDt;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        if (!isVisible(p.x, p.y, Math.max(12, p.size * 3))) continue;

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 'muzzle') {
          const sz = p.size;
          ctx.translate(p.x, p.y); ctx.rotate(p.rotation || 0);
          ctx.fillStyle = 'rgba(254,240,138,.18)'; ctx.beginPath(); ctx.arc(0, 0, sz * 1.7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = p.color; ctx.beginPath();
          ctx.moveTo(-sz * .25, -sz * .28); ctx.lineTo(sz * 1.55, 0); ctx.lineTo(-sz * .25, sz * .28);
          ctx.lineTo(sz * .15, 0); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#fff7cc'; ctx.beginPath(); ctx.arc(0, 0, Math.max(1.5, sz * .28), 0, Math.PI * 2); ctx.fill();
        } else if (p.type === 'shockwave') {
          const waveRadius = (1 - p.life / p.maxLife) * (p.size * 6);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(0.5, 3 * (p.life / p.maxLife));
          ctx.beginPath();
          ctx.arc(p.x, p.y, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'casing') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillStyle = p.color;
          ctx.fillRect(-2, -1, 4, 2);
        } else if (p.type === 'smoke') {
          const smokeSize = (1 + (1 - p.life / p.maxLife) * 1.5) * p.size;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, smokeSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'gold_dust') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'spark') {
          const speed = Math.hypot(p.vx, p.vy);
          const nx = speed > .01 ? p.vx / speed : 1, ny = speed > .01 ? p.vy / speed : 0;
          const len = Math.min(9, Math.max(3, p.size * 2.6 + speed));
          ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(.7, p.size * .8); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(p.x - nx * len, p.y - ny * len); ctx.lineTo(p.x, p.y); ctx.stroke();
        } else {
          ctx.fillStyle = p.color; ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.type === 'blood' ? p.size * .65 : p.size, 0, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore();
      }
      ctx.globalAlpha = 1.0;

      // 10. Floating Combat Texts — important events get a compact plate so they
      // never disappear into roofs, road markings or busy props.
      floatingTextsRef.current.forEach(ft => {
        if (!isVisible(ft.x, ft.y, 30)) return;
        const invZoom = 1 / Math.max(.35, cameraRef.current.zoom);
        ctx.font = `bold ${11 * invZoom}px "Plus Jakarta Sans", sans-serif`;
        ctx.globalAlpha = ft.opacity;
        ctx.textAlign = 'center';
        const eventLike = ft.text.length >= 15 || /REFOR|CAPACIDADE|RESISTENCIA|BASE/.test(ft.text.toUpperCase());
        if (eventLike) {
          const tw = Math.min(190 * invZoom, Math.max(52 * invZoom, ctx.measureText(ft.text).width + 12 * invZoom));
          ctx.fillStyle = 'rgba(5,10,18,.78)';
          ctx.beginPath(); ctx.roundRect(ft.x - tw / 2, ft.y - 12 * invZoom, tw, 16 * invZoom, 4 * invZoom); ctx.fill();
          ctx.strokeStyle = ft.color; ctx.lineWidth = .8 * invZoom; ctx.globalAlpha = ft.opacity * .62; ctx.stroke();
          ctx.globalAlpha = ft.opacity;
        }
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      });
      ctx.globalAlpha = 1.0;
      ctx.restore(); // Restore un-zoomed screen space for UI & tooltips

      // 0.4D: combat readability lives in screen-space so zoom never makes labels unreadable.
      const hudCamera = cameraRef.current;
      const hoveredId = hoveredEntityRef.current?.entityId;
      const inHudViewport = (x: number, y: number, pad = 36) =>
        x >= -pad && x <= viewportWidth + pad && y >= -pad && y <= viewportHeight + pad;
      const drawHudBar = (x: number, y: number, pct: number, color: string, widthPx: number, boss = false) => {
        const h = boss ? 5 : 4;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
        ctx.fillRect(x - widthPx / 2, y, widthPx, h);
        ctx.fillStyle = color;
        ctx.fillRect(x - widthPx / 2 + 1, y + 1, Math.max(0, (widthPx - 2) * Math.max(0, Math.min(1, pct))), h - 2);
        ctx.strokeStyle = boss ? '#fbbf24' : 'rgba(255,255,255,0.28)';
        ctx.lineWidth = boss ? 1.2 : 0.7;
        ctx.strokeRect(x - widthPx / 2, y, widthPx, h);
      };
      const drawHudBadge = (x: number, y: number, label: string, color: string, emphasis = false) => {
        ctx.font = `700 ${emphasis ? 9 : 8}px "JetBrains Mono", monospace`;
        const widthPx = Math.max(20, ctx.measureText(label).width + 8);
        ctx.fillStyle = emphasis ? 'rgba(15, 23, 42, 0.96)' : 'rgba(15, 23, 42, 0.86)';
        ctx.beginPath();
        ctx.roundRect(x - widthPx / 2, y - 7, widthPx, 14, 4);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = emphasis ? 1.4 : 1;
        ctx.stroke();
        ctx.fillStyle = emphasis ? '#f8fafc' : color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y + 0.5);
      };
      const drawLootMarker = (x: number, y: number, color: string) => {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      };

      for (const a of alliesRef.current) {
        const p = worldToScreen({ x: a.x, y: a.y }, hudCamera, viewportRef.current);
        if (!inHudViewport(p.x, p.y)) continue;
        const isHovered = hoveredId === a.id;
        const isSpecial = a.type !== 'soldado_base';
        const topY = p.y - Math.max(22, 29 * hudCamera.zoom);
        if (a.hp < a.maxHp - 0.05 || isHovered) {
          drawHudBar(p.x, topY, a.hp / Math.max(1, a.maxHp), factionConfig.color, isSpecial ? 31 : 27);
        }
        // Faction is the persistent battlefield identity. Unit class stays in sprite/tooltip.
        const showFaction = isHovered;
        if (showFaction) {
          drawHudBadge(p.x, topY - 10, factionConfig.tag, factionConfig.color);
        }
      }

      for (const r of rivalsRef.current) {
        const p = worldToScreen({ x: r.x, y: r.y }, hudCamera, viewportRef.current);
        if (!inHudViewport(p.x, p.y)) continue;
        const isHovered = hoveredId === r.id;
        const isBoss = r.type === 'chefe_morro';
        const isElite = isBoss || r.type === 'blindado_choque' || r.type === 'gerente_boca';
        const topY = p.y - Math.max(23, (r.radius + 22) * hudCamera.zoom);
        if (isElite || r.hp < r.maxHp - 0.05 || isHovered) {
          drawHudBar(p.x, topY, r.hp / Math.max(1, r.maxHp), factionConfig.rivalColor, isBoss ? 44 : isElite ? 34 : 28, isBoss);
        }
        // Battlefield text stays sparse: faction badge only on hover or bosses.
        // Elite identity is carried by HP hierarchy/shape, not another persistent text label.
        const showFaction = isHovered || isBoss;
        if (showFaction) {
          drawHudBadge(p.x, topY - 10, factionConfig.rivalTag, factionConfig.rivalColor, isBoss);
        }
        if (r.type === 'gerente_boca') {
          ctx.save();
          ctx.globalAlpha = .26;
          ctx.strokeStyle = factionConfig.rivalColor;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 5]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(20, 30 * hudCamera.zoom), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        if (isBoss) {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Loot uses a tiny marker by default and expands only on hover.
      for (const f of fallenRef.current) {
        if (f.bountyCash <= 0 && f.bountyAmmo <= 0) continue;
        const p = worldToScreen({ x: f.x, y: f.y }, hudCamera, viewportRef.current);
        if (!inHudViewport(p.x, p.y)) continue;
        const isHoveredLoot = hoveredId === f.id;
        const lootColor = f.bountyAmmo > 0 ? '#38bdf8' : '#fbbf24';
        if (isHoveredLoot) {
          const lootText = `${f.bountyCash > 0 ? `$${f.bountyCash}` : ''}${f.bountyCash > 0 && f.bountyAmmo > 0 ? ' + ' : ''}${f.bountyAmmo > 0 ? `${f.bountyAmmo} MUN` : ''}`;
          drawHudBadge(p.x, p.y - 25, lootText, lootColor, true);
        } else {
          drawLootMarker(p.x, p.y - 23, lootColor);
        }
      }

      // Recruit preview uses the same centralized rule as button/keyboard/canvas commands.
      if (pointerInsideRef.current && !isDraggingRef.current && !hoveredEntityRef.current) {
        const validation = validateRecruitCommand(gameState, 'canvas', {
          activeAllies: alliesRef.current.length,
          battleAvailable: true
        });
        const pointer = mousePosRef.current;
        if (inHudViewport(pointer.screenX, pointer.screenY, 0)) {
          const previewColor = validation.ok ? '#10b981' : '#f43f5e';
          ctx.strokeStyle = previewColor;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.92;
          ctx.beginPath();
          ctx.arc(pointer.screenX, pointer.screenY, 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(pointer.screenX - 5, pointer.screenY);
          ctx.lineTo(pointer.screenX + 5, pointer.screenY);
          ctx.moveTo(pointer.screenX, pointer.screenY - 5);
          ctx.lineTo(pointer.screenX, pointer.screenY + 5);
          ctx.stroke();
          const previewText = validation.ok
            ? `Convocar | ${MANUAL_RECRUIT_INTEL_COST} Intel`
            : validation.reason === 'paused' ? 'Combate pausado'
              : validation.reason === 'capacity' ? 'Bonde no limite'
                : validation.reason === 'insufficient_intel' ? 'Intel insuficiente' : 'Indisponivel';
          drawHudBadge(pointer.screenX, Math.max(16, pointer.screenY - 25), previewText, previewColor, !validation.ok);
          ctx.globalAlpha = 1;
        }
      }

      // 11. Tooltip (screen-space; refs avoid React renders on pointer movement)
      const hoveredEntity = hoveredEntityRef.current;
      const mousePos = mousePosRef.current;
      if (hoveredEntity && hoveredEntity.type !== 'none') {
        const text = hoveredEntity.name || '';
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        const ttW = Math.max(130, ctx.measureText(text).width + 18);
        const ttX = Math.max(ttW / 2 + 10, Math.min(viewportWidth - ttW / 2 - 10, mousePos.screenX));
        const ttY = Math.max(28, mousePos.screenY - 18);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(ttX - ttW / 2, ttY - 13, ttW, 20, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = hoveredEntity.type === 'obstacle'
          ? '#fbbf24'
          : hoveredEntity.type === 'rival' ? '#f87171'
            : hoveredEntity.type === 'ally' ? '#34d399' : '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, ttX, ttY - 2);
      }

      // 0.4D tactical minimap: separate canvas, no React render required.
      const minimap = minimapCanvasRef.current;
      if (minimap && currentTime - minimapLastRenderMsRef.current >= 100) {
        minimapLastRenderMsRef.current = currentTime;
        const mctx = minimap.getContext('2d');
        if (mctx) {
          const mw = minimap.width;
          const mh = minimap.height;
          const sx = mw / WORLD_WIDTH;
          const sy = mh / WORLD_HEIGHT;
          mctx.clearRect(0, 0, mw, mh);
          mctx.fillStyle = territoryVisualProfile.groundBottom;
          mctx.fillRect(0, 0, mw, mh);
          drawCityVivaMinimapFoundation(mctx, mw, mh, currentTerritory.id, environmentControlColor);
          mctx.strokeStyle = `${environmentControlColor}55`;
          mctx.lineWidth = 2;
          mctx.strokeRect(1, 1, mw - 2, mh - 2);

          if (territoryDominated) {
            mctx.save();
            mctx.globalAlpha = 0.13;
            mctx.fillStyle = factionConfig.color;
            mctx.font = '900 30px Impact, sans-serif';
            mctx.textAlign = 'center';
            mctx.textBaseline = 'middle';
            mctx.translate(mw * 0.24, mh * 0.32);
            mctx.rotate(-0.16);
            mctx.fillText(factionConfig.tag, 0, 0);
            mctx.restore();
            mctx.save();
            mctx.globalAlpha = 0.10;
            mctx.fillStyle = factionConfig.color;
            mctx.font = '900 24px Impact, sans-serif';
            mctx.translate(mw * 0.78, mh * 0.70);
            mctx.rotate(0.12);
            mctx.fillText(factionConfig.tag, 0, 0);
            mctx.restore();
          }

          for (const b of tacticalBuildings) {
            const point = operationEnabled ? controlPointsRef.current.find(cp => cp.buildingId === b.id) : undefined;
            const hubColor = territoryDominated
              ? factionConfig.color
              : point?.status === 'captured' ? factionConfig.color
                : point?.status === 'contested' ? '#fbbf24' : b.graffitiColor;
            mctx.fillStyle = b.isRivalHub ? `${hubColor}90` : `${factionConfig.color}45`;
            mctx.fillRect(b.x * sx, b.y * sy, Math.max(3, b.w * sx), Math.max(3, b.h * sy));
            if (point) {
              mctx.strokeStyle = hubColor;
              mctx.lineWidth = point.status === 'contested' ? 3 : 1.5;
              mctx.strokeRect(b.x * sx - 1, b.y * sy - 1, Math.max(4, b.w * sx + 2), Math.max(4, b.h * sy + 2));
            }
          }
          for (const obs of obstaclesRef.current) {
            if (obs.destroyed) continue;
            mctx.fillStyle = obs.isExplosive ? '#f59e0b' : '#64748b';
            mctx.fillRect((obs.x - obs.w / 2) * sx, (obs.y - obs.h / 2) * sy, Math.max(2, obs.w * sx), Math.max(2, obs.h * sy));
          }
          mctx.fillStyle = factionConfig.color;
          for (const a of alliesRef.current) {
            mctx.beginPath();
            mctx.arc(a.x * sx, a.y * sy, a.type === 'batedor_moto' ? 2.4 : 1.8, 0, Math.PI * 2);
            mctx.fill();
          }
          mctx.fillStyle = factionConfig.rivalColor;
          for (const r of rivalsRef.current) {
            mctx.beginPath();
            mctx.arc(r.x * sx, r.y * sy, r.type === 'chefe_morro' ? 3.4 : r.type === 'blindado_choque' ? 2.6 : 1.8, 0, Math.PI * 2);
            mctx.fill();
          }

          const viewW = viewportWidth / camera.zoom;
          const viewH = viewportHeight / camera.zoom;
          const viewLeft = camera.centerX - viewW / 2;
          const viewTop = camera.centerY - viewH / 2;
          mctx.strokeStyle = '#f8fafc';
          mctx.lineWidth = 2;
          mctx.strokeRect(viewLeft * sx, viewTop * sy, viewW * sx, viewH * sy);
          mctx.fillStyle = 'rgba(248,250,252,0.035)';
          mctx.fillRect(viewLeft * sx, viewTop * sy, viewW * sx, viewH * sy);
        }
      }

      if (import.meta.env.DEV) {
        const perf = perfRef.current;
        perf.frameTimes.push(Math.max(0, rawDelta * 1000));
        perf.frames += 1;
        perf.simulationMs += perfSimulationMs;
        perf.renderMs += performance.now() - perfRenderStart;
        perf.simulationSteps += simulationSteps;
        perf.targetSearches += targetSearchesThisFrame;
        perf.projectileChecks += projectileChecksThisFrame;
        perf.unstuckTriggers += unstuckTriggersThisFrame;
        perf.edgeRecoveries += edgeRecoveriesThisFrame;
        perf.hardUnstuckTriggers += hardUnstuckTriggersThisFrame;
        perf.rivalAiMs += rivalAiMsThisFrame;
        perf.allyAiMs += allyAiMsThisFrame;
        perf.projectileMs += projectileMsThisFrame;
        const sampleDuration = currentTime - perf.sampleStart;
        if (sampleDuration >= 1000) {
          const divisor = Math.max(1, perf.frames);
          const sortedFrameTimes = perf.frameTimes.slice().sort((a, b) => a - b);
          const solidWorldViolations =
            alliesRef.current.reduce((count, ally) => count + (pointHasWorldClearance(ally.x, ally.y, ally.radius, worldColliders) ? 0 : 1), 0) +
            rivalsRef.current.reduce((count, rival) => count + (pointHasWorldClearance(rival.x, rival.y, rival.radius, worldColliders) ? 0 : 1), 0);
          const unstuckActive =
            alliesRef.current.reduce((count, ally) => count + ((ally.unstuckTimer ?? 0) > 0 ? 1 : 0), 0) +
            rivalsRef.current.reduce((count, rival) => count + ((rival.unstuckTimer ?? 0) > 0 ? 1 : 0), 0);
          const stuckPressure =
            alliesRef.current.reduce((count, ally) => count + ((ally.stuckTimer ?? 0) > 0.40 ? 1 : 0), 0) +
            rivalsRef.current.reduce((count, rival) => count + ((rival.stuckTimer ?? 0) > 0.40 ? 1 : 0), 0);
          const allyCentroidX = alliesRef.current.length > 0
            ? alliesRef.current.reduce((sum, ally) => sum + ally.x, 0) / alliesRef.current.length : 0;
          const allyCentroidY = alliesRef.current.length > 0
            ? alliesRef.current.reduce((sum, ally) => sum + ally.y, 0) / alliesRef.current.length : 0;
          const rivalCentroidX = rivalsRef.current.length > 0
            ? rivalsRef.current.reduce((sum, rival) => sum + rival.x, 0) / rivalsRef.current.length : 0;
          const rivalCentroidY = rivalsRef.current.length > 0
            ? rivalsRef.current.reduce((sum, rival) => sum + rival.y, 0) / rivalsRef.current.length : 0;
          const edgePopulation = countTerritoryEdgePopulation(
            currentTerritory.id, [...alliesRef.current, ...rivalsRef.current], width
          );
          window.__GAME_PERF__ = {
            avgFrameMs: perf.frameTimes.reduce((sum, value) => sum + value, 0) / divisor,
            p95FrameMs: sortedFrameTimes[Math.min(sortedFrameTimes.length - 1, Math.floor(sortedFrameTimes.length * 0.95))] ?? 0,
            sampledAt: currentTime, speed,
            camera: { ...cameraRef.current }, viewport: { ...viewportRef.current },
            loot: fallenRef.current.length,
            fps: perf.frames * 1000 / sampleDuration,
            avgSimulationMs: perf.simulationMs / divisor,
            avgRenderMs: perf.renderMs / divisor,
            avgSteps: perf.simulationSteps / divisor,
            avgTargetSearches: perf.targetSearches / divisor,
            avgProjectileChecks: perf.projectileChecks / divisor,
            avgRivalAiMs: perf.rivalAiMs / divisor,
            avgAllyAiMs: perf.allyAiMs / divisor,
            avgProjectileMs: perf.projectileMs / divisor,
            allies: alliesRef.current.length, rivals: rivalsRef.current.length,
            bullets: bulletsRef.current.length, particles: particlesRef.current.length,
            worldColliders: worldColliders.length, solidWorldViolations,
            unstuckTriggers: perf.unstuckTriggers, unstuckActive, stuckPressure,
            flowLaneRedirects: perf.flowLaneRedirects, edgeRecoveries: perf.edgeRecoveries,
            hardUnstuckTriggers: perf.hardUnstuckTriggers,
            leftEdgePopulation: edgePopulation.left, rightEdgePopulation: edgePopulation.right,
            allyCentroidX, allyCentroidY, rivalCentroidX, rivalCentroidY
          };
          (window as unknown as { __GAME_UNITS__?: { allies: Array<{x:number;y:number}>; rivals: Array<{x:number;y:number}> } }).__GAME_UNITS__ = {
            allies: alliesRef.current.map(({ x, y }) => ({ x, y })),
            rivals: rivalsRef.current.map(({ x, y }) => ({ x, y }))
          };
          perf.sampleStart = currentTime; perf.frames = 0; perf.simulationMs = 0; perf.renderMs = 0; perf.frameTimes.length = 0;
          perf.simulationSteps = 0; perf.targetSearches = 0; perf.projectileChecks = 0; perf.unstuckTriggers = 0;
          perf.flowLaneRedirects = 0; perf.edgeRecoveries = 0; perf.hardUnstuckTriggers = 0;
          perf.rivalAiMs = 0; perf.allyAiMs = 0; perf.projectileMs = 0;
        }

      }
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [
    gameState.gameSpeed,
    gameState.maxAllies,
    gameState.upgrades,
    currentTerritory,
    factionConfig,
    onRivalEliminated,
    onAllyDown,
    spawnRival,
    addMuzzleFlash,
    addImpactSparks,
    addNeutralizationEffects,
    addExplosion,
    addFloatingText,
    addGroundMark,
    onScavengeDrop,
    onSpawnRecruit,
    operationEnabled,
    syncDistrictHud,
    tacticalBuildings,
    territoryDominated,
    territoryVisualProfile
  ]);

  // 0.4A HiDPI backing store + container-aware ResizeObserver.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const syncCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const cssWidth = Math.max(1, rect.width);
      const cssHeight = Math.max(1, rect.height);
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const backingWidth = Math.max(1, Math.round(cssWidth * dpr));
      const backingHeight = Math.max(1, Math.round(cssHeight * dpr));

      viewportRef.current = { width: cssWidth, height: cssHeight, dpr };
      if (canvas.width !== backingWidth) canvas.width = backingWidth;
      if (canvas.height !== backingHeight) canvas.height = backingHeight;
      if (!didInitialFitRef.current && cssWidth > 0 && cssHeight > 0) {
        cameraRef.current = fitCameraToWorld(viewportRef.current, 28);
        didInitialFitRef.current = true;
        setZoom(cameraRef.current.zoom);
      } else {
        cameraRef.current = clampCamera(cameraRef.current, viewportRef.current);
      }
    };

    syncCanvasSize();
    const observer = new ResizeObserver(syncCanvasSize);
    observer.observe(container);
    window.addEventListener('resize', syncCanvasSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncCanvasSize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="relative w-full h-full min-h-0 bg-[#090b10] rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col cursor-pointer select-none"
    >
      {PerformanceOverlay && <React.Suspense fallback={null}><PerformanceOverlay /></React.Suspense>}
      {/* 0.4D/0.5 Compact combat + district objective */}
      <div
        className="battle-hud absolute top-3 left-4 z-10 min-w-[390px] max-w-[56%] rounded-lg border border-slate-800 bg-slate-950/94 px-3 py-2 text-xs shadow-lg backdrop-blur-md pointer-events-none"
        style={{
          borderLeftColor: territoryScene.accent, borderLeftWidth: 3,
          borderTopColor: `${territoryScene.accent}40`,
          background: 'linear-gradient(108deg, rgba(7,10,15,.97) 0%, rgba(9,13,20,.95) 76%, rgba(18,20,26,.93) 100%)',
          boxShadow: `0 14px 38px rgba(0,0,0,.48), inset 0 1px 0 ${territoryScene.accent}22`
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-950"
            style={{ backgroundColor: territoryScene.accent }}
          >
            T{currentTerritory.id}
          </span>
          <span className="font-semibold text-slate-100 truncate">{currentTerritory.name}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-mono-numbers">Aliados {alliesRef.current.length}/{gameState.maxAllies}</span>
          <span className="text-rose-400 font-mono-numbers">Rivais {rivalsRef.current.length}</span>
        </div>
        <div className="mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
          {TERRITORY_HUD_DESCRIPTORS[currentTerritory.id] ?? territoryScene.subtitle}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {territoryDominated ? (
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-emerald-300">
              DOMINADO <span className="text-slate-600">•</span> REDE LOCAL SOB CONTROLE {factionConfig.tag}
            </span>
          ) : (
            <>
              <span className={'text-[9px] font-black uppercase tracking-[0.12em] ' + (
                operationHud.phase === 'final_resistance' || (operationHud.enabled && operationHud.total > 0 && operationHud.captured === operationHud.total)
                  ? 'text-amber-300' : 'text-slate-300'
              )}>
                {operationHud.phase === 'final_resistance'
                  ? 'ÚLTIMA RESISTÊNCIA'
                  : operationHud.enabled && operationHud.total > 0 && operationHud.captured === operationHud.total
                    ? 'CONSOLIDAR PRESSÃO'
                    : campaignProfile.objectiveLabel + ' · PRESSÃO'}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-[width] duration-200"
                  style={{ width: `${Math.min(100, (gameState.territoryTakes / Math.max(1, dominationRequirement)) * 100)}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-amber-300">{Math.min(gameState.territoryTakes, dominationRequirement)}/{dominationRequirement}</span>
              {operationHud.enabled && (
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.08em] text-sky-300">
                  POSIÇÕES {operationHud.captured}/{operationHud.total}
                </span>
              )}
            </>
          )}
        </div>
        {!territoryDominated && operationHud.enabled && operationHud.phase === 'capture' && operationHud.activeLabel && (
          <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-500">
            <span className="font-black uppercase tracking-[0.10em] text-sky-400">ALVO</span>
            <span className="truncate text-slate-300">{operationHud.activeLabel}</span>
            <span className="ml-auto font-mono text-slate-500">{Math.round((operationHud.activeProgress ?? 0) * 100)}%</span>
          </div>
        )}
        {/* Territory Conquered Advance Button */}
        {nextTerritory && territoryDominated && onAdvanceTerritory && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceTerritory();
            }}
            className="battle-advance pointer-events-auto mt-2 flex w-full items-center gap-2 rounded-md border border-white/15 bg-[#d95736]/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-[0_7px_20px_rgba(0,0,0,.22)] transition-colors hover:bg-[#ef6845] cursor-pointer"
          >
            <>
              <span className="text-orange-100">▰</span>
              <span className="shrink-0">AVANÇAR</span>
              <span className="min-w-0 flex-1 truncate text-left font-semibold normal-case tracking-normal text-white/90">{nextTerritory.name}</span>
              <span className="text-sm leading-none">→</span>
            </>
          </button>
        )}

      </div>

      {/* Top Right Controls: Advance button & Zoom Controls Widget */}
      <div className="battle-controls absolute top-3 right-4 z-20 flex items-center gap-2">
        {/* Tactical Zoom & Pan Control Widget */}
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 shadow-lg text-xs">
          <button
            onClick={handleResetCamera}
            title="Centralizar em visão tática ampla"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer text-xs mr-0.5 border border-slate-700/60"
          >
            <span>▣</span>
            <span className="text-[10px]">Visão ampla</span>
          </button>
          <button
            onClick={handleZoomOut}
            title="Diminuir Zoom (ou role a roda do mouse para baixo)"
            className="w-5 h-5 flex items-center justify-center rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer text-xs"
          >
            −
          </button>
          <button
            onClick={handleZoomReset}
            title="Redefinir Zoom para 100%"
            className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            title="Aumentar Zoom (ou role a roda do mouse para cima)"
            className="w-5 h-5 flex items-center justify-center rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer text-xs"
          >
            +
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        className={`w-full h-full block touch-none ${isDraggingState ? 'cursor-grabbing' : 'cursor-grab'}`}
      />

      {/* Interactive tactical minimap */}
      <div className="absolute bottom-12 right-3 z-30 w-[172px] rounded-lg border border-slate-700/90 bg-slate-950/92 p-1.5 shadow-xl backdrop-blur-md">
        <div className="mb-1 flex w-full items-center justify-between px-0.5 text-[8px] uppercase tracking-[0.10em] text-slate-500 pointer-events-none">
          <span>Mapa tático</span>
          <span className="text-slate-600">arraste</span>
        </div>
        <canvas
          ref={minimapCanvasRef}
          aria-label="Minimapa tático"
          width={320}
          height={180}
          onPointerDown={handleMinimapPointerDown}
          onPointerMove={handleMinimapPointerMove}
          onPointerUp={handleMinimapPointerUp}
          onPointerCancel={handleMinimapPointerUp}
          className="block h-[90px] w-[160px] cursor-crosshair rounded border border-slate-800 bg-[#07101d] touch-none"
        />
      </div>

      {/* Contextual controls: disappear after the first interaction and can be recalled. */}
      {showControlGuide && (
        <div className="battle-help absolute bottom-3 left-4 z-20 flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/92 px-3 py-2 text-[10px] text-slate-300 shadow-xl backdrop-blur-md pointer-events-none">
          <span><strong className="text-amber-400">Arraste</strong> para navegar</span>
          <span className="text-slate-600">|</span>
          <span><strong className="text-sky-400">Scroll</strong> para zoom</span>
          <span className="text-slate-600">|</span>
          <span><strong className="text-emerald-400">Clique</strong> para convocar ({MANUAL_RECRUIT_INTEL_COST} Intel)</span>
        </div>
      )}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShowControlGuide(value => !value); }}
        title="Mostrar ou ocultar ajuda de controles"
        className="absolute bottom-3 right-3 z-30 h-7 w-7 rounded-full border border-slate-700 bg-slate-950/90 text-xs font-bold text-slate-400 hover:border-sky-500 hover:text-sky-300 transition-colors"
      >
        ?
      </button>
    </div>
  );
});
