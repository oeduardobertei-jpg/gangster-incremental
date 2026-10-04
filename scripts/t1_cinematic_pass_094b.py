from pathlib import Path
root=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental')

def patch(rel, old, new, count=1):
    p=root/rel
    s=p.read_text(encoding='utf-8')
    if old not in s:
        raise SystemExit(f'marker not found: {rel}: {old[:80]}')
    s=s.replace(old,new,count)
    p.write_text(s,encoding='utf-8')

# 1) Atmosphere: align practical lights with the authored T1 lamp network.
patch('src/components/canvas/atmosphereRenderer.ts',
"  1: [[.12,.20,'#f59e0b',82],[.72,.76,'#f59e0b',72]],",
"  1: [[.17,.20,'#f59e0b',88],[.31,.37,'#f59e0b',72],[.68,.28,'#f59e0b',80],[.83,.51,'#fb923c',74],[.30,.72,'#f59e0b',68],[.67,.76,'#fb923c',86]],")

patch('src/components/canvas/atmosphereRenderer.ts',
"  ctx.fillStyle = scaleRgbaAlpha(profile.streetTint, .30);\n  ctx.fillRect(0, 0, width, height);",
"  ctx.fillStyle = scaleRgbaAlpha(profile.streetTint, .30);\n  ctx.fillRect(0, 0, width, height);\n  if (territoryId === 1) {\n    const night=ctx.createLinearGradient(0,0,width,height);\n    night.addColorStop(0,'rgba(28,45,61,.035)');\n    night.addColorStop(.52,'rgba(8,15,24,.012)');\n    night.addColorStop(1,'rgba(4,9,15,.065)');\n    ctx.fillStyle=night;ctx.fillRect(0,0,width,height);\n  }")
patch('src/components/canvas/atmosphereRenderer.ts',
"  ctx.fillStyle = `rgba(0,0,0,${.045 + profile.shadowStrength * .055})`;",
"  ctx.fillStyle = `rgba(0,0,0,${territoryId===1 ? .070 + profile.shadowStrength*.070 : .045 + profile.shadowStrength*.055})`;" )
patch('src/components/canvas/atmosphereRenderer.ts',
"    radialLight(ctx, width * nx, height * ny, radius, resolved, .035 + profile.hazeAmount * .025);",
"    const lightAlpha=territoryId===1 ? .050 + profile.hazeAmount*.024 : .035 + profile.hazeAmount*.025;\n    radialLight(ctx, width * nx, height * ny, radius, resolved, lightAlpha);" )

# 2) Static polish: pools of warm light + cool shadow pockets follow occupied T1 zones.
old="""const drawT1 = (ctx:CanvasRenderingContext2D,w:number,h:number,control:string) => {
  for(const [x,y,r] of [[.12,.20,78],[.37,.50,62],[.72,.76,72]] as const) glow(ctx,w*x,h*y,r,'#f59e0b',.075);"""
new="""const drawT1 = (ctx:CanvasRenderingContext2D,w:number,h:number,control:string) => {
  for(const [x,y,r,a] of [[.17,.20,86,.080],[.31,.37,68,.060],[.68,.28,76,.064],[.83,.51,70,.058],[.30,.72,64,.052],[.67,.76,82,.072]] as const) glow(ctx,w*x,h*y,r,'#f59e0b',a);
  for(const [x,y,rx,ry,a] of [[.08,.44,135,155,.065],[.91,.43,130,160,.070],[.18,.88,120,78,.055]] as const){
    const g=ctx.createRadialGradient(w*x,h*y,6,w*x,h*y,Math.max(rx,ry));
    g.addColorStop(0,`rgba(7,16,25,${a})`);g.addColorStop(1,'rgba(7,16,25,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(w*x,h*y,rx,ry,0,0,Math.PI*2);ctx.fill();
  }"""
