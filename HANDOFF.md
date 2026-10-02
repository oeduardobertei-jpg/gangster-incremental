# HANDOFF — estado operacional

## Estado do produto
Base ativa: **0.9H — Brasil Orgânico / Favela Carioca — Gold Pass**.
A 0.9 é a nova fundação visual oficial: arquitetura orgânica, integração prédio-solo, rework T1/T4, revisão funcional T2/T3, contraste T5/T6 e atmosfera global. Próximo passo: playtest T1→T6 + feedback visual dirigido; ajustes pontuais entram como 0.9.1.

## Ambiente correto
- Projeto: `C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.8x2-recovered\gangster-incremental`
- Dev server atual: `http://127.0.0.1:3001/` (porta 3000 estava ocupada nesta sessão).
- Validar sempre pelo caminho recuperado 0.8x2 acima; não assumir que outra porta aponta para a base correta.

## Regras críticas preservadas
- Novo território começa com 0 aliados, exceto Hegemonia de tropa inicial.
- Guarnição inicial aumentada é rival.
- Dominação é in-place; tropas do jogador não somem nem o battlefield reinicia.
- Estruturas dominadas não geram novos rivais.
- Reforços pós-domínio entram por acessos externos coerentes.
- Nenhuma unidade deve atirar através de sólidos.

## Navegação atual
- T5 possui corredores laterais fisicamente transitáveis.
- T6 possui portais laterais reais no perímetro do QG.
- `pathing.ts` desvia de alvo bloqueado; `crowdFlow.ts` resolve congestionamento.
- A barreira artificial horizontal de 70% da altura foi removida.
## Campanha 0.6
- A: seis perfis de operação por território.
- B: papéis táticos diferenciados para tropas.
- C: doutrinas e rotas de reforço próprias.
- D: Gerentes como suporte e resposta de chefe.
- E: marcos territoriais de contra-ataque por progresso.
- F: Chefe com três fases, chamadas únicas e feedback visual.
- G: recompensas escaladas conforme ameaça; duração mantida para playtest.
- H: marcos persistidos no snapshot e GDD atualizado.

## Gates focais recentes
- Organic pathing / encoding / linha invisível: **6/6 PASS**.
- 0.6E milestones: **6/6 PASS**.
- 0.6F boss phases: **6/6 PASS**.
- 0.6G/H reward + persistence: **5/5 PASS**.
- TypeScript: PASS (~2–3 s nos últimos passes).
- Capturas T5/T6 recentes: 0 violações físicas e ~52/56 FPS no stress visual.

## Política de testes
Não rodar smoke/legados completos após cada microalteração.
Usar TypeScript + aceite focal; ampliar regressão apenas no fechamento de release relevante.

## Próximo passo recomendado
Fazer um playtest progressivo T1→T6 medindo duração, mortes, composição e picos de dificuldade. Só então ajustar `requiredTakes`, spawnRate/recompensas ou abrir a próxima grande versão.

## 0.7 — Rádio Urbana
- Rádio principal: **89.5 Brazilian Gangsta** (5 instrumentais via YouTube).
- Alternativas: **94.7 Rádio Concreto** (procedural/original) e **103.3 Lofi Funk Brazil** (vídeo único dividido em 26 capítulos).
- Player do header mantém estação, anterior/próxima, play/pause e volume.
- Brazilian Gangsta usa `youtubeTrackEngine.ts`; LOFI FUNK BR usa `youtubePlaylistEngine.ts`.
- Brazilian Gangsta é a estação padrão para perfis sem preferência salva.
- Gate focal: `acceptance-070d-gangsta.mjs` = **6/6 PASS**; TypeScript PASS.

