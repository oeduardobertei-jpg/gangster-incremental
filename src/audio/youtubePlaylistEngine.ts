export interface YouTubeChapter {
  title: string;
  startSeconds: number;
  endSeconds: number;
}

export interface YouTubePlaylistState {
  ready: boolean;
  playing: boolean;
  chapterIndex: number;
  currentTime: number;
  title: string;
  error?: string;
}

type Listener = (state: YouTubePlaylistState) => void;

export const LOFI_FUNK_VIDEO_ID = '2LfG9LlqyWw';
export const LOFI_FUNK_VIDEO_TITLE = '30 Minutos de LOFI FUNK BRASILEIRO';

const chapter = (title:string, start:number, end:number):YouTubeChapter => ({ title, startSeconds:start, endSeconds:end });

export const LOFI_FUNK_CHAPTERS: readonly YouTubeChapter[] = [
  chapter('Epifania - tudo que existe', 0, 54),
  chapter('Epifania - vai voltar', 54, 98),
  chapter('Epifania - a canção brasileira', 98, 158),
  chapter('Seuab & Fellinha - Naquele Pique', 158, 270),
  chapter('Epifania - onda do mar', 270, 328),
  chapter('Epifania - num momento qualquer...', 328, 366),
  chapter('Epifania - quando a noite vem', 366, 410),
  chapter('Epifania - do brasil', 410, 473),
  chapter('Epifania - hipnótico', 473, 532),
  chapter('Epifania - por você', 532, 585),
  chapter('middt - pega a visão', 585, 698),
  chapter('Epifania - paisagem', 698, 733),
  chapter('Epifania - lua clarear', 733, 772),
  chapter('Epifania - cântico brasileiro', 772, 809),
  chapter('Epifania & Gabriel Cavalcanti - Meu Bem', 809, 960),
  chapter('Epifania - o relógio me desperta', 960, 1024),
  chapter('Epifania - uma saudade meiga', 1024, 1064),
  chapter('Epifania - weireirei', 1064, 1105),
  chapter('Epifania - correr o mundo afora', 1105, 1166),
  chapter('Epifania - em todo lugar', 1166, 1210),
  chapter('Epifania - em meu lugar', 1210, 1253),
  chapter('Gabriel Cavalcanti, Raul Coca, Epifania - só a PUREZA', 1253, 1403),
  chapter('Raul Coca, Gabriel Cavalcanti, Epifania, Pelicano ft. Zazá & Vinicius Turk - LOFI FUNK DA AMIZADE', 1403, 1560),
  chapter('Collateral Lab - Rotina dos Piá', 1560, 1675),
  chapter('Epifania - vamos...', 1675, 1712),
  chapter('DJ Lagoa - lofi funk bb', 1712, 1847),
];

class YouTubePlaylistEngine {
  private player: any = null;
  private loadPromise: Promise<void> | null = null;
  private listeners = new Set<Listener>();
  private pollTimer: number | null = null;
  private ignorePollingUntil = 0;
  private state: YouTubePlaylistState = {
    ready: false,
    playing: false,
    chapterIndex: 0,
    currentTime: 0,
    title: LOFI_FUNK_CHAPTERS[0].title
  };

  public subscribe(listener:Listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => { this.listeners.delete(listener); };
  }

  public getState():YouTubePlaylistState { return { ...this.state }; }

  private emit() {
    const snapshot = this.getState();
    if (typeof window !== 'undefined') (window as any).__GDF_YOUTUBE_RADIO_STATE__ = snapshot;
    this.listeners.forEach(listener => listener(snapshot));
  }

  private loadApi():Promise<void> {
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = new Promise((resolve, reject) => {
      const w = window as any;
      if (w.YT?.Player) { resolve(); return; }
      const previous = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        try { previous?.(); } catch {}
        resolve();
      };
      if (!document.querySelector('script[data-gdf-youtube-api]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.dataset.gdfYoutubeApi = '1';
        script.onerror = () => reject(new Error('YouTube API indisponível'));
        document.head.appendChild(script);
      }
      window.setTimeout(() => {
        if (!(window as any).YT?.Player) reject(new Error('Timeout da API do YouTube'));
      }, 12000);
    });
    return this.loadPromise;
  }
  private ensureHost() {
    let host = document.getElementById('gdf-youtube-radio-host');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'gdf-youtube-radio-host';
    host.style.position = 'fixed';
    host.style.left = '-9999px';
    host.style.top = '-9999px';
    host.style.width = '320px';
    host.style.height = '180px';
    host.style.opacity = '0';
    host.style.pointerEvents = 'none';
    document.body.appendChild(host);
    return host;
  }

