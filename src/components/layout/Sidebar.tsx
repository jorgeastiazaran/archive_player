import React from 'react';
import {
  Compass,
  Users,
  Disc3,
  Film,
  Sparkles,
  ListMusic,
  Heart,
  DownloadCloud,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import type { AppView } from '../../types/media';
import { usePlayer } from '../../store/PlayerContext';

interface SidebarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
}

interface NavItemConfig {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const {
    playlists,
    favoriteIds,
    offlineRecords,
    silentFilmVisualizer,
    setSilentFilmVisualizer,
  } = usePlayer();

  const discoverItems: NavItemConfig[] = [
    { id: 'explore', label: 'Explorar Archivo', icon: Compass },
    { id: 'artists', label: 'Artistas y Directores', icon: Users },
    { id: 'albums', label: 'Álbumes y Colecciones', icon: Disc3 },
    { id: 'videos', label: 'Cine y Video Abierto', icon: Film },
    {
      id: 'ai-curator',
      label: 'Curador IA (Smart DJ)',
      icon: Sparkles,
      badge: 'IA',
      highlight: true,
    },
  ];

  const libraryItems: NavItemConfig[] = [
    {
      id: 'playlists',
      label: 'Mis Playlists',
      icon: ListMusic,
      badge: playlists.length > 0 ? playlists.length : undefined,
    },
    {
      id: 'favorites',
      label: 'Obras Favoritas',
      icon: Heart,
      badge: favoriteIds.length > 0 ? favoriteIds.length : undefined,
    },
    {
      id: 'offline',
      label: 'Descargas Offline',
      icon: DownloadCloud,
      badge: offlineRecords.length > 0 ? offlineRecords.length : undefined,
    },
  ];

  const renderNavButton = (item: NavItemConfig) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelectView(item.id)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
          isActive
            ? item.highlight
              ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-zinc-800/90 text-amber-400 border border-zinc-700/70 shadow-sm'
            : item.highlight
              ? 'text-amber-300/90 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/25'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
        }`}
      >
        <span className="flex items-center gap-3 truncate">
          <Icon
            className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              isActive
                ? 'text-amber-400'
                : item.highlight
                  ? 'text-amber-400/80'
                  : 'text-zinc-500 group-hover:text-zinc-300'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </span>

        {item.badge !== undefined && (
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
              item.highlight
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30'
                : isActive
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-68 xl:w-72 shrink-0 bg-zinc-950/95 border-r border-zinc-800/80 select-none">
      {/* Cabecera de marca */}
      <div className="p-5 pb-4 flex items-center gap-3 border-b border-zinc-900">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/15 border border-amber-400/30">
          <Radio className="w-5 h-5 text-zinc-950 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-zinc-100">
              Archive Player
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Open
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Patrimonio Sonoro y Cine Libre
          </p>
        </div>
      </div>

      {/* Navegación principal */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Descubrimiento Cultural
          </p>
          <nav className="space-y-1">{discoverItems.map(renderNavButton)}</nav>
        </div>

        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Tu Colección Local
          </p>
          <nav className="space-y-1">{libraryItems.map(renderNavButton)}</nav>
        </div>

        {/* Interruptor rápido de Proyector de Cine Mudo */}
        <div className="mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900/95 via-zinc-900/80 to-amber-950/25 border border-zinc-800/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              Proyector Cine Mudo
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={silentFilmVisualizer}
              onClick={() => setSilentFilmVisualizer(!silentFilmVisualizer)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                silentFilmVisualizer ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
              title="Proyectar loops de cine silente al escuchar audio"
            >
              <span
                className={`bg-zinc-950 w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
                  silentFilmVisualizer ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Acompaña las grabaciones de audio con fragmentos restaurados de cine silente de dominio público.
          </p>
        </div>
      </div>

      {/* Pie con sello de Cultura Libre */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/60">
        <div className="flex items-start gap-2.5 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <p className="font-medium text-zinc-300">100% Dominio Público y CC</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Conectado a Internet Archive, Musopen, FMA y Prelinger.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
