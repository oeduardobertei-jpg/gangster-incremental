# Plano de Implementação 0.5 — Cidade Viva

> Direção: grande atualização visual. Mecânicas centrais e economia permanecem estáveis.

## Visão

A 0.5 deve fazer cada território parecer um lugar próprio e fazer a progressão do jogador existir visualmente no mundo, não apenas em números.

A meta não é “encher a tela de detalhes”. É elevar direção de arte, composição, profundidade, bases, upgrades, feedback e atmosfera mantendo a excelente legibilidade conquistada na 0.4.

### Frase-guia

**Entrar em um território novo deve parecer entrar em outra parte da cidade; comprar upgrades deve fazer a organização parecer mais poderosa.**

## Pilares

1. **Silhueta territorial** — reconhecer T1–T6 sem ler o nome.
2. **2.5D coerente** — volume, sombra e oclusão com regras consistentes.
3. **Bases memoráveis** — strongholds com arquitetura e estados próprios.
4. **Progressão visível** — upgrades deixam marcas no campo e nas tropas.
5. **Mundo vivo** — animação ambiental sutil, não ruído.
6. **HUD integrado** — mesma linguagem visual entre campo, minimapa e painéis.
7. **Performance preservada** — Canvas2D, cache e budgets explícitos.
## Não objetivos desta versão

Para manter o escopo visual e evitar misturar sistemas:

- não ativar ainda a operação territorial/captura física planejada anteriormente;
- não adicionar novas moedas;
- não reequilibrar progressão sem evidência de necessidade;
- não trocar Canvas2D por WebGL;
- não implementar navmesh/pathfinding complexo;
- não substituir os seis territórios por mapas gigantes;
- não criar efeitos que prejudiquem leitura de unidades/projéteis.

O rascunho anterior de conquista territorial foi preservado como `IMPLEMENTATION_PLAN_0.6_TERRITORIAL_OPERATION_DRAFT.md`.

## Arquitetura visual alvo

Hoje `territoryVisuals.ts` descreve principalmente cores e `territoryLandmarks.ts` adiciona adereços sobre uma planta comum. A 0.5 deve transformar isso em uma arquitetura dirigida por dados.

Novos módulos propostos:

- `data/visualTokens.ts` — materiais, sombras, luz e escalas globais;
- `data/territoryScenes.ts` — blueprint espacial de cada território;
- `data/upgradeVisuals.ts` — ícones, tiers e manifestações no mundo;
- `components/canvas/environmentRenderer.ts` — vias, pisos e props;
- `components/canvas/buildingSkins.ts` — famílias arquitetônicas;
- `components/canvas/lightingRenderer.ts` — lightmap e atmosfera;
- `components/canvas/worldProgressionVisuals.ts` — upgrades visíveis.
## 0.5A — Sistema de direção de arte

Antes de redesenhar mapas, estabelecer regras que todos os renderers devem obedecer.

### A1. Luz e sombra

- direção de luz principal única por território;
- sombra de prédio sempre coerente com a mesma direção;
- objetos baixos, médios e altos recebem comprimentos de sombra diferentes;
- ambient occlusion simples na base de paredes e objetos;
- evitar `ctx.filter = blur()` em massa; usar gradientes/cache.

### A2. Materiais

Criar tokens para asfalto, concreto, tijolo, metal, zinco, vidro, vegetação, água e pintura.

Cada material terá:

- cor-base;
- highlight;
- sombra;
- desgaste/decal opcional;
- resposta de iluminação simplificada.

### A3. Escala visual

Definir tamanhos consistentes para portas, janelas, postes, veículos, barricadas e sinalização. Hoje alguns landmarks parecem diagramas porque não compartilham escala arquitetônica.

### Gate 0.5A

Uma cena neutra de teste deve mostrar prédio, carro, poste, unidade e base com perspectiva e iluminação coerentes antes de redesenhar T1–T6.
## 0.5B — Blueprints espaciais por território

A mudança mais importante da versão.

Substituir a ideia de “mesma rua + outra decoração” por um `TerritorySceneBlueprint` configurável contendo:

