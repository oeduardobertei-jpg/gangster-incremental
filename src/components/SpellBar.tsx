import React from 'react';
import { GameState } from '../types/game';
import { UserPlus, ToggleLeft, ToggleRight, Lock, Zap, Box, Radio } from 'lucide-react';
import { AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS, getAutoRecruitMilestoneProgress } from '../rules/progression';

interface SpellBarProps {
  gameState: GameState;
  selectedOrderId?: string;
  onSelectOrder?: (orderId: string) => void;
  onTriggerRecruit?: () => void;
  onToggleAutoRecruit: () => void;
  onToggleAutoAmmo?: () => void;
}

export const SpellBar: React.FC<SpellBarProps> = ({
  gameState,
  onTriggerRecruit,
  onToggleAutoRecruit,
  onToggleAutoAmmo
}) => {
  const autoRecruitUnlocked = (gameState.upgrades['sindicato_auto_recruit'] || 0) > 0;
  const autoAmmoUnlocked = (gameState.upgrades['boca_auto_ammo_scavenge'] || 0) > 0;
  const milestone = getAutoRecruitMilestoneProgress(gameState);
  const recruitCost = 10;
  const canAfford = gameState.intel >= recruitCost;

  return (
    <div className="hud-br-surface hud-action-strip relative w-full shrink-0 border-t border-slate-800/80 px-2 sm:px-3 py-1.5 select-none">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,rgba(22,163,74,.32),rgba(234,179,8,.28),rgba(37,99,235,.32))]" />
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onTriggerRecruit}
          disabled={!canAfford}
          className={`hud-recruit-command group flex h-11 min-w-0 items-center gap-2.5 rounded-lg border px-3 text-left shadow-md transition-all active:scale-[.985] ${
            canAfford
              ? 'cursor-pointer border-emerald-500/65 bg-emerald-950/52 text-emerald-50 hover:border-emerald-400 hover:bg-emerald-950/72'
              : 'cursor-not-allowed border-slate-800 bg-slate-950/65 text-slate-600 opacity-65'
          }`}
          title="Convocar reforço (Espaço ou clique no mapa)"
        >
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${canAfford ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-900 text-slate-600'}`}><UserPlus className="h-4 w-4" /></span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-[11px] font-black tracking-[.02em]">CONVOCAR REFORÇO</span>
              <kbd className="hidden sm:inline rounded border border-slate-700/80 bg-slate-950/80 px-1.5 py-0.5 font-mono text-[8px] font-bold text-slate-500">ESPAÇO</kbd>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[9px] font-semibold">
              <span className={canAfford ? 'text-sky-300' : 'text-rose-400'}><Zap className="mr-0.5 inline h-2.5 w-2.5" />{recruitCost} intel</span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-500"><Radio className="mr-0.5 inline h-2.5 w-2.5" />+{gameState.intelRegen.toFixed(1)}/s</span>
            </div>
          </div>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {autoAmmoUnlocked && onToggleAutoAmmo && (
            <button
              onClick={onToggleAutoAmmo}
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[9px] font-black tracking-[.04em] transition-colors ${gameState.autoCollectAmmo ? 'border-sky-500/55 bg-sky-950/45 text-sky-200' : 'border-slate-800 bg-slate-950/55 text-slate-500 hover:text-slate-300'}`}
              title="Coleta automática de munição"
            >
              <Box className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AUTO-MUNIÇÃO</span>
              <span className={`rounded px-1 py-0.5 text-[7px] ${gameState.autoCollectAmmo ? 'bg-sky-400/15 text-sky-300' : 'bg-slate-900 text-slate-600'}`}>{gameState.autoCollectAmmo ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {autoRecruitUnlocked ? (
            <button
              onClick={onToggleAutoRecruit}
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[9px] font-black tracking-[.04em] transition-colors ${gameState.autoRecruitFallen ? 'border-emerald-500/55 bg-emerald-950/45 text-emerald-200' : 'border-slate-800 bg-slate-950/55 text-slate-500 hover:text-slate-300'}`}
              title="Convocação automática"
            >
              {gameState.autoRecruitFallen ? <ToggleRight className="h-4 w-4 text-emerald-300" /> : <ToggleLeft className="h-4 w-4" />}
              <span className="hidden sm:inline">AUTO-CONVOCAR</span>
              <span className={`rounded px-1 py-0.5 text-[7px] ${gameState.autoRecruitFallen ? 'bg-emerald-400/15 text-emerald-300' : 'bg-slate-900 text-slate-600'}`}>{gameState.autoRecruitFallen ? 'ON' : 'OFF'}</span>
            </button>
          ) : (
            <div className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/55 px-2.5 text-[9px] font-bold text-slate-600" title={`Neutralize ${AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS} rivais nesta rodada para liberar Auto-Convocação`}>
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AUTO</span>
              <span className="font-mono-numbers text-slate-500">{milestone}/{AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

