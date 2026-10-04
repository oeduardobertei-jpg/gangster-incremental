import { openTestSession, sleep } from './cdp-session.mjs';
const s=await openTestSession({url:'http://127.0.0.1:3000',width:1440,height:900});
try{
  await sleep(900);
  const out=await s.evaluate(`(()=>{const t=document.body.innerText;const m=t.match(/Ã|Â|â€|ðŸ|�/);if(!m)return {match:null};const i=m.index??0;const around=t.slice(Math.max(0,i-40),i+80);return {match:m[0],index:i,around,codepoints:[...around].map(c=>c.codePointAt(0))};})()`);
  console.log(JSON.stringify(out,null,2));
}finally{await s.close();}
