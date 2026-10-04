from pathlib import Path
p = Path(r'C:\Users\Eduardo Bertei\Desktop\gangster-incremental\src\components\GameCanvas.tsx')
s = p.read_text(encoding='utf-8')
old = """          {nextTerritory ? (
            <>
              <span className=\"text-[10px] uppercase tracking-wide text-slate-500\">Neutralizar</span>
              <div className=\"h-1.5 flex-1 rounded-full overflow-hidden bg-slate-800\">
                <div
                  className=\"h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-[width] duration-200\"
                  style={{ width: `${Math.min(100, (gameState.territoryTakes / Math.max(1, nextTerritory.requiredTakes)) * 100)}%` }}
                />
              </div>
              <span className=\"font-mono text-[10px] text-amber-300\">{gameState.territoryTakes}/{nextTerritory.requiredTakes}</span>
            </>
          ) : (
"""
new = """          {nextTerritory ? territoryDominated ? (
            <span className=\"text-[10px] font-semibold uppercase tracking-wide text-emerald-300\">
              Território dominado • estruturas sob controle {factionConfig.tag}
            </span>
          ) : (
            <>
              <span className=\"text-[10px] uppercase tracking-wide text-slate-500\">Neutralizar</span>
              <div className=\"h-1.5 flex-1 rounded-full overflow-hidden bg-slate-800\">
                <div className=\"h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-[width] duration-200\" style={{ width: `${Math.min(100, (gameState.territoryTakes / Math.max(1, nextTerritory.requiredTakes)) * 100)}%` }} />
              </div>
              <span className=\"font-mono text-[10px] text-amber-300\">{gameState.territoryTakes}/{nextTerritory.requiredTakes}</span>
            </>
          ) : (
"""
assert old in s
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print('domination HUD patched')