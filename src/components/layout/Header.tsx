import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Wifi,
  WifiOff,
  Loader2,
  X,
  Globe,
  BookOpen,
} from 'lucide-react';
import type { AppView, MediaItem } from '../../types/media';
import { usePlayer } from '../../store/PlayerContext';
import { searchArchiveMedia } from '../../services/providers/internetArchive';

interface HeaderProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onLiveSearchResults: (items: MediaItem[], query: string) => void;
  isSearchingArchive: boolean;
  setIsSearchingArchive: (loading: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  searchQuery,
  onSearchQueryChange,
  onLiveSearchResults,
  isSearchingArchive,
  setIsSearchingArchive,
}) => {
  const { isOnline, currentItem, showLinerNotes, setShowLinerNotes } = usePlayer();
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleTriggerArchiveSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setSearchError(null);
    setIsSearchingArchive(true);
    if (activeView !== 'explore') {
      onSelectView('explore');
    }

    try {
      const results = await searchArchiveMedia(trimmed, 'all');
      onLiveSearchResults(results, trimmed);
    } catch {
      setSearchError('Modo local activo: archive.org no disponible temporalmente.');
      onLiveSearchResults([], trimmed);
    } finally {
      setIsSearchingArchive(false);
    }
  };

  const handleClearSearch = () => {
    onSearchQueryChange('');
    onLiveSearchResults([], '');
    setSearchError(null);
  };

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Buscador en tiempo real + conexión a archive.org */}
        <form
          onSubmit={handleTriggerArchiveSearch}
          className="flex-1 min-w-[240px] max-w-2xl flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchQueryChange(e.target.value);
                if (activeView !== 'explore' && e.target.value.trim().length > 0) {
                  onSelectView('explore');
                }
              }}
              placeholder="Buscar por obra, compositor, década o consultar en archive.org..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-200"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!searchQuery.trim() || isSearchingArchive}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 disabled:opacity-40 disabled:pointer-events-none transition-colors shrink-0 cursor-pointer"
            title="Consultar API en vivo de Internet Archive (archive.org)"
          >
            {isSearchingArchive ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">Buscar en archive.org</span>
          </button>
        </form>

        {/* Indicadores de estado y accesos rápidos */}
        <div className="flex items-center gap-2.5">
          {/* Estado de red Online / Offline */}
          <div
            onClick={() => !isOnline && onSelectView('offline')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/40 cursor-pointer'
            }`}
            title={
              isOnline
                ? 'Conectado a repositorios abiertos'
                : 'Sin conexión: reproduciendo desde caché local IndexedDB'
            }
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Modo Offline</span>
              </>
            )}
          </div>

          {/* Botón rápido de Contexto Histórico si hay ítem activo */}
          {currentItem && (
            <button
              type="button"
              onClick={() => setShowLinerNotes(!showLinerNotes)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                showLinerNotes
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700'
              }`}
              title="Ver Liner Notes y Licencia Abierta"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Liner Notes</span>
            </button>
          )}

          {/* Acceso directo al Curador IA */}
          <button
            type="button"
            onClick={() => onSelectView('ai-curator')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'ai-curator'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 border border-amber-500/35'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curador IA</span>
          </button>
        </div>
      </div>

      {searchError && (
        <p className="text-[11px] text-amber-400/90 mt-1.5">{searchError}</p>
      )}
    </header>
  );
};
