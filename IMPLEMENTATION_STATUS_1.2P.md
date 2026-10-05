# 1.2P — T2 Arquitetura de Bairro

Estado: concluído em `dev/1.2p-t2-neighborhood-architecture`.

## Objetivo
Eliminar a fileira de construções secundárias genéricas do T2 e aproximar o tecido físico do bairro da qualidade dos landmarks e da Feira Viva.

## Problema encontrado
Os seis sólidos secundários do T2 tinham o mesmo tamanho, o mesmo alinhamento em `y=.56` e material idêntico. O acabamento visual tentava variar uma composição que estruturalmente continuava repetitiva.

## Mudanças
- `finishT2` passou a diferenciar Box da Feira, Banca Coberta, Armazém do Trilho e Depósito da Praça;
- fachadas agora recebem pinturas/desgaste, marquises, coberturas, venezianas, balcões, luminárias e pequenos volumes superiores por função;
- variações são determinísticas pelo ID para evitar clonagem sem ruído aleatório;
- os seis antigos blocos idênticos foram substituídos por dois aglomerados físicos assimétricos;
- tamanhos, alturas e materiais agora variam entre brick/concrete/metal;
- volumes superiores permanecem sobre os footprints físicos reais; nenhum obstáculo visual falso foi criado;
- corredor central e circulação da feira permanecem livres.

## Validação
- `npm run check`: PASS;
- `acceptance-051-world`: 20/20 PASS;
- T2 opening garrison: 0 violações;
- T2 moving rivals: 0 violações;
- `solidWorldViolations = 0`;
- sem browser runtime errors;
- maior chunk: 255.9 KiB gzip / 260 KiB.

## Evidência visual
- `docs/screenshots/1.2-t2-rebuild/feira-viva-final.png`
- `docs/screenshots/1.2-t2-rebuild/neighborhood-architecture-final.png`

## Próximo passo
1.2Q — Composição e Atmosfera do T2: unir visualmente ferrovia e feira, revisar câmera, bordas, vegetação e profundidade antes do Golden Rebuild.
