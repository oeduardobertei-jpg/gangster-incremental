# Plano de Implementação 0.4 — Campo Legível

> Estado: proposta para aprovação. Não implementar os pacotes abaixo até confirmação.

## Objetivo

Transformar o campo de batalha em uma área realmente navegável, legível e escalável sem alterar as regras centrais de progressão da 0.3.

A 0.4 deve melhorar cinco pilares:

1. câmera e espaço lógico do mapa;
2. leitura imediata de aliados, rivais, elites e espólios;
3. HUD de combate e clareza das ações;
4. desempenho em grandes quantidades de unidades e velocidade 5x;
5. identidade visual distinta entre os territórios.

## Diagnóstico atual

### P0 — Arquitetura de câmera

- O tamanho do mundo é hoje igual a `canvas.width` e `canvas.height`.
- Redimensionar a janela muda implicitamente as dimensões do campo de batalha.
- Zoom menor que 100% apenas reduz o mesmo mapa, sem revelar um mundo maior.
- Pan não possui limites e pode deslocar o cenário para fora da tela.
- O zoom é ancorado no centro, não no ponto sob o cursor.
- A câmera usa offsets de tela em vez de um centro em coordenadas de mundo.
### P0 — Nitidez e resolução

- O backing store do canvas usa pixels CSS diretamente.
- `devicePixelRatio` não é considerado, causando perda de nitidez em monitores HiDPI e escalas do Windows acima de 100%.
- O resize usa `window.resize`; um `ResizeObserver` no container será mais confiável.

### P0 — Loop sendo recriado pelo mouse

- `mousePos` e `hoveredEntity` são estados React incluídos nas dependências do efeito principal do `requestAnimationFrame`.
- Cada movimento do mouse pode desmontar e recriar o loop de batalha.
- `pan` também é estado React, embora o valor efetivamente usado pelo renderer seja `panRef`.
- Durante drag, `setPan` provoca renders React desnecessários.

### P1 — Renderização cara

- `drawFavelaTileset` redesenha terreno, ruas, construções, gradientes, fios, postes e detalhes em todo frame.
- A maior parte desses elementos é estática.
- O arquivo `favelaRenderer.ts` possui cerca de 2.900 linhas e ainda mantém versões duplicadas de sprites que já existem em `soldierSprites.ts`.
- Não há culling explícito de entidades fora da câmera.
- Partículas e textos flutuantes podem crescer muito durante combate acelerado.

### P1 — Escala de IA

- Limite máximo atual: 135 aliados (`15 + 40 × 3`).
- Território final: até 32 rivais.
- Busca de alvo é aproximadamente O(A×R) para os dois lados.
- Separação de rivais adiciona O(R²).
- Em 5x podem ocorrer vários passos fixos de simulação por frame.
- Spatial hash só deve ser implantado se o profiler confirmar necessidade após as otimizações de render/input.
### P1 — Leitura de unidades

- Sprites têm muitos microdetalhes que desaparecem no zoom normal.
- Aliados não possuem marcador de facção/semântica tão explícito quanto rivais.
- Rivais sempre exibem tag e HP, produzindo ruído quando há muitos inimigos.
- Não existem marcadores claros de função: olheiro, pistoleiro, fuzileiro, gerente, blindado e chefe.
- Hover não inclui aliados nem construções táticas.
- Feedback de dano pode gerar muitos textos simultâneos em 2x/5x.

### P1 — HUD de combate

- Progresso territorial no HUD principal é principalmente uma barra fina, sem `atual/necessário` evidente.
- O banner interno do canvas compete visualmente com ResourceBar, botão de avanço e controles de câmera.
- A ajuda de comandos ocupa permanentemente a parte inferior do campo.
- Não existe minimapa.
- Não há preview visual claro de onde uma convocação será feita antes do clique.

### P2 — Identidade dos territórios

- Os territórios alteram principalmente multiplicadores e paleta, mas reutilizam a mesma composição espacial.
- O avanço pode parecer apenas uma troca de números.
- A 0.4 deve preparar identidade visual distinta sem implementar ainda a mecânica de conquista estrutural da 0.5.

## Arquitetura-alvo

- Mundo lógico fixo separado do viewport.
- Câmera baseada em `centerX`, `centerY` e `zoom`.
- Conversões únicas `screenToWorld()` e `worldToScreen()`.
- Canvas HiDPI com coordenadas lógicas em pixels CSS.
- Render estático cacheado em offscreen canvas.
- Overlays de legibilidade desenhados em screen-space com tamanho constante.
- Simulação continua em refs; React controla apenas HUD e menus de baixa frequência.
## 0.4A — Fundação de câmera e mundo

### A1. Mundo lógico fixo

- Introduzir constantes de design, inicialmente `WORLD_WIDTH = 1280` e `WORLD_HEIGHT = 720`.
- Toda IA, spawn, obstáculos e construções passam a usar essas dimensões, não o tamanho físico do canvas.
- Resize da interface não altera coordenadas de unidades vivas.

### A2. Camera2D

