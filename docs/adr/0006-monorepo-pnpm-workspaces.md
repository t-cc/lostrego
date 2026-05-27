# ADR 0006 — Monorepo con pnpm workspaces

- **Estado:** Aceptado
- **Fecha:** 2026-05-27
- **Decisores:** Tonio

## Contexto

El repositorio crece con dos artefactos desplegables (SPA y Firebase Functions) que **comparten conceptos de dominio** (tipos `Field`, `Model`, `ContentItem`, `Site`). Hoy:

- Esos tipos están **duplicados** en `src/types/` y `functions/src/services/contentService.ts`.
- Hay **drift conocido**: `Field.showInList` falta en backend, `ContentItem.site` solo existe en backend.
- El **package manager difiere**: root usa pnpm, `functions/` usa npm.
- No hay forma limpia de compartir lógica entre apps (validaciones zod, helpers de dominio).
- Cualquier consumidor futuro (SDK TypeScript de la API) tendría que reescribir los mismos tipos.

Es problema P3 del backlog (#10, #22, #25) que ya bloquea trabajo P0/P1.

## Decisión

Migramos el repo a un **monorepo con pnpm workspaces** (sin Turborepo de inicio), con la siguiente estructura:

```
lostrego/
├── apps/
│   ├── web/              ← SPA (React + Vite) — @lostrego/web
│   └── functions/        ← Firebase Functions (Hono) — @lostrego/functions
├── packages/
│   └── shared/           ← tipos + futuros schemas zod compartidos — @lostrego/shared
├── package.json          ← workspace root + dev tools comunes
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── firebase.json         ← apunta a apps/web/dist y apps/functions
└── docs/, work/, AGENTS.md, .husky/   ← se quedan en raíz
```

- **Scope npm:** `@lostrego/*`.
- **Single source of truth** para tipos de dominio: `packages/shared`.
- **Deps de servidor** (`firebase-admin`, `firebase-functions`, `hono`) dejan de estar en el root y viven solo en `apps/functions` (resuelve backlog P0 #1).
- **Functions migrado a pnpm** (resuelve backlog P2 #22).
- **Husky, ESLint, Prettier, commitlint** se quedan en raíz; aplican a todo el árbol.

## Alternativas consideradas

- **pnpm workspaces + Turborepo.** Aporta cache distribuido y orquestación de tareas. Para 2 apps + 1 package, overhead innecesario. Se puede añadir más adelante sin reorganizar nada.
- **Nx.** Más estructura, generadores, dependency graph visual. Opinionado y con curva. Excesivo para este tamaño.
- **Mantener el repo como está** y duplicar tipos manualmente o usar un git submodule. Insostenible.
- **Repo separado** para tipos compartidos. Complica el ciclo de cambio: editar tipos = PR en otro repo + bump de versión en cada app. Inviable para el ritmo actual.

## Consecuencias

**Positivas:**

- **Cero drift de tipos.** Cambiar `Field` en `shared` propaga a web y functions a la vez, con error de compilación si algo no cuadra.
- **`pnpm install` único** desde la raíz. Functions deja de tener su propio `node_modules`/`package-lock.json` desincronizado.
- **Bundle del frontend más limpio:** las deps de servidor salen del root.
- **Camino abierto** para un futuro `@lostrego/api-client` (SDK) sin reorganizar nada.
- **Scripts unificados:** `pnpm --filter <name>` o `pnpm -r build`.

**Negativas / coste:**

- **Migración mecánica grande:** ~70 archivos cambian de ubicación, todos los imports `@/types/*` se renombran a `@lostrego/shared`.
- **Cambia el path de `dist/`** y la `source` de Functions en `firebase.json`. Cualquier script externo (CI, deploy manual) hay que ajustarlo.
- **El alias `@/`** sigue funcionando dentro de `apps/web` (Vite lo resuelve) pero **no cruza paquetes** — para tipos compartidos hay que usar `@lostrego/shared`.
- **Husky/lint-staged** trabajan desde raíz; los `pre-commit` deben seguir filtrando ESLint/Prettier sobre los archivos correctos.

**Compromisos asumidos:**

- **Cada package tiene su `tsconfig.json`** que extiende `tsconfig.base.json` en la raíz.
- **Solo creamos `@lostrego/shared` ahora.** Otros packages (`config`, `api-client`) se crearán cuando haya necesidad real, no por anticipación.
- **No publicamos a npm.** El scope `@lostrego/*` es solo para nombres internos.
- **Si añadimos Turborepo en el futuro:** será otro ADR.

## Plan de migración

1. ADR aprobado (este documento).
2. Crear estructura del workspace (`pnpm-workspace.yaml`, carpetas vacías, `tsconfig.base.json`).
3. Crear `packages/shared` con tipos unificados (resolviendo el drift conocido).
4. Mover `src/`, `public/`, `index.html`, configs de Vite a `apps/web/`.
5. Mover `functions/` a `apps/functions/` y migrar a pnpm.
6. Reapuntar imports en código a `@lostrego/shared`.
7. Actualizar `firebase.json`, `package.json` raíz, `.husky/`.
8. `pnpm install` + `pnpm build` + smoke test.
9. Actualizar documentación afectada.
10. Cerrar entradas #10, #22, #25 del backlog.

## Referencias

- [pnpm workspaces docs](https://pnpm.io/workspaces)
- Backlog: [`work/backlog.md`](../../work/backlog.md) entradas #10 (Field drift), #22 (functions a pnpm), #25 (tipos compartidos), y #1 (deps de servidor fuera del frontend).
