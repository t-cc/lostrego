# Modelo de datos (Firestore)

Snapshot del shape **actual** de Firestore. Si añades o cambias campos, actualiza este documento.

## Colecciones

### `site/{siteId}`

Sitio web/cliente. Unidad de aislamiento.

| Campo   | Tipo            | Notas                                                           |
| ------- | --------------- | --------------------------------------------------------------- |
| `name`  | string          | Nombre legible.                                                 |
| `logo`  | string (base64) | Imagen del logo embebida. [SUPUESTO ineficiente] — ver backlog. |
| `appId` | string          | Slug público, único entre sites. Usado por la API.              |

### `user/{email}`

Usuario con acceso al CMS. **El document ID es el email.** Funciona como whitelist.

| Campo    | Tipo            | Notas                                                                |
| -------- | --------------- | -------------------------------------------------------------------- |
| `avatar` | string (base64) | Cacheado de Google photoURL la primera vez. Ver backlog: redundante. |

### `siteUser/{auto}`

Relación N-a-N user ↔ site. Su existencia da acceso.

| Campo  | Tipo              | Notas             |
| ------ | ----------------- | ----------------- |
| `user` | DocumentReference | → `user/{email}`  |
| `site` | DocumentReference | → `site/{siteId}` |

### `models/{modelId}`

Definición de un tipo de contenido dentro de un site.

| Campo                    | Tipo               | Notas                                                      |
| ------------------------ | ------------------ | ---------------------------------------------------------- |
| `name`                   | string             | Nombre legible.                                            |
| `description`            | string             | Descripción para el editor.                                |
| `appId`                  | string             | Slug público, único dentro del site.                       |
| `previewUrl`             | string?            | URL para preview de contenido. [SUPUESTO sin uso real aún] |
| `site`                   | DocumentReference  | → `site/{siteId}`                                          |
| `fields`                 | Field[] (embebido) | Array de definiciones de campo.                            |
| `createdAt`, `updatedAt` | Timestamp          |                                                            |

#### Field (sub-shape embebido en `models.fields`)

| Campo         | Tipo                                                                                              | Notas                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `id`          | string                                                                                            | UUID generado por el cliente, estable. Usado como clave en `ContentItem.data`. |
| `name`        | string                                                                                            | Etiqueta del campo en la UI.                                                   |
| `description` | string                                                                                            | Ayuda.                                                                         |
| `type`        | `'text' \| 'boolean' \| 'markdown' \| 'media' \| 'datetime' \| 'number' \| 'color' \| 'textList'` | Tipo de campo.                                                                 |
| `required`    | boolean                                                                                           |                                                                                |
| `appId`       | string                                                                                            | Slug del campo, usado en la API pública. Único dentro del model.               |
| `useAsTitle`  | boolean                                                                                           | Marca el campo como título visible.                                            |
| `showInList`  | boolean                                                                                           | Si aparece en la tabla de listado.                                             |
| `order`       | number                                                                                            | Orden de aparición en formulario y lista.                                      |

### `content/{contentId}`

Una entrada de contenido.

| Campo                    | Tipo                                                                   | Notas                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `modelId`                | string                                                                 | **String del documentId, no DocumentReference.** Inconsistente con `Model.site` (que sí es ref) pero funcional. |
| `data`                   | `Record<string, string \| boolean \| string[] \| number \| undefined>` | Claves = `Field.id` (no `appId`). La API transforma a `appId` al servir.                                        |
| `createdAt`, `updatedAt` | Timestamp                                                              |                                                                                                                 |

## Diagrama de relaciones

```
user (id=email)
  ▲
  │ siteUser.user (ref)
  │
siteUser ────────► site (ref via siteUser.site)
                    ▲
                    │ models.site (ref)
                    │
                  models ◄──────── content.modelId (STRING, no ref)
                    │
                    └─ fields[] (embebido en models)
```

## Tipos compartidos

Desde la migración a monorepo (ver [ADR 0006](../adr/0006-monorepo-pnpm-workspaces.md)) los tipos viven en **[`packages/shared/src/`](../../packages/shared/src/)** y se importan como `@lostrego/shared` desde web y functions. Esto eliminó el drift previo (`Field.showInList` faltante en backend, `ContentItem.site` solo en backend, duplicación de interfaces).

## Inconsistencias residuales

| Inconsistencia                                                                                  | Dónde                                                                                                                                | Acción                                                                                                                                  |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `content.modelId` string, `models.site` DocumentReference                                       | [`apps/web/src/lib/content.ts`](../../apps/web/src/lib/content.ts), [`apps/web/src/lib/models.ts`](../../apps/web/src/lib/models.ts) | Convención inconsistente entre colecciones. Funcional; mantener mientras no estorbe.                                                    |
| `Model.site` declarado `string` en shared pero llega como `DocumentReference` al leer Firestore | [`apps/web/src/lib/models.ts`](../../apps/web/src/lib/models.ts)                                                                     | Mentira histórica del tipo. El frontend lo trata como opaque, no rompe. Refactor si se quiere introducir un tipo `Reference` explícito. |

## Cosas que NO existen aún en Firestore

- `firestore.rules` (defaults a deny-all en prod, pero hay que escribirlas).
- `storage.rules`.
- Índices compuestos declarados (algunos queries necesitan uno: `content where modelId == X orderBy createdAt`).
