# Lineamientos para Agentes de IA — Archive Player

Este archivo (`AGENTS.md`) es cargado automáticamente por los agentes de desarrollo al trabajar en este repositorio. Define las reglas de arquitectura, estilo de código, flujo de trabajo y restricciones del proyecto **Archive Player**.

---

## 1. Contexto del Proyecto
**Archive Player** es una plataforma de streaming multimedia (audio y video) 100% abierta, inspirada en la UX de Spotify/Netflix pero alimentada por archivos de dominio público y Creative Commons (principalmente **Internet Archive / archive.org**, Musopen, Free Music Archive, Public Domain Review, etc.).

* **Fase Actual:** **Fase 1 — Prototipo Web / PWA** enfocado en validar la UX, reproducción unificada de audio/video, generador de playlists por IA (época, género, artista, ubicación/clima), contexto histórico/licencias y descarga offline local.
* **Meta Final (Fase 2):** Aplicación móvil nativa/híbrida (**Android / iOS**) con arquitectura multiusuario, playlists públicas y sincronización en la nube.

---

## 2. Mapa de Documentación Obligatoria
Antes de proponer cambios arquitectónicos o implementar nuevas funcionalidades, consulta los documentos en `docs/`:

* [`brief.md`](./brief.md) — Brief original e idea conceptual del proyecto.
* [`docs/01-SPECIFICATION.md`](./docs/01-SPECIFICATION.md) — Especificación funcional, módulos de UX y criterios de aceptación.
* [`docs/02-ARCHITECTURE.md`](./docs/02-ARCHITECTURE.md) — Arquitectura técnica, modelos de datos (`MediaItem`, `Playlist`), diseño Web-to-Mobile y almacenamiento offline.
* [`docs/03-DATA-SOURCES.md`](./docs/03-DATA-SOURCES.md) — Especificación de conectores de contenido abierto (API de `archive.org`, colecciones y licencias).
* [`docs/04-ROADMAP.md`](./docs/04-ROADMAP.md) — Hoja de ruta y estado actual de las tareas (debe mantenerse actualizado al completar hitos).
* [`docs/05-MULTI-AGENT-WORKFLOW.md`](./docs/05-MULTI-AGENT-WORKFLOW.md) — **Estructura del Equipo Multi-Agente (Tech Lead, Product Owner, Desarrolladores, QA) y Protocolo Anti-Drift de 5 Puertas**.
* [`docs/06-ADR-LOG.md`](./docs/06-ADR-LOG.md) — Registro de Decisiones de Arquitectura (memoria contra el drift técnico).

---

## 3. Reglas de Arquitectura (Web → Mobile Ready)
Como el prototipo inicia en Web pero escalará a **Android e iOS**:
1. **Separación estricta de UI y Lógica de Negocio:**
   * Toda la lógica de conexión a APIs (`src/services/providers/`), generación de playlists IA (`src/services/ai/`), estado global (`src/store/`) y almacenamiento offline (`src/services/offline/`) debe ser **agnóstica del DOM** en la medida de lo posible para reutilizarse íntegra en React Native o empaquetarse vía Capacitor.
2. **Patrón de Proveedores (Media Providers):**
   * Nunca acoples los componentes de UI directamente al formato JSON crudo de `archive.org`.
   * Todo proveedor externo debe transformar su respuesta al modelo normalizado `MediaItem` y `MediaCollection` definidos en `src/types/media.ts`.
3. **Resiliencia y Catálogo de Respaldo (Fallback):**
   * Las APIs públicas como `archive.org` pueden tener latencia variable o metadatos incompletos.
   * Siempre implementa un **catálogo curado de respaldo local** (`src/data/curatedCatalog.ts`) con URLs verificadas de audio y video de `archive.org` para garantizar que la UX del prototipo funcione al instante y sin fallos en demostraciones.
4. **Diseño Mobile-First y Touch-Friendly:**
   * La interfaz debe funcionar tanto en escritorio (con sidebar estilo Spotify) como en pantallas móviles (con barra de navegación inferior, reproductor minimizable y controles táctiles de al menos `44x44px`).

---

## 4. Estándares de Código y Estilo
* **Lenguaje:** TypeScript estricto (`strict: true`). Evitar el uso de `any`; definir interfaces claras en `src/types/`.
* **Estilos:** Tailwind CSS con paleta oscura (*Dark Mode* por defecto, estética tipo sala de escucha / cine clásico moderno con acentos cálidos/ámbar o esmeralda).
* **Componentes:** Funcionales en React, modulares, de menos de 250 líneas por archivo. Si un componente crece demasiado, extraer subcomponentes o custom hooks en `src/hooks/`.
* **Idioma:**
  * Interfaz de usuario (UI), textos visibles, comentarios explicativos y documentación: **Español**.
  * Nombres de variables, funciones, tipos, archivos y commits: **Inglés** (`camelCase` para variables/funciones, `PascalCase` para componentes/tipos).

---

## 5. Flujo de Trabajo para los Agentes
1. **Consultar primero:** Leer `docs/01-SPECIFICATION.md` y `docs/04-ROADMAP.md` antes de iniciar una tarea grande.
2. **Cambios incrementales y verificables:** Construir y verificar que el proyecto compile sin errores de TypeScript (`npm run build` o `tsc --noEmit`) después de cada cambio importante.
3. **Actualizar documentación:** Cuando se complete una funcionalidad de `docs/04-ROADMAP.md` o se modifique el modelo de datos en `src/types/`, reflejar el cambio en `docs/`.
4. **Respeto a derechos de autor y licencias:** Mostrar siempre la fuente original (`archive.org`, Musopen, etc.) y el tipo de licencia (Dominio Público / Creative Commons) en la ficha de cada obra.

