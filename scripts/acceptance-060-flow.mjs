import { openTestSession, sleep } from './cdp-session.mjs';
const session=await openTestSession({url:'http://localhost:3000',width:1440,height:900});
const {evaluate}=session; const results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};

const install=async(territory,side,type)=>evaluate(`(async()=>{
  const {createDefaultState}=await import('/src/state/defaultGameState.ts');
  const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};
  s.gameSpeed=5;s.soundMuted=true;s.maxAllies=90;s.intel=999;s.maxIntel=999;
  const allies=Array.from({length:${territory===5?40:34}},(_,i)=>({id:'flow-a-'+i,type:i%8===0?'soldado_fuzil':'soldado_base',name:'Aliado',
    x:${territory===5?'105+(i%4)*12':'720+(i%6)*34'},y:70+(i%13)*43,vx:0,vy:0,hp:900,maxHp:900,speed:1.2,damage:.01,attackRange:180,
    attackCooldown:.8,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:i%3}));
  const rivals=Array.from({length:${territory===5?16:30}},(_,i)=>({id:'flow-r-'+i,type:i%6===0?'atirador_fuzil':'soldado_pistola',name:'Rival',
    x:${territory===5?'760+(i%5)*60':'72+(i%4)*13'},y:70+(i%13)*43,vx:0,vy:0,hp:99999,maxHp:99999,speed:.9,damage:.01,attackRange:155,
    attackCooldown:1,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:i%3}));
  s.battleSnapshot={version:1,runId:s.runId,territoryId:${territory},faction:s.playerFaction,capturedAt:Date.now(),allies,rivals,fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
  localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s));location.reload();return true;
})()`);
try{
  const unit=await evaluate(`(async()=>{const f=await import('/src/rules/crowdFlow.ts');const c=await import('/src/data/territoryCampaigns.ts');
    const t5=c.getCampaignExternalEntries(5,1280,720);const crowd=Array.from({length:9},(_,i)=>({id:'c'+i,x:t5[0].x+10,y:t5[0].y+i*3,hp:1,vx:0,vy:0}));
    const t6=c.getCampaignExternalEntries(6,1280,720);const crowd6=Array.from({length:10},(_,i)=>({id:'d'+i,x:t6[2].x+i*2,y:t6[2].y+5,hp:1,vx:0,vy:0}));
    return {t5:f.selectDecongestedExternalEntry(5,0,t5,crowd),t6:f.selectDecongestedExternalEntry(6,2,t6,crowd6)};})()`);
  check('T5 saturated flank reroutes spawn',unit.t5.redirected&&unit.t5.index!==0,JSON.stringify(unit.t5));
  check('T6 saturated command axis reroutes spawn',unit.t6.redirected&&unit.t6.index!==2,JSON.stringify(unit.t6));

  await install(5);await sleep(1600);const t5=[];for(let i=0;i<5;i++){await sleep(900);t5.push(await evaluate('window.__GAME_PERF__'));}
  const t5last=t5.at(-1),t5min=Math.min(...t5.map(x=>x?.fps??0));
  check('T5 clears west-edge pileup',(t5last?.leftEdgePopulation??99)<=14,`edge=${t5last?.leftEdgePopulation}; recoveries=${t5last?.edgeRecoveries}`);
  check('T5 flow remains physically clean',t5.every(x=>x?.solidWorldViolations===0),`violations=${Math.max(...t5.map(x=>x?.solidWorldViolations??99))}`);
  check('T5 flow remains performant',t5min>=30,`minFPS=${t5min.toFixed(1)}`);
  await install(6);await sleep(1600);const t6=[];for(let i=0;i<5;i++){await sleep(900);t6.push(await evaluate('window.__GAME_PERF__'));}
  const t6last=t6.at(-1),t6min=Math.min(...t6.map(x=>x?.fps??0));
  check('T6 clears west-perimeter pileup',(t6last?.leftEdgePopulation??99)<=15,`edge=${t6last?.leftEdgePopulation}; recoveries=${t6last?.edgeRecoveries}`);
  check('T6 flow remains physically clean',t6.every(x=>x?.solidWorldViolations===0),`violations=${Math.max(...t6.map(x=>x?.solidWorldViolations??99))}`);
  check('T6 flow remains performant',t6min>=30,`minFPS=${t6min.toFixed(1)}`);
  const hard=[...t5,...t6].reduce((n,x)=>n+(x?.hardUnstuckTriggers??0),0);
  check('hard unstuck stays rare',hard<=16,`hard=${hard}`);
  check('no runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(x=>!x.passed);console.log(`ACCEPTANCE_060_FLOW passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await session.close();}
