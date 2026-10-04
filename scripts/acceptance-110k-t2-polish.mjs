import { readFileSync, writeFileSync } from 'node:fs';
import { openTestSession, sleep } from './cdp-session.mjs';
let passed=0,failed=0;const results=[];
const check=(ok,label,detail='')=>{results.push({ok,label,detail});console.log(`${ok?'PASS':'FAIL'} | ${label}${detail?` | ${detail}`:''}`);ok?passed++:failed++;};
const rail=readFileSync('src/components/canvas/t2RailGroundReauthorRenderer.ts','utf8');
const ground=readFileSync('src/components/canvas/groundRenderer.ts','utf8');
const identity=readFileSync('src/components/canvas/cariocaIdentityRenderer.ts','utf8');
const biome=readFileSync('src/data/territoryBiomes.ts','utf8');
check(rail.includes('drawMarketFixtures'),'T2 authored market fixtures present');
check(rail.includes('drawRailAccessStory'),'rail access story present');
check(rail.includes('drawRailSignals'),'rail signaling present');
check(rail.includes('drawMarketAisles'),'market circulation authored');
check(!ground.includes("if (territoryId === 2) {\n    drawPaverGrid"),'legacy global T2 paver grid retired');
check(identity.includes('const drawT2=(a:Args)=>'),'T2 landmark identity overlay present');
check(identity.includes("b.id==='laje_ponto'")&&identity.includes("b.id==='boca_leste'")&&identity.includes("b.id==='mirante'"),'warehouse station and footbridge differentiated');
check((biome.match(/kind:'pavers'/g)||[]).length<5,'T2 biome no longer dominated by paver slabs');
const baseUrl=process.env.BASE_URL||'http://127.0.0.1:3001';
const s=await openTestSession({url:baseUrl,width:1536,height:864});
try{
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=2;g.runHighestTerritoryReached=2;g.stats.highestTerritoryReached=2;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  await sleep(2200);
  const state=await s.evaluate(`(()=>({text:document.querySelector('.battle-hud')?.textContent||'',perf:window.__GAME_PERF__,canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON()}))()`);
  check(/Praça da Feira|Linha do Trem/.test(state.text),'T2 HUD identity preserved',state.text.replace(/\s+/g,' ').slice(0,90));
  check((state.perf?.solidWorldViolations??0)===0,'T2 runtime physically clean',`violations=${state.perf?.solidWorldViolations??0}`);
  check((state.canvas?.height??0)>500,'T2 battlefield remains readable',`canvas=${Math.round(state.canvas?.width||0)}x${Math.round(state.canvas?.height||0)}`);
  check(s.errors.length===0,'T2 runtime has no browser errors',JSON.stringify(s.errors));
} finally {await s.close();}
writeFileSync('docs/acceptance-110k-t2-polish.json',JSON.stringify({passed,failed,results},null,2));
console.log(`T2_POLISH_11K ${passed}/${passed+failed} PASS`);if(failed)process.exitCode=1;
