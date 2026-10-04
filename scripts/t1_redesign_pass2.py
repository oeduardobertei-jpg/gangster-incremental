from pathlib import Path
import re
ROOT=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental')
def read(rel): return (ROOT/rel).read_text(encoding='utf-8')
def write(rel,s): (ROOT/rel).write_text(s,encoding='utf-8')
def sub_once(pattern,repl,s,flags=re.S):
    out,n=re.subn(pattern,repl,s,count=1,flags=flags)
    if n!=1: raise RuntimeError(f'expected 1 replacement, got {n}: {pattern[:50]}')
    return out

env=read('src/components/canvas/environmentRenderer.ts')
new_path=r'''const drawScenePath = (
  ctx: CanvasRenderingContext2D,
  path: ScenePath,
  width: number,
  height: number
) => {
  const isAsphalt=path.surface==='asphalt', isAlley=path.surface==='alley';
  const material=isAsphalt?WORLD_MATERIALS.asphalt:WORLD_MATERIALS.concrete;
  const base=isAlley?'#393a39':material.base;
  const edge=isAlley?'#74685b':(isAsphalt?'#7a7569':material.edge);
  linePath(ctx,path,width,height);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=isAlley?'rgba(5,7,8,.44)':'rgba(0,0,0,.30)';
  ctx.lineWidth=path.width+(isAlley?7:9);ctx.stroke();
  linePath(ctx,path,width,height);ctx.strokeStyle=base;ctx.lineWidth=path.width;ctx.stroke();
  if(path.edge){
    linePath(ctx,path,width,height);ctx.strokeStyle=edge;ctx.globalAlpha=isAlley?.24:.32;
    ctx.lineWidth=path.width+(isAlley?4:5);ctx.stroke();
    linePath(ctx,path,width,height);ctx.strokeStyle=base;ctx.globalAlpha=1;ctx.lineWidth=path.width;ctx.stroke();
  }
  if(isAsphalt){
    linePath(ctx,path,width,height);ctx.setLineDash([17,19]);ctx.strokeStyle='rgba(250,204,21,.30)';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
  }
  if(isAlley){
    linePath(ctx,path,width,height);ctx.strokeStyle='rgba(226,232,240,.055)';ctx.lineWidth=1;ctx.stroke();
  }
};'''
env=sub_once(r"const drawScenePath = \(.*?\n\};\n\nconst drawScenePathWear",new_path+'\n\nconst drawScenePathWear',env)
write('src/components/canvas/environmentRenderer.ts',env)
env=read('src/components/canvas/environmentRenderer.ts')
old_t1_texture=r'''  if(territoryId===1){
    ctx.strokeStyle='rgba(148,163,184,.18)';
    for(const [x,y] of [[.14,.29],[.62,.24],[.22,.67],[.73,.54]] as const){
      ctx.strokeRect(width*x,height*y,28,16);ctx.beginPath();ctx.moveTo(width*x+4,height*y+8);ctx.lineTo(width*x+24,height*y+8);ctx.stroke();
    }
    ctx.fillStyle='rgba(2,6,23,.42)';for(const [x,y] of [[.52,.22],[.57,.67],[.36,.52]] as const){for(let i=0;i<5;i++)ctx.fillRect(width*x+i*5,height*y,2,11);}
  } else if(territoryId===2){'''
new_t1_texture=r'''  if(territoryId===1){
    // Tampas, grelhas e remendos concentrados perto das rotas reais.
    ctx.strokeStyle='rgba(148,163,184,.14)';ctx.lineWidth=1;
    for(const [x,y] of [[.30,.38],[.69,.29],[.27,.72],[.82,.54]] as const){
      ctx.strokeRect(width*x,height*y,24,13);ctx.beginPath();ctx.moveTo(width*x+4,height*y+6);ctx.lineTo(width*x+20,height*y+6);ctx.stroke();
    }
    ctx.fillStyle='rgba(2,6,23,.48)';
    for(const [x,y] of [[.55,.24],[.53,.69],[.47,.48]] as const){for(let i=0;i<4;i++)ctx.fillRect(width*x+i*5,height*y,2,10);}
    ctx.strokeStyle='rgba(120,113,108,.22)';
    for(const [x,y] of [[.18,.58],[.76,.73]] as const){ctx.beginPath();ctx.arc(width*x,height*y,8,0,Math.PI*2);ctx.stroke();}
  } else if(territoryId===2){'''
if old_t1_texture not in env: raise RuntimeError('t1 purposeful texture block not found')
env=env.replace(old_t1_texture,new_t1_texture,1)
write('src/components/canvas/environmentRenderer.ts',env)

g=read('src/components/canvas/groundRenderer.ts')
new_story=r'''  if (territoryId === 1) {
    // Solo do Beco dos Descalços: drenagem, bordas de lote e vegetação espontânea.
    ctx.strokeStyle='rgba(103,78,57,.34)';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(width*.03,height*.60);ctx.bezierCurveTo(width*.18,height*.55,width*.31,height*.61,width*.44,height*.56);ctx.stroke();
    ctx.strokeStyle='rgba(14,26,31,.82)';ctx.lineWidth=6;
    ctx.beginPath();ctx.moveTo(width*.56,height);ctx.bezierCurveTo(width*.54,height*.73,width*.575,height*.42,width*.555,0);ctx.stroke();
    ctx.strokeStyle='rgba(128,140,142,.24)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='rgba(45,85,62,.34)';
    for(const [x,y,r] of [[.055,.18,15],[.12,.54,9],[.88,.20,14],[.91,.70,13],[.72,.88,8]] as const){ctx.beginPath();ctx.arc(width*x,height*y,r,0,Math.PI*2);ctx.fill();}
  } else if (territoryId === 2) {'''
