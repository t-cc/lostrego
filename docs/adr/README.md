# ADRs — Architecture Decision Records

Cada decisión técnica gorda se registra como un ADR numerado e inmutable.
La plantilla está en [`_template.md`](_template.md).

## Índice

| #                                          | Decisión                                         | Estado   |
| ------------------------------------------ | ------------------------------------------------ | -------- |
| [0001](0001-firestore-as-backend.md)       | Firestore como almacén primario                  | Aceptado |
| [0002](0002-hono-on-firebase-functions.md) | Hono dentro de Firebase Functions v2             | Aceptado |
| [0003](0003-shadcn-radix-tailwind.md)      | shadcn/ui + Radix + Tailwind para la UI          | Aceptado |
| [0004](0004-react-hook-form-zod.md)        | react-hook-form + zod para formularios dinámicos | Aceptado |
| [0005](0005-rolldown-vite.md)              | rolldown-vite (override) como bundler            | Aceptado |

## Reglas

- **Numeración:** `NNNN-kebab-case-slug.md`, 4 dígitos.
- **Inmutables una vez aceptados.** Si la decisión cambia, abre un ADR nuevo y marca el viejo como `Supersedido por ADR-XXXX`.
- **El PR que introduce el ADR es donde se discute.** Una vez mergeado, la decisión se considera firme.
- **Cualquier cambio de stack, dependencia gorda, o cambio estructural requiere ADR.**
