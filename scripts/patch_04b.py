from pathlib import Path
import re

p = Path(r'C:\Users\Eduardo Bertei\Desktop\gangster-incremental\src\components\GameCanvas.tsx')
s = p.read_text(encoding='utf-8')

def rep(old: str, new: str, expected: int = 1):
    global s
    count = s.count(old)
    if count != expected:
        raise RuntimeError(f'expected {expected} matches, got {count}: {old[:80]!r}')
    s = s.replace(old, new, expected)

rep('  drawFavelaTileset, \n', '  drawFavelaTileset, \n  drawFavelaAmbient, \n')
rep("} from './canvas/camera2D';\n", "} from './canvas/camera2D';\n\nconst MAX_COMBAT_PARTICLES = 600;\nconst MAX_FLOATING_TEXTS = 80;\n")
rep(
    '  const particlesRef = useRef<CombatParticle[]>([]);\n',
    "  const particlesRef = useRef<CombatParticle[]>([]);\n  const staticMapCanvasRef = useRef<HTMLCanvasElement | null>(null);\n  const staticMapKeyRef = useRef<string>('');\n"
)
old_hover = """  // Mouse & UI hover (coordinates in both world and screen space)
  const [mousePos, setMousePos] = useState<{ x: number; y: number; screenX: number; screenY: number }>({
    x: 0,
    y: 0,
    screenX: 0,
    screenY: 0
  });
  const [hoveredEntity, setHoveredEntity] = useState<{ type: 'rival' | 'fallen' | 'obstacle' | 'none'; name?: string } | null>(null);
"""
new_hover = """  // 0.4B: pointer/hover stay in refs so pointer movement never restarts the RAF effect.
  const mousePosRef = useRef<{ x: number; y: number; screenX: number; screenY: number }>({
    x: 0,
    y: 0,
    screenX: 0,
    screenY: 0
  });
  const hoveredEntityRef = useRef<{ type: 'rival' | 'fallen' | 'obstacle' | 'none'; name?: string } | null>(null);
"""
rep(old_hover, new_hover)
rep('    setMousePos(coords);\n', '    mousePosRef.current = coords;\n')
s = re.sub(r"setHoveredEntity\((\{[^\r\n]+\})\);", r"hoveredEntityRef.current = \1;", s)
s = s.replace('setHoveredEntity(null);', 'hoveredEntityRef.current = null;')

rep(
    "      life: 0.9\n    });\n",
    "      life: 0.9\n    });\n    if (floatingTextsRef.current.length > MAX_FLOATING_TEXTS) {\n      floatingTextsRef.current.splice(0, floatingTextsRef.current.length - MAX_FLOATING_TEXTS);\n    }\n"
)
old_render = """      // Camera transform: viewport is only a window into the fixed logical world.
      ctx.save();
      const camera = cameraRef.current;
      ctx.translate(viewportWidth / 2, viewportHeight / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.centerX, -camera.centerY);

      // 1. Layered Tileset (Ground, cobbles, asphalt, stairs, roofs, poles)
      drawFavelaTileset(ctx, width, height, currentTerritory.id, factionConfig, currentTime);
"""
new_render = """      // Camera transform: viewport is only a window into the fixed logical world.
      ctx.save();
      const camera = cameraRef.current;
      ctx.translate(viewportWidth / 2, viewportHeight / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.centerX, -camera.centerY);

      const halfVisibleW = viewportWidth / (2 * camera.zoom);
      const halfVisibleH = viewportHeight / (2 * camera.zoom);
      const cullMargin = 90;
      const visibleLeft = camera.centerX - halfVisibleW - cullMargin;
      const visibleRight = camera.centerX + halfVisibleW + cullMargin;
      const visibleTop = camera.centerY - halfVisibleH - cullMargin;
      const visibleBottom = camera.centerY + halfVisibleH + cullMargin;
      const isVisible = (x: number, y: number, radius = 0) =>
        x + radius >= visibleLeft && x - radius <= visibleRight &&
        y + radius >= visibleTop && y - radius <= visibleBottom;
"""
rep(old_render, new_render)
cache_block = """
      // 1. Static map cache: rebuild the procedural city only when its identity changes.
      const staticMapKey = `${currentTerritory.id}:${factionConfig.tag}:${width}x${height}`;
      if (!staticMapCanvasRef.current || staticMapKeyRef.current !== staticMapKey) {
        const layer = document.createElement('canvas');
        layer.width = width;
        layer.height = height;
        const layerCtx = layer.getContext('2d');
        if (layerCtx) {
          drawFavelaTileset(layerCtx, width, height, currentTerritory.id, factionConfig, 0, false);
        }
        staticMapCanvasRef.current = layer;
        staticMapKeyRef.current = staticMapKey;
      }
      if (staticMapCanvasRef.current) {
        ctx.drawImage(staticMapCanvasRef.current, 0, 0, width, height);
      }
      drawFavelaAmbient(ctx, width, height, factionConfig, currentTime);
"""
anchor = """      const isVisible = (x: number, y: number, radius = 0) =>
        x + radius >= visibleLeft && x - radius <= visibleRight &&
        y + radius >= visibleTop && y - radius <= visibleBottom;
"""
rep(anchor, anchor + cache_block)