## 0.8 — Mundo Vivo / Densidade Ambiental Integrada
- Regra artística: Brasil/comunidade/favela como contexto-base; evitar cidade urbana genérica.
- C: cleanup de fissuras/riscos procedurais sem função.
- D: grounding territorial para todas as TacticalBuildings.
- E: landmarks médios para leitura em zoom aberto.
- F: context clusters para PurposeProps; nenhum prop importante deve parecer jogado no chão.
- G: Brazilian Urban Identity + harmonização do tileset/materials.
- H: continuidade de bordas + grounding de cover obstacles + authored imperfection.
- T3: oficinas recebem óleo, mangueiras, marcas de pneu, concreto de serviço, pallets e metal envelhecido coerentes.
- T5: pedra portuguesa/paisagismo usados como assinatura brasileira sem dominar a leitura.
- Auditoria final: seis territórios capturados em 70% de zoom, sem erros de runtime.
- Capturas: `docs/screenshots/0.8-final/territory-1.png` ... `territory-6.png`.
- Status completo: `IMPLEMENTATION_STATUS_0.8.md`.
## 0.8I-L — Living Architecture / Final Composition
- Fachadas e telhados recebem detalhes determinísticos por distrito.
- Street-life microclusters ficam ancorados às construções; nenhum prop médio nasce isolado.
- Continuidade de material liga prédio e entorno: umidade, ferrugem, poeira, vegetação e marca técnica.
- Auditoria T1-T6 em 70% concluída sem erros de runtime; TypeScript PASS.

## 0.8M — Semantic Building Pass
- 42 estruturas nomeadas T1–T6 agora recebem identidade semântica baseada em função/nome.
- Renderer: `src/components/canvas/semanticBuildingRenderer.ts`.
- T2: Armazém/Estação/Cabine/Passarela foram ligados visualmente ao sistema ferroviário.
- T3–T6 receberam famílias funcionais mais legíveis (industrial, fortificado, residencial/segurança, QG técnico).
- `drawMaterialContinuity` e `drawStreetLifeClusters` foram reintegrados ao cache estático.
- Capturas finais 70%: `docs/screenshots/0.8m-semantic/territory-1.png` ... `territory-6.png`.
- TypeScript PASS. Revisão visual: `0.8m-semantic-buildings-v1`.
- Próximo foco sugerido: 0.8N — aprofundar silhuetas/fachadas e rooftop life sem perder a semântica conquistada.

## 0.8N/O — Bespoke Architecture + Access/Circulation
- `bespokeArchitectureRenderer.ts`: underlay/overlay arquitetônico por estrutura nomeada; não altera colisão.
- `accessCirculationRenderer.ts`: docas, plataformas, escadas, driveways, cancelas, pátios e acessos técnicos por função.
- T2 agora tem leitura ferroviária forte: Armazém, Estação, Cabine e Passarela participam visualmente dos trilhos/plataformas.
- T3 reforça oficina/galpão/serralheria/portaria/torre industrial; T5 reforça residência/condomínio/segurança; T6 hierarquia técnica do QG.
- Pipeline estático validado em código: Architecture Grounding → Material Continuity → Semantic Context → Functional Access → Street Life → Purpose Props.
- Capturas 70%: `docs/screenshots/0.8o-access/territory-1.png` ... `territory-6.png`.
- TypeScript PASS. Revisão ativa: `0.8o-access-circulation-v1`.
- Próximo foco: **0.8P — Ground Storytelling / Use Zones**, aprofundando desgaste e micro-histórias funcionais sem adicionar ruído procedural.

## 0.8P — Ground Storytelling / Use Zones
- `groundStoryRenderer.ts` adiciona desgaste contextual por uso da estrutura; nada de rachadura aleatória.
- Ordem estática atual: Architecture Grounding → Material Continuity → Semantic Context → Functional Access → Ground Story → Street Life → Purpose Props.
- T2/T3 apresentam o ganho mais evidente em carga, circulação ferroviária, oficina e pátio; T1/T4/T5/T6 permanecem mais sutis para preservar leitura macro.
- Auditoria T1–T6 em 70%: PASS.
- Capturas: `docs/screenshots/0.8p-ground-story/territory-1.png` ... `territory-6.png`.
- Revisão ativa: `0.8p-ground-story-v1`; TypeScript PASS.
- Próximo foco: **0.8Q — Environmental Story Clusters**, criando pequenas cenas coerentes por função sem transformar o mapa em coleção de props.

## Fechamento 0.8X.2
- Material Harmonization, Zoom LOD, Performance Budget e Gold Pass concluídos.
- T4 usa patamares laterais em vez de bandas globais; T5 perdeu a maior parte da leitura CAD; T6 mantém ordem militar sem guias de debug.
- Revisão ativa: `0.8x2-territory-composition-v1`.
- Capturas de referência: `docs/screenshots/0.8x2-final/` em 70% e 100%.
- Dev server ativo esperado: `http://localhost:3000`.
- Próxima decisão: playtest T1→T6 + desenho formal da 0.9.

