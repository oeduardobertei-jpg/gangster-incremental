import fs from 'node:fs';
const root='C:/Users/eduardo.bertei/organizacao/IA/prototipos/fac incremental/gangster-incremental-0.8l-full/gangster-incremental';
const game=`${root}/src/components/GameCanvas.tsx`;let s=fs.readFileSync(game,'utf8');
s=s.replace("import { drawUrbanMoodFoundation } from './canvas/urbanMoodRenderer';","import { drawUrbanMoodFoundation } from './canvas/urbanMoodRenderer';\nimport { drawVegetationNeglect } from './canvas/vegetationNeglectRenderer';");
s=s.replace("          drawTerritoryStructuralDeepFoundation(layerCtx, width, height, currentTerritory.id, tacticalBuildings, environmentControlColor);\n          drawMaterialContinuity", "          drawTerritoryStructuralDeepFoundation(layerCtx, width, height, currentTerritory.id, tacticalBuildings, environmentControlColor);\n          drawVegetationNeglect(layerCtx, tacticalBuildings, currentTerritory.id);\n          drawMaterialContinuity");
fs.writeFileSync(game,s,'utf8');
const tokens=`${root}/src/data/visualTokens.ts`;let v=fs.readFileSync(tokens,'utf8').replace('0.8s-lighting-mood-v1','0.8t-vegetation-neglect-v1');fs.writeFileSync(tokens,v,'utf8');
console.log('0.8T vegetation integrated');