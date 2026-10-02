# Status de Implementação — 0.4 Campo Legível

## 0.4A — Mundo e Câmera
- Mundo lógico fixo 1280×720 separado do viewport.
- Camera2D com screen↔world, pan limitado e zoom ancorado no cursor.
- Pointer Events e backing store HiDPI.
- Resize não altera posições do mundo.

## 0.4B — Fundação de Performance
- Loop RAF estabilizado contra movimento do mouse.
- Mouse/hover em refs.
- Cache do cenário estático e culling de viewport.
- Limites de partículas/textos e limpeza de renderers duplicados.

## 0.4C — Campo 2.5D
- `soldier34.ts` integrado ao renderer atual.
- Soldados em frente/costas/lateral e armas alinhadas à direção.
- Prédios com fachada/telhado elevados.
- Depth sorting entre prédios, obstáculos, loot, aliados e rivais.
- Fila de depth sorting pooled, sem closure por entidade/frame.
- Prédios táticos cacheados com `useMemo`.
## Otimização da Simulação
- Profiler dev exposto em `window.__GAME_PERF__`.
- Target caching com retarget escalonado e distâncias ao quadrado.
- Scavenging e separação rival em cadência reduzida.
- Protótipo de spatial grid foi medido, piorou o stress e foi removido.
- Projéteis mantêm colisão contínua, com broadphase AABB barato antes do teste exato.
- Web Audio reutiliza buffer de ruído e aplica voice budget/cooldown por categoria.
- Partículas passam a reduzir emissão sob carga, preservando eventos importantes.

## Resultado de Performance
Baseline antes do pacote final: 135 aliados + 32 rivais / 5x ≈ 26–29 FPS.

Gates finais:
- A — 15 aliados + 12 rivais / 1x: ≈ 56 FPS — PASS.
- B — 60 aliados + 24 rivais / 2x: ≈ 57 FPS — PASS.
- C — 135 aliados + 32 rivais / 5x: ≈ 56–57 FPS — PASS.
- Movimento contínuo do mouse permaneceu praticamente neutro no gate C.

## Regressão
- `npm run check`: PASS.
- Smoke limpo: 65/65 PASS.
- Captura visual 2.5D revisada após as otimizações.
- Spatial grid experimental não ficou no código final.
## Fechamento 0.4C
- Checkpoint pré-otimização: `gangster-incremental-checkpoint-04C-2_5D`.
- Revisão visual dirigida confirmou prédio/obstáculo/unidade/loot na ordem 2.5D.
- Moto, fuzileiro e boss continuam renderizando após o pacote de performance.
- O renderer 2.5D foi preservado; os ganhos vieram principalmente de simulação/áudio/partículas.

**Status: 0.4C 2.5D concluída.**

## Próxima etapa — 0.4D HUD & Legibilidade
- HP inteligente conforme estado/ameaça.
- Marcadores de classe e prioridade visual de elites/boss.
- Preview de convocação com custo/estado.
- Loot em screen-space.
- Objetivo compacto do território.
- Minimap funcional apoiado na Camera2D.
- Tutorial contextual e redução de ruído permanente do HUD.
## 0.4D — HUD & Legibilidade de Combate
- HP passou a viver em screen-space: aliados exibem barra quando feridos/hovered; elites/boss rivais mantêm prioridade visual.
- Rótulos persistentes de classe foram removidos. O campo mostra somente a facção (`CV`/`PCC`) quando necessário; classe permanece no sprite e tooltip.
- Boss mantém anel dourado próprio sem substituir a identidade da facção.
- Preview de convocação usa a mesma validação central de botão/teclado/canvas.
- Loot usa marcador mínimo em screen-space e expande valores somente no hover.
- Banner foi substituído por objetivo compacto com progresso de neutralizações.
- Minimapa tático interativo mostra aliados, rivais, hubs e viewport da Camera2D.
- Ajuda de controles é contextual, some após interação ou 6,5 s e pode ser reaberta pelo botão `?`.

## Gates 0.4D
- `npm run check`: PASS.
- Smoke funcional em perfil limpo: 65/65 PASS.
- Stress C — 135 aliados + 32 rivais / 5x: gate de 30 FPS PASS; profiler interno variou ~43–59 FPS.
- Hover limitado a 20 Hz e minimapa a 10 Hz; mouse deixou de causar queda específica de FPS.
- Revisão visual final confirmou HUD mais limpo: facção contextual, sem spam de classes.
- Checkpoint: `gangster-incremental-checkpoint-04D-clean`.

**Status: 0.4D concluída. 0.4E, 0.4F e 0.4G permanecem pendentes no roadmap original.**

## 0.4E — Identidade Visual & Leitura Espacial
- Um único renderer continua servindo todos os territórios; diferenças vivem em perfis visuais configuráveis.
- `territoryVisuals.ts` centraliza paleta, asfalto, vielas, meio-fio, iluminação e cor de destaque.
- `territoryLandmarks.ts` adiciona landmarks/props estáticos por distrito, sem alterar navegação ou regras de combate.
- T1: periferia/comunidade com fios, muros, becos e visual mais simples de entrada.
- T2: feira + linha férrea, plataforma, barracas e sinalização comercial.
- T3: oficinas/galpões, containers, tambores, pneus e marcação industrial.
- T4: reduto fortificado com barricadas, escadarias/muros decorativos e composição mais defensiva.
- T5: orla/condomínios com guaritas, jardins, muros limpos e linguagem residencial protegida.
- T6: Complexo Central com QG, eixo visual central, antena, perímetro e presença rival reforçada.
- Prédios táticos recebem nomes coerentes com o território atual, mantendo a mesma infraestrutura lógica.
- O minimapa herda uma versão simplificada da identidade espacial de cada distrito.
- A conquista por neutralizações preserva a identidade do distrito e troca apenas sinais de posse: bandeiras, grafites, tintas e minimapa.

