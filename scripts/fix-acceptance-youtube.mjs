import { readFileSync, writeFileSync } from 'node:fs';
const path='scripts/acceptance-070c-youtube.mjs';
let s=readFileSync(path,'utf8');
s=s.replace("const ytState=await evaluate((async()=>{const m=await import('/src/audio/youtubePlaylistEngine.ts');return m.youtubePlaylistEngine.getState()})());","const ytState=await evaluate(`(async()=>{const m=await import('/src/audio/youtubePlaylistEngine.ts');return m.youtubePlaylistEngine.getState()})()`);");
writeFileSync(path,s,'utf8');