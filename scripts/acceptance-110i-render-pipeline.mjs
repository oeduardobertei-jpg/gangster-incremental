import { readFileSync } from 'node:fs';

const game = readFileSync('src/components/GameCanvas.tsx','utf8');
const pipeline = readFileSync('src/components/canvas/territoryScenePipeline.ts','utf8');
const checks = [];
const check=(name,ok)=>checks.push([name,Boolean(ok)]);

const legacyCalls = [
'drawTerritorySceneFoundation','drawTerritoryPolishFoundation','drawWorldDensityFoundation','drawBrazilianContextFoundation',
'drawBiomeDepthFoundation','drawTerritoryAtmosphereFoundation','drawUrbanMoodFoundation','drawArchitectureGrounding',
'drawCariocaGroundIntegration','drawTerritoryStructuralDeepFoundation','drawMaterialHarmonizationGround','drawVegetationNeglect',
'drawMaterialContinuity','drawSemanticBuildingContext','drawFunctionalBuildingAccess','drawGroundStoryUseZones',
'drawAuthoredStoryClusters','drawStreetLifeClusters','drawT1StaticComposition','drawPurposefulPropsFoundation',
'drawCityVivaAmbientOverlay','drawT1PreWorldOverlay','drawTerritoryPolishOverlay','drawTerritoryAtmosphereUnderlay',
'drawWorldDensityOverlay','drawT1ReadabilityOverlay'
];
check('GameCanvas owns no direct environment pass', legacyCalls.every(name => !game.includes(`${name}(`)));
check('GameCanvas uses static pipeline contract', game.includes('drawStaticTerritoryScene({'));
check('GameCanvas uses dynamic pipeline contract', game.includes('drawTerritoryEnvironmentOverlays({'));
check('pipeline preserves City Viva foundation first', pipeline.indexOf('drawTerritorySceneFoundation(') < pipeline.indexOf('drawUnifiedTerritoryComposition('));
check('pipeline keeps T1 composition before purposeful props', pipeline.indexOf('drawT1StaticComposition(') < pipeline.indexOf('drawPurposefulPropsFoundation('));
check('dynamic ambient precedes T1 preworld', pipeline.indexOf('drawCityVivaAmbientOverlay(') < pipeline.indexOf('drawT1PreWorldOverlay('));
check('T1 readability remains final environment overlay', pipeline.lastIndexOf('drawT1ReadabilityOverlay(') > pipeline.lastIndexOf('drawWorldDensityOverlay('));
check('minimap remains independently imported', game.includes("drawCityVivaMinimapFoundation } from './canvas/environmentRenderer'"));
check('depth sorted architecture still stays in GameCanvas', game.includes('drawUnifiedContextArchitecture(ctx'));
check('unit grounding still stays adjacent to entity draw', game.includes('drawT1UnitGrounding(ctx'));

for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} | ${name}`);
if(checks.some(([,ok])=>!ok)) process.exit(1);
console.log(`RENDER_PIPELINE_11I ${checks.length}/${checks.length} PASS`);
