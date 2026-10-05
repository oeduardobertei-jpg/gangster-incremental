# Gangster Incremental 1.2I — Telhados e Fachadas Autorais

Branch: `dev/1.2-t1-rebuild`  
Base segura anterior: `6f1eaf3` (1.2H Luz, Materiais e Profundidade).

## O que mudou

- Landmarks do T1 passaram a ter coberturas com silhueta própria em vez de um topo genérico.
- Beco 01 recebeu telha quente e leitura residencial/comercial mais forte.
- Laje do Ponto ganhou linguagem de laje em obra, parapeto e estrutura superior mais crível.
- Esconderijo ganhou cobertura metálica, antena/prato e composição mais discreta.
- Boca da Leste ganhou marquise/telha quente e presença visual muito mais forte.
- Torre de Guarda recebeu cobertura metálica e topo funcional.
- Mirante recebeu deck/cobertura metálica e equipamento de observação.
- Casas secundárias usam telhados diferentes por material: tijolo/telha, metal/zinco e concreto/laje.
- Parapetos e pinturas desbotadas variam de forma determinística por ID, trazendo cor sem ruído aleatório.
- Nenhum footprint, collider ou regra de pathfinding foi alterado.

## Validação

- TypeScript/lint: PASS.
- `npm run check`: PASS.
- Bundle dentro do orçamento.
- `acceptance-051-world.mjs`: 20/20 PASS.
- `solidWorldViolations = 0` em T1–T6.
- Sem erros de runtime.

## Capturas

- `docs/screenshots/1.2-t1-rebuild/rebuild-q.png` — telhados autorais nos landmarks.
- `docs/screenshots/1.2-t1-rebuild/rebuild-r.png` — variação final de casas secundárias.

Próxima etapa: **1.2J — Integração Urbana**.
