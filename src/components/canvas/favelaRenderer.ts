import { 
  RivalEntity, 
  AllyEntity, 
  FallenEntity, 
  BulletProjectile, 
  FactionConfig,
  CoverObstacle 
} from '../../types/game';

export interface CombatParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'blood' | 'casing' | 'muzzle' | 'gold_dust' | 'shockwave' | 'fire';
  gravity?: number;
  friction?: number;
  rotation?: number;
  vRot?: number;
}

export interface TacticalBuilding {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  doorX: number;
  doorY: number;
  type: 'brick' | 'laje' | 'zinc';
  hasWaterTank: boolean;
  isRivalHub: boolean;
  graffiti: string;
  graffitiColor: string;
}

export function getTacticalBuildings(width: number, height: number, factionConfig: FactionConfig): TacticalBuilding[] {
  // Enforce consistent faction colors: PCC is always Blue (#3b82f6) and CV is always Red (#ef4444)
  const isPlayerCV = factionConfig.tag === 'CV';
  const cvColor = '#ef4444';
  const pccColor = '#3b82f6';

  const allyTag = isPlayerCV ? 'CV' : 'PCC';
  const allyColor = isPlayerCV ? cvColor : pccColor;
  const rivalTag = isPlayerCV ? 'PCC' : 'CV';
  const rivalColor = isPlayerCV ? pccColor : cvColor;

  return [
    // Left sector
    { 
      id: 'beco_01', 
      x: width * 0.04, 
      y: height * 0.74, 
      w: 80, 
      h: 58, 
      doorX: width * 0.04 + 80 + 12, 
      doorY: height * 0.74 + 30, 
      type: 'brick', 
      label: 'Beco 01', 
      hasWaterTank: true, 
      isRivalHub: false, 
      graffiti: allyTag, 
      graffitiColor: allyColor 
    },
    { 
      id: 'laje_ponto', 
      x: width * 0.02, 
      y: height * 0.42, 
      w: 88, 
      h: 64, 
      doorX: width * 0.02 + 88 + 14, 
      doorY: height * 0.42 + 32, 
      type: 'laje', 
      label: 'Laje do Ponto', 
      hasWaterTank: true, 
      isRivalHub: true, 
      graffiti: rivalTag, 
      graffitiColor: rivalColor 
    },
    { 
      id: 'barraquinha', 
      x: width * 0.05, 
      y: height * 0.10, 
      w: 78, 
      h: 54, 
      doorX: width * 0.05 + 78 + 12, 
      doorY: height * 0.10 + 26, 
      type: 'zinc', 
      label: 'Barraquinha', 
      hasWaterTank: false, 
      isRivalHub: true, 
      graffiti: rivalTag, 
      graffitiColor: rivalColor 
    },
    // Right sector (Main Rival Strongholds / Incremancer Hubs)
    { 
      id: 'esconderijo', 
      x: width * 0.77, 
      y: height * 0.70, 
      w: 92, 
      h: 64, 
      doorX: width * 0.77 - 14, 
      doorY: height * 0.70 + 32, 
      type: 'laje', 
      label: 'Esconderijo', 
      hasWaterTank: true, 
      isRivalHub: true, 
      graffiti: rivalTag, 
      graffitiColor: rivalColor 
    },
    { 
      id: 'boca_leste', 
      x: width * 0.76, 
      y: height * 0.36, 
      w: 94, 
      h: 68, 
      doorX: width * 0.76 - 14, 
      doorY: height * 0.36 + 34, 
      type: 'brick', 
      label: 'Boca da Leste', 
      hasWaterTank: true, 
      isRivalHub: true, 
      graffiti: rivalTag, 
      graffitiColor: rivalColor 
    },
    { 
      id: 'torre_guarda', 
      x: width * 0.75, 
      y: height * 0.06, 
      w: 84, 
      h: 60, 
      doorX: width * 0.75 - 12, 
      doorY: height * 0.06 + 30, 
      type: 'zinc', 
      label: 'Torre de Guarda', 
      hasWaterTank: true, 
      isRivalHub: true, 
      graffiti: rivalTag, 
      graffitiColor: rivalColor 
    },
    // Center-top lookout
    { 
      id: 'mirante', 
      x: width * 0.37, 
      y: height * 0.03, 
      w: 74, 
      h: 50, 
      doorX: width * 0.37 + 37, 
      doorY: height * 0.03 + 50 + 12, 
      type: 'laje', 
      label: 'Mirante', 
      hasWaterTank: true, 
      isRivalHub: true, 
      graffiti: rivalTag, 
      graffitiColor: rivalColor 
    }
  ];
}

