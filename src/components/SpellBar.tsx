import React from 'react';
import { GameState } from '../types/game';
import { UserPlus, ToggleLeft, ToggleRight, Radio, Lock, Zap, Box } from 'lucide-react';

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
  
  // Standard recruit cost
  const recruitCost = 10;
  const canAfford = gameState.intel >= recruitCost;

  return (
    <div className="w-full bg-[#0a0c14] border-t border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-4 select-none">
      {/* Primary Action: Direct Recruit Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTriggerRecruit}
          disabled={!canAfford}
          className={`relative group flex items-center gap-3 px-4 py-2 rounded-xl border transition-all cursor-pointer font-semibold shadow-md ${
            canAfford
              ? 'bg-gradient-to-r from-emerald-950/80 to-emerald-900/60 border-emerald-500/70 text-emerald-100 hover:border-emerald-400 hover:shadow-emerald-950/50 hover:brightness-110 active:scale-95'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
          }`}
          title="Chamar um novo soldado pelo rádio (Espaço ou Clique no Mapa)"
        >
          {/* Key shortcut pill */}
          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-slate-900 text-[10px] font-mono rounded border border-slate-700 text-slate-300 shadow">
            Espaço
          </span>

          <div className={`p-1.5 rounded-lg ${canAfford ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
            <UserPlus className="w-5 h-5" />
          </div>

          <div className="text-left">
            <div className="text-sm font-bold leading-tight flex items-center gap-1.5">
              <span>Convocar Soldado / Recruta</span>
            </div>
            <div className="text-[11px] flex items-center gap-2 font-mono-numbers">
              <span className={canAfford ? 'text-emerald-300 font-semibold flex items-center gap-0.5' : 'text-rose-400 font-semibold'}>
                <Zap className="w-3 h-3 inline" /> {recruitCost} Inteligência
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Despacho Imediato</span>
            </div>
          </div>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Frequência do Rádio: <strong className="text-slate-200">+{gameState.intelRegen.toFixed(1)}/s</strong></span>
        </div>
      </div>

      {/* Middle status: Autonomous behavior notice */}
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/50">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="text-slate-300 font-medium">IA do Bonde:</span>
        <span className="text-slate-400">Soldados avançam, patrulham e eliminam rivais autonomamente</span>
      </div>

      {/* Right: Automation Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Auto Collect Ammo Toggle */}
        {autoAmmoUnlocked && onToggleAutoAmmo && (
          <button
            onClick={onToggleAutoAmmo}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-sm ${
              gameState.autoCollectAmmo
                ? 'bg-sky-950/50 border-sky-500/80 text-sky-200 shadow-sky-950/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-800/60'
            }`}
            title="Coleta automática periódica de munições das carcaças (com cooldown)"
          >
            <Box className="w-3.5 h-3.5 text-sky-400" />
            <span>Auto-Munição</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${gameState.autoCollectAmmo ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-500'}`}>
              {gameState.autoCollectAmmo ? 'ON' : 'OFF'}
            </span>
          </button>
        )}

        {/* Auto Recruit Toggle */}
        {autoRecruitUnlocked ? (
          <button
            onClick={onToggleAutoRecruit}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-sm ${
              gameState.autoRecruitFallen
                ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200 shadow-emerald-950/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            {gameState.autoRecruitFallen ? (
              <ToggleRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-500" />
            )}
            <span>Auto-Convocar</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${gameState.autoRecruitFallen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
              {gameState.autoRecruitFallen ? 'LIGADO' : 'DESLIGADO'}
            </span>
          </button>
        ) : (
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-500"
            title="Adquira a melhoria 'Convocação Automática' no Sindicato (Contatos) para habilitar o modo idle"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>Auto-Convocação (Sindicato)</span>
          </div>
        )}
      </div>
    </div>
  );
};
