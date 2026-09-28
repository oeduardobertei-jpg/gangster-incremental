import React, { useState } from 'react';
import { GameState, UpgradeItem, SyndicatePrestigeTalent } from '../types/game';
import { INITIAL_UPGRADES, INITIAL_PRESTIGE_TALENTS } from '../data/gameData';
import { DollarSign, Crosshair, Award, Users, Shield, Sparkles, Check } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface UpgradePanelProps {
  gameState: GameState;
  onBuyUpgrade: (upgradeId: string) => void;
  onBuyTalent: (talentId: string) => void;
  onPerformHegemony: () => void;
}

export const UpgradePanel: React.FC<UpgradePanelProps> = ({
  gameState,
  onBuyUpgrade,
  onBuyTalent,
  onPerformHegemony
}) => {
  const [activeTab, setActiveTab] = useState<'armory' | 'boca' | 'intel' | 'sindicato' | 'hegemonia'>('armory');

  const getUpgradeCost = (item: UpgradeItem, currentLevel: number): number => {
    return Math.floor(item.baseCost * Math.pow(item.costMultiplier, currentLevel));
  };

  const canAfford = (currency: UpgradeItem['currency'], cost: number): boolean => {
    switch (currency) {
      case 'grana': return gameState.cash >= cost;
      case 'municao': return gameState.ammo >= cost;
      case 'respeito': return gameState.respect >= cost;
      case 'contatos': return gameState.contacts >= cost;
      default: return false;
    }
  };

  const getCurrencyIcon = (currency: UpgradeItem['currency']) => {
    switch (currency) {
      case 'grana': return <DollarSign className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />;
      case 'municao': return <Crosshair className="w-3.5 h-3.5 text-amber-400 inline mr-1" />;
      case 'respeito': return <Award className="w-3.5 h-3.5 text-purple-400 inline mr-1" />;
      case 'contatos': return <Users className="w-3.5 h-3.5 text-pink-400 inline mr-1" />;
    }
  };

  const potentialEmblems = Math.max(
    0,
    Math.floor(Math.sqrt(gameState.stats.totalRespectEarned / 10) * gameState.currentTerritoryId)
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#0d0f17] border-l border-slate-800/80">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-800/80 bg-slate-950/70 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('armory')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'armory'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Arsenal ($)</span>
        </button>

        <button
          onClick={() => setActiveTab('boca')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'boca'
              ? 'border-amber-500 text-amber-400 bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <span>Bocas & Apoio</span>
        </button>

        <button
          onClick={() => setActiveTab('intel')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'intel'
              ? 'border-purple-500 text-purple-400 bg-purple-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <span>Rádios & Intel</span>
        </button>

        <button
          onClick={() => setActiveTab('sindicato')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sindicato'
              ? 'border-pink-500 text-pink-400 bg-pink-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-pink-400" />
          <span>Sindicato</span>
        </button>

        <button
          onClick={() => setActiveTab('hegemonia')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'hegemonia'
              ? 'border-amber-500 text-amber-300 bg-amber-950/25'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Hegemonia</span>
        </button>
      </div>

      {/* Upgrades List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab !== 'hegemonia' ? (
          INITIAL_UPGRADES.filter(u => u.category === activeTab).map((item) => {
            const currentLevel = gameState.upgrades[item.id] || 0;
            const isMaxed = currentLevel >= item.maxLevel;
            const cost = getUpgradeCost(item, currentLevel);
            const affordable = !isMaxed && canAfford(item.currency, cost);

            return (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700/80 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-200 text-sm">{item.name}</div>
                    <div className="text-[11px] text-slate-400 leading-snug mt-0.5">{item.description}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono-numbers px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      Nvl {currentLevel}/{item.maxLevel}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400 font-medium">
                  {item.effectDescription}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-1">
                  <div className="text-xs font-mono-numbers text-slate-300 flex items-center">
                    {!isMaxed ? (
                      <>
                        <span className="text-slate-500 mr-1.5">Custo:</span>
                        {getCurrencyIcon(item.currency)}
                        <span className={affordable ? 'text-slate-200 font-semibold' : 'text-rose-400'}>
                          {cost.toLocaleString('pt-BR')}
                        </span>
                      </>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Nível Máximo
                      </span>
                    )}
                  </div>

                  {!isMaxed && (
                    <button
                      onClick={() => onBuyUpgrade(item.id)}
                      disabled={!affordable}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        affordable
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-900/30'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                      }`}
                    >
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* PRESTIGE: PROCLAMAÇÃO DA HEGEMONIA */
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-950/40 via-rose-950/20 to-slate-900 border border-amber-600/40 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 font-cinzel font-bold text-base">
                <Sparkles className="w-5 h-5" />
                <span>Proclamação da Hegemonia da Cidade</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Consolide o domínio absoluto das ruas, lavando todo o dinheiro acumulado para o sindicato central. 
                Você receberá <strong>Emblemas de Hegemonia</strong> permanentes que garantem multiplicadores eternos para toda a organização.
              </p>

              <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Emblemas a Receber:</div>
                  <div className="text-xl font-bold font-mono-numbers text-amber-300">
                    +{potentialEmblems} 🛡️
                  </div>
                </div>

                <button
                  onClick={onPerformHegemony}
                  disabled={gameState.respect < 80 && potentialEmblems <= 0}
                  className={`px-4 py-2 rounded-lg font-cinzel text-xs font-bold transition-all cursor-pointer ${
                    potentialEmblems > 0 || gameState.respect >= 80
                      ? 'bg-amber-600 hover:bg-amber-500 text-amber-950 shadow-lg shadow-amber-900/50'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Proclamar Hegemonia
                </button>
              </div>
            </div>

            {/* Permanent Hegemony Talents */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Vantagens Permanentes do Cartel
              </div>

              {INITIAL_PRESTIGE_TALENTS.map((talent) => {
                const currentLevel = gameState.talents[talent.id] || 0;
                const cost = talent.cost * (currentLevel + 1);
                const affordable = gameState.hegemonyEmblems >= cost && currentLevel < talent.maxLevel;

                return (
                  <div
                    key={talent.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-amber-300 text-xs">{talent.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{talent.description}</div>
                      </div>
                      <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40">
                        Nvl {currentLevel}/{talent.maxLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <div className="text-xs font-mono-numbers text-amber-400">
                        Custo: {cost} Emblemas 🛡️
                      </div>

                      <button
                        onClick={() => onBuyTalent(talent.id)}
                        disabled={!affordable}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                          affordable
                            ? 'bg-amber-600 hover:bg-amber-500 text-amber-950 cursor-pointer font-semibold'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Consolidar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
