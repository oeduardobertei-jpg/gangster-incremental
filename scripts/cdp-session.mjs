// Each test owns a disposable Chrome context: no access to the player's save.
export async function openTestSession({ url = 'http://localhost:3000', width = 1440, height = 900, dpr = 1 } = {}) {
  const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237/json';
  const version = await (await fetch(endpoint.replace(/\/json$/, '/json/version'))).json();
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0, sessionId, contextId;
  const pending = new Map(), errors = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    const call = pending.get(message.id);
    if (!call) return;
    pending.delete(message.id); clearTimeout(call.timeout);
    message.error ? call.reject(new Error(message.error.message)) : call.resolve(message.result);
  };
  const command = (method, params = {}, session = sessionId) => new Promise((resolve, reject) => {
    const id = ++seq;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 45000);
    pending.set(id, { resolve, reject, timeout });
    ws.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
  });
  const close = async () => {
    try { if (contextId) await command('Target.disposeBrowserContext', { browserContextId: contextId }, null); }
    finally { for (const p of pending.values()) clearTimeout(p.timeout); ws.close(); }
  };
  try {
    ({ browserContextId: contextId } = await command('Target.createBrowserContext', {}, null));
    const { targetId } = await command('Target.createTarget', { url: 'about:blank', browserContextId: contextId }, null);
    ({ sessionId } = await command('Target.attachToTarget', { targetId, flatten: true }, null));
    const send = (method, params = {}) => command(method, params);
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    };
    await send('Runtime.enable'); await send('Page.enable');
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
