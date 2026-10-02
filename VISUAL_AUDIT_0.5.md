# Auditoria Visual para a 0.5 — Cidade Viva

> Base analisada: código e capturas da 0.4E/0.4F/0.4G, mais validação pós-0.4.1.

## Resumo

A 0.4 resolveu legibilidade, câmera, minimapa, foco de campo e identidade básica dos seis territórios. A base visual já é funcional e coerente, mas ainda transmite a sensação de um **mesmo mapa redesenhado com outras cores e alguns adereços**.

O salto de qualidade da 0.5 deve vir menos de “adicionar mais detalhes” e mais de quatro mudanças estruturais:

1. composição espacial realmente diferente por território;
2. arquitetura e bases com silhuetas próprias;
3. progressão visual — upgrades e domínio precisam aparecer no mundo;
4. profundidade, iluminação e animação ambiental sem prejudicar a leitura.

## O que já funciona bem

- Paleta escura mantém unidades e recursos legíveis.
- Câmera, zoom, pan e minimapa já suportam uma cena mais rica.
- Cada território possui uma cor/acento e ao menos um landmark reconhecível.
- O campo suporta 135 aliados + 32 rivais em 5x dentro do orçamento.
- Os prédios já possuem fachada/rooftop simples e render por profundidade.
- Bandeiras e grafites já fornecem linguagem de facção reutilizável.
- O modo Foco permite reservar toda a tela para uma apresentação mais cinematográfica.
## Problema 1 — Mesma espinha dorsal em todos os territórios

Nas seis capturas, a leitura macro permanece quase idêntica:

- estrada curva vertical no centro;
- duas vielas verticais laterais;
- escada no quadrante esquerdo;
- carro abandonado central;
- prédios nas mesmas regiões;
- postes e cabos em padrões muito parecidos.

Os trilhos do T2, contêineres do T3, fortificações do T4, condomínios do T5 e QG do T6 ajudam, porém atuam como uma camada sobre a mesma planta.

**Conclusão:** a 0.5 precisa separar `layout` de `palette`. Cada território deve possuir um blueprint próprio de ruas, corredores, praças, bolsões, marcos e densidade.

## Problema 2 — Landmarks ainda parecem diagramas

Vários elementos são desenhados como retângulos, linhas e áreas sem volume suficiente. O QG Central, por exemplo, comunica “QG” pelo texto e contorno antes de comunicar pela arquitetura.

A feira, os galpões e as mansões melhoraram a identidade, mas ainda não têm uma silhueta forte quando o texto é removido.

**Meta:** o território deve ser reconhecível numa captura sem HUD, sem nome e em escala reduzida.
## Problema 3 — Bases táticas são funcionais, mas genéricas

`drawTacticalBuilding()` usa essencialmente três materiais: tijolo, laje e zinco. As bases compartilham o mesmo vocabulário de fachada, porta, janela, caixa de nome, tanque e bandeira.

Isso funciona para leitura, mas uma Boca da Leste, uma Estação Leste, uma Oficina Leste, um Reduto do Morro, uma Portaria Leste e um Comando Leste ainda parecem variações do mesmo objeto.

**Oportunidade:** introduzir famílias arquitetônicas por território e estados visuais de controle:

- rival ativo;
- sob pressão/contestado;
- dominado pelo jogador;
- base avançada fortificada;
- estrutura especial/chefe.

A troca de facção deve alterar mais que uma cor: bandeira, luz prática, grafite, barricadas, caixas, antenas e presença de tropas podem mudar.

## Problema 4 — Progressão econômica quase não aparece no campo

Comprar colete, calibre, motos, bunkers, rádios, médicos ou automações melhora números, mas grande parte dessas decisões só é percebida no painel e nas estatísticas.

Para um incremental visual, isso perde uma oportunidade enorme: o jogador deveria **ver a organização ficando mais poderosa**.

A 0.5 deve criar manifestações visuais dos upgrades sem mudar suas regras econômicas.
## Problema 5 — Painel de upgrades é legível, porém uniforme

