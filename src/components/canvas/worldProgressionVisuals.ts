import type { FactionConfig, GameState } from '../../types/game';
import { WORLD_MATERIALS } from '../../data/visualTokens';
import { getBaseCommandVisualProfile, type BaseCommandVisualProfile } from '../../rules/baseCommandVisualProgression';
import { getStageFeatureProgress } from '../../rules/incrementalBuildingVisuals';

const drawBarricade = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  color: string
) => {
  ctx.fillStyle = '#3f4650';
  ctx.fillRect(x, y, w, 7);
  ctx.fillStyle = color;
  for (let i = 0; i < Math.floor(w / 15); i++) {
    ctx.fillRect(x + 4 + i * 15, y + 1, 8, 2);
  }
  ctx.strokeStyle = '#798391';
  ctx.strokeRect(x, y, w, 7);
};

const drawCrate = (ctx: CanvasRenderingContext2D, x: number, y: number, accent: string) => {
  ctx.fillStyle = '#5c4327';
  ctx.fillRect(x, y, 16, 12);
  ctx.strokeStyle = '#a17a45';
  ctx.strokeRect(x, y, 16, 12);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = .7;
  ctx.beginPath(); ctx.moveTo(x+3,y+6); ctx.lineTo(x+13,y+6); ctx.stroke();
  ctx.globalAlpha = 1;
};

const COMMAND_MATERIALS: Record<number,{body:string;inner:string;slab:string;pier:string;wing:string;stepDark:string;step:string;sign:string;door:string;window:string}> = {
  1:{body:'#2d2925',inner:'#41372f',slab:'#4b443b',pier:'#5a4f43',wing:'#322d28',stepDark:'#5f5549',step:'#817362',sign:'#25211e',door:'#262d2f',window:'#182027'},
  2:{body:'#34302a',inner:'#4a4034',slab:'#504a40',pier:'#655747',wing:'#3a332c',stepDark:'#715f49',step:'#90775b',sign:'#2b251f',door:'#273033',window:'#172127'},
  3:{body:'#242a2f',inner:'#343d43',slab:'#47525a',pier:'#58636b',wing:'#2d343a',stepDark:'#565e62',step:'#737d82',sign:'#1e252a',door:'#252d32',window:'#11191f'},
  4:{body:'#2d2a27',inner:'#3b3530',slab:'#49443f',pier:'#59524c',wing:'#332f2b',stepDark:'#5d554d',step:'#776d63',sign:'#24211f',door:'#292e2f',window:'#171d20'},
  5:{body:'#77736c',inner:'#8c867d',slab:'#a29c92',pier:'#8e887f',wing:'#6d6861',stepDark:'#837d74',step:'#a7a095',sign:'#4f4b46',door:'#566064',window:'#18343c'},
  6:{body:'#1d2328',inner:'#293139',slab:'#3c454d',pier:'#4e5962',wing:'#252c32',stepDark:'#46515a',step:'#5e6b75',sign:'#151a1f',door:'#20282f',window:'#0d1419'}
};

const drawBike = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.arc(x+14, y, 4, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x+2,y-1); ctx.lineTo(x+7,y-8); ctx.lineTo(x+12,y-1); ctx.lineTo(x+5,y-1); ctx.stroke();
};