// =========================================================================
// 1. URBAN FAVELA & MORRO TILESET RENDERER (Layered Procedural Architecture)
// =========================================================================
export function drawFavelaTileset(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  territoryId: number,
  factionConfig: FactionConfig,
  time: number
) {
  // --- LAYER 1: Base Hillside Earth & Terrain Slope Gradient ---
  const groundGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (territoryId === 1) {
    groundGrad.addColorStop(0, '#0a0d14');
    groundGrad.addColorStop(0.5, '#131822');
    groundGrad.addColorStop(1, '#090c12');
  } else if (territoryId === 2) {
    groundGrad.addColorStop(0, '#12111b');
    groundGrad.addColorStop(0.5, '#1c1a29');
    groundGrad.addColorStop(1, '#0f0e17');
  } else if (territoryId === 3) {
    groundGrad.addColorStop(0, '#16141c');
    groundGrad.addColorStop(0.5, '#211d2c');
    groundGrad.addColorStop(1, '#121017');
  } else if (territoryId === 4) {
    groundGrad.addColorStop(0, '#191116');
    groundGrad.addColorStop(0.5, '#241820');
    groundGrad.addColorStop(1, '#140c11');
  } else {
    groundGrad.addColorStop(0, '#0d101e');
    groundGrad.addColorStop(0.5, '#171d30');
    groundGrad.addColorStop(1, '#0c0f1c');
  }
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 0, width, height);

  // --- LAYER 2: Vielas de Paralelepípedo & Calçadas de Concreto ---
  // Realistic Portuguese stone/cobblestone alley paving
  const alleyX = width * 0.18;
  const alleyW = 54;
  ctx.fillStyle = '#171e2b';
  ctx.fillRect(alleyX, 0, alleyW, height);

  // Cobblestone paver grid on the lateral alley
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const cobbleSize = 14;
  for (let y = 0; y < height; y += cobbleSize) {
    const shift = (Math.floor(y / cobbleSize) % 2) * (cobbleSize / 2);
    for (let x = alleyX; x < alleyX + alleyW; x += cobbleSize) {
      ctx.strokeRect(x + shift, y, cobbleSize - 2, cobbleSize - 2);
    }
  }

  // Second right-side winding alley
  const rightAlleyX = width * 0.72;
  const rightAlleyW = 48;
  ctx.fillStyle = '#171e2b';
  ctx.fillRect(rightAlleyX, 0, rightAlleyW, height);
  for (let y = 0; y < height; y += cobbleSize) {
    const shift = (Math.floor(y / cobbleSize) % 2) * (cobbleSize / 2);
    for (let x = rightAlleyX; x < rightAlleyX + rightAlleyW; x += cobbleSize) {
      ctx.strokeRect(x + shift, y, cobbleSize - 2, cobbleSize - 2);
    }
  }

  // --- LAYER 3: Asfalto Rachado & Rua Principal com Bueiros e Óleo ---
  ctx.save();
  ctx.beginPath();
  const roadWidth = Math.min(115, width * 0.28);
  const midX = width / 2;

  // Curving asphalt path
  ctx.moveTo(midX - 25, height);
  ctx.bezierCurveTo(
    midX - 70, height * 0.65,
    midX + 70, height * 0.35,
    midX + 15, 0
  );
  ctx.lineWidth = roadWidth;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = '#1e2330';
  ctx.stroke();

  // Curbs (Meio-fio de calçado de concreto pintado de branco e sarjeta)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Yellow broken lane divider on asphalt
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([14, 16]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Procedural Asphalt Cracks (Rachaduras no asfalto com ramificações)
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.lineWidth = 1.2;
  const cracks = [
    { x: midX - 20, y: height * 0.78, branches: [{ dx: -12, dy: 10 }, { dx: 14, dy: 14 }] },
    { x: midX + 32, y: height * 0.52, branches: [{ dx: -10, dy: 12 }, { dx: 8, dy: -8 }] },
    { x: midX - 10, y: height * 0.25, branches: [{ dx: 15, dy: 9 }, { dx: -8, dy: 16 }] }
  ];
  cracks.forEach(c => {
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    c.branches.forEach(b => {
      ctx.lineTo(c.x + b.dx, c.y + b.dy);
      ctx.moveTo(c.x, c.y);
    });
    ctx.stroke();
  });

  // Dark Oil Stains on Asphalt (Manchas de óleo de motor)
  const oilStains = [
    { x: midX - 15, y: height * 0.82, r1: 14, r2: 7, rot: 0.3 },
    { x: midX + 22, y: height * 0.45, r1: 12, r2: 6, rot: -0.2 }
  ];
  oilStains.forEach(os => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(os.x, os.y, os.r1, os.r2, os.rot, 0, Math.PI * 2);
    ctx.fill();
  });

  // Cast Iron Road Manholes (Bueiros)
  const manholes = [
    { x: midX - 32, y: height * 0.72 },
    { x: midX + 28, y: height * 0.38 },
    { x: midX + 8, y: height * 0.16 }
  ];
  manholes.forEach(m => {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(m.x, m.y, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Inner grate
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.x - 7, m.y);
    ctx.lineTo(m.x + 7, m.y);
    ctx.moveTo(m.x, m.y - 7);
    ctx.lineTo(m.x, m.y + 7);
    ctx.stroke();
  });

  // --- LAYER 4: Escadarias de Concreto (Hillside Stairs) ---
  const stairX = width * 0.23;
  const stairY = height * 0.46;
  const stairW = 32;
  const stairH = 55;
  ctx.fillStyle = '#334155';
  ctx.fillRect(stairX, stairY, stairW, stairH);

  // Steps
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  for (let s = stairY; s < stairY + stairH; s += 6) {
    ctx.beginPath();
    ctx.moveTo(stairX, s);
    ctx.lineTo(stairX + stairW, s);
    ctx.stroke();
  }
  // Metallic Handrail (Corrimão amarelo desgastado)
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(stairX + 2, stairY);
  ctx.lineTo(stairX + 2, stairY + stairH);
  ctx.stroke();

  // --- LAYER 5: Construções Táticas & Pontos de Surgimento (Bocas, Esconderijos, Lajes) ---
  const buildings = getTacticalBuildings(width, height, factionConfig);

  buildings.forEach(b => {
    // Structure Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(b.x + 4, b.y + 4, b.w, b.h);

    if (b.type === 'brick') {
      // Tijolo Aparente Baiano
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Horizontal Mortar lines
      ctx.strokeStyle = '#431407';
      ctx.lineWidth = 1;
      const rowHeight = 7;
      for (let by = b.y; by < b.y + b.h; by += rowHeight) {
        ctx.beginPath();
        ctx.moveTo(b.x, by);
        ctx.lineTo(b.x + b.w, by);
        ctx.stroke();
      }

      // Concrete roof edge
      ctx.fillStyle = '#64748b';
      ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, 5);
    } else if (b.type === 'laje') {
      // Laje de Concreto com Ferros de Espera
      ctx.fillStyle = '#334155';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      // Rebars (Ferros de espera nos cantos)
      ctx.fillStyle = '#ea580c';
      const corners = [
        { cx: b.x + 3, cy: b.y + 3 },
        { cx: b.x + b.w - 5, cy: b.y + 3 },
        { cx: b.x + 3, cy: b.y + b.h - 5 },
        { cx: b.x + b.w - 5, cy: b.y + b.h - 5 }
      ];
      corners.forEach(c => {
        ctx.fillRect(c.cx, c.cy - 5, 2, 8);
      });

      // Rooftop Clothesline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(b.x + 10, b.y + 14);
      ctx.quadraticCurveTo(b.x + b.w / 2, b.y + 19, b.x + b.w - 10, b.y + 14);
      ctx.stroke();

      const clothesColors = ['#ef4444', '#38bdf8', '#fbbf24', '#f1f5f9'];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = clothesColors[i % clothesColors.length];
        const clX = b.x + 16 + i * 14;
        const clY = b.y + 15;
        ctx.fillRect(clX, clY, 8, 7);
      }
    } else {
      // Telhado de Zinco Ondulado
      ctx.fillStyle = '#475569';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      for (let bx = b.x + 5; bx < b.x + b.w; bx += 6) {
        ctx.beginPath();
        ctx.moveTo(bx, b.y);
        ctx.lineTo(bx, b.y + b.h);
        ctx.stroke();
      }
    }

    // Doorway / Portal de Surgimento de Tropas (Incremancer Spawn Door)
    const doorW = 16;
    const doorH = 20;
    const isLeftSide = b.doorX > b.x + b.w / 2;
    const drX = isLeftSide ? b.x + b.w - doorW - 4 : b.x + 4;
    const drY = b.y + b.h - doorH;

    // Recessed dark doorway
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(drX, drY, doorW, doorH, [3, 3, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Door frame threshold
    ctx.fillStyle = '#334155';
    ctx.fillRect(drX - 2, drY + doorH - 2, doorW + 4, 3);

    // Glowing Faction Light Spill from Doorway (Blue for PCC, Red for CV)
    const lightGlow = ctx.createRadialGradient(drX + doorW / 2, drY + doorH / 2, 2, drX + doorW / 2, drY + doorH / 2, 22);
    lightGlow.addColorStop(0, `${b.graffitiColor}55`);
    lightGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lightGlow;
    ctx.fillRect(drX - 10, drY - 5, doorW + 20, doorH + 15);

    // Caixa d'Água Azul Fortlev no teto
    if (b.hasWaterTank) {
      const tankX = b.x + b.w - 18;
      const tankY = b.y + 18;
      const tankR = 11;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(tankX + 2, tankY + 2, tankR, 0, Math.PI * 2);
      ctx.fill();

      const tankGrad = ctx.createRadialGradient(tankX - 3, tankY - 3, 2, tankX, tankY, tankR);
      tankGrad.addColorStop(0, '#38bdf8');
      tankGrad.addColorStop(0.6, '#0284c7');
      tankGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = tankGrad;
      ctx.beginPath();
      ctx.arc(tankX, tankY, tankR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(tankX, tankY, tankR * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    // Faction Flag waving on rooftop
    if (b.isRivalHub) {
      const poleX = b.x + 8;
      const poleY = b.y - 12;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(poleX, b.y + 4);
      ctx.lineTo(poleX, poleY);
      ctx.stroke();

      // Flag in Rival Faction Color (PCC Blue or CV Red)
      const flagWave = Math.sin(time * 0.005 + b.x) * 2;
      ctx.fillStyle = b.graffitiColor;
      ctx.beginPath();
      ctx.moveTo(poleX, poleY);
      ctx.lineTo(poleX + 14, poleY + 3 + flagWave);
      ctx.lineTo(poleX + 14, poleY + 11 + flagWave);
      ctx.lineTo(poleX, poleY + 8);
      ctx.closePath();
      ctx.fill();

      // Tag on Flag
      ctx.font = 'bold 6px "Impact", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(b.graffiti, poleX + 2, poleY + 7);
    }

    // Wall Graffiti in strictly correct faction color (PCC = Blue, CV = Red)
    if (b.graffiti) {
      ctx.font = 'bold 11px "Impact", "Arial Black", sans-serif';
      ctx.fillStyle = b.graffitiColor;
      ctx.textAlign = 'left';
      ctx.fillText(b.graffiti, b.x + (isLeftSide ? 8 : b.w - 28), b.y + b.h - 6);
    }

    // Building illuminated sign
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(b.x + b.w / 2 - 34, b.y + 4, 68, 13, 3);
    ctx.fill();
    ctx.strokeStyle = b.graffitiColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, b.x + b.w / 2, b.y + 11);
  });

  // --- LAYER 6: Postes de Concreto, Fios Elétricos ("Gatos") & Luzes Noturnas ---
  const poles = [
    { x: width * 0.20, y: height * 0.70 },
    { x: width * 0.24, y: height * 0.32 },
    { x: width * 0.72, y: height * 0.60 },
    { x: width * 0.68, y: height * 0.22 }
  ];

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.lineWidth = 1.1;
  for (let i = 0; i < poles.length - 1; i++) {
    const p1 = poles[i];
    const p2 = poles[i + 1];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y - 22);
    const midWireX = (p1.x + p2.x) / 2;
    const midWireY = (p1.y + p2.y) / 2 + 13;
    ctx.quadraticCurveTo(midWireX, midWireY, p2.x, p2.y - 22);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y - 18);
    ctx.quadraticCurveTo(midWireX + 8, midWireY + 7, p2.x, p2.y - 18);
    ctx.stroke();
  }

  poles.forEach((p, idx) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 2, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.fillRect(p.x - 2.5, p.y - 26, 5, 28);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(p.x - 6, p.y - 24, 12, 3);

    if (idx % 2 === 0) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x + 3, p.y - 21, 6, 9);
    }

    // Warm Amber Streetlight
    const lampX = p.x;
    const lampY = p.y - 24;
    const lightRadius = 75;

    const lampGrad = ctx.createRadialGradient(lampX, lampY, 3, lampX, lampY, lightRadius);
    lampGrad.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
    lampGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.08)');
    lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = lampGrad;
    ctx.beginPath();
    ctx.arc(lampX, lampY, lightRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lampX, lampY + 2, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// =========================================================================
// 2. OBSTÁCULOS E COBERTURA TÁTICA (Caçambas, Carros, Muros, Botijões)
// =========================================================================

// Factory to spawn deterministic tactical obstacles tailored to canvas size
export function createDefaultObstacles(width: number, height: number): CoverObstacle[] {
  const midX = width / 2;
  return [
    // 1. Carro Abandonado (Sedan/Fusca enferrujado que serve de abrigo central)
    {
      id: 'car_main',
      type: 'carro_abandonado',
      x: midX - 35,
      y: height * 0.58,
      w: 46,
      h: 24,
      hp: 180,
      maxHp: 180,
      isExplosive: true,
      destroyed: false,
      rotation: -0.15
    },
    // 2. Caçamba de Entulho com Concreto e Entulho
    {
      id: 'dumpster_left',
      type: 'cacamba_entulho',
      x: midX - 85,
      y: height * 0.42,
      w: 36,
      h: 22,
      hp: 220,
      maxHp: 220,
      isExplosive: false,
      destroyed: false
    },
    // 3. Muro de Concreto Reforçado / Barricada Balística
    {
      id: 'wall_right',
      type: 'muro_concreto',
      x: midX + 50,
      y: height * 0.50,
      w: 42,
      h: 16,
      hp: 260,
      maxHp: 260,
      isExplosive: false,
      destroyed: false
    },
    // 4. Botijão de Gás P-13 (Explosivo tático de alta letalidade!)
    {
      id: 'gas_tank_1',
      type: 'botijao_gas',
      x: midX - 48,
      y: height * 0.30,
      w: 16,
      h: 20,
      hp: 35,
      maxHp: 35,
      isExplosive: true,
      destroyed: false
    },
    // 5. Segundo Botijão de Gás perto do beco superior
    {
      id: 'gas_tank_2',
      type: 'botijao_gas',
      x: midX + 38,
      y: height * 0.22,
      w: 16,
      h: 20,
      hp: 35,
      maxHp: 35,
      isExplosive: true,
      destroyed: false
    }
  ];
}

export function drawCoverObstacle(
  ctx: CanvasRenderingContext2D,
  obs: CoverObstacle,
  time: number
) {
  const { x, y, w, h, type, hp, maxHp, destroyed } = obs;
  const pct = Math.max(0, hp / maxHp);

  ctx.save();
  ctx.translate(x, y);
  if (obs.rotation) {
    ctx.rotate(obs.rotation);
  }

  // 1. Ground Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.35, w * 0.55, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  if (type === 'carro_abandonado') {
    // -------------------------------------------------------------
    // CARRO ABANDONADO / SUCATA (Sedan enferrujado que absorve tiros)
    // -------------------------------------------------------------
    if (destroyed) {
      // Burnt-out black wreck
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 4);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Smoldering fire embers
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(-w * 0.2, -h * 0.1, 3, 0, Math.PI * 2);
      ctx.arc(w * 0.1, h * 0.1, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Car Body (Rusted blue/grey chassis)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 5);
      ctx.fill();

      // Rust patches
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(-w * 0.4, -h * 0.3, w * 0.3, h * 0.4);
      ctx.fillRect(w * 0.1, -h * 0.2, w * 0.25, h * 0.3);

      // Windshield & Windows with bullet cracks
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-w * 0.15, -h * 0.35, w * 0.3, h * 0.7);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(-w * 0.15, -h * 0.35, w * 0.3, h * 0.7);

      // Flat Tires (Pneus arriados)
      ctx.fillStyle = '#020617';
      ctx.fillRect(-w * 0.45, -h / 2 - 2, 8, 4);
      ctx.fillRect(w * 0.25, -h / 2 - 2, 8, 4);
      ctx.fillRect(-w * 0.45, h / 2 - 2, 8, 4);
      ctx.fillRect(w * 0.25, h / 2 - 2, 8, 4);

      // Smoke puff if damaged (< 50% HP)
      if (pct < 0.5) {
        ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
        const smokeOffset = Math.sin(time * 0.01) * 3;
        ctx.beginPath();
        ctx.arc(-w * 0.3, -h * 0.6 + smokeOffset, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (type === 'cacamba_entulho') {
    // -------------------------------------------------------------
    // CAÇAMBA DE ENTULHO (Industrial metal dumpster with concrete rubble)
    // -------------------------------------------------------------
    // Metal Container Body (Yellow with hazard stripes)
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 + 3);
    ctx.lineTo(w / 2, -h / 2 + 3);
    ctx.lineTo(w / 2 - 3, h / 2);
    ctx.lineTo(-w / 2 + 3, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hazard Stripes on Side
    ctx.fillStyle = '#0f172a';
    for (let i = -w / 2 + 6; i < w / 2 - 6; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, -h / 2 + 5);
      ctx.lineTo(i + 4, -h / 2 + 5);
      ctx.lineTo(i + 1, h / 2 - 2);
      ctx.lineTo(i - 3, h / 2 - 2);
      ctx.closePath();
      ctx.fill();
    }

    // Concrete rubble inside dumpster (Entulho cinza)
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(0, -h / 2 + 3, w * 0.35, Math.PI, 0);
    ctx.fill();
  } else if (type === 'muro_concreto') {
    // -------------------------------------------------------------
    // MURO DE CONCRETO / BARRICADA (Jersey barrier with graffiti)
    // -------------------------------------------------------------
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Concrete joint segments
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.15, -h / 2);
    ctx.lineTo(-w * 0.15, h / 2);
    ctx.moveTo(w * 0.15, -h / 2);
    ctx.lineTo(w * 0.15, h / 2);
    ctx.stroke();

    // Sandbags on top
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-w * 0.4, -h / 2 - 3, w * 0.8, 4);

    // Stencil mark
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 6px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAZ', 0, 2);
  } else if (type === 'botijao_gas') {
    // -------------------------------------------------------------
    // BOTIJÃO DE GÁS P-13 (Liquigás/Ultragaz blue cylinder with valve)
    // -------------------------------------------------------------
    if (destroyed) {
      // Small charred crater
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cylinder Body Gradient (Iconic Blue Botijão)
      const gasGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      gasGrad.addColorStop(0, '#0284c7');
      gasGrad.addColorStop(0.5, '#38bdf8');
      gasGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = gasGrad;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2 + 3, w, h - 3, 4);
      ctx.fill();

      // Top Valve Handle Rim (Alça protetora de transporte)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-w * 0.35, -h / 2 - 2, w * 0.7, 5, 2);
      ctx.fill();
      // Brass Center Valve
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-1.5, -h / 2 - 1, 3, 3);

      // Warning Flame Hazard Decal
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔥', 0, 2);

      // Red flashing warning pulse when damaged
      if (pct < 0.6) {
        const pulse = Math.sin(time * 0.02) > 0;
        if (pulse) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, w * 0.8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  ctx.restore();

  // HP Bar on Obstacle (when damaged and not destroyed)
  if (!destroyed && hp < maxHp) {
    const barW = Math.max(18, w * 0.75);
    const barH = 3;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(x - barW / 2, y - h / 2 - 8, barW, barH);
    ctx.fillStyle = obs.isExplosive ? '#f97316' : '#94a3b8';
    ctx.fillRect(x - barW / 2, y - h / 2 - 8, barW * pct, barH);
  }
}

