# Backlog

Lista de trabajo priorizada. Refleja el estado del repo a fecha **2026-05-27**.

Origen inicial: análisis previo en `analysis-bugs-glm.md` (ya borrado tras migrar aquí) + huecos identificados al escribir la documentación.

## Convenciones

- **P0** = bloqueante / seguridad / bug visible al usuario. Atacar ya.
- **P1** = degradación importante o deuda urgente.
- **P2** = mejora útil, no urgente.
- **P3** = nice-to-have / refactor.
- **Origen:** quién lo identificó (`glm-analysis` = del análisis previo, `docs-pass` = encontrado al documentar, `prd-XXX` = surgió del PRD).

Para empezar a trabajar una entrada: muévela a `work/in-progress/<slug>.md` con un archivo más detallado.

---

## 🔴 P0 — atacar ya

| #   | Tarea                                                                                                                                                 | Origen       | Refs                                                                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Mover deps de servidor fuera de `package.json` raíz** (`express`, `cors`, `firebase-admin`, `firebase-functions`) — bloatean el bundle del cliente. | glm-analysis | [`package.json`](../package.json)                                                                                                                                                                                                              |
| 2   | **API REST sin auth** — `invoker: public`. Decidir e implementar auth (probablemente API key por Site). Necesita ADR.                                 | glm-analysis | [PRD 005](../docs/prd/005-public-rest-api.md), [security.md](../docs/engineering/security.md)                                                                                                                                                  |
| 3   | **`text-red-50` invisible en `MediaField`** — debe ser `text-red-500`.                                                                                | glm-analysis | [`src/components/screens/Content/common/MediaField.tsx:145`](../src/components/screens/Content/common/MediaField.tsx)                                                                                                                          |
| 4   | **`Array.sort()` mutante en render** en `ContentForm` y `ContentTable`. Usar `[...fields].sort(…)`.                                                   | glm-analysis | [`src/components/screens/Content/common/ContentForm.tsx:105`](../src/components/screens/Content/common/ContentForm.tsx), [`src/components/screens/Content/List/ContentTable.tsx:146`](../src/components/screens/Content/List/ContentTable.tsx) |
| 5   | **`<>` sin `key` en map de breadcrumbs** — warning de React.                                                                                          | glm-analysis | [`src/components/layout/Layout.tsx:49-70`](../src/components/layout/Layout.tsx)                                                                                                                                                                |
| 6   | **Escribir `firestore.rules` y `storage.rules` explícitas** y desplegarlas.                                                                           | glm-analysis | [security.md](../docs/engineering/security.md)                                                                                                                                                                                                 |

## 🟠 P1 — urgentes pero no bloqueantes

| #   | Tarea                                                                                              | Origen                  | Refs                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 7   | **Code splitting con `React.lazy`** + `<Suspense>` por ruta. Bundle hoy ~1MB.                      | glm-analysis            | [`src/App.tsx`](../src/App.tsx)                                                                                                            |
| 8   | **`MenuSidebar` usa `modelService.getAll()`** (cross-site) — debe ser `getBySite(currentSite.id)`. | glm-analysis            | [`src/components/layout/MenuSidebar.tsx:33`](../src/components/layout/MenuSidebar.tsx)                                                     |
| 9   | **Crear `ProtectedRoute` wrapper** y eliminar el patrón repetido en App.tsx.                       | glm-analysis            | [`src/App.tsx`](../src/App.tsx)                                                                                                            |
| 10  | **Sincronizar tipo `Field`** entre frontend y functions (`showInList` falta en backend).           | glm-analysis, docs-pass | [`functions/src/services/contentService.ts`](../functions/src/services/contentService.ts) vs [`src/types/model.ts`](../src/types/model.ts) |
| 11  | **`listAll()` en Media no escala** — migrar a paginación real con `list(opts)`.                    | glm-analysis            | [`src/components/screens/Media/index.tsx:65`](../src/components/screens/Media/index.tsx)                                                   |
| 12  | **Site fetching secuencial** — paralelizar con `Promise.all` en `getUserSites`.                    | glm-analysis            | [`src/lib/siteService.ts:60-71`](../src/lib/siteService.ts)                                                                                |
| 13  | **Pantalla "no tienes acceso a ningún sitio"** para usuarios válidos sin `siteUser`.               | docs-pass               | [PRD 001](../docs/prd/001-multi-site.md)                                                                                                   |
| 14  | **UI para gestionar Sites y SiteUsers** desde el admin (hoy se hace en Firestore a mano).          | docs-pass               | [PRD 001](../docs/prd/001-multi-site.md)                                                                                                   |
| 15  | **Decidir idioma de UI** (ES vs EN vs i18n) y unificar.                                            | glm-analysis, docs-pass | [i18n.md](../docs/design/i18n.md)                                                                                                          |

## 🟡 P2 — mejoras útiles