- vias principais e secundárias;
- vielas/escadas/passagens;
- zonas de construção;
- landmark principal;
- posições de bases;
- grupos de props;
- zonas de iluminação;
- decals e sinalização;
- áreas reservadas para gameplay e spawn.

As coordenadas de gameplay continuam no mesmo mundo lógico 1280×720. O blueprint muda composição visual e pontos decorativos sem quebrar câmera, save ou IA.

### Regras

- nenhum detalhe decorativo pode criar hitbox surpresa;
- corredores usados pela IA permanecem amplos;
- unidades continuam dominando o contraste;
- elementos altos entram na fila de profundidade;
- geometria estática é cacheada por território.

### Gate 0.5B

Capturas sem HUD dos seis territórios devem ser distinguíveis entre si em miniatura.
## 0.5C — Identidade dos seis cenários

### T1 — Beco dos Descalços / Periferia

Direção: apertado, improvisado, doméstico e assimétrico.

- vielas quebradas em vez de duas faixas verticais perfeitas;
- tijolo aparente, reboco incompleto e telhados mistos;
- caixas d'água, varais, fios baixos, toldos e pequenos comércios;
- canaleta de drenagem, remendos de asfalto e calçadas irregulares;
- iluminação quente e esparsa;
- landmark: cruzamento comunitário com laje dominante e mural de facção.

### T2 — Praça da Feira & Linha do Trem

Direção: eixo horizontal forte, comércio e infraestrutura ferroviária.

- trilhos realmente moldam a composição;
- plataforma, passagem, sinal ferroviário e alambrado;
- barracas com toldos, carrinhos, caixas e lonas;
- iluminação âmbar e placas comerciais;
- áreas abertas contrastando com corredores apertados entre barracas;
- landmark: estação/plataforma central reconhecível pela silhueta.
### T3 — Avenida das Oficinas & Galpões

Direção: industrial, pesada, metálica e utilitária.

- pátio mais aberto e menos residencial;
- portas de enrolar, galpões, contêineres e pilhas de pneus;
- tubulações, grades, cavaletes e marcações de segurança;
- manchas de óleo, concreto reparado e faixas de circulação;
- raros flashes de solda/fumaça industrial como ambientação;
- landmark: oficina/galpão principal com letreiro e cobertura alta.

### T4 — Morro Alto / Reduto Fortificado

Direção: verticalidade simulada, contenção e defesa.

- ruas em terraços, muros de arrimo e escadas em zigue-zague;
- becos que visualmente sobem o morro;
- barreiras, portões, guaritas e refletores;
- concreto gasto, tijolo escuro e iluminação de alerta;
- silhueta de lajes sobrepostas reforçando altura;
- landmark: reduto superior visível como objetivo dominante.

### T5 — Mansões da Orla & Condomínios

Direção: riqueza, controle, espaço e frieza.

- vias mais largas, muros altos e recuos maiores;
- portarias, câmeras decorativas, jardins e árvores podadas;
- fachadas claras, vidro escuro, piscinas/espelhos d'água decorativos;
- iluminação branca/violácea organizada;
- pavimento mais limpo com danos pontuais do conflito;
- landmark: condomínio fechado com portão monumental.
### T6 — Complexo Central / Quartel-General Rival

Direção: simetria, autoridade e clímax.

- composição mais controlada e axial que os outros territórios;
- checkpoints, pátio interno, torres/antenas e barreiras de acesso;
- fachadas de comando com iluminação de emergência;
- conduítes, grades, câmeras e sinalização operacional;
- landmark principal deixa de ser um retângulo “QG” e vira um complexo com silhueta própria;
- luz vermelha/rosa usada como acento, sem tingir toda a cena.

O T6 deve parecer a culminação visual do jogo base, não apenas uma versão vermelha do T1.

## 0.5D — Bases e strongholds redesenhados

Criar `BuildingVisualFamily` por território em vez de depender apenas de `brick | laje | zinc`.

Cada base recebe:

