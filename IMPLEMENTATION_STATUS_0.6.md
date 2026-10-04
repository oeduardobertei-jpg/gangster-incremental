# 0.6 — Campanha / Operação Territorial

Status: **FEATURE-COMPLETE CANDIDATE — A–H implementadas; próximo passo é playtest e balance fino.**

## Pré-requisitos consolidados
- Dominação ocorre in-place: atingir a meta não reinicializa o battlefield.
- Tropas, posições, corpos e projéteis são preservados na troca de controle.
- Estruturas dominadas deixam de gerar rivais; pressão posterior vem de acessos externos.
- T5/T6 foram corrigidos estruturalmente para comportar multidões e rotas reais.
- A antiga barreira artificial de 70% da altura foi removida.
- Unidades não disparam através de paredes: cada tiro exige linha de visão válida.

## 0.6A — Campaign / District Profiles ✅
- `data/territoryCampaigns.ts` define as seis operações.
- T1 Varredura; T2 Interdição; T3 Ruptura; T4 Cerco; T5 Encurralar; T6 Comando.
- Cada território possui entradas externas, dica tática e doutrina própria.

## 0.6B — Papéis de tropas ✅
- `rules/troopRoles.ts` diferencia soldado-base, fuzileiro, batedor e pesado.
- Batedores priorizam suporte; fuzileiros valorizam pesados/chefes.
- Gerentes rivais funcionam como suporte de combate e recebem leitura visual própria.
## 0.6C — Doutrinas de reforço ✅
- `rules/campaign.ts` controla intervalo, batch, composição e escolha de entrada.
- T2 trabalha flancos; T3 cicla portões; T6 prioriza o eixo de comando.
- Spawn externo evita acessos congestionados sem destruir a identidade da doutrina.

## 0.6D — Gerentes / Chefes base ✅
- Gerentes concedem +12% de dano aos rivais próximos.
- Chefes não repetem chamadas de reforço por frame/re-render.

## 0.6E — Escalada / eventos territoriais ✅
- Cada operação possui marcos de contra-ataque acionados por progresso.
- Quantidade de marcos T1–T6: 1 / 2 / 1 / 2 / 2 / 3.
- T6 ativa Reserva Mobilizada, Protocolo de Defesa e Última Linha do QG.
- Os eventos respeitam `maxRivals` e entram por rotas externas.
- Gate focal: `acceptance-060e-milestones.mjs` = **6/6 PASS**.

## 0.6F — Boss / suporte avançado ✅
- Chefe possui três fases de HP com pressão crescente.
- Fase 2 chama resposta de comando uma vez; fase 3 ativa Última Ordem uma vez.
- Dano e cadência aumentam por fase sem criar loops de spawn.
- Gerentes e chefes têm anéis visuais distintos no campo.
- Gate focal: `acceptance-060f-boss.mjs` = **6/6 PASS**.
## 0.6G — Balance / recompensas ✅
- `requiredTakes` foi preservado para não recalibrar duração sem playtest real.
- Recompensas agora refletem ameaça: Gerente > Fuzileiro; Blindado > Gerente; Chefe muito acima dos demais.
- Chefe também concede mais munição, respeito e contatos.

## 0.6H — Persistência / documentação / QA ✅
- Marcos disparados são persistidos em `BattleSnapshot.campaignMilestonesTriggered`.
- Saves antigos derivam marcos já ultrapassados pelo progresso, evitando eventos duplicados.
- GDD atualizado com operações 0.6 e identidade dos seis distritos.
- Gate G/H: `acceptance-060gh-checkpoint.mjs` = **5/5 PASS**.

## Hotfixes de navegação 0.6 ✅
- T5: corredores laterais alargados e recovery alinhado às portarias.
- T6: perímetro contínuo virou segmentos com portais laterais reais.
- `rules/pathing.ts`: alvo bloqueado gera waypoint de contorno persistente.
- Alvos atrás de sólidos recebem penalidade; detour tem prioridade sobre crowd/edge recovery.
- Removida linha invisível que empurrava rivais para cima após 70% da altura.
- Gate orgânico: `acceptance-060-organic-pathing.mjs` = **6/6 PASS**.

## Estratégia de QA
- Microalteração: TypeScript + teste focal.
- Tranche: TypeScript + regressão diretamente relacionada.
- Suíte ampla fica reservada para release/checkpoint maior.

## Estado para próximo ciclo
A arquitetura da 0.6 está fechada. Próximo trabalho recomendado: **playtest dos seis territórios, telemetria de duração/mortalidade e balance fino**, antes de abrir uma nova feature macro.
