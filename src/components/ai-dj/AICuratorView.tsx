import React, { useState } from 'react';
import {
  Sparkles,
  CloudRain,
  MapPin,
  Clock,
  Music,
  Film,
  Play,
  BookmarkPlus,
  Check,
  Loader2,
  Wand2,
  ShieldCheck,
} from 'lucide-react';
import type { AIPlaylistPrompt, Playlist } from '../../types/media';
import { usePlayer } from '../../store/PlayerContext';
import {
  ERA_OPTIONS,
  GENRE_OPTIONS,
  LOCATION_WEATHER_PRESETS,
  MOOD_OPTIONS,
  generateSmartPlaylist,
} from '../../services/ai/playlistGenerator';

export const AICuratorView: React.FC = () => {
  const { catalog, playlists, playPlaylist, playItem, createPlaylist } = usePlayer();

  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string>(
    LOCATION_WEATHER_PRESETS[0]?.label || 'Tarde lluviosa en Ciudad de México'
  );
  const [customLocationWeather, setCustomLocationWeather] = useState<string>('');
  const [era, setEra] = useState<string>(ERA_OPTIONS[0]);
  const [genre, setGenre] = useState<string>(GENRE_OPTIONS[0]);
  const [artistType, setArtistType] = useState<string>('Todos');
  const [mood, setMood] = useState<string>(MOOD_OPTIONS[0]);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'audio' | 'video'>('all');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<Playlist | null>(
    () => playlists.find((p) => p.isAiGenerated) || null
  );
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const effectiveLocation = customLocationWeather.trim() || selectedPresetLabel;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setSavedNotice(false);

    const prompt: AIPlaylistPrompt = {
      era,
      genre,
      artistType: artistType === 'Todos' ? undefined : artistType,
      locationOrWeather: effectiveLocation,
      mood,
      mediaFilter,
      customPrompt: customPrompt.trim() || undefined,
    };

    try {
      const playlist = await generateSmartPlaylist(prompt, catalog);
      setGeneratedPlaylist(playlist);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedPlaylist) return;
    createPlaylist(
      generatedPlaylist.name,
      generatedPlaylist.description,
      generatedPlaylist.items,
      {
        isAiGenerated: true,
        aiPrompt: generatedPlaylist.aiPrompt,
        aiReasoning: generatedPlaylist.aiReasoning,
      }
    );
    setSavedNotice(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Cabecera del Curador IA */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-950/35 via-zinc-900 to-emerald-950/25 border border-amber-500/30 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Archive DJ • Curaduría Contextual
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
            Generador de Playlists por Clima, Época y Ubicación
          </h2>
          <p className="text-sm text-zinc-300/90 leading-relaxed">
            Combina tu entorno climático o geográfico con décadas históricas y géneros abiertos.
            El motor cruza el catálogo verificado con consultas en vivo a Internet Archive.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Formulario de parámetros contextuales */}
        <form
          onSubmit={handleGenerate}
          className="xl:col-span-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 p-6 space-y-5"
        >
          {/* 1. Ubicación y Clima */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5" />
              1. Ubicación y Atmósfera Climática
            </label>
            <div className="grid grid-cols-1 gap-2">
              {LOCATION_WEATHER_PRESETS.map((preset) => {
                const active =
                  !customLocationWeather.trim() && selectedPresetLabel === preset.label;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCustomLocationWeather('');
                      setSelectedPresetLabel(preset.label);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 font-semibold'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <p>{preset.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {preset.location} • {preset.weather}
                      </p>
                    </div>
                    <MapPin
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-amber-400' : 'text-zinc-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={customLocationWeather}
              onChange={(e) => setCustomLocationWeather(e.target.value)}
              placeholder="O escribe tu ciudad y clima (ej. Noche de niebla en Bogotá)..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* 2. Época y Género */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Época / Década
              </label>
              <select
                value={era}
                onChange={(e) => setEra(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
              >
                {ERA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                Género / Colección
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
              >
                {GENRE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2.5 Tipo de Artista / Creador */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Tipo de Artista / Creador
            </label>
            <select
              value={artistType}
              onChange={(e) => setArtistType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
            >
              {[
                'Todos',
                'Compositor Clásico (Chopin, Debussy, Beethoven, Bach, Satie, Vivaldi)',
                'Pioneros del Jazz & Swing (Louis Armstrong, Duke Ellington, Django Reinhardt)',
                'Solistas de Blues & Raíz (Blind Willie Johnson)',
                'Creadores Indie & Ambient CC (Broke For Free, Kai Engel)',
                'Directores de Cine Clásico y Silente (Georges Méliès, Buster Keaton, Romero, Fleischer)',
              ].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Estado de Ánimo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              Estado de Ánimo Principal
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    mood === m
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Formato Multimedia y Prompt Libre */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              Formato Multimedia
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Audio + Cine' },
                { id: 'audio', label: 'Solo Audio' },
                { id: 'video', label: 'Solo Cine' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setMediaFilter(fmt.id as 'all' | 'audio' | 'video')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    mediaFilter === fmt.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/45'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Instrucción Libre Opcional (Prompt)
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ej. Piano romántico nocturno, violonchelo barroco o películas mudas de ciencia ficción..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Curando sesión desde el archivo...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generar Playlist con IA</span>
              </>
            )}
          </button>
        </form>

        {/* Resultado de la Playlist generada con explicación IA por pista */}
        <div className="xl:col-span-7">
          {generatedPlaylist ? (
            <div className="rounded-3xl bg-zinc-900/80 border border-amber-500/30 p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Curaduría Generada por IA • {generatedPlaylist.items.length} Obras
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-100 pt-1">
                    {generatedPlaylist.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {generatedPlaylist.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => playPlaylist(generatedPlaylist)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-zinc-950" />
                    <span>Reproducir Playlist</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToLibrary}
                    disabled={savedNotice}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {savedNotice ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Guardada en Mis Playlists</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4" />
                        <span>Guardar en Mis Playlists</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Pistas y explicación de la IA (aiReasoning) */}
              <div className="space-y-3">
                {generatedPlaylist.items.map((item, index) => {
                  const reason =
                    generatedPlaylist.aiReasoning?.[item.id] ||
                    `Seleccionada por su afinidad estética con ${item.decade} (${item.license.label}).`;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-zinc-950/75 border border-zinc-800/80 hover:border-amber-500/35 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono text-amber-400 font-bold w-5">
                            #{index + 1}
                          </span>
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-11 h-11 rounded-xl object-cover bg-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-100 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">
                              {item.artist} • {item.year || item.decade}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-[10px] text-emerald-300 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            {item.license.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => playItem(item, generatedPlaylist.items)}
                            className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 transition-colors cursor-pointer"
                            title="Reproducir esta obra"
                          >
                            {item.mediaType === 'video' ? (
                              <Film className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 fill-current" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Nota de razonamiento del Curador IA */}
                      <div className="pl-8 text-[11px] text-amber-200/85 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
