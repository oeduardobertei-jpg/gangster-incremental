import React from 'react';
import { GameState } from '../types/game';
import { TERRITORIES, FACTION_CONFIGS } from '../data/gameData';
import { Radio, DollarSign, Crosshair, Award, Users, Shield, MapPin } from 'lucide-react';

interface ResourceBarProps {
  gameState: GameState;
  onOpenTerritoryModal: () => void;
  onOpenFactionModal: () => void;
}

export const ResourceBar: React.FC<ResourceBarProps> = ({ 
  gameState, 
  onOpenTerritoryModal,
  onOpenFactionModal
}) => {
  const currentTerritory = TERRITORIES.find(t => t.id === gameState.currentTerritoryId) || TERRITORIES[0];
  const nextTerritory = TERRITORIES.find(t => t.id === gameState.currentTerritoryId + 1);
  const factionConfig = FACTION_CONFIGS[gameState.playerFaction] || FACTION_CONFIGS.vermelha;

  const formatNum = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 10_000) return (num / 1_000).toFixed(1) + 'k';
    return Math.floor(num).toLocaleString('pt-BR');
  };

  const intelPct = Math.min(100, Math.max(0, (gameState.intel / gameState.maxIntel) * 100));
  const territoryTakesPct = nextTerritory 
    ? Math.min(100, (gameState.territoryTakes / nextTerritory.requiredTakes) * 100) 
    : 100;

  return (
    <div className="hud-br-surface relative w-full border-b border-slate-800/80 px-2 sm:px-4 py-2 shadow-md flex items-center gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none">
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-[linear-gradient(90deg,rgba(22,163,74,.35),rgba(234,179,8,.32),rgba(37,99,235,.35))]" />
      {/* Group 1: Faction Badge & Currencies */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
        {/* Faction Selector Pill */}
        <button
          onClick={onOpenFactionModal}
          className="hud-br-card flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer bg-slate-900/90 hover:bg-slate-800 text-left"
          style={{ borderColor: `${factionConfig.color}66` }}
        >
          <div 
            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: factionConfig.color }}
          />
          <div>
            <div className="text-[10px] text-slate-400 leading-tight">Facção Ativa</div>
            <div className="font-bold text-slate-100 flex items-center gap-1.5">
              <span>{factionConfig.tag}</span>
              <span className="text-[10px] text-slate-500 font-normal">vs {factionConfig.rivalTag}</span>
            </div>
          </div>
        </button>

        {/* Inteligência / Rádio (Mana) */}
        <div className="flex items-center gap-2 min-w-[130px] bg-slate-900/90 px-3 py-1.5 rounded-lg border border-sky-900/40">
          <Radio className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-sky-300 font-medium">Rádio / Intel</span>
              <span className="font-mono-numbers text-sky-200">
                {Math.floor(gameState.intel)}/{gameState.maxIntel}
              </span>
            </div>
            {/* Intel Progress */}
            <div className="w-full bg-sky-950/70 rounded-full h-1.5 mt-1 overflow-hidden">
              <div 
                className="bg-sky-500 h-full rounded-full transition-all duration-200" 
                style={{ width: `${intelPct}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-sky-400/80 font-mono-numbers">
            +{gameState.intelRegen.toFixed(1)}/s
          </span>
        </div>

        {/* Grana / Dinheiro Sujo (Sangue) */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-emerald-900/40">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-emerald-300/80">Grana Suja</div>
            <div className="font-mono-numbers font-semibold text-emerald-200">
              ${formatNum(gameState.cash)}
            </div>
          </div>
        </div>

        {/* Munição & Armas (Ossos) */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700/40">
          <Crosshair className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Munição (Caixas)</div>
            <div className="font-mono-numbers font-semibold text-slate-200">
              {formatNum(gameState.ammo)}
            </div>
          </div>
        </div>

        {/* Respeito das Ruas (Almas) */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-purple-900/40">
          <Award className="w-4 h-4 text-purple-400 shrink-0" />
          <div>
            <div className="text-[10px] text-purple-300/80">Respeito Moral</div>
            <div className="font-mono-numbers font-semibold text-purple-200">
              {formatNum(gameState.respect)}
            </div>
          </div>
        </div>

        {/* Contatos / Escutas (Cérebros) */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-pink-900/40">
          <Users className="w-4 h-4 text-pink-400 shrink-0" />
          <div>
            <div className="text-[10px] text-pink-300/80">Contatos Chave</div>
            <div className="font-mono-numbers font-semibold text-pink-200">
              {formatNum(gameState.contacts)}
            </div>
          </div>
        </div>

        {/* Emblemas de Hegemonia (Prestígio) */}
        {gameState.hegemonyEmblems > 0 && (
          <div className="flex items-center gap-2 bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-500/50">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-amber-300">Hegemonia</div>
              <div className="font-mono-numbers font-bold text-amber-200">
                {gameState.hegemonyEmblems}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Group 2: Current Territory & Progress */}
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        <button
          onClick={onOpenTerritoryModal}
          className="hud-br-card flex items-center gap-2 px-3 py-1.5 bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="text-left">
            <div className="text-[10px] text-slate-400">Território Ativo</div>
            <div className="font-medium text-slate-200">{currentTerritory.name}</div>
          </div>
          {nextTerritory && (
            <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden ml-2">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all" 
                style={{ width: `${territoryTakesPct}%` }}
              />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
