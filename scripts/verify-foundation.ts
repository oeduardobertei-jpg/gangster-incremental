import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDefaultState } from '../src/state/defaultGameState';
import {
  BACKUP_STORAGE_KEY,
  BALANCE_REVISION,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  decodeSave,
  encodeSave,
  loadGame,
  normalizeGameState,
  persistGame
} from '../src/persistence/saveGame';
import { validateRecruitCommand } from '../src/rules/recruitment';
import { getHegemonyReward, performHegemony } from '../src/rules/prestige';
import { segmentAabbHitT, segmentCircleHitT } from '../src/rules/collision';
import { getAllyLiveStats, getAutoAmmoIntervalSeconds, getAutoAmmoPerMinute, getAutoAmmoYield, getBarricadeDamageReduction, getMotorcycleChance, getUpgradeCost, getUpgradeEffectRows, rebaseAllyStatsForState } from '../src/rules/upgrades';
import { formatEconomicRewardFeedback, getRivalEliminationReward, getScavengeCredit } from '../src/rules/rewards';
import { INITIAL_PRESTIGE_TALENTS, INITIAL_UPGRADES, TERRITORIES } from '../src/data/gameData';
import { applyCampaignMilestones, AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS, getAutoRecruitMilestoneProgress } from '../src/rules/progression';
import { getHegemonyTalentCost, getHegemonyTalentEffectRows } from '../src/rules/hegemonyTalents';
import { BASE_VISUAL_MAX_SCORE, getBaseCommandPreviewProfile, getBaseCommandVisualProfile, getBaseStageProgress, getBaseVisualScore, getBaseVisualStage } from '../src/rules/baseCommandVisualProgression';
import { allocateBalancedLevels, getIncrementalStageState, getStageFeatureProgress } from '../src/rules/incrementalBuildingVisuals';
import { getNextVisualTierLevel, getVisualTier } from '../src/data/visualTokens';
import { clampCamera, createDefaultCamera, panCameraByScreenDelta, screenToWorld, worldToScreen, zoomCameraAtScreenPoint, WORLD_HEIGHT, WORLD_WIDTH } from '../src/components/canvas/camera2D';
import { applySeparationToVelocity, computeAllySeparationVector, findOrganicSpawnPosition, getPreferredAllyDistance } from '../src/rules/troopMovement';
import type { AllyEntity } from '../src/types/game';

const fixture = (name: string) => JSON.parse(
  readFileSync(resolve('test/fixtures', name), 'utf8')
);

const store = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => store.clear()
  }
});

const defaults = createDefaultState();
const legacy = fixture('save-intermediate-v1.json');
store.clear();
localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));
const migrated = loadGame(defaults);
assert.equal(migrated.migrated, true);
assert.equal(migrated.state.runRespectEarned, 0, 'migração não pode reutilizar respeito elegível antigo');
assert.equal(migrated.state.hegemonyEmblems, 3, 'emblemas antigos devem ser preservados');
assert.equal(migrated.state.talents.talent_cartel_cash, 1, 'talentos antigos devem ser preservados');

const hostile = normalizeGameState({
  playerFaction: null,
  intel: -500,
  cash: -1,
  ammo: null,
  respect: -90,
  currentTerritoryId: 999,
  gameSpeed: 37,
  upgrades: { armory_bulletproof_vest: -5 },
  stats: null
}, defaults, false);
assert.equal(hostile.intel, 0);
assert.equal(hostile.cash, 0);
assert.equal(hostile.respect, 0);
assert.equal(hostile.currentTerritoryId, 6);
assert.equal(hostile.gameSpeed, defaults.gameSpeed);
assert.deepEqual(hostile.upgrades, {});

store.clear();
const firstPersisted = persistGame(defaults);
assert.ok(localStorage.getItem(STORAGE_KEY));
const secondPersisted = persistGame({ ...firstPersisted, cash: 777 });
assert.equal(secondPersisted.cash, 777);
assert.ok(localStorage.getItem(BACKUP_STORAGE_KEY), 'segundo save deve preservar backup anterior');

const invalidFixture = fixture('save-invalid.json');
assert.throws(
  () => decodeSave(btoa(JSON.stringify(invalidFixture)), defaults),
  /Formato de save não reconhecido/
);

