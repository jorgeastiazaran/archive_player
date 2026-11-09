import React, { useState } from 'react';
import type { AppView, MediaItem } from './types/media';
import { PlayerProvider } from './store/PlayerContext';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Header } from './components/layout/Header';
import { ExploreView } from './components/catalog/ExploreView';
import { ArtistsAlbumsView } from './components/catalog/ArtistsAlbumsView';
import { AICuratorView } from './components/ai-dj/AICuratorView';
import { LibraryAndOfflineView } from './components/library/LibraryAndOfflineView';
import { UnifiedPlayerBar } from './components/player/UnifiedPlayerBar';
import { LinerNotesDrawer } from './components/player/LinerNotesDrawer';

const ArchivePlayerShell: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('explore');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveSearchResults, setLiveSearchResults] = useState<MediaItem[]>([]);
  const [lastLiveQuery, setLastLiveQuery] = useState<string>('');
  const [isSearchingArchive, setIsSearchingArchive] = useState<boolean>(false);

  const handleLiveSearchResults = (items: MediaItem[], query: string) => {
    setLiveSearchResults(items);
    setLastLiveQuery(query);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'explore':
        return (
          <ExploreView
            searchQuery={searchQuery}
            liveSearchResults={liveSearchResults}
            lastLiveQuery={lastLiveQuery}
            isSearchingArchive={isSearchingArchive}
            onSelectView={setActiveView}
          />
        );
      case 'artists':
        return <ArtistsAlbumsView mode="artists" />;
      case 'albums':
        return <ArtistsAlbumsView mode="albums" />;
      case 'videos':
        return <ArtistsAlbumsView mode="videos" />;
      case 'ai-curator':
        return <AICuratorView />;
      case 'playlists':
        return <LibraryAndOfflineView mode="playlists" />;
      case 'favorites':
        return <LibraryAndOfflineView mode="favorites" />;
      case 'offline':
        return <LibraryAndOfflineView mode="offline" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Navegación Lateral Desktop */}
      <Sidebar activeView={activeView} onSelectView={setActiveView} />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0 pb-36 lg:pb-24">
        <Header
          activeView={activeView}
          onSelectView={setActiveView}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onLiveSearchResults={handleLiveSearchResults}
          isSearchingArchive={isSearchingArchive}
          setIsSearchingArchive={setIsSearchingArchive}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 max-w-screen-2xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Panel de Contexto Histórico y Licencias */}
      <LinerNotesDrawer />

      {/* Reproductor Unificado Persistente (Audio + Video + Proyector Cine Mudo) */}
      <UnifiedPlayerBar />

      {/* Navegación Inferior Mobile */}
      <MobileNav activeView={activeView} onSelectView={setActiveView} />
    </div>
  );
};

export function App() {
  return (
    <PlayerProvider>
      <ArchivePlayerShell />
    </PlayerProvider>
  );
}

export default App;
