from pathlib import Path
import re

root=Path(r"C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental")

# Add low-risk decorative storytelling props around occupied pockets.
p=root/"src/data/territoryPurposeProps.ts"
s=p.read_text(encoding="utf-8")
marker="""  {id:'t1-wall-back',kind:'low_wall',x:.705,y:.835,w:.120,h:.020,solid:true,blocksProjectiles:true,material:'brick'}
];"""
replacement="""  {id:'t1-wall-back',kind:'low_wall',x:.705,y:.835,w:.120,h:.020,solid:true,blocksProjectiles:true,material:'brick'},
  // 0.9.4 storytelling: decorative/non-solid life around the occupied pockets.
  {id:'t1-market-crates',kind:'crate_stack',x:.208,y:.398,w:.032,h:.026,solid:false,blocksProjectiles:false,material:'mixed'},
  {id:'t1-entry-planter',kind:'planter',x:.070,y:.360,w:.034,h:.027,solid:false,blocksProjectiles:false,material:'vegetation'},
  {id:'t1-workshop-pallets-b',kind:'pallets',x:.165,y:.690,w:.044,h:.027,solid:false,blocksProjectiles:false,material:'mixed'},
  {id:'t1-back-bench',kind:'bench',x:.790,y:.780,w:.050,h:.016,solid:false,blocksProjectiles:false,material:'mixed'}
];"""
if marker not in s: raise SystemExit('T1 props marker not found')
p.write_text(s.replace(marker,replacement,1),encoding='utf-8')

# Give the T1 shop the mercadinho architecture language and restore control graffiti to the real entry wall.
p=root/"src/components/canvas/purposefulPropsRenderer.ts"
s=p.read_text(encoding='utf-8')
s=s.replace("if(p.kind==='stall') return territoryId===2?'Box da Feira':'Barraquinha';",
"if(p.kind==='stall') return territoryId===2?'Box da Feira':territoryId===1&&p.label==='MERCEARIA'?'Mercadinho de Esquina':'Barraquinha';",1)
s=s.replace("if(controlTag&&p.id==='t1-wall-a'){","if(controlTag&&p.id==='t1-entry-wall'){",1)
old="""const usesTerritoryControlAccent = (territoryId:number,p:PurposeProp) =>
  (territoryId===4 && (p.kind==='watch_post'||p.kind==='barricade')) ||"""
new="""const usesTerritoryControlAccent = (territoryId:number,p:PurposeProp) =>
  (territoryId===1 && p.id==='t1-entry-wall') ||
  (territoryId===4 && (p.kind==='watch_post'||p.kind==='barricade')) ||"""
if old not in s: raise SystemExit('control accent block not found')
s=s.replace(old,new,1)
# Enrich T1 prop grounding by prop function, without adding collision.
old="""  if(territoryId===1){
    ctx.fillStyle='rgba(63,55,45,.13)';ctx.beginPath();ctx.ellipse(cx,cy+r.h*.45,r.w*.72+8,r.h*.55+5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(74,95,56,.34)';ctx.lineWidth=1;for(const dx of [-r.w*.42,r.w*.48]){ctx.beginPath();ctx.moveTo(cx+dx,cy+r.h*.55);ctx.lineTo(cx+dx-3,cy+r.h*.28);ctx.stroke();}
  } else if(territoryId===2){"""
new="""  if(territoryId===1){
    ctx.fillStyle='rgba(63,55,45,.13)';ctx.beginPath();ctx.ellipse(cx,cy+r.h*.45,r.w*.72+8,r.h*.55+5,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(74,95,56,.34)';ctx.lineWidth=1;for(const dx of [-r.w*.42,r.w*.48]){ctx.beginPath();ctx.moveTo(cx+dx,cy+r.h*.55);ctx.lineTo(cx+dx-3,cy+r.h*.28);ctx.stroke();}
    if(p.kind==='parked_car'){
      ctx.fillStyle='rgba(2,6,12,.36)';ctx.beginPath();ctx.ellipse(cx,cy+r.h*.64,r.w*.34,Math.max(3,r.h*.16),-.08,0,Math.PI*2);ctx.fill();
    } else if(p.kind==='stall'){
      ctx.fillStyle='rgba(166,111,48,.11)';ctx.beginPath();ctx.ellipse(cx,cy+r.h*.66,r.w*.72+12,r.h*.38+5,0,0,Math.PI*2);ctx.fill();
    } else if(p.kind==='pallets'||p.kind==='crate_stack'){
      ctx.fillStyle='rgba(126,88,49,.16)';for(const [dx,dy] of [[-8,4],[7,7],[13,1]] as const){ctx.beginPath();ctx.arc(cx+dx,cy+dy,1.5,0,Math.PI*2);ctx.fill();}
    } else if(p.kind==='planter'){
      ctx.fillStyle='rgba(54,103,69,.22)';for(const dx of [-8,0,9]){ctx.beginPath();ctx.arc(cx+dx,cy-r.h*.20,3.2,0,Math.PI*2);ctx.fill();}
    }
  } else if(territoryId===2){"""
