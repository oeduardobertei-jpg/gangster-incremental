import type { TacticalBuilding } from './favelaRenderer';

type Args={
  ctx:CanvasRenderingContext2D;b:TacticalBuilding;roofY:number;facadeY:number;height:number;
  controlColor:string;renderZoom:number;contextual?:boolean;
};
const norm=(s='')=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rect=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,f:string,s?:string)=>{
  c.fillStyle=f;c.fillRect(x,y,w,h);if(s){c.strokeStyle=s;c.strokeRect(x,y,w,h);}
};
const line=(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1)=>{
  c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
};
const dish=(c:CanvasRenderingContext2D,x:number,y:number,flip=1)=>{
  c.strokeStyle='rgba(180,190,197,.62)';c.lineWidth=1.2;c.beginPath();c.arc(x,y,8,flip>0?Math.PI*.15:Math.PI*.85,flip>0?Math.PI*.88:Math.PI*1.85);c.stroke();
  line(c,x,y+2,x-flip*4,y+9,'rgba(130,142,151,.72)',1.4);line(c,x-flip*4,y+9,x-flip*4,y+13,'rgba(130,142,151,.55)',1.4);
};
const antenna=(c:CanvasRenderingContext2D,x:number,y:number,h=22)=>{
  line(c,x,y,x,y-h,'rgba(148,163,184,.58)',1.2);line(c,x-6,y-h+6,x+6,y-h+6,'rgba(148,163,184,.42)',1);
  line(c,x-4,y-h+11,x+4,y-h+11,'rgba(148,163,184,.34)',1);
};

const materialStory=(a:Args,hash:number)=>{
  const {ctx,b,facadeY,height,renderZoom}=a;
  // 0.9.5C: desgaste tem causa visual: base úmida, pintura perdida e reparos localizados.
  ctx.fillStyle='rgba(9,14,16,.16)';ctx.fillRect(b.x+2,facadeY+height-7,b.w-4,5);
  const patchX=b.x+5+(hash%Math.max(7,Math.floor(b.w*.38)));
  const patchW=Math.max(10,Math.min(24,b.w*.24));
  ctx.fillStyle=b.type==='brick'?'rgba(73,38,27,.32)':'rgba(128,91,60,.18)';
  ctx.beginPath();ctx.roundRect(Math.min(patchX,b.x+b.w-patchW-4),facadeY+6,patchW,Math.max(7,height*.28),2);ctx.fill();
  if(b.type!=='brick' && renderZoom>=.88){
    ctx.strokeStyle='rgba(111,58,38,.34)';ctx.lineWidth=.8;
    const px=Math.min(patchX,b.x+b.w-patchW-4);for(let y=facadeY+9;y<facadeY+height*.32;y+=5){line(ctx,px,y,px+patchW,y,'rgba(111,58,38,.30)',.8);}
  }
  if(renderZoom>=1.05){
    const dripX=b.x+b.w*(.25+((hash%37)/100));
    const g=ctx.createLinearGradient(dripX,facadeY+5,dripX,facadeY+height-4);
    g.addColorStop(0,'rgba(35,58,54,.03)');g.addColorStop(1,'rgba(23,43,39,.20)');
    ctx.fillStyle=g;ctx.fillRect(dripX,facadeY+5,3,Math.max(6,height-10));
  }
  if(b.type==='zinc'){
    for(const off of [b.w*.24,b.w*.71]){ctx.fillStyle='rgba(146,64,14,.18)';ctx.fillRect(b.x+off,facadeY+5,2,Math.max(5,height-9));}
  }
};

const roofscape=(a:Args,hash:number,n:string)=>{
  const {ctx,b,roofY,renderZoom,contextual}=a;
  // 0.9.5B: cada cobertura contribui para uma silhueta de bairro, sem transformar tudo em landmark.
  const variant=hash%5;
  if(variant===0||n.includes('mercado')||n.includes('barraquinha')) dish(ctx,b.x+b.w*.28,roofY+5,variant%2?1:-1);
  else if(variant===1||n.includes('laje')) antenna(ctx,b.x+b.w*.72,roofY+3,contextual?17:24);
  else if(variant===2){rect(ctx,b.x+b.w*.58,roofY+7,12,8,'#4d565b','#7c858b');line(ctx,b.x+b.w*.58,roofY+11,b.x+b.w*.58-6,roofY+11,'#58636c',1);}
  else if(variant===3 && renderZoom>=.90){
    const x=b.x+b.w*.24;rect(ctx,x,roofY+8,17,6,'#51585b','#7f878a');for(let i=0;i<3;i++)line(ctx,x+3+i*5,roofY+9,x+3+i*5,roofY+13,'rgba(203,213,225,.20)',.7);
  }
  if(!contextual && renderZoom>=1.15 && (n.includes('boca')||n.includes('esconderijo'))){
    line(ctx,b.x+b.w*.86,roofY+5,b.x+b.w*.86,roofY-26,'rgba(148,163,184,.64)',1.3);
    ctx.fillStyle=a.controlColor;ctx.globalAlpha=.55;ctx.fillRect(b.x+b.w*.86-2,roofY-28,4,4);ctx.globalAlpha=1;
  }
};

const highZoomLife=(a:Args,hash:number)=>{
  const {ctx,b,facadeY,height,renderZoom}=a;
  if(renderZoom<1.25) return; // 0.9.5J: microdetalhe só aparece quando há pixels para sustentá-lo.
  const cableX=b.x+(hash%2?b.w-7:7);
  line(ctx,cableX,facadeY+2,cableX,facadeY+height-4,'rgba(61,73,82,.68)',1.2);
  rect(ctx,cableX-4,facadeY+height*.48,8,7,'#c0c7cc','#4b5563');
  ctx.fillStyle='rgba(245,158,11,.62)';ctx.fillRect(cableX-1,facadeY+height*.48+2,2,2);
  if(renderZoom>=1.75){
    // Fechaduras, venezianas e pequenos remendos ficam reservados ao close-up.
    const sy=facadeY+8+(hash%5);line(ctx,b.x+b.w*.42,sy,b.x+b.w*.65,sy,'rgba(226,232,240,.16)',.8);
    line(ctx,b.x+b.w*.42,sy+4,b.x+b.w*.65,sy+4,'rgba(15,23,42,.32)',.8);
    ctx.fillStyle='rgba(208,184,145,.18)';ctx.fillRect(b.x+3+(hash%9),facadeY+4,7,2);
  }
};

const localControlMark=(a:Args,n:string)=>{
  const {ctx,b,facadeY,height,controlColor,contextual}=a;
  if(contextual) return;
  if(!(n.includes('boca')||n.includes('esconderijo')||n.includes('beco 01')||n.includes('laje do ponto'))) return;
  ctx.fillStyle=controlColor;ctx.globalAlpha=.44;
  ctx.fillRect(b.x+b.w*.12,facadeY+height-6,Math.max(12,b.w*.24),2);ctx.globalAlpha=1;
};

export function drawT1ArchitectureGold(args:Args){
  const {ctx,b}=args;const n=norm(b.label);const hash=[...b.id].reduce((s,c)=>s+c.charCodeAt(0),0);
  ctx.save();materialStory(args,hash);roofscape(args,hash,n);localControlMark(args,n);highZoomLife(args,hash);ctx.restore();
}
