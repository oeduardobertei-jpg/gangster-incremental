import { useEffect, useState } from 'react';
import type { GamePerformance } from './gamePerformance';

export default function PerformanceOverlay() {
  const [visible, setVisible] = useState(false);
  const [sample, setSample] = useState<GamePerformance>();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.repeat || target instanceof HTMLElement &&
          (target.isContentEditable || target.closest('input, textarea, select'))) return;
      if (event.code === 'F8' && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setVisible(value => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (!visible) return;
    const update = () => setSample(window.__GAME_PERF__);
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [visible]);
  if (!visible) return null;
  const n = (value: number | undefined, digits = 1) => value?.toFixed(digits) ?? '—';
  return (
    <aside data-testid="performance-overlay" aria-label="Diagnóstico de desenvolvimento"
      className="pointer-events-none absolute left-3 top-28 z-40 max-w-[calc(100%-24px)] rounded-lg border border-sky-500/50 bg-slate-950/95 p-3 font-mono text-[11px] leading-5 text-slate-200 shadow-xl">
      <div className="font-bold text-sky-300">DIAGNÓSTICO · F8 para ocultar</div>
      <div>FPS {n(sample?.fps)} · quadro {n(sample?.avgFrameMs)} ms · p95 {n(sample?.p95FrameMs)} ms</div>
      <div>Simulação {n(sample?.avgSimulationMs, 2)} ms · desenho {n(sample?.avgRenderMs, 2)} ms</div>
      <div>Passos/quadro {n(sample?.avgSteps, 2)} · velocidade {sample?.speed ?? '—'}x</div>
      <div>Aliados {sample?.allies ?? '—'} · rivais {sample?.rivals ?? '—'}</div>
      <div>Projéteis {sample?.bullets ?? '—'} · partículas {sample?.particles ?? '—'} · loot {sample?.loot ?? '—'}</div>
      <div>Sólidos {sample?.worldColliders ?? '—'} · invasões físicas {sample?.solidWorldViolations ?? '—'}</div>
      <div>Anti-stuck {sample?.unstuckTriggers ?? '—'} acionamentos · ativos {sample?.unstuckActive ?? '—'} · pressão {sample?.stuckPressure ?? '—'}</div>
      <div>Zoom {n(sample ? sample.camera.zoom * 100 : undefined, 0)}% · câmera {n(sample?.camera.centerX, 0)}, {n(sample?.camera.centerY, 0)}</div>
      <div>Tela {n(sample?.viewport.width, 0)} × {n(sample?.viewport.height, 0)} · DPR {n(sample?.viewport.dpr)}</div>
    </aside>
  );
}