const manualOk = validateRecruitCommand({ ...defaults, intel: 10, gameSpeed: 1 }, 'button', {
  activeAllies: 0,
  battleAvailable: true
});
assert.deepEqual(manualOk, { ok: true, intelCost: 10 });

const paused = validateRecruitCommand({ ...defaults, gameSpeed: 0 }, 'keyboard', {
  activeAllies: 0,
  battleAvailable: true
});
assert.equal(paused.reason, 'paused');

const full = validateRecruitCommand(defaults, 'canvas', {
  activeAllies: defaults.maxAllies,
  battleAvailable: true
});
assert.equal(full.reason, 'capacity');

const autoWithoutIntel = validateRecruitCommand({ ...defaults, intel: 0, gameSpeed: 1 }, 'auto', {
  activeAllies: 0,
  battleAvailable: true
});
assert.deepEqual(autoWithoutIntel, { ok: true, intelCost: 0 });

const noBattle = validateRecruitCommand(defaults, 'button', {
  activeAllies: 0,
  battleAvailable: false
});
assert.equal(noBattle.reason, 'battle_unavailable');

const movementAlly = (id: string, x: number, y: number, type: AllyEntity['type'] = 'soldado_base'): AllyEntity => ({
  id, type, name: 'Teste', x, y, vx: 0, vy: 0, hp: 100, maxHp: 100, speed: 1.2, damage: 10,
  attackRange: 100, attackCooldown: 1, attackTimer: 0, targetId: null, color: '#fff',
  radius: type === 'batedor_moto' ? 10 : 12
});
const occupied = movementAlly('occupied', 640, 650);
const organicSpawn = findOrganicSpawnPosition({
  desiredX: 640, desiredY: 650, radius: 12, type: 'soldado_base', allies: [occupied],
  worldWidth: WORLD_WIDTH, worldHeight: WORLD_HEIGHT, sequence: 1
});
assert.ok(Math.hypot(organicSpawn.x - occupied.x, organicSpawn.y - occupied.y) >= getPreferredAllyDistance(movementAlly('candidate', 0, 0), occupied), 'spawn orgÃ¢nico deve evitar sobreposiÃ§Ã£o imediata');
const overlapA = movementAlly('overlap-a', 500, 400);
const overlapB = movementAlly('overlap-b', 500, 400);
const separation = computeAllySeparationVector(overlapA, [overlapA, overlapB]);
assert.ok(Number.isFinite(separation.x) && Number.isFinite(separation.y) && Math.hypot(separation.x, separation.y) > 0, 'separaÃ§Ã£o deve resolver unidades no mesmo ponto');
const separatedVelocity = applySeparationToVelocity(overlapA, separation.x, separation.y);
assert.ok(Math.hypot(separatedVelocity.vx, separatedVelocity.vy) > 0, 'separaÃ§Ã£o deve gerar deslocamento orgÃ¢nico');

