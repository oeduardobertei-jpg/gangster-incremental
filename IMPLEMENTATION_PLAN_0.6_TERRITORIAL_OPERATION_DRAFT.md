# Plano de Implementação 0.5 — Operação Territorial

> Próxima grande atualização após o fechamento da 0.4 — Campo Legível.
> Objetivo: transformar o avanço de território de uma meta abstrata de neutralizações em uma operação espacial visível, jogável e persistente.

## Visão da atualização

A 0.4 resolveu câmera, leitura, HUD, identidade dos distritos, layout e performance. A 0.5 deve usar essa fundação para fazer o mapa importar mecanicamente.

O novo loop de conquista será:

1. combater e enfraquecer a presença rival;
2. ocupar bases/strongholds do distrito com tropas próximas;
3. cada base capturada reduz a capacidade de reforço rival e vira ponto avançado aliado;
4. capturar todas as bases inicia a Última Resistência;
5. derrotar a resistência final e cumprir a meta de neutralizações domina o distrito;
6. somente então o botão de avanço é liberado.

A atualização será chamada internamente de **0.5 — Operação Territorial**.

## Diagnóstico da base atual

A boa notícia é que parte da 0.5 já existe como protótipo desativado no código:
- `TerritoryControlPoint`, `DistrictOperationPhase` e `DistrictOperationStatus` já existem;
- snapshot já salva `controlPoints`, `operationPhase` e estado da resistência final;
- existe captura por proximidade, contestação, bases avançadas, redução de reforços e resistência final;
- HUD e minimapa já conseguem representar o estado da operação;
- recrutamento já sabe usar bases capturadas como ponto avançado.

### Problemas que precisam ser resolvidos antes de ativar

1. `DISTRICT_CAPTURE_PROTOTYPE_ENABLED` está `false`, portanto nada disso entra no fluxo normal.
2. O protótipo só foi pensado para o Território 1 e apenas antes do primeiro avanço da rodada.
3. `territoryDominated` ainda considera somente `territoryTakes`, então o HUD pode declarar domínio sem operação física.
4. `handleAdvanceTerritory()` também valida apenas neutralizações, contradizendo o comentário anterior que diz que a operação deve ser dominada.
5. A lógica de captura vive dentro de `GameCanvas.tsx`, que já possui cerca de 2.700 linhas; expandi-la ali aumentaria muito o custo de manutenção.
6. A operação ainda não tem configuração própria por território; pontos, duração, defesa e resistência precisam deixar de ser hardcoded.
7. A IA reage ao combate, mas ainda não possui uma camada explícita de objetivo territorial.

## Princípios de design

- O jogador deve enxergar por que venceu ou por que ainda não pode avançar.
- Neutralizações e domínio físico devem se complementar, não competir.
- Bases capturadas precisam alterar a batalha imediatamente.
- O sistema deve funcionar em 1x, 2x e 5x sem exigir microgerenciamento.
- Não haverá controle individual manual de soldados nesta versão.
- Uma base capturada não será retomada por rivais na 0.5; isso fica para uma atualização posterior.
- Regras territoriais ficarão separadas de renderer, UI e economia.
- A implementação entra primeiro como vertical slice no T1 e só depois é generalizada para T2–T6.

## Arquitetura-alvo

Criar três camadas explícitas:

- `rules/territoryOperation.ts`: regras puras de captura, fases, elegibilidade de domínio e transições;
- `data/territoryOperations.ts`: configuração de pontos, ritmo, resistência e recompensas por território;
- `components/canvas/operationRenderer.ts`: anéis, ícones, progresso e feedback visual.

## 0.5A — Fundação e extração da lógica

### A1. Fechar a linha de base 0.4
- manter os 19/19 testes de aceite, 66/66 smoke e gate de 30 FPS como proteção obrigatória;
- criar um checkpoint local antes de alterar progressão territorial;
- manter o protótipo desligado enquanto a lógica é extraída.

