/**
 * Contratos de datos centrales de Archive Player.
 * Compartidos entre la capa de UI (Web/Móvil), los proveedores de datos (archive.org),
 * el generador de playlists con IA y el gestor de descargas offline.
 */

export type MediaType = 'audio' | 'video';

export type ArchiveSource =
  | 'internet_archive'
  | 'fma'
  | 'musopen'
  | 'imslp'
  | 'open_music_archive'
  | 'public_domain_review'
  | 'nfb';

export type LicenseCode = 'PUBLIC_DOMAIN' | 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'CC-BY-NC';

export interface LicenseInfo {
  code: LicenseCode;
  label: string;
  url?: string;
  attributionText: string;
}

export interface MediaItem {
  id: string;
  archiveIdentifier: string;
  title: string;
  artist: string;
  albumOrCollection: string;
  mediaType: MediaType;
  streamUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  year?: number;
  decade: string;
  genres: string[];
  moods: string[];
  region?: string;
  source: ArchiveSource;
  sourceLabel: string;
  sourcePageUrl: string;
  license: LicenseInfo;
  historicalContext: string;
}

export interface AIPlaylistPrompt {
  era: string;
  genre: string;
  artistType?: string;
  locationOrWeather: string;
  mood?: string;
  mediaFilter: 'all' | 'audio' | 'video';
  customPrompt?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  createdAt: string;
  isAiGenerated: boolean;
  aiPrompt?: AIPlaylistPrompt;
  aiReasoning?: Record<string, string>; // Explicación de la IA por cada item.id
  items: MediaItem[];
}

export interface OfflineMediaRecord {
  item: MediaItem;
  downloadedAt: string;
  sizeBytes: number;
}

export type AppView =
  | 'explore'
  | 'artists'
  | 'albums'
  | 'videos'
  | 'ai-curator'
  | 'playlists'
  | 'favorites'
  | 'offline';

export interface PlayerContextValue {
  // Catálogo e ítems
  catalog: MediaItem[];
  currentItem: MediaItem | null;
  queue: MediaItem[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  // Modos especiales de visualización y contexto
  showLinerNotes: boolean;
  showVideoOverlay: boolean;
  silentFilmVisualizer: boolean;
  audioOnlyMode: boolean;
  // Acciones de reproducción
  playItem: (item: MediaItem, newQueue?: MediaItem[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setShowLinerNotes: (show: boolean) => void;
  setShowVideoOverlay: (show: boolean) => void;
  setSilentFilmVisualizer: (enabled: boolean) => void;
  setAudioOnlyMode: (enabled: boolean) => void;
  // Biblioteca personal (Favoritos y Playlists)
  favoriteIds: string[];
  toggleFavorite: (item: MediaItem) => void;
  isFavorite: (id: string) => boolean;
  playlists: Playlist[];
  createPlaylist: (name: string, description: string, initialItems?: MediaItem[], aiMeta?: { isAiGenerated?: boolean; aiPrompt?: AIPlaylistPrompt; aiReasoning?: Record<string, string> }) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  addItemToPlaylist: (playlistId: string, item: MediaItem) => void;
  removeItemFromPlaylist: (playlistId: string, itemId: string) => void;
  playPlaylist: (playlist: Playlist) => void;
  // Modo Offline y Descargas
  offlineRecords: OfflineMediaRecord[];
  downloadingIds: string[];
  isOfflineDownloaded: (id: string) => boolean;
  downloadForOffline: (item: MediaItem) => Promise<void>;
  removeOfflineDownload: (id: string) => Promise<void>;
  getEffectiveStreamUrl: (item: MediaItem) => Promise<string>;
  isOnline: boolean;
}
