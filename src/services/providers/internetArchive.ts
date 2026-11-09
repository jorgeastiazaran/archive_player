import { CURATED_CATALOG } from '../../data/curatedCatalog';
import { ArchiveSource, LicenseInfo, MediaItem, MediaType } from '../../types/media';

interface ArchiveSearchDoc {
  identifier: string;
  title?: string;
  creator?: string | string[];
  year?: number | string;
  mediatype?: string;
  description?: string | string[];
  licenseurl?: string;
  collection?: string | string[];
}

interface ArchiveSearchResponse {
  response?: {
    docs?: ArchiveSearchDoc[];
  };
}

interface ArchiveMetadataFile {
  name: string;
  format?: string;
  title?: string;
  track?: string;
  length?: string;
  source?: string;
}

interface ArchiveItemMetadata {
  identifier?: string;
  title?: string;
  creator?: string | string[];
  year?: string | number;
  date?: string;
  mediatype?: string;
  description?: string | string[];
  licenseurl?: string;
  collection?: string | string[];
}

interface ArchiveMetadataResponse {
  metadata?: ArchiveItemMetadata;
  files?: ArchiveMetadataFile[];
}

/**
 * Codifica cada segmento de un nombre de archivo de archive.org respetando posibles subdirectorios.
 */
function encodeArchiveFilePath(fileName: string): string {
  return fileName
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/**
 * Normaliza el campo `creator` o `description` que archive.org puede devolver como string o arreglo.
 */
function normalizeTextField(value: string | string[] | undefined, fallback: string): string {
  if (!value) return fallback;
  if (Array.isArray(value)) {
    const joined = value.filter(Boolean).join(', ').trim();
    return joined || fallback;
  }
  const trimmed = String(value).trim();
  return trimmed || fallback;
}

/**
 * Limpia etiquetas HTML básicas presentes en las descripciones de Internet Archive.
 */
function stripHtmlTags(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convierte duraciones de archive.org ("03:24", "1:02:15" o "204.5") a segundos enteros.
 */
function parseDurationSeconds(lengthStr?: string): number | undefined {
  if (!lengthStr) return undefined;
  const trimmed = lengthStr.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Math.round( parseFloat(trimmed) );
  }
  const parts = trimmed.split(':').map((part) => parseFloat(part));
  if (parts.some((n) => Number.isNaN(n))) return undefined;
  if (parts.length === 2) {
    return Math.round(parts[0] * 60 + parts[1]);
  }
  if (parts.length === 3) {
    return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  }
  return undefined;
}

/**
 * Extrae el año numérico y la década (ej. "1920s") a partir de `year` o `date`.
 */
function parseYearAndDecade(rawYear?: string | number, rawDate?: string): { year?: number; decade: string } {
  const candidate = rawYear ?? rawDate;
  if (candidate !== undefined) {
    const match = String(candidate).match(/\b(1[6-9]\d{2}|20\d{2})\b/);
    if (match) {
      const parsedYear = parseInt(match[1], 10);
      const decadeStart = Math.floor(parsedYear / 10) * 10;
      return { year: parsedYear, decade: `${decadeStart}s` };
    }
  }
  return { year: undefined, decade: 'Clásico' };
}

/**
 * Detecta la fuente curada según las colecciones de Internet Archive.
 */
function resolveArchiveSource(collections?: string | string[]): { source: ArchiveSource; sourceLabel: string } {
  const list = Array.isArray(collections)
    ? collections.map((c) => c.toLowerCase())
    : collections
    ? [collections.toLowerCase()]
    : [];

  if (list.some((c) => c.includes('freemusicarchive') || c.includes('fma'))) {
    return { source: 'fma', sourceLabel: 'Free Music Archive' };
  }
  if (list.some((c) => c.includes('musopen'))) {
    return { source: 'musopen', sourceLabel: 'Musopen (via Archive)' };
  }
  if (list.some((c) => c.includes('imslp'))) {
    return { source: 'imslp', sourceLabel: 'IMSLP (via Archive)' };
  }
  if (list.some((c) => c.includes('78rpm') || c.includes('georgeblood'))) {
    return { source: 'open_music_archive', sourceLabel: 'Great 78 Project / Archive' };
  }
  if (list.some((c) => c.includes('prelinger') || c.includes('nfb'))) {
    return { source: 'nfb', sourceLabel: 'Prelinger / NFB Archive' };
  }
  if (list.some((c) => c.includes('silent_films') || c.includes('publicdomain'))) {
    return { source: 'public_domain_review', sourceLabel: 'Public Domain Cinema' };
  }
  return { source: 'internet_archive', sourceLabel: 'Internet Archive' };
}

/**
 * Normaliza la URL de licencia de archive.org al contrato `LicenseInfo`.
 */
function normalizeLicense(licenseUrl: string | undefined, title: string, artist: string): LicenseInfo {
  const lower = (licenseUrl || '').toLowerCase();

  if (lower.includes('zero/1.0') || lower.includes('cc0')) {
    return {
      code: 'CC0',
      label: 'Dominio Público (CC0 1.0)',
      url: licenseUrl || 'https://creativecommons.org/publicdomain/zero/1.0/',
      attributionText: `${title} — ${artist}. Dedicado al Dominio Público (CC0 1.0) vía Internet Archive.`,
    };
  }
  if (lower.includes('publicdomain')) {
    return {
      code: 'PUBLIC_DOMAIN',
      label: 'Dominio Público (PDM 1.0)',
      url: licenseUrl || 'https://creativecommons.org/publicdomain/mark/1.0/',
      attributionText: `${title} — ${artist}. Obra en el Dominio Público preservada por Internet Archive.`,
    };
  }
  if (lower.includes('by-nc')) {
    return {
      code: 'CC-BY-NC',
      label: 'Creative Commons BY-NC',
      url: licenseUrl,
      attributionText: `"${title}" por ${artist}. Licencia Creative Commons Reconocimiento-NoComercial (${licenseUrl}) vía Internet Archive.`,
    };
  }
  if (lower.includes('by-sa')) {
    return {
      code: 'CC-BY-SA',
      label: 'Creative Commons BY-SA',
      url: licenseUrl,
      attributionText: `"${title}" por ${artist}. Licencia Creative Commons Reconocimiento-CompartirIgual (${licenseUrl}) vía Internet Archive.`,
    };
  }
  if (lower.includes('by/')) {
    return {
      code: 'CC-BY',
      label: 'Creative Commons BY',
      url: licenseUrl,
      attributionText: `"${title}" por ${artist}. Licencia Creative Commons Reconocimiento (${licenseUrl}) vía Internet Archive.`,
    };
  }

  return {
    code: 'PUBLIC_DOMAIN',
    label: 'Archivo Abierto / Dominio Público',
    url: licenseUrl || 'https://archive.org/about/terms.php',
    attributionText: `${title} — ${artist}. Preservado y distribuido abiertamente por Internet Archive (archive.org).`,
  };
}

/**
 * Filtra coincidencias locales en `CURATED_CATALOG` para respuesta inmediata o respaldo.
 */
function filterCuratedCatalog(
  query: string,
  mediaFilter: 'all' | 'audio' | 'video'
): MediaItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return CURATED_CATALOG.filter((item) => {
    if (mediaFilter !== 'all' && item.mediaType !== mediaFilter) {
      return false;
    }
    if (terms.length === 0) return true;

    const haystack = [
      item.title,
      item.artist,
      item.albumOrCollection,
      item.decade,
      item.region || '',
      item.historicalContext,
      ...item.genres,
      ...item.moods,
    ]
      .join(' ')
      .toLowerCase();

    return terms.some((term) => haystack.includes(term));
  });
}

