import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, RivalEntity, FactionId, RecruitOrigin, RecruitCommandResult } from './types/game';
import { INITIAL_UPGRADES, INITIAL_PRESTIGE_TALENTS, TERRITORIES, FACTION_CONFIGS } from './data/gameData';
import { GameCanvas, GameCanvasHandle } from './components/GameCanvas';
import { ResourceBar } from './components/ResourceBar';
import { SpellBar } from './components/SpellBar';
import { UpgradePanel } from './components/UpgradePanel';
import { ZoneSelector } from './components/ZoneSelector';
import { CampaignVictoryModal } from './components/CampaignVictoryModal';
import { FactionModal } from './components/FactionModal';
import { GddViewer } from './components/GddViewer';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { RadioPlayer } from './components/RadioPlayer';
import { HudEventFeed, type HudEvent, type HudEventKind } from './components/HudEventFeed';
import { soundEngine } from './audio/soundEngine';
import { radioEngine } from './audio/radioEngine';
import { STORAGE_KEY, LEGACY_STORAGE_KEY, BACKUP_STORAGE_KEY, loadGame, persistGame, encodeSave, decodeSave } from './persistence/saveGame';
import { validateRecruitCommand } from './rules/recruitment';
import { computeDerivedStats, getAutoAmmoIntervalSeconds, getAutoAmmoYield, getUpgradeCost } from './rules/upgrades';
import { EconomicReward, getRivalEliminationReward, getScavengeCredit, RivalEliminationReward } from './rules/rewards';
import { getHegemonyReward, performHegemony } from './rules/prestige';
import { getHegemonyTalentCost } from './rules/hegemonyTalents';
import { applyCampaignMilestones, AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS } from './rules/progression';
import { createDefaultState } from './state/defaultGameState';
import { describeBaseCommandPreview, getBaseCommandPreviewProfile, getBaseCommandVisualProfile, type BaseCommandPreviewSelection } from './rules/baseCommandVisualProgression';
import { getSupportPointVisualProfile } from './rules/supportPointVisualProgression';
import { BookOpen, Settings, BarChart2, Shield, FastForward, PanelRightClose, PanelRightOpen, Maximize2, Minimize2, Bell } from 'lucide-react';

type BasePreviewDevApi = {
  set: (selection: BaseCommandPreviewSelection) => void;
  clear: () => void;
};

const FINAL_TERRITORY_ID = TERRITORIES[TERRITORIES.length - 1]?.id ?? 6;

const inferHudEventKind = (message:string):HudEventKind => {
  const text=message.toLowerCase();
  if (text.includes('território') || text.includes('distrito') || text.includes('avançando')) return 'territory';
  if (text.includes('bloquead') || text.includes('insuficiente') || text.includes('falha') || text.includes('recusad')) return 'warning';
  if (text.includes('liberad') || text.includes('conquist') || text.includes('sucesso') || text.includes('recompensa')) return 'reward';
  if (text.includes('convoca') || text.includes('recrut') || text.includes('facção') || text.includes('comando')) return 'command';
  return 'system';
};

