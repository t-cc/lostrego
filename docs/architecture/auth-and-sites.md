# Autenticación y resolución de sitios

Cómo se autentica un usuario y cómo se decide a qué sitios tiene acceso.

## Login

- **Único método:** Google OAuth (Firebase Auth, `GoogleAuthProvider`).
- **Pantalla:** [`src/components/screens/Login/index.tsx`](../../src/components/screens/Login/index.tsx).
- Tras `signInWithPopup`, Firebase Auth emite un `firebaseUser`.

## Validación de identidad — whitelist

[`src/hooks/useAuth.tsx`](../../src/hooks/useAuth.tsx) escucha `onAuthStateChanged`. Al detectar `firebaseUser`:

1. Toma `firebaseUser.email`.
2. Llama a [`checkUserExistsAndUpdateAvatar(email, photoURL)`](../../src/lib/userService.ts).
3. Esa función hace `getDoc(doc(db, 'user', email))`:
   - Si **no existe**, lanza `'User not authorized. Please contact administrator.'` → se hace `signOut` y se muestra error.
   - Si **existe**, se sigue. Si el usuario no tenía `avatar`, se descarga `photoURL`, se convierte a base64 y se guarda en su documento. (Es ineficiente — ver backlog.)

**Implicación:** crear un usuario es **manual en Firestore**. No hay UI ni proceso de invitación.

## Resolución de sitios accesibles

[`src/context/SiteContext.tsx`](../../src/context/SiteContext.tsx) escucha el `user` y llama a [`getUserSites(email)`](../../src/lib/siteService.ts):

1. Construye `userRef = doc(db, 'user', email)`.
2. Query: `collection('siteUser') where user == userRef`.
3. Deduplica las `site` references resultantes.
4. Por cada `siteRef`, hace `getDoc` (uno a uno — ver backlog P1: paralelizar con `Promise.all`).
5. Ordena por `name`.

El `SiteContext` expone:

- `sites` — lista de sites accesibles.
- `currentSite` — el seleccionado actualmente.
- `setCurrentSite(site)` — persiste en `localStorage('currentSite')`.

**Restauración:** al cargar, intenta restaurar `localStorage.currentSite`; si no existe o no está accesible, selecciona el primero.

## Modelo de permisos

Hoy es **binario por sitio**:

- ¿Existe un `siteUser` con tu `userRef` y un `siteRef`? → puedes hacer todo en ese sitio.
- ¿No existe? → no puedes verlo.

**No hay roles** (admin vs editor vs lector). [SUPUESTO] Está en el roadmap "Later".

## Auth en la API REST pública

**Hoy:** ninguna. `onRequest` está configurado con `invoker: 'public'` y `cors: true`. Cualquiera con la URL puede leer todos los modelos y contenidos.

**Pendiente (P0 backlog):** ver [PRD 005](../prd/005-public-rest-api.md) y el bloque de seguridad en [`docs/engineering/security.md`](../engineering/security.md).

## Casos borde conocidos

- **Usuario con email pero sin documento en `user/`:** se hace `signOut` y se muestra mensaje. ✓
- **Usuario sin `siteUser`:** entra al CMS pero el `SiteSwitcher` está vacío y no puede hacer nada. [SUPUESTO] Conviene una pantalla "No tienes acceso a ningún sitio".
- **Google account sin email:** `signOut` inmediato.
- **Token expirado durante uso:** Firebase Auth lo refresca silenciosamente; si falla, `onAuthStateChanged` emite `null` y se redirige a `/login`.

## Cosas a NO romper

- El **document ID del usuario es el email**. Si cambias eso, se rompe la whitelist y la query de `siteUser`.
- El **`localStorage.currentSite`** guarda el `id` Firestore, no el `appId`. Cambiar a `appId` requeriría migración.
