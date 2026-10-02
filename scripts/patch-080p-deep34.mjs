import fs from 'node:fs';
const p=process.cwd()+'/src/components/canvas/bespokeArchitectureRenderer.ts';
let s=fs.readFileSync(p,'utf8');
s=s.replace("  else if(args.territoryId===6)overT6(args,n);\n  args.ctx.restore();","  else if(args.territoryId===6)overT6(args,n);\n  if(args.territoryId===3){deepT3(args,n);deepT3b(args,n);}\n  else if(args.territoryId===4){deepT4(args,n);deepT4b(args,n);}\n  args.ctx.restore();");
fs.writeFileSync(p,s,'utf8');
console.log('deep T3/T4 overlay hook added');
