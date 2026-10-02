import { openTestSession, sleep } from './cdp-session.mjs';

const session = await openTestSession({ url:'http://localhost:3000', width:1440, height:900 });
const { evaluate } = session;
const results=[];
const check=(name,ok,detail='')=>{
  results.push({name,passed:Boolean(ok),detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name} | ${detail}`);
};

try {
  const data=await evaluate(`(async()=>{
    const c=await import('/src/data/territoryCampaigns.ts');
    const r=await import('/src/rules/campaign.ts');
    const roles=await import('/src/rules/troopRoles.ts');
    const profiles=[1,2,3,4,5,6].map(id=>c.getTerritoryCampaignProfile(id));
    return {
      profiles,
      t4Batch:r.getReinforcementBatchSize(profiles[3].reinforcement,true,true,9),
      cappedBatch:r.getReinforcementBatchSize(profiles[3].reinforcement,true,true,1),
      scoutStrafe:roles.getAllyCombatRole('batedor_moto').strafeFactor,
      baseStrafe:roles.getAllyCombatRole('soldado_base').strafeFactor,
      rifleRetreat:roles.getAllyCombatRole('soldado_fuzil').retreatRangeFactor,
      managerAura:roles.getRivalSupportDamageMultiplier({type:'soldado_pistola',x:0,y:0},[{x:20,y:20}]),
      scoutManagerScore:roles.scoreRivalTargetForAlly('batedor_moto',{type:'gerente_boca'},10000),
      scoutPistolScore:roles.scoreRivalTargetForAlly('batedor_moto',{type:'soldado_pistola'},10000),
      t2Entries:[0,1,2,3,4].map(i=>r.selectExternalEntryIndex(profiles[1].reinforcement,3,i,.9)),
      t3Entries:[0,1,2,3].map(i=>r.selectExternalEntryIndex(profiles[2].reinforcement,3,i,.9)),
      t6Entries:[0,1,2,3].map(i=>r.selectExternalEntryIndex(profiles[5].reinforcement,3,i,.9)),
      t4EarlyHeavy:r.getDoctrineComposition(profiles[3].reinforcement,.1).find(x=>x.type==='blindado_choque')?.weight??0,
      t4LateHeavy:r.getDoctrineComposition(profiles[3].reinforcement,.9).find(x=>x.type==='blindado_choque')?.weight??0,
      t6LateBoss:r.getDoctrineComposition(profiles[5].reinforcement,.9).find(x=>x.type==='chefe_morro')?.weight??0
    };
  })()`);
  check('six campaign profiles exist',data.profiles.length===6,`profiles=${data.profiles.length}`);
  check('campaign objectives are distinct',new Set(data.profiles.map(p=>p.objectiveKind)).size===6,data.profiles.map(p=>p.objectiveKind).join(','));
  check('every district owns three external entries',data.profiles.every(p=>p.externalEntries.length===3));
  check('reinforcement doctrines differ by district',new Set(data.profiles.map(p=>p.reinforcement.name)).size===6,data.profiles.map(p=>p.reinforcement.name).join(' | '));
  check('fortified territory can answer in pairs',data.t4Batch===2,`batch=${data.t4Batch}`);
  check('reinforcement batches respect available slots',data.cappedBatch===1,`batch=${data.cappedBatch}`);
  check('motorcycle scout has stronger strafe role',data.scoutStrafe>data.baseStrafe,`${data.scoutStrafe} > ${data.baseStrafe}`);
  check('rifleman has defensive spacing role',data.rifleRetreat>0,`retreat=${data.rifleRetreat}`);
  check('manager support aura buffs nearby rival fire',Math.abs(data.managerAura-1.12)<1e-9,`mult=${data.managerAura}`);
  check('scouts prioritize enemy support',data.scoutManagerScore<data.scoutPistolScore,`${data.scoutManagerScore}<${data.scoutPistolScore}`);
  check('T2 doctrine alternates flanks before station entry',JSON.stringify(data.t2Entries)==='[0,1,0,1,2]',JSON.stringify(data.t2Entries));
  check('T3 doctrine cycles industrial service gates',JSON.stringify(data.t3Entries)==='[0,1,2,0]',JSON.stringify(data.t3Entries));
  check('T6 command doctrine emphasizes central axis',JSON.stringify(data.t6Entries)==='[2,0,2,1]',JSON.stringify(data.t6Entries));
  check('T4 siege escalates heavy presence late',data.t4LateHeavy>data.t4EarlyHeavy,`${data.t4EarlyHeavy}->${data.t4LateHeavy}`);
  check('T6 late command reserves can include boss units',data.t6LateBoss>=5,`bossWeight=${data.t6LateBoss}`);

  await evaluate(`(async()=>{
    const {createDefaultState}=await import('/src/state/defaultGameState.ts');
    const s=createDefaultState(); s.currentTerritoryId=3; s.runHighestTerritoryReached=3;
    s.gameSpeed=0; s.soundMuted=true; s.battleSnapshot=undefined;
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s)); location.reload(); return true;
  })()`);
  await sleep(900);
  const ui=await evaluate(`({intro:document.querySelector('[data-testid="campaign-operation"]')?.textContent??'',hud:document.querySelector('.battle-hud')?.innerText??''})`);
  check('T3 campaign operation is communicated',ui.intro.includes('Pátio de Aço'),ui.intro);
  check('HUD uses district objective language',ui.hud.includes('RUPTURA'),ui.hud.replace(/\n/g,' | '));
  await evaluate(`(async()=>{
    const {createDefaultState}=await import('/src/state/defaultGameState.ts');
    const s=createDefaultState(); s.currentTerritoryId=6; s.runHighestTerritoryReached=6;
    s.territoryTakes=999; s.gameSpeed=1; s.soundMuted=true;
    s.battleSnapshot={version:1,runId:s.runId,territoryId:6,faction:s.playerFaction,capturedAt:Date.now(),
      allies:[],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:99999,autoRecruitElapsedMs:0};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s)); location.reload(); return true;
  })()`);
  await sleep(1700);
  const spawn=await evaluate(`window.__LAST_RIVAL_SPAWN__??null`);
  check('T6 reinforcement comes from campaign perimeter',spawn?.source==='external'&&spawn?.dominated===true,JSON.stringify(spawn));
  check('T6 reinforcement reports command doctrine',spawn?.doctrine==='Reserva do comando',JSON.stringify(spawn));
  check('T6 reinforcement type belongs to doctrine',['soldado_pistola','atirador_fuzil','gerente_boca','blindado_choque','chefe_morro'].includes(spawn?.type),spawn?.type??'missing');

  await evaluate(`(async()=>{
    const {createDefaultState}=await import('/src/state/defaultGameState.ts');
    const s=createDefaultState(); s.currentTerritoryId=6; s.runHighestTerritoryReached=6;
    s.gameSpeed=1; s.soundMuted=true;
    const boss={id:'boss-test',type:'chefe_morro',name:'Chefe',x:640,y:220,vx:0,vy:0,hp:200,maxHp:580,speed:.85,damage:42,attackRange:140,attackCooldown:.9,attackTimer:0,targetId:null,state:'patrol',color:'#3b82f6',radius:18,factionTag:'PCC',variant:0};
    s.battleSnapshot={version:1,runId:s.runId,territoryId:6,faction:s.playerFaction,capturedAt:Date.now(),
      allies:[],rivals:[boss],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(s)); location.reload(); return true;
  })()`);
  await sleep(900);
  const bossCalls1=await evaluate(`window.__BOSS_COMMAND_CALLS__??0`);
  await sleep(900);
  const bossCalls2=await evaluate(`window.__BOSS_COMMAND_CALLS__??0`);
  check('critical boss calls reinforcements once',bossCalls1===1&&bossCalls2===1,`calls=${bossCalls1}->${bossCalls2}`);

  check('no browser runtime errors',session.errors.length===0,JSON.stringify(session.errors));
  const failed=results.filter(r=>!r.passed);
  console.log(`ACCEPTANCE_060_CAMPAIGN passed=${results.length-failed.length} failed=${failed.length}`);
  if(failed.length)process.exitCode=1;
} finally {
  await session.close();
}
