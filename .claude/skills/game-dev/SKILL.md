# Skill: Gangster Incremental Game Dev

Use esta skill para qualquer tarefa que toque gameplay, simulação, câmera, física, IA, render, UI de jogo, save, performance ou direção de arte.

## Princípios do projeto
- O jogo é incremental/autônomo: profundidade não deve virar microgerenciamento RTS obrigatório.
- O campo precisa ser legível antes de ser detalhado.
- Elementos visualmente sólidos precisam existir fisicamente.
- Mudanças visuais importantes exigem screenshot de aceite, não só teste unitário.
- Mudanças em IA/movimento exigem stress e métricas, não só observação casual.
- Preservar saves e compatibilidade é requisito de produto.

## Orçamento técnico
- Gate absoluto: 30 FPS em stress pesado.
- Meta prática: 45+ FPS quando possível.
- Decisões caras devem operar em baixa frequência e ser escalonadas.
- Evitar O(N²) por step em batalhas grandes; usar cache, broadphase ou cadência reduzida.
- Render estático deve ser cacheado sempre que possível.
- Não introduzir navmesh/WebGL/engine nova sem prova de necessidade.
## Checklist de mudança visível
1. Definir o problema visual e o comportamento pretendido.
2. Separar cenário estático, props funcionais, unidades, HUD e feedback.
3. Garantir que colisão/navegação correspondam ao que o jogador vê.
4. Capturar antes/depois ou galeria T1–T6 quando o escopo for territorial.
5. Revisar zoom distante, normal e próximo quando aplicável.
6. Conferir janela baixa/tela estreita se UI foi tocada.
7. Repetir stress se o renderer, física ou quantidade de entidades mudou.

## Checklist de IA/física
- Nenhuma invasão persistente de collider.
- Nenhum gargalo com stuck indefinido.
- Spawn não começa dentro de sólidos nem colapsado em um único ponto.
- Linha de visão e projéteis respeitam o mesmo mundo sólido.
- Anti-stuck deve resolver exceções, não mascarar navegação ruim com thrashing.

## Regra de design
Todo elemento novo deve justificar ao menos um papel: navegação, combate, identidade ou atmosfera. Se não cumpre nenhum deles, provavelmente é ruído visual.