Criar um módulo dedicado com:

- `centerX` / `centerY` em coordenadas do mundo;
- `zoom`;
- limites mínimo/máximo;
- `screenToWorld`;
- `worldToScreen`;
- clamp contra os limites do mapa;
- reset/centralização.

### A3. Zoom sob o cursor

Ao girar a roda:

1. guardar a coordenada mundial sob o cursor;
2. alterar zoom;
3. ajustar o centro da câmera;
4. garantir que o mesmo ponto continue sob o cursor.

### A4. Input moderno

- Migrar mouse handlers para Pointer Events.
- Usar `setPointerCapture` durante pan.
- Preservar clique rápido para convocação.
- Não disparar convocação após um drag.
- Preparar compatibilidade futura com touch/stylus.

### A5. HiDPI

- `canvas.width = cssWidth × devicePixelRatio`.
- `canvas.height = cssHeight × devicePixelRatio`.
- Render em unidades lógicas após `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`.
- `ResizeObserver` no container.
### Gate 0.4A

- resize não move entidades;
- zoom mantém o ponto sob o cursor;
- câmera não sai do mundo;
- recrutar após pan/zoom continua preciso;
- canvas permanece nítido em escala de Windows >100%.

## 0.4B — Render e performance

### B1. Loop estável

- mover `mousePos` e hover para refs;
- remover `pan` React state;
- impedir que mousemove recrie o `requestAnimationFrame`;
- manter apenas estado React necessário ao texto de zoom/cursor.

### B2. Cache do mapa

Separar renderer em duas camadas:

- `staticMapLayer`: chão, vielas, ruas, prédios, postes, obstáculos decorativos;
- `ambientLayer`: bandeiras, luzes pulsantes e detalhes realmente animados.

A camada estática é redesenhada somente quando mudarem território, facção ou dimensões lógicas do mundo.

### B3. Culling e LOD

- calcular retângulo visível da câmera;
- não desenhar sprites/loot/efeitos fora do viewport + margem;
- zoom distante usa representação simplificada;
- zoom normal/próximo usa sprite completo.

### B4. Limites visuais

- teto para partículas simultâneas;
- teto para floating texts;
- agregar pequenos números de dano por unidade em janela curta;
- manter bosses/eventos importantes sem agregação.

### B5. Limpeza do renderer

- remover cópias antigas de `drawAllySprite`/`drawRivalSprite` de `favelaRenderer.ts`;
- dividir mapa, loot/efeitos e sprites em módulos menores;
- preservar regras de combate fora do renderer.

### Gate 0.4B

- mover mouse continuamente não reinicia o loop;
- mapa estático não é reconstruído por frame;
- nenhuma regressão de colisão/save/recrutamento;
- cenário de stress continua responsivo em 5x.
## 0.4C — Leitura visual das unidades

### C1. Silhueta antes de detalhe

- manter a arte atual, mas reforçar massas principais do corpo e arma;
- reduzir microdetalhes que desaparecem em zoom normal;
- usar contraste de contorno para separar unidade e cenário;
- manter variantes visuais, mas garantir que todas tenham leitura semelhante à distância.

### C2. Semântica aliado/inimigo

Adicionar marcadores que não dependam apenas de vermelho/azul:

- aliado: anel/chevron de forma própria;
- rival: marcador geométrico diferente;
- elite/boss: contorno e badge exclusivos;
- marcadores em screen-space para manter tamanho legível em qualquer zoom.

### C3. Função tática

Criar ícones simples por papel:

- Olheiro: olho/ponto de observação;
- Pistoleiro: marcador básico;
- Fuzileiro: mira;
- Gerente: estrela/insígnia;
- Blindado: escudo;
- Chefe: coroa/diamante.

Mostrar permanentemente apenas elites/bosses; demais aparecem em hover ou zoom próximo.

### C4. HP e estados

- aliado: HP apenas ao ser ferido, selecionado ou hovered;
- rival comum: HP ao ser ferido/hovered;
- elite/boss: HP sempre visível;
- estados críticos recebem feedback curto, não animações permanentes.

### C5. Hover melhorado

Hover passa a reconhecer:

- aliados;
- rivais;
- espólios;
- obstáculos;
- construções táticas.

Tooltip mostra nome, papel e HP sem cobrir o alvo.

### Gate 0.4C

Em 100% de zoom, deve ser possível identificar em menos de um segundo:

- quem é aliado;
- quem é rival;
- quem é elite/boss;
- quem está ferido;
- onde existe loot coletável.
## 0.4D — HUD de combate e clareza das ações

### D1. Combat HUD compacto

Substituir o banner atual por uma faixa objetiva com:

- território;
- progresso `neutralizações atuais / requisito`;
- aliados ativos / limite;
- rivais em campo;
- estado da Auto-Convocação e Auto-Munição quando relevantes.

Atualização do HUD em frequência baixa/controlada, sem React por frame.

### D2. Objetivo e avanço

- progresso numérico evidente;
- CTA de avanço só quando realmente liberado;
- eliminar animação pulsante contínua quando não necessária;
- conclusão de território recebe feedback breve e claro.

