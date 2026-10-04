from pathlib import Path
import re

root=Path(r"C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental")

# Narrow, dark secondary connectors: they should read as alleys, not clean sidewalks.
p=root/"src/data/territoryScenes.ts"
s=p.read_text(encoding="utf-8")
s=s.replace("{ surface:'concrete', width:19, edge:true, points:[{x:.22,y:.35},{x:.36,y:.38},{x:.48,y:.36}] }", "{ surface:'alley', width:17, edge:true, points:[{x:.22,y:.35},{x:.36,y:.38},{x:.48,y:.36}] }",1)
s=s.replace("{ surface:'concrete', width:19, edge:true, points:[{x:.51,y:.66},{x:.64,y:.64},{x:.78,y:.68}] }", "{ surface:'alley', width:17, edge:true, points:[{x:.51,y:.66},{x:.64,y:.64},{x:.78,y:.68}] }",1)
s=s.replace("{ surface:'concrete', width:17, points:[{x:.20,y:.69},{x:.34,y:.62},{x:.47,y:.58}] }", "{ surface:'alley', width:15, points:[{x:.20,y:.69},{x:.34,y:.62},{x:.47,y:.58}] }",1)
p.write_text(s,encoding="utf-8")

p=root/"src/components/canvas/environmentRenderer.ts"
s=p.read_text(encoding="utf-8")

# Replace generic alley wear with dirt seams, cracks and patched edges.
old="""      if (path.surface === 'asphalt') {
        // 0.8C: wear reads as repaired asphalt/oil, not random floating scratches.
        ctx.fillStyle = 'rgba(4,8,12,.15)';
        ctx.beginPath(); ctx.ellipse(0, 0, 10 + (seed % 8), 3 + slot * 2, .08, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle='rgba(71,85,105,.07)';ctx.fillRect(-7,-1,14,2);
      } else {
        ctx.strokeStyle = 'rgba(15,23,42,.18)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-12,-5); ctx.lineTo(12,-5); ctx.moveTo(-12,5); ctx.lineTo(12,5); ctx.stroke();
      }"""
new="""      if (path.surface === 'asphalt') {
        // Repaired asphalt and oil wear stay concentrated on the main road.
        ctx.fillStyle = 'rgba(4,8,12,.15)';
        ctx.beginPath(); ctx.ellipse(0, 0, 10 + (seed % 8), 3 + slot * 2, .08, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle='rgba(71,85,105,.07)';ctx.fillRect(-7,-1,14,2);
      } else if(path.surface === 'alley') {
        ctx.fillStyle='rgba(92,70,48,.16)';ctx.beginPath();ctx.ellipse(-7,4,10+(seed%5),2.5+slot,.12,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(20,25,28,.30)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(-9,-3);ctx.lineTo(-2,0);ctx.lineTo(5,-2);ctx.lineTo(11,2);ctx.stroke();
        ctx.fillStyle='rgba(110,125,91,.13)';ctx.fillRect(8,-path.width*.32,4,2);
      } else {
        ctx.strokeStyle = 'rgba(15,23,42,.18)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-12,-5); ctx.lineTo(12,-5); ctx.moveTo(-12,5); ctx.lineTo(12,5); ctx.stroke();
      }"""
if old not in s: raise SystemExit('path wear block not found')
s=s.replace(old,new,1)
# Replace schematic T1 floor marks with curb fragments, drains and settlement wear.
old="""  if(territoryId===1){
    ctx.strokeStyle='rgba(148,163,184,.20)';ctx.lineWidth=2;
    for(const [x,y,w] of [[.12,.51,.13],[.60,.61,.16],[.38,.80,.10]] as const){
      ctx.beginPath();ctx.moveTo(width*x,height*y);ctx.lineTo(width*(x+w),height*y);ctx.stroke();
    }
    ctx.fillStyle='rgba(148,163,184,.16)';
    for(const [x,y] of [[.20,.37],[.69,.34],[.72,.74]] as const){
      for(let i=0;i<4;i++)ctx.fillRect(width*x+i*6,height*y,3,11);
    }
    ctx.fillStyle='rgba(226,232,240,.22)';ctx.font='700 8px \"Chakra Petch\",sans-serif';
    
  } else if(territoryId===2){"""
new="""  if(territoryId===1){
    // Short curb remnants follow occupied pockets instead of reading like editor guides.
    ctx.strokeStyle='rgba(121,112,99,.24)';ctx.lineWidth=3;
    for(const [x1,y1,x2,y2] of [[.10,.52,.19,.515],[.63,.61,.74,.625],[.37,.81,.45,.80],[.77,.42,.86,.43]] as const){
      ctx.beginPath();ctx.moveTo(width*x1,height*y1);ctx.quadraticCurveTo(width*((x1+x2)/2),height*((y1+y2)/2+.008),width*x2,height*y2);ctx.stroke();
    }
    // Drainage grates are small physical details near route edges.
    ctx.fillStyle='rgba(18,24,29,.58)';
    for(const [x,y] of [[.205,.37],[.695,.345],[.72,.742]] as const){
      for(let i=0;i<4;i++)ctx.fillRect(width*x+i*5,height*y,2,9);
    }
    // Crumbled edge patches give the side lanes a built-over, repaired feel.
    ctx.fillStyle='rgba(105,84,60,.16)';
    for(const [x,y,rx,ry] of [[.18,.57,18,5],[.75,.70,15,4],[.31,.33,13,4],[.82,.31,12,4]] as const){ctx.beginPath();ctx.ellipse(width*x,height*y,rx,ry,.12,0,Math.PI*2);ctx.fill();}
  } else if(territoryId===2){"""
if old not in s: raise SystemExit('district ground story block not found')
s=s.replace(old,new,1)

# Give alleys a subtle warm-dirty shoulder instead of the previous clean concrete feel.
old="""  if(isAlley){
    linePath(ctx,path,width,height);ctx.strokeStyle='rgba(226,232,240,.055)';ctx.lineWidth=1;ctx.stroke();
  }"""
new="""  if(isAlley){
    linePath(ctx,path,width,height);ctx.strokeStyle='rgba(226,232,240,.045)';ctx.lineWidth=1;ctx.stroke();
    linePath(ctx,path,width,height);ctx.strokeStyle='rgba(120,94,65,.08)';ctx.lineWidth=Math.max(1,path.width-7);ctx.stroke();
  }"""
if old not in s: raise SystemExit('alley finish block not found')
s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print('t1-094-ground-routes-patch-ok')