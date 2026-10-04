import { clampAudioPan, getGunVoiceGain, GUNFIRE_PROFILES, type GunfireType } from './combatAudioProfiles';

type SpatialSound = { x?: number; width?: number };

class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume = 0.3;
  private muted = false;
  private gunNoiseBuffers: AudioBuffer[] = [];
  private lastGunfireAt: Record<GunfireType, number> = {
    pistol: -Infinity, fuzil: -Infinity, moto: -Infinity, rival: -Infinity
  };
  private lastImpactAt = -Infinity;
  private activeGunVoices = 0;
  private readonly maxGunVoices = 8;
  private combatBus: GainNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    if (this.ctx && !this.combatBus) this.initCombatBus();
  }

  private initCombatBus() {
    if (!this.ctx || this.combatBus) return;
    const bus = this.ctx.createGain();
    const compressor = this.ctx.createDynamicsCompressor();
    bus.gain.value = .9;
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 4.5;
    compressor.attack.value = .003;
    compressor.release.value = .14;
    bus.connect(compressor);
    compressor.connect(this.ctx.destination);
    this.combatBus = bus;
  }

  private getGunNoiseBuffer() {
    if (!this.ctx) return null;
    if (this.gunNoiseBuffers.length === 0 || this.gunNoiseBuffers[0]?.sampleRate !== this.ctx.sampleRate) {
      this.gunNoiseBuffers = Array.from({ length: 4 }, () => {
        const bufferSize = Math.floor(this.ctx!.sampleRate * .18);
        const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
        const output = buffer.getChannelData(0);
        let previous = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          previous = previous * .15 + white * .85;
          output[i] = previous;
        }
        return buffer;
      });
    }
    return this.gunNoiseBuffers[Math.floor(Math.random() * this.gunNoiseBuffers.length)];
  }

  private connectSpatial(node: AudioNode, pan: number, destination?: AudioNode) {
    if (!this.ctx) return;
    const target = destination ?? this.combatBus ?? this.ctx.destination;
    if (typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = pan;
      node.connect(panner);
      panner.connect(target);
    } else {
      node.connect(target);
    }
  }

  public setVolume(v: number) { this.volume = Math.max(0, Math.min(1, v)); }
  public setMuted(muted: boolean) { this.muted = muted; }

  public playRecruitAlly() {
    if (this.muted || this.volume <= 0) return;
    this.initContext(); if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.linearRampToValueAtTime(880, now + .12);
      osc.frequency.exponentialRampToValueAtTime(440, now + .25);
      gain.gain.setValueAtTime(this.volume * .25, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .26);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + .26);
    } catch {}
  }

  public playSniperShot(spatial?: SpatialSound) {
    this.playGunfireShot('fuzil', spatial, 1.18);
  }

  public playGunfireShot(type: GunfireType = 'pistol', spatial?: SpatialSound, emphasis = 1) {
    if (this.muted || this.volume <= 0) return;
    this.initContext(); if (!this.ctx || !this.combatBus) return;
    try {
      const now = this.ctx.currentTime;
      const profile = GUNFIRE_PROFILES[type];
      if (now - this.lastGunfireAt[type] < profile.minGap) return;
      if (this.activeGunVoices >= this.maxGunVoices) return;
      this.lastGunfireAt[type] = now;
      this.activeGunVoices += 1;

      const voiceGain = getGunVoiceGain(this.activeGunVoices, this.maxGunVoices) * Math.max(.72, Math.min(1.25, emphasis));
      const pan = clampAudioPan(spatial?.x, spatial?.width);
      const noiseBuffer = this.getGunNoiseBuffer();
      if (!noiseBuffer) { this.activeGunVoices = Math.max(0, this.activeGunVoices - 1); return; }
      const pick = ([a, b]: [number, number]) => a + Math.random() * (b - a);
      const variance = 1 + (Math.random() * 2 - 1) * profile.pitchVariance;

      const attack = this.ctx.createBufferSource();
      const attackFilter = this.ctx.createBiquadFilter();
      const attackGain = this.ctx.createGain();
      attack.buffer = noiseBuffer;
      attack.playbackRate.value = .92 + Math.random() * .18;
      attackFilter.type = profile.transientFilter;
      attackFilter.frequency.value = pick(profile.transientHz) * variance;
      if (profile.transientFilter === 'bandpass') attackFilter.Q.value = .75 + Math.random() * .45;
      attackGain.gain.setValueAtTime(this.volume * profile.transientVolume * voiceGain, now);
      attackGain.gain.exponentialRampToValueAtTime(.001, now + .055);
      attack.connect(attackFilter); attackFilter.connect(attackGain); this.connectSpatial(attackGain, pan);
      attack.start(now, Math.random() * .03, .065);

      const body = this.ctx.createOscillator();
      const bodyFilter = this.ctx.createBiquadFilter();
      const bodyGain = this.ctx.createGain();
      body.type = profile.bodyWave;
      body.frequency.setValueAtTime(pick(profile.bodyHz) * variance, now);
      body.frequency.exponentialRampToValueAtTime(profile.bodyEndHz, now + profile.bodyDuration);
      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.value = type === 'fuzil' ? 1350 : 1750;
      bodyGain.gain.setValueAtTime(this.volume * profile.bodyVolume * voiceGain, now);
      bodyGain.gain.exponentialRampToValueAtTime(.001, now + profile.bodyDuration);
      body.connect(bodyFilter); bodyFilter.connect(bodyGain); this.connectSpatial(bodyGain, pan * .75);
      body.start(now); body.stop(now + profile.bodyDuration + .015);

      const tail = this.ctx.createBufferSource();
      const tailFilter = this.ctx.createBiquadFilter();
      const tailGain = this.ctx.createGain();
      tail.buffer = noiseBuffer;
      tail.playbackRate.value = .78 + Math.random() * .24;
      tailFilter.type = 'bandpass'; tailFilter.frequency.value = pick(profile.tailHz); tailFilter.Q.value = .65;
      const tailStart = now + .018 + Math.random() * .012;
      tailGain.gain.setValueAtTime(this.volume * profile.tailVolume * voiceGain, tailStart);
      tailGain.gain.exponentialRampToValueAtTime(.001, tailStart + profile.tailDuration);
      tail.connect(tailFilter); tailFilter.connect(tailGain); this.connectSpatial(tailGain, pan * .55);
      tail.start(tailStart, Math.random() * .035, profile.tailDuration + .02);

      setTimeout(() => { this.activeGunVoices = Math.max(0, this.activeGunVoices - 1); }, Math.ceil((profile.tailDuration + .07) * 1000));
    } catch {
      this.activeGunVoices = Math.max(0, this.activeGunVoices - 1);
    }
  }

  public playGunfireHit() { this.playGunfireShot('pistol'); }

  public playBulletImpact(isFlesh = false, spatial?: SpatialSound) {
    if (this.muted || this.volume <= 0) return;
    this.initContext(); if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (now - this.lastImpactAt < .022) return;
      this.lastImpactAt = now;
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); const filter = this.ctx.createBiquadFilter();
      osc.type = isFlesh ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFlesh ? 150 + Math.random() * 35 : 720 + Math.random() * 180, now);
      osc.frequency.exponentialRampToValueAtTime(isFlesh ? 48 : 90, now + .045);
      filter.type = 'lowpass'; filter.frequency.value = isFlesh ? 850 : 2200;
      gain.gain.setValueAtTime(this.volume * (isFlesh ? .08 : .105), now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .05);
      osc.connect(filter); filter.connect(gain); this.connectSpatial(gain, clampAudioPan(spatial?.x, spatial?.width));
      osc.start(now); osc.stop(now + .055);
    } catch {}
  }

  public playAllyDown() { this.playDropTone(320, 110, .18, .18, 'sawtooth'); }
  public playRivalDown(isBoss = false) { this.playDropTone(isBoss ? 180 : 290, isBoss ? 35 : 65, isBoss ? .42 : .18, isBoss ? .42 : .25, isBoss ? 'sawtooth' : 'sine'); }

  private playDropTone(startHz:number, endHz:number, gainLevel:number, duration:number, wave:OscillatorType) {
    if (this.muted || this.volume <= 0) return;
    this.initContext(); if (!this.ctx) return;
    try {
      const now=this.ctx.currentTime; const osc=this.ctx.createOscillator(); const gain=this.ctx.createGain();
      osc.type=wave; osc.frequency.setValueAtTime(startHz,now); osc.frequency.exponentialRampToValueAtTime(endHz,now+duration);
      gain.gain.setValueAtTime(this.volume*gainLevel,now); gain.gain.exponentialRampToValueAtTime(.001,now+duration);
      osc.connect(gain); this.connectSpatial(gain,0); osc.start(now); osc.stop(now+duration+.01);
    } catch {}
  }

  public playCashAmmoCollect() { this.playUiTone(750, 1200, .16, .06, 'square'); }

  public playExplosion() {
    if (this.muted || this.volume <= 0) return;
    this.initContext(); if (!this.ctx) return;
    try {
      const now=this.ctx.currentTime; const osc=this.ctx.createOscillator(); const gain=this.ctx.createGain();
      osc.type='sawtooth'; osc.frequency.setValueAtTime(110,now); osc.frequency.exponentialRampToValueAtTime(25,now+.45);
      gain.gain.setValueAtTime(this.volume*.55,now); gain.gain.exponentialRampToValueAtTime(.001,now+.48);
      osc.connect(gain); this.connectSpatial(gain,0); osc.start(now); osc.stop(now+.48);
    } catch {}
  }

  public playUpgradeBuy() {
    if (this.muted || this.volume <= 0) return;
    this.initContext(); if (!this.ctx) return;
    try {
      const now=this.ctx.currentTime;
      [440,554,659].forEach((freq,idx)=>{const osc=this.ctx!.createOscillator();const gain=this.ctx!.createGain();osc.type='triangle';osc.frequency.setValueAtTime(freq,now+idx*.04);gain.gain.setValueAtTime(this.volume*.2,now+idx*.04);gain.gain.exponentialRampToValueAtTime(.001,now+idx*.04+.1);osc.connect(gain);gain.connect(this.ctx!.destination);osc.start(now+idx*.04);osc.stop(now+idx*.04+.12);});
    } catch {}
  }

  public playPrestige() {
    if (this.muted || this.volume <= 0) return;
    this.initContext(); if (!this.ctx) return;
    try {
      const now=this.ctx.currentTime;
      [330,440,523,659,784].forEach((f,i)=>{const osc=this.ctx!.createOscillator();const gain=this.ctx!.createGain();osc.type='sawtooth';osc.frequency.setValueAtTime(f,now+i*.08);gain.gain.setValueAtTime(this.volume*.28,now+i*.08);gain.gain.exponentialRampToValueAtTime(.001,now+i*.08+.5);osc.connect(gain);gain.connect(this.ctx!.destination);osc.start(now+i*.08);osc.stop(now+i*.08+.55);});
    } catch {}
  }

  private playUiTone(startHz:number, endHz:number, gainLevel:number, duration:number, wave:OscillatorType) {
    if (this.muted || this.volume <= 0) return;
    this.initContext(); if (!this.ctx) return;
    try {
      const now=this.ctx.currentTime; const osc=this.ctx.createOscillator(); const gain=this.ctx.createGain();
      osc.type=wave; osc.frequency.setValueAtTime(startHz,now); osc.frequency.exponentialRampToValueAtTime(endHz,now+duration);
      gain.gain.setValueAtTime(this.volume*gainLevel,now); gain.gain.exponentialRampToValueAtTime(.001,now+duration);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now+duration+.01);
    } catch {}
  }
}

export const soundEngine = new SoundEngine();