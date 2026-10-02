# 0.5.6 — World Beauty / Biome Depth

Status: **em implementação**.

## Objetivo
Dar outro salto perceptível na direção de arte sem alterar gameplay: solo menos geométrico, vegetação realmente presente e coerente, arquitetura melhor ancorada e combate mais integrado ao mundo.

## Princípios
- Beleza não pode reduzir legibilidade de tropas/projéteis.
- Vegetação nunca vira ruído uniforme: cada território tem quantidade e linguagem próprias.
- Elementos novos entram prioritariamente no cache estático do mapa.
- Controle CV/PCC continua afetando sinais de ocupação, não a natureza inteira.
- Nenhum novo detalhe decorativo pode criar colisão invisível.

## Fases
1. **0.5.6A — Biome Depth:** solo orgânico, vegetação estrutural, bordas e transições.
2. **0.5.6B — Arquitetura 2.5D:** telhados, fachadas, anexos, contato prédio-solo.
3. **0.5.6C — Combat Integration:** armas, muzzle flash, impactos, poeira e sombras.
4. **0.5.6D — Atmosphere:** iluminação prática e assinatura ambiental por território.
5. **0.5.6E — Visual QA:** labels, minimapa, contraste, screenshots e stress.

## Gates
`npm run check`, 66/66 smoke, 14/14 beauty, 7/7 controle territorial, 8/8 T5 anti-stuck e 0 violações de sólidos continuam obrigatórios.