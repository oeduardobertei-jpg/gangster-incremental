# IMPLEMENTATION STATUS — 0.9 Brasil Orgânico / Favela Carioca

Status: **0.9H FEATURE-COMPLETE — GOLD PASS**
Revisão visual: `0.9h-brasil-organico-v1`

## Objetivo atingido
A 0.9 substitui o paradigma de “mesmos blocos com skins diferentes” por uma fundação visual mais autoral: silhuetas, anexos, lajes, acessos, terreno, materiais e contexto urbano passam a trabalhar juntos.

## 0.9A/B — Arquitetura + Solo
- Novo `cariocaIdentityRenderer.ts`.
- Massas assimétricas, anexos, telhados irregulares, lajes, grades, escadas externas, caixas d’água e reboco/tijolo misturado.
- Grounding específico com soleiras, degraus, contenções, drenagem e contato físico com o chão.
- T6 separa cor de facção de material arquitetônico: facção = sinalização; concreto/metal = edifício.

## 0.9C — T1
- Layout tático próprio e menos simétrico.
- Casario residencial com compound massing em vez de um retângulo universal.
- Pátio/quadra comunitária, vielas locais, escadas e muretas.
- Massa urbana de borda sugere continuidade da comunidade além da área jogável.
- “Mapa inteiro” validado em 83% na viewport de QA.

## 0.9D — T4 Morro Vertical
- Patamares globais foram quebrados em bolsões locais.
- Casario em níveis foi adicionado entre pontos táticos.
- Contenções visuais e físicas foram segmentadas com vãos coerentes.
- Escadarias e acessos passam a costurar o morro em vez de apenas decorar.

## 0.9E — T2/T3
- T2: praça da feira deixou de ser um grande tapete único; ferrovia, estação, passarela, boxes e armazéns funcionam como um sistema.
- T3: pátio industrial virou área de uso poligonal, com circulação de serviço e menos geometria de “editor”.

## 0.9F/G — T5/T6 + Atmosfera
- T5: paleta aquecida, paisagismo assimétrico e faixa costeira/calçadão justificam a Orla.
- T6: arquitetura brutalista/operacional neutra; azul/vermelho restritos a domínio, placas, bandeiras e pequenos beacons.
- Removidos códigos de chão e linguagem de blueprint (`Z1/Z2/Z3`, `CHECK 01/02/03`).
- Iluminação de T5/T6 saiu do sci-fi para residencial/operacional.

## 0.9H — Gold Pass
- Zoom-out real: botão `Mapa inteiro`, mínimo 35%, fit observado em 83% na viewport 1536×864.
- Auditoria visual T1–T6 em `docs/screenshots/0.9h-final/`.
- Revisão ativa em `CITY_VIVA_VISUAL_REVISION`: `0.9h-brasil-organico-v1`.

## QA de fechamento
`npm run check` — PASS
- TypeScript: PASS.
- Foundation verification: PASS (12 verificações listadas pelo runner).
- Build Vite: PASS, 1744 módulos transformados.
- Build gerado em `dist/`.

## Próximo passo
- Playtest progressivo T1→T6 com foco em navegação, leitura em combate e densidade.
- Feedback visual do usuário vira 0.9.1: correções pontuais, sem reabrir a arquitetura-base.
- Depois: balance territorial e Combat Feel Pass.
