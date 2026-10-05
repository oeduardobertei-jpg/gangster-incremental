import type { TacticalBuilding } from './favelaRenderer';
import { getStageFeatureProgress } from '../../rules/incrementalBuildingVisuals';
import {
  isSupportPointBuildingId,
  type SupportPointVisualProfile
} from '../../rules/supportPointVisualProgression';

type SupportPointRenderArgs = {
  ctx: CanvasRenderingContext2D;
  building: TacticalBuilding;
  profile: SupportPointVisualProfile;
  controlColor: string;
  time: number;
  renderZoom?: number;
};

const line = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 1
) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const crate = (ctx: CanvasRenderingContext2D, x: number, y: number, accent: string) => {
  ctx.fillStyle = '#674a2d';
  ctx.fillRect(x, y, 12, 8);
  ctx.strokeStyle = '#a27a49';
  ctx.strokeRect(x, y, 12, 8);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = .55;
  line(ctx, x + 2, y + 4, x + 10, y + 4, accent, 1);
  ctx.globalAlpha = 1;
};

const sandbag = (ctx: CanvasRenderingContext2D, x: number, y: number, w = 12) => {
  ctx.fillStyle = '#786a52';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 6, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(42,37,29,.62)';
  ctx.lineWidth = .7;
  ctx.stroke();
};

/**
 * 1.1.1 visual layer for the T1 support network.
 *
 * This renderer intentionally adds readable modules around the existing
 * authored Esconderijo/Boca architecture instead of replacing that building.
 * The underlying tactical footprint therefore stays unchanged and collision
 * remains authoritative in GameCanvas.
 */
export function drawSupportPointProgressionOverlay({
  ctx,
  building: b,
  profile,
  controlColor,
  time,
  renderZoom = 1
}: SupportPointRenderArgs): boolean {
  if (!isSupportPointBuildingId(b.id)) return false;

  const { stage, stageProgress, maturity, tiers } = profile;
  if (profile.score <= 0 && stage === 0) return true;

  const fortification = tiers.fortification;
  const barricades = tiers.barricades;
  const riflemen = tiers.riflemen;
  const ammoLogistics = tiers.ammoLogistics;
  const medics = tiers.medics;

  const mediumLod = renderZoom >= .82;
  const closeLod = renderZoom >= 1.02;
  const roofLift = b.type === 'laje' ? 34 : 28;
  const roofY = b.y - roofLift;
  const facadeY = b.y + b.h - roofLift;
  const frontageY = facadeY + roofLift + 5;
  const fortProgress = getStageFeatureProgress(stage, stageProgress, 1, .32);
  const logisticsProgress = getStageFeatureProgress(stage, stageProgress, 1, .20);
  const roofProgress = getStageFeatureProgress(stage, stageProgress, 2, .24);
  const commandProgress = getStageFeatureProgress(stage, stageProgress, 3, .28);

  ctx.save();

  // Continuous maturity: the immediate frontage becomes increasingly occupied
  // and visually controlled without touching the physical building footprint.
  ctx.globalAlpha = .10 + Math.min(.18, maturity * .045);
  ctx.fillStyle = controlColor;
  ctx.beginPath();
  ctx.ellipse(b.x + b.w / 2, frontageY + 2, b.w * (.34 + maturity * .025), 9 + maturity * 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (fortification > 0 || stage >= 1) {
    const wingW = 14 + 7 * fortProgress + fortification * 1.6;
    const wingH = 5 + 3 * fortProgress + Math.min(4, fortification * .7);
    for (const side of [-1, 1] as const) {
      const wingX = side < 0 ? b.x - wingW + 8 : b.x + b.w - 8;
      const wingY = frontageY - wingH + 1;
      ctx.fillStyle = '#5e574c';
      ctx.beginPath();
      ctx.roundRect(wingX, wingY, wingW, wingH, 2.5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(177,168,151,.35)';
      ctx.lineWidth = .8;
      ctx.stroke();
    }
  }

  if (barricades > 0 && mediumLod) {
    const rows = Math.min(2, 1 + (barricades >= 3 ? 1 : 0));
    for (let row = 0; row < rows; row++) {
      const count = 2 + Math.min(3, barricades);
      const startX = b.x + b.w / 2 - (count * 10) / 2;
      for (let i = 0; i < count; i++) {
        sandbag(ctx, startX + i * 10, frontageY + 6 + row * 5 - (i % 2), 11);
      }
    }
  }

  if (ammoLogistics > 0) {
    const count = 1 + Math.min(3, Math.floor((ammoLogistics + 1) / 2));
    const reveal = Math.max(1, Math.ceil(count * logisticsProgress));
    for (let i = 0; i < reveal; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side > 0 ? b.x + b.w - 9 - i * 3 : b.x - 5 + i * 3;
      const y = frontageY - 3 - (i % 2) * 7;
      crate(ctx, x, y, controlColor);
    }
  }

  if (medics > 0 && mediumLod) {
    const panelW = 13 + medics * 1.4;
    const panelX = b.x + 9;
    const panelY = facadeY + 6;
    ctx.fillStyle = 'rgba(230,238,232,.86)';
    ctx.fillRect(panelX, panelY, panelW, 8);
    ctx.strokeStyle = '#7d8b82';
    ctx.strokeRect(panelX, panelY, panelW, 8);
    ctx.fillStyle = '#3f6f55';
    ctx.fillRect(panelX + 4, panelY + 1.5, 2.5, 5);
    ctx.fillRect(panelX + 2.8, panelY + 2.7, 5, 2.5);
  }

  if (riflemen > 0 && roofProgress > 0) {
    const postW = 18 + riflemen * 1.5;
    const postH = 6 + roofProgress * 8;
    const postX = b.x + b.w - postW - 9;
    const postY = roofY - postH + 5;
    ctx.fillStyle = '#2d3338';
    ctx.fillRect(postX, postY, postW, postH);
    ctx.strokeStyle = 'rgba(171,183,190,.52)';
    ctx.strokeRect(postX, postY, postW, postH);
    if (mediumLod) {
      line(ctx, postX + 4, postY + 3, postX + postW - 4, postY + 3, controlColor, 1.2);
    }
  }

  if (stage >= 2) {
    const mastX = b.x + b.w * .58;
    const mastBottom = roofY + 7;
    const mastTop = mastBottom - (8 + 18 * roofProgress);
    line(ctx, mastX, mastBottom, mastX, mastTop, '#929ca5', 1.2);
    if (mediumLod) {
      line(ctx, mastX - 6, mastTop + 5, mastX + 6, mastTop + 5, controlColor, 1);
    }
  }

  if (stage >= 3 && commandProgress > 0) {
    const signW = 27 + commandProgress * 13;
    const signX = b.x + (b.w - signW) / 2;
    const signY = roofY - 7;
    ctx.fillStyle = 'rgba(10,15,20,.90)';
    ctx.fillRect(signX, signY, signW, 7);
    ctx.strokeStyle = controlColor;
    ctx.globalAlpha = .58;
    ctx.strokeRect(signX, signY, signW, 7);
    ctx.globalAlpha = 1;
    if (closeLod) {
      ctx.fillStyle = '#edf2f5';
      ctx.font = '700 5.2px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.id === 'boca_leste' ? 'PONTO' : 'APOIO', signX + signW / 2, signY + 3.8, signW - 4);
    }
  }

  if (stage >= 3 && closeLod) {
    const pulse = .48 + Math.sin(time * .004 + b.x * .01) * .12;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = controlColor;
    ctx.beginPath();
    ctx.arc(b.x + b.w - 12, roofY - 10, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
  return true;
}
