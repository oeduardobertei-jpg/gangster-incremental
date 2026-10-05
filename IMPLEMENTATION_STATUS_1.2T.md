# 1.2T — T3 Materiais & Atmosfera Industrial

Estado: concluído em `dev/1.2t-t3-materials-atmosphere`.

## Objetivo
Eliminar o cinza uniforme do T3 e fazer material, função e iluminação distinguirem cada zona industrial sem depender de novos sistemas pesados.

## Mudanças
- prédios T3 receberam resposta de material por função: oficina quente/oxidada, serralheria metálica, galpão galvanizado, depósito frio-esverdeado, portaria neutra e torre azul-aço;
- fachadas metálicas ganharam juntas e escorridos de ferrugem determinísticos;
- quatro zonas operacionais passaram a ter paletas macro próprias: Peças, Oficinas, Carga e Depósito;
- pátios funcionais também receberam separação cromática coerente;
- ferrugem no piso ficou mais legível sem virar decalque chamativo;
- iluminação existente foi reautorizada: oficinas quentes, serralheria cobre/âmbar, armazenamento frio e portaria controlada;
- revisão visual: `1.2t-t3-materials-atmosphere-v1`.

## Validação
- `npm run check`: PASS;
- maior JS chunk: 254.8 KiB gzip / 260 KiB;
- `acceptance-051-world`: 20/20 PASS;
- T3 moving rivals: ~51 FPS;
- `solidWorldViolations = 0`;
- sem browser runtime errors.

## Evidência visual
- `docs/screenshots/1.2-t3-rebuild/industrial-fabric-final.png`
- `docs/screenshots/1.2-t3-rebuild/materials-atmosphere-final.png`

## Próximo passo
1.2U — Circulação & Logística Industrial: integrar docas, bolsões de manobra e eixos de serviço, reduzindo a sensação de avenida vazia no centro do T3.