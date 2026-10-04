# HANDOFF — estado operacional

## Estado do produto
Base ativa: **1.1.0 GOLD — Definitive Polish T1–T6**.
A 1.1.0 preserva a campanha territorial da 1.0 e reconstrói sua apresentação: T1→T6 reautorizados, movimento de massa, Câmera 2.0, HUD 2.0, combate audiovisual, pipeline de render e performance estabilizados. Gold Gate final: **32/32 suites RC + 66/66 smoke**, exit code 0.

## Gate 1.1 GOLD
- `npm run qa:gold` é o gate canônico de release.
- Anchors T1–T6: **43/43 PASS**.
- Campanha transversal 1.1P: **37/37 PASS**.
- T5/T6 polish: **15/15 + 15/15 PASS**.
- Performance 1.1J: **16/16 PASS**; LOD de massa preserva especiais/chefes.
- RC: **32/32**; smoke UI/save/Hegemonia: **66/66**.
- Bundle final: **243,3 KiB JS gzip / 275 KiB**; CSS **13,1 KiB / 20 KiB**.

## Ambiente correto
- Working tree de release: `C:\Users\Eduardo Bertei\Downloads\gangster-incremental-1.0.0-github`.
- Branch de desenvolvimento: `dev/1.1-definitive-polish`.
- Dev server de validação 1.1: `http://127.0.0.1:3001/`.
- Chrome de QA isolado: perfil descartável `C:\Temp\chrome-debug-9237`, CDP `9237`; o runner o reinicia entre blocos pesados.

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
Usar a Base de Comando como referência do sistema incremental. A próxima construção deve entrar pelo framework documentado, com preview e QA próprios; balance T1→T6 continua como trilha paralela de gameplay.

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

## 0.9.6M — T1 Final Integration Candidate (2026-10-02)
- `t1GroundReauthorRenderer.ts` é a fonte de verdade do chão T1.
- Piso legado, paths genéricos, trench/drenagem longa, pads duplicados e ownership no chão permanecem removidos.
- Mural físico de entrada troca PCC/CV in-place com domínio.
- Props sólidos participam do depth-sort 2.5D; 0 overlaps acidentais no T1.
- Passe L–M adiciona material bridge, threshold life, detalhe fino periférico e jardins domésticos sem ocupar o corredor central.
- QA: `npm run check` PASS; build 1751 módulos; overlap T1 = 7 contatos de contenção intencionais / 0 acidentais.
- Revisão: `0.9.6m-t1-final-integration-v1`.
- Próximo passo: aprovação visual e rollout do padrão; Layer entra como reforço quando houver Creative Units.

## 0.9.8D — T2 Ferrovia Integrada (2026-10-02)
- Renderer autoral: `t2RailGroundReauthorRenderer.ts`.
- Segunda ferrovia, grids/textos e ground-zones legados retirados do T2.
- Armazém, estação, cabine, passarela e estruturas de feira passaram a ancorar no mesmo chão.
- QA: `npm run check` PASS; 1752 módulos; T2 = 0 overlaps.
- Capturas 100%/250%: `docs/screenshots/t2-098/`.
- Revision: `0.9.8d-t2-integrated-rail-v1`.
## 0.9.10A — T1 Master Visual Foundation (2026-10-03)
- Style Bible: `STYLE_BIBLE_T1.md`.
- Sistemas: `premiumUrbanProfiles.ts`, `premiumUrbanSystem.ts`, `premiumUrbanFabricSystem.ts`.
- Tecido urbano premium é visual-only e não altera pathfinding/collision.
- QA: `npm run check` PASS; 1756 módulos; T1 = 0 overlaps.
- Estado: histórico/inativo; hooks do Master Visual removidos do pipeline ativo.


## 0.9.10N–P — Incremental Command Building Framework (2026-10-03)
- Revision: `0.9.10p-incremental-command-framework-v1`.
- A Base de Comando evolui por score agregado, estágios E0–E3 e maturidade contínua.
- Silhueta cresce de núcleo compacto para HQ mais larga/alta; E2 adiciona alas e E3 coroamento.
- 12 upgrades possuem módulos visuais próprios; tiers 0–5 usam a mesma régua na UI e no renderer.
- Hegemonias adicionam marcas de prestígio sem substituir a evolução normal.
- Preview DEV: E0–E3, árvores extremas, tier isolado, Tudo Máximo e Hegemonias; não altera save.
- Motor genérico: `src/rules/incrementalBuildingVisuals.ts`.
- Guia reutilizável: `docs/INCREMENTAL_BUILDING_VISUAL_FRAMEWORK.md`.
- QA: `npm run check` PASS; mundo 20/20; spawn 7/7; layout 69/69; preview 7/7; promoções E1–E3 10/10.
- Galeria: `docs/screenshots/base-incremental-0910NO/`.


## 0.9.11 — Core Loop Lock (2026-10-03)
- Conquista territorial física é o fluxo canônico em T1–T6: pressão + 6 posições + resistência final + domínio.
- Requisitos pertencem ao próprio território: T1 20, T2 40, T3 60, T4 80, T5 120, T6 200.
- HUD mostra Pressão, Posições, Alvo, Consolidar Pressão, Última Resistência e Dominado.
- Hubs capturados ou contestados (>5%) silenciam reforço local; pós-domínio, pressão rival continua somente pelo perímetro externo.
- Aliados avançam autonomamente para posições não capturadas, priorizando ameaças próximas.
- Saves antigos da era contador-only migram para captura física legítima; progresso parcial persiste em autosave/reload.
- T6: Chefe do Morro é exclusivo da Última Resistência; não existe no opening garrison, rivalPool, milestones normais ou reservas.
- Performance: captura em tick de baixa frequência + cache de busca; stress T5/T6 voltou acima do gate de 30 FPS.
- QA: campanha 24/24, flow 10/10, pathing/encoding 6/6, core 7/7, matriz T1–T6 14/14, persistência 5/5.
- Playtest natural final: T1→T2 em ~53 s, ~36 neutralizações, 6/6 posições em ~25 s, 0 erros de runtime.
- npm run check: TypeScript PASS, foundation PASS, build Vite PASS.

## 0.9.12 — Finale de Campanha / Domínio Total (2026-10-03)
- T6 fisicamente dominado agora dispara o fechamento explícito da campanha T1–T6.
- Novo `CampaignVictoryModal.tsx`: DOMÍNIO TOTAL, resumo da rodada, 6/6 e preview da recompensa de Hegemonia.
- O finale usa o mesmo pause/resume seguro dos outros modais; `Continuar no mapa` restaura exatamente a velocidade anterior.
- `Preparar Hegemonia` abre Evolução, mas não reseta a rodada; `performHegemony` continua como única transação de prestígio.
- Vitória deriva do snapshot legítimo `operationPhase='dominated'`, portanto também reaparece ao restaurar um T6 já vencido.
- QA: finale 8/8 PASS; regressão 0.9.11 7/7 PASS; `npm run check` PASS; build 1759 módulos.
- Status detalhado: `IMPLEMENTATION_STATUS_0.9.12.md`.
- Próximo foco: **0.9.13 — Release Candidate Audit**, corrigindo somente bloqueadores reproduzíveis antes da 1.0 RC.
