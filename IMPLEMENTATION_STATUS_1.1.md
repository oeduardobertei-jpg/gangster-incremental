# Gangster Incremental — 1.1 Definitive Polish

## Direção
A 1.1 é uma reconstrução qualitativa da experiência existente. Não é uma expansão de sistemas.

Ordem de prioridade: **visual → movimento/IA → HUD/interface → câmera → combate audiovisual → performance/refactor**.

## Fases
- [x] 1.1A — Audit & Baseline
- [x] 1.1B — T1 Ground / Composition
- [x] 1.1C — T1 Architecture
- [x] 1.1D — Crowd Movement
- [x] 1.1E — Camera 2.0
- [x] 1.1F — HUD 2.0
- [x] 1.1G — Combat Visuals
- [x] 1.1H — Combat Audio
- [x] 1.1I — Renderer / Architecture Cleanup
- [x] 1.1J — Performance
- [x] 1.1K — T2
- [x] 1.1L — T3
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
Nenhum território passa de fase até responder **sim** Ã  pergunta: “está no mesmo nível do T1 1.1?â€.
## 1.1B/C concluídas
- chão T1 recomposto com via menos dominante, tecido de lotes, conexões e vegetação contínua;
- arquitetura contextual reautorizada por função;
- densidade física secundária T1: 11 → 17 volumes;
- labels de mundo estabilizadas por zoom;
- organic pathing 6/6 PASS;
- all capture anchors 43/43 PASS, incluindo T1 6/6;
- referência: `docs/1.1BC_T1_WORLD_REBUILD.md`.
## 1.1D concluída
- mass-flow local une separação, coesão e alinhamento sem duplicar varredura O(A²);
- slots estáveis distribuem aproximação a alvos/capturas;
- aceite 1.1D 11/11 PASS;
- organic 6/6, consolidation 19/19, live domination 8/8, anchors 43/43;
- referência: `docs/1.1D_FACTION_MASS.md`.
## 1.1E concluída
- zoom 78–235%, default 94%;
- wheel contínuo e botões perceptuais;
- overscan reduzido e framing inicial refinado;
- aceite Camera 2.0 13/13 PASS;
- referência: `docs/1.1E_CAMERA_2.md`.
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

## 1.1K concluída
- T2 reautorado como feira + ferrovia integrada;
- piso monolítico substituído por ilhas comerciais e corredores legíveis;
- Armazém, Estação, Cabine e Passarela ganharam identidade física própria;
- microarquitetura comercial evita footprints de gameplay;
- referência: `docs/1.1K_T2_POLISH.md`.

## 1.1L concluída
- T3 reautorado como distrito industrial funcional, sem o antigo pátio monolítico;
- avenida central perdeu a marcação tracejada abstrata e preserva leitura de massa;
- Galpão, Serralheria, Depósito, Oficinas, Portaria e Torre ganharam silhuetas próprias;
- densidade industrial adicional usa `PurposeProps` físicos, não obstáculos visuais falsos;
- gate T3 16/16, combate 10/10 e anchors 43/43 PASS;
- referência: `docs/1.1L_T3_POLISH.md`.
