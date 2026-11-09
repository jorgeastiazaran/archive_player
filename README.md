# Archive Player 📻🎬

Plataforma de streaming multimedia (música y video) **100% abierta**, diseñada con la fluidez de Spotify/MUBI y conectada al patrimonio cultural libre de **Internet Archive (`archive.org`)**, **Musopen**, **Free Music Archive (FMA)**, **Open Music Archive (78rpm)** y archivos de cine de dominio público.

---

## 📚 Documentación del Proyecto

| Documento | Propósito |
| :--- | :--- |
| [`brief.md`](./brief.md) | Idea original, alcance conceptual y listado de repositorios culturales. |
| [`AGENTS.md`](./AGENTS.md) | **Reglas para Agentes de IA**: estándares de código, arquitectura y flujo de trabajo. |
| [`docs/01-SPECIFICATION.md`](./docs/01-SPECIFICATION.md) | **Especificación Funcional**: módulos de UX, reproductor dual Audio/Video, playlists IA y modo offline. |
| [`docs/02-ARCHITECTURE.md`](./docs/02-ARCHITECTURE.md) | **Arquitectura Técnica**: estructura de carpetas, modelo `MediaItem` y estrategia Web → Móvil (Android/iOS). |
| [`docs/03-DATA-SOURCES.md`](./docs/03-DATA-SOURCES.md) | **Fuentes de Datos y APIs**: integración con `archive.org`, colecciones y licencias libres. |
| [`docs/04-ROADMAP.md`](./docs/04-ROADMAP.md) | **Hoja de Ruta**: checklist de hitos para la Fase 1 (Prototipo UX) y Fase 2 (App Móvil Multiusuario). |
| [`.agents/skills/archive-api/SKILL.md`](./.agents/skills/archive-api/SKILL.md) | **Skill Técnico para Agentes**: recetas de consulta y resolución de streaming en `archive.org`. |

---

## 🗂️ Estructura del Espacio de Trabajo

```text
archive_player/
├── AGENTS.md                        # Instrucciones automáticas para agentes
├── README.md                        # Índice general del proyecto
├── brief.md                         # Brief inicial
├── docs/                            # Especificaciones y arquitectura
├── .agents/skills/archive-api/      # Skill especializado en la API de Internet Archive
├── public/                          # Recursos estáticos
└── src/                             # Código fuente (React + TypeScript + Tailwind)
    ├── types/                       # Modelos de datos (MediaItem, Playlist, LicenseInfo)
    ├── data/                        # Catálogo curado de respaldo (Audio y Video verificados)
    ├── services/                    # Lógica desacoplada (Web & Mobile ready)
    │   ├── providers/               # Conectores a archive.org y repositorios abiertos
    │   ├── ai/                      # Motor de Playlists IA (época, género, ubicación/clima)
    │   └── offline/                 # Descargas y caché local en IndexedDB
    ├── store/                       # Estado global del reproductor y biblioteca
    └── components/                  # Interfaz de usuario modular
```

---

## 🚀 Fases de Desarrollo

1. **Fase 1 — Prototipo Web / PWA (Validación UX):**
   * Organización por Artista y Álbum/Obra.
   * Reproductor unificado de **Audio y Video** (con modo Picture-in-Picture, visualizador de cine mudo y panel de contexto histórico/licencias).
   * **Generador de Playlists con IA** basado en época, género, artista y ubicación/clima.
   * **Modo Offline** con descarga real en el dispositivo (`IndexedDB` + descarga directa).
2. **Fase 2 — Escalamiento a App Móvil (Android/iOS) y Multiusuario:**
   * Empaquetado nativo móvil vía Capacitor / React Native reutilizando `src/services/` y `src/types/`.
   * Autenticación, perfiles, playlists públicas y recomendaciones colaborativas.

