import { openTestSession, sleep } from './cdp-session.mjs';
const baseUrl=process.env.BASE_URL || 'http://127.0.0.1:3000';
const session=await openTestSession({url:baseUrl,width:1440,height:900});
const {evaluate}=session;const results=[];
const check=(name,ok,detail='')=>{results.push({name,ok:!!ok,detail});console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`)};
const saveKey='factions_war_pt_br_save_v2';
try{
  for(let territory=1;territory<=6;territory++){
    await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.gameSpeed=0;s.soundMuted=true;s.battleSnapshot=undefined;localStorage.setItem('${saveKey}',JSON.stringify(s));location.reload();return true})()`);
    let cps=[];
    for(let tries=0;tries<20;tries++){await sleep(120);cps=await evaluate(`window.__DISTRICT_CONTROL_POINTS__??[]`);if(cps.length===6)break;}
    check(`T${territory} exposes six capture anchors`,cps.length===6,`anchors=${cps.length}`);
    for(let index=0;index<cps.length;index++){
      const target=cps[index];
      const serialized=JSON.stringify(cps);
      const anchor=JSON.stringify({x:target.x,y:target.y});
      const label=JSON.stringify(target.label);
      await evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const s=createDefaultState();s.currentTerritoryId=${territory};s.runHighestTerritoryReached=${territory};s.stats.highestTerritoryReached=${territory};s.territoryTakes=0;s.gameSpeed=5;s.soundMuted=true;const cps=${serialized}.map((p,i)=>({...p,progress:i===${index}?.20:1,status:i===${index}?'contested':'captured'}));const a0=${anchor};const ally={id:'anchor-ally',type:'soldado_base',name:'QA',x:a0.x,y:a0.y,vx:0,vy:0,hp:999,maxHp:999,speed:1.15,damage:.01,attackRange:110,attackCooldown:1,attackTimer:0,targetId:null,color:'#ef4444',radius:11,variant:0};const rival={id:'anchor-rival',type:'soldado_pistola',name:'QA Rival',x:a0.x<640?1180:100,y:a0.y<360?650:70,vx:0,vy:0,hp:999999,maxHp:999999,speed:0,damage:0,attackRange:0,attackCooldown:3,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:12,factionTag:'PCC',variant:0};s.battleSnapshot={version:1,runId:s.runId,territoryId:${territory},faction:s.playerFaction,capturedAt:Date.now(),allies:[ally],rivals:[rival],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,controlPoints:cps,operationPhase:'capture',finalResistanceSpawned:false,finalResistanceWave:0,campaignMilestonesTriggered:[]};localStorage.setItem('${saveKey}',JSON.stringify(s));location.reload();return true})()`);
      let current=null;
      for(let tries=0;tries<15;tries++){await sleep(100);current=await evaluate(`(window.__DISTRICT_CONTROL_POINTS__??[]).find(p=>p.label===${label})??null`);if(current&&(current.progress>.24||current.status==='captured'))break;}
      check(`T${territory} capture anchor ${index+1}/6 is occupiable`,Boolean(current)&&(current.progress>.24||current.status==='captured'),`${target.label}: ${current?.progress??'missing'} @ ${target.x.toFixed(1)},${target.y.toFixed(1)}`);
    }
  }
  check('all-anchor audit has no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.ok);console.log(`ACCEPTANCE_0915_ANCHORS passed=${results.length-failed.length} failed=${failed.length}`);if(failed.length)process.exitCode=1;
}finally{await session.close();}
