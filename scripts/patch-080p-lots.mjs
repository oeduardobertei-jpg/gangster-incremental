import fs from 'node:fs';
const p=process.cwd()+'/src/components/canvas/environmentRenderer.ts';
let s=fs.readFileSync(p,'utf8');
if(!s.includes("peripheryLotRenderer"))s=s.replace("import { drawLivingGroundFoundation, drawLivingGroundOverlay } from './groundRenderer';","import { drawLivingGroundFoundation, drawLivingGroundOverlay } from './groundRenderer';\nimport { drawPeripheryDecorativeLot } from './peripheryLotRenderer';");
s=s.replace('    drawDecorativeLot(\n      ctx, lot.x * width, lot.y * height, lot.w * width, lot.h * height,\n      lot.material, lot.roof, lot.height\n    );','    drawPeripheryDecorativeLot(\n      ctx, lot.x * width, lot.y * height, lot.w * width, lot.h * height,\n      lot.material, lot.roof, lot.height\n    );');
fs.writeFileSync(p,s,'utf8');
console.log('T1 decorative lots upgraded');
