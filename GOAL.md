# GOAL — objetivo ativo

## Base canônica
**Gangster Incremental 1.1.0 GOLD** é a base estável e não deve ser regredida. O T1 é o padrão de qualidade visual, de leitura, câmera e integração física para os demais territórios.

## Missão atual — 1.1.1 World Living Infrastructure
Expandir o framework incremental de arquitetura que estreou na **Base de Comando** para construções físicas já existentes no mapa, sem criar sistemas paralelos e sem reabrir bugs de colisão, pathfinding ou LOS.

A primeira vertical slice pós-Gold é **Bocas & Esconderijos**, começando pelas construções físicas `esconderijo` e `boca_leste` do T1.

### Princípio
O cenário deve mostrar mecanicamente o crescimento da facção. Uma construção só recebe evolução visual quando os upgrades associados têm significado físico naquele edifício.

Para Bocas & Esconderijos, a progressão visual responde a:
- `boca_fortified_bunkers` — fortificação estrutural;
- `boca_barricades` — defesas de fachada/acesso;
- `boca_fuzileiros_elite` — posto elevado de segurança;
- `boca_auto_ammo_scavenge` — logística/caixas de munição;
- `armory_medics_safehouse` — posto médico clandestino.

## Critérios de pronto da 1.1.1
1. A progressão reutiliza `incrementalBuildingVisuals.ts`; nenhuma segunda engine de evolução visual é criada.
2. Bocas & Esconderijos possuem estágios legíveis de maturidade, com crescimento contínuo dentro de cada estágio.
3. A identidade arquitetônica original do T1 permanece reconhecível; evolução adiciona módulos, não substitui o edifício por outro asset desconectado.
4. A progressão não aumenta nem desloca o collider físico das construções.
5. Mudanças de facção/captura continuam controlando cor e identidade territorial sem hardcode vermelho/azul no renderer novo.
6. LOD preserva leitura em zoom aberto e detalhe em zoom próximo.
7. Existe preview/teste determinístico dos estágios e tiers para evitar regressão silenciosa.
8. `npm run check` permanece verde antes de merge.
9. Mudança visual só é considerada fechada após inspeção em runtime; TypeScript/build sozinho não substitui QA visual.

## Ordem de implementação
1. Perfil mecânico e thresholds de Bocas & Esconderijos.
2. Renderer modular de crescimento visual.
3. Teste de aceitação do perfil.
4. Integração do perfil ao `GameState` e ao pipeline de `buildingSkins`.
5. Preview DEV/aceite focal T1.
6. QA de colisão, LOS, pathfinding, câmera e legibilidade.
7. Após aprovação da vertical slice, escolher a próxima família física de construção com base em função de gameplay, não apenas em nomenclatura.

## Restrições permanentes
- Não regredir a 1.1.0 GOLD para checkpoints antigos.
- Não voltar a tratar conquista como simples barra abstrata; o modelo físico territorial é canônico.
- Não adicionar decoração sem função quando ela competir com leitura de combate.
- Não declarar visual como aprovado sem runtime/localhost ou evidência equivalente.
