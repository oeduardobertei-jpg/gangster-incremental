# Gangster Incremental 1.1.0 — Definitive Polish

## Visão geral
A 1.1.0 não expande a campanha; ela reconstrói qualitativamente a experiência existente. O foco é coerência visual, movimento de massa, HUD, câmera, combate audiovisual, performance e qualidade transversal T1→T6.

## Destaques
- T1 refeito como padrão visual da atualização e usado como régua para os demais territórios.
- T2 transformado em feira + ferrovia integrada.
- T3 reautorado como distrito industrial funcional, sem marcações abstratas antigas.
- T4 recomposto como morro em patamares, com acessos, contenções e domínio visual dinâmico.
- T5 reconstruído como distrito residencial costeiro denso, preservando boulevard e corredores físicos.
- T6 reorganizado como complexo central de comando, com setores funcionais e landmarks distintos sem alterar portais/LOS.
- Movimento de facção ganhou coesão, separação e aproximação distribuída.
- Câmera 2.0: zoom 78–235%, framing e resposta refinados.
- HUD 2.0: hierarquia mais compacta, menos redundância e mais campo útil.
- Combate visual por família de arma, feedback de dano agregado e menor poluição em massa.
- Áudio de combate reconstruído com famílias de disparo, pan estéreo, compressor e limite de vozes.
- Pipeline de cenário centralizado e renderer cleanup.
- LOD e budgets adaptativos para batalhas densas.
- Auditoria final removeu mojibake visível e confirmou T1→T6 sob o mesmo padrão.

## QA 1.1
O Release Candidate inclui as 19 regressões da 1.0 e 13 gates próprios da 1.1. O Gold Gate canônico é `npm run qa:gold`, com smoke UI/save/Hegemonia integrado.

**Gold Gate final (2026-10-04):**
- `npm run qa:gold`: PASS, exit code 0.
- RC: **32/32 suites**.
- Smoke: **66/66**.
- Anchors físicos: **43/43**.
- Campanha 1.1P: **37/37**.
- Bundle final: **243,3 KiB JS gzip / 275 KiB** e **13,1 KiB CSS gzip / 20 KiB**.

## Compatibilidade
A atualização preserva as regras centrais da 1.0: captura física, domínio in-place, tropas persistentes após conquista, spawns rivais externos pós-domínio e bloqueio de tiro por sólidos.
