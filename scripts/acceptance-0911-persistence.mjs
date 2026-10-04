import { openTestSession, sleep } from './cdp-session.mjs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1280,height:800});
const results=[]; const check=(n,ok,d='')=>{results.push({n,ok:!!ok});console.log(`${ok?'PASS':'FAIL'} | ${n} | ${d}`)};
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const {FACTION_CONFIGS}=await import('/src/data/gameData.ts');const {getTacticalBuildings}=await import('/src/components/canvas/favelaRenderer.ts');const g=createDefaultState();g.currentTerritoryId=2;g.runHighestTerritoryReached=2;g.gameSpeed=0;g.soundMuted=true;const f=FACTION_CONFIGS[g.playerFaction];const bs=getTacticalBuildings(1280,720,f,2).filter(b=>b.isRivalHub);const cp=bs.map((b,i)=>({id:'cp_'+b.id,buildingId:b.id,label:b.label,x:b.doorX,y:b.doorY,progress:i<2?1:i===2?.65:0,status:i<2?'captured':i===2?'contested':'rival'}));g.battleSnapshot={version:1,runId:g.runId,territoryId:2,faction:g.playerFaction,capturedAt:Date.now(),allies:[],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,controlPoints:cp,operationPhase:'capture',finalResistanceSpawned:false,finalResistanceWave:0};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 await sleep(1200);
 let op=await s.evaluate(`window.__DISTRICT_OPERATION__??null`);
 check('mid-capture snapshot restores captured hubs',op?.captured===2&&op?.total===6,JSON.stringify(op));
 check('partial capture progress restores',Math.abs((op?.activeProgress??0)-.65)<.051,JSON.stringify(op));
 await sleep(5400);
 const saved=await s.evaluate(`(()=>{const g=JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2')||'null');const cp=g?.battleSnapshot?.controlPoints??[];return {captured:cp.filter(p=>p.status==='captured').length,partial:cp.find(p=>p.status==='contested')?.progress??0,phase:g?.battleSnapshot?.operationPhase}})()`);
 check('autosave persists physical operation',saved.captured===2&&saved.phase==='capture',JSON.stringify(saved));
 await s.evaluate(`location.reload();true`); await sleep(1200); op=await s.evaluate(`window.__DISTRICT_OPERATION__??null`);
 check('reload preserves physical conquest',op?.captured===2&&op?.total===6&&Math.abs((op?.activeProgress??0)-.65)<.051,JSON.stringify(op));
 check('no runtime errors',s.errors.length===0,JSON.stringify(s.errors));
 const failed=results.filter(x=>!x.ok);console.log(`ACCEPTANCE_0911_PERSISTENCE passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await s.close();}