// =========================================================================
// 3. SPRITES (Allies, Rivals, Fallen, Projectiles)
// =========================================================================

// Deterministic helper to get character visual variant (0, 1, or 2)
function getCharVariant(entity: { id?: string; variant?: number }): number {
  if (entity.variant !== undefined && entity.variant !== null) {
    return Math.abs(entity.variant) % 3;
  }
  if (!entity.id) return 0;
  let hash = 0;
  for (let i = 0; i < entity.id.length; i++) {
    hash = (hash << 5) - hash + entity.id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 3;
}

// Draw human legs and sneakers with dynamic walking/running strides
function drawHumanLegs(
  ctx: CanvasRenderingContext2D,
  stepPhase: number,
  isMoving: boolean,
  pantsColor: string,
  skinColor: string,
  shoesColor: string,
  options?: { isShorts?: boolean; shoesSoleColor?: string; shoesAccent?: string }
) {
  const isShorts = options?.isShorts ?? true;
  const soleColor = options?.shoesSoleColor ?? '#ffffff';
  const accent = options?.shoesAccent ?? '#38bdf8';

  // Dynamic stride offsets along the character's forward/backward axis
  const stride = isMoving ? stepPhase * 4.5 : 0;
  const leftX = -3.5 + stride;
  const rightX = -3.5 - stride;

  // Left Leg (Upper thigh / shorts or pants)
  ctx.fillStyle = pantsColor;
  ctx.beginPath();
  ctx.roundRect(leftX - 3.5, -6.5, 6.5, 3.8, 1.8);
  ctx.fill();

  // Right Leg (Upper thigh / shorts or pants)
  ctx.beginPath();
  ctx.roundRect(rightX - 3.5, 2.7, 6.5, 3.8, 1.8);
  ctx.fill();

  // Visible Skin / Shins if wearing shorts
  if (isShorts) {
    ctx.fillStyle = skinColor;
    ctx.fillRect(leftX + 2, -5.8, 2.2, 2.4);
    ctx.fillRect(rightX + 2, 3.4, 2.2, 2.4);
  }

  // Sneakers (Nike Shox / Mizuno / Street Sneakers)
  // Left shoe
  ctx.fillStyle = shoesColor;
  ctx.beginPath();
  ctx.roundRect(leftX + 3.2, -6.2, 5.0, 3.2, 1.5);
  ctx.fill();
  // Sole & air bubble / springs
  ctx.fillStyle = soleColor;
  ctx.fillRect(leftX + 3.2, -3.8, 5.0, 1.0);
  ctx.fillStyle = accent;
  ctx.fillRect(leftX + 4.2, -5.5, 2.0, 1.0);

  // Right shoe
  ctx.fillStyle = shoesColor;
  ctx.beginPath();
  ctx.roundRect(rightX + 3.2, 3.0, 5.0, 3.2, 1.5);
  ctx.fill();
  // Sole & air bubble / springs
  ctx.fillStyle = soleColor;
  ctx.fillRect(rightX + 3.2, 5.4, 5.0, 1.0);
  ctx.fillStyle = accent;
  ctx.fillRect(rightX + 4.2, 3.7, 2.0, 1.0);
}

// Draw Oakley Juliet / Penny style sunglasses with iridescent reflection
function drawOakleyJuliet(ctx: CanvasRenderingContext2D, x: number, y: number, lensColor: string) {
  // Dark metallic frame
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 0.5, y - 3.2, 2.2, 6.4);
  // Left lens
  ctx.fillStyle = lensColor;
  ctx.beginPath();
  ctx.roundRect(x, y - 2.8, 1.6, 2.3, 0.6);
  ctx.fill();
  // Right lens
  ctx.beginPath();
  ctx.roundRect(x, y + 0.5, 1.6, 2.3, 0.6);
  ctx.fill();
  // Iridescent shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(x + 0.3, y - 2.2, 0.7, 1.0);
  ctx.fillRect(x + 0.3, y + 1.1, 0.7, 1.0);
}

