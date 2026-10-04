import { openTestSession, sleep } from './cdp-session.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://localhost:3000',width:1536,height:900});
const {evaluate,send}=s; const out=[];
const check=(n,ok,d='')=>{out.push(ok);console.log(`${ok?'PASS':'FAIL'} | ${n} | ${d}`)};
mkdirSync('docs/screenshots/0.7-radio',{recursive:true});
try {
  const test=async(id,needle,credit,file)=>{
    await evaluate(`(()=>{const s=document.querySelector('select[aria-label="Escolher estação de rádio"]');s.value='${id}';s.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
    await sleep(500);
    const r=await evaluate(`(()=>{const t=document.querySelector('[role="tooltip"]');const p=t?.parentElement;const r=p?.getBoundingClientRect();return{text:p?.textContent||'',tooltip:t?.textContent||'',rect:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null}})()`);
    check(`${id} title`,r.text.includes(needle),r.text);
    check(`${id} credit`,r.tooltip.includes(credit),r.tooltip);
    if(r.rect){ await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.rect.x+20,y:r.rect.y+8}); await sleep(180); }
    const opacity=await evaluate(`(()=>{const t=document.querySelector('[role="tooltip"]');return t?getComputedStyle(t).opacity:'missing'})()`);
    check(`${id} tooltip visible`,Number(opacity)>.5,opacity);
    const shot=Buffer.from((await send('Page.captureScreenshot',{format:'png',fromSurface:true})).data,'base64');
    writeFileSync(`docs/screenshots/0.7-radio/${file}.png`,shot);
  };
  await test('central','Vida Loka Parte 1',"por Racionais MC's",'tooltip-gangsta');
  await test('concreto','Asfalto Molhado','por Rádio Concreto','tooltip-concreto');
  await test('baile','tudo que existe','por Epifania','tooltip-lofi');
  check('no runtime errors',s.errors.length===0,JSON.stringify(s.errors));
  const failed=out.filter(x=>!x).length;
  console.log(`ACCEPTANCE_070G passed=${out.length-failed} failed=${failed}`);
  if(failed) process.exitCode=1;
} finally { await s.close(); }
