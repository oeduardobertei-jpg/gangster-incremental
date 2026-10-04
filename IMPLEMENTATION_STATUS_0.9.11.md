# 0.9.11 — Core Loop Lock

Data: 2026-10-03
Status: **FECHADA / candidata estável**

## Objetivo
A conquista territorial deixa de ser uma barra abstrata de abates e passa a acontecer fisicamente no mapa. A progressão oficial combina pressão de combate, tomada de posições, resistência final e domínio do distrito.

## Semântica territorial
- `requiredTakes` foi aposentado em favor de `requiredNeutralizations`.
- Cada território usa o próprio requisito: T1=20, T2=40, T3=60, T4=80, T5=120, T6=200.
- `territoryTakes` permanece no save por compatibilidade, mas representa a pressão/neutralizações do território atual.
- Avançar exige o requisito do território atual e `operationPhase === 'dominated'`.

## Core loop físico
1. Entrar no território com a guarnição rival já presente.
2. Combater e acumular Pressão Territorial.
3. Tomar fisicamente as 6 posições rivais do mapa.
4. Se 6/6 vier antes da meta, entrar em `CONSOLIDAR PRESSÃO`.
5. Com pressão + 6/6, iniciar `ÚLTIMA RESISTÊNCIA`.
6. Após vencer a resistência final, marcar `DOMINADO` e liberar avanço.

## Regras de ocupação e reforço
- Hubs capturados não geram mais rivais localmente.
- Hubs contestados com progresso acima de 5% também ficam silenciosos.
- Depois do domínio, a pressão rival continua apenas por entradas externas do distrito.
- Tropas do jogador permanecem no campo durante a mudança de domínio.
- Aliados sem ameaça próxima avançam autonomamente para posições ainda não tomadas.
- Ameaças locais continuam tendo prioridade sobre o objetivo territorial.

## T6 / Chefe final
O Chefe do Morro agora é um gate final verdadeiro. Ele foi removido do `rivalPool`, da guarnição inicial, dos milestones normais e das composições de reforço T6. O `chefe_morro` surge exclusivamente na Última Resistência.

## Compatibilidade de save
- Saves antigos da fase contador-only não podem restaurar um falso estado `dominated`.
- Snapshots antigos sem control points legítimos iniciam a operação física em `capture`.
- Estados físicos intermediários preservam hubs capturados, progresso parcial, fase, ondas e milestones.
- Autosave e reload foram validados no meio de uma captura T2 com 2/6 posições + 65% da terceira.

## Performance
- Cálculo de ocupação/contestação foi movido para tick acumulado de baixa frequência.
- Busca de ameaça em captura ignora rivais distantes que seriam descartados pelo objetivo territorial.
- Cache de busca sem alvo foi corrigido para não repetir busca em todo fixed-step.
- Stress medido após otimização: T5 captura min ~36 FPS; T6 captura min ~43 FPS no harness dedicado.

## QA de fechamento
- `acceptance-060-campaign.mjs`: **24/24 PASS**.
- `acceptance-060-flow.mjs`: **10/10 PASS**.
- `acceptance-060-organic-pathing.mjs`: **6/6 PASS**.
- `acceptance-060e-milestones.mjs`: **6/6 PASS**.
- `acceptance-060f-boss.mjs`: **6/6 PASS**.
- `acceptance-0911-core-loop.mjs`: **7/7 PASS**.
- `acceptance-0911-territories.mjs`: **14/14 PASS**.
- `acceptance-0911-persistence.mjs`: **5/5 PASS**.
- `npm run check`: TypeScript, foundation verification e build Vite **PASS**.
- Zero erros de runtime nos acceptance tests finais.

## Playtest natural T1 → T2
No harness automatizado final, T1 chegou a 6/6 posições por volta de 25 s, entrou em resistência final e avançou para T2 por volta de 53 s. O total ficou em ~36 neutralizações, contra ~98 antes do lock de hubs contestados. T2 iniciou corretamente em 0/40 e 0/6.

## Arquivos centrais alterados
- `src/components/GameCanvas.tsx`
- `src/App.tsx`
- `src/components/ResourceBar.tsx`
- `src/components/ZoneSelector.tsx`
- `src/types/game.ts`
- `src/data/gameData.ts`
- `src/data/territoryCampaigns.ts`
- harnesses de campanha, flow, pathing, persistência e core 0.9.11 em `scripts/`.
