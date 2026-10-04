import { openTestSession, sleep } from './cdp-session.mjs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1440,height:900});
const results=[]; const check=(n,ok,d='')=>{results.push({n,ok:!!ok,d});console.log(`${ok?'PASS':'FAIL'} | ${n} | ${d}`)};
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const {getTacticalBuildings}=await import('/src/components/canvas/favelaRenderer.ts');const {FACTION_CONFIGS}=await import('/src/data/gameData.ts');const {WORLD_WIDTH,WORLD_HEIGHT}=await import('/src/components/canvas/camera2D.ts');const g=createDefaultState();g.currentTerritoryId=6;g.runHighestTerritoryReached=6;g.stats.highestTerritoryReached=6;g.territoryTakes=199;g.gameSpeed=0;g.soundMuted=true;g.upgrades={armory_bulletproof_vest:50,armory_heavy_calibers:50};g.talents={talent_veteran_enforcers:30};const hubs=getTacticalBuildings(WORLD_WIDTH,WORLD_HEIGHT,FACTION_CONFIGS.vermelha,6).filter(b=>b.isRivalHub);const cps=hubs.map(b=>({id:'cp_'+b.id,buildingId:b.id,label:b.label,x:b.doorX,y:b.doorY,progress:1,status:'captured'}));const a={id:'qa-ally',type:'soldado_fuzil',name:'QA',x:600,y:54,vx:0,vy:0,hp:999,maxHp:999,speed:1,damage:999,attackRange:900,attackCooldown:.08,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:0};const r={id:'qa-rival',type:'soldado_pistola',name:'QA Rival',x:650,y:54,vx:0,vy:0,hp:1,maxHp:1,speed:0,damage:0,attackRange:0,attackCooldown:1,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:0};g.battleSnapshot={version:1,runId:g.runId,territoryId:6,faction:g.playerFaction,capturedAt:Date.now(),allies:[a],rivals:[r],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,controlPoints:cps,operationPhase:'capture',finalResistanceSpawned:false,finalResistanceWave:0,campaignMilestonesTriggered:[]};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 await sleep(1400);
 const before=await s.evaluate(`({op:window.__DISTRICT_OPERATION__,hud:document.querySelector('.battle-hud')?.innerText||''})`);
 check('6/6 plus 199/200 does not start final resistance',before.op?.phase==='capture'&&before.op?.captured===6,before.hud.replace(/\n/g,' | '));
 check('HUD asks to consolidate pressure',before.hud.includes('CONSOLIDAR PRESSÃO')&&before.hud.includes('199/200'),before.hud.replace(/\n/g,' | '));
 await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='5x');b?.click();return true})()`);
 let sawFinal=false,sawDominated=false; let last=null;
 for(let i=0;i<240;i++){last=await s.evaluate(`({op:window.__DISTRICT_OPERATION__,hud:document.querySelector('.battle-hud')?.innerText||'',bossCalls:(window.__BOSS_COMMAND_CALLS__||0)+(window.__BOSS_LAST_STAND_CALLS__||0),perf:window.__GAME_PERF__})`);if(last.op?.phase==='final_resistance')sawFinal=true;if(last.op?.phase==='dominated'){sawDominated=true;break;}await sleep(100);}
 check('200th neutralization unlocks final resistance',sawFinal,JSON.stringify(last?.op));
 check('final resistance includes boss behavior',(last?.bossCalls??0)>0||sawDominated,`bossCalls=${last?.bossCalls}; phase=${last?.op?.phase}`);
 check('T6 dominates only after final resistance',sawFinal&&sawDominated,last?.hud?.replace(/\n/g,' | ')||'');
 check('no solid-world violations',(last?.perf?.solidWorldViolations??0)===0,JSON.stringify(last?.perf));
 check('no runtime errors',s.errors.length===0,JSON.stringify(s.errors));
 const failed=results.filter(x=>!x.ok); console.log(`ACCEPTANCE_0911 passed=${results.length-failed.length} failed=${failed.length}`); if(failed.length)process.exitCode=1;
}finally{await s.close();}
