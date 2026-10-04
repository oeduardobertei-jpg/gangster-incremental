import { openTestSession, sleep } from './cdp-session.mjs';

const session = await openTestSession({ url:'http://127.0.0.1:3000', width:1536, height:864 });
const { evaluate } = session;
const results=[];
const check=(name,ok,detail='')=>{results.push({name,ok:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};

try {
  await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=6;s.runHighestTerritoryReached=6;s.gameSpeed=0;s.soundMuted=true;s.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true})()`);
  await sleep(1200);
  const freshT6=await evaluate(`({cps:window.__DISTRICT_CONTROL_POINTS__??[],op:window.__DISTRICT_OPERATION__??null})`);
  const qg=freshT6.cps.find(p=>p.label==='QG Central');
  check('T6 exposes six physical control points',freshT6.cps.length===6,`count=${freshT6.cps.length}`);
  check('T6 QG Central has authored accessible anchor',Boolean(qg)&&qg.y>195,JSON.stringify(qg));

  const qgAnchor=JSON.stringify({x:qg?.x??640,y:qg?.y??220});
  await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const {getTacticalBuildings}=await import('/src/components/canvas/favelaRenderer.ts');const {FACTION_CONFIGS}=await import('/src/data/gameData.ts');const {WORLD_WIDTH,WORLD_HEIGHT}=await import('/src/components/canvas/camera2D.ts');const s=createDefaultState();s.currentTerritoryId=6;s.runHighestTerritoryReached=6;s.stats.highestTerritoryReached=6;s.territoryTakes=199;s.gameSpeed=1;s.soundMuted=true;const hubs=getTacticalBuildings(WORLD_WIDTH,WORLD_HEIGHT,FACTION_CONFIGS[s.playerFaction],6).filter(b=>b.isRivalHub);const cps=hubs.map(b=>({id:'cp_'+b.id,buildingId:b.id,label:b.label,x:b.doorX,y:b.doorY,progress:b.label==='QG Central'?.15:1,status:b.label==='QG Central'?'contested':'captured'}));const anchor=${qgAnchor};const ally={id:'qg-capture-ally',type:'soldado_base',name:'QA',x:anchor.x,y:anchor.y+4,vx:0,vy:0,hp:999,maxHp:999,speed:1.2,damage:.01,attackRange:100,attackCooldown:1,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:0};const rival={id:'qg-far-rival',type:'soldado_pistola',name:'QA Rival',x:1100,y:650,vx:0,vy:0,hp:99999,maxHp:99999,speed:0,damage:0,attackRange:0,attackCooldown:2,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:0};s.battleSnapshot={version:1,runId:s.runId,territoryId:6,faction:s.playerFaction,capturedAt:Date.now(),allies:[ally],rivals:[rival],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,controlPoints:cps,operationPhase:'capture',finalResistanceSpawned:false,finalResistanceWave:0,campaignMilestonesTriggered:[]};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true})()`);
  await sleep(2200);
  const migrated=await evaluate(`({cps:window.__DISTRICT_CONTROL_POINTS__??[],op:window.__DISTRICT_OPERATION__??null,units:window.__GAME_UNITS__??null})`);
  const migratedQG=migrated.cps.find(p=>p.label==='QG Central');
  check('legacy T6 QG save anchor migrates to current geometry',Boolean(migratedQG)&&Math.abs((migratedQG?.y??0)-(qg?.y??0))<2,JSON.stringify(migratedQG));
  check('T6 QG Central capture progresses above legacy 15%',(migratedQG?.progress??0)>.18,`progress=${migratedQG?.progress}; op=${JSON.stringify(migrated.op)}`);

  await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const {getTacticalBuildings}=await import('/src/components/canvas/favelaRenderer.ts');const {FACTION_CONFIGS}=await import('/src/data/gameData.ts');const {WORLD_WIDTH,WORLD_HEIGHT}=await import('/src/components/canvas/camera2D.ts');const s=createDefaultState();s.currentTerritoryId=5;s.runHighestTerritoryReached=5;s.stats.highestTerritoryReached=5;s.territoryTakes=63;s.gameSpeed=1;s.soundMuted=true;s.maxAllies=96;const hubs=getTacticalBuildings(WORLD_WIDTH,WORLD_HEIGHT,FACTION_CONFIGS[s.playerFaction],5).filter(b=>b.isRivalHub);const cps=hubs.map(b=>({id:'cp_'+b.id,buildingId:b.id,label:b.label,x:b.doorX,y:b.doorY,progress:1,status:'captured'}));const allies=Array.from({length:48},(_,i)=>({id:'t5-hold-'+i,type:i%7===0?'soldado_fuzil':'soldado_base',name:'Aliado',x:320+(i%12)*48,y:330+Math.floor(i/12)*45,vx:0,vy:0,hp:900,maxHp:900,speed:1.2,damage:.01,attackRange:150,attackCooldown:.8,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:i%3}));const rival={id:'t5-pressure-rival',type:'blindado_choque',name:'Pressão',x:640,y:655,vx:0,vy:0,hp:999999,maxHp:999999,speed:0,damage:0,attackRange:0,attackCooldown:3,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:14,factionTag:'PCC',variant:0};s.battleSnapshot={version:1,runId:s.runId,territoryId:5,faction:s.playerFaction,capturedAt:Date.now(),allies,rivals:[rival],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,controlPoints:cps,operationPhase:'capture',finalResistanceSpawned:false,finalResistanceWave:0,campaignMilestonesTriggered:[]};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true})()`);
  let t5Before=[];
  for(let i=0;i<20;i++){t5Before=await evaluate(`window.__GAME_UNITS__?.allies??[]`);if(t5Before.length>=40)break;await sleep(150);}
  await sleep(3500);
  const t5After=await evaluate(`({units:window.__GAME_UNITS__?.allies??[],op:window.__DISTRICT_OPERATION__??null,perf:window.__GAME_PERF__??null,hud:document.querySelector('.battle-hud')?.innerText??''})`);
  const avgY=a=>a.length?a.reduce((n,u)=>n+u.y,0)/a.length:0;
  const beforeY=avgY(t5Before),afterY=avgY(t5After.units),top=t5After.units.filter(u=>u.y<60).length;
  check('T5 remains in consolidate-pressure state',t5After.op?.captured===6&&t5After.op?.phase==='capture',t5After.hud.replace(/\n/g,' | '));
  check('T5 allies no longer march to north edge after 6/6',top<=2&&afterY>beforeY-35,`top=${top}; centroidY=${beforeY.toFixed(1)}->${afterY.toFixed(1)}`);
  check('critical fixes keep solid-world violations at zero',(t5After.perf?.solidWorldViolations??0)===0,JSON.stringify(t5After.perf));
  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));

  const failed=results.filter(r=>!r.ok);
  console.log(`ACCEPTANCE_0914_CRITICAL passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length) process.exitCode=1;
} finally { await session.close(); }
