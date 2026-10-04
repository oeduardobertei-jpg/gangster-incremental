# Gangster Incremental — 1.1 Definitive Polish

## Direção
A 1.1 reconstrói qualitativamente a experiência existente sem expandir a campanha. Prioridades: visual, movimento/IA, HUD, câmera, combate audiovisual, performance e refactor.

## Progresso
- [x] 1.1A — Audit & Baseline
- [x] 1.1B/C — T1 World Rebuild
- [x] 1.1D — Faction Mass Movement
- [x] 1.1E — Camera 2.0
- [x] 1.1F — HUD 2.0
- [x] 1.1G — Combat Visuals
- [x] 1.1H — Combat Audio
- [x] 1.1I — Renderer / Architecture Cleanup
- [x] 1.1J — Performance
- [x] 1.1K — T2 Feira & Ferrovia
- [x] 1.1L — T3 Industrial
- [x] 1.1M — T4 Morro Alto
- [x] 1.1N — T5 Orla & Condomínios
- [x] 1.1O — T6 Complexo Central
- [x] 1.1P — Full Campaign Polish
- [x] 1.1 GOLD

## Estado consolidado
- T1 é o padrão visual da 1.1, com chão, arquitetura e densidade física reautorizados.
- Movimento de massa ganhou separação, coesão, alinhamento e aproximação distribuída.
- Camera 2.0 opera entre 78% e 235%, com default em 94%.
- HUD 2.0 reduz redundância e amplia o campo útil.
- Combate visual usa assinaturas por família de arma e dano agregado.
- Áudio de combate usa variação procedural, pan estéreo, compressor e limite de vozes.
- O pipeline de cenário foi centralizado e o `GameCanvas` deixou de orquestrar dezenas de passes diretamente.
- T2–T6 foram reautorizados mantendo identidade própria e coerência física.
- LOD e budgets adaptativos reduzem custo de batalhas densas sem remover landmarks ou especiais.
- A auditoria 1.1P confirmou campanha T1→T6 com leitura consistente, zero violações físicas nos gates finais e sem mojibake visível.
- Gates finais de território: T5 15/15, T6 15/15, anchors T1–T6 43/43, captura crítica 8/8 e live domination 8/8.
- Gate transversal 1.1P: campanha completa 37/37 PASS.

## Evidências
- `docs/1.1P_FULL_CAMPAIGN_POLISH.md`
- `docs/screenshots/1.1p-campaign-gallery/`
- gates dedicados `scripts/acceptance-110*.mjs` e `.ts`

## Gold Gate
**1.1.0 GOLD confirmado em 2026-10-04.**
- `npm run qa:gold`: PASS, exit code 0.
- Release Candidate: **32/32 suites**.
- Smoke UI/save/Hegemonia: **66/66**.
- Anchors T1–T6: **43/43**.
- Campanha transversal 1.1P: **37/37**.
- Bundle: **243,3 KiB JS gzip / 275 KiB**; CSS **13,1 KiB / 20 KiB**.
- O runner de QA reinicia apenas o Chrome CDP descartável entre blocos pesados, evitando contaminação de performance sem tocar no navegador do usuário.
