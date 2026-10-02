from pathlib import Path
p = Path(r'C:\Users\Eduardo Bertei\Desktop\gangster-incremental\src\components\canvas\favelaRenderer.ts')
s = p.read_text(encoding='utf-8')
old_sig = "  time: number,\n  includeAnimatedDetails = true\n) {"
new_sig = "  time: number,\n  includeAnimatedDetails = true,\n  includeBuildings = true\n) {"
assert s.count(old_sig) == 1
s = s.replace(old_sig, new_sig, 1)
start = s.index("  // --- LAYER 5: Construções Táticas")
end = s.index("  // --- LAYER 6: Postes", start)
block = s[start:end]
marker = "  const buildings = getTacticalBuildings(width, height, factionConfig);\n\n"
assert marker in block and block.rstrip().endswith('});')
block = block.replace(marker, "  if (includeBuildings) {\n    const buildings = getTacticalBuildings(width, height, factionConfig);\n\n", 1)
block = block.rstrip() + "\n  }\n\n"
s = s[:start] + block + s[end:]
p.write_text(s, encoding='utf-8')
print('wrapped static buildings')
s = p.read_text(encoding='utf-8')
insert_at = s.index('export function drawFavelaAmbient(')
fn = '''export function drawTacticalBuilding(\n  ctx: CanvasRenderingContext2D,\n  b: TacticalBuilding,\n  time: number\n) {\n  const H = 28;\n  const roofY = b.y - H;\n  const facadeY = b.y + b.h - H;\n  const sideDoor = b.doorX > b.x + b.w / 2;\n  const doorX = sideDoor ? b.x + b.w - 18 : b.x + 8;\n\n  ctx.save();\n  ctx.fillStyle = 'rgba(0,0,0,0.38)';\n  ctx.fillRect(b.x + 5, b.y + b.h - 1, b.w, 9);\n  ctx.fillStyle = b.type === 'brick' ? '#6b2410' : b.type === 'laje' ? '#475569' : '#57534e';\n  ctx.fillRect(b.x, facadeY, b.w, H);\n  ctx.strokeStyle = 'rgba(0,0,0,0.28)';\n  ctx.lineWidth = 1;\n  for (let yy = facadeY + 6; yy < facadeY + H; yy += 6) {\n    ctx.beginPath(); ctx.moveTo(b.x, yy); ctx.lineTo(b.x + b.w, yy); ctx.stroke();\n  }\n'''
fn += '''  const windowCount = Math.max(1, Math.floor(b.w / 38));\n  for (let i = 0; i < windowCount; i++) {\n    const wx = b.x + (i + 0.5) * b.w / windowCount - 5;\n    if (wx + 10 > doorX - 3 && wx < doorX + 13) continue;\n    ctx.fillStyle = Math.sin(time * 0.002 + i * 2 + b.x) > -0.35 ? '#fde68a' : '#0f172a';\n    ctx.fillRect(wx, facadeY + 7, 10, 8);\n    ctx.strokeStyle = '#1e293b'; ctx.strokeRect(wx, facadeY + 7, 10, 8);\n  }\n  ctx.fillStyle = '#0b0f1a';\n  ctx.fillRect(doorX, facadeY + H - 18, 10, 18);\n  ctx.fillStyle = b.graffitiColor;\n  ctx.fillRect(doorX - 1, facadeY + H - 20, 12, 2);\n\n  ctx.fillStyle = b.type === 'brick' ? '#7c2d12' : b.type === 'laje' ? '#334155' : '#475569';\n  ctx.fillRect(b.x, roofY, b.w, b.h);\n  ctx.strokeStyle = '#1e293b';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(b.x, roofY, b.w, b.h);\n'''
fn += '''  if (b.type === 'zinc') {\n    ctx.strokeStyle = '#64748b';\n    for (let x = b.x + 6; x < b.x + b.w; x += 7) {\n      ctx.beginPath(); ctx.moveTo(x, roofY); ctx.lineTo(x, roofY + b.h); ctx.stroke();\n    }\n  }\n  if (b.hasWaterTank) {\n    const tx = b.x + b.w - 18, ty = roofY + 18;\n    ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(tx, ty, 10, 0, Math.PI * 2); ctx.fill();\n    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(tx - 2, ty - 2, 5, 0, Math.PI * 2); ctx.fill();\n  }\n  if (b.graffiti) {\n    ctx.fillStyle = b.graffitiColor;\n    ctx.font = 'bold 9px Impact, sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText(b.graffiti, b.x + 5, facadeY + H - 4);\n  }\n  ctx.fillStyle = 'rgba(15,23,42,0.92)';\n  ctx.fillRect(b.x + b.w / 2 - 34, roofY + 5, 68, 13);\n  ctx.strokeStyle = b.graffitiColor; ctx.strokeRect(b.x + b.w / 2 - 34, roofY + 5, 68, 13);\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';\n  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.label, b.x + b.w / 2, roofY + 11);\n  ctx.restore();\n}\n\n'''
s = s[:insert_at] + fn + s[insert_at:]
p.write_text(s, encoding='utf-8')
print('inserted drawTacticalBuilding')