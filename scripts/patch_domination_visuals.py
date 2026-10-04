from pathlib import Path
p = Path(r'C:\Users\Eduardo Bertei\Desktop\gangster-incremental\src\components\GameCanvas.tsx')
s = p.read_text(encoding='utf-8')

old = """  const dominationRequirement = nextTerritory?.requiredTakes ?? currentTerritory.requiredTakes;
  const territoryDominated = gameState.territoryTakes >= dominationRequirement;
"""
new = """  const dominationRequirement = nextTerritory?.requiredTakes ?? currentTerritory.requiredTakes;
  const territoryDominated = gameState.territoryTakes >= dominationRequirement;
  const dominatedBuildingIds = useMemo(
    () => new Set(tacticalBuildings.filter(building => building.isRivalHub).map(building => building.id)),
    [tacticalBuildings]
  );
"""
assert old in s
s = s.replace(old, new, 1)

old = """      const visualControlledIds = territoryDominated
        ? new Set(tacticalBuildings.filter(building => building.isRivalHub).map(building => building.id))
        : capturedBuildingIdsRef.current;
"""
new = """      const visualControlledIds = territoryDominated
        ? dominatedBuildingIds
        : capturedBuildingIdsRef.current;
"""
assert old in s
s = s.replace(old, new, 1)
old = """          mctx.strokeStyle = 'rgba(148,163,184,0.20)';
          mctx.lineWidth = 2;
          mctx.strokeRect(1, 1, mw - 2, mh - 2);

          for (const b of tacticalBuildings) {
"""
new = """          mctx.strokeStyle = 'rgba(148,163,184,0.20)';
          mctx.lineWidth = 2;
          mctx.strokeRect(1, 1, mw - 2, mh - 2);

          if (territoryDominated) {
            mctx.save();
            mctx.globalAlpha = 0.13;
            mctx.fillStyle = factionConfig.color;
            mctx.font = '900 30px Impact, sans-serif';
            mctx.textAlign = 'center';
            mctx.textBaseline = 'middle';
            mctx.translate(mw * 0.24, mh * 0.32);
            mctx.rotate(-0.16);
            mctx.fillText(factionConfig.tag, 0, 0);
            mctx.restore();
            mctx.save();
            mctx.globalAlpha = 0.10;
            mctx.fillStyle = factionConfig.color;
            mctx.font = '900 24px Impact, sans-serif';
            mctx.translate(mw * 0.78, mh * 0.70);
            mctx.rotate(0.12);
            mctx.fillText(factionConfig.tag, 0, 0);
            mctx.restore();
          }

          for (const b of tacticalBuildings) {
"""
assert old in s
s = s.replace(old, new, 1)
# Keep the main RAF dependencies explicit for domination visuals.
old = """    operationEnabled,
    syncDistrictHud,
    tacticalBuildings
  ]);
"""
new = """    operationEnabled,
    syncDistrictHud,
    tacticalBuildings,
    territoryDominated,
    dominatedBuildingIds
  ]);
"""
assert old in s
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
print('domination visuals optimized')
