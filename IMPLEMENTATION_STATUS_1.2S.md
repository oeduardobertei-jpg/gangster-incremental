# 1.2S — T3 Industrial Rebuild

Estado: concluído em `dev/1.2s-t3-industrial-rebuild`.

## Objetivo
Transformar o T3 de um pátio cinza com estruturas repetidas em um distrito industrial funcional, com ownership visual claro, silhuetas distintas e tecido físico reconhecido pelo pathfinding.

## Mudanças
- `t3IndustrialGroundReauthorRenderer` tornou-se a fonte de verdade para loading bays, desgaste, drenagem, docas e conexões de carga;
- removidas duplicações T3 de `accessCirculationRenderer`, `semanticBuildingRenderer`, `groundStoryRenderer` e `territoryStructuralDeepRenderer`;
- Oficina 01 e Oficina Leste deixaram de compartilhar a mesma arquitetura;
- Galpão de Peças recebeu cobertura serrilhada mais dominante e doca pesada;
- Serralheria ganhou shed metálico, exaustão e leitura própria;
- Depósito Industrial ganhou massa de estoque e cobertura técnica distinta;
- Portaria do Pátio ficou mais horizontal e reconhecível como controle de acesso;
- Torre da Fábrica ganhou presença vertical e plataforma superior;
- quatro blocos secundários clonados foram substituídos por seis anexos industriais físicos assimétricos;
- papéis semânticos dos anexos agora variam entre oficina, serralheria, galpão e depósito;
- revisão visual: `1.2s-t3-industrial-rebuild-v1`.

## Validação
- `npm run check`: PASS;
- maior JS chunk: 254.5 KiB gzip / 260 KiB;
- `acceptance-051-world`: 20/20 PASS;
- T3 declara 27 colliders;
- T3 moving rivals: ~50 FPS na rodada final;
- `solidWorldViolations = 0`;
- sem browser runtime errors.

## Evidência visual
- baseline: `docs/screenshots/1.2-t3-rebuild/baseline.png`
- final S: `docs/screenshots/1.2-t3-rebuild/industrial-fabric-final.png`

## Próximo passo
1.2T — T3 Materiais & Atmosfera Industrial: reduzir o cinza uniforme e separar aço galvanizado, ferrugem, concreto, óleo, luz de oficina e zonas de carga sem comprometer legibilidade ou bundle.