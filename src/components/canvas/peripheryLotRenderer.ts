import { WORLD_LIGHTING, WORLD_MATERIALS } from '../../data/visualTokens';

type MaterialId='brick'|'plaster'|'zinc'|'concrete';
type RoofId='slab'|'zinc'|'mixed';
type HeightId='low'|'mid';

const line=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,c:string,w=1)=>{
  ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
const rect=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>{
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x,y,w,h);}
};
const tank=(ctx:CanvasRenderingContext2D,x:number,y:number)=>{
  ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(x+3,y+5,9,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#087ea4';ctx.fillRect(x-7,y-5,14,10);ctx.beginPath();ctx.ellipse(x,y-5,7,3,0,0,Math.PI*2);ctx.fill();
};
const dish=(ctx:CanvasRenderingContext2D,x:number,y:number)=>{
  line(ctx,x,y,x,y-10,'#7c8794',1);ctx.strokeStyle='#cbd5e1';ctx.beginPath();ctx.arc(x+2,y-11,6,Math.PI*.95,Math.PI*1.75);ctx.stroke();
};
const rebar=(ctx:CanvasRenderingContext2D,x:number,y:number,count=3)=>{
  for(let i=0;i<count;i++){line(ctx,x+i*6,y,x+i*6,y-11,'#5d4d43',1.2);line(ctx,x+i*6-2,y-7,x+i*6+2,y-7,'#5d4d43',1);}
};
const roofSlab=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,variant:number)=>{
  rect(ctx,x-2,y-3,w+4,6,'#78818b');rect(ctx,x+5,y+5,w-10,Math.max(8,h*.30),'rgba(82,91,101,.24)');
  line(ctx,x+4,y+2,x+w-4,y+2,'rgba(226,232,240,.20)',1);
  if(variant===0)rebar(ctx,x+12,y+1,3);else if(variant===1)dish(ctx,x+w*.35,y+6);else tank(ctx,x+w*.72,y+9);
};
const roofZinc=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,variant:number)=>{
  ctx.beginPath();ctx.moveTo(x-4,y+5);ctx.lineTo(x+w*.45,y-5-(variant%2)*3);ctx.lineTo(x+w+5,y+4);ctx.lineTo(x+w,y+10);ctx.lineTo(x,y+10);ctx.closePath();
  ctx.fillStyle='#596573';ctx.fill();ctx.strokeStyle='#8795a4';ctx.globalAlpha=.42;ctx.stroke();ctx.globalAlpha=1;
  for(let xx=x+5;xx<x+w-4;xx+=9)line(ctx,xx,y+2,xx+3,y+8,'rgba(203,213,225,.23)',1);
};
const facadeWear=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,material:MaterialId,variant:number)=>{
  if(material==='brick'){
    ctx.strokeStyle='rgba(49,20,12,.40)';for(let yy=y+8;yy<y+h-5;yy+=7)line(ctx,x+2,yy,x+w-2,yy,'rgba(49,20,12,.34)',1);
  }else{
    ctx.fillStyle='rgba(79,65,49,.13)';ctx.fillRect(x+7+variant*5,y+h*.36,Math.max(16,w*.20),4);
    ctx.fillStyle='rgba(15,23,42,.08)';ctx.fillRect(x+w*.62,y+7,5,Math.max(9,h*.34));
  }
};
const windows=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,variant:number)=>{
  const count=w>115?3:2;for(let i=0;i<count;i++){
    const wx=x+w*(.34+i*.19)+(variant%2)*3;ctx.fillStyle=i===variant%count?'#f2d27b':'#203342';ctx.fillRect(wx,y+h-31,11,8);ctx.strokeStyle='#334155';ctx.strokeRect(wx,y+h-31,11,8);
  }
};
export function drawPeripheryDecorativeLot(
  ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,
  materialId:MaterialId,roof:RoofId,heightClass:HeightId
){
  const material=WORLD_MATERIALS[materialId];
  const variant=Math.abs(Math.floor(x*.13+y*.17+w*.07+h*.11))%3;
  const visualHeight=heightClass==='mid'?18:11;
  ctx.save();
  // 0.9C: compound massing. Decorative homes now read as houses that grew in stages,
  // not as one universal rectangle with a different roof texture.
  const bayW=Math.max(20,Math.min(38,w*(variant===2?.28:.23))),bayRight=variant!==1;
  const inset=variant===1?6:2, mainX=x+inset, mainY=y+(variant===2?5:2);
  const mainW=w-inset-(variant===0?Math.max(8,bayW*.28):2), mainH=h-(variant===1?7:2);
  ctx.fillStyle=`rgba(0,0,0,${heightClass==='mid'?.31:.23})`;
  ctx.fillRect(mainX+WORLD_LIGHTING.shadowOffsetX,mainY+WORLD_LIGHTING.shadowOffsetY,mainW,mainH);
  rect(ctx,mainX,mainY+visualHeight,mainW,mainH-visualHeight,material.shadow);
  rect(ctx,mainX,mainY,mainW,mainH-visualHeight*.25,material.base,material.edge);
  const bayX=bayRight?x+w-bayW:x;
  const bayY=y+Math.max(14,h*(variant===0?.30:.24));
  const bayH=Math.max(24,h*(variant===2?.62:.52));
  rect(ctx,bayX,bayY,bayW,bayH,material.shadow,material.edge);
  ctx.globalAlpha=.28;ctx.strokeRect(mainX,mainY,mainW,mainH);ctx.globalAlpha=1;
  facadeWear(ctx,mainX,mainY,mainW,mainH,materialId,variant);
  const doorX=variant===1?mainX+mainW-22:mainX+8;rect(ctx,doorX,mainY+mainH-23,12,21,'#14202b','#31404f');
  windows(ctx,mainX,mainY,mainW,mainH,variant);
  if(roof==='slab')roofSlab(ctx,mainX,mainY,mainW,mainH,variant);
  else if(roof==='zinc')roofZinc(ctx,mainX,mainY,mainW,variant);
  else {roofSlab(ctx,mainX,mainY,mainW,mainH,variant);roofZinc(ctx,bayX-2,bayY-3,bayW+4,variant+1);}
  if(heightClass==='mid'){
    const roomW=Math.max(22,mainW*(variant===1?.28:.34));
    const roomX=variant===1?mainX+mainW-roomW-8:mainX+8;
    rect(ctx,roomX,mainY+7,roomW,Math.max(14,mainH*.24),material.shadow,material.edge);
  }
  // Roof life is deterministic: lived-in rather than random clutter.
  if(heightClass==='mid'){
    if(variant===0)tank(ctx,x+w*.74,y+13);
    else if(variant===1)dish(ctx,x+w*.66,y+11);
    else {tank(ctx,x+w*.78,y+14);rebar(ctx,x+15,y+2,3);}
  }
  if(w>105){
    const aw=26,ax=variant===1?x+w-aw-8:x+8;
    rect(ctx,ax,y+h-17,aw,5,'#475569');
    line(ctx,ax+2,y+h-12,ax+2,y+h-2,'#64748b',1);line(ctx,ax+aw-2,y+h-12,ax+aw-2,y+h-2,'#64748b',1);
  }
  // Base grime, drain and small utility marks make the house meet the ground.
  rect(ctx,x+2,y+h-5,w-4,5,'rgba(0,0,0,.24)');
  line(ctx,bayRight?x+5:x+w-6,y+8,bayRight?x+5:x+w-6,y+h-5,'#475569',1.6);
  if(variant===2){ctx.fillStyle='rgba(42,74,48,.42)';ctx.beginPath();ctx.arc(x+w*.18,y+h-2,5,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
