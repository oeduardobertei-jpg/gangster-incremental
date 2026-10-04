# Status de Implementação 0.5 — Cidade Viva

## Estado

**Núcleo visual da 0.5 implementado e validado.**

A atualização deixou de tratar T1–T6 como variações da mesma planta e passou a usar uma arquitetura visual dirigida por dados, mantendo Canvas2D, câmera, save, economia e regras centrais estáveis.

## Arquitetura nova

- `src/data/visualTokens.ts`: materiais, iluminação, escala e tiers visuais globais.
- `src/data/territoryScenes.ts`: identidade e blueprint espacial dos seis distritos.
- `src/components/canvas/environmentRenderer.ts`: fundações, landmarks, minimapa e ambiente vivo.
- `src/components/canvas/buildingSkins.ts`: famílias arquitetônicas 2.5D por distrito.
- `src/components/canvas/worldProgressionVisuals.ts`: upgrades refletidos fisicamente no ponto de comando.

O cache estático do mapa agora inclui uma revisão visual, evitando reconstrução por frame e permitindo invalidar a arte de forma controlada.

## Identidade dos distritos

- T1: periferia orgânica, vielas irregulares, comércio, lajes, mural e iluminação quente.
- T2: eixo ferroviário horizontal, estação/plataforma, feira e corredores de barracas.
- T3: pátio industrial aberto, galpões, portas de enrolar, contêineres e marcações de carga.
- T4: terraços, muros de contenção, escadas em zigue-zague e fortificações.
- T5: boulevard largo, muros, jardins, água, portarias e linguagem residencial controlada.
- T6: composição axial, checkpoints, torres e um quartel-general de múltiplos volumes.
## Bases, progressão e interface

As bases agora recebem skins próprias por território em vez de depender apenas de `brick | laje | zinc`. Bandeira, material, cobertura, fachada e silhueta seguem a identidade local.

O ponto de comando do jogador reage a tiers reais de upgrades:
- fortificação adiciona barricadas e estruturas;
- Rádio/Intel adiciona mastro, antena e sinais de comunicação;
- Auto-Munição adiciona caixas/logística;
- Médicos adicionam posto de atendimento;
- Motos adicionam veículos estacionados;
- Auto-Convocação adiciona central de despacho ativa.

O painel de evolução ganhou linguagem de oficina por categoria, cards refinados e uma barra de `Tier visual 0/5 → 5/5`, sem remover a leitura exata `atual → próximo` dos efeitos.

Ao entrar em um distrito surge uma apresentação curta e não bloqueante com nome, identidade, guarnição inicial e pressão máxima. O HUD também ganhou chip `T1–T6` e o minimapa acompanha a nova composição espacial.

## Mundo vivo

Cada território ganhou um efeito ambiental barato e contextual: varal, sinal ferroviário, solda industrial, refletor, reflexo de água ou beacon operacional.

A animação de entrada respeita `prefers-reduced-motion`. Os efeitos ambientais são deliberadamente sutis para não competir com projéteis, loot e unidades.
## Validação funcional

- `npm run check`: TypeScript, fundação e build de produção aprovados.
- `acceptance-05-visual.mjs`: **21/21 PASS**.
- `acceptance-041.mjs`: **6/6 PASS** — movimento orgânico/Space preservados.
- `acceptance-opening-garrison.mjs`: **8/8 PASS** — inclusive avanço real T1 → T2.
- `smoke-ui.mjs`: **66/66 PASS**.
- `test-04f-layout.mjs`: **6/6 PASS**.
- nenhum erro de runtime detectado nas baterias.

## Performance pós-0.5

| Cenário | FPS | Render médio |
| --- | ---: | ---: |
| A — 15 aliados / 12 rivais / 1x | 54,54 | 2,43 ms |
| B — 60 / 24 / 2x | 57,64 | 3,17 ms |
| C — 135 / 32 / 5x + loot | 51,07 | 5,05 ms |
| C + mouse/pan/zoom | 51,40 | 4,96 ms |

Todos passam o gate de 30 FPS e o cenário máximo permanece acima da meta prática de 45 FPS.

## Evidência visual

Galeria: `docs/screenshots/0.5/gallery/territory-1.png` até `territory-6.png`.

Comparação de progressão T1: `docs/screenshots/0.5/t1-low-panel.png`, `t1-low-focus.png` e `t1-max-panel.png`.