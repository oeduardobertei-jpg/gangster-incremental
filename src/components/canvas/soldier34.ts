// Soldados 2.5D (visão oblíqua 3/4): frente, costas e lado, com os visuais escolhidos por facção.
const C: Record<string, string> = { W: '#f1f5f9', K: '#16161b', G: '#6b7280', J: '#2b4a7a', O: '#e9b949', N: '#3f3f46', S: '#a3a3a3' };
type Spec = [string, string, string, string, string, string | 0, string, string, string, number, number, number, string];
// [pele, cabeça, cor, camisa, cor, listra, calça, cor, calçado, cordão, óculos, mochila, arma]
const LOOKS: Record<string, Record<string, Spec>> = {
  CV: {
    soldado: ['#8d5524', 'bandana', 'F', 'camisa', 'F', 'W', 'bermuda', 'K', 'tenis', 1, 0, 0, 'sub'],
    fuzileiro: ['#5c3a21', 'bandana', 'F', 'colete', 'W', 0, 'calca', 'J', 'tenis', 1, 1, 0, 'fuzil'],
    batedor: ['#e0ac69', 'bandana', 'F', 'regata', 'K', 0, 'bermuda', 'J', 'tenis', 1, 1, 1, 'pistola'],
    guarda: ['#5c3a21', 'balaclava', 'K', 'colete', 'W', 0, 'calca', 'K', 'tenis', 0, 0, 0, 'sub']
  },
  PCC: {
    soldado: ['#e0ac69', 'bone', 'K', 'camisa', 'F', 'W', 'calca', 'J', 'tenis', 0, 1, 0, 'pistola'],
    fuzileiro: ['#5c3a21', 'balaclava', 'K', 'camisa', 'F', 0, 'calca', 'N', 'tenis', 0, 0, 1, 'fuzil'],
    batedor: ['#e0ac69', 'capacete', 'F', 'moletom', 'K', 0, 'calca', 'K', 'tenis', 0, 0, 1, 'sub'],
    guarda: ['#5c3a21', 'balaclava', 'K', 'colete', 'W', 0, 'calca', 'K', 'tenis', 0, 0, 0, 'sub']
  }
};
const ROLE: Record<string, string> = {
  soldado_base: 'soldado', soldado_pistola: 'soldado', olheiro: 'soldado', gerente_boca: 'soldado',
  soldado_fuzil: 'fuzileiro', atirador_fuzil: 'fuzileiro', batedor_moto: 'batedor',
  seguranca_pesado: 'guarda', blindado_choque: 'guarda', chefe_morro: 'guarda'
};
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`;
};
function body(ctx: CanvasRenderingContext2D, o: Spec, main: string, dir: string, step: number, u: number, seated: boolean) {
  const [sk, hd, hc, tp, tc, st, bt, bc, sh, ch, gl, bg] = o;
  const dark = shade(main, 0.6);
  const c = (k: string) => (k === 'F' ? main : k === 'D' ? dark : k[0] === '#' ? k : C[k]);
  const R = (x: number, y: number, w: number, h: number, k: string) => { ctx.fillStyle = c(k); ctx.fillRect(x * u, y * u, w * u, h * u); };
  const side = dir === 's', back = dir === 'b';
  if (bg && side) R(3, 9, 3, 7, 'N');
  (side ? [[6, step > 0 ? -1 : 0], [8, step < 0 ? -1 : 0]] : [[5, step > 0 ? -1 : 0], [8, step < 0 ? -1 : 0]]).forEach(([x, dy]) => {
    if (seated) {
      if (bt === 'bermuda') { R(x, 16, 3, 2, bc); R(x, 18, 3, 2, sk); } else R(x, 16, 3, 4, bc);
      R(x, 20, 3, 1, 'W'); R(x, 21, 3, 1, 'F');
      return;
    }
    const d = dy;
    R(x, 16 + d, 3, 7, bt === 'bermuda' ? sk : bc);
    if (bt === 'bermuda') R(x, 16 + d, 3, 4, bc);
    R(x, 22 + d, 3, 2, 'W'); R(x, 23 + d, 3, 1, 'F');
  });
  const tx = side ? 5 : 4, tw = side ? 6 : 8;
  if (tp === 'regata') R(tx + 1, 8, tw - 2, 8, tc); else R(tx, 8, tw, 8, tp === 'colete' ? 'W' : tc);
  if (tp === 'colete') { R(tx, 9, tw, 7, 'N'); R(tx, 9, 1, 7, 'F'); R(tx + tw - 1, 9, 1, 7, 'F'); if (dir === 'f') R(6, 10, 4, 3, 'G'); }
  if (st && tp === 'camisa') { R(tx + 2, 8, 1, 8, st as string); R(tx + tw - 3, 8, 1, 8, st as string); }
  const sleeve = tp === 'camisa' || tp === 'moletom' ? tc : tp === 'colete' ? 'W' : sk;
  const aLen = tp === 'moletom' ? 7 : tp === 'regata' ? 7 : 4;
  const arm = (x: number) => { R(x, 8, 2, aLen, tp === 'regata' ? sk : sleeve); if (aLen < 7) R(x, 8 + aLen, 2, 7 - aLen, sk); };
  if (side) arm(7); else if (tp === 'regata') { arm(3); arm(11); } else { arm(2); arm(12); }
  if (bg && !side) { if (back) R(4, 8, 8, 9, 'N'); else { R(5, 8, 1, 7, 'N'); R(10, 8, 1, 7, 'N'); } }  R(7, 7, 2, 1, sk); R(5, 2, 6, 6, sk);
  if (dir === 'f') { R(6, 5, 1, 1, 'K'); R(9, 5, 1, 1, 'K'); }
  if (side) { R(9, 5, 1, 1, 'K'); R(11, 5, 1, 1, sk); }
  if (back) R(5, 2, 6, 3, 'K');
  if (hd === 'bone') { R(5, 1, 6, 3, hc); if (!back) R(5, 3, side ? 8 : 7, 1, 'K'); }
  if (hd === 'touca') { R(5, 1, 6, 3, hc); R(5, 3, 6, 1, 'D'); }
  if (hd === 'bandana') { R(5, 1, 6, 1, 'K'); R(5, 2, 6, 2, hc); if (side) R(3, 3, 2, 2, hc); else if (back) R(7, 4, 2, 2, hc); else R(11, 3, 2, 2, hc); }
  if (hd === 'balaclava') { R(5, 2, 6, 6, 'K'); if (dir === 'f') { R(6, 4, 4, 2, sk); R(6, 5, 1, 1, 'K'); R(9, 5, 1, 1, 'K'); } if (side) { R(8, 4, 3, 2, sk); R(9, 5, 1, 1, 'K'); } }
  if (hd === 'capacete') { R(5, 1, 6, back ? 6 : 5, hc); if (dir === 'f') R(5, 4, 6, 2, 'K'); if (side) R(9, 4, 3, 2, 'K'); }
  if (gl && dir === 'f' && hd !== 'capacete') { R(5, 4, 6, 1, 'K'); R(6, 5, 2, 1, 'K'); R(9, 5, 2, 1, 'K'); }
  if (gl && side && hd !== 'capacete') R(9, 4, 3, 1, 'K');
  if (ch && dir === 'f') { R(6, 8, 4, 1, 'O'); R(7, 9, 2, 1, 'O'); R(8, 10, 1, 1, 'O'); }
}

function gun(ctx: CanvasRenderingContext2D, hx: number, hy: number, ang: number, kind: string, kick: number, accent: string) {
  ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);ctx.translate(-kick,0);
  const len=kind==='pistola'?6.5:kind==='sub'?9:15;
  // Receiver + barrel with a stronger silhouette at normal gameplay zoom.
  ctx.fillStyle='#080b10';ctx.fillRect(-1,-1.5,len+2,3);
  ctx.fillStyle='#3f4650';ctx.fillRect(len*.28,-1.8,len*.38,1.1);
  ctx.fillStyle='#05070a';ctx.fillRect(len-.5,-.7,3.2,1.4);
  // Grip / magazine / stock keep the gun visibly connected to the hands.
  ctx.fillStyle='#151922';ctx.fillRect(1.2,.8,2.2,4);
  if(kind!=='pistola'){ctx.fillRect(len*.48,.7,2.2,4.2);ctx.fillRect(-4,-1.2,4.2,2.4);}
  if(kind==='fuzil'){ctx.fillStyle='#2a3039';ctx.fillRect(len*.72,-2.4,3.2,1);}
  // Small faction tape: readability without recolouring the weapon itself.
  ctx.fillStyle=accent;ctx.globalAlpha=.85;ctx.fillRect(Math.max(1,len*.18),-1.9,2.3,3.8);
  ctx.globalAlpha=1;
  ctx.restore();
}

function moto(ctx: CanvasRenderingContext2D, wx: number, wy: number, dir: string, flip: boolean, spin: number, main: string) {
  const s = flip ? -1 : 1, tire = '#232936', rim = '#b4b4bd', dk = '#16161b';
  const rx = (x0: number, x1: number, y: number, h: number, col: string) => { ctx.fillStyle = col; ctx.fillRect(Math.min(wx + x0 * s, wx + x1 * s), y, Math.abs(x1 - x0), h); };
  if (dir === 's') {    [-9, 9].forEach(o => {
      const cx = wx + o * s, cy = wy + 3.5;
      ctx.fillStyle = tire; ctx.beginPath(); ctx.arc(cx, cy, 4.7, 0, 7); ctx.fill();
      ctx.strokeStyle = rim; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, 3.3, 0, 7); ctx.stroke();
      ctx.lineWidth = 0.8; ctx.beginPath();
      for (let k = 0; k < 2; k++) { const a = spin + k * Math.PI / 2; ctx.moveTo(cx + Math.cos(a) * 3.1, cy + Math.sin(a) * 3.1); ctx.lineTo(cx - Math.cos(a) * 3.1, cy - Math.sin(a) * 3.1); }
      ctx.stroke();
    });
    ctx.strokeStyle = '#8b8b96'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(wx + 9 * s, wy + 3.5); ctx.lineTo(wx + 6.5 * s, wy - 3.5); ctx.stroke();
    ctx.strokeStyle = dk; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(wx + 6.5 * s, wy - 3.5); ctx.lineTo(wx + 4.5 * s, wy - 5.5); ctx.stroke();
    rx(-4, 4, wy + 1, 4.5, '#3f3f46');
    rx(-11, -3, wy + 4.6, 1.4, '#a1a1aa');
    rx(-2, 5, wy - 3, 3.5, main);
    rx(-8, -2, wy - 3, 2.2, dk);
    rx(-11, -7, wy - 2.2, 1.5, dk);
    ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(wx + 7.6 * s, wy - 2.6, 1.7, 0, 7); ctx.fill();
  } else {
    const front = dir === 'f';
    ctx.fillStyle = tire; ctx.fillRect(wx - 1.9, wy, 3.8, 9);
    ctx.fillStyle = rim; ctx.fillRect(wx - 0.5, wy + 0.5, 1, 8);
    rx(-2.6, 2.6, wy - 1, 3, main);
    rx(-4, 4, wy - 3.5, 3, dk);
    rx(-8, 8, wy - 6, 1.6, dk);
    ctx.fillStyle = front ? '#fde68a' : '#ef4444';
    ctx.beginPath(); ctx.arc(wx, front ? wy - 2 : wy + 1.4, front ? 1.9 : 1.3, 0, 7); ctx.fill();
  }
}
export type Soldier34Params = {
  wx: number; wy: number; tx: number; ty: number; rot: number; angle: number;
  faction: 'CV' | 'PCC'; type: string; color: string; walkDist: number; isMoving: boolean; recoil: number;
};

export function drawSoldier34(ctx: CanvasRenderingContext2D, p: Soldier34Params): boolean {
  const role = ROLE[p.type];
  if (!role) return false;
  const o = LOOKS[p.faction][role];
  const u = 1.45, boss = p.type === 'chefe_morro' ? 1.22 : 1;
  const dx = Math.cos(p.angle), dy = Math.sin(p.angle);
  const dir = Math.abs(dy) > Math.abs(dx) * 0.9 ? (dy > 0 ? 'f' : 'b') : 's';
  const flip = dx < 0 && dir === 's';
  const step = p.isMoving ? Math.sign(Math.sin(p.walkDist * 0.28)) : 0;
  ctx.save();
  ctx.rotate(-p.rot); ctx.translate(-p.tx, -p.ty);
  const rider = role === 'batedor';
  const feet = rider ? p.wy + 6.4 : p.wy + 9, top = feet - 24 * u * boss;
  const spin = p.walkDist * 0.45;
  if (rider && dir !== 'f') moto(ctx, p.wx, p.wy, dir, flip, spin, p.color);
  const armed = p.type !== 'olheiro';
  const hx = p.wx + dx * 3.4, hy = top + 11 * u * boss + dy * 3.4;
  const g = () => armed && gun(ctx, hx, hy, p.angle, o[12], p.recoil, p.color);
  if (dir === 'b') g();
  ctx.save();
  ctx.translate(p.wx, feet); ctx.scale(boss, boss); ctx.translate(-8 * u, -24 * u);
  if (flip) { ctx.translate(16 * u, 0); ctx.scale(-1, 1); }
  body(ctx, o, p.color, dir, step, u, rider);
  ctx.restore();
  if (rider && dir === 'f') moto(ctx, p.wx, p.wy, dir, flip, spin, p.color);
  if (dir !== 'b') g();
  ctx.restore();
  return true;
}