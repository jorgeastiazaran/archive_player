import { AIPlaylistPrompt, MediaItem, Playlist } from '../../types/media';
import { searchArchiveMedia } from '../providers/internetArchive';

export interface LocationWeatherPreset {
  id: string;
  label: string;
  icon: string;
  weather: string;
  location: string;
  suggestedMoods: string[];
}

export const ERA_OPTIONS: string[] = [
  'Todas las épocas',
  'Siglo XVIII-XIX (Clásica / Romántica)',
  '1900s-1920s (Era Acústica y Cine Mudo)',
  '1930s-1940s (Edad de Oro del Jazz y Swing)',
  '1950s-1960s (Cine Noir, Sci-Fi y Blues)',
  '2000s-Presente (Creative Commons / FMA Indie & Ambient)',
];

export const GENRE_OPTIONS: string[] = [
  'Todos',
  'Clásica y Piano',
  'Jazz & Swing 78rpm',
  'Blues & Folk Raíz',
  'Ambient & Electrónica (FMA)',
  'Cine Mudo & Experimental',
  'Cine Clásico & Animación',
];

export const LOCATION_WEATHER_PRESETS: LocationWeatherPreset[] = [
  {
    id: 'cdmx-rain',
    label: 'Tarde lluviosa en Ciudad de México',
    icon: 'CloudRain',
    weather: 'Lluvia suave y neblina urbana',
    location: 'Ciudad de México',
    suggestedMoods: ['Melancólico', 'Nostálgico', 'Enfoque Profundo'],
  },
  {
    id: 'paris-20s',
    label: 'Noche de café en París años 20',
    icon: 'Wine',
    weather: 'Noche despejada de otoño',
    location: 'París, Francia',
    suggestedMoods: ['Nostálgico', 'Cinematográfico', 'Energético'],
  },
  {
    id: 'desert-drive',
    label: 'Viaje nocturno por carretera desértica',
    icon: 'Compass',
    weather: 'Cielo estrellado y viento cálido',
    location: 'Ruta 66 / Desierto de Sonora',
    suggestedMoods: ['Cinematográfico', 'Enfoque Profundo', 'Melancólico'],
  },
  {
    id: 'kyoto-morning',
    label: 'Mañana soleada de estudio en Kioto',
    icon: 'Sun',
    weather: 'Luz matutina clara y brisa fresca',
    location: 'Kioto, Japón',
    suggestedMoods: ['Enfoque Profundo', 'Relajante'],
  },
  {
    id: 'ny-screening',
    label: 'Sala de proyección clásica en Nueva York',
    icon: 'Film',
    weather: 'Noche fría de invierno',
    location: 'Manhattan, Nueva York',
    suggestedMoods: ['Cinematográfico', 'Nostálgico', 'Energético'],
  },
];

export const MOOD_OPTIONS: string[] = [
  'Nostálgico',
  'Enfoque Profundo',
  'Melancólico',
  'Energético',
  'Cinematográfico',
  'Relajante',
];

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
}

function matchesEra(item: MediaItem, eraPrompt: string): boolean {
  if (!eraPrompt || eraPrompt === 'Todas las épocas') return true;
  const year = item.year ?? 0;
  const dec = item.decade.toLowerCase();

  if (eraPrompt.includes('XVIII-XIX')) {
    return dec.includes('xviii') || dec.includes('xix') || (year > 0 && year < 1900);
  }
  if (eraPrompt.includes('1900s-1920s')) {
    return dec.includes('1900') || dec.includes('1910') || dec.includes('1920') || (year >= 1900 && year <= 1929);
  }
  if (eraPrompt.includes('1930s-1940s')) {
    return dec.includes('1930') || dec.includes('1940') || (year >= 1930 && year <= 1949);
  }
  if (eraPrompt.includes('1950s-1960s')) {
    return dec.includes('1950') || dec.includes('1960') || (year >= 1950 && year <= 1969);
  }
  if (eraPrompt.includes('2000s')) {
    return dec.includes('2000') || dec.includes('2010') || dec.includes('2020') || year >= 2000 || item.source === 'fma';
  }
  return true;
}

function scoreMediaItem(item: MediaItem, prompt: AIPlaylistPrompt): number {
  let score = 10;

  if (prompt.mediaFilter !== 'all' && item.mediaType !== prompt.mediaFilter) {
    return -100;
  }

  if (matchesEra(item, prompt.era)) {
    score += 30;
  }

  const haystack = [
    item.title,
    item.artist,
    item.albumOrCollection,
    item.decade,
    item.historicalContext,
    item.region ?? '',
    ...item.genres,
    ...item.moods,
  ]
    .join(' ')
    .toLowerCase();

  if (prompt.genre && prompt.genre !== 'Todos') {
    const genreWords = extractKeywords(prompt.genre);
    for (const gw of genreWords) {
      if (haystack.includes(gw)) score += 18;
    }
  }

  if (prompt.mood) {
    const moodWords = extractKeywords(prompt.mood);
    for (const mw of moodWords) {
      if (haystack.includes(mw)) score += 20;
    }
  }

  if (prompt.locationOrWeather) {
    const preset = LOCATION_WEATHER_PRESETS.find((p) => p.label === prompt.locationOrWeather);
    if (preset) {
      for (const sm of preset.suggestedMoods) {
        if (item.moods.some((m) => m.toLowerCase().includes(sm.toLowerCase()))) {
          score += 14;
        }
      }
    }
    for (const lw of extractKeywords(prompt.locationOrWeather)) {
      if (haystack.includes(lw)) score += 10;
    }
  }

  if (prompt.artistType) {
    for (const aw of extractKeywords(prompt.artistType)) {
      if (haystack.includes(aw)) score += 15;
    }
  }

  if (prompt.customPrompt) {
    for (const cw of extractKeywords(prompt.customPrompt)) {
      if (haystack.includes(cw)) score += 16;
    }
  }

  return score;
}

