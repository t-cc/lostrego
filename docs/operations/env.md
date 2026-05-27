# Variables de entorno

## Frontend (Vite)

Cualquier variable que el **frontend** lea debe empezar por `VITE_`. **Estas son públicas** (se inlinen en el bundle).

Ver [`env.example`](../../env.example):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### De dónde sacarlas

Firebase console → Project settings → "Your apps" → app web → Config snippet.

### Reglas

- Vivir en `.env` (gitignored). NO commitarlas.
- Mantén `env.example` sincronizado con la lista de variables.
- **Nada que sea secreto va en `VITE_*`** — todo lo `VITE_*` acaba en el bundle del navegador.

## Functions (runtime)

Hoy **no usa variables custom**. Firebase Admin SDK obtiene credenciales automáticamente:

- En producción: el service account de la function.
- En local con emulador: `GOOGLE_APPLICATION_CREDENTIALS` si quieres apuntar a un proyecto remoto, si no usa el emulador.

Si añadimos secrets (ej. API key para auth de la propia API), usar **Firebase Secrets**:

```bash
firebase functions:secrets:set MY_SECRET
```

Luego en la function:

```ts
import { defineSecret } from 'firebase-functions/params';

const mySecret = defineSecret('MY_SECRET');
// en onRequest: secrets: [mySecret]
// dentro del handler: mySecret.value()
```

## Entornos múltiples

**Hoy:** un solo proyecto Firebase = un solo entorno.

**Si se necesita staging:** crear un segundo proyecto y usar Firebase aliases:

```bash
firebase use --add  # añadir alias staging
firebase use staging
firebase deploy
```

Cada entorno necesitaría su propio `.env.staging`, `.env.production`, etc., y un script que copie el adecuado a `.env` antes del build. **Aún no necesario.**

## Local development

1. Copia `env.example` a `apps/web/.env` (o a `.env` del root — Vite lee ambos).
2. Rellena con valores del proyecto Firebase (los de dev o el único que hay).
3. `pnpm dev` arranca Vite (desde la raíz, despachado a `apps/web`).
4. Para probar la API local: en otra terminal `pnpm --filter @lostrego/functions serve`.

## Reglas duras

- **No commitar `.env`.** Está en `.gitignore`.
- **No leer `process.env`** en el frontend — usa `import.meta.env.VITE_*`.
- **Cualquier variable nueva → añadir a `env.example`** en el mismo PR.
