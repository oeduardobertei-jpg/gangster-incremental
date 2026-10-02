# 0.5.5 — Beauty Pass / Integração Visual

Status: **implementado e visualmente aprovado**.

## Entregas
- Removidos os grandes títulos decorativos que ficavam atrás de prédios e HUD.
- Textos de evento longos ganharam placa escura de leitura, mantendo alertas legíveis em combate.
- Biomas receberam vegetação coerente: espontânea no T1, ferroviária rala no T2, industrial mínima no T3, seca no T4, paisagismo forte no T5 e verde institucional no T6.
- Construções ganharam contato de entrada com o solo, sombreado lateral e leitura de volume melhor.
- NPCs mantiveram a escala atual, mas receberam sombras de contato em duas camadas.
- Armas 3/4 ganharam silhueta, carregador/empunhadura e fita de facção mais legíveis.
## Validação
- `npm run check`: PASS (TypeScript + fundação + build).
- `acceptance-055-beauty.mjs`: **14/14 PASS**.
- Controle territorial PCC/CV: **7/7 PASS** após o beauty pass.
- T1–T6: 0 violações de sólidos nas capturas de aceite.
- Capturas finais: `docs/screenshots/0.5.5/`.
- Capturas com combate real: `docs/screenshots/0.5.5/combat/`.

## Observação de performance
O stress sintético de T5 em 5x continua abaixo do gate histórico de 30 FPS no Chrome headless desta máquina. A física/anti-stuck passa (0 penetrações, progresso e pressão controlada). A tentativa de simplificar sprites em multidão foi retirada porque não entregou ganho confiável e piorava a fidelidade visual. A otimização de 5x deve ser tratada em uma frente própria sem degradar o visual normal.
