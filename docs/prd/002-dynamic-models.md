# PRD 002 — Modelos dinámicos con campos tipados

- **Estado:** Lanzado (retrospectivo)
- **Owner:** Tonio
- **Última actualización:** 2026-05-27
- **ADRs relacionados:** [0001](../adr/0001-firestore-as-backend.md), [0004](../adr/0004-react-hook-form-zod.md)

> ⚠️ PRD retrospectivo.

## 1. Problema

Cada cliente tiene tipos de contenido distintos: un blog necesita "Post", una agencia "Project", una tienda "Product". Un CMS rígido con tablas predefinidas no sirve.

Queremos que **el editor (no el dev) defina sus propios modelos** desde la UI.

## 2. Usuarios y casos de uso

- **Diana** define los modelos iniciales del sitio al onboardear un cliente.
- **Edu** retoca un modelo cuando aparece un caso nuevo (añadir campo "fecha de evento", marcar otro como "showInList").

User stories:

- Como Diana, quiero definir un modelo "Project" con campos `title`, `description`, `cover`, `published`.
- Como Diana, quiero marcar un campo como `useAsTitle` para que sea el visible en breadcrumbs/listas.
- Como Edu, quiero reordenar los campos para que el formulario tenga el orden que prefiero.
- Como Carlos (API), quiero que la respuesta JSON use los `appId` legibles, no los IDs internos.

## 3. Scope

### Dentro del scope

- Modelo `Model` con campos meta (`name`, `description`, `appId`, `previewUrl`).
- Campos (`fields[]`) tipados: `text`, `boolean`, `markdown`, `media`, `datetime`, `number`, `color`, `textList`.
- Flags por campo: `required`, `useAsTitle`, `showInList`, `order`.
- `appId` por campo para exposición en API.
- UI de creación/edición de modelos (`Models/Add`, `Models/Edit`).
- Prevención de borrado de modelos con contenido (commit `3318bda`).
- `appId` autogenerado desde el nombre (commit `4e303ff`).

### Fuera del scope (explícito)

- **Tipos de campo relacionales** (referencia a otro `ContentItem`). Roadmap "Later".
- **Validaciones custom** por campo (regex, longitud máxima…). Hoy solo `required` y mínimo según tipo.
- **Migración automática** al cambiar el tipo de un campo con contenido existente.
- **Versionado del schema del modelo.**

## 4. Criterios de aceptación

- [x] El editor define un modelo con N campos sin tocar código.
- [x] Cada `Field` tiene un `appId` único dentro del modelo.
- [x] Si un modelo tiene contenido, no se puede borrar.
- [x] El orden de los campos se respeta en formularios y listas.
- [x] La API expone los datos usando `field.appId` como clave.

## 5. Diseño

**Datos:**

- `Field` embebido en `Model.fields[]` (no es colección separada — los campos se editan junto al modelo).
- `id` del field = UUID generado en cliente, **estable** para que los `ContentItem.data[fieldId]` no rompan.

**UI:**

- Editor de modelo con lista de campos editables (añadir, borrar, reordenar, configurar tipo y flags).
- Componente por tipo de field en formulario de contenido: ver [`src/components/screens/Content/common/`](../../src/components/screens/Content/common/).

## 6. Decisiones tomadas

- **Campos embebidos en el modelo, no en colección aparte.** Razón: siempre se leen junto al modelo, son pocos, evita un join. Trade-off: si un modelo tiene 100 campos, el documento crece — aceptable para el caso esperado.
- **`Field.id` cliente-generated (UUID v4).** No depende de Firestore para identificar campos. Permite reordenar sin migración.
- **`Field.appId` separado de `Field.id`.** El `id` es estable (no se renombra nunca), el `appId` puede cambiarlo el editor — y ese cambio sí se propaga a las respuestas de la API.

## 7. Riesgos / abierto

- **Renombrar un `field.appId` rompe a los consumidores de la API** que dependan de esa clave. No hay aviso ni migración.
- **Cambiar el tipo de un field con contenido existente** deja datos en formato viejo. Hoy no hay protección.
- **El backend (Functions) no conoce `showInList`** — drift de tipos (ver backlog P1).
- **`@ts-expect-error` en `ContentForm.tsx`** alrededor del schema zod dinámico — los tipos no cuadran del todo.

## 8. Notas para agentes

- **Para añadir un nuevo tipo de field:**
  1. Añadir a la union de `Field.type` en `src/types/model.ts`.
  2. Añadir caso al `switch` que genera el schema zod en `ContentForm.tsx`.
  3. Crear componente input en `src/components/screens/Content/common/<Name>Field.tsx`.
  4. Añadir caso al renderizador.
  5. Sincronizar el tipo en `functions/src/services/contentService.ts`.
  6. Documentar en [`data-model.md`](../architecture/data-model.md).
- **Nunca cambies un `Field.id` existente** — rompe `ContentItem.data`.
- Si Field tiene `useAsTitle: true`, **es responsabilidad del UI** (no del backend) usarlo como título de la entrada.
