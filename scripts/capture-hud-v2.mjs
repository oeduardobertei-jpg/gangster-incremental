import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('docs/screenshots/hud-v2',{recursive:true});
for (const territoryId of [1,2]) {
  const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
  try {
    await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=${territoryId};g.runHighestTerritoryReached=${territoryId};g.gameSpeed=0;g.soundMuted=true;g.territoryTakes=0;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
    await sleep(2200);
    const audit=await s.evaluate(`(()=>({intro:!!document.querySelector('[data-testid="territory-intro"]'),text:document.querySelector('.battle-hud')?.textContent||''}))()`);
    console.log('T'+territoryId, audit);
    const shot=await s.send('Page.captureScreenshot',{format:'png',fromSurface:true});
    writeFileSync(`docs/screenshots/hud-v2/t${territoryId}-combat.png`,Buffer.from(shot.data,'base64'));
  } finally { await s.close(); }
}
