---
name: archive-api
description: >-
  Guía técnica y recetas de código para consultar la API pública de Internet Archive
  (archive.org), resolver archivos reproducibles de audio (MP3) y video (MP4),
  extraer álbumes multipista y normalizar licencias Creative Commons / Dominio Público.
  Activar cuando se trabaje en conectores de datos, búsquedas o streaming multimedia.
---

# Skill: Integración con Internet Archive (`archive.org`)

Usa esta guía siempre que implementes o depures consultas a `archive.org` dentro de **Archive Player**.

## 1. Búsqueda Avanzada (`advancedsearch.php`)

### Construcción de Queries
* **Solo Audio musical (excluyendo audiolibros hablados o podcasts rotos):**
  ```text
  mediatype:(audio) AND (collection:(freemusicarchive) OR collection:(78rpm) OR collection:(musopen) OR collection:(audio_music))
  ```
* **Solo Películas y Cortos de Dominio Público:**
  ```text
  mediatype:(movies) AND (collection:(feature_films) OR collection:(silent_films) OR collection:(animationandcartoons) OR collection:(prelinger))
  ```

### Ejemplo de Fetch en TypeScript
```typescript
export async function searchInternetArchive(
  query: string,
  mediaType: 'audio' | 'video' | 'all' = 'all',
  rows = 20
) {
  const typeFilter =
    mediaType === 'audio'
      ? 'mediatype:(audio)'
      : mediaType === 'video'
      ? 'mediatype:(movies)'
      : '(mediatype:(audio) OR mediatype:(movies))';

  const fullQuery = `${typeFilter} AND (${query})`;
  const params = new URLSearchParams({
    q: fullQuery,
    output: 'json',
    rows: String(rows),
    page: '1',
  });

  ['identifier', 'title', 'creator', 'year', 'mediatype', 'description', 'licenseurl', 'collection'].forEach(
    (field) => params.append('fl[]', field)
  );
  params.append('sort[]', 'downloads desc');

  const res = await fetch(`https://archive.org/advancedsearch.php?${params.toString()}`);
  if (!res.ok) throw new Error(`Error HTTP ${res.status} al consultar archive.org`);
  const data = await res.json();
  return data.response?.docs ?? [];
}
```

---

## 2. Resolución de Archivos Reproducibles (`metadata/{identifier}`)

Un ítem en `archive.org` contiene múltiples archivos derivados. Para obtener las URLs de streaming reales:

```typescript
export async function resolveArchiveFiles(identifier: string) {
  const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`);
  if (!res.ok) throw new Error(`No se pudo obtener metadata de ${identifier}`);
  const data = await res.json();
  const files: Array<{ name: string; format?: string; title?: string; track?: string; length?: string }> =
    data.files || [];

  // Para Audio: priorizar VBR MP3 o .mp3
  const audioFiles = files.filter(
    (f) => f.name.toLowerCase().endsWith('.mp3') && !f.name.endsWith('_vbr.mp3')
  );

  // Para Video: priorizar 512Kb MPEG4 / h.264 (.mp4) compatibles con HTML5 <video>
  const videoFiles = files.filter(
    (f) => f.name.toLowerCase().endsWith('.mp4') && !f.name.includes('.ia.mp4')
  );

  return {
    metadata: data.metadata,
    audioUrls: audioFiles.map((f) => ({
      title: f.title || f.name.replace(/\.mp3$/i, ''),
      url: `https://archive.org/download/${identifier}/${encodeURIComponent(f.name)}`,
      duration: f.length,
    })),
    videoUrls: videoFiles.map((f) => ({
      title: f.title || data.metadata?.title || identifier,
      url: `https://archive.org/download/${identifier}/${encodeURIComponent(f.name)}`,
      duration: f.length,
    })),
    thumbnailUrl: `https://archive.org/services/img/${identifier}`,
  };
}
```

---

## 3. Buenas Prácticas y Casos Borde
1. **Codificación de nombres de archivo:** Muchos archivos en `archive.org` tienen espacios o caracteres especiales en `f.name`. Usa siempre `encodeURIComponent(f.name)` (o codifica por segmento de ruta si `f.name` incluye subcarpetas `/`).
2. **Normalización de `creator`:** El campo `creator` en `archive.org` puede venir como `string` o como `string[]`. Normalízalo siempre con `Array.isArray(creator) ? creator.join(', ') : (creator || 'Artista Desconocido')`.
3. **Detección de Licencia:** Analiza `licenseurl`:
   * Si contiene `publicdomain` o `zero/1.0` -> `PUBLIC_DOMAIN` / `CC0`.
   * Si contiene `by-nc` -> `CC-BY-NC`.
   * Si contiene `by-sa` -> `CC-BY-SA`.
   * Si contiene `by/` -> `CC-BY`.

