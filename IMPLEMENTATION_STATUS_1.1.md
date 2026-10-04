# Gangster Incremental â€” 1.1 Definitive Polish

## DireÃ§Ã£o
A 1.1 Ã© uma reconstruÃ§Ã£o qualitativa da experiÃªncia existente. NÃ£o Ã© uma expansÃ£o de sistemas.

Ordem de prioridade: **visual â†’ movimento/IA â†’ HUD/interface â†’ cÃ¢mera â†’ combate audiovisual â†’ performance/refactor**.

## Fases
- [x] 1.1A â€” Audit & Baseline
- [x] 1.1B â€” T1 Ground / Composition
- [x] 1.1C â€” T1 Architecture
- [x] 1.1D â€” Crowd Movement
- [x] 1.1E â€” Camera 2.0
- [ ] 1.1F â€” HUD 2.0
- [ ] 1.1G â€” Combat Visuals
- [ ] 1.1H â€” Combat Audio
- [ ] 1.1I â€” Renderer / Architecture Cleanup
- [ ] 1.1J â€” Performance
- [ ] 1.1K â€” T2
- [ ] 1.1L â€” T3
- [ ] 1.1M â€” T4
- [ ] 1.1N â€” T5
- [ ] 1.1O â€” T6
- [ ] 1.1P â€” Full Campaign Polish
- [ ] 1.1 GOLD

## 1.1A concluÃ­da
- branch `1.1-definitive-polish` criada a partir de `v1.0.0`;
- baseline T1 wide/100/close registrada;
- fronteira `t1SceneComposer.ts` criada;
- dois renderers mortos removidos;
- helpers histÃ³ricos nÃ£o executados removidos do T1 Gold Foundation;
- auditoria tÃ©cnica/visual registrada em `docs/1.1A_AUDIT_BASELINE.md`.

## Regra de aceite
Nenhum territÃ³rio passa de fase atÃ© responder **sim** Ã  pergunta: â€œestÃ¡ no mesmo nÃ­vel do T1 1.1?â€.
## 1.1B/C concluÃ­das
- chÃ£o T1 recomposto com via menos dominante, tecido de lotes, conexÃµes e vegetaÃ§Ã£o contÃ­nua;
- arquitetura contextual reautorizada por funÃ§Ã£o;
- densidade fÃ­sica secundÃ¡ria T1: 11 â†’ 17 volumes;
- labels de mundo estabilizadas por zoom;
- organic pathing 6/6 PASS;
- all capture anchors 43/43 PASS, incluindo T1 6/6;
- referÃªncia: `docs/1.1BC_T1_WORLD_REBUILD.md`.
## 1.1D concluÃ­da
- mass-flow local une separaÃ§Ã£o, coesÃ£o e alinhamento sem duplicar varredura O(AÂ²);
- slots estÃ¡veis distribuem aproximaÃ§Ã£o a alvos/capturas;
- aceite 1.1D 11/11 PASS;
- organic 6/6, consolidation 19/19, live domination 8/8, anchors 43/43;
- referÃªncia: `docs/1.1D_FACTION_MASS.md`.
## 1.1E concluÃ­da
- zoom 78â€“235%, default 94%;
- wheel contÃ­nuo e botÃµes perceptuais;
- overscan reduzido e framing inicial refinado;
- aceite Camera 2.0 13/13 PASS;
- referÃªncia: `docs/1.1E_CAMERA_2.md`.
## 1.1F concluída
- command strip compacta para recursos + operação;
- barra de ação reduzida ao comando primário e automações;
- duplicação da facção removida;
- desktop/mobile sem overflow; aceite 12/12 PASS;
- referência: `docs/1.1F_HUD_2.md`.


## 1.1H concluída
- tiros reconstruídos em ataque/corpo/cauda por família;
- compressor + pan estéreo + 8 vozes máximas;
- variação procedural elimina repetição direta;
- gate próprio 16/16 + combate 10/10 PASS;
- referência: `docs/1.1H_COMBAT_AUDIO.md`.


## 1.1G concluída
- assinatura visual distinta por família de disparo;
- dano flutuante agregado para combate de massa;
- T1/T3/T6 preservam física e melhoram leitura;
- gate 10/10 + combate 10/10 PASS;
- referência: `docs/1.1G_COMBAT_VISUALS.md`.


## 1.1I concluída
- 26 chamadas ambientais diretas do GameCanvas reduzidas a 2 contratos;
- pipeline estático/dinâmico centralizado sem alterar ordem visual;
- organic pathing 6/6 e anchors 43/43 PASS;
- T1 inspecionado após refactor;
- referência: `docs/1.1I_RENDERER_CLEANUP.md`.
## 1.1J concluída
- profiling DEV separa cenário, entidades e efeitos;
- LOD adaptativo de infantaria comum entra somente com >=60 entidades e zoom <=115%;
- especiais/chefes/motos/fuzileiros preservam sprite completo; zoom próximo restaura full detail;
- A/B pausado: T5 -4,3% e T6 -7,2% no custo mediano de render;
- caches ambientais, memoização contextual e LOD arquitetural antecipado foram medidos e rejeitados;
- aceite Performance 16/16, Camera 13/13, Organic 6/6, Combat 10/10;
- referência: `docs/1.1J_PERFORMANCE.md`.

