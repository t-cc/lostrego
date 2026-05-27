# ADR 0001 — Firestore como almacén primario

- **Estado:** Aceptado (retrospectivo)
- **Fecha:** 2025-03-25 (fecha inicial del repo)
- **Decisores:** Tonio

## Contexto

Lostrego es un CMS multi-sitio para un estudio pequeño. Restricciones de partida:

- Equipo pequeño / dueño único, sin tiempo para mantener infra.
- Coste tiene que tender a cero hasta que haya tracción.
- Latencia de lectura aceptable para front-ends consumiendo via API.
- Auth y storage tienen que venir "de fábrica".

## Decisión

Usamos **Firestore** como almacén único de datos (modelos, contenidos, sites, usuarios y permisos). Toda persistencia pasa por él. No hay base de datos relacional.

## Alternativas consideradas

- **PostgreSQL en Supabase / Neon.** Más expresivo (joins, transacciones, RLS) y con SQL estándar. Más infra que mantener; el plan free es generoso pero no tan barato como Firebase a escala cero.
- **DynamoDB.** Similar en NoSQL pero AWS añade complejidad de identidad y permisos.
- **MongoDB Atlas.** Free tier limitado, requiere conectar Auth externo.

## Consecuencias

**Positivas:**

- Auth + Firestore + Storage + Functions + Hosting bajo el mismo paraguas. Un solo proveedor, un solo `firebase.json`.
- SDK web maduro, listeners en tiempo real disponibles si los necesitamos más adelante.
- Coste a escala cero ~$0.

**Negativas / coste:**

- **Sin joins.** Las relaciones (site → models → content) se resuelven con queries adicionales en cliente.
- Modelo de datos NoSQL exige criterio: cuándo embeber (Fields embebidos en Model) y cuándo referenciar (Model.site → ref a Site).
- Limitaciones de queries (no `OR` arbitrario, índices compuestos para casi todo orderBy + where).
- **Vendor lock-in** medio: migrar a SQL implicaría reescribir queries y repensar el modelo.
- **Drift de tipos** entre cliente y backend: ambos definen sus propios `interface` (ver backlog P3).

**Compromisos asumidos:**

- Aceptamos pagar la complejidad de NoSQL a cambio del time-to-prod y el coste.
- Si llegamos a un punto donde necesitamos relaciones complejas o búsqueda full-text seria, **se abre un nuevo ADR** (potencialmente migrando contenidos a otra capa, dejando Firestore para auth/sites).

## Referencias

- [`src/lib/firebase.ts`](../../src/lib/firebase.ts)
- [`functions/src/services/contentService.ts`](../../functions/src/services/contentService.ts)
- [docs/architecture/data-model.md](../architecture/data-model.md)
