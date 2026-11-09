import React, { useMemo, useState } from 'react';
import {
  Play,
  Pause,
  Heart,
  DownloadCloud,
  Check,
  Loader2,
  PlusCircle,
  Sparkles,
  Film,
  Music,
  BookOpen,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import type { AppView, MediaItem } from '../../types/media';
import { usePlayer } from '../../store/PlayerContext';

interface ExploreViewProps {
  searchQuery: string;
  liveSearchResults: MediaItem[];
  lastLiveQuery: string;
  isSearchingArchive: boolean;
  onSelectView: (view: AppView) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  searchQuery,
  liveSearchResults,
  lastLiveQuery,
  isSearchingArchive,
  onSelectView,
}) => {
  const {
    catalog,
    currentItem,
    isPlaying,
    playItem,
    togglePlay,
    toggleFavorite,
    isFavorite,
    playlists,
    addItemToPlaylist,
    isOfflineDownloaded,
    downloadingIds,
    downloadForOffline,
    setShowLinerNotes,
  } = usePlayer();

  const [mediaFilter, setMediaFilter] = useState<'all' | 'audio' | 'video'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [playlistMenuItemId, setPlaylistMenuItemId] = useState<string | null>(null);
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);

  const combinedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const basePool =
      liveSearchResults.length > 0 && lastLiveQuery
        ? [
            ...liveSearchResults,
            ...catalog.filter(
              (c) => !liveSearchResults.some((r) => r.archiveIdentifier === c.archiveIdentifier)
            ),
          ]
        : catalog;

    return basePool.filter((item) => {
      if (mediaFilter !== 'all' && item.mediaType !== mediaFilter) return false;
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;
      if (!query) return true;

      const haystack = [
        item.title,
        item.artist,
        item.albumOrCollection,
        item.decade,
        item.sourceLabel,
        item.region || '',
        ...item.genres,
        ...item.moods,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [catalog, liveSearchResults, lastLiveQuery, searchQuery, mediaFilter, sourceFilter]);

  const featuredHeroItem = useMemo(
    () =>
      catalog.find((i) => i.id === 'video-melies-voyage-dans-la-lune') ||
      catalog[0],
    [catalog]
  );

  const handleAddToPlaylist = (playlistId: string, item: MediaItem) => {
    addItemToPlaylist(playlistId, item);
    setPlaylistMenuItemId(null);
    setAddedFeedbackId(item.id);
    setTimeout(() => setAddedFeedbackId(null), 1800);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Cultural */}
      {!searchQuery.trim() && featuredHeroItem && (
        <section className="relative rounded-3xl overflow-hidden border border-amber-500/25 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/35 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Archivo Abierto • Patrimonio Sonoro y Audiovisual Libre</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-100 leading-tight">
              Sala de Escucha y Cine Clásico sin Barreras de Copyright
            </h2>

            <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed">
              Explora grabaciones históricas en 78rpm, nocturnos de Musopen, cortos restaurados de
              Georges Méliès y Buster Keaton o deja que el Curador IA arme una sesión según tu
              clima, época y estado de ánimo.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => playItem(featuredHeroItem, catalog)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-zinc-950" />
                <span>Ver "{featuredHeroItem.title}" (1902)</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('ai-curator')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-amber-300 border border-amber-500/35 font-semibold text-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Playlist con IA</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Barra de Filtros Rápidos */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Todo el Catálogo', icon: Globe },
            { id: 'audio', label: 'Música y Archivo Sonoro', icon: Music },
            { id: 'video', label: 'Cine Clásico y Video', icon: Film },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mediaFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMediaFilter(tab.id as 'all' | 'audio' | 'video')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filtro por colección de origen */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Todas las fuentes' },
            { id: 'musopen', label: 'Musopen' },
            { id: 'open_music_archive', label: '78rpm / Jazz' },
            { id: 'fma', label: 'Free Music Archive' },
            { id: 'public_domain_review', label: 'Public Domain Review' },
            { id: 'internet_archive', label: 'Internet Archive Cinema' },
          ].map((src) => (
            <button
              key={src.id}
              type="button"
              onClick={() => setSourceFilter(src.id)}
              className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                sourceFilter === src.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:text-zinc-200'
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>
      </section>

      {/* Indicador de búsqueda en vivo en archive.org */}
      {(isSearchingArchive || (lastLiveQuery && liveSearchResults.length > 0)) && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            {isSearchingArchive ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Consultando API pública de Internet Archive (archive.org)...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-amber-400" />
                <span>
                  Mostrando resultados combinados de <strong>archive.org</strong> y catálogo curado
                  para <em>"{lastLiveQuery}"</em> ({combinedItems.length} obras).
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Grilla de Tarjetas de Obras */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {combinedItems.map((item) => {
          const isCurrent = currentItem?.id === item.id;
          const fav = isFavorite(item.id);
          const downloaded = isOfflineDownloaded(item.id);
          const downloading = downloadingIds.includes(item.id);

          return (
            <article
              key={item.id}
              className={`group relative flex flex-col rounded-2xl bg-zinc-900/75 border transition-all duration-200 overflow-hidden hover:-translate-y-0.5 ${
                isCurrent
                  ? 'border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Imagen y controles superpuestos */}
              <div className="relative aspect-4/3 bg-zinc-950 overflow-hidden">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                {/* Insignias superiores: Fuente y Tipo */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-950/85 backdrop-blur-xs border border-zinc-700/70 text-[10px] font-semibold text-amber-300 truncate">
                    {item.sourceLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-950/85 backdrop-blur-xs border border-zinc-700/70 text-[10px] font-medium text-zinc-200 flex items-center gap-1 shrink-0">
                    {item.mediaType === 'video' ? (
                      <>
                        <Film className="w-3 h-3 text-amber-400" />
                        Cine
                      </>
                    ) : (
                      <>
                        <Music className="w-3 h-3 text-emerald-400" />
                        Audio
                      </>
                    )}
                  </span>
                </div>

                {/* Botón central de Play */}
                <button
                  type="button"
                  onClick={() =>
                    isCurrent ? togglePlay() : playItem(item, combinedItems)
                  }
                  className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-xl transition-transform group-hover:scale-105 cursor-pointer"
                  title={isCurrent && isPlaying ? 'Pausar' : 'Reproducir obra'}
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="w-5 h-5 fill-zinc-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-zinc-950 ml-0.5" />
                  )}
                </button>

                {/* Año y Licencia */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-zinc-300">
                    {item.year || item.decade}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/85 border border-emerald-500/35 text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {item.license.code}
                  </span>
                </div>
              </div>

              {/* Cuerpo de la tarjeta */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 line-clamp-1" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{item.artist}</p>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-2 leading-relaxed">
                    {item.historicalContext}
                  </p>
                </div>

                {/* Acciones de tarjeta: Favorito, Playlist, Offline, Liner Notes */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between relative">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(item)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        fav ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={fav ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
                    >
                      <Heart className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPlaylistMenuItemId(playlistMenuItemId === item.id ? null : item.id)
                      }
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      title="Agregar a una Playlist"
                    >
                      {addedFeedbackId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <PlusCircle className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadForOffline(item)}
                      disabled={downloading}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        downloaded
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={downloaded ? 'Disponible Offline' : 'Descargar para modo Offline'}
                    >
                      {downloading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : downloaded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <DownloadCloud className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isCurrent) playItem(item, combinedItems);
                      setShowLinerNotes(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300/90 hover:text-amber-300 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Historia</span>
                  </button>

                  {/* Menú rápido para agregar a playlist */}
                  {playlistMenuItemId === item.id && (
                    <div className="absolute bottom-10 left-0 z-20 w-52 rounded-xl bg-zinc-950 border border-zinc-700 shadow-xl p-1.5 space-y-1">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Añadir a Playlist:
                      </p>
                      {playlists.map((pl) => (
                        <button
                          key={pl.id}
                          type="button"
                          onClick={() => handleAddToPlaylist(pl.id, item)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 truncate cursor-pointer"
                        >
                          {pl.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
