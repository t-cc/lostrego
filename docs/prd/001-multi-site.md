# PRD 001 — Multi-sitio (un admin, varios sitios)

- **Estado:** Lanzado (retrospectivo)
- **Owner:** Tonio
- **Última actualización:** 2026-05-27
- **ADRs relacionados:** [0001](../adr/0001-firestore-as-backend.md)

> ⚠️ PRD retrospectivo, inferido del código. Marcado [SUPUESTO] lo que necesita validación.

## 1. Problema

Un estudio (o un dev solo) gestiona varios sitios web para distintos clientes. No queremos:

- Una instancia de CMS por sitio (mantenimiento, coste, fricción).
- Mezclar contenidos entre clientes (riesgo de fuga, confusión visual).

Queremos: **una sola app de admin que entiende el concepto de "sitio" y aísla todo por él**.

## 2. Usuarios y casos de uso

- **Diana (dev/admin):** invita a un cliente a su sitio sin darle acceso al resto.
- **Edu (editor):** ve solo su sitio (o cambia entre los suyos si tiene varios encargos).

User stories:

- Como Diana, quiero dar acceso a Edu solo a `clientes-cliente1.com` para que no vea los datos de los demás clientes.
- Como Edu, si tengo acceso a 2 sitios, quiero cambiar entre ellos desde un selector visible.
- Como Edu, quiero que al volver mañana, el CMS recuerde qué sitio tenía abierto.

## 3. Scope

### Dentro del scope

- Concepto de `Site` con `id`, `name`, `logo`, `appId` (slug público).
- Relación N-a-N `siteUser` que decide acceso.
- `SiteSwitcher` en el sidebar.
- Persistencia del site activo en `localStorage`.
- Filtrado de modelos y contenidos por site en el CMS.
- API REST con `siteAppId` en la URL.

### Fuera del scope (explícito)

- **UI para crear/editar sitios desde el CMS.** Hoy se hace a mano en Firestore.
- **Roles dentro de un sitio.** Hoy es binario (tienes acceso o no).
- **Branding por sitio en el admin** más allá del logo en el switcher.

## 4. Criterios de aceptación

- [x] Un usuario sin documento en `user/` no puede entrar.
- [x] Un usuario sin `siteUser` no ve ningún sitio.
- [x] Las queries de `models` filtran siempre por `currentSite`.
- [x] El `SiteSwitcher` muestra solo sitios del usuario actual.
- [x] La API REST resuelve `siteAppId` → `Site` antes de listar nada.
- [ ] El admin tiene una pantalla "no tienes acceso a ningún sitio" — **falta**.

## 5. Diseño

**Datos** (ver [data-model.md](../architecture/data-model.md)):

- `site/` colección.
- `siteUser/` colección con `user` y `site` refs.
- `models.site` y `(content embebido en model via modelId)` → aislamiento implícito.

**UI:**

- Switcher en cabecera del sidebar ([`src/components/ui/site-switcher.tsx`](../../src/components/ui/site-switcher.tsx)).
- Filtrado por `currentSite` en hooks como [`useModels`](../../src/hooks/useModels.tsx).

**API:**

- Path param `:siteAppId` en todos los endpoints `/api/`.

## 6. Decisiones tomadas

- **`appId` ≠ `id`:** `appId` es slug elegido por humano, `id` es Firestore docId. La API usa `appId`. Razón: que la URL pública sea legible y estable.
- **Email como documentId de `user/`:** simplifica la query de pertenencia y elimina un mapping. Coste: cambiar email = crear usuario nuevo (aceptable para este volumen).
- **`localStorage` para persistir current site:** no es estado de servidor, no merece ir a Firestore.

## 7. Riesgos / abierto

- **Sin UI para sitios y usuarios:** alta fricción para invitar a un cliente. Roadmap "Next".
- **Sin "no autorizado" UX limpio:** un usuario válido pero sin `siteUser` cae en limbo.
- **Filtrado por site se hace en cliente:** un cliente malicioso podría hacer queries directas a Firestore. Mitigación pendiente con `firestore.rules` (ver `engineering/security.md`).

## 8. Notas para agentes

- Cualquier query nueva que liste contenido **debe filtrar por `currentSite`** (excepto la API REST, que recibe `siteAppId` explícito).
- `MenuSidebar.tsx` aún tiene un bug: el botón "Content" llama a `modelService.getAll()` (todos los sitios) en vez de `getBySite(currentSite.id)`. Backlog P1.
- Si añades un endpoint nuevo a la API, **debe llevar `:siteAppId` en el path**.
