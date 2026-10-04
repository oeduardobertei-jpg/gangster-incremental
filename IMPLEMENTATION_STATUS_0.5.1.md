# Status 0.5.1 â€” Campo SÃ³lido

## Objetivo
Fazer a Cidade Viva deixar de ser apenas visual: prÃ©dios, muros, barreiras, cercas, bancas e estruturas importantes agora participam fisicamente do combate.

## Implementado
- Colliders sÃ³lidos por territÃ³rio e para todos os prÃ©dios tÃ¡ticos.
- Movimento de aliados e rivais resolve colisÃ£o e desliza pelas superfÃ­cies.
- Steering preventivo contorna sÃ³lidos antes da colisÃ£o dura.
- Spawn de aliados/rivais procura posiÃ§Ãµes livres.
- Patrulhas rivais escolhem objetivos fisicamente alcanÃ§Ã¡veis.
- ProjÃ©teis e linha de visÃ£o respeitam cenÃ¡rio sÃ³lido.
- Impactos diferenciam metal, vidro, tijolo e concreto.
- Saves anteriores sÃ£o saneados ao carregar: unidades dentro da nova geometria sÃ£o ejetadas para fora.
- Solver de sobreposiÃ§Ã£o aliado continua respeitando cenÃ¡rio e coberturas.
- DiagnÃ³stico F8 mostra quantidade de sÃ³lidos e invasÃµes fÃ­sicas.

## Colliders por cenÃ¡rio no aceite
- T1: 14
- T2: 17
- T3: 14
- T4: 15
- T5: 13
- T6: 16

Todos os cenÃ¡rios terminaram o aceite com 0 invasÃµes fÃ­sicas.

## Design adicional
- Lotes do T1 ganharam fachadas mais completas, janelas, contato com o solo, caixas-d'Ã¡gua e antenas.
- Elementos de cenÃ¡rio foram alinhados Ã s aberturas fÃ­sicas: travessia ferroviÃ¡ria, vÃ£os de contenÃ§Ã£o, portÃµes e checkpoints.
- A leitura visual de funÃ§Ã£o foi reforÃ§ada: comÃ©rcio, indÃºstria, fortificaÃ§Ã£o, seguranÃ§a privada e QG usam linguagens arquitetÃ´nicas distintas.

## ValidaÃ§Ã£o
- `npm run check`: PASS (TypeScript, fundaÃ§Ã£o e build).
- `acceptance-051-world.mjs`: 20/20 PASS.
- `acceptance-05-visual.mjs`: 21/21 PASS.
- `acceptance-041.mjs`: 6/6 PASS.
- `acceptance-opening-garrison.mjs`: 8/8 PASS.
- `smoke-ui.mjs`: 66/66 PASS.

## Stress final com fÃ­sica
- A â€” 15 aliados / 12 rivais / 1x: 55,24 FPS, 0 invasÃµes.
- B â€” 60 aliados / 24 rivais / 2x: 53,08 FPS, 0 invasÃµes.
- C â€” 135 aliados / 32 rivais / 5x: 46,39 FPS, 0 invasÃµes.
- C + mouse/pan/zoom: 50,16 FPS, 0 invasÃµes.

Gate absoluto >=30 FPS e meta prÃ¡tica de 45 FPS no stress mÃ¡ximo foram preservados.

## PrÃ³xima etapa recomendada
0.5.2 â€” Design com PropÃ³sito: continuar elevando composiÃ§Ã£o, riqueza arquitetÃ´nica, coberturas funcionais e microvida, agora sobre uma fundaÃ§Ã£o fÃ­sica confiÃ¡vel.
