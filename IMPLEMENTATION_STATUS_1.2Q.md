# 1.2Q â€” T2 ComposiÃ§Ã£o e Atmosfera

Estado: concluÃ­do em `dev/1.2q-t2-composition-atmosphere`.

## Objetivo
Unir visualmente ferrovia e feira, reduzir a divisÃ£o em duas metades e dar ao T2 um enquadramento autoral antes do Golden Rebuild.

## MudanÃ§as
- eixo central foi reautorado como um S leve e teve largura reduzida;
- criadas duas aproximaÃ§Ãµes laterais entre a borda ferroviÃ¡ria e a feira;
- aproximaÃ§Ãµes receberam travessas visuais e patamares nas duas pontas;
- iluminaÃ§Ã£o ambiente reforÃ§a os dois novos eixos de ligaÃ§Ã£o;
- cÃ¢mera inicial do T2 passou de 94% para 98%, com centro Y levemente ajustado;
- visÃ£o ampla, reset 100%, pan e limites globais permanecem inalterados.

## ValidaÃ§Ã£o
- `acceptance-110e-camera2`: 16/16 PASS;
- contrato formal passou a incluir T2-R em 98%;
- `npm run check`: PASS;
- `acceptance-051-world`: 20/20 PASS;
- T2 moving rivals: ~50 FPS na rodada final;
- `solidWorldViolations = 0`;
- sem browser runtime errors;
- maior chunk: 256.2 KiB gzip / 260 KiB.

## EvidÃªncia visual
- `docs/screenshots/1.2-t2-rebuild/neighborhood-architecture-final.png`
- `docs/screenshots/1.2-t2-rebuild/composition-atmosphere-final.png`

## PrÃ³ximo passo
1.2R â€” T2 Golden Rebuild: comparaÃ§Ã£o direta contra o baseline prÃ©-rebuild, remoÃ§Ã£o de heranÃ§as de protÃ³tipo, equilÃ­brio final de composiÃ§Ã£o, material, sinalizaÃ§Ã£o e densidade.

