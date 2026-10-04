import type { ScenePath } from '../../data/territoryScenes';

type ReservedFootprint = { x:number; y:number; w:number; h:number };

type Point = readonly [number, number];

const alpha=(hex:string,a:number)=>{
  const h=hex.replace('#',''); if(!/^[0-9a-f]{6}$/i.test(h)) return hex;
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
};
const poly=(ctx:CanvasRenderingContext2D,W:number,H:number,pts:readonly Point[],fill:string,stroke?:string)=>{
  ctx.beginPath(); pts.forEach(([x,y],i)=>i?ctx.lineTo(x*W,y*H):ctx.moveTo(x*W,y*H)); ctx.closePath();
  ctx.fillStyle=fill; ctx.fill(); if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
};
const curve=(ctx:CanvasRenderingContext2D,W:number,H:number,p0:Point,p1:Point,p2:Point,color:string,width:number)=>{
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p0[0]*W,p0[1]*H);ctx.quadraticCurveTo(p1[0]*W,p1[1]*H,p2[0]*W,p2[1]*H);ctx.stroke();
};
const overlaps=(x:number,y:number,w:number,h:number,reserved:readonly ReservedFootprint[],margin=12)=>reserved.some(r=>x<r.x+r.w+margin&&x+w>r.x-margin&&y<r.y+r.h+margin&&y+h>r.y-margin);

function drawBoulevard(ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[]){
  for(const path of paths){
    if(path.points.length<2) continue;
    const road=path.surface==='asphalt';
    ctx.beginPath();path.points.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H):ctx.moveTo(p.x*W,p.y*H));
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(7,12,18,.40)';ctx.lineWidth=path.width+10;ctx.stroke();
    ctx.beginPath();path.points.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H):ctx.moveTo(p.x*W,p.y*H));
    ctx.strokeStyle=road?'#232b34':'#4f5250';ctx.lineWidth=path.width;ctx.stroke();
    if(road){
      ctx.beginPath();path.points.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H):ctx.moveTo(p.x*W,p.y*H));
      ctx.setLineDash([14,24]);ctx.strokeStyle='rgba(250,204,21,.36)';ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);
    }
  }
  // Stone sidewalks make the avenue feel built, but keep the tactical center uncluttered.
  for(const x of [.414,.574]){
    ctx.fillStyle='rgba(205,207,202,.12)';ctx.fillRect(W*x,0,W*.020,H);
    ctx.strokeStyle='rgba(226,232,240,.10)';ctx.lineWidth=1;
    for(let y=8;y<H;y+=22){ctx.beginPath();ctx.moveTo(W*x,y);ctx.quadraticCurveTo(W*(x+.010),y+6,W*(x+.020),y);ctx.stroke();}
  }
}

function drawEnclaves(ctx:CanvasRenderingContext2D,W:number,H:number){
  const enclaves=[
    [[.025,.095],[.165,.075],[.325,.105],[.385,.205],[.365,.395],[.245,.455],[.080,.425],[.025,.315]],
    [[.615,.090],[.790,.070],[.958,.110],[.975,.285],[.925,.410],[.765,.445],[.635,.365],[.605,.205]],
    [[.030,.545],[.175,.515],[.350,.565],[.390,.705],[.340,.905],[.180,.945],[.055,.875],[.020,.700]],
    [[.615,.535],[.770,.505],[.955,.555],[.980,.725],[.925,.905],[.770,.945],[.635,.875],[.600,.690]]
  ] as const;
  enclaves.forEach((pts,i)=>{
    poly(ctx,W,H,pts,i%2?'rgba(53,65,69,.24)':'rgba(62,68,68,.23)','rgba(203,213,225,.075)');
  });
  // Curved internal drives break the toy-block symmetry and lead toward each enclave.
  curve(ctx,W,H,[.39,.31],[.31,.29],[.22,.34],'rgba(123,130,128,.25)',10);
  curve(ctx,W,H,[.61,.29],[.70,.27],[.80,.33],'rgba(123,130,128,.25)',10);
  curve(ctx,W,H,[.39,.68],[.30,.72],[.20,.68],'rgba(123,130,128,.25)',10);
  curve(ctx,W,H,[.61,.67],[.70,.72],[.82,.67],'rgba(123,130,128,.25)',10);
  curve(ctx,W,H,[.39,.31],[.31,.29],[.22,.34],'rgba(210,214,207,.10)',3);
  curve(ctx,W,H,[.61,.29],[.70,.27],[.80,.33],'rgba(210,214,207,.10)',3);
  curve(ctx,W,H,[.39,.68],[.30,.72],[.20,.68],'rgba(210,214,207,.10)',3);
  curve(ctx,W,H,[.61,.67],[.70,.72],[.82,.67],'rgba(210,214,207,.10)',3);
}

