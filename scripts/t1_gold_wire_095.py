from pathlib import Path
root=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental')

# GameCanvas: static gold foundation + budgeted dynamic overlay.
p=root/'src/components/GameCanvas.tsx';s=p.read_text(encoding='utf-8')
anchor="import { drawT1HeroLandmarkFoundation } from './canvas/t1HeroLandmarkRenderer';"
imports=anchor+"\nimport { drawT1GoldFoundation } from './canvas/t1GoldFoundationRenderer';\nimport { drawT1GoldOverlay } from './canvas/t1GoldOverlayRenderer';"
if 't1GoldFoundationRenderer' not in s:
    if anchor not in s: raise SystemExit('GameCanvas hero import missing')
    s=s.replace(anchor,imports,1)
call='          drawT1HeroLandmarkFoundation(layerCtx, width, height, currentTerritory.id, tacticalBuildings, environmentControlColor);'
newcall=call+'\n          drawT1GoldFoundation(layerCtx, width, height, currentTerritory.id, tacticalBuildings, environmentControlColor);'
if 'drawT1GoldFoundation(layerCtx' not in s:
    if call not in s: raise SystemExit('GameCanvas hero call missing')
    s=s.replace(call,newcall,1)
overlay='      drawCityVivaAmbientOverlay(ctx, width, height, currentTerritory.id, currentTime, environmentControlColor);'
newov=overlay+'\n      drawT1GoldOverlay(ctx, width, height, currentTerritory.id, currentTime, environmentControlColor, visualLoadZoom);'
if 'drawT1GoldOverlay(ctx' not in s:
    if overlay not in s: raise SystemExit('GameCanvas overlay anchor missing')
    s=s.replace(overlay,newov,1)
p.write_text(s,encoding='utf-8')

# buildingSkins: 0.9.5B/C/J architectural layer.
p=root/'src/components/canvas/buildingSkins.ts';s=p.read_text(encoding='utf-8')
anchor="import { drawContextArchitectureFinish } from './contextArchitectureFinishRenderer';"
ins=anchor+"\nimport { drawT1ArchitectureGold } from './t1ArchitectureGoldRenderer';"
if 't1ArchitectureGoldRenderer' not in s:
    if anchor not in s: raise SystemExit('buildingSkins import anchor missing')
    s=s.replace(anchor,ins,1)
call='  if(microLod) drawBuildingLifeDetails(ctx,b,1,time);'
newcall=call+"\n  drawT1ArchitectureGold({ctx,b,roofY,facadeY,height:visualHeight,controlColor,renderZoom,contextual:options.contextual});"
if 'drawT1ArchitectureGold({ctx,b' not in s:
    if call not in s: raise SystemExit('buildingSkins gold call anchor missing')
    s=s.replace(call,newcall,1)
p.write_text(s,encoding='utf-8')
print('t1-095-gold-wire-ok')
