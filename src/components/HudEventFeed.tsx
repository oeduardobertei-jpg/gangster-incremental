import React, { useEffect } from 'react';
import { AlertTriangle, BadgeCheck, Bell, History, MapPinned, RadioTower, X } from 'lucide-react';

export type HudEventKind = 'territory' | 'warning' | 'reward' | 'command' | 'system';

export interface HudEvent {
  id: number;
  message: string;
  kind: HudEventKind;
  createdAt: number;
  count?: number;
}

interface Props {
  events: HudEvent[];
  history: HudEvent[];
  historyOpen: boolean;
  onDismiss: (id: number) => void;
  onCloseHistory: () => void;
}

const eventVisual = (kind: HudEventKind) => {
  if (kind === 'territory') return { label: 'TERRITÓRIO', Icon: MapPinned, tone: 'border-amber-400/55 text-amber-200 bg-amber-500/5' };
  if (kind === 'warning') return { label: 'ALERTA', Icon: AlertTriangle, tone: 'border-rose-500/55 text-rose-200 bg-rose-500/5' };
  if (kind === 'reward') return { label: 'PROGRESSO', Icon: BadgeCheck, tone: 'border-emerald-500/55 text-emerald-200 bg-emerald-500/5' };
  if (kind === 'command') return { label: 'COMANDO', Icon: RadioTower, tone: 'border-sky-500/55 text-sky-200 bg-sky-500/5' };
  return { label: 'SISTEMA', Icon: Bell, tone: 'border-slate-500/45 text-slate-300 bg-slate-500/5' };
};

const clock = (time: number) => new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const HudEventFeed: React.FC<Props> = ({ events, history, historyOpen, onDismiss, onCloseHistory }) => {
  useEffect(() => {
    const timers = events.map(event => window.setTimeout(
      () => onDismiss(event.id),
      event.kind === 'territory' ? 5000 : event.kind === 'warning' ? 3600 : 3000
    ));
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [events, onDismiss]);

  return (
    <>
      <div className={`pointer-events-none absolute bottom-14 left-3 z-40 w-[min(390px,calc(100%-24px))] flex-col gap-1.5 ${historyOpen ? 'hidden' : 'flex'}`}>
        {events.slice(-1).map(event => {
          const visual = eventVisual(event.kind);
          const Icon = visual.Icon;
          const important = event.kind === 'territory';
          return (
            <div key={event.id} className={`pointer-events-auto overflow-hidden rounded-lg border ${visual.tone} bg-[#080d14]/94 shadow-lg backdrop-blur-md ring-1 ring-white/[.035] animate-[hudEventIn_.16s_ease-out]`}>
              <div className={`flex items-center gap-2 ${important ? 'px-2.5 py-2' : 'px-2 py-1.5'}`}>
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[7px] font-black tracking-[.16em] opacity-75">
                    <span>{visual.label}</span><span className="text-slate-600">•</span><span className="text-slate-500">REDE LOCAL</span>
                  </div>
                  <div className={`${important ? 'mt-0.5 text-[11px]' : 'text-[10px]'} truncate font-semibold leading-snug text-slate-100`} title={event.message}>{event.message}</div>
                </div>
                {(event.count ?? 1) > 1 && <span className="shrink-0 rounded border border-current/20 bg-black/20 px-1.5 py-0.5 text-[8px] font-black">×{event.count}</span>}
                <button onClick={() => onDismiss(event.id)} className="shrink-0 rounded p-1 text-slate-600 transition-colors hover:bg-white/5 hover:text-slate-300" aria-label="Dispensar ocorrência"><X className="h-3 w-3" /></button>
              </div>
              <div className="h-px bg-[linear-gradient(90deg,#16a34a_0_30%,#eab308_30%_62%,#2563eb_62%_100%)] opacity-30" />
            </div>
          );
        })}
      </div>

      {historyOpen && (
        <div className="pointer-events-auto absolute right-3 top-[104px] z-50 w-[min(88vw,300px)] overflow-hidden rounded-xl border border-slate-700/80 bg-[#080d14]/97 shadow-2xl backdrop-blur-xl ring-1 ring-white/[.04]">
          <div className="flex items-center justify-between border-b border-slate-800/90 px-3 py-2">
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-amber-300" />
              <div><div className="text-[8px] font-black tracking-[.17em] text-amber-300">CENTRAL DE OPERAÇÕES</div><div className="text-[9px] text-slate-600">registro da sessão</div></div>
            </div>
            <button onClick={onCloseHistory} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200" aria-label="Fechar histórico"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="max-h-[min(34vh,280px)] overflow-y-auto">
            {history.length === 0 ? (
              <div className="px-4 py-7 text-center text-[10px] text-slate-600">Nenhuma ocorrência registrada nesta sessão.</div>
            ) : history.slice(0, 20).map(event => {
              const visual = eventVisual(event.kind);
              const Icon = visual.Icon;
              return (
                <div key={`history-${event.id}`} className="flex gap-2 border-b border-slate-800/55 px-3 py-2 last:border-0">
                  <Icon className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[7px] font-bold tracking-[.12em] text-slate-600">
                      <span>{visual.label}</span><span>·</span><span>{clock(event.createdAt)}</span>{(event.count ?? 1) > 1 && <span className="text-amber-400/80">×{event.count}</span>}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-slate-300">{event.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="h-[2px] bg-[linear-gradient(90deg,#15803d_0_34%,#ca8a04_34%_67%,#1d4ed8_67%_100%)] opacity-40" />
        </div>
      )}
    </>
  );
};
