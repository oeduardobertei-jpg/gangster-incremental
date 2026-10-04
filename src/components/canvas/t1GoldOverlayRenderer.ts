const line=(c:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,col:string,w=1)=>{
  c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
};
const drawAmbientLife=(ctx:CanvasRenderingContext2D,w:number,h:number,time:number,quality:number)=>{
  // 0.9.5F: movimento mínimo; a rua parece viva sem competir com combate.
  const pulse=.72+.28*Math.sin(time*.0057);
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

export function drawT1GoldOverlay(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,time:number,
  _controlColor:string,renderZoom:number
){
  if(territoryId!==1) return;
  // 0.9.5K: orçamento explícito de qualidade; evita microanimação quando ela não gera benefício visual.
  const quality=renderZoom<.78?0:renderZoom<1.28?1:2;
  ctx.save();drawAmbientLife(ctx,w,h,time,quality);drawZoomMicro(ctx,w,h,time,renderZoom);ctx.restore();
}
