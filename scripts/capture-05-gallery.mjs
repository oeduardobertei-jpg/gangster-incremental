import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const session = await openTestSession({ width: 1440, height: 900 });
const { send, evaluate } = session;
mkdirSync('docs/screenshots/0.5/gallery', { recursive: true });
try {
  for (let territory = 1; territory <= 6; territory++) {
    await evaluate(`(async()=>{
      const { createDefaultState }=await import('/src/state/defaultGameState.ts');
      const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.gameSpeed=0;s.soundMuted=true;
      s.maxAllies=90;s.cash=5000;s.ammo=5000;s.respect=5000;s.contacts=5000;
      s.upgrades={boca_fortified_bunkers:18,intel_radio_network:22,intel_central_command:14,armory_motorcycle_squad:12,armory_medics_safehouse:8,boca_auto_ammo_scavenge:6,sindicato_auto_recruit:3};
      s.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
    })()`);
    await sleep(1300);
    await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Foco'));if(b&&!b.textContent.includes('ativo'))b.click();return true})()`);
    await sleep(250);
    const rect=await evaluate(`(()=>{const c=document.querySelector('canvas');const r=c.parentElement.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
    const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,clip:{...rect,scale:1}});
    writeFileSync(`docs/screenshots/0.5/gallery/territory-${territory}.png`,Buffer.from(shot.data,'base64'));
    console.log('captured',territory);
  }
} finally { await session.close(); }