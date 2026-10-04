from pathlib import Path
import re
ROOT=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental')
def read(rel): return (ROOT/rel).read_text(encoding='utf-8')
def write(rel,s): (ROOT/rel).write_text(s,encoding='utf-8')
def sub_once(pattern,repl,s,flags=re.S):
    out,n=re.subn(pattern,repl,s,count=1,flags=flags)
    if n!=1: raise RuntimeError(f'expected 1 replacement, got {n}: {pattern[:60]}')
    return out

sc=read('src/data/territoryScenes.ts')
t1_scene=r'''  1: {
    id: 1,
    codename: 'beco-dos-descalcos',
    subtitle: 'Becos apertados, lajes, comércio e oficinas da periferia',
    accent: '#d97706',
    paths: [
      { surface: 'asphalt', width: 104, edge: true, points: [
        {x:.50,y:1.04},{x:.48,y:.84},{x:.51,y:.67},{x:.47,y:.50},{x:.50,y:.32},{x:.53,y:.14},{x:.50,y:-.04}
      ]},
      { surface: 'alley', width: 36, edge: true, points: [
        {x:.22,y:1.02},{x:.23,y:.83},{x:.20,y:.68},{x:.26,y:.54},{x:.22,y:.39},{x:.26,y:.23},{x:.22,y:-.02}
      ]},
      { surface: 'alley', width: 36, edge: true, points: [
        {x:.78,y:1.02},{x:.75,y:.84},{x:.80,y:.68},{x:.74,y:.52},{x:.80,y:.38},{x:.75,y:.21},{x:.80,y:-.02}
      ]},
      { surface:'concrete', width:24, edge:true, points:[{x:.22,y:.35},{x:.36,y:.38},{x:.48,y:.36}] },
      { surface:'concrete', width:24, edge:true, points:[{x:.51,y:.66},{x:.64,y:.64},{x:.78,y:.68}] },
      { surface:'concrete', width:20, points:[{x:.20,y:.69},{x:.34,y:.62},{x:.47,y:.58}] }
    ],
    plaza:{x:.36,y:.43,w:.20,h:.16},
    mural:{x:.12,y:.30,w:.16,h:.022},
    lamps:[
      {x:.17,y:.20,warmth:'warm',intensity:.82},{x:.31,y:.37,warmth:'warm',intensity:.78},
      {x:.68,y:.28,warmth:'warm',intensity:.84},{x:.83,y:.51,warmth:'warm',intensity:.76},
      {x:.30,y:.72,warmth:'warm',intensity:.70},{x:.67,y:.76,warmth:'warm',intensity:.86}
    ],
    lots:[]
  },
'''
sc=sub_once(r"  1: \{.*?\n  \},\n  2: \{",t1_scene+'  2: {',sc)
write('src/data/territoryScenes.ts',sc)
pp=read('src/data/territoryPurposeProps.ts')
t1_props=r'''const T1: PurposeProp[] = [
  {id:'t1-entry-wall',kind:'low_wall',x:.095,y:.305,w:.105,h:.020,solid:true,blocksProjectiles:true,material:'brick'},
  {id:'t1-mercearia',kind:'stall',x:.145,y:.365,w:.060,h:.060,solid:true,blocksProjectiles:true,occludes:true,material:'mixed',label:'MERCEARIA'},
  {id:'t1-barricade-center',kind:'barricade',x:.455,y:.575,w:.090,h:.020,solid:true,blocksProjectiles:true,material:'metal',accent:'#92400e'},
  {id:'t1-officina-pallets',kind:'pallets',x:.115,y:.735,w:.060,h:.040,solid:true,blocksProjectiles:true,material:'mixed'},
  {id:'t1-officina-crates',kind:'crate_stack',x:.205,y:.765,w:.045,h:.040,solid:true,blocksProjectiles:true,occludes:true,material:'mixed'},
  {id:'t1-dumpster',kind:'dumpster',x:.875,y:.585,w:.044,h:.032,solid:true,blocksProjectiles:true,material:'metal'},
  {id:'t1-bench',kind:'bench',x:.365,y:.675,w:.060,h:.018,solid:true,blocksProjectiles:false,material:'mixed'},
  {id:'t1-service',kind:'service_unit',x:.705,y:.245,w:.040,h:.034,solid:true,blocksProjectiles:true,occludes:true,material:'metal',label:'REDE'},
  {id:'t1-car',kind:'parked_car',x:.615,y:.705,w:.080,h:.038,solid:true,blocksProjectiles:true,material:'metal',accent:'#374151'},
  {id:'t1-planter',kind:'planter',x:.825,y:.315,w:.055,h:.038,solid:true,blocksProjectiles:true,material:'vegetation'},
  {id:'t1-wall-back',kind:'low_wall',x:.705,y:.835,w:.120,h:.020,solid:true,blocksProjectiles:true,material:'brick'}
];'''
pp=sub_once(r"const T1: PurposeProp\[\] = \[.*?\n\];\nconst T2:",t1_props+'\nconst T2:',pp)
write('src/data/territoryPurposeProps.ts',pp)

