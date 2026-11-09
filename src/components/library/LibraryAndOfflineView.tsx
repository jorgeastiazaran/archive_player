import React, { useMemo, useState } from 'react';
import {
  ListMusic,
  Heart,
  DownloadCloud,
  Plus,
  Play,
  Trash2,
  Sparkles,
  HardDriveDownload,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { usePlayer } from '../../store/PlayerContext';
import { triggerDirectBrowserDownload } from '../../services/offline/offlineStorage';

interface LibraryAndOfflineViewProps {
  mode: 'playlists' | 'favorites' | 'offline';
}

function formatMegabytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export const LibraryAndOfflineView: React.FC<LibraryAndOfflineViewProps> = ({ mode }) => {
  const {
    catalog,
    playlists,
    createPlaylist,
    deletePlaylist,
    removeItemFromPlaylist,
    playPlaylist,
    playItem,
    favoriteIds,
    toggleFavorite,
    offlineRecords,
    removeOfflineDownload,
    setShowLinerNotes,
  } = usePlayer();

  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState<string>('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const favoriteItems = useMemo(
    () => catalog.filter((item) => favoriteIds.includes(item.id)),
    [catalog, favoriteIds]
  );

  const totalOfflineBytes = useMemo(
    () => offlineRecords.reduce((acc, rec) => acc + rec.sizeBytes, 0),
    [offlineRecords]
  );

  const handleCreateManualPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const created = createPlaylist(
      newPlaylistName.trim(),
      newPlaylistDesc.trim() || 'Colección personal de cultura libre.',
      catalog.slice(0, 2)
    );
    setSelectedPlaylistId(created.id);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
  };

  if (mode === 'favorites') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Heart className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                Mis Obras Favoritas ({favoriteItems.length})
              </h2>
              <p className="text-xs text-zinc-400">
                Grabaciones y películas marcadas en tu sala de escucha personal
              </p>
            </div>
          </div>

          {favoriteItems.length > 0 && (
            <button
              type="button"
              onClick={() => playItem(favoriteItems[0], favoriteItems)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Reproducir Favoritos</span>
            </button>
          )}
        </div>

        {favoriteItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-300">
              Aún no tienes obras marcadas como favoritas.
            </p>
            <p className="text-xs text-zinc-500">
              Pulsa el ícono del corazón en cualquier grabación o película para guardarla aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favoriteItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-14 h-14 rounded-xl object-cover bg-zinc-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-amber-400">
                      {item.sourceLabel} • {item.license.code}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-100 truncate">{item.title}</h3>
                    <p className="text-xs text-zinc-400 truncate">{item.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => playItem(item, favoriteItems)}
                    className="p-2 rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 cursor-pointer"
                    title="Reproducir"
                  >
                    <Play className="w-4 h-4 fill-zinc-950" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playItem(item, favoriteItems);
                      setShowLinerNotes(true);
                    }}
                    className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                    title="Ver Liner Notes"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item)}
                    className="p-2 rounded-xl bg-zinc-800/80 text-amber-400 hover:bg-zinc-800 cursor-pointer"
                    title="Quitar de Favoritos"
                  >
                    <Heart className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (mode === 'offline') {
    const offlineItems = offlineRecords.map((r) => r.item);
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                Gestor de Descargas y Modo Offline
              </h2>
              <p className="text-xs text-zinc-400">
                Almacenamiento persistente en IndexedDB para reproducción sin internet y descarga directa (.mp3 / .mp4)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-300">
              Espacio local: {formatMegabytes(totalOfflineBytes)} ({offlineRecords.length} archivos)
            </span>
          </div>
        </div>

        {offlineRecords.length === 0 ? (
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-300">
              No hay obras guardadas en el almacenamiento Offline todavía.
            </p>
            <p className="text-xs text-zinc-500">
              Usa el botón de nube en cualquier tarjeta o en el reproductor para guardar música o cine clásico en tu dispositivo.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {offlineRecords.map(({ item, sizeBytes, downloadedAt }) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-14 h-14 rounded-xl object-cover bg-zinc-800 shrink-0"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Listo sin conexión • {formatMegabytes(sizeBytes)}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(downloadedAt).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 truncate">{item.title}</h3>
                    <p className="text-xs text-zinc-400 truncate">
                      {item.artist} • {item.license.label}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => playItem(item, offlineItems)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-zinc-950" />
                    <span>Reproducir Offline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerDirectBrowserDownload(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 cursor-pointer"
                    title="Guardar archivo original .mp3 o .mp4 en tu disco/teléfono"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Guardar .{item.mediaType === 'video' ? 'mp4' : 'mp3'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeOfflineDownload(item.id)}
                    className="p-2 rounded-xl bg-zinc-950 hover:bg-red-950/50 text-zinc-400 hover:text-red-400 border border-zinc-800 cursor-pointer"
                    title="Eliminar del almacenamiento Offline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Modo 'playlists'
  const activePlaylist =
    playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ListMusic className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100">
            Mis Playlists y Curadurías IA ({playlists.length})
          </h2>
          <p className="text-xs text-zinc-400">
            Crea colecciones manuales o administra las sesiones generadas por el Curador IA
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna izquierda: Crear playlist y listado */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleCreateManualPlaylist}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Nueva Playlist Personal
            </h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Nombre de la playlist (ej. Nocturnos y Café)..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100"
            />
            <input
              type="text"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              placeholder="Descripción breve opcional..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
            >
              Crear Playlist
            </button>
          </form>

          <div className="space-y-2">
            {playlists.map((pl) => {
              const selected = activePlaylist?.id === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selected
                      ? 'bg-amber-500/15 border-amber-500/45'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {pl.isAiGenerated && (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <h4 className="text-sm font-bold text-zinc-100 truncate">{pl.name}</h4>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {pl.items.length} obras • {pl.isAiGenerated ? 'Curaduría IA' : 'Manual'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(pl.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400"
                    title="Eliminar playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna derecha: Detalle de la playlist activa */}
        {activePlaylist && (
          <div className="lg:col-span-7 rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">{activePlaylist.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{activePlaylist.description}</p>
              </div>
              <button
                type="button"
                onClick={() => playPlaylist(activePlaylist)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
              >
                <Play className="w-4 h-4 fill-zinc-950" />
                <span>Reproducir Todo</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {activePlaylist.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-100 truncate">{item.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        {item.artist} ({item.license.code})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => playItem(item, activePlaylist.items)}
                      className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItemFromPlaylist(activePlaylist.id, item.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 cursor-pointer"
                      title="Quitar de esta playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