### A2. Extrair a máquina de estados
Modelar as fases:

`combat/capture → final_resistance → dominated → advance`

A função de regra deve receber o estado atual e eventos da simulação e devolver uma transição explícita, sem depender de React ou Canvas.

### A3. Unificar a definição de domínio
Eliminar a duplicidade atual. Deve existir uma única função como:

`canDominateTerritory({ neutralizations, requiredNeutralizations, operationPhase })`

O HUD, o CTA, o save e `handleAdvanceTerritory()` devem usar exatamente a mesma regra.

### Gate 0.5A
- nenhum avanço prematuro por neutralizações apenas;
- nenhuma regressão da 0.4;
- regras de operação cobertas por testes unitários/fundação;
- `GameCanvas.tsx` fica menor, não maior, ao final desta etapa.

## 0.5B — Vertical slice jogável no Beco dos Descalços

- ativar a operação apenas no Território 1 atrás de uma flag de desenvolvimento;
- usar 2–3 bases rivais ligadas aos prédios táticos já existentes;
- capturar exige aliado dentro do raio e ausência de rival contestando;
- múltiplos aliados aceleram de forma limitada, evitando captura instantânea em massa;
- sair do ponto faz o progresso recuar devagar, mas uma base 100% capturada permanece conquistada.

### Efeito imediato de cada base

Ao ser capturada:
- o prédio muda sinais visuais para a facção do jogador;
- deixa de gerar reforços rivais;
- entra na lista de pontos avançados de recrutamento;
- aparece como controlada no minimapa;
- o HUD mostra `x/y bases` sem depender de texto flutuante permanente.

### Gate 0.5B
- operação completa do T1 pode ser vencida sem comandos especiais;
- o jogador entende visualmente qual base está em disputa;
- capturar uma base reduz de fato a pressão rival;
- recrutas novos podem surgir de uma base aliada;
- save/reload no meio de uma captura preserva progresso corretamente.

## 0.5C — IA orientada a objetivo territorial

A IA não deve virar RTS manual. O objetivo é dar direção à autonomia existente.

### Aliados
- sem alvo próximo, preferem avançar para o ponto de controle não capturado mais relevante;
- unidades já em combate não abandonam ameaças imediatas;
- tropas não devem se empilhar exatamente no centro do ponto; usar offsets de aproximação;
- batedores podem chegar primeiro, fuzileiros podem manter distância útil.

### Rivais
- cada base ativa mantém uma zona de defesa;
- reforços recém-criados priorizam proteger a base de origem quando ela estiver contestada;
- bases já capturadas não podem gerar novos rivais;
- durante a Última Resistência, toda a lógica passa a defender o eixo final.

### Gate 0.5C
- aliados chegam aos objetivos sem intervenção constante;
- rivais defendem bases sem parecer teletransportados ou oniscientes;
- não surgem loops de pathing ou grandes grupos presos em paredes;
- stress 5x permanece acima de 30 FPS.

## 0.5D — Última Resistência e chefe territorial

Depois que todas as bases forem tomadas:
- reforços normais das bases cessam;
- inicia uma fase curta de resistência final vinda do exterior/QG;
- pelo menos uma unidade de elite ou chefe participa;
- se a meta de neutralizações ainda não tiver sido alcançada, novas ondas reduzidas continuam até completar a exigência;
- quando a última resistência é derrotada e a meta está cumprida, a operação passa para `dominated`.

O objetivo é substituir o atual salto abstrato por um clímax claro de território.

### Gate 0.5D
- não existe estado morto em que não há inimigos e o jogador não consegue concluir;
- chefe final não reaparece após save/reload;
- ondas não duplicam por troca de aba, resize ou re-render;
- o CTA de avanço aparece somente em `dominated`.

## 0.5E — Perfis de operação para os seis territórios