/**
 * Consulta `https://archive.org/metadata/{identifier}` y extrae todas las pistas `.mp3`
 * o videos `.mp4` de ese álbum u obra como un arreglo normalizado de `MediaItem[]`.
 */
export async function fetchArchiveItemTracks(identifier: string): Promise<MediaItem[]> {
  const cleanId = identifier.trim();
  if (!cleanId) return [];

  try {
    const endpoint = `https://archive.org/metadata/${encodeURIComponent(cleanId)}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status} al obtener metadata de ${cleanId}`);
    }

    const data = (await response.json()) as ArchiveMetadataResponse;
    const meta = data.metadata || {};
    const files = data.files || [];

    const itemTitle = meta.title || cleanId;
    const artist = normalizeTextField(meta.creator, 'Artista de Archivo');
    const rawDescription = normalizeTextField(
      meta.description,
      `Registro histórico preservado en Internet Archive bajo el identificador "${cleanId}".`
    );
    const cleanedDescription = stripHtmlTags(rawDescription).slice(0, 420);
    const { year, decade } = parseYearAndDecade(meta.year, meta.date);
    const { source, sourceLabel } = resolveArchiveSource(meta.collection);
    const thumbnailUrl = `https://archive.org/services/img/${encodeURIComponent(cleanId)}`;
    const sourcePageUrl = `https://archive.org/details/${encodeURIComponent(cleanId)}`;

    const isMovieMediatype =
      meta.mediatype === 'movies' ||
      meta.mediatype === 'video';

    // 1. Filtrar archivos de video MP4 compatibles con HTML5 <video>
    const allMp4Files = files.filter((f) => f.name && f.name.toLowerCase().endsWith('.mp4'));
    const preferredMp4Files = allMp4Files.filter((f) => !f.name.toLowerCase().includes('.ia.mp4'));
    const videoFiles = preferredMp4Files.length > 0 ? preferredMp4Files : allMp4Files;

    // 2. Filtrar archivos de audio MP3 (evitando duplicados _vbr.mp3 si existen originales)
    const allMp3Files = files.filter((f) => f.name && f.name.toLowerCase().endsWith('.mp3'));
    const nonVbrMp3Files = allMp3Files.filter((f) => !f.name.toLowerCase().endsWith('_vbr.mp3'));
    const audioFiles = nonVbrMp3Files.length > 0 ? nonVbrMp3Files : allMp3Files;

    const results: MediaItem[] = [];

    if (isMovieMediatype && videoFiles.length > 0) {
      // Para películas/cortos, priorizar el archivo _512kb.mp4 o el primer MP4 reproducible
      const bestVideo =
        videoFiles.find((f) => f.name.toLowerCase().includes('512kb.mp4')) || videoFiles[0];
      const fileUrl = `https://archive.org/download/${encodeURIComponent(cleanId)}/${encodeArchiveFilePath(bestVideo.name)}`;
      const trackTitle = bestVideo.title || itemTitle;

      results.push({
        id: `ia-video-${cleanId}`,
        archiveIdentifier: cleanId,
        title: trackTitle,
        artist,
        albumOrCollection: itemTitle,
        mediaType: 'video',
        streamUrl: fileUrl,
        downloadUrl: fileUrl,
        thumbnailUrl,
        durationSeconds: parseDurationSeconds(bestVideo.length),
        year,
        decade,
        genres: ['Cine de Archivo', 'Dominio Público'],
        moods: ['Clásico', 'Vintage'],
        source,
        sourceLabel,
        sourcePageUrl,
        license: normalizeLicense(meta.licenseurl, trackTitle, artist),
        historicalContext: cleanedDescription,
      });

      return results;
    }

    if (audioFiles.length > 0) {
      audioFiles.slice(0, 24).forEach((file, index) => {
        const fileUrl = `https://archive.org/download/${encodeURIComponent(cleanId)}/${encodeArchiveFilePath(file.name)}`;
        const cleanFileName = file.name
          .split('/')
          .pop()
          ?.replace(/\.mp3$/i, '')
          .replace(/[_-]+/g, ' ')
          .trim();
        const trackTitle = file.title || cleanFileName || `${itemTitle} (Pista ${index + 1})`;

        results.push({
          id: `ia-audio-${cleanId}-${index}`,
          archiveIdentifier: cleanId,
          title: trackTitle,
          artist,
          albumOrCollection: itemTitle,
          mediaType: 'audio',
          streamUrl: fileUrl,
          downloadUrl: fileUrl,
          thumbnailUrl,
          durationSeconds: parseDurationSeconds(file.length),
          year,
          decade,
          genres: ['Archivo Sonoro', sourceLabel],
          moods: ['Enfoque', 'Clásico'],
          source,
          sourceLabel,
          sourcePageUrl,
          license: normalizeLicense(meta.licenseurl, trackTitle, artist),
          historicalContext: cleanedDescription,
        });
      });

      return results;
    }

    // Si no era mediatype movies pero sí tiene archivos MP4
    if (videoFiles.length > 0) {
      const bestVideo = videoFiles[0];
      const fileUrl = `https://archive.org/download/${encodeURIComponent(cleanId)}/${encodeArchiveFilePath(bestVideo.name)}`;
      const trackTitle = bestVideo.title || itemTitle;

      results.push({
        id: `ia-video-${cleanId}`,
        archiveIdentifier: cleanId,
        title: trackTitle,
        artist,
        albumOrCollection: itemTitle,
        mediaType: 'video',
        streamUrl: fileUrl,
        downloadUrl: fileUrl,
        thumbnailUrl,
        durationSeconds: parseDurationSeconds(bestVideo.length),
        year,
        decade,
        genres: ['Video de Archivo'],
        moods: ['Curioso', 'Vintage'],
        source,
        sourceLabel,
        sourcePageUrl,
        license: normalizeLicense(meta.licenseurl, trackTitle, artist),
        historicalContext: cleanedDescription,
      });
    }

    return results;
  } catch {
    // Fallback resiliente si falla la red: buscar coincidencia en el catálogo curado
    return CURATED_CATALOG.filter(
      (item) => item.archiveIdentifier.toLowerCase() === cleanId.toLowerCase()
    );
  }
}

