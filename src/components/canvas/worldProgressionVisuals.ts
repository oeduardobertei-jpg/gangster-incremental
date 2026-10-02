import type { FactionConfig, GameState } from '../../types/game';
import { getVisualTier, WORLD_MATERIALS } from '../../data/visualTokens';

const tier = (state: GameState, id: string, max: number) => getVisualTier(state.upgrades[id] || 0, max);

const drawBarricade = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  color: string
) => {
  ctx.fillStyle = '#3f4650';
  ctx.fillRect(x, y, w, 7);
  ctx.fillStyle = color;
  for (let i = 0; i < Math.floor(w / 15); i++) {
    ctx.fillRect(x + 4 + i * 15, y + 1, 8, 2);
  }
  ctx.strokeStyle = '#798391';
  ctx.strokeRect(x, y, w, 7);
};

const drawCrate = (ctx: CanvasRenderingContext2D, x: number, y: number, accent: string) => {
  ctx.fillStyle = '#5c4327';
  ctx.fillRect(x, y, 16, 12);
  ctx.strokeStyle = '#a17a45';
  ctx.strokeRect(x, y, 16, 12);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = .7;
  ctx.beginPath(); ctx.moveTo(x+3,y+6); ctx.lineTo(x+13,y+6); ctx.stroke();
  ctx.globalAlpha = 1;
};

const drawBike = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.arc(x+14, y, 4, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x+2,y-1); ctx.lineTo(x+7,y-8); ctx.lineTo(x+12,y-1); ctx.lineTo(x+5,y-1); ctx.stroke();
};

export function drawCommandBaseProgression(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  faction: FactionConfig,
  state: GameState,
  time: number
) {  const fortTier = tier(state, 'boca_fortified_bunkers', 40);
  const radioTier = Math.max(
    tier(state, 'intel_radio_network', 50),
    tier(state, 'intel_central_command', 40)
  );
  const ammoTier = tier(state, 'boca_auto_ammo_scavenge', 15);
  const medicTier = tier(state, 'armory_medics_safehouse', 25);
  const motoTier = tier(state, 'armory_motorcycle_squad', 30);
  const autoTier = tier(state, 'sindicato_auto_recruit', 10);

  ctx.save();
  // Sombra e plataforma principal.
  ctx.fillStyle = 'rgba(0,0,0,.36)';
  ctx.beginPath();
  ctx.ellipse(x + 5, y + 5, 52 + fortTier * 5, 19 + fortTier * 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = WORLD_MATERIALS.concrete.shadow;
  ctx.beginPath();
  ctx.roundRect(x - 46 - fortTier * 4, y - 24, 92 + fortTier * 8, 38, 10);
  ctx.fill();
  ctx.strokeStyle = `${faction.color}88`;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#121b28';
  ctx.beginPath();
  ctx.roundRect(x - 25, y - 50, 50, 32, 5);
  ctx.fill();
  ctx.strokeStyle = faction.color;
  ctx.stroke();
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '800 8px "Chakra Petch", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COMANDO', x, y - 37);
  ctx.fillStyle = faction.color;
  ctx.font = '900 11px "Chakra Petch", sans-serif';
  ctx.fillText(faction.tag, x, y - 25);

  // Fortificação ganha massa conforme tiers.
  if (fortTier >= 1) {
    drawBarricade(ctx, x - 62, y + 4, 42, faction.color);
    drawBarricade(ctx, x + 20, y + 4, 42, faction.color);
  }
  if (fortTier >= 2) {
    drawBarricade(ctx, x - 70, y - 15, 28, faction.color);
    drawBarricade(ctx, x + 42, y - 15, 28, faction.color);
  }
  if (fortTier >= 4) {
    ctx.fillStyle = '#2f3742';
    ctx.fillRect(x - 74, y - 39, 17, 29);
    ctx.fillRect(x + 57, y - 39, 17, 29);
    ctx.fillStyle = faction.color;
    ctx.fillRect(x - 74, y - 39, 17, 3);
    ctx.fillRect(x + 57, y - 39, 17, 3);
  }
  // Comunicação: mastro, antena e painel crescem por tier.
  if (radioTier >= 1) {
    const mastTop = y - 72 - radioTier * 3;
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y - 50); ctx.lineTo(x, mastTop); ctx.stroke();
    ctx.strokeStyle = faction.color;
    ctx.beginPath(); ctx.arc(x, mastTop + 2, 8 + radioTier * 1.5, Math.PI, Math.PI * 2); ctx.stroke();
    if (radioTier >= 3) {
      ctx.strokeStyle = '#64748b';
      ctx.beginPath(); ctx.moveTo(x - 12, y - 50); ctx.lineTo(x, mastTop + 12); ctx.lineTo(x + 12, y - 50); ctx.stroke();
    }
    if (radioTier >= 5) {
      const pulse = 10 + (Math.sin(time * .004) + 1) * 4;
      ctx.strokeStyle = `${faction.color}55`;
      ctx.beginPath(); ctx.arc(x, mastTop + 2, pulse, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    }
  }

  // Logística de munição.
  for (let i = 0; i < ammoTier; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    drawCrate(ctx, x + 33 + col * 18, y - 10 - row * 14, faction.color);
  }

  // Posto médico discreto.
  if (medicTier >= 1) {
    ctx.fillStyle = '#d9e1dc';
    ctx.fillRect(x - 54, y - 22, 22 + medicTier * 2, 17);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x - 45, y - 19, 4, 11);
    ctx.fillRect(x - 49, y - 15, 12, 4);
    if (medicTier >= 4) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 58, y - 5, 31, 3);
    }
  }

  // Garagem de motos.
  for (let i = 0; i < Math.min(4, motoTier); i++) {
    drawBike(ctx, x - 63 + i * 18, y + 18, faction.color);
  }

  // Auto-convocação: despacho visual ativo.
  if (autoTier >= 1) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 16, y - 11, 32, 15);
    const blink = Math.sin(time * .008) > 0;
    ctx.fillStyle = blink ? '#22c55e' : '#166534';
    ctx.fillRect(x - 11, y - 7, 5, 5);
    ctx.fillStyle = faction.color;
    ctx.fillRect(x - 2, y - 7, 5, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 7, y - 7, 5, 5);
  }

  ctx.restore();
}