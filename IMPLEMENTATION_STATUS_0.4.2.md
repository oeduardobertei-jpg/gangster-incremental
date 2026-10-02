# 0.4.2 — Guarnições de Abertura

Status: concluído e validado.

## Objetivo
Cada território novo deve começar já ocupado por uma força rival fixa, antes dos reforços dinâmicos normais. A entrada em um novo nível precisa comunicar imediatamente aumento de dificuldade e identidade de combate.

## Guarnições fixas
- T1 — Beco dos Descalços: 8 rivais.
- T2 — Praça da Feira & Linha do Trem: 10 rivais.
- T3 — Avenida das Oficinas & Galpões: 12 rivais.
- T4 — Morro Alto: 16 rivais.
- T5 — Mansões da Orla & Condomínios: 20 rivais.
- T6 — Complexo Central: 24 rivais.

Cada guarnição possui composição autorada por classe. T6, por exemplo, já apresenta um Chefe do Morro na força inicial.

Os spawns de reforço posteriores continuam usando `rivalPool`, `spawnRate` e `maxRivals`; portanto a guarnição inicial não substitui a progressão dinâmica do território.
## Validação
`npm run check` passou em TypeScript, testes de fundação e build de produção.

O aceite `scripts/acceptance-opening-garrison.mjs` passou 8/8:
- confirmou a quantidade fixa de T1 a T6;
- confirmou transição real T1 → T2 com 10 rivais presentes imediatamente;
- confirmou ausência de erros de runtime.

A distribuição inicial ao redor das bases usa slots determinísticos para reduzir pilhas visuais; a separação orgânica já existente nos rivais continua atuando depois do spawn.
