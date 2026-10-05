# Gangster Incremental 1.2A — T1-R First Look

Estado: implementado e validado na branch `dev/1.2-t1-rebuild`.
Base preservada: checkpoint `315a109` (`checkpoint/1.1.1-pre-1.2-visual-rebuild`).

## Objetivo

Fazer o T1 parecer uma nova versão do jogo desde o primeiro segundo, sem depender de upgrades, captura ou domínio.

## Mudanças visuais

- Novo renderer `t1RebuildRenderer.ts`, isolado do restante dos territórios.
- Topografia visual em terraços para tirar o T1 da leitura de mapa plano.
- Muros de contenção e escadarias visuais sem criar colisores falsos.
- Rede de vielas curvas e mais orgânicas sobre a circulação principal.
- Desgaste determinístico do piso, manchas, rachaduras e variação de material.
- Vegetação mais presente e concentrada em bordas/áreas negligenciadas.
- Postes, fiação e infraestrutura vertical para aumentar densidade urbana.
- Faixa de arquitetura distante fora da área jogável para sugerir continuidade da cidade.
- Silhuetas específicas para Beco 01, Laje do Ponto, Barraquinha, Esconderijo, Boca da Leste, Torre de Guarda e Mirante.
- Boca da Leste recebeu leitura muito mais forte como landmark.
- O pequeno Ponto de Apoio da 1.1.1 foi removido da composição normal do T1-R; a tecnologia continua preservada e acessível em DEV.

## Câmera

- T1 passa a abrir em 106%, centro `(640, 342)`.
- T2–T6 continuam usando o enquadramento GOLD de 94%.
- Botão de visão ampla continua mostrando o mundo inteiro.
- Reset de 100% e zoom ancorado no cursor continuam funcionando.

## Segurança técnica

A 1.2A altera somente apresentação; a geometria física do mapa permanece a mesma.

Validações executadas:

- `npm run check`: PASS.
- `acceptance-051-world.mjs`: 20/20 PASS.
- `acceptance-110e-camera2.mjs`: 14/14 PASS.
- T1: `solidWorldViolations = 0`.
- T2–T6 permaneceram fisicamente limpos e com câmera original.

## Evidência visual

Capturas do rebuild em `docs/screenshots/1.2-t1-rebuild/`.
`rebuild-d.png` é a referência visual mais recente da 1.2A.

## Próximo passo — 1.2B

Arquitetura e verticalidade: romper a repetição entre casas, criar volumes empilhados, telhados autorais, anexos e skyline de morro. O próximo gate visual exige que o mapa pareça reconstruído, não apenas receber um novo tratamento de chão.
