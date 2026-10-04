from pathlib import Path
p=Path(r'C:\Users\Eduardo Bertei\Desktop\gangster-incremental\src\components\canvas\favelaRenderer.ts')
s=p.read_text(encoding='utf-8')
old="""  ctx.fillStyle = b.type === 'brick' ? '#6b2410' : b.type === 'laje' ? '#475569' : '#57534e';
  ctx.fillRect(b.x, facadeY, b.w, H);
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
"""
new="""  ctx.fillStyle = b.type === 'brick' ? '#6b2410' : b.type === 'laje' ? '#475569' : '#57534e';
  ctx.fillRect(b.x, facadeY, b.w, H);
  if (capturedByPlayer) {
    ctx.save(); ctx.globalAlpha = 0.20; ctx.fillStyle = playerColor;
    ctx.fillRect(b.x, facadeY, b.w, H); ctx.restore();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
"""
assert old in s
s=s.replace(old,new,1)
old="""  ctx.fillStyle = b.type === 'brick' ? '#7c2d12' : b.type === 'laje' ? '#334155' : '#475569';
  ctx.fillRect(b.x, roofY, b.w, b.h);
  ctx.strokeStyle = '#1e293b';
"""
new="""  ctx.fillStyle = b.type === 'brick' ? '#7c2d12' : b.type === 'laje' ? '#334155' : '#475569';
  ctx.fillRect(b.x, roofY, b.w, b.h);
  if (capturedByPlayer) {
    ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = playerColor;
    ctx.fillRect(b.x, roofY, b.w, b.h); ctx.restore();
  }
  ctx.strokeStyle = '#1e293b';
"""
assert old in s
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('building domination tint patched')
