import { openTestSession, sleep } from './cdp-session.mjs';

const s = await openTestSession({ url: 'http://127.0.0.1:3000', width: 1440, height: 900 });
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};

try {
  await s.evaluate(`(async()=>{
    const {createDefaultState}=await import('/src/state/defaultGameState.ts');
    const {getTacticalBuildings}=await import('/src/components/canvas/favelaRenderer.ts');
    const {FACTION_CONFIGS}=await import('/src/data/gameData.ts');
    const {WORLD_WIDTH,WORLD_HEIGHT}=await import('/src/components/canvas/camera2D.ts');
    const g=createDefaultState();
    g.currentTerritoryId=6;
    g.runHighestTerritoryReached=6;
    g.stats.highestTerritoryReached=6;
    g.territoryTakes=200;
    g.runRivalsNeutralized=287;
    g.runRespectEarned=520;
    g.gameSpeed=2;
    g.soundMuted=true;
    const hubs=getTacticalBuildings(WORLD_WIDTH,WORLD_HEIGHT,FACTION_CONFIGS[g.playerFaction],6).filter(b=>b.isRivalHub);
    const cps=hubs.map(b=>({id:'cp_'+b.id,buildingId:b.id,label:b.label,x:b.doorX,y:b.doorY,progress:1,status:'captured'}));
    g.battleSnapshot={
      version:1,runId:g.runId,territoryId:6,faction:g.playerFaction,capturedAt:Date.now(),
      allies:[],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0,
      controlPoints:cps,operationPhase:'dominated',finalResistanceSpawned:true,finalResistanceWave:1,campaignMilestonesTriggered:[]
    };
    localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));
    location.reload();
    return true;
  })()`);

  await sleep(1400);
  const opened = await s.evaluate(`(()=>{
    const dialog=document.querySelector('[role="dialog"]');
    const text=dialog?.textContent||'';
    const buttons=[...document.querySelectorAll('button')];
    const pause=buttons.find(b=>b.textContent?.trim()==='⏸');
    return {
      dialog:!!dialog,
      text,
      continueButton:buttons.some(b=>b.textContent?.includes('Continuar no mapa')),
      hegemonyButton:buttons.some(b=>b.textContent?.includes('Preparar Hegemonia')),
      paused:pause?.className?.includes('bg-amber-600')||false
    };
  })()`);

  check('final T6 domination opens victory modal', opened.dialog && opened.text.includes('DOMÍNIO TOTAL'), opened.text.replace(/\s+/g,' ').slice(0,220));
  check('victory modal identifies completed campaign', opened.text.includes('Campanha concluída') && opened.text.includes('6/6'), opened.text.replace(/\s+/g,' ').slice(0,220));
  check('victory modal exposes freeplay continuation', opened.continueButton, String(opened.continueButton));
  check('victory modal bridges into Hegemony', opened.hegemonyButton, String(opened.hegemonyButton));
  check('victory modal pauses simulation', opened.paused, String(opened.paused));

  await s.send('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 1, mobile: false });
  await sleep(250);
  const compact = await s.evaluate(`(()=>{
    const dialog=document.querySelector('[role="dialog"]');
    const overlay=dialog?.parentElement;
    const rect=dialog?.getBoundingClientRect();
    const buttons=[...(dialog?.querySelectorAll('button')||[])].map(button=>{const r=button.getBoundingClientRect();return {text:button.textContent||'',left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
    return {
      viewport:{w:innerWidth,h:innerHeight},
      dialog:rect?{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height}:null,
      overlayOverflow:overlay?getComputedStyle(overlay).overflowY:'',
      pageOverflow:document.documentElement.scrollWidth-innerWidth,
      buttons
    };
  })()`);
  const compactHorizontal = compact.dialog && compact.dialog.left >= -1 && compact.dialog.right <= compact.viewport.w + 1 && compact.pageOverflow <= 1 && compact.buttons.every(button => button.left >= -1 && button.right <= compact.viewport.w + 1);
  const compactVertical = compact.dialog && (compact.dialog.height <= compact.viewport.h + 1 || ['auto','scroll'].includes(compact.overlayOverflow));
  check('victory modal fits 320px width', compactHorizontal, JSON.stringify(compact));
  check('victory modal remains vertically accessible at 320x568', compactVertical, JSON.stringify(compact));

  await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Continuar no mapa'));b?.click();return true})()`);
  await sleep(250);
  const continued = await s.evaluate(`(()=>{
    const dialog=document.querySelector('[role="dialog"]');
    const buttons=[...document.querySelectorAll('button')];
    const speed2=buttons.find(b=>b.textContent?.trim()==='2x');
    return {dialog:!!dialog,resumed:speed2?.className?.includes('bg-rose-600')||false};
  })()`);
  check('continue closes victory modal', !continued.dialog, JSON.stringify(continued));
  check('continue resumes previous game speed', continued.resumed, JSON.stringify(continued));
  check('no runtime errors', s.errors.length === 0, JSON.stringify(s.errors));

  const failed = results.filter(x => !x.ok);
  console.log(`ACCEPTANCE_0912 passed=${results.length - failed.length} failed=${failed.length}`);
  if (failed.length) process.exitCode = 1;
} finally {
  await s.close();
}
