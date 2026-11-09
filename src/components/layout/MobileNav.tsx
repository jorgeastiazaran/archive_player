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
} from 'lucide-react';
import type { AppView } from '../../types/media';
import { usePlayer } from '../../store/PlayerContext';

interface MobileNavProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
}

interface MobileTab {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeView, onSelectView }) => {
  const { offlineRecords, favoriteIds } = usePlayer();

  const tabs: MobileTab[] = [
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'artists', label: 'Artistas', icon: Users },
    { id: 'albums', label: 'Álbumes', icon: Disc3 },
    { id: 'videos', label: 'Cine', icon: Film },
    { id: 'ai-curator', label: 'DJ IA', icon: Sparkles },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Heart,
      badge: favoriteIds.length > 0 ? favoriteIds.length : undefined,
    },
    {
      id: 'offline',
      label: 'Offline',
      icon: DownloadCloud,
      badge: offlineRecords.length > 0 ? offlineRecords.length : undefined,
    },
  ];

  return (
    <nav
      aria-label="Navegación móvil"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-1 py-1.5"
    >
      <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          const isAi = tab.id === 'ai-curator';

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectView(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[60px] min-h-[46px] px-2 py-1 rounded-xl transition-colors ${
                isActive
                  ? 'text-amber-400 bg-amber-500/10'
                  : isAi
                    ? 'text-amber-300/85 hover:text-amber-300'
                    : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-medium tracking-tight truncate">
                {tab.label}
              </span>
              {tab.badge !== undefined && (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-emerald-500/90 text-zinc-950 text-[9px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
