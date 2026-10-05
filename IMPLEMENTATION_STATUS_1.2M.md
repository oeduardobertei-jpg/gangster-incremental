# Gangster Incremental 1.2M — T1 Golden Rebuild

Branch: `dev/1.2-t1-rebuild`  
Base segura anterior: `261e7c6` (1.2L Atmosfera e Profundidade Cinematográfica).

## Objetivo

Fechar o T1 como referência visual oficial para os demais territórios, comparando diretamente a reconstrução 1.2 com o GOLD 1.1.0 em estado inicial equivalente.

## O que mudou

- Captura GOLD real foi refeita no commit `9afbb1f3996d024f75d240c65b443126855198e0` para comparação justa.
- Câmera inicial do T1 foi refinada de 106% para 104%, com centro Y em 348: mantém presença visual sem comprimir tanto Mirante/Torre no topo e Base de Comando no sul.
- O eixo central de circulação teve contraste reduzido para deixar de competir com landmarks e combate.
- Labels genéricos dos landmarks deixaram de parecer cartões de HUD: agora usam placas físicas dependentes do material do prédio, borda neutra e filete discreto da facção.
- Quatro pockets laterais de piso gasto/drenagem foram reaproveitados para dar intenção aos vazios sem criar estruturas falsas ou alterar colisão.
- Nenhuma geometria física, spawn, LOS, pathfinding ou regra de combate foi alterada.

## Comparação visual

- `docs/screenshots/1.2-t1-rebuild/gold-baseline.png` — GOLD 1.1.0, mesmo estado inicial.
- `docs/screenshots/1.2-t1-rebuild/golden-final.png` — T1 1.2M Golden final.

A reconstrução final preserva a leitura tática do GOLD, mas amplia verticalidade, natureza, materialidade, integração urbana, identidade arquitetônica, qualidade dos NPCs e coerência de HUD/câmera.

## Validação

- `npm run check`: PASS.
- Foundation: PASS.
- Bundle: 256.2 KiB gzip no maior JS chunk / teto de 260 KiB.
- `acceptance-110e-camera2.mjs`: 14/14 PASS após atualizar apenas as duas expectativas de framing de 106% para a decisão Golden de 104%.
- `acceptance-110f-hud2.mjs`: 12/12 PASS.
- `acceptance-051-world.mjs`: 20/20 PASS.
- T1 em movimento: ~50 FPS na rodada final de QA.
- `solidWorldViolations = 0` em T1–T6.
- Sem erros de runtime no browser.

## Estado

**T1 Golden Rebuild: FECHADO como padrão visual de referência da série 1.2.**

Próxima etapa recomendada: levar o T2 ao padrão T1, começando pela integração física/visual da ferrovia, passarela, estação e armazém.