Criar `TerritoryOperationConfig` com campos como:
- IDs/labels dos hubs válidos;
- duração base de captura;
- raio de captura/contestação;
- intensidade de reforços;
- tamanho e composição da resistência final;
- chefe/elite principal;
- recompensa opcional por base e por domínio.

Progressão proposta:
1. T1 — 2–3 pontos simples, tutorial natural da mecânica;
2. T2 — pontos separados pela feira/trilhos, pressão de flancos;
3. T3 — galpões e oficinas, defesa mais densa e cobertura industrial;
4. T4 — reduto fortificado, captura mais lenta e mais unidades pesadas;
5. T5 — bases protegidas e distantes, maior exigência de mobilidade;
6. T6 — múltiplos hubs + QG central + chefe final mais forte.

## 0.5F — HUD, minimapa e comunicação de estado

A camada visual da 0.4 deve ser reaproveitada, não substituída.

### HUD de operação
- `Neutralizações x/y` continua visível como requisito paralelo;
- `Bases x/y` mostra o domínio físico;
- fase atual usa uma frase curta: `Tomando bases`, `Última Resistência` ou `Distrito Dominado`;
- progresso detalhado da base aparece somente quando uma captura está ativa.

### Campo e minimapa
- base rival: marcador da facção inimiga;
- base contestada: marcador âmbar pulsando de forma discreta;
- base aliada: cor da facção do jogador e pequeno símbolo de ponto avançado;
- Última Resistência: marcador especial no eixo de entrada/QG;
- o minimapa deve permitir localizar rapidamente o próximo objetivo sem cobrir o combate.

### CTA de avanço
O botão `CONQUISTADO! AVANÇAR` deixa de depender diretamente de `territoryTakes` e passa a receber a elegibilidade única da operação.

### Gate 0.5F
- nunca há dois indicadores discordantes sobre o estado do território;
- HUD funciona em desktop, tablet e 320 px;
- objetivo concluído não cobre câmera, minimapa ou controles de evolução.

## 0.5G — Recompensas e balanceamento

A captura precisa ser útil, mas não deve destruir a economia incremental existente.

Diretriz inicial:
- bases capturadas concedem principalmente vantagem tática, não renda passiva alta;
- recompensa econômica por base deve ser pequena/configurável;
- domínio completo pode conceder Respeito/Contatos coerentes com o GDD;
- qualquer recompensa nova passa por `rules/rewards.ts`, nunca por lógica solta no Canvas;
- o primeiro balanceamento deve preservar aproximadamente o tempo de progressão da 0.4 antes de acelerar ou desacelerar deliberadamente.

Métricas a registrar por território:
- tempo médio até primeira base;
- tempo para capturar todas as bases;
- neutralizações acumuladas quando a última base cai;
- duração da resistência final;
- aliados perdidos;
- recursos líquidos ganhos/gastos.

## 0.5H — Persistência, migração e confiabilidade

O snapshot já possui campos de operação, mas a 0.5 deve formalizá-los.

- validar e limitar `controlPoints` com schema específico, não apenas array genérico;
- garantir que IDs de prédio inválidos sejam descartados/recriados com segurança;
- save no meio da captura restaura progresso, base capturada e fase;
- save na Última Resistência não duplica a onda;
- save em `dominated` mantém o avanço disponível;
- Hegemonia limpa todo o estado da operação da rodada;
- importação inválida nunca pode liberar território indevidamente.

Se o formato precisar mudar de forma incompatível, subir `BattleSnapshot.version` com migração explícita e teste correspondente.

## 0.5I — Performance e aceite final

Reaplicar os gates da 0.4 com o novo sistema ativo:
- A: 15 aliados + 12 rivais / 1x;
- B: 60 aliados + 24 rivais / 2x;
- C: 135 aliados + 32 rivais / 5x;
- C com captura ativa, muitos projéteis/loot e pan/zoom contínuo.