Os cards atuais têm boa hierarquia textual, custos corretos e efeitos `atual → próximo`, mas praticamente todos compartilham a mesma caixa escura, o mesmo ritmo e o mesmo botão.

As categorias mudam de cor, mas não têm uma identidade de “lugar”:

- Arsenal poderia parecer bancada/armaria técnica;
- Bocas & Apoio, logística territorial;
- Rádios & Intel, central de comunicações;
- Sindicato, rede operacional;
- Hegemonia, camada premium/permanente.

Também falta uma leitura visual rápida de nível. Um upgrade Nvl 40/50 deveria parecer muito mais avançado que o mesmo item Nvl 2/50 sem depender somente do número.

## Problema 6 — Profundidade visual inconsistente

O jogo mistura top-down puro com elementos 2.5D: fachadas de prédios, sombras, sprites e estrada. O resultado já sugere profundidade, mas ainda não existe uma regra única de perspectiva.

A 0.5 pode consolidar um **2.5D leve**, mantendo Canvas2D:

- alturas coerentes de fachadas;
- sombras projetadas numa direção comum;
- objetos baixos/médios/altos em camadas;
- oclusão previsível;
- escalonamento muito sutil por eixo Y onde fizer sentido.

Não é necessário migrar para WebGL nem alterar a física do mundo.
## Problema 7 — Atmosfera ainda é pouco viva

O campo possui postes, bandeiras e alguns detalhes animados, porém grandes áreas continuam estáticas. Como o jogo é assistido por longos períodos, microanimações ambientais têm alto retorno visual.

Boas opções de baixo custo:

- letreiros e lâmpadas com flicker controlado;
- fumaça de exaustão/chaminé em poucos pontos;
- papéis/poeira atravessando ruas;
- reflexos de poças e janelas;
- ventiladores, antenas e cabos balançando;
- faróis ou luzes de serviço em territórios avançados.

Esses efeitos devem ser raros e contextuais. O campo não pode virar ruído visual.

## Problema 8 — HUD e mundo ainda parecem duas camadas separadas

A interface está organizada, mas muitos elementos usam caixas escuras semelhantes. Recursos, território, controles, minimapa e painel de upgrades disputam atenção através de bordas e fundos parecidos.

A 0.5 deve aproximar HUD e ficção do mundo usando linguagem visual compartilhada: emblemas, placas, materiais, ícones e estados de facção consistentes.

Exemplo: uma base capturada no mundo, seu ícone no minimapa e uma indicação no HUD devem usar a mesma forma e o mesmo código de estado — não apenas a mesma cor.
## Problema 9 — Transição territorial não celebra a mudança de cenário

Avançar de território muda a cena, mas falta um momento curto que venda a sensação de chegar a uma região nova.

Não precisa ser uma cutscene. Uma transição de 600–1000 ms pode combinar:

- fade curto;
- título e subtítulo do distrito;
- acento visual da região;
- câmera centralizada no landmark principal;
- pequena assinatura sonora/visual.

Isso aumenta muito o valor percebido de cada cenário sem alterar gameplay.

## Restrição principal: performance

O pós-0.4.1 passou com ~50,6 FPS no cenário máximo e ~54,6 FPS com interação contínua nessa rodada. Essa margem deve ser tratada como orçamento, não como convite para efeitos ilimitados.

Regras recomendadas:

- geometria estática entra no cache do mapa;
- sombras estáticas também devem ser cacheadas;
- animação ambiental em camada separada e baixa frequência quando possível;
- evitar blur/filtros caros em tela cheia;
- partículas ambientais com pools e tetos;
- nada de recriar gradientes/text metrics pesados por entidade por frame.

## Direção recomendada

Nome de trabalho: **0.5 — Cidade Viva**.

A atualização deve transformar o jogo de “campo legível com temas diferentes” em uma cidade com distritos visualmente distintos, bases memoráveis e progressão visível no próprio cenário.
