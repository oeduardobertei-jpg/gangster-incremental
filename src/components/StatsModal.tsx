import React from 'react';
import { GameStats } from '../types/game';
import { Trophy, BarChart3, Clock, DollarSign, Crosshair, Award, Users, Shield, X } from 'lucide-react';

interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (hours > 0) return `${hours}h ${mins}m ${s}s`;
    return `${mins}m ${s}s`;
  };

  const achievements = [
    { title: 'Primeiro Recruta', desc: 'Cooptar seu primeiro soldado rival', done: stats.totalAlliesRecruited >= 1 },
    { title: 'Dono do Pedaço', desc: 'Neutralizar 50 membros rivais', done: stats.totalRivalsNeutralized >= 50 },
    { title: 'Malote Pesado', desc: 'Acumular $1.000 em Grana Suja', done: stats.totalCashEarned >= 1000 },
    { title: 'Carga de Fuzil', desc: 'Apreender 100 Caixas de Munição', done: stats.totalAmmoSeized >= 100 },
    { title: 'Moral Inabalável', desc: 'Conquistar 200 de Respeito das Ruas', done: stats.totalRespectEarned >= 200 },
    { title: 'Escutas Clandestinas', desc: 'Estabelecer 25 Contatos Chave', done: stats.totalContactsAcquired >= 25 },
    { title: 'Hegemonia do Cartel', desc: 'Proclamar a Hegemonia ao menos 1 vez', done: stats.hegemonyRituals >= 1 },
    { title: 'Domínio do Morro Alto', desc: 'Alcançar o Território 4 ou superior', done: stats.highestTerritoryReached >= 4 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151f] border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-500" />
            <h2 className="font-cinzel text-lg font-bold text-slate-100">Prontuário & Conquistas de Guerra</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Crosshair className="w-4 h-4 text-rose-500" />
                <span>Rivais Batidos</span>
              </div>
              <div className="text-base font-bold font-mono-numbers text-slate-100">
                {stats.totalRivalsNeutralized.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Recrutas Ganhos</span>
              </div>
              <div className="text-base font-bold font-mono-numbers text-slate-100">
                {stats.totalAlliesRecruited.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Grana Acumulada</span>
              </div>
              <div className="text-base font-bold font-mono-numbers text-emerald-300">
                ${Math.floor(stats.totalCashEarned).toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Crosshair className="w-4 h-4 text-amber-400" />
                <span>Munição Apreendida</span>
              </div>
              <div className="text-base font-bold font-mono-numbers text-slate-200">
                {stats.totalAmmoSeized.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Respeito Moral</span>
              </div>
              <div className="text-base font-bold font-mono-numbers text-purple-300">
                {stats.totalRespectEarned.toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Shield className="w-4 h-4 text-pink-400" />
                <span>Contatos Obtidos</span>
              </div>
              <div className="text-base font-bold font-mono-numbers text-pink-300">
                {stats.totalContactsAcquired.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Tempo de Disputa nas Ruas:</span>
            </div>
            <span className="font-mono-numbers font-semibold text-slate-100">
              {formatTime(stats.timePlayedSeconds)}
            </span>
          </div>

          {/* Conquistas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Conquistas do Território</span>
            </div>

            <div className="space-y-2">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    ach.done
                      ? 'bg-amber-950/20 border-amber-600/40 text-slate-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div>
                    <div className={`font-semibold ${ach.done ? 'text-amber-300' : 'text-slate-400'}`}>
                      {ach.title}
                    </div>
                    <div className="text-[11px] text-slate-400">{ach.desc}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    ach.done ? 'bg-amber-900/40 text-amber-300 border border-amber-700/60' : 'bg-slate-800 text-slate-600'
                  }`}>
                    {ach.done ? 'Conquistada' : 'Bloqueada'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