if old not in s: raise SystemExit('T1 prop context block not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Focus the authored lamp map on market/workshop/strongpoint instead of uniform brightness.
p=root/"src/data/territoryScenes.ts"
s=p.read_text(encoding='utf-8')
s=s.replace("{x:.17,y:.20,warmth:'warm',intensity:.82},{x:.31,y:.37,warmth:'warm',intensity:.78},", "{x:.17,y:.20,warmth:'warm',intensity:.58},{x:.31,y:.37,warmth:'warm',intensity:.94},",1)
s=s.replace("{x:.68,y:.28,warmth:'warm',intensity:.84},{x:.83,y:.51,warmth:'warm',intensity:.76},", "{x:.68,y:.28,warmth:'warm',intensity:.68},{x:.83,y:.51,warmth:'warm',intensity:.58},",1)
s=s.replace("{x:.30,y:.72,warmth:'warm',intensity:.70},{x:.67,y:.76,warmth:'warm',intensity:.86}", "{x:.30,y:.72,warmth:'warm',intensity:.88},{x:.67,y:.76,warmth:'warm',intensity:.78}",1)
p.write_text(s,encoding='utf-8')
# Add a cinematic but restrained local-light story to T1.
p=root/"src/components/canvas/environmentRenderer.ts"
s=p.read_text(encoding='utf-8')
marker="const drawPeripheryMicroDetails = ("
light_fn=r"""const drawPeripheryLightStory = (ctx:CanvasRenderingContext2D,width:number,height:number) => {
  ctx.save();
  ctx.globalCompositeOperation='screen';
  const pools=[
    [.178,.405,112,.15], // mercadinho / miolo quente
    [.175,.755,96,.12],  // oficina de fundo
    [.735,.805,82,.095], // esconderijo / fundo direito
    [.115,.315,70,.075], // entrada do beco
    [.810,.395,68,.065]  // comércio/controle leste
  ] as const;
  for(const [x,y,r,a] of pools){
    const px=width*x,py=height*y;
    const g=ctx.createRadialGradient(px,py,2,px,py,r);
    g.addColorStop(0,`rgba(255,208,104,${a})`);
    g.addColorStop(.32,`rgba(245,158,11,${a*.52})`);
    g.addColorStop(1,'rgba(245,158,11,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();
  }
  // Door/shop spill pools are directional so buildings feel occupied, not globally tinted.
  ctx.fillStyle='rgba(255,190,72,.055)';
  ctx.beginPath();ctx.moveTo(width*.145,height*.405);ctx.lineTo(width*.245,height*.435);ctx.lineTo(width*.220,height*.505);ctx.lineTo(width*.125,height*.458);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,176,66,.040)';
  ctx.beginPath();ctx.moveTo(width*.115,height*.725);ctx.lineTo(width*.235,height*.705);ctx.lineTo(width*.255,height*.785);ctx.lineTo(width*.105,height*.800);ctx.closePath();ctx.fill();
  ctx.restore();
};

"""
if marker not in s: raise SystemExit('micro details marker not found')
s=s.replace(marker,light_fn+marker,1)

# Add tiny workshop / market-life silhouettes to the existing authored micro-detail pass.
marker2="""  ctx.fillStyle=colorWithAlpha(controlColor,.30);ctx.fillRect(width*.095,height*.315,72,3);"""
story=r"""  // Storytelling clusters: workshop tyres, gas bottles and a hand-cart shape stay decorative.
  ctx.strokeStyle='rgba(8,12,16,.82)';ctx.lineWidth=3;
  for(const [x,y,r] of [[.125,.718,6],[.139,.724,5],[.151,.716,5]] as const){ctx.beginPath();ctx.arc(width*x,height*y,r,0,Math.PI*2);ctx.stroke();}
  for(const [x,y,c] of [[.218,.417,'#a23f2b'],[.237,.420,'#4f6574'],[.705,.810,'#8a4b31']] as const){
    const px=width*x,py=height*y;ctx.fillStyle=c;ctx.fillRect(px-3,py-7,6,10);ctx.fillStyle='rgba(226,232,240,.32)';ctx.fillRect(px-2,py-9,4,2);
  }
  ctx.strokeStyle='rgba(116,88,60,.72)';ctx.lineWidth=2;ctx.strokeRect(width*.232,height*.735,22,11);ctx.beginPath();ctx.moveTo(width*.232+22,height*.739);ctx.lineTo(width*.232+31,height*.729);ctx.stroke();
  ctx.fillStyle='rgba(15,23,42,.86)';for(const dx of [4,18]){ctx.beginPath();ctx.arc(width*.232+dx,height*.735+13,3,0,Math.PI*2);ctx.fill();}

  ctx.fillStyle=colorWithAlpha(controlColor,.30);ctx.fillRect(width*.095,height*.315,72,3);"""
if marker2 not in s: raise SystemExit('entry identity marker not found')
s=s.replace(marker2,story,1)

call_marker="""  for (const lamp of scene.lamps) {
    drawWarmLamp(ctx, lamp.x * width, lamp.y * height, lamp.intensity);
  }

  drawOverheadWires(ctx, width, height);"""
call_new="""  for (const lamp of scene.lamps) {
    drawWarmLamp(ctx, lamp.x * width, lamp.y * height, lamp.intensity);
  }
  drawPeripheryLightStory(ctx,width,height);

  drawOverheadWires(ctx, width, height);"""
if call_marker not in s: raise SystemExit('lamp call marker not found')
s=s.replace(call_marker,call_new,1)
p.write_text(s,encoding='utf-8')
print('t1-094-props-light-patch-ok')