import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, RivalEntity, FactionId } from './types/game';
import { INITIAL_UPGRADES, INITIAL_PRESTIGE_TALENTS, TERRITORIES, FACTION_CONFIGS } from './data/gameData';
import { GameCanvas } from './components/GameCanvas';
import { ResourceBar } from './components/ResourceBar';
import { SpellBar } from './components/SpellBar';
import { UpgradePanel } from './components/UpgradePanel';
import { ZoneSelector } from './components/ZoneSelector';
import { FactionModal } from './components/FactionModal';
import { GddViewer } from './components/GddViewer';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { soundEngine } from './audio/soundEngine';
import { BookOpen, Settings, BarChart2, Shield, FastForward } from 'lucide-react';

const STORAGE_KEY = 'factions_war_pt_br_save_v1';

const createDefaultState = (): GameState => ({
  playerFaction: 'vermelha',
  intel: 60,
  maxIntel: 100,
  intelRegen: 2.0,
  cash: 50,
  ammo: 10,
  respect: 0,
  runRespectEarned: 0,
  contacts: 0,
  hegemonyEmblems: 0,
  currentTerritoryId: 1,
  territoryTakes: 0,
  maxAllies: 15,
  upgrades: {},
  talents: {},
  autoRecruitFallen: false,
  autoSniperFire: false,
  autoCollectAmmo: true,
  gameSpeed: 1,
  soundVolume: 0.3,
  soundMuted: false,
  showDamageNumbers: true,
  showCombatSplatters: true,
  stats: {
    totalRivalsNeutralized: 0,
    totalAlliesRecruited: 0,
    totalCashEarned: 0,
    totalAmmoSeized: 0,
    totalRespectEarned: 0,
    totalContactsAcquired: 0,
    highestTerritoryReached: 1,
    hegemonyRituals: 0,
    timePlayedSeconds: 0
  },
  lastSaveTimestamp: Date.now()
});

