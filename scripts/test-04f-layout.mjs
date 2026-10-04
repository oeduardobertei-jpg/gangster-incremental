import { openTestSession, sleep } from './cdp-session.mjs';

const s = await openTestSession({ url: 'http://127.0.0.1:3000/?test04f=desktop', width: 1440, height: 900 });
let passed = 0;
let failed = 0;
const check = (name, ok, extra = '') => {
  ok ? passed++ : failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${extra ? ' | ' + extra : ''}`);
};

const navigate = async (url, waitMs = 1100) => {
  await s.send('Page.navigate', { url });
  for (let i = 0; i < 50; i++) {
    if (await s.evaluate("!!document.querySelector('canvas')")) break;
    await sleep(100);
  }
  await sleep(waitMs);
};

try {
  await sleep(500);
  let info = await s.evaluate(`(()=>{const a=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Arsenal'));const p=a?.closest('.w-full.h-full')?.parentElement;const c=document.querySelector('canvas');return {pw:p?.getBoundingClientRect().width||0,cw:c?.getBoundingClientRect().width||0};})()`);
  check('desktop evolution panel opens at ~380px', info.pw > 360 && info.pw < 400, `panel=${info.pw}`);
  const openCanvas = info.cw;
  await s.evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.title?.includes('Recolher painel'))?.click();true`);
  await sleep(400);
  info = await s.evaluate(`(()=>{const a=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Arsenal'));const p=a?.closest('.w-full.h-full')?.parentElement;const c=document.querySelector('canvas');return {pw:p?.getBoundingClientRect().width||0,cw:c?.getBoundingClientRect().width||0};})()`);
  check('desktop collapse returns space to battlefield', info.pw < 8 && info.cw > openCanvas + 250, `panel=${info.pw}, canvas=${info.cw}`);
  await s.evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.title?.includes('Abrir painel'))?.click();true`);
  await sleep(350);
  await s.evaluate(`window.test04fCanvas=document.querySelector('canvas');document.querySelector('#evolution-panel button[aria-label="Foco dos upgrades"]')?.click();true`);
  await sleep(350);
  const focus = await s.evaluate(`(()=>{const labels=['Arsenal ($)','Bocas & Apoio','R\u00e1dios & Intel','Sindicato','Hegemonia'];const nav=document.querySelector('[aria-label="Categorias de evolu\u00e7\u00e3o"]');const buttons=labels.map(l=>document.querySelector('#evolution-panel button[aria-label="'+l+'"]'));const rows=nav?new Set([...nav.querySelectorAll('button')].map(b=>Math.round(b.getBoundingClientRect().top))).size:99;const selected=nav?.querySelector('[aria-pressed="true"]')?.getAttribute('aria-label');const visible=e=>!!e&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0;return {active:!!document.querySelector('#evolution-panel button[aria-label="Foco dos upgrades"][aria-pressed="true"]'),tabs:buttons.filter(Boolean).length,scroll:nav?nav.scrollWidth-nav.clientWidth:999,rows,iconsOnly:buttons.every(b=>!!b?.querySelector('span.sr-only')),selected,sameCanvas:window.test04fCanvas===document.querySelector('canvas'),command:visible(document.querySelector('.hud-command-strip')),operation:visible(document.querySelector('.hud-operation-card')),recruit:visible(document.querySelector('.hud-recruit-command'))};})()`);
  check('focus keeps compact evolution controls and core HUD available', focus.active && focus.tabs === 5 && focus.scroll <= 2 && focus.rows === 1 && focus.iconsOnly && focus.selected === 'Arsenal ($)' && focus.sameCanvas && focus.command && focus.operation && focus.recruit, JSON.stringify(focus));

  await s.send('Emulation.setDeviceMetricsOverride', { width: 900, height: 700, deviceScaleFactor: 1, mobile: false });
  await navigate('http://127.0.0.1:3000/?test04f=tablet');
  info = await s.evaluate(`(()=>{const a=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Arsenal'));const p=a?.closest('.w-full.h-full')?.parentElement;const c=document.querySelector('canvas');return {pw:p?.getBoundingClientRect().width||0,cw:c?.getBoundingClientRect().width||0,open:!!Array.from(document.querySelectorAll('button')).find(b=>b.title?.includes('Abrir painel'))};})()`);
  check('tablet starts with evolution drawer closed', info.open === true, JSON.stringify(info));
  const tabletCanvas = info.cw;
  await s.evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.title?.includes('Abrir painel'))?.click();true`);
  await sleep(350);
  info = await s.evaluate(`(()=>{const a=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Arsenal'));const p=a?.closest('.w-full.h-full')?.parentElement;const c=document.querySelector('canvas');const closeBtn=document.querySelector('#evolution-panel button[aria-label="Fechar painel de evolução"]');return {pw:p?.getBoundingClientRect().width||0,cw:c?.getBoundingClientRect().width||0,close:!!closeBtn};})()`);
  check('tablet drawer overlays without shrinking battlefield', info.pw > 340 && Math.abs(info.cw - tabletCanvas) < 25 && info.close, JSON.stringify(info));

  await s.send('Emulation.setDeviceMetricsOverride', { width: 700, height: 760, deviceScaleFactor: 1, mobile: false });
  await navigate('http://127.0.0.1:3000/?test04f=compact', 1000);
  const compact = await s.evaluate(`(()=>{const h=document.querySelector('header');return {height:h?.getBoundingClientRect().height||0,text:h?.innerText||''};})()`);
  check('compact header stays one row and uses short brand', compact.height <= 58 && compact.text.includes('GDF'), `height=${compact.height}`);
  check('no browser runtime errors', s.errors.length === 0, JSON.stringify(s.errors));

  console.log(`TEST_04F_SUMMARY passed=${passed} failed=${failed}`);
  if (failed) process.exitCode = 1;
} finally {
  await s.close();
}
