import fs from 'node:fs';
const p=process.cwd()+'/src/components/canvas/bespokeArchitectureRenderer.ts';
let s=fs.readFileSync(p,'utf8');
s=s.replace("  if(args.territoryId===3){deepT3(args,n);deepT3b(args,n);}\n  else if(args.territoryId===4){deepT4(args,n);deepT4b(args,n);}","  if(args.territoryId===3){deepT3(args,n);deepT3b(args,n);}\n  else if(args.territoryId===4){deepT4(args,n);deepT4b(args,n);}\n  else if(args.territoryId===5){deepT5(args,n);deepT5b(args,n);}\n  else if(args.territoryId===6){deepT6(args,n);deepT6b(args,n);}");
fs.writeFileSync(p,s,'utf8');console.log('deep T5/T6 overlay hook added');
