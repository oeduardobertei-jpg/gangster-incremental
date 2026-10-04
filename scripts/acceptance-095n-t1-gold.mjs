import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();let passed=0,failed=0;
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const check=(name,ok,detail='')=>{if(ok){passed++;console.log(`PASS | ${name}${detail?` | ${detail}`:''}`);}else{failed++;console.error(`FAIL | ${name}${detail?` | ${detail}`:''}`);}};
const game=read('src/components/GameCanvas.tsx');
const props=read('src/data/territoryPurposeProps.ts');
const atmos=read('src/data/territoryAtmospheres.ts');
const hero=read('src/components/canvas/t1HeroLandmarkRenderer.ts');
const gold=read('src/components/canvas/t1GoldFoundationRenderer.ts');
const overlay=read('src/components/canvas/t1GoldOverlayRenderer.ts');
const arch=read('src/components/canvas/t1ArchitectureGoldRenderer.ts');

check('Gold foundation wired',game.includes('drawT1GoldFoundation(layerCtx'));
check('Gold overlay wired',game.includes('drawT1GoldOverlay(ctx'));
check('Architecture gold wired',read('src/components/canvas/buildingSkins.ts').includes('drawT1ArchitectureGold({ctx,b'));
check('Hero landmark entry exists',hero.includes('BECO DOS DESCALÇOS'));
check('Market promoted',props.includes("label:'MERCADO'"));
check('Street-life + utility + ground passes exist',gold.includes('drawStreetLife')&&gold.includes('drawUtilities')&&gold.includes('drawGroundMicro'));
check('LOD/performance budget exists',overlay.includes('renderZoom<.78')&&arch.includes('renderZoom<1.25'));
check('T1 UI identity exists',game.includes('Vielas • Lajes • Comércio local'));
check('Final atmosphere grade exists',atmos.includes("ambientLight: 'rgba(16,23,32,.56)'"));
check('Gold plan exists',fs.existsSync(path.join(root,'docs/T1_0.9.5_GOLD_PLAN.md')));
console.log(`ACCEPTANCE_095N_T1_GOLD passed=${passed} failed=${failed}`);if(failed)process.exit(1);
