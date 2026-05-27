# Arquitectura — visión general

Snapshot del sistema **a día de hoy**. Si cambia el código, este documento se actualiza.

## Layout del repo

Monorepo pnpm workspaces (ver [ADR 0006](../adr/0006-monorepo-pnpm-workspaces.md)):

```
lostrego/
├── apps/
│   ├── web/          @lostrego/web        ← SPA React + Vite
│   └── functions/    @lostrego/functions  ← API Hono sobre Firebase Functions
├── packages/
│   └── shared/       @lostrego/shared     ← tipos de dominio compartidos
└── (docs/, work/, firebase.json, package.json raíz)
```

## Bloques

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Navegador (Edu / Diana)                     │
│   React 19 + Vite (SPA)  · Tailwind + shadcn/ui + Radix              │
│   ─────────────────────────────────────────────────────────          │
│   AuthProvider → SiteProvider → Routes → Screens                     │
│      ▲                  ▲              ▲                             │
│      │ Firebase Auth    │ Firestore    │ Firebase Storage            │
│      │ (Google OAuth)   │ SDK (Web)    │ SDK (Web)                   │
└──────┼──────────────────┼──────────────┼─────────────────────────────┘
       │                  │              │
       ▼                  ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            Firebase                                  │
│  ┌─────────────┐  ┌─────────────────┐  ┌────────────────────────┐    │
│  │ Auth        │  │ Firestore       │  │ Storage                │    │
│  │ Google OAuth│  │ site/, models/, │  │ uploads de media       │    │
│  │             │  │ content/, user/,│  │                        │    │
│  │             │  │ siteUser/       │  │                        │    │
│  └─────────────┘  └─────────────────┘  └────────────────────────┘    │
│                          ▲                                           │
│  ┌─────────────────────  │  ────────────────────────────────┐        │
│  │   Functions v2 (Node) │                                  │        │
│  │   ──────────────────  │                                  │        │
│  │   Hono app                                              │        │
│  │   GET /api/:siteAppId/models                            │        │
│  │   GET /api/:siteAppId/content/:modelId                  │        │
│  │   GET /api/:siteAppId/content/:modelId/:contentId       │        │
│  │   Firebase Admin SDK ─┘                                 │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
       ▲
       │ HTTPS (público, sin auth hoy)
       │
┌──────┴────────────────────┐
│ Consumidor (Carlos)       │
│ Next.js / Astro / app     │
│ Front de cada sitio       │
└───────────────────────────┘
```

## Stack

| Capa            | Tecnología                                  | Por qué (ADR)                                         |
| --------------- | ------------------------------------------- | ----------------------------------------------------- |
| Frontend        | React 19, react-router-dom 7                | —                                                     |
| Bundler         | rolldown-vite (override)                    | [ADR 0005](../adr/0005-rolldown-vite.md)              |
| UI              | shadcn/ui + Radix + Tailwind v4             | [ADR 0003](../adr/0003-shadcn-radix-tailwind.md)      |
| Forms           | react-hook-form + zod                       | [ADR 0004](../adr/0004-react-hook-form-zod.md)        |
| Auth (cliente)  | firebase/auth + Google OAuth                | —                                                     |
| Almacén         | Firestore                                   | [ADR 0001](../adr/0001-firestore-as-backend.md)       |
| Files           | Firebase Storage                            | —                                                     |
| API REST        | Hono sobre Firebase Functions v2            | [ADR 0002](../adr/0002-hono-on-firebase-functions.md) |
| Hosting         | Firebase Hosting + rewrites a Functions     | —                                                     |
| Package manager | pnpm workspaces                             | [ADR 0006](../adr/0006-monorepo-pnpm-workspaces.md)   |
| Lint / format   | ESLint 9 + Prettier (con sort-imports)      | —                                                     |
| Commits         | Conventional Commits con scope (commitlint) | —                                                     |
| Tipos dominio   | `@lostrego/shared` (package interno)        | [ADR 0006](../adr/0006-monorepo-pnpm-workspaces.md)   |

## Flujo de una petición típica (Edu edita un post)

1. Edu abre `https://<dominio>/` → Firebase Hosting sirve `apps/web/dist/index.html` (SPA).
2. React arranca. `AuthProvider` escucha `onAuthStateChanged`. Si no hay sesión, redirige a `/login`.
3. Edu hace login con Google. `checkUserExistsAndUpdateAvatar` valida que su email exista en `user/` (whitelist).
4. `SiteProvider` carga `siteUser` filtrado por su `userRef` → resuelve los `site/` accesibles. Selecciona el guardado en `localStorage` o el primero.
5. Edu navega a `/models` → `useModels` query `models/` filtrado por `site == ref`.
6. Edu navega a `/content/:modelId/:contentId` → `contentService.getById` → form dinámico construido con `react-hook-form` + schema generado al vuelo con `zod` desde los `fields` del modelo.
7. Al guardar: `contentService.update(id, { data })` actualiza Firestore.

## Flujo de una petición del consumidor de API (Carlos pide content)

1. `GET /api/SITE_APPID/content/MODEL_APPID?pageSize=20`
2. Firebase Hosting reenvía a la Function `api` (rewrite en `firebase.json`).
3. Hono recibe la request adaptada desde `onRequest`.
4. `getSiteReference(siteAppId)` resuelve el `siteAppId` → DocumentReference.
5. `getModelByAppId(modelAppId, siteAppId)` resuelve el modelo.
6. `getContentByModelIdCursor(model.id, cursor, pageSize)` lista contenidos con paginación cursor.
7. Por cada `ContentItem`, transforma las claves de `data` de `fieldId` (interno) a `field.appId` (público).
8. Devuelve JSON `{ items, page, pageSize, hasNext, nextCursor, totalItems }`.

## Documentos detallados

- [`data-model.md`](data-model.md) — colecciones de Firestore y sus relaciones.
- [`auth-and-sites.md`](auth-and-sites.md) — flujo de autenticación y resolución de sitios.
- [`api-contract.md`](api-contract.md) — endpoints REST, payloads, errores.
- [`frontend.md`](frontend.md) — estructura de carpetas, contextos, hooks.
