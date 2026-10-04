# 0.9.7 Ã¢â‚¬â€ T4 Morro Ground Reauthor

Status: implemented, compiled and visually captured.
Revision: `0.9.7e-t4-morro-ground-v1`.

## Scope
- Architecture, building positions and gameplay geometry preserved.
- Work focused on T4 background/terrain: hillside, road, erosion, dry nature and terrainÃ¢â‚¬â€œarchitecture contact.
- T1 remains frozen at the 0.9.6 authored-ground baseline.

## Implemented
- A: replaced the old stacked T4 terrace board with a dedicated authored hillside surface.
- B: removed redundant T4 ground layers from GameCanvas, World Density and Unified Composer.
- C: added altitude/material depth, exposed earth cuts and lighter T4 atmosphere.
- D: broke continuous terrace lips, localized road shoulders, rubble and dry shrubs.
- E: added dry-slope micro-life, erosion fans, stone scatter and small concrete landings.

## Pipeline cleanup
- Removed formal yellow road markings and generic T4 scene-path styling.
- Removed old full-width dirt patches and large translucent terrace plates.
- Removed duplicate building ground pads, automatic pair connectors and T4 cluster beds.
- T4 terrain no longer depends on old Polish/BiomeDepth/ArchitectureGrounding/CariocaGroundIntegration/StructuralDeep ground passes.
- Utility poles, cables, clotheslines, props and physical cover remain separate and intact.

## Visual identity
- T4 now reads as a dry fortified hill: warm exposed earth, sparse scrub, irregular erosion, broken terrace edges and a darker local access road.
- The T4 surface intentionally differs from T1: drier, steeper and more fortified, without copying T1's wetter peripheral-ground language.

## QA
- TypeScript: PASS through 0.9.7E.
- Final production gate: PASS (`npm run check`, 1751 modules).
- Visual captures produced at 100% and 145%.

- Overlap audit: T4 = 7 intentional retaining contacts, 0 accidental overlaps.
- Checkpoint remains `0.9.7e-t4-morro-ground-v1`.

