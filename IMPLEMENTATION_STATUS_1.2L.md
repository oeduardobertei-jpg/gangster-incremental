# Gangster Incremental 1.2L — Atmosfera e Profundidade Cinematográfica

Branch: `dev/1.2-t1-rebuild`  
Base segura anterior: `ea2bc34` (1.2K Natureza de Encosta 2.0).

## O que mudou

- Framing estático do T1 ganhou vignette lateral equilibrada, preservando o centro do combate.
- Haze fria e muito leve separa a cidade distante do plano jogável.
- Beco 01, Boca da Leste, Laje do Ponto e Esconderijo recebem halos quentes discretos que reforçam áreas habitadas.
- O tratamento usa o compositor estático existente; não adiciona partículas, bloom pesado ou sistema novo por frame.
- O objetivo foi colar arquitetura, vegetação, materiais e terreno numa única cena, sem aparência de filtro.

## Validação

- TypeScript/lint: PASS.
- `npm run check`: PASS.
- Bundle: 256.1 KiB gzip no maior JS chunk / teto de 260 KiB.
- `acceptance-051-world.mjs`: 20/20 PASS.
- `solidWorldViolations = 0` em T1–T6.
- Sem erros de runtime.

## Captura

- `docs/screenshots/1.2-t1-rebuild/rebuild-w.png`

Próxima etapa: **1.2M — T1 Golden Rebuild**, auditoria final lado a lado contra a versão GOLD.
