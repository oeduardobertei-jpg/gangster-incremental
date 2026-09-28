import React, { useState } from 'react';
import { GameState } from '../types/game';
import { Settings, Volume2, VolumeX, Save, RotateCcw, Wrench, X, Copy, Check, Upload } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface SettingsModalProps {
  gameState: GameState;
  onUpdateSettings: (newSettings: Partial<GameState>) => void;
  onSaveGame: () => void;
  onExportSave: () => string;
  onImportSave: (saveData: string) => boolean;
  onHardReset: () => void;
  onDevAddResources: (res: { cash?: number; ammo?: number; respect?: number; contacts?: number; emblems?: number; intel?: number }) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  gameState,
  onUpdateSettings,
  onSaveGame,
  onExportSave,
  onImportSave,
  onHardReset,
  onDevAddResources,
  onClose
}) => {
  const [saveString, setSaveString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const handleGenerateExport = () => {
    const data = onExportSave();
    setSaveString(data);
  };

  const handleCopySave = () => {
    if (saveString && navigator.clipboard) {
      navigator.clipboard.writeText(saveString).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleExecuteImport = () => {
    if (!saveString.trim()) {
      setImportStatus('Insira o código de save acima.');
      return;
    }
    const success = onImportSave(saveString.trim());
    if (success) {
      setImportStatus('Save carregado com sucesso!');
      setTimeout(() => setImportStatus(''), 3000);
    } else {
      setImportStatus('Erro: Código de save inválido.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151f] border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-rose-500" />
            <h2 className="font-cinzel text-lg font-bold text-slate-100">Configurações & Painel de Controle</h2>
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
          {/* Velocidade da Batalha */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Velocidade da Batalha</label>
            <div className="flex items-center gap-2">
              {[
                { label: 'Pausar', val: 0 },
                { label: '1x Normal', val: 1 },
                { label: '2x Rápido', val: 2 },
                { label: '5x Turbinado', val: 5 }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => onUpdateSettings({ gameSpeed: opt.val })}
                  className={`flex-1 py-2 rounded-lg border font-semibold transition-all cursor-pointer ${
                    gameState.gameSpeed === opt.val
                      ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Áudio e Efeitos */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Sons de Disparos & Rádio</span>
              <button
                onClick={() => {
                  const newMuted = !gameState.soundMuted;
                  soundEngine.setMuted(newMuted);
                  onUpdateSettings({ soundMuted: newMuted });
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                {gameState.soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span>{gameState.soundMuted ? 'Mudo' : 'Ativo'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 w-14">Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={gameState.soundVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  soundEngine.setVolume(val);
                  onUpdateSettings({ soundVolume: val });
                }}
                className="flex-1 accent-rose-500"
              />
              <span className="font-mono-numbers text-slate-400 w-10 text-right">
                {Math.round(gameState.soundVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Opções Gráficas */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <span className="font-semibold text-slate-300 block">Opções Visuais</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={gameState.showDamageNumbers}
                  onChange={(e) => onUpdateSettings({ showDamageNumbers: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                />
                <span>Exibir números de dano</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={gameState.showCombatSplatters}
                  onChange={(e) => onUpdateSettings({ showCombatSplatters: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                />
                <span>Exibir marcas de tiros e grafites</span>
              </label>
            </div>
          </div>

          {/* Salvar / Importar */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <span className="font-semibold text-slate-300 block">Salvar / Backup / Exportar</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onSaveGame}
                className="flex items-center justify-center gap-1.5 flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Salvar Agora</span>
              </button>

              <button
                onClick={handleGenerateExport}
                className="flex items-center justify-center gap-1.5 flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-rose-400" />
                <span>Gerar Código</span>
              </button>
            </div>

            <textarea
              value={saveString}
              onChange={(e) => setSaveString(e.target.value)}
              placeholder="Cole o código do seu save aqui para restaurar seu império..."
              className="w-full h-20 p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 resize-none focus:outline-none focus:border-rose-500"
            />

            {saveString && (
              <div className="flex items-center justify-between">
                <button
                  onClick={handleCopySave}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado para área de transferência!' : 'Copiar Código'}</span>
                </button>

                <button
                  onClick={handleExecuteImport}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium cursor-pointer"
                >
                  Importar e Carregar
                </button>
              </div>
            )}

            {importStatus && (
              <div className="text-rose-400 text-[11px] font-medium">{importStatus}</div>
            )}
          </div>

          {/* PAINEL DEV / TESTE RÁPIDO */}
          <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <Wrench className="w-4 h-4" />
              <span>Caixa de Ferramentas do Comandante (Modo Teste)</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Adicione suprimentos instantaneamente para testar qualquer arsenal ou território:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onDevAddResources({ cash: 1000 })}
                className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 rounded cursor-pointer"
              >
                +$1.000 Grana 💵
              </button>
              <button
                onClick={() => onDevAddResources({ ammo: 100 })}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded cursor-pointer"
              >
                +100 Munições 🎯
              </button>
              <button
                onClick={() => onDevAddResources({ respect: 100 })}
                className="px-2.5 py-1 bg-purple-950/60 hover:bg-purple-900 border border-purple-800/60 text-purple-300 rounded cursor-pointer"
              >
                +100 Respeito 🎖️
              </button>
              <button
                onClick={() => onDevAddResources({ contacts: 20 })}
                className="px-2.5 py-1 bg-pink-950/60 hover:bg-pink-900 border border-pink-800/60 text-pink-300 rounded cursor-pointer"
              >
                +20 Contatos 📱
              </button>
              <button
                onClick={() => onDevAddResources({ emblems: 5 })}
                className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/60 text-amber-300 rounded cursor-pointer"
              >
                +5 Hegemonias 🛡️
              </button>
              <button
                onClick={() => onDevAddResources({ intel: 100 })}
                className="px-2.5 py-1 bg-sky-950/60 hover:bg-sky-900 border border-sky-800/60 text-sky-300 rounded cursor-pointer"
              >
                Encher Rádio 📻
              </button>
            </div>
          </div>

          {/* Hard Reset */}
          <div className="pt-3 border-t border-slate-800/80">
            {!confirmReset ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Apagar todos os dados e reiniciar:</span>
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 rounded-lg cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Total</span>
                </button>
              </div>
            ) : (
              <div className="bg-rose-950/40 border border-rose-600/70 rounded-xl p-3.5 flex flex-col gap-2.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Confirmar Reset Total do Jogo?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Atenção: todo o progresso, império, dinheiro, melhorias e conquistas de territórios serão permanentemente apagados e reiniciados do zero.
                </p>
                <div className="flex items-center gap-2 pt-1 justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onHardReset();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-lg shadow-rose-900/50 transition-colors"
                  >
                    Sim, Apagar Tudo e Reiniciar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
