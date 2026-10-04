from pathlib import Path
ROOT=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental')
def rw(rel): return (ROOT/rel).read_text(encoding='utf-8')
def ww(rel,s): (ROOT/rel).write_text(s,encoding='utf-8')

s=rw('src/data/territoryScenes.ts')
s=s.replace("{ surface: 'alley', width: 36, edge: true, points: [","{ surface: 'alley', width: 30, edge: true, points: [",2)
s=s.replace("{ surface:'concrete', width:24, edge:true, points:[{x:.22,y:.35},{x:.36,y:.38},{x:.48,y:.36}] },","{ surface:'concrete', width:19, edge:true, points:[{x:.22,y:.35},{x:.36,y:.38},{x:.48,y:.36}] },",1)
s=s.replace("{ surface:'concrete', width:24, edge:true, points:[{x:.51,y:.66},{x:.64,y:.64},{x:.78,y:.68}] },","{ surface:'concrete', width:19, edge:true, points:[{x:.51,y:.66},{x:.64,y:.64},{x:.78,y:.68}] },",1)
s=s.replace("{ surface:'concrete', width:20, points:[{x:.20,y:.69},{x:.34,y:.62},{x:.47,y:.58}] }","{ surface:'concrete', width:17, points:[{x:.20,y:.69},{x:.34,y:.62},{x:.47,y:.58}] }",1)
ww('src/data/territoryScenes.ts',s)

bs=rw('src/components/canvas/buildingSkins.ts')
needle="  ctx.fillStyle = wall.base;\n  ctx.fillRect(b.x, facadeY, b.w, visualHeight - 5);\n"
insert="  ctx.fillStyle = wall.base;\n  ctx.fillRect(b.x, facadeY, b.w, visualHeight - 5);\n  if(options.contextual){\n    const faded=['rgba(116,83,58,.18)','rgba(64,94,83,.15)','rgba(74,87,105,.15)','rgba(135,103,62,.14)'][roofVariant];\n    ctx.fillStyle=faded;ctx.fillRect(b.x+2,facadeY+2,b.w-4,Math.max(8,visualHeight-9));\n    ctx.fillStyle='rgba(226,232,240,.055)';ctx.fillRect(b.x+3,facadeY+3,Math.max(8,b.w*.38),2);\n  }\n"
if needle not in bs: raise RuntimeError('facade tint insertion point not found')
bs=bs.replace(needle,insert,1)
ww('src/components/canvas/buildingSkins.ts',bs)
env=rw('src/components/canvas/environmentRenderer.ts')
old="  ctx.fillStyle=colorWithAlpha(controlColor,.30);ctx.fillRect(width*.105,height*.315,34,3);\n  ctx.fillStyle='rgba(226,232,240,.16)';ctx.font='700 7px \"Chakra Petch\",sans-serif';ctx.fillText(controlTag,width*.106,height*.311);"
new="  ctx.fillStyle=colorWithAlpha(controlColor,.30);ctx.fillRect(width*.095,height*.315,72,3);\n  ctx.fillStyle='rgba(226,232,240,.28)';ctx.font='800 8px \"Chakra Petch\",sans-serif';ctx.textAlign='left';ctx.fillText('BECO DOS DESCALÇOS',width*.098,height*.309);\n  ctx.fillStyle=colorWithAlpha(controlColor,.34);ctx.font='800 7px \"Chakra Petch\",sans-serif';ctx.fillText(controlTag,width*.098,height*.323);"
if old not in env: raise RuntimeError('mural insertion point not found')
env=env.replace(old,new,1)
old_wires="  const wires=[\n    [.14,.19,.32,.26,.69,.27],[.31,.37,.52,.42,.84,.51],[.14,.20,.18,.46,.29,.71],\n    [.69,.28,.77,.48,.70,.75],[.29,.72,.48,.67,.70,.76],[.18,.46,.45,.48,.79,.62]\n  ];"
new_wires="  const wires=[\n    [.14,.19,.34,.24,.69,.27],[.31,.37,.55,.41,.84,.51],\n    [.14,.20,.19,.47,.29,.71],[.69,.28,.76,.48,.70,.75]\n  ];"
if old_wires not in env: raise RuntimeError('wires array not found')
env=env.replace(old_wires,new_wires,1)
ww('src/components/canvas/environmentRenderer.ts',env)
print('T1 REDESIGN PASS3 READY')
