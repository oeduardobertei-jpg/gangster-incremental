import type { AllyEntity, RivalEntity } from '../../types/game';

type CrowdEntity = AllyEntity | RivalEntity;

export function drawCrowdUnitSprite(
  ctx: CanvasRenderingContext2D,
  unit: CrowdEntity,
  isRival: boolean,
  time: number
) {
  const angle = unit.facingAngle ?? Math.atan2(unit.vy, unit.vx);
  const isBoss = unit.type === 'chefe_morro';
  const isBike = unit.type === 'batedor_moto';
  const scale = isBoss ? 1.25 : 1;
  const bob = Math.hypot(unit.vx, unit.vy) > .05 ? Math.sin((unit.walkDistance ?? 0) * .28) * .7 : 0;

  ctx.fillStyle = 'rgba(0,0,0,.42)';
  ctx.beginPath();
  ctx.ellipse(unit.x, unit.y + 8, isBike ? 14 : 9 * scale, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(unit.x, unit.y + bob);
  ctx.rotate(angle);
  if (isBike) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(-13, -4, 26, 8);
    ctx.fillStyle = unit.color;
    ctx.fillRect(-6, -3, 13, 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(7, -5, 3, 10);
    ctx.fillStyle = '#0b0f16';
    ctx.beginPath(); ctx.arc(-11, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = unit.color;
    ctx.beginPath(); ctx.arc(0, 0, 4.4, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#111827';
    ctx.fillRect(-7 * scale, -5 * scale, 7 * scale, 3 * scale);
    ctx.fillRect(-7 * scale, 2 * scale, 7 * scale, 3 * scale);
    ctx.fillStyle = unit.color;
    ctx.beginPath();
    ctx.roundRect(-4 * scale, -6 * scale, 9 * scale, 12 * scale, 2.5 * scale);
    ctx.fill();
    ctx.fillStyle = isRival ? '#d6a36c' : '#c98a57';
    ctx.beginPath(); ctx.arc(5.5 * scale, 0, 3.5 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#10141b';
    ctx.lineWidth = isBoss ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(2 * scale, 0); ctx.lineTo(13 * scale, 0); ctx.stroke();
  }

  ctx.fillStyle = unit.color;
  ctx.fillRect(-4 * scale, -1.2 * scale, 8 * scale, 2.4 * scale);
  ctx.restore();
  if (isBoss) {
    ctx.strokeStyle = `rgba(244,63,94,${.40 + .15 * Math.sin(time * .008)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(unit.x, unit.y, 19, 0, Math.PI * 2); ctx.stroke();
  }
}
