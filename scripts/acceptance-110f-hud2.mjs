import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';
const outDir = 'docs/screenshots/1.1f-hud';
mkdirSync(outDir, { recursive: true });

const prepare = async s => {
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.intel=73;g.cash=12540;g.ammo=87;g.respect=345;g.contacts=12;g.territoryTakes=13;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  await sleep(900);
};

const inspect = s => s.evaluate(`(()=>{const r=s=>s?.getBoundingClientRect().toJSON();const cmd=document.querySelector('.hud-command-strip');const action=document.querySelector('.hud-action-strip');const canvas=document.querySelector('canvas');return {innerWidth,innerHeight,bodyScrollWidth:document.body.scrollWidth,docScrollWidth:document.documentElement.scrollWidth,command:r(cmd),action:r(action),canvas:r(canvas),operationText:document.querySelector('.hud-operation-card')?.textContent?.replace(/\\s+/g,' ').trim(),resourceText:cmd?.textContent?.replace(/\\s+/g,' ').trim(),recruitText:document.querySelector('.hud-recruit-command')?.textContent?.replace(/\\s+/g,' ').trim()}})()`);

const waitForStableHud = async s => {
  await s.evaluate(`document.fonts?.ready ?? Promise.resolve()`);
  let previous=null, stable=0, latest=null;
  for(let attempt=0;attempt<40;attempt++){
    await sleep(120);
    latest=await inspect(s);
    const geometry=[latest.command?.height,latest.action?.height,latest.canvas?.height,latest.innerWidth,latest.innerHeight];
    const ready=geometry.every(v=>Number.isFinite(v)&&v>0);
    const same=ready&&previous&&geometry.every((v,i)=>Math.abs(v-previous[i])<0.25);
    stable=same?stable+1:0;
    previous=geometry;
    if(stable>=2)return latest;
  }
  return latest;
};

const shot = async (s, name) => {
  const image = await s.send('Page.captureScreenshot', { format:'png', fromSurface:true });
  writeFileSync(`${outDir}/${name}.png`, Buffer.from(image.data,'base64'));
};

const runViewport = async ({ width, height, shotName }) => {
  const session = await openTestSession({ url:baseUrl, width, height });
  try {
    await session.send('Page.bringToFront');
    await prepare(session);
    await session.send('Page.bringToFront');
    const metrics = await waitForStableHud(session);
    await shot(session, shotName);
    if (session.errors.length) throw new Error(`runtime errors in ${shotName}: ${session.errors.join(' | ')}`);
    return metrics;
  } finally {
    await session.close();
  }
};

const d = await runViewport({ width:1536, height:864, shotName:'hud-desktop' });
const m = await runViewport({ width:390, height:844, shotName:'hud-mobile' });
writeFileSync(`${outDir}/metrics.json`, JSON.stringify({desktop:d,mobile:m},null,2));

const checks = [
  ['desktop command strip <= 58px', d.command?.height <= 58],
  ['desktop action strip <= 64px', d.action?.height <= 64],
  ['desktop canvas >= 650px', d.canvas?.height >= 650],
  ['desktop no page horizontal overflow', d.docScrollWidth <= d.innerWidth + 1],
  ['mobile command strip <= 58px', m.command?.height <= 58],
  ['mobile action strip <= 64px', m.action?.height <= 64],
  ['mobile canvas >= 620px', m.canvas?.height >= 620],
  ['mobile no page horizontal overflow', m.docScrollWidth <= m.innerWidth + 1],
  ['operation visible', /OPERA\u00c7\u00c3O ATIVA/.test(d.operationText || '')],
  ['core resources visible', ['INTEL','GRANA','MUNI\u00c7\u00c3O','RESPEITO','CONTATOS'].every(x => (d.resourceText || '').includes(x))],
  ['recruit command visible', /CONVOCAR REFOR\u00c7O/.test(d.recruitText || '')],
  ['faction not duplicated in resource strip', !(d.resourceText || '').includes('FAC\u00c7\u00c3O')]
];
checks.forEach(([name,ok])=>console.log(`${ok?'PASS':'FAIL'} | ${name}`));
if (checks.some(([,ok])=>!ok)) throw new Error('1.1F HUD acceptance failed');
console.log(`HUD_11F ${checks.length}/${checks.length} PASS`);
