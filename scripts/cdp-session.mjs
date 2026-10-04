// Each test owns a disposable Chrome context: no access to the player's save.
export async function openTestSession({ url = 'http://localhost:3000', width = 1440, height = 900, dpr = 1 } = {}) {
  const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237/json';
  const version = await (await fetch(endpoint.replace(/\/json$/, '/json/version'))).json();
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0, sessionId, contextId, targetId;
  const pending = new Map(), errors = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    const call = pending.get(message.id);
    if (!call) return;
    pending.delete(message.id); clearTimeout(call.timeout);
    message.error ? call.reject(new Error(message.error.message)) : call.resolve(message.result);
  };
  const command = (method, params = {}, session = sessionId, timeoutMs = 45000) => new Promise((resolve, reject) => {
    const id = ++seq;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, timeoutMs);
    pending.set(id, { resolve, reject, timeout });
    ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
  });
  const close = async () => {
    try {
      // Close the page first so Chrome does not spend tens of seconds draining a busy game context.
      if (targetId) await command('Target.closeTarget', { targetId }, null, 3000).catch(() => {});
      if (contextId) await command('Target.disposeBrowserContext', { browserContextId: contextId }, null, 3000).catch(() => {});
    } finally {
      for (const p of pending.values()) clearTimeout(p.timeout);
      pending.clear();
      ws.close();
    }
  };
  try {
    ({ browserContextId: contextId } = await command('Target.createBrowserContext', {}, null));
    ({ targetId } = await command('Target.createTarget', { url: 'about:blank', browserContextId: contextId }, null));
    ({ sessionId } = await command('Target.attachToTarget', { targetId, flatten: true }, null));
    const send = (method, params = {}) => command(method, params);
    const waitForGameRemount = async () => {
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
          const probe = await send('Runtime.evaluate', {
            expression: "document.readyState !== 'loading' && !!document.querySelector('canvas')",
            returnByValue: true,
            awaitPromise: true
          });
          if (probe.result?.value) return;
        } catch {}
      }
      throw new Error('Game did not remount after reload');
    };
    const evaluate = async expression => {
      const triggersReload = expression.includes('location.reload()');
      let result;
      try {
        result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      } catch (error) {
        const expectedReloadRace = triggersReload && /Inspected target navigated or closed|Execution context was destroyed|Cannot find context/i.test(error?.message || '');
        if (expectedReloadRace) {
          await waitForGameRemount();
          return undefined;
        }
        throw error;
      }
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      if (triggersReload) await waitForGameRemount();
      return result.result.value;
    };
    await send('Runtime.enable'); await send('Page.enable');
    // A newly created headless target is not guaranteed to be the foreground page.
    // Bringing it forward prevents Chrome from background-throttling requestAnimationFrame,
    // which otherwise produces false 15–20 FPS failures in performance acceptance tests.
    await send('Page.bringToFront');
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: false });
    await send('Page.navigate', { url });
    for (let i = 0; i < 60; i++) {
      if (await evaluate("!!document.querySelector('canvas')")) return { send, evaluate, close, errors };
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Game did not mount');
  } catch (error) { await close(); throw error; }
}
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
