# T1 Cleanup Final + Beauty/Coherence v1

Status: STABLE / QA PASS
Checkpoint: `t1-cleanup-command-beauty-v1`

## Comando do Beco
- `drawCommandBaseProgression` refeito como QG baixo/largo inspirado na referência visual do usuário.
- Placa arquitetônica `Comando do Beco`, marquise da facção, entrada central, luzes quentes, contenções laterais e flag integrada.
- Upgrade props continuam presentes nas alas; spawn central permanece livre.
- Desenho visual foi elevado 16 px para não cortar no limite inferior; lógica de recrutamento/spawn não foi alterada.

## Cleanup Final T1
- Oficina hardcoded sem função removida de `t1HeroLandmarkRenderer`.
- Utilidades/transformador e traços de facção por coordenadas fixas removidos de `t1GoldFoundationRenderer`.
- Varal automático das lajes removido de `buildingSkins`.
- Varal global animado removido de `drawCityVivaAmbientOverlay`.
- Dois varais zoom-only removidos de `t1GoldOverlayRenderer`.
- Barra/postes decorativos de foreground inferior esquerdo removidos de `t1FinalPolishRenderer`.

## Beauty/Coherence v1
- Novo `t1BeautyCoherenceRenderer.ts`.
- Soleiras/desgaste visual seguem a porta real de cada building.
- Vegetação mínima apenas em cantos de Beco 01, Mirante, Laje do Ponto e Esconderijo.
- Visual-only; nenhum collider novo.

## QA
- `npm run check`: PASS.
- Foundation verification: PASS.
- Production build: PASS — 1754 modules.
- Overlap audit: T1=0, T2=0, T3=0, T5=0, T6=0.
- T4=7 contatos intencionais de retaining já conhecidos.
- Capturas: `docs/screenshots/t1-command/`, `docs/screenshots/t1-cleanup-final/`, `docs/screenshots/t1-master/`.
