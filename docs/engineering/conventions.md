# Convenciones de código

Documento autoritativo de convenciones. Si entra alguien (o un agente) y solo lee un sitio,
que sea este.

## Idioma y nombres

- **Código, identificadores, archivos, variables, comentarios, commits, branches:** inglés.
- **Documentación en `docs/`:** castellano.
- **UI (labels, mensajes, placeholders, errores user-facing):** castellano. Ver [`docs/design/i18n.md`](../design/i18n.md).
- **Logs (`console.error`, etc.):** inglés (audiencia: dev).
- **Variables booleanas:** prefijo con verbo auxiliar — `isLoading`, `hasError`, `shouldRefetch`, `canEdit`.

## TypeScript

- **`interface` > `type`** para shapes públicos (objetos, props, datos).
- `type` ok para uniones (`type FieldType = 'text' | …`).
- **No enums.** Usa uniones de string o `as const` maps.
- `unknown` antes que `any`. Si necesitas `any`, comenta el porqué.
- **No `@ts-ignore`** silencioso. `@ts-expect-error` con razón en línea, **y ticket en backlog** para resolverlo.

## React

- **Functional components con named exports.**
  ```tsx
  export function ModelsList({ user }: { user: User }) { … }
  ```
- **No `export default`.** (Excepción legacy: `App.tsx`, `MenuSidebar.tsx`, `Layout.tsx` — backlog para alinear.)
- **Componentes con `forwardRef`** (raro): `export const Foo = React.forwardRef<...>((props, ref) => {...})`.
- **Hooks con prefijo `use*`** y nombre kebab/camel del recurso (`useModels`, `useAuth`).
- **Props tipadas inline** si es 1-2 props; si son 3+, `interface FooProps` justo encima.
- **Custom hooks devuelven `{ data, loading, error, refetch }`** salvo razón fuerte.
- **No usar `React.FC`.**
- **JSX declarativo.** Evita lógica imperativa dentro del JSX; extrae a variables/funciones arriba del `return`.

## Sintaxis

- **`function` para funciones puras y componentes:**
  ```ts
  function calculatePrice(items: Item[]): number { … }
  export function MyComponent() { … }
  ```
  Arrow functions ok para callbacks inline y closures cortas.
- **Llaves siempre en condicionales**, incluso en una línea:
  ```ts
  if (isLoading) {
    return null;
  }
  // NO: if (isLoading) return null;
  ```
- **Programación funcional y declarativa.** Evita clases salvo cuando una API externa las requiera.
- **Itera y modulariza.** Antes de duplicar lógica, extrae a helper.

## Estructura de archivos

```
src/
├── components/
│   ├── ui/          ← shadcn (auto-generado mayormente; editable pero con cuidado)
│   ├── layout/      ← composición de layout
│   └── screens/     ← una carpeta por screen
│       └── Foo/
│           ├── index.tsx        ← el componente exportado
│           ├── Sub.tsx          ← subcomponentes
│           ├── helpers.ts       ← lógica pura
│           └── types.ts         ← tipos locales
├── hooks/
├── lib/             ← servicios (acceso a Firestore, utilidades)
├── context/
├── types/           ← tipos compartidos
└── config/
```

**Orden dentro de un archivo de componente:**

1. Imports.
2. Tipos / interfaces.
3. Componente exportado.
4. Subcomponentes (no exportados).
5. Helpers / funciones puras locales.
6. Constantes estáticas.

## Naming

- **Carpetas:** PascalCase para screens (`Models/`, `Content/Add/`); kebab-case para todo lo demás (`src/components/ui/dropdown-menu.tsx`, `src/components/auth-wizard/`).
- **Archivos de componente:** PascalCase con `.tsx`. Helpers en camelCase con `.ts`.
- **Variables booleanas:** `is*`, `has*`, `should*`, `can*`.
- **Servicios:** `xxxService` exportado como objeto `{ getAll, getById, create, update, delete }`.

## Imports

Orden (Prettier plugin lo ordena):

1. `react`
2. `react-dom`
3. Third party
4. Local (`@/…` o `./`)

**Usa el alias `@/`** (`@/lib/firebase`, `@/types/model`), no rutas relativas largas (`../../../lib/firebase`).

## Async y errores

- `async/await` siempre. No mezclar `.then()`.
- En servicios: `try/catch` con `console.error` y `throw` re-lanzado.
- En componentes: el caller decide qué mostrar. Setea `error` en state, no muestres un toast desde el servicio.
- **Nunca `throw` un string.** Usa `new Error('...')`.

## Estado y data fetching

- **Estado local:** `useState`. **Estado compartido near-component:** lift up.
- **Estado global persistente (user, currentSite):** `Context`.
- **Cache de datos remotos:** hoy no hay. Si añades TanStack Query → **ADR**.

## Forms

- `react-hook-form` + `zod`.
- `<Form>` de shadcn (`src/components/ui/form.tsx`).
- No formularios sin validación.
- Schema declarado fuera del componente si es estático; construido dentro si es dinámico.

## UI / estilos

- **Tailwind** para todo. Tokens de tema (variables CSS de shadcn) — no colores hex a pelo.
- **shadcn/ui** para componentes base. No HTML nativo (`<button>`, `<input>`) — usa el wrapper.
- **Iconos:** `lucide-react` para iconos genéricos, SVGs externos en `src/assets/icons/` para marca. **Nunca SVG inline en JSX.**
- Ver [`docs/design/ui-guidelines.md`](../design/ui-guidelines.md) para el detalle.

## Comentarios

- **Por defecto, no escribas comentarios.** El nombre del símbolo debería bastar.
- Escribe un comentario cuando el **porqué** no es obvio: workaround de bug, decisión contraintuitiva, constraint externa.
- **No documentes lo que el código ya dice.**
- **No borres comentarios o código comentado existente sin razón.** Si vas a quitar algo, asegúrate de que está obsoleto, no solo "feo".

## Dependencias

- `pnpm` siempre. Nada de `npm`/`yarn`. (Excepción legacy: `functions/package.json` — backlog para alinear.)
- **Antes de añadir una dependencia gorda:** ADR.
- Mantén `devDependencies` y `dependencies` separadas correctamente — los paquetes de servidor **no** deben estar en `dependencies` del frontend (bug abierto, backlog P0).

## Reglas de edición

Cuando un agente (o humano) edita código existente:

- **No reformatees código que no estás cambiando.** Prettier ya corre en pre-commit.
- **No reordenes imports.** El plugin de Prettier lo hace según el orden definido.
- **No borres código del usuario** que parezca "no usado" sin verificar — puede ser intencional.
- **Conserva los comentarios existentes** salvo que el código asociado desaparezca.

## Commits

Conventional Commits con scope **obligatorio**. Scopes permitidos (de `commitlint`):

`ui · auth · logic · content · models · media · layout · functions · config · types · deps · docs · ci · react · hooks · *`

Ejemplos:

- `feat(content): add markdown preview` ✓
- `fix(react): missing key on breadcrumb fragment` ✓
- `chore(deps): upgrade Node.js to 24` ✓
- `wip` ✗

Husky + lint-staged corren ESLint y Prettier en pre-commit. **No `--no-verify`.**

## Tests

Hoy: cero. Plan: ver [`testing.md`](testing.md). Cuando se añadan, las convenciones se documentan ahí.
