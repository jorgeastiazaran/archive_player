import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  DownloadCloud,
  Check,
  Loader2,
  BookOpen,
  Film,
  Headphones,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { usePlayer } from '../../store/PlayerContext';
import { SILENT_FILM_LOOPS } from '../../data/curatedCatalog';

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const rem = total % 60;
  return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
}

export const UnifiedPlayerBar: React.FC = () => {
  const {
    currentItem,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    showLinerNotes,
    showVideoOverlay,
    silentFilmVisualizer,
    audioOnlyMode,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    setShowLinerNotes,
    setShowVideoOverlay,
    setSilentFilmVisualizer,
    setAudioOnlyMode,
    toggleFavorite,
    isFavorite,
    isOfflineDownloaded,
    downloadingIds,
    downloadForOffline,
    getEffectiveStreamUrl,
  } = usePlayer();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isExpandedTheater, setIsExpandedTheater] = useState<boolean>(false);
  const [silentLoopIdx, setSilentLoopIdx] = useState<number>(0);

  const isVideoActive =
    Boolean(currentItem && currentItem.mediaType === 'video' && !audioOnlyMode && showVideoOverlay);
  const isSilentProjectorActive =
    Boolean(currentItem && currentItem.mediaType === 'audio' && silentFilmVisualizer);

  useEffect(() => {
    if (!currentItem || currentItem.mediaType !== 'video') {
      setVideoSrc('');
      return;
    }
    let cancelled = false;
    getEffectiveStreamUrl(currentItem).then((url) => {
      if (!cancelled) setVideoSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [currentItem, getEffectiveStreamUrl]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isVideoActive) return;
    vid.volume = Math.max(0, Math.min(1, volume));
    vid.muted = isMuted;
  }, [isVideoActive, volume, isMuted]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isVideoActive) return;
    if (Math.abs(vid.currentTime - currentTime) > 1.5) {
      vid.currentTime = currentTime;
    }
  }, [isVideoActive, currentTime]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isVideoActive) return;
    if (isPlaying) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isVideoActive, isPlaying, videoSrc]);

  if (!currentItem) return null;

  const fav = isFavorite(currentItem.id);
  const downloaded = isOfflineDownloaded(currentItem.id);
  const downloading = downloadingIds.includes(currentItem.id);
  const currentSilentLoop = SILENT_FILM_LOOPS[silentLoopIdx % SILENT_FILM_LOOPS.length];

  return (
    <>
      {/* Visor Flotante / Sala de Proyección (Video o Visualizador de Cine Mudo) */}
      {(isVideoActive || isSilentProjectorActive) && (
        <div
          className={`fixed z-40 transition-all duration-300 bg-zinc-950/95 border border-amber-500/35 rounded-2xl shadow-2xl overflow-hidden ${
            isExpandedTheater
              ? 'inset-4 lg:inset-10 bottom-28 flex flex-col'
              : 'right-4 bottom-24 lg:bottom-24 w-80 sm:w-96'
          }`}
        >
          {/* Barra superior del proyector */}
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-2 truncate">
              <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-zinc-200 truncate">
                {isVideoActive
                  ? currentItem.title
                  : `Proyector Silente: ${currentSilentLoop.title} (${currentSilentLoop.year})`}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isSilentProjectorActive && (
                <button
                  type="button"
                  onClick={() => setSilentLoopIdx((i) => (i + 1) % SILENT_FILM_LOOPS.length)}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-medium cursor-pointer"
                  title="Cambiar rollo de cine mudo"
                >
                  Cambiar Rollo
                </button>
              )}
              {isVideoActive && (
                <button
                  type="button"
                  onClick={() => setAudioOnlyMode(true)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] flex items-center gap-1 cursor-pointer"
                  title="Cambiar a modo Solo Audio"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Solo Audio</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsExpandedTheater((prev) => !prev)}
                className="p-1 text-zinc-400 hover:text-zinc-100"
                title={isExpandedTheater ? 'Reducir ventana' : 'Modo Sala de Cine'}
              >
                {isExpandedTheater ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() =>
                  isVideoActive ? setShowVideoOverlay(false) : setSilentFilmVisualizer(false)
                }
                className="p-1 text-zinc-400 hover:text-zinc-100"
                title="Cerrar visor"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Lienzo de video */}
          <div className="relative bg-black flex-1 flex items-center justify-center aspect-video">
            {isVideoActive ? (
              <video
                ref={videoRef}
                src={videoSrc || currentItem.streamUrl}
                poster={currentItem.thumbnailUrl}
                className="w-full h-full object-contain"
                playsInline
                onTimeUpdate={(e) => seekTo(e.currentTarget.currentTime)}
                onEnded={nextTrack}
                onClick={togglePlay}
              />
            ) : (
              <video
                key={currentSilentLoop.id}
                src={currentSilentLoop.videoUrl}
                className="w-full h-full object-cover sepia-[.25] contrast-110 opacity-90"
                autoPlay
                loop
                muted
                playsInline
              />
            )}
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none text-[10px] text-zinc-300/90 bg-black/55 backdrop-blur-xs px-2.5 py-1 rounded-lg">
              <span>
                {isVideoActive
                  ? `${currentItem.artist} • ${currentItem.decade}`
                  : `Dir. ${currentSilentLoop.director} • Dominio Público`}
              </span>
              <span className="text-amber-300 font-medium">{currentItem.license.code}</span>
            </div>
          </div>
        </div>
      )}

      {/* Barra Inferior Persistente de Reproducción */}
      <footer className="fixed bottom-14 lg:bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 px-3 sm:px-6 py-2.5 shadow-2xl">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3">
          {/* 1. Información de la obra actual */}
          <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xs sm:max-w-sm">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/60 group">
              <img
                src={currentItem.thumbnailUrl}
                alt={currentItem.title}
                className="w-full h-full object-cover"
              />
              {currentItem.mediaType === 'video' && (
                <button
                  type="button"
                  onClick={() => {
                    setAudioOnlyMode(false);
                    setShowVideoOverlay(!showVideoOverlay);
                  }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Alternar ventana de video"
                >
                  <Film className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                  {currentItem.title}
                </p>
                <span className="hidden xl:inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {currentItem.license.code}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {currentItem.artist} • <span className="text-zinc-500">{currentItem.sourceLabel}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleFavorite(currentItem)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                fav ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={fav ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          {/* 2. Controles centrales y barra de progreso */}
          <div className="flex flex-col items-center flex-1 max-w-xl">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`hidden sm:inline-flex p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isShuffle ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Reproducción aleatoria"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={prevTrack}
                className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                className="p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Siguiente"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={cycleRepeatMode}
                className={`hidden sm:inline-flex p-1.5 rounded-lg transition-colors cursor-pointer ${
                  repeatMode !== 'off' ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title={`Repetir: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="w-full flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">
                {formatSeconds(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 200}
                step={1}
                value={Math.min(currentTime, duration || 200)}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                aria-label="Progreso de reproducción"
              />
              <span className="text-[10px] font-mono text-zinc-400 w-8">
                {formatSeconds(duration)}
              </span>
            </div>
          </div>

          {/* 3. Controles derechos: Visualizador / Video, Offline, Liner Notes y Volumen */}
          <div className="hidden md:flex items-center justify-end gap-2 flex-1 max-w-xs">
            {currentItem.mediaType === 'audio' ? (
              <button
                type="button"
                onClick={() => setSilentFilmVisualizer(!silentFilmVisualizer)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  silentFilmVisualizer
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
                title="Proyectar loop de Cine Mudo acompañando el audio"
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Cine Mudo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (audioOnlyMode) {
                    setAudioOnlyMode(false);
                    setShowVideoOverlay(true);
                  } else {
                    setShowVideoOverlay(!showVideoOverlay);
                  }
                }}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showVideoOverlay && !audioOnlyMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
                title="Mostrar u ocultar proyector de video"
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Visor Video</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => downloadForOffline(currentItem)}
              disabled={downloading}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                downloaded
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
              title={downloaded ? 'Guardado en modo Offline' : 'Guardar para escuchar sin conexión'}
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : downloaded ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <DownloadCloud className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowLinerNotes(!showLinerNotes)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showLinerNotes
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
              title="Contexto Histórico y Atribución"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 pl-1">
              <button
                type="button"
                onClick={toggleMute}
                className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                aria-label="Volumen"
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
