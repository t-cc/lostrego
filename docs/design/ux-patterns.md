# Patrones de UX

Convenciones de interacción que se repiten en el CMS.

## Navegación

- **Sidebar permanente** (colapsable a iconos). Items en [`src/config/menu.ts`](../../src/config/menu.ts).
- **Site switcher** en la cabecera del sidebar. Cambiar de site **persiste** en `localStorage`.
- **Breadcrumbs** en la cabecera del Layout (pendiente arreglar `key` warning — backlog).

## CRUD

### Listar

- Tabla con `@tanstack/react-table`.
- Header: título + descripción + botón primario "Add".
- Acciones por fila: edit / delete dentro de un `DropdownMenu` (`MoreHorizontal`).
- Confirmación de borrado siempre con `AlertDialog`.

### Crear / Editar

- Misma pantalla con misma forma, distinguidas por la ruta (`/add` vs `/:id`).
- Botones a la derecha del header: "Cancel" (variant `outline`) + "Save" (default).
- Si hay cambios sin guardar, **no hay protección hoy** [SUPUESTO mejora futura].
- Tras guardar exitosamente: redirigir a la lista del modelo correspondiente.

### Borrar

- `AlertDialog` con título "Are you sure?" y descripción explícita ("This will permanently delete X").
- Botón destructive `variant="destructive"`.
- Si el modelo tiene contenido: **bloquear borrado** con mensaje (commit `3318bda`).

## Formularios dinámicos

- Construidos con react-hook-form + zod (ver [ADR 0004](../adr/0004-react-hook-form-zod.md)).
- Un componente por tipo de campo en `src/components/screens/Content/common/`.
- Campos `required` → asterisco rojo (`text-red-500`).
- Campos en orden `Field.order`.
- Validación en blur + en submit. Mensajes de error debajo del input (shadcn `<FormMessage>`).

## Loading / Empty / Error

- **Loading:** spinner + texto contextual en castellano ("Cargando…").
- **Empty state:** mensaje con CTA. Ej.: lista de modelos vacía → "No models yet. Create your first model."
- **Error:** banner arriba de la sección con el mensaje. Si es recuperable, ofrecer un botón "Retry".

## Confirmaciones destructivas

Patrón único: `AlertDialog` de shadcn. Ejemplo en [`src/components/screens/Models/List/`](../../src/components/screens/Models/List/) (commit `18a6b9d`).

**No usar `window.confirm`.** Hay un caso pendiente de migración en `Media` (backlog P2).

## Site switcher

- Si hay 0 sites: mostrar estado vacío con ayuda ("Pídele a tu admin que te dé acceso a un site").
- Si hay 1 site: mostrar el nombre, no es necesario que abra un menú.
- Si hay 2+: dropdown con todos, marcar el actual.

## Mobile

- El sidebar usa `Sheet` en mobile (gracias a shadcn).
- Las tablas no están optimizadas para mobile [SUPUESTO]. El admin probablemente se usa en desktop.

## Idioma

- **UI en castellano.** Ver [`docs/design/i18n.md`](i18n.md) para la regla completa.
- Hay deuda: literales viejos en inglés se migran cuando se toca la pantalla.
