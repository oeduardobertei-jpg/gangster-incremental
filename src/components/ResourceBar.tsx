import React from 'react';
import { GameState } from '../types/game';
import { TERRITORIES } from '../data/gameData';
import { Radio, DollarSign, Crosshair, Award, Users, Shield, MapPin, ChevronRight } from 'lucide-react';

interface ResourceBarProps {
  gameState: GameState;
  onOpenTerritoryModal: () => void;
  onOpenFactionModal: () => void;
}

type ResourceChipProps = {
  label: string;
  value: string;
  detail?: string;
  icon: React.ReactNode;
  tone: string;
};

const ResourceChip: React.FC<ResourceChipProps> = ({ label, value, detail, icon, tone }) => (
  <div className="hud-resource-chip flex h-10 min-w-[92px] items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-950/54 px-2.5 shadow-sm">
    <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-950/75 ${tone}`}>{icon}</div>
    <div className="min-w-0 leading-none">
      <div className="text-[8px] font-black tracking-[.13em] text-slate-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono-numbers text-[12px] font-bold text-slate-100">{value}</span>
        {detail && <span className="text-[8px] font-semibold text-slate-600">{detail}</span>}
      </div>
    </div>
  </div>
);

export const ResourceBar: React.FC<ResourceBarProps> = ({
  gameState,
  onOpenTerritoryModal
}) => {
  const currentTerritory = TERRITORIES.find(t => t.id === gameState.currentTerritoryId) || TERRITORIES[0];

  const formatNum = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 10_000) return (num / 1_000).toFixed(1) + 'k';
    return Math.floor(num).toLocaleString('pt-BR');
  };

  const intelPct = Math.min(100, Math.max(0, (gameState.intel / Math.max(1, gameState.maxIntel)) * 100));
  const pressureTarget = Math.max(1, currentTerritory.requiredNeutralizations);
  const pressureNow = Math.min(pressureTarget, Math.max(0, gameState.territoryTakes));
  const pressurePct = Math.min(100, (pressureNow / pressureTarget) * 100);

  return (
    <div className="hud-br-surface hud-command-strip relative w-full shrink-0 border-b border-slate-800/80 px-2 sm:px-3 py-1.5 shadow-md select-none">
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-[linear-gradient(90deg,rgba(22,163,74,.35),rgba(234,179,8,.28),rgba(37,99,235,.35))]" />
      <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ResourceChip label="INTEL" value={`${Math.floor(gameState.intel)}/${gameState.maxIntel}`} detail={`+${gameState.intelRegen.toFixed(1)}/s`} icon={<Radio className="h-3.5 w-3.5" />} tone="text-sky-300" />
        <ResourceChip label="GRANA" value={`$${formatNum(gameState.cash)}`} icon={<DollarSign className="h-3.5 w-3.5" />} tone="text-emerald-300" />
        <ResourceChip label="MUNIÇÃO" value={formatNum(gameState.ammo)} icon={<Crosshair className="h-3.5 w-3.5" />} tone="text-amber-300" />
        <ResourceChip label="RESPEITO" value={formatNum(gameState.respect)} icon={<Award className="h-3.5 w-3.5" />} tone="text-violet-300" />
        <ResourceChip label="CONTATOS" value={formatNum(gameState.contacts)} icon={<Users className="h-3.5 w-3.5" />} tone="text-pink-300" />

        {gameState.hegemonyEmblems > 0 && (
          <ResourceChip label="HEGEMONIA" value={String(gameState.hegemonyEmblems)} icon={<Shield className="h-3.5 w-3.5" />} tone="text-amber-200" />
        )}

        <button
          onClick={onOpenTerritoryModal}
          className="hud-operation-card ml-auto flex h-10 min-w-[248px] shrink-0 items-center gap-2.5 rounded-lg border border-slate-700/80 bg-slate-900/72 px-3 text-left shadow-sm transition-colors hover:border-slate-600 hover:bg-slate-900"
          title="Abrir mapa de territórios"
        >
          <MapPin className="h-4 w-4 shrink-0 text-rose-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[8px] font-black tracking-[.15em] text-slate-500">OPERAÇÃO ATIVA · T{currentTerritory.id}</div>
                <div className="mt-0.5 truncate text-[11px] font-bold text-slate-100">{currentTerritory.name}</div>
              </div>
              <span className="font-mono-numbers shrink-0 text-[10px] font-bold text-rose-200">{pressureNow}/{pressureTarget}</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-950/90">
              <div className="h-full rounded-full bg-rose-500 transition-[width] duration-200" style={{ width: `${pressurePct}%` }} />
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
        </button>
      </div>
      <div className="pointer-events-none absolute left-0 bottom-0 h-px bg-sky-400/60 transition-[width] duration-200" style={{ width: `${Math.max(2, intelPct)}%` }} />
    </div>
  );
};