const prestigeReady = {
  ...defaults,
  runRespectEarned: 40,
  respect: 40,
  currentTerritoryId: 2,
  upgrades: { armory_bulletproof_vest: 3 },
  stats: { ...defaults.stats, totalRespectEarned: 9999 }
};
assert.equal(getHegemonyReward(prestigeReady), 4, 'prévia deve usar apenas respeito elegível da rodada');
const firstPrestige = performHegemony(prestigeReady);
assert.equal(firstPrestige.ok, true);
assert.equal(firstPrestige.reward, 4);
assert.equal(firstPrestige.state.runRespectEarned, 0);
assert.deepEqual(firstPrestige.state.upgrades, {});
assert.equal(getBaseVisualStage(0), 0);
assert.equal(getBaseVisualStage(19), 0);
assert.equal(getBaseVisualStage(20), 1);
assert.equal(getBaseVisualStage(70), 2);
assert.equal(getBaseVisualStage(150), 3);
assert.ok(getBaseStageProgress(19) > .9, 'estágio 0 deve amadurecer gradualmente antes do marco 20');
assert.equal(getBaseStageProgress(20), 0, 'novo estágio começa sua própria progressão interna em zero');
assert.ok(getBaseStageProgress(69) > .95, 'estágio 1 deve amadurecer gradualmente antes do marco 70');
assert.equal(getBaseStageProgress(70), 0);
assert.ok(getBaseStageProgress(149) > .98, 'estágio 2 deve amadurecer gradualmente antes do marco 150');
assert.equal(getBaseStageProgress(150), 0);
const allBranchesOneLevel = {
  ...defaults,
  upgrades: Object.fromEntries(INITIAL_UPGRADES.map(item => [item.id, 1]))
};
assert.equal(getBaseVisualScore(allBranchesOneLevel), INITIAL_UPGRADES.length, 'todos os upgrades da run devem contar para o estágio visual');
const resetVisual = getBaseCommandVisualProfile(firstPrestige.state);
assert.equal(resetVisual.stage, 0, 'Hegemonia deve reconstruir a Base desde o estágio visual inicial');
assert.equal(resetVisual.score, 0, 'Hegemonia deve zerar a progressão visual da run');
assert.equal(resetVisual.hegemonyHonors, 1, 'Hegemonia deve deixar apenas uma marca permanente de honra');
assert.equal(BASE_VISUAL_MAX_SCORE, 350, 'score máximo visual deve refletir todos os 12 upgrades');
for (const stage of [0, 1, 2, 3] as const) {
  assert.equal(getBaseCommandPreviewProfile({ kind: 'stage', stage }).stage, stage, `preview E${stage} deve reproduzir o estágio pedido`);
}
const fortPreview = getBaseCommandPreviewProfile({ kind: 'tier', key: 'fortification', tier: 5 });
assert.equal(fortPreview.stage, 2, 'preview isolado de tier deve usar a casca E2');
assert.equal(fortPreview.tiers.fortification, 5, 'preview de tier deve chegar exatamente ao tier pedido');
assert.equal(getBaseCommandPreviewProfile({ kind: 'honors', count: 5 }).hegemonyHonors, 5);
assert.equal(getIncrementalStageState(69, [0,20,70,150], 350).stage, 1);
assert.equal(getIncrementalStageState(70, [0,20,70,150], 350).stage, 2);
const balanced = allocateBalancedLevels(37, { a:{id:'a',max:20}, b:{id:'b',max:30} });
assert.equal(balanced.a + balanced.b, 37, 'motor genérico deve distribuir o score alvo sem perda');
assert.equal(getStageFeatureProgress(1, 1, 1, .35), 1);
assert.equal(getStageFeatureProgress(2, 0, 1, .35), 1, 'feature concluída não pode encolher em estágio superior');
assert.equal(getStageFeatureProgress(2, 1, 2, .25), 1);
assert.equal(getStageFeatureProgress(3, 0, 2, .25), 1, 'ala E2 deve permanecer completa em E3');
assert.equal(getVisualTier(0, 50), 0);
assert.equal(getNextVisualTierLevel(0, 50), 1);
assert.equal(getVisualTier(1, 50), 1);
assert.equal(getNextVisualTierLevel(1, 50), 13);
assert.equal(getVisualTier(13, 50), 2);
assert.equal(getNextVisualTierLevel(13, 50), 25);
assert.equal(getNextVisualTierLevel(25, 50), 38);
assert.equal(getNextVisualTierLevel(38, 50), 50);
assert.equal(getNextVisualTierLevel(50, 50), null);
assert.notEqual(firstPrestige.state.runId, prestigeReady.runId);
const secondPrestige = performHegemony(firstPrestige.state);
assert.equal(secondPrestige.ok, false, 'segundo prestígio sem novo progresso não pode pagar');
assert.equal(secondPrestige.reward, 0);
assert.equal(getHegemonyReward({ ...defaults, runRespectEarned: 0, stats: { ...defaults.stats, totalRespectEarned: 999999 } }), 0);

const circleHit = segmentCircleHitT(0, 0, 100, 0, 50, 0, 5);
assert.ok(circleHit !== null && circleHit > 0.4 && circleHit < 0.5, 'segmento rápido deve detectar alvo estreito');
assert.equal(segmentCircleHitT(0, 0, 100, 0, 50, 20, 5), null, 'trajetória paralela distante não deve colidir');
const wallHit = segmentAabbHitT(0, 0, 120, 0, 48, -3, 52, 3);
assert.ok(wallHit !== null && wallHit < 0.5, 'segmento rápido deve detectar cobertura estreita');
assert.equal(segmentAabbHitT(0, 10, 120, 10, 48, -3, 52, 3), null);