| #   | Tarea                                                                                      | Origen       | Refs                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 16  | **Añadir Error Boundary** global.                                                          | glm-analysis | [`src/App.tsx`](../src/App.tsx)                                                                                         |
| 17  | **Catch-all route 404** (`<Route path="*">`).                                              | glm-analysis | [`src/App.tsx`](../src/App.tsx)                                                                                         |
| 18  | **`window.confirm` en borrado de Media** → `AlertDialog`.                                  | glm-analysis | [`src/components/screens/Media/index.tsx:178`](../src/components/screens/Media/index.tsx)                               |
| 19  | **`NumberField` con `.min(0)`** rechaza negativos — corregir.                              | glm-analysis | [`src/components/screens/Content/common/ContentForm.tsx:63`](../src/components/screens/Content/common/ContentForm.tsx)  |
| 20  | **Limpiar dead code y dependency warning** en `SiteContext`.                               | glm-analysis | [`src/context/SiteContext.tsx`](../src/context/SiteContext.tsx)                                                         |
| 21  | **Resolver `@ts-expect-error`** en `ContentForm` (tipos de schema zod dinámico).           | glm-analysis | [`src/components/screens/Content/common/ContentForm.tsx:182`](../src/components/screens/Content/common/ContentForm.tsx) |
| 22  | **Migrar `functions/` a pnpm.**                                                            | glm-analysis | [`functions/package.json`](../functions/package.json)                                                                   |
| 23  | **Avatar de usuario:** dejar de cachear como base64 en Firestore, usar `photoURL` directo. | glm-analysis | [`src/lib/userService.ts`](../src/lib/userService.ts)                                                                   |
| 24  | **No-data caching:** evaluar TanStack Query (ADR).                                         | glm-analysis | [performance.md](../docs/engineering/performance.md)                                                                    |

## 🟢 P3 — refactor / nice-to-have

| #   | Tarea                                                                                                | Origen                  | Refs                                                                                                                                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 25  | **Tipos compartidos** entre frontend y functions (monorepo o package shared). Requiere ADR.          | glm-analysis, docs-pass | —                                                                                                                                                                                                                                            |
| 26  | **Unificar `ContentLayout` y `ModelsLayout`** en un `SidebarListLayout`.                             | glm-analysis            | [`src/components/screens/Content/common/ContentLayout.tsx`](../src/components/screens/Content/common/ContentLayout.tsx), [`src/components/screens/Models/common/ModelsLayout.tsx`](../src/components/screens/Models/common/ModelsLayout.tsx) |
| 27  | **`Layout.tsx` y `MenuSidebar.tsx` usan `export default`** — alinear a named exports.                | glm-analysis            | —                                                                                                                                                                                                                                            |
| 28  | **`src/components/screens/` vs `.clinerules` (`src/screens/`):** decidir y unificar.                 | glm-analysis, docs-pass | [conventions.md](../docs/engineering/conventions.md)                                                                                                                                                                                         |
| 29  | **Dashboard placeholder** — datos hardcoded ("Sesiones activas: 1"). Simplificar o llenar de verdad. | glm-analysis            | [`src/components/screens/Dashboard/index.tsx`](../src/components/screens/Dashboard/index.tsx)                                                                                                                                                |
| 30  | **Dark mode toggle UI** (los tokens ya existen).                                                     | glm-analysis            | [ui-guidelines.md](../docs/design/ui-guidelines.md)                                                                                                                                                                                          |
| 31  | **Tests:** infraestructura mínima (Vitest + emulador Firebase). Empezar por API.                     | glm-analysis            | [testing.md](../docs/engineering/testing.md)                                                                                                                                                                                                 |
| 32  | **Logo de site:** dejar de embeber base64 en Firestore, usar Storage.                                | docs-pass               | [data-model.md](../docs/architecture/data-model.md)                                                                                                                                                                                          |
| 33  | **CI/CD:** GitHub Action que despliegue a Firebase en merge a `main`.                                | docs-pass               | [deployment.md](../docs/operations/deployment.md)                                                                                                                                                                                            |
| 34  | **Webhooks** para invalidación de cache del consumidor.                                              | docs-pass               | [roadmap.md](../docs/product/roadmap.md)                                                                                                                                                                                                     |
| 35  | **Borrador / preview** para `ContentItem`.                                                           | docs-pass               | [PRD 003](../docs/prd/003-content-crud.md)                                                                                                                                                                                                   |
| 36  | **Roles dentro de un Site** (admin/editor/lector).                                                   | docs-pass               | [roadmap.md](../docs/product/roadmap.md)                                                                                                                                                                                                     |
| 37  | **Versionado de la API** (`/api/v1/`) antes del primer breaking change.                              | docs-pass               | [PRD 005](../docs/prd/005-public-rest-api.md)                                                                                                                                                                                                |
| 38  | **Tipo de campo `reference`** (link a otro ContentItem).                                             | docs-pass               | [roadmap.md](../docs/product/roadmap.md)                                                                                                                                                                                                     |

---

## Cómo se mueve esto

1. **Tomar una tarea:** crea `work/in-progress/<num>-<slug>.md` con descripción detallada, plan, archivos a tocar.
2. **Mientras trabajas:** actualiza ese archivo si descubres cosas.
3. **Al terminar:** muévelo a `work/done/<num>-<slug>.md` con 1 línea (fecha + commit hash).
4. **Si descubres trabajo nuevo:** añádelo a esta tabla con la prioridad estimada.

## Cosas que NO están aquí pero deberían en algún momento

- Métricas de uso reales (¿cuántos sitios? ¿cuántos contenidos/sitio? ¿qué endpoints se golpean más?).
- Roadmap comercial (si Lostrego se abre a terceros).
- Estrategia de observabilidad (Sentry/Firebase Performance).

> Estas requieren input del dueño del producto antes de aterrizar en el backlog.
