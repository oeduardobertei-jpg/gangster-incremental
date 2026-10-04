import { drawSoldier34 } from './soldier34';
import { AllyEntity, RivalEntity } from '../../types/game';

// Deterministic helper to get character visual variant (0, 1, or 2)
export function getCharVariant(entity: { id?: string; variant?: number }): number {
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

// -------------------------------------------------------------
// 1. ANATOMICAL HUMAN LEGS & RUNNING SHOES
// -------------------------------------------------------------
export function drawAnatomicalLegs(
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
  const accent = options?.shoesAccent ?? '#64748b';

  // Dynamic alternating stride along character forward/back axis
  const stride = isMoving ? stepPhase * 5.2 : 0;
  const leftX = stride;
  const rightX = -stride;

  // Left Leg (Hips attached at y = -3.8)
  ctx.fillStyle = pantsColor;
  ctx.beginPath();
  ctx.roundRect(-4.5 + leftX * 0.5, -5.2, 5.0, 3.2, 1.4);
  ctx.fill();

  // Right Leg (Hips attached at y = +3.8)
  ctx.beginPath();
  ctx.roundRect(-4.5 + rightX * 0.5, 2.0, 5.0, 3.2, 1.4);
  ctx.fill();

  // Visible Knee/Shin Skin if wearing shorts (bermuda tactel)
  if (isShorts) {
    ctx.fillStyle = skinColor;
    ctx.fillRect(-1.2 + leftX * 0.7, -4.8, 2.2, 2.4);
    ctx.fillRect(-1.2 + rightX * 0.7, 2.4, 2.2, 2.4);
  }

  // Sneakers (Nike Shox / Mizuno Wave / Kenner)
  // Left shoe
  ctx.fillStyle = shoesColor;
  ctx.beginPath();
  ctx.roundRect(-0.2 + leftX, -5.0, 5.2, 2.8, 1.2);
  ctx.fill();
  // Sole & springs/air cushion
  ctx.fillStyle = soleColor;
  ctx.fillRect(-0.2 + leftX, -2.8, 5.2, 0.9);
  ctx.fillStyle = accent;
  ctx.fillRect(0.8 + leftX, -4.4, 1.8, 0.9);

  // Right shoe
  ctx.fillStyle = shoesColor;
  ctx.beginPath();
  ctx.roundRect(-0.2 + rightX, 2.2, 5.2, 2.8, 1.2);
  ctx.fill();
  // Sole & springs/air cushion
  ctx.fillStyle = soleColor;
  ctx.fillRect(-0.2 + rightX, 4.4, 5.2, 0.9);
  ctx.fillStyle = accent;
  ctx.fillRect(0.8 + rightX, 2.8, 1.8, 0.9);
}

// -------------------------------------------------------------
// 2. OAKLEY JULIET / PENNY SUNGLASSES
// -------------------------------------------------------------
export function drawOakleyJuliet(ctx: CanvasRenderingContext2D, x: number, y: number, lensColor: string) {
  // Dark metallic frame
  ctx.fillStyle = '#090d16';
  ctx.fillRect(x - 0.4, y - 3.2, 1.8, 6.4);
  // Left lens
  ctx.fillStyle = lensColor;
  ctx.beginPath();
  ctx.roundRect(x, y - 2.8, 1.6, 2.2, 0.6);
  ctx.fill();
  // Right lens
  ctx.beginPath();
  ctx.roundRect(x, y + 0.6, 1.6, 2.2, 0.6);
  ctx.fill();
  // Reflective iridescence
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(x + 0.3, y - 2.2, 0.6, 0.9);
  ctx.fillRect(x + 0.3, y + 1.1, 0.6, 0.9);
}

// -------------------------------------------------------------
// 3. HEAVY GOLD CHAIN (CORDÃO BAIANO 18K)
// -------------------------------------------------------------
export function drawHeavyGoldChain(ctx: CanvasRenderingContext2D, x: number, y: number, size = 3.6) {
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(x, y, size, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();
  // Gold crucifix / medallion
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(x + size + 0.8, y, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

// -------------------------------------------------------------
// 4. ANATOMICAL HUMAN TORSO & ATTIRE
// -------------------------------------------------------------
export function drawHumanTorso(
  ctx: CanvasRenderingContext2D,
  skinTone: string,
  outfit: {
    type: 'jersey' | 'tank' | 'bare' | 'vest' | 'jacket';
    primaryColor: string;
    secondaryColor?: string;
    hasGoldChain?: boolean;
    hasCrossbodyBag?: boolean;
    hasTattoos?: boolean;
    stripePattern?: 'vertical' | 'horizontal' | 'sash';
  }
) {
  // Athletic V-taper Human Silhouette (NO flat box/tower!)
  ctx.beginPath();
  ctx.moveTo(-4.2, -3.5); // Narrow waist left
  ctx.lineTo(-4.2, 3.5);  // Narrow waist right
  ctx.lineTo(-0.5, 6.2);  // Curves out to right shoulder deltoid
  ctx.arc(0, 6.0, 2.4, 0, Math.PI * 0.5); // Right shoulder round cap
  ctx.lineTo(2.4, 0);     // Upper chest / clavicle
  ctx.arc(0, -6.0, 2.4, -Math.PI * 0.5, 0); // Left shoulder round cap
  ctx.lineTo(-4.2, -3.5); // Back to waist
  ctx.closePath();

  if (outfit.type === 'bare') {
    // Muscular Bare Chest
    ctx.fillStyle = skinTone;
    ctx.fill();

    // Pectoral contours
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(0.2, -3.0, 2.0, 1.2);
    ctx.fillRect(0.2, 1.8, 2.0, 1.2);
    ctx.fillRect(0.6, -3.2, 0.8, 6.4); // Sternum line

    // Tattoos on shoulder and chest
    if (outfit.hasTattoos) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(-2.0, -5.5, 3.0, 2.4);
      ctx.fillRect(0.5, -4.5, 2.0, 1.8);
    }
  } else if (outfit.type === 'tank') {
    // Base bare shoulder skin
    ctx.fillStyle = skinTone;
    ctx.fill();

    // Ribbed Tank Top with deep armhole cuts
    ctx.fillStyle = outfit.primaryColor;
    ctx.beginPath();
    ctx.moveTo(-4.2, -3.2);
    ctx.lineTo(-4.2, 3.2);
    ctx.lineTo(-1.0, 4.5);
    ctx.lineTo(2.0, 0);
    ctx.lineTo(-1.0, -4.5);
    ctx.closePath();
    ctx.fill();

    // Tank trims
    ctx.strokeStyle = outfit.secondaryColor || '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  } else if (outfit.type === 'vest') {
    // Dark undershirt
    ctx.fillStyle = '#090d16';
    ctx.fill();

    // Ceramic ballistic plate with faction color
    ctx.fillStyle = outfit.primaryColor;
    ctx.beginPath();
    ctx.moveTo(-3.0, -4.2);
    ctx.lineTo(-3.0, 4.2);
    ctx.lineTo(1.8, 3.5);
    ctx.lineTo(2.2, 0);
    ctx.lineTo(1.8, -3.5);
    ctx.closePath();
    ctx.fill();

    // Triple ammo pouches across belly
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-0.5, -3.2, 1.8, 6.4);
  } else if (outfit.type === 'jacket') {
    // Windbreaker jacket
    ctx.fillStyle = outfit.primaryColor;
    ctx.fill();

    // Central zipper line & secondary color accents
    ctx.strokeStyle = outfit.secondaryColor || '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-4.2, 0);
    ctx.lineTo(2.2, 0);
    ctx.stroke();
  } else {
    // Football Jersey ("Manto da Facção")
    ctx.fillStyle = outfit.primaryColor;
    ctx.fill();

    // Team jersey stripes
    ctx.fillStyle = outfit.secondaryColor || '#0f172a';
    if (outfit.stripePattern === 'sash') {
      // Diagonal sash (Vasco style)
      ctx.beginPath();
      ctx.moveTo(-4.0, -3.0);
      ctx.lineTo(1.5, 4.0);
      ctx.lineTo(2.2, 2.0);
      ctx.lineTo(-3.2, -4.0);
      ctx.closePath();
      ctx.fill();
    } else {
      // Contrast stripes (Flamengo / Corinthians style)
      ctx.fillRect(-3.0, -3.8, 5.0, 1.8);
      ctx.fillRect(-3.0, 2.0, 5.0, 1.8);
    }

    // Collar showing throat
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.moveTo(1.0, -1.8);
    ctx.lineTo(2.2, 0);
    ctx.lineTo(1.0, 1.8);
    ctx.closePath();
    ctx.fill();
  }

  // Heavy 18k Gold Chain
  if (outfit.hasGoldChain) {
    drawHeavyGoldChain(ctx, 1.0, 0, 3.2);
  }

  // Tactical Crossbody Shoulder Bag ("Bag da Nike / Cyclone")
  if (outfit.hasCrossbodyBag) {
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-2.5, -6.0);
    ctx.lineTo(1.8, 4.5);
    ctx.stroke();

    // Side pouch with silver zipper
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(0.2, 1.2, 4.2, 4.0, 1.2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(1.0, 1.8, 2.4, 0.7);
  }
}

// -------------------------------------------------------------
// 5. ANATOMICAL HUMAN HEAD & FACIAL GEAR
// -------------------------------------------------------------
export function drawHumanHead(
  ctx: CanvasRenderingContext2D,
  skinTone: string,
  style: {
    headwear: 'backwards_cap' | 'forward_cap' | 'bucket_hat' | 'bandana' | 'balaclava' | 'beret' | 'helmet' | 'fade_hair' | 'blonde_hair';
    headwearColor: string;
    hasJuliet?: boolean;
    julietLensColor?: string;
    hasEarring?: boolean;
    hasCigar?: boolean;
  }
) {
  // Neck connecting shoulders to head
  ctx.fillStyle = skinTone;
  ctx.fillRect(0.8, -2.0, 1.6, 4.0);

  // Oval Human Head
  ctx.beginPath();
  ctx.ellipse(2.2, 0, 4.4, 3.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears on both sides
  ctx.fillRect(1.6, -4.4, 1.6, 1.4);
  ctx.fillRect(1.6, 3.0, 1.6, 1.4);
  if (style.hasEarring) {
    ctx.fillStyle = '#fbbf24'; // Gold stud
    ctx.fillRect(1.8, -4.2, 0.8, 0.8);
  }

  // Hair / Headwear
  const { headwear, headwearColor } = style;
  if (headwear === 'fade_hair') {
    // Dark Fade ("Corte do Jaca") with razor line
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(1.5, 0, 4.2, Math.PI * 0.45, Math.PI * 1.55);
    ctx.fill();
    ctx.fillStyle = skinTone; // Razor line
    ctx.fillRect(0.5, -2.2, 0.8, 4.0);
  } else if (headwear === 'blonde_hair') {
    // Bleached blonde ("Nevou")
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(1.5, 0, 4.2, Math.PI * 0.4, Math.PI * 1.6);
    ctx.fill();
  } else if (headwear === 'backwards_cap') {
    // Cap turned backwards with brim resting on neck
    ctx.fillStyle = headwearColor;
    ctx.beginPath();
    ctx.arc(1.5, 0, 4.3, Math.PI * 0.45, Math.PI * 1.55);
    ctx.fill();
    // Backwards curved brim
    ctx.beginPath();
    ctx.roundRect(-2.8, -2.4, 2.4, 4.8, 1.2);
    ctx.fill();
    // Snapback buckle
    ctx.fillStyle = '#020617';
    ctx.fillRect(-1.0, -1.0, 1.0, 2.0);
  } else if (headwear === 'forward_cap') {
    // Cap turned forward with visor shading brow
    ctx.fillStyle = headwearColor;
    ctx.beginPath();
    ctx.arc(1.5, 0, 4.2, Math.PI * 0.45, Math.PI * 1.55);
    ctx.fill();
    // Front visor
    ctx.fillStyle = headwearColor;
    ctx.beginPath();
    ctx.roundRect(3.5, -2.5, 3.2, 5.0, 1.0);
    ctx.fill();
  } else if (headwear === 'bucket_hat') {
    // Bucket Hat
    ctx.fillStyle = headwearColor;
    ctx.beginPath();
    ctx.arc(1.6, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();
    // Circular brim with contrast trim
    ctx.strokeStyle = headwearColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(1.6, 0, 5.4, 0, Math.PI * 2);
    ctx.stroke();
  } else if (headwear === 'bandana') {
    // Bandana wrap
    ctx.fillStyle = headwearColor;
    ctx.fillRect(1.5, -4.4, 2.0, 8.8);
    // Bandana knot at back
    ctx.fillRect(-1.5, -1.5, 2.0, 3.0);
  } else if (headwear === 'balaclava') {
    // Tactical Ninja Balaclava
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(2.2, 0, 4.6, 0, Math.PI * 2);
    ctx.fill();
    // Eye opening
    ctx.fillStyle = skinTone;
    ctx.fillRect(4.0, -2.2, 2.0, 4.4);
    ctx.fillStyle = '#0f172a'; // Eyes
    ctx.fillRect(4.8, -1.6, 0.8, 1.0);
    ctx.fillRect(4.8, 0.6, 0.8, 1.0);
  } else if (headwear === 'beret') {
    // Military Beret tilted
    ctx.fillStyle = headwearColor;
    ctx.beginPath();
    ctx.ellipse(1.0, -1.2, 4.8, 4.0, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24'; // Golden Badge
    ctx.fillRect(2.8, -3.0, 1.4, 1.4);
  } else if (headwear === 'helmet') {
    // Ballistic FAST Helmet with Goggles
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(1.8, 0, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = headwearColor;
    ctx.fillRect(0.5, -5.0, 3.0, 1.5);
    ctx.fillRect(0.5, 3.5, 3.0, 1.5);
    ctx.fillStyle = '#38bdf8'; // Goggles
    ctx.fillRect(4.4, -2.4, 2.0, 4.8);
  }

  // Oakley Juliet Sunglasses
  if (style.hasJuliet) {
    drawOakleyJuliet(ctx, 3.8, 0, style.julietLensColor || '#38bdf8');
  }

  // Smoldering Cigar
  if (style.hasCigar) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4.2, 2.2, 3.6, 1.4);
    ctx.fillStyle = '#ef4444'; // Glowing tip
    ctx.fillRect(7.8, 2.2, 1.0, 1.4);
  }
}

// -------------------------------------------------------------
// 6. ARTICULATED ARMS & REALISTIC WEAPONS
// -------------------------------------------------------------
export function drawArmsAndWeapon(
  ctx: CanvasRenderingContext2D,
  skinTone: string,
  weapon: {
    type: 'fal' | 'ak47' | 'ar15' | 'glock_ext' | 'taurus_chrome' | 'shotgun_12' | 'mac10' | 'dual_pistols' | 'sniper' | 'gold_rifle' | 'shield_pistol' | 'walkie_talkie' | 'firework_mortar';
    factionColor: string;
    kickbackDist: number;
    kickbackAngle: number;
    time?: number;
  },
  sleeveColor?: string
) {
  const armColor = sleeveColor || skinTone;
  const { type, factionColor, kickbackDist, kickbackAngle } = weapon;

  // Upper Arms (from shoulders at y = +-6.0)
  ctx.fillStyle = armColor;
  ctx.fillRect(-0.5, 5.5, 3.8, 2.4);  // Right upper arm
  ctx.fillRect(-0.5, -7.5, 3.8, 2.4); // Left upper arm

  // Forearms extending to weapon
  ctx.fillStyle = skinTone;
  ctx.fillRect(2.4, 3.2, 4.4, 2.4);   // Right forearm
  ctx.fillRect(2.4, -5.2, 5.2, 2.4);  // Left forearm

  ctx.save();
  ctx.translate(-kickbackDist, 0);
  ctx.rotate(-kickbackAngle);

  if (type === 'fal') {
    // FAL 7.62 Assault Rifle
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-1.5, -1.8, 5.0, 3.6); // Stock
    ctx.fillStyle = '#334155';
    ctx.fillRect(3.5, -2.2, 7.5, 4.4);  // Receiver
    ctx.fillStyle = '#475569';
    ctx.fillRect(7.0, 1.8, 3.5, 5.0);   // Straight Box Mag
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(11.0, -1.5, 12.0, 2.8);// Long Ribbed Barrel
    ctx.fillStyle = '#475569';
    ctx.fillRect(21.0, -2.0, 2.5, 3.8); // Flash hider tip

    // Red Laser Guide
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(23, 0);
    ctx.lineTo(75, 0);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (type === 'ak47') {
    // AK-47 Assault Rifle with Wood Foregrip and Banana Mag
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2.0, -1.8, 5.5, 3.6); // Wood stock
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(3.5, -2.2, 7.5, 4.4);  // Steel Receiver
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(7.0, 2.0, 4.2, 6.5, 1.5); // Curved Banana Mag
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(11.0, -2.0, 5.0, 4.0); // Wood Handguard
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(16.0, -1.4, 7.0, 2.6); // Barrel
    ctx.fillStyle = '#334155';
    ctx.fillRect(21.0, -3.0, 2.0, 3.0); // Front Sight
  } else if (type === 'ar15') {
    // AR-15 / M4 Rifle with Holographic Red-Dot Sight
    ctx.fillStyle = '#334155';
    ctx.fillRect(-2.0, -1.6, 5.5, 3.2); // Stock
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(3.5, -2.0, 8.5, 4.0);  // Upper Receiver
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(5.5, -4.2, 4.0, 2.4);  // Optic
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(9.0, -3.4, 1.2, 1.2);  // Red dot lens
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(7.5, 1.8, 3.5, 6.0, 1.0); // Mag
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(12.0, -1.4, 10.5, 2.6);// Barrel
  } else if (type === 'glock_ext') {
    // Glock 17 with Extended 30-round Magazine
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(6.5, -1.8, 8.0, 3.6);  // Slide
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(9.0, -1.4, 2.4, 1.5);  // Chrome ejection port
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8.0, 1.8, 2.4, 5.0);   // Extended Stick Mag
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(8.4, 4.8, 1.6, 1.4);   // Brass bullets
  } else if (type === 'taurus_chrome') {
    // Chrome Taurus PT-92 with Wood Grips & Laser
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(6.5, -1.8, 8.2, 3.6);  // Chrome Slide
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(9.5, -1.4, 2.4, 1.5);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(5.5, 1.0, 2.2, 2.0);   // Wood grip
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8.5, 1.8, 3.5, 1.8);   // Laser sight
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(12.0, 2.1, 1.4, 1.4);  // Laser diode
  } else if (type === 'shotgun_12') {
    // Calibre 12 Pump Action Shotgun
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-1.0, -2.0, 5.0, 4.0);
    ctx.fillStyle = '#334155';
    ctx.fillRect(4.0, -2.5, 7.0, 5.0);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(11.0, -2.2, 12.0, 4.4);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(12.0, -2.8, 4.5, 5.6); // Wood pump
  } else if (type === 'sniper') {
    // Heavy Sniper Rifle with Telescopic Scope
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3.0, -1.8, 6.0, 3.6);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(3.0, -2.0, 17.0, 4.0);
    ctx.fillStyle = '#334155';
    ctx.fillRect(6.0, -4.5, 7.0, 2.5);  // Scope
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(11.5, -4.2, 1.5, 2.0); // Blue lens
  } else if (type === 'gold_rifle') {
    // 24K Solid Gold Assault Rifle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2.0, -2.0, 6.0, 4.0);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(4.0, -2.8, 17.0, 5.6);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(8.0, 2.8, 4.5, 7.0, 1.5);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(21.0, -3.2, 3.0, 6.4);
  } else if (type === 'shield_pistol') {
    // Ballistic Riot Shield in Left Hand
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(8.0, -9.5, 5.5, 19.0, 2.5);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(8.0, -9.5, 5.5, 19.0);
    ctx.fillStyle = factionColor;
    ctx.fillRect(9.0, -5.0, 3.5, 10.0);

    // Right Hand firing pistol through shield notch
    ctx.fillStyle = '#334155';
    ctx.fillRect(8.0, 3.8, 7.5, 3.4);
  } else if (type === 'mac10') {
    // Mac-10 SMG with Extended Mag
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(5.5, -2.5, 7.5, 5.0);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(7.0, 2.5, 2.5, 5.5);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(13.0, -1.8, 4.0, 3.6);
  } else if (type === 'dual_pistols') {
    // Dual Chrome & Gold Pistols
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(6.0, -6.0, 6.5, 3.0);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(6.0, 3.0, 6.5, 3.0);
  } else if (type === 'walkie_talkie') {
    // Walkie-Talkie Baofeng with Rubber Antenna
    ctx.fillStyle = '#020617';
    ctx.fillRect(5.5, 0.5, 4.5, 5.0);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(9.0, 1.5);
    ctx.lineTo(16.0, 1.5);
    ctx.stroke();

    // Blinking red transmission LED
    if (Math.sin((weapon.time || 0) * 0.015) > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(16.5, 1.5, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'firework_mortar') {
    // Firework mortar / Rojão 12 Tiros
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(5.5, -3.5, 8.0, 3.2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(13.5, -3.5, 2.5, 3.2);

    if (Math.sin((weapon.time || 0) * 0.02) > 0) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(16.0, -3.5, 1.6, 1.6);
    }
  }

  ctx.restore();
}

// -------------------------------------------------------------
// 7. DRAW ALLY SPRITE (Soldados e Recrutas Aliados)
// -------------------------------------------------------------
export function drawAllySprite(
  ctx: CanvasRenderingContext2D,
  ally: AllyEntity,
  time: number
) {
  const { x, y, type, color, hp, maxHp } = ally;
  const angle = ally.facingAngle ?? Math.atan2(ally.vy, ally.vx);
  const isMoving = Math.hypot(ally.vx, ally.vy) > 0.05;
  const variant = getCharVariant(ally);

  const walkDist = ally.walkDistance || 0;
  const stepPhase = isMoving ? Math.sin(walkDist * 0.28) : 0;
  const walkBob = isMoving ? Math.abs(stepPhase) * 1.5 : 0;
  const torsoTwist = isMoving ? stepPhase * 0.08 : 0;

  const recoil = ally.recoilTimer ? Math.max(0, ally.recoilTimer / 0.12) : 0;
  const kickbackDist = recoil * 4.8;
  const kickbackAngle = recoil * 0.14;

  // 0.5.5C: two-stage contact shadow anchors the sprite to the terrain.
  const shadowY = y + (type === 'batedor_moto' ? 7 : 7.5);
  const shadowW = type === 'batedor_moto' ? 16 : 10.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();ctx.ellipse(x + 1.5, shadowY + 1.5, shadowW + 4, 6.2, 0, 0, Math.PI * 2);ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.46)';
  ctx.beginPath();ctx.ellipse(x, shadowY, shadowW, 3.6, 0, 0, Math.PI * 2);ctx.fill();

  const faction = color.toLowerCase() === '#ef4444' ? 'CV' : 'PCC';
  if (drawSoldier34(ctx, {
    wx: x,
    wy: y,
    tx: 0,
    ty: 0,
    rot: 0,
    angle,
    faction,
    type,
    color,
    walkDist,
    isMoving,
    recoil: kickbackDist
  })) {
    return;
  }

  // Legacy fallback for any unsupported future unit type.
  // BATEDOR DE MOTO
  if (type === 'batedor_moto') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

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
      // CG 160cc TITAN
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-11, -4, 22, 8, 3.5);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, -3, 10, 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-13, 3.5, 17, 2.5);
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
      // HORNET 600cc NAKED
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-12, -4.5, 24, 9, 3.5);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-5, -4, 10, 8);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-13, 3.5, 18, 3);
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(8, -3, 7, 6, 2);
      ctx.roundRect(-15, -3, 7, 6, 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(4, -8.5, 3.5, 17);
      ctx.fillStyle = '#a15e34';
      ctx.beginPath();
      ctx.ellipse(-2, 0, 5.8, 4.8, 0, 0, Math.PI * 2);
      ctx.fill();
      drawHeavyGoldChain(ctx, 0, 0, 3.5);
      ctx.fillStyle = '#a15e34';
      ctx.beginPath();
      ctx.arc(3.5, 0, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-1, -3.5, 3.5, 7);
      drawOakleyJuliet(ctx, 4.5, 0, color);
    } else {
      // XRE 300cc MOTOCROSS
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(-12, -4, 24, 8, 3);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(-6, -3.5, 11, 7);
      ctx.fillStyle = color;
      ctx.fillRect(9, -2.5, 4, 5);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(8, -2.8, 6.5, 5.6, 2);
      ctx.roundRect(-14, -2.8, 6.5, 5.6, 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(4.5, -8, 3, 16);
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
    }
    ctx.restore();
    return;
  }

  // HUMAN SOLDIERS (Anatomical 3/4 top-down perspective)
  ctx.save();
  ctx.translate(x, y + walkBob);
  ctx.rotate(angle + torsoTwist);

  if (type === 'soldado_fuzil') {
    const skinTone = variant === 1 ? '#d9986b' : (variant === 2 ? '#824424' : '#a15e34');
    if (variant === 0) {
      // VAR 0: Fuzileiro do FAL 7.62 (Colete tático camuflado, boina militar, FAL 7.62)
      drawAnatomicalLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: false,
        shoesSoleColor: '#334155',
        shoesAccent: color
      });
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: color,
        secondaryColor: '#1e293b'
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'beret',
        headwearColor: color,
        hasEarring: true
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'fal',
        factionColor: color,
        kickbackDist,
        kickbackAngle
      });
    } else if (variant === 1) {
      // VAR 1: Atirador AR-15 / M4 (Colete balístico, capacete FAST, AR-15 com red-dot)
      drawAnatomicalLegs(ctx, stepPhase, isMoving, '#334155', skinTone, '#1e293b', {
        isShorts: false,
        shoesSoleColor: '#f1f5f9',
        shoesAccent: color
      });
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#1e293b',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'helmet',
        headwearColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'ar15',
        factionColor: color,
        kickbackDist,
        kickbackAngle
      }, '#1e293b');
    } else {
      // VAR 2: Guerreiro do AK-47 (Corta-vento, balaclava com olhos, AK-47)
      drawAnatomicalLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: false,
        shoesSoleColor: '#ffffff',
        shoesAccent: '#f59e0b'
      });
      drawHumanTorso(ctx, skinTone, {
        type: 'jacket',
        primaryColor: '#1e293b',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'balaclava',
        headwearColor: '#090d16'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'ak47',
        factionColor: color,
        kickbackDist,
        kickbackAngle
      }, '#1e293b');
    }
  } else if (type === 'seguranca_pesado') {
    const skinTone = variant === 0 ? '#824424' : (variant === 1 ? '#a15e34' : '#c27848');
    if (variant === 0) {
      // VAR 0: Brucutu da Calibre 12 (Colete nível IV, cartucheira, escopeta 12)
      drawAnatomicalLegs(ctx, stepPhase, isMoving, '#0f172a', skinTone, '#020617', {
        isShorts: false,
        shoesSoleColor: '#334155',
        shoesAccent: color
      });
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#0f172a',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'fade_hair',
        headwearColor: '#090d16',
        hasJuliet: true,
        julietLensColor: '#0f172a'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'shotgun_12',
        factionColor: color,
        kickbackDist: kickbackDist * 1.3,
        kickbackAngle: kickbackAngle * 1.3
      });
    } else if (variant === 1) {
      // VAR 1: Escudeiro de Choque Tático (Escudo balístico + pistola .45)
      drawAnatomicalLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: false,
        shoesSoleColor: '#64748b',
        shoesAccent: color
      });
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: color,
        secondaryColor: '#0f172a'
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'helmet',
        headwearColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'shield_pistol',
        factionColor: color,
        kickbackDist: kickbackDist * 0.8,
        kickbackAngle: kickbackAngle * 0.8
      });
    } else {
      // VAR 2: Segurança de Elite (Colete kevlar, boné tático, fuzil)
      drawAnatomicalLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: false,
        shoesSoleColor: '#f1f5f9',
        shoesAccent: color
      });
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#1e293b',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'forward_cap',
        headwearColor: color,
        hasJuliet: true,
        julietLensColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'ar15',
        factionColor: color,
        kickbackDist,
        kickbackAngle
      });
    }
  } else {
    // RECRUTA / SOLDADO BASE (3 Authentic Brazilian street gang fighters)
    const skinTone = variant === 0 ? '#c27848' : (variant === 1 ? '#a15e34' : '#824424');
    if (variant === 0) {
      // VAR 0: O Cria da Pista (Manto da Facção listrado, bermuda tactel, boné virado, Juliet da Facção, Glock pente estendido)
      drawAnatomicalLegs(ctx, stepPhase, isMoving, '#0f172a', skinTone, '#1e293b', {
        isShorts: true,
        shoesSoleColor: '#f8fafc',
        shoesAccent: color
      });
      drawHumanTorso(ctx, skinTone, {
        type: 'jersey',
        primaryColor: color,
        secondaryColor: '#0f172a',
        hasGoldChain: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'backwards_cap',
        headwearColor: color,
        hasJuliet: true,
        julietLensColor: color,
        hasEarring: true
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'glock_ext',
        factionColor: color,
        kickbackDist: kickbackDist * 0.85,
        kickbackAngle: kickbackAngle * 0.85
      });
    } else if (variant === 1) {
      // VAR 1: Pesadão Sem Camisa (Peitoral musculoso, tatuagens, cordão de ouro com crucifixo, bermuda, Taurus cromada)
      drawAnatomicalLegs(ctx, stepPhase, isMoving, color, skinTone, '#090d16', {
        isShorts: true,
        shoesSoleColor: '#facc15',
        shoesAccent: '#ffffff'
      });
      drawHumanTorso(ctx, skinTone, {
        type: 'bare',
        primaryColor: color,
        hasGoldChain: true,
        hasTattoos: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'fade_hair',
        headwearColor: color,
        hasEarring: true
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'taurus_chrome',
        factionColor: color,
        kickbackDist: kickbackDist * 0.85,
        kickbackAngle: kickbackAngle * 0.85
      });
    } else {
      // VAR 2: Batedor do Beco (Regata canelada preta, shoulder bag transversal, chapéu bucket, pistola com compensador)
      drawAnatomicalLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#090d16', {
        isShorts: true,
        shoesSoleColor: '#ffffff',
        shoesAccent: color
      });
      drawHumanTorso(ctx, skinTone, {
        type: 'tank',
        primaryColor: '#0f172a',
        secondaryColor: color,
        hasCrossbodyBag: true,
        hasGoldChain: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'bucket_hat',
        headwearColor: '#1e293b'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'glock_ext',
        factionColor: color,
        kickbackDist: kickbackDist * 0.85,
        kickbackAngle: kickbackAngle * 0.85
      });
    }
  }

  ctx.restore();
}

