import { openTestSession, sleep } from './cdp-session.mjs';
import { writeFileSync } from 'node:fs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1536,height:864});
const samples=[];
const read=()=>s.evaluate(`(()=>({hud:document.querySelector('.battle-hud')?.innerText||'',resources:[...document.querySelectorAll('header, .resource-bar')].map(x=>x.innerText).join(' | '),perf:window.__GAME_PERF__||null,save:JSON.parse(localStorage.getItem('factions_war_pt_br_save_v2')||'null')}))()`);
try{
 await s.evaluate(`(async()=>{const {createDefaultState}=await import('/src/state/defaultGameState.ts');const g=createDefaultState();g.gameSpeed=5;g.soundMuted=true;localStorage.setItem('factions_war_pt_br_save_v2',JSON.stringify(g));location.reload();return true;})()`);
 await sleep(1800);
 const started=Date.now(); let nextSample=0;
 while(Date.now()-started<90000){
  await s.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Convocar Soldado'));if(b&&!b.disabled)b.click();const a=document.querySelector('button.battle-advance');if(a)a.click();return true})()`);
  if((Date.now()-started)%2500<350){
   await s.evaluate(`(()=>{const tabs=['Arsenal ($)','Bocas & Apoio','Rádios & Intel','Sindicato'];for(const name of tabs){const t=document.querySelector('#evolution-panel button[aria-label="'+name+'"]');t?.click();const buy=[...document.querySelectorAll('#evolution-panel button')].find(b=>b.textContent?.trim()==='Comprar'&&!b.disabled);buy?.click();}return true})()`);
  }
  if(Date.now()-started>=nextSample){samples.push({t:Math.round((Date.now()-started)/1000),...(await read())});nextSample+=5000;}
  const cur=await s.evaluate(`(()=>document.querySelector('.battle-hud')?.innerText||'')()`);
  if(/T2\b/.test(cur)){samples.push({t:Math.round((Date.now()-started)/1000),event:'reached-t2',...(await read())});break;}
  await sleep(300);
 }
 writeFileSync('docs/audit-1.0-natural-playtest.json',JSON.stringify({samples,errors:s.errors},null,2));
 console.log('NATURAL_PLAYTEST_DONE samples='+samples.length+' errors='+s.errors.length);
}finally{await s.close();}
