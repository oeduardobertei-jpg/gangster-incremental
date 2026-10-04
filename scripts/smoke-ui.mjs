import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync } from 'node:fs';
const session = await openTestSession();
const { send, evaluate } = session;
try {
await sleep(900);
const clickText = text => evaluate(`(() => { const b=[...document.querySelectorAll('button')].find(x=>x.innerText.includes(${JSON.stringify(text)})); if(!b)return false;b.click();return true; })()`);
const clickTitle = text => evaluate(`(() => { const b=[...document.querySelectorAll('button')].find(x=>x.title?.includes(${JSON.stringify(text)})); if(!b)return false;b.click();return true; })()`);
const clickCardButton = (cardTitle, buttonText = 'Comprar') => evaluate(`(() => { const title=[...document.querySelectorAll('div')].find(x=>x.textContent?.trim()===${JSON.stringify(cardTitle)}); const card=title?.closest('.rounded-xl'); const b=card?[...card.querySelectorAll('button')].find(x=>x.innerText.includes(${JSON.stringify(buttonText)})):null; if(!b)return false;b.click();return true; })()`);
const getCardText = cardTitle => evaluate(`(() => { const title=[...document.querySelectorAll('div')].find(x=>x.textContent?.trim()===${JSON.stringify(cardTitle)}); return title?.closest('.rounded-xl')?.innerText || ''; })()`);
const closeModal = () => evaluate(`(() => { const m=document.querySelector('.fixed.inset-0'); const b=m?.querySelector('button'); if(!b)return false;b.click();return true; })()`);
const getSave = () => evaluate(`(() => { const raw=localStorage.getItem('factions_war_pt_br_save_v2'); return raw?JSON.parse(raw):null; })()`);
const results = [];
const record = (name, ok, detail='') => results.push([name, Boolean(ok), detail]);
const bodyText = await evaluate('document.body.innerText');
record('load', bodyText.includes('Guerra de Fac') && bodyText.includes('Convocar Soldado / Recruta'));
record('open settings baseline', await clickTitle('Salvamento'));
await sleep(80);
record('save baseline', await clickText('Salvar Agora'));
await sleep(80);
const before = await getSave();
record('modal pauses', before?.gameSpeed === 0, `speed=${before?.gameSpeed}`);
await closeModal(); await sleep(40);
record('recruit button', await clickText('Convocar Soldado / Recruta'));
await sleep(40);
record('open settings after recruit', await clickTitle('Salvamento'));
await sleep(80);
record('save after recruit', await clickText('Salvar Agora'));
await sleep(80);
let state = await getSave();
const spent = (before?.intel ?? 0) - (state?.intel ?? 0);
record('recruit costs about 10 intel', spent >= 8.0 && spent <= 10.2, `spent=${spent.toFixed(2)}`);
record('recruit materializes ally', state?.stats?.totalAlliesRecruited >= 1 && state?.battleSnapshot?.allies?.length >= 1,
  `stats=${state?.stats?.totalAlliesRecruited}, field=${state?.battleSnapshot?.allies?.length}`);
await closeModal(); await sleep(80);
record('pause hud', await clickTitle('Pausar Combate'));
await sleep(5200);
state = await getSave();
const paused = { intel: state.intel, recruited: state.stats.totalAlliesRecruited, allies: state.battleSnapshot.allies.length };
await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}))`);
await sleep(5200);
state = await getSave();
record('space blocked while paused', state.stats.totalAlliesRecruited === paused.recruited && state.battleSnapshot.allies.length === paused.allies);
record('economy frozen while paused', Math.abs(state.intel - paused.intel) < 0.05, `intel=${state.intel}`);
const pausedAllies = state.battleSnapshot.allies.length;
record('open gdd', await clickText('Documento GDD'));
await sleep(150);
record('gdd rendered', (await evaluate('document.body.innerText')).includes('GDD Oficial'));
record('return battle', await clickText('Disputa do Morro'));
await sleep(5200);
state = await getSave();
record('gdd preserves battle', state.battleSnapshot.allies.length === pausedAllies, `before=${pausedAllies}, after=${state.battleSnapshot.allies.length}`);
record('resume hud', await clickTitle('Pausar Combate'));
await sleep(120);
record('D1 upgrade preview visible', (await evaluate('document.body.innerText')).includes('Vida-base por recruta'));
record('open boca upgrades', await clickText('Bocas & Apoio'));
await sleep(100);
const bocaText = await evaluate('document.body.innerText');
record('D1 barricade cap visible', bocaText.includes('Barricadas de') && bocaText.includes('Nvl 0/20'));
const autoAmmoCardText = await getCardText('Recolhimento Rápido de Cápsulas');
record('D5 auto-ammo formula visible', autoAmmoCardText.includes('Caixas por ciclo') && autoAmmoCardText.includes('estimada') && autoAmmoCardText.includes('24,0/min'), autoAmmoCardText.replace(/\n/g, ' | '));
record('D5 auto-ammo cost rebalanced', autoAmmoCardText.includes('60'));
record('open territory map', await clickText('Beco dos Descal'));
await sleep(100);
const zoneText = await evaluate('document.body.innerText');
record('D2 multipliers visible', zoneText.includes('Vida: 4.5x') && zoneText.includes('Dano: 4.5x') && zoneText.includes('Grana/Suprimentos: 4.5x'));
await closeModal(); await sleep(80);
record('open sindicato', await clickText('Sindicato'));
await sleep(100);
let sindicatoText = await evaluate('document.body.innerText');
record('D4 run milestone visible', sindicatoText.includes('Marco da rodada') && sindicatoText.includes('/100'));
record('D4 level 1 is not purchasable', sindicatoText.includes('Nível 1: conquista da rodada'));

await evaluate(`(() => {
  const key='factions_war_pt_br_save_v2';
  const raw=localStorage.getItem(key); if(!raw) return false;
  const s=JSON.parse(raw);
  s.currentTerritoryId=1; s.territoryTakes=0; s.autoRecruitFallen=false; s.battleSnapshot=undefined;
  s.runRivalsNeutralized=100; s.runHighestTerritoryReached=1;
  s.stats={...s.stats, highestTerritoryReached:1, totalRivalsNeutralized:100};
  s.upgrades={...s.upgrades}; delete s.upgrades.sindicato_auto_recruit;
  localStorage.setItem(key, JSON.stringify(s)); location.reload(); return true;
})()`);
await sleep(1200);
const milestoneText = await evaluate('document.body.innerText');
record('D4 milestone grants auto recruit', milestoneText.includes('Auto-Convocar') && !milestoneText.includes('Auto-Convocação: 100/100'));
record('open sindicato after milestone', await clickText('Sindicato'));
await sleep(100);
sindicatoText = await evaluate('document.body.innerText');
record('D4 granted level shown', sindicatoText.includes('Nvl 1/10') && sindicatoText.includes('Intervalo de auto-convocação'));
record('D4 next levels use contacts', sindicatoText.includes('Custo:') && sindicatoText.includes('7'));

record('open intel upgrades', await clickText('Rádios & Intel'));
await sleep(100);
const intelText = await evaluate('document.body.innerText');
record('redundant tactical training removed', !intelText.includes('Treinamento Balístico') && intelText.includes('Central de Monitoramento'));

record('open hegemony', await clickText('Hegemonia'));
await sleep(100);
const hegemonyText = await evaluate('document.body.innerText');
record('hegemony exact effect rows visible', hegemonyText.includes('Bônus permanente de Grana') && hegemonyText.includes('Vida dos recrutas') && hegemonyText.includes('Regeneração de Inteligência'));
record('zero prestige disabled', await evaluate(`(() => { const b=[...document.querySelectorAll('button')].find(x=>x.innerText.includes('Proclamar Hegemonia')); return Boolean(b?.disabled); })()`));


await evaluate(`(() => {
  const key='factions_war_pt_br_save_v2';
  const raw=localStorage.getItem(key); if(!raw) return false;
  const s=JSON.parse(raw);
  s.currentTerritoryId=4; s.territoryTakes=77; s.runRivalsNeutralized=192; s.runHighestTerritoryReached=4;
  s.runRespectEarned=100; s.respect=100; s.autoRecruitFallen=true; s.battleSnapshot=undefined;
  s.upgrades={...s.upgrades, sindicato_auto_recruit:1};
  s.stats={...s.stats, highestTerritoryReached:6, totalRivalsNeutralized:999};
  localStorage.setItem(key, JSON.stringify(s)); location.reload(); return true;
})()`);
await sleep(1200);
record('prepared advanced run before prestige', (await evaluate('document.body.innerText')).includes('Auto-Convocar'));
record('open hegemony for reset test', await clickText('Hegemonia'));
await sleep(80);
record('perform hegemony reset', await clickText('Proclamar Hegemonia'));
await sleep(250);
const postPrestigeText = await evaluate('document.body.innerText');
record('hegemony resets auto recruit progress', postPrestigeText.includes('Auto-Convocação: 0/100'));
record('hegemony returns to territory 1', postPrestigeText.includes('Beco dos Descalços'));
record('open reset territory map', await clickText('Beco dos Descal'));
await sleep(100);
const resetZoneText = await evaluate('document.body.innerText');
record('hegemony relocks territory map', resetZoneText.includes('Conclua T1 · 20 neutralizações + domínio') && resetZoneText.includes('Em Disputa') && !(await evaluate(`(() => [...document.querySelectorAll('button')].some(b => b.innerText.includes('Invadir Ponto')))()`)));
await closeModal(); await sleep(80);

await evaluate(`(() => {
  const key='factions_war_pt_br_save_v2';
  const s=JSON.parse(localStorage.getItem(key));
  s.balanceRevision=1; s.ammo=100; s.cash=0; s.gameSpeed=1; s.autoCollectAmmo=true;
  s.currentTerritoryId=1; s.territoryTakes=0; s.runRivalsNeutralized=0; s.runHighestTerritoryReached=1;
  s.upgrades={boca_auto_ammo_scavenge:1}; s.talents={}; s.autoRecruitFallen=false;
  s.battleSnapshot={version:1,runId:s.runId,territoryId:1,faction:s.playerFaction,capturedAt:Date.now(),allies:[],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
  localStorage.setItem(key, JSON.stringify(s)); location.reload(); return true;
})()`);
await sleep(6500);
record('open settings after D5 production', await clickTitle('Salvamento'));
await sleep(80);
record('save D5 production state', await clickText('Salvar Agora'));
await sleep(80);
state = await getSave();
const d5AmmoGain = (state?.ammo ?? 100) - 100;
record('D5 level 1 produces ammo in batches of two', d5AmmoGain >= 2 && d5AmmoGain % 2 === 0, `gain=${d5AmmoGain}, ammo=${state?.ammo}`);
await closeModal(); await sleep(80);

await evaluate(`(() => {
  const key='factions_war_pt_br_save_v2';
  const s=JSON.parse(localStorage.getItem(key));
  s.balanceRevision=1; s.cash=1000; s.ammo=100; s.hegemonyEmblems=10; s.gameSpeed=0;
  s.currentTerritoryId=1; s.territoryTakes=0; s.runRivalsNeutralized=0; s.runHighestTerritoryReached=1;
  s.upgrades={}; s.talents={}; s.autoRecruitFallen=false; s.autoCollectAmmo=false;
  s.battleSnapshot={version:1,runId:s.runId,territoryId:1,faction:s.playerFaction,capturedAt:Date.now(),allies:[{id:'d6-smoke',type:'soldado_base',name:'Recruta',x:300,y:360,vx:0.6,vy:-1.2,hp:22,maxHp:55,speed:1.2,damage:14,attackRange:100,attackCooldown:0.85,attackTimer:0,targetId:null,color:'#ffffff',radius:12}],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
  localStorage.setItem(key, JSON.stringify(s)); location.reload(); return true;
})()`);
await sleep(1000);
record('D6 buy vest for live troop', await clickCardButton('Coletes Balísticos Nível III'));
await sleep(80);
record('D6 buy calibers for live troop', await clickCardButton('Munição Ponta Oca 7.62 & 9mm'));
await sleep(80);
record('D6 buy speed for live troop', await clickCardButton('Bonde das Motos (Batedores)'));
await sleep(120);
record('open settings for D6 snapshot', await clickTitle('Salvamento'));
await sleep(80);
record('save D6 upgraded troop', await clickText('Salvar Agora'));
await sleep(80);
state = await getSave();
let d6Ally = state?.battleSnapshot?.allies?.find(a => a.id === 'd6-smoke');
record('D6 live troop core stats update', Boolean(d6Ally) && Math.abs(d6Ally.maxHp-67)<0.001 && Math.abs(d6Ally.damage-16.8)<0.001 && Math.abs(d6Ally.speed-1.2)<0.001,
  d6Ally ? `hpMax=${d6Ally.maxHp}, dmg=${d6Ally.damage}, speed=${d6Ally.speed}` : 'ally missing');
record('D6 HP percentage preserved', Boolean(d6Ally) && Math.abs((d6Ally.hp/d6Ally.maxHp)-0.4)<0.0001,
  d6Ally ? `hp=${d6Ally.hp}/${d6Ally.maxHp}` : 'ally missing');
await closeModal(); await sleep(80);
record('open hegemony for D6 veteran', await clickText('Hegemonia'));
await sleep(80);
record('D6 buy veteran talent live', await clickCardButton('Tropa de Elite Veterana', 'Consolidar'));
await sleep(120);
record('open settings after veteran', await clickTitle('Salvamento'));
await sleep(80);
record('save veteran live update', await clickText('Salvar Agora'));
await sleep(80);
state = await getSave();
d6Ally = state?.battleSnapshot?.allies?.find(a => a.id === 'd6-smoke');
record('D6 veteran talent updates living troop', Boolean(d6Ally) && Math.abs(d6Ally.maxHp-83.75)<0.001 && Math.abs(d6Ally.damage-21)<0.001 && Math.abs((d6Ally.hp/d6Ally.maxHp)-0.4)<0.0001,
  d6Ally ? `hp=${d6Ally.hp}/${d6Ally.maxHp}, dmg=${d6Ally.damage}` : 'ally missing');
await closeModal();


// 0.4A camera/world smoke: anchor zoom, drag semantics, resize stability and HiDPI backing store.
await evaluate(`(() => {
  const key='factions_war_pt_br_save_v2';
  const s=JSON.parse(localStorage.getItem(key));
  s.gameSpeed=1; s.intel=100; s.maxIntel=100; s.cash=1000; s.ammo=100;
  s.currentTerritoryId=1; s.territoryTakes=0; s.runRivalsNeutralized=0; s.runHighestTerritoryReached=1;
  s.upgrades={}; s.talents={}; s.autoRecruitFallen=false; s.autoCollectAmmo=false;
  s.battleSnapshot={version:1,runId:s.runId,territoryId:1,faction:s.playerFaction,capturedAt:Date.now(),allies:[],rivals:[],fallen:[],bullets:[],obstacles:[],spawnElapsedMs:0,autoRecruitElapsedMs:0};
  localStorage.setItem(key, JSON.stringify(s)); location.reload(); return true;
})()`);
await sleep(1000);
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await sleep(300);
const canvasRect = await evaluate(`(() => { const c=document.querySelector('canvas'); const r=c.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,innerW:innerWidth,innerH:innerHeight}; })()`);
const visibleCanvasBottom = Math.min(canvasRect.y + canvasRect.height, canvasRect.innerH - 8);
const visibleCanvasHeight = Math.max(80, visibleCanvasBottom - canvasRect.y);
const anchorX = canvasRect.x + canvasRect.width * 0.42;
const anchorY = canvasRect.y + visibleCanvasHeight * 0.55;
const dispatchClick = async (x,y) => {
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
};
await dispatchClick(anchorX, anchorY); await sleep(30);
record('0.4A open settings after anchor recruit', await clickTitle('Salvamento'));
await sleep(50); await clickText('Salvar Agora'); await sleep(50);
let cameraState = await getSave();
const firstAnchorAlly = cameraState?.battleSnapshot?.allies?.at(-1);
await closeModal(); await sleep(60);
await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:anchorX,y:anchorY,deltaX:0,deltaY:-240});
await sleep(80);
await dispatchClick(anchorX, anchorY); await sleep(30);
record('0.4A open settings after cursor zoom recruit', await clickTitle('Salvamento'));
await sleep(50); await clickText('Salvar Agora'); await sleep(50);
cameraState = await getSave();
const secondAnchorAlly = cameraState?.battleSnapshot?.allies?.at(-1);
const anchorDrift = firstAnchorAlly && secondAnchorAlly ? Math.hypot(firstAnchorAlly.x-secondAnchorAlly.x, firstAnchorAlly.y-secondAnchorAlly.y) : 999;
record('0.4A/0.4.1 cursor zoom keeps organic recruit near the anchored world point', anchorDrift < 70, `drift=${anchorDrift.toFixed(2)}`);
await closeModal(); await sleep(60);
const beforeDragCount = cameraState?.battleSnapshot?.allies?.length ?? 0;
const dragX = canvasRect.x + canvasRect.width * 0.55;
const dragY = canvasRect.y + visibleCanvasHeight * 0.58;
await send('Input.dispatchMouseEvent',{type:'mousePressed',x:dragX,y:dragY,button:'left',clickCount:1});
await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:dragX+140,y:dragY+70,button:'left',buttons:1});
await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:dragX+140,y:dragY+70,button:'left',clickCount:1});
await sleep(60);
record('0.4A open settings after drag', await clickTitle('Salvamento'));
await sleep(50); await clickText('Salvar Agora'); await sleep(50);
cameraState = await getSave();
record('0.4A drag does not recruit accidentally', (cameraState?.battleSnapshot?.allies?.length ?? -1) === beforeDragCount,
  `before=${beforeDragCount}, after=${cameraState?.battleSnapshot?.allies?.length}`);
const beforeResizeAllies=(cameraState?.battleSnapshot?.allies||[]).map(a=>({id:a.id,x:a.x,y:a.y}));
await send('Emulation.setDeviceMetricsOverride',{width:1200,height:900,deviceScaleFactor:1.5,mobile:false});
await sleep(250);
const hidpi = await evaluate(`(() => { const c=document.querySelector('canvas'); const r=c.getBoundingClientRect(); return {ratio:c.width/r.width,dpr:window.devicePixelRatio,cssW:r.width,backingW:c.width}; })()`);
record('0.4A HiDPI backing store follows DPR', Math.abs(hidpi.ratio-Math.min(2,hidpi.dpr)) < 0.05 && hidpi.ratio > 1,
  `ratio=${hidpi.ratio.toFixed(2)}, dpr=${hidpi.dpr}, css=${hidpi.cssW.toFixed(0)}, backing=${hidpi.backingW}`);
await clickText('Salvar Agora'); await sleep(60);
cameraState = await getSave();
const afterResizeAllies=(cameraState?.battleSnapshot?.allies||[]).map(a=>({id:a.id,x:a.x,y:a.y}));
const resizeStable = beforeResizeAllies.length===afterResizeAllies.length && beforeResizeAllies.every((a,i)=>a.id===afterResizeAllies[i]?.id && Math.abs(a.x-afterResizeAllies[i].x)<0.001 && Math.abs(a.y-afterResizeAllies[i].y)<0.001);
record('0.4A resize does not move world entities while paused', resizeStable);
await send('Emulation.clearDeviceMetricsOverride');
await closeModal(); await sleep(80);

record('no browser runtime errors', session.errors.length === 0, JSON.stringify(session.errors));
writeFileSync('docs/acceptance-04g-smoke.json', JSON.stringify(results, null, 2));
for (const [name, ok, detail] of results) console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?` | ${detail}`:''}`);
const failures = results.filter(([,ok])=>!ok);
console.log(`SMOKE_SUMMARY passed=${results.length-failures.length} failed=${failures.length}`);

if (failures.length) process.exitCode=1;

} finally { await session.close(); }