export function drawCommandBaseProgression(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  faction: FactionConfig,
  state: GameState,
  time: number,
  territoryId = 1,
  renderZoom = 1,
  visualOverride?: BaseCommandVisualProfile,
  stageCelebration = 0
) {
  const visual = visualOverride ?? getBaseCommandVisualProfile(state);
  const { stage, stageProgress, maturity, tiers, hegemonyHonors } = visual;
  const fortTier = tiers.fortification;
  const barricadeTier = tiers.barricades;
  const riflemenTier = tiers.riflemen;
  const ammoTier = tiers.ammoLogistics;
  const vestTier = tiers.vest;
  const heavyTier = tiers.heavyCalibers;
  const medicTier = tiers.medics;
  const motoTier = tiers.motorcycles;
  const radioTier = tiers.radioNetwork;
  const centralTier = tiers.centralCommand;
  const autoTier = tiers.autoRecruit;
  const doubleTier = tiers.doubleReinforcements;
  const label = 'Base de Comando';
  const mat = COMMAND_MATERIALS[territoryId] ?? COMMAND_MATERIALS[1];
  const pulse = .96 + Math.sin(time * .003) * .04;
  const wideLod = renderZoom < .92;
  const closeLod = renderZoom >= 1.65;
  const outlineW = wideLod ? Math.min(2.2, 1.7 / Math.max(.72, renderZoom)) : 1.2;
  const microAlpha = wideLod ? .42 : closeLod ? 1 : .78;
  // 0.9.10M: macro growth is continuous inside each unlocked stage.
  const stageGroundExpand = maturity * 5;
  const stageLight = .11 + maturity * .027;
  const stageSignWidth = 78 + maturity * 10;
  const stageCanopyHalf = 45 + maturity * 8;
  const stageCanopyTopHalf = 40 + maturity * 6.5;
  const slabGrow = Math.min(9, maturity * 2.4);
  const pierProgress = getStageFeatureProgress(stage, stageProgress, 1, .35);
  const wingProgress = getStageFeatureProgress(stage, stageProgress, 2, .25);
  const crownProgress = getStageFeatureProgress(stage, stageProgress, 3, .25);
  const honorMarks = Math.min(5, hegemonyHonors);

  const warmGlow = (gx:number,gy:number,r:number,a:number) => {
    const g=ctx.createRadialGradient(gx,gy,1,gx,gy,r);
    g.addColorStop(0,`rgba(255,220,138,${a})`);
    g.addColorStop(.42,`rgba(245,158,11,${a*.45})`);
    g.addColorStop(1,'rgba(245,158,11,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,r,0,Math.PI*2);ctx.fill();
  };
  const sandbagLine=(sx:number,sy:number,count:number,step=13)=>{
    for(let i=0;i<count;i++){
      const ox=sx+i*step, oy=sy-(i%2)*2;
      ctx.fillStyle=i%2===0?'#8b7a5e':'#75674f';
      ctx.beginPath();ctx.roundRect(ox,oy,12,7,3);ctx.fill();
      ctx.strokeStyle='rgba(44,39,31,.65)';ctx.lineWidth=.8;ctx.stroke();
      ctx.strokeStyle='rgba(221,203,164,.16)';ctx.beginPath();ctx.moveTo(ox+2,oy+2);ctx.lineTo(ox+10,oy+2);ctx.stroke();
    }
  };
  const drawGabionWing=(gx:number,gy:number,w:number,h:number,flip=false,detail=true)=>{
    const fill=territoryId===6?'#38434b':territoryId===5?'#77736c':'#62584b';
    ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(gx,gy,w,h,3);ctx.fill();
    ctx.strokeStyle='rgba(197,188,169,.38)';ctx.lineWidth=detail?.9:1.3;ctx.stroke();
    ctx.fillStyle='rgba(22,27,28,.20)';ctx.fillRect(gx+2,gy+2,w-4,3);
    if(detail){
      ctx.strokeStyle='rgba(180,190,187,.20)';ctx.lineWidth=.55;
      for(let xx=gx+5;xx<gx+w-3;xx+=7){ctx.beginPath();ctx.moveTo(xx,gy+3);ctx.lineTo(xx+(flip?-4:4),gy+h-2);ctx.stroke();}
      for(let yy=gy+6;yy<gy+h-2;yy+=5){ctx.beginPath();ctx.moveTo(gx+2,yy);ctx.lineTo(gx+w-2,yy);ctx.stroke();}
    }
  };

  ctx.save();
  if(stageCelebration>0){
    const travel=1-stageCelebration;
    warmGlow(x,y-25,48+travel*22,.10+stageCelebration*.10);
    ctx.save();ctx.globalAlpha=Math.min(.72,stageCelebration*.68);
    ctx.strokeStyle=faction.color;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,y+1,46+travel*36,12+travel*10,0,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#e8d5a8';
    for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2+travel*.8;const r=25+travel*42;ctx.beginPath();ctx.arc(x+Math.cos(a)*r,y-23+Math.sin(a)*r*.34,1.1+stageCelebration*.8,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  // 0.9.10G: spatial integration follows the real recruit spawn axis around y-10.
  const groundPalette:Record<number,[string,string,string]>={
    1:['rgba(79,67,55,.34)','rgba(111,91,69,.22)','rgba(245,177,92,.065)'],
    2:['rgba(75,66,51,.32)','rgba(126,104,67,.20)','rgba(250,190,88,.055)'],
    3:['rgba(49,56,60,.34)','rgba(92,105,111,.20)','rgba(216,139,73,.050)'],
    4:['rgba(59,52,46,.35)','rgba(102,88,76,.20)','rgba(230,164,92,.045)'],
    5:['rgba(112,108,98,.27)','rgba(155,147,128,.16)','rgba(247,202,128,.045)'],
    6:['rgba(35,43,50,.36)','rgba(76,91,102,.19)','rgba(148,196,211,.045)']
  };
  const [groundBase,groundWear,groundLight]=groundPalette[territoryId]??groundPalette[1];
  ctx.fillStyle='rgba(0,0,0,.36)';
  ctx.beginPath();ctx.ellipse(x,y+3,82+stageGroundExpand+fortTier*2,20+stage+fortTier*.7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=groundBase;ctx.beginPath();
  ctx.moveTo(x-82,y-18);ctx.lineTo(x-68,y-25);ctx.lineTo(x+66,y-25);ctx.lineTo(x+84,y-16);
  ctx.lineTo(x+78,y+11);ctx.lineTo(x+47,y+17);ctx.lineTo(x-49,y+17);ctx.lineTo(x-80,y+10);ctx.closePath();ctx.fill();
  ctx.fillStyle=groundWear;ctx.beginPath();
  ctx.moveTo(x-19,y-13);ctx.lineTo(x+19,y-13);ctx.lineTo(x+27,y+18);ctx.lineTo(x-29,y+18);ctx.closePath();ctx.fill();
  const floorGlow=ctx.createLinearGradient(x,y-15,x,y+19);
  floorGlow.addColorStop(0,groundLight);floorGlow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=floorGlow;ctx.beginPath();ctx.ellipse(x,y+1,43,18,0,0,Math.PI*2);ctx.fill();
  if(!wideLod){
    ctx.strokeStyle='rgba(33,39,40,.22)';ctx.lineWidth=1;
    for(const dx of [-60,60]){ctx.beginPath();ctx.moveTo(x+dx-12,y+9);ctx.lineTo(x+dx+12,y+11);ctx.stroke();}
    ctx.strokeStyle='rgba(199,180,145,.10)';ctx.beginPath();ctx.moveTo(x-27,y+16);ctx.lineTo(x+27,y+16);ctx.stroke();
  }

  // 0.9.10J: low gabion/retaining wings read as architecture instead of loose sacks.
  const wingH=9+maturity*2+(fortTier>=4?5:fortTier>=2?3:0);
  const wingW=34+maturity*3;
  drawGabionWing(x-43-wingW,y-wingH+3,wingW,wingH,false,!wideLod);
  drawGabionWing(x+43,y-wingH+3,wingW,wingH,true,!wideLod);
  if(!wideLod){
    ctx.strokeStyle='rgba(160,172,174,.42)';ctx.lineWidth=1;
    for(const [x1,x2] of [[x-80,x-48],[x+48,x+80]] as const){
      ctx.beginPath();ctx.moveTo(x1,y+4);ctx.lineTo(x2,y+4);ctx.stroke();
      for(const px of [x1,x2]){ctx.beginPath();ctx.moveTo(px,y+4);ctx.lineTo(px,y-4);ctx.stroke();}
    }
  }

  // 0.9.10P: the macro shell itself grows with maturity; spawn center/bottom stay fixed.
  const bodyW=92+maturity*14;
  const bodyH=38+maturity*5;
  const bodyX=x-bodyW/2, bodyY=y-10-bodyH;
  ctx.fillStyle=mat.body;ctx.beginPath();ctx.roundRect(bodyX,bodyY,bodyW,bodyH,4);ctx.fill();
  ctx.strokeStyle=wideLod?'rgba(222,210,190,.72)':'rgba(155,143,126,.55)';ctx.lineWidth=outlineW;ctx.stroke();
  ctx.fillStyle=mat.inner;ctx.fillRect(bodyX+4,bodyY+5,bodyW-8,bodyH-10);
  ctx.fillStyle='rgba(111,86,62,.22)';ctx.fillRect(bodyX+6,bodyY+8,bodyW*.28,bodyH-17);
  ctx.fillStyle='rgba(65,77,80,.18)';ctx.fillRect(bodyX+bodyW*.69,bodyY+8,bodyW*.25,bodyH-17);

  // Base de Comando v3: roof slab, facade piers and defensive side wings add real architectural mass.
  ctx.fillStyle=mat.slab;ctx.fillRect(bodyX+3-slabGrow,bodyY-5,bodyW-6+slabGrow*2,6);
  ctx.fillStyle='rgba(214,201,181,.14)';ctx.fillRect(bodyX+2,bodyY-5,bodyW-4,1.5);
  if(stage>=1) for(const px of [bodyX+8,bodyX+bodyW-14]){
    const ph=(bodyH-13)*pierProgress;
    ctx.fillStyle=mat.pier;ctx.fillRect(px,bodyY+bodyH-5-ph,8,ph);
    ctx.fillStyle='rgba(225,211,188,.10)';ctx.fillRect(px+1,bodyY+bodyH-6-ph,1.5,Math.max(0,ph-3));
  }
  if(stage>=1){
    const sw=4+4*pierProgress, sh=10+18*pierProgress;
    ctx.fillStyle=mat.pier;ctx.fillRect(bodyX-sw,bodyY+bodyH-sh,sw,sh);ctx.fillRect(bodyX+bodyW,bodyY+bodyH-sh,sw,sh);
    ctx.fillStyle='rgba(225,211,188,.10)';ctx.fillRect(bodyX-sw+1,bodyY+bodyH-sh+2,1,Math.max(2,sh-4));ctx.fillRect(bodyX+bodyW+sw-2,bodyY+bodyH-sh+2,1,Math.max(2,sh-4));
  }
  if(stage>=2){
    const ww=10+22*wingProgress, wh=10+24*wingProgress;
    ctx.fillStyle=mat.wing;ctx.fillRect(bodyX-ww,bodyY+bodyH-2-wh,ww,wh);
    ctx.fillStyle=mat.wing;ctx.fillRect(bodyX+bodyW,bodyY+bodyH-2-wh,ww,wh);
    ctx.strokeStyle='rgba(157,144,126,.34)';ctx.strokeRect(bodyX-ww,bodyY+bodyH-2-wh,ww,wh);ctx.strokeRect(bodyX+bodyW,bodyY+bodyH-2-wh,ww,wh);
  }
  if(stage>=1){ctx.fillStyle='#5b5043';ctx.fillRect(bodyX-8,y-13,bodyW+16,5);}
  if(stage>=2){ctx.fillStyle='rgba(205,188,161,.16)';ctx.fillRect(bodyX-5,y-12,bodyW+10,1);}
  if(stage>=3){
    const cw=bodyW+34*crownProgress;
    ctx.fillStyle=mat.slab;ctx.globalAlpha=.45+.55*crownProgress;ctx.fillRect(x-cw/2,bodyY-12,cw,3+crownProgress);
    ctx.fillStyle=mat.pier;const capH=3+4*crownProgress;ctx.fillRect(x-cw/2+4,bodyY-12-capH,7,capH);ctx.fillRect(x+cw/2-11,bodyY-12-capH,7,capH);
    ctx.globalAlpha=1;
  }
  ctx.fillStyle=faction.color;ctx.globalAlpha=.32;ctx.fillRect(bodyX+5,bodyY+2,24,2);ctx.fillRect(bodyX+bodyW-29,bodyY+2,24,2);ctx.globalAlpha=1;
  // 0.9.10F: a mesma Base de Comando se adapta materialmente ao território.
  if(!wideLod){
  if(territoryId===1){
    ctx.fillStyle='rgba(111,64,45,.18)';ctx.fillRect(bodyX+20,bodyY+12,22,14);
    ctx.strokeStyle='rgba(155,96,65,.24)';ctx.lineWidth=.7;for(let yy=bodyY+15;yy<bodyY+25;yy+=5){ctx.beginPath();ctx.moveTo(bodyX+20,yy);ctx.lineTo(bodyX+42,yy);ctx.stroke();}
  }else if(territoryId===3){
    ctx.strokeStyle='rgba(183,197,205,.15)';ctx.lineWidth=.8;for(let xx=bodyX+18;xx<bodyX+bodyW-12;xx+=22){ctx.beginPath();ctx.moveTo(xx,bodyY+8);ctx.lineTo(xx,bodyY+bodyH-7);ctx.stroke();}
  }else if(territoryId===5){
    ctx.fillStyle='rgba(232,230,221,.11)';ctx.fillRect(bodyX+7,bodyY+9,bodyW-14,3);
    ctx.strokeStyle='rgba(47,91,99,.20)';ctx.strokeRect(bodyX+9,bodyY+15,bodyW-18,bodyH-25);
  }else if(territoryId===6){
    ctx.strokeStyle='rgba(127,149,163,.17)';ctx.lineWidth=1;for(let yy=bodyY+13;yy<bodyY+bodyH-6;yy+=9){ctx.beginPath();ctx.moveTo(bodyX+6,yy);ctx.lineTo(bodyX+bodyW-6,yy);ctx.stroke();}
  }
  }
  // 0.9.10H: fortification evolves through architecture, not loose props.
  if(fortTier>=1){
    ctx.fillStyle='rgba(27,31,31,.34)';ctx.fillRect(bodyX-8,y-16,bodyW+16,4);
    ctx.strokeStyle='rgba(176,163,140,.18)';ctx.beginPath();ctx.moveTo(bodyX-6,y-16);ctx.lineTo(bodyX+bodyW+6,y-16);ctx.stroke();
  }
  if(fortTier>=2){
    for(const px of [bodyX+2,bodyX+bodyW-6]){ctx.fillStyle=mat.pier;ctx.fillRect(px,bodyY+4,5,bodyH-9);}
  }
  if(fortTier>=3){
    ctx.fillStyle=mat.slab;ctx.fillRect(bodyX-9,bodyY-9,bodyW+18,4);
    ctx.fillStyle=faction.color;ctx.globalAlpha=.22;ctx.fillRect(bodyX+16,bodyY-8,bodyW-32,1.5);ctx.globalAlpha=1;
  }
  if(fortTier>=5){
    for(const px of [bodyX-11,bodyX+bodyW+7]){ctx.fillStyle='#2d3234';ctx.fillRect(px,bodyY+9,5,bodyH-18);}
  }

  // Strong faction canopy / lintel.
  ctx.fillStyle=faction.color;ctx.globalAlpha=wideLod?.97:.84+stage*.035;
  ctx.beginPath();ctx.moveTo(x-stageCanopyHalf,bodyY+3);ctx.lineTo(x+stageCanopyHalf,bodyY+3);ctx.lineTo(x+stageCanopyTopHalf,bodyY-8);ctx.lineTo(x-stageCanopyTopHalf,bodyY-8);ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;
  ctx.strokeStyle=wideLod?'rgba(255,255,255,.38)':'rgba(255,255,255,.18)';ctx.lineWidth=wideLod?1.6:1;ctx.beginPath();ctx.moveTo(x-stageCanopyTopHalf,bodyY-7);ctx.lineTo(x+stageCanopyTopHalf,bodyY-7);ctx.stroke();

  // 0.9.10K/L: sign and frontage gain authority with the macro stage, not with raw scale.
  const signX=x-stageSignWidth/2;
  ctx.fillStyle=mat.sign;ctx.beginPath();ctx.roundRect(signX,bodyY-25,stageSignWidth,20,3);ctx.fill();
  ctx.fillStyle=faction.color;ctx.globalAlpha=.70+stage*.02;ctx.fillRect(signX+4,bodyY-22,stageSignWidth-8,3);ctx.globalAlpha=1;
  ctx.strokeStyle=wideLod?'rgba(245,232,208,.72)':'rgba(219,204,180,.42)';ctx.lineWidth=wideLod?1.8:1.2;ctx.strokeRect(signX,bodyY-25,stageSignWidth,20);
  ctx.fillStyle='#f4ead8';ctx.font=`800 ${wideLod?10.2:7.8+stage*.45}px \"Chakra Petch\", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(label,x,bodyY-13.5);
  if(hegemonyHonors>0){
    const plaqueX=bodyX+7,plaqueY=bodyY+7;
    ctx.fillStyle='#2a2620';ctx.fillRect(plaqueX,plaqueY,23,8);
    ctx.strokeStyle='rgba(245,190,71,.58)';ctx.lineWidth=.8;ctx.strokeRect(plaqueX,plaqueY,23,8);
    for(let i=0;i<honorMarks;i++){ctx.fillStyle='#d9a441';ctx.fillRect(plaqueX+3+i*4,plaqueY+2,2,4);}
    if(hegemonyHonors>5){ctx.fillStyle='#ead7a2';ctx.font='700 5px sans-serif';ctx.fillText(String(hegemonyHonors),plaqueX+19,plaqueY+4.5);}
  }

  // Central protected entrance: the strongest visual axis, while the NPC spawn lane stays clear.
  warmGlow(x,y-27,(wideLod?44:38)*pulse,wideLod?stageLight+.03:stageLight);
  ctx.fillStyle='#0d1012';ctx.fillRect(x-19,y-44,38,31);
  ctx.strokeStyle='rgba(199,205,205,.52)';ctx.lineWidth=1.3;ctx.strokeRect(x-19,y-44,38,31);
  ctx.fillStyle=mat.door;ctx.fillRect(x-14,y-39,28,26);
  ctx.fillStyle=faction.color;ctx.globalAlpha=.48;ctx.fillRect(x-15,y-44,30,3);ctx.globalAlpha=1;
  ctx.strokeStyle='rgba(132,144,150,.31)';for(let sx=x-9;sx<=x+9;sx+=6){ctx.beginPath();ctx.moveTo(sx,y-38);ctx.lineTo(sx,y-14);ctx.stroke();}
  if(stage>=1){
    const eh=34*pierProgress;
    ctx.fillStyle=mat.pier;ctx.fillRect(x-24,y-12-eh,5,eh);ctx.fillRect(x+19,y-12-eh,5,eh);
  }
  if(stage>=2){
    const ew=34+16*wingProgress;ctx.fillStyle=mat.slab;ctx.fillRect(x-ew/2,y-48,ew,4);
  }
  if(stage>=3){ctx.fillStyle=faction.color;ctx.globalAlpha=.12+.20*crownProgress;ctx.fillRect(x-21,y-47,42,1.5);ctx.globalAlpha=1;}
  ctx.fillStyle=mat.stepDark;ctx.fillRect(x-24,y-11,48,4);ctx.fillStyle=mat.step;ctx.fillRect(x-30,y-6,60,4);
  ctx.strokeStyle='rgba(219,200,169,.20)';ctx.beginPath();ctx.moveTo(x-30,y-6);ctx.lineTo(x+30,y-6);ctx.stroke();

  // Warm facade lamps make the spawn readable without blocking it.
  for(const lx of [x-39,x+39]){
    warmGlow(lx,y-36,28*pulse,.18);
    ctx.fillStyle='#f6c66b';ctx.beginPath();ctx.arc(lx,y-36,2.6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4d4a44';ctx.fillRect(lx-3,y-41,6,3);
  }

  // Small side windows / service openings.
  for(const wx of [x-45,x+27]){
    ctx.fillStyle=mat.window;ctx.fillRect(wx,y-42,18,11);
    ctx.strokeStyle='rgba(112,127,136,.45)';ctx.strokeRect(wx,y-42,18,11);
    ctx.globalAlpha=microAlpha;ctx.fillStyle=wideLod?'rgba(244,190,91,.10)':'rgba(244,190,91,.18)';ctx.fillRect(wx+2,y-40,14,7);ctx.globalAlpha=1;
  }

  // 0.9.10L: every upgrade family owns a specific physical zone of the Base.
  if(!wideLod && vestTier>=1){
    for(const px of [bodyX+9,bodyX+bodyW-19]){
      const ph=8+vestTier*2;ctx.fillStyle='#41484b';ctx.fillRect(px,bodyY+32-ph,10,ph);
      ctx.strokeStyle='rgba(171,183,187,.38)';ctx.strokeRect(px,bodyY+32-ph,10,ph);
      if(vestTier>=3){ctx.fillStyle='rgba(220,210,192,.35)';ctx.fillRect(px+2,bodyY+21,2,2);ctx.fillRect(px+6,bodyY+28,2,2);}
    }
  }
  if(!wideLod && heavyTier>=1){
    const hx=bodyX+bodyW-32,hy=bodyY+10;ctx.strokeStyle='rgba(127,145,151,.54)';ctx.lineWidth=1.2;ctx.strokeRect(hx,hy,24,16);
    ctx.strokeStyle='rgba(80,94,100,.62)';for(let i=0;i<Math.min(4,1+heavyTier);i++){ctx.beginPath();ctx.moveTo(hx+3,hy+4+i*3);ctx.lineTo(hx+21,hy+4+i*3);ctx.stroke();}
    if(heavyTier>=4){ctx.fillStyle=faction.color;ctx.globalAlpha=.22;ctx.fillRect(hx+2,hy+2,20,2);ctx.globalAlpha=1;}
    if(heavyTier>=5){ctx.strokeStyle='rgba(199,210,214,.34)';ctx.strokeRect(hx-2,hy-2,28,20);}
  }
  if(barricadeTier>=1){
    ctx.strokeStyle='rgba(112,126,132,.64)';ctx.lineWidth=1+barricadeTier*.16;
    for(const [a,b] of [[x-78,x-47],[x+47,x+78]] as const){
      ctx.beginPath();ctx.moveTo(a,y-7);ctx.lineTo(b,y-7);ctx.stroke();
      if(!wideLod && barricadeTier>=2){for(const px of [a,b]){ctx.beginPath();ctx.moveTo(px,y-8);ctx.lineTo(px,y+3);ctx.stroke();}}
      if(!wideLod && barricadeTier>=3){ctx.beginPath();ctx.moveTo(a,y-2);ctx.lineTo(b,y-2);ctx.stroke();}
      if(!wideLod && barricadeTier>=4){ctx.beginPath();ctx.moveTo(a,y+2);ctx.lineTo(a+8,y-7);ctx.moveTo(b,y+2);ctx.lineTo(b-8,y-7);ctx.stroke();}
      if(barricadeTier>=5){ctx.fillStyle=faction.color;ctx.globalAlpha=.30;ctx.fillRect(a,y-10,b-a,2);ctx.globalAlpha=1;}
    }
  }
  if(!wideLod && riflemenTier>=1){
    const rx=bodyX+bodyW-23,ry=bodyY-3;ctx.strokeStyle='rgba(99,111,116,.72)';ctx.strokeRect(rx,ry,18,10);
    const bars=Math.min(5,riflemenTier);for(let i=0;i<bars;i++){ctx.strokeStyle='#23292d';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(rx+3+i*4,ry+8);ctx.lineTo(rx+5+i*4,ry-5);ctx.stroke();}
  }
  // Faction flag: compact, architectural, not a floating UI tag.
  const poleX=x-49,poleTop=bodyY-39;
  ctx.strokeStyle='#9ca3af';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(poleX,bodyY-7);ctx.lineTo(poleX,poleTop);ctx.stroke();
  const wave=Math.sin(time*.004)*2;
  ctx.fillStyle=faction.color;ctx.beginPath();ctx.moveTo(poleX,poleTop);ctx.lineTo(poleX+24,poleTop+4+wave);ctx.lineTo(poleX+24,poleTop+16+wave);ctx.lineTo(poleX,poleTop+12);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';ctx.font='900 7px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(faction.tag,poleX+12,poleTop+9+wave*.5);

  if(centralTier>=1){
    const cx=x+7,cy=bodyY-13;ctx.fillStyle='#20282d';ctx.fillRect(cx,cy,22+centralTier*2,8);
    ctx.strokeStyle='rgba(106,137,151,.55)';ctx.strokeRect(cx,cy,22+centralTier*2,8);
    ctx.fillStyle='rgba(77,177,206,.28)';ctx.fillRect(cx+3,cy+2,8+centralTier,3);
    if(centralTier>=3){ctx.strokeStyle='rgba(123,174,194,.55)';ctx.beginPath();ctx.arc(cx+25,cy-1,4+centralTier,Math.PI,Math.PI*2);ctx.stroke();}
    if(centralTier>=5){ctx.fillStyle=faction.color;ctx.globalAlpha=.35;ctx.fillRect(cx+3,cy+6,16,1);ctx.globalAlpha=1;}
  }
  if(doubleTier>=1){
    for(const dx of [-25,25]){
      ctx.fillStyle='#1c2428';ctx.fillRect(x+dx-4,y-51,8,7);
      ctx.fillStyle=doubleTier>=3?'#38bdf8':'#94a3b8';ctx.fillRect(x+dx-2,y-49,4,2);
      if(doubleTier>=2){ctx.fillStyle='#f2c66d';ctx.fillRect(x+dx-1,y-46,2,1.5);}
    }
    if(doubleTier>=4){ctx.strokeStyle='rgba(56,189,248,.38)';ctx.beginPath();ctx.moveTo(x-25,y-54);ctx.lineTo(x+25,y-54);ctx.stroke();}
    if(doubleTier>=5){ctx.strokeStyle='rgba(56,189,248,.28)';ctx.beginPath();ctx.arc(x-25,y-48,7,0,Math.PI*2);ctx.arc(x+25,y-48,7,0,Math.PI*2);ctx.stroke();}
  }
  // Communication upgrades remain visible but integrated into the roofline.
  if(radioTier>=1){
    const mastX=x+37,mastTop=bodyY-34-radioTier*2;
    ctx.strokeStyle='#9ca3af';ctx.lineWidth=wideLod?2:1.6;ctx.beginPath();ctx.moveTo(mastX,bodyY-7);ctx.lineTo(mastX,mastTop);ctx.stroke();
    ctx.strokeStyle='#65727c';ctx.beginPath();ctx.moveTo(mastX-9,bodyY-7);ctx.lineTo(mastX,mastTop+8);ctx.lineTo(mastX+9,bodyY-7);ctx.stroke();
    ctx.strokeStyle=faction.color;ctx.beginPath();ctx.arc(mastX,mastTop+2,6+radioTier,Math.PI,Math.PI*2);ctx.stroke();
    if(radioTier>=5){ctx.globalAlpha=.35+.12*Math.sin(time*.004);ctx.beginPath();ctx.arc(mastX,mastTop+2,13,Math.PI*1.08,Math.PI*1.92);ctx.stroke();ctx.globalAlpha=1;}
  }

  // Micro-upgrade architecture appears from normal zoom onward.
  if(!wideLod){
  // Ammunition progression is built into the right wing as a secured rack.
  if(ammoTier>=1){
    const rackX=x+38,rackY=y-38,rackW=27,rackH=20;
    ctx.fillStyle='#20272a';ctx.fillRect(rackX,rackY,rackW,rackH);
    ctx.strokeStyle='rgba(123,138,145,.48)';ctx.strokeRect(rackX,rackY,rackW,rackH);
    const cells=Math.min(6,1+ammoTier);
    for(let i=0;i<cells;i++){const cx=rackX+4+(i%3)*8,cy=rackY+4+Math.floor(i/3)*8;ctx.fillStyle=i<3?'#786448':'#655746';ctx.fillRect(cx,cy,6,5);}
    if(ammoTier>=5){ctx.fillStyle=faction.color;ctx.globalAlpha=.42;ctx.fillRect(rackX+2,rackY+2,rackW-4,2);ctx.globalAlpha=1;}
  }
  if(medicTier>=1){
    ctx.fillStyle='#d8ddd7';ctx.fillRect(x-71,y-38,22+medicTier*2,16);
    ctx.fillStyle='#16a34a';ctx.fillRect(x-62,y-35,4,10);ctx.fillRect(x-66,y-31,12,4);
    ctx.strokeStyle='rgba(67,81,76,.65)';ctx.strokeRect(x-71,y-38,22+medicTier*2,16);
  }
  for(let i=0;i<Math.min(2,motoTier);i++) drawBike(ctx,x-83+i*18,y+13,faction.color);
    if(motoTier>=3){ctx.strokeStyle='rgba(118,132,136,.34)';ctx.beginPath();ctx.moveTo(x-88,y+18);ctx.lineTo(x-48,y+18);ctx.stroke();}
    if(motoTier>=4){ctx.fillStyle=faction.color;ctx.globalAlpha=.25;ctx.fillRect(x-86,y+20,34,1.5);ctx.globalAlpha=1;}
    if(motoTier>=5){ctx.fillStyle='#f2c66d';ctx.beginPath();ctx.arc(x-52,y+9,1.8,0,Math.PI*2);ctx.fill();}
  }

  if(autoTier>=1){
    const panelW=24+autoTier*2,panelX=x-panelW/2;ctx.fillStyle='#101820';ctx.beginPath();ctx.roundRect(panelX,y-52,panelW,8,2);ctx.fill();
    const blink=Math.sin(time*(.006+autoTier*.0005))>0;
    for(const [dx,c] of [[-8,blink?'#22c55e':'#166534'],[0,faction.color],[8,'#38bdf8']] as const){ctx.fillStyle=c;ctx.fillRect(x+dx-2,y-49,4,3);}
    if(autoTier>=3){ctx.fillStyle='rgba(148,163,184,.28)';for(let i=0;i<autoTier-1;i++)ctx.fillRect(panelX+3+i*4,y-45,2,1);}
    if(autoTier>=5){ctx.strokeStyle='rgba(34,197,94,.38)';ctx.strokeRect(panelX-1,y-53,panelW+2,10);}
  }

  if(closeLod){
    // Close LOD: material seams, sign fasteners and door hardware only visible nearby.
    ctx.strokeStyle='rgba(220,210,194,.13)';ctx.lineWidth=.7;
    ctx.beginPath();ctx.moveTo(bodyX+10,bodyY+30);ctx.lineTo(bodyX+bodyW-10,bodyY+30);ctx.stroke();
    for(const bx of [x-49,x+49]){ctx.fillStyle='rgba(214,204,188,.52)';ctx.beginPath();ctx.arc(bx,bodyY-15,1.1,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='rgba(210,194,164,.55)';ctx.beginPath();ctx.arc(x+8,y-26,1.4,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(45,39,34,.22)';ctx.beginPath();ctx.moveTo(x-23,y-5);ctx.lineTo(x+23,y-5);ctx.stroke();
  }

  // Tier-4 fortification adds compact corner posts without widening the spawn lane.
  if(fortTier>=4){
    for(const px of [x-76,x+60]){
      ctx.fillStyle='#34393b';ctx.fillRect(px,y-48,16,28);
      ctx.strokeStyle='rgba(139,149,154,.55)';ctx.strokeRect(px,y-48,16,28);
      ctx.fillStyle=faction.color;ctx.globalAlpha=.7;ctx.fillRect(px,y-48,16,3);ctx.globalAlpha=1;
    }
  }
  ctx.restore();
}
