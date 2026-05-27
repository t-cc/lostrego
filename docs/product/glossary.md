# Glosario — lenguaje ubicuo del dominio

> Términos que aparecen en código, UI y conversación. Usarlos siempre con el mismo significado.

## Entidades

### Site

Un sitio web/cliente. Es la unidad de aislamiento del CMS. Todos los modelos y contenidos pertenecen a exactamente un `Site`.

- Colección Firestore: `site/`
- Tipo: [`src/types/site.ts`](../../src/types/site.ts)
- Campos: `name`, `logo` (base64), `appId`.

### SiteUser

Relación N-a-N entre `User` y `Site`. Si existe un documento `siteUser` con tu email y un site, **puedes entrar a ese site**. Es el equivalente actual al sistema de permisos (binario: tienes acceso o no).

- Colección Firestore: `siteUser/`
- Campos: `user` (DocumentReference a `user/`), `site` (DocumentReference a `site/`).

### User

Persona con acceso al CMS. El **document ID es el email**. La existencia de un documento en `user/` actúa como whitelist de invitación.

- Colección Firestore: `user/{email}`
- Campos: `avatar` (base64 — ver [PRD 003](../prd/003-content-crud.md) y backlog), …

### Model

Definición de un tipo de contenido dentro de un sitio. Por ejemplo: "Post", "Author", "Project". Tiene un conjunto de **Fields** que define qué campos tendrá cada `ContentItem` de ese modelo.

- Colección Firestore: `models/`
- Tipo: [`src/types/model.ts`](../../src/types/model.ts)
- Pertenece a un `Site` via DocumentReference (`site` field).

### Field

Un campo de un `Model`. Tipado (texto, markdown, media, etc.). Define el shape de los datos de un `ContentItem`.

- Embebido dentro del documento `Model` (array `fields`), no es una colección separada.
- Tipo: [`src/types/model.ts`](../../src/types/model.ts) (`interface Field`).
- Tipos de campo soportados: `text`, `boolean`, `markdown`, `media`, `datetime`, `number`, `color`, `textList`.

### ContentItem

Una entrada de contenido. Su `data` es un objeto `{ [fieldId]: value }` donde las claves son los `id` de los `Field` del `Model` al que pertenece.

- Colección Firestore: `content/`
- Tipo: [`src/types/content.ts`](../../src/types/content.ts)
- Referencia al modelo via `modelId` (string, no DocumentReference). [SUPUESTO] Esto es inconsistente con `Model.site` que sí es DocumentReference — ver [docs/architecture/data-model.md](../architecture/data-model.md).

## Identificadores

### `id` (Firestore document ID)

ID interno autogenerado por Firestore. Estable. Se usa para enlaces internos y para queries directas.

### `appId`

ID **legible y elegido por el usuario** (slug). Se expone en la **API REST pública** para que las URLs sean bonitas y estables aunque se borre/recree el documento.

- Existe en `Site.appId`, `Model.appId`, `Field.appId`.
- La API REST resuelve `appId` → documento internamente.
- **No es único globalmente.** Es único dentro de su contexto:
  - `Site.appId` único entre sites.
  - `Model.appId` único dentro de un site.
  - `Field.appId` único dentro de un model.

## Conceptos de UI

### Screen

Componente que representa una ruta. Convención del proyecto: vive en `src/components/screens/<Nombre>/index.tsx`. Cada screen tiene su propia carpeta con `index.tsx` + subcomponentes + tipos locales.

### Site Switcher

Componente en la cabecera del sidebar que permite cambiar entre los sitios accesibles del usuario. Persiste la selección en `localStorage` (`currentSite`).

### useAsTitle

Flag de un `Field`. El campo marcado como `useAsTitle` se usa como título visible en listas de contenido y breadcrumbs.

### showInList

Flag de un `Field`. Si está activo, el campo aparece como columna en la tabla de listado de contenido del modelo.

## API

### `siteAppId`

Path param de la API REST. Equivale a `Site.appId`.

### `modelAppId` (alias en URL: `:modelId`)

Path param de la API REST. Equivale a `Model.appId`. La ruta lo llama `:modelId` por motivos legacy [SUPUESTO], aunque internamente es el `appId`.

### Cursor

Token opaco para paginación cursor-based en la API. Es el `id` Firestore del último documento de la página anterior.
