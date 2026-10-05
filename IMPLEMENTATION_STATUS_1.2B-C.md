# Gangster Incremental 1.2B–1.2C — T1 Rebuild

Base: `dev/1.2-t1-rebuild`, after 1.2A checkpoint `e7f6797`.

## 1.2B — Arquitetura Vertical

- Landmarks reais do T1 receberam silhuetas próprias e maior verticalidade sem alterar footprints físicos.
- Laje do Ponto: segundo volume, construção incompleta, varanda técnica, caixa d'água e ferragem exposta.
- Boca da Leste: landmark de dois níveis com cobertura operacional, letreiro e presença urbana maior.
- Esconderijo: massa vertical compacta, antena, caixa d'água e fachada mais especializada.
- Torre de Guarda e Mirante: maior leitura vertical e função visual distinta.
- Beco 01 e Barraquinha mantêm escala menor para criar hierarquia.

## 1.2C — Tecido Urbano

- Casas secundárias físicas, vindas de `getUnifiedSupportSolids`, ganharam cinco famílias de crescimento vertical.
- A geometria visual adicional usa os mesmos footprints já reconhecidos pela física; nenhum collider novo foi inventado.
- Criado skyline/backdrop nas bordas externas do mundo para indicar continuidade urbana sem criar obstáculos invisíveis dentro da arena.
- Renderer vertical contextual usa cache rasterizado por construção/LOD para reduzir custo por frame.
- Script de captura 1.2 aceita nomes de arquivo por argumento para preservar comparações sequenciais.

## Validação

- `npm run check`: PASS.
- `scripts/acceptance-051-world.mjs`: 20/20 PASS após 1.2C.
- `solidWorldViolations = 0` em T1–T6.
- Capturas preservadas: `rebuild-e.png` até `rebuild-h.png`.

## Estado visual

A diferença já é visível no segundo inicial: landmarks mais altos, casas secundárias com skyline variável e bairro continuando para além das bordas. O maior problema visual restante é o eixo central excessivamente geométrico. Próxima etapa: **1.2D — circulação/topografia orgânica**.
