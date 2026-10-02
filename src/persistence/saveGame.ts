import { BattleSnapshot, GameState, GameStats, TerritoryControlPoint } from '../types/game';
import { INITIAL_UPGRADES } from '../data/gameData';
import { getUpgradeCost } from '../rules/upgrades';

export const SAVE_FORMAT_VERSION = 2;
export const BALANCE_REVISION = 1;
export const STORAGE_KEY = 'factions_war_pt_br_save_v2';
export const LEGACY_STORAGE_KEY = 'factions_war_pt_br_save_v1';
export const BACKUP_STORAGE_KEY = 'factions_war_pt_br_save_backup';

export interface LoadGameResult {
  state: GameState;
  migrated: boolean;
  source: 'v2' | 'legacy' | 'default';
  warning?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const finite = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const nonNegative = (value: unknown, fallback: number): number =>
  Math.max(0, finite(value, fallback));

const integer = (value: unknown, fallback: number): number =>
  Math.floor(nonNegative(value, fallback));

const bool = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

export const createRunId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const sanitizeLevels = (value: unknown): Record<string, number> => {
  if (!isRecord(value)) return {};
  const output: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
      output[key] = Math.floor(raw);
    }
  }
  return output;
};

const LEGACY_UPGRADE_MAX_LEVELS: Record<string, number> = { boca_barricades: 25 };

const getAutoAmmoRebalanceRefund = (value: unknown): number => {
  const raw = isRecord(value) ? value : {};
  const levelCount = Math.min(integer(raw.boca_auto_ammo_scavenge, 0), 15);
  const item = INITIAL_UPGRADES.find(entry => entry.id === 'boca_auto_ammo_scavenge');
  if (!item || levelCount <= 0) return 0;
  let refund = 0;
  for (let level = 0; level < levelCount; level++) {
    const oldCost = Math.floor(120 * Math.pow(1.3, level));
    const newCost = getUpgradeCost(item, level);
    refund += Math.max(0, oldCost - newCost);
  }
  return refund;
};

const sanitizeUpgrades = (value: unknown, refundAutoAmmoRebalance = false) => {
  const raw = isRecord(value) ? value : {};
  const levels: Record<string, number> = {};
  const refunds = { grana: 0, municao: 0, respeito: 0, contatos: 0 };
  for (const item of INITIAL_UPGRADES) {
    const rawLevel = integer(raw[item.id], 0);
    const clamped = Math.min(rawLevel, item.maxLevel);
    if (clamped > 0) levels[item.id] = clamped;
    const legacyMax = LEGACY_UPGRADE_MAX_LEVELS[item.id] ?? item.maxLevel;
    const refundableLevel = Math.min(rawLevel, legacyMax);
    for (let level = clamped; level < refundableLevel; level++) {
      refunds[item.currency] += getUpgradeCost(item, level);
    }
  }
  const removedTrainingLevel = Math.min(integer(raw.intel_tactical_training, 0), 30);
  for (let level = 0; level < removedTrainingLevel; level++) {
    refunds.respeito += Math.floor(60 * Math.pow(1.22, level));
  }
  const autoAmmoRebalanceRefund = refundAutoAmmoRebalance ? getAutoAmmoRebalanceRefund(raw) : 0;
  refunds.municao += autoAmmoRebalanceRefund;
  return { levels, refunds, removedTrainingLevel, autoAmmoRebalanceRefund };
};

const sanitizeStats = (value: unknown, fallback: GameStats): GameStats => {
  const raw = isRecord(value) ? value : {};
  return {
    totalRivalsNeutralized: integer(raw.totalRivalsNeutralized, fallback.totalRivalsNeutralized),
    totalAlliesRecruited: integer(raw.totalAlliesRecruited, fallback.totalAlliesRecruited),
    totalCashEarned: nonNegative(raw.totalCashEarned, fallback.totalCashEarned),
    totalAmmoSeized: nonNegative(raw.totalAmmoSeized, fallback.totalAmmoSeized),
    totalRespectEarned: nonNegative(raw.totalRespectEarned, fallback.totalRespectEarned),
    totalContactsAcquired: nonNegative(raw.totalContactsAcquired, fallback.totalContactsAcquired),
    highestTerritoryReached: Math.max(1, Math.min(6, integer(raw.highestTerritoryReached, fallback.highestTerritoryReached))),
    hegemonyRituals: integer(raw.hegemonyRituals, fallback.hegemonyRituals),
    timePlayedSeconds: nonNegative(raw.timePlayedSeconds, fallback.timePlayedSeconds)
  };
};

const sanitizeSnapshotArray = <T>(value: unknown, maxItems = 600): T[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => isRecord(item) && typeof item.id === 'string' && typeof item.x === 'number' && Number.isFinite(item.x) && typeof item.y === 'number' && Number.isFinite(item.y))
    .slice(0, maxItems)
    .map(item => ({ ...item })) as T[];
};

