# PRD 005 — API REST pública para consumidores

- **Estado:** Lanzado (sin auth — endurecimiento P0 pendiente)
- **Owner:** Tonio
- **Última actualización:** 2026-05-27
- **ADRs relacionados:** [0002](../adr/0002-hono-on-firebase-functions.md)

> ⚠️ PRD retrospectivo.

## 1. Problema

El contenido editado en el admin tiene que llegar a un front (Next.js, Astro, app móvil) sin que el front tenga que hablar Firestore directamente.

## 2. Usuarios y casos de uso

- **Carlos** (consumidor: front-end del sitio del cliente, o build SSG).

User stories:

- Como Carlos, quiero descubrir qué modelos tiene un sitio: `GET /api/:siteAppId/models`.
- Como Carlos, quiero listar entradas de un modelo paginadas: `GET /api/:siteAppId/content/:modelAppId?page=2&pageSize=20`.
- Como Carlos, quiero pedir una entrada concreta: `GET /api/:siteAppId/content/:modelAppId/:contentId`.
- Como Carlos, quiero claves legibles en la respuesta (`title`, no `f8e3d7b...`).

## 3. Scope

### Dentro del scope (hoy)

- 3 endpoints `GET` listados.
- Resolución de `appId` → documento.
- Transformación de `data[fieldId]` → `data[fieldAppId]`.
- Paginación offset y cursor.
- Errors con códigos HTTP semánticos.
- CORS abierto.

### Fuera del scope (hoy, en roadmap)

- **Autenticación / autorización.** Endurecimiento P0.
- **Versionado** (`/api/v1/`).
- **Escritura** (POST/PATCH/DELETE).
- **Webhooks** para invalidación de cache del consumidor.
- **SDK** generado.
- **Endpoint de búsqueda.**

## 4. Criterios de aceptación

- [x] Endpoint health check (`GET /`) responde 200.
- [x] `siteAppId` inexistente → 404.
- [x] `modelAppId` no perteneciente al site → 404.
- [x] `contentId` no perteneciente al modelo → 404.
- [x] Las claves de `data` en la respuesta son `appId`, no `id` internos.
- [x] Paginación cursor incluye `nextCursor` cuando `hasNext`.
- [ ] **Auth obligatoria** — pendiente.
- [ ] Rate limit — pendiente.

## 5. Diseño

- **Runtime:** Firebase Functions v2 (`onRequest`), `region: us-central1`, `memory: 256MiB`, `maxInstances: 10`.
- **Framework:** Hono adaptado a Firebase.
- **Rewrite:** `/api/**` → función `api` (en `firebase.json`).
- **Tipos:** duplicados en [`functions/src/services/contentService.ts`](../../functions/src/services/contentService.ts) — drift conocido.

Ver contrato completo en [`docs/architecture/api-contract.md`](../architecture/api-contract.md).

## 6. Decisiones tomadas

- **`appId` en URLs, no `id` Firestore.** Razón: URLs legibles y estables.
- **Cursor + page coexisten.** Cursor es mejor para listas grandes; page se mantiene por simplicidad.
- **`totalItems` solo en primera petición cursor** para ahorrar `.count()`.
- **Sin escritura via API.** El admin es el único que escribe a Firestore.
- **`invoker: public`** asumido como solución temporal. ⚠️

## 7. Riesgos / abierto

- **La API es pública sin auth.** Cualquiera con la URL lee todos los contenidos. Es **P0 del backlog**.
- **Sin rate limit:** ataque básico de scraping puede subir el coste de Firebase.
- **Sin versionado:** cambios breaking afectan a todos los consumidores a la vez.
- **Drift de tipos** con el frontend (ver backlog P1).
- **No hay tests** que validen el contrato.

## 8. Notas para agentes

- **Cualquier endpoint nuevo:**
  1. Actualizar [`docs/architecture/api-contract.md`](../architecture/api-contract.md) en el mismo PR.
  2. Considerar si necesita un PRD aparte.
  3. Pensar el modelo de auth — no merge sin esto resuelto, dado que P0 ya está abierto.
- **No exponer escritura sin un nuevo PRD + ADR.**
- **No cambiar el shape de respuestas existentes sin coordinarse:** los consumidores no esperan breaking changes hasta que haya `/v1/`.
- Para el endurecimiento de auth, ver opciones en [`docs/engineering/security.md`](../engineering/security.md).
