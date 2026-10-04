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

interface Props {
  gameState: GameState;
  selection: BaseCommandPreviewSelection | null;
  onChange: (selection: BaseCommandPreviewSelection | null) => void;
}

const stages: BaseVisualStage[] = [0, 1, 2, 3];
const groups: BaseUpgradeGroup[] = ['armory', 'boca', 'intel', 'sindicato'];
const tiers: BaseVisualTier[] = [0, 1, 2, 3, 4, 5];

export default function BaseCommandVisualPreview({ gameState, selection, onChange }: Props) {
  const keys = Object.keys(BASE_UPGRADE_VISUAL_SPECS) as BaseUpgradeVisualKey[];
  const [focusKey, setFocusKey] = useState<BaseUpgradeVisualKey>('fortification');
  const live = useMemo(() => getBaseCommandVisualProfile(gameState), [gameState]);
  if (!import.meta.env.DEV) return null;
  const active = selection !== null;

  return (
    <section className="rounded-xl border border-cyan-900/60 bg-cyan-950/15 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
          <Eye className="h-4 w-4" />
          <span>Preview Visual · Base de Comando</span>
        </div>
        <button
          onClick={() => onChange(null)}
          className={`flex items-center gap-1 rounded border px-2 py-1 ${active ? 'border-cyan-700 text-cyan-200' : 'border-emerald-700 bg-emerald-950/40 text-emerald-300'}`}
        >
          <RotateCcw className="h-3 w-3" /> Real
        </button>
      </div>
      <div className="text-[10px] leading-4 text-slate-400">
        Estado real: E{live.stage} · score {live.score} · maturidade {live.maturity.toFixed(2)} · {live.hegemonyHonors} Heg.
        <span className="ml-1 text-cyan-400">Preview não altera o save.</span>
      </div>

      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Casca macro</div>
        <div className="grid grid-cols-4 gap-1.5">
          {stages.map(stage => (
            <button key={stage} onClick={() => onChange({ kind: 'stage', stage })}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-300 hover:border-cyan-600 hover:text-cyan-200">
              E{stage}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Perfis extremos</div>
        <div className="flex flex-wrap gap-1.5">
          {groups.map(group => (
            <button key={group} onClick={() => onChange({ kind: 'branch', group })}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-300 hover:border-cyan-600">
              {BASE_UPGRADE_GROUP_LABELS[group]}
            </button>
          ))}
          <button onClick={() => onChange({ kind: 'max' })}
            className="rounded border border-amber-800/70 bg-amber-950/25 px-2 py-1 text-amber-300">Tudo máximo</button>
          <button onClick={() => onChange({ kind: 'honors', count: 5 })}
            className="rounded border border-amber-800/70 bg-amber-950/25 px-2 py-1 text-amber-300">5 Hegemonias</button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Inspeção isolada por upgrade</div>
        <select value={focusKey} onChange={e => setFocusKey(e.target.value as BaseUpgradeVisualKey)}
          className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-300">
          {keys.map(key => {
            const spec = BASE_UPGRADE_VISUAL_SPECS[key];
            return <option key={key} value={key}>{BASE_UPGRADE_GROUP_LABELS[spec.group]} · {spec.label}</option>;
          })}
        </select>
        <div className="grid grid-cols-6 gap-1">
          {tiers.map(tier => (
            <button key={tier} onClick={() => onChange({ kind: 'tier', key: focusKey, tier })}
              className="rounded border border-slate-700 bg-slate-900 py-1 text-slate-300 hover:border-cyan-600 hover:text-cyan-200">
              T{tier}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-slate-500">Tiers isolados usam a casca E2 para destacar somente o módulo selecionado.</div>
      </div>
    </section>
  );
}