const sanitizeControlPoints = (value: unknown): TerritoryControlPoint[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => isRecord(item) && typeof item.id === 'string' && typeof item.buildingId === 'string' && typeof item.label === 'string')
    .slice(0, 16)
    .map(item => {
      const raw = item as Record<string, unknown>;
      const status = raw.status === 'captured' || raw.status === 'contested' ? raw.status : 'rival';
      return {
        id: String(raw.id), buildingId: String(raw.buildingId), label: String(raw.label),
        x: finite(raw.x, 0), y: finite(raw.y, 0),
        progress: Math.max(0, Math.min(1, finite(raw.progress, 0))), status
      } as TerritoryControlPoint;
    });
};

const sanitizeBattleSnapshot = (value: unknown): BattleSnapshot | undefined => {
  if (!isRecord(value) || value.version !== 1 || typeof value.runId !== 'string') return undefined;
  const faction = value.faction === 'vermelha' || value.faction === 'azul' || value.faction === 'neutra' ? value.faction : null;
  if (!faction) return undefined;
  const territoryId = Math.max(1, Math.min(6, integer(value.territoryId, 1)));
  return {
    version: 1,
    runId: value.runId,
    territoryId,
    faction,
    capturedAt: nonNegative(value.capturedAt, Date.now()),
    allies: sanitizeSnapshotArray(value.allies),
    rivals: sanitizeSnapshotArray(value.rivals),
    fallen: sanitizeSnapshotArray(value.fallen),
    bullets: sanitizeSnapshotArray(value.bullets),
    obstacles: sanitizeSnapshotArray(value.obstacles, 200),
    spawnElapsedMs: nonNegative(value.spawnElapsedMs, 0),
    autoRecruitElapsedMs: nonNegative(value.autoRecruitElapsedMs, 0),
    controlPoints: sanitizeControlPoints(value.controlPoints),
    operationPhase: value.operationPhase === 'final_resistance' || value.operationPhase === 'dominated' ? value.operationPhase : 'capture',
    finalResistanceSpawned: bool(value.finalResistanceSpawned, false),
    finalResistanceWave: integer(value.finalResistanceWave, 0)
  };
};

const hasRecognizableShape = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && (
    'intel' in value ||
    'cash' in value ||
    'playerFaction' in value ||
    'stats' in value
  );

export const normalizeGameState = (
  rawValue: unknown,
  defaults: GameState,
  migratingLegacy = false
): GameState => {
  const raw = isRecord(rawValue) ? rawValue : {};
  const allowedSpeed = [0, 1, 2, 5];
  const requestedSpeed = finite(raw.gameSpeed, defaults.gameSpeed);
  const gameSpeed = allowedSpeed.includes(requestedSpeed) ? requestedSpeed : defaults.gameSpeed;
  const faction = raw.playerFaction === 'azul' || raw.playerFaction === 'neutra' || raw.playerFaction === 'vermelha'
    ? raw.playerFaction
    : defaults.playerFaction;
  const balanceRevision = integer(raw.balanceRevision, 0);
  const sanitizedUpgrades = sanitizeUpgrades(raw.upgrades, balanceRevision < BALANCE_REVISION);

  return {
    ...defaults,
    saveFormatVersion: SAVE_FORMAT_VERSION,
    balanceRevision: BALANCE_REVISION,
    runId: typeof raw.runId === 'string' && raw.runId.length > 0 ? raw.runId : createRunId(),
    runStartedAt: nonNegative(raw.runStartedAt, Date.now()),
    battleSnapshot: sanitizedUpgrades.removedTrainingLevel > 0 ? undefined : sanitizeBattleSnapshot(raw.battleSnapshot),
    playerFaction: faction,
    intel: nonNegative(raw.intel, defaults.intel),
    maxIntel: Math.max(1, nonNegative(raw.maxIntel, defaults.maxIntel)),
    intelRegen: nonNegative(raw.intelRegen, defaults.intelRegen),
    cash: nonNegative(raw.cash, defaults.cash) + sanitizedUpgrades.refunds.grana,
    ammo: nonNegative(raw.ammo, defaults.ammo) + sanitizedUpgrades.refunds.municao,
    respect: nonNegative(raw.respect, defaults.respect) + sanitizedUpgrades.refunds.respeito,
    runRespectEarned: migratingLegacy ? 0 : nonNegative(raw.runRespectEarned, defaults.runRespectEarned || 0),
    contacts: nonNegative(raw.contacts, defaults.contacts) + sanitizedUpgrades.refunds.contatos,
    hegemonyEmblems: nonNegative(raw.hegemonyEmblems, defaults.hegemonyEmblems),
    currentTerritoryId: Math.max(1, Math.min(6, integer(raw.currentTerritoryId, defaults.currentTerritoryId))),
    territoryTakes: integer(raw.territoryTakes, defaults.territoryTakes),
    runRivalsNeutralized: integer(raw.runRivalsNeutralized, defaults.runRivalsNeutralized),
    runHighestTerritoryReached: Math.max(
      1,
      Math.min(6, integer(raw.runHighestTerritoryReached, integer(raw.currentTerritoryId, defaults.currentTerritoryId)))
    ),
    maxAllies: Math.max(1, integer(raw.maxAllies, defaults.maxAllies)),
    upgrades: sanitizedUpgrades.levels,
    talents: sanitizeLevels(raw.talents),
    autoRecruitFallen: bool(raw.autoRecruitFallen, defaults.autoRecruitFallen),
    autoSniperFire: bool(raw.autoSniperFire, defaults.autoSniperFire),
    autoCollectAmmo: bool(raw.autoCollectAmmo, defaults.autoCollectAmmo),
    gameSpeed,
    soundVolume: Math.max(0, Math.min(1, finite(raw.soundVolume, defaults.soundVolume))),
    soundMuted: bool(raw.soundMuted, defaults.soundMuted),
    showDamageNumbers: bool(raw.showDamageNumbers, defaults.showDamageNumbers),
    showCombatSplatters: bool(raw.showCombatSplatters, defaults.showCombatSplatters),
    stats: sanitizeStats(raw.stats, defaults.stats),
    lastSaveTimestamp: nonNegative(raw.lastSaveTimestamp, defaults.lastSaveTimestamp)
  };
};

