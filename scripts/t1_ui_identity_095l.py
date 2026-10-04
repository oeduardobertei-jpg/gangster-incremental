from pathlib import Path
p=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental\src\components\GameCanvas.tsx')
s=p.read_text(encoding='utf-8')
old='''      <div className="battle-hud absolute top-3 left-4 z-10 min-w-[350px] max-w-[56%] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 shadow-lg text-xs pointer-events-none">'''
new='''      <div
        className="battle-hud absolute top-3 left-4 z-10 min-w-[350px] max-w-[56%] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 shadow-lg text-xs pointer-events-none"
        style={currentTerritory.id === 1 ? {
          borderLeftColor: '#ff6845', borderLeftWidth: 3,
          boxShadow: '0 14px 40px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,104,69,.08)'
        } : undefined}
      >'''
if old not in s: raise SystemExit('battle hud anchor missing')
s=s.replace(old,new,1)
needle='''          <span className="text-rose-400 font-mono-numbers">Rivais {rivalsRef.current.length}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">'''
rep='''          <span className="text-rose-400 font-mono-numbers">Rivais {rivalsRef.current.length}</span>
        </div>
        {currentTerritory.id === 1 && (
          <div className="mt-1 text-[8px] font-black uppercase tracking-[0.20em] text-[#ff7658]/80">
            Vielas • Lajes • Comércio local
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-2">'''
if needle not in s: raise SystemExit('battle hud row anchor missing')
s=s.replace(needle,rep,1)
p.write_text(s,encoding='utf-8')
print('095L-ui-identity-ok')
