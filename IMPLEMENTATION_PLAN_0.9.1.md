# 0.9.1 — Composição Física Unificada

Status: **PLANO OFICIAL / INÍCIO DA IMPLEMENTAÇÃO**

## Objetivo
Transformar T1–T6 em espaços físicos contínuos e coerentes. O mapa deixa de ser tratado como chão + prédios táticos + casas de fundo + props separados e passa a nascer de uma mesma lógica urbana: relevo, circulação, massa construída, acessos, prédios jogáveis e ambientação.

## Princípios obrigatórios
- Todos os seis territórios entram no escopo.
- Nenhuma casa de fundo pode existir isolada sem fazer parte de um cluster, lote, patamar ou eixo urbano.
- Prédios táticos precisam parecer marcos do bairro, não objetos pousados sobre o cenário.
- Arte e física devem concordar: acessos, vãos, contenções e obstáculos visuais precisam fazer sentido para pathing/colliders.
- O mapa deve funcionar como um único mundo físico, mesmo que tecnicamente continue usando múltiplos renderers.
- Nenhum placeholder, label de authoring, wireframe ou protótipo visual pode aparecer na arte final.

## Critério-chave
Se o jogador consegue apontar para um elemento e dizer “isso parece colocado por cima”, a composição ainda não está pronta.
## Etapas
### 0.9.1A — Unified Physical Layer
- definir skeleton físico por território;
- organizar eixos, vazios, platôs, ruas, vielas, escadas, contenções e áreas de ocupação;
- preservar corredores de combate antes de posicionar decoração.

### 0.9.1B — Urban Mass Clusters
- substituir casas isoladas por clusters coerentes;
- criar massas de moradia, comércio, oficina, condomínio e apoio operacional;
- usar sobreposição e agrupamento para dar continuidade urbana.

### 0.9.1C — Tactical Embedding
- embutir cada edifício nomeado no tecido local;
- ligar portas a acessos físicos;
- compartilhar lajes, muros, pátios, escadas, calçadas ou corredores de serviço com o entorno.

### 0.9.1D — Depth / Occlusion / Continuity
- separar fundo, tecido de suporte e edifícios heroicos;
- melhorar oclusão, sombra de contato e continuidade de materiais;
- reduzir aparência de recorte/colagem.
### 0.9.1E — Territory Passes
Ordem técnica: T4 → T1 → T2 → T3 → T5 → T6.
A ordem define execução, não prioridade de qualidade: todos recebem o mesmo padrão de reconstrução.

### 0.9.1F — Prototype Purge
Eliminar do runtime qualquer elemento que pareça guia, mockup ou protótipo: `LAJE`, `RUA`, `LUZ`, `Z1/Z2/Z3`, `CHECK 01/02/03`, quadras/campinhos wireframe, linhas de editor, placas abstratas e geometrias provisórias.
Elementos funcionais só permanecem se forem transformados em arte física convincente.

### 0.9.1G — Faction Marking Rework
Preservar a boa mecânica de domínio visual, mas substituir barras/placas abstratas por linguagem física: pichação, muro pintado, portão metálico, tapume, faixa ou fachada apropriada ao território.
A cor da facção sinaliza posse; não deve virar material genérico de arquitetura.

### 0.9.1H — Global Audit / Gold Pass
- capturar T1–T6 em mapa inteiro, 100% e zoom próximo;
- procurar objetos soltos, colisões arte/física e placeholders residuais;
- validar legibilidade, desempenho, TypeScript, testes e build.

## Critérios de aceite globais
- screenshots sem HUD devem identificar cada território pelo espaço, não por texto;
- nenhum fundo pode parecer um conjunto de assets jogados;
- nenhum texto de authoring pode aparecer no mundo;
- cada prédio nomeado deve ter contexto físico local;
- o território deve parecer continuar organicamente além dos limites da arena.
