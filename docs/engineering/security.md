# Seguridad

> Estado actual: insuficiente. Este documento es a la vez snapshot y plan.

## Estado actual

| Capa              | Hoy                                                      | Riesgo                                        |
| ----------------- | -------------------------------------------------------- | --------------------------------------------- |
| Auth de admin     | Google OAuth + whitelist `user/`                         | OK                                            |
| `firestore.rules` | **No existen** (default deny en prod, pero no explícito) | Medio                                         |
| `storage.rules`   | **No existen**                                           | Medio                                         |
| API REST          | `invoker: public`, sin auth, sin rate limit              | **Alto (P0)**                                 |
| Secrets           | `.env` con `VITE_*` (público al cliente por diseño)      | OK por diseño                                 |
| CORS              | Abierto en API (`cors: true`)                            | Aceptable mientras API sea pública por diseño |

## Reglas duras

1. **Nunca commitar `.env`.** Está en `.gitignore`. `env.example` es la referencia.
2. **Cualquier endpoint nuevo de la API debe pensar en auth desde el día 1.**
3. **`firestore.rules` debe escribirse antes de cualquier mutación cliente que aún no esté.**
4. **Variables `VITE_*` son públicas.** Nunca metas claves de servidor con prefijo `VITE_`.

## Plan: endurecer la API (P0)

Opciones a evaluar con ADR cuando se aborde:

### A. API key por Site

- Cada `Site` tiene una `apiKey` (en Firestore, no expuesta al frontend admin).
- Consumidores la pasan en header `X-API-Key`.
- Pros: simple, suficiente para el caso "Carlos consume nuestra API".
- Contras: si la key se filtra, hay que rotar.

### B. Firebase Auth tokens

- Consumidores autentican como un service account.
- Pros: ya tenemos Firebase Auth.
- Contras: complica al consumidor (no es trivial desde un build SSG).

### C. JWT custom

- Emitir tokens firmados con claims `site` y `scope`.
- Pros: granularidad.
- Contras: infra propia (key management, rotación).

**Recomendación por defecto:** A. Es lo más sencillo y suficiente.

## Plan: Firestore rules (P1)

Borrador a desarrollar:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // user/ — solo el propio usuario puede leerse
    match /user/{email} {
      allow read: if request.auth != null && request.auth.token.email == email;
      allow write: if false; // se crea fuera de banda
    }

    // siteUser/ — solo el usuario implicado puede leer
    match /siteUser/{id} {
      allow read: if request.auth != null
                  && resource.data.user == /databases/$(database)/documents/user/$(request.auth.token.email);
      allow write: if false;
    }

    // site/ — un usuario puede leer un site solo si tiene un siteUser
    match /site/{siteId} {
      allow read: if request.auth != null
                  && exists(/databases/$(database)/documents/siteUser/...);
      allow write: if false;
    }

    // models/, content/ — análogo, vía site
    // …
  }
}
```

> ⚠️ Esto es un borrador. Requiere ADR antes de desplegar.

## Plan: Storage rules (P1)

- Restringir uploads al usuario autenticado.
- Restringir lectura según pertenencia a site (si los archivos se aíslan por site — ver [PRD 004](../prd/004-media-library.md) abierto).

## Plan: rate limit (P2)

- Cuando se cierre la API con auth, considerar Cloudflare delante o middleware en Hono.
- Hoy `maxInstances: 10` actúa como cap natural (suficiente).

## Cosas que NO debes hacer

- **No relajes `firestore.rules`** "para que funcione mientras pruebo". Usa el emulador.
- **No subas la versión de `firebase-functions` o `firebase-admin`** sin probar que la API sigue respondiendo (cambios menores rompen tipos).
- **No expongas un endpoint nuevo en la API sin auth.** Si tienes que demoarlo así, abre un ticket en el backlog antes del merge.

## Auditoría

No hay aún. Cuando se establezca CI: integrar `pnpm audit` mínimo, escalando a Snyk si crece.