## Gates 0.4E
- `npm run check`: PASS.
- Smoke funcional completo: 65/65 PASS.
- Stress extremo 135 aliados + 32 rivais / 5x: PASS acima do gate mínimo de 30 FPS.
- Profiler interno no stress final: ~56 FPS, render médio ~2,7 ms/frame.
- Galeria visual dos 6 territórios revisada após polimento.
- Comparação T3 em 79/80 vs 80/80 confirmou identidade industrial preservada + domínio visual da facção.
- Checkpoint pré-0.4E: `gangster-incremental-checkpoint-pre-04E`.

**Status: 0.4E concluída. 0.4F e 0.4G permanecem pendentes.**
## 0.4F — Layout & Foco no Campo
- O campo de batalha virou a área principal; o painel de evolução deixou de reservar espaço permanentemente.
- Desktop: painel de evolução recolhível, com 380 px quando aberto e 0 px quando fechado.
- Tablet: evolução vira drawer sobreposto; abrir o painel não reduz a largura do battlefield.
- Modo Foco compacta exclusivamente a navegação do painel de evolução: as cinco abas ficam em ícones, sem scroll horizontal; ResourceBar, SpellBar e batalha permanecem visíveis.
- Controles de Evolução/Foco foram posicionados abaixo dos controles nativos da câmera.
- Header responsivo usa labels compactos; abaixo de 768 px a marca visível passa a `GDF`.
- Labels escondidos permanecem semanticamente disponíveis via `sr-only` para acessibilidade/testes.
- ResourceBar permanece em uma única faixa horizontal em telas menores e esconde a scrollbar visual.
- Drawer mobile/tablet possui botão de fechamento explícito e backdrop clicável.

## Gates 0.4F
- `scripts/test-04f-layout.mjs`: 6/6 PASS.
- `npm run check`: PASS.
- Smoke funcional em layout compacto: 65/65 PASS.
- Stress extremo 135 aliados + 32 rivais / 5x: 50,2 FPS baseline / 42,6 FPS com mouse — PASS.
- Profiler interno final: ~48 FPS, render médio ~2,7 ms/frame.
- Capturas desktop aberto/fechado/foco de upgrades, tablet drawer e compacto revisadas.
- Checkpoint pré-0.4F: `gangster-incremental-checkpoint-pre-04F`.

**Status: 0.4F concluída. Resta 0.4G para o fechamento definitivo da série 0.4.**

## Ajuste 0.4F — Navegação completa dos upgrades (28/09/2026)
- Foco desativado: cinco categorias com nomes, em duas linhas (3 + 2), sem rolagem horizontal.
- Foco ativado: cinco ícones em uma linha; categoria selecionada preservada.
- Drawer em telas menores tem cabeçalho próprio com Foco e Fechar, sem sobrepor as abas.
- Painel recolhido usa inert/aria-hidden; controles Evolução/Foco informam seus estados.
- Escape dentro do painel fecha e devolve o foco ao botão Evolução.
- Build, TypeScript e verificações de fundação passaram.
- scripts/verify-evolution-layout.mjs: 69 verificações passaram em 1440, 1024, 900, 700, 390 e 320 px.
- Teste em contexto isolado do navegador; navegação, Foco, fechamento por Escape/botão/backdrop e manutenção do canvas verificados.
- Capturas desktop/celular revisadas em docs/screenshots/evolution-tabs-*.png.

## 0.4G — Instrumentação, testes e aceite (28/09/2026)
- Overlay de diagnóstico dev via F8, carregado somente em `import.meta.env.DEV`.
- Sessões automatizadas agora rodam em contexto isolado do Chrome, preservando a partida real.
- Aceite funcional dedicado: 19/19 PASS, incluindo câmera/minimapa, layouts 1440/1024/390/320, recrutamento, Auto-Convocação, save/import/reload e avanço territorial.
- Smoke acumulado: 66/66 PASS, sem erros de runtime.
- `npm run check`: TypeScript, fundação e build de produção PASS.
- Stress A — 15 aliados + 12 rivais / 1x: 54,7 FPS — PASS.
- Stress B — 60 aliados + 24 rivais / 2x: 56,5 FPS — PASS.
- Stress C — 135 aliados + 32 rivais / 5x + 60 loot: 48,4 FPS — PASS.
- Stress C com mouse + pan + zoom contínuos: 33,3 FPS — PASS sobre o gate mínimo de 30 FPS.
- Objetivo concluído em viewport móvel foi reposicionado para não cobrir os controles da câmera.
- Espaço não recruta quando o foco está em controles interativos da interface.
- Evidências gravadas em `docs/acceptance-04g-*.json` e `docs/screenshots/04g-*.png`.

**Status: série 0.4 — Campo Legível concluída e validada.**
