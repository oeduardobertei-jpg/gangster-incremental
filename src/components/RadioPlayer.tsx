import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, Radio, SkipBack, SkipForward, Volume1, Volume2 } from 'lucide-react';
import { RADIO_STATIONS, radioEngine, type RadioState, type RadioStationId } from '../audio/radioEngine';
import { LOFI_FUNK_CHAPTERS, youtubePlaylistEngine } from '../audio/youtubePlaylistEngine';
import { BRAZILIAN_GANGSTA_TRACKS, youtubeTrackEngine } from '../audio/youtubeTrackEngine';

const initialState = radioEngine.getState();
const initialChapterState = youtubePlaylistEngine.getState();
const initialTrackState = youtubeTrackEngine.getState();

export const RadioPlayer: React.FC = () => {
  const [state, setState] = useState<RadioState>(initialState);
  const [chapterState, setChapterState] = useState(initialChapterState);
  const [trackState, setTrackState] = useState(initialTrackState);

  useEffect(() => radioEngine.subscribe(setState), []);
  useEffect(() => youtubePlaylistEngine.subscribe(setChapterState), []);
  useEffect(() => youtubeTrackEngine.subscribe(setTrackState), []);

  const station = useMemo(
    () => RADIO_STATIONS.find(item => item.id === state.stationId) ?? RADIO_STATIONS[0],
    [state.stationId]
  );
  const isChapterYouTube = station.source === 'youtube-chapters';
  const isTrackYouTube = station.source === 'youtube-tracks';
  const isYouTube = isChapterYouTube || isTrackYouTube;
  const track = station.tracks[state.trackIndex % station.tracks.length] ?? station.tracks[0];
  const cleanExternalTitle = (title:string) => title.replace(/\s+[—-]\s+Instrumental(?: em Vinil)?$/i, '').trim();
  const splitRadioCredit = (raw:string) => {
    const clean=cleanExternalTitle(raw);
    const divider=clean.indexOf(' - ');
    if(divider<0) return { title:clean, artist:'Lofi Funk Brazil' };
    return { artist:clean.slice(0,divider).trim(), title:clean.slice(divider+3).trim() };
  };
  const chapterCredit = splitRadioCredit(chapterState.title);
  const displayTitle = isChapterYouTube
    ? chapterCredit.title
    : isTrackYouTube
      ? cleanExternalTitle(trackState.title)
      : track.title;
  const displayArtist = isChapterYouTube
    ? chapterCredit.artist
    : isTrackYouTube
      ? "Racionais MC's"
      : 'OpenAI Original / Rádio Concreto';
  const displayMeta = isYouTube ? '' : `${track.bpm} BPM`;
  const externalReady = isChapterYouTube
    ? chapterState.ready
    : isTrackYouTube
      ? trackState.ready
      : true;
  const externalError = isChapterYouTube ? chapterState.error : isTrackYouTube ? trackState.error : undefined;
  const volumePercent = Math.round(state.volume * 100);

  useEffect(() => {
    if (!isYouTube || !externalError) return;
    youtubePlaylistEngine.pause();
    youtubeTrackEngine.pause();
    radioEngine.setStation('concreto');
  }, [isYouTube, externalError]);

  useEffect(() => {
    if (isChapterYouTube) {
      youtubePlaylistEngine.ensureReady(chapterState.chapterIndex).catch(() => {});
      youtubeTrackEngine.pause();
    } else if (isTrackYouTube) {
      youtubeTrackEngine.ensureReady(trackState.trackIndex).catch(() => {});
      youtubePlaylistEngine.pause();
    } else {
      youtubePlaylistEngine.pause();
      youtubeTrackEngine.pause();
    }
  }, [isChapterYouTube, isTrackYouTube]);
  useEffect(() => {
    const volume = state.systemMuted ? 0 : state.volume;
    youtubePlaylistEngine.setVolume(volume);
    youtubeTrackEngine.setVolume(volume);
    if (state.systemMuted) {
      youtubePlaylistEngine.pause();
      youtubeTrackEngine.pause();
    }
  }, [state.volume, state.systemMuted]);

  const handleStationChange = (stationId:RadioStationId) => {
    radioEngine.setStation(stationId);
    const nextStation = RADIO_STATIONS.find(item => item.id === stationId);
    if (nextStation?.source === 'youtube-chapters') {
      youtubePlaylistEngine.ensureReady(chapterState.chapterIndex).catch(() => {});
    }
    if (nextStation?.source === 'youtube-tracks') {
      youtubeTrackEngine.ensureReady(trackState.trackIndex).catch(() => {});
    }
  };

  const togglePlayback = () => {
    if (isYouTube && !externalReady) return;
    if (isChapterYouTube) {
      if (state.playing) youtubePlaylistEngine.pause();
      else youtubePlaylistEngine.play(chapterState.chapterIndex).catch(() => {});
    } else if (isTrackYouTube) {
      if (state.playing) youtubeTrackEngine.pause();
      else youtubeTrackEngine.play(trackState.trackIndex).catch(() => {});
    }
    radioEngine.toggle();
  };
  const previous = () => {
    if (isChapterYouTube) youtubePlaylistEngine.previousChapter();
    else if (isTrackYouTube) youtubeTrackEngine.previousTrack(state.playing);
    else radioEngine.previousTrack();
  };

  const next = () => {
    if (isChapterYouTube) youtubePlaylistEngine.nextChapter();
    else if (isTrackYouTube) youtubeTrackEngine.nextTrack(state.playing);
    else radioEngine.nextTrack();
  };

  return (
    <div className="relative flex items-center gap-1 rounded-xl border border-slate-700/80 bg-[linear-gradient(135deg,rgba(2,6,23,.97),rgba(8,15,29,.94))] px-2 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,.32),inset_0_1px_0_rgba(255,255,255,.035)] ring-1 ring-cyan-500/[.04] min-w-0">
      <Radio className={`w-3.5 h-3.5 shrink-0 ${state.playing && !state.systemMuted ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,.55)]' : 'text-slate-500'}`} />
      <select
        aria-label="Escolher estação de rádio"
        value={state.stationId}
        onChange={event => handleStationChange(event.target.value as RadioStationId)}
        className="max-w-[160px] bg-transparent text-[10px] font-semibold text-slate-200 outline-none cursor-pointer"
        title={station.tagline}
      >
        {RADIO_STATIONS.map(item => (
          <option key={item.id} value={item.id} className="bg-slate-950 text-slate-200">
            {item.frequency} · {item.name}
          </option>
        ))}
      </select>
      <div className="hidden min-[1900px]:block w-px h-5 bg-slate-800" />
      <div className="hidden min-[1900px]:flex flex-col min-w-[112px] max-w-[210px] leading-tight">
        <span className="text-[9px] text-emerald-400/90 truncate">{station.tagline}</span>
        <div className="group/track relative min-w-0">
          <span className="block text-[10px] text-slate-300 truncate cursor-default">
            {displayTitle}{displayMeta ? ` · ${displayMeta}` : ''}
          </span>
          <div role="tooltip" className="pointer-events-none absolute left-0 top-[calc(100%+8px)] z-[90] w-max min-w-[190px] max-w-[290px] translate-y-1 rounded-lg border border-cyan-500/25 bg-slate-950/95 px-3 py-2.5 opacity-0 shadow-[0_12px_35px_rgba(0,0,0,.55)] backdrop-blur-md transition-all duration-150 group-hover/track:translate-y-0 group-hover/track:opacity-100">
            <div className="mb-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-400/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]" />
              No ar
            </div>
            <div className="max-w-[260px] text-[11px] font-semibold leading-snug text-white">{displayTitle}</div>
            <div className="mt-1 text-[10px] font-medium text-cyan-300/90">por {displayArtist}</div>
          </div>
        </div>
      </div>
      <button
        onClick={previous}
        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
        title={isYouTube ? 'Faixa anterior' : 'Faixa anterior'}
      ><SkipBack className="w-3.5 h-3.5" /></button>
      <button
        onClick={togglePlayback}
        disabled={isYouTube && !externalReady}
        className="p-1.5 rounded-md bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/70 disabled:opacity-40 disabled:cursor-wait"
        title={isYouTube && !externalReady ? 'Carregando rádio…' : state.playing ? 'Pausar música' : 'Tocar música'}
      >{state.playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</button>
      <button
        onClick={next}
        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
        title="Próxima faixa"
      ><SkipForward className="w-3.5 h-3.5" /></button>
      <button
        onClick={() => radioEngine.adjustVolume(-.1)}
        className="p-1 text-slate-500 hover:text-slate-200"
        title="Abaixar música"
      ><Volume1 className="w-3.5 h-3.5" /></button>
      <span className="hidden xl:inline text-[9px] font-mono text-slate-400 w-7 text-center">{volumePercent}</span>
      <button
        onClick={() => radioEngine.adjustVolume(.1)}
        className="p-1 text-slate-500 hover:text-slate-200"
        title="Aumentar música"
      ><Volume2 className="w-3.5 h-3.5" /></button>
    </div>
  );
};
