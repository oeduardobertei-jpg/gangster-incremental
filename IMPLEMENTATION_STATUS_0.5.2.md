# Status 0.5.2 — Design com Propósito

## Objetivo
Transformar a Cidade Viva em um campo com direção de arte própria: cada território precisa comunicar função, identidade, circulação e perigo, sem sacrificar legibilidade, física ou desempenho.

## Implementado
- Props funcionais autorados por território, com colisão coerente onde necessário.
- Construções receberam composição mais específica por distrito e leitura arquitetônica mais forte.
- Coberturas passaram a formar microposições de combate em vez de decoração aleatória.
- T1 foi tratado como vertical slice de qualidade e o vocabulário visual foi propagado a T2–T6.
- T2 enfatiza feira, estação e linha férrea; T3 carga/galpões; T4 fortificação; T5 segurança residencial; T6 perímetro de comando.
- Profundidade 2.5D, sombras de contato, sinalização, mobiliário e infraestrutura foram reforçados mantendo a leitura do combate.
- O minimapa e as capturas de aceite continuam distinguindo os seis layouts.

## Hotfix 0.5.1b incorporado
- Detector de stuck e alvos temporários de escape para cantos/gargalos.
- Cadência de decisão desacoplada da velocidade de simulação para evitar custo multiplicado em 5x.
- Broadphase simples de colliders para reduzir scans de geometria.
- Solver corporal em baixa frequência e com cadência adaptativa em batalhas grandes.
- Linha de visão cacheada em baixa frequência sem alterar a colisão real dos projéteis.
- Correção pós-cover evita invasões transitórias de sólidos.
## Aceites finais
- `npm run check`: PASS.
- `acceptance-051b-t5.mjs`: 8/8 PASS.
- `acceptance-052-purpose.mjs`: 27/27 PASS.
- `acceptance-041.mjs`: 6/6 PASS em repetição após o ajuste de sobreposição.
- Todos os seis territórios possuem conjuntos de props distintos e fisicamente válidos.
- Capturas T1–T6 foram geradas em `docs/screenshots/0.5.2/`.

## Stress final
- A — 15 aliados / 12 rivais / 1x: **56,9 FPS**, 0 invasões.
- B — 60 aliados / 24 rivais / 2x: **59,1 FPS**, 0 invasões.
- C — 135 aliados / 32 rivais / 5x: **42,9 FPS**, 0 invasões.
- C + mouse/pan/zoom: **44,8 FPS**, 0 invasões.

O gate absoluto de 30 FPS foi preservado. O caso extremo ficou ligeiramente abaixo da meta aspiracional de 45 FPS sem interação, mas próximo dela e com física/anti-stuck ativos. O próximo ciclo de performance deve priorizar o custo de IA aliada antes de reduzir qualidade visual.

## Resultado
A 0.5.2 fecha a fundação visual/física da Cidade Viva. O jogo agora possui territórios reconhecíveis, objetos com função, mundo sólido e navegação mais robusta. A próxima atualização pode concentrar-se em sistemas de domínio territorial, IA tática e eventos sem precisar reconstruir o renderer novamente.