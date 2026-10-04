import { openTestSession, sleep } from './cdp-session.mjs';
import { installFixture } from './fixture-04g.mjs';
import { writeFileSync } from 'node:fs';
const session = await openTestSession(), { send, evaluate } = session, results=[];
const check=(name,ok,detail='')=>{results.push({name,passed:!!ok,detail});console.log((ok?'PASS':'FAIL')+' | '+name+' | '+detail)};
const key=async(code,key=code)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',code,key});await send('Input.dispatchKeyEvent',{type:'keyUp',code,key});await sleep(100)};
const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await sleep(100)};
const textClick=async text=>{await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes(${JSON.stringify(text)})).click()`);await sleep(100)};
const save=async()=>{
  await click('button[title="Configurações e Salvamento"]');await textClick('Salvar Agora');
  const state=await evaluate("JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2'))");
  await click('.fixed.inset-0 button');return state;
};
const shot=async name=>{const{data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync('docs/screenshots/04g-'+name+'.png',Buffer.from(data,'base64'))};
try{
  await installFixture(session,{allies:15,rivals:12,speed:0,loot:8});await sleep(1100);
  check('diagnostic hidden initially',await evaluate("!document.querySelector('[data-testid=performance-overlay]')"));
  await evaluate("window.acceptanceCanvas=document.querySelector('canvas');true");
  await key('F8');
  check('F8 opens diagnostic without replacing battlefield',await evaluate("!!document.querySelector('[data-testid=performance-overlay]')&&acceptanceCanvas===document.querySelector('canvas')"));
  check('diagnostic includes populated camera and counters',await evaluate("Number.isFinite(__GAME_PERF__.avgFrameMs)&&__GAME_PERF__.allies===15&&__GAME_PERF__.rivals===12&&__GAME_PERF__.viewport.width>0"));
  await shot('diagnostic');await key('F8');
  check('F8 closes diagnostic',await evaluate("!document.querySelector('[data-testid=performance-overlay]')"));
  await shot('normal-boss-loot');
  for(const [name,title,times] of [['distant','Diminuir Zoom',4],['near','Aumentar Zoom',9]]){
    for(let i=0;i<times;i++)await click('button[title^="'+title+'"]');
    await sleep(1100);await shot(name);
  }
  const beforeMap=await evaluate('({...__GAME_PERF__.camera})');
  const map=await evaluate("(()=>{const r=document.querySelector('canvas[aria-label]').getBoundingClientRect();return{x:r.x+r.width*.65,y:r.y+r.height*.5}})()");
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...map,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',...map,button:'left',clickCount:1});await sleep(1100);
  const afterMap=await evaluate('({...__GAME_PERF__.camera})');
  check('minimap recenters camera',Math.hypot(afterMap.centerX-beforeMap.centerX,afterMap.centerY-beforeMap.centerY)>5,JSON.stringify(afterMap));
  for(const [width,height] of [[1440,600],[1024,700],[390,740],[320,640]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(400);
    if(width<1024&&await evaluate("document.querySelector('[aria-controls=evolution-panel]').getAttribute('aria-expanded')==='true'"))await click('[aria-controls=evolution-panel]');
    const layout=await evaluate(`(()=>{
      const canvas=document.querySelector('canvas'),c=canvas.getBoundingClientRect(),p=canvas.parentElement.parentElement.getBoundingClientRect();
      const h=document.querySelector('.battle-hud').getBoundingClientRect(),z=document.querySelector('.battle-controls').getBoundingClientRect();
      const m=document.querySelector('canvas[aria-label]').getBoundingClientRect();
      return{fits:c.bottom<=p.bottom+1&&c.right<=p.right+1,overlap:h.left<z.right&&h.right>z.left&&h.top<z.bottom&&h.bottom>z.top,
        minimap:m.bottom<=p.bottom&&m.right<=p.right};
    })()`);
    check(width+'x'+height+' field, HUD and minimap fit',layout.fits&&!layout.overlap&&layout.minimap,JSON.stringify(layout));
    if(width===390||width===1440)await shot('layout-'+width+'x'+height);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await installFixture(session,{allies:1,rivals:0,speed:1});
  await evaluate("document.activeElement?.blur()");
  await key('Space',' ');
  let state=await save();
  check('Space on battlefield recruits exactly once',state.stats.totalAlliesRecruited===1);
  await evaluate("document.querySelector('button[aria-label=\"Bocas & Apoio\"]').focus()");
  await key('Space',' ');state=await save();
  check('Space on interface does not also recruit',state.stats.totalAlliesRecruited===1,'recruited='+state.stats.totalAlliesRecruited);
  await installFixture(session,{allies:0,rivals:0,speed:1,auto:true});await sleep(1800);state=await save();
  check('automatic recruitment actually creates troops',state.stats.totalAlliesRecruited>=1&&state.battleSnapshot.allies.length>=1);
  await installFixture(session,{allies:3,rivals:2,speed:0,loot:3});
  const original=await save();
  await click('button[title="Configurações e Salvamento"]');await textClick('Gerar Código');
  const exported=await evaluate("document.querySelector('textarea').value");
  const setCode=async value=>{await evaluate(`(()=>{const e=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);await sleep(100)};
  await setCode('invalid-save');await textClick('Importar e Carregar');
  check('invalid save is refused',await evaluate("document.body.innerText.includes('Código de save inválido')"));
  await setCode(exported);await textClick('Importar e Carregar');await textClick('Salvar Agora');
  let restored=await evaluate("JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2'))");
  const signature=s=>JSON.stringify({allies:s.battleSnapshot.allies.map(a=>[a.id,a.x,a.y,a.hp,a.maxHp]),rivals:s.battleSnapshot.rivals.map(r=>[r.id,r.x,r.y,r.hp]),loot:s.battleSnapshot.fallen.map(f=>f.id),cash:s.cash,ammo:s.ammo,intel:s.intel});
  check('export/import preserves current battle and resources',signature(original)===signature(restored));
  await send('Page.reload');await sleep(1400);restored=await save();
  check('reload preserves imported battle',signature(original)===signature(restored));
  await installFixture(session,{allies:3,rivals:2,speed:0,loot:3,takes:40});
  check('territory completion exposes advancement',await evaluate("!!document.querySelector('.battle-advance')"));
  await shot('objective-complete');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:740,deviceScaleFactor:1,mobile:false});await sleep(400);
  if(await evaluate("document.querySelector('[aria-controls=evolution-panel]').getAttribute('aria-expanded')==='true'"))await click('[aria-controls=evolution-panel]');
  const noOverlap=await evaluate("(()=>{const h=document.querySelector('.battle-hud').getBoundingClientRect(),c=document.querySelector('.battle-controls').getBoundingClientRect();return h.bottom<=c.top})()");
  check('completed objective does not cover camera on mobile',noOverlap);await shot('objective-complete-mobile');
  await click('.battle-advance');state=await save();
  check('advancement reaches territory 2',state.currentTerritoryId===2);
  check('no browser errors',session.errors.length===0,JSON.stringify(session.errors));
  writeFileSync('docs/acceptance-04g-functional.json',JSON.stringify(results,null,2));
  const failures=results.filter(r=>!r.passed);console.log('ACCEPTANCE_04G passed='+(results.length-failures.length)+' failed='+failures.length);
  if(failures.length)process.exitCode=1;
}finally{await session.close();}
