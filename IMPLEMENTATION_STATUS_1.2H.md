# Gangster Incremental 1.2H — Luz, Materiais e Profundidade

Branch: `dev/1.2-t1-rebuild`  
Base segura anterior: `a8fc260` (1.2G HUD 2.0).

## O que mudou

- Nova direção de luz autoral no T1: quente no alto/esquerda e mais fria/profunda no baixo/direita.
- Planos amplos de luz e sombra quebram a iluminação uniforme do terreno sem aplicar filtro de tela.
- Ambient occlusion e color bounce estáticos reforçam contato de construções com o chão.
- Áreas úmidas/frias e patamares expostos/quentes passam a responder cromaticamente de forma distinta.
- Landmarks ganharam bordas iluminadas e sombreadas coerentes com a direção da luz.
- Tijolo, metal e concreto agora recebem tratamentos diferentes: juntas, emendas/reflexos frios e desgaste fosco.
- Casas secundárias reutilizam o mesmo tratamento material dentro do cache rasterizado já existente.
- Nenhuma geometria física, collider, spawn ou pathfinding foi alterado.

## Validação

- TypeScript/lint: PASS.
- `npm run check`: PASS.
- Bundle: 253.3 KiB gzip JS, dentro do orçamento de 260 KiB para o maior chunk.
- `acceptance-051-world.mjs`: 20/20 PASS.
- `solidWorldViolations = 0` em T1–T6.
- Sem erros de runtime no browser.

## Capturas

- `docs/screenshots/1.2-t1-rebuild/rebuild-o.png` — primeiro passe material.
- `docs/screenshots/1.2-t1-rebuild/rebuild-p.png` — profundidade ampliada, versão escolhida.

Próxima etapa: **1.2I — Telhados e Fachadas Autorais**.
