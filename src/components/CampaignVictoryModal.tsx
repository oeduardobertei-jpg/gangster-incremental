import React from 'react';
import { Crown, MapPinned, RotateCcw, ShieldCheck } from 'lucide-react';
import type { GameState } from '../types/game';

interface CampaignVictoryModalProps {
  gameState: GameState;
  territoryName: string;
  factionName: string;
  factionColor: string;
  hegemonyReward: number;
  onContinue: () => void;
  onOpenEvolution: () => void;
}

export const CampaignVictoryModal: React.FC<CampaignVictoryModalProps> = ({
  gameState,
  territoryName,
  factionName,
  factionColor,
  hegemonyReward,
  onContinue,
  onOpenEvolution
}) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/82 p-4 backdrop-blur-md sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-victory-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-[#0b1018] shadow-2xl"
        style={{ borderColor: `${factionColor}99`, boxShadow: `0 24px 90px ${factionColor}26` }}
      >
        <div className="relative overflow-hidden border-b border-white/10 px-6 py-6 sm:px-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(circle at 20% 0%, ${factionColor}, transparent 48%)` }}
          />
          <div className="relative flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-black/30"
              style={{ borderColor: `${factionColor}88`, color: factionColor }}
            >
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">Campanha concluída</p>
              <h2 id="campaign-victory-title" className="mt-1 font-cinzel text-2xl font-black tracking-wide text-white sm:text-3xl">
                DOMÍNIO TOTAL
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                {factionName} consolidou a campanha T1–T6. {territoryName} foi dominado e a rodada agora pode seguir em livre defesa ou ser convertida em Hegemonia.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 px-6 py-5 sm:grid-cols-3 sm:px-8">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Neutralizações</span>
            </div>
            <div className="mt-2 font-mono-numbers text-2xl font-black text-white">{gameState.runRivalsNeutralized}</div>
            <div className="mt-1 text-[11px] text-slate-500">nesta rodada</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <MapPinned className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Territórios</span>
            </div>
            <div className="mt-2 font-mono-numbers text-2xl font-black text-white">6/6</div>
            <div className="mt-1 text-[11px] text-slate-500">campanha principal</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Crown className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Hegemonia</span>
            </div>
            <div className="mt-2 font-mono-numbers text-2xl font-black" style={{ color: factionColor }}>+{hegemonyReward}</div>
            <div className="mt-1 text-[11px] text-slate-500">emblemas se prestigiar agora</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-950/55 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="max-w-md text-xs leading-relaxed text-slate-400">
            Continuar mantém o território ativo e os reforços externos. Preparar Hegemonia abre a evolução sem reiniciar nada automaticamente.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={onContinue}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800"
            >
              Continuar no mapa
            </button>
            <button
              onClick={onOpenEvolution}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black text-white transition brightness-100 hover:brightness-110"
              style={{ backgroundColor: factionColor }}
            >
              <RotateCcw className="h-4 w-4" />
              Preparar Hegemonia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
