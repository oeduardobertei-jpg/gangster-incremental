from pathlib import Path
p=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental\src\components\canvas\environmentRenderer.ts')
s=p.read_text(encoding='utf-8-sig')
old="""  ctx.strokeStyle='rgba(8,13,18,.38)';ctx.lineWidth=.90;
  const wires=[
    [.14,.19,.34,.24,.69,.27],[.31,.37,.55,.41,.84,.51],
    [.14,.20,.19,.47,.29,.71],[.69,.28,.76,.48,.70,.75]
  ];"""
new="""  ctx.strokeStyle='rgba(8,13,18,.28)';ctx.lineWidth=.78;
  // 0.9.5P2: keep the cable language, but route it around the combat-readable center.
  const wires=[
    [.14,.19,.34,.23,.74,.24],
    [.14,.20,.18,.47,.24,.71],
    [.73,.28,.83,.48,.80,.75]
  ];"""
if old not in s: raise SystemExit('wire block anchor missing')
s=s.replace(old,new,1)
s=s.replace("for(const [x,y,len] of [[.31,.37,.085],[.69,.28,.070],[.29,.71,.060]] as const)","for(const [x,y,len] of [[.18,.47,.070],[.83,.48,.060],[.24,.71,.052]] as const)",1)
s=s.replace("[[.14,.19],[.31,.37],[.69,.27],[.84,.51],[.29,.71],[.70,.75]]","[[.14,.19],[.18,.47],[.74,.24],[.83,.48],[.24,.71],[.80,.75]]",1)
p.write_text(s,encoding='utf-8')
print('095P2 wires cleanup ok')
