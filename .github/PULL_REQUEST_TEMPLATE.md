## Descripción del Cambio
- **Hito / Tarea del Roadmap (`docs/04-ROADMAP.md`):**
- **Agente Responsable (`archive-data-dev` | `ai-media-dev` | `ui-ux-dev` | `tech-lead`):**

## Checklist Anti-Drift (Protocolo de 5 Puertas)
- [ ] **Puerta 1 (Contrato):** Respeta estrictamente `src/types/media.ts`.
- [ ] **Puerta 2 (Aislamiento):** Solo modifica archivos dentro del ámbito asignado.
- [ ] **Puerta 3 (QA Técnico):** Compila sin errores TypeScript (`tsc --noEmit`).
- [ ] **Puerta 4 (Product Owner):** Cumple criterios de UX, licencias abiertas y compatibilidad Web→Móvil.
- [ ] **Puerta 5 (Documentación):** `docs/04-ROADMAP.md` y/o `docs/06-ADR-LOG.md` actualizados.

