import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const session = await openTestSession({ width: 1440, height: 900 });
const { send, evaluate } = session;
mkdirSync('docs/screenshots/0.5', { recursive: true });
const shot = async name => {
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(`docs/screenshots/0.5/${name}.png`, Buffer.from(data, 'base64'));
};
const install = async upgrades => {
  await evaluate(`(async()=>{
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const s = createDefaultState();
    s.currentTerritoryId=1; s.runHighestTerritoryReached=1; s.gameSpeed=0; s.soundMuted=true;
    s.cash=999999; s.ammo=999999; s.respect=999999; s.contacts=999999;
    s.maxAllies=120; s.upgrades=${JSON.stringify(upgrades)}; s.battleSnapshot=undefined;
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s)); location.reload(); return true;
  })()`);
  await sleep(1400);
};
try {
  await install({});
  await shot('t1-low-panel');
  const focus = await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(!b)return false;b.click();return true})()`);
  if (focus) { await sleep(350); await shot('t1-low-focus'); }
  await install({
    armory_bulletproof_vest:50, armory_heavy_calibers:50, armory_motorcycle_squad:30,
    armory_medics_safehouse:25, boca_fortified_bunkers:40, boca_barricades:20,
    boca_fuzileiros_elite:10, boca_auto_ammo_scavenge:15, intel_radio_network:50,
    intel_central_command:40, sindicato_auto_recruit:10
  });
  await shot('t1-max-panel');
  console.log('CAPTURE_05_T1_OK');
} finally { await session.close(); }