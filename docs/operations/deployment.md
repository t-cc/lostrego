# Deployment

Cómo se despliega Lostrego.

## Resumen

Todo a Firebase con `firebase deploy`. Tres targets:

- **Hosting:** SPA estática de `dist/`.
- **Functions:** la API REST (Hono).
- **(Pendiente) Rules:** `firestore.rules` y `storage.rules` aún no existen.

## Pre-requisitos

- `firebase-tools` instalado (`pnpm add -g firebase-tools` o usar `pnpm dlx firebase-tools`).
- Login: `firebase login`.
- Proyecto configurado: `.firebaserc` debe apuntar al projectId correcto.
- Node 24 (ver `.nvmrc`). Usar nvm: `nvm use`.
- pnpm para el root, **npm para `functions/`** [legacy — ver backlog].

## Variables de entorno

### Frontend (build-time)

Las variables `VITE_FIREBASE_*` se leen de `.env` al hacer `pnpm build`. Ver [`env.md`](env.md).

### Functions (runtime)

Hoy Functions usa **credenciales por defecto** (no requiere env vars adicionales en producción — Firebase Admin las resuelve solas).

## Deploy completo

```bash
# 1. Build del frontend
pnpm install
pnpm build  # tsc -b && vite build → genera dist/

# 2. Build de las functions
cd functions
npm install
npm run build  # tsc → genera lib/

# 3. Deploy
cd ..
firebase deploy
```

## Deploy parcial

```bash
firebase deploy --only hosting       # solo SPA
firebase deploy --only functions     # solo API
firebase deploy --only functions:api # una función concreta
firebase deploy --only hosting,functions
```

## Emulador local

```bash
cd functions
npm run serve  # build + emuladores de functions
```

Para emulador completo (Firestore + Auth + Storage + Functions): añadir `firebase emulators:start` con configuración (no presente hoy en `firebase.json` — pendiente).

## Rollback

No hay versionado automático. Para revertir:

1. Identifica el commit anterior bueno.
2. `git revert <hash>` o `git checkout <hash> -- src functions`.
3. `pnpm build && cd functions && npm run build && cd ..`.
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
- **Migrar functions a pnpm.**
- **Considerar `europe-west1`** como región si el público es europeo (ADR pendiente).