- silhueta arquitetônica;
- material principal/secundário;
- porta/garagem própria;
- telhado e props de cobertura;
- placa/símbolo de função;
- iluminação prática;
- espaço para bandeira/grafite;
- versão de minimapa coerente.
### Estados visuais de uma base

Mesmo antes de ativarmos captura territorial como mecânica principal, o renderer deve suportar estados futuros:

1. rival ativa — cor, bandeira e luz rival;
2. sob pressão — sinalização visual curta, sem pulsação excessiva;
3. dominada — troca completa de identidade de facção;
4. base avançada — crates, rádio, barricadas e ponto de despacho;
5. objetivo especial — moldura arquitetônica/landmark, não apenas badge.

O protótipo territorial já existente poderá reutilizar esses estados na 0.6 sem refazer a arte.

### Gate 0.5D

Removendo todos os textos das bases, ainda deve ser possível distinguir uma estação, oficina, reduto, portaria e QG.

## 0.5E — Upgrades aparecem no mundo

Criar tiers visuais, não um objeto novo para cada nível. Sugestão: `0`, `1–24%`, `25–49%`, `50–74%`, `75–99%`, `máximo`.

Esses tiers podem alterar props do ponto de comando/base do jogador sem tocar na regra econômica.

Exemplos:

- **Bunkers/limite de tropa:** barricadas, sacos de material, guarita e crates adicionais;
- **Rádio/Intel:** antenas, mastros, cabos, painel e luzes de comunicação;
- **Auto-Munição:** caixas, prateleiras e carrinho/logística visual;
- **Médicos:** sinal médico genérico, maletas e iluminação dedicada;
- **Motos:** vagas/veículos estacionados na área de despacho;
- **Auto-Convocação:** central de despacho com rádio ativo e painel luminoso.
### Upgrades nas tropas

Alguns upgrades devem ganhar leitura visual discreta em marcos:

- coletes: mudança sutil no torso/placa frontal;
- calibres: variação de arma/muzzle sem transformar dano em poluição visual;
- veteranos: detalhe de uniforme/insígnia;
- fuzileiros e motos preservam suas silhuetas específicas.

A regra é: **mostrar progressão sem tornar o campo um catálogo de skins**.

## 0.5F — Overhaul visual do painel de upgrades

O painel atual é correto e legível; a 0.5 deve fazê-lo parecer parte do universo do jogo.

### Categoria como oficina

Cada aba ganha:

- cabeçalho próprio;
- ícone grande/símbolo;
- textura/padrão CSS discreto;
- cor semântica;
- pequena descrição da função da oficina.

### Cards

Adicionar:

- pictograma específico por upgrade;
- barra segmentada de nível/tier;
- destaque visual do próximo marco importante;
- efeito atual e próximo continuam explícitos;
- custo mantém prioridade;
- estado máximo ganha tratamento visual próprio;
- compra bem-sucedida recebe microfeedback de 250–400 ms.
### Hegemonia

Separar visualmente a Hegemonia das oficinas normais:

- material metálico/âmbar;
- emblemas maiores;
- árvore permanente com sensação de camada estratégica;
- confirmação visual clara do que será preservado/reiniciado;
- sem animações chamativas permanentes quando nada pode ser comprado.

### Responsividade

- modo compacto mantém 5 ícones sem exigir scroll horizontal;
- drawer mobile preserva cards legíveis;
- painel recolhido continua acessível em um clique;
- Space permanece comando de recrutamento mesmo ao navegar nas abas.

## 0.5G — 2.5D, profundidade e iluminação

### G1. Regra de altura

Adicionar metadados simples aos objetos: `ground`, `low`, `mid`, `high` ou `visualHeight`.

Usar isso para:

- fachada e telhado;
- sombra projetada;
- ordem de desenho;
- oclusão parcial de unidades.

### G2. Lightmap estático

Pré-renderizar por território:

- zonas quentes/frias;
- halos de postes estáticos;
- sombra de grandes prédios;
- vinheta espacial muito leve.