### D3. Preview de convocação

Antes do clique:

- mostrar marcador no chão;
- indicar custo `10 Intel`;
- verde quando válido;
- aviso visual quando pausado, sem Intel ou sem capacidade;
- desaparecer durante pan.

### D4. Loot

- badge de Grana/Munição em screen-space;
- countdown visual simples;
- hover com valores exatos;
- reduzir texto e emoji desenhados diretamente no mundo.

### D5. Ajuda contextual

- remover guia permanente da parte inferior;
- exibir onboarding curto nas primeiras interações;
- botão `?` para reabrir controles;
- atalhos permanecem acessíveis por tooltip.
### D6. Minimap

- minimapa compacto no canto inferior direito;
- pontos de aliados, rivais e strongholds;
- retângulo mostrando viewport atual;
- clique para recentralizar câmera;
- atualização barata, sem redesenhar o mapa completo.

### Gate 0.4D

- o jogador entende objetivo e progresso sem abrir modal;
- convocação sempre comunica local/custo/recusa antes do clique;
- minimapa acompanha pan e zoom corretamente;
- HUD não reduz perceptivelmente o FPS.

## 0.4E — Identidade visual dos territórios

Criar `territoryVisuals.ts` separado das regras econômicas.

Cada território recebe:

- paleta de chão/edificações;
- iluminação/ambiente;
- landmark principal;
- sinalização/grafite;
- densidade decorativa;
- detalhes próprios, sem alterar hitboxes essenciais.

Direção proposta:

1. Beco dos Descalços — vielas, casas simples, iluminação baixa;
2. Feira/Linha do Trem — comércio e trilhos;
3. Oficinas/Galpões — metal, óleo e ambiente industrial;
4. Morro Alto — fortificações, muros e lajes;
5. Mansões/Condomínios — concreto limpo, muros e iluminação fria;
6. Complexo Central — forte rival, maior presença visual da facção.

O fundo deve ter contraste menor que unidades e itens interativos.
## 0.4F — Layout responsivo e foco no campo

- remover dependência de `min-h-[480px]` quando ela causar overflow;
- usar `min-h-0` nas áreas flexíveis;
- permitir recolher o painel de upgrades no desktop;
- em telas menores, trocar painel empilhado por abas/overlay;
- manter o campo como elemento visual prioritário.

## 0.4G — Instrumentação, testes e aceite

### G1. Overlay de diagnóstico de desenvolvimento

Atalho de debug opcional mostrando:

- FPS;
- frame time;
- passos de simulação;
- aliados/rivais;
- projéteis;
- partículas;
- zoom/câmera.

Não aparece no build/jogabilidade normal.

### G2. Cenários de stress

Testar no mínimo:

- início: 15 aliados / 12 rivais / 1x;
- médio: 60 aliados / 24 rivais / 2x;
- máximo: 135 aliados / 32 rivais / 5x;
- combate com muitos projéteis/loot;
- pan/zoom contínuo durante batalha.

### G3. Regressão funcional

- recrutamento botão/teclado/mapa;
- pausa;
- Auto-Convocação;
- Auto-Munição;
- upgrades D6 em tropas vivas;
- avanço territorial;
- Hegemonia;
- snapshot/reload da versão atual;
- clique correto após qualquer zoom/pan.

### G4. Smoke visual

Capturar estados padronizados:

- 100% de zoom;
- zoom distante;
- zoom próximo;
- boss em campo;
- loot no chão;
- minimapa e objetivo concluído.
## Ordem recomendada de execução

1. **0.4A — câmera/mundo/HiDPI**
2. **0.4B — loop estável/cache/culling**
3. smoke funcional antes de qualquer redesign visual
4. **0.4C — leitura de unidades**
5. **0.4D — HUD/minimapa/preview de ações**
6. smoke visual e de interação
7. **0.4E — identidade dos territórios**
8. **0.4F — layout/focus mode**
9. **0.4G — stress, regressão e fechamento**

## Decisões para evitar retrabalho

- câmera e mundo vêm antes de minimapa e overlays;
- performance vem antes de adicionar mais efeitos;
- overlays de unidade usam screen-space desde o início;
- visual de território fica separado da economia;
- nenhuma migração de save legado será feita durante esta fase;
- se estrutura de estado mudar, testes começam em save novo.

## Fora de escopo da 0.4

- pontos de captura funcionais;
- edifícios conquistáveis/destruição estratégica de strongholds;
- diplomacia ou novas facções;
- reescrita completa em WebGL;
- grande refatoração da IA sem evidência do profiler;
- preservação de saves de versões anteriores.

Esses itens ficam para 0.5+.

## Critério para chamar a 0.4 de concluída

A versão só fecha quando o campo continuar legível e controlável em 1x, 2x e 5x, o resize não alterar o mundo, o zoom/pan não quebra comandos, o mapa não for redesenhado proceduralmente do zero a cada frame e os testes funcionais anteriores continuarem verdes.
