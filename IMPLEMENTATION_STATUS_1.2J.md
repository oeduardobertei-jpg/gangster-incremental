# Gangster Incremental 1.2J — Integração Urbana

Branch: `dev/1.2-t1-rebuild`  
Base segura anterior: `416996b` (1.2I Telhados e Fachadas Autorais).

## O que mudou

- Entradas dos prédios agora usam `doorX/doorY` reais para receber soleiras e piso gasto coerentes.
- Drenagem, manchas de umidade e desgaste conectam fachadas ao chão sem criar obstáculos falsos.
- Pequenas vegetações de base quebram a separação rígida entre prédio e terreno.
- Boca da Leste, Esconderijo e Laje do Ponto receberam tratamentos de uso específicos no entorno imediato.
- Landmarks ganharam detalhes altos e não-bloqueadores: varais curtos, jardineiras, antenas e sinais de ocupação.
- Casas secundárias cacheadas ganharam canos, jardineiras e varais determinísticos em parte dos telhados.
- Nenhuma geometria de collider, spawn ou pathfinding foi alterada.

## Validação

- TypeScript/lint: PASS.
- `npm run check`: PASS.
- Bundle dentro do orçamento.
- `acceptance-051-world.mjs`: 20/20 PASS.
- T1 em movimento: ~52 FPS nesta rodada de QA.
- `solidWorldViolations = 0` em T1–T6.
- Sem erros de runtime.

## Captura

- `docs/screenshots/1.2-t1-rebuild/rebuild-s.png`

Próxima etapa: **1.2K — Natureza de Encosta 2.0**.