/**
 * Construye una expresión de búsqueda avanzada para `advancedsearch.php` siguiendo la guía archive-api.
 */
function buildAdvancedSearchQuery(
  query: string,
  mediaFilter: 'all' | 'audio' | 'video'
): string {
  const sanitized = query.replace(/[()"']/g, ' ').trim();
  const audioClause =
    'mediatype:(audio) AND (collection:(freemusicarchive) OR collection:(78rpm) OR collection:(musopen) OR collection:(audio_music) OR collection:(opensource_audio))';
  const videoClause =
    'mediatype:(movies) AND (collection:(feature_films) OR collection:(silent_films) OR collection:(animationandcartoons) OR collection:(prelinger))';

  const typeClause =
    mediaFilter === 'audio'
      ? `(${audioClause})`
      : mediaFilter === 'video'
      ? `(${videoClause})`
      : `((${audioClause}) OR (${videoClause}))`;

  if (!sanitized) {
    return typeClause;
  }

  return `${typeClause} AND (${sanitized})`;
}

/**
 * Busca obras de audio y/o video en `https://archive.org/advancedsearch.php`,
 * resolviendo sus archivos reproducibles reales (`.mp3` / `.mp4`) y combinando
 * coincidencias de `CURATED_CATALOG` para ofrecer velocidad y resiliencia ante fallos de red.
 */
export async function searchArchiveMedia(
  query: string,
  mediaFilter: 'all' | 'audio' | 'video' = 'all',
  limit = 16
): Promise<MediaItem[]> {
  const curatedMatches = filterCuratedCatalog(query, mediaFilter);

  // Si la consulta está vacía y tenemos suficientes ítems curados, devolvemos de inmediato si se pide pocos
  const fullQuery = buildAdvancedSearchQuery(query, mediaFilter);
  const rowsToFetch = Math.min(Math.max(limit, 10), 20);

  const params = new URLSearchParams({
    q: fullQuery,
    output: 'json',
    rows: String(rowsToFetch),
    page: '1',
  });

  const fields = [
    'identifier',
    'title',
    'creator',
    'year',
    'mediatype',
    'description',
    'licenseurl',
    'collection',
  ];
  fields.forEach((field) => params.append('fl[]', field));
  params.append('sort[]', 'downloads desc');

  try {
    const response = await fetch(`https://archive.org/advancedsearch.php?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status} al consultar advancedsearch.php`);
    }

    const data = (await response.json()) as ArchiveSearchResponse;
    const docs = data.response?.docs ?? [];

    // Resolver en paralelo los primeros documentos para obtener sus pistas .mp3 o .mp4 verificadas
    const docsToResolve = docs.slice(0, Math.min(docs.length, 8));
    const resolvedTracksSettled = await Promise.allSettled(
      docsToResolve.map(async (doc): Promise<MediaItem | null> => {
        const tracks = await fetchArchiveItemTracks(doc.identifier);
        if (tracks.length > 0) {
          const primaryTrack = tracks[0];
          const mediaType: MediaType = doc.mediatype === 'movies' ? 'video' : primaryTrack.mediaType;
          return {
            ...primaryTrack,
            title: doc.title || primaryTrack.title,
            mediaType,
          };
        }
        return null;
      })
    );

    const remoteItems: MediaItem[] = [];
    for (const outcome of resolvedTracksSettled) {
      if (outcome.status === 'fulfilled' && outcome.value !== null) {
        remoteItems.push(outcome.value);
      }
    }

    // Combinar coincidencias curadas y resultados en vivo de archive.org sin duplicar archiveIdentifier
    const seenIdentifiers = new Set<string>();
    const combined: MediaItem[] = [];

    for (const item of [...curatedMatches, ...remoteItems]) {
      const key = item.archiveIdentifier.toLowerCase();
      if (!seenIdentifiers.has(key)) {
        seenIdentifiers.add(key);
        combined.push(item);
      }
      if (combined.length >= limit) break;
    }

    if (combined.length > 0) {
      return combined.slice(0, limit);
    }

    // Si la búsqueda no arrojó coincidencias exactas, devolver respaldo del catálogo filtrado por tipo
    return filterCuratedCatalog('', mediaFilter).slice(0, limit);
  } catch {
    // Resiliencia total offline / fallo de API: retornar coincidencias del catálogo curado local
    if (curatedMatches.length > 0) {
      return curatedMatches.slice(0, limit);
    }
    return filterCuratedCatalog('', mediaFilter).slice(0, limit);
  }
}
