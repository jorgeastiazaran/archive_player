# Guía de Fuentes de Datos Abiertas y APIs — Archive Player

Este documento describe cómo **Archive Player** se conecta a repositorios culturales abiertos para obtener música y video 100% libres de regalías o bajo licencias abiertas.

---

## 1. Fuente Primaria en Vivo: Internet Archive (`archive.org`)
**Internet Archive** no requiere API Key para consultas públicas de lectura ni para el streaming directo de archivos `.mp3` y `.mp4`, y cuenta con encabezados CORS habilitados. Además, aloja colecciones espejo de *Free Music Archive*, *Musopen*, *78rpm*, *Prelinger Archives* y cine clásico de dominio público.

### 1.1. Endpoint de Búsqueda Avanzada (`advancedsearch.php`)
Permite buscar por tipo de medio (`mediatype:audio` o `mediatype:movies`), colección, creador, año o palabras clave:

```text
https://archive.org/advancedsearch.php?q={QUERY}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year&fl[]=mediatype&fl[]=description&fl[]=subject&fl[]=licenseurl&sort[]=downloads+desc&rows=25&page=1&output=json
```

* **Colecciones de Audio recomendadas (`collection:`):**
  * `freemusicarchive` — Free Music Archive (Indie, Electrónica, Instrumental, Folk bajo Creative Commons).
  * `78rpm` — Grabaciones históricas en discos de 78 rpm (Jazz temprano, Blues, Clásica, años 1900–1950).
  * `musopen` / `audio_music` — Grabaciones de música clásica y dominio público.
  * `etree` — Live Music Archive (Conciertos en vivo autorizados por los artistas).
* **Colecciones de Video recomendadas (`collection:`):**
  * `feature_films` — Películas clásicas de largometraje en dominio público (Noir, Sci-Fi, Clásicos de Hollywood).
  * `silent_films` — Cine mudo histórico (Chaplin, Keaton, Méliès, expresionismo).
  * `animationandcartoons` — Animación clásica de los años 1920–1950 (Fleischer Studios, primeros cortos animados).
  * `prelinger` — Prelinger Archives (Documentales efímeros, historia cotidiana e industrial del siglo XX).

### 1.2. Endpoint de Metadatos y Archivos de un Ítem (`metadata/{identifier}`)
Una vez obtenido el `identifier` de una obra, se consultan sus archivos reproducibles:

```text
https://archive.org/metadata/{identifier}
```

* **Resolución de URL de Streaming / Descarga:**
  1. De la lista `files` en la respuesta JSON, buscar:
     * Para **Audio**: archivos con `format === "VBR MP3"` o nombre terminado en `.mp3`.
     * Para **Video**: archivos con `format === "512Kb MPEG4"`, `"h.264"` o nombre terminado en `.mp4`.
  2. Construir la URL directa:
     ```text
     https://archive.org/download/{identifier}/{filename}
     ```
  3. **Portada / Miniatura:**
     ```text
     https://archive.org/services/img/{identifier}
     ```

---

## 2. Ecosistema de Fuentes Especializadas (Mapeadas en el Catálogo)

| Fuente | Tipo | Integración en Fase 1 | Licencia Típica |
| :--- | :--- | :--- | :--- |
| **Internet Archive (`archive.org`)** | Audio & Video | API en vivo + Streaming directo | Dominio Público / CC |
| **Free Music Archive (FMA)** | Música (16 géneros) | Vía colección `freemusicarchive` en `archive.org` + Catálogo curado | CC-BY / CC0 |
| **Musopen** | Música Clásica | Vía colección en `archive.org` + grabaciones curadas | Dominio Público (CC0) |
| **Open Music Archive / 78rpm** | Grabaciones históricas | Vía colección `78rpm` en `archive.org` | Dominio Público |
| **Public Domain Review / Movies** | Cine Clásico y Silente | Vía colecciones `feature_films` y `silent_films` en `archive.org` | Dominio Público |
| **National Film Board (NFB) / UbuWeb** | Documental y Arte | Referencias curadas y documentales abiertos | Abierto / Educativo |

---

## 3. Reglas de Higiene de Datos para los Agentes
1. **Filtrado de Archivos Derivados:** En `archive.org/metadata/{id}`, un álbum puede contener múltiples pistas `.mp3` individuales. El conector debe agrupar todas las pistas `.mp3` de un mismo `identifier` como pistas de un **Álbum/Obra** en lugar de mostrar sólo el primer archivo.
2. **Validación de Duración y Formato:** Ignorar archivos de metadatos (`.xml`, `.sqlite`, `.torrent`, `_thumb.jpg`) al construir la lista de reproducción.
3. **Fallback Inmediato:** Si el usuario no tiene internet o una consulta específica a la API tarda más de 6 segundos, la app debe responder fluidamente apoyándose en el catálogo curado y las pistas guardadas en caché local.

