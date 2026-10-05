# 1.2O — T2 Feira Viva

Estado: concluído em `dev/1.2o-t2-feira-viva`.

## Objetivo
Transformar a metade inferior do T2 em uma feira visualmente reconhecível desde o início da partida, sem criar obstáculos falsos.

## Mudanças
- barracas reorganizadas em fileiras curtas nas laterais, preservando o eixo central;
- coberturas de lona com paletas distintas, balcões e pequenas mercadorias;
- toldos/tarps leves conectam trechos da feira e criam massa comercial;
- pequenos cordões de luz reforçam leitura de atividade sem virar efeito pesado;
- solo da feira recebeu ilhas mais quentes e contraste diferente da faixa ferroviária;
- iluminação do T2 foi realinhada ao trilho em 29% da altura e recebeu dois focos quentes na feira;
- Box da Feira ganhou frente mais aberta e mercantil;
- Banca Coberta ganhou cobertura teal/mustarda e iluminação própria;
- Depósito da Praça ganhou leitura mais pesada de estoque/logística.

## Regras preservadas
- nenhum novo collider foi criado;
- corredor central permaneceu livre;
- tarps, luzes e mercadorias são somente leitura visual.

## Validação
- `npm run check`: PASS;
- `acceptance-051-world`: 20/20 PASS;
- T2 moving rivals: ~53 FPS na rodada final;
- `solidWorldViolations = 0`;
- sem browser runtime errors;
- maior chunk: 255.5 KiB gzip / 260 KiB.

## Evidência visual
- `docs/screenshots/1.2-t2-rebuild/rail-integration-final.png`
- `docs/screenshots/1.2-t2-rebuild/feira-viva-final.png`

## Próximo passo
1.2P — Arquitetura de Bairro do T2: casas/contexto/bordas com mais variedade, volume e integração ao mercado/ferrovia.
