from pathlib import Path
root = Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental-0.9.5T-final')

handoff = root / 'HANDOFF.md'
s = handoff.read_text(encoding='utf-8')
marker = '## Ambiente correto'
rest = s[s.index(marker):]
head = '''# HANDOFF — estado operacional

## Estado do produto
Base ativa: **0.9.10P — Base de Comando incremental + Preview/QA reutilizável**.
A tentativa Master Visual 0.9.10A/0.9.10B continua retirada do pipeline ativo. O estado visual do T1 permanece no cleanup aprovado; a nova linha 0.9.10N→P adiciona somente o sistema incremental da Base de Comando, feedback de progressão, preview DEV e framework genérico para futuras construções.

'''
s = head + rest
handoff.write_text(s, encoding='utf-8')

section = '''

## 0.9.10N–P — Incremental Command Building Framework (2026-10-03)
- Revision: `0.9.10p-incremental-command-framework-v1`.
- A Base de Comando evolui por score agregado, estágios E0–E3 e maturidade contínua.
- Silhueta cresce de núcleo compacto para HQ mais larga/alta; E2 adiciona alas e E3 coroamento.
- 12 upgrades possuem módulos visuais próprios; tiers 0–5 usam a mesma régua na UI e no renderer.
- Hegemonias adicionam marcas de prestígio sem substituir a evolução normal.
- Preview DEV: E0–E3, árvores extremas, tier isolado, Tudo Máximo e Hegemonias; não altera save.
- Motor genérico: `src/rules/incrementalBuildingVisuals.ts`.
- Guia reutilizável: `docs/INCREMENTAL_BUILDING_VISUAL_FRAMEWORK.md`.
- QA: `npm run check` PASS; mundo 20/20; spawn 7/7; layout 69/69; preview 7/7.
- Galeria: `docs/screenshots/base-incremental-0910NO/`.
'''
if '## 0.9.10N–P — Incremental Command Building Framework' not in s:
    with handoff.open('a', encoding='utf-8', newline='\n') as f:
        f.write(section)

status = root / 'IMPLEMENTATION_STATUS_0.9.10.md'
t = status.read_text(encoding='utf-8')
lines = t.splitlines()
lines[0] = '> **STATUS DO MASTER VISUAL: ROLLED BACK / INATIVO.** Em 2026-10-03, por solicitação do usuário, os hooks e alterações visuais do 0.9.10A foram removidos do pipeline ativo. A linha 0.9.10N–P da Base de Comando é independente e permanece ativa.'
status.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('0.9.10P handoff/status finalized in UTF-8')
