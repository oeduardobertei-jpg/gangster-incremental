# 0.8 — Mundo Vivo / Densidade Ambiental Integrada

Status: **0.8X.3 HUD EVENT FEED + BRAZILIAN INTERFACE PASS — COMPLETE**

## Pilar
A qualidade ambiental precisa sobreviver a três escalas: close-up, zoom médio e mapa aberto. O objetivo não é quantidade de props, e sim contexto, coesão e identidade territorial.

## Direção artística permanente
- O mundo é brasileiro: comunidades, periferias, favelas, feira, oficinas, morro, condomínios e infraestrutura urbana local.
- Crime Life: Gang Wars segue como referência de atmosfera urbana e guerra de gangues, sem copiar assets/conteúdo.
- Props isolados são evitados: objeto + chão + acesso + uso + material devem contar a mesma micro-história.
- Detalhe sem função/contexto é removido em vez de apenas acumulado.

## Tranches concluídas
- **0.8C Noise Cleanup** — riscos/fissuras procedurais sem contexto removidos.
- **0.8D Structure Grounding** — TacticalBuildings recebem apron, acesso, serviço e contexto territorial.
- **0.8E Mid-scale Landmarks** — zonas médias sustentam identidade em zoom aberto.
- **0.8F Prop Context Clusters** — PurposeProps recebem microambiente coerente antes de serem desenhados.
- **0.8G Brazilian Urban Identity** — rede elétrica, sarjeta, feira, oficina, contenção, pedra portuguesa e infraestrutura brasileira por distrito.
- **0.8G Tileset Harmonization** — pallets, caixas, containers e materiais industriais envelhecidos/unificados.
- **0.8H Edge Continuity** — bordas continuam a infraestrutura sem criar prédios ou colliders fantasmas.
- **0.8H Cover Grounding** — cover obstacles dinâmicos também recebem contexto territorial.
- **0.8H.1 Authored Imperfection** — padrões excessivamente regulares reduzidos; T3 passou de grid global a juntas localizadas.

## Identidade por território
- T1: periferia, lajes, fios, sarjetas, comércio pequeno e vegetação espontânea.
- T2: feira popular, linha férrea, travessias, caixas e zonas de circulação.
- T3: oficinas/galpões, concreto usado, óleo, mangueiras, pallets, serviço e ferrugem.
- T4: morro fortificado, terraços, contenções, escadarias, fios e concreto inacabado.
- T5: condomínios/orla, jardins, estacionamento, pedra portuguesa e acessos limpos.
- T6: QG urbano, setores operacionais, segurança, infraestrutura técnica e perímetro controlado.

## QA visual
- TypeScript: PASS.
- Auditoria visual em 70% de zoom: T1–T6 capturados sem erros de runtime.
- Capturas: `docs/screenshots/0.8-final/territory-1.png` ... `territory-6.png`.
- `CITY_VIVA_VISUAL_REVISION = 0.8h-world-cohesion-v1`.

## Expansão final 0.8I–L
- **0.8I Façades & Rooflines** — antenas, condensadoras, vergalhões, desgaste e infraestrutura variam por território sem cobrir sinalização.
- **0.8J Street Life Microclusters** — microcenas ancoradas às construções: comércio, oficina, obra, condomínio e segurança recebem objetos contextualizados.
- **0.8K Material Continuity** — material do edifício continua no entorno através de umidade, ferrugem, óleo, poeira, vegetação e marcas técnicas.
- **0.8L Final Composition Pass** — nova auditoria T1–T6 em 70%; detalhe próximo não compromete leitura macro.

## Novo critério artístico
Um detalhe só permanece se responder a três perguntas: **por que está aqui, quem usa, e como toca o chão/estrutura ao redor?** Se não houver resposta visual clara, deve ser removido ou integrado a um cluster contextual.