g=sub_once(r"  if \(territoryId === 1\) \{.*?\n  \} else if \(territoryId === 2\) \{",new_story,g)
write('src/components/canvas/groundRenderer.ts',g)
g=read('src/components/canvas/groundRenderer.ts')
new_overlay=r'''  if (territoryId === 1) {
    ctx.fillStyle='rgba(3,7,12,.32)';ctx.strokeStyle='rgba(120,113,108,.16)';
    for(const [x,y,rx,ry] of [[.41,.76,17,6],[.56,.47,11,4],[.50,.27,9,4],[.30,.58,10,4],[.73,.69,13,5]] as const){
      ctx.beginPath();ctx.ellipse(width*x,height*y,rx,ry,(x-y)*.55,0,Math.PI*2);ctx.fill();ctx.stroke();
    }
    // Pequenos remendos de concreto e caixas de inspeção alinhados aos becos.
    ctx.strokeStyle='rgba(151,141,125,.13)';ctx.lineWidth=1;
    for(const [x,y,w,h] of [[.22,.33,24,15],[.75,.36,26,15],[.24,.72,29,17],[.78,.70,26,16]] as const){
      ctx.strokeRect(width*x,height*y,w,h);ctx.beginPath();ctx.moveTo(width*x+3,height*y+h*.5);ctx.lineTo(width*x+w-3,height*y+h*.5);ctx.stroke();
    }
    ctx.fillStyle='rgba(139,116,82,.17)';
    for(const [x,y] of [[.15,.64],[.84,.45],[.12,.84],[.88,.81]] as const){ctx.fillRect(width*x,height*y,18,5);}
  } else if (territoryId === 2) {'''
g=sub_once(r"  if \(territoryId === 1\) \{.*?\n  \} else if \(territoryId === 2\) \{",new_overlay,g)
write('src/components/canvas/groundRenderer.ts',g)

uc=read('src/components/canvas/unifiedTerritoryComposer.ts')
old=r'''  for(let i=0;i<ordered.length-1;i+=2){
    const a=ordered[i],b=ordered[i+1],ax=a.x+a.w/2,ay=a.y+a.h+12,bx=b.x+b.w/2,by=b.y+b.h+12;
    if(Math.hypot(bx-ax,by-ay)>360) continue;
    line(ctx,ax+4,ay+5,bx+4,by+5,'rgba(0,0,0,.18)',territoryId<=4?11:9);
    line(ctx,ax,ay,bx,by,surface,territoryId<=4?8:6);
  }'''
new=r'''  for(let i=0;i<ordered.length-1;i+=2){
    const a=ordered[i],b=ordered[i+1],ax=a.x+a.w/2,ay=a.y+a.h+12,bx=b.x+b.w/2,by=b.y+b.h+12;
    const distance=Math.hypot(bx-ax,by-ay), limit=territoryId===1?220:360;
    if(distance>limit) continue;
    const shadowW=territoryId===1?7:(territoryId<=4?11:9), surfaceW=territoryId===1?4:(territoryId<=4?8:6);
    line(ctx,ax+3,ay+4,bx+3,by+4,'rgba(0,0,0,.16)',shadowW);
    line(ctx,ax,ay,bx,by,surface,surfaceW);
  }'''
if old not in uc: raise RuntimeError('connectPairs block not found')
uc=uc.replace(old,new,1)
write('src/components/canvas/unifiedTerritoryComposer.ts',uc)
bs=read('src/components/canvas/buildingSkins.ts')
facade_needle="  // Telhado com beiral e volume.\n"
facade_insert=r'''  // T1 redesign: fachadas contextuais ganham marquise/balcão/estrutura sem virar clones.
  if(options.contextual && b.w>=46){
    if(roofVariant===0||roofVariant===2){
      const by=facadeY+visualHeight-11;
      ctx.fillStyle='rgba(15,23,42,.46)';ctx.fillRect(b.x+5,by,b.w-10,3);
      ctx.strokeStyle='rgba(203,213,225,.22)';ctx.lineWidth=1;
      for(let xx=b.x+8;xx<b.x+b.w-8;xx+=10){ctx.beginPath();ctx.moveTo(xx,by-5);ctx.lineTo(xx,by+3);ctx.stroke();}
    }else{
      const aw=Math.max(22,b.w*.42), ax=sideDoor?b.x+b.w-aw:b.x;
      ctx.fillStyle=b.type==='brick'?'#7f4b31':'#6d6559';ctx.fillRect(ax,facadeY+5,aw,6);
      ctx.fillStyle='rgba(245,158,11,.16)';ctx.fillRect(ax,facadeY+10,aw,2);
    }
  }

'''
if facade_needle not in bs: raise RuntimeError('facade insertion point not found')
bs=bs.replace(facade_needle,facade_insert+facade_needle,1)
write('src/components/canvas/buildingSkins.ts',bs)
print('T1 REDESIGN PASS2 READY')
