# PRDs — Product Requirements Documents

Un PRD por feature. Pequeño, vivo, accionable. La plantilla está en [`_template.md`](_template.md).

## Índice

| #                             | Feature                               | Estado  |
| ----------------------------- | ------------------------------------- | ------- |
| [001](001-multi-site.md)      | Multi-sitio (un admin, varios sitios) | Lanzado |
| [002](002-dynamic-models.md)  | Modelos dinámicos con campos tipados  | Lanzado |
| [003](003-content-crud.md)    | Gestión de contenido (CRUD)           | Lanzado |
| [004](004-media-library.md)   | Biblioteca de medios                  | Lanzado |
| [005](005-public-rest-api.md) | API REST pública                      | Lanzado |

## Cómo se usa

- **Antes de implementar una feature nueva:** crea `NNN-slug.md` copiando `_template.md`, rellena Problema/Scope/Criterios, y abre PR con SÓLO el PRD para alinear antes de codear.
- **Durante el desarrollo:** mantén "Decisiones tomadas" al día.
- **Al cerrar:** marca estado "Lanzado" y enlaza el PR/release final.
- **Si la feature evoluciona mucho:** mejor un nuevo PRD que reescribir el viejo.
