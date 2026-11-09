# Hoja de Ruta (Roadmap) — Archive Player

Este documento registra el progreso del desarrollo por fases. Los agentes deben actualizar las casillas (`[x]`) conforme se completen y verifiquen los módulos.

---

## Etapa 0: Estructura, Gobernanza Multi-Agente y Documentación Base
- [x] Definición del brief inicial ([`brief.md`](../brief.md))
- [x] Estructura de carpetas del proyecto y reglas de agentes ([`AGENTS.md`](../AGENTS.md))
- [x] Especificación funcional de la app ([`docs/01-SPECIFICATION.md`](./01-SPECIFICATION.md))
- [x] Diseño de arquitectura Web → Móvil ([`docs/02-ARCHITECTURE.md`](./02-ARCHITECTURE.md))
- [x] Guía de fuentes abiertas y APIs ([`docs/03-DATA-SOURCES.md`](./03-DATA-SOURCES.md))
- [x] Skill de agente para Internet Archive API ([`.agents/skills/archive-api/SKILL.md`](../.agents/skills/archive-api/SKILL.md))
- [x] Estructura de Equipo Multi-Agente y Workflow Anti-Drift de 5 Puertas ([`docs/05-MULTI-AGENT-WORKFLOW.md`](./05-MULTI-AGENT-WORKFLOW.md))
- [x] Registro de Decisiones de Arquitectura ([`docs/06-ADR-LOG.md`](./06-ADR-LOG.md))
- [x] Estructura de Git (`.git/`, `.gitignore`, `.gitattributes`, `.github/workflows/ci-anti-drift.yml`, `PULL_REQUEST_TEMPLATE.md`)

---

## Fase 1: Prototipo Web / PWA de Validación UX (Completado)

### Hito 1.1: Inicialización y Núcleo de Datos (`archive-data-dev`)
- [x] Inicializar proyecto con **Vite + React + TypeScript + Tailwind CSS**
- [x] Crear contratos e interfaces en [`src/types/media.ts`](../src/types/media.ts)
- [x] Construir el **Catálogo Curado de Respaldo** ([`src/data/curatedCatalog.ts`](../src/data/curatedCatalog.ts)) con 18 obras reales verificadas de `archive.org` (Clásica de Musopen/IMSLP, Jazz 78rpm, FMA Indie, Cine Mudo y Animación Clásica)
- [x] Implementar el conector en vivo `InternetArchiveProvider` ([`src/services/providers/internetArchive.ts`](../src/services/providers/internetArchive.ts))

### Hito 1.2: Reproductor Unificado Audio + Video + Contexto (`ai-media-dev` & `ui-ux-dev`)
- [x] Crear estado global [`PlayerContext.tsx`](../src/store/PlayerContext.tsx) (cola de reproducción, play/pause, seek, aleatorio, favoritos)
- [x] Desarrollar barra de reproducción persistente estilo Spotify ([`UnifiedPlayerBar.tsx`](../src/components/player/UnifiedPlayerBar.tsx)) con integración `MediaSession API`
- [x] Implementar visor de **Video integrado** (modo expandido, ventana flotante y cambio a solo-audio)
- [x] Implementar modo **"Visualizador de Cine Mudo"** opcional al reproducir pistas de audio
- [x] Crear panel lateral de **"Contexto Histórico / Liner Notes"** ([`LinerNotesDrawer.tsx`](../src/components/player/LinerNotesDrawer.tsx)) con insignia de licencia abierta y copiado de atribución

### Hito 1.3: Exploración, Organización y Biblioteca Personal (`ui-ux-dev`)
- [x] Vista **Explorar / Inicio** ([`ExploreView.tsx`](../src/components/catalog/ExploreView.tsx)) y vistas agrupadas por **Artista** y **Álbum/Obra** ([`ArtistsAlbumsView.tsx`](../src/components/catalog/ArtistsAlbumsView.tsx))
- [x] Buscador en tiempo real conectado a `archive.org` con filtros de Audio y Video ([`Header.tsx`](../src/components/layout/Header.tsx))
- [x] Gestión de **Mis Playlists** y **Favoritos (Me gusta)** persistidos en `localStorage` ([`LibraryAndOfflineView.tsx`](../src/components/library/LibraryAndOfflineView.tsx))

### Hito 1.4: Generador de Playlists con IA (`ai-media-dev` & `ui-ux-dev`)
- [x] Implementar motor [`playlistGenerator.ts`](../src/services/ai/playlistGenerator.ts) que analiza **Época + Género + Artista + Ubicación/Clima/Ánimo**
- [x] Diseñar interfaz interactiva **"Curador IA"** ([`AICuratorView.tsx`](../src/components/ai-dj/AICuratorView.tsx)) con selectores rápidos de época, clima/ubicación y prompt libre
- [x] Permitir guardar y reproducir las playlists generadas con notas explicativas (`aiReasoning`) de cada selección

### Hito 1.5: Descargas y Modo Offline (`ai-media-dev` & `ui-ux-dev`)
- [x] Implementar servicio [`offlineStorage.ts`](../src/services/offline/offlineStorage.ts) con `IndexedDB` para guardar archivos de audio/video en el dispositivo
- [x] Botón de descarga con indicador de estado (Descargando / Disponible Offline / Descarga directa a disco)
- [x] Vista **"Modo Offline / Descargas"** que funciona al 100% sin conexión a internet

---

## Fase 2: Escalamiento a App Móvil (Android/iOS) y Multiusuario (Siguiente Etapa)
- [ ] Integrar **Capacitor** (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`) para compilación nativa
- [ ] Configurar servicio de audio en segundo plano nativo y almacenamiento en sistema de archivos móvil
- [ ] Implementar backend multiusuario (Autenticación, perfiles de usuario y base de datos en la nube)
- [ ] Añadir **Playlists Públicas / Colaborativas** y enlaces para compartir
- [ ] Motor de recomendaciones colaborativo basado en afinidad entre usuarios similares
