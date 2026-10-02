const seeded = (seed:number) => () => {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const tuft = (
  ctx:CanvasRenderingContext2D,x:number,y:number,r:number,
  base:string,blade:string,seed:number,density=12
) => {
  const rand=seeded(seed);ctx.save();
  ctx.fillStyle='rgba(0,0,0,.20)';ctx.beginPath();ctx.ellipse(x+2,y+3,r*1.1,r*.34,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=base;ctx.globalAlpha=.88;ctx.beginPath();ctx.ellipse(x,y,r,r*.48,(rand()-.5)*.4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=blade;ctx.globalAlpha=.72;ctx.lineWidth=1;
  for(let i=0;i<density;i++){
    const px=x+(rand()-.5)*r*1.45,py=y+(rand()-.5)*r*.55;
    const len=3+rand()*7;ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+(rand()-.5)*3,py-len*.55,px+(rand()-.5)*4,py-len);ctx.stroke();
  }
  ctx.restore();
};const shrub = (
  ctx:CanvasRenderingContext2D,x:number,y:number,scale:number,
  dark:string,mid:string,light:string,seed:number
) => {
  const rand=seeded(seed);ctx.save();
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(x+4,y+7,18*scale,6*scale,.1,0,Math.PI*2);ctx.fill();
  for(let i=0;i<7;i++){
    const ox=(rand()-.5)*22*scale,oy=(rand()-.5)*8*scale;
    const r=(5+rand()*6)*scale;ctx.fillStyle=i<2?dark:i<5?mid:light;
    ctx.globalAlpha=.82;ctx.beginPath();ctx.arc(x+ox,y+oy,r,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};

const smallTree = (
  ctx:CanvasRenderingContext2D,x:number,y:number,scale:number,
  trunk:string,dark:string,mid:string,light:string,seed:number
) => {
  const rand=seeded(seed);ctx.save();
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(x+6,y+11,24*scale,8*scale,.08,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=trunk;ctx.lineWidth=4*scale;ctx.beginPath();ctx.moveTo(x,y+6*scale);ctx.lineTo(x,y-18*scale);ctx.stroke();
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2+rand()*.35,r=(8+rand()*9)*scale;
    const ox=Math.cos(a)*(7+rand()*10)*scale,oy=Math.sin(a)*(4+rand()*8)*scale-20*scale;
    ctx.fillStyle=i<3?dark:i<6?mid:light;ctx.globalAlpha=.92;ctx.beginPath();ctx.arc(x+ox,y+oy,r,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};const scatterEdge = (
  ctx:CanvasRenderingContext2D,w:number,h:number,seed:number,
  count:number,area:[number,number,number,number],kind:'grass'|'dry'|'industrial'
) => {
  const rand=seeded(seed),[x0,y0,x1,y1]=area;
  for(let i=0;i<count;i++){
    const x=w*(x0+(x1-x0)*rand()),y=h*(y0+(y1-y0)*rand());
    if(kind==='grass') tuft(ctx,x,y,5+rand()*8,'#244f38','#5f8e59',seed+i*17,7+Math.floor(rand()*7));
    else if(kind==='dry') tuft(ctx,x,y,4+rand()*7,'#4b5231','#8c8654',seed+i*19,6+Math.floor(rand()*6));
    else {
      ctx.fillStyle=rand()>.5?'#465348':'#354239';ctx.globalAlpha=.72;
      ctx.beginPath();ctx.ellipse(x,y,2+rand()*3,1+rand()*2,rand()*Math.PI,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    }
  }
};

const dirtFeather = (
  ctx:CanvasRenderingContext2D,w:number,h:number,seed:number,
  area:[number,number,number,number],color:string,count:number
) => {
  const rand=seeded(seed),[x0,y0,x1,y1]=area;ctx.save();ctx.fillStyle=color;
  for(let i=0;i<count;i++){
    const x=w*(x0+(x1-x0)*rand()),y=h*(y0+(y1-y0)*rand());
    ctx.globalAlpha=.035+rand()*.08;ctx.beginPath();ctx.ellipse(x,y,4+rand()*18,1.5+rand()*5,(rand()-.5)*.8,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};const drawT1=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  dirtFeather(ctx,w,h,1101,[.01,.10,.30,.90],'#9b744e',34);
  dirtFeather(ctx,w,h,1102,[.70,.08,.98,.92],'#6f5a40',28);
  scatterEdge(ctx,w,h,1111,10,[.01,.10,.18,.88],'grass');
  scatterEdge(ctx,w,h,1112,9,[.77,.10,.98,.88],'grass');
  shrub(ctx,w*.085,h*.17,.80,'#173626','#28543a','#4f7750',1121);
  shrub(ctx,w*.89,h*.70,.92,'#153424','#265039','#557d52',1122);
  tuft(ctx,w*.31,h*.53,12,'#294934','#62805a',1123,16);
  tuft(ctx,w*.70,h*.84,10,'#24442f','#587552',1124,13);
};

const drawT2=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  dirtFeather(ctx,w,h,2201,[0,.20,1,.38],'#806242',42);
  scatterEdge(ctx,w,h,2211,16,[.01,.22,.18,.39],'dry');
  scatterEdge(ctx,w,h,2212,16,[.82,.22,.99,.39],'dry');
  scatterEdge(ctx,w,h,2213,10,[.02,.78,.98,.92],'dry');
  tuft(ctx,w*.08,h*.34,13,'#3a472e','#7b8050',2221,15);
  tuft(ctx,w*.92,h*.35,15,'#37442d','#777b4d',2222,17);
  shrub(ctx,w*.05,h*.84,.58,'#283725','#3d5232','#6b7044',2223);
};const drawT3=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  dirtFeather(ctx,w,h,3301,[.05,.14,.95,.86],'#6b5542',26);
  scatterEdge(ctx,w,h,3311,8,[.01,.12,.10,.88],'industrial');
  scatterEdge(ctx,w,h,3312,8,[.90,.12,.99,.88],'industrial');
  tuft(ctx,w*.055,h*.74,8,'#26372c','#52644a',3321,8);
  tuft(ctx,w*.93,h*.49,7,'#243329','#4b5b45',3322,7);
  tuft(ctx,w*.14,h*.16,7,'#27372c','#556448',3323,7);
};

const drawT4=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  dirtFeather(ctx,w,h,4401,[.01,.12,.99,.91],'#9a6843',52);
  scatterEdge(ctx,w,h,4411,13,[.02,.18,.26,.91],'dry');
  scatterEdge(ctx,w,h,4412,13,[.70,.18,.98,.91],'dry');
  shrub(ctx,w*.12,h*.34,.66,'#313a25','#4d5934','#77754b',4421);
  shrub(ctx,w*.83,h*.61,.74,'#2f3824','#4a5531','#77774b',4422);
  tuft(ctx,w*.70,h*.84,13,'#3c4529','#817b4b',4423,15);
  tuft(ctx,w*.29,h*.66,10,'#3a4228','#7b7548',4424,12);
};const drawT5=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  dirtFeather(ctx,w,h,5501,[.02,.10,.98,.90],'#5a7467',20);
  for(const [x,y,s,seed] of [[.10,.23,.78,5511],[.90,.23,.78,5512],[.10,.72,.82,5513],[.90,.72,.82,5514]] as const){
    shrub(ctx,w*x,h*y,s,'#16412f','#245b3f','#4f8a5c',seed);
  }
  smallTree(ctx,w*.16,h*.34,.76,'#4b3b2d','#173d2d','#245c3d','#4f8b5b',5521);
  smallTree(ctx,w*.84,h*.60,.76,'#4b3b2d','#173d2d','#245c3d','#4f8b5b',5522);
  scatterEdge(ctx,w,h,5531,10,[.02,.12,.17,.86],'grass');
  scatterEdge(ctx,w,h,5532,10,[.83,.12,.98,.86],'grass');
};

const drawT6=(ctx:CanvasRenderingContext2D,w:number,h:number)=>{
  dirtFeather(ctx,w,h,6601,[.04,.10,.30,.90],'#53675e',14);
  dirtFeather(ctx,w,h,6602,[.70,.10,.96,.90],'#53675e',14);
  tuft(ctx,w*.22,h*.19,10,'#254737','#54765b',6611,11);
  tuft(ctx,w*.76,h*.73,10,'#254737','#54765b',6612,11);
  shrub(ctx,w*.18,h*.75,.50,'#20392d','#315443','#58765c',6621);
  shrub(ctx,w*.81,h*.24,.50,'#20392d','#315443','#58765c',6622);
};export function drawBiomeDepthFoundation(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number
){
  ctx.save();
  if(territoryId===1) drawT1(ctx,w,h);
  else if(territoryId===2) drawT2(ctx,w,h);
  else if(territoryId===3) drawT3(ctx,w,h);
  else if(territoryId===4) drawT4(ctx,w,h);
  else if(territoryId===5) drawT5(ctx,w,h);
  else if(territoryId===6) drawT6(ctx,w,h);
  ctx.restore();
}