  public async ensureReady(initialChapter = 0) {
    if (this.player && this.state.ready) return;
    try {
      await this.loadApi();
      if (this.player && this.state.ready) return;
      const w = window as any;
      const host = this.ensureHost();
      await new Promise<void>((resolve, reject) => {
        this.player = new w.YT.Player(host, {
          width: '320', height: '180', videoId: LOFI_FUNK_VIDEO_ID,
          playerVars: {
            controls: 0, disablekb: 1, playsinline: 1,
            modestbranding: 1, rel: 0, loop: 1,
            playlist: LOFI_FUNK_VIDEO_ID,
            origin: window.location.origin
          },
          events: {
            onReady: (event:any) => {
              this.player = event.target;
              this.state.ready = true;
              this.state.error = undefined;
              this.seekToChapter(initialChapter, false);
              this.startPolling();
              this.emit();
              resolve();
            },
            onStateChange: (event:any) => {
              this.state.playing = event.data === w.YT.PlayerState.PLAYING;
              this.emit();
            },
            onError: () => {
              this.state.error = 'Não foi possível reproduzir o vídeo do YouTube.';
              this.state.playing = false;
              this.emit();
              reject(new Error(this.state.error));
            }
          }
        });
      });
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Falha ao carregar YouTube';
      this.emit();
      throw error;
    }
  }
  private startPolling() {
    if (this.pollTimer !== null) return;
    this.pollTimer = window.setInterval(() => {
      if (!this.player || !this.state.ready) return;
      if (performance.now() < this.ignorePollingUntil) return;
      try {
        const currentTime = Number(this.player.getCurrentTime?.() ?? 0);
        this.state.currentTime = currentTime;
        const index = LOFI_FUNK_CHAPTERS.findIndex((item, i) => {
          const end = item.endSeconds ?? LOFI_FUNK_CHAPTERS[i + 1]?.startSeconds ?? Infinity;
          return currentTime >= item.startSeconds && currentTime < end;
        });
        if (index >= 0 && index !== this.state.chapterIndex) {
          this.state.chapterIndex = index;
          this.state.title = LOFI_FUNK_CHAPTERS[index].title;
          this.emit();
        }
      } catch {}
    }, 300);
  }

  public setVolume(volume01:number) {
    if (!this.player || !this.state.ready) return;
    try { this.player.setVolume(Math.round(Math.max(0, Math.min(1, volume01)) * 100)); } catch {}
  }

  public play(initialChapter = this.state.chapterIndex): Promise<void> {
    if (this.player && this.state.ready) {
      if (initialChapter !== this.state.chapterIndex) this.seekToChapter(initialChapter, false);
      try { this.player.playVideo(); } catch {}
      return Promise.resolve();
    }
    return this.ensureReady(initialChapter).then(() => {
      try { this.player.playVideo(); } catch {}
    });
  }

  public pause() {
    if (!this.player || !this.state.ready) return;
    try { this.player.pauseVideo(); } catch {}
  }
  public seekToChapter(index:number, autoplay = this.state.playing) {
    const safeIndex = Math.max(0, Math.min(LOFI_FUNK_CHAPTERS.length - 1, index));
    this.state.chapterIndex = safeIndex;
    this.state.title = LOFI_FUNK_CHAPTERS[safeIndex].title;
    this.state.currentTime = LOFI_FUNK_CHAPTERS[safeIndex].startSeconds;
    this.state.error = undefined;
    this.ignorePollingUntil = performance.now() + 900;
    if (this.player && this.state.ready) {
      try {
        this.player.seekTo(LOFI_FUNK_CHAPTERS[safeIndex].startSeconds, true);
        if (autoplay) this.player.playVideo();
      } catch {}
    }
    this.emit();
  }

  public nextChapter() {
    const next = (this.state.chapterIndex + 1) % LOFI_FUNK_CHAPTERS.length;
    this.seekToChapter(next, this.state.playing);
  }

  public previousChapter() {
    const prev = (this.state.chapterIndex - 1 + LOFI_FUNK_CHAPTERS.length) % LOFI_FUNK_CHAPTERS.length;
    this.seekToChapter(prev, this.state.playing);
  }
}

export const youtubePlaylistEngine = new YouTubePlaylistEngine();
