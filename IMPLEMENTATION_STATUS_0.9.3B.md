# 0.9.3B — Detail Density & Static Architecture Cleanup

Status: feature-complete / visual QA passed
Revision: `0.9.3b-detail-density-v1`

## Objetivo
Fechar a diferença perceptível de acabamento entre edifícios táticos e construções contextuais pequenas em T1–T6, principalmente em 250% de zoom.

## Mudanças principais
- Criado `contextArchitectureFinishRenderer.ts` como camada de acabamento viva, executada após o mesmo renderer principal usado pelos hero buildings.
- T1/T4: conduítes, medidores, plintos, remendos de fachada, beirais e ferragens de cobertura.
- T2: postes, balcões, iluminação e apoio físico de bancas/boxes.
- T3: quadros técnicos, dutos, exaustão e acabamento industrial.
- T5: varanda leve, condensadora, jardineira e acabamento residencial de orla.
- T6: cable trunk, painéis técnicos, ventilação e sinalização operacional discreta.
- LOD mantém detalhes estruturais em zoom normal e libera microdetalhes a partir de ~95%.
- Variação determinística de medidores/painéis evita repetição procedural evidente em T4/T5/T6.
## Limpeza de legado
- `environmentRenderer.ts` não importa mais `peripheryLotRenderer` nem `drawCityVivaContextBuilding`; arquitetura contextual não volta ao canvas estático por esses caminhos antigos.
- Funções decorativas antigas que ficaram no código não possuem chamada ativa no runtime; a fonte de verdade visual/física continua sendo o composer + depth queue.

## QA visual
- Auditoria T1–T6 em 100% e 250%: `docs/screenshots/0.9.3b/`.
- Close específico T1: `t1-context-250.png`.
- Close específico T4: `t4-context-250.png`.
- Context buildings mantêm contorno, esquadria, cobertura, instalações e contato com o solo em zoom alto.

## QA estrutural
- T2/T3/T5/T6: 0 overlaps não intencionais.
- T1/T4: apenas os 7 contatos hero ↔ arrimo deliberadamente conectados.

## Critério alcançado
A hierarquia entre prédio principal e contexto vem agora de etiqueta, função tática e protagonismo de composição — não de resolução, renderer ou acabamento inferior.
