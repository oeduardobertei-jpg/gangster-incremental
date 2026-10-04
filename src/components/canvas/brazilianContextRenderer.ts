const alpha=(hex:string,a:number)=>{const h=hex.replace('#','');if(h.length!==6)return hex;return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};
const pole=(ctx:CanvasRenderingContext2D,x:number,y:number,h=38)=>{ctx.strokeStyle='#555f69';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-h);ctx.stroke();ctx.strokeStyle='rgba(148,163,184,.34)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-8,y-h+5);ctx.lineTo(x+8,y-h+5);ctx.stroke();};
const wire=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,sag=10)=>{ctx.strokeStyle='rgba(8,15,24,.62)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+sag,x2,y2);ctx.stroke();};
const gutter=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number)=>{ctx.fillStyle='rgba(9,15,22,.30)';ctx.fillRect(x,y,w,5);ctx.fillStyle='rgba(148,163,184,.13)';for(let xx=x+5;xx<x+w-3;xx+=10)ctx.fillRect(xx,y+1,4,2);};
const patch=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number)=>{ctx.fillStyle='rgba(71,85,105,.08)';ctx.beginPath();ctx.roundRect(x,y,w,h,3);ctx.fill();ctx.strokeStyle='rgba(148,163,184,.08)';ctx.stroke();};
const oil=(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number)=>{ctx.fillStyle='rgba(2,6,23,.20)';ctx.beginPath();ctx.ellipse(x,y,rx,ry,.12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(125,211,252,.035)';ctx.stroke();};
const portuguesePaving=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number)=>{
  ctx.fillStyle='rgba(226,232,240,.025)';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(226,232,240,.035)';ctx.lineWidth=1;
  for(let xx=x-18;xx<x+w+18;xx+=22){ctx.beginPath();for(let yy=y;yy<y+h;yy+=4){const wave=Math.sin((yy-y)*.12+xx*.025)*2.2;yy===y?ctx.moveTo(xx+wave,yy):ctx.lineTo(xx+wave,yy);}ctx.stroke();}
  ctx.strokeStyle='rgba(15,23,42,.07)';for(let xx=x-8;xx<x+w+16;xx+=36){ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx+8,y+h);ctx.stroke();}
};
const hose=(ctx:CanvasRenderingContext2D,x:number,y:number,r:number)=>{ctx.strokeStyle='rgba(17,24,39,.46)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,.25,Math.PI*1.75);ctx.stroke();};
const tyreMark=(ctx:CanvasRenderingContext2D,x:number,y:number,len:number,angle:number)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle='rgba(15,23,42,.16)';ctx.lineWidth=2;for(const d of [-3,3]){ctx.beginPath();ctx.moveTo(-len/2,d);ctx.lineTo(len/2,d);ctx.stroke();}ctx.restore();};
const curbPaint=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,color:string)=>{for(let i=0;i<w;i+=14){ctx.fillStyle=(i/14)%2<1?alpha(color,.24):'rgba(241,245,249,.11)';ctx.fillRect(x+i,y,Math.min(14,w-i),4);}};
const drawT1=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  gutter(ctx,w*.04,h*.58,w*.19);gutter(ctx,w*.70,h*.70,w*.20);patch(ctx,w*.08,h*.41,w*.13,h*.07);patch(ctx,w*.72,h*.52,w*.14,h*.08);
  for(const [x,y] of [[.08,.24],[.21,.66],[.84,.31]] as const)pole(ctx,w*x,h*y,34);
  wire(ctx,w*.08,h*.19,w*.21,h*.61,12);wire(ctx,w*.21,h*.61,w*.84,h*.26,18);wire(ctx,w*.08,h*.19,w*.84,h*.26,10);
  curbPaint(ctx,w*.05,h*.73,w*.16,'#f59e0b');
};
const drawT2=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  patch(ctx,w*.08,h*.49,w*.25,h*.14);patch(ctx,w*.67,h*.49,w*.25,h*.14);gutter(ctx,w*.08,h*.80,w*.84);
  curbPaint(ctx,w*.08,h*.455,w*.24,'#eab308');curbPaint(ctx,w*.68,h*.455,w*.24,'#0f766e');
  for(const [x,y] of [[.10,.40],[.90,.40]] as const)pole(ctx,w*x,h*y,30);
  wire(ctx,w*.10,h*.355,w*.90,h*.355,11);
};
const drawT3=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  patch(ctx,w*.16,h*.22,w*.20,h*.18);patch(ctx,w*.64,h*.32,w*.20,h*.17);patch(ctx,w*.29,h*.67,w*.18,h*.12);
  oil(ctx,w*.24,h*.34,27,7);oil(ctx,w*.72,h*.43,23,6);oil(ctx,w*.40,h*.73,18,5);hose(ctx,w*.33,h*.34,16);hose(ctx,w*.73,h*.45,13);
  tyreMark(ctx,w*.27,h*.38,46,-.08);tyreMark(ctx,w*.70,h*.47,38,.12);gutter(ctx,w*.10,h*.82,w*.80);curbPaint(ctx,w*.10,h*.205,w*.18,'#f97316');
};
const drawT4=(ctx:CanvasRenderingContext2D,w:number,h:number,control:string)=>{
  gutter(ctx,w*.05,h*.86,w*.26);gutter(ctx,w*.69,h*.47,w*.25);patch(ctx,w*.07,h*.24,w*.18,h*.12);patch(ctx,w*.70,h*.56,w*.20,h*.12);
  for(const [x,y] of [[.10,.31],[.24,.58],[.79,.36]] as const)pole(ctx,w*x,h*y,32);
  wire(ctx,w*.10,h*.265,w*.24,h*.535,13);wire(ctx,w*.24,h*.535,w*.79,h*.315,16);curbPaint(ctx,w*.07,h*.37,w*.16,control);
};
const drawT5=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  portuguesePaving(ctx,w*.19,h*.12,w*.11,h*.74);portuguesePaving(ctx,w*.70,h*.12,w*.11,h*.74);
  gutter(ctx,w*.18,h*.86,w*.64);patch(ctx,w*.23,h*.31,w*.20,h*.14);patch(ctx,w*.57,h*.31,w*.20,h*.14);
  curbPaint(ctx,w*.18,h*.845,w*.16,'#d6c9a5');curbPaint(ctx,w*.66,h*.845,w*.16,'#d6c9a5');
};
const drawT6=(ctx:CanvasRenderingContext2D,w:number,h:number,control:string)=>{
  patch(ctx,w*.06,h*.34,w*.20,h*.16);patch(ctx,w*.74,h*.34,w*.20,h*.16);gutter(ctx,w*.31,h*.90,w*.38);
  curbPaint(ctx,w*.33,h*.075,w*.34,'#8b949b');curbPaint(ctx,w*.33,h*.905,w*.34,'#8b949b');
  ctx.strokeStyle='rgba(148,163,184,.075)';ctx.lineWidth=1;for(const x of [.28,.72]){ctx.beginPath();ctx.moveTo(w*x,h*.14);ctx.lineTo(w*x,h*.86);ctx.stroke();}
};
const drawEdgeContinuity=(ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,control:string)=>{
  if(territoryId===1){patch(ctx,-12,h*.18,w*.10,h*.18);patch(ctx,w*.92,h*.60,w*.10,h*.20);gutter(ctx,0,h*.88,w*.22);curbPaint(ctx,w*.78,h*.10,w*.22,'#f59e0b');}
  else if(territoryId===2){ctx.fillStyle='rgba(61,58,55,.18)';ctx.fillRect(0,h*.245,w*.08,h*.09);ctx.fillRect(w*.92,h*.245,w*.08,h*.09);gutter(ctx,0,h*.82,w*.18);gutter(ctx,w*.82,h*.82,w*.18);}
  else if(territoryId===3){patch(ctx,-10,h*.27,w*.09,h*.22);patch(ctx,w*.92,h*.54,w*.09,h*.22);gutter(ctx,0,h*.84,w*.23);gutter(ctx,w*.77,h*.18,w*.23);curbPaint(ctx,0,h*.17,w*.16,'#f97316');curbPaint(ctx,w*.84,h*.80,w*.16,'#f97316');}
  else if(territoryId===4){ctx.fillStyle='rgba(88,63,45,.13)';ctx.fillRect(0,h*.20,w*.08,h*.68);ctx.fillRect(w*.92,h*.18,w*.08,h*.70);gutter(ctx,0,h*.89,w*.18);curbPaint(ctx,w*.82,h*.12,w*.18,control);}
  else if(territoryId===5){portuguesePaving(ctx,0,h*.12,w*.07,h*.75);portuguesePaving(ctx,w*.93,h*.12,w*.07,h*.75);gutter(ctx,0,h*.88,w*.22);gutter(ctx,w*.78,h*.88,w*.22);}
  else {patch(ctx,0,h*.18,w*.08,h*.64);patch(ctx,w*.92,h*.18,w*.08,h*.64);ctx.strokeStyle='rgba(148,163,184,.07)';for(const x of [w*.04,w*.96]){ctx.beginPath();ctx.moveTo(x,h*.16);ctx.lineTo(x,h*.84);ctx.stroke();}gutter(ctx,w*.33,h*.93,w*.34);}
};
export function drawBrazilianContextFoundation(ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,controlColor:string){
  ctx.save();drawEdgeContinuity(ctx,w,h,territoryId,controlColor);if(territoryId===1)drawT1(ctx,w,h);else if(territoryId===2)drawT2(ctx,w,h);else if(territoryId===3)drawT3(ctx,w,h);else if(territoryId===4)drawT4(ctx,w,h,controlColor);else if(territoryId===5)drawT5(ctx,w,h);else if(territoryId===6)drawT6(ctx,w,h,controlColor);ctx.restore();
}
