# PRD 003 — Gestión de contenido (CRUD)

- **Estado:** Lanzado (retrospectivo)
- **Owner:** Tonio
- **Última actualización:** 2026-05-27
- **ADRs relacionados:** [0001](../adr/0001-firestore-as-backend.md), [0004](../adr/0004-react-hook-form-zod.md)

> ⚠️ PRD retrospectivo.

## 1. Problema

Una vez definido el modelo, el editor necesita crear y mantener las entradas: posts, projects, products… con la mejor UX posible para un formulario que **no es estático**.

## 2. Usuarios y casos de uso

- **Edu** crea posts en su sitio, los edita, los borra.

User stories:

- Como Edu, quiero ver una lista de todos los Posts con las columnas que Diana marcó como `showInList`.
- Como Edu, quiero entrar a un Post y editar sus campos con widgets adecuados (markdown editor, file picker, datepicker…).
- Como Edu, quiero ver claramente qué campos son obligatorios.
- Como Edu, quiero un diálogo de confirmación antes de borrar.

## 3. Scope

### Dentro del scope

- Lista de contenidos por modelo (`/content/:modelId`).
- Tabla con columnas dinámicas según `Field.showInList` y `Field.useAsTitle`.
- Formulario de creación/edición (`/content/:modelId/add`, `/content/:modelId/:contentId`).
- Renderizado dinámico por tipo de campo.
- Validación cliente con zod (required + tipos básicos).
- Diálogo de confirmación de borrado (shadcn `AlertDialog`, no `window.confirm`) — commit `18a6b9d`.
- Persistencia inmediata (no draft).

### Fuera del scope

- **Borradores / preview.** Roadmap.
- **Historial / versionado.** Roadmap.
- **Validación server-side.** Backend hoy no valida.
- **Búsqueda full-text en lista.** No hay.
- **Filtrado avanzado en lista.** No hay.

## 4. Criterios de aceptación

- [x] La tabla muestra columnas según flags del modelo.
- [x] El formulario respeta el orden y el tipo de cada campo.
- [x] Los campos `required` muestran asterisco y bloquean submit si están vacíos.
- [x] El borrado pide confirmación.
- [x] Editar y volver a la lista refleja el cambio.

## 5. Diseño

**Datos:**

- `ContentItem.data` = `Record<fieldId, value>` (claves internas, no `appId`).
- Persistencia via [`contentService`](../../src/lib/content.ts).

**UI:**

- [`ContentTable`](../../src/components/screens/Content/List/ContentTable.tsx) con @tanstack/react-table.
- [`ContentForm`](../../src/components/screens/Content/common/ContentForm.tsx) con react-hook-form + zod.
- Componentes por tipo: `TextField`, `BooleanField`, `MarkdownField`, `MediaField`, `DatetimeField`, `NumberField`, `ColorField`, `TextListField`.

## 6. Decisiones tomadas

- **Schema zod construido al vuelo en cliente.** Ver [ADR 0004](../adr/0004-react-hook-form-zod.md).
- **Las claves de `data` son `Field.id`, no `appId`.** La transformación a `appId` ocurre solo al servir por la API. Razón: si el editor renombra el `appId`, los datos existentes no se rompen.
- **`AlertDialog` reemplaza `window.confirm`** (consistencia visual).

## 7. Riesgos / abierto

- **`sort()` mutante** en `ContentForm.tsx` y `ContentTable.tsx` (backlog P0).
- **`text-red-50`** en el asterisco de MediaField (invisible — backlog P0).
- **`NumberField` con `.min(0)`** rechaza negativos erróneamente (backlog P2).
- **Sin draft:** un cambio accidental se persiste.
- **Sin optimistic updates ni cache:** cada navegación refetch desde Firestore.

## 8. Notas para agentes

- **Cuando añadas un componente de campo nuevo**, sigue el patrón existente: prop `field: Field`, prop `form: UseFormReturn`, no metas lógica de negocio dentro.
- **Nunca leas `ContentItem.data[appId]`**: la clave en Firestore es `Field.id`. El mapeo a `appId` solo se hace al servir por la API REST.
- Para mostrar el título de un item en una lista o breadcrumb: busca el `Field` con `useAsTitle === true` y lee `item.data[field.id]`.
