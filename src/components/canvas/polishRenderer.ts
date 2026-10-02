const colorWithAlpha = (color: string, alpha: number) => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const glow = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, radius: number,
  color: string, alpha: number
) => {
  const g = ctx.createRadialGradient(x, y, 1, x, y, radius);
  g.addColorStop(0, colorWithAlpha(color, alpha));
  g.addColorStop(.46, colorWithAlpha(color, alpha * .34));
  g.addColorStop(1, colorWithAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
};

const drawGrassPatch = (
  ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,
  density:number,base='#244b36',blade='#4f7d55'
) => {
  ctx.save();
  ctx.fillStyle=base;ctx.globalAlpha=.72;
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.55;ctx.strokeStyle=blade;ctx.lineWidth=1;
  for(let i=0;i<density;i++){
    const a=(i*2.399963)% (Math.PI*2),r=Math.sqrt((i+.5)/density);
    const px=x+Math.cos(a)*rx*r,py=y+Math.sin(a)*ry*r;
    const len=2+(i%4);
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+(i%3-1)*1.2,py-len);ctx.stroke();
  }
  ctx.restore();
};

const drawPlanter = (ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number) => {
  ctx.fillStyle='rgba(0,0,0,.20)';ctx.fillRect(x+3,y+4,w,h);
  ctx.fillStyle='#5c646a';ctx.fillRect(x,y,w,h);
  ctx.fillStyle='#1f4d36';ctx.fillRect(x+3,y+3,w-6,Math.max(3,h-6));
  ctx.strokeStyle='rgba(226,232,240,.18)';ctx.strokeRect(x,y,w,h);
};

