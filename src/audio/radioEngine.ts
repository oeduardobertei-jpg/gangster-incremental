export type RadioStationId = 'concreto' | 'baile' | 'central';

export interface RadioTrack {
  id: string;
  title: string;
  bpm: number;
  root: number;
  mood: 'dusty' | 'funk' | 'dark';
  progression: readonly number[];
  bass: readonly number[];
}

export interface RadioStation {
  id: RadioStationId;
  frequency: string;
  name: string;
  tagline: string;
  tracks: readonly RadioTrack[];
  source?: 'procedural' | 'youtube-chapters' | 'youtube-tracks';
  videoId?: string;
}

export interface RadioState {
  stationId: RadioStationId;
  trackIndex: number;
  playing: boolean;
  volume: number;
  systemMuted: boolean;
}
const T = (
  id:string, title:string, bpm:number, root:number, mood:RadioTrack['mood'],
  progression:readonly number[], bass:readonly number[]
): RadioTrack => ({ id, title, bpm, root, mood, progression, bass });

export const RADIO_STATIONS: readonly RadioStation[] = [
  {
    id:'central', frequency:'89.5', name:'Brazilian Gangsta',
    tagline:'RAP BRASILEIRO DE RUA',
    source:'youtube-tracks',
    tracks:[T('brazilian-gangsta','Brazilian Gangsta',0,0,'dark',[0],[0])]
  },
  {
    id:'concreto', frequency:'94.7', name:'Rádio Concreto',
    tagline:'Boom bap de rua · bateria seca · soul/jazz picotado',
    tracks:[
      T('asfalto','Asfalto Molhado',90,45,'dusty',[0,3,-2,5],[0,0,3,-2,0,5,3,-2]),
      T('laje94','Laje 94',86,43,'dusty',[0,5,3,-2],[0,-2,0,3,5,3,0,-2]),
      T('caixa','Caixa de Fósforo',93,41,'dusty',[0,-2,3,0],[0,0,-2,3,0,5,3,-2]),
      T('concreto','Concreto Cru',88,44,'dusty',[0,3,5,-2],[0,0,-2,0,3,5,0,-2]),
      T('beco','Beco 12',92,42,'dusty',[0,5,-2,3],[0,3,0,-2,5,3,0,-2]),
      T('fita94','Fita 94',84,46,'dusty',[0,-2,5,3],[0,0,5,3,-2,0,3,-2])
    ]
  },
  {
    id:'baile', frequency:'103.3', name:'Lofi Funk Brazil',
    tagline:'LOFI FUNK BRASILEIRO',
    source:'youtube-chapters', videoId:'2LfG9LlqyWw',
    tracks:[T('lofi-funk-br','LOFI FUNK BRASIL',0,0,'funk',[0],[0])]
  }
];

const STORAGE_KEY = 'gdf_radio_v1';
const midiToHz = (note:number) => 440 * Math.pow(2, (note - 69) / 12);
const clamp01 = (value:number) => Math.max(0, Math.min(1, value));

class RadioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private nextStepAt = 0;
  private step = 0;
  private bars = 0;
  private listeners = new Set<(state:RadioState)=>void>();
  private noiseBuffer: AudioBuffer | null = null;
  private state: RadioState = this.loadState();

  private loadState(): RadioState {
    const fallback: RadioState = {
      stationId:'central', trackIndex:0, playing:false, volume:.28, systemMuted:false
    };
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const saved = JSON.parse(raw) as Partial<RadioState>;
      const savedStationId = saved.stationId as string | undefined;
      const migratedStationId = savedStationId === 'madrugada' ? 'baile' : savedStationId;
      const validStation = RADIO_STATIONS.some(station => station.id === migratedStationId);
      return {
        ...fallback,
        stationId: validStation ? migratedStationId as RadioStationId : fallback.stationId,
        trackIndex: Math.max(0, Number(saved.trackIndex) || 0),
        volume: clamp01(Number(saved.volume ?? fallback.volume)),
        playing: false
      };
    } catch { return fallback; }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.state, playing:false })); } catch {}
  }
  private ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
      }
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {});
    this.applyVolume();
  }

  private applyVolume() {
    if (!this.ctx || !this.master) return;
    const value = this.state.systemMuted || !this.state.playing ? 0 : this.state.volume;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(value, this.ctx.currentTime, .035);
  }

  private emit() {
    const snapshot = this.getState();
    this.listeners.forEach(listener => listener(snapshot));
  }

  public subscribe(listener:(state:RadioState)=>void) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => { this.listeners.delete(listener); };
  }
  public getState(): RadioState { return { ...this.state }; }
  public getStation(): RadioStation {
    return RADIO_STATIONS.find(station => station.id === this.state.stationId) ?? RADIO_STATIONS[0];
  }
  public getTrack(): RadioTrack {
    const station = this.getStation();
    return station.tracks[this.state.trackIndex % station.tracks.length] ?? station.tracks[0];
  }

  public setSystemMuted(muted:boolean) {
    this.state.systemMuted = muted;
    this.applyVolume();
    this.emit();
  }

  public setVolume(volume:number) {
    this.state.volume = clamp01(volume);
    this.applyVolume();
    this.persist();
    this.emit();
  }

  public adjustVolume(delta:number) { this.setVolume(this.state.volume + delta); }
  public setStation(stationId:RadioStationId) {
    if (this.state.stationId === stationId) return;
    this.state.stationId = stationId;
    this.state.trackIndex = 0;
    this.restartSequence();
    this.persist();
    this.emit();
  }

  public nextTrack() {
    const station = this.getStation();
    this.state.trackIndex = (this.state.trackIndex + 1) % station.tracks.length;
    this.restartSequence();
    this.persist();
    this.emit();
  }

  public previousTrack() {
    const station = this.getStation();
    this.state.trackIndex = (this.state.trackIndex - 1 + station.tracks.length) % station.tracks.length;
    this.restartSequence();
    this.persist();
    this.emit();
  }

  private restartSequence() {
    this.step = 0; this.bars = 0;
    if (this.ctx) this.nextStepAt = this.ctx.currentTime + .05;
  }
  public play() {
    if (this.state.playing) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.state.playing = true;
    this.nextStepAt = this.ctx.currentTime + .06;
    this.applyVolume();
    this.timer = window.setInterval(() => this.scheduler(), 45);
    this.emit();
  }

  public pause() {
    if (!this.state.playing) return;
    this.state.playing = false;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.applyVolume();
    this.emit();
  }

  public toggle() { this.state.playing ? this.pause() : this.play(); }

  private scheduler() {
    if (!this.ctx || !this.state.playing) return;
    if (this.getStation().source && this.getStation().source !== 'procedural') return;
    const track = this.getTrack();
    const secondsPerStep = (60 / track.bpm) / 4;
    while (this.nextStepAt < this.ctx.currentTime + .16) {
      this.scheduleStep(this.step, this.nextStepAt, track);
      this.nextStepAt += secondsPerStep * (this.step % 2 === 1 ? 1.08 : .92);
      this.step = (this.step + 1) % 16;
      if (this.step === 0) this.advanceBar();
    }
  }
  private advanceBar() {
    this.bars += 1;
    if (this.bars < 16) return;
    const station = this.getStation();
    this.state.trackIndex = (this.state.trackIndex + 1) % station.tracks.length;
    this.bars = 0;
    this.persist();
    this.emit();
  }

  private getNoiseBuffer() {
    if (!this.ctx) return null;
    if (this.noiseBuffer?.sampleRate === this.ctx.sampleRate) return this.noiseBuffer;
    const length = Math.floor(this.ctx.sampleRate * .12);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buffer;
    return buffer;
  }

  private scheduleStep(step:number, at:number, track:RadioTrack) {
    if (!this.ctx || !this.master) return;
    if (track.mood === 'dusty') return this.scheduleDusty(step, at, track);
    if (track.mood === 'funk') return this.scheduleBaile(step, at, track);
    return this.scheduleCentral(step, at, track);
  }

  private scheduleDusty(step:number, at:number, track:RadioTrack) {
    if ([0,6,9,12].includes(step)) this.kick(at,'dusty');
    if (step === 4 || step === 12) this.snare(at,'dusty');
    if (step % 2 === 0) this.hat(at,'dusty',step % 4 === 2);
    if (step % 2 === 0) this.bass(at,track,Math.floor(step/2));
    if ([0,3,8,11].includes(step)) this.sampleChop(at,track,step);
  }
  private scheduleBaile(step:number, at:number, track:RadioTrack) {
    const kicks = track.bpm >= 145 ? [0,3,6,8,11,14] : [0,3,7,10,12,15];
    if (kicks.includes(step)) this.kick(at,'funk');
    if ([4,9,12].includes(step)) this.snare(at,'funk');
    if ([2,5,8,13,15].includes(step)) this.funkPerc(at,step);
    if ([1,3,6,9,11,14].includes(step)) this.hat(at,'funk',step===14);
    if ([0,4,7,10,12,15].includes(step)) this.bass(at,track,Math.floor(step/2));
    if (step===0 || step===8) this.funkStab(at,track,step);
  }

  private scheduleCentral(step:number, at:number, track:RadioTrack) {
    if ([0,3,7,10,14].includes(step)) this.kick(at,'dark');
    if (step === 4 || step === 12) this.snare(at,'dark');
    if ([1,5,9,13,15].includes(step)) this.metalTick(at, step === 15);
    if ([0,5,8,11,14].includes(step)) this.bass(at,track,step);
    if (step === 0 || step === 8) this.darkDrone(at,track,Math.floor(step/8));
    if (step === 7 || step === 15) this.centralStab(at,track,step);
  }

  private kick(at:number, mood:RadioTrack['mood']) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(mood === 'dark' ? 92 : mood === 'funk' ? 118 : 105, at);
    osc.frequency.exponentialRampToValueAtTime(42, at + .12);
    gain.gain.setValueAtTime(mood === 'funk' ? .31 : .27, at);
    gain.gain.exponentialRampToValueAtTime(.001, at + .16);
    osc.connect(gain); gain.connect(this.master);
    osc.start(at); osc.stop(at + .17);
  }

  private snare(at:number, mood:RadioTrack['mood']) {
    if (!this.ctx || !this.master) return;
    const buffer = this.getNoiseBuffer(); if (!buffer) return;
    const source = this.ctx.createBufferSource(); source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass';
    filter.frequency.value = mood === 'funk' ? 1850 : 2050; filter.Q.value = .7;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(mood === 'funk' ? .12 : .14, at);
    gain.gain.exponentialRampToValueAtTime(.001, at + .09);
    source.connect(filter); filter.connect(gain); gain.connect(this.master);
    source.start(at); source.stop(at + .1);
  }
  private hat(at:number, mood:RadioTrack['mood'], accent:boolean) {
    if (!this.ctx || !this.master) return;
    const buffer = this.getNoiseBuffer(); if (!buffer) return;
    const source = this.ctx.createBufferSource(); source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 5200;
    const gain = this.ctx.createGain();
    const level = mood === 'funk' ? .024 : .032;
    gain.gain.setValueAtTime(level * (accent ? 1.35 : 1), at);
    gain.gain.exponentialRampToValueAtTime(.001, at + (accent ? .06 : .035));
    source.connect(filter); filter.connect(gain); gain.connect(this.master);
    source.start(at); source.stop(at + .07);
  }

  private sampleChop(at:number, track:RadioTrack, step:number) {
    if (!this.ctx || !this.master) return;
    const root=track.root+12+track.progression[Math.floor(step/4)%track.progression.length];
    const bus=this.ctx.createGain(), filter=this.ctx.createBiquadFilter();
    filter.type='bandpass'; filter.frequency.value=1150; filter.Q.value=.55;
    bus.gain.setValueAtTime(.035,at); bus.gain.exponentialRampToValueAtTime(.001,at+.22);
    filter.connect(bus); bus.connect(this.master);
    [0,3,7].forEach((n,i)=>{const o=this.ctx!.createOscillator();o.type=i===0?'triangle':'sine';o.detune.value=i%2?7:-5;o.frequency.value=midiToHz(root+n);o.connect(filter);o.start(at);o.stop(at+.23);});
  }

  private rim(at:number) {
    if (!this.ctx || !this.master) return; const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(980,at); o.frequency.exponentialRampToValueAtTime(540,at+.035);
    g.gain.setValueAtTime(.045,at); g.gain.exponentialRampToValueAtTime(.001,at+.04); o.connect(g); g.connect(this.master); o.start(at); o.stop(at+.05);
  }

  private softHat(at:number, accent:boolean) {
    if (!this.ctx || !this.master) return; const b=this.getNoiseBuffer(); if(!b)return; const s=this.ctx.createBufferSource();s.buffer=b;
    const f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();f.type='highpass';f.frequency.value=6500;g.gain.setValueAtTime(accent?.018:.011,at);g.gain.exponentialRampToValueAtTime(.001,at+.05);s.connect(f);f.connect(g);g.connect(this.master);s.start(at);s.stop(at+.055);
  }

  private funkPerc(at:number, step:number) {
    if (!this.ctx || !this.master) return;
    const o=this.ctx.createOscillator(), f=this.ctx.createBiquadFilter(), g=this.ctx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(step%2?190:135,at); o.frequency.exponentialRampToValueAtTime(step%2?115:78,at+.075);
    f.type='lowpass'; f.frequency.value=720; g.gain.setValueAtTime(step===15?.09:.065,at); g.gain.exponentialRampToValueAtTime(.001,at+.085);
    o.connect(f); f.connect(g); g.connect(this.master); o.start(at); o.stop(at+.09);
  }
  private funkStab(at:number, track:RadioTrack, step:number) {
    if (!this.ctx || !this.master) return;
    const o=this.ctx.createOscillator(), f=this.ctx.createBiquadFilter(), g=this.ctx.createGain();
    o.type='square'; o.frequency.value=midiToHz(track.root+12+(step===8?3:0)); f.type='bandpass'; f.frequency.value=980; f.Q.value=1.8;
    g.gain.setValueAtTime(.022,at); g.gain.exponentialRampToValueAtTime(.001,at+.10); o.connect(f); f.connect(g); g.connect(this.master); o.start(at); o.stop(at+.11);
  }

  private metalTick(at:number, accent:boolean) {
    if (!this.ctx || !this.master) return; const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='square';o.frequency.value=accent?1320:980;g.gain.setValueAtTime(accent?.018:.010,at);g.gain.exponentialRampToValueAtTime(.001,at+.045);o.connect(g);g.connect(this.master);o.start(at);o.stop(at+.05);
  }

  private bass(at:number, track:RadioTrack, index:number) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = track.mood === 'dark' || track.mood === 'funk' ? 'sine' : 'triangle';
    osc.frequency.value = midiToHz(track.root + track.bass[index % track.bass.length]);
    filter.type = 'lowpass'; filter.frequency.value = track.mood === 'funk' ? 250 : 310;
    gain.gain.setValueAtTime(track.mood === 'dark' ? .13 : track.mood === 'funk' ? .15 : .10, at);
    gain.gain.exponentialRampToValueAtTime(.001, at + .24);
    osc.connect(filter); filter.connect(gain); gain.connect(this.master);
    osc.start(at); osc.stop(at + .25);
  }
  private rhodesPad(at:number, track:RadioTrack, chordIndex:number) {
    if (!this.ctx || !this.master) return;
    const root=track.root+12+track.progression[chordIndex%track.progression.length];
    const f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();f.type='lowpass';f.frequency.value=1700;g.gain.setValueAtTime(.022,at);g.gain.exponentialRampToValueAtTime(.001,at+1.35);f.connect(g);g.connect(this.master);
    [0,3,7,10].forEach((n,i)=>{const o=this.ctx!.createOscillator();o.type='sine';o.detune.value=i%2?-6:4;o.frequency.value=midiToHz(root+n);o.connect(f);o.start(at);o.stop(at+1.4);});
  }

  private darkDrone(at:number, track:RadioTrack, chordIndex:number) {
    if (!this.ctx || !this.master) return; const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    o.type='sawtooth';o.frequency.value=midiToHz(track.root-12+track.progression[chordIndex%track.progression.length]);f.type='lowpass';f.frequency.value=180;g.gain.setValueAtTime(.032,at);g.gain.exponentialRampToValueAtTime(.001,at+.85);o.connect(f);f.connect(g);g.connect(this.master);o.start(at);o.stop(at+.9);
  }

  private centralStab(at:number, track:RadioTrack, step:number) {
    if (!this.ctx || !this.master) return; const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();
    o.type='square';o.frequency.value=midiToHz(track.root+12+(step===15?1:6));f.type='bandpass';f.frequency.value=780;f.Q.value=2.4;g.gain.setValueAtTime(.025,at);g.gain.exponentialRampToValueAtTime(.001,at+.12);o.connect(f);f.connect(g);g.connect(this.master);o.start(at);o.stop(at+.13);
  }

  private keys(at:number, track:RadioTrack, chordIndex:number) {
    if (!this.ctx || !this.master) return;
    const root = track.root + 12 + track.progression[chordIndex % track.progression.length];
    const intervals = track.mood === 'dark' ? [0,3,7] : [0,5,7];
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 1050;
    const bus = this.ctx.createGain();
    bus.gain.setValueAtTime(track.mood === 'dark' ? .022 : .03, at);
    bus.gain.exponentialRampToValueAtTime(.001, at + .58);
    filter.connect(bus); bus.connect(this.master);
    intervals.forEach((interval, index) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.detune.value = index % 2 ? -4 : 3;
      osc.frequency.value = midiToHz(root + interval);
      osc.connect(filter); osc.start(at); osc.stop(at + .6);
    });
  }
}

export const radioEngine = new RadioEngine();