cull_pairs = [
    ('      groundMarksRef.current.forEach(gm => {\n        ctx.fillStyle', '      groundMarksRef.current.forEach(gm => {\n        if (!isVisible(gm.x, gm.y, gm.radius)) return;\n        ctx.fillStyle'),
    ('      obstaclesRef.current.forEach(obs => {\n        drawCoverObstacle', '      obstaclesRef.current.forEach(obs => {\n        if (!isVisible(obs.x, obs.y, Math.max(obs.w, obs.h))) return;\n        drawCoverObstacle'),
    ('      fallenRef.current.forEach(f => {\n        drawFallenSprite', '      fallenRef.current.forEach(f => {\n        if (!isVisible(f.x, f.y, 24)) return;\n        drawFallenSprite'),
]
for old, new in cull_pairs:
    rep(old, new)
cull_pairs = [
    ('      alliesRef.current.forEach(a => {\n        drawAllySprite', '      alliesRef.current.forEach(a => {\n        if (!isVisible(a.x, a.y, 30)) return;\n        drawAllySprite'),
    ('      rivalsRef.current.forEach(r => {\n        drawRivalSprite', '      rivalsRef.current.forEach(r => {\n        if (!isVisible(r.x, r.y, r.radius + 26)) return;\n        drawRivalSprite'),
    ('      bulletsRef.current.forEach(b => {\n        drawBulletProjectile', '      bulletsRef.current.forEach(b => {\n        if (!isVisible(b.x, b.y, 16)) return;\n        drawBulletProjectile'),
    ('      floatingTextsRef.current.forEach(ft => {\n        ctx.font', '      floatingTextsRef.current.forEach(ft => {\n        if (!isVisible(ft.x, ft.y, 30)) return;\n        ctx.font'),
]
for old, new in cull_pairs:
    rep(old, new)

rep(
    '      // 9. Combat Particles (Muzzle flashes, sparks, bullet casings, blood, smoke, shockwaves)\n      for (let i = particlesRef.current.length - 1; i >= 0; i--) {\n',
    '      // 9. Combat Particles (Muzzle flashes, sparks, bullet casings, blood, smoke, shockwaves)\n      if (particlesRef.current.length > MAX_COMBAT_PARTICLES) {\n        particlesRef.current.splice(0, particlesRef.current.length - MAX_COMBAT_PARTICLES);\n      }\n      for (let i = particlesRef.current.length - 1; i >= 0; i--) {\n'
)
rep(
    '        if (p.life <= 0) {\n          particlesRef.current.splice(i, 1);\n          continue;\n        }\n\n        ctx.save();\n',
    '        if (p.life <= 0) {\n          particlesRef.current.splice(i, 1);\n          continue;\n        }\n        if (!isVisible(p.x, p.y, Math.max(12, p.size * 3))) continue;\n\n        ctx.save();\n'
)
rep(
    "      // 11. Tooltip (Screen space directly above cursor)\n      if (hoveredEntity && hoveredEntity.type !== 'none') {\n",
    "      // 11. Tooltip (screen-space; refs avoid React renders on pointer movement)\n      const hoveredEntity = hoveredEntityRef.current;\n      const mousePos = mousePosRef.current;\n      if (hoveredEntity && hoveredEntity.type !== 'none') {\n"
)
rep('    hoveredEntity,\n', '')
rep('    mousePos,\n', '')

if 'setMousePos(' in s or 'setHoveredEntity(' in s:
    raise RuntimeError('React pointer state setters remain')
if "drawFavelaTileset(ctx, width, height, currentTerritory.id, factionConfig, currentTime)" in s:
    raise RuntimeError('per-frame full map render remains')

p.write_text(s, encoding='utf-8')
print('0.4B GameCanvas patch applied')
