import type { TacticalBuilding } from './favelaRenderer';

type Args={
  ctx:CanvasRenderingContext2D;
  b:TacticalBuilding;
  territoryId:number;
  roofY:number;
  facadeY:number;
  height:number;
  role:string;
  renderZoom:number;
  controlColor:string;
};

const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.strokeRect(x,y,w,h);}
};
const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const meter=(ctx:CanvasRenderingContext2D,x:number,y:number,accent:string)=>{
  rect(ctx,x,y,8,10,'#cbd5e1','#475569');rect(ctx,x+2,y+2,4,3,'#334155');
  rect(ctx,x+5,y+6,2,2,accent);
};
const finishT1=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,renderZoom,controlColor}=a;
  const n=norm(a.role);
  const hash=[...b.id].reduce((acc,c)=>acc+c.charCodeAt(0),0);
  const right=hash%2===0;
  const px=right?b.x+b.w-7:b.x+7;
  const facadeBottom=facadeY+height;

  // 1.1C: contextual architecture is authored by role. Everything stays inside the
  // existing physical footprint: no decorative solid-looking mass without collision.
  const washes=n.includes('oficina')?['rgba(52,67,70,.40)','rgba(99,69,45,.24)']:
    n.includes('mercadinho')?['rgba(128,76,48,.34)','rgba(36,106,111,.20)']:
    n.includes('puxadinho')?['rgba(70,76,76,.42)','rgba(128,87,52,.20)']:
    n.includes('varanda')?['rgba(115,89,67,.30)','rgba(52,103,85,.20)']:
    n.includes('sobrado')?['rgba(126,72,51,.30)','rgba(165,120,74,.16)']:
    ['rgba(121,77,55,.28)','rgba(61,102,91,.16)'];
  ctx.fillStyle=washes[hash%2];ctx.fillRect(b.x+3,facadeY+3,b.w-6,Math.max(8,height-8));

  // Foundation / service spine visually anchors every secondary building.
  rect(ctx,b.x+4,facadeBottom-5,b.w-8,3,'rgba(38,29,24,.48)');
  line(ctx,b.x+5,roofY+b.h-3,b.x+b.w-5,roofY+b.h-3,'rgba(226,232,240,.22)');
  line(ctx,px,facadeY+4,px,facadeBottom-4,'#5b6470',1.6);
  if(renderZoom>=.88) meter(ctx,right?px-11:px+3,facadeBottom-15,controlColor);

  if(n.includes('oficina')){
    // Roller shutter + tool-side service strip.
    const x=b.x+6,y=facadeY+5,w=b.w-12,h=Math.max(13,height-9);
    rect(ctx,x,y,w,h,'#273238','#606b70');
    for(let yy=y+4;yy<y+h-2;yy+=5) line(ctx,x+1,yy,x+w-1,yy,'rgba(203,213,225,.20)');
    rect(ctx,b.x+5,roofY+5,Math.max(19,b.w*.36),6,'#59636d','#8a949e');
    ctx.fillStyle='#f2a541';ctx.globalAlpha=.78;ctx.beginPath();ctx.arc(b.x+b.w-10,facadeY+5,2.8,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    if(renderZoom>=1.05){
      rect(ctx,b.x+8,facadeBottom-8,13,3,'#9b5d34');
      line(ctx,b.x+24,facadeBottom-6,b.x+33,facadeBottom-11,'rgba(25,30,31,.72)',2);
    }
  } else if(n.includes('puxadinho')){
    // Corrugated lean-to roof and improvised timber frame.
    ctx.beginPath();ctx.moveTo(b.x+1,roofY+8);ctx.lineTo(b.x+b.w*.55,roofY+1);ctx.lineTo(b.x+b.w-1,roofY+6);ctx.lineTo(b.x+b.w-1,roofY+12);ctx.lineTo(b.x+1,roofY+13);ctx.closePath();
    ctx.fillStyle='#586166';ctx.fill();ctx.strokeStyle='#8b9498';ctx.lineWidth=1;ctx.stroke();
    for(let xx=b.x+5;xx<b.x+b.w-3;xx+=8) line(ctx,xx,roofY+6,xx+2,roofY+12,'rgba(226,232,240,.19)');
    rect(ctx,b.x+7,facadeY+7,b.w-14,Math.max(11,height-10),'rgba(63,49,40,.62)');
    line(ctx,b.x+9,facadeY+7,b.x+9,facadeBottom-4,'rgba(147,111,76,.50)',2);
    line(ctx,b.x+b.w-9,facadeY+7,b.x+b.w-9,facadeBottom-4,'rgba(147,111,76,.50)',2);
  } else if(n.includes('mercadinho')){
    // Strong local-business read: striped awning, counter and small painted sign.
    const aw=b.w-10, ax=b.x+5, ay=facadeY+3, sw=aw/7;
    for(let i=0;i<7;i++) rect(ctx,ax+i*sw,ay,sw+0.5,8,i%2?'#e6d3ae':'#b85b3d');
    rect(ctx,b.x+7,facadeY+12,b.w-14,Math.max(8,height-17),'#29211d','#6b5142');
    rect(ctx,b.x+10,facadeBottom-8,b.w-20,4,'#7f5738');
    if(renderZoom>=.82){ctx.fillStyle='#f6e6c8';ctx.font='800 5px "Plus Jakarta Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('MERCADO',b.x+b.w/2,facadeY+16);}
  } else if(n.includes('geminada')){
    // Split fa?ade makes the row house read as two occupied homes rather than one box.
    const mid=b.x+b.w*.5;
    line(ctx,mid,facadeY+3,mid,facadeBottom-4,'rgba(42,35,30,.42)',1.2);
    for(const sx of [b.x+6,mid+3]){
      rect(ctx,sx,facadeBottom-14,8,11,'#302721','#80654f');
      rect(ctx,sx+12,facadeY+7,10,7,'#18303c','#7c8790');
    }
    rect(ctx,b.x+4,roofY+5,b.w-8,4,hash%2?'#8c6b50':'#6d7770');
  } else if(n.includes('varanda')){
    // Deep balcony/railing plus planter gives the fa?ade human scale.
    const vy=facadeY+7;
    rect(ctx,b.x+6,vy,b.w-12,4,'#655447');
    line(ctx,b.x+6,vy+5,b.x+b.w-6,vy+5,'#92999d',1.1);
    for(let xx=b.x+8;xx<b.x+b.w-7;xx+=9) line(ctx,xx,vy-1,xx,vy+5,'rgba(203,213,225,.38)',.8);
    rect(ctx,b.x+9,vy+6,Math.min(24,b.w*.38),4,'#715039');
    ctx.fillStyle='rgba(69,120,72,.72)';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(b.x+12+i*5,vy+5,2.3,0,Math.PI*2);ctx.fill();}
  } else if(n.includes('laje')||n.includes('sobrado')){
    // Upper-floor rhythm and stair landing distinguish multi-storey homes.
    line(ctx,b.x+7,roofY+7,b.x+b.w-7,roofY+7,'#9099a1',1.2);
    line(ctx,b.x+7,roofY+15,b.x+b.w-7,roofY+15,'#68727a',1);
    for(let xx=b.x+7;xx<=b.x+b.w-7;xx+=10) line(ctx,xx,roofY+7,xx,roofY+15,'rgba(203,213,225,.38)',.8);
    for(const wx of [b.x+9,b.x+b.w-21]) rect(ctx,wx,facadeY+7,10,7,'#1c3340','#7b8790');
    const sx=right?b.x+b.w-8:b.x+8;
    for(let i=0;i<4;i++){const ww=9+i*3;rect(ctx,right?sx-ww:sx,facadeBottom-5-i*4,ww,3,'#697178');}
    if(n.includes('laje')) rect(ctx,right?b.x+8:b.x+b.w-26,roofY+18,18,5,'#58636b','#88939b');
    if(n.includes('tijolo')){
      ctx.strokeStyle='rgba(67,36,27,.42)';ctx.lineWidth=.7;
      for(let yy=facadeY+5;yy<facadeBottom-5;yy+=6) line(ctx,b.x+3,yy,b.x+b.w-3,yy,'rgba(67,36,27,.42)',.7);
    }
  } else if(n.includes('esquina')){
    // Corner house gets a vertical painted return and a tiny awning.
    rect(ctx,right?b.x+b.w-12:b.x+4,facadeY+3,8,height-8,hash%2?'rgba(40,115,122,.32)':'rgba(186,97,55,.30)');
    const ax=right?b.x+5:b.x+b.w-30;
    rect(ctx,ax,facadeY+7,25,5,'#6f5039','#a77b53');
    rect(ctx,ax+5,facadeY+13,11,7,'#18303c','#78868f');
  } else {
    // Generic fallback still receives two unequal fa?ade bays and security bars.
    ctx.fillStyle=hash%3===0?'rgba(128,67,49,.22)':hash%3===1?'rgba(57,102,96,.20)':'rgba(158,124,70,.20)';
    ctx.fillRect(b.x+4,facadeY+4,b.w*.47,height-10);
    for(const wx of [b.x+9,b.x+b.w-22]){
      rect(ctx,wx,facadeY+8,11,7,'#1e3442','#77838d');
      for(let gx=wx+3;gx<wx+11;gx+=4) line(ctx,gx,facadeY+9,gx,facadeY+14,'rgba(226,232,240,.38)',.7);
    }
  }

  // Shared authored roof edge, utility drop and subtle occupation detail.
  if(b.w>=48) line(ctx,b.x+8,roofY+3,b.x+b.w-9,roofY+3,'rgba(107,114,128,.52)',1.1);
  if(renderZoom>=1.15 && hash%3===0){
    const wireY=roofY+2;
    line(ctx,b.x+b.w*.18,wireY,b.x+b.w*.72,wireY-3,'rgba(31,37,40,.46)',.8);
    ctx.fillStyle=hash%2?'rgba(51,132,151,.48)':'rgba(194,93,61,.44)';ctx.fillRect(b.x+b.w*.42,wireY-1,6,5);
  }
};
const finishT2=(a:Args)=>{const {ctx,b,roofY,facadeY,height,role,renderZoom}=a,n=norm(role);
  const hash=[...b.id].reduce((v,c)=>v+c.charCodeAt(0),0),right=hash%2===0,fb=facadeY+height;
  const wash=n.includes('box')?'rgba(137,82,50,.25)':n.includes('banca')?'rgba(58,111,104,.23)':n.includes('armazem')?'rgba(83,77,68,.30)':'rgba(111,84,60,.25)';
  ctx.fillStyle=wash;ctx.fillRect(b.x+3,facadeY+3,b.w-6,Math.max(8,height-8));rect(ctx,b.x+4,fb-5,b.w-8,3,'rgba(55,42,31,.48)');
  if(n.includes('box')){
    const aw=b.w-8,sw=aw/6;for(let i=0;i<6;i++)rect(ctx,b.x+4+i*sw,facadeY+4,sw+.5,7,i%2?'#e3cfaa':hash%2?'#b76242':'#c18b39');
    rect(ctx,b.x+7,fb-14,b.w-14,10,'#3c2b20','#78573c');rect(ctx,b.x+10,fb-9,b.w-20,4,'#805a38');
    if(hash%3===0){rect(ctx,right?b.x+b.w-27:b.x+7,roofY-8,20,11,'#725744','#a27a58');line(ctx,right?b.x+b.w-24:b.x+10,roofY-8,right?b.x+b.w-24:b.x+10,roofY-15,'#7f8586',1);}
  }else if(n.includes('banca')){
    ctx.beginPath();ctx.moveTo(b.x-3,roofY+8);ctx.lineTo(b.x+b.w*.5,roofY-5);ctx.lineTo(b.x+b.w+3,roofY+8);ctx.lineTo(b.x+b.w,roofY+13);ctx.lineTo(b.x,roofY+13);ctx.closePath();ctx.fillStyle=hash%2?'#4f7773':'#846779';ctx.fill();ctx.strokeStyle='#d0b66e';ctx.stroke();
    for(const x of [b.x+5,b.x+b.w-5])line(ctx,x,roofY+11,x,fb-3,'#725b43',1.8);rect(ctx,b.x+8,fb-12,b.w-16,8,'#4a3526','#795a3d');
    if(renderZoom>=.88){ctx.fillStyle='#ffd889';ctx.beginPath();ctx.arc(b.x+b.w*.5,facadeY+7,2,0,Math.PI*2);ctx.fill();}
  }else if(n.includes('armazem')){
    rect(ctx,b.x+5,facadeY+5,b.w-10,height-9,'#394149','#68737a');for(let y=facadeY+9;y<fb-5;y+=5)line(ctx,b.x+7,y,b.x+b.w-7,y,'rgba(203,213,225,.14)',.8);
    const ux=right?b.x+b.w-31:b.x+7;rect(ctx,ux,roofY-9,24,12,'#4b5255','#7f898b');rect(ctx,ux+5,roofY-6,14,4,'#283139');
    rect(ctx,b.x+8,fb-8,b.w*.32,4,'#8c633d');if(hash%3===1)line(ctx,b.x+b.w-9,roofY+3,b.x+b.w-9,roofY-17,'#80898e',1.5);
  }else{
    rect(ctx,b.x+6,facadeY+6,b.w-12,height-10,hash%2?'#584b3e':'#4b5050','#776c60');const sx=right?b.x+b.w-25:b.x+7;rect(ctx,sx,fb-17,18,13,'#242d32','#707a80');
    for(let y=fb-14;y<fb-6;y+=4)line(ctx,sx+2,y,sx+16,y,'rgba(203,213,225,.18)',.8);rect(ctx,right?b.x+7:b.x+b.w-25,roofY+5,18,5,'#66513c','#97734e');
    if(hash%3===0){line(ctx,b.x+6,roofY+2,b.x+b.w-7,roofY-3,'rgba(91,111,105,.55)',1.2);}
  }
  const px=right?b.x+b.w-7:b.x+7;line(ctx,px,facadeY+4,px,fb-4,'#766754',1.3);
  if(renderZoom>=1.05&&hash%2===0)meter(ctx,right?px-10:px+3,fb-15,'#d1a640');
};
const finishT3=(a:Args)=>{const {ctx,b,roofY,facadeY,height,renderZoom,role}=a,n=norm(role);
  const hash=[...b.id].reduce((acc,c)=>acc+c.charCodeAt(0),0),right=hash%2===0;
  rect(ctx,b.x+5,facadeY+height-5,b.w-10,3,'rgba(17,24,39,.54)');
  line(ctx,right?b.x+b.w-7:b.x+7,roofY+4,right?b.x+b.w-7:b.x+7,facadeY+height-4,'#64748b',2);
  if(n.includes('oficina')){
    rect(ctx,b.x+6,facadeY+6,b.w-12,Math.max(10,height-11),'#273139','#69757d');
    for(let yy=facadeY+10;yy<facadeY+height-5;yy+=5)line(ctx,b.x+7,yy,b.x+b.w-7,yy,'rgba(203,213,225,.16)',.8);
    rect(ctx,b.x+5,roofY+5,Math.max(20,b.w*.46),5,'#59636d','#8a949e');
  }else if(n.includes('serralheria')){
    rect(ctx,b.x+7,facadeY+6,b.w*.52,Math.max(10,height-11),'#30383e','#748087');
    for(let i=0;i<4;i++)line(ctx,b.x+b.w*.58+i*5,facadeY+height-4,b.x+b.w*.70+i*4,facadeY+8,'#9ca7ad',1.6);
    line(ctx,b.x+b.w-9,roofY+4,b.x+b.w-9,roofY-15,'#8d989e',2);
  }else if(n.includes('galpao')){
    rect(ctx,b.x+6,facadeY+7,b.w-12,Math.max(10,height-12),'#343e45','#6c7880');
    rect(ctx,b.x+8,roofY+5,b.w-16,4,'#647079','#9aa4aa');
    for(let x=b.x+10;x<b.x+b.w-9;x+=13)line(ctx,x,roofY+5,x,roofY-3,'rgba(203,213,225,.25)',1);
  }else if(n.includes('deposito')){
    rect(ctx,b.x+7,facadeY+6,b.w-14,Math.max(10,height-11),'#2a333a','#66727a');
    rect(ctx,right?b.x+5:b.x+b.w-22,facadeY+height-13,17,8,'#62503f','#9a7650');
    rect(ctx,b.x+7,roofY+6,Math.max(18,b.w*.38),5,'#414c54','#7c878e');
  }
  if(renderZoom>=.95) meter(ctx,right?b.x+b.w-18:b.x+9,facadeY+height-15,'#f97316');
};
const finishT4=(a:Args)=>{const {ctx,b,roofY,facadeY,height,renderZoom,controlColor}=a,n=norm(a.role);
  const hash=[...b.id].reduce((acc,c)=>acc+c.charCodeAt(0),0), right=hash%2===0;
  const washes=n.includes('beco')?'rgba(111,72,52,.28)':n.includes('boca')?'rgba(91,72,57,.28)':n.includes('laje')?'rgba(106,91,72,.27)':'rgba(113,77,57,.25)';
  ctx.fillStyle=washes;ctx.fillRect(b.x+3,facadeY+3,b.w-6,Math.max(8,height-8));
  rect(ctx,b.x+4,facadeY+height-5,b.w-8,3,'rgba(45,34,28,.48)');
  const px=right?b.x+b.w-7:b.x+7;line(ctx,px,roofY+7,px,facadeY+height-3,'#625a53',1.5);
  if(n.includes('beco')){
    // External stair/readable ascent for compact hillside houses.
    const sx=right?b.x+b.w-6:b.x+6;
    for(let i=0;i<5;i++){const ww=8+i*3;rect(ctx,right?sx-ww:sx,facadeY+height-4-i*4,ww,3,'#71665d');}
    rect(ctx,b.x+5,roofY+6,Math.max(20,b.w*.42),6,'#61574e','#8b8178');
  } else if(n.includes('boca')){
    // Small fortified frontage: canopy + barred service opening.
    rect(ctx,b.x+6,facadeY+6,b.w-12,6,'#655044','#947766');
    rect(ctx,b.x+9,facadeY+13,Math.max(15,b.w*.40),8,'#1d303a','#78858d');
    for(let xx=b.x+12;xx<b.x+9+Math.max(15,b.w*.40);xx+=5) line(ctx,xx,facadeY+14,xx,facadeY+20,'rgba(226,232,240,.32)',.7);
  } else if(n.includes('laje')){
    // Terrace/parapet rhythm makes these read as stronger concrete homes.
    line(ctx,b.x+5,roofY+5,b.x+b.w-5,roofY+5,'#8b8177',2);
    for(let xx=b.x+8;xx<b.x+b.w-7;xx+=12) line(ctx,xx,roofY+5,xx,roofY+14,'rgba(203,213,225,.30)',1);
    rect(ctx,right?b.x+7:b.x+b.w-25,roofY+16,18,5,'#5c5751','#817a73');
  } else {
    // Reduto: asymmetric balcony + exposed-brick wash.
    const bx=right?b.x+b.w*.43:b.x+5,bw=Math.max(22,b.w*.45),by=facadeY+6;
    rect(ctx,bx,by,bw,4,'#665347');line(ctx,bx,by+5,bx+bw,by+5,'#8c8f8e',1);
    for(let xx=bx+3;xx<bx+bw;xx+=8)line(ctx,xx,by-1,xx,by+5,'rgba(203,213,225,.28)',.7);
  }
  if(hash%3===0){
    ctx.fillStyle='#62584f';ctx.beginPath();ctx.moveTo(b.x+3,roofY+5);ctx.lineTo(b.x+b.w*.52,roofY-3);ctx.lineTo(b.x+b.w-3,roofY+4);ctx.lineTo(b.x+b.w-3,roofY+9);ctx.lineTo(b.x+3,roofY+10);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(199,185,169,.20)';ctx.stroke();
  }else if(hash%3===1&&b.w>=44){
    const aw=Math.max(19,b.w*.34);rect(ctx,right?b.x+b.w-aw-5:b.x+5,facadeY+8,aw,5,'#6e5544','#98745c');
  }
  if(renderZoom>=.95) meter(ctx,right?px-10:px+3,facadeY+height-15,controlColor);
  if(b.w>=46){for(let x=b.x+9;x<b.x+b.w-8;x+=13)line(ctx,x,roofY+1,x,roofY-8,'rgba(107,114,128,.55)',1);}
};
const finishT5=(a:Args)=>{const {ctx,b,roofY,facadeY,height,renderZoom,controlColor}=a,n=norm(a.role);
  const hash=[...b.id].reduce((acc,c)=>acc+c.charCodeAt(0),0),right=hash%2===0;
  rect(ctx,b.x+5,facadeY+height-6,b.w-10,3,'rgba(51,65,85,.22)');
  if(n.includes('casa costeira')){
    rect(ctx,b.x+6,facadeY+5,b.w-12,4,'#d9d3c9');
    rect(ctx,right?b.x+b.w-18:b.x+7,facadeY+11,11,7,'rgba(35,75,86,.72)','#cbd5e1');
    rect(ctx,right?b.x+7:b.x+b.w-22,roofY+14,15,5,'#315b46');
  }else if(n.includes('bloco residencial')){
    line(ctx,b.x+7,facadeY+5,b.x+b.w-7,facadeY+5,'rgba(226,232,240,.48)',1.2);
    for(let x=b.x+9;x<b.x+b.w-8;x+=13){rect(ctx,x,facadeY+11,6,7,'#244b57','#94a3b8');}
    rect(ctx,b.x+7,roofY+8,Math.max(18,b.w*.34),5,'#c9c5bc','#e2e8f0');
  }else if(n.includes('garagem')){
    rect(ctx,b.x+6,facadeY+height-17,b.w-12,11,'#27333d','#71808a');
    for(let x=b.x+10;x<b.x+b.w-9;x+=8) line(ctx,x,facadeY+height-16,x,facadeY+height-7,'rgba(203,213,225,.20)',.7);
    rect(ctx,right?b.x+7:b.x+b.w-20,roofY+8,13,6,'#59636b','#9aa4aa');
  }else if(n.includes('portaria de servico')){
    rect(ctx,b.x+5,facadeY+7,b.w-10,10,'#17202a','#64748b');
    rect(ctx,b.x+8,facadeY+10,b.w-16,4,'rgba(155,212,228,.40)');
    rect(ctx,b.x+5,facadeY+7,b.w-10,2,controlColor);
  }else{
    line(ctx,b.x+7,facadeY+5,b.x+b.w-7,facadeY+5,'rgba(226,232,240,.45)',1.2);
    if(b.w>=42){line(ctx,b.x+10,roofY+8,b.x+b.w-10,roofY+8,'rgba(226,232,240,.48)');for(let x=b.x+10;x<=b.x+b.w-10;x+=12)line(ctx,x,roofY+8,x,roofY+15,'rgba(203,213,225,.40)');}
  }
  if(renderZoom>=.95){rect(ctx,right?b.x+b.w-16:b.x+6,facadeY+height-17,10,6,'#334155','#cbd5e1');}
};
const finishT6=(a:Args)=>{const {ctx,b,roofY,facadeY,height,renderZoom,controlColor}=a,n=norm(a.role);
  const right=[...b.id].reduce((acc,c)=>acc+c.charCodeAt(0),0)%2===0;
  rect(ctx,b.x+5,facadeY+height-6,b.w-10,3,'rgba(15,23,42,.52)');
  if(n.includes('operacoes')){
    rect(ctx,b.x+6,facadeY+7,b.w-12,11,'#17232c','#657681');
    for(let x=b.x+10;x<b.x+b.w-10;x+=11)rect(ctx,x,facadeY+10,6,4,'rgba(96,165,250,.30)');
  }else if(n.includes('comunicacoes')){
    const mx=right?b.x+b.w-8:b.x+8;line(ctx,mx,roofY+6,mx,roofY-10,'#7c8992',1.5);
    rect(ctx,b.x+7,facadeY+8,b.w-14,9,'#17202a','#62717a');
    rect(ctx,mx-3,roofY-12,6,3,controlColor);
  }else if(n.includes('logistico')){
    rect(ctx,b.x+6,facadeY+height-17,b.w-12,11,'#30363b','#69737a');
    for(let x=b.x+10;x<b.x+b.w-8;x+=9)line(ctx,x,facadeY+height-16,x,facadeY+height-7,'rgba(203,213,225,.16)',.7);
  }else if(n.includes('guarda interna')){
    rect(ctx,b.x+7,facadeY+7,b.w-14,10,'#141b21','#5f6b73');
    rect(ctx,b.x+10,facadeY+10,b.w-20,4,'rgba(113,131,138,.55)');
    rect(ctx,b.x+7,facadeY+7,b.w-14,2,controlColor);
  }else{
    const trunkX=b.x+7;line(ctx,trunkX,roofY+6,trunkX,facadeY+height-5,'#58636c',2);
    rect(ctx,right?b.x+b.w-17:b.x+7,facadeY+7,10,10,'#171d22','#7a8286');
  }
  if(renderZoom>=.95){rect(ctx,b.x+10,roofY+7,12,5,'#202833','#64748b');ctx.fillStyle=controlColor;ctx.globalAlpha=.38;ctx.fillRect(b.x+12,roofY+9,5,2);ctx.globalAlpha=1;}
};

export function drawContextArchitectureFinish(args:Args){
  if(args.renderZoom<.72) return;
  args.ctx.save();
  if(args.territoryId===1) finishT1(args);
  else if(args.territoryId===2) finishT2(args);
  else if(args.territoryId===3) finishT3(args);
  else if(args.territoryId===4) finishT4(args);
  else if(args.territoryId===5) finishT5(args);
  else if(args.territoryId===6) finishT6(args);
  args.ctx.restore();
}
