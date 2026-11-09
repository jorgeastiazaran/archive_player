import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CURATED_CATALOG } from '../data/curatedCatalog';
import {
  getOfflineMediaBlobUrl,
  listOfflineMediaRecords,
  removeOfflineMedia,
  saveMediaOffline,
} from '../services/offline/offlineStorage';
import {
  AIPlaylistPrompt,
  MediaItem,
  OfflineMediaRecord,
  PlayerContextValue,
  Playlist,
} from '../types/media';

const FAVORITES_STORAGE_KEY = 'archive_player_favorites_v1';
const PLAYLISTS_STORAGE_KEY = 'archive_player_playlists_v1';

function buildDefaultPlaylists(catalog: MediaItem[]): Playlist[] {
  const rainyItems = catalog.filter((i) =>
    ['musopen-chopin-nocturne-op9-no2', 'musopen-debussy-clair-de-lune', 'imslp-satie-gymnopedie-no1', 'fma-kai-engel-moonlight-reprise'].includes(i.id)
  );
  const vintageItems = catalog.filter((i) =>
    ['oma-armstrong-st-james-infirmary', 'oma-django-minor-swing', 'oma-ellington-the-mooche', 'video-melies-voyage-dans-la-lune'].includes(i.id)
  );

  return [
    {
      id: 'default-ai-rainy-cdmx',
      name: 'Crónicas de Lluvia y Piano Nocturno',
      description: 'Curaduría IA para una tarde lluviosa: nocturnos del siglo XIX e impresionismo minimalista en dominio público.',
      coverUrl: rainyItems[0]?.thumbnailUrl,
      createdAt: new Date().toISOString(),
      isAiGenerated: true,
      aiPrompt: {
        era: 'Siglo XVIII-XIX (Clásica / Romántica)',
        genre: 'Clásica y Piano',
        locationOrWeather: 'Tarde lluviosa en Ciudad de México',
        mood: 'Melancólico',
        mediaFilter: 'audio',
      },
      aiReasoning: Object.fromEntries(
        rainyItems.map((item) => [
          item.id,
          `Elegida por su timbre íntimo de piano y atmósfera ${item.moods[0]?.toLowerCase() || 'nocturna'}, ideal para acompañar la lluvia (${item.license.label}).`,
        ])
      ),
      items: rainyItems,
    },
    {
      id: 'default-ai-paris-20s',
      name: 'Ecos de 78 RPM y Celuloide en París',
      description: 'Viaje sonoro y visual a los años 1900-1930: jazz temprano en goma laca y pioneros del cine silente.',
      coverUrl: vintageItems[0]?.thumbnailUrl,
      createdAt: new Date().toISOString(),
      isAiGenerated: true,
      aiPrompt: {
        era: '1900s-1920s (Era Acústica y Cine Mudo)',
        genre: 'Jazz & Swing 78rpm',
        locationOrWeather: 'Noche de café en París años 20',
        mood: 'Nostálgico',
        mediaFilter: 'all',
      },
      aiReasoning: Object.fromEntries(
        vintageItems.map((item) => [
          item.id,
          `Seleccionada como joya histórica de ${item.decade} preservada en ${item.sourceLabel} bajo ${item.license.label}.`,
        ])
      ),
      items: vintageItems,
    },
  ];
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<MediaItem[]>(CURATED_CATALOG);
  const [currentItem, setCurrentItem] = useState<MediaItem | null>(CURATED_CATALOG[0] ?? null);
  const [queue, setQueue] = useState<MediaItem[]>(CURATED_CATALOG);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(CURATED_CATALOG[0]?.durationSeconds ?? 0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const [showLinerNotes, setShowLinerNotes] = useState<boolean>(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState<boolean>(false);
  const [silentFilmVisualizer, setSilentFilmVisualizer] = useState<boolean>(false);
  const [audioOnlyMode, setAudioOnlyMode] = useState<boolean>(false);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : ['musopen-chopin-nocturne-op9-no2', 'oma-django-minor-swing'];
    } catch {
      return [];
    }
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const raw = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Playlist[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback a playlists predeterminadas
    }
    return buildDefaultPlaylists(CURATED_CATALOG);
  });

  const [offlineRecords, setOfflineRecords] = useState<OfflineMediaRecord[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldUseInternalAudio = !currentItem || currentItem.mediaType === 'audio' || audioOnlyMode || !showVideoOverlay;
  const shouldUseInternalAudioRef = useRef<boolean>(shouldUseInternalAudio);
  const currentTimeRef = useRef<number>(currentTime);

  useEffect(() => {
    shouldUseInternalAudioRef.current = shouldUseInternalAudio;
  }, [shouldUseInternalAudio]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch { /* ignorar quota */ }
  }, [favoriteIds]);

  useEffect(() => {
    try {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    } catch { /* ignorar quota */ }
  }, [playlists]);

  useEffect(() => {
    listOfflineMediaRecords().then(setOfflineRecords).catch(() => {});
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const getEffectiveStreamUrl = useCallback(async (item: MediaItem): Promise<string> => {
    const blobUrl = await getOfflineMediaBlobUrl(item.id);
    return blobUrl || item.streamUrl;
  }, []);

  const nextTrack = useCallback(() => {
    if (!currentItem || queue.length === 0) return;
    if (repeatMode === 'one') {
      setCurrentTime(0);
      if (audioRef.current && shouldUseInternalAudioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
      return;
    }
    if (isShuffle && queue.length > 1) {
      const candidates = queue.filter((i) => i.id !== currentItem.id);
      const randomItem = candidates[Math.floor(Math.random() * candidates.length)] ?? queue[0];
      setCurrentItem(randomItem);
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }
    const idx = queue.findIndex((i) => i.id === currentItem.id);
    const nextIdx = idx + 1;
    if (nextIdx < queue.length) {
      setCurrentItem(queue[nextIdx]);
      setCurrentTime(0);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setCurrentItem(queue[0]);
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [currentItem, queue, repeatMode, isShuffle]);

  const prevTrack = useCallback(() => {
    if (!currentItem || queue.length === 0) return;
    if (currentTime > 4) {
      setCurrentTime(0);
      if (audioRef.current && shouldUseInternalAudioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }
    const idx = queue.findIndex((i) => i.id === currentItem.id);
    const prevIdx = idx > 0 ? idx - 1 : queue.length - 1;
    setCurrentItem(queue[prevIdx]);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [currentItem, queue, currentTime]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      if (shouldUseInternalAudioRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const handleEnded = () => {
      if (shouldUseInternalAudioRef.current) {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [nextTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentItem) return;
    let cancelled = false;
    setDuration(currentItem.durationSeconds ?? 0);

    getEffectiveStreamUrl(currentItem).then((resolvedUrl) => {
      if (cancelled) return;
      if (audio.src !== resolvedUrl) {
        audio.src = resolvedUrl;
        audio.load();
      }
      if (shouldUseInternalAudio) {
        if (Math.abs(audio.currentTime - currentTimeRef.current) > 1.5) {
          audio.currentTime = currentTimeRef.current;
        }
        if (isPlaying) {
          audio.play().catch(() => setIsPlaying(false));
        } else {
          audio.pause();
        }
      } else {
        audio.pause();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentItem, getEffectiveStreamUrl, shouldUseInternalAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && shouldUseInternalAudio) {
      if (Math.abs(audio.currentTime - currentTimeRef.current) > 1.5) {
        audio.currentTime = currentTimeRef.current;
      }
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, shouldUseInternalAudio]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.max(0, Math.min(1, volume));
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !currentItem) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentItem.title,
        artist: currentItem.artist,
        album: currentItem.albumOrCollection,
        artwork: [{ src: currentItem.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' }],
      });
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    } catch { /* ignorar navegadores sin soporte completo */ }
  }, [currentItem, prevTrack, nextTrack]);

  const playItem = useCallback((item: MediaItem, newQueue?: MediaItem[]) => {
    setCatalog((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
    if (newQueue && newQueue.length > 0) setQueue(newQueue);
    setCurrentItem(item);
    setCurrentTime(0);
    setIsPlaying(true);
    if (item.mediaType === 'video' && !audioOnlyMode) {
      setShowVideoOverlay(true);
    }
  }, [audioOnlyMode]);

  const togglePlay = useCallback(() => setIsPlaying((prev) => !prev), []);

  const seekTo = useCallback((seconds: number) => {
    const clamped = Math.max(0, seconds);
    setCurrentTime(clamped);
    if (audioRef.current && shouldUseInternalAudioRef.current) {
      audioRef.current.currentTime = clamped;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(Math.max(0, Math.min(1, vol)));
    if (vol > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);
  const toggleShuffle = useCallback(() => setIsShuffle((s) => !s), []);
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'));
  }, []);

  const toggleFavorite = useCallback((item: MediaItem) => {
    setCatalog((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
    setFavoriteIds((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  const createPlaylist = useCallback(
    (
      name: string,
      description: string,
      initialItems: MediaItem[] = [],
      aiMeta?: { isAiGenerated?: boolean; aiPrompt?: AIPlaylistPrompt; aiReasoning?: Record<string, string> }
    ): Playlist => {
      const newPl: Playlist = {
        id: `pl-${Date.now()}`,
        name,
        description,
        coverUrl: initialItems[0]?.thumbnailUrl,
        createdAt: new Date().toISOString(),
        isAiGenerated: Boolean(aiMeta?.isAiGenerated),
        aiPrompt: aiMeta?.aiPrompt,
        aiReasoning: aiMeta?.aiReasoning,
        items: initialItems,
      };
      setPlaylists((prev) => [newPl, ...prev]);
      return newPl;
    },
    []
  );

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  }, []);

  const addItemToPlaylist = useCallback((playlistId: string, item: MediaItem) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.items.some((i) => i.id === item.id)
          ? { ...p, items: [...p.items, item], coverUrl: p.coverUrl || item.thumbnailUrl }
          : p
      )
    );
  }, []);

  const removeItemFromPlaylist = useCallback((playlistId: string, itemId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, items: p.items.filter((i) => i.id !== itemId) } : p))
    );
  }, []);

  const playPlaylist = useCallback((playlist: Playlist) => {
    if (playlist.items.length === 0) return;
    setQueue(playlist.items);
    setCurrentItem(playlist.items[0]);
    setCurrentTime(0);
    setIsPlaying(true);
    if (playlist.items[0].mediaType === 'video' && !audioOnlyMode) {
      setShowVideoOverlay(true);
    }
  }, [audioOnlyMode]);

  const isOfflineDownloaded = useCallback(
    (id: string) => offlineRecords.some((r) => r.item.id === id),
    [offlineRecords]
  );

  const downloadForOffline = useCallback(async (item: MediaItem) => {
    setDownloadingIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    try {
      const record = await saveMediaOffline(item);
      setOfflineRecords((prev) => [record, ...prev.filter((r) => r.item.id !== item.id)]);
    } finally {
      setDownloadingIds((prev) => prev.filter((id) => id !== item.id));
    }
  }, []);

  const removeOfflineDownload = useCallback(async (id: string) => {
    await removeOfflineMedia(id);
    setOfflineRecords((prev) => prev.filter((r) => r.item.id !== id));
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      catalog,
      currentItem,
      queue,
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
      playItem,
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
      favoriteIds,
      toggleFavorite,
      isFavorite,
      playlists,
      createPlaylist,
      deletePlaylist,
      addItemToPlaylist,
      removeItemFromPlaylist,
      playPlaylist,
      offlineRecords,
      downloadingIds,
      isOfflineDownloaded,
      downloadForOffline,
      removeOfflineDownload,
      getEffectiveStreamUrl,
      isOnline,
    }),
    [
      catalog, currentItem, queue, isPlaying, currentTime, duration, volume, isMuted,
      isShuffle, repeatMode, showLinerNotes, showVideoOverlay, silentFilmVisualizer,
      audioOnlyMode, playItem, togglePlay, nextTrack, prevTrack, seekTo, setVolume,
      toggleMute, toggleShuffle, cycleRepeatMode, favoriteIds, toggleFavorite,
      isFavorite, playlists, createPlaylist, deletePlaylist, addItemToPlaylist,
      removeItemFromPlaylist, playPlaylist, offlineRecords, downloadingIds,
      isOfflineDownloaded, downloadForOffline, removeOfflineDownload,
      getEffectiveStreamUrl, isOnline,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer debe utilizarse dentro de un PlayerProvider');
  }
  return ctx;
}
