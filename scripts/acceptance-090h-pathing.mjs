import { openTestSession, sleep } from './cdp-session.mjs';
const session=await openTestSession({url:'http://127.0.0.1:3001',width:1440,height:900});
const {evaluate}=session; const results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
const install=async(territory,allies,rivals)=>evaluate(`(async()=>{
 const {createDefaultState}=await import('/src/state/defaultGameState.ts'); const s=createDefaultState();
 s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.gameSpeed=5;s.soundMuted=true;s.maxAllies=50;
 s.battleSnapshot={version:1,runId:s.runId,territoryId:${territory},faction:s.playerFaction,capturedAt:Date.now(),allies:${JSON.stringify(allies)},rivals:${JSON.stringify(rivals)},fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
 localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;})()`);
const ally=(id,x,y,range=999,speed=0)=>({id,type:'soldado_base',name:'Aliado',x,y,vx:0,vy:0,hp:99999,maxHp:99999,speed,damage:0,attackRange:range,attackCooldown:.8,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:0});
const rival=(id,x,y,range=60,speed=.9,type='soldado_pistola')=>({id,type,name:'Rival',x,y,vx:0,vy:0,hp:99999,maxHp:99999,speed,damage:0,attackRange:range,attackCooldown:1,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:0});try{
 await install(5,[ally('a5',640,650)],[rival('r5',640,455)]); await sleep(4200);
 const t5=await evaluate('({perf:window.__GAME_PERF__,units:window.__GAME_UNITS__,text:document.body.innerText})');
 const r5=t5.units?.rivals?.[0];
 check('T5 rival crosses former invisible 70% line',(r5?.y??0)>505,`y=${r5?.y}; centroidY=${t5.perf?.rivalCentroidY}`);
 check('T5 remains physically clean',(t5.perf?.solidWorldViolations??99)===0,`violations=${t5.perf?.solidWorldViolations}`);
 check('UI has no visible mojibake',!/Ãƒ|Ã‚|Ã¢â‚¬|Ã°Å¸|ï¿½/.test(t5.text),t5.text.match(/Ãƒ|Ã‚|Ã¢â‚¬|Ã°Å¸|ï¿½/)?.[0]??'clean');

 const t6unit=await evaluate(`(async()=>{
  const path=await import('/src/rules/pathing.ts'); const col=await import('/src/rules/collision.ts');
  const mover={x:300,y:180,radius:11,speed:1.2};
  const wall={id:'t6-west',minX:416,minY:43,maxX:439,maxY:259,blocksMovement:true,blocksProjectiles:true,kind:'wall',material:'metal'};
  const routed=path.applyBlockedTargetDetour(mover,520,180,'target',.1,[wall],1280,720,17);
  const blocked=col.segmentWorldHit(300,180,520,180,2,[wall])!==null;
  return {routed,detourX:mover.detourX,detourY:mover.detourY,blocked};
 })()`);
 check('T6 blocked target creates portal detour',t6unit.routed.active&&t6unit.detourY>259,JSON.stringify(t6unit));
 check('T6 wall blocks direct firing line',t6unit.blocked===true,JSON.stringify(t6unit));
 check('no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
 const failed=results.filter(x=>!x.passed);console.log(`ACCEPTANCE_060_ORGANIC passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await session.close();}