## 0.8X.3 — HUD Event Feed + Brazilian Interface Pass
- Mensagens transitórias deixaram o header; navegação, rádio e velocidade não são mais empurrados por texto variável.
- `HudEventFeed.tsx` mostra até 3 ocorrências sobre o campo e mantém histórico de até 40 eventos da sessão.
- Sino no header abre/fecha a Central de Operações sem bloquear o combate.
- Textos atuais foram mantidos; a mudança foi de apresentação/hierarquia, conforme decisão do usuário.
- Header, ResourceBar e SpellBar receberam material visual urbano BR discreto (concreto/metal, sinalização e acentos verde-amarelo-azul).
- QA: TypeScript PASS; foundation 13/13 PASS; build Vite PASS; localhost 3001 HTTP 200.
- Próximo passo recomendado: playtest T1→T6, balance territorial e Combat Feel Pass.

## 0.9 — Brasil Orgânico / Favela Carioca
- Nova base visual oficial: `0.9h-brasil-organico-v1`.
- `cariocaIdentityRenderer.ts` introduz arquitetura orgânica e integração prédio-solo.
- T1: layout menos simétrico, casario composto, pátio comunitário e continuidade urbana nas bordas.
- T4: morro verticalizado, casario em níveis, contenções segmentadas e escadas conectivas.
- T2: feira/ferrovia reautorizada como sistema urbano; T3: pátio industrial funcional e menos CAD.
- T5: Orla explícita por faixa costeira/calçadão, vegetação e paleta residencial mais quente.
- T6: material brutalista/operacional neutro; cor da facção restrita a sinalização e domínio.
- Códigos de chão/blueprint da T6 removidos no Gold Pass.
- Câmera: `Mapa inteiro` com zoom mínimo 35%; fit observado em 83% na viewport de QA.
- Capturas finais: `docs/screenshots/0.9h-final/territory-1.png` ... `territory-6.png`.
- Status detalhado: `IMPLEMENTATION_STATUS_0.9.md`.
- QA: `npm run check` PASS; build Vite com 1744 módulos.
- Próximo passo: playtest T1→T6 e refinamentos 0.9.1 apenas onde screenshots/gameplay mostrarem necessidade real.


## 0.9.3 — Architectural Parity Pass (2026-10-01)

Revision: `0.9.3-architectural-parity-v1`

- Context architecture moved from static-map raster into the same live 2.5D depth queue as tactical buildings.
- T1–T6 contextual buildings now use full `buildingSkins` depth/quality at real camera zoom.
- Purpose architecture (stalls, booths, watch posts) is live/vector; service units use dedicated utility architecture.
- Roof/function logic is territory-, size- and material-aware; no random Barraquinha/gable treatment on generic T1 housing.
- T2/T3 context modules are real `building` solids, not cover pretending to be architecture.
- Minimum physical sizes increased for small support architecture while preserving overlap safety.
- Legacy baked T3 warehouses and their ghost colliders were retired.
- QA screenshots: `docs/screenshots/0.9.3-all/` (100%) and `docs/screenshots/0.9.3-zoom/` (250%).
- Overlap QA: T2/T3/T5/T6 = 0 unintended contacts; T1/T4 only intentional retaining-wall contacts.
- `npm run check` PASS; localhost `http://127.0.0.1:3001/` HTTP 200.

## 0.9.3B — Detail Density & Static Architecture Cleanup (2026-10-01)
- Revision: `0.9.3b-detail-density-v1`.
- Added `contextArchitectureFinishRenderer.ts`: contextual buildings receive the same perceived finish density as tactical buildings at 100%/250%.
- T1/T4: plinths, conduits, meters, facade patches and roof hardware; deterministic side variation avoids procedural repetition.
- T2: stall/box posts, counters and physical lighting; T3: utility panels, ducts and industrial roof service.
- T5: balcony/AC/planter finish; T6: cable trunks, vents and technical panels.
- Dead static-architecture imports were removed from `environmentRenderer.ts` to prevent legacy raster context from returning.
- QA screenshots: `docs/screenshots/0.9.3b/`, including dedicated T1/T4 250% closes.
- Overlap audit unchanged: T2/T3/T5/T6 = 0 unintended; T1/T4 only intentional retaining-wall contacts.
- `npm run check` PASS; build = 1744 modules; localhost 3001 = HTTP 200.
