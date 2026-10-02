# Status — 0.9.2 World Cohesion & Prop Reality Pass

Estado: **IMPLEMENTADO / EM QA VISUAL MANUAL**
Revisão visual: `0.9.2-world-cohesion-v1`

## Objetivo
Eliminar resíduos de protótipo, props sem ancoragem e sobreposições entre arquitetura principal, contexto, props e obstáculos de combate.

## Implementado
- Botijões explosivos deixaram de usar emoji e aparência de pickup.
- Botijões ganharam base, sombra de contato, paleta industrial mais discreta e sinalização pintada.
- Sockets de botijões, carros e muros foram reposicionados para não invadir hero assets.
- Migração de battleSnapshot reconstrói automaticamente obstacles salvos nos sockets pré-0.9.2.
- Caçamba verde da T1 foi retirada da leitura da Boca da Leste.
- Muro baixo foi redesenhado como alvenaria física.
- Marca CV/PCC migrou para um muro real já existente; mural extra de facção foi aposentado.
- Escadas tracejadas/protótipo foram substituídas por escadas de concreto com corpo, sombra e degraus.
- Banca/apoios contextuais da T2 receberam cobertura, postes, balcão e materialidade de feira.

## Anti-overlap sistêmico
- `unifiedTerritoryComposer` aplica clearance também a covers, não só buildings.
- Composer também evita props físicos já existentes.
- Anexos T1/T4 foram separados com becos reais em vez de interpenetração.
- Clusters residenciais receberam folgas controladas sem perder densidade.
- Segundo anexo do Mirante foi removido quando não agregava leitura.

## Auditoria automática
Criado `scripts/audit-world-overlaps.ts` para cruzar hero assets, arquitetura contextual, props e obstacles.

Resultado final:
- T1: 7 contatos, todos intencionais entre cada hero e seu próprio muro de arrimo.
- T2: 0 sobreposições não intencionais.
- T3: 0 sobreposições não intencionais.
- T4: 7 contatos, todos intencionais entre cada hero e seu próprio muro de arrimo.
- T5: 0 sobreposições não intencionais.
- T6: 0 sobreposições não intencionais.

## QA visual
Capturas finais de T1, T2 e T4: `docs/screenshots/0.9.2-final/`.
A próxima etapa é validação manual por screenshots do jogador e correção apenas dos defeitos visuais sobreviventes.