bio=read('src/data/territoryBiomes.ts')
t1_biome=r'''  1: {
    id:1,codename:'beco-dos-descalcos',
    baseTop:'#171716',baseMid:'#211f1d',baseBottom:'#141515',
    dust:'#9a7b56',dirt:'#62462f',concrete:'#55585a',edge:'#978b7a',
    crack:'#0d1013',damp:'#102026',vegetation:'#2f563f',accent:'#d97706',
    noiseDensity:1.10,crackDensity:1.15,seamDensity:.65,wetness:.62,
    patches:[
      {kind:'dirt',x:.01,y:.08,w:.24,h:.28,rotation:-.05,alpha:.72},
      {kind:'concrete',x:.30,y:.34,w:.34,h:.29,rotation:.01,alpha:.72},
      {kind:'grass',x:.78,y:.07,w:.18,h:.20,rotation:.05,alpha:.56},
      {kind:'mud',x:.48,y:.62,w:.20,h:.25,rotation:-.08,alpha:.64},
      {kind:'pavers',x:.04,y:.67,w:.24,h:.27,rotation:.01,alpha:.66},
      {kind:'dirt',x:.72,y:.68,w:.25,h:.25,rotation:.04,alpha:.68}
    ]
  },'''
bio=sub_once(r"  1: \{.*?\n  \},\n  2: \{",t1_biome+'\n  2: {',bio)
write('src/data/territoryBiomes.ts',bio)
uc=read('src/components/canvas/unifiedTerritoryComposer.ts')
t1_district=r'''  if(territoryId===1){
    [
      ['ul1',.075,.075,.060,.072],['ul2',.145,.070,.055,.082],['ul3',.210,.090,.052,.068],['ul4',.273,.082,.050,.078],
      ['ur1',.610,.070,.056,.078],['ur2',.676,.084,.052,.070],['ur3',.738,.072,.054,.082],['ur4',.802,.096,.048,.066],
      ['ml1',.055,.315,.060,.074],['ml2',.125,.335,.055,.082],['ml3',.190,.445,.058,.075],['ml4',.255,.520,.052,.070],
      ['mr1',.735,.320,.056,.078],['mr2',.803,.355,.052,.072],['mr3',.715,.500,.060,.080],['mr4',.825,.535,.050,.070],
      ['ll1',.105,.760,.060,.078],['ll2',.175,.785,.055,.072],['ll3',.240,.815,.052,.075],['ll4',.300,.755,.050,.068],
      ['lr1',.635,.765,.058,.078],['lr2',.703,.795,.052,.072],['lr3',.765,.755,.056,.080],['lr4',.830,.805,.048,.068]
    ].forEach((a,i)=>n(a[0] as string,a[1] as number,a[2] as number,a[3] as number,a[4] as number,'building',i%5===0?'metal':i%3===0?'concrete':'brick'));
  } else if(territoryId===4){'''
