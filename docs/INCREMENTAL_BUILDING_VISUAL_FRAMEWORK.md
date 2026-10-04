# Incremental Building Visual Framework

Revision: `0.9.10p-incremental-command-framework-v1`

## Objetivo
Transformar upgrades numéricos em evolução física legível no mapa sem alterar colisão, spawn, pathfinding ou save.
A Base de Comando é a primeira implementação e serve como referência para futuras construções incrementais.

## Arquitetura
- `src/rules/incrementalBuildingVisuals.ts`: motor genérico de score, estágio, progresso e maturidade.
- `src/rules/baseCommandVisualProgression.ts`: configuração específica da Base, grupos, tiers e previews.
- `src/components/canvas/worldProgressionVisuals.ts`: renderer visual da Base.
- `src/components/dev/BaseCommandVisualPreview.tsx`: QA manual sem persistência.
- `window.__BASE_VISUAL_PREVIEW__`: QA automatizado em ambiente DEV.

## Contrato de progressão
1. Cada upgrade visual possui `id`, `max` e opcionalmente `group`.
2. O score é a soma dos níveis reais configurados.
3. Thresholds transformam score em estágios macro.
4. `stageProgress` mede crescimento dentro do estágio atual.
5. `maturity = stage + stageProgress` dirige crescimento contínuo da casca.

## Regras de leitura visual
- Estágio macro deve mudar a silhueta, não apenas adicionar pequenos props.
- Upgrades específicos ocupam zonas físicas previsíveis da mesma construção.
- Um módulo concluído nunca regride ao entrar em estágio superior.
- Tiers visuais usam uma única fonte de verdade compartilhada entre UI e renderer.
- Hegemonia adiciona marcas de prestígio sem substituir a progressão normal.
- O corredor de spawn permanece livre em todos os estágios e builds.

## LOD
- Zoom aberto simplifica microdetalhes, mas preserva silhueta, cor de facção e leitura da entrada.
- 100% é o LOD normal e deve mostrar os módulos principais.
- Zoom próximo libera ferragens, costuras, racks e materialidade fina.

## Preview DEV
O preview recebe um `BaseCommandVisualProfile` diretamente no renderer.
Ele nunca altera `gameState`, upgrades, recursos ou conteúdo persistido.
Presets atuais: E0–E3, quatro árvores extremas, tier isolado 0–5, Tudo Máximo e Hegemonias.
O badge `DEV · Base: ...` deixa explícito quando o mapa não representa o estado real.

## Como adicionar a próxima construção incremental
1. Criar specs da construção e thresholds de estágio.
2. Reutilizar `incrementalBuildingVisuals.ts` para score/stage/progress/maturity.
3. Criar perfil específico com tiers e grupos sem duplicar a matemática genérica.
4. Construir renderer visual-only com casca macro + módulos por upgrade.
5. Manter collider e spawn em suas fontes físicas existentes, salvo decisão explícita de gameplay.
6. Adicionar preview DEV equivalente e uma API automatizável.
7. Criar captura E0→último estágio, perfis extremos, Tudo Máximo e prestígio.
8. Travar invariantes em `verify-foundation.ts` e criar aceite focal sem persistência.

## Gates da primeira implementação
- `npm run check`: PASS.
- `acceptance-051-world.mjs`: 20/20 PASS, 0 violações físicas.
- `acceptance-057-spawn-ownership.mjs`: 7/7 PASS.
- `verify-evolution-layout.mjs`: 69/69 PASS de 1440 px a 320 px.
- `acceptance-0910-base-preview.mjs`: 7/7 PASS; preview não altera save.
- `acceptance-0910-base-promotion.mjs`: 10/10 PASS; E1/E2/E3 promovem pela UI com feedback correto.
- Galeria: `docs/screenshots/base-incremental-0910NO/`.

## Regra de ouro
A evolução deve parecer que **a mesma construção foi sendo reformada, ampliada e profissionalizada**, nunca que objetos aleatórios foram empilhados em cima dela.
