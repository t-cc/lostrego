# Roadmap

> ⚠️ Roadmap propuesto a partir del backlog actual y huecos obvios del producto. Sujeto a confirmación.

## Now (0–4 semanas)

Endurecer lo que ya hay antes de añadir nada.

- **Auth en la API REST.** Hoy `invoker: public`. Plan: API key por `Site` o JWT. (Ver [PRD 005](../prd/005-public-rest-api.md), [backlog](../../work/backlog.md) P0.)
- **Limpiar bugs P0 de `work/backlog.md`:** `text-red-50`, `sort()` mutante, key en fragment, deps de servidor en frontend.
- **Unificar UI a castellano.** Decisión tomada (ver [`docs/design/i18n.md`](../design/i18n.md)); falta migrar literales en inglés.
- **Firestore rules + Storage rules** explícitas.

## Next (1–3 meses)

Producto más usable.

- **UI para gestionar Sites y SiteUsers** (hoy se hace en Firestore a mano).
- **Code splitting** + Error Boundary (P1 backlog).
- **Tests** mínimos (smoke + lógica de modelos/contenido). Ver [`docs/engineering/testing.md`](../engineering/testing.md).
- **Tipos compartidos** entre frontend y functions (eliminar drift). Posible monorepo / package shared (requiere ADR).
- **Pagination real en Media** (no `listAll`).
- **Borradores / preview** para `ContentItem` [SUPUESTO ↔ Edu].

## Later (3–12 meses)

Funcionalidades nuevas.

- **Roles dentro de un Site** (admin / editor / lector).
- **Webhooks** para invalidar cache del consumidor.
- **i18n del contenido** (no sólo de la UI).
- **Relaciones entre modelos** (`reference` field type → enlaza a otro `ContentItem`).
- **Historial / versionado** de contenido.
- **SDK TypeScript** auto-generado para consumidores de la API.

## Explícitamente fuera de roadmap

- Renderizado server-side de páginas (Lostrego es headless, punto).
- Marketplace de plugins.
- Self-hosting fuera de Firebase (cambiaría todo el modelo de despliegue).

> ⚠️ Pendiente de validar con el dueño del producto: prioridades reales, cuáles de los "Later" suben a "Next" según interés comercial.