uc=sub_once(r"  if\(territoryId===1\)\{.*?\n  \} else if\(territoryId===4\)\{",t1_district,uc)
uc=uc.replace("? [[.165,.060,.190,.125],[.585,.060,.180,.125],[.205,.765,.145,.125],[.585,.750,.155,.130]]",
              "? [[.045,.050,.300,.145],[.590,.050,.300,.145],[.035,.285,.290,.305],[.685,.285,.285,.315],[.075,.735,.300,.205],[.605,.735,.300,.205]]")
write('src/components/canvas/unifiedTerritoryComposer.ts',uc)

bs=read('src/components/canvas/buildingSkins.ts')
bs=bs.replace("const heroHeight = b.type === 'laje' ? 30 : 24;","const heroHeight = b.type === 'laje' ? 34 : 28;")
bs=bs.replace("  const doorX = sideDoor ? b.x + b.w - 18 : b.x + 8;\n\n  ctx.save();",
'''  const doorX = sideDoor ? b.x + b.w - 18 : b.x + 8;
  const buildingHash=[...b.id].reduce((a,c)=>a+c.charCodeAt(0),0);
  const roofVariant=buildingHash%4;

  ctx.save();''')
needle="  ctx.globalAlpha = 1;\n\n  if (b.type === 'zinc') {"
insert=r'''  ctx.globalAlpha = 1;

  // T1 redesign: parapets, service volumes and asymmetric roof silhouettes.
  if (b.w >= 44 && b.h >= 28) {
    const boxW=Math.max(18,Math.min(32,b.w*.30)), boxH=Math.max(12,Math.min(20,b.h*.28));
    const boxX=roofVariant%2===0?b.x+8:b.x+b.w-boxW-9;
    const boxY=roofY+8+(roofVariant===3?5:0);
    ctx.fillStyle='rgba(0,0,0,.30)';ctx.fillRect(boxX+4,boxY+5,boxW,boxH);
    ctx.fillStyle=b.type==='brick'?'#6b4938':'#66665f';ctx.fillRect(boxX,boxY,boxW,boxH);
    ctx.fillStyle='rgba(226,232,240,.12)';ctx.fillRect(boxX+2,boxY+2,boxW-4,2);
    ctx.strokeStyle='rgba(15,23,42,.45)';ctx.strokeRect(boxX,boxY,boxW,boxH);
  }
  ctx.strokeStyle='rgba(203,213,225,.20)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(b.x-2,roofY-2);ctx.lineTo(b.x+b.w+2,roofY-2);ctx.stroke();
  if(options.contextual && b.w>=46){
    const aw=18+(roofVariant%3)*5, ax=sideDoor?b.x+b.w-aw-5:b.x+5;
    ctx.fillStyle=roofVariant%2?'#7c5b3d':'#5f5042';ctx.fillRect(ax,facadeY+7,aw,5);
    ctx.strokeStyle='rgba(245,158,11,.20)';ctx.beginPath();ctx.moveTo(ax,facadeY+12);ctx.lineTo(ax+aw,facadeY+12);ctx.stroke();
  }

  if (b.type === 'zinc') {'''
