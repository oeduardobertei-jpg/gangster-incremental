import fs from 'node:fs';
const root='C:/Users/eduardo.bertei/organizacao/IA/prototipos/fac incremental/gangster-incremental-0.8l-full/gangster-incremental';
const game=`${root}/src/components/GameCanvas.tsx`;
let s=fs.readFileSync(game,'utf8');
s=s.replace("import { drawAuthoredStoryClusters } from './canvas/environmentStoryRenderer';","import { drawAuthoredStoryClusters } from './canvas/environmentStoryRenderer';\nimport { drawUrbanMoodFoundation } from './canvas/urbanMoodRenderer';");
s=s.replace("          drawTerritoryAtmosphereFoundation(\n            layerCtx, width, height, currentTerritory.id, environmentControlColor, tacticalBuildings\n          );\n          drawArchitectureGrounding", "          drawTerritoryAtmosphereFoundation(\n            layerCtx, width, height, currentTerritory.id, environmentControlColor, tacticalBuildings\n          );\n          drawUrbanMoodFoundation(layerCtx, width, height, currentTerritory.id, tacticalBuildings, environmentControlColor);\n          drawArchitectureGrounding");
fs.writeFileSync(game,s,'utf8');
const tokens=`${root}/src/data/visualTokens.ts`;let v=fs.readFileSync(tokens,'utf8').replace('0.8r-authored-story-clusters-v1','0.8s-lighting-mood-v1');fs.writeFileSync(tokens,v,'utf8');
console.log('0.8S static urban lighting integrated');