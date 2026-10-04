export interface YouTubeTrack {
  videoId: string;
  fallbackVideoIds?: readonly string[];
  title: string;
  startSeconds: number;
  endLeadSeconds: number;
}

export interface YouTubeTrackState {
  ready: boolean;
  playing: boolean;
  trackIndex: number;
  title: string;
  error?: string;
  errorCode?: number;
}

type Listener = (state:YouTubeTrackState) => void;

export const BRAZILIAN_GANGSTA_TRACKS: readonly YouTubeTrack[] = [
  { videoId:'hHc2BGwayQs', fallbackVideoIds:['L0t8CO88IDU'], title:'Vida Loka Parte 1 — Instrumental', startSeconds:.9, endLeadSeconds:1.8 },
  { videoId:'qv7FOKsQ6EE', fallbackVideoIds:['HvRhaejqlPs'], title:'Vida Loka Parte 2 — Instrumental', startSeconds:1.0, endLeadSeconds:1.7 },
  { videoId:'w-hNt5rgZ4k', title:'Diário de um Detento — Instrumental em Vinil', startSeconds:1.1, endLeadSeconds:1.9 },
  { videoId:'7v9HuNKBSaY', title:'Capítulo 4, Versículo 3 — Instrumental em Vinil', startSeconds:.8, endLeadSeconds:1.6 },
  { videoId:'1jG6KUEhstE', title:'Crime Vai e Vem — Instrumental em Vinil', startSeconds:1.0, endLeadSeconds:1.8 },
];

class YouTubeTrackEngine {
  private player:any = null;
  private loadPromise:Promise<void> | null = null;
  private listeners = new Set<Listener>();
  private desiredVolume01 = .28;
  private fadeTimer:number | null = null;
  private monitorTimer:number | null = null;
  private transitioning = false;
  private fadeInOnPlay = false;
  private failedTracks = new Set<number>();
  private sourceIndexByTrack = new Map<number, number>();
  private transientRetries = new Map<number, number>();
  private state:YouTubeTrackState = {
    ready:false, playing:false, trackIndex:0,
    title:BRAZILIAN_GANGSTA_TRACKS[0].title
  };
  public subscribe(listener:Listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => { this.listeners.delete(listener); };
  }

  public getState():YouTubeTrackState { return { ...this.state }; }

  private emit() {
    const snapshot=this.getState();
    if (typeof window !== 'undefined') (window as any).__GDF_GANGSTA_RADIO_STATE__ = snapshot;
    this.listeners.forEach(listener=>listener(snapshot));
  }

  private loadApi():Promise<void> {
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise=new Promise((resolve,reject)=>{
      const w=window as any;
      if (w.YT?.Player) { resolve(); return; }
      const previous=w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady=()=>{ try{previous?.();}catch{} resolve(); };
      if (!document.querySelector('script[data-gdf-youtube-api]')) {
        const script=document.createElement('script');
        script.src='https://www.youtube.com/iframe_api';
        script.async=true; script.dataset.gdfYoutubeApi='1';
        script.onerror=()=>reject(new Error('YouTube API indisponível'));
        document.head.appendChild(script);
      }
      window.setTimeout(()=>{ if(!w.YT?.Player) reject(new Error('Timeout da API do YouTube')); },12000);
    });
    return this.loadPromise;
  }
  private ensureHost() {
    let host=document.getElementById('gdf-youtube-gangsta-host');
    if (host) return host;
    host=document.createElement('div');
    host.id='gdf-youtube-gangsta-host';
    host.style.position='fixed'; host.style.left='-9999px'; host.style.top='-9999px';
    host.style.width='320px'; host.style.height='180px';
    host.style.opacity='0'; host.style.pointerEvents='none';
    document.body.appendChild(host);
    return host;
  }

  public async ensureReady(initialTrack=0) {
    if (this.player && this.state.ready) return;
    await this.loadApi();
    if (this.player && this.state.ready) return;
    const w=window as any;
    const host=this.ensureHost();
    await new Promise<void>((resolve,reject)=>{
      this.player=new w.YT.Player(host,{
        width:'320', height:'180',
        videoId:BRAZILIAN_GANGSTA_TRACKS[initialTrack]?.videoId ?? BRAZILIAN_GANGSTA_TRACKS[0].videoId,
        playerVars:{controls:0,disablekb:1,playsinline:1,modestbranding:1,rel:0,origin:window.location.origin},
        events:{
          onReady:(event:any)=>{
            this.player=event.target; this.state.ready=true; this.state.error=undefined;
            this.setTrack(initialTrack,false); this.startEndMonitor(); this.emit(); resolve();
          },
          onStateChange:(event:any)=>{
            this.state.playing=event.data===w.YT.PlayerState.PLAYING;
            if (event.data===w.YT.PlayerState.PLAYING && this.fadeInOnPlay) {
              this.fadeInOnPlay=false;
              this.rampVolume(0,this.desiredVolume01,800,()=>{ this.transitioning=false; });
            }
            if (event.data===w.YT.PlayerState.ENDED && !this.transitioning) this.transitionToTrack(this.state.trackIndex+1,true);
            this.emit();
          },
          onError:(event:any)=>{
            const failedIndex=this.state.trackIndex;
            const code=Number(event?.data ?? 0);
            const track=BRAZILIAN_GANGSTA_TRACKS[failedIndex];
            const sources=[track.videoId,...(track.fallbackVideoIds ?? [])];
            const sourceIndex=this.sourceIndexByTrack.get(failedIndex) ?? 0;
            this.state.playing=false; this.state.errorCode=code;
            if (typeof window!=='undefined') (window as any).__GDF_YOUTUBE_LAST_ERROR__={code,trackIndex:failedIndex,title:track.title,videoId:sources[sourceIndex],at:Date.now()};
            const retries=this.transientRetries.get(failedIndex) ?? 0;
            if ((code===5 || code===0) && retries<2) {
              this.transientRetries.set(failedIndex,retries+1);
              window.setTimeout(()=>this.loadCurrentSource(true),500*(retries+1));
              return;
            }
            if (sourceIndex+1<sources.length) {
              this.sourceIndexByTrack.set(failedIndex,sourceIndex+1);
              this.transientRetries.set(failedIndex,0);
              this.state.error=undefined; this.state.errorCode=undefined;
              window.setTimeout(()=>this.loadCurrentSource(true),250);
              return;
            }
            this.failedTracks.add(failedIndex);
            if (this.failedTracks.size < BRAZILIAN_GANGSTA_TRACKS.length) {
              let next=(failedIndex+1)%BRAZILIAN_GANGSTA_TRACKS.length;
              while (this.failedTracks.has(next)) next=(next+1)%BRAZILIAN_GANGSTA_TRACKS.length;
              this.state.error=undefined; this.state.errorCode=undefined; this.setTrack(next,true); return;
            }
            this.state.error='Fonte externa indisponível'; this.emit(); reject(new Error(this.state.error));
          }
        }
      });
    });
  }