O lightmap entra no cache e não custa blur por frame.
### G3. Luz dinâmica barata

Reservar dinâmica apenas para elementos de alto valor:

- muzzle flash já existente;
- letreiro/farol específico;
- alerta de base/objetivo;
- reflexo curto de evento importante.

Sem sombras dinâmicas por unidade.

### G4. Atmosfera por território

Criar poucos emissores contextuais:

- poeira/papel na periferia;
- luz de sinal e lona na feira;
- fumaça/solda industrial;
- refletores no morro;
- reflexos frios/vegetação na orla;
- luz operacional no QG.

Limite rígido de partículas ambientais separado do combate.

## 0.5H — Props, decals e microvida

Criar biblioteca procedural reutilizável:

- cones, caixas, pallets, tambores, bancos, placas;
- fiação, antenas, câmeras decorativas, grades;
- poças, rachaduras, manchas, remendos;
- cartazes/grafites/fachadas comerciais;
- vegetação e vasos onde fizer sentido.

Props decorativos devem usar seeds determinísticas por território para não “piscar” entre renders.

O objetivo é aumentar densidade percebida sem aumentar densidade de hitboxes.
## 0.5I — HUD, minimapa e transições

### HUD

Refinar sem aumentar altura:

- território ganha pequeno emblema/símbolo próprio;
- progresso usa contraste mais forte e menos bordas concorrentes;
- estados automáticos usam chips compactos;
- mensagens importantes entram e saem, não ocupam espaço permanente.

### Minimap

O minimapa deve refletir melhor a identidade espacial:

- trilhos do T2;
- grandes galpões do T3;
- terraços do T4;
- muros do T5;
- complexo central do T6;
- strongholds com ícones de estado consistentes com o campo.

### Transição de território

Ao avançar:

1. fade curto do campo;
2. título do novo distrito;
3. subtítulo/identidade visual;
4. câmera apresenta o landmark principal;
5. HUD retorna sem interromper o fluxo por mais de ~1 s.

Adicionar opção de movimento reduzido para simplificar essa transição.
## 0.5J — Polimento de unidades e combate

A 0.4C já resolveu semântica e leitura. A 0.5 deve evitar redesenhar tudo e focar acabamento.

### Unidades

- reforçar sombra de contato conforme altura;
- pequenos marcos visuais de equipamento por tier;
- animação de caminhada mantém silhueta clara;
- motos recebem sombra/rodas mais convincentes;
- chefes/elites ganham presença por forma e iluminação, não por excesso de partículas.

### Combate

- muzzle flashes alinhados com luz do território;
- projéteis/tracers mantêm contraste constante;
- impactos em metal, concreto e solo podem ter microvariações visuais;
- limitar feedback simultâneo para não esconder as tropas;
- números de dano continuam opcionais.

### Movimento orgânico

A 0.4.1 vira requisito visual da 0.5: grupos devem ocupar espaço e formar linhas naturais ao redor de bases/ruas. Cenários novos serão avaliados com 30, 60 e 135 aliados para detectar corredores estreitos ou empilhamentos visuais.

## 0.5K — Performance e budgets

A atualização só entra se mantiver o gate de desempenho.
### Budgets propostos

- geometria estática: 100% cacheada por território;
- lightmap estático: cacheado;
- partículas ambientais: alvo <= 100, teto absoluto <= 160;
- textos ambientais dinâmicos: evitar;
- animações de props: poucos emissores e sem loops caros por objeto;
- `ctx.shadowBlur`/filters: somente em casos muito limitados ou pré-renderizados;
- nenhum `sort()` novo por frame fora da fila de profundidade já existente;
- nenhuma alocação grande de arrays no renderer quente.

### Gate de FPS

Repetir os cenários da 0.4G:

- A: 15 aliados / 12 rivais / 1x;
- B: 60 aliados / 24 rivais / 2x;
- C: 135 aliados / 32 rivais / 5x;
- C + pan/zoom/mouse contínuos.

Mínimo absoluto: **30 FPS**.

Meta de qualidade: cenário C estável acima de **45 FPS** na máquina de aceite atual.

