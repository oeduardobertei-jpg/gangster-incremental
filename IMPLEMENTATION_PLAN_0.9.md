# 0.9 — Brasil Orgânico / Favela Carioca

Status: **0.9H FEATURE-COMPLETE — BRASIL ORGÂNICO / GOLD PASS**

## Visão
A 0.9 é a grande reconstrução visual/autoral do mundo. O objetivo é sair de “prédios decorados sobre um mapa” e chegar a bairros que parecem ter crescido organicamente: arquitetura, chão, acessos, relevo, circulação, materiais e vida cotidiana contam a mesma história.

## Princípios não negociáveis
- Brasil urbano como identidade-base, sem caricatura ou decoração gratuita.
- T1 e T4 definem a linguagem de comunidade/morro; os demais territórios partem dela por contraste.
- Cada estrutura nomeada deve ser reconhecível pela silhueta antes de ler a placa.
- Construção e terreno precisam se tocar fisicamente: soleira, escada, pátio, contenção, sarjeta, beco ou corredor de serviço.
- Mais detalhe só entra quando melhora função, escala ou história ambiental.
- Física/pathing continuam soberanos: nenhum ganho visual pode criar obstáculo fantasma.
## Roadmap
### 0.9A — Arquitetura Orgânica
- famílias de massas construídas assimétricas;
- anexos, puxadinhos, lajes, coberturas e escadas externas;
- silhueta por função/nome, não apenas por paleta.

### 0.9B — Estrutura + Solo + Acessos
- soleiras, pátios, degraus, rampas, sarjetas e muros de contenção;
- chão responde ao uso da construção;
- acessos visuais seguem os acessos físicos.

### 0.9C — T1 Rework Completo
- comunidade/periferia como primeiro novo padrão de qualidade;
- casario comprimido, vielas, lajes, comércio e infraestrutura doméstica;
- macrocomposição legível em mapa inteiro e microdetalhe coerente em zoom próximo.
### 0.9D — T4 Morro Vertical
- patamares, escadarias e contenções passam a governar a composição;
- casas em níveis e pontos fortificados integrados ao relevo;
- leitura forte de morro/favela verticalizada.

### 0.9E — Rework Funcional T2 + T3
- T2: feira, ferrovia, estação, armazém e passarela como um sistema urbano único;
- T3: oficinas, galpões, carga e pátio industrial com circulação funcional.

### 0.9F — Contraste T5 + T6
- T5: orla/condomínio, paisagismo, portarias e segurança privada;
- T6: complexo central, hierarquia operacional e clímax visual.

### 0.9G — Atmosfera Global
- luz funcional, materiais, desgaste e vida cotidiana por território;
- reforço de profundidade sem ruído procedural gratuito.
### 0.9H — Clareza, Performance e Gold Pass ✅
- LOD e orçamento visual por zoom/carga de combate;
- limpeza de sobreposições e elementos redundantes;
- auditoria T1–T6 em mapa inteiro, 100% e zoom próximo;
- fechamento formal da 0.9.

## Ordem de execução
1. estabilizar HUD/câmera da 0.8X.4;
2. integrar a fundação carioca 0.9A/B;
3. finalizar T1 até atingir o novo padrão;
4. aplicar o padrão ao T4;
5. T2/T3;
6. T5/T6;
7. atmosfera global;
8. performance, QA e Gold Pass.

## Critérios de aceite da 0.9
- T1 e T4 não podem parecer variações do mesmo kit retangular.
- Uma estrutura importante deve comunicar função pela forma, não só pelo rótulo.
- Nenhum prédio deve parecer flutuar ou estar apenas “colado” ao chão.
- O mapa inteiro deve permanecer legível com zoom-out real.
- Rotas e colliders devem continuar coerentes com a arte.
- Cada território precisa ser identificável em screenshot sem HUD.
- TypeScript, foundation tests e build devem passar em cada fechamento de tranche.