# 0.9.3 — Architectural Parity Pass

Status: feature-complete / visual QA passed
Revision: `0.9.3-architectural-parity-v1`

## Objetivo
Eliminar a diferença de qualidade entre edifícios táticos e arquitetura contextual em T1–T6, inclusive em zoom alto.

## Mudanças principais
- Arquitetura contextual saiu do canvas estático e entrou na mesma fila dinâmica 2.5D dos hero buildings.
- Context buildings usam `buildingSkins.ts` com profundidade completa; a hierarquia vem de labels/função, não de renderer inferior.
- Purpose props arquitetônicos (bancas, guaritas, postos) também usam render vetorial vivo.
- `service_unit` ganhou renderer utilitário próprio: quadro/gerador/rádio/comms de alta qualidade, sem fingir ser uma casa.
- T2/T3 support modules foram promovidos de `cover` para `building`, sincronizando visual e collider.
- Footprints mínimos de anexos/alas/módulos foram ampliados para suportar detalhe arquitetônico real.
- Roof Logic agora escolhe tipologia por território, tamanho e material; contextos residenciais pequenos não herdam mais telhados hero inadequados.
- T4 retirou `Barraco Alto` da rotação contextual para evitar gables genéricos em casario secundário.
- Galpões contextuais legados da T3 foram removidos do `environmentRenderer`; os colliders fantasmas correspondentes também saíram.

## QA visual
Capturas T1–T6 em 100%: `docs/screenshots/0.9.3-all/`
Capturas T1–T6 em 250%: `docs/screenshots/0.9.3-zoom/`

## QA de sobreposição
- T1: somente 7 contatos intencionais hero ↔ arrimo
- T2: 0 conflitos não intencionais
- T3: 0
- T4: somente 7 contatos intencionais hero ↔ arrimo
- T5: 0
- T6: 0

## Critério alcançado
Qualquer construção contextual visível é tratada como arquitetura do mesmo mundo: mesma nitidez, profundidade, linguagem de materiais e lógica física dos prédios principais. Labels, bandeiras e função de spawn permanecem exclusivas dos pontos táticos.
