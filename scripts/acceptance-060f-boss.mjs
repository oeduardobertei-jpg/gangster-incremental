import { openTestSession, sleep } from './cdp-session.mjs';
const session=await openTestSession({url:'http://localhost:3000',width:1280,height:800});
const {evaluate}=session;const results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
try{
 const phases=await evaluate(`(async()=>{const r=await import('/src/rules/troopRoles.ts');return [1,.5,.2].map(x=>r.getBossPhaseProfile(x))})()`);
 check('boss has three readable phases',phases.map(x=>x.phase).join(',')==='1,2,3',JSON.stringify(phases));
 check('boss pressure increases damage',phases[2].damageMultiplier>phases[1].damageMultiplier&&phases[1].damageMultiplier>phases[0].damageMultiplier,JSON.stringify(phases));
 await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=6;s.runHighestTerritoryReached=6;s.gameSpeed=5;s.soundMuted=true;const boss={id:'boss',type:'chefe_morro',name:'Chefe',x:640,y:250,vx:0,vy:0,hp:140,maxHp:580,speed:0,damage:42,attackRange:140,attackCooldown:1,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:18,factionTag:'PCC',variant:0};s.battleSnapshot={version:1,runId:s.runId,territoryId:6,faction:s.playerFaction,capturedAt:Date.now(),allies:[],rivals:[boss],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;})()`);
 await sleep(1300);let calls=await evaluate('({command:window.__BOSS_COMMAND_CALLS__||0,last:window.__BOSS_LAST_STAND_CALLS__||0})');
 check('boss phase 3 calls command response once',calls.command===1,JSON.stringify(calls));
 check('boss phase 3 calls last stand once',calls.last===1,JSON.stringify(calls));
 await sleep(900);calls=await evaluate('({command:window.__BOSS_COMMAND_CALLS__||0,last:window.__BOSS_LAST_STAND_CALLS__||0})');
 check('boss responses do not repeat per frame',calls.command===1&&calls.last===1,JSON.stringify(calls));
 check('no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
 const failed=results.filter(x=>!x.passed);console.log(`ACCEPTANCE_060F passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await session.close();}