// Draw heavy gold chain with crucifix or dollar medallion
function drawHeavyGoldChain(ctx: CanvasRenderingContext2D, x: number, y: number, size = 3.5) {
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, size, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();
  // Gold cross or medallion pendant
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(x + size + 0.8, y, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

export function drawAllySprite(
  ctx: CanvasRenderingContext2D,
  ally: AllyEntity,
  time: number
) {
  const { x, y, type, color, hp, maxHp } = ally;
  const angle = ally.facingAngle ?? Math.atan2(ally.vy, ally.vx);
  const isMoving = Math.hypot(ally.vx, ally.vy) > 0.05;
  const variant = getCharVariant(ally);

  // 1. Natural footstep alternating walk cycle & torso bob
  const walkDist = ally.walkDistance || 0;
  const stepPhase = isMoving ? Math.sin(walkDist * 0.28) : 0;
  const walkBob = isMoving ? Math.abs(stepPhase) * 1.5 : 0;
  // Natural torso twist while walking (shoulder alternation)
  const torsoTwist = isMoving ? stepPhase * 0.08 : 0;

  // 2. Weapon Recoil Kickback
  const recoil = ally.recoilTimer ? Math.max(0, ally.recoilTimer / 0.12) : 0;
  const kickbackDist = recoil * 4.8;
  const kickbackAngle = recoil * 0.14;

  // 3. Realistic soft ground drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
  ctx.beginPath();
  ctx.ellipse(x, y + (type === 'batedor_moto' ? 7 : 7.5), type === 'batedor_moto' ? 15 : 10, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // -----------------------------------------------------------------------
  // TYPE: BATEDOR DE MOTO (3 distinct motorcycle scout variants)
  // -----------------------------------------------------------------------
  if (type === 'batedor_moto') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Front headlight beam cutting across asphalt
    const beamGrad = ctx.createLinearGradient(0, 0, 58, 0);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
    beamGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.2)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(55, -16);
    ctx.lineTo(55, 16);
    ctx.closePath();
    ctx.fill();

    const wheelRot = walkDist * 0.45;

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "CG 160cc TITAN ESPORTIVA" (Capacete San Marino articulado)
      // -------------------------------------------------------------
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-11, -4, 22, 8, 3.5);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, -3, 10, 6);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-13, 3.5, 17, 2.5);
      ctx.fillStyle = '#475569';
      ctx.fillRect(2, 3.8, 3, 2);

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(8, -2.5, 6.5, 5, 2);
      ctx.roundRect(-14, -2.5, 6.5, 5, 2);
      ctx.fill();
      ctx.fillStyle = Math.sin(wheelRot) > 0 ? '#cbd5e1' : '#64748b';
      ctx.fillRect(10.5, -1.5, 2, 3);
      ctx.fillRect(-11.5, -1.5, 2, 3);

      ctx.fillStyle = '#334155';
      ctx.fillRect(4.5, -7.5, 3, 15);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(5, -8.5, 2, 2);
      ctx.fillRect(5, 6.5, 2, 2);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(-2, 0, 5.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#c27848';
      ctx.fillRect(1, -5.5, 4.5, 2.2);
      ctx.fillRect(1, 3.3, 4.5, 2.2);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(3.5, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(1.5, -3.5, 3.5, 7);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(5.5, -2.2, 2.5, 4.4);

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "HORNET 600cc / NAKED" (Sem capacete, cordão de ouro voando)
      // -------------------------------------------------------------
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-12, -4.5, 24, 9, 3.5);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-5, -4, 10, 8);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-14, 3.5, 18, 3);

      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(8, -3, 7, 6, 2.5);
      ctx.roundRect(-15, -3, 7, 6, 2.5);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.fillRect(4.5, -8.5, 3.5, 17);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-3, -4.5, 7.5, 9, 2.5);
      ctx.fill();

      const chainSway = Math.sin(time * 0.02) * 2;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-1, 0);
      ctx.quadraticCurveTo(-5, chainSway, -8, chainSway * 1.5);
      ctx.stroke();

      ctx.fillStyle = '#a15e34';
      ctx.fillRect(1, -6.5, 5, 2.5);
      ctx.fillRect(2, 3.5, 6, 2.5);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(7, 3, 5, 2.2);

      ctx.fillStyle = '#a15e34';
      ctx.beginPath();
      ctx.arc(2.5, 0, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(1.5, 0, 4.6, Math.PI * 0.4, Math.PI * 1.6);
      ctx.fill();
      ctx.fillRect(-2, -2.2, 3, 4.4);
      drawOakleyJuliet(ctx, 4.5, 0, '#38bdf8');

    } else {
      // -------------------------------------------------------------
      // VAR 2: "XT 660 BIG TRAIL" (Cross helmet com pala, mochila militar)
      // -------------------------------------------------------------
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-12, -4, 24, 8, 3);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-6, -3.5, 11, 7);

      ctx.fillStyle = color;
      ctx.fillRect(9, -2.5, 4, 5);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(12, -2, 2, 4);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(8, -2.8, 6.5, 5.6, 2);
      ctx.roundRect(-14, -2.8, 6.5, 5.6, 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.fillRect(4.5, -8, 3, 16);

      ctx.fillStyle = '#3f6212';
      ctx.beginPath();
      ctx.roundRect(-7, -4.5, 5, 9, 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-2.5, -4.5, 7, 9, 2.5);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(3, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(5.5, -2.5, 3.5, 5);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(4.5, -2, 2, 4);
    }

    ctx.restore();

  // -----------------------------------------------------------------------
  // TYPE: SOLDADO FUZIL (3 distinct elite riflemen with anatomical stances)
  // -----------------------------------------------------------------------
  } else if (type === 'soldado_fuzil') {
    ctx.save();
    ctx.translate(x, y + walkBob);
    ctx.rotate(angle + torsoTwist);

    const skinTone = variant === 1 ? '#d9986b' : (variant === 2 ? '#824424' : '#a15e34');

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "FUZILEIRO DO FAL 7.62" (Colete tático pesado, boina com brasão)
      // -------------------------------------------------------------
      // Legs: Cargo pants with combat boots
      drawHumanLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: false,
        shoesSoleColor: '#334155',
        shoesAccent: color
      });

      // Broad Human Shoulders & Torso (Curved anatomical silhouette)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-3, -7.5);
      ctx.lineTo(-3, 7.5);
      ctx.lineTo(2, 6.5);
      ctx.lineTo(3.5, 3);
      ctx.lineTo(3.5, -3);
      ctx.lineTo(2, -6.5);
      ctx.closePath();
      ctx.fill();

      // Ceramic Armor Plate with Faction Color Insignia
      ctx.fillStyle = color;
      ctx.fillRect(-2, -5, 4.5, 10);

      // Triple 7.62 Mag Pouches across belly
      ctx.fillStyle = '#334155';
      ctx.fillRect(1, -4, 2, 8);

      // Human Head forward at x = 2.0 with ears and tactical beret
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.ellipse(2.0, 0, 4.6, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ears with gold stud
      ctx.fillRect(1.5, -4.8, 1.8, 1.5);
      ctx.fillRect(1.5, 3.4, 1.8, 1.5);
      // Beret tilted to side
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(1.2, -1, 4.8, 4.2, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24'; // Golden Faction Badge
      ctx.fillRect(3.0, -3.2, 1.5, 1.5);

      // Tactical Headset with Wire
      ctx.fillStyle = '#020617';
      ctx.fillRect(1.5, -5.2, 2.0, 10.4);

      // Two-Handed Rifle Stance with Natural Arm Anatomy
      // Right arm (Upper arm from shoulder to elbow, forearm to trigger)
      ctx.fillStyle = skinTone;
      ctx.fillRect(-0.5, 6.5, 4.0, 2.6); // Right upper arm
      ctx.fillRect(2.5, 3.5, 4.5, 2.6);  // Right forearm to trigger
      // Left arm (Upper arm from shoulder to elbow, forearm reaching handguard)
      ctx.fillRect(-0.5, -7.5, 4.0, 2.6); // Left upper arm
      ctx.fillRect(2.5, -4.5, 6.5, 2.6);  // Left forearm reaching forward

      // FAL 7.62 Assault Rifle with Recoil
      ctx.save();
      ctx.translate(-kickbackDist, 0);
      ctx.rotate(-kickbackAngle);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-1.5, -1.8, 5, 3.6); // Stock resting in right shoulder pocket
      ctx.fillStyle = '#334155';
      ctx.fillRect(3.5, -2.2, 7.5, 4.4); // Receiver
      ctx.fillStyle = '#475569';
      ctx.fillRect(7, 1.8, 3.5, 5);      // 20-Round Box Mag
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(11, -1.5, 12, 2.8);   // Long Ribbed Barrel
      ctx.fillStyle = '#475569';
      ctx.fillRect(21, -2, 2.5, 3.8);    // Flash hider tip

      // Red Laser Aiming Guide
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(23, 0);
      ctx.lineTo(70, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "ATIRADOR AR-15 / M4" (Capacete FAST modular, mira red-dot)
      // -------------------------------------------------------------
      drawHumanLegs(ctx, stepPhase, isMoving, '#334155', skinTone, '#1e293b', {
        isShorts: false,
        shoesSoleColor: '#e2e8f0',
        shoesAccent: color
      });

      // Camo Tactical Plate Carrier
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(-3, -7.5);
      ctx.lineTo(-3, 7.5);
      ctx.lineTo(2, 6.5);
      ctx.lineTo(3.5, 3);
      ctx.lineTo(3.5, -3);
      ctx.lineTo(2, -6.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-2, -4.5, 4.5, 9);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-2, -4.5, 4.5, 9);

      // FAST Ballistic Helmet
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(2.0, 0, 5.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(0.5, -5.2, 3.5, 1.5);
      ctx.fillRect(0.5, 3.7, 3.5, 1.5);
      ctx.fillStyle = '#38bdf8'; // Goggles
      ctx.fillRect(4.8, -2.5, 2.2, 5);

      // Gloved Arms gripping AR-15
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-0.5, 6.5, 4.0, 2.6);
      ctx.fillRect(2.5, 3.5, 4.5, 2.6);
      ctx.fillRect(-0.5, -7.5, 4.0, 2.6);
      ctx.fillRect(2.5, -4.5, 6.5, 2.6);

      // AR-15 Rifle with Holographic Red-Dot Sight
      ctx.save();
      ctx.translate(-kickbackDist, 0);
      ctx.rotate(-kickbackAngle);

      ctx.fillStyle = '#334155';
      ctx.fillRect(-2, -1.6, 5.5, 3.2); // Stock
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(3.5, -2, 8.5, 4);     // Upper Receiver
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(5.5, -4.2, 4, 2.4);   // Optic
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(9.0, -3.4, 1.2, 1.2); // Red dot lens
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(7.5, 1.8, 3.5, 6, 1);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(12.0, -1.4, 10.5, 2.6); // Barrel
      ctx.fillStyle = '#334155';
      ctx.fillRect(21.0, -2.2, 3, 4.2);   // Flash hider

      // Tactical Green Laser Sight
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(23, 0);
      ctx.lineTo(75, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

    } else {
      // -------------------------------------------------------------
      // VAR 2: "GUERREIRO DO AK-47" (Corta-vento camuflado, balaclava)
      // -------------------------------------------------------------
      drawHumanLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: false,
        shoesSoleColor: '#f8fafc',
        shoesAccent: '#f59e0b'
      });

      // Windbreaker Jacket with Faction Accents
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-3, -7.5);
      ctx.lineTo(-3, 7.5);
      ctx.lineTo(2, 6.5);
      ctx.lineTo(3.5, 3);
      ctx.lineTo(3.5, -3);
      ctx.lineTo(2, -6.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-3, -2, 6.5, 4);

      // Chest Rig holding AK Magazines
      ctx.fillStyle = '#3f6212';
      ctx.fillRect(0, -3.5, 3, 7);

      // Balaclava Head with Exposed Eyes & Faction Headband
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(2.0, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = skinTone;
      ctx.fillRect(4.2, -2.2, 2.2, 4.4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(5.5, -1.6, 1, 1.2);
      ctx.fillRect(5.5, 0.6, 1, 1.2);
      ctx.fillStyle = color;
      ctx.fillRect(0.5, -4.6, 2.5, 9.2);

      // Arms in Windbreaker Sleeves
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-0.5, 6.5, 4.0, 2.6);
      ctx.fillRect(2.5, 3.5, 4.5, 2.6);
      ctx.fillRect(-0.5, -7.5, 4.0, 2.6);
      ctx.fillRect(2.5, -4.5, 6.5, 2.6);

      // AK-47 Rifle with Wood Stock & Curved Steel Mag
      ctx.save();
      ctx.translate(-kickbackDist, 0);
      ctx.rotate(-kickbackAngle);

      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -1.8, 5.5, 3.6);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(3.5, -2.2, 7.5, 4.4);
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(7, 2, 4.2, 6.5, 1.5);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(11, -2, 5, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(16, -1.4, 7, 2.6);
      ctx.fillStyle = '#334155';
      ctx.fillRect(21, -3, 2, 3);

      ctx.restore();
    }

    ctx.restore();

  // -----------------------------------------------------------------------
  // TYPE: SEGURANÇA PESADO (3 distinct heavy enforcer / frontline variants)
  // -----------------------------------------------------------------------
  } else if (type === 'seguranca_pesado') {
    ctx.save();
    ctx.translate(x, y + walkBob);
    ctx.rotate(angle + torsoTwist);

    const skinTone = variant === 0 ? '#824424' : (variant === 1 ? '#a15e34' : '#c27848');

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "BRUCUTU DA CALIBRE 12" (Escopeta pump-action, colete nível IV)
      // -------------------------------------------------------------
      drawHumanLegs(ctx, stepPhase, isMoving, '#0f172a', skinTone, '#020617', {
        isShorts: false,
        shoesSoleColor: '#334155',
        shoesAccent: '#ef4444'
      });

      // Massive Human Shoulders & Heavy Armor Vest
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-4, -9.0);
      ctx.lineTo(-4, 9.0);
      ctx.lineTo(2, 8.0);
      ctx.lineTo(4, 4.0);
      ctx.lineTo(4, -4.0);
      ctx.lineTo(2, -8.0);
      ctx.closePath();
      ctx.fill();

      // Red shotgun shells pinned on chest harness
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, -3.5, 2, 2);
      ctx.fillRect(0, -0.5, 2, 2);
      ctx.fillRect(0, 2.5, 2, 2);

      // Head: Shaved head, trimmed beard & dark shades
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(2.0, 0, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#090d16'; // Beard
      ctx.fillRect(4.2, -3.2, 2.5, 6.4);
      ctx.fillStyle = '#020617'; // Sunglasses
      ctx.fillRect(5.0, -2.8, 1.8, 5.6);

      // Big muscular arms holding Calibre 12 Pump Action
      ctx.fillStyle = skinTone;
      ctx.fillRect(-0.5, 7.5, 4.5, 3.2);
      ctx.fillRect(3.0, 4.0, 5.0, 3.2);
      ctx.fillRect(-0.5, -8.5, 4.5, 3.2);
      ctx.fillRect(3.0, -5.0, 7.0, 3.2);

      // Pump-Action Shotgun Calibre 12 with Kickback
      ctx.save();
      ctx.translate(-kickbackDist * 1.3, 0);
      ctx.rotate(-kickbackAngle * 1.3);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-1, -2, 5, 4);
      ctx.fillStyle = '#334155';
      ctx.fillRect(4, -2.5, 7, 5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(11, -2.2, 12, 4.4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(12, -2.8, 4.5, 5.6);

      ctx.restore();

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "ESCUDEIRO DE CHOQUE TÁTICO" (Escudo balístico + pistola .45)
      // -------------------------------------------------------------
      drawHumanLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: false,
        shoesSoleColor: '#64748b',
        shoesAccent: color
      });

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-4, -8.5);
      ctx.lineTo(-4, 8.5);
      ctx.lineTo(2, 7.5);
      ctx.lineTo(4, 3.5);
      ctx.lineTo(4, -3.5);
      ctx.lineTo(2, -7.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-3, -4, 5, 8);

      // Tactical Riot Helmet with Visor
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(2.0, 0, 5.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillRect(5.0, -3.2, 3, 6.4);

      // Left Hand holding Massive Tactical Ballistic Shield
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(8, -9.5, 5.5, 19, 2.5);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(8, -9.5, 5.5, 19);
      ctx.fillStyle = color;
      ctx.fillRect(9, -6, 3.5, 12);

      // Right Hand firing Heavy Pistol through Shield notch
      ctx.save();
      ctx.translate(-kickbackDist * 0.8, 0);
      ctx.fillStyle = skinTone;
      ctx.fillRect(3, 4, 5, 2.8);
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, 3.8, 7.5, 3.4);
      ctx.restore();

    } else {
      // -------------------------------------------------------------
      // VAR 2: "SEGURANÇA DE ELITE COM FUZIL COMPACTO"
      // -------------------------------------------------------------
      drawHumanLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: false,
        shoesSoleColor: '#f1f5f9',
        shoesAccent: color
      });

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-3, -8.0);
      ctx.lineTo(-3, 8.0);
      ctx.lineTo(2, 7.0);
      ctx.lineTo(3.5, 3);
      ctx.lineTo(3.5, -3);
      ctx.lineTo(2, -7.0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-2, -3, 4, 6);

      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(2.0, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(1.0, 0, 4.8, 4.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = skinTone;
      ctx.fillRect(-0.5, 6.5, 4.0, 2.6);
      ctx.fillRect(2.5, 3.5, 4.5, 2.6);
      ctx.fillRect(-0.5, -7.5, 4.0, 2.6);
      ctx.fillRect(2.5, -4.5, 6.5, 2.6);

      ctx.save();
      ctx.translate(-kickbackDist, 0);
      ctx.rotate(-kickbackAngle);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, -2, 10, 4);
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, -5, 2.5, 3.5);
      ctx.fillStyle = '#475569';
      ctx.fillRect(12, -1.5, 6, 3);
      ctx.restore();
    }

    ctx.restore();

  // -----------------------------------------------------------------------
  // TYPE: SOLDADO BASE / RECRUTA (3 authentic Brazilian street soldiers)
  // -----------------------------------------------------------------------
  } else {
    ctx.save();
    ctx.translate(x, y + walkBob);
    ctx.rotate(angle + torsoTwist);

    const skinTone = variant === 0 ? '#c27848' : (variant === 1 ? '#a15e34' : '#824424');

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "O CRIA DA PISTA" (Manto da Facção, Boné Virado, Juliet & Pente de 30)
      // -------------------------------------------------------------
      // Legs: Tactel shorts & Nike Shox sneakers with visible springs
      drawHumanLegs(ctx, stepPhase, isMoving, '#0f172a', skinTone, '#1e293b', {
        isShorts: true,
        shoesSoleColor: '#f8fafc',
        shoesAccent: color
      });

      // Human Broad Shoulders & Torso (Curved anatomical silhouette - NOT a box!)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-2.5, -7.5); // Left shoulder back
      ctx.lineTo(-2.5, 7.5);  // Right shoulder back
      ctx.lineTo(2.0, 6.2);   // Right chest
      ctx.lineTo(3.2, 3.0);   // Right pectoral curve
      ctx.lineTo(3.2, -3.0);  // Left pectoral curve
      ctx.lineTo(2.0, -6.2);  // Left chest
      ctx.closePath();
      ctx.fill();

      // Football Jersey Contrast Stripes (Flamengo / Corinthians / Faction stripes)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2.5, -4.5, 4.8, 2.0);
      ctx.fillRect(-2.5, 2.5, 4.8, 2.0);

      // Jersey V-Neck collar showing skin
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.moveTo(1.0, -2.5);
      ctx.lineTo(2.8, 0);
      ctx.lineTo(1.0, 2.5);
      ctx.closePath();
      ctx.fill();

      // Heavy Gold Chain (Cordão Baiano) resting on chest
      drawHeavyGoldChain(ctx, 1.2, 0, 3.4);

      // Human Head forward at x = 2.0 with ears & backwards baseball cap
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.ellipse(2.2, 0, 4.8, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Human ears with gold stud earring
      ctx.fillStyle = skinTone;
      ctx.fillRect(1.5, -4.6, 1.6, 1.4);
      ctx.fillRect(1.5, 3.2, 1.6, 1.4);
      ctx.fillStyle = '#fbbf24'; // Gold earring stud
      ctx.fillRect(1.8, -4.3, 0.9, 0.9);

      // Backwards Cap in Faction Color covering crown and nape
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(1.5, 0, 4.5, Math.PI * 0.45, Math.PI * 1.55);
      ctx.fill();
      // Backwards curved brim resting on the neck
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-2.8, -2.4, 2.4, 4.8, 1.2);
      ctx.fill();
      ctx.fillStyle = '#0f172a'; // Cap snapback plastic buckle
      ctx.fillRect(-1.0, -1.2, 1.2, 2.4);

      // Oakley Juliet Sunglasses with brilliant reflective ruby/blue lenses
      drawOakleyJuliet(ctx, 4.2, 0, '#38bdf8');

      // Human Articulated Arms (Natural Two-Handed Tactical Shooting Triangle)
      // Right upper arm (shoulder to elbow)
      ctx.fillStyle = skinTone;
      ctx.fillRect(-0.5, 6.2, 3.5, 2.4);
      // Right forearm (elbow to pistol grip)
      ctx.fillRect(2.5, 3.2, 4.5, 2.4);
      // Gold watch (Casio G-Shock / dourado) on right wrist
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(5.5, 3.2, 1.5, 2.4);

      // Left upper arm (shoulder to elbow)
      ctx.fillRect(-0.5, -7.5, 3.5, 2.4);
      // Left forearm (elbow diagonally inward to support handgun base)
      ctx.fillRect(2.5, -5.2, 5.8, 2.4);

      // Glock 17 with Extended 30-Round Magazine ("Pente de 30") with Kickback
      ctx.save();
      ctx.translate(-kickbackDist * 0.85, 0);
      ctx.rotate(-kickbackAngle * 0.85);

      // Glock Black Polymer Frame & Slide with rear slide serrations
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(7.0, -1.8, 8.0, 3.6);
      ctx.fillStyle = '#0f172a'; // Slide serrations
      ctx.fillRect(7.2, -1.6, 1.2, 3.2);
      // Chrome/Silver Ejection Port Window
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(9.5, -1.4, 2.4, 1.5);
      // Extended 30-round curved stick magazine protruding downwards
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8.5, 1.8, 2.4, 5.0);
      ctx.fillStyle = '#f59e0b'; // Brass 9mm bullets visible through witness holes
      ctx.fillRect(8.9, 4.8, 1.6, 1.4);

      ctx.restore();

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "PESADÃO SEM CAMISA" (Peitoral atlético, tatuagens, cordão & Taurus)
      // -------------------------------------------------------------
      // Legs: Bermuda tactel estampada com as cores da facção & chinelo/tênis leve
      drawHumanLegs(ctx, stepPhase, isMoving, color, skinTone, '#090d16', {
        isShorts: true,
        shoesSoleColor: '#facc15',
        shoesAccent: '#ffffff'
      });

      // Muscular Bare Chest (Contoured human torso with pectorals)
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.moveTo(-2.5, -7.5);
      ctx.lineTo(-2.5, 7.5);
      ctx.lineTo(2.0, 6.2);
      ctx.lineTo(3.2, 3.0);
      ctx.lineTo(3.2, -3.0);
      ctx.lineTo(2.0, -6.2);
      ctx.closePath();
      ctx.fill();

      // Pectoral Muscle Definition & Abdominal Line
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(0.5, -3.2, 2.2, 1.2);
      ctx.fillRect(0.5, 2.0, 2.2, 1.2);
      ctx.fillRect(1.0, -3.5, 1.0, 7.0);

      // Faction / Tribal Tattoos on left shoulder and arm
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(-1.5, -6.5, 3.5, 2.5);
      ctx.fillRect(1.5, -5.5, 2.5, 1.8);

      // Heavy Gold Chain with Crucifix Pendant
      drawHeavyGoldChain(ctx, 1.2, 0, 3.6);

      // Head: Low Fade Haircut with Razor Scratch & Faction Bandana
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.ellipse(2.2, 0, 4.8, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillRect(1.5, -4.6, 1.6, 1.4);
      ctx.fillRect(1.5, 3.2, 1.6, 1.4);
      // Dark Fade Haircut
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(1.5, 0, 4.5, Math.PI * 0.45, Math.PI * 1.55);
      ctx.fill();
      // Razor line in hair
      ctx.fillStyle = skinTone;
      ctx.fillRect(0.5, -2.5, 1.0, 4.0);

      // Bandana tied around head in Faction Color
      ctx.fillStyle = color;
      ctx.fillRect(1.8, -4.5, 2.0, 9.0);
      // Bandana knot and hanging tails at back of head
      ctx.fillRect(-1.5, -1.5, 2.5, 3.0);

      // Articulated Arms gripping Chrome Taurus PT-92
      ctx.fillStyle = skinTone;
      ctx.fillRect(-0.5, 6.2, 3.5, 2.4);
      ctx.fillRect(2.5, 3.2, 4.5, 2.4);
      ctx.fillRect(-0.5, -7.5, 3.5, 2.4);
      ctx.fillRect(2.5, -5.2, 5.8, 2.4);

      // Shiny Chrome Taurus Pistol with Red Laser Underbarrel
      ctx.save();
      ctx.translate(-kickbackDist * 0.85, 0);
      ctx.rotate(-kickbackAngle * 0.85);

      // Chrome Slide
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(7.0, -1.8, 8.2, 3.6);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(9.8, -1.4, 2.4, 1.5);
      // Wood Grips
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6.0, 1.0, 2.2, 2.0);
      // Underbarrel Laser Dot Sight
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(9.0, 1.8, 3.5, 1.8);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(12.5, 2.1, 1.4, 1.4);

      ctx.restore();

    } else {
      // -------------------------------------------------------------
      // VAR 2: "BATEDOR DO BECO" (Bucket hat, shoulder bag, regata canelada)
      // -------------------------------------------------------------
      // Legs: Cargo shorts & street running sneakers
      drawHumanLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: true,
        shoesSoleColor: '#ffffff',
        shoesAccent: color
      });

      // Human Broad Shoulders in Black Ribbed Tank Top
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-2.5, -7.5);
      ctx.lineTo(-2.5, 7.5);
      ctx.lineTo(2.0, 6.2);
      ctx.lineTo(3.2, 3.0);
      ctx.lineTo(3.2, -3.0);
      ctx.lineTo(2.0, -6.2);
      ctx.closePath();
      ctx.fill();

      // Deep Tank Top armhole trims in Faction Color
      ctx.fillStyle = color;
      ctx.fillRect(-2.5, -7.5, 4.5, 1.6);
      ctx.fillRect(-2.5, 5.9, 4.5, 1.6);

      // Tactical Crossbody Shoulder Bag (Bolsinha transversal)
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-2.5, -6.5);
      ctx.lineTo(3.0, 4.0);
      ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(0.5, 0.5, 4.5, 4.5, 1.4);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1'; // Silver zipper
      ctx.fillRect(1.5, 1.0, 2.5, 0.8);

      // Head: Bucket Hat with circular brim
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.ellipse(2.2, 0, 4.8, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Bucket hat crown
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(1.5, 0, 4.4, 0, Math.PI * 2);
      ctx.fill();
      // Bucket hat wide circular brim with Faction Color trim
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(1.5, 0, 5.5, 0, Math.PI * 2);
      ctx.stroke();

      // Human Arms with Half-finger Tactical Gloves
      ctx.fillStyle = skinTone;
      ctx.fillRect(-0.5, 6.2, 3.5, 2.4);
      ctx.fillRect(2.5, 3.2, 4.5, 2.4);
      ctx.fillRect(-0.5, -7.5, 3.5, 2.4);
      ctx.fillRect(2.5, -5.2, 5.8, 2.4);
      // Tactical black gloves
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(5.5, 3.2, 2.0, 2.4);
      ctx.fillRect(6.5, -4.5, 2.0, 2.4);

      // Matte Black Tactical Pistol with Barrel Compensator
      ctx.save();
      ctx.translate(-kickbackDist * 0.85, 0);
      ctx.rotate(-kickbackAngle * 0.85);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(7.0, -1.8, 7.0, 3.6);
      ctx.fillStyle = '#475569';
      ctx.fillRect(14.0, -2.2, 2.6, 4.4); // Vented compensator

      ctx.restore();
    }

    ctx.restore();
  }

  // HP Bar with glowing green health
  if (hp < maxHp) {
    const barWidth = 24;
    const barHeight = 3.5;
    const pct = Math.max(0, hp / maxHp);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(x - barWidth / 2, y - 20, barWidth, barHeight);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x - barWidth / 2, y - 20, barWidth * pct, barHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(x - barWidth / 2, y - 20, barWidth, barHeight);
  }
}

