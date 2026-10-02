# Status 0.4.1 — Movimento Orgânico da Tropa

> Estado: concluído e validado.

## Objetivo

Corrigir a sensação de tropas sem massa física sem sacrificar o ritmo rápido de convocação pelo teclado.

A 0.4.1 preserva o comando de **Espaço** como parte central do fluxo incremental e melhora três pontos:

1. convocação rápida mesmo com abas/botões da interface focados;
2. nascimento distribuído em torno do ponto de entrada, sem pilhas de sprites;
3. separação suave entre aliados durante deslocamento e combate.

## Implementado

- `Space` volta a recrutar durante a batalha mesmo quando um botão/aba está focado.
- Campos de digitação (`input`, `textarea`, `select`, `contenteditable`) continuam protegidos.
- Modais, pausa, custo de Inteligência e limite de tropas continuam respeitados.
- Novo módulo `src/rules/troopMovement.ts` concentra a lógica de posicionamento e separação.
- Spawn usa busca em espiral de posições livres em vez de um único ponto com jitter mínimo.
- Clique repetido no mesmo ponto também recebe distribuição espacial automática.
- Batedores de moto recebem espaço pessoal maior que infantaria comum.
- Tropas sobrepostas recebem vetor de separação estável mesmo quando nasceram exatamente na mesma coordenada.
- A separação é recalculada em baixa frequência e aplicada de forma contínua à velocidade.
- Não existe engine de física rígida nem custo de colisão completa por frame.
- A velocidade final é limitada para evitar impulsos artificiais.
- Novos campos opcionais de separação são compatíveis com snapshots antigos.

## Validação funcional específica

Arquivo: `docs/acceptance-041-organic-movement.json`.

Resultado: **6/6 PASS**.

- Espaço com aba de upgrade focada: 5/5 recrutas criados.
- Onda rápida por teclado: 30 aliados materializados.
- Sobreposições severas após a onda: 0.
- Sobreposições comuns após a onda: 0.
- Distância mínima observada na onda: ~26 px.
- Oito convocações repetidas pelo mapa também terminaram sem sobreposição de corpos.
- Erros de runtime: 0.

## Regressão

`npm run check`: PASS.

- TypeScript: PASS.
- testes de fundação: PASS.
- build de produção: PASS.
- smoke acumulado: **66/66 PASS**.
## Stress pós-0.4.1

A nova separação não regrediu o gate de 30 FPS.

- Cenário A — 15 aliados / 12 rivais / 1x: **54,86 FPS**.
- Cenário B — 60 aliados / 24 rivais / 2x: **58,01 FPS**.
- Cenário C — 135 aliados / 32 rivais / 5x: **50,59 FPS**.
- Cenário C + mouse, pan e zoom: **54,56 FPS**.

O custo médio de simulação no cenário máximo ficou em aproximadamente **2,28 ms**, e com interação contínua em aproximadamente **1,94 ms** nesta rodada.

## Observação sobre o smoke de câmera

O teste antigo comparava duas tropas convocadas exatamente no mesmo ponto para inferir a âncora do zoom. Isso deixou de ser um teste válido depois da 0.4.1, porque a segunda tropa agora é deliberadamente deslocada para evitar empilhamento.

A propriedade matemática de zoom ancorado continua coberta pelos testes de fundação. O smoke visual foi atualizado para aceitar o deslocamento orgânico esperado sem mascarar regressões de câmera.

## Resultado

A 0.4.1 está pronta para uso. O ritmo de apertar Espaço foi preservado, o campo ficou mais natural em alta densidade e a solução permanece dentro do orçamento de performance da 0.4.