const DEFAULT_STATE: GameState = createDefaultState();

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) }
        };
      }
    } catch {
      // fallback
    }
    return DEFAULT_STATE;
  });

  const [currentView, setCurrentView] = useState<'battle' | 'gdd'>('battle');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('recruit_fallen');

  // Modals
  const [isTerritoryModalOpen, setIsTerritoryModalOpen] = useState(false);
  const [isFactionModalOpen, setIsFactionModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const autoAmmoCooldownTimerRef = useRef<number>(0);
  const lastScavengeTimestampRef = useRef<number>(0);

  // Compute derived stats from upgrades and talents
  const computeDerivedStats = useCallback((state: GameState): {
    maxIntel: number;
    intelRegen: number;
    maxAllies: number;
  } => {
    const centralCommandLvl = state.upgrades['intel_central_command'] || 0;
    const radioNetworkLvl = state.upgrades['intel_radio_network'] || 0;
    const bunkerLvl = state.upgrades['boca_fortified_bunkers'] || 0;
    const primordialIntel = state.talents['talent_intel_network'] || 0;

    const maxIntel = 100 + centralCommandLvl * 20 + primordialIntel * 25;
    const intelRegen = (2.0 + radioNetworkLvl * 0.8) * (1 + primordialIntel * 0.3);
    const maxAllies = 15 + bunkerLvl * 3;

    return { maxIntel, intelRegen, maxAllies };
  }, []);

  // Intel & Auto-Scavenge ticker loop (100ms) with balanced Cooldown
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.gameSpeed === 0) return prev; // paused

        const { maxIntel, intelRegen, maxAllies } = computeDerivedStats(prev);
        const dt = 0.1 * prev.gameSpeed;
        const newIntel = Math.min(maxIntel, prev.intel + intelRegen * dt);

        // boca_auto_ammo_scavenge: Coleta automática de munição com cooldown balanceado
        const autoAmmoLvl = prev.upgrades['boca_auto_ammo_scavenge'] || 0;
        let newAmmo = prev.ammo;
        let ammoAddedThisTick = 0;

        if (autoAmmoLvl > 0 && prev.autoCollectAmmo) {
          // Cooldown de 7.5s reduzido em 0.3s por nível (mínimo de 3.5s entre coletas automáticas)
          const autoAmmoCooldownSec = Math.max(3.5, 7.5 - (autoAmmoLvl - 1) * 0.3);
          autoAmmoCooldownTimerRef.current += dt;

          if (autoAmmoCooldownTimerRef.current >= autoAmmoCooldownSec) {
            autoAmmoCooldownTimerRef.current = 0;
            ammoAddedThisTick = 1; // +1 munição balanceada por ciclo
            newAmmo += ammoAddedThisTick;
          }
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

  // Periodic Auto-Save every 5 seconds
  useEffect(() => {
    const saveTimer = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameStateRef.current));
        setSaveNotice(true);
        setTimeout(() => setSaveNotice(false), 1200);
      } catch {}
    }, 5000);

    return () => clearInterval(saveTimer);
  }, []);

  // Action: Spawn a Recruit directly with 10 Intel (like Incremancer without needing a corpse)
  const handleSpawnRecruit = useCallback((): boolean => {
    const state = gameStateRef.current;
    const actualCost = 10;

    if (state.intel < actualCost) {
      soundEngine.playGunfireHit();
      return false;
    }

    setGameState(prev => ({
      ...prev,
      intel: prev.intel - actualCost,
      stats: {
        ...prev.stats,
        totalAlliesRecruited: prev.stats.totalAlliesRecruited + 1
      }
    }));
    return true;
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleSpawnRecruit();
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
  }, [handleSpawnRecruit]);

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

  // Action: Rival Eliminated
  const handleRivalEliminated = useCallback((rival: RivalEntity) => {
    setGameState(prev => {
      const cashTalent = prev.talents['talent_cartel_cash'] || 0;
      const cashMult = 1 + cashTalent * 0.5;

      let cashGain = (rival.type === 'olheiro' ? 15 : rival.type === 'soldado_pistola' ? 30 : 50) * cashMult;
      let ammoGain = rival.type === 'olheiro' ? 1 : 2;
      let respectGain = 1;
      let contactGain = 0;

      if (rival.type === 'gerente_boca' || rival.type === 'chefe_morro') {
        contactGain = rival.type === 'chefe_morro' ? 3 : 1;
        respectGain = 3;
      }

      const newTakes = prev.territoryTakes + 1;
      const nextTerritory = TERRITORIES.find(t => t.id === prev.currentTerritoryId + 1);
      let newHighestTerritory = prev.stats.highestTerritoryReached;

      if (nextTerritory && newTakes >= nextTerritory.requiredTakes && prev.currentTerritoryId === prev.stats.highestTerritoryReached) {
        newHighestTerritory = Math.max(newHighestTerritory, nextTerritory.id);
      }

      return {
        ...prev,
        cash: prev.cash + cashGain,
        ammo: prev.ammo + ammoGain,
        respect: prev.respect + respectGain,
        runRespectEarned: (prev.runRespectEarned || 0) + respectGain,
        contacts: prev.contacts + contactGain,
        territoryTakes: newTakes,
        stats: {
          ...prev.stats,
          totalRivalsNeutralized: prev.stats.totalRivalsNeutralized + 1,
          totalCashEarned: prev.stats.totalCashEarned + cashGain,
          totalAmmoSeized: prev.stats.totalAmmoSeized + ammoGain,
          totalRespectEarned: prev.stats.totalRespectEarned + respectGain,
          totalContactsAcquired: prev.stats.totalContactsAcquired + contactGain,
          highestTerritoryReached: newHighestTerritory
        }
      };
    });
  }, []);

  // Action: Scavenge fallen rival (corpos saqueados por soldados com cooldown ou clique direto)
  const handleScavengeDrop = useCallback((cash: number, ammo: number, isAutoSoldier = false) => {
    const now = Date.now();
    // Throttle automated soldier pickups to prevent rapid flood and preserve tactical balance
    if (isAutoSoldier && now - lastScavengeTimestampRef.current < 250) {
      return;
    }
    if (isAutoSoldier) {
      lastScavengeTimestampRef.current = now;
    }

    soundEngine.playCashAmmoCollect();
    setGameState(prev => ({
      ...prev,
      cash: prev.cash + cash,
      ammo: prev.ammo + ammo,
      stats: {
        ...prev.stats,
        totalCashEarned: prev.stats.totalCashEarned + cash,
        totalAmmoSeized: prev.stats.totalAmmoSeized + ammo
      }
    }));
  }, []);

  // Action: Quick Advance to Next Territory
  const handleAdvanceTerritory = useCallback(() => {
    setGameState(prev => {
      const next = TERRITORIES.find(t => t.id === prev.currentTerritoryId + 1);
      if (!next) return prev;
      soundEngine.playUpgradeBuy();
      return {
        ...prev,
        currentTerritoryId: next.id,
        territoryTakes: 0,
        stats: {
          ...prev.stats,
          highestTerritoryReached: Math.max(prev.stats.highestTerritoryReached, next.id)
        }
      };
    });
  }, []);

  const handleAllyDown = useCallback((allyId: string) => {}, []);

  // Action: Buy Upgrade
  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    const item = INITIAL_UPGRADES.find(u => u.id === upgradeId);
    if (!item) return;

    setGameState(prev => {
      const currentLevel = prev.upgrades[upgradeId] || 0;
      if (currentLevel >= item.maxLevel) return prev;

      const cost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, currentLevel));

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

      const cost = talent.cost * (currentLevel + 1);
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

  // Action: Proclaim Hegemony (Prestígio)
  const handlePerformHegemony = useCallback(() => {
    setGameState(prev => {
      const monopolyLvl = prev.talents['talent_hegemony_monopoly'] || 0;
      const monopolyMultiplier = 1 + monopolyLvl * 0.2;

      const earnedEmblems = Math.max(
        1,
        Math.floor(Math.sqrt(prev.stats.totalRespectEarned / 10) * prev.currentTerritoryId * monopolyMultiplier)
      );

      soundEngine.playPrestige();

      const primordialLvl = prev.talents['talent_intel_network'] || 0;
      const newMaxIntel = 100 + primordialLvl * 25;
      const newIntelRegen = 2.0 * (1 + primordialLvl * 0.3);

      return {
        ...prev,
        intel: newMaxIntel,
        maxIntel: newMaxIntel,
        intelRegen: newIntelRegen,
        cash: 60,
        ammo: 15,
        respect: 0,
        contacts: 0,
        hegemonyEmblems: prev.hegemonyEmblems + earnedEmblems,
        currentTerritoryId: 1,
        territoryTakes: 0,
        upgrades: {}, // Reset upgrades locais
        stats: {
          ...prev.stats,
          hegemonyRituals: prev.stats.hegemonyRituals + 1
        }
      };
    });
  }, []);

  // Save Export / Import
  const handleExportSave = useCallback((): string => {
    return btoa(JSON.stringify(gameStateRef.current));
  }, []);

  const handleImportSave = useCallback((data: string): boolean => {
    try {
      const json = atob(data);
      const parsed = JSON.parse(json);
      setGameState({
        ...DEFAULT_STATE,
        ...parsed,
        stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) }
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleHardReset = useCallback(() => {
    const freshState = createDefaultState();
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
    } catch (e) {
      console.error('Falha ao limpar armazenamento local:', e);
    }
    // Update ref immediately to prevent any async timer from saving the old state
    gameStateRef.current = freshState;
    autoAmmoCooldownTimerRef.current = 0;
    lastScavengeTimestampRef.current = 0;
    setGameState(freshState);
    setResetKey(k => k + 1);
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

  const activeFaction = FACTION_CONFIGS[gameState.playerFaction] || FACTION_CONFIGS.vermelha;

  return (
    <div className="w-screen h-screen bg-[#07080d] text-slate-200 flex flex-col overflow-hidden select-none">
      {/* ==================================================== */}
      {/* TOP HEADER: BRAND, NAVIGATION, PRIMARY ACTIONS */}
      {/* ==================================================== */}
      <header className="h-14 bg-[#0a0c14] border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-300 to-sky-400">
            Guerra de Facções PT-BR
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
            <span className="text-[9px] text-slate-400 lowercase font-normal ml-0.5">(trocar)</span>
          </button>
          {saveNotice && (
            <span className="text-[10px] text-emerald-400 font-mono">
              · Salvo
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-3 text-xs">
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
            <span>Disputa do Morro</span>
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
            <span>Documento GDD</span>
          </button>

          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Prontuário</span>
          </button>
        </nav>

        {/* Speed & Settings Actions */}
        <div className="flex items-center gap-2">
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
      </header>

      {/* Main View Area */}
      {currentView === 'battle' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Resource HUD Bar */}
          <ResourceBar
            gameState={gameState}
            onOpenTerritoryModal={() => setIsTerritoryModalOpen(true)}
            onOpenFactionModal={() => setIsFactionModalOpen(true)}
          />

          {/* Battlefield and Evolution Split Screen */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left / Center: Interactive 2D Canvas Battlefield */}
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <GameCanvas
                key={`canvas_${resetKey}_${gameState.currentTerritoryId}_${gameState.playerFaction}`}
                gameState={gameState}
                selectedOrderId={selectedOrderId}
                onSpawnRecruit={handleSpawnRecruit}
                onDirectCommand={handleDirectCommand}
                onRivalEliminated={handleRivalEliminated}
                onScavengeDrop={handleScavengeDrop}
                onAdvanceTerritory={handleAdvanceTerritory}
                onAllyDown={handleAllyDown}
              />
            </div>

            {/* Right: Evolution and Upgrades Panel */}
            <div className="w-full lg:w-96 lg:min-w-[380px] h-72 lg:h-auto overflow-hidden">
              <UpgradePanel
                gameState={gameState}
                onBuyUpgrade={handleBuyUpgrade}
                onBuyTalent={handleBuyTalent}
                onPerformHegemony={handlePerformHegemony}
              />
            </div>
          </div>

          {/* Bottom Tactical Troop Operations Bar */}
          <SpellBar
            gameState={gameState}
            onTriggerRecruit={handleSpawnRecruit}
            onToggleAutoRecruit={() => setGameState(p => ({ ...p, autoRecruitFallen: !p.autoRecruitFallen }))}
            onToggleAutoAmmo={() => setGameState(p => ({ ...p, autoCollectAmmo: !p.autoCollectAmmo }))}
          />
        </div>
      ) : (
        /* Interactive GDD Document View */
        <div className="flex-1 overflow-hidden">
          <GddViewer onClose={() => setCurrentView('battle')} />
        </div>
      )}

      {/* Modals */}
      {isTerritoryModalOpen && (
        <ZoneSelector
          currentTerritoryId={gameState.currentTerritoryId}
          highestTerritoryReached={gameState.stats.highestTerritoryReached}
          territoryTakes={gameState.territoryTakes}
          onSelectTerritory={(territoryId) => setGameState(p => ({ ...p, currentTerritoryId: territoryId, territoryTakes: 0 }))}
          onClose={() => setIsTerritoryModalOpen(false)}
        />
      )}

      {isFactionModalOpen && (
        <FactionModal
          currentFaction={gameState.playerFaction}
          onSelectFaction={(factionId: FactionId) => setGameState(p => ({ ...p, playerFaction: factionId }))}
          onClose={() => setIsFactionModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          gameState={gameState}
          onUpdateSettings={(newSettings) => setGameState(p => ({ ...p, ...newSettings }))}
          onSaveGame={() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameStateRef.current));
            setSaveNotice(true);
            setTimeout(() => setSaveNotice(false), 1500);
          }}
          onExportSave={handleExportSave}
          onImportSave={handleImportSave}
          onHardReset={handleHardReset}
          onDevAddResources={handleDevAddResources}
          onClose={() => setIsSettingsModalOpen(false)}
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
