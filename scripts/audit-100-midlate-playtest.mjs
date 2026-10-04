import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync } from 'node:fs';
const cases=[
 {id:3, upgrades:{armory_bulletproof_vest:8,armory_heavy_calibers:7,armory_motorcycle_squad:5,armory_medics_safehouse:2,boca_fortified_bunkers:5,boca_barricades:4,boca_fuzileiros_elite:2,boca_auto_ammo_scavenge:3,intel_radio_network:8,intel_central_command:5,sindicato_auto_recruit:3,sindicato_double_reinforcements:2},talents:{}},
 {id:6, upgrades:{armory_bulletproof_vest:22,armory_heavy_calibers:20,armory_motorcycle_squad:14,armory_medics_safehouse:8,boca_fortified_bunkers:15,boca_barricades:12,boca_fuzileiros_elite:6,boca_auto_ammo_scavenge:9,intel_radio_network:22,intel_central_command:16,sindicato_auto_recruit:7,sindicato_double_reinforcements:6},talents:{talent_cartel_cash:3,talent_intel_network:3,talent_veteran_enforcers:3}}
];
const results=[];
for(const c of cases){
 const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
 try{
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const {computeDerivedStats}=await import('/src/rules/upgrades.ts');const g=createDefaultState();g.currentTerritoryId=${c.id};g.runHighestTerritoryReached=${c.id};g.stats.highestTerritoryReached=${c.id};g.gameSpeed=5;g.soundMuted=true;g.upgrades=${JSON.stringify(c.upgrades)};g.talents=${JSON.stringify(c.talents)};Object.assign(g,computeDerivedStats(g));g.intel=g.maxIntel;g.cash=5000;g.ammo=2500;g.respect=1200;g.contacts=150;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  await sleep(1800); const start=Date.now(); const samples=[]; let next=0;
  while(Date.now()-start<30000){
   await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Convocar Soldado'));if(b&&!b.disabled)b.click();return true})()`);
   if(Date.now()-start>=next){samples.push({t:Math.round((Date.now()-start)/1000),perf:await s.evaluate('window.__GAME_PERF__'),hud:await s.evaluate(`document.querySelector('.battle-hud')?.innerText||''`),district:await s.evaluate('window.__DISTRICT_OPERATION__||null')});next+=5000;}
   await sleep(300);
  }
  results.push({territory:c.id,samples,errors:s.errors});
 }finally{await s.close();}
}
writeFileSync('docs/audit-1.0-midlate-playtest.json',JSON.stringify(results,null,2));
console.log('MIDLATE_PLAYTEST_DONE '+results.map(r=>'T'+r.territory+':'+r.samples.length).join(' '));