if needle not in bs: raise RuntimeError('building roof insertion point not found')
bs=bs.replace(needle,insert,1)
write('src/components/canvas/buildingSkins.ts',bs)
env=read('src/components/canvas/environmentRenderer.ts')
new_micro=r'''const drawPeripheryMicroDetails = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  controlColor: string,
  controlTag: string
) => {
  // Canaleta aberta acompanha a via principal e reforça o caráter periférico.
  ctx.strokeStyle='rgba(4,10,18,.86)';ctx.lineWidth=7;
  ctx.beginPath();ctx.moveTo(width*.565,height);ctx.bezierCurveTo(width*.54,height*.76,width*.575,height*.47,width*.555,0);ctx.stroke();
  ctx.strokeStyle='rgba(100,116,139,.22)';ctx.lineWidth=1;ctx.stroke();

  // Postes e transformadores: pontos fixos que organizam a leitura do bairro.
  for(const [x,y,t] of [[.14,.22,1],[.31,.40,0],[.69,.30,1],[.84,.54,0],[.29,.74,0],[.70,.78,1]] as const){
    const px=width*x,py=height*y;ctx.strokeStyle='#535a5f';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(px,py+24);ctx.lineTo(px,py-28);ctx.stroke();
    ctx.fillStyle='#2b3136';ctx.fillRect(px-5,py-31,10,6);
    if(t){ctx.fillStyle='#60666a';ctx.fillRect(px-9,py-19,18,10);ctx.strokeStyle='#9aa0a4';ctx.strokeRect(px-9,py-19,18,10);}
    ctx.fillStyle='#f3d486';ctx.fillRect(px-2,py-34,4,3);
  }

  // Muros baixos, degraus e remendos junto às casas: detalhe visual, sem virar collider fantasma.
  ctx.fillStyle='rgba(111,87,66,.48)';
  for(const [x,y,w] of [[.055,.295,.11],[.80,.405,.12],[.08,.675,.10],[.72,.865,.12]] as const){
    ctx.fillRect(width*x,height*y,width*w,5);ctx.fillStyle='rgba(203,213,225,.08)';ctx.fillRect(width*x,height*y,width*w,1);ctx.fillStyle='rgba(111,87,66,.48)';
  }
  ctx.fillStyle='rgba(71,85,105,.28)';
  for(const [x,y] of [[.18,.47],[.79,.63],[.33,.83]] as const){for(let i=0;i<3;i++)ctx.fillRect(width*x+i*8,height*y+i*3,22-i*5,3);}

  // Pequenos sinais de uso: sacos, latas e vegetação espontânea nas bordas.
  for(const [x,y] of [[.10,.60],[.86,.70],[.19,.88],[.91,.32]] as const){
    ctx.fillStyle='rgba(40,54,45,.64)';ctx.beginPath();ctx.arc(width*x,height*y,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(139,116,82,.55)';ctx.fillRect(width*x+5,height*y+3,5,4);
  }
  ctx.fillStyle=colorWithAlpha(controlColor,.30);ctx.fillRect(width*.105,height*.315,34,3);
  ctx.fillStyle='rgba(226,232,240,.16)';ctx.font='700 7px "Chakra Petch",sans-serif';ctx.fillText(controlTag,width*.106,height*.311);
};'''
env=sub_once(r"const drawPeripheryMicroDetails = \(.*?\n\};\nconst drawOverheadWires",new_micro+'\nconst drawOverheadWires',env)

new_wires=r'''const drawOverheadWires = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.save();
  ctx.strokeStyle='rgba(8,13,18,.68)';ctx.lineWidth=1.25;
  const wires=[
    [.14,.19,.32,.26,.69,.27],[.31,.37,.52,.42,.84,.51],[.14,.20,.18,.46,.29,.71],
    [.69,.28,.77,.48,.70,.75],[.29,.72,.48,.67,.70,.76],[.18,.46,.45,.48,.79,.62]
  ];
  for(const [x1,y1,cx,cy,x2,y2] of wires){ctx.beginPath();ctx.moveTo(width*x1,height*y1);ctx.quadraticCurveTo(width*cx,height*cy,width*x2,height*y2);ctx.stroke();}
  ctx.strokeStyle='rgba(226,232,240,.10)';ctx.lineWidth=.7;
  for(const [x,y] of [[.14,.19],[.31,.37],[.69,.27],[.84,.51],[.29,.71],[.70,.75]] as const){ctx.beginPath();ctx.arc(width*x,height*y,3,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
};'''
env=sub_once(r"const drawOverheadWires = .*?\n\};\n\nconst drawGroundWear",new_wires+'\n\nconst drawGroundWear',env)
write('src/components/canvas/environmentRenderer.ts',env)
print('T1 FULL REDESIGN PATCH READY')
