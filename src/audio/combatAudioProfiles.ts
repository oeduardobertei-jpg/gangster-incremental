export type GunfireType = 'pistol' | 'fuzil' | 'moto' | 'rival';

export interface GunfireProfile {
  minGap: number;
  transientFilter: 'highpass' | 'bandpass';
  transientHz: [number, number];
  transientVolume: number;
  bodyWave: OscillatorType;
  bodyHz: [number, number];
  bodyEndHz: number;
  bodyVolume: number;
  bodyDuration: number;
  tailHz: [number, number];
  tailVolume: number;
  tailDuration: number;
  pitchVariance: number;
}

export const GUNFIRE_PROFILES: Record<GunfireType, GunfireProfile> = {
  pistol: {
    minGap: .052,
    transientFilter: 'highpass', transientHz: [2100, 3100], transientVolume: .23,
    bodyWave: 'triangle', bodyHz: [300, 390], bodyEndHz: 72, bodyVolume: .22, bodyDuration: .085,
    tailHz: [900, 1450], tailVolume: .055, tailDuration: .105, pitchVariance: .08
  },
  fuzil: {
    minGap: .046,
    transientFilter: 'bandpass', transientHz: [1250, 1850], transientVolume: .31,
    bodyWave: 'sawtooth', bodyHz: [390, 510], bodyEndHz: 48, bodyVolume: .31, bodyDuration: .125,
    tailHz: [620, 1050], tailVolume: .085, tailDuration: .145, pitchVariance: .07
  },
  moto: {
    minGap: .044,
    transientFilter: 'highpass', transientHz: [2450, 3500], transientVolume: .18,
    bodyWave: 'triangle', bodyHz: [430, 560], bodyEndHz: 92, bodyVolume: .17, bodyDuration: .068,
    tailHz: [1200, 1800], tailVolume: .04, tailDuration: .08, pitchVariance: .1
  },
  rival: {
    minGap: .055,
    transientFilter: 'bandpass', transientHz: [1650, 2450], transientVolume: .2,
    bodyWave: 'triangle', bodyHz: [260, 350], bodyEndHz: 66, bodyVolume: .2, bodyDuration: .09,
    tailHz: [760, 1250], tailVolume: .05, tailDuration: .11, pitchVariance: .09
  }
};

export const clampAudioPan = (x?: number, width?: number) => {
  if (!Number.isFinite(x) || !Number.isFinite(width) || !width || width <= 0) return 0;
  return Math.max(-.82, Math.min(.82, ((x! / width!) - .5) * 1.45));
};

export const getGunVoiceGain = (activeVoices: number, maxVoices = 8) => {
  const pressure = Math.max(0, Math.min(1, activeVoices / Math.max(1, maxVoices)));
  return Math.max(.5, 1 - pressure * .42);
};
