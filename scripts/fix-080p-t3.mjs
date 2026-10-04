import fs from 'node:fs';
const p=process.cwd()+'/src/components/canvas/territoryStructuralDeepRenderer.ts';
let s=fs.readFileSync(p,'utf8');
s=s.replace("  const serr=building(buildings,'serralheria');if(serr){for(let i=0;i<5;i++)line(ctx,serr.x+8+i*7,serr.y+serr.h+7,serr.x+30+i*7,serr.y+serr.h+7,'rgba(148,163,184,.28)',3);}\n};\n  const deposito=","  const serr=building(buildings,'serralheria');if(serr){for(let i=0;i<5;i++)line(ctx,serr.x+8+i*7,serr.y+serr.h+7,serr.x+30+i*7,serr.y+serr.h+7,'rgba(148,163,184,.28)',3);}\n  const deposito=");
fs.writeFileSync(p,s,'utf8');
console.log('fixed T3 block');
