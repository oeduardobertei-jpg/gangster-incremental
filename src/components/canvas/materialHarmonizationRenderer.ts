import type { TacticalBuilding } from './favelaRenderer';

type BuildingArgs={ctx:CanvasRenderingContext2D;b:TacticalBuilding;territoryId:number;roofY:number;facadeY:number;height:number};
const wash=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
const stain=(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,c:string)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,.08,0,Math.PI*2);ctx.fill();};
const palette=(territoryId:number)=>{
  if(territoryId===1)return {wall:'rgba(92,68,48,.055)',roof:'rgba(72,82,76,.045)',ground:'rgba(79,61,45,.13)'};
  if(territoryId===2)return {wall:'rgba(113,83,47,.060)',roof:'rgba(88,76,60,.045)',ground:'rgba(91,68,42,.12)'};
  if(territoryId===3)return {wall:'rgba(69,76,83,.055)',roof:'rgba(35,42,50,.055)',ground:'rgba(15,23,42,.14)'};
  if(territoryId===4)return {wall:'rgba(91,67,49,.070)',roof:'rgba(72,61,52,.055)',ground:'rgba(86,63,46,.15)'};
  if(territoryId===5)return {wall:'rgba(72,89,96,.045)',roof:'rgba(54,76,83,.035)',ground:'rgba(61,82,79,.09)'};
  return {wall:'rgba(25,41,57,.070)',roof:'rgba(20,36,53,.060)',ground:'rgba(20,35,52,.13)'};
};
export function drawBuildingMaterialBlend({ctx,b,territoryId,roofY,facadeY,height}:BuildingArgs){const p=palette(territoryId);ctx.save();wash(ctx,b.x,facadeY,b.w,height,p.wall);wash(ctx,b.x,roofY,b.w,b.h,p.roof);ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(b.x+2,facadeY+height-5,b.w-4,5);ctx.restore();}
export function drawMaterialHarmonizationGround(ctx:CanvasRenderingContext2D,buildings:readonly TacticalBuilding[],territoryId:number){const p=palette(territoryId);ctx.save();for(const b of buildings){const y=b.y+b.h+4;stain(ctx,b.x+b.w*.50,y,b.w*.34,territoryId===5?4:6,p.ground);if(territoryId===1||territoryId===4){stain(ctx,b.x+8,y+2,12,3,p.ground);stain(ctx,b.x+b.w-9,y+1,10,3,p.ground);}else if(territoryId===3){stain(ctx,b.x+b.w*.68,y+3,15,3,'rgba(2,6,23,.14)');}else if(territoryId===5){ctx.fillStyle='rgba(226,232,240,.035)';ctx.fillRect(b.x+6,y-1,b.w-12,2);}else if(territoryId===6){ctx.fillStyle='rgba(96,165,250,.035)';ctx.fillRect(b.x+b.w*.30,y,b.w*.40,2);}}ctx.restore();}
