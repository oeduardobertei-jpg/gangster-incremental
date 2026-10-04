# Status — 0.9.1 Composição Física Unificada

Estado: **EM IMPLEMENTAÇÃO**
Revisão visual: `0.9.1f-final-polish-v1`

## Concluído nesta tranche
- Plano oficial global T1–T6 criado.
- Prototype Purge iniciado.
- Stencils de authoring do `worldDensityRenderer` desativados.
- Labels de chão como RUA, LAJE, PÁTIO, PLATAFORMA, SETOR etc. não renderizam mais.
- Placeholder `LUZ` removido do service unit de T1.
- Labels de ground-story como BECO/LAJE/NÍVEL/ACESSO removidos.
- Quadra comunitária de T1 refeita sem aparência de wireframe tracejado.
- Muro de facção de T1 redesenhado como concreto + pichação dinâmica de domínio.
- Novo `unifiedTerritoryComposer.ts` integrado ao pipeline estático.
- Composer possui contexto físico específico para T1–T6.
- Casas decorativas isoladas antigas de T1/T4 foram desligadas.

## Próxima tranche
- Aumentar clusters de suporte para virarem massas urbanas contínuas.
- T4 primeiro como laboratório de morro vertical.
- T1 em seguida para consolidar periferia/comunidade.
- Propagar o padrão para T2/T3/T5/T6.
- Revalidar física/pathing e remover qualquer duplicação dos renderers legados.

## 0.9.1B — Urban Mass Clusters + Physical Embedding
Status: **IMPLEMENTADO / EM AUDITORIA VISUAL**

- `unifiedTerritoryComposer.ts` agora é fonte comum de desenho e sólidos físicos.
- T1/T4: duas massas anexas + contenção física por prédio tático, além de clusters setoriais.
- T2: fileiras físicas de boxes e suportes da feira.
- T3: módulos físicos de serviço/oficina.
- T5: alas residenciais e apoios físicos integrados aos edifícios.
- T6: módulos operacionais físicos junto ao complexo.
- Colliders legados das casas isoladas antigas de T1/T4 foram removidos.
- Faixas de casas soltas nas bordas de T1/T4 foram aposentadas.
- Retângulo abstrato central de domínio foi removido.
- Muros de T4 agora são material neutro com marca territorial local, sem faixa inteira da cor da facção.
- Revisão ativa: `0.9.1b-sector-masses-v1`.
- Gate: TypeScript PASS, foundation PASS, build PASS (1744 módulos).

## 0.9.1C — Unificação da Arquitetura de Suporte
Status: **IMPLEMENTADO / AUDITADO EM 83% E 100%**

- T1/T4: volumes de suporte deixaram de ser blocos chapados e agora possuem fachada, porta, janelas, reboco/tijolo, laje, ferragem e caixas d'água.
- Bases compartilhadas de cluster integram fileiras de moradia ao terreno.
- Varais/fiação e pequenos trechos de circulação conectam volumes próximos sem criar collider extra.
- T2/T3/T5/T6 também receberam linguagem de suporte própria para evitar aparência de placeholder.
- Estruturas de suporte permanecem visualmente subordinadas aos hero assets táticos.
- Revisão ativa: `0.9.1c-support-architecture-v1`.
- Gate completo: TypeScript PASS, foundation PASS, build PASS (1744 módulos).
- Auditoria: `docs/screenshots/0.9.1c/` e `docs/screenshots/0.9.1c-close/`.

## 0.9.1D — Paridade Total do Contexto + Anti-Overlap
Status: **IMPLEMENTADO / PRONTO PARA PLAYTEST VISUAL DIRIGIDO**

- `buildingSkins.ts` agora possui modo contextual sem etiqueta/bandeira, usando o mesmo pipeline arquitetônico dos prédios táticos.
- Clusters de T1–T6 passaram a usar o renderer principal em vez de caixas simplificadas.
- `stall`, `security_booth`, `watch_post` e `service_unit` também usam arquitetura completa; labels como MERCEARIA/GERADOR/RÁDIO/PORTARIA/COMMS não aparecem mais no mundo.
- Props genuínos (caixotes, bancos, contêineres, barricadas etc.) continuam como props.
- O mesmo conjunto filtrado de geometria alimenta arte e colisão.
- Anti-overlap considera o volume 2.5D completo antes de autorizar uma estrutura contextual.
- Linhas tracejadas de acesso/zona/editor foram convertidas em juntas, pisos, canaletas, faixas gastas ou removidas.
- Overlay abstrato legado de `territoryLandmarks` foi aposentado do mundo principal.
- T3: galpões contextuais migrados para o pipeline arquitetônico completo e seus colliders foram ampliados junto com o volume visual.
- T6: torres decorativas fantasmas antigas foram removidas.
- T1: mercearia contextual reposicionada para a viela esquerda e pichação do muro de domínio tornada irregular, sem placa colorida de UI.
- `PAZ` mecânico da barreira foi removido e substituído por marcas de tinta discretas.
- Revisão ativa: `0.9.1d-context-parity-v4`.
- Gate completo final: TypeScript PASS, foundation PASS, build PASS (1743 módulos).
- Auditoria: `docs/screenshots/0.9.1d/`.

## 0.9.1E — Deep Territorial Composition
Status: **IMPLEMENTADO / AUDITADO T1–T6**

- Hero Clearance ampliado: contexto agora respeita silhueta, telhado e halo visual dos prédios táticos.
- Anexos deixaram de ter exceção contra o próprio hero asset; nenhum suporte pode mais invadir sua leitura.
- Zonas de composição específicas T1–T6 protegem vias, trilhos, boulevard, eixo industrial e espinha do QG.
- Contexto próximo mantém o mesmo pipeline arquitetônico, mas com volume vertical discretamente subordinado.
- Arte e física continuam derivadas do mesmo conjunto filtrado de sólidos.
- T1/T4 foram auditadas em 100%; T5/T6 confirmadas separadamente quando necessário por timing de captura.
- Revisão ativa: `0.9.1e-deep-composition-v1`.
- Próxima tranche: 0.9.1F — Final Visual Polish & Consistency.

## 0.9.1F — Final Visual Polish & Consistency
Status: **IMPLEMENTADO / PRONTO PARA PLAYTEST VISUAL MANUAL**

- Paredão territorial de T1 ganhou implantação irregular, desgaste, juntas e pichação integrada ao concreto.
- Plataforma ferroviária de T2 foi convertida de caixas delineadas para lajes físicas com borda, juntas e faixa de segurança.
- Mantida a paridade visual entre hero assets e arquitetura contextual, com hierarquia vertical controlada.
- Nenhum novo sistema de detalhe foi adicionado: foco exclusivo em consistência, materialidade e remoção de artificialidade.
- Capturas automáticas longas ainda podem registrar frames em branco/preto por timing de CDP; recapturas isoladas validam o renderer.
- Revisão ativa: `0.9.1f-final-polish-v1`.
- Próximo passo: playtest visual manual T1–T6 e correções finais dirigidas por screenshots antes da 1.0.
