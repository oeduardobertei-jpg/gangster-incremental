# 0.9.8 — T2 Ferrovia Integrada

Status: FINAL CANDIDATE; implementação, captura e production gate concluídos.
Revision: `0.9.8d-t2-integrated-rail-v1`.

## A — Ground reauthor ferroviário
- Criado `src/components/canvas/t2RailGroundReauthorRenderer.ts` como fonte autoral do chão T2.
- Ferrovia agora compartilha um único sistema visual: lastro, dormentes, trilhos, margens, drenagem, plataformas e crossing.
- Acesso vertical permanece funcional e legível, sem alterar a geometria de gameplay.
- Praça/feira saiu do grande retângulo genérico para campos de material irregulares.

## B — Cleanup de layers legados
- `worldDensityFoundation` antigo foi desativado apenas no T2: remove a segunda ferrovia, textos LINHA 02/PLATAFORMA e FEIRA OESTE/LESTE.
- Polish, architecture grounding, structural deep, material harmonization/continuity, generic functional access e ground-story genéricos foram retirados apenas do T2 onde duplicavam o novo chão.
- Overlays vivos e atmosfera continuam ativos.

## C — Integração de arquitetura e microdesgaste
- Armazém do Trilho, Estação Leste e Cabine Ferroviária recebem conexões de piso ancoradas nas construções reais.
- Box da Feira, Banca Coberta e Depósito da Praça recebem aprons locais discretos; Passarela recebe base alinhada ao crossing.
- Adicionados pavers, desgaste de pedestres, remendos, fissuras, detritos finos e drenagem quebrada em zonas seguras.
- Centro continua livre de obstáculos novos.

## QA
- `npm run check`: PASS.
- Foundation verification: PASS.
- Production build: PASS — 1752 modules.
- Overlap audit: T2 = 0 overlaps.
- Capturas: `docs/screenshots/t2-098/t2-098a-100.png` e `t2-098a-250.png`.
- Layer CLI segue autenticada; nenhuma geração Layer foi aplicada porque o workspace reportou 0 Creative Units.

T2 é FINAL CANDIDATE pendente apenas de revisão visual do usuário; não há blocker técnico conhecido.
