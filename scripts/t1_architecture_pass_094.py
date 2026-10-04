from pathlib import Path
import re

root = Path(r"C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental")

# Context roles: turn generic support blocks into readable neighborhood archetypes.
p = root / "src/components/canvas/unifiedTerritoryComposer.ts"
s = p.read_text(encoding="utf-8")
old = """  if(territoryId===1){
    if(p.material==='metal') return 'Esconderijo';
    if(!compact&&p.material==='concrete') return 'Laje do Ponto';
    return index%2?'Beco 01':'Boca da Leste';
  }"""
new = """  if(territoryId===1){
    if(p.material==='metal') return index%3===0?'Oficina de Fundo':'Puxadinho de Zinco';
    if(!compact&&p.material==='concrete'){
      const roles=['Laje Residencial','Casa de Esquina','Sobrado da Viela'];
      return roles[index%roles.length];
    }
    const brickRoles=['Moradia Geminada','Casa com Varanda','Mercadinho de Esquina','Sobrado de Tijolo'];
    return brickRoles[index%brickRoles.length];
  }"""
if old not in s:
    raise SystemExit("context role block not found")
p.write_text(s.replace(old, new, 1), encoding="utf-8")

# Role-specific finish pass for T1 contextual architecture.
p = root / "src/components/canvas/contextArchitectureFinishRenderer.ts"
s = p.read_text(encoding="utf-8")
replacement = r"""const finishT1=(a:Args)=>{
  const {ctx,b,roofY,facadeY,height,renderZoom,controlColor}=a,n=norm(a.role);  const hash=[...b.id].reduce((acc,c)=>acc+c.charCodeAt(0),0), right=hash%2===0;
  const px=right?b.x+b.w-7:b.x+7;
  rect(ctx,b.x+4,facadeY+height-5,b.w-8,3,'rgba(38,29,24,.42)');
  line(ctx,b.x+5,roofY+b.h-3,b.x+b.w-5,roofY+b.h-3,'rgba(226,232,240,.20)');
  line(ctx,px,facadeY+4,px,facadeY+height-4,'#5b6470',1.6);
  if(renderZoom>=.92) meter(ctx,right?px-11:px+3,facadeY+height-15,controlColor);

  // 0.9.4 Architecture Pass: every context building gets a readable urban function.
  if(n.includes('oficina')){
    const x=b.x+7,y=facadeY+6,w=b.w-14,h=Math.max(12,height-8);
    rect(ctx,x,y,w,h,'#28323a','#59636d');
    for(let yy=y+4;yy<y+h;yy+=5) line(ctx,x+1,yy,x+w-1,yy,'rgba(203,213,225,.18)');
    ctx.fillStyle='#f4b44b';ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(b.x+b.w-10,facadeY+5,2.7,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    rect(ctx,b.x+4,roofY+6,b.w*.34,5,'#59636d','#8a949e');
  } else if(n.includes('puxadinho')){
    ctx.beginPath();ctx.moveTo(b.x-4,roofY+5);ctx.lineTo(b.x+b.w*.55,roofY-5);ctx.lineTo(b.x+b.w+5,roofY+3);ctx.lineTo(b.x+b.w+2,roofY+10);ctx.lineTo(b.x-3,roofY+11);ctx.closePath();
    ctx.fillStyle='#5d666b';ctx.fill();ctx.strokeStyle='#8e979c';ctx.stroke();
    for(let xx=b.x+4;xx<b.x+b.w;xx+=8) line(ctx,xx,roofY+4,xx+2,roofY+10,'rgba(226,232,240,.17)');
    rect(ctx,b.x+8,facadeY+7,b.w-16,height-9,'rgba(58,47,40,.55)');
  } else if(n.includes('mercadinho')){
    const aw=b.w-10, ax=b.x+5, ay=facadeY+3, sw=aw/6;
    for(let i=0;i<6;i++) rect(ctx,ax+i*sw,ay,sw,7,i%2?'#e7d8b5':'#b75b3d');
    rect(ctx,b.x+8,facadeY+12,b.w-16,8,'#2a211c','#6b5142');
    if(renderZoom>=.9){ctx.fillStyle='#f6e6c8';ctx.font='700 5px "Plus Jakarta Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('MERCADO',b.x+b.w/2,facadeY+16);}
  } else if(n.includes('laje')||n.includes('sobrado')){
    line(ctx,b.x+7,roofY+7,b.x+b.w-7,roofY+7,'#8d969f',1.2);
    line(ctx,b.x+7,roofY+15,b.x+b.w-7,roofY+15,'#68727a',1);    for(let xx=b.x+7;xx<=b.x+b.w-7;xx+=10) line(ctx,xx,roofY+7,xx,roofY+15,'rgba(203,213,225,.36)',.8);
    const sx=right?b.x+b.w-8:b.x+8;
    for(let i=0;i<4;i++){const ww=9+i*3;rect(ctx,right?sx-ww:sx,facadeY+height-5-i*4,ww,3,'#697178');}
    if(n.includes('laje')) rect(ctx,right?b.x+8:b.x+b.w-26,roofY+18,18,5,'#58636b','#88939b');
  } else if(n.includes('varanda')){
    rect(ctx,b.x+7,facadeY+6,b.w-14,4,'#5e5044');
    line(ctx,b.x+7,facadeY+10,b.x+b.w-7,facadeY+10,'#8c9499',1);
    for(let xx=b.x+8;xx<b.x+b.w-7;xx+=10) line(ctx,xx,facadeY+4,xx,facadeY+10,'rgba(203,213,225,.32)',.8);
  } else {
    ctx.fillStyle=hash%3===0?'rgba(128,67,49,.20)':hash%3===1?'rgba(57,102,96,.18)':'rgba(158,124,70,.18)';
    ctx.fillRect(b.x+4,facadeY+4,b.w*.47,height-10);
    for(const wx of [b.x+10,b.x+b.w-22]){
      rect(ctx,wx,facadeY+8,11,7,'#1e3442','#77838d');
      for(let gx=wx+3;gx<wx+11;gx+=4) line(ctx,gx,facadeY+9,gx,facadeY+14,'rgba(226,232,240,.35)',.7);
    }
  }
  if(b.w>=48) line(ctx,b.x+8,roofY+3,b.x+b.w-9,roofY+3,'rgba(107,114,128,.48)',1.1);
};"""
s2, nsub = re.subn(r"const finishT1=\(a:Args\)=>\{.*?\n\};\nconst finishT2=", replacement + "\nconst finishT2=", s, count=1, flags=re.S)
if nsub != 1:
    raise SystemExit(f"finishT1 replace failed: {nsub}")
