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
const finishT1=(a:Args)=>{const {ctx,b,roofY,facadeY,height,renderZoom,controlColor}=a;
  ctx.fillStyle='rgba(15,10,8,.22)';ctx.fillRect(b.x+5,facadeY+height-2,b.w-10,4);
  rect(ctx,b.x+4,facadeY+height-6,b.w-8,4,'rgba(38,29,24,.54)');
  line(ctx,b.x+4,facadeY+height-6,b.x+b.w-4,facadeY+height-6,'rgba(203,185,160,.22)',1);
  line(ctx,b.x+5,roofY+2,b.x+b.w-5,roofY+2,'rgba(226,232,240,.34)',1.2);
  line(ctx,b.x+6,roofY+6,b.x+b.w-6,roofY+6,'rgba(45,34,28,.52)',2);
  if(b.w>=46){rect(ctx,b.x+8,roofY+7,b.w-16,3,'rgba(35,31,29,.42)');}

  const right=[...b.id].reduce((sum,c)=>sum+c.charCodeAt(0),0)%2===0;
  const px=right?b.x+b.w-8:b.x+8;
  line(ctx,px,roofY+7,px,facadeY+height-5,'#5b6470',1.7);
  line(ctx,px+(right?-3:3),roofY+9,px+(right?-3:3),facadeY+height-10,'rgba(148,163,184,.28)',1);
  ctx.fillStyle='rgba(221,205,176,.11)';ctx.fillRect(b.x+b.w*.46,facadeY+5,b.w*.30,Math.max(7,height*.30));
  line(ctx,b.x+7,facadeY+Math.max(9,height*.34),b.x+b.w-7,facadeY+Math.max(9,height*.34),'rgba(39,31,27,.16)',1);

  if(renderZoom>=.95){
    meter(ctx,right?px-11:px+3,facadeY+height-16,controlColor);
    rect(ctx,right?b.x+7:b.x+b.w-18,roofY+10,11,6,'#454b50','#9aa3ab');
    for(let i=0;i<3;i++) line(ctx,(right?b.x+9:b.x+b.w-16)+i*3,roofY+12,(right?b.x+9:b.x+b.w-16)+i*3,roofY+15,'rgba(17,24,39,.72)',1);
    const bx=right?b.x+7:b.x+b.w-7;
    line(ctx,bx,facadeY+8,bx+(right?7:-7),facadeY+8,'rgba(148,163,184,.42)',1);
    line(ctx,bx+(right?7:-7),facadeY+8,bx+(right?7:-7),facadeY+13,'rgba(148,163,184,.42)',1);
  }
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
