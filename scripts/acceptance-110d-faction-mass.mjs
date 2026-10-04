import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const url=process.env.BASE_URL||'http://127.0.0.1:3001';
const out='docs/screenshots/1.1d-movement';mkdirSync(out,{recursive:true});
const session=await openTestSession({url,width:1536,height:864});
const {evaluate}=session;const results=[];
const check=(name,ok,detail='')=>{results.push({name,ok:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
const readMassState=()=>evaluate(`(()=>{const units=window.__GAME_UNITS__??{};const allies=units.allies??[];const perf=window.__GAME_PERF__??{};const cps=window.__DISTRICT_CONTROL_POINTS__??[];const nearest=allies.map((a,i)=>{let n=1e9;for(let j=0;j<allies.length;j++){if(i===j)continue;n=Math.min(n,Math.hypot(a.x-allies[j].x,a.y-allies[j].y));}return n===1e9?0:n;});const xs=allies.map(a=>a.x),ys=allies.map(a=>a.y);return{allies,perf,cps,avgNearest:nearest.reduce((a,b)=>a+b,0)/Math.max(1,nearest.length),width:allies.length?Math.max(...xs)-Math.min(...xs):0,height:allies.length?Math.max(...ys)-Math.min(...ys):0,moved:allies.filter(a=>Math.hypot(a.x-626.5,a.y-629)>80).length,capturing:cps.filter(p=>p.progress>0).map(p=>({label:p.label,progress:p.progress,status:p.status}))}})()`);
try{
  await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=1;s.runHighestTerritoryReached=1;s.gameSpeed=0;s.soundMuted=true;s.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true})()`);
  let cps=[];for(let i=0;i<20;i++){await sleep(120);cps=await evaluate(`window.__DISTRICT_CONTROL_POINTS__??[]`);if(cps.length===6)break;}
  check('T1 exposes six anchors for mass-flow test',cps.length===6,`anchors=${cps.length}`);

  const pure=await evaluate(`(async()=>{const m=await import('/src/rules/troopMovement.ts');const a=m.getFactionApproachPoint('alpha',500,400,18),a2=m.getFactionApproachPoint('alpha',500,400,18),b=m.getFactionApproachPoint('beta',500,400,18);const mk=(id,x,y)=>({id,type:'soldado_base',name:id,x,y,vx:1,vy:0,hp:100,maxHp:100,speed:1,damage:1,attackRange:100,attackCooldown:1,attackTimer:0,targetId:null,color:'#fff',radius:11});const u=mk('straggler',0,0),flow=m.computeAllyMassFlow(u,[u,mk('n1',92,0),mk('n2',102,12),mk('n3',108,-10)]);const v=m.applyFactionMassToVelocity(u,1,0,flow,1);return{a,a2,b,flow,v}})()`);
  check('approach slots are deterministic',pure.a.x===pure.a2.x&&pure.a.y===pure.a2.y,JSON.stringify(pure.a));
  check('different allies receive different approach slots',Math.hypot(pure.a.x-pure.b.x,pure.a.y-pure.b.y)>2,JSON.stringify({a:pure.a,b:pure.b}));
  check('local mass pulls a straggler back toward squad',pure.flow.cohesionX>.25&&pure.flow.neighborCount===3,JSON.stringify(pure.flow));
  check('mass velocity remains speed-capped',Math.hypot(pure.v.vx,pure.v.vy)<=1.141,JSON.stringify(pure.v));

  const serialized=JSON.stringify(cps.map(p=>({...p,progress:0,status:'uncaptured'})));
  await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=1;s.runHighestTerritoryReached=1;s.stats.highestTerritoryReached=1;s.gameSpeed=5;s.soundMuted=true;s.maxAllies=30;const allies=[];for(let i=0;i<12;i++){allies.push({id:'mass-'+i,type:'soldado_base',name:'Massa '+i,x:616+(i%4)*7,y:622+Math.floor(i/4)*7,vx:0,vy:0,hp:999999,maxHp:999999,speed:1.15,damage:.01,attackRange:110,attackCooldown:1,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:i%3});}const rival={id:'qa-far-rival',type:'soldado_pistola',name:'Rival QA',x:1180,y:76,vx:0,vy:0,hp:999999,maxHp:999999,speed:0,damage:0,attackRange:0,attackCooldown:3,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:0};s.battleSnapshot={version:1,runId:s.runId,territoryId:1,faction:s.playerFaction,capturedAt:Date.now(),allies,rivals:[rival],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,controlPoints:${serialized},operationPhase:'capture',finalResistanceSpawned:false,finalResistanceWave:0,campaignMilestonesTriggered:[]};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true})()`);

  let state=await readMassState();
  for(let attempt=0;attempt<40&&state.allies.length!==12;attempt++){await sleep(150);state=await readMassState();}
  for(let attempt=0;attempt<28&&(state.moved<8||state.capturing.length===0);attempt++){await sleep(250);state=await readMassState();}

  check('all 12 test allies survive simulation',state.allies.length===12,`allies=${state.allies.length}`);
  check('compact spawn opens into readable personal space',state.avgNearest>=18,`avgNearest=${state.avgNearest.toFixed(1)}`);
  check('faction mass advances instead of freezing',state.moved>=8,`moved=${state.moved}/12 width=${state.width.toFixed(1)} height=${state.height.toFixed(1)}`);
  check('runtime remains physically clean',(state.perf.solidWorldViolations??99)===0,`violations=${state.perf.solidWorldViolations}`);
  check('capture flow remains live',state.capturing.length>0,JSON.stringify(state.capturing));
  check('mass-flow browser session has no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const image=await session.send('Page.captureScreenshot',{format:'png',fromSurface:true});writeFileSync(`${out}/t1-mass-flow-runtime.png`,Buffer.from(image.data,'base64'));
  writeFileSync(`${out}/metrics.json`,JSON.stringify(state,null,2));
  const failed=results.filter(r=>!r.ok);console.log(`ACCEPTANCE_110D_FACTION_MASS passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await session.close();}
