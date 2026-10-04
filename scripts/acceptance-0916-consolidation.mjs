import { openTestSession, sleep } from './cdp-session.mjs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1440,height:900});
const {evaluate}=s;const results=[];const check=(n,ok,d='')=>{results.push({n,ok:!!ok,d});console.log(`${ok?'PASS':'FAIL'} | ${n} | ${d}`)};
try{
 for(let territory=1;territory<=6;territory++){
  await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const {getTacticalBuildings}=await import('/src/components/canvas/favelaRenderer.ts');const {FACTION_CONFIGS,TERRITORIES}=await import('/src/data/gameData.ts');const {WORLD_WIDTH,WORLD_HEIGHT}=await import('/src/components/canvas/camera2D.ts');const g=createDefaultState();g.currentTerritoryId=${territory};g.runHighestTerritoryReached=${territory};g.stats.highestTerritoryReached=${territory};g.territoryTakes=0;g.gameSpeed=5;g.soundMuted=true;g.maxAllies=80;const hubs=getTacticalBuildings(WORLD_WIDTH,WORLD_HEIGHT,FACTION_CONFIGS[g.playerFaction],${territory}).filter(b=>b.isRivalHub);const cps=hubs.map(b=>({id:'cp_'+b.id,buildingId:b.id,label:b.label,x:b.doorX,y:b.doorY,progress:1,status:'captured'}));const allies=Array.from({length:24},(_,i)=>({id:'hold-a-'+i,type:i%6===0?'soldado_fuzil':'soldado_base',name:'Aliado',x:300+(i%8)*85,y:300+Math.floor(i/8)*55,vx:0,vy:0,hp:900,maxHp:900,speed:1.2,damage:.01,attackRange:150,attackCooldown:.8,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:i%3}));const maxR=TERRITORIES.find(t=>t.id===${territory})?.maxRivals??24;const rivals=Array.from({length:maxR},(_,i)=>({id:'hold-r-'+i,type:'soldado_pistola',name:'Rival',x:180+(i%12)*82,y:610+Math.floor(i/12)*24,vx:0,vy:0,hp:999999,maxHp:999999,speed:0,damage:0,attackRange:0,attackCooldown:4,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:i%3}));g.battleSnapshot={version:1,runId:g.runId,territoryId:${territory},faction:g.playerFaction,capturedAt:Date.now(),allies,rivals,fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,controlPoints:cps,operationPhase:'capture',finalResistanceSpawned:false,finalResistanceWave:0,campaignMilestonesTriggered:[]};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true})()`);
  let state=null;
  for(let tries=0;tries<24;tries++){
    await sleep(150);
    state=await evaluate(`({op:window.__DISTRICT_OPERATION__??null,units:window.__GAME_UNITS__?.allies??[],perf:window.__GAME_PERF__??null})`);
    if(state?.op?.captured===6&&state.units.length>=20&&state.perf)break;
  }
  const top=state.units.filter(u=>u.y<60).length;const cy=state.units.length?state.units.reduce((n,u)=>n+u.y,0)/state.units.length:0;
  check(`T${territory} stays in consolidation with 6/6`,state.op?.captured===6&&state.op?.phase==='capture',JSON.stringify(state.op));
  check(`T${territory} does not fallback-drift north`,state.units.length>=20&&top<=2&&cy>300,`allies=${state.units.length}; top=${top}; centroidY=${cy.toFixed(1)}`);
  check(`T${territory} consolidation remains physically clean`,(state.perf?.solidWorldViolations??0)===0,`violations=${state.perf?.solidWorldViolations??'missing'}; fps=${(state.perf?.fps??0).toFixed?.(1)??state.perf?.fps}`);
 }
 check('consolidation audit has no runtime errors',s.errors.length===0,JSON.stringify(s.errors));
 const failed=results.filter(r=>!r.ok);console.log(`ACCEPTANCE_0916_CONSOLIDATION passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await s.close();}