export function drawRivalSprite(
  ctx: CanvasRenderingContext2D,
  rival: RivalEntity,
  time: number
) {
  const { x, y, type, color, hp, maxHp, radius, factionTag } = rival;
  const angle = rival.facingAngle ?? Math.atan2(rival.vy, rival.vx);
  const isMoving = Math.hypot(rival.vx, rival.vy) > 0.05;
  const variant = getCharVariant(rival);

  // 1. Natural footstep alternating walk cycle & torso bob
  const walkDist = rival.walkDistance || 0;
  const stepPhase = isMoving ? Math.sin(walkDist * 0.28) : 0;
  const walkBob = isMoving ? Math.abs(stepPhase) * 1.5 : 0;
  const torsoTwist = isMoving ? stepPhase * 0.07 : 0;

  // 2. Weapon Recoil Kickback
  const recoil = rival.recoilTimer ? Math.max(0, rival.recoilTimer / 0.12) : 0;
  const kickbackDist = recoil * 4.8;
  const kickbackAngle = recoil * 0.14;

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
  ctx.beginPath();
  ctx.ellipse(x, y + radius - 2, radius * 0.95, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y + walkBob);
  ctx.rotate(angle + torsoTwist);

  // -----------------------------------------------------------------------
  // RIVAL TYPE: OLHEIRO (3 distinct lookout / radiinho variants)
  // -----------------------------------------------------------------------
  if (type === 'olheiro') {
    const skinTone = variant === 1 ? '#824424' : '#a15e34';

    // Agile quick footsteps
    drawHumanLegs(ctx, stepPhase, isMoving, variant === 0 ? '#1e293b' : color, skinTone, '#0f172a', {
      isShorts: true,
      shoesSoleColor: '#ffffff',
      shoesAccent: color
    });

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "RADIAÇÃO DA LAJE" (Walkie-talkie com antena longa & LED)
      // -------------------------------------------------------------
      // Sports Tank Top in Rival Faction Color
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-4.5, -5, 9, 10, 2.5);
      ctx.fill();

      // Head: Cap turned forward with visor
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.2, Math.PI * 0.5, Math.PI * 1.5);
      ctx.fill();
      ctx.fillRect(1.5, -2, 3.5, 4); // Front visor

      // Juliet shades with Rival tint
      drawOakleyJuliet(ctx, 2.5, 0, color);

      // Walkie-Talkie in hand pointing forward
      ctx.fillStyle = skinTone;
      ctx.fillRect(2, 1, 4.5, 2.2);
      ctx.fillStyle = '#020617';
      ctx.fillRect(5.5, 0.5, 4.5, 5);
      // Long Antenna
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(9, 1.5);
      ctx.lineTo(16, 1.5);
      ctx.stroke();

      // Blinking red transmission LED
      if (Math.sin(time * 0.015) > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(16.5, 1.5, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "FOGUETEIRO DE ALERTA" (Tubo de rojão sinalizador na mão)
      // -------------------------------------------------------------
      // Rival Jersey with Number on back
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-4.5, -5, 9, 10, 2.5);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -2, 2.5, 4); // Jersey number

      // Head with Bandana
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-1.5, -4.2, 2.5, 8.4); // Bandana wrap

      // Firework Mortar / Tube in Hand
      ctx.fillStyle = skinTone;
      ctx.fillRect(2, -3.5, 4, 2);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(5.5, -3.5, 8, 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(13, -3.5, 2.5, 3); // Fuse ready

      // Sparks coming off fuse
      if (Math.sin(time * 0.02) > 0) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(15.5, -3.5, 1.5, 1.5);
      }

    } else {
      // -------------------------------------------------------------
      // VAR 2: "VIGIA DO BECO" (Casaco corta-vento encapuzado & rádio)
      // -------------------------------------------------------------
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-5, -5.5, 10, 11, 3);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-5, -1.5, 10, 3);

      // Hood pulled over head
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = skinTone;
      ctx.fillRect(2, -1.8, 2, 3.6);

      // Hand holding Smartphone with glowing green screen
      ctx.fillStyle = skinTone;
      ctx.fillRect(2, 1, 4, 2.2);
      ctx.fillStyle = '#020617';
      ctx.fillRect(5.5, 0.5, 4, 5);
      ctx.fillStyle = '#22c55e'; // Screen glow
      ctx.fillRect(6, 1.2, 3, 3.6);
    }

  // -----------------------------------------------------------------------
  // RIVAL TYPE: SOLDADO PISTOLA (3 distinct rival gunmen variants)
  // -----------------------------------------------------------------------
  } else if (type === 'soldado_pistola') {
    const skinTone = variant === 2 ? '#824424' : '#a15e34';

    drawHumanLegs(ctx, stepPhase, isMoving, variant === 1 ? '#0284c7' : '#0f172a', skinTone, '#020617', {
      isShorts: true,
      shoesSoleColor: '#e2e8f0',
      shoesAccent: color
    });

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "SOLDADO BALACLAVA" (Touca ninja preta, colete leve)
      // -------------------------------------------------------------
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-5.5, -6, 11, 12, 3);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-5.5, -2, 11, 4);

      // Black Tactical Balaclava with Eye Slit
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc'; // Eyes
      ctx.fillRect(2.8, -1.8, 2, 3.6);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(3.8, -1.2, 0.8, 1);
      ctx.fillRect(3.8, 0.5, 0.8, 1);

      // Arms gripping 9mm Glock
      ctx.fillStyle = skinTone;
      ctx.fillRect(1.5, -4.5, 5, 2.2);
      ctx.fillRect(1.5, 2.3, 5, 2.2);

      ctx.save();
      ctx.translate(-kickbackDist * 0.85, 0);
      ctx.rotate(-kickbackAngle * 0.85);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(6, -1.8, 7.5, 3.6);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(8.5, -1.4, 2.2, 1.5);
      ctx.restore();

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "PISTOLEIRO DO MANTO RIVAL" (Camisa de time rival & Taurus cromada)
      // -------------------------------------------------------------
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-5.5, -6, 11, 12, 3);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5.5, -3.5, 11, 1.8);
      ctx.fillRect(-5.5, 1.8, 11, 1.8);

      // Head: Backwards Cap in Rival Color
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(-0.5, 0, 4.5, Math.PI * 0.45, Math.PI * 1.55);
      ctx.fill();
      ctx.fillRect(-4.5, -2, 2.8, 4);

      // Oakley Juliet in Rival Lens
      drawOakleyJuliet(ctx, 2.5, 0, color);

      // Arms gripping Chrome Taurus
      ctx.fillStyle = skinTone;
      ctx.fillRect(1.5, -4.5, 5, 2.2);
      ctx.fillRect(1.5, 2.3, 5, 2.2);

      ctx.save();
      ctx.translate(-kickbackDist * 0.85, 0);
      ctx.rotate(-kickbackAngle * 0.85);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(6, -1.8, 8, 3.6);
      ctx.fillStyle = '#78350f'; // Wood grip
      ctx.fillRect(5, -1, 2.5, 2);
      ctx.restore();

    } else {
      // -------------------------------------------------------------
      // VAR 2: "SOLDADO SEM CAMISA TATUADO" (Tatuagens de facção & laser)
      // -------------------------------------------------------------
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.roundRect(-5.5, -6, 11, 12, 3);
      ctx.fill();

      // Rival Faction Tattoos across back and shoulder
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(-4, -5, 3.5, 3);
      ctx.fillRect(-2, 1, 3.5, 3);

      // Silver Chain
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0.5, 0, 3.5, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      // Shaved Head with Razor Cut Line
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-3, -3.5, 2.5, 7);
      ctx.fillStyle = skinTone; // Razor line
      ctx.fillRect(-2.5, -2.5, 1, 5);

      // Arms with Gun & Laser
      ctx.fillStyle = skinTone;
      ctx.fillRect(1.5, -4.5, 5, 2.2);
      ctx.fillRect(1.5, 2.3, 5, 2.2);

      ctx.save();
      ctx.translate(-kickbackDist * 0.85, 0);
      ctx.rotate(-kickbackAngle * 0.85);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(6, -1.8, 7.5, 3.6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10.5, 1.8, 2, 1.5);
      ctx.restore();
    }

  // -----------------------------------------------------------------------
  // RIVAL TYPE: ATIRADOR FUZIL (3 distinct sniper / rifleman variants)
  // -----------------------------------------------------------------------
  } else if (type === 'atirador_fuzil') {
    const skinTone = '#a15e34';

    drawHumanLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#020617', {
      isShorts: false,
      shoesSoleColor: '#475569',
      shoesAccent: color
    });

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "SNIPER DE BOINA RIVAL" (Rifle sniper com luneta azul telescópica)
      // -------------------------------------------------------------
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.roundRect(-6, -6.5, 12, 13, 3.5);
      ctx.fill();

      // Boina Militar da Facção Rival
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(-0.5, -1, 5, 4.2, -0.25, 0, Math.PI * 2);
      ctx.fill();

      // Arms gripping Heavy Sniper Rifle
      ctx.fillStyle = skinTone;
      ctx.fillRect(2.5, -5.5, 5.5, 2.6);
      ctx.fillRect(3.5, 2.5, 5, 2.6);

      // Heavy Sniper Rifle with Telescopic Scope
      ctx.save();
      ctx.translate(-kickbackDist * 1.1, 0);
      ctx.rotate(-kickbackAngle * 1.1);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3, -1.8, 6, 3.6); // Stock
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(3, -2, 17, 4);   // Long Receiver & Barrel
      // Telescopic Scope with Cyan Glass Glare
      ctx.fillStyle = '#334155';
      ctx.fillRect(6, -4.5, 7, 2.5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(11.5, -4.2, 1.5, 2);
      // Folded Bipod under barrel
      ctx.fillStyle = '#475569';
      ctx.fillRect(15, 1.8, 3.5, 2);

      ctx.restore();

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "EMBOSCADA CAMUFLADA" (Ghillie leve / poncho & silenciador)
      // -------------------------------------------------------------
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.roundRect(-6.5, -7, 13, 14, 4);
      ctx.fill();
      // Camo patches
      ctx.fillStyle = color;
      ctx.fillRect(-4, -5, 4, 3);
      ctx.fillRect(1, 2, 4, 3);

      // Camo Headwrap with Goggles
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(2.5, -2, 2.5, 4);

      // Arms & Silenced FAL
      ctx.fillStyle = skinTone;
      ctx.fillRect(2, -5.5, 5.5, 2.6);
      ctx.fillRect(3, 2.5, 5, 2.6);

      ctx.save();
      ctx.translate(-kickbackDist, 0);
      ctx.rotate(-kickbackAngle);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, -2, 12, 4);
      // Long Silencer Tube
      ctx.fillStyle = '#334155';
      ctx.fillRect(14, -2.4, 7.5, 4.8);
      ctx.restore();

    } else {
      // -------------------------------------------------------------
      // VAR 2: "FUZILEIRO DE ASSALTO AR-15" (Capacete tático com fita rival)
      // -------------------------------------------------------------
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-6, -6.5, 12, 13, 3.5);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-5, -4, 10, 8);

      // FAST Helmet with Rival colored band
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0.5, 0, 5.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-1.5, -5.2, 4, 1.5);
      ctx.fillRect(-1.5, 3.7, 4, 1.5);

      // Arms & AR Rifle with Red Laser
      ctx.fillStyle = skinTone;
      ctx.fillRect(2.5, -5.5, 5.5, 2.6);
      ctx.fillRect(3.5, 2.5, 5, 2.6);

      ctx.save();
      ctx.translate(-kickbackDist, 0);
      ctx.rotate(-kickbackAngle);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -2, 10, 4);
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(6.5, 1.8, 3.5, 5.5, 1);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(11, -1.4, 9, 2.8);
      ctx.restore();
    }

  // -----------------------------------------------------------------------
  // RIVAL TYPE: GERENTE BOCA (3 distinct crime manager / boss lieutenant variants)
  // -----------------------------------------------------------------------
  } else if (type === 'gerente_boca') {
    const skinTone = variant === 0 ? '#c27848' : '#a15e34';

    drawHumanLegs(ctx, stepPhase, isMoving, '#0f172a', skinTone, '#1e1b4b', {
      isShorts: true,
      shoesSoleColor: '#fbbf24',
      shoesAccent: '#ffffff'
    });

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "O OSTENTAÇÃO" (Polo de grife, cordão triplo & pistola de ouro)
      // -------------------------------------------------------------
      // Designer Polo Shirt in Rival Color with open collar
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-6, -6.5, 12, 13, 3.5);
      ctx.fill();
      // Exposed chest skin
      ctx.fillStyle = skinTone;
      ctx.fillRect(0, -2.5, 4, 5);

      // Double Heavy Gold Chains
      drawHeavyGoldChain(ctx, 1, 0, 3.8);
      drawHeavyGoldChain(ctx, 2, 0, 2.6);

      // Slick Fade Haircut with Golden Highlights
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24'; // Blonde highlights
      ctx.fillRect(-3, -3.5, 3.5, 7);

      // Oakley Juliet with 24k Gold Lenses
      drawOakleyJuliet(ctx, 2.5, 0, '#fbbf24');

      // Arms with Gold Watch gripping 24K Gold Plated Pistol
      ctx.fillStyle = skinTone;
      ctx.fillRect(1.5, -4.5, 5, 2.4);
      ctx.fillRect(1.5, 2.2, 5, 2.4);
      ctx.fillStyle = '#fbbf24'; // Gold watch
      ctx.fillRect(3.8, 2.2, 1.6, 2.4);

      // 24K Gold Pistol with Recoil
      ctx.save();
      ctx.translate(-kickbackDist * 0.9, 0);
      ctx.rotate(-kickbackAngle * 0.9);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(6, -2, 8.5, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(8.5, -1.5, 3, 1.8);
      ctx.restore();

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "O GERENTE TÁTICO" (Jaqueta de couro & submetralhadora Mac-10)
      // -------------------------------------------------------------
      // Black Leather Street Jacket
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(-6, -6.5, 12, 13, 3.5);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-2, -6.5, 4, 13); // Faction zipper lining

      // Crossbody Leather Bag with Stacks of Cash visible
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(0, 1.5, 5, 5.5, 1.5);
      ctx.fill();
      ctx.fillStyle = '#22c55e'; // Green banknotes popping out
      ctx.fillRect(1, 1.5, 3, 1.2);

      // Head: Designer Cap & Bluetooth Earpiece
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, -3, 5, 6);
      ctx.fillStyle = '#38bdf8'; // Bluetooth LED
      ctx.fillRect(0, -5.2, 1.5, 1.5);

      // Mac-10 SMG with Extended Magazine
      ctx.fillStyle = skinTone;
      ctx.fillRect(1.5, -4.5, 5, 2.4);
      ctx.fillRect(1.5, 2.2, 5, 2.4);

      ctx.save();
      ctx.translate(-kickbackDist, 0);
      ctx.rotate(-kickbackAngle);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(5.5, -2.5, 7.5, 5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(7, 2.5, 2.5, 5.5); // Extended stick mag
      ctx.fillStyle = '#fbbf24';       // Gold barrel shroud
      ctx.fillRect(13, -1.8, 4, 3.6);
      ctx.restore();

    } else {
      // -------------------------------------------------------------
      // VAR 2: "O BRAÇO DIREITO" (Colete tático com detalhes dourados & coldre duplo)
      // -------------------------------------------------------------
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-6, -6.5, 12, 13, 3.5);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-5, -5, 10, 10);

      // Bucket Hat with Gold Ring
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(0.5, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
      ctx.fill();

      // Dual Pistols Stance
      ctx.fillStyle = skinTone;
      ctx.fillRect(1.5, -5.5, 5, 2.2);
      ctx.fillRect(1.5, 3.3, 5, 2.2);

      ctx.save();
      ctx.translate(-kickbackDist * 0.85, 0);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(6, -6, 6.5, 3);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(6, 3, 6.5, 3);
      ctx.restore();
    }

  // -----------------------------------------------------------------------
  // RIVAL TYPE: BLINDADO CHOQUE (3 distinct riot / heavy armor juggernaut variants)
  // -----------------------------------------------------------------------
  } else if (type === 'blindado_choque') {
    const skinTone = '#a15e34';

    drawHumanLegs(ctx, stepPhase, isMoving, '#0f172a', skinTone, '#020617', {
      isShorts: false,
      shoesSoleColor: '#475569',
      shoesAccent: color
    });

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "TROPA DE CHOQUE ANTIMOTIM" (Escudo maciço & capacete viseira)
      // -------------------------------------------------------------
      // Heavy Riot Armor with broad shoulders
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(-8, -9, 16, 18, 4.5);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-6, -4, 12, 8);

      // Heavy Riot Helmet with Neck Protector
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0.5, 0, 6.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.65)'; // Shield visor
      ctx.fillRect(4, -3.8, 3.5, 7.6);

      // Huge Reinforced Riot Shield in Front
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(8, -10.5, 6, 21, 3);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(8, -10.5, 6, 21);
      // Bullet Impact Dents
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(9, -4.5, 4, 9);

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "DEMOLIDOR DA CALIBRE 12" (Máscara de gás & escopeta pesada)
      // -------------------------------------------------------------
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-8, -9, 16, 18, 4.5);
      ctx.fill();

      // Shotgun Bandolier across chest
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-6, -7);
      ctx.lineTo(6, 7);
      ctx.stroke();

      // Gas Mask with Twin Respirators
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(0.5, 0, 5.8, 0, Math.PI * 2);
      ctx.fill();
      // Round Respirator Filters
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(3.5, -3.5, 2.4, 0, Math.PI * 2);
      ctx.arc(3.5, 3.5, 2.4, 0, Math.PI * 2);
      ctx.fill();
      // Reflective Mask Visor
      ctx.fillStyle = '#eab308';
      ctx.fillRect(4, -2, 2.2, 4);

      // Devastating Heavy Shotgun
      ctx.save();
      ctx.translate(-kickbackDist * 1.3, 0);
      ctx.rotate(-kickbackAngle * 1.3);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, -2.5, 16, 5);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, -3, 4, 6);
      ctx.restore();

    } else {
      // -------------------------------------------------------------
      // VAR 2: "BLINDADO COM LANTERNA TÁTICA" (Luz estroboscópica & pistola .50)
      // -------------------------------------------------------------
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-8, -9, 16, 18, 4.5);
      ctx.fill();

      // Helmet with Tactical Goggles
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0.5, 0, 5.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(3.8, -3, 2.8, 6);

      // Heavy Ballistic Shield with Strobe Flashlight
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(8, -10, 5.5, 20, 2.5);
      ctx.fill();

      // Blinking Strobe Flashlight on Shield
      if (Math.sin(time * 0.025) > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(14, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Heavy .50 Pistol
      ctx.save();
      ctx.translate(-kickbackDist, 0);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(7, 3.5, 8.5, 3.6);
      ctx.restore();
    }

  // -----------------------------------------------------------------------
  // RIVAL TYPE: CHEFE MORRO / BOSS (3 supreme area boss variants)
  // -----------------------------------------------------------------------
  } else {
    const skinTone = variant === 1 ? '#d9986b' : '#a15e34';

    drawHumanLegs(ctx, stepPhase, isMoving, '#020617', skinTone, '#fbbf24', {
      isShorts: variant === 0,
      shoesSoleColor: '#ffffff',
      shoesAccent: '#f43f5e'
    });

    if (variant === 0) {
      // -------------------------------------------------------------
      // VAR 0: "O DONO DA FAVELA" (Regata de seda, cordão de quilo, fuzil dourado)
      // -------------------------------------------------------------
      // Silk Black Tank with Crown / Lion print
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(-8, -9, 16, 18, 4.5);
      ctx.fill();
      // Golden Crown Motif
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-2, -4, 4, 8);

      // Massive Multi-Strand Gold Chain of 1 Kilo
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(1, 0, 5.2, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(2, 0, 3.8, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      // Massive Faction Gold Medallion
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(6.5, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Head: Razor Fade & Gold Frame Sunglasses
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(1, 0, 5.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b'; // Razor cut fade
      ctx.fillRect(-3, -4, 4, 8);
      // Gold frame sunglasses
      drawOakleyJuliet(ctx, 3.5, 0, '#fbbf24');

      // Cigar with rising smoke
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4.5, 2.5, 3.5, 1.4);
      ctx.fillStyle = '#ef4444'; // Glowing ember
      ctx.fillRect(8, 2.5, 1.2, 1.4);

      // Arms gripping Sculpted Gold Assault Rifle
      ctx.fillStyle = skinTone;
      ctx.fillRect(2.5, -6.5, 6.5, 3.2);
      ctx.fillRect(3.5, 3.5, 6, 3.2);

      // Custom 24K Gold Assault Rifle with Recoil
      ctx.save();
      ctx.translate(-kickbackDist * 1.2, 0);
      ctx.rotate(-kickbackAngle * 1.2);
      ctx.fillStyle = '#78350f'; // Mahogany stock
      ctx.fillRect(-2, -2, 6, 4);
      ctx.fillStyle = '#fbbf24'; // Solid gold receiver & barrel
      ctx.fillRect(4, -2.8, 17, 5.6);
      ctx.fillStyle = '#f59e0b'; // Gold banana mag
      ctx.beginPath();
      ctx.roundRect(8, 2.8, 4.5, 7, 1.5);
      ctx.fill();
      ctx.fillStyle = '#fbbf24'; // Flash hider
      ctx.fillRect(21, -3.2, 3, 6.4);
      ctx.restore();

    } else if (variant === 1) {
      // -------------------------------------------------------------
      // VAR 1: "O PATRÃO DE TERNO & COLETE" (Colete risca de giz, duas Desert Eagles)
      // -------------------------------------------------------------
      // Pinstripe Suit Vest over Open Black Shirt
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-8, -9, 16, 18, 4.5);
      ctx.fill();
      // Pinstripes
      ctx.fillStyle = '#334155';
      ctx.fillRect(-7, -6, 14, 1.2);
      ctx.fillRect(-7, 0, 14, 1.2);
      ctx.fillRect(-7, 6, 14, 1.2);

      // Head: Slicked Back Hair & Scar
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(1, 0, 5.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#020617'; // Slick hair
      ctx.fillRect(-3.5, -4.5, 5, 9);
      // Battle Scar across cheek
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(3, -2);
      ctx.lineTo(5, 2);
      ctx.stroke();

      // Dual Chrome Desert Eagle .50 Pistols
      ctx.fillStyle = skinTone;
      ctx.fillRect(2.5, -7.5, 6, 3);
      ctx.fillRect(2.5, 4.5, 6, 3);

      ctx.save();
      ctx.translate(-kickbackDist, 0);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(8, -8, 8, 4);
      ctx.fillRect(8, 4, 8, 4);
      ctx.fillStyle = '#78350f'; // Ivory/Wood grips
      ctx.fillRect(6, -7.5, 2.5, 3);
      ctx.fillRect(6, 4.5, 2.5, 3);
      ctx.restore();

    } else {
      // -------------------------------------------------------------
      // VAR 2: "O VETERANO DISSIDENTE" (Boina vermelha militar, farda & ParaFAL)
      // -------------------------------------------------------------
      // Military Urban Camo Dress Uniform with Golden Epaulettes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-8, -9, 16, 18, 4.5);
      ctx.fill();
      // Golden Shoulder Epaulettes
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-5, -10, 5, 3.5);
      ctx.fillRect(-5, 6.5, 5, 3.5);
      // Faction Sash across chest
      ctx.fillStyle = color;
      ctx.fillRect(-7, -3, 14, 4);

      // Red/Faction Military Beret with Golden Crest
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(1, 0, 5.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#991b1b'; // Red Beret
      ctx.beginPath();
      ctx.ellipse(0, -1.5, 6.2, 5.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24'; // Gold crest
      ctx.fillRect(2.5, -4, 2, 2);

      // Customized Tactical FAL with Double Drum Mag
      ctx.fillStyle = skinTone;
      ctx.fillRect(2.5, -6.5, 6.5, 3.2);
      ctx.fillRect(3.5, 3.5, 6, 3.2);

      ctx.save();
      ctx.translate(-kickbackDist * 1.2, 0);
      ctx.rotate(-kickbackAngle * 1.2);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, -2.5, 18, 5);
      // Double Drum Magazine
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(9, -4.5, 3, 0, Math.PI * 2);
      ctx.arc(9, 4.5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore(); // restore character transform

  // Boss menacing aura underneath
  if (type === 'chefe_morro') {
    const auraPulse = Math.sin(time * 0.008) * 3.5;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 20 + auraPulse, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary inner fiery ring
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, 14 + auraPulse * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Faction Tag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.beginPath();
  ctx.roundRect(x - 12, y - radius - 16, 24, 9.5, 2.5);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = 'bold 7px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(factionTag, x, y - radius - 11.2);

  // HP Bar
  const barWidth = radius * 2.2;
  const barHeight = 3.5;
  const pct = Math.max(0, hp / maxHp);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(x - barWidth / 2, y - radius - 5, barWidth, barHeight);
  ctx.fillStyle = type === 'chefe_morro' ? '#f43f5e' : (type === 'blindado_choque' ? '#f59e0b' : '#38bdf8');
  ctx.fillRect(x - barWidth / 2, y - radius - 5, barWidth * pct, barHeight);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x - barWidth / 2, y - radius - 5, barWidth, barHeight);
}

export function drawFallenSprite(
  ctx: CanvasRenderingContext2D,
  fallen: FallenEntity,
  time: number
) {
  const { x, y, bountyCash, bountyAmmo, decayTime, maxDecayTime } = fallen;
  const hasLoot = bountyCash > 0 || bountyAmmo > 0;
  const pctDecay = Math.max(0, decayTime / maxDecayTime);

  // Chalk / Blood outline
  ctx.fillStyle = hasLoot ? 'rgba(185, 28, 28, 0.45)' : 'rgba(71, 85, 105, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hasLoot ? '#334155' : '#1e293b';
  ctx.beginPath();
  ctx.roundRect(x - 9, y - 3, 18, 7, 3);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(x - 9, y, 3.5, 0, Math.PI * 2);
  ctx.fill();

  if (hasLoot) {
    const floatBob = Math.sin(time * 0.008) * 2;

    if (bountyAmmo > 0) {
      const crateX = x;
      const crateY = y - 11 + floatBob;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(crateX, crateY, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3f6212';
      ctx.fillRect(crateX - 7, crateY - 5, 14, 10);
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      ctx.strokeRect(crateX - 7, crateY - 5, 14, 10);

      ctx.fillStyle = '#facc15';
      ctx.fillRect(crateX - 5, crateY - 2, 10, 2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(crateX - 2, crateY - 5, 4, 3);

      ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(`📦 +${bountyAmmo}`, crateX, crateY - 8);
    } else {
      const cashX = x;
      const cashY = y - 10 + floatBob;

      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.beginPath();
      ctx.arc(cashX, cashY, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#15803d';
      ctx.fillRect(cashX - 7, cashY - 4, 14, 8);
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 1;
      ctx.strokeRect(cashX - 7, cashY - 4, 14, 8);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(cashX - 2.5, cashY - 4, 5, 8);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`$${bountyCash}`, cashX, cashY - 7);
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y + 2, 16, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pctDecay));
    ctx.stroke();
  }
}

export function drawBulletProjectile(
  ctx: CanvasRenderingContext2D,
  bullet: BulletProjectile
) {
  const { x, y, targetX, targetY, color, radius } = bullet;
  const angle = Math.atan2(targetY - y, targetX - x);

  const tracerLen = 9;
  const backX = x - Math.cos(angle) * tracerLen;
  const backY = y - Math.sin(angle) * tracerLen;

  const tracerGrad = ctx.createLinearGradient(backX, backY, x, y);
  tracerGrad.addColorStop(0, 'rgba(0,0,0,0)');
  tracerGrad.addColorStop(0.6, color);
  tracerGrad.addColorStop(1, '#ffffff');

  ctx.strokeStyle = tracerGrad;
  ctx.lineWidth = radius * 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(backX, backY);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();
}
