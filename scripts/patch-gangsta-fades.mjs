import fs from 'node:fs';
const p='src/audio/youtubeTrackEngine.ts';
let s=fs.readFileSync(p,'utf8');
s=s.replace("  private listeners = new Set<Listener>();\n", "  private listeners = new Set<Listener>();\n  private desiredVolume01 = .28;\n  private fadeTimer:number | null = null;\n  private monitorTimer:number | null = null;\n  private transitioning = false;\n  private fadeInOnPlay = false;\n");
s=s.replace("            if (event.data===w.YT.PlayerState.ENDED) this.nextTrack(true);\n            this.emit();", "            if (event.data===w.YT.PlayerState.PLAYING && this.fadeInOnPlay) {\n              this.fadeInOnPlay=false;\n              this.rampVolume(0,this.desiredVolume01,800,()=>{ this.transitioning=false; });\n            }\n            if (event.data===w.YT.PlayerState.ENDED && !this.transitioning) this.transitionToTrack(this.state.trackIndex+1,true);\n            this.emit();");
fs.writeFileSync(p,s,'utf8');
s=s.replace("            this.setTrack(initialTrack,false); this.emit(); resolve();", "            this.setTrack(initialTrack,false); this.startEndMonitor(); this.emit(); resolve();");
s=s.replace("  public setVolume(volume01:number) {\n    if (!this.player || !this.state.ready) return;\n    try { this.player.setVolume(Math.round(Math.max(0,Math.min(1,volume01))*100)); } catch {}\n  }", "  public setVolume(volume01:number) {\n    this.desiredVolume01=Math.max(0,Math.min(1,volume01));\n    if (!this.player || !this.state.ready || this.transitioning) return;\n    try { this.player.setVolume(Math.round(this.desiredVolume01*100)); } catch {}\n  }");
s=s.replace("  public nextTrack(autoplay=this.state.playing) {\n    this.setTrack(this.state.trackIndex+1,autoplay);\n  }\n\n  public previousTrack(autoplay=this.state.playing) {\n    this.setTrack(this.state.trackIndex-1,autoplay);\n  }", "  public nextTrack(autoplay=this.state.playing) { this.transitionToTrack(this.state.trackIndex+1,autoplay); }\n\n  public previousTrack(autoplay=this.state.playing) { this.transitionToTrack(this.state.trackIndex-1,autoplay); }");
fs.writeFileSync(p,s,'utf8');
const methods=`
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
    if (!autoplay || !this.state.playing || !this.player || !this.state.ready) { this.setTrack(index,autoplay); return; }
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
        if (duration>0 && remaining>0 && remaining<=.75) this.transitionToTrack(this.state.trackIndex+1,true);
      } catch {}
    },200);
  }
`;
s=s.replace("\n}\n\nexport const youtubeTrackEngine=new YouTubeTrackEngine();",methods+"\n}\n\nexport const youtubeTrackEngine=new YouTubeTrackEngine();");
fs.writeFileSync(p,s,'utf8');
