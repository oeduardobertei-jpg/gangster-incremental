from pathlib import Path
p=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental-0.9.5T-final\HANDOFF.md')
s=p.read_text(encoding='utf-8')
old='''## Próximo passo recomendado
Fazer um playtest progressivo T1→T6 medindo duração, mortes, composição e picos de dificuldade. Só então ajustar `requiredTakes`, spawnRate/recompensas ou abrir a próxima grande versão.'''
new='''## Próximo passo recomendado
Usar a Base de Comando como referência do sistema incremental. A próxima construção deve entrar pelo framework documentado, com preview e QA próprios; balance T1→T6 continua como trilha paralela de gameplay.'''
if old not in s:
    raise SystemExit('next-step block not found')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('handoff next step updated')