Se o visual reduzir performance, otimizar cache/culling antes de remover identidade artística importante.

## 0.5L — Acessibilidade visual

- aliado/rival nunca dependem somente de vermelho/azul;
- base rival/dominada usam forma + cor;
- texto mantém contraste mínimo forte sobre cenário;
- opção de movimento reduzido afeta transições e ambiente, não feedback crítico;
- zoom distante preserva marcadores essenciais e simplifica decoração.
## Ordem de implementação recomendada

1. **0.5A — tokens, materiais, luz e escala**
2. **0.5B — arquitetura de blueprint territorial**
3. vertical slice visual completo do **T1**
4. validação de legibilidade/performance do T1
5. **0.5D — nova arquitetura de bases**
6. **0.5E — progressão/upgrades visíveis no mundo**
7. **0.5F — painel de upgrades**
8. **0.5G/H — profundidade, iluminação, props e atmosfera**
9. expandir blueprint/art direction para **T2–T6**
10. **0.5I/J — HUD, minimapa, transições e combate**
11. **0.5K/L — performance, acessibilidade e fechamento**

A regra principal é não redesenhar seis territórios de uma vez. O T1 deve provar a linguagem visual, a arquitetura e o budget primeiro.

## Vertical slice obrigatório: T1

Antes de produzir T2–T6, o Beco dos Descalços precisa demonstrar:

- layout novo reconhecível;
- prédios 2.5D coerentes;
- base rival com nova silhueta;
- base do jogador reagindo a tiers de upgrades;
- luz/sombra definitiva;
- ambientação viva;
- minimapa correspondente;
- painel de upgrades novo;
- 30+ tropas sem perda de leitura;
- FPS dentro do gate.
## Matriz de testes visuais

Capturas automatizadas padronizadas:

### Por território

- 100% zoom, painel aberto;
- 100% zoom, modo Foco;
- zoom distante;
- zoom próximo;
- 30 aliados em combate;
- boss/elite em campo;
- upgrade visual baixo vs alto/máximo.

### Viewports

- 1440×900 desktop;
- 1440×600 janela baixa;
- 1024×700 tablet/compacto;
- 390×740 mobile;
- DPR 1.5 para nitidez.

### Comparações

- screenshot baseline da 0.4G;
- screenshot da 0.5 por território;
- leitura em miniatura 25%;
- captura sem HUD para validar identidade pura do cenário.

## Critérios de aceite visual

A 0.5 só fecha se um avaliador conseguir identificar pelo menos 5 dos 6 territórios sem ler o nome, usando apenas composição e arquitetura.
Outros critérios:

- bases devem ser distinguíveis sem depender da caixa de texto;
- comprar um upgrade importante deve produzir mudança visual perceptível em pelo menos um marco de tier;
- HUD não pode esconder a nova arte nem crescer em altura;
- unidades continuam legíveis contra todos os materiais;
- minimapa corresponde à composição real;
- nenhuma animação ambiental compete com projéteis, loot ou objetivos;
- smoke funcional anterior continua verde;
- save/reload não altera aparência de tiers derivados dos upgrades.

## Estratégia de produção artística

Priorizar arte procedural/vetorial Canvas2D e CSS para manter consistência e evitar dependência de um grande pacote de assets.

Quando um elemento exigir riqueza extra, usar pequenos sprites/atlases próprios e cacheáveis, nunca centenas de imagens soltas.

A melhor relação qualidade/custo virá de:

1. composição;
2. silhueta;
3. material;
4. sombra;
5. iluminação;
6. microdetalhe por último.

Essa ordem evita gastar tempo em detalhes que desaparecem no zoom normal.

## Definição de concluído

A 0.5 estará concluída quando o jogo parecer visualmente uma versão nova mesmo sem alterar suas regras: seis distritos próprios, bases com presença, progressão visível no mundo, painel de upgrades com identidade, 2.5D coerente, atmosfera viva e desempenho ainda acima dos gates estabelecidos na 0.4/0.4.1.
