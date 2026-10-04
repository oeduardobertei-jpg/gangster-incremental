from pathlib import Path
root=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental')

p=root/'src/components/canvas/environmentRenderer.ts'
s=p.read_text(encoding='utf-8-sig')
s=s.replace("ctx.strokeStyle='rgba(8,13,18,.56)';ctx.lineWidth=1.15;","ctx.strokeStyle='rgba(8,13,18,.38)';ctx.lineWidth=.90;")
s=s.replace("ctx.strokeStyle='rgba(20,28,35,.36)';ctx.lineWidth=.7;","ctx.strokeStyle='rgba(20,28,35,.25)';ctx.lineWidth=.65;")
p.write_text(s,encoding='utf-8')

p=root/'src/data/territoryAtmospheres.ts'
s=p.read_text(encoding='utf-8-sig')
s=s.replace("ambientLight: 'rgba(20,25,35,.50)'","ambientLight: 'rgba(17,23,31,.46)'",1)
s=s.replace('shadowStrength: .60','shadowStrength: .64',1)
s=s.replace('hazeAmount: .30','hazeAmount: .20',1)
s=s.replace('particleDensity: .20','particleDensity: .14',1)
s=s.replace("buildingTint: 'rgba(255,255,255,0)'","buildingTint: 'rgba(255,169,102,.010)'",1)
s=s.replace("streetTint: 'rgba(255,255,255,0)'","streetTint: 'rgba(78,118,140,.025)'",1)
p.write_text(s,encoding='utf-8')
print('095P/S atmosphere+wires patched')
