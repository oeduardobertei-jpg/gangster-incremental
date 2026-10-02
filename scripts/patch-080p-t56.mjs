import fs from 'node:fs';
const deep=process.cwd()+'/src/components/canvas/territoryStructuralDeepRenderer.ts';
let s=fs.readFileSync(deep,'utf8');
s=s.replace('  buildings:readonly TacticalBuilding[]\n){','  buildings:readonly TacticalBuilding[],controlColor=\'#3b82f6\'\n){');
s=s.replace('  else if(territoryId===4)drawT4(ctx,width,height,buildings);','  else if(territoryId===4)drawT4(ctx,width,height,buildings);\n  else if(territoryId===5)drawT5(ctx,width,height,buildings);\n  else if(territoryId===6)drawT6(ctx,width,height,buildings,controlColor);');
fs.writeFileSync(deep,s,'utf8');
const game=process.cwd()+'/src/components/GameCanvas.tsx';let g=fs.readFileSync(game,'utf8');
g=g.replace('drawTerritoryStructuralDeepFoundation(layerCtx, width, height, currentTerritory.id, tacticalBuildings);','drawTerritoryStructuralDeepFoundation(layerCtx, width, height, currentTerritory.id, tacticalBuildings, environmentControlColor);');
fs.writeFileSync(game,g,'utf8');console.log('T5/T6 deep foundation activated');
