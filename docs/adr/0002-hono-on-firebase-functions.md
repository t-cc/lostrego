# ADR 0002 — Hono dentro de Firebase Functions v2

- **Estado:** Aceptado (retrospectivo)
- **Fecha:** 2025-03-25
- **Decisores:** Tonio

## Contexto

Necesitamos una API REST pública para que los front-ends de los clientes consuman modelos y contenidos. Restricciones:

- Aprovechar la infra Firebase que ya usamos (ADR 0001).
- No quiero un Express grande para una API pequeña.
- Quiero ergonomía moderna (TypeScript first, middlewares ligeros, validación).

## Decisión

Implementamos la API con **[Hono](https://hono.dev/)** ejecutándose **dentro de una Firebase Function v2 HTTP** (`onRequest`). La función adapta el request/response de Firebase al `Request`/`Response` web-standard que Hono espera.

Endpoints expuestos via rewrite en `firebase.json`:

```
"source": "/api/**" → "function": "api"
```

## Alternativas consideradas

- **Express dentro de Function.** Funciona, pero más pesado, peor DX en TypeScript, middlewares más verbosos.
- **Firebase Functions "puras" sin framework.** Sufrimos para path-matching, query parsing, error handling consistente. No escala bien al añadir endpoints.
- **API en otra plataforma (Cloudflare Workers, Vercel Functions).** Hono brilla allí. Lo descartamos por mantener Firebase como única infra.
- **Cloud Run con un container Hono nativo.** Más caro al inicio, requiere Docker, no merece para 3 endpoints.

## Consecuencias

**Positivas:**

- DX moderna: handlers tipados, `c.req.param`, `c.req.query`, `c.json`.
- Si algún día migramos a Cloudflare Workers o Vercel, **el código Hono se transporta casi sin cambios** — solo cambia el adapter.
- API y front se despliegan a la vez (`firebase deploy`).

**Negativas / coste:**

- Cold starts de Functions (mitigado con `maxInstances: 10` y memoria baja).
- El adaptador `Firebase req → Web Request` lo escribimos a mano en [`functions/src/index.ts`](../../functions/src/index.ts) — pequeño punto de fricción.
- Dos `package.json` (raíz + `functions/`). Hay drift (functions usa `npm`, root usa `pnpm` — ver backlog).

**Compromisos asumidos:**

- Cualquier middleware Hono pesado (rate limit, JWT auth) lo añadiremos en el `apiRoutes` de Hono, no en el adapter.
- Si Firebase Functions empieza a costar, primero optimizamos cold starts; solo después consideramos cambiar de runtime.

## Referencias

- [`functions/src/index.ts`](../../functions/src/index.ts)
- [`functions/src/routes.ts`](../../functions/src/routes.ts)
- [`firebase.json`](../../firebase.json)
- [docs/architecture/api-contract.md](../architecture/api-contract.md)
