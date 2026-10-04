from pathlib import Path
root=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental')

p=root/'src/components/canvas/soldierSprites.ts'
s=p.read_text(encoding='utf-8-sig')
s=s.replace("ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';","ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';",2)
s=s.replace("ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';","ctx.fillStyle = 'rgba(0, 0, 0, 0.46)';",2)
p.write_text(s,encoding='utf-8')

p=root/'src/components/GameCanvas.tsx'
s=p.read_text(encoding='utf-8-sig')
s=s.replace('className="battle-hud relative absolute top-3 left-4','className="battle-hud absolute top-3 left-4',1)
p.write_text(s,encoding='utf-8')
print('095Q shadow finish ok')