const drawEdgeVignette = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const g = ctx.createRadialGradient(w*.50,h*.48,Math.min(w,h)*.22,w*.50,h*.48,Math.max(w,h)*.68);
  g.addColorStop(0,'rgba(0,0,0,0)');
  g.addColorStop(.72,'rgba(0,0,0,.035)');
  g.addColorStop(1,'rgba(0,0,0,.22)');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
};const drawT1 = (ctx:CanvasRenderingContext2D,w:number,h:number,control:string) => {
  for(const [x,y,r] of [[.12,.20,78],[.37,.50,62],[.72,.76,72]] as const) glow(ctx,w*x,h*y,r,'#f59e0b',.075);
  for(const [x,y,rx,ry] of [[.44,.73,24,7],[.58,.47,18,5]] as const){
    ctx.fillStyle='rgba(125,211,252,.055)';ctx.beginPath();ctx.ellipse(w*x,h*y,rx,ry,.18,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(186,230,253,.10)';ctx.lineWidth=1;ctx.stroke();
  }
  ctx.strokeStyle=colorWithAlpha(control,.16);ctx.lineWidth=2;
  for(const [x,y] of [[.21,.37],[.69,.34],[.70,.73]] as const){
    ctx.beginPath();ctx.moveTo(w*x,h*y);ctx.lineTo(w*(x+.055),h*(y+.008));ctx.stroke();
  }
  // Periferia: verde espontâneo, pequeno e quebrado entre concreto e terra.
  drawGrassPatch(ctx,w*.08,h*.16,34,18,22,'#234734','#4f7b50');
  drawGrassPatch(ctx,w*.88,h*.72,42,20,26,'#1f4531','#567b4d');
  drawGrassPatch(ctx,w*.76,h*.24,24,13,16,'#274b35','#5d8057');
};

const drawT2 = (ctx:CanvasRenderingContext2D,w:number,h:number) => {
  glow(ctx,w*.50,h*.20,150,'#facc15',.055);
  for(const x of [.445,.555]){ctx.strokeStyle='rgba(226,232,240,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w*x,h*.24);ctx.lineTo(w*x,h*.34);ctx.stroke();}
  ctx.strokeStyle='rgba(250,204,21,.20)';ctx.lineWidth=2;
  for(const y of [.465,.79]){ctx.beginPath();ctx.moveTo(w*.08,h*y);ctx.lineTo(w*.92,h*y);ctx.stroke();}
  for(const [x,y,c] of [[.16,.58,'#f59e0b'],[.80,.58,'#14b8a6'],[.24,.72,'#eab308']] as const){
    ctx.fillStyle=colorWithAlpha(c,.12);ctx.fillRect(w*x,h*y,48,10);
  }
  // Ferrovia: vegetação rala apenas nas margens menos pisadas.
  drawGrassPatch(ctx,w*.08,h*.36,26,10,12,'#2b4630','#667c49');
  drawGrassPatch(ctx,w*.91,h*.35,32,11,14,'#29432e','#63774a');
  drawGrassPatch(ctx,w*.12,h*.83,24,10,10,'#2d4830','#6b7f4d');
};const drawT3 = (ctx:CanvasRenderingContext2D,w:number,h:number) => {
  // 0.5.7: cargo bays and oil marks are authored by the base scene; avoid duplicate
  // translucent rectangles/blobs that looked like floating props.
  glow(ctx,w*.73,h*.61,68,'#fb923c',.045);
  // Industrial: ervas daninhas raras, sempre nas bordas e frestas.
  drawGrassPatch(ctx,w*.05,h*.76,22,8,8,'#26382d','#53664b');
  drawGrassPatch(ctx,w*.92,h*.48,18,7,7,'#24352a','#4f6248');
  drawGrassPatch(ctx,w*.14,h*.15,16,6,6,'#28392d','#59684a');
};

const drawT4 = (ctx:CanvasRenderingContext2D,w:number,h:number,control:string) => {
  for(const y of [.32,.58,.82]){
    const g=ctx.createLinearGradient(0,h*(y-.035),0,h*(y+.035));
    g.addColorStop(0,'rgba(255,255,255,.025)');g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.15)');
    ctx.fillStyle=g;ctx.fillRect(0,h*(y-.04),w,h*.08);
  }
  ctx.fillStyle='rgba(180,137,92,.22)';
  for(const [x,y,r] of [[.14,.25,3],[.22,.67,2],[.76,.44,3],[.88,.74,2],[.63,.20,2]] as const){ctx.beginPath();ctx.arc(w*x,h*y,r,0,Math.PI*2);ctx.fill();}
  glow(ctx,w*.83,h*.13,72,control,.06);glow(ctx,w*.10,h*.18,58,control,.045);
  // Morro: capim seco e arbustos baixos acompanhando os terraços.
  drawGrassPatch(ctx,w*.11,h*.35,38,13,20,'#354a2f','#6b7848');
  drawGrassPatch(ctx,w*.82,h*.61,44,15,23,'#34472d','#737c4c');
  drawGrassPatch(ctx,w*.72,h*.84,30,11,16,'#31452e','#66734a');
};const drawT5 = (ctx:CanvasRenderingContext2D,w:number,h:number,control:string) => {
  for(const [x,y,r] of [[.315,.24,82],[.69,.71,78]] as const) glow(ctx,w*x,h*y,r,'#38bdf8',.045);
  for(const [x,y] of [[.10,.25],[.90,.25],[.10,.72],[.90,.72]] as const){
    ctx.fillStyle='rgba(0,0,0,.14)';ctx.beginPath();ctx.ellipse(w*x,h*y,28,10,0,0,Math.PI*2);ctx.fill();
  }
  ctx.strokeStyle='rgba(241,245,249,.15)';ctx.lineWidth=1.2;
  for(const x of [.27,.33,.67,.73]){ctx.beginPath();ctx.moveTo(w*x,h*.40);ctx.lineTo(w*x,h*.49);ctx.stroke();}
  ctx.strokeStyle=colorWithAlpha(control,.17);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(w*.455,h*.80);ctx.lineTo(w*.545,h*.80);ctx.stroke();
  // Condomínios: paisagismo deliberado e bem mantido.
  drawGrassPatch(ctx,w*.105,h*.22,62,31,46,'#20523c','#4f9166');
  drawGrassPatch(ctx,w*.895,h*.22,62,31,46,'#20523c','#4f9166');
  drawGrassPatch(ctx,w*.105,h*.71,64,34,48,'#1f513a','#4a8a61');
  drawGrassPatch(ctx,w*.895,h*.71,64,34,48,'#1f513a','#4a8a61');
  drawPlanter(ctx,w*.18,h*.34,72,16);drawPlanter(ctx,w*.76,h*.52,72,16);
};

const drawT6 = (ctx:CanvasRenderingContext2D,w:number,h:number,control:string) => {
  const lane=ctx.createLinearGradient(w*.32,0,w*.68,0);
  lane.addColorStop(0,'rgba(0,0,0,.10)');lane.addColorStop(.5,'rgba(161,166,168,.024)');lane.addColorStop(1,'rgba(0,0,0,.10)');
  ctx.fillStyle=lane;ctx.fillRect(w*.32,h*.06,w*.36,h*.88);
  for(const y of [.31,.54,.78]){glow(ctx,w*.50,h*y,82,'#e5e7eb',.018);}
  ctx.strokeStyle='rgba(226,232,240,.13)';ctx.lineWidth=1;
  for(const y of [.40,.68]){for(let x=.385;x<.61;x+=.045){ctx.beginPath();ctx.moveTo(w*x,h*y);ctx.lineTo(w*(x+.018),h*(y-.016));ctx.stroke();}}
  ctx.strokeStyle='rgba(176,181,184,.14)';ctx.lineWidth=1.25;
  for(const x of [.325,.675]){ctx.beginPath();ctx.moveTo(w*x,h*.06);ctx.lineTo(w*x,h*.94);ctx.stroke();}
  // Complexo: verde institucional contido, fora do eixo operacional.
  drawPlanter(ctx,w*.22,h*.18,64,15);drawPlanter(ctx,w*.73,h*.72,64,15);
  drawGrassPatch(ctx,w*.245,h*.19,24,8,12,'#244536','#53755a');
  drawGrassPatch(ctx,w*.755,h*.73,24,8,12,'#244536','#53755a');
};export function drawTerritoryPolishFoundation(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,controlColor:string
) {
  ctx.save();
  if(territoryId===1) drawT1(ctx,w,h,controlColor);
  else if(territoryId===2) drawT2(ctx,w,h);
  else if(territoryId===3) drawT3(ctx,w,h);
  else if(territoryId===4) drawT4(ctx,w,h,controlColor);
  else if(territoryId===5) drawT5(ctx,w,h,controlColor);
  else if(territoryId===6) drawT6(ctx,w,h,controlColor);
  drawEdgeVignette(ctx,w,h);
  ctx.restore();
}

export function drawTerritoryPolishOverlay(
  ctx:CanvasRenderingContext2D,w:number,h:number,territoryId:number,time:number,controlColor:string
) {
  ctx.save();
  const pulse=.45+.55*(.5+.5*Math.sin(time*.004));
  if(territoryId===1){
    ctx.fillStyle=`rgba(251,191,36,${.025*pulse})`;ctx.beginPath();ctx.arc(w*.12,h*.20,18,0,Math.PI*2);ctx.fill();
  } else if(territoryId===2){
    ctx.fillStyle=`rgba(253,224,71,${.04*pulse})`;ctx.fillRect(w*.445,h*.198,w*.11,3);
  } else if(territoryId===3){
    ctx.fillStyle=`rgba(251,146,60,${.035*pulse})`;ctx.fillRect(w*.70,h*.60,w*.06,4);
  } else if(territoryId===5){
    const shift=(time*.012)%22;ctx.strokeStyle='rgba(186,230,253,.10)';ctx.lineWidth=1;
    for(const x of [.24,.62]){ctx.beginPath();ctx.moveTo(w*x+shift,h*(x<.5?.24:.71));ctx.lineTo(w*x+shift+16,h*(x<.5?.24:.71));ctx.stroke();}
  } else if(territoryId===6){
    ctx.strokeStyle=`rgba(229,231,235,${.025+.018*pulse})`;ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(w*.43,h*.54);ctx.lineTo(w*.57,h*.54);ctx.stroke();
  }
  ctx.restore();
}