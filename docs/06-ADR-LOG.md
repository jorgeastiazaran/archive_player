# Registro de Decisiones de Arquitectura (ADR Log) — Archive Player

Este registro sirve como **memoria institucional contra el drift**. Ningún agente debe revertir o contradecir estas decisiones sin una solicitud explícita del usuario.

---

## ADR-001: Estrategia Web Primero → App Móvil Nativa (Android/iOS)
* **Fecha:** 2026-11-08
* **Estado:** Aceptado
* **Contexto:** El usuario desea validar primero la UX con un prototipo ágil (Fase 1), pero el objetivo final es una aplicación móvil para Android e iOS con soporte multiusuario (Fase 2).
* **Decisión:**
  * Construir la Fase 1 en **React + TypeScript + Tailwind CSS**, aislando el 100% de la lógica de proveedores (`src/services/providers/`), curaduría IA (`src/services/ai/`), descargas (`src/services/offline/`) y contratos (`src/types/media.ts`) fuera de los componentes visuales.
  * Diseñar la UI con navegación dual (Sidebar en escritorio, barra inferior táctil en móvil) e integrar `navigator.mediaSession`.
* **Consecuencia:** En la Fase 2, el proyecto puede compilarse directamente a Android/iOS con **Capacitor** o migrar vistas a React Native conservando intacto todo `src/services/` y `src/types/`.

---

## ADR-002: Arquitectura Híbrida de Datos (Internet Archive Live API + Catálogo Curado Verificado)
* **Fecha:** 2026-11-08
* **Estado:** Aceptado
* **Contexto:** `archive.org` ofrece millones de archivos abiertos, pero algunas consultas en vivo pueden tardar varios segundos o devolver ítems con metadatos incompletos.
* **Decisión:** Combinar un conector en tiempo real a `archive.org` (`internetArchive.ts`) con un catálogo base curado (`curatedCatalog.ts`) que incluye obras verificadas de Musopen, Free Music Archive, 78rpm Jazz y Cine Clásico en Dominio Público.
* **Consecuencia:** La app carga al instante en el primer segundo, garantiza demostraciones 100% funcionales incluso sin red, y permite buscar millones de obras adicionales en vivo cuando hay conexión.

---

## ADR-003: Almacenamiento Offline Local mediante IndexedDB + Descarga Directa
* **Fecha:** 2026-11-08
* **Estado:** Aceptado
* **Contexto:** El usuario requiere descarga de audio y video para reproducción sin conexión a internet desde el prototipo.
* **Decisión:** Usar `IndexedDB` (`offlineStorage.ts`) para almacenar tanto los metadatos como los binarios (`Blob`) cuando las políticas CORS del servidor de origen lo permiten, con reproducción desde `URL.createObjectURL(blob)` y opción adicional de descarga directa del archivo `.mp3`/`.mp4` al dispositivo.

---

## ADR-004: Gobernanza Multi-Agente con Separación Product Owner vs. Tech Lead
* **Fecha:** 2026-11-08
* **Estado:** Aceptado
* **Contexto:** Evitar que los agentes desarrolladores desvíen el alcance del producto o den por terminadas funciones incompletas.
* **Decisión:** Implementar el flujo de 5 puertas (`docs/05-MULTI-AGENT-WORKFLOW.md`) donde un agente `product-owner` de solo lectura evalúa cada hito contra `brief.md` y `docs/01-SPECIFICATION.md`.

