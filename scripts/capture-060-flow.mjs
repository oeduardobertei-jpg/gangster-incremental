import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const session=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const {evaluate,send}=session;
mkdirSync('docs/screenshots/0.6-hf1',{recursive:true});
const install=async territory=>evaluate(`(async()=>{
 const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();
 s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.gameSpeed=5;s.soundMuted=true;s.maxAllies=90;
 const allies=Array.from({length:${territory===5?40:34}},(_,i)=>({id:'v-a-'+i,type:i%8===0?'soldado_fuzil':'soldado_base',name:'Aliado',x:${territory===5?'105+(i%4)*12':'720+(i%6)*34'},y:70+(i%13)*43,vx:0,vy:0,hp:900,maxHp:900,speed:1.2,damage:.01,attackRange:180,attackCooldown:.8,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:i%3}));
 const rivals=Array.from({length:${territory===5?16:30}},(_,i)=>({id:'v-r-'+i,type:i%6===0?'atirador_fuzil':'soldado_pistola',name:'Rival',x:${territory===5?'760+(i%5)*60':'72+(i%4)*13'},y:70+(i%13)*43,vx:0,vy:0,hp:99999,maxHp:99999,speed:.9,damage:.01,attackRange:155,attackCooldown:1,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:i%3}));
 s.battleSnapshot={version:1,runId:s.runId,territoryId:${territory},faction:s.playerFaction,capturedAt:Date.now(),allies,rivals,fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;})()`);
try{
 for(const territory of [5,6]){
  await install(territory);await sleep(6200);
  const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
  writeFileSync(`docs/screenshots/0.6-hf1/T${territory}-flow.png`,Buffer.from(shot.data,'base64'));
  console.log('captured',territory,await evaluate('window.__GAME_PERF__'));
 }
}finally{await session.close();}