p.write_text(s2, encoding="utf-8")

# Hero buildings: stronger role-specific palette and extra silhouette details.
p = root / "src/components/canvas/cariocaIdentityRenderer.ts"
s = p.read_text(encoding="utf-8")
old = "const {ctx,b,roofY,facadeY,height,controlColor}=a;const tone=buildingTone(b);\n  patchFacade(ctx,b,facadeY,height,tone);"
new = """const {ctx,b,roofY,facadeY,height,controlColor}=a;
  const heroTones:Record<string,string>={
    beco_01:'#a45f49',laje_ponto:'#648985',barraquinha:'#a47b43',esconderijo:'#655c55',
    boca_leste:'#9b5c43',torre_guarda:'#5c6770',mirante:'#687b67'
  };
  const tone=heroTones[b.id]??buildingTone(b);
  patchFacade(ctx,b,facadeY,height,tone);"""
if old not in s:
    raise SystemExit("hero tone block not found")
s = s.replace(old, new, 1)
s = s.replace("rebar(ctx,b.x+12,roofY-15,3);", "rebar(ctx,b.x+12,roofY-15,3);\n    rect(ctx,b.x+5,facadeY+height-7,b.w*.34,4,'#6f3e31');", 1)
s = s.replace("rebar(ctx,b.x+16,roofY+2,3);", "rebar(ctx,b.x+16,roofY+2,3);\n    terracePlants(ctx,b.x+8,roofY+b.h-8,b.w*.34);", 1)
s = s.replace("rect(ctx,b.x+11,facadeY+height-12,b.w*.46,6,'#111827',controlColor);", "rect(ctx,b.x+11,facadeY+height-12,b.w*.46,6,'#111827',controlColor);\n    rect(ctx,b.x+b.w*.57,facadeY+5,b.w*.28,6,'#70492e','#c39259');", 1)
s = s.replace("rect(ctx,b.x-8,facadeY+8,18,height-8,'#5b493d','#7d6a5b');", "rect(ctx,b.x-8,facadeY+8,18,height-8,'#5b493d','#7d6a5b');\n    for(let yy=facadeY+10;yy<facadeY+height-4;yy+=5) line(ctx,b.x-6,yy,b.x+7,yy,'rgba(203,213,225,.15)',.7);", 1)
s = s.replace("line(ctx,b.x+b.w-14,roofY+5,b.x+b.w-14,roofY-18,controlColor,1.4);", "line(ctx,b.x+b.w-14,roofY+5,b.x+b.w-14,roofY-18,controlColor,1.4);\n    rect(ctx,b.x+b.w*.58,facadeY+height-13,b.w*.28,9,'#2c211c','#6f4a38');", 1)
p.write_text(s, encoding="utf-8")

# Context surfaces get richer faded paint; finish layer uses same height as the building skin.
p = root / "src/components/canvas/buildingSkins.ts"
s = p.read_text(encoding="utf-8")
old = "const faded=['rgba(116,83,58,.18)','rgba(64,94,83,.15)','rgba(74,87,105,.15)','rgba(135,103,62,.14)'][roofVariant];"
if old not in s:
    raise SystemExit("faded block not found")
s = s.replace(old, "const faded=['rgba(155,79,52,.26)','rgba(63,105,100,.22)','rgba(176,139,70,.20)','rgba(81,100,122,.22)'][roofVariant];", 1)
old = "const visualHeight=territoryId===1?(type==='laje'?30:24):territoryId===6?34:territoryId===3?28:25;"
if old not in s:
    raise SystemExit("visualHeight block not found")
s = s.replace(old, "const visualHeight=territoryId===1?(type==='laje'?34:28):territoryId===6?34:territoryId===3?28:25;", 1)
p.write_text(s, encoding="utf-8")

print("t1-094-architecture-patch-ok")