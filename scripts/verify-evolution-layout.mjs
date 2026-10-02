import { writeFileSync } from 'node:fs';
const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237/json';
const version = await (await fetch(endpoint.replace(/\/json$/, '/json/version'))).json();
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let sequence = 0, activeSession, passed = 0, failed = 0;
const pending = new Map(), errors = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data), call = pending.get(message.id);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  if (!call) return;
  pending.delete(message.id);
  message.error ? call.reject(new Error(message.error.message)) : call.resolve(message.result);
};
const send = (method, params = {}, sessionId = activeSession) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
});
const ev = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const check = (name, ok, details = '') => {
  ok ? passed++ : failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${details}`);
};
const { browserContextId } = await send('Target.createBrowserContext', {}, null);
try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId }, null);
  ({ sessionId: activeSession } = await send('Target.attachToTarget', { targetId, flatten: true }, null));
  await send('Runtime.enable');
  await send('Page.enable');
  for (const width of [1440, 1024, 900, 700, 390, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'http://localhost:3000/?verifyEvolution=1' });
    for (let retry = 0; retry < 30 && !(await ev("!!document.getElementById('evolution-panel')")); retry++) await wait(100);
    await wait(350);
    await ev("document.querySelector('button[title=\"Pausar Combate\"]')?.click(); window.layoutCanvas = document.querySelector('canvas'); true;");
    const initial = await ev("({open:document.querySelector('[aria-controls=\"evolution-panel\"]').getAttribute('aria-expanded'),cw:layoutCanvas.getBoundingClientRect().width})");
    check(width + ': initial panel state', initial.open === (width >= 1024 ? 'true' : 'false'));
    if (initial.open !== 'true') await ev("document.querySelector('[aria-controls=\"evolution-panel\"]').click()");
    await wait(400);
    const metrics = await ev(`(() => {
      const panel = document.getElementById('evolution-panel'), nav = panel.querySelector('[aria-label="Categorias de evolução"]');
      const rect = nav.getBoundingClientRect(), buttons = [...nav.querySelectorAll('button')];
      return { overflow: nav.scrollWidth - nav.clientWidth, rows: new Set(buttons.map(b => Math.round(b.getBoundingClientRect().top))).size,
        visible: buttons.every(b => { const r = b.getBoundingClientRect(), s = b.querySelector('span'), t = s.getBoundingClientRect();
          return r.left >= rect.left - 1 && r.right <= rect.right + 1 && t.left >= r.left && t.right <= r.right &&
            b.contains(document.elementFromPoint(r.x + r.width/2, r.y + r.height/2)); }),
        cw: layoutCanvas.getBoundingClientRect().width, pw: panel.getBoundingClientRect().width };
    })()`);
    check(width + ': all five named categories visible without horizontal scrolling', metrics.overflow <= 1 && metrics.rows === 2 && metrics.visible, JSON.stringify(metrics));
    if (width < 1024) check(width + ': drawer does not shrink battlefield', Math.abs(metrics.cw - initial.cw) < 1);
    const categories = ['Arsenal ($)', 'Bocas & Apoio', 'Rádios & Intel', 'Sindicato', 'Hegemonia'];
    for (const name of categories) {
      await ev(`document.querySelector('#evolution-panel button[aria-label=${JSON.stringify(name)}]').click()`);
      await wait(40);
      check(width + ': category ' + name, await ev(`document.querySelector('#evolution-panel button[aria-label=${JSON.stringify(name)}]').getAttribute('aria-pressed') === 'true'`));
    }
    await ev("document.querySelector('#evolution-panel button[aria-label=\"Arsenal ($)\"]').click()");
    const shot = async name => {
      const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      writeFileSync('docs/screenshots/' + name + '.png', Buffer.from(data, 'base64'));
    };
    if (width === 1440 || width === 390) await shot('evolution-tabs-normal-' + width);
    const focusSelector = width < 1024 ? '#evolution-panel button[aria-label="Foco dos upgrades"]' : 'button[aria-label="Foco dos upgrades"]';
    await ev(`document.querySelector(${JSON.stringify(focusSelector)}).click()`); await wait(150);
    const focus = await ev(`(() => {
      const nav = document.querySelector('[aria-label="Categorias de evolução"]'), buttons = [...nav.querySelectorAll('button')];
      return { overflow:nav.scrollWidth-nav.clientWidth, rows:new Set(buttons.map(b => Math.round(b.getBoundingClientRect().top))).size,
        iconsOnly:buttons.every(b => b.querySelector('span.sr-only')), sameCanvas:layoutCanvas===document.querySelector('canvas'),
        selected:nav.querySelector('[aria-pressed="true"]')?.getAttribute('aria-label') };
    })()`);
    check(width + ': Focus retains selected category and battle with one icon row', focus.overflow <= 1 && focus.rows === 1 && focus.iconsOnly && focus.sameCanvas && focus.selected === 'Arsenal ($)', JSON.stringify(focus));
    if (width === 1440) await shot('evolution-tabs-focus-' + width);
    await ev(`document.querySelector(${JSON.stringify(focusSelector)}).click()`);
    await ev("document.querySelector('#evolution-panel button[aria-label=\"Sindicato\"]').focus()");
    await send('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
    await send('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
    await wait(400);
    const closed = await ev(`(() => {
      const panel=document.getElementById('evolution-panel'), toggle=document.querySelector('[aria-controls="evolution-panel"]');
      panel.querySelector('button').focus();
      return { inert:panel.inert, hidden:panel.getAttribute('aria-hidden'), focused:document.activeElement===toggle,
        open:toggle.getAttribute('aria-expanded'), cw:layoutCanvas.getBoundingClientRect().width, sameCanvas:layoutCanvas===document.querySelector('canvas') };
    })()`);
    check(width + ': Escape closes panel and hidden controls cannot take focus', closed.inert && closed.hidden==='true' && closed.focused && closed.open==='false' && closed.sameCanvas, JSON.stringify(closed));
    if(width>=1024) check(width + ': closing returns space to battle', closed.cw>metrics.cw+350);
    await ev("document.querySelector('[aria-controls=\"evolution-panel\"]').click()"); await wait(350);
    if(width<1024) {
      await ev("document.querySelector('#evolution-panel button[aria-label=\"Fechar painel de evolução\"]').click()"); await wait(350);
      check(width+': mobile close button works', await ev("document.getElementById('evolution-panel').inert"));
      await ev("document.querySelector('[aria-controls=\"evolution-panel\"]').click()"); await wait(350);
      await ev("[...document.querySelectorAll('button[aria-label=\"Fechar painel de evolução\"]')].find(b=>!b.closest('#evolution-panel')).click()"); await wait(350);
      check(width+': backdrop closes drawer', await ev("document.getElementById('evolution-panel').inert"));
    }
  }
  check('No browser runtime errors', errors.length === 0, JSON.stringify(errors));
  console.log(`EVOLUTION_LAYOUT_SUMMARY passed=${passed} failed=${failed}`);
} finally {
  await send('Target.disposeBrowserContext', { browserContextId }, null);
  ws.close();
}
process.exitCode = failed ? 1 : 0;
