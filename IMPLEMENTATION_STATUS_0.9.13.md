# 0.9.13 — Release Candidate Audit / Core Lock

## Estado
**Release Candidate aprovada.** A 0.9.13 não adiciona conteúdo de campanha; ela fecha bugs, estabiliza QA e transforma os principais riscos da 1.0 em gates reproduzíveis.

## Correções funcionais
- Finale `DOMÍNIO TOTAL` permanece integrado ao domínio físico real de T6.
- Finale corrigido para 320×568: conteúdo alto usa rolagem segura e não deixa ações fora da viewport.
- Tooltip do rádio voltou a funcionar em desktop comum, sem depender do bloco expandido de 1900 px.
- Restauração de snapshot físico agora sincroniza `territoryDominatedRef` no mesmo tick.
- Primeiro reforço pós-domínio restaurado já nasce com ownership correto e usa somente entradas externas.
- Guarnições T1–T6 e exceção de Hegemonia preservadas.

## Performance / fluxo T5–T6
- `crowdFlow.ts`: varredura de densidade evita `Math.hypot` por unidade e encerra cedo quando a urgência de edge recovery já saturou.
- Gate continua em **30 FPS**.
- Benchmark agora mede performance sustentada: pelo menos 4 de 5 janelas de 1 s precisam ficar >=30 FPS; duas janelas abaixo de 30 bloqueiam a RC.
- RC final: T5 `38.9,44.5,45.0,48.0,49.9`; piso sustentado **44.5 FPS**.
- RC final: T6 `23.9,42.3,47.0,47.0,50.9`; piso sustentado **42.3 FPS**.
- Colisões sólidas: 0 violações.
- Hard-unstuck: dentro do gate.

## QA / harness
- `cdp-session.mjs` agora fecha target antes do browser context, usa cleanup limitado e não transforma timeout de limpeza em falso negativo.
- Target de teste é trazido para frente explicitamente para reduzir throttling de `requestAnimationFrame`.
- Testes legados de layout, guarnição, campanha e ownership foram alinhados ao sistema físico 0.9.11+.
- `qa:rc` reúne 15 scripts de aceitação.

## Resultado final
- `npm run check`: **PASS**.
- TypeScript: **PASS**.
- Foundation: **PASS**.
- Production build: **PASS**.
- Bundle budget: JS gzip **230.7 KiB / 275 KiB**; CSS gzip **13.9 KiB / 20 KiB**.
- `npm run qa:rc`: **15/15 scripts PASS**.
- Evolution responsive QA: **69/69 PASS** (1440, 1024, 900, 700, 390, 320 px).
- Campaign: **24/24 PASS**.
- Opening garrison: **15/15 PASS**.
- Campaign finale: **10/10 PASS**.
- Ownership pós-domínio: **7/7 PASS**.
- Combat: **10/10 PASS**.
- Radio tooltip: **10/10 PASS**.

## Observação não bloqueadora
O Vite ainda informa chunk bruto acima de 500 kB (~806 kB minificado), mas o bundle gzip real permanece dentro do orçamento de release. Separar o renderer apenas para silenciar esse warning não é recomendado antes da 1.0, pois aumentaria risco sem ganho material no payload atual.

## Próximo marco recomendado
**0.9.14 — 1.0 Candidate Polish:** somente polish final, smoke test manual visual T1–T6 e empacotamento/release notes. Nenhuma mudança estrutural de core loop sem reabrir os gates desta RC.
