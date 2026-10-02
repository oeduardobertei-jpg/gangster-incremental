import { TerritoryVisualProfile } from '../../data/territoryVisuals';

export function drawTerritoryIdentityLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  profile: TerritoryVisualProfile
) {
  ctx.save();
  const midX = width / 2;

  if (profile.identity === 'periphery') {
    ctx.strokeStyle = 'rgba(148,163,184,0.10)';
    ctx.lineWidth = 1;
    for (let y = height * 0.12; y < height * 0.9; y += 72) {
      ctx.beginPath();
      ctx.moveTo(width * 0.04, y);
      ctx.lineTo(width * 0.12, y + 14);
      ctx.stroke();
    }
  }

  if (profile.identity === 'market_rail') {
    const railY = height * 0.28;
    ctx.fillStyle = '#0b0d12';
    ctx.fillRect(width * 0.03, railY - 16, width * 0.94, 32);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(width * 0.03, railY - 8); ctx.lineTo(width * 0.97, railY - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width * 0.03, railY + 8); ctx.lineTo(width * 0.97, railY + 8); ctx.stroke();
    ctx.fillStyle = '#3f3f46';
    for (let x = width * 0.04; x < width * 0.96; x += 24) ctx.fillRect(x, railY - 13, 5, 26);

    const stalls = [0.08, 0.13, 0.82, 0.87];
    stalls.forEach((ratio, i) => {
      const x = width * ratio, y = height * (i < 2 ? 0.58 : 0.67);
      ctx.fillStyle = i % 2 ? '#0f766e' : '#b45309';
      ctx.fillRect(x, y, 38, 7);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x + 3, y + 7, 32, 17);
      ctx.strokeStyle = '#71717a';
      ctx.beginPath(); ctx.moveTo(x + 5, y + 24); ctx.lineTo(x + 5, y + 31); ctx.moveTo(x + 33, y + 24); ctx.lineTo(x + 33, y + 31); ctx.stroke();
    });
  }

  if (profile.identity === 'industrial') {
    const containers = [
      { x: width * 0.05, y: height * 0.62, w: 78, h: 34, c: '#7c2d12' },
      { x: width * 0.78, y: height * 0.16, w: 88, h: 36, c: '#334155' }
    ];
    containers.forEach(c => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(c.x + 4, c.y + 5, c.w, c.h);
      ctx.fillStyle = c.c; ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.5; ctx.strokeRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = 'rgba(226,232,240,0.16)';
      for (let x = c.x + 8; x < c.x + c.w; x += 10) {
        ctx.beginPath(); ctx.moveTo(x, c.y + 3); ctx.lineTo(x, c.y + c.h - 3); ctx.stroke();
      }
    });
    ctx.fillStyle = 'rgba(249,115,22,0.18)';
    ctx.fillRect(midX - 82, height * 0.72, 164, 18);
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2;
    for (let x = midX - 78; x < midX + 78; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, height * 0.72 + 17); ctx.lineTo(x + 10, height * 0.72 + 1); ctx.stroke();
    }
  }

  if (profile.identity === 'fortified_hill') {
    ctx.strokeStyle = 'rgba(148,163,184,0.24)';
    ctx.lineWidth = 5;
    [0.20, 0.43, 0.68].forEach((ratio, i) => {
      const y = height * ratio;
      ctx.beginPath(); ctx.moveTo(width * (i % 2 ? 0.06 : 0.58), y); ctx.lineTo(width * (i % 2 ? 0.42 : 0.94), y - 14); ctx.stroke();
    });
    ctx.fillStyle = '#3f3f46';
    for (let i = 0; i < 5; i++) {
      const x = width * 0.08 + i * 34;
      const y = height * 0.82 - i * 5;
      ctx.fillRect(x, y, 25, 8);
      ctx.fillStyle = i % 2 ? '#7f1d1d' : '#3f3f46';
    }
  }

  if (profile.identity === 'gated_district') {
    ctx.fillStyle = 'rgba(148,163,184,0.12)';
    ctx.fillRect(width * 0.03, height * 0.08, width * 0.12, height * 0.84);
    ctx.fillRect(width * 0.85, height * 0.08, width * 0.12, height * 0.84);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.04, height * 0.10, width * 0.10, height * 0.80);
    ctx.strokeRect(width * 0.86, height * 0.10, width * 0.10, height * 0.80);
    ctx.fillStyle = 'rgba(34,197,94,0.14)';
    for (const x of [width * 0.09, width * 0.91]) {
      for (let y = height * 0.16; y < height * 0.88; y += 70) {
        ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  if (profile.identity === 'central_hq') {
    ctx.fillStyle = 'rgba(244,63,94,0.08)';
    ctx.fillRect(midX - 105, 0, 210, height);
    ctx.strokeStyle = 'rgba(244,63,94,0.42)'; ctx.lineWidth = 2;
    ctx.strokeRect(midX - 98, height * 0.05, 196, height * 0.90);
    ctx.fillStyle = '#3f0d18';
    for (const y of [height * 0.18, height * 0.42, height * 0.66]) {
      ctx.fillRect(midX - 118, y, 34, 10);
      ctx.fillRect(midX + 84, y, 34, 10);
    }
    ctx.fillStyle = 'rgba(244,63,94,0.55)';
    for (const x of [midX - 94, midX + 94]) {
      for (const y of [height * 0.12, height * 0.36, height * 0.60, height * 0.84]) {
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // 0.4E readable landmark signage: decorative only, never affects navigation.
  const titles: Record<string, string> = {
    periphery: 'BECO • COMUNIDADE', market_rail: 'FEIRA • LINHA DO TREM',
    industrial: 'OFICINAS • GALPÕES', fortified_hill: 'MORRO ALTO',
    gated_district: 'ORLA • CONDOMÍNIOS', central_hq: 'COMPLEXO CENTRAL'
  };
  ctx.font = '700 11px "Chakra Petch", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = `${profile.accent}99`;
  ctx.fillText(titles[profile.identity], midX, height * 0.095);

  if (profile.identity === 'periphery') {
    ctx.strokeStyle = 'rgba(226,232,240,0.18)'; ctx.lineWidth = 1;
    for (const y of [height*.19,height*.54]) {
      ctx.beginPath(); ctx.moveTo(width*.04,y); ctx.quadraticCurveTo(width*.22,y+14,width*.36,y+3); ctx.stroke();
    }
    ctx.fillStyle='#713f12'; ctx.fillRect(width*.82,height*.80,46,18);
    ctx.fillStyle='#a16207'; ctx.fillRect(width*.82,height*.79,48,4);
  }

  if (profile.identity === 'market_rail') {
    ctx.fillStyle='rgba(234,179,8,0.15)'; ctx.fillRect(width*.28,height*.225,width*.44,14);
    ctx.strokeStyle='#a1a1aa'; ctx.strokeRect(width*.28,height*.225,width*.44,14);
    ctx.fillStyle='#fef3c7'; ctx.font='700 8px sans-serif'; ctx.fillText('PLATAFORMA • FEIRA',midX,height*.225+10);
    for (const x of [width*.19,width*.24,width*.70,width*.75]) {
      ctx.fillStyle='#92400e'; ctx.fillRect(x,height*.57,28,20);
      ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.moveTo(x-3,height*.57);ctx.lineTo(x+31,height*.57);ctx.lineTo(x+26,height*.55);ctx.lineTo(x+2,height*.55);ctx.fill();
    }
  }

  if (profile.identity === 'industrial') {
    ctx.strokeStyle='rgba(148,163,184,0.28)'; ctx.lineWidth=2;
    ctx.strokeRect(width*.12,height*.15,180,78); ctx.strokeRect(width*.68,height*.57,210,86);
    ctx.fillStyle='#111827';
    for (let i=0;i<5;i++){ctx.beginPath();ctx.arc(width*.18+i*18,height*.76,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#475569';ctx.stroke();}
    for (const x of [width*.62,width*.66,width*.70]) {ctx.fillStyle='#b45309';ctx.fillRect(x,height*.20,13,20);ctx.strokeStyle='#f59e0b';ctx.strokeRect(x,height*.20,13,20);}
  }
  if (profile.identity === 'fortified_hill') {
    ctx.strokeStyle='#78716c'; ctx.lineWidth=3;
    for (let i=0;i<7;i++) { const x=width*.34+i*18, y=height*.66-i*10; ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+14,y-7);ctx.stroke(); }
    ctx.fillStyle='#78350f';
    for (const x of [width*.12,width*.16,width*.80,width*.84]) ctx.fillRect(x,height*.48,28,7);
    ctx.strokeStyle='#dc2626'; ctx.lineWidth=1; ctx.setLineDash([5,4]);
    ctx.strokeRect(width*.74,height*.12,150,72); ctx.setLineDash([]);
  }

  if (profile.identity === 'gated_district') {
    ctx.fillStyle='rgba(226,232,240,0.14)'; ctx.fillRect(width*.31,height*.14,width*.38,44);
    ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=2; ctx.strokeRect(width*.31,height*.14,width*.38,44);
    ctx.fillStyle='#0f172a'; ctx.fillRect(midX-28,height*.14+9,56,25);
    ctx.fillStyle='#a855f7'; ctx.font='700 8px sans-serif'; ctx.fillText('RESIDENCIAL ORLA',midX,height*.14+25);
    for (const x of [width*.23,width*.77]) {
      ctx.fillStyle='#475569';ctx.fillRect(x,height*.40,30,24);ctx.strokeStyle='#94a3b8';ctx.strokeRect(x,height*.40,30,24);
      ctx.fillStyle='rgba(56,189,248,0.18)';ctx.fillRect(x-8,height*.64,46,24);
    }
  }

  if (profile.identity === 'central_hq') {
    ctx.fillStyle='#111827';ctx.fillRect(midX-72,height*.30,144,86);
    ctx.strokeStyle=profile.accent;ctx.lineWidth=3;ctx.strokeRect(midX-72,height*.30,144,86);
    ctx.fillStyle='#3f0d18';ctx.fillRect(midX-18,height*.30+28,36,58);
    ctx.fillStyle='#e2e8f0';ctx.font='900 12px "Chakra Petch",sans-serif';ctx.fillText('QG',midX,height*.30+20);
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(midX,height*.30);ctx.lineTo(midX,height*.20);ctx.stroke();
    ctx.strokeStyle=profile.accent;ctx.beginPath();ctx.arc(midX,height*.20,14,Math.PI,Math.PI*2);ctx.stroke();
  }

  // Final 0.4E polish for the three quieter identities.
  if (profile.identity === 'periphery') {
    ctx.fillStyle='rgba(124,45,18,0.34)';
    for (const [x,y,w] of [[.025,.30,70],[.82,.22,84],[.06,.66,92],[.78,.83,76]]) ctx.fillRect(width*x,height*y,w,11);
    ctx.strokeStyle='rgba(226,232,240,0.16)'; ctx.lineWidth=1;
    for (const y of [height*.36,height*.72]) {ctx.beginPath();ctx.moveTo(width*.02,y);ctx.quadraticCurveTo(midX,y+20,width*.98,y-4);ctx.stroke();}
    for (const x of [width*.12,width*.88]) {ctx.fillStyle='#0c4a6e';ctx.beginPath();ctx.arc(x,height*.14,9,0,Math.PI*2);ctx.fill();}
  }

  if (profile.identity === 'fortified_hill') {
    ctx.fillStyle='rgba(120,53,15,0.22)';
    for (const [y,off] of [[.23,.04],[.46,.60],[.72,.08]]) ctx.fillRect(width*off,height*y,width*.34,16);
    ctx.strokeStyle='rgba(203,213,225,0.24)';ctx.lineWidth=2;
    for(let i=0;i<8;i++){const x=width*.48+i*15,y=height*.80-i*12;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12,y-7);ctx.stroke();}
  }

  if (profile.identity === 'gated_district') {
    ctx.fillStyle='rgba(56,189,248,0.14)';ctx.fillRect(width*.17,height*.69,90,38);ctx.fillRect(width*.76,height*.25,84,34);
    ctx.strokeStyle='rgba(125,211,252,0.45)';ctx.strokeRect(width*.17,height*.69,90,38);ctx.strokeRect(width*.76,height*.25,84,34);
    ctx.fillStyle='rgba(34,197,94,0.16)';
    for(const x of [width*.20,width*.27,width*.73,width*.80]){ctx.beginPath();ctx.arc(x,height*.53,17,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='rgba(226,232,240,0.18)';ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(width*.12,height*.88);ctx.lineTo(width*.88,height*.88);ctx.stroke();ctx.setLineDash([]);
  }

  ctx.restore();
}

export function drawTerritoryMinimapIdentity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  profile: TerritoryVisualProfile
) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = profile.accent;
  ctx.fillStyle = `${profile.accent}33`;
  ctx.lineWidth = 1;
  if (profile.identity === 'market_rail') {
    const y = height * 0.28;
    ctx.beginPath(); ctx.moveTo(4, y - 3); ctx.lineTo(width - 4, y - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, y + 3); ctx.lineTo(width - 4, y + 3); ctx.stroke();
  } else if (profile.identity === 'industrial') {
    ctx.fillRect(6, height * .60, 22, 11); ctx.fillRect(width - 34, height * .16, 27, 12);
  } else if (profile.identity === 'fortified_hill') {
    for (let i=0;i<4;i++){const y=height*(.24+i*.15);ctx.beginPath();ctx.moveTo(8+i*6,y);ctx.lineTo(width*.42+i*4,y-5);ctx.stroke();}
  } else if (profile.identity === 'gated_district') {
    ctx.strokeRect(5, 8, 12, height-16); ctx.strokeRect(width-17, 8, 12, height-16);
  } else if (profile.identity === 'central_hq') {
    ctx.strokeRect(width*.38, height*.10, width*.24, height*.80);
    ctx.fillRect(width*.44, height*.34, width*.12, height*.30);
  } else {
    ctx.setLineDash([3,3]); ctx.strokeRect(7,7,width-14,height-14); ctx.setLineDash([]);
  }
  ctx.restore();
}
