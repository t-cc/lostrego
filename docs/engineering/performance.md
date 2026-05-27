# Performance

Budgets, problemas conocidos y reglas.

## Budgets

> ⚠️ Budgets propuestos. Ajustar con el dueño del producto.

| Métrica                         | Objetivo    | Hoy                      |
| ------------------------------- | ----------- | ------------------------ |
| JS bundle (gzipped)             | < 200 KB    | **~301 KB** (P1 backlog) |
| Time to interactive (3G fast)   | < 3s        | sin medir                |
| Petición media a API            | < 300ms p95 | sin medir                |
| Doc reads por carga de pantalla | < 5         | varía                    |

## Problemas conocidos (priorizados)

| Problema                                                     | Archivo                                                                                  | Prio |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---- |
| Sin code splitting (1 MB bundle)                             | [`src/App.tsx`](../../src/App.tsx)                                                       | P1   |
| `listAll()` carga todo Storage                               | [`src/components/screens/Media/index.tsx`](../../src/components/screens/Media/index.tsx) | P1   |
| Site fetching secuencial (`for...of` + `getDoc`)             | [`src/lib/siteService.ts`](../../src/lib/siteService.ts)                                 | P2   |
| `MenuSidebar` hace `modelService.getAll()` (todos los sites) | [`src/components/layout/MenuSidebar.tsx`](../../src/components/layout/MenuSidebar.tsx)   | P1   |
| No data caching (refetch al montar)                          | global                                                                                   | P2   |
| Sin paginación real de modelos en API                        | [`functions/src/routes.ts`](../../functions/src/routes.ts)                               | P3   |

## Reglas

### Lecturas a Firestore

- **Filtra por site siempre que sea posible.** Es la query principal.
- **Usa `Promise.all`** para fetches independientes. Nunca `for…of` con `await getDoc()`.
- **Pagina** si esperas más de ~50 items.
- **Evita `.count()`** en hot paths — caro. Lo hacemos solo en la 1ª petición cursor.

### Renders

- Lift state up solo lo necesario.
- `useMemo`/`useCallback` cuando dependes de identidad referencial. No "por si acaso".
- **No mutar arrays/objects en render** — `Array.sort()` muta (ver bug P0 con `model.fields.sort()`).

### Imágenes

- Hoy no hay optimización. Servimos lo que sube el usuario.
- [SUPUESTO mejora] Firebase Storage permite resizing extension; valorar cuando importe.
- Logo de site en base64 dentro de Firestore: **decisión cuestionable**. Considerar mover a Storage (backlog P3).

### Bundle

- Cuando llegue el code splitting:
  ```tsx
  const Dashboard = lazy(() => import('@/components/screens/Dashboard'));
  ```
  envolver `Routes` en `<Suspense fallback={…}>`.
- **No metas paquetes pesados en el árbol del login.** El usuario que aún no entró no debería bajar el editor de markdown.

### Functions

- `region: us-central1` por defecto. Si el público es ES/EU, **moverse a `europe-west1`** reduce latencia (cambio coordinado: ADR).
- `memory: 256MiB` es suficiente para los endpoints actuales.
- `maxInstances: 10` actúa como cap natural — no subir sin entender el coste.

## Medición

Hoy: ninguna instrumentación. Propuesta:

- **Sentry** o similar para errores y performance frontend (decidir con ADR si llegamos a meterlo).
- **Firebase Performance Monitoring** (gratis) — fácil de añadir.

> ⚠️ Pendiente decidir si invertimos en observabilidad o no.
