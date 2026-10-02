import { readFileSync, writeFileSync } from 'node:fs';
let p='src/audio/youtubePlaylistEngine.ts', s=readFileSync(p,'utf8');
s=s.replace("  private emit() {\n    const snapshot = this.getState();\n    this.listeners.forEach(listener => listener(snapshot));\n  }","  private emit() {\n    const snapshot = this.getState();\n    if (typeof window !== 'undefined') (window as any).__GDF_YOUTUBE_RADIO_STATE__ = snapshot;\n    this.listeners.forEach(listener => listener(snapshot));\n  }");
writeFileSync(p,s,'utf8');
p='scripts/acceptance-070c-youtube.mjs'; s=readFileSync(p,'utf8');
s=s.replace("const ytState=await evaluate(`(async()=>{const m=await import('/src/audio/youtubePlaylistEngine.ts');return m.youtubePlaylistEngine.getState()})()`);","const ytState=await evaluate(`window.__GDF_YOUTUBE_RADIO_STATE__ || null`);");
writeFileSync(p,s,'utf8');