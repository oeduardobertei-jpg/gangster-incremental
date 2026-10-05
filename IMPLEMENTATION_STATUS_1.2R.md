# 1.2R — T2 Golden Rebuild

Estado: concluído em `dev/1.2r-t2-golden-rebuild`.

## Objetivo
Fechar o T2 como novo padrão de qualidade após 1.2N–Q, removendo heranças de protótipo em vez de empilhar novos subsistemas.

## Golden cleanup
- labels dos landmarks T2 deixaram de ser cartões azuis de HUD e viraram placas físicas ferroviárias/mercantis;
- Passarela foi deslocada ligeiramente para dentro do território para que sua silhueta completa caiba no enquadramento de 98%;
- integração física da Passarela acompanha o novo footprint automaticamente;
- o Ponto de Apoio standalone 1.1.1 saiu dos mapas públicos T2–T6;
- código, progressão, HUD e preview DEV do Ponto de Apoio permanecem preservados;
- revisão visual: `1.2r-t2-golden-rebuild-v1`.

## Resultado acumulado do T2
- ferrovia passou a ter uma única fonte visual de verdade;
- Armazém, Estação e Passarela estão fisicamente integrados ao trilho;
- Estação Leste foi retirada de cima do leito ferroviário;
- feira ganhou massa comercial, cor, toldos, luz e anchors diferenciados;
- seis blocos secundários clonados viraram dois aglomerados físicos assimétricos;
- eixo central virou um S leve e recebeu duas ligações laterais entre trem e feira;
- câmera autoral do T2: 98%.

## Validação final
- `npm run check`: PASS;
- maior JS chunk: 254.4 KiB gzip / 260 KiB;
- `acceptance-110e-camera2`: 16/16 PASS;
- `acceptance-0910-base-preview`: 10/10 PASS;
- `acceptance-111-support-point`: 13/13 PASS;
- `acceptance-051-world`: 20/20 PASS;
- T2 moving rivals: ~55 FPS na rodada final;
- `solidWorldViolations = 0`;
- sem browser runtime errors.

## Evidência visual
- baseline pré-rebuild: `docs/screenshots/1.2-t2-rebuild/baseline.png`
- Golden final: `docs/screenshots/1.2-t2-rebuild/t2-golden-final.png`

## Próximo passo
1.2S — T3 Industrial Rebuild: eliminar repetição de galpões/oficinas, integrar pátio industrial, logística, materiais e circulação sem reutilizar a linguagem visual do T2.