const barricade = INITIAL_UPGRADES.find(u => u.id === 'boca_barricades')!;
assert.equal(barricade.maxLevel, 20);
assert.equal(getBarricadeDamageReduction(20), 0.6);
const expectedBarricadeRefund = [20, 21, 22, 23, 24].reduce((sum, level) => sum + getUpgradeCost(barricade, level), 0);
assert.equal(expectedBarricadeRefund, 12386);
const refunded = normalizeGameState({ ...defaults, ammo: 100, upgrades: { boca_barricades: 25 } }, defaults, false);
assert.equal(refunded.upgrades.boca_barricades, 20);
assert.equal(refunded.ammo, 100 + expectedBarricadeRefund);
assert.ok(INITIAL_UPGRADES.every(item => getUpgradeEffectRows(item, 0).length > 0));

const rewardT1 = getRivalEliminationReward('soldado_pistola', TERRITORIES[0], 0);
const rewardT6 = getRivalEliminationReward('soldado_pistola', TERRITORIES[5], 0);
assert.deepEqual(rewardT1, { cash: 30, ammo: 2, respect: 1, contacts: 0 });
assert.equal(rewardT6.cash, 135);
assert.equal(rewardT6.ammo, 9);
assert.equal(TERRITORIES[5].healthMultiplier, 4.5);
assert.equal(TERRITORIES[5].damageMultiplier, 4.5);
assert.equal(TERRITORIES[5].rewardMultiplier, 4.5);

const scavengeCredit = getScavengeCredit(10, 2, 1);
assert.deepEqual(scavengeCredit, { cash: 15, ammo: 2, respect: 0, contacts: 0 });
assert.equal(
  formatEconomicRewardFeedback({ cash: 30, ammo: 2, respect: 1, contacts: 1 }),
  '+$30 · +2 Mun · +1 Respeito · +1 Contato'
);

assert.equal(AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS, 100);
const beforeMilestone = {
  ...defaults,
  runRivalsNeutralized: AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS - 1
};
assert.equal(getAutoRecruitMilestoneProgress(beforeMilestone), AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS - 1);
assert.equal(applyCampaignMilestones(beforeMilestone).autoRecruitGranted, false);
const milestone = applyCampaignMilestones({
  ...defaults,
  contacts: 0,
  runRivalsNeutralized: AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS
});
assert.equal(milestone.autoRecruitGranted, true);
assert.equal(milestone.state.upgrades.sindicato_auto_recruit, 1);
assert.equal(milestone.state.autoRecruitFallen, true);
assert.equal(milestone.state.contacts, 0, 'first guaranteed level cannot consume contacts');
assert.equal(applyCampaignMilestones(milestone.state).autoRecruitGranted, false, 'milestone must be idempotent');
const advancedTooEarly = applyCampaignMilestones({
  ...defaults,
  currentTerritoryId: 2,
  runHighestTerritoryReached: 2,
  runRivalsNeutralized: 99,
  stats: { ...defaults.stats, highestTerritoryReached: 6, totalRivalsNeutralized: 999 }
});
assert.equal(advancedTooEarly.autoRecruitGranted, false, 'lifetime history cannot bypass 100 run neutralizations');
const prestigeResetCandidate = {
  ...defaults,
  runRespectEarned: 40,
  respect: 40,
  currentTerritoryId: 4,
  territoryTakes: 77,
  runRivalsNeutralized: 192,
  runHighestTerritoryReached: 4,
  upgrades: { sindicato_auto_recruit: 1 },
  autoRecruitFallen: true,
  stats: { ...defaults.stats, totalRivalsNeutralized: 999, highestTerritoryReached: 6 }
};
const prestigeRunReset = performHegemony(prestigeResetCandidate);
assert.equal(prestigeRunReset.ok, true);
assert.equal(prestigeRunReset.state.runRivalsNeutralized, 0);
assert.equal(prestigeRunReset.state.runHighestTerritoryReached, 1);
assert.equal(prestigeRunReset.state.currentTerritoryId, 1);
assert.equal(prestigeRunReset.state.territoryTakes, 0);
assert.equal(prestigeRunReset.state.upgrades.sindicato_auto_recruit, undefined);
assert.equal(prestigeRunReset.state.autoRecruitFallen, false);
assert.equal(prestigeRunReset.state.stats.totalRivalsNeutralized, 999, 'lifetime kills stay in stats only');
assert.equal(prestigeRunReset.state.stats.highestTerritoryReached, 6, 'lifetime territory record stays in stats only');
assert.equal(applyCampaignMilestones(prestigeRunReset.state).autoRecruitGranted, false, 'prestige must require 100 new run neutralizations');

