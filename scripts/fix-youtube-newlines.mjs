import { readFileSync, writeFileSync } from 'node:fs';
const path='src/audio/youtubePlaylistEngine.ts';
let s=readFileSync(path,'utf8');
s=s.replaceAll('`r`n','\r\n');
writeFileSync(path,s,'utf8');
console.log('fixed literal newline markers');