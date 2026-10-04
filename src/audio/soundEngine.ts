// Procedural Web Audio API sound synthesizer for Gangs & Factions War PT-BR
class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume: number = 0.3;
  private muted: boolean = false;
  private gunNoiseBuffer: AudioBuffer | null = null;
  private lastGunfireAt: Record<'pistol' | 'fuzil' | 'moto' | 'rival', number> = {
    pistol: -Infinity, fuzil: -Infinity, moto: -Infinity, rival: -Infinity
  };
  private lastImpactAt = -Infinity;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private getGunNoiseBuffer() {
    if (!this.ctx) return null;
    if (this.gunNoiseBuffer && this.gunNoiseBuffer.sampleRate === this.ctx.sampleRate) return this.gunNoiseBuffer;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    this.gunNoiseBuffer = buffer;
    return buffer;
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  // Som de Recrutamento / Contratação (Rádio / Apito de Alerta)
  public playRecruitAlly() {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  // Disparo de Sniper de Elite / Rajada Tática
  public playSniperShot() {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Gunshot blast
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

      gain.gain.setValueAtTime(this.volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Disparo de Arma com Ruído Balístico e Transiente Realista
  public playGunfireShot(type: 'pistol' | 'fuzil' | 'moto' | 'rival' = 'pistol') {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const minGap = type === 'fuzil' ? 0.035 : type === 'moto' ? 0.03 : 0.024;
      if (now - this.lastGunfireAt[type] < minGap) return;
      this.lastGunfireAt[type] = now;

      // Shared transient noise buffer: no per-shot sample generation/allocation.
      const buffer = this.getGunNoiseBuffer();
      if (!buffer) return;
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = type === 'fuzil' ? 'bandpass' : 'highpass';
      noiseFilter.frequency.setValueAtTime(type === 'fuzil' ? 1400 : 2200, now);

      const noiseGain = this.ctx.createGain();
      const nVol = type === 'fuzil' ? 0.35 : 0.22;
      noiseGain.gain.setValueAtTime(this.volume * nVol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // 2. Tonal Body Thump (Oscillator sweep)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      if (type === 'fuzil') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
        oscGain.gain.setValueAtTime(this.volume * 0.38, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      } else if (type === 'moto') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.07);
        oscGain.gain.setValueAtTime(this.volume * 0.22, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      } else {
        osc.type = 'triangle';
        const startPitch = 320 + Math.random() * 80;
        osc.frequency.setValueAtTime(startPitch, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
        oscGain.gain.setValueAtTime(this.volume * 0.24, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      }

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  // Disparo de Pistola / Rajada Rápida (legado mantido)
  public playGunfireHit() {
    this.playGunfireShot('pistol');
  }

  // Impacto de Projétil / Ricochete na parede ou corpo
  public playBulletImpact(isFlesh = false) {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      if (now - this.lastImpactAt < 0.016) return;
      this.lastImpactAt = now;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isFlesh ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFlesh ? 160 : 780, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // Soldado / Aliado Neutralizado (Queda de Soldado com Chiado de Rádio)
  public playAllyDown() {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Static pulse
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

      gain.gain.setValueAtTime(this.volume * 0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Rival Neutralizado / Queda
  public playRivalDown(isBoss = false) {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isBoss ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isBoss ? 180 : 290, now);
      osc.frequency.exponentialRampToValueAtTime(isBoss ? 35 : 65, now + (isBoss ? 0.4 : 0.22));

      gain.gain.setValueAtTime(this.volume * (isBoss ? 0.6 : 0.32), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isBoss ? 0.42 : 0.25));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isBoss ? 0.43 : 0.25));
    } catch {}
  }

  // Coleta de Caixas de Munição / Malote de Grana
  public playCashAmmoCollect() {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // Granada / Detonação de Carro-Bomba
  public playExplosion() {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);

      gain.gain.setValueAtTime(this.volume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.48);
    } catch {}
  }

  // Compra de Armas / Contrato Fechado
  public playUpgradeBuy() {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554, 659];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(this.volume * 0.25, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.12);
      });
    } catch {}
  }

  // Hegemonia / Prestígio (Sirene de Domínio Máximo)
  public playPrestige() {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [330, 440, 523, 659, 784];
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + i * 0.08);

        gain.gain.setValueAtTime(this.volume * 0.35, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.55);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
