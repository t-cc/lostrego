# PRD 004 — Biblioteca de medios

- **Estado:** Lanzado (retrospectivo, con deuda conocida)
- **Owner:** Tonio
- **Última actualización:** 2026-05-27
- **ADRs relacionados:** —

> ⚠️ PRD retrospectivo.

## 1. Problema

Los modelos pueden tener campos de tipo `media`. El editor necesita un sitio donde subir, ver y borrar archivos, y un picker desde el formulario de contenido.

## 2. Usuarios y casos de uso

- **Edu** sube las imágenes que va a usar en sus posts.

User stories:

- Como Edu, quiero subir una imagen arrastrándola al panel.
- Como Edu, quiero ver miniaturas de las imágenes subidas.
- Como Edu, quiero borrar una imagen que ya no uso.
- Como Edu, quiero elegir una imagen ya subida cuando edito un campo `media`.

## 3. Scope

### Dentro del scope

- Pantalla `/media` con grid de archivos.
- Upload con drag-and-drop (`UploadArea`).
- Borrado con confirmación.
- Picker desde el formulario (`MediaField`).
- Paginación visible (aunque hoy es client-side slicing).

### Fuera del scope

- **Aislamiento por site** [SUPUESTO]: el bucket parece compartido — pendiente confirmar / decidir.
- **Edición de imagen** (crop, resize).
- **Categorías o tags** de medios.
- **Búsqueda por nombre** en la librería.
- **Limites de tamaño** explícitos.

## 4. Criterios de aceptación

- [x] Subir un archivo arrastrándolo.
- [x] Ver progreso de upload.
- [x] Borrar archivo desde el grid.
- [x] Seleccionar archivo desde el formulario.
- [ ] Borrado pide confirmación con `AlertDialog` (hoy usa `window.confirm` — backlog P2).
- [ ] Paginación real server-side (hoy `listAll` carga todo — backlog P1).

## 5. Diseño

- **Storage:** Firebase Storage.
- **Componentes:** [`src/components/screens/Media/`](../../src/components/screens/Media/) — `index.tsx`, `UploadArea.tsx`, `FileGrid.tsx`, `FileItem.tsx`, `Pagination.tsx`, `UploadProgress.tsx`.
- **Picker en formularios:** [`src/components/screens/Content/common/MediaField.tsx`](../../src/components/screens/Content/common/MediaField.tsx).

## 6. Decisiones tomadas

- **Firebase Storage** como backend de archivos (decisión implícita del stack).
- **Paginación client-side `listAll()`** como solución temporal — coste real cuando el bucket crece.

## 7. Riesgos / abierto

- **`listAll()` no escala.** Con cientos de archivos, lentitud + coste.
- **Sin `storage.rules`** desplegadas.
- **`window.confirm`** en borrado rompe consistencia (resto del CMS usa `AlertDialog`).
- **No queda claro si los archivos están aislados por site.** Si no lo están, un cliente puede ver/usar archivos de otro.

## 8. Notas para agentes

- Antes de tocar nada de Media: confirma con humano si **el bucket es compartido o per-site**. Si es compartido, hay un riesgo de aislamiento que afecta a [PRD 001](001-multi-site.md).
- Para la migración a paginación real: usar `list(opts)` con `maxResults` y `pageToken` de Firebase Storage.
- Borrar `window.confirm` → usar el mismo patrón que `Models/List` (AlertDialog).
