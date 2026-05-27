# API REST pública — contrato

Base path: `/api`. Implementación: [`apps/functions/src/routes.ts`](../../apps/functions/src/routes.ts) con Hono.

## Reglas generales

- Todos los endpoints son `GET`. **No hay escritura via API.** Para mutaciones se usa el admin web.
- **Sin autenticación hoy.** (Ver [PRD 005](../prd/005-public-rest-api.md) — endurecimiento P0.)
- **Sin versionado.** No hay `/api/v1/`. Cambios breaking requieren coordinarse con consumidores.
- **CORS:** abierto (`cors: true`).
- **Errores:** siempre `{ "error": "<mensaje>" }` con código HTTP semántico.

## Identificadores en URL

La API usa **`appId`** (no document IDs internos):

- `:siteAppId` → `Site.appId`.
- `:modelId` (mal nombrado por legacy) → `Model.appId`.
- `:contentId` → Firestore document ID de `ContentItem` (porque los contents no tienen `appId`).

## Endpoints

### `GET /api/:siteAppId/models`

Lista todos los modelos de un sitio.

**Respuesta 200:**

```json
[
  {
    "id": "firestore-doc-id",
    "name": "Post",
    "description": "Blog post",
    "appId": "post",
    "site": {
      /* DocumentReference serializado */
    },
    "fields": [
      {
        "id": "uuid-v4",
        "name": "Title",
        "appId": "title",
        "type": "text",
        "required": true,
        "useAsTitle": true,
        "order": 0
      }
    ],
    "createdAt": "2025-…",
    "updatedAt": "2025-…"
  }
]
```

**Errores:**

- `400` — falta `siteAppId`.
- `404` — site no existe (`Site with appId 'X' not found`).
- `500` — fallo interno.

---

### `GET /api/:siteAppId/content/:modelId`

Lista contenidos de un modelo. Paginado.

**Query params:**

| Param      | Tipo          | Default | Notas                                                                                                          |
| ---------- | ------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `page`     | number ≥ 1    | `1`     | Paginación offset-based. Ignorado si se pasa `cursor`.                                                         |
| `pageSize` | number 1–100  | `20`    |                                                                                                                |
| `cursor`   | string opaque | —       | Token devuelto en `nextCursor` de la respuesta anterior. **Preferir cursor sobre page** para datasets grandes. |

**Respuesta 200:**

```json
{
  "items": [
    {
      "id": "content-doc-id",
      "modelId": "model-doc-id",
      "data": {
        "title": "Hello world",
        "body": "...",
        "published": true
      },
      "createdAt": "2025-…",
      "updatedAt": "2025-…"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "hasNext": true,
  "nextCursor": "last-doc-id-of-this-page",
  "totalItems": 142
}
```

**Notas importantes:**

- Las claves de `data` son **`Field.appId`**, no los `id` internos. La transformación ocurre en `routes.ts` antes de responder.
- `totalItems` sólo viene en la primera petición cursor-based (sin `cursor`). En siguientes no, para ahorrar `count()`.
- `page` no se incluye en respuestas cursor-based.

**Errores:**

- `400` — faltan `siteAppId` o `modelId`.
- `404` — modelo no existe en este site.
- `500` — modelo sin `id` (estado inconsistente) o fallo interno.

---

### `GET /api/:siteAppId/content/:modelId/:contentId`

Devuelve un único `ContentItem`.

**Respuesta 200:**

```json
{
  "id": "content-doc-id",
  "modelId": "model-doc-id",
  "data": {
    /* claves = field.appId */
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Errores:**

- `400` — falta algún param.
- `404` — modelo no existe **o** content no existe **o** content no pertenece al modelo solicitado.

---

### `GET /` (health check)

```json
{ "message": "API is working!" }
```

## Lo que NO existe (y no debería confundirse)

- No hay `POST /api/...`, `PATCH`, `DELETE`. Escribir es responsabilidad del admin web.
- No hay endpoint `GET /api/:siteAppId/sites` ni listado global de sites — eso es admin-only.
- No hay paginación de modelos (siempre devuelve todos). [SUPUESTO] Si un sitio tiene cientos de modelos se romperá.
- No hay endpoint para "search" de contenido.
- No hay webhook ni subscribe — el consumidor debe hacer polling o disparar build manual.

## Cómo añadir un endpoint nuevo

1. Abre un PRD describiendo el caso de uso.
2. Si hay decisión arquitectónica (auth, versionado, etc.) → ADR.
3. Implementa en [`apps/functions/src/routes.ts`](../../apps/functions/src/routes.ts) y, si toca lógica de datos, en [`apps/functions/src/services/`](../../apps/functions/src/services/).
4. **Actualiza este documento.** Si no lo haces, el endpoint no existe oficialmente.
5. Deploy: `pnpm --filter @lostrego/functions deploy` o `pnpm deploy` desde la raíz.