assert.equal(INITIAL_UPGRADES.some(item => item.id === 'intel_tactical_training'), false);
const removedTrainingRefund = normalizeGameState({
  ...defaults,
  respect: 10,
  upgrades: { intel_tactical_training: 3 }
}, defaults, false);
assert.equal(removedTrainingRefund.respect, 232, 'removed training must refund all spent respect');
assert.equal(removedTrainingRefund.upgrades.intel_tactical_training, undefined);

const veteranTalent = INITIAL_PRESTIGE_TALENTS.find(t => t.id === 'talent_veteran_enforcers')!;
const veteranRows = getHegemonyTalentEffectRows(veteranTalent, 0);
assert.deepEqual(veteranRows, [
  { label: 'Vida dos recrutas', current: '+0%', next: '+25%' },
  { label: 'Dano dos recrutas', current: '+0%', next: '+25%' }
]);
const intelTalent = INITIAL_PRESTIGE_TALENTS.find(t => t.id === 'talent_intel_network')!;
assert.equal(getHegemonyTalentEffectRows(intelTalent, 0).length, 2);
assert.equal(getHegemonyTalentCost(veteranTalent, 0), 3);
assert.equal(getHegemonyTalentCost(veteranTalent, 1), 6);
assert.ok(INITIAL_PRESTIGE_TALENTS.every(talent => getHegemonyTalentEffectRows(talent, 0).length > 0));

const autoAmmoUpgrade = INITIAL_UPGRADES.find(item => item.id === 'boca_auto_ammo_scavenge')!;
assert.equal(autoAmmoUpgrade.baseCost, 60);
assert.equal(autoAmmoUpgrade.costMultiplier, 1.18);
assert.equal(getAutoAmmoIntervalSeconds(1), 5);
assert.equal(getAutoAmmoYield(1), 2);
assert.equal(getAutoAmmoPerMinute(1), 24);
assert.equal(getAutoAmmoIntervalSeconds(15), 2.5);
assert.equal(getAutoAmmoYield(15), 16);
assert.equal(getAutoAmmoPerMinute(15), 384);
assert.equal(getUpgradeEffectRows(autoAmmoUpgrade, 0).length, 3);

const rebalancedAutoAmmoSave = normalizeGameState({
  ...defaults,
  balanceRevision: 0,
  ammo: 10,
  upgrades: { boca_auto_ammo_scavenge: 2 }
}, defaults, false);
assert.equal(rebalancedAutoAmmoSave.balanceRevision, BALANCE_REVISION);
assert.equal(rebalancedAutoAmmoSave.ammo, 156, 'old N2 auto-ammo save must receive 146 ammo once');
assert.equal(normalizeGameState(rebalancedAutoAmmoSave, defaults, false).ammo, 156, 'D5 refund cannot repeat');

const woundedAlly = {
  id: 'ally-d6',
  type: 'soldado_base' as const,
  name: 'Recruta',
  x: 10,
  y: 10,
  vx: 0.6,
  vy: -1.2,
  hp: 22,
  maxHp: 55,
  speed: 1.2,
  damage: 14,
  attackRange: 100,
  attackCooldown: 0.85,
  attackTimer: 0,
  targetId: null,
  color: '#fff',
  radius: 12
};
const upgradedLiveState = {
  ...defaults,
  upgrades: {
    armory_bulletproof_vest: 1,
    armory_heavy_calibers: 1,
    armory_motorcycle_squad: 1
  },
  talents: { talent_veteran_enforcers: 1 }
};
const upgradedLiveStats = getAllyLiveStats(upgradedLiveState, 'soldado_base');
assert.equal(upgradedLiveStats.maxHp, 83.75);
assert.equal(upgradedLiveStats.damage, 21);
assert.equal(upgradedLiveStats.speed, 1.2);
assert.ok(Math.abs(getMotorcycleChance(1) - 0.04) < 1e-9);
assert.ok(Math.abs(getMotorcycleChance(30) - 0.18) < 1e-9);
const rebasedAlly = rebaseAllyStatsForState(woundedAlly, upgradedLiveState);
assert.ok(Math.abs((rebasedAlly.hp / rebasedAlly.maxHp) - 0.4) < 1e-9, 'D6 must preserve current HP percentage');
assert.equal(rebasedAlly.maxHp, upgradedLiveStats.maxHp);
assert.equal(rebasedAlly.damage, upgradedLiveStats.damage);
assert.equal(rebasedAlly.speed, upgradedLiveStats.speed);
assert.ok(Math.abs(rebasedAlly.vx - 0.6) < 1e-9 && Math.abs(rebasedAlly.vy + 1.2) < 1e-9, 'motorcycle chance upgrade must not alter live movement speed');

