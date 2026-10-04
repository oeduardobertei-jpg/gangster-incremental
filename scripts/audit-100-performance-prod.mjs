import { openTestSession, sleep } from './cdp-session.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const base=JSON.parse(readFileSync('docs/audit-1.0-natural-playtest.json','utf8')).samples[0].save;
const cases=[{id:1,fort:0,target:15},{id:3,fort:5,target:30},{id:6,fort:15,target:60}]; const out=[];
for(const c of cases){const s=await openTestSession({url:'http://127.0.0.1:4173',width:1536,height:864});try{
 const g=structuredClone(base);g.currentTerritoryId=c.id;g.runHighestTerritoryReached=c.id;g.stats.highestTerritoryReached=c.id;g.gameSpeed=1;g.soundMuted=true;g.upgrades={armory_bulletproof_vest:20,armory_heavy_calibers:20,boca_fortified_bunkers:c.fort,intel_radio_network:20,intel_central_command:40};g.maxAllies=15+c.fort*3;g.maxIntel=5000;g.intel=5000;g.battleSnapshot=undefined;
 await s.evaluate(`(()=>{localStorage.setItem('factions_war_pt_br_save_v2',${JSON.stringify(JSON.stringify(g))});location.reload();return true})()`);await sleep(1800);
 for(let i=0;i<c.target;i++){await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Convocar Soldado'));if(b&&!b.disabled)b.click();return true})()`);await sleep(35);} await sleep(6500);
 out.push({territory:c.id,perf:await s.evaluate('window.__GAME_PERF__'),errors:s.errors});
}finally{await s.close();}}
writeFileSync('docs/audit-1.0-performance-prod.json',JSON.stringify(out,null,2));for(const r of out)console.log(`PROD T${r.territory} allies=${r.perf?.allies} rivals=${r.perf?.rivals} fps=${r.perf?.fps?.toFixed?.(1)} render=${r.perf?.avgRenderMs?.toFixed?.(2)} sim=${r.perf?.avgSimulationMs?.toFixed?.(2)}`);
