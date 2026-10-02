import React from 'react';
import { TERRITORIES } from '../data/gameData';
import { MapPin, Lock, X } from 'lucide-react';

interface ZoneSelectorProps {
  currentTerritoryId: number;
  highestTerritoryReached: number;
  territoryTakes: number;
  onSelectTerritory: (territoryId: number) => void;
  onClose: () => void;
}

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  currentTerritoryId,
  highestTerritoryReached,
  territoryTakes,
  onSelectTerritory,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151f] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            <h2 className="font-cinzel text-lg font-bold text-slate-100">Mapa das Ruas e Disputa de Territórios</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Territories List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {TERRITORIES.map((territory) => {
            const isUnlocked = territory.id <= highestTerritoryReached;
            const isCurrent = territory.id === currentTerritoryId;
            const nextRequired = territory.requiredTakes;

            return (
              <div
                key={territory.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  isCurrent
                    ? 'bg-rose-950/30 border-rose-500 shadow-md shadow-rose-950/40'
                    : isUnlocked
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/50 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel font-bold text-slate-100 text-sm">
                        {territory.id}. {territory.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300 border border-rose-700">
                          Disputa em Andamento
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {territory.description}
                    </p>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Inimigos Presentes:</span>
                        <span className="text-slate-300">
                          {Object.entries(territory.rivalPool)
                            .filter(([, v]) => v > 0)
                            .map(([k]) => k.replace('_', ' '))
                            .join(', ')}
                        </span>
                      </div>
                      <span className="text-slate-600">·</span>
                      <span className="text-rose-300 font-mono-numbers">Vida: {territory.healthMultiplier}x</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-orange-300 font-mono-numbers">Dano: {territory.damageMultiplier}x</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-emerald-400 font-mono-numbers">Grana/Suprimentos: {territory.rewardMultiplier}x</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          onSelectTerritory(territory.id);
                          onClose();
                        }}
                        disabled={isCurrent}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                          isCurrent
                            ? 'bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md'
                        }`}
                      >
                        {isCurrent ? 'Em Disputa' : 'Invadir Ponto'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Requer {nextRequired} Neutralizações</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 text-xs text-slate-400 flex items-center justify-between">
          <span>Inimigos abatidos no território atual: <strong className="text-rose-400 font-mono-numbers">{territoryTakes}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
