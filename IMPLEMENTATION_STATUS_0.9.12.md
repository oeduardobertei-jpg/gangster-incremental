# 0.9.12 — Finale de Campanha / Domínio Total

Data: 2026-10-03
Status: **FECHADA / candidata estável**

## Objetivo
Fechar a campanha T1–T6 com um estado de vitória explícito, persistente por consequência do snapshot físico e integrado ao loop de Hegemonia, sem transformar a vitória em reset automático.

## Gatilho canônico
- A vitória não depende de contador paralelo.
- `GameCanvas` emite `onTerritoryDominated(territoryId)` quando o estado físico real chega a `dominated`.
- `App` só abre o finale quando o território dominado é o último território da campanha.
- Saves que já carregam T6 legitimamente dominado voltam a disparar o estado de vitória após restauração do snapshot.

## Experiência de vitória
- Novo modal `CampaignVictoryModal` com título **DOMÍNIO TOTAL**.
- Resume neutralizações da rodada, campanha 6/6 e recompensa potencial de Hegemonia.
- O modal pausa a simulação usando o mesmo mecanismo seguro dos demais modais.
- `Continuar no mapa` fecha a tela e restaura exatamente a velocidade anterior.
- `Preparar Hegemonia` abre o painel de Evolução, mas não reinicia a rodada automaticamente.
- Pós-domínio permanece jogável; reforços externos continuam conforme as regras 0.9.11.

## Integração com Hegemonia
- Preview usa `getHegemonyReward(gameState)`; nenhuma fórmula nova foi duplicada.
- `performHegemony` continua sendo a única operação que efetivamente reseta a rodada.
- Executar Hegemonia fecha qualquer estado pendente da tela de vitória.

## Arquivos centrais
- `src/components/CampaignVictoryModal.tsx`
- `src/components/GameCanvas.tsx`
- `src/App.tsx`
- `scripts/acceptance-0912-campaign-finale.mjs`

## QA de fechamento
- `acceptance-0912-campaign-finale.mjs`: **8/8 PASS**.
- Regressão `acceptance-0911-core-loop.mjs`: **7/7 PASS**.
- TypeScript: **PASS**.
- Foundation verification: **PASS**.
- Vite production build: **PASS**, 1759 módulos transformados.
- Zero erros de runtime nos testes focais.

## Observação de release
O build continua emitindo apenas o warning já conhecido de chunk principal acima de 500 kB. Não há falha funcional; isso entra como candidato de hardening/performance para a próxima etapa, sem risco de regressão no core loop.

## Próximo passo recomendado
**0.9.13 — Release Candidate Audit**: varrer campanha completa, save/import, HUD, performance real e peso do bundle; corrigir apenas bloqueadores reproduzíveis antes de declarar a 1.0 RC.
