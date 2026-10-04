import React, { useState } from 'react';
import { BookOpen, Copy, Check, Download, Layers, ShieldAlert, Radio, Sparkles, Map, Crosshair } from 'lucide-react';

interface GddViewerProps {
  onClose?: () => void;
}

export const GddViewer: React.FC<GddViewerProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('visao');

  const handleCopyMarkdown = () => {
    const gddText = document.getElementById('gdd-content-body')?.innerText || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(gddText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleDownloadMarkdown = () => {
    const gddText = document.getElementById('gdd-content-body')?.innerText || '';
    const blob = new Blob([gddText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GDD_Guerra_de_Faccoes_PT_BR.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#080a10] text-slate-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-rose-500" />
          <div>
            <h1 className="font-cinzel text-lg font-bold text-slate-100">
              GDD Oficial: Guerra de Facções PT-BR
            </h1>
            <p className="text-xs text-slate-400">
              Documento de Design de Jogo Completo · Versão Tática Urbana 1.0 (Regeneração Completa)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer text-slate-300"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/40 hover:bg-rose-800/40 border border-rose-700/60 rounded-lg text-xs transition-colors cursor-pointer text-rose-200"
          >
            <Download className="w-4 h-4 text-rose-400" />
            <span>Baixar .MD</span>
          </button>
        </div>
      </div>

      {/* Main Dual Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <div className="w-64 border-r border-slate-800/80 bg-slate-950/40 p-4 space-y-1 overflow-y-auto text-xs shrink-0">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            Capítulos do Projeto
          </div>

          <button
            onClick={() => setActiveSection('visao')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === 'visao'
                ? 'bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/60'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Visão Geral & Guerrilha</span>
          </button>

          <button
            onClick={() => setActiveSection('economia')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === 'economia'
                ? 'bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/60'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>2. Economia Urbana ($ / Munição)</span>
          </button>

          <button
            onClick={() => setActiveSection('unidades')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === 'unidades'
                ? 'bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/60'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>3. Facções, Soldados & IA</span>
          </button>

          <button
            onClick={() => setActiveSection('ordens')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === 'ordens'
                ? 'bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/60'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>4. Ordens Táticas & Snipers</span>
          </button>

          <button
            onClick={() => setActiveSection('prestigio')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === 'prestigio'
                ? 'bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/60'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>5. Hegemonia do Cartel</span>
          </button>

          <button
            onClick={() => setActiveSection('territorios')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSection === 'territorios'
                ? 'bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/60'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>6. Mapa dos Territórios</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div id="gdd-content-body" className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl text-sm leading-relaxed">
          {activeSection === 'visao' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-cinzel font-bold text-rose-400">
                  1. Visão Geral do Jogo e Loop Principal (Core Loop)
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-rose-500 to-transparent mt-2" />
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="font-semibold text-slate-200">Resumo da Transformação Urbana:</div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  A mecânica central consagrada pelo Incremancer de simulação física de agentes em campo aberto foi totalmente recontextualizada para a **disputa de territórios entre gangues e facções rivais brasileiras** (como Comando Vermelho, Primeiro Comando da Capital, Falange Rubra e Bonde dos Aberto). 
                  Em vez de cadáveres reanimados por magia, você cooptar soldados inimigos caídos no asfalto com ordens de rádio, expande o poder de fogo do seu bonde e domina as bocas de fumo até a Hegemonia total da cidade.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-rose-200">Ciclo da Disputa Territorial:</h3>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-rose-300 space-y-1">
                  <div>1. Soldados e olheiros da facção rival invadem as esquinas do território</div>
                  <div>2. Seu bonde responde ao fogo / Comandante desfere tiros de sniper da laje</div>
                  <div>3. Rival é neutralizado ──► Cai vulnerável no solo por tempo limitado</div>
                  <div>4. Cooptar / Recrutar (Manual via rádio ou Automático via negociadores)</div>
                  <div>5. Coleta de Grana Suja ($), Caixas de Munição, Respeito Moral e Contatos</div>
                  <div>6. Compra de Coletes, Armas Pesadas, Barricadas e Informantes</div>
                  <div>7. Domínio do Morro ──► Proclamação da Hegemonia (Emblemas Permanentes)</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'economia' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-cinzel font-bold text-rose-400">
                  2. Economia Urbana Incremental (6 Camadas)
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-rose-500 to-transparent mt-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-emerald-400 text-xs">💵 GRANA SUJA (Substitui Sangue)</div>
                  <p className="text-slate-300 text-xs mt-1">
                    Malotes de dinheiro recolhidos de alvos abatidos. Utilizada no Arsenal para adquirir coletes balísticos, munição ponta oca, motos velozes e atendimento médico.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-amber-400 text-xs">🎯 CAIXAS DE MUNIÇÃO (Substitui Ossos)</div>
                  <p className="text-slate-300 text-xs mt-1">
                    Carregadores e caixas de fuzil apreendidas. Utilizadas nas Bocas para construir barricadas de aço, recrutar fuzileiros e expandir o limite máximo de soldados.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-purple-400 text-xs">🎖️ RESPEITO DAS RUAS (Substitui Almas)</div>
                  <p className="text-slate-300 text-xs mt-1">
                    A reputação moral gerada pela força de ocupação. Utilizada para aprimorar centrais de rádio, escutas de drones e potência dos snipers.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-pink-400 text-xs">📱 CONTATOS CHAVE (Substitui Cérebros)</div>
                  <p className="text-slate-300 text-xs mt-1">
                    Informantes cooptados no topo do cartel. Utilizados para automação (Cooptação automática de caídos e vigilância constante por snipers).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'unidades' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-cinzel font-bold text-rose-400">
                  3. Tropas Rivais e Soldados da Facção
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-rose-500 to-transparent mt-2" />
              </div>

              <div className="space-y-4">
                <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-900/80 px-4 py-2 font-semibold text-slate-200 border-b border-slate-800">
                    Facção Rival (Invasores)
                  </div>
                  <div className="p-4 space-y-3 divide-y divide-slate-800/60">
                    <div className="pt-2 first:pt-0">
                      <strong className="text-amber-400">Olheiro (Fogueteiro):</strong> Rápido e desarmado. Alerta os rivais e foge das patrulhas. Fácil de neutralizar e recrutar.
                    </div>
                    <div className="pt-2">
                      <strong className="text-sky-400">Soldado Pistoleiro (9mm):</strong> Tropa básica armada com pistolas automáticas. Avança em duplas.
                    </div>
                    <div className="pt-2">
                      <strong className="text-emerald-400">Fuzileiro de Laje (AR-15 / Fal):</strong> Atirador de longo alcance posicionado em pontos altos com alto dano de rajada.
                    </div>
                    <div className="pt-2">
                      <strong className="text-yellow-300">Gerente do Ponto:</strong> Comandante de boca que sustenta a moral dos rivais. Concede grande respeito e contatos.
                    </div>
                    <div className="pt-2">
                      <strong className="text-indigo-300">Segurança Pesado Encouraçado:</strong> Mini-chefe equipado com colete pesado e espingarda calibre 12.
                    </div>
                    <div className="pt-2">
                      <strong className="text-rose-400">Chefe de Área (Boss do Morro):</strong> Comanda a fortaleza rival com metralhadora e reforços contínuos.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ordens' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-cinzel font-bold text-rose-400">
                  4. Convocação Tática e Inteligência do Bonde
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-rose-500 to-transparent mt-2" />
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-semibold text-emerald-400 text-sm flex items-center justify-between">
                    <span>Convocar Soldado / Recruta</span>
                    <span className="text-emerald-300 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">10 Intel (Redutível)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Mecânica idêntica ao <strong>Incremancer</strong> adaptada para a guerra de facções: a cada 10 pontos de Inteligência (que regeneram continuamente via rádio comunicador), o jogador pode despachar instantaneamente um novo recruta armado para as vielas com <strong>1 clique em qualquer lugar do mapa</strong> ou pressionando a <strong>Barra de Espaço</strong>.
                  </p>
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-300 space-y-1 text-[11px]">
                    <div>• <strong>Sem dependência de abates:</strong> Não é necessário esperar ninguém tombar ou finalizar corpos para recrutar novos soldados.</div>
                    <div>• <strong>Avanço 100% Autônomo e Orgânico:</strong> Ao pisar em campo, cada soldado escaneia as vielas, localiza o rival mais próximo e engaja em tiroteio por conta própria.</div>
                    <div>• <strong>Auto-Convocação (Modo Idle):</strong> Ao desbloquear as conexões do Sindicato, a central envia reforços automaticamente para o campo de batalha.</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="font-semibold text-sky-400 text-sm">
                    HUD Limpo e Despoluído
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Foco total na experiência tática de exército/horda incremental: remoção de botões desnecessários de disparos manuais isolados (como sniper ou bazucas) para privilegiar a expansão do bando, o poder de fogo coletivo dos recrutas e a evolução dos territórios dominados.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'prestigio' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-cinzel font-bold text-amber-400">
                  5. Proclamação da Hegemonia (Prestígio)
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-amber-500 to-transparent mt-2" />
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs space-y-3">
                <p className="text-slate-300">
                  Ao consolidar o controle da área, você realiza a lavagem de capital para o sindicato internacional e recebe <strong>Emblemas de Hegemonia</strong> permanentes:
                </p>

                <div className="p-3 bg-black/40 rounded font-mono text-amber-300 text-xs">
                  Emblemas = ⌊ √(Respeito Total / 10) × Território Atual ⌋
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-200">Vantagens Permanentes do Cartel:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>Rota Internacional de Lucros:</strong> +50% permanente em toda a Grana recolhida.</li>
                  <li><strong>Satélites e Escutas:</strong> Inicia com rádio mais potente e regeneração veloz.</li>
                  <li><strong>Tropa de Elite Veterana:</strong> +25% de Vida e Dano permanente para seus homens.</li>
                  <li><strong>Bonde Inicial Armado:</strong> Começa com soldados de prontidão a cada novo território.</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'territorios' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-cinzel font-bold text-rose-400">
                  6. Territórios de Guerra Urbana
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-rose-500 to-transparent mt-2" />
              </div>

              <div className="mb-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                A campanha 0.6 transforma cada distrito em uma operação própria: doutrinas de reforço, marcos de contra-ataque, rotas externas e fases de chefe mudam conforme o território e o progresso da ofensiva.
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-emerald-400">Território 1: Beco dos Descalços (Periferia)</div>
                  <div className="text-slate-400 mt-1">Operação Varredura — 20 neutralizações. Pressão curta, vielas e resposta local na metade da ofensiva.</div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-amber-400">Território 2: Praça da Feira & Linha do Trem</div>
                  <div className="text-slate-400 mt-1">Operação Linha Cortada — 40 neutralizações. Flancos da feira e reserva da estação reagem em estágios.</div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-orange-400">Território 3: Avenida das Oficinas & Galpões</div>
                  <div className="text-slate-400 mt-1">Operação Pátio de Aço — 60 neutralizações. Corredores industriais e reserva blindada das oficinas.</div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-rose-400">Território 4: Morro Alto (Reduto Fortificado)</div>
                  <div className="text-slate-400 mt-1">Operação Quebra-Reduto — 80 neutralizações. Cerco progressivo com linha fortificada e pesados.</div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-purple-400">Território 5: Mansões da Orla & Condomínios</div>
                  <div className="text-slate-400 mt-1">Operação Cerco da Orla — 120 neutralizações. Segurança privada mobiliza flancos conforme o cerco fecha.</div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-slate-100">Território 6: Complexo Central (Quartel-General)</div>
                  <div className="text-slate-400 mt-1">Operação Decapitação — 200 neutralizações. Reserva de comando em três estágios e Chefe com fases de combate.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