Critérios mínimos:
- FPS médio acima de 30 em todos os gates;
- nenhuma regressão de input, save, recrutamento, upgrades, Hegemonia ou avanço;
- nenhum crescimento descontrolado de entidades após várias capturas;
- testes automatizados usam sessão isolada, sem tocar o save do jogador.

## Ordem recomendada de execução

1. **0.5A — extrair regras e criar testes antes de ativar**
2. **0.5B — vertical slice do T1 com flag de desenvolvimento**
3. revisão visual/jogável do T1
4. **0.5C — IA orientada aos objetivos**
5. **0.5D — Última Resistência e boss**
6. smoke funcional + save/reload do T1
7. **0.5E — transformar o sistema em configuração e levar ao T2/T3**
8. balancear antes de continuar
9. levar a operação ao T4/T5/T6
10. **0.5F — polimento final de HUD/minimapa/CTA**
11. **0.5G/H — economia, persistência e migração**
12. **0.5I — stress, regressão, screenshots e fechamento**

## Testes novos obrigatórios

- neutralizações suficientes sem bases capturadas não permitem avançar;
- bases capturadas sem neutralizações suficientes não permitem avançar;
- bases + neutralizações + resistência derrotada permitem avançar exatamente uma vez;
- base contestada não progride;
- base capturada não gera reforço rival;
- recruta automático/manual pode nascer de base avançada válida;
- save/reload conserva captura parcial e captura completa;
- Hegemonia remove captura antiga e reinicia T1 limpo;
- minimapa e HUD refletem a mesma fase da máquina de estados.

## Fora de escopo da 0.5

Para evitar transformar a próxima versão em uma reescrita sem fim, ficam para 0.6+:
- retomada dinâmica de bases já capturadas;
- destruição completa/reconstrução de prédios;
- diplomacia entre várias facções simultâneas;
- ordens RTS individuais para cada tropa;
- sistema complexo de pathfinding/navmesh;
- WebGL/engine novo;
- novos recursos monetários apenas para sustentar a conquista.

## O que torna a 0.5 uma grande atualização

A diferença principal não será cosmética. Hoje o jogador vence principalmente por atingir um contador; após a 0.5, ele verá sua facção ocupar o mapa, silenciar pontos de reforço, criar bases avançadas e empurrar a linha de frente até a resistência final.

Isso conecta diretamente três sistemas que a 0.4 preparou: identidade espacial dos territórios, câmera/minimapa e autonomia das tropas.

## Critério para chamar a 0.5 de concluída

A 0.5 fecha somente quando os seis territórios tiverem uma operação configurada, o avanço depender de domínio físico + requisito de campanha + resistência final, o estado sobreviver a save/reload, a Hegemonia reiniciar tudo corretamente e o cenário máximo continuar acima do gate de 30 FPS.

## Próxima fronteira depois da 0.5

Se a operação territorial funcionar bem, a 0.6 pode avançar para uma camada estratégica maior: retomada de zonas, eventos/contra-ataques, estruturas destrutíveis, ordens táticas ou expansão real de facções. Essas decisões devem ser tomadas depois de medir como a 0.5 altera o ritmo do jogo.

## Disciplina de performance para a 0.5

O gate extremo da 0.4 ficou em 33,3 FPS durante mouse + pan + zoom; existe margem, mas ela não deve ser desperdiçada.

- ocupação de pontos não precisa ser recalculada a 60 Hz; usar tick de 10–15 Hz e integrar progresso pelo delta acumulado;
- escolha de objetivo territorial da IA deve usar `aiDecisionTimer`, não busca completa por frame;
- HUD da operação continua quantizado/baixa frequência;
- evitar `sort()` e criação de arrays por frame para descobrir ponto ativo; percorrer a pequena lista em uma passada;
- número de control points por território deve permanecer pequeno e deliberado;
- qualquer efeito visual novo entra sob os mesmos budgets de partículas/LOD da 0.4;
- se a captura ameaçar o gate, medir primeiro no profiler antes de introduzir spatial grid ou estruturas mais complexas.
