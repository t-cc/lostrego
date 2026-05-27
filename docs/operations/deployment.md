# Deployment

Cómo se despliega Lostrego.

## Resumen

Todo a Firebase con `firebase deploy`. Tres targets:

- **Hosting:** SPA estática desde `apps/web/dist/`.
- **Functions:** la API REST (Hono) compilada en `apps/functions/lib/`.
- **(Pendiente) Rules:** `firestore.rules` y `storage.rules` aún no existen.

## Pre-requisitos

- `firebase-tools` instalado (`pnpm add -g firebase-tools` o usar `pnpm dlx firebase-tools`).
- Login: `firebase login`.
- Proyecto configurado: `.firebaserc` debe apuntar al projectId correcto.
- Node 24 (ver `.nvmrc`). Usar nvm: `nvm use`.
- **pnpm** para todo el monorepo (root, web y functions).

## Variables de entorno

### Frontend (build-time)

Las variables `VITE_FIREBASE_*` se leen de `apps/web/.env` (o `.env` del root como fallback de Vite) al hacer `pnpm build:web`. Ver [`env.md`](env.md).

### Functions (runtime)

Hoy Functions usa **credenciales por defecto** (no requiere env vars adicionales en producción — Firebase Admin las resuelve solas).

## Deploy completo

```bash
# Desde la raíz del monorepo
pnpm install           # instala todo (workspace único)
pnpm build             # builda shared + web + functions en orden
pnpm deploy            # firebase deploy
```

Equivalente al deploy manual:

```bash
pnpm --filter @lostrego/shared build      # primero shared (los demás dependen)
pnpm --filter @lostrego/web build         # genera apps/web/dist/
pnpm --filter @lostrego/functions build   # genera apps/functions/lib/
firebase deploy
```

## Deploy parcial

```bash
firebase deploy --only hosting       # solo SPA
firebase deploy --only functions     # solo API
firebase deploy --only functions:api # una función concreta
firebase deploy --only hosting,functions
```

> ⚠️ **Si cambiaste algo en `@lostrego/shared`** y haces deploy parcial, asegúrate de haber buildeado shared primero (`pnpm build:shared`) — si no, web/functions estarán desfasadas.

## Emulador local

```bash
pnpm --filter @lostrego/functions serve  # build + emuladores de functions
```

Para emulador completo (Firestore + Auth + Storage + Functions): añadir `firebase emulators:start` con configuración (no presente hoy en `firebase.json` — pendiente).

## Rollback

No hay versionado automático. Para revertir:

1. Identifica el commit anterior bueno.
2. `git revert <hash>` o `git checkout <hash> -- apps packages`.
3. `pnpm install && pnpm build`.
4. `firebase deploy`.

## Tras el deploy

- Verifica la SPA: abrir el dominio, login Google.
- Verifica la API: `curl https://<dominio>/api/<siteAppId>/models`.
- Si algo falla: `firebase functions:log`.

## Cosas a NO hacer

- **No despliegues sin `pnpm build` exitoso.** Si la build falla, no hagas deploy.
- **No despliegues directamente desde una feature branch.** Merge a `main` primero.
- **No despliegues los emuladores como producción.** Es un error tonto pero pasa.
- **No cambies el `firebase.json` sin coordinarte.** Rewrites y rutas afectan la API.

## Pendiente / mejoras

- **CI/CD:** GitHub Actions que ejecute deploy en merge a `main` (P3 backlog).
- **Reglas Firestore/Storage versionadas en el repo.**
- **Considerar `europe-west1`** como región si el público es europeo (ADR pendiente).