function drawLandscape(ctx:CanvasRenderingContext2D,W:number,H:number){
  const beds=[
    [[.045,.145],[.145,.120],[.180,.200],[.135,.260],[.055,.245]],
    [[.825,.130],[.945,.150],[.950,.245],[.875,.280],[.815,.215]],
    [[.050,.650],[.145,.605],[.180,.700],[.135,.805],[.045,.780]],
    [[.820,.620],[.945,.650],[.950,.790],[.875,.825],[.805,.735]]
  ] as const;
  for(const pts of beds){poly(ctx,W,H,pts,'rgba(25,63,48,.76)','rgba(70,105,82,.35)');}
  const palms:[[number,number,number],...Array<[number,number,number]>]=[[.105,.205,1],[.175,.385,.78],[.875,.205,.9],[.915,.425,.82],[.105,.720,.9],[.845,.745,1]];
  for(const [x,y,s] of palms){const px=W*x,py=H*y;ctx.strokeStyle='#65543b';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(px,py+10*s);ctx.lineTo(px,py-10*s);ctx.stroke();ctx.strokeStyle='#3e7a58';ctx.lineWidth=3*s;for(const a of [-2.7,-2.0,-1.3,-.6,.1,.8]){ctx.beginPath();ctx.moveTo(px,py-10*s);ctx.lineTo(px+Math.cos(a)*13*s,py-10*s+Math.sin(a)*6*s);ctx.stroke();}}
  // Pools are embedded into courtyards with a deck, not floating blue rectangles.
  for(const [x,y,w,h] of [[.245,.205,.125,.066],[.655,.700,.115,.070]] as const){
    ctx.fillStyle='rgba(194,197,190,.13)';ctx.beginPath();ctx.roundRect(W*(x-.012),H*(y-.016),W*(w+.024),H*(h+.032),8);ctx.fill();
    ctx.fillStyle='rgba(56,189,248,.17)';ctx.strokeStyle='rgba(125,211,252,.42)';ctx.beginPath();ctx.roundRect(W*x,H*y,W*w,H*h,7);ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(226,232,240,.16)';ctx.lineWidth=1;for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(W*(x+w*k/4),H*y);ctx.lineTo(W*(x+w*k/4),H*(y+h));ctx.stroke();}
  }
}

function drawResidentUse(ctx:CanvasRenderingContext2D,W:number,H:number,reserved:readonly ReservedFootprint[]){
  // Parking/service pockets are ground storytelling only and deliberately avoid hero footprints.
  const bays=[
    [.245,.455,.105,.075], [.650,.435,.105,.070], [.235,.790,.115,.070], [.650,.805,.110,.065]
  ] as const;
  for(const [x,y,w,h] of bays){if(overlaps(x*W,y*H,w*W,h*H,reserved,8)) continue;ctx.fillStyle='rgba(38,47,55,.28)';ctx.beginPath();ctx.roundRect(x*W,y*H,w*W,h*H,6);ctx.fill();ctx.strokeStyle='rgba(203,213,225,.10)';for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo((x+w*k/4)*W,y*H);ctx.lineTo((x+w*k/4)*W,(y+h)*H);ctx.stroke();}}
  // Drainage and curb breaks explain entrances instead of long blueprint guides.
  ctx.strokeStyle='rgba(15,23,42,.36)';ctx.lineWidth=2;
  for(const [x,y] of [[.405,.33],[.575,.30],[.405,.70],[.575,.68]] as const){ctx.beginPath();ctx.moveTo(W*x,H*y);ctx.lineTo(W*(x+.018),H*(y+.005));ctx.stroke();}
  ctx.fillStyle='rgba(20,28,34,.56)';for(const [x,y] of [[.405,.42],[.575,.46],[.405,.76],[.575,.74]] as const){for(let i=0;i<4;i++)ctx.fillRect(W*x+i*5,H*y,2,9);}
}

function drawPerimeter(ctx:CanvasRenderingContext2D,W:number,H:number,controlColor:string){
  const wallSegments=[
    {x:.18,ranges:[[.19,.17],[.52,.16],[.84,.06]] as const},
    {x:.82,ranges:[[.16,.19],[.47,.20],[.81,.09]] as const}
  ];
  for(const side of wallSegments){const wx=W*side.x;for(const [yr,hr] of side.ranges){const y=H*yr,h=H*hr;ctx.fillStyle='rgba(0,0,0,.34)';ctx.fillRect(wx+6,y+5,14,h);ctx.fillStyle='#59636b';ctx.fillRect(wx-8,y,16,h);ctx.fillStyle='#d7dce0';ctx.fillRect(wx-8,y,16,3);ctx.fillStyle=alpha(controlColor,.18);ctx.fillRect(wx-8,y,3,h);}}
  // Main gate keeps its physical opening but reads as architecture, not an editor rectangle.
  const gy=H*.84;for(const [x,w] of [[.36,.10],[.54,.10]] as const){ctx.fillStyle='rgba(0,0,0,.30)';ctx.fillRect(W*x+5,gy+6,W*w,15);ctx.fillStyle='#d9dde1';ctx.fillRect(W*x,gy,W*w,13);ctx.strokeStyle=alpha(controlColor,.80);ctx.lineWidth=2;ctx.strokeRect(W*x,gy,W*w,13);}
  ctx.fillStyle='#151b22';ctx.fillRect(W*.465,H*.822,W*.07,26);ctx.strokeStyle=alpha(controlColor,.78);ctx.strokeRect(W*.465,H*.822,W*.07,26);
}

export function drawT5ReauthoredSurface(ctx:CanvasRenderingContext2D,W:number,H:number,paths:readonly ScenePath[],reserved:readonly ReservedFootprint[],controlColor:string){
  ctx.save();
  drawEnclaves(ctx,W,H);
  drawBoulevard(ctx,W,H,paths);
  drawLandscape(ctx,W,H);
  drawResidentUse(ctx,W,H,reserved);
  drawPerimeter(ctx,W,H,controlColor);
  ctx.restore();
}
