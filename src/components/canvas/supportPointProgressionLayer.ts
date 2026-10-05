import type { GameState } from '../../types/game';
import type { TacticalBuilding } from './favelaRenderer';
import { getSupportPointVisualProfile, isSupportPointBuildingId } from '../../rules/supportPointVisualProgression';
import { drawSupportPointProgressionOverlay } from './supportPointProgressionRenderer';

type SupportPointProgressionLayerArgs = {
  ctx: CanvasRenderingContext2D;
  building: TacticalBuilding;
  state: GameState;
  capturedByPlayer: boolean;
  controlColor: string;
  time: number;
  renderZoom?: number;
};

/**
 * Small state-to-render bridge kept outside GameCanvas so the main frame loop
 * only needs one call. Player upgrades must never visually evolve rival-owned
 * hubs, therefore ownership is checked here before profile calculation.
 */
export function drawSupportPointProgressionLayer({
  ctx,
  building,
  state,
  capturedByPlayer,
  controlColor,
  time,
  renderZoom = 1
}: SupportPointProgressionLayerArgs): boolean {
  if (!capturedByPlayer || !isSupportPointBuildingId(building.id)) return false;

  return drawSupportPointProgressionOverlay({
    ctx,
    building,
    profile: getSupportPointVisualProfile(state),
    controlColor,
    time,
    renderZoom
  });
}
