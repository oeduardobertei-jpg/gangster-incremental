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
  const {ctx,b,roofY,facadeY,height,renderZoom,controlColor}=a,n=norm(a.role);  const hash=[...b.id].reduce((acc,c)=>acc+c.charCodeAt(0),0), right=hash%2===0;
  const px=right?b.x+b.w-7:b.x+7;
  rect(ctx,b.x+4,facadeY+height-5,b.w-8,3,'rgba(38,29,24,.42)');
  line(ctx,b.x+5,roofY+b.h-3,b.x+b.w-5,roofY+b.h-3,'rgba(226,232,240,.20)');
  line(ctx,px,facadeY+4,px,facadeY+height-4,'#5b6470',1.6);
  if(renderZoom>=.92) meter(ctx,right?px-11:px+3,facadeY+height-15,controlColor);

  // 0.9.4 Architecture Pass: every context building gets a readable urban function.
  if(n.includes('oficina')){
    const x=b.x+7,y=facadeY+6,w=b.w-14,h=Math.max(12,height-8);
    rect(ctx,x,y,w,h,'#28323a','#59636d');
    for(let yy=y+4;yy<y+h;yy+=5) line(ctx,x+1,yy,x+w-1,yy,'rgba(203,213,225,.18)');
    ctx.fillStyle='#f4b44b';ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(b.x+b.w-10,facadeY+5,2.7,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    rect(ctx,b.x+4,roofY+6,b.w*.34,5,'#59636d','#8a949e');
  } else if(n.includes('puxadinho')){
    ctx.beginPath();ctx.moveTo(b.x-4,roofY+5);ctx.lineTo(b.x+b.w*.55,roofY-5);ctx.lineTo(b.x+b.w+5,roofY+3);ctx.lineTo(b.x+b.w+2,roofY+10);ctx.lineTo(b.x-3,roofY+11);ctx.closePath();
    ctx.fillStyle='#5d666b';ctx.fill();ctx.strokeStyle='#8e979c';ctx.stroke();
    for(let xx=b.x+4;xx<b.x+b.w;xx+=8) line(ctx,xx,roofY+4,xx+2,roofY+10,'rgba(226,232,240,.17)');
    rect(ctx,b.x+8,facadeY+7,b.w-16,height-9,'rgba(58,47,40,.55)');
  } else if(n.includes('mercadinho')){
    const aw=b.w-10, ax=b.x+5, ay=facadeY+3, sw=aw/6;
    for(let i=0;i<6;i++) rect(ctx,ax+i*sw,ay,sw,7,i%2?'#e7d8b5':'#b75b3d');
    rect(ctx,b.x+8,facadeY+12,b.w-16,8,'#2a211c','#6b5142');
    if(renderZoom>=.9){ctx.fillStyle='#f6e6c8';ctx.font='700 5px "Plus Jakarta Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('MERCADO',b.x+b.w/2,facadeY+16);}
  } else if(n.includes('laje')||n.includes('sobrado')){
    line(ctx,b.x+7,roofY+7,b.x+b.w-7,roofY+7,'#8d969f',1.2);
    line(ctx,b.x+7,roofY+15,b.x+b.w-7,roofY+15,'#68727a',1);    for(let xx=b.x+7;xx<=b.x+b.w-7;xx+=10) line(ctx,xx,roofY+7,xx,roofY+15,'rgba(203,213,225,.36)',.8);
    const sx=right?b.x+b.w-8:b.x+8;
    for(let i=0;i<4;i++){const ww=9+i*3;rect(ctx,right?sx-ww:sx,facadeY+height-5-i*4,ww,3,'#697178');}
    if(n.includes('laje')) rect(ctx,right?b.x+8:b.x+b.w-26,roofY+18,18,5,'#58636b','#88939b');
  } else if(n.includes('varanda')){
    rect(ctx,b.x+7,facadeY+6,b.w-14,4,'#5e5044');
    line(ctx,b.x+7,facadeY+10,b.x+b.w-7,facadeY+10,'#8c9499',1);
    for(let xx=b.x+8;xx<b.x+b.w-7;xx+=10) line(ctx,xx,facadeY+4,xx,facadeY+10,'rgba(203,213,225,.32)',.8);
  } else {
    ctx.fillStyle=hash%3===0?'rgba(128,67,49,.20)':hash%3===1?'rgba(57,102,96,.18)':'rgba(158,124,70,.18)';
    ctx.fillRect(b.x+4,facadeY+4,b.w*.47,height-10);
    for(const wx of [b.x+10,b.x+b.w-22]){
      rect(ctx,wx,facadeY+8,11,7,'#1e3442','#77838d');
      for(let gx=wx+3;gx<wx+11;gx+=4) line(ctx,gx,facadeY+9,gx,facadeY+14,'rgba(226,232,240,.35)',.7);
    }
  }
  if(b.w>=48) line(ctx,b.x+8,roofY+3,b.x+b.w-9,roofY+3,'rgba(107,114,128,.48)',1.1);
};
const finishT2=(a:Args)=>{const {ctx,b,roofY,facadeY,height,role,renderZoom}=a,n=norm(role);
  const pole='#7b6042';line(ctx,b.x+5,roofY+3,b.x+5,facadeY+height,pole,1.5);line(ctx,b.x+b.w-5,roofY+3,b.x+b.w-5,facadeY+height,pole,1.5);
  rect(ctx,b.x+4,facadeY+height-5,b.w-8,3,'rgba(63,45,30,.42)');
  if(n.includes('box')||n.includes('banca')){rect(ctx,b.x+7,facadeY+height-15,b.w-14,5,'#76502f');
    if(renderZoom>=.95){line(ctx,b.x+b.w*.5,roofY-2,b.x+b.w*.5,facadeY+5,'#6b7280');ctx.fillStyle='#f5d77f';ctx.beginPath();ctx.arc(b.x+b.w*.5,facadeY+6,2,0,Math.PI*2);ctx.fill();}}
  else{rect(ctx,b.x+b.w-14,facadeY+7,7,9,'#334155','#94a3b8');}
};
const finishT3=(a:Args)=>{const {ctx,b,roofY,facadeY,height,renderZoom}=a;
  rect(ctx,b.x+5,facadeY+height-5,b.w-10,3,'rgba(17,24,39,.54)');
  line(ctx,b.x+b.w-7,roofY+4,b.x+b.w-7,facadeY+height-4,'#64748b',2);
  rect(ctx,b.x+b.w-16,facadeY+7,8,9,'#252d35','#94a3b8');
  if(renderZoom>=.95){for(let y=facadeY+9;y<facadeY+15;y+=3)line(ctx,b.x+b.w-14,y,b.x+b.w-10,y,'#111827');
    rect(ctx,b.x+7,roofY+6,10,5,'#59636d','#94a3b8');line(ctx,b.x+12,roofY+6,b.x+12,roofY-7,'#8b949d',1.4);}
};
const finishT4=(a:Args)=>{const {ctx,b,roofY,facadeY,height,renderZoom,controlColor}=a;
  rect(ctx,b.x+4,facadeY+height-5,b.w-8,3,'rgba(45,34,28,.48)');
  ctx.fillStyle='rgba(154,126,99,.13)';ctx.fillRect(b.x+6,facadeY+5,b.w*.32,Math.max(6,height*.30));
  const right=[...b.id].reduce((a,c)=>a+c.charCodeAt(0),0)%2===0;const px=right?b.x+b.w-7:b.x+7;line(ctx,px,roofY+7,px,facadeY+height-3,'#625a53',1.5);
  if(renderZoom>=.95) meter(ctx,right?px-10:px+3,facadeY+height-15,controlColor);
  if(b.w>=46){for(let x=b.x+9;x<b.x+b.w-8;x+=13)line(ctx,x,roofY+1,x,roofY-8,'rgba(107,114,128,.70)',1);}
};
const finishT5=(a:Args)=>{const {ctx,b,roofY,facadeY,height,renderZoom}=a;
  rect(ctx,b.x+5,facadeY+height-6,b.w-10,3,'rgba(51,65,85,.22)');
  line(ctx,b.x+7,facadeY+5,b.x+b.w-7,facadeY+5,'rgba(226,232,240,.45)',1.2);
  if(b.w>=42){line(ctx,b.x+10,roofY+8,b.x+b.w-10,roofY+8,'rgba(226,232,240,.48)');for(let x=b.x+10;x<=b.x+b.w-10;x+=12)line(ctx,x,roofY+8,x,roofY+15,'rgba(203,213,225,.40)');}
  if(renderZoom>=.95){const right=[...b.id].reduce((a,c)=>a+c.charCodeAt(0),0)%2===0;rect(ctx,right?b.x+b.w-16:b.x+6,facadeY+height-17,10,6,'#334155','#cbd5e1');rect(ctx,right?b.x+6:b.x+b.w-20,facadeY+height-10,14,4,'#315b46');}
};
const finishT6=(a:Args)=>{const {ctx,b,roofY,facadeY,height,renderZoom,controlColor}=a;
  rect(ctx,b.x+5,facadeY+height-6,b.w-10,3,'rgba(15,23,42,.52)');
  const trunkX=b.x+7;line(ctx,trunkX,roofY+6,trunkX,facadeY+height-5,'#58636c',2);
  const right=[...b.id].reduce((a,c)=>a+c.charCodeAt(0),0)%2===0;rect(ctx,right?b.x+b.w-17:b.x+7,facadeY+7,10,10,'#171d22','#7a8286');
  if(renderZoom>=.95){for(let y=facadeY+9;y<facadeY+15;y+=3)line(ctx,b.x+b.w-15,y,b.x+b.w-9,y,'#64748b');
    rect(ctx,b.x+10,roofY+7,12,5,'#202833','#64748b');ctx.fillStyle=controlColor;ctx.globalAlpha=.42;ctx.fillRect(b.x+12,roofY+9,5,2);ctx.globalAlpha=1;}
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
