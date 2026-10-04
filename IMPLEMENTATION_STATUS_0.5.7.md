# 0.5.7 — Balance & Map Cleanup

Status: **CONCLUÍDA / STABLE**.

## 1. Bonde das Motos — rebalance
- Removido completamente o bônus de velocidade-base das tropas comuns.
- Velocidade-base permanece em **1,20** em qualquer nível do upgrade.
- O upgrade agora afeta somente novas convocações que podem nascer como `batedor_moto`.
- Curva de chance nerfada: **4% no N1 → 18% no N30**.
- Card/UI mostra apenas `Chance de batedor (novas convocações)`.
- Saves antigos são rebaseados para remover a velocidade antiga sem curar tropas.

## 2. Guarnição inimiga de entrada
Nova escala fixa de inimigos ao entrar em um território:
- T1: **10**
- T2: **14**
- T3: **18**
- T4: **22**
- T5: **26**
- T6: **30**

Regra protegida por aceite:
- jogador entra com **0 tropas gratuitas**;
- única exceção é o talento de Hegemonia `talent_starter_gang`.

## 3. Spawn rival após domínio
- Estruturas já dominadas pelo jogador deixam de ser fonte de spawn rival.
- Enquanto existirem estruturas rivais válidas, os reforços ainda podem sair delas.
- Com território dominado, reforços passam a entrar pelo perímetro:
  - `Acesso Norte`;
  - `Acesso Leste`;
  - `Acesso Oeste`.
- Pressão inimiga continua ativa; apenas a origem passa a ser coerente com ownership.
- Debug de aceite em DEV: `window.__LAST_RIVAL_SPAWN__`.

## 4. Cleanup de props / mapa
- Obstáculos genéricos deixaram de ser reutilizados igualmente em todos os distritos.
- T1–T4 receberam cobertura contextual por território.
- T5/T6 não recebem mais caçambas/botijões/carros genéricos sem contexto.
- Layouts antigos de obstáculos em saves são migrados para o layout territorial atual.
- T1: removido comércio/toldo duplicado; muretas reposicionadas e visualmente clarificadas.
- T2: barracas frontais duplicadas removidas; caçamba genérica redundante removida.
- T3: retângulos duplicados de `CARGA A/B` eliminados; containers duplicados removidos; pneus agora aparecem como estoque sobre pallet.
- T4: torres decorativas duplicadas removidas; watch posts ganharam cabine/telhado coerentes.
- T5/T6: campo mais limpo, apoiado em arquitetura e props autorais.

## Revisão visual
`0.5.7-balance-map-cleanup-v1`

Capturas finais:
`docs/screenshots/0.5.7-cleanup/territory-1.png` até `territory-6.png`.

## Gates finais
- `npm run check`: **PASS** (TypeScript + foundation + build de produção).
- Bonde das Motos: **6/6 PASS**.
- Guarnição/entrada de território: **15/15 PASS**.
- Ownership de spawn rival: **7/7 PASS**.
- Cleanup T1–T6: **13/13 PASS**, 0 violações de sólidos.
- Visual/campanha: **21/21 PASS**.
- Smoke funcional: **66/66 PASS**.
- Combat regression: **10/10 PASS**.
- Controle territorial PCC/CV: **7/7 PASS**.
- T5 anti-stuck: **8/8 PASS**, mínimo recente **48,9 FPS** no cenário congestionado.

## Próximo passo
A base volta a ficar pronta para **0.6 — Campanha / Operação Territorial**, agora com balance de entrada, ownership de spawn e props coerentes estabilizados.