const parseStoredState = (serialized: string): unknown => JSON.parse(serialized);

export const loadGame = (defaults: GameState): LoadGameResult => {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    const legacy = current ? null : localStorage.getItem(LEGACY_STORAGE_KEY);
    const serialized = current || legacy;
    if (!serialized) return { state: defaults, migrated: false, source: 'default' };

    const parsed = parseStoredState(serialized);
    if (!hasRecognizableShape(parsed)) {
      return { state: defaults, migrated: false, source: 'default', warning: 'Save local inválido ignorado.' };
    }

    const isCurrent = parsed.saveFormatVersion === SAVE_FORMAT_VERSION;
    const removedTrainingLevel = isRecord(parsed.upgrades) ? integer(parsed.upgrades.intel_tactical_training, 0) : 0;
    const autoAmmoRefund = integer(parsed.balanceRevision, 0) < BALANCE_REVISION
      ? getAutoAmmoRebalanceRefund(parsed.upgrades)
      : 0;
    const warnings: string[] = [];
    if (removedTrainingLevel > 0) warnings.push('Treinamento Balístico removido: Respeito reembolsado e confronto salvo reiniciado para aplicar os atributos corretos.');
    if (autoAmmoRefund > 0) warnings.push(`Auto-Munição rebalanceada: +${autoAmmoRefund.toLocaleString('pt-BR')} munições devolvidas pela diferença de custo.`);
    return {
      state: normalizeGameState(parsed, defaults, !isCurrent),
      migrated: !isCurrent,
      source: isCurrent ? 'v2' : 'legacy',
      warning: warnings.length > 0 ? warnings.join(' ') : undefined
    };
  } catch {
    return { state: defaults, migrated: false, source: 'default', warning: 'Falha ao ler o save local.' };
  }
};

export const persistGame = (state: GameState): GameState => {
  const snapshot: GameState = {
    ...state,
    saveFormatVersion: SAVE_FORMAT_VERSION,
    balanceRevision: BALANCE_REVISION,
    lastSaveTimestamp: Date.now()
  };

  const previous = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (previous) localStorage.setItem(BACKUP_STORAGE_KEY, previous);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  return snapshot;
};

export const encodeSave = (state: GameState): string => {
  const snapshot = {
    ...state,
    saveFormatVersion: SAVE_FORMAT_VERSION,
    balanceRevision: BALANCE_REVISION,
    lastSaveTimestamp: Date.now()
  };
  return btoa(JSON.stringify(snapshot));
};

export const decodeSave = (encoded: string, defaults: GameState): LoadGameResult => {
  const parsed = JSON.parse(atob(encoded));
  if (!hasRecognizableShape(parsed)) throw new Error('Formato de save não reconhecido.');
  const isCurrent = parsed.saveFormatVersion === SAVE_FORMAT_VERSION;
  const removedTrainingLevel = isRecord(parsed.upgrades) ? integer(parsed.upgrades.intel_tactical_training, 0) : 0;
  const autoAmmoRefund = integer(parsed.balanceRevision, 0) < BALANCE_REVISION
    ? getAutoAmmoRebalanceRefund(parsed.upgrades)
    : 0;
  const warnings: string[] = [];
  if (removedTrainingLevel > 0) warnings.push('Treinamento Balístico removido: Respeito reembolsado e confronto salvo reiniciado.');
  if (autoAmmoRefund > 0) warnings.push(`Auto-Munição rebalanceada: +${autoAmmoRefund.toLocaleString('pt-BR')} munições devolvidas pela diferença de custo.`);
  return {
    state: normalizeGameState(parsed, defaults, !isCurrent),
    migrated: !isCurrent,
    source: isCurrent ? 'v2' : 'legacy',
    warning: warnings.length > 0 ? warnings.join(' ') : undefined
  };
};

