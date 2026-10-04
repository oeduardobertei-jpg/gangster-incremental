const line=(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1)=>{
  c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
};
const lightPool=(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,a:number)=>{
  const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(251,191,36,${a})`);
  g.addColorStop(.42,`rgba(245,158,11,${a*.26})`);g.addColorStop(1,'rgba(245,158,11,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
};
const laundry=(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,time:number,phase:number)=>{
  const sway=Math.sin(time*.0022+phase)*2.2;
  ctx.strokeStyle='rgba(203,213,225,.18)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+5+sway,x2,y2);ctx.stroke();
  const cols=['#c56f42','#4d88a7','#d5b84d'];
  for(let i=0;i<3;i++){const t=.25+i*.22,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t+3+sway*(.45+i*.15);ctx.fillStyle=cols[i];ctx.globalAlpha=.70;ctx.fillRect(x-3,y,7,6);}
  ctx.globalAlpha=1;
};

const drawAmbientLife=(ctx:CanvasRenderingContext2D,w:number,h:number,time:number,quality:number)=>{
  // 0.9.5F: movimento mínimo; a rua parece viva sem competir com combate.
  const pulse=.72+.28*Math.sin(time*.0057);
  lightPool(ctx,w*.146,h*.187,quality>1?62:48,.035+.018*pulse);
  lightPool(ctx,w*.182,h*.725,quality>1?54:42,.026+.014*(1-pulse));
  ctx.fillStyle=`rgba(255,226,153,${.20+.07*pulse})`;ctx.fillRect(w*.132,h*.174,18,3);
  if(quality>0){
    ctx.fillStyle=`rgba(167,223,255,${.10+.035*Math.sin(time*.0031+2)})`;ctx.fillRect(w*.805,h*.744,20,2);
  }
  // Cleanup final: detached zoom-only laundry lines removed.
};

const drawZoomMicro=(ctx:CanvasRenderingContext2D,w:number,h:number,time:number,zoom:number)=>{
  if(zoom<1.22) return; // 0.9.5J: close-up ganha informação, mapa inteiro continua limpo.
  const shimmer=.5+.5*Math.sin(time*.0034);
  ctx.strokeStyle=`rgba(148,163,184,${.06+.025*shimmer})`;ctx.lineWidth=.8;
  for(const [nx,ny] of [[.215,.588],[.706,.606],[.337,.812],[.817,.292]] as const){
    const x=w*nx,y=h*ny;ctx.beginPath();ctx.arc(x,y,4.5,0,Math.PI*2);ctx.stroke();line(ctx,x-3,y,x+3,y,'rgba(148,163,184,.08)',.7);
  }
  if(zoom>=1.70){
    // Reflexos minúsculos de poças e metal só no zoom alto.
    ctx.strokeStyle=`rgba(186,230,253,${.075+.025*shimmer})`;ctx.lineWidth=.8;
    for(const [nx,ny,len] of [[.438,.742,18],[.575,.475,14],[.284,.686,12]] as const){line(ctx,w*nx,h*ny,w*nx+len,h*ny,'rgba(186,230,253,.075)',.8);}
  }
};

const drawFinalGrade=(ctx:CanvasRenderingContext2D,w:number,h:number,quality:number)=>{
  // 0.9.5M: grade acontece antes das unidades, preservando cores de combate e HUD.
  const left=ctx.createLinearGradient(0,0,w*.24,0);left.addColorStop(0,'rgba(4,13,20,.085)');left.addColorStop(1,'rgba(4,13,20,0)');
  ctx.fillStyle=left;ctx.fillRect(0,0,w*.26,h);
  const right=ctx.createLinearGradient(w,0,w*.76,0);right.addColorStop(0,'rgba(4,13,20,.078)');right.addColorStop(1,'rgba(4,13,20,0)');
  ctx.fillStyle=right;ctx.fillRect(w*.74,0,w*.26,h);
  if(quality>0){
    const top=ctx.createLinearGradient(0,0,0,h*.26);top.addColorStop(0,'rgba(11,18,27,.055)');top.addColorStop(1,'rgba(11,18,27,0)');ctx.fillStyle=top;ctx.fillRect(0,0,w,h*.28);
  }
};

export function drawT1GoldOverlay(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,time:number,
  _controlColor:string,renderZoom:number
){
  if(territoryId!==1) return;
  // 0.9.5K: orçamento explícito de qualidade; evita microanimação quando ela não gera benefício visual.
  const quality=renderZoom<.78?0:renderZoom<1.28?1:2;
  ctx.save();drawFinalGrade(ctx,w,h,quality);drawAmbientLife(ctx,w,h,time,quality);drawZoomMicro(ctx,w,h,time,renderZoom);ctx.restore();
}
