# Guías de UI

## Reglas duras

- **shadcn/ui** para todo componente base (button, input, dialog, select, dropdown…). No usar HTML nativo (`<button>`, `<input>`) excepto en casos justificados.
- **Radix** es la primitiva — no importarla directamente. Pasa por el wrapper de shadcn que vive en `src/components/ui/`.
- **Tailwind v4** para estilos. No CSS-in-JS, no styled-components.
- **lucide-react** para iconos UI. Iconos custom (de marca) en `src/assets/icons/` como SVG externo, **nunca inline en el JSX**.
- **`cn()`** de [`src/lib/utils.ts`](../../src/lib/utils.ts) para componer clases.

## Tokens

Definidos en [`src/index.css`](../../src/index.css) con variables CSS de shadcn:

- `--background`, `--foreground`
- `--card`, `--popover`
- `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`
- `--border`, `--input`, `--ring`
- `--radius`

**No metas colores hex/rgb a pelo en componentes.** Usa la clase Tailwind con el token: `bg-background`, `text-foreground`, `border-border`, etc.

## Dark mode

Variables `:root.dark` están definidas. **No hay toggle de UI todavía** — backlog "Later". Si añades el toggle, debe persistirse en `localStorage` y respetar `prefers-color-scheme` al inicio.

## Tipografía

- Una sola familia (la default del sistema con Tailwind). No añadir Google Fonts sin ADR.
- Jerarquía:
  - `text-3xl font-bold` — H1 (título de pantalla)
  - `text-2xl font-semibold` — H2 (sección)
  - `text-xl font-semibold` — H3
  - `text-sm text-muted-foreground` — texto secundario / ayudas

## Espaciado

- Padding del contenido principal: `p-6`.
- Espaciado entre secciones: `space-y-6`.
- Forms: separación entre campos `space-y-4`.

## Patrones de pantalla

- **Lista:** header con título + botón "Add" a la derecha, separator, tabla.
- **Form (Add/Edit):** header con título + botones "Cancel" / "Save" a la derecha, separator, formulario.
- **Sidebar list:** ver `ContentLayout` y `ModelsLayout` (consolidar a uno único — backlog P3).

## Iconos

| Acción         | Icono lucide |
| -------------- | ------------ |
| Crear / añadir | `Plus`       |
| Editar         | `Pencil`     |
| Borrar         | `Trash2`     |
| Volver         | `ArrowLeft`  |
| Cerrar         | `X`          |
| Cargar / subir | `Upload`     |
| Logout         | `LogOut`     |

Tamaño por defecto: `h-4 w-4` dentro de botones, `h-5 w-5` en hero icons.

## Estados de feedback

- **Loading inline:** spinner pequeño (`animate-spin h-4 w-4`).
- **Loading de pantalla completa:** ver `AppContent` en [`src/App.tsx`](../../src/App.tsx).
- **Error:** banner rojo con `text-destructive` y borde `border-destructive`.
- **Confirmación destructiva:** `AlertDialog` de shadcn, **nunca `window.confirm`**.

## Accesibilidad

- Confiar en Radix para focus/keyboard de overlays.
- Labels asociados a inputs (componentes `Form` de shadcn lo hacen).
- Contraste de texto: respetar tokens. **No usar `text-red-50`** sobre fondo claro (bug actual en MediaField).

## Cosas a NO hacer

- No abrir un Dialog/Sheet propio: usa los de shadcn.
- No animar con CSS keyframes propios: usa `tw-animate-css` (ya en deps).
- No introducir librerías de gráficos sin ADR (cuando llegue, decidir entre Recharts, visx, etc.).
