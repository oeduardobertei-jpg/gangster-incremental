import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';
const outDir = 'docs/screenshots/1.1f-hud';
mkdirSync(outDir, { recursive: true });

const prepare = async s => {
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.intel=73;g.cash=12540;g.ammo=87;g.respect=345;g.contacts=12;g.territoryTakes=13;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  await sleep(1800);
};

const inspect = s => s.evaluate(`(()=>{const r=s=>s?.getBoundingClientRect().toJSON();const cmd=document.querySelector('.hud-command-strip');const action=document.querySelector('.hud-action-strip');const canvas=document.querySelector('canvas');return {innerWidth,innerHeight,bodyScrollWidth:document.body.scrollWidth,docScrollWidth:document.documentElement.scrollWidth,command:r(cmd),action:r(action),canvas:r(canvas),operationText:document.querySelector('.hud-operation-card')?.textContent?.replace(/\\s+/g,' ').trim(),resourceText:cmd?.textContent?.replace(/\\s+/g,' ').trim(),recruitText:document.querySelector('.hud-recruit-command')?.textContent?.replace(/\\s+/g,' ').trim()}})()`);

const shot = async (s, name) => {
  const image = await s.send('Page.captureScreenshot', { format:'png', fromSurface:true });
  writeFileSync(`${outDir}/${name}.png`, Buffer.from(image.data,'base64'));
};

const desktop = await openTestSession({ url:baseUrl, width:1536, height:864 });
const mobile = await openTestSession({ url:baseUrl, width:390, height:844 });
try {
  await prepare(desktop); await prepare(mobile);
  const d = await inspect(desktop); const m = await inspect(mobile);
  await shot(desktop,'hud-desktop'); await shot(mobile,'hud-mobile');
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
    ['operation visible', /OPERAÇÃO ATIVA/.test(d.operationText || '')],
    ['core resources visible', ['INTEL','GRANA','MUNIÇÃO','RESPEITO','CONTATOS'].every(x => (d.resourceText || '').includes(x))],
    ['recruit command visible', /CONVOCAR REFORÇO/.test(d.recruitText || '')],
    ['faction not duplicated in resource strip', !(d.resourceText || '').includes('FACÇÃO')]
  ];
  checks.forEach(([name,ok])=>console.log(`${ok?'PASS':'FAIL'} | ${name}`));
  if (checks.some(([,ok])=>!ok)) throw new Error('1.1F HUD acceptance failed');
  if (desktop.errors.length || mobile.errors.length) throw new Error(`runtime errors: ${[...desktop.errors,...mobile.errors].join(' | ')}`);
  console.log(`HUD_11F ${checks.length}/${checks.length} PASS`);
} finally {
  await desktop.close(); await mobile.close();
}
