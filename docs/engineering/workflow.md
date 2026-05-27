# Workflow de desarrollo

## Branching

- **`main`** es la rama de producción.
- **No hay branch `dev` ni `staging`.** Trabajamos PR → main directamente (proyecto pequeño).
- **Branches feature:** `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.

## Pull Requests

- Cada cambio no trivial vía PR.
- Título del PR sigue Conventional Commits: `feat(scope): …`, `fix(scope): …`, etc.
- Descripción incluye:
  - Qué cambia.
  - Por qué.
  - Cómo probarlo.
  - Si hay PRD/ADR enlazado.
- Squash & merge por defecto (mantener historia limpia).

## Commits

- **Conventional Commits con scope obligatorio.** Configurado en `commitlint`.
- Scopes válidos (ver [`package.json`](../../package.json)): `ui`, `auth`, `logic`, `content`, `models`, `media`, `layout`, `functions`, `config`, `types`, `deps`, `docs`, `ci`, `react`, `hooks`, `*`.
- **Husky** ejecuta `commitlint` en `commit-msg`.
- **Lint-staged** ejecuta ESLint --fix y Prettier en pre-commit.

**No usar `--no-verify`.** Si el hook falla, arregla el problema.

## Cuándo crear un PRD

- Antes de cualquier feature nueva.
- El PR del PRD puede ir antes del PR del código (alinear primero).

## Cuándo crear un ADR

- Antes de añadir/cambiar una dependencia gorda.
- Antes de un cambio estructural (monorepo, nueva capa, cambio de bundler…).
- Antes de un cambio breaking en la API.

## Cuándo NO crear PRD/ADR

- Bugs (van directos a `work/backlog.md`).
- Refactors pequeños.
- Bumps de dependencia menor/patch.
- Cambios sólo de docs.

## Flujo recomendado de un cambio

1. Mira [`work/backlog.md`](../../work/backlog.md). Si es algo nuevo, añádelo allí.
2. Mueve la entrada a `work/in-progress/<slug>.md` (un archivo por tarea, con detalles).
3. Si toca una feature nueva → crea el PRD primero.
4. Si toca una decisión arquitectónica → ADR primero.
5. Implementa, conformándote a [`conventions.md`](conventions.md).
6. Actualiza `docs/architecture/` si has cambiado el shape de datos o un endpoint.
7. Abre PR. Self-review primero. Merge cuando pase CI y types.
8. Mueve la entrada a `work/done/<slug>.md` (1 línea: fecha + commit hash).

## Releases / Deploy

- Cada merge a `main` requiere deploy manual hoy (`firebase deploy`). No hay CI/CD automatizado.
- **Plan futuro:** GitHub Action que despliegue a Firebase tras merge (P3 backlog).
- Si rompes prod, revierte en `main` y haz deploy del revert.

## Definir "done"

Un cambio está hecho cuando:

- [x] Compila (`pnpm build` pasa).
- [x] Lint y Prettier pasan.
- [x] Probado manualmente en local (golden path).
- [x] Si tocó arquitectura, docs actualizados en el mismo PR.
- [x] PRD/ADR enlazado si aplica.

## Cuándo PARAR y consultar al humano

- Antes de añadir una dependencia nueva no trivial.
- Antes de cambiar `firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`.
- Antes de un cambio en el shape de Firestore que requiere migración.
- Si encuentras un secreto en el repo.
- Si el cambio cruza más de 2 PRDs.
