import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  RivalEntity, 
  AllyEntity, 
  FallenEntity, 
  BulletProjectile, 
  FloatingText, 
  GroundMark, 
  CoverObstacle,
  GameState 
} from '../types/game';
import { TERRITORIES, FACTION_CONFIGS } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';
import { 
  drawFavelaTileset, 
  createDefaultObstacles, 
  drawCoverObstacle, 
  drawFallenSprite, 
  drawBulletProjectile, 
  CombatParticle,
  getTacticalBuildings,
  TacticalBuilding
} from './canvas/favelaRenderer';
import { 
  drawAllySprite, 
  drawRivalSprite 
} from './canvas/soldierSprites';

interface GameCanvasProps {
  gameState: GameState;
  selectedOrderId: string;
  onSpawnRecruit: () => boolean;
  onDirectCommand: (orderId: string, targetX: number, targetY: number, targetEntityId?: string) => boolean;
  onRivalEliminated: (rival: RivalEntity) => void;
  onScavengeDrop?: (cash: number, ammo: number, isAutoSoldier?: boolean) => void;
  onAdvanceTerritory?: () => void;
  onAllyDown: (allyId: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  selectedOrderId: _selectedOrderId,
  onSpawnRecruit,
  onDirectCommand: _onDirectCommand,
  onRivalEliminated,
  onScavengeDrop,
  onAdvanceTerritory,
  onAllyDown
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Entities stored in mutable refs for steady 60fps performance
  const rivalsRef = useRef<RivalEntity[]>([]);
  const alliesRef = useRef<AllyEntity[]>([]);
  const fallenRef = useRef<FallenEntity[]>([]);
  const bulletsRef = useRef<BulletProjectile[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const groundMarksRef = useRef<GroundMark[]>([]);
  const obstaclesRef = useRef<CoverObstacle[]>([]);
  const particlesRef = useRef<CombatParticle[]>([]);

  // Timers
  const lastSpawnTimeRef = useRef<number>(Date.now());
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Zoom & Pan system (mouse wheel scroll + left-click drag)
  const [zoom, setZoom] = useState<number>(1.0);
  const zoomRef = useRef<number>(1.0);

  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingState, setIsDraggingState] = useState<boolean>(false);

  // Mouse & UI hover (coordinates in both world and screen space)
  const [mousePos, setMousePos] = useState<{ x: number; y: number; screenX: number; screenY: number }>({ 
    x: 0, 
    y: 0, 
    screenX: 0, 
    screenY: 0 
  });
  const [hoveredEntity, setHoveredEntity] = useState<{ type: 'rival' | 'fallen' | 'obstacle' | 'none'; name?: string } | null>(null);

  // Convert screen coordinates to world coordinates unprojecting center-anchor zoom & pan
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, screenX: 0, screenY: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    const curZoom = zoomRef.current;
    const curPan = panRef.current;
    const worldX = (screenX - canvas.width / 2 - curPan.x) / curZoom + canvas.width / 2;
    const worldY = (screenY - canvas.height / 2 - curPan.y) / curZoom + canvas.height / 2;
    return { x: worldX, y: worldY, screenX, screenY };
  }, []);

  // Zoom control handlers
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const nextZoom = Math.min(2.5, Math.max(0.65, Number((zoomRef.current * zoomFactor).toFixed(2))));
    zoomRef.current = nextZoom;
    setZoom(nextZoom);
  }, []);

  const handleZoomIn = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nextZoom = Math.min(2.5, Number((zoomRef.current + 0.15).toFixed(2)));
    zoomRef.current = nextZoom;
    setZoom(nextZoom);
  }, []);

  const handleZoomOut = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nextZoom = Math.max(0.65, Number((zoomRef.current - 0.15).toFixed(2)));
    zoomRef.current = nextZoom;
    setZoom(nextZoom);
  }, []);

  const handleZoomReset = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    zoomRef.current = 1.0;
    setZoom(1.0);
  }, []);

  const handleResetCamera = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    zoomRef.current = 1.0;
    setZoom(1.0);
    panRef.current = { x: 0, y: 0 };
    setPan({ x: 0, y: 0 });
  }, []);

  const currentTerritory = TERRITORIES.find(t => t.id === gameState.currentTerritoryId) || TERRITORIES[0];
  const nextTerritory = TERRITORIES.find(t => t.id === gameState.currentTerritoryId + 1);
  const factionConfig = FACTION_CONFIGS[gameState.playerFaction] || FACTION_CONFIGS.vermelha;

  // Add floating combat text
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    if (!gameState.showDamageNumbers) return;
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
  }, [gameState.showDamageNumbers]);

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
  const addMuzzleFlash = useCallback((x: number, y: number, angle: number, color: string) => {
    // 1. Muzzle Star Flash
    particlesRef.current.push({
      id: Math.random().toString(36).substring(7),
      x: x + Math.cos(angle) * 8,
      y: y + Math.sin(angle) * 8,
      vx: 0,
      vy: 0,
      color: '#fef08a',
      alpha: 1,
      size: 7,
      life: 0.08,
      maxLife: 0.08,
      type: 'muzzle'
    });

    // 2. High-speed Forward Sparks
    for (let i = 0; i < 4; i++) {
      const spd = 2.5 + Math.random() * 3.5;
      const spread = angle + (Math.random() - 0.5) * 0.7;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7),
        x: x + Math.cos(angle) * 8,
        y: y + Math.sin(angle) * 8,
        vx: Math.cos(spread) * spd,
        vy: Math.sin(spread) * spd,
        color: Math.random() < 0.5 ? color : '#fef08a',
        alpha: 1,
        size: 1.5 + Math.random() * 1.5,
        life: 0.18 + Math.random() * 0.1,
        maxLife: 0.28,
        type: 'spark',
        friction: 0.92
      });
    }

    // 3. Ejected Brass Shell Casing flying sideways and bouncing
    const casingAngle = angle + (Math.PI / 2) * (Math.random() < 0.5 ? 1 : -1) + (Math.random() - 0.5) * 0.4;
    const casingSpd = 1.2 + Math.random() * 1.5;
    particlesRef.current.push({
      id: Math.random().toString(36).substring(7),
      x,
      y,
      vx: Math.cos(casingAngle) * casingSpd,
      vy: Math.sin(casingAngle) * casingSpd - 0.8,
      color: '#eab308',
      alpha: 0.9,
      size: 3,
      life: 0.7,
      maxLife: 0.7,
      type: 'casing',
      gravity: 0.15,
      friction: 0.94,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.4
    });
  }, []);

  const addImpactSparks = useCallback((x: number, y: number, isBlood: boolean, _color: string) => {
    const count = isBlood ? 6 : 4;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.0 + Math.random() * 2.5;
      particlesRef.current.push({
        id: Math.random().toString(36).substring(7),
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: isBlood ? (Math.random() < 0.6 ? '#dc2626' : '#991b1b') : '#fef08a',
        alpha: 1,
        size: isBlood ? (2 + Math.random() * 2) : (1.5 + Math.random() * 1.5),
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        type: isBlood ? 'blood' : 'spark',
        friction: 0.93,
        gravity: isBlood ? 0.08 : 0
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
    const burstCount = isBoss ? 18 : 10;
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
    for (let i = 0; i < (isBoss ? 5 : 3); i++) {
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
      for (let i = 0; i < 7; i++) {
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
    for (let i = 0; i < 24; i++) {
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
    for (let i = 0; i < 8; i++) {
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
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 600;
    const height = canvas ? canvas.height : 450;

    const baseHubX = width / 2;
    const baseHubY = height - 40;

    const posX = spawnX !== undefined ? spawnX : baseHubX + (Math.random() * 40 - 20);
    const posY = spawnY !== undefined ? spawnY : baseHubY - (Math.random() * 25 + 10);

    const upgrades = gameState.upgrades;
    const talents = gameState.talents;

    const hpLvl = upgrades['armory_bulletproof_vest'] || 0;
    const dmgLvl = upgrades['armory_heavy_calibers'] || 0;
    const spdLvl = upgrades['armory_motorcycle_squad'] || 0;
    const tacticalTrainingLvl = upgrades['intel_tactical_training'] || 0;
    const veteranMult = (1 + (talents['talent_veteran_enforcers'] || 0) * 0.25) * (1 + tacticalTrainingLvl * 0.15);

    const maxHp = (55 + hpLvl * 12) * (1 + (talents['talent_veteran_enforcers'] || 0) * 0.25);
    const damage = (14 + dmgLvl * 2.8) * veteranMult;
    const speed = (1.2 + spdLvl * 0.08);

    const motoChance = spdLvl > 0 ? Math.min(0.35, 0.08 + spdLvl * 0.03) : 0;
    const isMoto = !isFuzileiro && Math.random() < motoChance;

    let allyType: AllyEntity['type'] = 'soldado_base';
    let allyName = `Recruta (${factionConfig.tag})`;
    let allySpeed = speed;
    let allyDamage = damage;
    let allyRange = 100;
    let allyCooldown = 0.85;
    let allyRadius = 12;

    if (isFuzileiro) {
      allyType = 'soldado_fuzil';
      allyName = `Fuzileiro (${factionConfig.tag})`;
      allySpeed = speed * 0.9;
      allyDamage = damage * 1.35;
      allyRange = 175;
      allyCooldown = 1.4;
      allyRadius = 11;
    } else if (isMoto) {
      allyType = 'batedor_moto';
      allyName = `Batedor de Moto (${factionConfig.tag})`;
      allySpeed = speed * 2.0;
      allyDamage = damage * 1.15;
      allyRange = 85;
      allyCooldown = 0.65;
      allyRadius = 10;
    }

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
  }, [gameState.upgrades, gameState.talents, factionConfig, addFloatingText]);

  // Spawn rival soldier based on territory pool (emerges organically from tactical buildings like Incremancer)
  const spawnRival = useCallback((
    width: number, 
    height: number, 
    customX?: number, 
    customY?: number, 
    originBuildingName?: string,
    isReinforcement = false
  ) => {
    const pool = currentTerritory.rivalPool;
    const rand = Math.random() * 100;
    let type: RivalEntity['type'] = 'olheiro';
    let cumulative = pool.olheiro;

    if (rand < cumulative) {
      type = 'olheiro';
    } else if (rand < (cumulative += pool.soldado_pistola)) {
      type = 'soldado_pistola';
    } else if (rand < (cumulative += pool.atirador_fuzil)) {
      type = 'atirador_fuzil';
    } else if (rand < (cumulative += pool.gerente_boca)) {
      type = 'gerente_boca';
    } else if (rand < (cumulative += pool.blindado_choque)) {
      type = 'blindado_choque';
    } else {
      type = 'chefe_morro';
    }

    let x = customX !== undefined ? customX : 0;
    let y = customY !== undefined ? customY : 0;
    let bName = originBuildingName;

    if (customX === undefined || customY === undefined) {
      // Pick an active rival building stronghold (Boca da Leste, Esconderijo, Barraquinha, etc.)
      const rivalBuildings = getTacticalBuildings(width, height, factionConfig).filter(b => b.isRivalHub);
      if (rivalBuildings.length > 0) {
        const picked = rivalBuildings[Math.floor(Math.random() * rivalBuildings.length)];
        x = picked.doorX + (Math.random() * 14 - 7);
        y = picked.doorY + (Math.random() * 10 - 5);
        bName = picked.label;
      } else {
        x = width * 0.75;
        y = height * 0.35;
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
        addFloatingText(`⚠️ Reforço: ${bName}!`, x, y - 14, factionConfig.rivalColor);
      }
    }

    const zoneMult = currentTerritory.bountyMultiplier;

    let baseHp = 35;
    let baseDmg = 5;
    let speed = 1.1;
    let color = factionConfig.rivalColor;
    let name = 'Olheiro Rival';
    let radius = 10;
    let attackRange = 20;

    switch (type) {
      case 'olheiro':
        baseHp = 35 * zoneMult;
        baseDmg = 4;
        speed = 1.25;
        name = `Olheiro do ${factionConfig.rivalTag}`;
        radius = 10;
        attackRange = 22;
        break;
      case 'soldado_pistola':
        baseHp = 75 * zoneMult;
        baseDmg = 12 * zoneMult;
        speed = 0.95;
        name = `Soldado Pistoleiro (${factionConfig.rivalTag})`;
        radius = 12;
        attackRange = 110;
        break;
      case 'atirador_fuzil':
        baseHp = 55 * zoneMult;
        baseDmg = 18 * zoneMult;
        speed = 0.9;
        name = `Fuzileiro Fal / AR (${factionConfig.rivalTag})`;
        radius = 11;
        attackRange = 180;
        break;
      case 'gerente_boca':
        baseHp = 95 * zoneMult;
        baseDmg = 10 * zoneMult;
        speed = 0.85;
        name = `Gerente do Ponto (${factionConfig.rivalTag})`;
        radius = 13;
        attackRange = 130;
        break;
      case 'blindado_choque':
        baseHp = 260 * zoneMult;
        baseDmg = 28 * zoneMult;
        speed = 0.75;
        name = 'Segurança Pesado Encouraçado';
        radius = 15;
        attackRange = 35;
        break;
      case 'chefe_morro':
        baseHp = 580 * zoneMult;
        baseDmg = 42 * zoneMult;
        speed = 0.85;
        name = `Chefe de Área (${factionConfig.rivalTag})`;
        radius = 18;
        attackRange = 140;
        break;
    }

    rivalsRef.current.push({
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
      patrolTargetX: x + (Math.random() * 70 - 35),
      patrolTargetY: y + (Math.random() * 50 - 25),
      patrolWaitTimer: 1.0 + Math.random() * 2.5
    });
  }, [currentTerritory, factionConfig, addFloatingText]);

  // Fixed initial garrison on territory advance / init (spawns distributed across map buildings)
  useEffect(() => {
    alliesRef.current = [];
    fallenRef.current = [];
    bulletsRef.current = [];
    floatingTextsRef.current = [];
    groundMarksRef.current = [];
    particlesRef.current = [];
    panRef.current = { x: 0, y: 0 };
    setPan({ x: 0, y: 0 });

    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 600;
    const h = canvas ? canvas.height : 450;
    obstaclesRef.current = createDefaultObstacles(w, h);

    // Initial fixed defenders: emerge from tactical buildings (Boca da Leste, Esconderijo, Barraquinha, etc.)
    const rivalBuildings = getTacticalBuildings(w, h, factionConfig).filter(b => b.isRivalHub);
    const initialGarrison = Math.min(currentTerritory.maxRivals, 4 + currentTerritory.id * 2);
    rivalsRef.current = [];
    
    if (rivalBuildings.length > 0) {
      for (let i = 0; i < initialGarrison; i++) {
        const b = rivalBuildings[i % rivalBuildings.length];
        const rx = b.doorX + (Math.random() * 32 - 16);
        const ry = b.doorY + (Math.random() * 24 - 12);
        spawnRival(w, h, rx, ry, b.label, false);
      }
    } else {
      for (let i = 0; i < initialGarrison; i++) {
        const rx = 40 + (i * ((w - 80) / initialGarrison)) + (Math.random() * 20 - 10);
        const ry = 35 + Math.random() * (h * 0.48);
        spawnRival(w, h, rx, ry, undefined, false);
      }
    }
  }, [gameState.currentTerritoryId, currentTerritory, spawnRival, factionConfig]);

  // Starter gang talent spawn
  useEffect(() => {
    const starterLvl = gameState.talents['talent_starter_gang'] || 0;
    if (starterLvl > 0 && alliesRef.current.length === 0) {
      for (let i = 0; i < starterLvl * 2; i++) {
        deployAllySoldier(220 + (i * 28), 350 + ((i % 2) * 20));
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
          if (onScavengeDrop) {
            onScavengeDrop(f.bountyCash, f.bountyAmmo, false);
          }
          const lootText = f.bountyAmmo > 0 
            ? `+$${f.bountyCash} & +${f.bountyAmmo} Mun!` 
            : `+$${f.bountyCash}!`;
          addFloatingText(lootText, f.x, f.y, '#38bdf8');
        } else {
          addFloatingText('Sem Espólios Úteis', f.x, f.y, '#94a3b8');
        }
        fallenRef.current.splice(i, 1);
        return;
      }
    }

    // 2. Summon Recruit
    if (alliesRef.current.length >= gameState.maxAllies) {
      addFloatingText('Bonde no Limite!', clickX, clickY, '#ef4444');
      return;
    }

    if (onSpawnRecruit()) {
      const fuzilChance = (gameState.upgrades['boca_fuzileiros_elite'] || 0) * 0.05;
      const isFuzil = Math.random() < fuzilChance;
      deployAllySoldier(clickX, clickY, isFuzil);

      const doubleLvl = gameState.upgrades['sindicato_double_reinforcements'] || 0;
      if (doubleLvl > 0 && Math.random() < (doubleLvl * 0.08) && alliesRef.current.length < gameState.maxAllies) {
        deployAllySoldier(clickX + (Math.random() * 20 - 10), clickY + (Math.random() * 20 - 10), isFuzil);
        addFloatingText('+1 REFORÇO EXTRA!', clickX, clickY - 22, '#38bdf8');
      }
    }
  };

  // Mouse Down: Start potential drag-to-pan across the map
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...panRef.current };
    }
  };

  // Mouse Move: Pan camera in all directions if dragged, and update entity hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > 4) {
        if (!hasDraggedRef.current) {
          hasDraggedRef.current = true;
          setIsDraggingState(true);
        }
        const newPan = {
          x: panStartRef.current.x + dx,
          y: panStartRef.current.y + dy
        };
        panRef.current = newPan;
        setPan(newPan);
      }
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);
    const x = coords.x;
    const y = coords.y;
    setMousePos(coords);

    let found = false;
    for (const r of rivalsRef.current) {
      if (Math.hypot(r.x - x, r.y - y) <= r.radius + 8) {
        setHoveredEntity({ type: 'rival', name: `${r.name} (HP: ${Math.round(r.hp)}/${Math.round(r.maxHp)})` });
        found = true;
        break;
      }
    }
    if (!found) {
      for (const f of fallenRef.current) {
        if (Math.hypot(f.x - x, f.y - y) <= 16) {
          if (f.bountyCash > 0 || f.bountyAmmo > 0) {
            const lootDesc = f.bountyAmmo > 0 
              ? `+$${f.bountyCash} & +${f.bountyAmmo} Mun` 
              : `+$${f.bountyCash}`;
            setHoveredEntity({ type: 'fallen', name: `Espólios: ${lootDesc} (Clique ou passe por cima)` });
          } else {
            setHoveredEntity({ type: 'fallen', name: 'Corpo abatido (sem espólios)' });
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
          setHoveredEntity({ type: 'obstacle', name: `${obsLabel} - HP: ${Math.round(obs.hp)}/${obs.maxHp}` });
          found = true;
          break;
        }
      }
    }
    if (!found) {
      setHoveredEntity(null);
    }
  };

  // Mouse Up: Distinguish quick click from drag-pan
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      const wasDragging = hasDraggedRef.current;
      isDraggingRef.current = false;
      setIsDraggingState(false);
      if (!wasDragging && e.button === 0) {
        executeCanvasClick(e.clientX, e.clientY);
      }
    }
  };

  // Mouse Leave: Cancel drag and hover
  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setIsDraggingState(false);
    setHoveredEntity(null);
  };

  // Automated Syndicate recruit loop
  useEffect(() => {
    const autoRecruitLvl = gameState.upgrades['sindicato_auto_recruit'] || 0;
    if (autoRecruitLvl > 0 && gameState.autoRecruitFallen) {
      const interval = Math.max(1200, (11 - autoRecruitLvl) * 750) / (gameState.gameSpeed || 1);
      const timer = setInterval(() => {
        if (alliesRef.current.length < gameState.maxAllies) {
          const fuzilChance = (gameState.upgrades['boca_fuzileiros_elite'] || 0) * 0.05;
          const isFuzil = Math.random() < fuzilChance;
          deployAllySoldier(undefined, undefined, isFuzil);
        }
      }, interval);
      return () => clearInterval(timer);
    }
  }, [gameState.upgrades, gameState.autoRecruitFallen, gameState.maxAllies, gameState.gameSpeed, deployAllySoldier]);

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
      const dt = Math.min(rawDelta, 0.1) * speed;

      const width = canvas.width;
      const height = canvas.height;

      if (speed > 0) {
        // --- 1. SPAWN RIVALS & DYNAMIC REINFORCEMENTS LOOP ---
        const now = Date.now();
        const fixedMinGarrison = Math.min(currentTerritory.maxRivals, 4 + currentTerritory.id * 2);
        const currentRivals = rivalsRef.current.length;

        // Guarantee zone never starts empty or stays depleted when advancing/clearing
        if (currentRivals === 0) {
          const buildings = getTacticalBuildings(width, height, factionConfig).filter(b => b.isRivalHub);
          for (let i = 0; i < fixedMinGarrison; i++) {
            if (buildings.length > 0) {
              const b = buildings[i % buildings.length];
              const rx = b.doorX + (Math.random() * 32 - 16);
              const ry = b.doorY + (Math.random() * 24 - 12);
              spawnRival(width, height, rx, ry, b.label, false);
            } else {
              const rx = 40 + (i * ((width - 80) / fixedMinGarrison)) + (Math.random() * 20 - 10);
              const ry = 35 + Math.random() * (height * 0.48);
              spawnRival(width, height, rx, ry, undefined, false);
            }
          }
          lastSpawnTimeRef.current = now;
        } else {
          const isSeverelyDepleted = currentRivals < Math.ceil(fixedMinGarrison * 0.45);
          const needsReinforcements = currentRivals < fixedMinGarrison;
          const effectiveInterval = isSeverelyDepleted
            ? Math.min(650, currentTerritory.spawnRate * 0.3) / speed
            : (needsReinforcements 
                ? Math.min(1200, currentTerritory.spawnRate * 0.5) / speed 
                : currentTerritory.spawnRate / speed);

          if (now - lastSpawnTimeRef.current > effectiveInterval && currentRivals < currentTerritory.maxRivals) {
            // Emerge organically from one of the active rival buildings (Incremancer style)
            spawnRival(width, height, undefined, undefined, undefined, true);
            lastSpawnTimeRef.current = now;
          }
        }

        // --- 2. RIVALS AI & COMBAT ---
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

            // Visual combat particles & shockwave
            addNeutralizationEffects(r.x, r.y, true, isBoss, bountyCash > 0 || bountyAmmo > 0);
            addGroundMark(r.x, r.y, 'bullet_mark');
            addFloatingText(`+$${r.type === 'olheiro' ? 15 : 35} Grana`, r.x, r.y, '#10b981');

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

            onRivalEliminated(r);
            rivalsRef.current.splice(i, 1);
            continue;
          }

          r.attackTimer -= dt;
          if (r.recoilTimer && r.recoilTimer > 0) {
            r.recoilTimer -= dt;
          }

          // Find closest ally to engage
          let closestAlly: AllyEntity | null = null;
          let minDist = 9999;
          for (const a of alliesRef.current) {
            const d = Math.hypot(a.x - r.x, a.y - r.y);
            if (d < minDist) {
              minDist = d;
              closestAlly = a;
            }
          }

          if (r.type === 'olheiro') {
            if (closestAlly && minDist < 180) {
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
                  r.patrolTargetX = 40 + Math.random() * (width - 80);
                  r.patrolTargetY = 30 + Math.random() * (height * 0.52);
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
              if (minDist <= r.attackRange) {
                // Strafe gently perpendicular to combat line
                const strafeDir = (i % 2 === 0 ? 1 : -1);
                const strafeAng = combatAngle + (Math.PI / 2) * strafeDir;
                const strafeSpd = r.speed * 0.25 * Math.sin(Date.now() * 0.002 + i);
                r.vx = Math.cos(strafeAng) * strafeSpd;
                r.vy = Math.sin(strafeAng) * strafeSpd;
                r.state = 'attack';

                if (r.attackTimer <= 0) {
                  // Trigger Weapon Recoil Kickback
                  r.recoilTimer = 0.12;

                  // Barrel-tip aligned muzzle flash + sound
                  const barrelOffset = r.type === 'atirador_fuzil' ? 22 : 12;
                  const muzzleX = r.x + Math.cos(combatAngle) * barrelOffset;
                  const muzzleY = r.y + Math.sin(combatAngle) * barrelOffset;

                  // Strictly use entity color for muzzle flash & projectile (PCC = Blue, CV = Red)
                  addMuzzleFlash(muzzleX, muzzleY, combatAngle, r.color);
                  soundEngine.playGunfireShot(r.type === 'atirador_fuzil' ? 'fuzil' : 'rival');

                  bulletsRef.current.push({
                    id: Math.random().toString(36).substring(7),
                    x: muzzleX,
                    y: muzzleY,
                    targetX: closestAlly.x,
                    targetY: closestAlly.y,
                    speed: 6.5,
                    damage: r.damage,
                    source: 'rival',
                    color: r.color,
                    radius: 3
                  });
                  r.attackTimer = r.attackCooldown;
                }
              } else {
                // Tactical Approach towards player troops
                r.state = 'patrol';
                const approachVx = Math.cos(combatAngle) * r.speed;
                const approachVy = Math.sin(combatAngle) * r.speed;
                r.vx += (approachVx - r.vx) * Math.min(1, 8 * dt);
                r.vy += (approachVy - r.vy) * Math.min(1, 8 * dt);
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
                  r.patrolTargetX = 45 + Math.random() * (width - 90);
                  r.patrolTargetY = 35 + Math.random() * (height * 0.50);
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

          // Soft Mutual Separation: prevent overlapping clumping
          for (let j = 0; j < rivalsRef.current.length; j++) {
            if (i !== j) {
              const other = rivalsRef.current[j];
              const sepDist = Math.hypot(other.x - r.x, other.y - r.y);
              if (sepDist > 0 && sepDist < 24) {
                const force = ((24 - sepDist) / 24) * 0.6;
                r.vx -= ((other.x - r.x) / sepDist) * force;
                r.vy -= ((other.y - r.y) / sepDist) * force;
              }
            }
          }

          // Boundary Repulsion & Safe Bounds (Organic navigation, no stuck units)
          const margin = 35;
          if (r.x < margin) r.vx += (margin - r.x) * 0.12 * dt * 60;
          if (r.x > width - margin) r.vx -= (r.x - (width - margin)) * 0.12 * dt * 60;
          if (r.y < margin) r.vy += (margin - r.y) * 0.12 * dt * 60;

          // CRUCIAL: Repel from lower screen border so rivals NEVER get trapped at the bottom!
          const bottomBorderLimit = height * 0.70;
          if (r.y > bottomBorderLimit) {
            const pushUp = (r.y - bottomBorderLimit) * 0.20 * dt * 60;
            r.vy -= pushUp;
            if (!closestAlly) {
              r.patrolTargetY = height * 0.30 + Math.random() * (height * 0.25);
            }
          }

          // Hard clamping safe-guards
          if (r.x < r.radius) { r.x = r.radius; r.vx = Math.abs(r.vx) * 0.5; }
          if (r.x > width - r.radius) { r.x = width - r.radius; r.vx = -Math.abs(r.vx) * 0.5; }
          if (r.y < r.radius) { r.y = r.radius; r.vy = Math.abs(r.vy) * 0.5; }
          if (r.y > height - r.radius - 20) { r.y = height - r.radius - 20; r.vy = -Math.abs(r.vy) * 0.8; }

          // Smooth Facing Rotation (shortest arc interpolation)
          let rTargetAngle = Math.atan2(r.vy, r.vx);
          if (closestAlly && minDist <= r.attackRange) {
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

          r.x += r.vx * 60 * dt;
          r.y += r.vy * 60 * dt;
        }

        // --- 3. ALLIES AI & COMBAT ---
        const medicsLvl = gameState.upgrades['armory_medics_safehouse'] || 0;

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
            a.hp = Math.min(a.maxHp, a.hp + medicsLvl * 1.5 * dt);
          }

          // Scavenge fallen bodies
          a.scavengeCooldown = (a.scavengeCooldown || 0) - dt;
          if (a.scavengeCooldown <= 0) {
            for (let fIdx = fallenRef.current.length - 1; fIdx >= 0; fIdx--) {
              const f = fallenRef.current[fIdx];
              if (Math.hypot(f.x - a.x, f.y - a.y) <= a.radius + 6) {
                a.scavengeCooldown = 2.5;

                if (f.bountyCash > 0 || f.bountyAmmo > 0) {
                  const collectedCash = Math.max(1, Math.floor(f.bountyCash * 0.5));
                  const collectedAmmo = (f.bountyAmmo > 0 && Math.random() < 0.30) ? 1 : 0;

                  if (onScavengeDrop) {
                    onScavengeDrop(collectedCash, collectedAmmo, true);
                  }
                  const lootText = collectedAmmo > 0 
                    ? `+$${collectedCash} & +1 Mun (Tropa)` 
                    : `+$${collectedCash} (Tropa)`;
                  addFloatingText(lootText, f.x, f.y, '#34d399');
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

          // Closest rival to engage
          let closestRival: RivalEntity | null = null;
          let minDist = 9999;
          for (const r of rivalsRef.current) {
            const d = Math.hypot(r.x - a.x, r.y - a.y);
            if (d < minDist) {
              minDist = d;
              closestRival = r;
            }
          }

          if (closestRival) {
            const dist = Math.hypot(closestRival.x - a.x, closestRival.y - a.y);
            const angle = Math.atan2(closestRival.y - a.y, closestRival.x - a.x);

            if (dist <= a.attackRange) {
              a.vx = 0;
              a.vy = 0;
              if (a.attackTimer <= 0) {
                // Trigger Weapon Recoil Kickback
                a.recoilTimer = 0.12;

                // Barrel-tip aligned muzzle flash + sound
                const barrelOffset = a.type === 'soldado_fuzil' ? 21 : 13;
                const muzzleX = a.x + Math.cos(angle) * barrelOffset;
                const muzzleY = a.y + Math.sin(angle) * barrelOffset;
                addMuzzleFlash(muzzleX, muzzleY, angle, factionConfig.color);

                const weaponSound = a.type === 'soldado_fuzil' ? 'fuzil' : (a.type === 'batedor_moto' ? 'moto' : 'pistol');
                soundEngine.playGunfireShot(weaponSound);

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
                  radius: 3
                });

                a.attackTimer = a.attackCooldown;
              }
            } else {
              a.vx = Math.cos(angle) * a.speed;
              a.vy = Math.sin(angle) * a.speed;
            }
          } else {
            a.vx = (Math.random() - 0.5) * a.speed * 0.4;
            a.vy = -a.speed * 0.7;
          }

          // Smooth Facing Rotation (shortest arc interpolation)
          let aTargetAngle = Math.atan2(a.vy, a.vx);
          if (closestRival && minDist <= a.attackRange) {
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

          a.x += a.vx * 60 * dt;
          a.y += a.vy * 60 * dt;

          if (a.x < a.radius) { a.x = a.radius; a.vx *= -1; }
          if (a.x > width - a.radius) { a.x = width - a.radius; a.vx *= -1; }
          if (a.y < a.radius) { a.y = a.radius; a.vy *= -1; }
          if (a.y > height - a.radius) { a.y = height - a.radius; a.vy *= -1; }
        }

        // --- 4. PROJECTILES, COVER OBSTACLES & DETONATIONS ---
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          const angle = Math.atan2(b.targetY - b.y, b.targetX - b.x);
          b.x += Math.cos(angle) * b.speed * 60 * dt;
          b.y += Math.sin(angle) * b.speed * 60 * dt;

          const distToTarget = Math.hypot(b.targetX - b.x, b.targetY - b.y);
          let bulletRemoved = false;

          // A. Check collision with Cover Obstacles
          for (const obs of obstaclesRef.current) {
            if (!obs.destroyed && Math.abs(b.x - obs.x) <= obs.w / 2 && Math.abs(b.y - obs.y) <= obs.h / 2) {
              obs.hp -= b.damage;
              addImpactSparks(b.x, b.y, false, '#fef08a');
              soundEngine.playBulletImpact(false);
              addFloatingText(`-${Math.round(b.damage)}`, obs.x, obs.y - 10, '#94a3b8');

              if (obs.hp <= 0 && !obs.destroyed) {
                obs.destroyed = true;

                if (obs.isExplosive) {
                  // Detonate gas cylinder or car in a huge fiery area blast!
                  soundEngine.playExplosion();
                  addExplosion(obs.x, obs.y, 90);
                  const blastText = obs.type === 'botijao_gas' ? '💥 EXPLOSÃO DE GÁS!' : '💥 VEÍCULO EXPLODIU!';
                  addFloatingText(blastText, obs.x, obs.y - 18, '#f97316');

                  // Area-of-effect blast damage to nearby enemies and allies
                  for (let rIdx = rivalsRef.current.length - 1; rIdx >= 0; rIdx--) {
                    const r = rivalsRef.current[rIdx];
                    const distToBlast = Math.hypot(r.x - obs.x, r.y - obs.y);
                    if (distToBlast <= 90) {
                      const blastDmg = Math.round(95 * (1 - distToBlast / 110));
                      r.hp -= blastDmg;
                      // Knockback
                      const blastAng = Math.atan2(r.y - obs.y, r.x - obs.x);
                      r.vx += Math.cos(blastAng) * 4;
                      r.vy += Math.sin(blastAng) * 4;
                      addFloatingText(`-${blastDmg} Dano Explosivo`, r.x, r.y, '#f97316');
                    }
                  }

                  for (let aIdx = alliesRef.current.length - 1; aIdx >= 0; aIdx--) {
                    const a = alliesRef.current[aIdx];
                    const distToBlast = Math.hypot(a.x - obs.x, a.y - obs.y);
                    if (distToBlast <= 90) {
                      const blastDmg = Math.round(75 * (1 - distToBlast / 110));
                      a.hp -= blastDmg;
                      const blastAng = Math.atan2(a.y - obs.y, a.x - obs.x);
                      a.vx += Math.cos(blastAng) * 3;
                      a.vy += Math.sin(blastAng) * 3;
                    }
                  }
                }
              }

              bulletsRef.current.splice(i, 1);
              bulletRemoved = true;
              break;
            }
          }
          if (bulletRemoved) continue;

          // B. Check collision with Characters
          if (b.source === 'rival') {
            for (const a of alliesRef.current) {
              if (Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius) {
                const barricadeLvl = gameState.upgrades['boca_barricades'] || 0;
                const reduction = Math.min(0.6, barricadeLvl * 0.03);
                const finalDmg = b.damage * (1 - reduction);
                a.hp -= finalDmg;
                addImpactSparks(b.x, b.y, true, '#ef4444');
                soundEngine.playBulletImpact(true);
                addFloatingText(`-${Math.round(finalDmg)}`, a.x, a.y, '#f87171');
                bulletsRef.current.splice(i, 1);
                bulletRemoved = true;
                break;
              }
            }
          } else if (b.source === 'ally' || b.source === 'tactical') {
            for (const r of rivalsRef.current) {
              if (Math.hypot(r.x - b.x, r.y - b.y) < r.radius + b.radius) {
                r.hp -= b.damage;
                addImpactSparks(b.x, b.y, true, b.color);
                soundEngine.playBulletImpact(true);
                addFloatingText(`-${Math.round(b.damage)}`, r.x, r.y, b.color);
                addGroundMark(r.x, r.y, 'bullet_mark');
                if (!b.isExplosive) {
                  bulletsRef.current.splice(i, 1);
                  bulletRemoved = true;
                  break;
                }
              }
            }
          }

          if (!bulletRemoved && (distToTarget < 6 || b.x < 0 || b.x > width || b.y < 0 || b.y > height)) {
            bulletsRef.current.splice(i, 1);
          }
        }

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

      // ==========================================
      // RENDERING (Layered Favela Map + Sprites + Particles)
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      // Apply Center-Anchor Zoom & Pan Transformation
      ctx.save();
      const curZoom = zoomRef.current;
      const curPan = panRef.current;
      ctx.translate(width / 2 + curPan.x, height / 2 + curPan.y);
      ctx.scale(curZoom, curZoom);
      ctx.translate(-width / 2, -height / 2);

      // 1. Layered Tileset (Ground, cobbles, asphalt, stairs, roofs, poles)
      drawFavelaTileset(ctx, width, height, currentTerritory.id, factionConfig, currentTime);

      // 2. Ground bullet marks & blood stains
      groundMarksRef.current.forEach(gm => {
        ctx.fillStyle = gm.color;
        ctx.globalAlpha = gm.alpha;
        ctx.beginPath();
        ctx.arc(gm.x, gm.y, gm.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 3. Tactical Cover Obstacles (Dumpsters, cars, barriers, gas cylinders)
      obstaclesRef.current.forEach(obs => {
        drawCoverObstacle(ctx, obs, currentTime);
      });

      // 4. Fallen Enemies / Loot Drops
      fallenRef.current.forEach(f => {
        drawFallenSprite(ctx, f, currentTime);
      });

      // 5. Command Base Antenna at bottom center
      const baseHubX = width / 2;
      const baseHubY = height - 32;
      const baseGrad = ctx.createRadialGradient(baseHubX, baseHubY, 4, baseHubX, baseHubY, 40);
      baseGrad.addColorStop(0, `${factionConfig.color}44`);
      baseGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(baseHubX, baseHubY, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `${factionConfig.color}88`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(baseHubX, baseHubY, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(baseHubX, baseHubY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = factionConfig.color;
      ctx.font = 'bold 9px "Plus Jakarta Sans"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(factionConfig.tag, baseHubX, baseHubY);

      // 6. Allies (Sprites)
      alliesRef.current.forEach(a => {
        drawAllySprite(ctx, a, currentTime);
      });

      // 7. Rivals (Sprites)
      rivalsRef.current.forEach(r => {
        drawRivalSprite(ctx, r, currentTime);
      });

      // 8. Bullets & Tracers
      bulletsRef.current.forEach(b => {
        drawBulletProjectile(ctx, b);
      });

      // 9. Combat Particles (Muzzle flashes, sparks, bullet casings, blood, smoke, shockwaves)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        if (p.gravity) p.vy += p.gravity * 60 * dt;
        if (p.friction) {
          p.vx *= Math.pow(p.friction, 60 * dt);
          p.vy *= Math.pow(p.friction, 60 * dt);
        }
        if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot * 60 * dt;
        }
        p.life -= dt;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 'muzzle') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const sz = p.size;
          ctx.moveTo(p.x, p.y - sz);
          ctx.lineTo(p.x + sz * 0.3, p.y - sz * 0.3);
          ctx.lineTo(p.x + sz, p.y);
          ctx.lineTo(p.x + sz * 0.3, p.y + sz * 0.3);
          ctx.lineTo(p.x, p.y + sz);
          ctx.lineTo(p.x - sz * 0.3, p.y + sz * 0.3);
          ctx.lineTo(p.x - sz, p.y);
          ctx.lineTo(p.x - sz * 0.3, p.y - sz * 0.3);
          ctx.closePath();
          ctx.fill();
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
        } else {
          // spark and blood
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
      ctx.globalAlpha = 1.0;

      // 10. Floating Combat Texts
      floatingTextsRef.current.forEach(ft => {
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.opacity;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
      });
      ctx.globalAlpha = 1.0;
      ctx.restore(); // Restore un-zoomed screen space for UI & tooltips

      // 11. Tooltip (Screen space directly above cursor)
      if (hoveredEntity && hoveredEntity.type !== 'none') {
        const text = hoveredEntity.name || '';
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        const ttW = Math.max(130, ctx.measureText(text).width + 18);
        const ttX = Math.max(ttW / 2 + 10, Math.min(width - ttW / 2 - 10, mousePos.screenX));
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
          : (hoveredEntity.type === 'rival' ? '#f87171' : '#38bdf8');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, ttX, ttY - 2);
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
    hoveredEntity,
    mousePos,
    onRivalEliminated,
    onAllyDown,
    spawnRival,
    addMuzzleFlash,
    addImpactSparks,
    addNeutralizationEffects,
    addExplosion,
    addFloatingText,
    addGroundMark,
    onScavengeDrop
  ]);

  // Window resize observer
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (obstaclesRef.current.length === 0) {
        obstaclesRef.current = createDefaultObstacles(rect.width, rect.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      onWheel={handleWheel}
      className="relative w-full h-full min-h-[480px] bg-[#090b10] rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col cursor-pointer select-none"
    >
      {/* Top Banner on Canvas */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
        <span className="text-slate-400">Território Disputado:</span>
        <span className="font-semibold text-slate-100">{currentTerritory.name}</span>
        <span className="text-slate-600">·</span>
        <span className="text-emerald-400 font-mono-numbers">Seu Bonde: {alliesRef.current.length} / {gameState.maxAllies}</span>
        <span className="text-slate-600">·</span>
        <span className="text-rose-400 font-mono-numbers">Rivais em Campo: {rivalsRef.current.length}</span>
      </div>

      {/* Top Right Controls: Advance button & Zoom Controls Widget */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
        {/* Territory Conquered Advance Button */}
        {nextTerritory && gameState.territoryTakes >= nextTerritory.requiredTakes && onAdvanceTerritory && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceTerritory();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xl shadow-rose-950/50 border border-amber-400/80 animate-pulse cursor-pointer"
          >
            <span>🏆 CONQUISTADO! AVANÇAR: {nextTerritory.name}</span>
            <span>→</span>
          </button>
        )}

        {/* Tactical Zoom & Pan Control Widget */}
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 shadow-lg text-xs">
          <button
            onClick={handleResetCamera}
            title="Centralizar Câmera e Redefinir Zoom para 100%"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer text-xs mr-0.5 border border-slate-700/60"
          >
            <span>🎯</span>
            <span className="text-[10px]">Centralizar</span>
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`w-full h-full block ${isDraggingState ? 'cursor-grabbing' : 'cursor-grab'}`}
      />

      {/* Bottom Command Guide */}
      <div className="absolute bottom-2 left-4 right-4 z-10 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
        <div>
          <span>Arraste com o <strong className="text-amber-400 font-semibold">Botão Esquerdo</strong> para navegar</span>
          <span className="mx-2 text-slate-600">·</span>
          <span>Role o <strong className="text-sky-400 font-semibold">Scroll do Mouse</strong> para Zoom</span>
          <span className="mx-2 text-slate-600">·</span>
          <span>Clique no Mapa = <strong className="text-emerald-400 font-semibold">Convocar Recruta (10 Intel)</strong></span>
        </div>
        <div className="text-slate-500 font-mono">
          Factions War Engine 60 FPS
        </div>
      </div>
    </div>
  );
};