## 0.8M — Semantic Building Pass
- Todas as 42 estruturas nomeadas (7 por território, T1–T6) receberam identidade visual baseada em nome/função, não apenas paleta do distrito.
- Novo renderer permanente: `src/components/canvas/semanticBuildingRenderer.ts`.
- T2 recebeu leitura ferroviária explícita: Armazém do Trilho com baia/carga, Estação com plataforma, Cabine com sinalização e Passarela com vão/guarda-corpo conectados à área ferroviária.
- T3 diferencia oficinas, galpão, serralheria, depósito, portaria e torre industrial.
- T4 diferencia beco/subida, laje fortificada, barraco, reduto, boca, posto de vigia e mirante.
- T5 diferencia casa, condomínio, guaritas, mansão, portaria e cobertura por linguagem residencial/segurança privada.
- T6 diferencia anexo, centro operacional, posto blindado, alojamento, comando, torre de segurança e QG central por infraestrutura técnica.
- `Material Continuity` e `Street Life Microclusters`, que estavam importados mas fora do pipeline estático neste checkpoint, foram reintegrados.
- Contexto semântico de chão/acesso foi adicionado por território para ligar edifício, função e mapa.
- Auditoria visual 70%: T1–T6 capturados em `docs/screenshots/0.8m-semantic/`.
- TypeScript: PASS.
- `CITY_VIVA_VISUAL_REVISION = 0.8m-semantic-buildings-v1`.

## 0.8N — Bespoke Architecture / Façades & Rooftop Life
- Novo renderer permanente: `src/components/canvas/bespokeArchitectureRenderer.ts`.
- Cada estrutura nomeada recebe underlay + overlay arquitetônico sem alterar collider/pathing.
- T1 ganhou lajes, telhados inclinados, anexos, escadas, mirantes e torre de guarda com silhueta própria.
- T2 ganhou armazém com roofline industrial, estação com cobertura/plataforma, cabine elevada e Passarela com vão estrutural real.
- T3 ganhou shed roofs, galpões serrilhados, marquises de oficina, portaria e torre/chaminé industrial.
- T4 ganhou coberturas improvisadas, volumes fortificados, postos elevados e mirantes.
- T5 ganhou casas/mansões horizontais, guaritas compactas, portarias cobertas, cobertura com terraço/pergolado.
- T6 ganhou volumes técnicos escalonados, comando elevado, torre de segurança e QG hierárquico.
- Auditoria visual T1–T6 em 70%: PASS; TypeScript: PASS.

## 0.8O — Access & Circulation Pass
- Novo renderer permanente: `src/components/canvas/accessCirculationRenderer.ts`.
- Entradas passaram a refletir função: docas, pátios de carga, acessos comerciais, escadas, driveways, cancelas e corredores técnicos.
- Pipeline estático confirmado: Grounding → Material Continuity → Semantic Context → Access/Circulation → Street Life → Purpose Props.
- A auditoria revelou que Material Continuity/Street Life/Semantic Context estavam importados mas ainda sem chamadas efetivas neste checkpoint; a reintegração real foi concluída aqui.
- T2 conecta Armazém/Estação/Cabine/Passarela à ferrovia; T3 conecta oficinas/galpões/portaria ao pátio industrial; T5 diferencia acessos residenciais e portarias; T6 cria circulação técnica controlada.
- Capturas finais: `docs/screenshots/0.8o-access/territory-1.png` ... `territory-6.png`.
- TypeScript: PASS. `CITY_VIVA_VISUAL_REVISION = 0.8o-access-circulation-v1`.

## 0.8P — Ground Storytelling / Use Zones
- Novo renderer permanente: `src/components/canvas/groundStoryRenderer.ts`.
- Desgaste de chão passou a responder ao uso da estrutura, sem fissuras/ruído procedural aleatório.
- T1 usa desgaste de circulação, umidade e marcas discretas próximas de comércio/lajes.
- T2 diferencia circulação de feira, carga/depósito, estação/passarela e manutenção ferroviária.
- T3 recebe marcas coerentes de oficina, serralheria, carga industrial e circulação de portaria.
- T4 recebe desgaste/erosão de circulação no morro; T5 usa circulação limpa e paisagismo; T6 usa marcação técnica controlada.
- A camada roda depois de Access/Circulation e antes de Street Life para permanecer integrada ao piso.
- Auditoria visual T1–T6 em 70%: PASS; sem aumento relevante de ruído macro.
- Capturas: `docs/screenshots/0.8p-ground-story/territory-1.png` ... `territory-6.png`.
- TypeScript: PASS. `CITY_VIVA_VISUAL_REVISION = 0.8p-ground-story-v1`.

