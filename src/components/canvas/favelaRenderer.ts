import { 
  RivalEntity, 
  AllyEntity, 
  FallenEntity, 
  BulletProjectile, 
  FactionConfig,
  CoverObstacle 
} from '../../types/game';
import { getTerritoryVisualProfile } from '../../data/territoryVisuals';

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

export function getTacticalBuildings(width: number, height: number, factionConfig: FactionConfig, territoryId = 1): TacticalBuilding[] {
  // Enforce consistent faction colors: PCC is always Blue (#3b82f6) and CV is always Red (#ef4444)
  const isPlayerCV = factionConfig.tag === 'CV';
  const cvColor = '#ef4444';
  const pccColor = '#3b82f6';

  const allyTag = isPlayerCV ? 'CV' : 'PCC';
  const allyColor = isPlayerCV ? cvColor : pccColor;
  const rivalTag = isPlayerCV ? 'PCC' : 'CV';
  const rivalColor = isPlayerCV ? pccColor : cvColor;

  const labelsByTerritory: Record<number, string[]> = {
    1: ['Beco 01','Laje do Ponto','Barraquinha','Esconderijo','Boca da Leste','Torre de Guarda','Mirante'],
    2: ['Box da Feira','Armazém do Trilho','Banca Coberta','Depósito da Praça','Estação Leste','Cabine Ferroviária','Passarela'],
    3: ['Oficina 01','Galpão de Peças','Serralheria','Depósito Industrial','Oficina Leste','Portaria do Pátio','Torre da Fábrica'],
    4: ['Beco da Subida','Laje Fortificada','Barraco Alto','Reduto do Morro','Boca do Alto','Posto de Vigia','Mirante do Morro'],
    5: ['Casa da Orla','Condomínio Norte','Guarita Oeste','Mansão Reservada','Portaria Leste','Guarita Principal','Cobertura'],
    6: ['Anexo do QG','Centro Operacional','Posto Blindado','Alojamento Central','Comando Leste','Torre de Segurança','QG Central']
  };
  const labels = labelsByTerritory[territoryId] ?? labelsByTerritory[1];

  const base: TacticalBuilding[] = [
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
      label: labels[0], 
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
      label: labels[1], 
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
      label: labels[2], 
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
      label: labels[3], 
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
      label: labels[4], 
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
      label: labels[5], 
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
      label: labels[6], 
      hasWaterTank: true, 
      isRivalHub: true, 
      graffiti: rivalTag, 
      graffitiColor: rivalColor 
    }
  ];

  // 0.5.2: tactical buildings now follow the urban logic of each district instead
  // of reusing the same seven coordinates under different labels.
  type BuildingLayout = { x:number; y:number; w:number; h:number; door:'left'|'right'|'top'|'bottom' };
  const layouts: Record<number, readonly BuildingLayout[]> = {
    1: [
      {x:.055,y:.765,w:96,h:56,door:'right'},{x:.045,y:.425,w:112,h:72,door:'right'},{x:.105,y:.115,w:70,h:48,door:'bottom'},
      {x:.795,y:.705,w:108,h:72,door:'left'},{x:.755,y:.365,w:120,h:78,door:'left'},{x:.735,y:.085,w:78,h:60,door:'bottom'},{x:.405,y:.050,w:96,h:56,door:'bottom'}
    ],
    2: [
      {x:.10,y:.65,w:72,h:52,door:'right'},{x:.10,y:.20,w:102,h:62,door:'right'},{x:.31,y:.48,w:82,h:54,door:'bottom'},
      {x:.74,y:.66,w:98,h:66,door:'left'},{x:.78,y:.23,w:108,h:70,door:'left'},{x:.63,y:.09,w:74,h:54,door:'bottom'},{x:.45,y:.055,w:88,h:46,door:'bottom'}
    ],
    3: [
      {x:.075,y:.72,w:98,h:66,door:'right'},{x:.07,y:.28,w:122,h:82,door:'right'},{x:.31,y:.17,w:102,h:70,door:'bottom'},
      {x:.72,y:.68,w:122,h:82,door:'left'},{x:.77,y:.29,w:118,h:78,door:'left'},{x:.58,y:.10,w:92,h:58,door:'bottom'},{x:.43,y:.045,w:100,h:60,door:'bottom'}
    ],
    4: [
      {x:.09,y:.75,w:88,h:58,door:'right'},{x:.17,y:.50,w:96,h:64,door:'right'},{x:.08,y:.27,w:86,h:58,door:'right'},
      {x:.72,y:.73,w:112,h:72,door:'left'},{x:.79,y:.50,w:102,h:68,door:'left'},{x:.82,y:.25,w:90,h:62,door:'left'},{x:.44,y:.115,w:98,h:64,door:'bottom'}
    ],
    5: [
      {x:.02,y:.72,w:100,h:68,door:'right'},{x:.02,y:.39,w:104,h:74,door:'right'},{x:.025,y:.09,w:88,h:58,door:'right'},
      {x:.90,y:.70,w:100,h:70,door:'left'},{x:.895,y:.38,w:104,h:72,door:'left'},{x:.90,y:.09,w:88,h:58,door:'left'},{x:.455,y:.10,w:112,h:70,door:'bottom'}
    ],
    6: [
      {x:.12,y:.72,w:104,h:70,door:'right'},{x:.12,y:.43,w:114,h:78,door:'right'},{x:.17,y:.16,w:94,h:64,door:'right'},
      {x:.79,y:.70,w:112,h:78,door:'left'},{x:.80,y:.43,w:106,h:72,door:'left'},{x:.78,y:.16,w:90,h:64,door:'left'},{x:.455,y:.11,w:116,h:78,door:'bottom'}
    ]
  };
  const layout = layouts[territoryId];
  if (!layout) return base;
  return base.map((building,index) => {
    const l = layout[index] ?? layout[0];
    const x = width*l.x, y = height*l.y;
    const doorX = l.door === 'left' ? x-14 : l.door === 'right' ? x+l.w+14 : x+l.w/2;
    const doorY = l.door === 'top' ? y-14 : l.door === 'bottom' ? y+l.h+14 : y+l.h/2;
    return { ...building, x, y, w:l.w, h:l.h, doorX, doorY };
  });
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
  time: number,
  includeAnimatedDetails = true,
  includeBuildings = true
) {
  // 0.4E: one renderer, territory-specific visual profile.
  const visual = getTerritoryVisualProfile(territoryId);
  const groundGrad = ctx.createLinearGradient(0, 0, 0, height);
  groundGrad.addColorStop(0, visual.groundTop);
  groundGrad.addColorStop(0.5, visual.groundMid);
  groundGrad.addColorStop(1, visual.groundBottom);
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 0, width, height);

  // --- LAYER 2: Vielas de Paralelepípedo & Calçadas de Concreto ---
  // Realistic Portuguese stone/cobblestone alley paving
  const alleyX = width * 0.18;
  const alleyW = 54;
  ctx.fillStyle = visual.alley;
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
  ctx.fillStyle = visual.alley;
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
  ctx.strokeStyle = visual.road;
  ctx.stroke();

  // Curbs (Meio-fio de calçado de concreto pintado de branco e sarjeta)
  ctx.strokeStyle = visual.curb;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Yellow broken lane divider on asphalt
  ctx.strokeStyle = visual.roadMarking;
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

  // 0.9.1D: legacy abstract landmark overlay retired; architecture now carries identity.

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
  if (includeBuildings) {
    const buildings = getTacticalBuildings(width, height, factionConfig, territoryId);

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

      ctx.fillStyle = '#245f73';
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

      if (includeAnimatedDetails) {
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

        ctx.font = 'bold 6px "Impact", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(b.graffiti, poleX + 2, poleY + 7);
      }
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
  }

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
    lampGrad.addColorStop(0, `${visual.lampCore}2e`);
    lampGrad.addColorStop(0.4, `rgba(${visual.lampGlow},0.08)`);
    lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = lampGrad;
    ctx.beginPath();
    ctx.arc(lampX, lampY, lightRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = visual.lampCore;
    ctx.beginPath();
    ctx.arc(lampX, lampY + 2, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// =========================================================================
// 2. OBSTÁCULOS E COBERTURA TÁTICA (Caçambas, Carros, Muros, Botijões)
export function drawTacticalBuilding(
  ctx: CanvasRenderingContext2D,
  b: TacticalBuilding,
  time: number,
  capturedByPlayer = false,
  playerColor = b.graffitiColor,
  playerTag = b.graffiti
) {
  const controlColor = capturedByPlayer ? playerColor : b.graffitiColor;
  const controlTag = capturedByPlayer ? playerTag : b.graffiti;
  const H = 28;
  const roofY = b.y - H;
  const facadeY = b.y + b.h - H;
  const sideDoor = b.doorX > b.x + b.w / 2;
  const doorX = sideDoor ? b.x + b.w - 18 : b.x + 8;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.fillRect(b.x + 5, b.y + b.h - 1, b.w, 9);
  ctx.fillStyle = b.type === 'brick' ? '#6b2410' : b.type === 'laje' ? '#475569' : '#57534e';
  ctx.fillRect(b.x, facadeY, b.w, H);
  if (capturedByPlayer) {
    ctx.save(); ctx.globalAlpha = 0.20; ctx.fillStyle = playerColor;
    ctx.fillRect(b.x, facadeY, b.w, H); ctx.restore();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 1;
  for (let yy = facadeY + 6; yy < facadeY + H; yy += 6) {
    ctx.beginPath(); ctx.moveTo(b.x, yy); ctx.lineTo(b.x + b.w, yy); ctx.stroke();
  }
  const windowCount = Math.max(1, Math.floor(b.w / 38));
  for (let i = 0; i < windowCount; i++) {
    const wx = b.x + (i + 0.5) * b.w / windowCount - 5;
    if (wx + 10 > doorX - 3 && wx < doorX + 13) continue;
    ctx.fillStyle = Math.sin(time * 0.002 + i * 2 + b.x) > -0.35 ? '#fde68a' : '#0f172a';
    ctx.fillRect(wx, facadeY + 7, 10, 8);
    ctx.strokeStyle = '#1e293b'; ctx.strokeRect(wx, facadeY + 7, 10, 8);
  }
  ctx.fillStyle = '#0b0f1a';
  ctx.fillRect(doorX, facadeY + H - 18, 10, 18);
  ctx.fillStyle = controlColor;
  ctx.fillRect(doorX - 1, facadeY + H - 20, 12, 2);

  ctx.fillStyle = b.type === 'brick' ? '#7c2d12' : b.type === 'laje' ? '#334155' : '#475569';
  ctx.fillRect(b.x, roofY, b.w, b.h);
  if (capturedByPlayer) {
    ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = playerColor;
    ctx.fillRect(b.x, roofY, b.w, b.h); ctx.restore();
  }
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(b.x, roofY, b.w, b.h);
  if (b.type === 'zinc') {
    ctx.strokeStyle = '#64748b';
    for (let x = b.x + 6; x < b.x + b.w; x += 7) {
      ctx.beginPath(); ctx.moveTo(x, roofY); ctx.lineTo(x, roofY + b.h); ctx.stroke();
    }
  }
  if (b.hasWaterTank) {
    const tx = b.x + b.w - 18, ty = roofY + 18;
    ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(tx, ty, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(tx - 2, ty - 2, 5, 0, Math.PI * 2); ctx.fill();
  }
  if (controlTag) {
    ctx.fillStyle = controlColor;
    ctx.font = 'bold 9px Impact, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(controlTag, b.x + 5, facadeY + H - 4);
  }
  ctx.fillStyle = 'rgba(15,23,42,0.92)';
  ctx.fillRect(b.x + b.w / 2 - 34, roofY + 5, 68, 13);
  ctx.strokeStyle = controlColor; ctx.strokeRect(b.x + b.w / 2 - 34, roofY + 5, 68, 13);
  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.label, b.x + b.w / 2, roofY + 11);
  ctx.restore();
}

export function drawFavelaAmbient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  factionConfig: FactionConfig,
  time: number,
  capturedBuildingIds?: ReadonlySet<string>,
  territoryId = 1
) {
  const buildings = getTacticalBuildings(width, height, factionConfig, territoryId);
  for (const b of buildings) {
    if (!b.isRivalHub) continue;
    const poleX = b.x + 8;
    const roofY = b.y - 28;
    const poleY = roofY - 12;
    const captured = capturedBuildingIds?.has(b.id) ?? false;
    const flagColor = captured ? factionConfig.color : b.graffitiColor;
    const flagTag = captured ? factionConfig.tag : b.graffiti;
    const flagWave = Math.sin(time * 0.005 + b.x) * 2;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(poleX, roofY + 4);
    ctx.lineTo(poleX, poleY);
    ctx.stroke();
    ctx.fillStyle = flagColor;
    ctx.beginPath();
    ctx.moveTo(poleX, poleY);
    ctx.lineTo(poleX + 14, poleY + 3 + flagWave);
    ctx.lineTo(poleX + 14, poleY + 11 + flagWave);
    ctx.lineTo(poleX, poleY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 6px "Impact", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(flagTag, poleX + 2, poleY + 7);
  }
}

// =========================================================================

// Factory to spawn deterministic tactical obstacles tailored to canvas size
export function createDefaultObstacles(width: number, height: number, territoryId = 1): CoverObstacle[] {
  const make = (
    id: string, type: CoverObstacle['type'], nx: number, ny: number,
    w: number, h: number, hp: number, isExplosive = false, rotation = 0
  ): CoverObstacle => ({
    id: `t${territoryId}_${id}`, type, x: width * nx, y: height * ny,
    w, h, hp, maxHp: hp, isExplosive, destroyed: false,
    ...(rotation ? { rotation } : {})
  });

  // 0.5.7: cover now belongs to the district instead of reusing the same five props everywhere.
  // Clean/controlled districts deliberately rely on authored architecture and purposeful props.
  switch (territoryId) {
    case 1:
      return [
        make('car', 'carro_abandonado', .37, .61, 46, 24, 180, true, -.15),
        make('wall', 'muro_concreto', .69, .58, 42, 16, 260),
        make('gas_a', 'botijao_gas', .34, .46, 16, 20, 35, true),
        make('gas_b', 'botijao_gas', .64, .49, 16, 20, 35, true)
      ];
    case 2:
      return [
        make('car', 'carro_abandonado', .55, .72, 46, 24, 180, true, .08),
        make('wall', 'muro_concreto', .59, .58, 42, 16, 260),
        make('gas_a', 'botijao_gas', .39, .66, 16, 20, 35, true),
        make('gas_b', 'botijao_gas', .86, .69, 16, 20, 35, true)
      ];
    case 3:
      return [
        make('car', 'carro_abandonado', .48, .62, 46, 24, 180, true, -.12),
        make('wall', 'muro_concreto', .38, .53, 42, 16, 260),
        make('gas_a', 'botijao_gas', .29, .49, 16, 20, 35, true),
        make('gas_b', 'botijao_gas', .70, .51, 16, 20, 35, true)
      ];
    case 4:
      return [
        make('car', 'carro_abandonado', .53, .70, 46, 24, 180, true, .10),
        make('wall_a', 'muro_concreto', .44, .60, 42, 16, 260),
        make('wall_b', 'muro_concreto', .58, .40, 42, 16, 260),
        make('gas', 'botijao_gas', .43, .67, 16, 20, 35, true)
      ];
    case 5:
    case 6:
      return [];
    default:
      return [];
  }
}

const drawCoverGroundContext = (ctx:CanvasRenderingContext2D,obs:CoverObstacle,territoryId:number) => {
  const {w,h,type}=obs;
  if(territoryId===1){ctx.fillStyle='rgba(74,61,47,.16)';ctx.beginPath();ctx.ellipse(0,h*.34,w*.70+8,h*.44+5,0,0,Math.PI*2);ctx.fill();}
  else if(territoryId===2){ctx.fillStyle='rgba(92,70,45,.10)';ctx.fillRect(-w*.65,-h*.62,w*1.3,h*1.35);ctx.strokeStyle='rgba(234,179,8,.12)';ctx.strokeRect(-w*.65,-h*.62,w*1.3,h*1.35);}
  else if(territoryId===3){ctx.fillStyle='rgba(15,23,42,.18)';ctx.beginPath();ctx.ellipse(0,h*.40,w*.72+10,h*.36+4,.08,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(249,115,22,.14)';for(let x=-w*.65;x<w*.65;x+=11){ctx.beginPath();ctx.moveTo(x,h*.64);ctx.lineTo(x+6,h*.43);ctx.stroke();}if(type==='carro_abandonado'){ctx.strokeStyle='rgba(15,23,42,.18)';ctx.lineWidth=2;for(const d of [-5,5]){ctx.beginPath();ctx.moveTo(-w*.8,d);ctx.lineTo(w*.8,d);ctx.stroke();}}}
  else if(territoryId===4){ctx.fillStyle='rgba(82,59,42,.18)';ctx.beginPath();ctx.ellipse(0,h*.38,w*.70+8,h*.42+5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(138,118,91,.20)';for(const [x,y] of [[-w*.4,h*.6],[w*.35,h*.52],[0,h*.72]] as const){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}}
};export function drawCoverObstacle(
  ctx: CanvasRenderingContext2D,
  obs: CoverObstacle,
  time: number
) {
  const { x, y, w, h, type, hp, maxHp, destroyed } = obs;
  const territoryId = Number(obs.id.match(/^t(\d+)_/)?.[1] ?? 1);
  const pct = Math.max(0, hp / maxHp);

  ctx.save();
  ctx.translate(x, y);
  if (obs.rotation) {
    ctx.rotate(obs.rotation);
  }
  drawCoverGroundContext(ctx,obs,territoryId);

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

    // District-specific finish: industrial barriers use safety paint instead of decorative sandbags.
    if (territoryId === 3) {
      for(let xx=-w*.42;xx<w*.42;xx+=10){ctx.fillStyle=((xx/10)|0)%2?'#111827':'#c25b20';ctx.globalAlpha=.48;ctx.fillRect(xx,h*.28,10,3);}ctx.globalAlpha=1;
      ctx.fillStyle='rgba(120,53,15,.22)';ctx.fillRect(-w*.32,-h*.22,w*.18,3);
    } else {
      ctx.fillStyle='#78716c';ctx.globalAlpha=.72;ctx.fillRect(-w*.4,-h/2-3,w*.8,4);ctx.globalAlpha=1;
      if(territoryId===1){ctx.strokeStyle='rgba(191,83,74,.40)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-w*.18,-1);ctx.lineTo(-w*.05,2);ctx.lineTo(w*.08,-2);ctx.lineTo(w*.20,1);ctx.stroke();}
    }
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
      ctx.fillStyle='rgba(0,0,0,.38)'; ctx.beginPath(); ctx.ellipse(3,h*.46,w*.66,5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#4b5563'; ctx.beginPath(); ctx.roundRect(-w*.56,h*.30,w*1.12,5,2); ctx.fill();
      // Cylinder Body Gradient (Iconic Blue Botijão)
      const gasGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      gasGrad.addColorStop(0, '#164e63');
      gasGrad.addColorStop(0.5, '#2f7f98');
      gasGrad.addColorStop(1, '#12394a');
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

      // Small painted safety band; reads as industrial equipment instead of HUD iconography.
      ctx.fillStyle = '#d97706'; ctx.fillRect(-4,-1,8,2);
      ctx.fillStyle = '#7c2d12'; ctx.fillRect(-2,1,4,2);
      ctx.fillStyle = 'rgba(226,232,240,.24)'; ctx.fillRect(-w*.36,h*.18,w*.72,1);

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
// 3. LOOT DE CAMPO & PROJÉTEIS
// Sprites de unidades vivem exclusivamente em soldierSprites.ts.
// =========================================================================

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
  const style = bullet.visualStyle ?? (bullet.source === 'rival' ? 'rival' : 'pistol');
  const tracerLen = style === 'fuzil' ? 16 : style === 'moto' ? 8.5 : style === 'rival' ? 10 : 11;
  const outerAlpha = style === 'fuzil' ? .32 : style === 'moto' ? .18 : style === 'rival' ? .22 : .25;
  const coreScale = style === 'fuzil' ? 1.05 : style === 'moto' ? .72 : style === 'rival' ? .82 : .9;
  const backX = x - Math.cos(angle) * tracerLen;
  const backY = y - Math.sin(angle) * tracerLen;

  ctx.save(); ctx.lineCap='round';
  // Faction streak is deliberately restrained; weapon class is read through length/weight.
  ctx.globalAlpha=outerAlpha; ctx.strokeStyle=color; ctx.lineWidth=Math.max(1.6,radius*1.9);
  ctx.beginPath(); ctx.moveTo(backX,backY); ctx.lineTo(x,y); ctx.stroke();
  ctx.globalAlpha=1;
  const core=ctx.createLinearGradient(backX,backY,x,y);
  core.addColorStop(0,'rgba(253,230,138,0)'); core.addColorStop(.62,'rgba(253,230,138,.62)'); core.addColorStop(1,'#fffdf2');
  ctx.strokeStyle=core; ctx.lineWidth=Math.max(.8,radius*coreScale);
  ctx.beginPath(); ctx.moveTo(backX,backY); ctx.lineTo(x,y); ctx.stroke();
  ctx.fillStyle='#fff7cc'; ctx.beginPath(); ctx.arc(x,y,Math.max(1,radius*.58),0,Math.PI*2); ctx.fill();
  ctx.restore();
}
