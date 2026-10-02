import { openTestSession, sleep } from './cdp-session.mjs';
const session=await openTestSession({url:'http://localhost:3000',width:1280,height:800});
const {evaluate}=session; const results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
try{
 const rewards=await evaluate(`(async()=>{const r=await import('/src/rules/rewards.ts');const d=await import('/src/data/gameData.ts');const t=d.TERRITORIES.find(x=>x.id===6);return ['soldado_pistola','atirador_fuzil','gerente_boca','blindado_choque','chefe_morro'].map(type=>({type,...r.getRivalEliminationReward(type,t,0)}))})()`);
 check('reward curve values priority targets',rewards[2].cash>rewards[1].cash&&rewards[3].cash>rewards[2].cash&&rewards[4].cash>rewards[3].cash,JSON.stringify(rewards));
 check('boss reward reflects final-threat value',rewards[4].ammo>rewards[3].ammo&&rewards[4].respect>rewards[2].respect&&rewards[4].contacts>rewards[2].contacts,JSON.stringify(rewards[4]));
 await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=6;s.runHighestTerritoryReached=6;s.territoryTakes=49;s.gameSpeed=5;s.soundMuted=true;const a={id:'a',type:'soldado_base',name:'A',x:620,y:420,vx:0,vy:0,hp:9999,maxHp:9999,speed:0,damage:9999,attackRange:120,attackCooldown:.1,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:0};const r={id:'r',type:'soldado_pistola',name:'R',x:650,y:420,vx:0,vy:0,hp:1,maxHp:1,speed:0,damage:0,attackRange:0,attackCooldown:1,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:0};s.battleSnapshot={version:1,runId:s.runId,territoryId:6,faction:s.playerFaction,capturedAt:Date.now(),allies:[a],rivals:[r],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;})()`);
 await sleep(5700);
 const saved=await evaluate(`(()=>{const s=JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2'));return {event:window.__CAMPAIGN_EVENT__,milestones:s?.battleSnapshot?.campaignMilestonesTriggered??[],snapshotTerritory:s?.battleSnapshot?.territoryId}})()`);
 check('campaign milestone persists in autosave',saved.milestones.includes('t6-reserva'),JSON.stringify(saved));
 check('snapshot remains on current territory',saved.snapshotTerritory===6,JSON.stringify(saved));
 check('no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
 const failed=results.filter(x=>!x.passed);console.log(`ACCEPTANCE_060GH passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await session.close();}