## 0.8P — Structural Identity Deep Pass / Surface Integration
- T1–T6 receberam composição estrutural profunda por território em `territoryStructuralDeepRenderer.ts`.
- T1: lotes decorativos genéricos foram refeitos dentro dos footprints existentes; massa urbana, lajes e acessos ficaram mais brasileiros.
- T2: ferrovia governa a composição; Armazém, Estação, Cabine e Passarela participam fisicamente do sistema ferroviário.
- T3: removidas as longas linhas tracejadas laranjas que liam como grid/editor; marcação industrial agora existe apenas em zonas funcionais.
- T4: bandas planas foram suavizadas em terraços/topografia; contenções, escadas e drenagem reforçam a leitura de morro.
- T5: assimetria residencial, baias, jardins e serviço reduzem a aparência de maquete/CAD.
- T6: pads técnicos, eixo de comando e infraestrutura dão hierarquia ao QG sem alterar colisão/pathing.
- Auditoria 70% e 100% em T1–T6: PASS; TypeScript: PASS.
## 0.8Q–T — Roofs, Stories, Lighting & Vegetation
- **0.8Q Rooftops & Lajes** — `rooftopLifeRenderer.ts`: cobertura passou a revelar função do prédio; tanques, exaustão, skylights, HVAC, painéis e antenas são semânticos.
- **0.8R Environmental Story Clusters** — `environmentStoryRenderer.ts`: microcenas autorais por estrutura nomeada complementam o Street Life genérico sem duplicá-lo.
- **0.8S Lighting & Urban Mood** — `urbanMoodRenderer.ts`: iluminação estática funcional e territorial foi integrada ao chão; animação existente foi preservada sem duplicação.
- **0.8T Vegetation & Neglect** — `vegetationNeglectRenderer.ts`: vegetação responde ao uso/local; espontânea em T1, ferroviária em T2, seca em T4, mantida em T5 e mínima no QG.
- Gates focais em zoom próximo/70%: PASS; `tsc --noEmit`: PASS.
- Revisão visual ativa: `0.8t-vegetation-neglect-v1`.
- Próximo foco: **0.8U — Material Harmonization**, seguido por Zoom Master, Performance Budget e Gold Visual Pass.

## 0.8U–X.2 — Closure / Gold Pass
- **0.8U Material Harmonization** — fachadas, telhados e chão receberam mistura territorial; grids antigos de T3/T5/T6 foram reduzidos na origem.
- **0.8V Zoom Master Pass** — LOD visual real em 100/85/70%; microdetalhe cai no zoom aberto sem perder silhueta, placas ou função.
- **0.8W Performance / Visual Budget** — orçamento adaptativo por carga de combate e teto de partículas progressivo; T6 extremo preserva identidade com 154 combatentes.
- **0.8X Gold Visual Pass** — limpeza final de resíduos CAD/editor, revisão de composição T1–T6 e integração final fundo→estrutura→microcena.
- **0.8X.1 Surface Cleanup** — T4/T5/T6 perderam guias e juntas excessivas; T5/T6 sem paver-grid global.
- **0.8X.2 Territory Composition Final** — terraços T4 passaram a patamares laterais locais; textura central T5 foi ainda suavizada.
- Auditoria final: T1–T6 em 100% e 70%; TypeScript PASS; 0 violações físicas nos stress focais recentes.
- Capturas finais: `docs/screenshots/0.8x2-final/territory-1-70.png` ... `territory-6-100.png`.
- Revisão ativa: `CITY_VIVA_VISUAL_REVISION = 0.8x2-territory-composition-v1`.

## 0.8X.3 — HUD Event Feed + Brazilian Interface Pass
- `systemNotice` saiu do header fixo; mensagens não alteram mais largura/posição da navegação, rádio ou controles.
- Novo `src/components/HudEventFeed.tsx`: fila de até 3 ocorrências, expiração automática e tipos territory/warning/reward/command/system.
- Histórico de até 40 ocorrências por sessão acessível pelo sino no header.
- Microcopy existente foi preservada; nesta etapa mudou apresentação, hierarquia e material visual, não o texto dos acontecimentos.
- Passe visual BR aplicado em header, ResourceBar e SpellBar: concreto/metal escuro, sinalização operacional e acentos verde-amarelo-azul discretos.
- Header ganhou leitura de central operacional brasileira sem alterar gameplay.
- TypeScript PASS; foundation 13/13 PASS; Vite production build PASS (1743 módulos).
- Próximo passo: playtest T1→T6 + balance/combat-feel, usando o novo histórico de ocorrências durante a auditoria.
