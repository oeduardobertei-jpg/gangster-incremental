import { readFileSync, writeFileSync } from 'node:fs';
const path='HANDOFF.md';
let s=readFileSync(path,'utf8');
const marker='## 0.7A — Rádio Urbana';
const idx=s.indexOf(marker);
if(idx<0) throw new Error('radio handoff marker missing');
const radio=`## 0.7 — Rádio Urbana\n- Rádio principal: **89.5 Brazilian Gangsta** (5 instrumentais via YouTube).\n- Alternativas: **94.7 Rádio Concreto** (procedural/original) e **103.3 LOFI FUNK BR** (vídeo único dividido em 26 capítulos).\n- Player do header mantém estação, anterior/próxima, play/pause e volume.\n- Brazilian Gangsta usa \`youtubeTrackEngine.ts\`; LOFI FUNK BR usa \`youtubePlaylistEngine.ts\`.\n- Brazilian Gangsta é a estação padrão para perfis sem preferência salva.\n- Gate focal: \`acceptance-070d-gangsta.mjs\` = **6/6 PASS**; TypeScript PASS.\n`;
s=s.slice(0,idx)+radio;
writeFileSync(path,s,'utf8');