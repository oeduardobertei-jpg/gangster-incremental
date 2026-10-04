> **STATUS DO MASTER VISUAL: ROLLED BACK / INATIVO.** Em 2026-10-03, por solicitação do usuário, os hooks e alterações visuais do 0.9.10A foram removidos do pipeline ativo. A linha 0.9.10N–P da Base de Comando é independente e permanece ativa.

# 0.9.10A — T1 Master Visual Foundation

Status histórico: experimento concluído e posteriormente retirado do pipeline ativo.
Revision: `0.9.10a-t1-master-systems-v1`.
Target visual: mockup master T1 aprovado em 2026-10-03.

## Level 1 — Style Bible
- `STYLE_BIBLE_T1.md` é a referência oficial de direção de arte.
- Define paleta, composição, arquitetura, vegetação, iluminação, props e linguagem proibida.
- Regra central: todo elemento precisa justificar circulação, arquitetura, função, ambientação, natureza ou narrativa territorial.

## Level 2 — T1 Master Foundation v1
- Novo `t1MasterVisualRenderer.ts` controla hierarquia premium do T1.
- Novo tecido urbano visual-only aumenta densidade sem alterar colisão/pathfinding.
- Landmarks recebem tratamento dedicado de luz/arquitetura.
- Barraquinha recebe marquise listrada e leitura comercial mais forte.
- Context buildings ganharam varandas, jardineiras e vegetação determinística.
- Perfil atmosférico do T1 foi aquecido e clareado.
## Level 3 — Premium Visual Systems
- `premiumUrbanProfiles.ts`: perfis de dados por território.
- `premiumUrbanSystem.ts`: via premium, luz, vegetação, jardineiras e bancos reutilizáveis.
- `premiumUrbanFabricSystem.ts`: arquitetura visual-only, muros, escadas, vegetação e toldos configuráveis.
- `t1UrbanFabricRenderer.ts` virou apenas configuração T1 sobre o motor genérico.
- T1 deixou de duplicar primitivas de luz/vegetação/mobiliário no renderer local.

## Segurança de gameplay
- Tecido urbano premium é visual-only; não cria novos colliders.
- Estruturas físicas continuam vindo das fontes unificadas existentes.
- T1: 0 overlaps acidentais.
- T2/T3/T5/T6: 0 overlaps.
- T4: 7 contatos de contenção intencionais já conhecidos.

## QA
- `npm run check`: PASS.
- Foundation verification: PASS.
- Production build: PASS — 1756 modules / JS 782.87 kB.
- Capturas: `docs/screenshots/t1-master/` e `docs/screenshots/t1-096n/`.

## Estado visual
A transformação é estrutural e visível, mas o T1 ainda NÃO atingiu o mockup master. Próximos passes devem fechar o gap em iluminação cinematográfica, variedade de fachadas, microarquitetura, vegetação e composição de landmarks.
