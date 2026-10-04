# Gangster Incremental — 1.1 Definitive Polish

## Direção
A 1.1 é uma reconstrução qualitativa da experiência existente. Não é uma expansão de sistemas.

Ordem de prioridade: **visual → movimento/IA → HUD/interface → câmera → combate audiovisual → performance/refactor**.

## Fases
- [x] 1.1A — Audit & Baseline
- [x] 1.1B — T1 Ground / Composition
- [x] 1.1C — T1 Architecture
- [ ] 1.1D — Crowd Movement
- [ ] 1.1E — Camera 2.0
- [ ] 1.1F — HUD 2.0
- [ ] 1.1G — Combat Visuals
- [ ] 1.1H — Combat Audio
- [ ] 1.1I — Renderer / Architecture Cleanup
- [ ] 1.1J — Performance
- [ ] 1.1K — T2
- [ ] 1.1L — T3
- [ ] 1.1M — T4
- [ ] 1.1N — T5
- [ ] 1.1O — T6
- [ ] 1.1P — Full Campaign Polish
- [ ] 1.1 GOLD

## 1.1A concluída
- branch `1.1-definitive-polish` criada a partir de `v1.0.0`;
- baseline T1 wide/100/close registrada;
- fronteira `t1SceneComposer.ts` criada;
- dois renderers mortos removidos;
- helpers históricos não executados removidos do T1 Gold Foundation;
- auditoria técnica/visual registrada em `docs/1.1A_AUDIT_BASELINE.md`.

## Regra de aceite
Nenhum território passa de fase até responder **sim** à pergunta: “está no mesmo nível do T1 1.1?”.
## 1.1B/C concluídas
- chão T1 recomposto com via menos dominante, tecido de lotes, conexões e vegetação contínua;
- arquitetura contextual reautorizada por função;
- densidade física secundária T1: 11 → 17 volumes;
- labels de mundo estabilizadas por zoom;
- organic pathing 6/6 PASS;
- all capture anchors 43/43 PASS, incluindo T1 6/6;
- referência: `docs/1.1BC_T1_WORLD_REBUILD.md`.