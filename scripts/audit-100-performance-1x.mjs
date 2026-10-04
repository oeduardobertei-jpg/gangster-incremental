import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync } from 'node:fs';
const cases=[{id:1,fort:0,target:15},{id:3,fort:5,target:30},{id:6,fort:15,target:60}];
const out=[];
for(const c of cases){const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=${c.id};g.runHighestTerritoryReached=${c.id};g.stats.highestTerritoryReached=${c.id};g.gameSpeed=1;g.soundMuted=true;g.upgrades={armory_bulletproof_vest:20,armory_heavy_calibers:20,boca_fortified_bunkers:${c.fort},intel_radio_network:20,intel_central_command:40};g.maxAllies=${15+c.fort*3};g.maxIntel=5000;g.intel=5000;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);await sleep(1600);
 for(let i=0;i<c.target;i++){await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Convocar Soldado'));if(b&&!b.disabled)b.click();return true})()`);await sleep(35);}
 await sleep(5000); const a=await s.evaluate('window.__GAME_PERF__'); await sleep(5000); const b=await s.evaluate('window.__GAME_PERF__');out.push({territory:c.id,first:a,second:b,errors:s.errors});
}finally{await s.close();}}
writeFileSync('docs/audit-1.0-performance-1x.json',JSON.stringify(out,null,2));
for(const r of out)console.log(`T${r.territory} allies=${r.second?.allies} rivals=${r.second?.rivals} fps=${r.second?.fps?.toFixed?.(1)} render=${r.second?.avgRenderMs?.toFixed?.(2)} sim=${r.second?.avgSimulationMs?.toFixed?.(2)} viol=${r.second?.solidWorldViolations}`);


