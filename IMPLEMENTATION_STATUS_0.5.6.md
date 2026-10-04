# 0.5.6 — World Beauty / Biome Depth

Status: **0.5.6A, 0.5.6B, 0.5.6B.1, 0.5.6C, 0.5.6D e 0.5.6E concluídas. 0.5.6 STABLE.**

## 0.5.6A — Biome Depth
- `biomeDepthRenderer.ts` integrado ao cache estático.
- Vegetação e materiais específicos por T1–T6.
- Solo menos geométrico e transições mais orgânicas.

## 0.5.6B — Arquitetura 2.5D
- `architectureDepthRenderer.ts` ancora prédios ao terreno.
- Telhados, volumes secundários, entradas e equipamentos por distrito.
- Revisão intermediária: `0.5.6b-architecture-depth-v1`.

## 0.5.6B.1 — Cleanup de Footprints Legados
- Prédios físicos passam seus footprints reservados ao renderer ambiental.
- Massas arquitetônicas antigas são suprimidas quando ocupam o mesmo espaço.
- Sobreposições vistas em T1/T3 corrigidas e T1–T6 auditados.

## 0.5.6C — Combat Integration
- Armas e poses refinadas sem aumentar a escala dos NPCs.
- Muzzle flash, sparks, cápsulas, impactos e traçantes melhorados.
- Integração visual de pistola/sub/fuzil preservando legibilidade.

## 0.5.6D — Atmosphere
- Novo `territoryAtmospheres.ts` com perfil de ambiente por território.
- Novo `atmosphereRenderer.ts` com iluminação prática, sombras projetadas leves e clima local.
- Partículas ambientais determinísticas com culling pela câmera.
- T1: poeira/papel e iluminação quente de periferia.
- T2: motes e luz ferroviária/feira.
- T3: poeira, névoa e plumas industriais.
- T4: poeira seca e atmosfera de morro fortificado.
- T5: névoa fria e partículas discretas de distrito residencial.
- T6: iluminação de complexo central e sinais ambientais ligados à cor de controle.
- FX ambientais permanecem abaixo de NPCs, projéteis e HUD.
- Revisão visual: `0.5.6d-atmosphere-v1`.
- Capturas: `docs/screenshots/0.5.6d/` e `docs/screenshots/0.5.6d/combat/`.

## 0.5.6E — QA Visual Final
- Galeria estática revisada em T1–T6.
- Combate ativo revisado em T1/T3/T6.
- Footprints, layering, colisão, HUD, minimapa e legibilidade preservados.
- Harness final: `scripts/acceptance-056e-final.mjs`.

## Validação final
- `npm run check`: PASS.
- Smoke funcional: **66/66 PASS**.
- Atmosphere T1–T6: **14/14 PASS**, 0 violações de sólidos.
- Combat Integration regressão: **10/10 PASS**, 0 violações.
- Controle territorial PCC/CV: **7/7 PASS**.
- T5 anti-stuck: **8/8 PASS**, mínimo recente **38,0 FPS** no cenário extremo congestionado.
- QA agregado 0.5.6E: **8/8 PASS**.
- Capturas Atmosphere: **6/6 estáticas + 3/3 combate**.

## Ambiente ativo
- Projeto: `C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.5.5-beauty-pass\gangster-incremental`
- Dev server deste projeto: `http://localhost:3000`
- A porta `3001` pertence a uma cópia antiga em `Documents\gangster-incremental-dev` e não deve ser usada para os aceites desta base.

## Próximo passo
**0.6 — Campanha / Operação Territorial**: consolidar layouts/distritos realmente distintos, papéis de tropas, composição dos reforços, comportamento de gerentes/chefes, objetivos de campanha e balanceamento da progressão.
