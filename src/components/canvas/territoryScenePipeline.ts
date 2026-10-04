import type { FactionConfig } from '../../types/game';
import type { TacticalBuilding } from './favelaRenderer';
import { drawFavelaTileset } from './favelaRenderer';
import { drawCityVivaAmbientOverlay, drawTerritorySceneFoundation } from './environmentRenderer';
import { drawPurposefulPropsFoundation } from './purposefulPropsRenderer';
import { drawTerritoryPolishFoundation, drawTerritoryPolishOverlay } from './polishRenderer';
import { drawWorldDensityFoundation, drawWorldDensityOverlay } from './worldDensityRenderer';
import { drawBrazilianContextFoundation } from './brazilianContextRenderer';
import { drawBiomeDepthFoundation } from './biomeDepthRenderer';
import { drawTerritoryAtmosphereFoundation, drawTerritoryAtmosphereUnderlay } from './atmosphereRenderer';
import { drawArchitectureGrounding } from './architectureDepthRenderer';
import { drawStreetLifeClusters } from './streetLifeRenderer';
import { drawT1StaticComposition, drawT1PreWorldOverlay, drawT1ReadabilityOverlay } from './t1SceneComposer';
import { drawMaterialContinuity } from './materialContinuityRenderer';
import { drawSemanticBuildingContext } from './semanticBuildingRenderer';
import { drawTerritoryStructuralDeepFoundation } from './territoryStructuralDeepRenderer';
import { drawFunctionalBuildingAccess } from './accessCirculationRenderer';
import { drawGroundStoryUseZones } from './groundStoryRenderer';
import { drawAuthoredStoryClusters } from './environmentStoryRenderer';
import { drawUrbanMoodFoundation } from './urbanMoodRenderer';
import { drawVegetationNeglect } from './vegetationNeglectRenderer';
import { drawMaterialHarmonizationGround } from './materialHarmonizationRenderer';
import { drawCariocaDistrictFoundation, drawCariocaGroundIntegration } from './cariocaIdentityRenderer';
import { drawUnifiedTerritoryComposition } from './unifiedTerritoryComposer';

type StaticSceneArgs = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  territoryId: number;
  factionConfig: FactionConfig;
  territoryDominated: boolean;
  buildings: readonly TacticalBuilding[];
  controlColor: string;
};

type DynamicSceneArgs = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  territoryId: number;
  time: number;
  controlColor: string;
  buildings: readonly TacticalBuilding[];
  renderZoom: number;
  visibleBounds: { left:number; right:number; top:number; bottom:number };
};

/**
 * 1.1I scene pipeline.
 * Keeps the exact approved render order in one place so GameCanvas only owns
 * simulation, depth-sorted entities and combat presentation.
 */
export function drawStaticTerritoryScene({
  ctx, width, height, territoryId, factionConfig, territoryDominated, buildings, controlColor
}: StaticSceneArgs) {
  const renderedByCityViva = drawTerritorySceneFoundation(
    ctx, width, height, territoryId, factionConfig, territoryDominated, buildings
  );
  if (!renderedByCityViva) {
    drawFavelaTileset(ctx, width, height, territoryId, factionConfig, 0, false, false);
  }

  if (![1,4].includes(territoryId)) drawCariocaDistrictFoundation(ctx, width, height, territoryId, controlColor);
  drawUnifiedTerritoryComposition({ ctx, width, height, territoryId, buildings, controlColor });
  if (![2,3,4].includes(territoryId)) drawTerritoryPolishFoundation(ctx, width, height, territoryId, controlColor);
  if (![1,2,3].includes(territoryId)) drawWorldDensityFoundation(ctx, width, height, territoryId, controlColor, buildings);
  if (![1,3,4].includes(territoryId)) drawBrazilianContextFoundation(ctx, width, height, territoryId, controlColor);
  if (![1,4].includes(territoryId)) drawBiomeDepthFoundation(ctx, width, height, territoryId);
  drawTerritoryAtmosphereFoundation(ctx, width, height, territoryId, controlColor, buildings);
  drawUrbanMoodFoundation(ctx, width, height, territoryId, buildings, controlColor);
  if (![1,2,3,4].includes(territoryId)) drawArchitectureGrounding(ctx, buildings, territoryId, controlColor);
  if (![1,3,4].includes(territoryId)) buildings.forEach(building => drawCariocaGroundIntegration(ctx, building, territoryId, controlColor));
  if (![1,2,3,4].includes(territoryId)) drawTerritoryStructuralDeepFoundation(ctx, width, height, territoryId, buildings, controlColor);
  if (![1,2,3,4].includes(territoryId)) drawMaterialHarmonizationGround(ctx, buildings, territoryId);
  drawVegetationNeglect(ctx, buildings, territoryId);
  if (![1,2,3,4].includes(territoryId)) drawMaterialContinuity(ctx, buildings, territoryId);
  drawSemanticBuildingContext(ctx, buildings, territoryId, controlColor, width, height);
  if (![1,2,3,4].includes(territoryId)) drawFunctionalBuildingAccess(ctx, buildings, territoryId, controlColor, width, height);
  if (![1,2,3,4].includes(territoryId)) drawGroundStoryUseZones(ctx, buildings, territoryId, controlColor);
  drawAuthoredStoryClusters(ctx, buildings, territoryId, controlColor);
  if (territoryId !== 1) drawStreetLifeClusters(ctx, buildings, territoryId, controlColor);
  drawT1StaticComposition(ctx, width, height, territoryId, buildings, controlColor);
  drawPurposefulPropsFoundation(
    ctx, width, height, territoryId, controlColor,
    territoryDominated ? factionConfig.tag : factionConfig.rivalTag
  );
}

export function drawTerritoryEnvironmentOverlays({
  ctx, width, height, territoryId, time, controlColor, buildings, renderZoom, visibleBounds
}: DynamicSceneArgs) {
  drawCityVivaAmbientOverlay(ctx, width, height, territoryId, time, controlColor);
  drawT1PreWorldOverlay(ctx, width, height, territoryId, time, controlColor, renderZoom);
  drawTerritoryPolishOverlay(ctx, width, height, territoryId, time, controlColor);
  drawTerritoryAtmosphereUnderlay(ctx, width, height, territoryId, time, controlColor, visibleBounds);
  drawWorldDensityOverlay(ctx, width, height, territoryId, time, controlColor);
  drawT1ReadabilityOverlay(ctx, width, height, territoryId, buildings, time, renderZoom);
}
