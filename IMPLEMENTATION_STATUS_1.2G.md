# Gangster Incremental 1.2G — HUD / Interface 2.0

Branch: `dev/1.2-t1-rebuild`  
Base segura anterior: `c57de0c` (1.2D–F).

## O que mudou

- HUD de batalha do canto superior esquerdo foi redesenhado para ocupar menos espaço e parecer parte da direção de arte, não um painel de debug.
- Território ganhou hierarquia principal; aliados e rivais viraram chips compactos.
- Descritor e objetivo ficaram em faixas mais finas e legíveis.
- Barra de progresso usa cor contextual de território/facção.
- Controles de câmera receberam a mesma linguagem de material quente/escuro do HUD.
- Minimapa recebeu moldura mais discreta e coerente.
- Ajuda de controles foi compactada para liberar o campo de jogo.
- Layout responsivo mantém o card dentro da viewport em telas pequenas.

## Validação

- TypeScript/lint: PASS.
- `acceptance-110f-hud2.mjs`: 12/12 PASS em desktop e mobile.
- Sem overflow horizontal em desktop ou mobile.
- Barras globais de recursos, ações e comando de recruta preservadas.

## Captura

- `docs/screenshots/1.2-t1-rebuild/rebuild-n.png`

Próxima etapa: **1.2H — Luz, materiais e profundidade**.
