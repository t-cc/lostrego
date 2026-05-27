# AGENTS.md — Guía para agentes (Claude, Cline, Cursor, etc.)

Este archivo es el **punto de entrada** para cualquier agente que vaya a trabajar en Lostrego CMS.
Léelo entero antes de tocar código.

## En 30 segundos

Lostrego es un **CMS headless multi-sitio** (Producto, no herramienta interna; ya en producción
con Seragro) construido con React 19 + Vite + Firebase (Firestore, Storage, Auth, Functions).
El admin web permite a un usuario:

1. Cambiar entre los sitios a los que tiene acceso (`siteUser` lo decide).
2. Definir **modelos** (con campos dinámicos: text, markdown, media, boolean, datetime, number, color, textList).
3. Crear, editar y borrar **contenido** basado en esos modelos.
4. Gestionar archivos en una **media library** sobre Firebase Storage.

Una API REST pública (Firebase Functions + Hono) expone modelos y contenidos
hacia consumidores externos (front sites, apps).

## Lectura obligatoria antes de cualquier tarea

1. [docs/product/vision.md](docs/product/vision.md) — qué es el producto y para quién.
2. [docs/product/glossary.md](docs/product/glossary.md) — `Site`, `Model`, `Field`, `ContentItem`, `appId`.
3. [docs/architecture/overview.md](docs/architecture/overview.md) — diagrama y flujo de datos.
4. [docs/engineering/conventions.md](docs/engineering/conventions.md) — cómo se escribe código aquí.

## Lectura adicional según tipo de tarea

| Tarea                    | Leer también                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Bug fix                  | [work/backlog.md](work/backlog.md), [docs/architecture/](docs/architecture/) relevante                                               |
| Nueva feature            | [docs/prd/\_template.md](docs/prd/_template.md) y PRDs relacionados                                                                  |
| Cambio de stack/librería | [docs/adr/\_template.md](docs/adr/_template.md) y ADRs existentes                                                                    |
| Endpoint nuevo           | [docs/architecture/api-contract.md](docs/architecture/api-contract.md), [docs/engineering/security.md](docs/engineering/security.md) |
| Nuevo tipo de campo      | [docs/prd/002-dynamic-models.md](docs/prd/002-dynamic-models.md), [docs/architecture/data-model.md](docs/architecture/data-model.md) |
| Cambio de UI             | [docs/design/ui-guidelines.md](docs/design/ui-guidelines.md), [docs/design/ux-patterns.md](docs/design/ux-patterns.md)               |
| Cambio multi-idioma      | [docs/design/i18n.md](docs/design/i18n.md)                                                                                           |
| Deploy / entornos        | [docs/operations/deployment.md](docs/operations/deployment.md), [docs/operations/env.md](docs/operations/env.md)                     |

## Flujo recomendado para una tarea

1. **Entender el "qué" y el "por qué":** abre el PRD si existe; si no, créalo con `docs/prd/_template.md` antes de implementar.
2. **Mira las decisiones tomadas:** consulta `docs/adr/` para no deshacer una decisión consciente.
3. **Lee la arquitectura relevante:** `docs/architecture/` describe el estado actual del código.
4. **Implementa siguiendo convenciones:** ver `docs/engineering/conventions.md`.
5. **Actualiza documentación viva:** si cambias el shape de Firestore, edita `docs/architecture/data-model.md`. Si cambias un endpoint, edita `docs/architecture/api-contract.md`.
6. **Crea un ADR si tomas una decisión arquitectónica nueva.**
7. **Mueve la tarea en `work/`:** `work/backlog.md` → `work/in-progress/<slug>.md` → `work/done/<slug>.md`.

## Reglas duras (no negociables)

### Idioma

- **Código, identificadores, archivos, variables, comentarios, commits, branches, logs:** inglés.
- **Documentación en `docs/`:** castellano.
- **UI (labels, mensajes, placeholders, errores user-facing):** castellano. Ver [`docs/design/i18n.md`](docs/design/i18n.md).

### Stack y herramientas

- **Package manager:** `pnpm` siempre. Nunca `npm` ni `yarn`. (Excepción legacy: `functions/`.)
- **TypeScript** en todo. `interface` > `type` para shapes públicos. Sin `enum` — usa uniones de string o `as const` maps.
- **React:** componentes funcionales con **named exports**, `function NameComponent()`. Sin `React.FC`.
- **Hooks:** prefijo `use*`, devuelven `{ data, loading, error, refetch }` salvo razón fuerte.
- **Forms:** `react-hook-form` + `zod` + `<Form>` de shadcn. Sin formularios sin validación.
- **UI base:** shadcn/ui sobre Radix + Tailwind v4. No HTML nativo (`<button>`, `<input>`). No CSS-in-JS.
- **Iconos:** `lucide-react` para genéricos, SVGs externos en `src/assets/icons/` para marca. **Nunca SVG inline.**

### Estilo de código

- **`function` para funciones puras y componentes.** Arrow functions ok para callbacks inline.
- **Llaves siempre en condicionales**, incluso de una línea.
- **Programación funcional y declarativa.** Evita clases.
- **Variables booleanas con verbo auxiliar:** `isLoading`, `hasError`, `shouldRefetch`.
- **Carpetas:** PascalCase para screens, kebab-case para el resto (`components/auth-wizard/`).
- **Screens:** una carpeta por screen en `src/components/screens/Foo/index.tsx` con subcomponentes locales.

### Workflow

- **Commits:** Conventional Commits con scope **obligatorio** (ver `commitlint` en `package.json`).
- **Antes de añadir una dependencia:** abre un ADR justificándolo.
- **Antes de cambiar `firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`:** avisa al humano.

### Detalle

Ver [`docs/engineering/conventions.md`](docs/engineering/conventions.md) para la versión completa.

## Cosas que **NO** debes hacer

- **No reformatees código que no estás cambiando.** Prettier corre en pre-commit, deja que lo haga él.
- **No reordenes imports** del usuario — el plugin de Prettier los ordena solo.
- **No borres comentarios o código comentado** del usuario sin verificar que está realmente obsoleto.
- **No cambies el formato del código existente** salvo que sea necesario para la nueva funcionalidad.
- **No introduzcas librería de i18n** sin un ADR — la decisión actual es UI en castellano sin librería.
- **No conviertas el repo en monorepo** sin un ADR aprobado.
- **No añadas tests "por completitud":** coordina con `docs/engineering/testing.md`.
- **No expongas más endpoints en Functions sin auth** — la API actual es pública por diseño legacy, está pendiente endurecerla (ver backlog P0).
- **No borres comentarios `// @ts-expect-error`** sin resolver el problema de tipos subyacente.
- **No skippees hooks de git** (`--no-verify`). Si pre-commit falla, arregla el problema.

## Si algo no está claro

- Si una pregunta del producto no está en `docs/product/` o `docs/prd/`: **PREGUNTA al humano** antes de inventar.
- Si una decisión técnica colisiona con un ADR: **proponlo como nuevo ADR que supersede el anterior**, no lo cambies en silencio.
