# AGENTS.md — Estúdio autônomo do Gangster Incremental

Este repositório foi preparado para sessões longas de desenvolvimento com agentes especializados. A regra central é simples: **a sessão principal decide; subagentes coletam, auditam ou implementam briefs fechados**.

## Ordem obrigatória de leitura
1. `AGENTS.md`
2. `GOAL.md`
3. `HANDOFF.md`
4. `IMPLEMENTATION_STATUS_0.5.2.md`
5. `.claude/skills/game-dev/SKILL.md` quando a tarefa envolver gameplay, UI, arte, performance ou testes.

## Papéis
- **Sessão principal**: direção, arquitetura, síntese, julgamento visual/gameplay, integração e decisão final.
- **Rastreador**: mapeia código, chamadas, ocorrências e dependências. Não opina sobre design.
- **Extrator**: cataloga bibliotecas/ativos/referências contra uma régua escrita. Não aprova visual.
- **Auditor**: confere um alvo item a item contra critérios já definidos. Não corrige nem inventa critério.
- **Construtor**: implementa um brief fechado em uma área permitida e roda gates. Não redefine direção ou arquitetura.
- **Explore**: localiza arquivo, símbolo ou contagem. Não revisa nem audita.

## Contrato de delegação
Todo subagente recebe: objetivo, caminhos permitidos, caminhos proibidos, critérios de pronto numerados, gates obrigatórios e caminho do relatório.
Um alvo por subagente. Um escritor por área de código. Respostas de subagente devem ser curtas; detalhes ficam em `output/agents/`.
## Autonomia sem perder qualidade
- Não interrompa o trabalho por dúvida pequena. Escolha a opção reversível de menor risco, registre a decisão no handoff e prossiga.
- Pergunte ao usuário apenas quando a decisão muda escopo, direção de arte, economia, compatibilidade de save ou remove comportamento existente.
- Antes de alterar um sistema, rastreie a origem do comportamento e leia os testes existentes.
- Não trate screenshot bonita como aprovação funcional: arte, colisão, navegação, save e performance têm gates próprios.
- Não trate teste verde como aprovação visual: a sessão principal deve inspecionar capturas quando a mudança for visível.
- Não faça refactors grandes junto com features sem necessidade. Preserve diffs legíveis e reversíveis.

## Loop de trabalho
1. Ler objetivo e handoff.
2. Rastrear o sistema afetado.
3. Escrever um brief fechado e critérios de aceite.
4. Delegar coleta/auditoria/implementação quando isso reduzir contexto ou paralelizar com segurança.
5. Conferir achados diretamente na fonte antes de decidir.
6. Implementar por fatias pequenas.
7. Rodar gate local do alvo.
8. Rodar `npm run check`.
9. Em mudanças de campo/IA/render, rodar os aceites específicos e stress aplicáveis.
10. Fazer revisão visual quando houver mudança perceptível.
11. Atualizar `HANDOFF.md` e o status da versão antes de encerrar.

## Gates mínimos
- Código: `npm run check`.
- Movimento/spawn: `node scripts/acceptance-041.mjs`.
- Física/navegação: `node scripts/acceptance-051b-t5.mjs` e/ou `node scripts/acceptance-051-world.mjs`.
- Visual 0.5: `node scripts/acceptance-052-purpose.mjs`.
- Campo pesado/performance: `node scripts/stress-04g.mjs`.
- Gate automatizado consolidado: `npm run agent:gates`.
## Regras de qualidade do jogo
- Preservar o save atual e migrações. Nunca usar o save pessoal do usuário como fixture de teste.
- Manter testes em sessão isolada quando possível.
- FPS mínimo absoluto: 30. Meta prática em stress pesado: 45+ quando possível sem empobrecer a cena.
- `solidWorldViolations` deve terminar em 0 nos aceites de física.
- NPC não pode atravessar estrutura visualmente sólida nem ficar preso indefinidamente em canto/gargalo.
- Props sólidos precisam comunicar visualmente que bloqueiam; passagens visuais precisam ser fisicamente transitáveis.
- Upgrades e território devem continuar legíveis em desktop, janela baixa e telas estreitas.
- Não adicionar detalhe ambiental que prejudique a leitura de unidades, projéteis ou objetivos.

## Contexto e handoff
`HANDOFF.md` é a memória operacional da sessão. Atualize-o:
- ao concluir uma fatia importante;
- antes de uma compactação/context reset;
- antes de esperar limite de uso;
- antes de entregar a sessão a outro agente ou outra máquina.

Registre apenas estado útil: objetivo atual, decisões, arquivos tocados, testes já rodados, métricas, problemas abertos e próximo passo exato. Não copie conversa inteira.

Relatórios de subagentes vão para `output/agents/<data-ou-alvo>-<papel>.md`. A sessão principal deve ler o relatório, conferir os pontos críticos na fonte e então sintetizar.
## Limites de responsabilidade
- Subagentes não fazem commit, push, deploy, release ou mudança de versão por conta própria.
- Construtor não escolhe direção de arte, não reescreve GDD e não amplia escopo sem autorização da sessão principal.
- Auditor nunca corrige o que encontrou; apenas prova conformidade ou falha.
- Rastreador e Explore nunca transformam hipótese em fato sem apontar arquivo/símbolo.
- Extrator não continua para uma segunda biblioteca/tema sem novo brief.
- A sessão principal é a única que pode declarar uma etapa concluída.

## Política de continuidade
Se o objetivo estiver claro e os gates estiverem verdes, continue para a próxima fatia planejada sem pedir confirmação a cada microetapa. Se um gate falhar, pare a expansão de escopo, diagnostique, corrija e repita o gate. Se o problema exigir mudar a direção combinada com o usuário, registre o bloqueio em `HANDOFF.md` e peça decisão.

## Entrega
Uma entrega boa contém: o que mudou, por que mudou, gates executados, métricas relevantes, riscos restantes e próximo passo recomendado. Não omita falhas ou metas aspiracionais não atingidas.