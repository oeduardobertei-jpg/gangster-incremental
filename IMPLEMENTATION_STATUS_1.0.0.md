# Gangster Incremental — 1.0.0 GOLD

Status: **GOLD / core de campanha fechado**

## O que define a 1.0
- Conquista territorial física é o fluxo canônico em T1–T6.
- Cada território possui 6 posições capturáveis e um requisito próprio de pressão/neutralizações.
- Após 6/6, a tropa consolida a pressão em vez de abandonar o campo.
- Última resistência e chefe fecham o território final antes do domínio.
- Dominação acontece in-place: tropas sobrevivem e estruturas dominadas deixam de gerar rivais.
- Pressão rival pós-domínio entra pelos acessos externos do distrito.
- T6 conclui a campanha com DOMÍNIO TOTAL, freeplay e ponte para Hegemonia.

## Correções críticas do Gold Pass
- QG Central do T6 recebeu âncora de captura fisicamente acessível.
- Saves antigos com a coordenada impossível do QG são migrados automaticamente ao carregar.
- Todos os control points agora resolvem uma âncora livre de colliders.
- T5 não usa mais o fallback que empurrava tropas continuamente para a borda norte após 6/6.
- Em consolidação, aliados voltam a procurar pressão rival distante; sem alvo, mantêm o terreno.
- Cache de objetivos pendentes reduz trabalho repetido com grandes grupos.
- Evento de T5 corrigido para “SEGURANÇA MOBILIZADA”.

## Evidência de release
- `npm run check`: PASS — TypeScript, foundation, build e budget.
- Bundle Gold: JS gzip 231,0 KiB / 275 KiB; CSS gzip 13,9 KiB / 20 KiB.
- `npm run qa:rc`: 19/19 suites PASS.
- Auditoria de âncoras: 43/43 checks PASS; 36/36 pontos T1–T6 ocupáveis.
- Consolidação T1–T6: 19/19 checks PASS; nenhuma marcha-fallback para o norte.
- Continuidade de domínio: 8/8 PASS; tropas preservadas e reforço externo pós-domínio.
- Smoke UI/save/Hegemonia: 66/66 PASS.
- Layout Evolução: 69/69 PASS, até 320 px.
- Combate crítico: 10/10 PASS.

## Política pós-1.0
Mudanças futuras devem preservar `npm run qa:gold` como gate antes de um novo release estável. Novas features entram após checkpoint próprio; bugs de captura, save, pathing ou ownership têm prioridade sobre conteúdo adicional.
