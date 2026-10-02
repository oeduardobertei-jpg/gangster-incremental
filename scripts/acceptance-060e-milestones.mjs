import { openTestSession, sleep } from './cdp-session.mjs';
const session=await openTestSession({url:'http://localhost:3000',width:1280,height:800});
const {evaluate}=session; const results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
try{
 const data=await evaluate(`(async()=>{const d=await import('/src/data/territoryCampaigns.ts');const c=await import('/src/rules/campaign.ts');return {counts:[1,2,3,4,5,6].map(id=>d.getTerritoryCampaignProfile(id).milestones.length),late:c.getPendingCampaignMilestones(d.getTerritoryCampaignProfile(6),.81,new Set()).map(x=>x.id)}})()`);
 check('six territories have authored milestones',data.counts.every(x=>x>0),JSON.stringify(data.counts));
 check('T6 has three escalation stages',data.counts[5]===3,JSON.stringify(data.counts));
 check('T6 .81 exposes all stages',data.late.length===3,JSON.stringify(data.late));
 await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=6;s.runHighestTerritoryReached=6;s.territoryTakes=49;s.gameSpeed=5;s.soundMuted=true;s.maxAllies=20;const a={id:'a',type:'soldado_base',name:'A',x:620,y:420,vx:0,vy:0,hp:9999,maxHp:9999,speed:0,damage:9999,attackRange:120,attackCooldown:.1,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:0};const r={id:'r',type:'soldado_pistola',name:'R',x:650,y:420,vx:0,vy:0,hp:1,maxHp:1,speed:0,damage:0,attackRange:0,attackCooldown:1,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:0};s.battleSnapshot={version:1,runId:s.runId,territoryId:6,faction:s.playerFaction,capturedAt:Date.now(),allies:[a],rivals:[r],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;})()`);
 await sleep(1800);const event=await evaluate('window.__CAMPAIGN_EVENT__');
 check('T6 milestone fires exactly on progress crossing',event?.id==='t6-reserva',JSON.stringify(event));
 check('T6 milestone spawns authored response',event?.spawned===2,JSON.stringify(event));
 check('no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
 const failed=results.filter(x=>!x.passed);console.log(`ACCEPTANCE_060E passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await session.close();}
