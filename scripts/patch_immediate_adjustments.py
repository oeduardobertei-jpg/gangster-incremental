from pathlib import Path
root = Path(r'C:\Users\Eduardo Bertei\Desktop\gangster-incremental')
canvas_path = root / 'src' / 'components' / 'GameCanvas.tsx'
app_path = root / 'src' / 'App.tsx'
s = canvas_path.read_text(encoding='utf-8')

old = "const FIRST_DISTRICT_OPERATION_TERRITORY_ID = 1;\n"
new = old + "// Kept for a future territorial-capture milestone; disabled in the active game flow for now.\nconst DISTRICT_CAPTURE_PROTOTYPE_ENABLED = false;\n"
assert old in s
s = s.replace(old, new, 1)

old = """  const operationEnabled = currentTerritory.id === FIRST_DISTRICT_OPERATION_TERRITORY_ID &&
    (gameState.runHighestTerritoryReached || gameState.currentTerritoryId) <= FIRST_DISTRICT_OPERATION_TERRITORY_ID;
"""
new = """  const dominationRequirement = nextTerritory?.requiredTakes ?? currentTerritory.requiredTakes;
  const territoryDominated = gameState.territoryTakes >= dominationRequirement;
  const operationEnabled = DISTRICT_CAPTURE_PROTOTYPE_ENABLED &&
    currentTerritory.id === FIRST_DISTRICT_OPERATION_TERRITORY_ID &&
    (gameState.runHighestTerritoryReached || gameState.currentTerritoryId) <= FIRST_DISTRICT_OPERATION_TERRITORY_ID;
"""
assert old in s
s = s.replace(old, new, 1)
# Visual domination uses the same neutralization threshold that unlocks territorial advancement.
old = """      drawFavelaAmbient(ctx, width, height, factionConfig, currentTime, capturedBuildingIdsRef.current);
"""
new = """      const visualControlledIds = territoryDominated
        ? new Set(tacticalBuildings.filter(building => building.isRivalHub).map(building => building.id))
        : capturedBuildingIdsRef.current;
      drawFavelaAmbient(ctx, width, height, factionConfig, currentTime, visualControlledIds);
"""
assert old in s
s = s.replace(old, new, 1)

old = """              capturedBuildingIdsRef.current.has(building.id),
              factionConfig.color, factionConfig.tag
"""
new = """              territoryDominated || capturedBuildingIdsRef.current.has(building.id),
              factionConfig.color, factionConfig.tag
"""
assert old in s
s = s.replace(old, new, 1)

old = """            const hubColor = point?.status === 'captured'
              ? factionConfig.color
              : point?.status === 'contested' ? '#fbbf24' : b.graffitiColor;
"""
new = """            const hubColor = territoryDominated
              ? factionConfig.color
              : point?.status === 'captured' ? factionConfig.color
                : point?.status === 'contested' ? '#fbbf24' : b.graffitiColor;
"""
assert old in s
s = s.replace(old, new, 1)
old = """        {nextTerritory && gameState.territoryTakes >= nextTerritory.requiredTakes && (!operationHud.enabled || operationHud.phase === 'dominated') && onAdvanceTerritory && (
"""
new = """        {nextTerritory && territoryDominated && onAdvanceTerritory && (
"""
assert old in s
s = s.replace(old, new, 1)

old = """      <div className=\"absolute bottom-12 right-3 z-30 rounded-lg border border-slate-700/90 bg-slate-950/92 p-1.5 shadow-xl backdrop-blur-md\">
        <div className=\"mb-1 flex items-center justify-between px-1 text-[9px] uppercase tracking-[0.12em] text-slate-500 pointer-events-none\">
          <span>Mapa tatico</span>
          <span className=\"text-slate-600\">arraste para navegar</span>
        </div>
"""
new = """      <div className=\"absolute bottom-12 right-3 z-30 w-[172px] rounded-lg border border-slate-700/90 bg-slate-950/92 p-1.5 shadow-xl backdrop-blur-md\">
        <div className=\"mb-1 flex w-full items-center justify-between px-0.5 text-[8px] uppercase tracking-[0.10em] text-slate-500 pointer-events-none\">
          <span>Mapa tático</span>
          <span className=\"text-slate-600\">arraste</span>
        </div>
"""
assert old in s
s = s.replace(old, new, 1)
s = s.replace('aria-label="Minimapa tÃ¡tico"', 'aria-label="Minimapa tático"', 1)
canvas_path.write_text(s, encoding='utf-8')

app = app_path.read_text(encoding='utf-8')
old = """    const operation = gameCanvasRef.current?.getDistrictOperationStatus();
    if (operation?.enabled && operation.phase !== 'dominated') {
      setSystemNotice(`Avanço bloqueado: domine as bases do distrito e vença a última resistência (${operation.captured}/${operation.total}).`);
      return;
    }

"""
assert old in app
app = app.replace(old, '', 1)
app = app.replace(
    '// 0.5: avanÃ§o exige neutralizaÃ§Ãµes mÃ­nimas + domÃ­nio real do distrito quando a operaÃ§Ã£o estiver ativa.',
    '// Avanço territorial volta a depender apenas da meta de neutralizações; captura física fica reservada para uma futura milestone.',
    1
)
app = app.replace(
    'setSystemNotice(`Distrito consolidado. Avançando para ${next.name}.`);',
    'setSystemNotice(`Território conquistado. Avançando para ${next.name}.`);',
    1
)
app_path.write_text(app, encoding='utf-8')
print('immediate adjustments patched')
