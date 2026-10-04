# Auditoria Visual 0.5.6

Base auditada: capturas finais de `docs/screenshots/0.5.5/`.

## Achados gerais
- O mapa já possui identidade, mas grandes áreas de piso ainda leem como superfícies planas preenchidas.
- A vegetação existe, porém é pequena ou geométrica demais para definir bioma fora do T5.
- T1 precisa de verde espontâneo em frestas, lotes e bordas úmidas.
- T2 precisa de mato ferroviário longitudinal e abandono nas margens do lastro.
- T3 deve manter verde raro: erva daninha em cantos, drenagem e limites industriais.
- T4 precisa de capim seco, arbustos baixos e erosão acompanhando os terraços.
- T5 deve trocar retângulos verdes por paisagismo em camadas, árvores podadas e canteiros orgânicos.
- T6 deve ter verde institucional mínimo, recortado e proposital fora do eixo operacional.

## Problemas de composição
- Alguns materiais têm transição abrupta demais entre asfalto, concreto, terra e grama.
- Grandes pátios T2/T3/T6 precisam de variação macro de desgaste, não somente decalques pequenos.
- Construções melhoraram, mas ainda faltam sombras arquitetônicas/contato mais forte em alguns edifícios.
- NPCs têm boa escala; o próximo ganho é integração de arma, sombra, impacto e iluminação local.

## Prioridade imediata
Implementar 0.5.6A no cache estático: clusters orgânicos de vegetação, bordas naturais, folhas/pedras e transições de solo. Validar T1–T6 antes de avançar arquitetura.