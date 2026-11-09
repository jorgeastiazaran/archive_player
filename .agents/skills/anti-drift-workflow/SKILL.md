---
name: anti-drift-workflow
description: >-
  Protocolo de orquestación multi-agente (Tech Lead, Product Owner, Desarrolladores
  Especialistas y QA Auditor) y flujo de trabajo de 5 puertas para evitar el drift
  arquitectónico o funcional en Archive Player. Activar al coordinar sprints,
  tareas en paralelo o auditorías de calidad.
---

# Skill: Orquestación Multi-Agente y Control Anti-Drift

Sigue este procedimiento siempre que el usuario solicite desarrollar un nuevo módulo, iterar funcionalidades en paralelo o auditar el estado del proyecto.

## 1. Equipo de Subagentes Especializados
Si los subagentes aún no están definidos en la conversación actual, regístralos con `define_subagent` siguiendo `docs/05-MULTI-AGENT-WORKFLOW.md`:
* `product-owner` (`EnableWriteTools: false`): Evalúa el producto contra `brief.md` y `docs/01-SPECIFICATION.md`.
* `archive-data-dev` (`EnableWriteTools: true`): Dueño exclusivo de `src/data/**` y `src/services/providers/**`.
* `ai-media-dev` (`EnableWriteTools: true`): Dueño exclusivo de `src/services/ai/**`, `src/services/offline/**`, `src/store/**` y `src/hooks/**`.
* `ui-ux-dev` (`EnableWriteTools: true`): Dueño exclusivo de `src/components/**`, `src/App.tsx` y `src/index.css`.
* `qa-auditor` (`EnableWriteTools: true`): Verifica integración de contratos, compilación y sincronización de documentación.

## 2. Ejecución del Ciclo de 5 Puertas (5-Gate Anti-Drift Loop)
1. **Gate 1 (Contract Lock):** El Tech Lead revisa y actualiza `src/types/media.ts` antes de delegar.
2. **Gate 2 (Parallel Dispatch):** Invoca a los especialistas en paralelo indicando explícitamente qué archivos tienen permitido tocar y qué archivos tienen prohibido modificar.
3. **Gate 3 (QA Technical Gate):** Verifica que todos los imports, exports y tipos coincidan sin errores.
4. **Gate 4 (Product Owner Evaluation):** Invoca a `product-owner` para que audite la entrega frente a los criterios de aceptación del usuario. Si reporta brechas, corrígelas antes de presentar al usuario.
5. **Gate 5 (Documentation Sync):** Actualiza `docs/04-ROADMAP.md` y `docs/06-ADR-LOG.md`.

