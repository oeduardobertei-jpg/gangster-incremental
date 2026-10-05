import { useMemo, useState } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import type { GameState } from '../../types/game';
import {
  BASE_UPGRADE_GROUP_LABELS,
  BASE_UPGRADE_VISUAL_SPECS,
  getBaseCommandVisualProfile,
  type BaseCommandPreviewSelection,
  type BaseUpgradeGroup,
  type BaseUpgradeVisualKey,
  type BaseVisualStage,
  type BaseVisualTier
} from '../../rules/baseCommandVisualProgression';
import {
  SUPPORT_POINT_UPGRADE_VISUAL_SPECS,
  getSupportPointVisualProfile,
  type SupportPointVisualKey,
  type SupportPointVisualStage,
  type SupportPointVisualTier
} from '../../rules/supportPointVisualProgression';

interface Props {
  gameState: GameState;
  selection: BaseCommandPreviewSelection | null;
  onChange: (selection: BaseCommandPreviewSelection | null) => void;
}

const baseStages: BaseVisualStage[] = [0, 1, 2, 3];
const supportStages: SupportPointVisualStage[] = [0, 1, 2, 3];
const groups: BaseUpgradeGroup[] = ['armory', 'boca', 'intel', 'sindicato'];
const baseTiers: BaseVisualTier[] = [0, 1, 2, 3, 4, 5];
const supportTiers: SupportPointVisualTier[] = [0, 1, 2, 3, 4, 5];

export default function BaseCommandVisualPreview({ gameState, selection, onChange }: Props) {
  const baseKeys = Object.keys(BASE_UPGRADE_VISUAL_SPECS) as BaseUpgradeVisualKey[];
  const supportKeys = Object.keys(SUPPORT_POINT_UPGRADE_VISUAL_SPECS) as SupportPointVisualKey[];
  const [focusKey, setFocusKey] = useState<BaseUpgradeVisualKey>('fortification');
  const [supportFocusKey, setSupportFocusKey] = useState<SupportPointVisualKey>('fortification');
  const live = useMemo(() => getBaseCommandVisualProfile(gameState), [gameState]);
  const liveSupport = useMemo(() => getSupportPointVisualProfile(gameState), [gameState]);
  if (!import.meta.env.DEV) return null;
  const active = selection !== null;

  return (
    <section className="rounded-xl border border-cyan-900/60 bg-cyan-950/15 p-3 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
          <Eye className="h-4 w-4" />
          <span>Preview Visual · Construções Incrementais</span>
        </div>
        <button onClick={() => onChange(null)}
          className={`flex items-center gap-1 rounded border px-2 py-1 ${active ? 'border-cyan-700 text-cyan-200' : 'border-emerald-700 bg-emerald-950/40 text-emerald-300'}`}>
          <RotateCcw className="h-3 w-3" /> Real
        </button>
      </div>
      <div className="text-[10px] leading-4 text-slate-400">
        Base: E{live.stage} · {live.score} pts · Apoio: E{liveSupport.stage} · {liveSupport.score} pts.
        <span className="ml-1 text-cyan-400">Preview não altera o save.</span>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-800/80 bg-slate-950/30 p-2.5">
        <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Base de Comando</div>
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Casca macro</div>
          <div className="grid grid-cols-4 gap-1.5">
            {baseStages.map(stage => <button key={stage} onClick={() => onChange({ kind:'stage', stage })}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-300 hover:border-cyan-600 hover:text-cyan-200">E{stage}</button>)}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {groups.map(group => <button key={group} onClick={() => onChange({ kind:'branch', group })}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-300 hover:border-cyan-600">{BASE_UPGRADE_GROUP_LABELS[group]}</button>)}
          <button onClick={() => onChange({ kind:'max' })} className="rounded border border-amber-800/70 bg-amber-950/25 px-2 py-1 text-amber-300">Tudo máximo</button>
          <button onClick={() => onChange({ kind:'honors', count:5 })} className="rounded border border-amber-800/70 bg-amber-950/25 px-2 py-1 text-amber-300">5 Hegemonias</button>
        </div>
        <select value={focusKey} onChange={e => setFocusKey(e.target.value as BaseUpgradeVisualKey)} className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-300">
          {baseKeys.map(key => { const spec=BASE_UPGRADE_VISUAL_SPECS[key]; return <option key={key} value={key}>{BASE_UPGRADE_GROUP_LABELS[spec.group]} · {spec.label}</option>; })}
        </select>
        <div className="grid grid-cols-6 gap-1">
          {baseTiers.map(tier => <button key={tier} onClick={() => onChange({ kind:'tier', key:focusKey, tier })}
            className="rounded border border-slate-700 bg-slate-900 py-1 text-slate-300 hover:border-cyan-600 hover:text-cyan-200">T{tier}</button>)}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-amber-900/45 bg-amber-950/10 p-2.5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-300">Ponto de Apoio</div>
          <div className="mt-1 text-[10px] text-slate-500">Fortificação, barricadas, fuzileiros e logística ganham uma construção própria fora do corredor de spawn.</div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {supportStages.map(stage => <button key={stage} onClick={() => onChange({ kind:'support-stage', stage })}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-300 hover:border-amber-600 hover:text-amber-200">E{stage}</button>)}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onChange({ kind:'support-max' })} className="rounded border border-amber-800/70 bg-amber-950/25 px-2 py-1 text-amber-300">Tudo máximo</button>
        </div>
        <select value={supportFocusKey} onChange={e => setSupportFocusKey(e.target.value as SupportPointVisualKey)} className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-300">
          {supportKeys.map(key => <option key={key} value={key}>{SUPPORT_POINT_UPGRADE_VISUAL_SPECS[key].label}</option>)}
        </select>
        <div className="grid grid-cols-6 gap-1">
          {supportTiers.map(tier => <button key={tier} onClick={() => onChange({ kind:'support-tier', key:supportFocusKey, tier })}
            className="rounded border border-slate-700 bg-slate-900 py-1 text-slate-300 hover:border-amber-600 hover:text-amber-200">T{tier}</button>)}
        </div>
      </div>
    </section>
  );
}