function buildPlaylistTitle(prompt: AIPlaylistPrompt): string {
  const moodPart = prompt.mood || 'Nostálgico';
  const loc = prompt.locationOrWeather || 'Archivo Abierto';

  if (loc.includes('Ciudad de México')) return `Crónicas de Lluvia y Vinilo (${moodPart})`;
  if (loc.includes('París')) return `Ecos Bohemios de Medianoche: ${moodPart}`;
  if (loc.includes('carretera') || loc.includes('Desierto')) return `Horizonte Nocturno en 78 RPM`;
  if (loc.includes('Kioto')) return `Luz de Estudio y Partituras Abiertas`;
  if (loc.includes('Nueva York')) return `Celuloide y Terciopelo: Sesión ${moodPart}`;

  const genreClean = prompt.genre && prompt.genre !== 'Todos' ? prompt.genre.split('&')[0].trim() : 'Dominio Público';
  return `Frecuencia Abierta: ${genreClean} & ${moodPart}`;
}

function buildReasoningForItem(item: MediaItem, prompt: AIPlaylistPrompt): string {
  const reasons: string[] = [];
  if (matchesEra(item, prompt.era) && prompt.era !== 'Todas las épocas') {
    reasons.push(`representa auténticamente la estética de ${item.decade}`);
  }
  if (prompt.mood && item.moods.some((m) => m.toLowerCase().includes(prompt.mood!.toLowerCase()))) {
    reasons.push(`su atmósfera ${prompt.mood.toLowerCase()} armoniza con "${prompt.locationOrWeather}"`);
  }
  if (reasons.length === 0) {
    reasons.push(
      `su textura de ${item.genres.slice(0, 2).join(' y ')} (${item.license.label}) aporta contraste histórico para "${prompt.locationOrWeather || 'tu sesión'}"`
    );
  }
  return `Seleccionada porque ${reasons.join(' y ')}. Fuente verificada: ${item.sourceLabel}.`;
}

/**
 * Genera una playlist inteligente combinando el catálogo curado y consultas en vivo a Internet Archive.
 */
export async function generateSmartPlaylist(
  prompt: AIPlaylistPrompt,
  catalogPool: MediaItem[]
): Promise<Playlist> {
  let enrichedPool = [...catalogPool];

  const queryParts: string[] = [];
  if (prompt.genre && prompt.genre !== 'Todos') queryParts.push(prompt.genre.split('(')[0].trim());
  if (prompt.artistType) queryParts.push(prompt.artistType);
  if (prompt.customPrompt) queryParts.push(prompt.customPrompt);

  if (queryParts.length > 0) {
    try {
      const remoteItems = await searchArchiveMedia(queryParts.join(' '), prompt.mediaFilter);
      const existingIds = new Set(enrichedPool.map((i) => i.id));
      for (const remote of remoteItems.slice(0, 4)) {
        if (!existingIds.has(remote.id)) {
          enrichedPool.push(remote);
          existingIds.add(remote.id);
        }
      }
    } catch {
      // Modo resiliente: si archive.org no responde o no hay red, usamos el catálogo local
    }
  }

  const scored = enrichedPool
    .map((item) => ({ item, score: scoreMediaItem(item, prompt) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const selectedItems = (scored.length > 0 ? scored.slice(0, 8).map((s) => s.item) : catalogPool.slice(0, 6));

  const aiReasoning: Record<string, string> = {};
  for (const item of selectedItems) {
    aiReasoning[item.id] = buildReasoningForItem(item, prompt);
  }

  const title = buildPlaylistTitle(prompt).replace(/^recuencia/, 'Frecuencia');
  const description = [
    `Curaduría generada por IA para "${prompt.locationOrWeather || 'escucha inmersiva'}"`,
    prompt.era !== 'Todas las épocas' ? `enfocada en ${prompt.era}` : 'recorriendo múltiples décadas',
    prompt.genre !== 'Todos' ? `con énfasis en ${prompt.genre}` : 'en formato multimedia abierto',
    prompt.mood ? `bajo un pulso ${prompt.mood.toLowerCase()}.` : '.',
  ].join(', ');

  return {
    id: `ai-pl-${Date.now()}`,
    name: title,
    description,
    coverUrl: selectedItems[0]?.thumbnailUrl,
    createdAt: new Date().toISOString(),
    isAiGenerated: true,
    aiPrompt: prompt,
    aiReasoning,
    items: selectedItems,
  };
}
