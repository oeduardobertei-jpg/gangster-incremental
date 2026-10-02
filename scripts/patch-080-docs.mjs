import fs from 'node:fs';
const root='C:/Users/eduardo.bertei/organizacao/IA/prototipos/fac incremental/gangster-incremental-0.8l-full/gangster-incremental';
const hand=`${root}/HANDOFF.md`;let h=fs.readFileSync(hand,'utf8');
h=h.replace('Base ativa: **0.8 FEATURE-COMPLETE VISUAL FOUNDATION — Mundo Vivo / Densidade Ambiental Integrada**.','Base ativa: **0.8T — Mundo Vivo / Densidade Ambiental Integrada (em desenvolvimento ativo)**.');
h=h.replace('A arquitetura A–H está implementada; próximo passo é playtest/balance fino, não nova arquitetura imediata.','A 0.8 foi expandida até T; o foco atual ainda é acabamento visual profundo antes de retornar ao balance sistêmico.');
h=h.replace('C:\\Users\\Eduardo Bertei\\Downloads\\gangster-incremental-0.5.5-beauty-pass\\gangster-incremental','C:\\Users\\eduardo.bertei\\organizacao\\IA\\prototipos\\fac incremental\\gangster-incremental-0.8l-full\\gangster-incremental');
fs.writeFileSync(hand,h,'utf8');
console.log('HANDOFF path/status updated');