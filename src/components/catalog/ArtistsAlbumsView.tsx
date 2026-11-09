import React, { useMemo, useState } from 'react';
import {
  Users,
  Disc3,
  Film,
  Play,
  Loader2,
  FolderOpen,
  Heart,
  DownloadCloud,
  Check,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import type { MediaItem } from '../../types/media';
import { usePlayer } from '../../store/PlayerContext';
import { fetchArchiveItemTracks } from '../../services/providers/internetArchive';

interface ArtistsAlbumsViewProps {
  mode: 'artists' | 'albums' | 'videos';
}

interface GroupedBucket {
  key: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  decade: string;
  archiveIdentifier: string;
  items: MediaItem[];
}

export const ArtistsAlbumsView: React.FC<ArtistsAlbumsViewProps> = ({ mode }) => {
  const {
    catalog,
    playItem,
    toggleFavorite,
    isFavorite,
    isOfflineDownloaded,
    downloadingIds,
    downloadForOffline,
    setShowLinerNotes,
  } = usePlayer();

  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [expandedArchiveTracks, setExpandedArchiveTracks] = useState<Record<string, MediaItem[]>>(
    {}
  );
  const [loadingArchiveId, setLoadingArchiveId] = useState<string | null>(null);

  const groups = useMemo<GroupedBucket[]>(() => {
    if (mode === 'videos') return [];
    const map = new Map<string, GroupedBucket>();

    for (const item of catalog) {
      const groupTitle = mode === 'artists' ? item.artist : item.albumOrCollection;
      const existing = map.get(groupTitle);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(groupTitle, {
          key: groupTitle,
          title: groupTitle,
          subtitle:
            mode === 'artists'
              ? `${item.genres.slice(0, 2).join(' • ')} (${item.region || item.decade})`
              : `${item.artist} • ${item.sourceLabel}`,
          coverUrl: item.thumbnailUrl,
          decade: item.decade,
          archiveIdentifier: item.archiveIdentifier,
          items: [item],
        });
      }
    }

    return Array.from(map.values());
  }, [catalog, mode]);

  const videoCatalog = useMemo(
    () => catalog.filter((item) => item.mediaType === 'video'),
    [catalog]
  );

  const handleLoadAlbumTracks = async (identifier: string) => {
    if (!identifier || loadingArchiveId === identifier) return;
    setLoadingArchiveId(identifier);
    try {
      const tracks = await fetchArchiveItemTracks(identifier);
      if (tracks.length > 0) {
        setExpandedArchiveTracks((prev) => ({ ...prev, [identifier]: tracks }));
      }
    } finally {
      setLoadingArchiveId(null);
    }
  };

  if (mode === 'videos') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                Filmoteca Abierta y Cine de Dominio Público
              </h2>
              <p className="text-xs text-zinc-400">
                Películas completas, cortos silentes restaurados, animación Fleischer y archivos Prelinger
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {videoCatalog.map((video) => {
            const fav = isFavorite(video.id);
            const downloaded = isOfflineDownloaded(video.id);
            const downloading = downloadingIds.includes(video.id);

            return (
              <article
                key={video.id}
                className="rounded-2xl bg-zinc-900/80 border border-zinc-800/90 overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-all"
              >
                <div>
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                    <button
                      type="button"
                      onClick={() => playItem(video, videoCatalog)}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-amber-500/95 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 cursor-pointer"
                      title="Proyectar película"
                    >
                      <Play className="w-6 h-6 fill-zinc-950 ml-0.5" />
                    </button>
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-zinc-950/85 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                      {video.year} • {video.sourceLabel}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-emerald-950/90 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {video.license.label}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-zinc-100">{video.title}</h3>
                    <p className="text-xs text-amber-300/90 font-medium">{video.artist}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                      {video.historicalContext}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(video)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        fav ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${fav ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadForOffline(video)}
                      disabled={downloading}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer"
                      title="Descargar película para modo Offline"
                    >
                      {downloading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : downloaded ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <DownloadCloud className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playItem(video, videoCatalog);
                      setShowLinerNotes(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ficha y Créditos</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  const activeGroup = groups.find((g) => g.key === selectedGroupKey) || groups[0];
  const extraTracks = activeGroup
    ? expandedArchiveTracks[activeGroup.archiveIdentifier] || []
    : [];
  const displayedTracks = activeGroup
    ? [
        ...activeGroup.items,
        ...extraTracks.filter((t) => !activeGroup.items.some((i) => i.id === t.id)),
      ]
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera de sección */}
      <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          {mode === 'artists' ? <Users className="w-5 h-5" /> : <Disc3 className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100">
            {mode === 'artists'
              ? 'Compositores, Intérpretes y Directores'
              : 'Álbumes, Obras y Colecciones de Archivo'}
          </h2>
          <p className="text-xs text-zinc-400">
            {mode === 'artists'
              ? 'Explora el catálogo agrupado por creador histórico y época'
              : 'Inspecciona colecciones curadas y extrae todas las pistas multipista desde archive.org'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista lateral de Artistas o Álbumes */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-[640px] overflow-y-auto pr-1">
          {groups.map((group) => {
            const isSelected = activeGroup?.key === group.key;
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => setSelectedGroupKey(group.key)}
                className={`flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/45 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <img
                  src={group.coverUrl}
                  alt={group.title}
                  className="w-14 h-14 rounded-xl object-cover bg-zinc-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-amber-400">{group.decade}</span>
                  <h3 className="text-sm font-bold text-zinc-100 truncate">{group.title}</h3>
                  <p className="text-xs text-zinc-400 truncate">{group.subtitle}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">
                  {group.items.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel de detalle del Artista o Álbum seleccionado */}
        {activeGroup && (
          <div className="lg:col-span-7 rounded-3xl bg-zinc-900/75 border border-zinc-800/90 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between border-b border-zinc-800 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src={activeGroup.coverUrl}
                  alt={activeGroup.title}
                  className="w-20 h-20 rounded-2xl object-cover border border-zinc-700 shadow-lg"
                />
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    {mode === 'artists' ? 'Perfil de Creador' : 'Colección / Álbum'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mt-0.5">
                    {activeGroup.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{activeGroup.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => playItem(displayedTracks[0], displayedTracks)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-zinc-950" />
                  <span>Reproducir Todo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadAlbumTracks(activeGroup.archiveIdentifier)}
                  disabled={loadingArchiveId === activeGroup.archiveIdentifier}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 cursor-pointer"
                  title="Consultar metadata en archive.org para extraer pistas adicionales del álbum"
                >
                  {loadingArchiveId === activeGroup.archiveIdentifier ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Explorar Pistas en archive.org</span>
                </button>
              </div>
            </div>

            {/* Lista de pistas */}
            <div className="space-y-2">
              {displayedTracks.map((track, idx) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono text-zinc-500 w-5">{idx + 1}.</span>
                    <button
                      type="button"
                      onClick={() => playItem(track, displayedTracks)}
                      className="w-8 h-8 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {track.artist} • {track.decade} • {track.license.label}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playItem(track, displayedTracks);
                      setShowLinerNotes(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] text-amber-300 border border-zinc-800 shrink-0 cursor-pointer"
                  >
                    Liner Notes
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