export default function App() {
  const initialLoadRef = useRef<ReturnType<typeof loadGame> | null>(null);
  if (initialLoadRef.current === null) {
    initialLoadRef.current = loadGame(createDefaultState());
  }
  const initialLoad = initialLoadRef.current;
  const [gameState, setGameState] = useState<GameState>(initialLoad.state);
  const initialHudMessage = initialLoad.migrated
    ? 'Save antigo migrado com segurança. A contagem elegível do próximo prestígio começou agora.'
    : initialLoad.state.battleSnapshot
      ? 'Batalha retomada do último snapshot salvo.'
      : initialLoad.warning || null;
  const hudEventIdRef = useRef(1);
  const initialHudEventRef = useRef<HudEvent[]>(initialHudMessage ? [{ id:0, message:initialHudMessage, kind:inferHudEventKind(initialHudMessage), createdAt:Date.now() }] : []);
  const [hudEvents, setHudEvents] = useState<HudEvent[]>(initialHudEventRef.current);
  const [hudEventHistory, setHudEventHistory] = useState<HudEvent[]>(initialHudEventRef.current);
  const [isHudHistoryOpen, setIsHudHistoryOpen] = useState(false);
  const setSystemNotice = useCallback((message:string | null) => {
    if (!message) return;
    const now=Date.now();
    const kind=inferHudEventKind(message);
    const id=hudEventIdRef.current++;
    setHudEvents(prev => {
      const last=prev[prev.length-1];
      if(last && last.message===message && now-last.createdAt<2600) {
        return [...prev.slice(0,-1), { ...last, createdAt:now, count:(last.count ?? 1)+1 }].slice(-2);
      }
      return [...prev, { id, message, kind, createdAt:now, count:1 }].slice(-2);
    });
    setHudEventHistory(prev => {
      const first=prev[0];
      if(first && first.message===message && now-first.createdAt<12000) {
        return [{ ...first, createdAt:now, count:(first.count ?? 1)+1 }, ...prev.slice(1)].slice(0,24);
      }
      return [{ id, message, kind, createdAt:now, count:1 }, ...prev].slice(0,24);
    });
  }, []);
  const dismissHudEvent = useCallback((id:number) => setHudEvents(prev => prev.filter(event => event.id !== id)), []);
  const gameCanvasRef = useRef<GameCanvasHandle | null>(null);

  const [currentView, setCurrentView] = useState<'battle' | 'gdd'>('battle');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('recruit_fallen');

  // Modals
  const [isTerritoryModalOpen, setIsTerritoryModalOpen] = useState(false);
  const [isFactionModalOpen, setIsFactionModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isCampaignVictoryOpen, setIsCampaignVictoryOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [basePreviewSelection, setBasePreviewSelection] = useState<BaseCommandPreviewSelection | null>(null);
  const baseStageRef = useRef(getBaseCommandVisualProfile(initialLoad.state).stage);
  const supportStageRef = useRef(getSupportPointVisualProfile(initialLoad.state).stage);
  // 0.4F: battlefield-first layout controls. UI-only; does not affect simulation/save.
  const [isEvolutionPanelOpen, setIsEvolutionPanelOpen] = useState(true);
  const [isUpgradeFocusMode, setIsUpgradeFocusMode] = useState(false);
  const evolutionToggleRef = useRef<HTMLButtonElement>(null);
  const closeEvolutionPanel = () => {
    setIsEvolutionPanelOpen(false);
    evolutionToggleRef.current?.focus();
  };
  const toggleUpgradeFocus = () => {
    setIsUpgradeFocusMode(focused => !focused);
    setIsEvolutionPanelOpen(true);
  };

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  useEffect(() => {
    const nextStage = getBaseCommandVisualProfile(gameState).stage;
    const nextSupportStage = getSupportPointVisualProfile(gameState).stage;
    if (nextStage > baseStageRef.current) {
      setSystemNotice(`Base de Comando evoluiu para o Estágio ${nextStage}.`);
    }
    if (nextSupportStage > supportStageRef.current) {
      setSystemNotice(`Ponto de Apoio evoluiu para o Estágio ${nextSupportStage}.`);
    }
    baseStageRef.current = nextStage;
    supportStageRef.current = nextSupportStage;
  }, [gameState.upgrades, setSystemNotice]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const devWindow = window as typeof window & { __BASE_VISUAL_PREVIEW__?: BasePreviewDevApi };
    devWindow.__BASE_VISUAL_PREVIEW__ = {
      set: selection => setBasePreviewSelection(selection),
      clear: () => setBasePreviewSelection(null)
    };
    return () => { delete devWindow.__BASE_VISUAL_PREVIEW__; };
  }, []);

  const isSimulationModalOpen = isTerritoryModalOpen || isFactionModalOpen || isSettingsModalOpen || isStatsModalOpen || isCampaignVictoryOpen;
  const modalPauseActiveRef = useRef(false);
  const modalResumeSpeedRef = useRef<number>(gameState.gameSpeed);
  const autoAmmoCooldownTimerRef = useRef<number>(0);

  useEffect(() => {
    // On narrower layouts the evolution panel starts as an overlay drawer, closed by default.
    if (window.innerWidth < 1024) setIsEvolutionPanelOpen(false);
  }, []);

  useEffect(() => {
    if (isSimulationModalOpen && !modalPauseActiveRef.current) {
      modalPauseActiveRef.current = true;
      modalResumeSpeedRef.current = gameStateRef.current.gameSpeed;
      if (gameStateRef.current.gameSpeed !== 0) {
        setGameState(prev => ({ ...prev, gameSpeed: 0 }));
      }
      return;
    }

    if (!isSimulationModalOpen && modalPauseActiveRef.current) {
      modalPauseActiveRef.current = false;
      const resumeSpeed = modalResumeSpeedRef.current;
      setGameState(prev => ({ ...prev, gameSpeed: resumeSpeed }));
    }
  }, [isSimulationModalOpen]);

  const handleUpdateSettings = useCallback((newSettings: Partial<GameState>) => {
    if (modalPauseActiveRef.current && typeof newSettings.gameSpeed === 'number') {
      modalResumeSpeedRef.current = newSettings.gameSpeed;
      const { gameSpeed: _deferredSpeed, ...rest } = newSettings;
      setGameState(prev => ({ ...prev, ...rest, gameSpeed: 0 }));
      return;
    }
    setGameState(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Recalcula valores derivados ao carregar/migrar um save; não confia em valores derivados persistidos.
  useEffect(() => {
    setGameState(prev => {
      const derived = computeDerivedStats(prev);
      const next = {
        ...prev,
        ...derived,
        intel: Math.min(prev.intel, derived.maxIntel)
      };
      gameStateRef.current = next;
      return next;
    });
  }, [computeDerivedStats]);

  // D4: primeiro nível de auto-convocação é conquistado por marco garantido da campanha.
  useEffect(() => {
    const milestone = applyCampaignMilestones(gameStateRef.current);
    if (!milestone.autoRecruitGranted) return;
    gameStateRef.current = milestone.state;
    setGameState(milestone.state);
    setSystemNotice(`Marco de campanha alcançado: ${AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS} neutralizações. Auto-Convocação N1 liberada e ativada.`);
    soundEngine.playUpgradeBuy();
  }, [gameState.runRivalsNeutralized, gameState.upgrades['sindicato_auto_recruit']]);

  // C1/D5: economia usa delta real; throttling do navegador não desacelera a simulação.
  useEffect(() => {
    let lastTick = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const realDt = Math.min(1, Math.max(0, (now - lastTick) / 1000));
      lastTick = now;

      setGameState((prev) => {
        if (prev.gameSpeed === 0) return prev; // paused

        const { maxIntel, intelRegen, maxAllies } = computeDerivedStats(prev);
        const dt = realDt * prev.gameSpeed;
        const newIntel = Math.min(maxIntel, prev.intel + intelRegen * dt);

        // boca_auto_ammo_scavenge: Coleta automática de munição com cooldown balanceado
        const autoAmmoLvl = prev.upgrades['boca_auto_ammo_scavenge'] || 0;
        let newAmmo = prev.ammo;
        let ammoAddedThisTick = 0;

        if (autoAmmoLvl > 0 && prev.autoCollectAmmo) {
          const autoAmmoCooldownSec = getAutoAmmoIntervalSeconds(autoAmmoLvl);
          autoAmmoCooldownTimerRef.current += dt;

          if (autoAmmoCooldownSec !== null) {
            const ammoPerCycle = getAutoAmmoYield(autoAmmoLvl);
            while (autoAmmoCooldownTimerRef.current >= autoAmmoCooldownSec) {
              autoAmmoCooldownTimerRef.current -= autoAmmoCooldownSec;
              ammoAddedThisTick += ammoPerCycle;
            }
            newAmmo += ammoAddedThisTick;
          }
        } else {
          autoAmmoCooldownTimerRef.current = 0;
        }

        return {
          ...prev,
          intel: newIntel,
          ammo: newAmmo,
          maxIntel,
          intelRegen,
          maxAllies,
          stats: {
            ...prev.stats,
            totalAmmoSeized: prev.stats.totalAmmoSeized + ammoAddedThisTick,
            timePlayedSeconds: prev.stats.timePlayedSeconds + dt
          }
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [computeDerivedStats]);

  useEffect(() => {
    soundEngine.setVolume(gameState.soundVolume);
    soundEngine.setMuted(gameState.soundMuted);
    radioEngine.setSystemMuted(gameState.soundMuted);
  }, [gameState.soundVolume, gameState.soundMuted]);
  // Periodic Auto-Save every 5 seconds, with rolling backup
  useEffect(() => {
    const saveTimer = setInterval(() => {
      try {
        const battleSnapshot = gameCanvasRef.current?.getBattleSnapshot();
        const persisted = persistGame({
          ...gameStateRef.current,
          battleSnapshot: battleSnapshot ?? gameStateRef.current.battleSnapshot
        });
        gameStateRef.current = persisted;
        setSaveNotice(true);
        setTimeout(() => setSaveNotice(false), 1200);
      } catch {
        setSystemNotice('Falha ao salvar o progresso local. O estado atual não foi apagado.');
      }
    }, 5000);

    return () => clearInterval(saveTimer);
  }, []);

  // A3/B1: comando único e transacional de convocação
  const handleSpawnRecruit = useCallback((
    origin: RecruitOrigin = 'button',
    position?: { x: number; y: number }
  ): RecruitCommandResult => {
    const state = gameStateRef.current;
    const canvas = gameCanvasRef.current;
    const validation = validateRecruitCommand(state, origin, {
      battleAvailable: Boolean(canvas),
      activeAllies: canvas?.getAllyCount() ?? 0
    });

    if (!validation.ok) {
      if (origin !== 'auto') {
        const message = validation.reason === 'paused'
          ? 'Convocação bloqueada: o combate está pausado.'
          : validation.reason === 'capacity'
            ? 'Convocação bloqueada: limite de tropas atingido.'
            : validation.reason === 'insufficient_intel'
              ? 'Convocação bloqueada: Inteligência insuficiente.'
              : 'Convocação bloqueada: campo de batalha indisponível.';
        setSystemNotice(message);
      }
      return { ok: false, reason: validation.reason };
    }

    const reservedState: GameState = {
      ...state,
      intel: state.intel - validation.intelCost
    };
    gameStateRef.current = reservedState;

    const deployment = canvas!.deployRecruit(origin, position);
    if (deployment.created <= 0) {
      gameStateRef.current = state;
      if (origin !== 'auto') setSystemNotice('Convocação recusada: nenhuma vaga disponível.');
      return { ok: false, reason: 'capacity' };
    }

    const committedState: GameState = {
      ...reservedState,
      stats: {
        ...reservedState.stats,
        totalAlliesRecruited: reservedState.stats.totalAlliesRecruited + deployment.created
      }
    };
    gameStateRef.current = committedState;
    setGameState(committedState);

    if (deployment.capacityReached && origin !== 'auto') {
      setSystemNotice('Primeiro reforço convocado; capacidade atingida antes do reforço extra.');
    } else if (origin !== 'auto') {
      setSystemNotice(null);
    }

    return {
      ok: true,
      created: deployment.created,
      capacityReached: deployment.capacityReached
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isTyping = target instanceof HTMLElement && Boolean(
        target.closest('input, textarea, select, [contenteditable="true"]')
      );
      if (isTyping) return;
      if (currentView !== 'battle' || isTerritoryModalOpen || isFactionModalOpen || isSettingsModalOpen || isStatsModalOpen) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleSpawnRecruit('keyboard');
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setGameState(prev => ({
          ...prev,
          gameSpeed: prev.gameSpeed === 0 ? 1 : 0
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSpawnRecruit, currentView, isTerritoryModalOpen, isFactionModalOpen, isSettingsModalOpen, isStatsModalOpen]);

  // Action: Direct Command on Canvas
  const handleDirectCommand = useCallback((orderId: string, _targetX: number, _targetY: number, _targetEntityId?: string): boolean => {
    const state = gameStateRef.current;

    let intelCost = 0;
    let ammoCost = 0;

    switch (orderId) {
      case 'sniper_shot':
        intelCost = 15;
        break;
      case 'tear_gas':
        intelCost = 35;
        break;
      case 'car_bomb':
        intelCost = 25;
        break;
      case 'rpg_rocket':
        intelCost = 30;
        ammoCost = 5;
        break;
      case 'drive_by':
        intelCost = 50;
        break;
    }

    if (state.intel < intelCost || state.ammo < ammoCost) {
      return false;
    }

    setGameState(prev => ({
      ...prev,
      intel: prev.intel - intelCost,
      ammo: prev.ammo - ammoCost
    }));
    return true;
  }, []);

  // D2: recompensa única por território e tipo de rival
  const handleRivalEliminated = useCallback((rival: RivalEntity): RivalEliminationReward => {
    const prev = gameStateRef.current;
    const territory = TERRITORIES.find(t => t.id === prev.currentTerritoryId) || TERRITORIES[0];
    const reward = getRivalEliminationReward(rival.type, territory, prev.talents['talent_cartel_cash'] || 0);
    const newTakes = prev.territoryTakes + 1;
    // 0.5: reaching the neutralization threshold no longer unlocks a territory by itself.
    // The district operation must also be dominated; highest territory advances only on actual transition.
    const newRunHighestTerritory = prev.runHighestTerritoryReached || prev.currentTerritoryId;
    const newHistoricalHighestTerritory = prev.stats.highestTerritoryReached;
    const nextState: GameState = {
      ...prev,
      cash: prev.cash + reward.cash,
      ammo: prev.ammo + reward.ammo,
      respect: prev.respect + reward.respect,
      runRespectEarned: (prev.runRespectEarned || 0) + reward.respect,
      contacts: prev.contacts + reward.contacts,
      territoryTakes: newTakes,
      runRivalsNeutralized: (prev.runRivalsNeutralized || 0) + 1,
      runHighestTerritoryReached: newRunHighestTerritory,
      stats: {
        ...prev.stats,
        totalRivalsNeutralized: prev.stats.totalRivalsNeutralized + 1,
        totalCashEarned: prev.stats.totalCashEarned + reward.cash,
        totalAmmoSeized: prev.stats.totalAmmoSeized + reward.ammo,
        totalRespectEarned: prev.stats.totalRespectEarned + reward.respect,
        totalContactsAcquired: prev.stats.totalContactsAcquired + reward.contacts,
        highestTerritoryReached: newHistoricalHighestTerritory
      }
    };
    const milestone = applyCampaignMilestones(nextState);
    const committedState = milestone.state;
    gameStateRef.current = committedState;
    setGameState(committedState);
    if (milestone.autoRecruitGranted) {
      setSystemNotice(`Marco de campanha alcançado: ${AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS} neutralizações. Auto-Convocação N1 liberada e ativada.`);
      soundEngine.playUpgradeBuy();
    }
    return reward;
  }, []);

  // D3/B3: crédito e feedback usam o mesmo evento econômico transacional.
  const handleScavengeDrop = useCallback((cash: number, ammo: number, _isAutoSoldier = false): EconomicReward => {
    const prev = gameStateRef.current;
    const reward = getScavengeCredit(cash, ammo, prev.talents['talent_cartel_cash'] || 0);
    const nextState: GameState = {
      ...prev,
      cash: prev.cash + reward.cash,
      ammo: prev.ammo + reward.ammo,
      stats: {
        ...prev.stats,
        totalCashEarned: prev.stats.totalCashEarned + reward.cash,
        totalAmmoSeized: prev.stats.totalAmmoSeized + reward.ammo
      }
    };
    gameStateRef.current = nextState;
    setGameState(nextState);
    if (reward.cash > 0 || reward.ammo > 0) soundEngine.playCashAmmoCollect();
    return reward;
  }, []);

  // 0.9.11: avanço exige pressão suficiente e domínio físico confirmado pela simulação.
  const handleAdvanceTerritory = useCallback(() => {
    const prev = gameStateRef.current;
    const current = TERRITORIES.find(t => t.id === prev.currentTerritoryId) || TERRITORIES[0];
    const next = TERRITORIES.find(t => t.id === prev.currentTerritoryId + 1);
    if (!next) return;
    if (prev.territoryTakes < current.requiredNeutralizations) {
      setSystemNotice(`Avanço bloqueado: ${prev.territoryTakes}/${current.requiredNeutralizations} neutralizações no território atual.`);
      return;
    }
    const operation = gameCanvasRef.current?.getDistrictOperationStatus();
    if (operation?.enabled && operation.phase !== 'dominated') {
      setSystemNotice('Avanço bloqueado: conclua a tomada física das posições e a resistência final.');
      return;
    }

    const advanced: GameState = {
      ...prev,
      currentTerritoryId: next.id,
      territoryTakes: 0,
      runHighestTerritoryReached: Math.max(prev.runHighestTerritoryReached || prev.currentTerritoryId, next.id),
      battleSnapshot: undefined,
      stats: {
        ...prev.stats,
        highestTerritoryReached: Math.max(prev.stats.highestTerritoryReached, next.id)
      }
    };
    gameStateRef.current = advanced;
    setGameState(advanced);
    setSystemNotice(`Território conquistado. Avançando para ${next.name}.`);
    soundEngine.playUpgradeBuy();
  }, []);

  const handleTerritoryDominated = useCallback((territoryId: number) => {
    if (territoryId !== FINAL_TERRITORY_ID) return;
    setIsCampaignVictoryOpen(true);
    setSystemNotice('Domínio total alcançado: campanha T1–T6 concluída.');
  }, [setSystemNotice]);

  const handleAllyDown = useCallback((allyId: string) => {}, []);

  // Action: Buy Upgrade
  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    const item = INITIAL_UPGRADES.find(u => u.id === upgradeId);
    if (!item) return;

    setGameState(prev => {
      const currentLevel = prev.upgrades[upgradeId] || 0;
      if (currentLevel >= item.maxLevel) return prev;
      if (upgradeId === 'sindicato_auto_recruit' && currentLevel === 0) return prev;

      const cost = getUpgradeCost(item, currentLevel);

      let canAfford = false;
      let newCash = prev.cash;
      let newAmmo = prev.ammo;
      let newRespect = prev.respect;
      let newContacts = prev.contacts;

      switch (item.currency) {
        case 'grana':
          if (newCash >= cost) { newCash -= cost; canAfford = true; }
          break;
        case 'municao':
          if (newAmmo >= cost) { newAmmo -= cost; canAfford = true; }
          break;
        case 'respeito':
          if (newRespect >= cost) { newRespect -= cost; canAfford = true; }
          break;
        case 'contatos':
          if (newContacts >= cost) { newContacts -= cost; canAfford = true; }
          break;
      }

      if (!canAfford) return prev;

      soundEngine.playUpgradeBuy();
      const updatedUpgrades = {
        ...prev.upgrades,
        [upgradeId]: currentLevel + 1
      };

      const { maxIntel, intelRegen, maxAllies } = computeDerivedStats({
        ...prev,
        upgrades: updatedUpgrades
      });

      return {
        ...prev,
        cash: newCash,
        ammo: newAmmo,
        respect: newRespect,
        contacts: newContacts,
        upgrades: updatedUpgrades,
        maxIntel,
        intelRegen,
        maxAllies
      };
    });
  }, [computeDerivedStats]);

  // Action: Buy Prestige Talent
  const handleBuyTalent = useCallback((talentId: string) => {
    const talent = INITIAL_PRESTIGE_TALENTS.find(t => t.id === talentId);
    if (!talent) return;

    setGameState(prev => {
      const currentLevel = prev.talents[talentId] || 0;
      if (currentLevel >= talent.maxLevel) return prev;

      const cost = getHegemonyTalentCost(talent, currentLevel);
      if (prev.hegemonyEmblems < cost) return prev;

      soundEngine.playUpgradeBuy();
      const updatedTalents = {
        ...prev.talents,
        [talentId]: currentLevel + 1
      };

      return {
        ...prev,
        hegemonyEmblems: prev.hegemonyEmblems - cost,
        talents: updatedTalents
      };
    });
  }, []);

  // B2: prestígio transacional baseado apenas no progresso elegível da rodada
  const handlePerformHegemony = useCallback(() => {
    const result = performHegemony(gameStateRef.current);
    if (!result.ok) {
      setSystemNotice('Hegemonia recusada: conquiste Respeito elegível nesta rodada antes de prestigiar.');
      return;
    }

    gameStateRef.current = result.state;
    setGameState(result.state);
    setBasePreviewSelection(null);
    setIsCampaignVictoryOpen(false);
    setResetKey(k => k + 1);
    autoAmmoCooldownTimerRef.current = 0;
    setSystemNotice(`Hegemonia proclamada: +${result.reward} Emblema(s). A nova rodada começou.`);
    soundEngine.playPrestige();
  }, []);

  // Save Export / Import com validação, migração e backup transacional
  const handleExportSave = useCallback((): string => {
    const battleSnapshot = gameCanvasRef.current?.getBattleSnapshot();
    return encodeSave({ ...gameStateRef.current, battleSnapshot: battleSnapshot ?? gameStateRef.current.battleSnapshot });
  }, []);

  const handleImportSave = useCallback((data: string): boolean => {
    try {
      const decoded = decodeSave(data, createDefaultState());
      const derived = computeDerivedStats(decoded.state);
      const imported: GameState = {
        ...decoded.state,
        ...derived,
        intel: Math.min(decoded.state.intel, derived.maxIntel)
      };
      const persisted = persistGame(imported);
      gameStateRef.current = persisted;
      setGameState(persisted);
      setBasePreviewSelection(null);
      setResetKey(k => k + 1);
      setSystemNotice(decoded.warning || (decoded.migrated
        ? 'Save legado importado e migrado. A elegibilidade do próximo prestígio começou nesta migração.'
        : 'Save importado e validado com sucesso.'));
      return true;
    } catch {
      setSystemNotice('Importação recusada: o código não representa um save válido. Seu progresso atual foi preservado.');
      return false;
    }
  }, [computeDerivedStats]);

  const handleHardReset = useCallback(() => {
    const freshState = createDefaultState();
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(BACKUP_STORAGE_KEY);
      const persisted = persistGame(freshState);
      gameStateRef.current = persisted;
      setGameState(persisted);
    } catch (e) {
      console.error('Falha ao limpar armazenamento local:', e);
      gameStateRef.current = freshState;
      setGameState(freshState);
    }
    autoAmmoCooldownTimerRef.current = 0;
    setBasePreviewSelection(null);
    setResetKey(k => k + 1);
    setSystemNotice('Novo império iniciado com um save limpo.');
    soundEngine.playUpgradeBuy();
  }, []);

  const handleDevAddResources = useCallback((res: { cash?: number; ammo?: number; respect?: number; contacts?: number; emblems?: number; intel?: number }) => {
    setGameState(prev => ({
      ...prev,
      cash: prev.cash + (res.cash || 0),
      ammo: prev.ammo + (res.ammo || 0),
      respect: prev.respect + (res.respect || 0),
      contacts: prev.contacts + (res.contacts || 0),
      hegemonyEmblems: prev.hegemonyEmblems + (res.emblems || 0),
      intel: res.intel ? prev.maxIntel : prev.intel
    }));
  }, []);

  const handleSelectFaction = useCallback((factionId: FactionId) => {
    if (gameStateRef.current.playerFaction !== factionId) {
      setGameState(prev => ({ ...prev, playerFaction: factionId, battleSnapshot: undefined }));
      setSystemNotice('Facção alterada: o confronto atual foi reiniciado; recursos, talentos e recordes foram preservados.');
    }
    setIsFactionModalOpen(false);
  }, []);

  const activeFaction = FACTION_CONFIGS[gameState.playerFaction] || FACTION_CONFIGS.vermelha;
  const baseVisualPreview = import.meta.env.DEV && basePreviewSelection
    ? getBaseCommandPreviewProfile(basePreviewSelection)
    : null;

  return (
    <div className="w-screen h-screen bg-[#07080d] text-slate-200 flex flex-col overflow-hidden select-none">
      {/* ==================================================== */}
      {/* TOP HEADER: BRAND, NAVIGATION, PRIMARY ACTIONS */}
      {/* ==================================================== */}
      <header className="h-14 bg-[#0a0c14] border-b border-slate-800 px-2 sm:px-3 lg:px-6 flex items-center justify-between gap-2 shrink-0 shadow-lg z-20 overflow-visible">
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 shrink-0">
          <span className="font-cinzel text-base lg:text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-300 to-sky-400 whitespace-nowrap">
            <span aria-hidden="true" className="hidden xl:inline">Guerra de Facções PT-BR</span>
            <span aria-hidden="true" className="hidden md:inline xl:hidden">Guerra de Facções</span>
            <span aria-hidden="true" className="md:hidden">GDF</span>
            <span className="sr-only">Guerra de Facções PT-BR</span>
          </span>
          <button 
            onClick={() => setIsFactionModalOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            style={{ 
              borderColor: `${activeFaction.color}aa`,
              backgroundColor: `${activeFaction.color}25`,
              color: activeFaction.color 
            }}
            title={`Facção Atual: ${activeFaction.name} (${activeFaction.tag}). Clique para trocar de facção.`}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeFaction.color }} />
            <span>{activeFaction.tag}</span>
            <span className="hidden lg:inline text-[9px] text-slate-400 lowercase font-normal ml-0.5">(trocar)</span>
          </button>
          {saveNotice && (
            <span className="text-[10px] text-emerald-400 font-mono">
              · Salvo
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 lg:gap-3 text-xs shrink-0">
          <button
            onClick={() => setCurrentView('battle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              currentView === 'battle'
                ? activeFaction.tag === 'PCC'
                  ? 'bg-sky-950/70 text-sky-200 border border-sky-700/60 shadow-sm'
                  : 'bg-rose-950/70 text-rose-200 border border-rose-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield 
              className="w-4 h-4" 
              style={{ color: currentView === 'battle' ? activeFaction.color : undefined }} 
            />
            <span className="sr-only min-[1800px]:not-sr-only">Disputa do Morro</span>
          </button>

          <button
            onClick={() => setCurrentView('gdd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              currentView === 'gdd'
                ? activeFaction.tag === 'PCC'
                  ? 'bg-sky-950/70 text-sky-200 border border-sky-700/60'
                  : 'bg-rose-950/70 text-rose-200 border border-rose-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen 
              className="w-4 h-4" 
              style={{ color: currentView === 'gdd' ? activeFaction.color : undefined }} 
            />
            <span className="sr-only min-[1800px]:not-sr-only">Documento GDD</span>
          </button>

          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="sr-only min-[1800px]:not-sr-only">Prontuário</span>
          </button>
          <button onClick={() => setIsHudHistoryOpen(open => !open)} className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${isHudHistoryOpen ? 'bg-amber-950/50 text-amber-200 border border-amber-700/40' : 'text-slate-400 hover:text-slate-200'}`} title="Ocorrências recentes" aria-label="Abrir ocorrências recentes">
            <Bell className="w-4 h-4" />
            {hudEventHistory.length > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-3.5 h-3.5 px-0.5 rounded-full bg-amber-500 text-[8px] leading-[14px] font-black text-slate-950 text-center">{Math.min(hudEventHistory.length, 9)}{hudEventHistory.length > 9 ? '+' : ''}</span>}
          </button>
        </nav>

        <div className="hidden lg:block shrink-0">
          <RadioPlayer />
        </div>

        {/* Speed & Settings Actions */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setGameState(p => ({ ...p, gameSpeed: p.gameSpeed === 0 ? 1 : 0 }))}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                gameState.gameSpeed === 0 ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Pausar Combate"
            >
              ⏸
            </button>
            <button
              onClick={() => setGameState(p => ({ ...p, gameSpeed: 1 }))}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                gameState.gameSpeed === 1 ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setGameState(p => ({ ...p, gameSpeed: 2 }))}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                gameState.gameSpeed === 2 ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => setGameState(p => ({ ...p, gameSpeed: 5 }))}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
                gameState.gameSpeed === 5 ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FastForward className="w-3 h-3" />
              <span>5x</span>
            </button>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Configurações e Salvamento"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-[linear-gradient(90deg,rgba(22,163,74,.65)_0_34%,rgba(234,179,8,.58)_34%_67%,rgba(37,99,235,.58)_67%_100%)] opacity-65" />
      </header>

      {/* Main View Area — ambas as sessões permanecem montadas */}
      <div className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 flex flex-col overflow-hidden ${currentView === 'battle' ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>

          {/* Resource HUD Bar */}
          <ResourceBar
              gameState={gameState}
              onOpenTerritoryModal={() => setIsTerritoryModalOpen(true)}
              onOpenFactionModal={() => setIsFactionModalOpen(true)}
            />

          {/* 0.4F Battlefield-first layout: canvas owns the space; evolution becomes a drawer. */}
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 flex overflow-hidden p-2 sm:p-3">
              <div className="battlefield-shell flex-1 min-w-0 min-h-0 relative overflow-hidden">
                <HudEventFeed events={hudEvents} history={hudEventHistory} historyOpen={isHudHistoryOpen} onDismiss={dismissHudEvent} onCloseHistory={() => setIsHudHistoryOpen(false)} />
                <GameCanvas
                  ref={gameCanvasRef}
                  key={`canvas_${resetKey}_${gameState.currentTerritoryId}_${gameState.playerFaction}`}
                  gameState={gameState}
                  baseVisualPreview={baseVisualPreview}
                  selectedOrderId={selectedOrderId}
                  onSpawnRecruit={handleSpawnRecruit}
                  onDirectCommand={handleDirectCommand}
                  onRivalEliminated={handleRivalEliminated}
                  onScavengeDrop={handleScavengeDrop}
                  onAdvanceTerritory={handleAdvanceTerritory}
                  onTerritoryDominated={handleTerritoryDominated}
                  onAllyDown={handleAllyDown}
                />
                {import.meta.env.DEV && basePreviewSelection && (
                  <div className="pointer-events-auto absolute left-3 top-14 z-30 flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-slate-950/92 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-200 shadow-xl">
                    <span>DEV · Visual: {describeBaseCommandPreview(basePreviewSelection)}</span>
                    <button onClick={() => setBasePreviewSelection(null)} className="rounded border border-emerald-700 px-1.5 py-0.5 text-emerald-300">REAL</button>
                  </div>
                )}

                <div className="battle-layout-controls absolute top-14 right-3 z-30 flex items-center gap-2 pointer-events-auto">
                  <button
                      ref={evolutionToggleRef}
                      aria-label="Evolução"
                      aria-controls="evolution-panel"
                      aria-expanded={isEvolutionPanelOpen}
                      onClick={() => setIsEvolutionPanelOpen(open => !open)}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 text-slate-200 shadow-lg backdrop-blur-sm transition-colors cursor-pointer"
                      title={isEvolutionPanelOpen ? 'Recolher painel de evolução' : 'Abrir painel de evolução'}
                    >
                      {isEvolutionPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                      <span className="hidden min-[1900px]:inline text-xs font-semibold">Evolução</span>
                    </button>
                  <button
                    onClick={toggleUpgradeFocus}
                    aria-label="Foco dos upgrades"
                    aria-pressed={isUpgradeFocusMode}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 text-slate-200 shadow-lg backdrop-blur-sm transition-colors cursor-pointer"
                    title={isUpgradeFocusMode ? 'Sair do foco dos upgrades' : 'Foco dos upgrades: mostrar somente ícones nas abas'}
                  >
                    {isUpgradeFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    <span className="hidden min-[1900px]:inline text-xs font-semibold">{isUpgradeFocusMode ? 'Foco ativo' : 'Foco'}</span>
                  </button>
                </div>
              </div>

              <div id="evolution-panel"
                role="region"
                aria-label="Painel de evolução"
                aria-hidden={!isEvolutionPanelOpen}
                inert={!isEvolutionPanelOpen}
                onKeyDown={event => {
                  if (event.key === 'Escape') {
                    event.stopPropagation();
                    closeEvolutionPanel();
                  }
                }}
                className={`
                flex flex-col min-h-0 absolute lg:relative inset-y-0 right-0 z-40 lg:z-20
                w-[min(92vw,380px)]
                bg-[#0d0f17] shadow-2xl lg:shadow-none overflow-hidden
                transition-all duration-300 ease-out
                ${isEvolutionPanelOpen
                  ? 'translate-x-0 opacity-100 lg:w-[380px] lg:min-w-[380px]'
                  : 'translate-x-full opacity-0 pointer-events-none lg:translate-x-0 lg:w-0 lg:min-w-0'}
              `}>
                <div className="lg:hidden shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">Evolução</span>
                  <div className="flex items-center gap-2">
                    <button onClick={toggleUpgradeFocus} aria-label="Foco dos upgrades" aria-pressed={isUpgradeFocusMode}
                      className="min-h-11 px-3 rounded-lg border border-slate-700 text-xs text-slate-200">
                      {isUpgradeFocusMode ? 'Foco ativo' : 'Foco'}
                    </button>
                    <button onClick={closeEvolutionPanel}
                      className="p-3 rounded-lg bg-slate-950/95 border border-slate-700 text-slate-300"
                      title="Fechar painel de evolução" aria-label="Fechar painel de evolução">
                      <PanelRightClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <UpgradePanel
                  gameState={gameState}
                  onBuyUpgrade={handleBuyUpgrade}
                  onBuyTalent={handleBuyTalent}
                  onPerformHegemony={handlePerformHegemony}
                  compactTabs={isUpgradeFocusMode}
                />
              </div>

              {isEvolutionPanelOpen && (
                <button
                  aria-label="Fechar painel de evolução"
                  onClick={closeEvolutionPanel}
                  className="absolute inset-0 z-30 bg-black/35 lg:hidden cursor-default"
                />
              )}
            </div>
          </div>

          {/* Bottom Tactical Troop Operations Bar */}
          <SpellBar
            gameState={gameState}
            onTriggerRecruit={() => handleSpawnRecruit('button')}
            onToggleAutoRecruit={() => setGameState(p => ({ ...p, autoRecruitFallen: !p.autoRecruitFallen }))}
            onToggleAutoAmmo={() => setGameState(p => ({ ...p, autoCollectAmmo: !p.autoCollectAmmo }))}
          />
        </div>

        <div className={`absolute inset-0 overflow-hidden ${currentView === 'gdd' ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
          <GddViewer onClose={() => setCurrentView('battle')} />
        </div>
      </div>

      {/* Modals */}
      {isTerritoryModalOpen && (
        <ZoneSelector
          currentTerritoryId={gameState.currentTerritoryId}
          highestTerritoryReached={gameState.runHighestTerritoryReached || gameState.currentTerritoryId}
          territoryTakes={gameState.territoryTakes}
          onSelectTerritory={(territoryId) => setGameState(p => ({ ...p, currentTerritoryId: territoryId, territoryTakes: 0, battleSnapshot: undefined }))}
          onClose={() => setIsTerritoryModalOpen(false)}
        />
      )}

      {isFactionModalOpen && (
        <FactionModal
          currentFaction={gameState.playerFaction}
          onSelectFaction={handleSelectFaction}
          onClose={() => setIsFactionModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          gameState={gameState}
          onUpdateSettings={handleUpdateSettings}
          onSaveGame={() => {
            try {
              const battleSnapshot = gameCanvasRef.current?.getBattleSnapshot();
              const persisted = persistGame({
                ...gameStateRef.current,
                battleSnapshot: battleSnapshot ?? gameStateRef.current.battleSnapshot
              });
              gameStateRef.current = persisted;
              setSaveNotice(true);
              setTimeout(() => setSaveNotice(false), 1500);
            } catch {
              setSystemNotice('Falha ao salvar agora. O progresso em memória continua intacto.');
            }
          }}
          onExportSave={handleExportSave}
          onImportSave={handleImportSave}
          onHardReset={handleHardReset}
          onDevAddResources={handleDevAddResources}
          basePreviewSelection={basePreviewSelection}
          onDevBasePreviewChange={setBasePreviewSelection}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {isCampaignVictoryOpen && (
        <CampaignVictoryModal
          gameState={gameState}
          territoryName={TERRITORIES.find(t => t.id === gameState.currentTerritoryId)?.name ?? 'Território Final'}
          factionName={FACTION_CONFIGS[gameState.playerFaction]?.name ?? 'Sua facção'}
          factionColor={FACTION_CONFIGS[gameState.playerFaction]?.color ?? '#e11d48'}
          hegemonyReward={getHegemonyReward(gameState)}
          onContinue={() => setIsCampaignVictoryOpen(false)}
          onOpenEvolution={() => {
            setIsCampaignVictoryOpen(false);
            setCurrentView('battle');
            setIsEvolutionPanelOpen(true);
          }}
        />
      )}

      {isStatsModalOpen && (
        <StatsModal
          stats={gameState.stats}
          onClose={() => setIsStatsModalOpen(false)}
        />
      )}
    </div>
  );
}
