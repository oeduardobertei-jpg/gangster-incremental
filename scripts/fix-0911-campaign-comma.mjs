import { readFileSync, writeFileSync } from 'node:fs';
const f='scripts/acceptance-060-campaign.mjs';
let s=readFileSync(f,'utf8');
const old="?.weight??0\n      t6OpeningBoss:";
if(!s.includes(old)) throw new Error('comma target missing');
s=s.replace(old,"?.weight??0,\n      t6OpeningBoss:");
writeFileSync(f,s,'utf8');
console.log('campaign harness comma fixed');
