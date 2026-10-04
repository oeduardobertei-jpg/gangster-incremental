import React, { useState } from 'react';
import { GameState, UpgradeItem } from '../types/game';
import { INITIAL_UPGRADES, INITIAL_PRESTIGE_TALENTS } from '../data/gameData';
import { DollarSign, Crosshair, Award, Users, Shield, Sparkles, Check } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { getHegemonyReward } from '../rules/prestige';
import { getUpgradeCost, getUpgradeEffectRows } from '../rules/upgrades';
import { getHegemonyTalentCost, getHegemonyTalentEffectRows } from '../rules/hegemonyTalents';
import { AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS, getAutoRecruitMilestoneProgress } from '../rules/progression';
import { getNextVisualTierLevel, getVisualTier } from '../data/visualTokens';
import { BASE_STAGE_THRESHOLDS, BASE_VISUAL_MAX_SCORE, getBaseCommandVisualProfile } from '../rules/baseCommandVisualProgression';

interface UpgradePanelProps {
  gameState: GameState;
  onBuyUpgrade: (upgradeId: string) => void;
  onBuyTalent: (talentId: string) => void;
  onPerformHegemony: () => void;
  compactTabs?: boolean;
}

export const UpgradePanel: React.FC<UpgradePanelProps> = ({
  gameState,
  onBuyUpgrade,
  onBuyTalent,
  onPerformHegemony,
  compactTabs = false
}) => {
  const [activeTab, setActiveTab] = useState<'armory' | 'boca' | 'intel' | 'sindicato' | 'hegemonia'>('armory');

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

  const potentialEmblems = getHegemonyReward(gameState);
  const baseVisual = getBaseCommandVisualProfile(gameState);
  const nextBaseThreshold = baseVisual.stage < 3 ? BASE_STAGE_THRESHOLDS[baseVisual.stage + 1] : BASE_VISUAL_MAX_SCORE;
  const baseProgressPct = Math.round(baseVisual.stageProgress * 100);
  const workshopMeta = {
    armory: {
      eyebrow: 'OFICINA DE COMBATE', title: 'Arsenal da Organização',
      subtitle: 'Proteção, poder de fogo, mobilidade e atendimento de campo.',
      tone: 'border-emerald-700/40 bg-emerald-950/20 text-emerald-300', icon: <DollarSign className="w-5 h-5" />
    },
    boca: {
      eyebrow: 'INFRAESTRUTURA DE RUA', title: 'Bocas & Pontos de Apoio',
      subtitle: 'Capacidade, fortificação, logística e tropas especializadas.',
      tone: 'border-amber-700/40 bg-amber-950/20 text-amber-300', icon: <Crosshair className="w-5 h-5" />
    },
    intel: {
      eyebrow: 'CENTRAL DE COMUNICAÇÃO', title: 'Rádio & Inteligência',
      subtitle: 'Rede tática, alcance de comando e coordenação da operação.',
      tone: 'border-purple-700/40 bg-purple-950/20 text-purple-300', icon: <Award className="w-5 h-5" />
    },
    sindicato: {
      eyebrow: 'REDE DE CONEXÕES', title: 'Sindicato',
      subtitle: 'Automação, reforços e influência que fazem a máquina girar.',
      tone: 'border-pink-700/40 bg-pink-950/20 text-pink-300', icon: <Users className="w-5 h-5" />
    }
  }[activeTab as 'armory' | 'boca' | 'intel' | 'sindicato'];

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-[#0d0f17] border-l border-slate-800/80">
      {/* Tab Navigation */}
      <div aria-label="Categorias de evolução" className={`grid shrink-0 min-w-0 border-b border-slate-800/80 bg-slate-950/70 text-xs ${compactTabs ? 'grid-cols-5' : 'grid-cols-6'}`}> 
        <button
          onClick={() => setActiveTab('armory')}
          aria-pressed={activeTab === 'armory'}
          title="Arsenal ($)"
          aria-label="Arsenal ($)"
          className={`flex min-w-0 min-h-11 items-center justify-center px-2 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${compactTabs ? '' : 'col-span-2 gap-1.5 text-center leading-tight [&:nth-child(n+4)]:col-span-3'} ${
            activeTab === 'armory'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className={`${compactTabs ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-emerald-400`} />
          <span className={compactTabs ? 'sr-only' : ''}>Arsenal ($)</span>
        </button>

        <button
          onClick={() => setActiveTab('boca')}
          aria-pressed={activeTab === 'boca'}
          title="Bocas & Apoio"
          aria-label="Bocas & Apoio"
          className={`flex min-w-0 min-h-11 items-center justify-center px-2 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${compactTabs ? '' : 'col-span-2 gap-1.5 text-center leading-tight [&:nth-child(n+4)]:col-span-3'} ${
            activeTab === 'boca'
              ? 'border-amber-500 text-amber-400 bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crosshair className={`${compactTabs ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-amber-400`} />
          <span className={compactTabs ? 'sr-only' : ''}>Bocas & Apoio</span>
        </button>

        <button
          onClick={() => setActiveTab('intel')}
          aria-pressed={activeTab === 'intel'}
          title="Rádios & Intel"
          aria-label="Rádios & Intel"
          className={`flex min-w-0 min-h-11 items-center justify-center px-2 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${compactTabs ? '' : 'col-span-2 gap-1.5 text-center leading-tight [&:nth-child(n+4)]:col-span-3'} ${
            activeTab === 'intel'
              ? 'border-purple-500 text-purple-400 bg-purple-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className={`${compactTabs ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-purple-400`} />
          <span className={compactTabs ? 'sr-only' : ''}>Rádios & Intel</span>
        </button>

        <button
          onClick={() => setActiveTab('sindicato')}
          aria-pressed={activeTab === 'sindicato'}
          title="Sindicato"
          aria-label="Sindicato"
          className={`flex min-w-0 min-h-11 items-center justify-center px-2 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${compactTabs ? '' : 'col-span-2 gap-1.5 text-center leading-tight [&:nth-child(n+4)]:col-span-3'} ${
            activeTab === 'sindicato'
              ? 'border-pink-500 text-pink-400 bg-pink-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className={`${compactTabs ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-pink-400`} />
          <span className={compactTabs ? 'sr-only' : ''}>Sindicato</span>
        </button>

        <button
          onClick={() => setActiveTab('hegemonia')}
          aria-pressed={activeTab === 'hegemonia'}
          title="Hegemonia"
          aria-label="Hegemonia"
          className={`flex min-w-0 min-h-11 items-center justify-center px-2 py-2.5 font-medium border-b-2 transition-colors cursor-pointer ${compactTabs ? '' : 'col-span-2 gap-1.5 text-center leading-tight [&:nth-child(n+4)]:col-span-3'} ${
            activeTab === 'hegemonia'
              ? 'border-amber-500 text-amber-300 bg-amber-950/25'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className={`${compactTabs ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-amber-400`} />
          <span className={compactTabs ? 'sr-only' : ''}>Hegemonia</span>
        </button>
      </div>

      <div className="shrink-0 border-b border-slate-800/70 bg-slate-950/45 px-3 py-2">
        <div className="flex items-center justify-between gap-2 text-[10px]">
          <div className="font-semibold text-slate-300">Base de Comando <span className="text-rose-300">· E{baseVisual.stage}</span></div>
          <div className="font-mono-numbers text-slate-500">{baseVisual.score}/{nextBaseThreshold}</div>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full border border-slate-800 bg-slate-900"><div className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 transition-[width] duration-300" style={{ width: `${baseProgressPct}%` }} /></div>
        <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500"><span>{baseVisual.stage < 3 ? `Próximo estágio: ${nextBaseThreshold} níveis totais` : 'Estágio dominante · maturidade em progresso'}</span>{baseVisual.hegemonyHonors > 0 && <span className="text-amber-400/80">Hegemonias: {baseVisual.hegemonyHonors}</span>}</div>
      </div>

      {/* Upgrades List Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {activeTab !== 'hegemonia' ? (
          <>
            {workshopMeta && (
              <div className={`relative overflow-hidden rounded-xl border p-3 ${workshopMeta.tone}`}>
                <div className="absolute inset-y-0 right-0 w-24 opacity-10 bg-[repeating-linear-gradient(135deg,currentColor_0_2px,transparent_2px_10px)]" />
                <div className="relative flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg border border-current/25 bg-slate-950/45 p-2">{workshopMeta.icon}</div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold tracking-[0.18em] opacity-75">{workshopMeta.eyebrow}</div>
                    <div className="mt-0.5 text-sm font-bold text-slate-100">{workshopMeta.title}</div>
                    <div className="mt-1 text-[10px] leading-snug text-slate-400">{workshopMeta.subtitle}</div>
                  </div>
                </div>
              </div>
            )}
            {INITIAL_UPGRADES.filter(u => u.category === activeTab).map((item) => {
            const currentLevel = gameState.upgrades[item.id] || 0;
            const isMaxed = currentLevel >= item.maxLevel;
            const campaignGrantPending = item.id === 'sindicato_auto_recruit' && currentLevel === 0;
            const milestoneProgress = campaignGrantPending ? getAutoRecruitMilestoneProgress(gameState) : 0;
            const cost = getUpgradeCost(item, currentLevel);
            const affordable = !isMaxed && !campaignGrantPending && canAfford(item.currency, cost);
            const effectRows = getUpgradeEffectRows(item, currentLevel);
            const visualTier = getVisualTier(currentLevel, item.maxLevel);
            const nextTierLevel = getNextVisualTierLevel(currentLevel, item.maxLevel) ?? item.maxLevel;

            return (
              <div
                key={item.id}
                data-upgrade-id={item.id}
                className="relative overflow-hidden bg-slate-900/75 border border-slate-800/80 rounded-xl p-3 hover:border-slate-600/80 hover:bg-slate-900/90 transition-all flex flex-col gap-2 shadow-sm shadow-black/20"
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

                <div className="rounded-lg border border-slate-800/70 bg-slate-950/35 px-2.5 py-2">
                  <div className="mb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.12em]">
                    <span className="text-slate-500">Tier visual {visualTier}/5</span>
                    <span className={isMaxed ? 'text-emerald-400' : 'text-slate-400'}>
                      {isMaxed ? 'Estrutura completa' : `Próximo marco: Nvl ${nextTierLevel}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 5 }).map((_, segment) => (
                      <div
                        key={segment}
                        className={`h-1.5 rounded-sm border ${segment < visualTier
                          ? 'border-emerald-500/50 bg-emerald-400/80 shadow-[0_0_7px_rgba(52,211,153,.18)]'
                          : 'border-slate-700/70 bg-slate-800/65'}`}
                      />
                    ))}
                  </div>
                </div>

                {campaignGrantPending && (
                  <div className="rounded-lg border border-pink-800/40 bg-pink-950/20 px-2.5 py-2 text-[11px]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-pink-200 font-semibold">Marco da rodada</span>
                      <span className="font-mono-numbers text-pink-300">{milestoneProgress}/{AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS}</span>
                    </div>
                    <div className="mt-1 text-slate-400">O Nível 1 é liberado gratuitamente ao neutralizar {AUTO_RECRUIT_MILESTONE_NEUTRALIZATIONS} rivais nesta rodada.</div>
                  </div>
                )}

                <div className="space-y-1 rounded-lg border border-emerald-900/30 bg-emerald-950/10 px-2.5 py-2">
                  {effectRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 text-[11px]">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-mono-numbers text-emerald-300 font-semibold">
                        {isMaxed ? row.current : `${row.current} → ${row.next}`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-1">
                  <div className="text-xs font-mono-numbers text-slate-300 flex items-center">
                    {campaignGrantPending ? (
                      <span className="text-pink-300 font-semibold">Nível 1: conquista da rodada</span>
                    ) : !isMaxed ? (
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

                  {!isMaxed && !campaignGrantPending && (
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
          })}
          </>
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

              <div className="mt-3 rounded-lg border border-amber-900/30 bg-slate-950/40 p-2.5 text-[11px] leading-relaxed text-slate-400">
                <strong className="text-slate-300">Preserva:</strong> talentos, emblemas, recordes e preferências.{' '}
                <strong className="text-slate-300">Reinicia:</strong> recursos e upgrades da rodada, mapa territorial liberado, neutralizações da rodada e tropas em campo.
                <div className="mt-1 text-amber-300/90">Respeito elegível nesta rodada: {gameState.runRespectEarned || 0}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Emblemas a Receber:</div>
                  <div className="text-xl font-bold font-mono-numbers text-amber-300">
                    +{potentialEmblems} 🛡️
                  </div>
                </div>

                <button
                  onClick={onPerformHegemony}
                  disabled={potentialEmblems <= 0}
                  className={`px-4 py-2 rounded-lg font-cinzel text-xs font-bold transition-all cursor-pointer ${
                    potentialEmblems > 0
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
                const isMaxed = currentLevel >= talent.maxLevel;
                const cost = getHegemonyTalentCost(talent, currentLevel);
                const affordable = gameState.hegemonyEmblems >= cost && !isMaxed;
                const effectRows = getHegemonyTalentEffectRows(talent, currentLevel);

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

                    <div className="space-y-1 rounded-lg border border-amber-900/30 bg-amber-950/10 px-2.5 py-2">
                      {effectRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-slate-400">{row.label}</span>
                          <span className="font-mono-numbers text-amber-300 font-semibold">
                            {isMaxed ? row.current : row.current + ' \u2192 ' + row.next}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <div className="text-xs font-mono-numbers text-amber-400">
                        {isMaxed ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Nível Máximo
                          </span>
                        ) : (
                          <>Custo: {cost} Emblemas</>
                        )}
                      </div>

                      {!isMaxed && (
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
                      )}
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