patch('src/components/canvas/polishRenderer.ts',old,new)
patch('src/components/canvas/polishRenderer.ts',
"""  if(territoryId===1){
    ctx.fillStyle=`rgba(251,191,36,${.025*pulse})`;ctx.beginPath();ctx.arc(w*.12,h*.20,18,0,Math.PI*2);ctx.fill();
  } else if(territoryId===2){""",
"""  if(territoryId===1){
    for(const [x,y,r] of [[.17,.20,18],[.31,.37,14],[.68,.28,15],[.83,.51,14],[.30,.72,13],[.67,.76,17]] as const){
      ctx.fillStyle=`rgba(251,191,36,${.018+.018*pulse})`;ctx.beginPath();ctx.arc(w*x,h*y,r,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle=`rgba(245,158,11,${.018*pulse})`;
    ctx.beginPath();ctx.moveTo(w*.135,h*.39);ctx.lineTo(w*.205,h*.39);ctx.lineTo(w*.225,h*.47);ctx.lineTo(w*.115,h*.47);ctx.closePath();ctx.fill();
    ctx.fillStyle=`rgba(56,189,248,${.010+.008*pulse})`;ctx.fillRect(w*.44,0,w*.12,h);
  } else if(territoryId===2){""")

# 3) Per-building cinematic practicals and roof rim.
old="""  for (let i = 0; i < windowXs.length; i++) {
    const wx = windowXs[i];
    if (Math.abs(wx - doorX) < 16) continue;
    const lit = Math.sin(time * .0018 + b.x * .03 + i * 2.1) > -.55;
    ctx.fillStyle = lit ? '#f5d77f' : '#142332';
    ctx.fillRect(wx, facadeY + 7, WORLD_SCALE.windowWidth, WORLD_SCALE.windowHeight);
    ctx.strokeStyle = '#243241'; ctx.strokeRect(wx, facadeY + 7, WORLD_SCALE.windowWidth, WORLD_SCALE.windowHeight);
  }
"""
new=old+"""  if(detailLod && buildingHash%3===0){
    const lx=sideDoor?doorX-6:doorX+WORLD_SCALE.doorWidth+6, ly=facadeY+9;
    const flicker=.88+.12*Math.sin(time*.006+buildingHash);
    const lg=ctx.createRadialGradient(lx,ly,1,lx,ly,23);
    lg.addColorStop(0,`rgba(253,230,138,${.18*flicker})`);lg.addColorStop(1,'rgba(245,158,11,0)');
    ctx.fillStyle=lg;ctx.beginPath();ctx.arc(lx,ly,23,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#66523a';ctx.fillRect(lx-4,ly-4,8,3);ctx.fillStyle='#fde68a';ctx.fillRect(lx-2,ly-3,4,3);
  }
"""
patch('src/components/canvas/buildingSkins.ts',old,new)
patch('src/components/canvas/buildingSkins.ts',
"  ctx.strokeStyle='rgba(203,213,225,.20)';ctx.lineWidth=2;",
"  ctx.strokeStyle=roofVariant%2===0?'rgba(186,230,253,.22)':'rgba(203,213,225,.16)';ctx.lineWidth=2;")

# 4) Replace rectangular T1 building aprons with irregular contact shapes.
old="""    const pad=territoryId===5?8:territoryId===6?7:5;
    ctx.fillStyle='rgba(0,0,0,.18)';
    ctx.fillRect(b.x-pad+4,b.y-pad+5,b.w+pad*2,b.h+pad*2);
    ctx.fillStyle=apron.fill;
    ctx.fillRect(b.x-pad,b.y-pad,b.w+pad*2,b.h+pad*2);
    ctx.strokeStyle=apron.edge;ctx.lineWidth=1;
    ctx.strokeRect(b.x-pad,b.y-pad,b.w+pad*2,b.h+pad*2);
    drawEntryPath(ctx,b,territoryId,controlColor);"""
