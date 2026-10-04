# 0.9.6 — T1 Ground Reauthor

Status: implemented, compiled, visually captured and final-candidate QA passed.
Revision: `0.9.6m-t1-final-integration-v1`.

## Scope
- Architecture, building positions and gameplay geometry preserved.
- Work focused on T1 background: ground, routes, transitions, nature and terrain/building integration.
- T2–T6 were not reauthored in this milestone.

## Implemented
- A: retired legacy rectangular biome patches and generic T1 path rendering.
- B: added authored edge vegetation, drainage weeds, broken paving and local repairs.
- C: separated asphalt, alley, concrete, dirt and vegetation material values.
- D: narrowed the visual main road without changing navigation geometry; added ground contact from real building footprints.
- E: added edge embankments, runoff cues and subtle lot-material mosaics.
- F: removed old map-high structural drainage guides and redundant building ground pads.
- G: removed the remaining full-height legacy trench from `environmentRenderer.ts`.

## Pipeline cleanup
- T1 no longer stacks legacy ground wear, generic path wear, old biome depth, duplicate building pads and old long drainage lines.
- `t1GroundReauthorRenderer.ts` is now the main source of truth for the T1 surface.
- Ground remains readable at 100% and carries extra material detail at close zoom.

## QA
- TypeScript: PASS.
- Foundation tests: PASS after final cleanup.
- Production build: PASS (1750 modules; chunk-size warning remains non-blocking).
- Visual captures: `docs/screenshots/t1-096-ground/` at 100% and 145%.

## H–K — Territorial Control & Quality Parity
- H: solid purpose props now participate in the same 2.5D depth-sort used by buildings/NPCs instead of being baked into the static background.
- H: entry wall became a physical authored control mural; PCC/CV paint changes in-place with ownership.
- H: dominated T1 adds restrained occupation cues on existing poles and selected context facades.
- I: removed accidental prop/building overlaps; T1 audit now reports only the seven intentional owner-retaining-wall contacts.
- J: T1 props gained zoom-aware material finishing (car, crates, pallets, bench, dumpster, barricade, planters and walls).
- J: center barricade was rebuilt as neutral physical street furniture with only a localized faction mark.
- J: T1 planters were rebuilt with concrete/soil/vegetation volume rather than flat green blocks.
- K: legacy ground ownership text/strip was retired; ownership is communicated through physical architecture.
- K: old line-art chairs were replaced with volumetric street furniture in both T1 story renderers.
- K: entry mural was physically repositioned so its graffiti is no longer hidden by the nearby contextual shop.

### QA H–K
- TypeScript: PASS.
- Foundation tests: PASS.
- Production build: PASS (1751 modules; chunk-size warning remains non-blocking).
- Overlap audit: T1 = 7 intentional retaining contacts, 0 accidental overlaps.
- Rival/dominated captures: `docs/screenshots/t1-096h-control/`.
- 250% parity capture: `docs/screenshots/t1-096-parity/`.
- Current checkpoint revision: `0.9.6k-t1-control-parity-v1`.
- T1 is NOT marked final; visual approval remains pending.

## L–M — Final Integration & Domestic Nature
- L: road material values were lifted slightly so asphalt, shoulder and occupied ground separate better without changing navigation geometry.
- L: added four irregular neighborhood material fields to bridge tactical/context architecture into the authored surface.
- L: added deterministic fine debris and threshold pavers restricted to occupied edges; the central combat corridor stays visually quiet.
- L: building thresholds now receive tiny paver/weed transitions so structures read as embedded in the ground instead of placed over it.
- M: expanded domestic nature with six authored pocket gardens, brighter foliage variation and restrained ceramic doorstep fragments for non-faction color.
- M: community slab value was lifted slightly for better 100%/250% material readability.
- Layer CLI was integrated and authenticated, but the workspace currently reports 0 Creative Units; no Layer generation was charged or applied in this milestone.

### QA L–M
- `npm run check`: PASS.
- Foundation verification: PASS.
- Production build: PASS (1751 modules; chunk-size warning remains non-blocking).
- Overlap audit: T1 = 7 intentional retaining contacts, 0 accidental overlaps.
- Rival/dominated ownership captures refreshed successfully.
- 100% and 250% captures refreshed successfully.
- Current checkpoint revision: `0.9.6m-t1-final-integration-v1`.
- T1 is a FINAL CANDIDATE pending only user visual approval; no known technical blocker remains.
