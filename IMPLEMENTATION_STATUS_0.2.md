# Gangster Incremental — estado da implementação 0.2

Base de comparação: `20d2e079997a9450bdbf2db188657fdb08889f7b`.
Rollback local: `gangster-incremental-baseline-20d2e079`.

## Implementado

- A1: instalação reproduzível com lockfile, Vite 6.1.0 e comando `npm run check`.
- A2: save v2, migração do v1, validação, backup rotativo e importação transacional.
- A3: `runId`, separação explícita da rodada e resultados de comando.
- B1: convocação única para botão, Espaço, mapa e automação; custo/limite/pausa validados antes do gasto.
- B2: prestígio baseado apenas no progresso elegível da rodada, sem pagamento mínimo nem duplicação.
- B3: coletas simultâneas não são mais descartadas pelo throttle global.
- B4: campo permanece montado ao abrir GDD; atalhos bloqueados atrás de diálogos; troca de facção é explícita.
- C1: combate usa passo fixo de 1/60 s, limite de recuperação e timers simulados para reforços/automação.
- C2: projéteis usam colisão contínua por segmento e expiram por distância.
- C3: snapshot de batalha salva/restaura tropas, rivais, espólios, projéteis, obstáculos e timers essenciais.

## Validação

`npm run check` executa tipagem, regressão da fundação e build de produção.

## Limitação conhecida

A economia/HUD ainda possui seu ticker fixo próprio de 100 ms; a consolidação absoluta de todos os subsistemas em um único scheduler fica como refinamento de C1. A revisão visual interativa completa deve ser feita no navegador durante o smoke test.
