from pathlib import Path
p=Path(r'C:\Users\Eduardo Bertei\Desktop\gangster-incremental\src\components\canvas\favelaRenderer.ts')
s=p.read_text(encoding='utf-8')
start=s.index('// =========================================================================\n// 3. SPRITES')
end=s.index('export function drawFallenSprite', start)
replacement="""// =========================================================================
// 3. LOOT DE CAMPO & PROJÉTEIS
// Sprites de unidades vivem exclusivamente em soldierSprites.ts.
// =========================================================================

"""
removed=s[start:end]
s=s[:start]+replacement+s[end:]
p.write_text(s,encoding='utf-8')
print('removed_lines=',removed.count('\n'),'remaining_lines=',s.count('\n')+1)