  public setVolume(volume01:number) {
    this.desiredVolume01=Math.max(0,Math.min(1,volume01));
    if (!this.player || !this.state.ready || this.transitioning) return;
    try { this.player.setVolume(Math.round(this.desiredVolume01*100)); } catch {}
  }

  public play(trackIndex=this.state.trackIndex):Promise<void> {
    if (this.player && this.state.ready) {
      if (trackIndex!==this.state.trackIndex) this.setTrack(trackIndex,false);
      try { this.player.playVideo(); } catch {}
      return Promise.resolve();
    }
    return this.ensureReady(trackIndex).then(()=>{ try{this.player.playVideo();}catch{} });
  }

  public pause() {
    if (!this.player || !this.state.ready) return;
    try { this.player.pauseVideo(); } catch {}
  }
  private loadCurrentSource(autoplay:boolean) {
    const index=this.state.trackIndex;
    const track=BRAZILIAN_GANGSTA_TRACKS[index];
    const sources=[track.videoId,...(track.fallbackVideoIds ?? [])];
    const sourceIndex=Math.min(this.sourceIndexByTrack.get(index) ?? 0,sources.length-1);
    const request={videoId:sources[sourceIndex],startSeconds:track.startSeconds};
    if (!this.player || !this.state.ready) return;
    try { if (autoplay) this.player.loadVideoById(request); else this.player.cueVideoById(request); } catch {}
  }
  public setTrack(index:number, autoplay=this.state.playing) {
    const safe=(index+BRAZILIAN_GANGSTA_TRACKS.length)%BRAZILIAN_GANGSTA_TRACKS.length;
    const track=BRAZILIAN_GANGSTA_TRACKS[safe];
    this.state.trackIndex=safe; this.state.title=track.title; this.state.error=undefined; this.state.errorCode=undefined;
    this.sourceIndexByTrack.set(safe,0); this.transientRetries.set(safe,0); this.failedTracks.delete(safe);
    this.loadCurrentSource(autoplay);
    this.emit();
  }

  public nextTrack(autoplay=this.state.playing) { this.transitionToTrack(this.state.trackIndex+1,autoplay); }

  public previousTrack(autoplay=this.state.playing) { this.transitionToTrack(this.state.trackIndex-1,autoplay); }
  private rampVolume(from:number,to:number,durationMs:number,onDone?:()=>void) {
    if (!this.player || !this.state.ready) { onDone?.(); return; }
    if (this.fadeTimer!==null) window.clearInterval(this.fadeTimer);
    const started=performance.now();
    this.fadeTimer=window.setInterval(()=>{
      const t=Math.min(1,(performance.now()-started)/durationMs);
      const eased=t*t*(3-2*t);
      const value=from+(to-from)*eased;
      try { this.player.setVolume(Math.round(value*100)); } catch {}
      if (t>=1) { if(this.fadeTimer!==null) window.clearInterval(this.fadeTimer); this.fadeTimer=null; onDone?.(); }
    },40);
  }

  private transitionToTrack(index:number,autoplay:boolean) {
    if (!autoplay || !this.player || !this.state.ready) { this.setTrack(index,autoplay); return; }
    if (this.transitioning) return;
    this.transitioning=true;
    this.rampVolume(this.desiredVolume01,0,600,()=>{
      this.fadeInOnPlay=true;
      this.setTrack(index,true);
    });
  }

  private startEndMonitor() {
    if (this.monitorTimer!==null) return;
    this.monitorTimer=window.setInterval(()=>{
      if (!this.player || !this.state.ready || !this.state.playing || this.transitioning) return;
      try {
        const duration=Number(this.player.getDuration?.()||0);
        const current=Number(this.player.getCurrentTime?.()||0);
        const remaining=duration-current;
        const track=BRAZILIAN_GANGSTA_TRACKS[this.state.trackIndex];
        const threshold=Math.max(.8,track?.endLeadSeconds ?? 1.6);
        if (duration>0 && remaining>0 && remaining<=threshold) this.transitionToTrack(this.state.trackIndex+1,true);
      } catch {}
    },200);
  }

}

export const youtubeTrackEngine=new YouTubeTrackEngine();
