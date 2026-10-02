# Gangster Incremental — estado da implementação 0.3

Data: 28/09/2026.
Base protegida: `gangster-incremental-baseline-20d2e079`.

## Gate da 0.2

- Smoke test real via Edge/CDP: 19/19 antes de iniciar a 0.3.
- Convocação, custo, pausa, GDD, snapshot e prestígio validados no navegador.

## 0.3 — D1: upgrades honestos

- `src/rules/upgrades.ts` é a fonte central de custo e efeitos mensuráveis.
- Painel exibe `atual → próximo` para os 13 upgrades.
- Barricadas terminam no nível 20, onde atingem 60% de redução.
- Saves com Barricadas 21–25 são limitados a 20 e recebem reembolso da diferença.
- Reembolso dos cinco níveis legados: 12.386 de munição.
- Fórmulas de HP, dano, velocidade, chances, intervalos e atributos derivados foram centralizadas.
- Textos de `gameData.ts` foram alinhados às fórmulas reais.

## 0.3 — D2: territórios pagam o que prometem

- `TerritoryZone` separa `healthMultiplier`, `damageMultiplier` e `rewardMultiplier`.
- Vida e dano dos rivais usam curvas independentes e explícitas.
- Grana, munição e espólios usam o multiplicador real do território.
- Seletor territorial mostra Vida, Dano e Grana/Suprimentos separadamente.

## 0.3 — D3: feedback econômico unificado

- `src/rules/rewards.ts` concentra cálculo e formatação das recompensas.
- Abates exibem exatamente Grana, Munição, Respeito e Contatos creditados.
- Espólios manuais e coletados pela tropa exibem os valores efetivamente recebidos.
- O talento de Grana agora também afeta Grana obtida por espólio, coerente com sua descrição.
- Estado, estatísticas, som e feedback visual partem do mesmo evento econômico.

## 0.3 — D4: primeira automação garantida

- Auto-Convocação N1 não é comprada por RNG/Contatos.
- O N1 é concedido gratuitamente após 100 neutralizações na rodada atual.
- O progresso aparece no Sindicato e na barra inferior como `x/100`.
- Ao concluir o marco, Auto-Convocação N1 é ativada automaticamente.
- Níveis 2–10 continuam usando Contatos e a curva normal de custos.
- Hegemonia zera o marco para `0/100`; ele deve ser reconquistado a cada nova rodada.
- O histórico vitalício continua somente no Prontuário e não desbloqueia a automação.

## Validação

- `npm run check`: TypeScript, regressão e build de produção — aprovado.
- Fundação automatizada cobre D1, D2, D3 e D4.
- Smoke test final via Edge/CDP: 32/32 aprovado.
- Perfil headless fica em `%TEMP%`, fora do watcher do Vite.

## Próximo pacote

D5/D6: rebalancear Auto-Munição e aplicar upgrades globais também às tropas já vivas, preservando a porcentagem atual de HP.


## Revisão de Hegemonia e progressão da rodada

- Auto-Convocação N1 agora exige 100 neutralizações na rodada atual.
- `runRivalsNeutralized` é separado do recorde vitalício `stats.totalRivalsNeutralized`.
- Hegemonia zera o progresso 0/100 e remove novamente a Auto-Convocação N1.
- `runHighestTerritoryReached` controla o mapa liberado apenas na rodada atual.
- Hegemonia retorna à Zona 1, zera neutralizações territoriais e bloqueia novamente as zonas seguintes.
- Recordes vitalícios continuam preservados apenas para estatísticas/prontuário.
- Avanço rápido de território também valida o mínimo de neutralizações no estado, não apenas na UI.

## Revisão dos upgrades

- `Treinamento Balístico de Guerrilha` foi removido por duplicar o multiplicador permanente da Hegemonia.
- Saves que possuíam níveis desse upgrade recebem reembolso integral do Respeito gasto.
- Se um save removido tinha batalha em andamento, o snapshot é reiniciado para evitar dano legado fantasma.
- Talentos de Hegemonia agora usam fonte única de custo/efeito (`src/rules/hegemonyTalents.ts`).
- Painel de Hegemonia mostra efeito exato `atual → próximo`, como os upgrades normais.
- Tropa de Elite Veterana foi alinhada ao efeito real: vida e dano dos recrutas.

## Validação adicional

- `npm run check`: aprovado.
- Smoke test real no navegador: 42/42 aprovado.
- Fluxo testado: rodada avançada → Hegemonia → 0/100, Zona 1 ativa e mapa relocado.

## 0.3 — D5: Auto-Munição rebalanceada

- `Recolhimento Rápido de Cápsulas` agora custa 60 munições no N1, com multiplicador de custo 1,18.
- N1 gera 2 caixas a cada 5 s (`24/min`); N15 chega a 16 caixas a cada 2,5 s (`384/min`).
- O painel mostra carga por ciclo, intervalo e produção estimada `atual → próximo`.
- O ticker econômico usa delta real e preserva ciclos múltiplos quando a simulação avança rapidamente.
- Saves da curva antiga recebem automaticamente a diferença de custo paga em excesso uma única vez via `balanceRevision`.
- Exemplo validado: save antigo N2 recebe 146 munições de compensação sem duplicar o reembolso em cargas posteriores.

## 0.3 — D6: upgrades afetam tropas vivas

- Vida, dano e velocidade de tropas já em campo são recalculados imediatamente após upgrades globais.
- A porcentagem atual de HP é preservada ao mudar o HP máximo; upgrade de vida não cura gratuitamente.
- Velocidade atual e vetores de movimento são recalibrados juntos para evitar aceleração/desaceleração inconsistente.
- `Tropa de Elite Veterana` também atualiza tropas já vivas imediatamente.
- Chances de Batedor/Fuzileiro continuam explicitamente válidas apenas para novas convocações.
- Snapshots carregados são recalibrados para as fórmulas atuais ao entrar no campo.

## Validação D5/D6

- `npm run check`: TypeScript, regressão e build de produção — aprovado.
- Fundação cobre curva D5, reembolso único e preservação proporcional de HP do D6.
- Smoke final via Edge/CDP: 58/58 aprovado.
- D5 no navegador: N1 produziu munição em lotes de 2 durante tempo real.
- D6 no navegador: tropa em 40% permaneceu em 40% após HP 55 → 67 e depois 67 → 83,75; dano e velocidade foram atualizados ao vivo.