const snapshotState = {
  ...defaults,
  battleSnapshot: {
    version: 1 as const,
    runId: defaults.runId,
    territoryId: 1,
    faction: 'vermelha' as const,
    capturedAt: 123456,
    allies: [],
    rivals: [],
    fallen: [],
    bullets: [],
    obstacles: [],
    spawnElapsedMs: 725,
    autoRecruitElapsedMs: 350
  }
};
const snapshotRoundTrip = decodeSave(encodeSave(snapshotState), defaults).state;
assert.equal(snapshotRoundTrip.battleSnapshot?.runId, defaults.runId);
assert.equal(snapshotRoundTrip.battleSnapshot?.spawnElapsedMs, 725);
assert.equal(snapshotRoundTrip.battleSnapshot?.autoRecruitElapsedMs, 350);

const viewport = { width: 960, height: 540 };
const defaultCamera = clampCamera(createDefaultCamera(), viewport);
const screenCenter = { x: viewport.width / 2, y: viewport.height / 2 };
const worldAtCenter = screenToWorld(screenCenter, defaultCamera, viewport);
assert.ok(Math.abs(worldAtCenter.x - defaultCamera.centerX) < 1e-9);
assert.ok(Math.abs(worldAtCenter.y - defaultCamera.centerY) < 1e-9);
const projectedCenter = worldToScreen(worldAtCenter, defaultCamera, viewport);
assert.deepEqual(projectedCenter, screenCenter);

const anchorPoint = { x: 240, y: 180 };
const beforeZoom = screenToWorld(anchorPoint, defaultCamera, viewport);
const zoomedCamera = zoomCameraAtScreenPoint(defaultCamera, 1.6, anchorPoint, viewport);
const afterZoom = screenToWorld(anchorPoint, zoomedCamera, viewport);
assert.ok(Math.abs(beforeZoom.x - afterZoom.x) < 1e-9, 'cursor-anchored zoom must preserve world X');
assert.ok(Math.abs(beforeZoom.y - afterZoom.y) < 1e-9, 'cursor-anchored zoom must preserve world Y');

const clampedCamera = clampCamera({ centerX: -999, centerY: 9999, zoom: 1 }, viewport);
assert.ok(clampedCamera.centerX >= viewport.width / 2);
assert.ok(clampedCamera.centerY <= WORLD_HEIGHT - viewport.height / 2);
const pannedCamera = panCameraByScreenDelta(defaultCamera, 20000, 20000, viewport);
assert.ok(pannedCamera.centerX >= 0 && pannedCamera.centerX <= WORLD_WIDTH);
assert.ok(pannedCamera.centerY >= 0 && pannedCamera.centerY <= WORLD_HEIGHT);

console.log('Foundation verification: OK');
console.log('✓ save v1 migrates without duplicate prestige eligibility');
console.log('✓ hostile values are sanitized');
console.log('✓ rolling backup is created');
console.log('✓ invalid import format is rejected');
console.log('✓ manual/auto recruit validation, pause and capacity rules pass');
console.log('✓ prestige preview/payment are transactional and cannot pay twice');
console.log('✓ continuous collision catches fast projectiles crossing narrow targets/cover');
console.log('✓ battle snapshot survives save export/import with simulation timers');
console.log('✓ D1 upgrade caps, previews and legacy refund are consistent');
console.log('✓ D2 territory difficulty/reward multipliers are separated and paid');
console.log('✓ D3 economic feedback matches credited rewards, including cash talent');
console.log('✓ D4 first auto-recruit level is guaranteed by campaign milestone and idempotent');
