import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const outDir = 'docs/screenshots/1.1c-architecture-b';
mkdirSync(outDir, { recursive: true });

const s = await openTestSession({ url: baseUrl, width: 1536, height: 864 });
const shot = async name => {
  const image = await s.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  writeFileSync(`${outDir}/${name}.png`, Buffer.from(image.data, 'base64'));
};
const clickByTitle = title => s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.title===${JSON.stringify(title)});b?.click();return !!b})()`);

try {
  await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.currentTerritoryId=1;g.runHighestTerritoryReached=1;g.gameSpeed=0;g.soundMuted=true;g.battleSnapshot=undefined;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
  await sleep(2200);
  await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Foco');if(b)b.click();return !!b})()`);
  await sleep(500);
  await clickByTitle('Redefinir Zoom para 100%');
  await sleep(350);
  await shot('t1-architecture-b-focus-100');

  await clickByTitle('Centralizar em visão tática ampla');
  await sleep(450);
  await shot('t1-architecture-b-focus-wide');

  await clickByTitle('Redefinir Zoom para 100%');
  for (let i = 0; i < 5; i++) {
    await clickByTitle('Aumentar Zoom (ou role a roda do mouse para cima)');
    await sleep(80);
  }
  await sleep(350);
  await shot('t1-architecture-b-focus-close');

  const hud = await s.evaluate(`(()=>({battleHud:document.querySelector('.battle-hud')?.getBoundingClientRect().toJSON(),controls:document.querySelector('.battle-controls')?.getBoundingClientRect().toJSON(),canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON(),text:document.querySelector('.battle-hud')?.textContent?.replace(/\\s+/g,' ').trim()}))()`);
  writeFileSync(`${outDir}/t1-architecture-b-hud.json`, JSON.stringify(hud, null, 2));
  if (s.errors.length) throw new Error('Runtime errors: '+s.errors.join(' | '));
  console.log('1.1C T1 architecture B captured:', JSON.stringify(hud));
} finally {
  await s.close();
}