// -------------------------------------------------------------
// 8. DRAW RIVAL SPRITE (Soldados e Facções Rivais)
// -------------------------------------------------------------
export function drawRivalSprite(
  ctx: CanvasRenderingContext2D,
  rival: RivalEntity,
  time: number
) {
  const { x, y, type, color, hp, maxHp, radius, factionTag } = rival;
  const angle = rival.facingAngle ?? Math.atan2(rival.vy, rival.vx);
  const isMoving = Math.hypot(rival.vx, rival.vy) > 0.05;
  const variant = getCharVariant(rival);

  const walkDist = rival.walkDistance || 0;
  const stepPhase = isMoving ? Math.sin(walkDist * 0.28) : 0;
  const walkBob = isMoving ? Math.abs(stepPhase) * 1.5 : 0;
  const torsoTwist = isMoving ? stepPhase * 0.07 : 0;

  const recoil = rival.recoilTimer ? Math.max(0, rival.recoilTimer / 0.12) : 0;
  const kickbackDist = recoil * 4.8;
  const kickbackAngle = recoil * 0.14;

  // 0.5.5C: same contact-shadow language as allied units.
  const shadowY = y + radius - 2;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();ctx.ellipse(x + 1.5, shadowY + 1.4, radius * 1.12 + 3, 6.0, 0, 0, Math.PI * 2);ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.46)';
  ctx.beginPath();ctx.ellipse(x, shadowY, radius * 0.98, 3.6, 0, 0, Math.PI * 2);ctx.fill();

  const faction = color.toLowerCase() === '#ef4444' ? 'CV' : 'PCC';
  if (drawSoldier34(ctx, {
    wx: x,
    wy: y,
    tx: 0,
    ty: 0,
    rot: 0,
    angle,
    faction,
    type,
    color,
    walkDist,
    isMoving,
    recoil: kickbackDist
  })) {
    if (type === 'chefe_morro') {
      const auraPulse = Math.sin(time * 0.008) * 3.5;
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 20 + auraPulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    return;
  }

  ctx.save();
  ctx.translate(x, y + walkBob);
  ctx.rotate(angle + torsoTwist);

  if (type === 'olheiro') {
    const skinTone = variant === 1 ? '#824424' : '#a15e34';
    drawAnatomicalLegs(ctx, stepPhase, isMoving, variant === 0 ? '#1e293b' : color, skinTone, '#0f172a', {
      isShorts: true,
      shoesSoleColor: '#ffffff',
      shoesAccent: color
    });

    if (variant === 0) {
      // VAR 0: Radinho da Laje (Regata rival, boné frente, Juliet rival, Baofeng com LED piscando)
      drawHumanTorso(ctx, skinTone, {
        type: 'tank',
        primaryColor: color,
        secondaryColor: '#0f172a'
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'forward_cap',
        headwearColor: '#0f172a',
        hasJuliet: true,
        julietLensColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'walkie_talkie',
        factionColor: color,
        kickbackDist: 0,
        kickbackAngle: 0,
        time
      });
    } else if (variant === 1) {
      // VAR 1: Fogueteiro de Alerta (Manto esportivo, bandana, morteiro / rojão de 12 tiros)
      drawHumanTorso(ctx, skinTone, {
        type: 'jersey',
        primaryColor: color,
        secondaryColor: '#ffffff'
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'bandana',
        headwearColor: '#0f172a'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'firework_mortar',
        factionColor: color,
        kickbackDist: 0,
        kickbackAngle: 0,
        time
      });
    } else {
      // VAR 2: Vigia do Beco (Corta-vento encapuzado com capuz, smartphone)
      drawHumanTorso(ctx, skinTone, {
        type: 'jacket',
        primaryColor: '#1e293b',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'balaclava',
        headwearColor: '#0f172a'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'walkie_talkie',
        factionColor: color,
        kickbackDist: 0,
        kickbackAngle: 0,
        time
      });
    }
  } else if (type === 'soldado_pistola') {
    const skinTone = variant === 2 ? '#824424' : '#a15e34';
    drawAnatomicalLegs(ctx, stepPhase, isMoving, variant === 1 ? color : '#0f172a', skinTone, '#020617', {
      isShorts: true,
      shoesSoleColor: '#e2e8f0',
      shoesAccent: color
    });

    if (variant === 0) {
      // VAR 0: Soldado Balaclava (Colete leve, balaclava ninja, Glock com laser)
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#0f172a',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'balaclava',
        headwearColor: '#020617'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'glock_ext',
        factionColor: color,
        kickbackDist: kickbackDist * 0.85,
        kickbackAngle: kickbackAngle * 0.85
      });
    } else if (variant === 1) {
      // VAR 1: Pistoleiro do Manto Rival (Camisa de time rival, boné virado, Juliet rival, Taurus cromada)
      drawHumanTorso(ctx, skinTone, {
        type: 'jersey',
        primaryColor: color,
        secondaryColor: '#ffffff'
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'backwards_cap',
        headwearColor: color,
        hasJuliet: true,
        julietLensColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'taurus_chrome',
        factionColor: color,
        kickbackDist: kickbackDist * 0.85,
        kickbackAngle: kickbackAngle * 0.85
      });
    } else {
      // VAR 2: Soldado Sem Camisa Tatuado (Peitoral atlético com tatuagens, cordão prata, fade com risco)
      drawHumanTorso(ctx, skinTone, {
        type: 'bare',
        primaryColor: color,
        hasTattoos: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'fade_hair',
        headwearColor: '#0f172a'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'glock_ext',
        factionColor: color,
        kickbackDist: kickbackDist * 0.85,
        kickbackAngle: kickbackAngle * 0.85
      });
    }
  } else if (type === 'atirador_fuzil') {
    const skinTone = '#a15e34';
    drawAnatomicalLegs(ctx, stepPhase, isMoving, '#1e293b', skinTone, '#020617', {
      isShorts: false,
      shoesSoleColor: '#475569',
      shoesAccent: color
    });

    if (variant === 0) {
      // VAR 0: Sniper de Boina Rival (Boina militar da facção rival, rifle sniper de luneta azul)
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#1c1917',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'beret',
        headwearColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'sniper',
        factionColor: color,
        kickbackDist: kickbackDist * 1.1,
        kickbackAngle: kickbackAngle * 1.1
      });
    } else if (variant === 1) {
      // VAR 1: Fuzileiro de Emboscada (Camuflagem urbana, bandana, FAL com silenciador)
      drawHumanTorso(ctx, skinTone, {
        type: 'jacket',
        primaryColor: '#292524',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'bandana',
        headwearColor: '#1c1917',
        hasJuliet: true,
        julietLensColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'fal',
        factionColor: color,
        kickbackDist,
        kickbackAngle
      });
    } else {
      // VAR 2: Assalto AR-15 (Capacete FAST com fita rival, colete de placas, AR-15)
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#1e293b',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'helmet',
        headwearColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'ar15',
        factionColor: color,
        kickbackDist,
        kickbackAngle
      });
    }
  } else if (type === 'gerente_boca') {
    const skinTone = variant === 0 ? '#c27848' : '#a15e34';
    drawAnatomicalLegs(ctx, stepPhase, isMoving, '#0f172a', skinTone, '#1e1b4b', {
      isShorts: true,
      shoesSoleColor: '#fbbf24',
      shoesAccent: '#ffffff'
    });

    if (variant === 0) {
      // VAR 0: O Ostentação (Polo aberta, cordão triplo de ouro, platinado nevou, Juliet 24k, pistola de ouro)
      drawHumanTorso(ctx, skinTone, {
        type: 'jersey',
        primaryColor: color,
        secondaryColor: '#fbbf24',
        hasGoldChain: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'blonde_hair',
        headwearColor: '#fbbf24',
        hasJuliet: true,
        julietLensColor: '#fbbf24'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'gold_rifle',
        factionColor: color,
        kickbackDist: kickbackDist * 0.9,
        kickbackAngle: kickbackAngle * 0.9
      });
    } else if (variant === 1) {
      // VAR 1: O Gerente Tático (Jaqueta de couro, shoulder bag com dinheiro, Mac-10)
      drawHumanTorso(ctx, skinTone, {
        type: 'jacket',
        primaryColor: '#090d16',
        secondaryColor: color,
        hasCrossbodyBag: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'forward_cap',
        headwearColor: '#0f172a',
        hasEarring: true
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'mac10',
        factionColor: color,
        kickbackDist,
        kickbackAngle
      });
    } else {
      // VAR 2: O Braço Direito (Colete com detalhes dourados, chapéu bucket, dual pistols)
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#1e293b',
        secondaryColor: '#fbbf24',
        hasGoldChain: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'bucket_hat',
        headwearColor: '#0f172a'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'dual_pistols',
        factionColor: color,
        kickbackDist: kickbackDist * 0.85,
        kickbackAngle: kickbackAngle * 0.85
      });
    }
  } else if (type === 'blindado_choque') {
    const skinTone = '#a15e34';
    drawAnatomicalLegs(ctx, stepPhase, isMoving, '#0f172a', skinTone, '#020617', {
      isShorts: false,
      shoesSoleColor: '#475569',
      shoesAccent: color
    });

    if (variant === 0) {
      // VAR 0: Tropa de Choque Antimotim (Armadura pesada, escudo de choque reforçado)
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#090d16',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'helmet',
        headwearColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'shield_pistol',
        factionColor: color,
        kickbackDist: kickbackDist * 0.8,
        kickbackAngle: kickbackAngle * 0.8
      });
    } else if (variant === 1) {
      // VAR 1: Demolidor da Calibre 12 (Colete balístico, máscara de gás, escopeta pesada)
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#1e293b',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'balaclava',
        headwearColor: '#020617'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'shotgun_12',
        factionColor: color,
        kickbackDist: kickbackDist * 1.3,
        kickbackAngle: kickbackAngle * 1.3
      });
    } else {
      // VAR 2: Blindado com Lanterna Tática (Capacete, escudo balístico com strobe)
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#0f172a',
        secondaryColor: color
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'helmet',
        headwearColor: '#1e293b'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'shield_pistol',
        factionColor: color,
        kickbackDist,
        kickbackAngle
      });
    }
  } else {
    // CHEFE DO MORRO / BOSS
    const skinTone = variant === 1 ? '#d9986b' : '#a15e34';
    drawAnatomicalLegs(ctx, stepPhase, isMoving, '#020617', skinTone, '#fbbf24', {
      isShorts: variant === 0,
      shoesSoleColor: '#ffffff',
      shoesAccent: color
    });

    if (variant === 0) {
      // VAR 0: O Dono da Favela (Regata de seda, cordão de 1kg, óculos 24k, charuto aceso, fuzil de ouro 24k)
      drawHumanTorso(ctx, skinTone, {
        type: 'tank',
        primaryColor: '#020617',
        secondaryColor: '#fbbf24',
        hasGoldChain: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'fade_hair',
        headwearColor: '#1e1b4b',
        hasJuliet: true,
        julietLensColor: '#fbbf24',
        hasCigar: true
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'gold_rifle',
        factionColor: color,
        kickbackDist: kickbackDist * 1.2,
        kickbackAngle: kickbackAngle * 1.2
      });
    } else if (variant === 1) {
      // VAR 1: O Patrão do Cartel (Colete risca de giz, cicatriz, duas Desert Eagles cromadas)
      drawHumanTorso(ctx, skinTone, {
        type: 'vest',
        primaryColor: '#0f172a',
        secondaryColor: '#334155',
        hasGoldChain: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'fade_hair',
        headwearColor: '#020617'
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'dual_pistols',
        factionColor: color,
        kickbackDist,
        kickbackAngle
      });
    } else {
      // VAR 2: O Veterano Dissidente (Farda de gala camuflada com dragonas douradas, boina vermelha, ParaFAL)
      drawHumanTorso(ctx, skinTone, {
        type: 'jacket',
        primaryColor: '#1e293b',
        secondaryColor: color,
        hasGoldChain: true
      });
      drawHumanHead(ctx, skinTone, {
        headwear: 'beret',
        headwearColor: color
      });
      drawArmsAndWeapon(ctx, skinTone, {
        type: 'fal',
        factionColor: color,
        kickbackDist: kickbackDist * 1.2,
        kickbackAngle: kickbackAngle * 1.2
      });
    }
  }

  ctx.restore();

  // Boss menacing aura
  if (type === 'chefe_morro') {
    const auraPulse = Math.sin(time * 0.008) * 3.5;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 20 + auraPulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, 14 + auraPulse * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

