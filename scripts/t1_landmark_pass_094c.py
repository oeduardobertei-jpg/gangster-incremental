from pathlib import Path
root=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental')

# Wire the landmark foundation into the cached world layer.
p=root/'src/components/GameCanvas.tsx'
s=p.read_text(encoding='utf-8')
anchor="import { drawStreetLifeClusters } from './canvas/streetLifeRenderer';"
ins=anchor+"\nimport { drawT1HeroLandmarkFoundation } from './canvas/t1HeroLandmarkRenderer';"
if 't1HeroLandmarkRenderer' not in s:
    if anchor not in s: raise SystemExit('GameCanvas import anchor missing')
    s=s.replace(anchor,ins,1)
call="          drawStreetLifeClusters(layerCtx, tacticalBuildings, currentTerritory.id, environmentControlColor);"
newcall=call+"\n          drawT1HeroLandmarkFoundation(layerCtx, width, height, currentTerritory.id, tacticalBuildings, environmentControlColor);"
if 'drawT1HeroLandmarkFoundation(layerCtx' not in s:
    if call not in s: raise SystemExit('GameCanvas call anchor missing')
    s=s.replace(call,newcall,1)
p.write_text(s,encoding='utf-8')

# Promote the local market prop to the cleaner hero label.
p=root/'src/data/territoryPurposeProps.ts'
s=p.read_text(encoding='utf-8')
s=s.replace("label:'MERCEARIA'","label:'MERCADO'",1)
p.write_text(s,encoding='utf-8')
