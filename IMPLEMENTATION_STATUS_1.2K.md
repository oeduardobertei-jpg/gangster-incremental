# Gangster Incremental 1.2K — Natureza de Encosta 2.0

Branch: `dev/1.2-t1-rebuild`  
Base segura anterior: `50031d7` (1.2J Integração Urbana).

## O que mudou

- Vegetação do T1 passou de pontos isolados para faixas ecológicas concentradas nas bordas e taludes.
- Novas massas de árvores, bananeiras, capim e vegetação rasteira aumentam o contraste concreto + verde.
- Trepadeiras floridas integram Beco 01, Laje do Ponto, Boca da Leste e Esconderijo ao ambiente.
- Centro e corredores de combate permanecem visualmente limpos.
- Copas foram refinadas após QA visual para evitar aparência de bolha/roseta; versão final usa massas menores, assimétricas e sobrepostas.
- Tudo permanece visual-only e cacheado na composição estática.

## Validação

- TypeScript/lint: PASS.
- `npm run check`: PASS.
- Bundle: 255.9 KiB gzip no maior JS chunk / teto de 260 KiB.
- `acceptance-051-world.mjs`: 20/20 PASS.
- `solidWorldViolations = 0` em T1–T6.
- Sem erros de runtime.

## Capturas

- `rebuild-t.png` — primeiro passe mais denso.
- `rebuild-u.png` — tentativa intermediária rejeitada por aparência de roseta.
- `rebuild-v.png` — copas finais refinadas, versão escolhida.

Próxima etapa: **1.2L — Atmosfera e Profundidade Cinematográfica**, com baixo crescimento de bundle.
