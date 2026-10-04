export async function installFixture(session, options = {}) {
  const config = { allies: 15, rivals: 12, speed: 1, territory: 1, loot: 0, takes: 0, auto: false, ...options };
  await session.evaluate(`(async () => {
    const { createDefaultState } = await import('/src/state/defaultGameState.ts');
    const c = ${JSON.stringify(config)}, state = createDefaultState();
    state.gameSpeed = c.speed; state.soundMuted = true;
    state.currentTerritoryId = c.territory; state.runHighestTerritoryReached = c.territory;
    state.territoryTakes = c.takes; state.intel = 100; state.cash = 1000; state.ammo = 100;
    state.runRivalsNeutralized = c.auto ? 100 : 0;
    state.autoRecruitFallen = c.auto; state.autoCollectAmmo = false;
    state.upgrades = { armory_bulletproof_vest: 50, boca_fortified_bunkers: Math.max(0, (c.allies-15)/3),
      ...(c.auto ? { sindicato_auto_recruit: 10 } : {}) };
    state.talents = {};
    const allies = Array.from({length:c.allies}, (_,i) => ({
      id:'gate-a-'+i,type:i%12===0?'batedor_moto':i%5===0?'soldado_fuzil':'soldado_base',name:'Recruta',
      x:160+(i%15)*64,y:530-Math.floor(i/15)*23,vx:0,vy:-1,hp:655,maxHp:655,speed:1.2,damage:14,
      attackRange:230,attackCooldown:.65,attackTimer:(i%10)*.03,scavengeCooldown:0,targetId:null,
      color:'#ef4444',radius:11,variant:i%3
    }));
    const rivals = Array.from({length:c.rivals}, (_,i) => ({
      id:'gate-r-'+i,type:i===0?'chefe_morro':i%8===0?'blindado_choque':i%3===0?'atirador_fuzil':'soldado_pistola',
      name:i===0?'Chefe do Morro':'Rival',x:200+(i%8)*118,y:200+Math.floor(i/8)*45,vx:0,vy:.2,
      hp:100000,maxHp:100000,speed:.9,damage:.01,attackRange:220,attackCooldown:.6,
      attackTimer:(i%8)*.04,targetId:null,state:'patrol',color:'#3b82f6',radius:i===0?18:12,
      factionTag:'PCC',variant:i%3,patrolTargetX:640,patrolTargetY:360,patrolWaitTimer:0
    }));
    const fallen=Array.from({length:c.loot},(_,i)=>({id:'gate-loot-'+i,x:150+(i%12)*80,y:100+Math.floor(i/12)*32,
      type:'soldado_pistola',name:'Espólios',decayTime:600,maxDecayTime:600,harvested:false,bountyCash:10,bountyAmmo:2}));
    state.battleSnapshot={version:1,runId:state.runId,territoryId:c.territory,faction:state.playerFaction,
      capturedAt:Date.now(),allies,rivals,fallen,bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(state)); location.reload(); return true;
  })()`);
  await new Promise(resolve=>setTimeout(resolve,1200));
}