new="""    const pad=territoryId===5?8:territoryId===6?7:5;
    if(territoryId===1){
      const j=([...b.id].reduce((a,c)=>a+c.charCodeAt(0),0)%7)-3;
      const x=b.x-pad,y=b.y-pad,w=b.w+pad*2,h=b.h+pad*2;
      ctx.beginPath();ctx.moveTo(x+3,y+j*.35);ctx.lineTo(x+w-4,y+2);ctx.lineTo(x+w+1,y+h-5);
      ctx.lineTo(x+w-8,y+h+1);ctx.lineTo(x+5,y+h-1);ctx.lineTo(x-1,y+6);ctx.closePath();
      ctx.fillStyle='rgba(0,0,0,.20)';ctx.save();ctx.translate(4,5);ctx.fill();ctx.restore();
      ctx.fillStyle=apron.fill;ctx.fill();ctx.strokeStyle='rgba(148,135,116,.12)';ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle='rgba(15,23,42,.18)';ctx.beginPath();ctx.ellipse(b.x+b.w*.58,b.y+b.h+5,Math.max(12,b.w*.30),4,.05,0,Math.PI*2);ctx.fill();
    }else{
      ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(b.x-pad+4,b.y-pad+5,b.w+pad*2,b.h+pad*2);
      ctx.fillStyle=apron.fill;ctx.fillRect(b.x-pad,b.y-pad,b.w+pad*2,b.h+pad*2);
      ctx.strokeStyle=apron.edge;ctx.lineWidth=1;ctx.strokeRect(b.x-pad,b.y-pad,b.w+pad*2,b.h+pad*2);
    }
    drawEntryPath(ctx,b,territoryId,controlColor);"""
patch('src/components/canvas/architectureDepthRenderer.ts',old,new)
# 5) Utility poles/wires: clearer engineering, less heavy black scribble.
patch('src/components/canvas/environmentRenderer.ts',
"""    ctx.beginPath();ctx.moveTo(px,py+24);ctx.lineTo(px,py-28);ctx.stroke();
    ctx.fillStyle='#2b3136';ctx.fillRect(px-5,py-31,10,6);""",
"""    ctx.beginPath();ctx.moveTo(px,py+24);ctx.lineTo(px,py-28);ctx.stroke();
    ctx.strokeStyle='#697177';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px-9,py-23);ctx.lineTo(px+9,py-23);ctx.stroke();
    ctx.fillStyle='#a8a29e';ctx.fillRect(px-8,py-25,3,3);ctx.fillRect(px+5,py-25,3,3);
    ctx.fillStyle='#2b3136';ctx.fillRect(px-5,py-31,10,6);""")
patch('src/components/canvas/environmentRenderer.ts',
"  ctx.strokeStyle='rgba(8,13,18,.68)';ctx.lineWidth=1.25;",
"  ctx.strokeStyle='rgba(8,13,18,.56)';ctx.lineWidth=1.15;")
patch('src/components/canvas/environmentRenderer.ts',
"""  for(const [x1,y1,cx,cy,x2,y2] of wires){ctx.beginPath();ctx.moveTo(width*x1,height*y1);ctx.quadraticCurveTo(width*cx,height*cy,width*x2,height*y2);ctx.stroke();}
  ctx.strokeStyle='rgba(226,232,240,.10)';ctx.lineWidth=.7;""",
"""  for(const [x1,y1,cx,cy,x2,y2] of wires){ctx.beginPath();ctx.moveTo(width*x1,height*y1);ctx.quadraticCurveTo(width*cx,height*cy,width*x2,height*y2);ctx.stroke();}
  ctx.strokeStyle='rgba(20,28,35,.36)';ctx.lineWidth=.7;
  for(const [x,y,len] of [[.31,.37,.085],[.69,.28,.070],[.29,.71,.060]] as const){
    ctx.beginPath();ctx.moveTo(width*x,height*y);ctx.quadraticCurveTo(width*(x+.015),height*(y+len*.55),width*(x+.005),height*(y+len));ctx.stroke();
  }
  ctx.strokeStyle='rgba(226,232,240,.10)';ctx.lineWidth=.7;""")
print('t1-094B-cinematic-patch-ok')
