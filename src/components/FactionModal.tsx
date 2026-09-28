import React from 'react';
import { FactionId } from '../types/game';
import { FACTION_CONFIGS } from '../data/gameData';
import { Shield, Check, X } from 'lucide-react';

interface FactionModalProps {
  currentFaction: FactionId;
  onSelectFaction: (factionId: FactionId) => void;
  onClose: () => void;
}

export const FactionModal: React.FC<FactionModalProps> = ({
  currentFaction,
  onSelectFaction,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151f] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="font-cinzel text-lg font-bold text-slate-100">Escolha de Facção & Identidade</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecione qual organização você lidera nesta batalha. A facção oposta assumirá automaticamente o controle dos territórios rivais para a disputa do morro:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(FACTION_CONFIGS).map((fac) => {
              const isSelected = fac.id === currentFaction;

              return (
                <div
                  key={fac.id}
                  onClick={() => onSelectFaction(fac.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-900 shadow-xl'
                      : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800'
                  }`}
                  style={{ borderColor: isSelected ? fac.color : undefined }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shadow-sm" 
                          style={{ backgroundColor: fac.color }}
                        />
                        <span className="font-bold text-slate-100 text-sm">{fac.tag}</span>
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1"
                          style={{ backgroundColor: `${fac.color}25`, color: fac.color }}
                        >
                          {fac.tag === 'PCC' ? 'Azul' : 'Vermelho'}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-emerald-500 text-slate-950">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-200 text-xs mt-1">{fac.name}</div>
                    <div className="text-[11px] text-slate-400 italic mt-2">"{fac.motto}"</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Rival direto:</span>
                    <strong style={{ color: fac.rivalColor }}>
                      {fac.rivalTag} ({fac.rivalTag === 'PCC' ? 'Azul' : 'Vermelho'})
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md hover:brightness-110 active:scale-95 ${
              currentFaction === 'azul' ? 'bg-sky-600 hover:bg-sky-500' : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            Confirmar e Voltar à Batalha
          </button>
        </div>
      </div>
    </div>
  );
};
