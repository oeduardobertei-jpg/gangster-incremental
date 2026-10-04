from pathlib import Path
root=Path(r'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.9.3b\gangster-incremental')
p=root/'src/components/GameCanvas.tsx'
s=p.read_text(encoding='utf-8')

anchor="import { drawT1GoldOverlay } from './canvas/t1GoldOverlayRenderer';"
imp=anchor+"\nimport { drawT1ForegroundFraming, drawT1CharacterGrounding, drawT1LandmarkReadability, drawT1AtmosphericContrast, drawT1MicroBeauty } from './canvas/t1FinalPolishRenderer';"
if 't1FinalPolishRenderer' not in s:
    s=s.replace(anchor,imp,1)

old="          drawT1GoldFoundation(layerCtx, width, height, currentTerritory.id, tacticalBuildings, environmentControlColor);"
new=old+"\n          drawT1ForegroundFraming(layerCtx, width, height, currentTerritory.id, tacticalBuildings);"
if 'drawT1ForegroundFraming(layerCtx' not in s:s=s.replace(old,new,1)

old="      drawWorldDensityOverlay(ctx, width, height, currentTerritory.id, currentTime, environmentControlColor);"
new=old+"\n      drawT1AtmosphericContrast(ctx, width, height, currentTerritory.id, visualLoadZoom);\n      drawT1LandmarkReadability(ctx, width, height, currentTerritory.id, tacticalBuildings, visualLoadZoom);\n      drawT1MicroBeauty(ctx, width, height, currentTerritory.id, currentTime, visualLoadZoom);"
if 'drawT1AtmosphericContrast(ctx' not in s:s=s.replace(old,new,1)
old="          case 'ally': drawAllySprite(ctx, item.entity as AllyEntity, currentTime); break;"
new="          case 'ally': {\n            const ally = item.entity as AllyEntity;\n            drawT1CharacterGrounding(ctx,currentTerritory.id,ally.x,ally.y,10,false,currentTime,visualLoadZoom);\n            drawAllySprite(ctx, ally, currentTime); break;\n          }"
if old in s:s=s.replace(old,new,1)

old="            const rival = item.entity as RivalEntity;\n            if (rival.type === 'gerente_boca') {"
new="            const rival = item.entity as RivalEntity;\n            drawT1CharacterGrounding(ctx,currentTerritory.id,rival.x,rival.y,rival.radius,true,currentTime,visualLoadZoom);\n            if (rival.type === 'gerente_boca') {"
if 'drawT1CharacterGrounding(ctx,currentTerritory.id,rival.x' not in s:s=s.replace(old,new,1)

old='className="battle-hud absolute top-3 left-4 z-10 min-w-[350px] max-w-[56%] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 shadow-lg text-xs pointer-events-none"'
new='className="battle-hud relative absolute top-3 left-4 z-10 min-w-[350px] max-w-[56%] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 shadow-lg text-xs pointer-events-none"'
s=s.replace(old,new,1)
old="""        style={currentTerritory.id === 1 ? {
          borderLeftColor: '#ff6845', borderLeftWidth: 3,
          boxShadow: '0 14px 40px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,104,69,.08)'
        } : undefined}"""
new="""        style={currentTerritory.id === 1 ? {
          borderLeftColor: '#ff6845', borderLeftWidth: 3,
          borderTopColor: 'rgba(255,104,69,.24)',
          background: 'linear-gradient(108deg, rgba(7,10,15,.965) 0%, rgba(9,13,20,.94) 72%, rgba(35,18,13,.90) 100%)',
          boxShadow: '0 14px 38px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,126,88,.11), inset 10px 0 28px rgba(255,93,54,.025)'
        } : undefined}"""
s=s.replace(old,new,1)

old='''            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
              Território dominado • estruturas sob controle {factionConfig.tag}
            </span>'''
new='''            <span className={currentTerritory.id === 1
              ? "text-[9px] font-black uppercase tracking-[0.12em] text-emerald-300"
              : "text-[10px] font-semibold uppercase tracking-wide text-emerald-300"}>
              {currentTerritory.id === 1
                ? <>DOMINADO <span className="text-slate-600">•</span> REDE LOCAL SOB CONTROLE {factionConfig.tag}</>
                : <>Território dominado • estruturas sob controle {factionConfig.tag}</>}
            </span>'''
s=s.replace(old,new,1)
old='''            className="battle-advance pointer-events-auto mt-2 flex items-center gap-2 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xl shadow-rose-950/50 border border-amber-400/80 cursor-pointer"
          >
            <span>🏆 CONQUISTADO! AVANÇAR: {nextTerritory.name}</span>
            <span>→</span>'''
new='''            className={currentTerritory.id === 1
              ? "battle-advance pointer-events-auto mt-2 flex w-full items-center gap-2 rounded-md border border-[#ff9b78]/45 bg-[#e85b36]/88 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-[0_7px_20px_rgba(232,91,54,.16)] transition-colors hover:bg-[#ff6845] cursor-pointer"
              : "battle-advance pointer-events-auto mt-2 flex items-center gap-2 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xl shadow-rose-950/50 border border-amber-400/80 cursor-pointer"}
          >
            {currentTerritory.id === 1 ? (
              <>
                <span className="text-[#ffe4d7]">▰</span>
                <span className="shrink-0">AVANÇAR</span>
                <span className="min-w-0 flex-1 truncate text-left font-semibold normal-case tracking-normal text-white/90">{nextTerritory.name}</span>
                <span className="text-sm leading-none">→</span>
              </>
            ) : (
              <><span>🏆 CONQUISTADO! AVANÇAR: {nextTerritory.name}</span><span>→</span></>
            )}'''
if old not in s: print('warning: button anchor not found')
else: s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('GameCanvas 095O-T wiring/polish complete')
