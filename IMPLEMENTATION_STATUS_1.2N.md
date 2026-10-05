# 1.2N — T2 Integração Ferroviária

Estado: concluído em `dev/1.2n-t2-rail-integration`.

## Objetivo
Fazer trilho, Armazém do Trilho, Estação Leste e Passarela funcionarem como uma única infraestrutura visual e física, em vez de camadas independentes.

## Problema encontrado
- o trilho oficial do T2 estava em 29% da altura;
- camadas legadas ainda ancoravam Estação/Passarela em 37% e 43%;
- quatro renderers diferentes redesenhavam plataformas e a Passarela;
- a Estação Leste ocupava fisicamente o leito ferroviário.

## Mudanças
- `t2RailGroundReauthorRenderer` virou a única fonte de verdade para chão ferroviário;
- removidas integrações duplicadas de `territoryStructuralDeepRenderer`, `semanticBuildingRenderer` e partes de `accessCirculationRenderer`;
- Passarela recebeu travessia elevada única, com deck, guarda-corpo, sombra, apoios e leitura de altura;
- Armazém recebeu cais ferroviário próprio;
- Estação Leste foi movida para o lado norte do trilho e passou a ter entrada voltada para a plataforma;
- plataforma da Estação agora ocupa o espaço real entre o prédio e a via;
- arquitetura local da Passarela deixou de desenhar o antigo eixo vertical duplicado.

## Validação
- `npm run check`: PASS;
- `acceptance-051-world`: 20/20 PASS;
- T2 opening garrison: 0 violações;
- T2 moving rivals: 0 violações;
- `solidWorldViolations = 0`;
- sem browser runtime errors;
- bundle principal: 255.1 KiB gzip / 260 KiB.

## Evidência visual
- `docs/screenshots/1.2-t2-rebuild/baseline.png`
- `docs/screenshots/1.2-t2-rebuild/rail-integration-final.png`

## Próximo passo
1.2O — Feira Viva: densidade, cor, comércio e integração urbana na metade inferior do T2.
