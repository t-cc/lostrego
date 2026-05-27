# ADR 0004 — react-hook-form + zod para formularios dinámicos

- **Estado:** Aceptado (retrospectivo)
- **Fecha:** 2025-03-25
- **Decisores:** Tonio

## Contexto

El caso de uso central del CMS es **formularios cuyos campos no se conocen en tiempo de compilación**: cada `Model` define sus `fields[]` y la pantalla de edición de `ContentItem` debe construir el formulario al vuelo.

Necesitamos:

- Performance decente con formularios potencialmente grandes (uncontrolled inputs).
- Validación declarativa por tipo (text required, number rango, etc.).
- Integración limpia con shadcn `<Form>` (que ya envuelve `react-hook-form`).

## Decisión

Usamos **react-hook-form** para el estado del formulario y **zod** para validación. El schema zod se **construye dinámicamente** en cliente a partir de los `Field` del `Model`.

```ts
// Pseudocódigo del patrón actual en ContentForm.tsx
const schemaShape: Record<string, ZodTypeAny> = {};
for (const field of model.fields) {
  schemaShape[field.id] = zodForField(field); // por tipo
}
const schema = z.object(schemaShape);
const form = useForm({ resolver: zodResolver(schema) });
```

## Alternativas consideradas

- **Formik.** Estado controlado por defecto, más re-renders, menos popular en proyectos nuevos.
- **TanStack Form.** Atractivo pero menos maduro y sin la integración shadcn ya hecha.
- **Validar a mano sin zod.** Más verboso, peor DX con TypeScript.
- **JSON Schema + Ajv.** Más estándar para shapes dinámicos, pero peor DX y sin integración con shadcn.

## Consecuencias

**Positivas:**

- Cada tipo nuevo de `Field` se traduce a un trozo de zod en una sola función — los nuevos tipos se añaden en un solo sitio.
- Performance: react-hook-form es uncontrolled → menos re-renders.
- shadcn `<Form>` ya está pensado para este combo.

**Negativas / coste:**

- **Los tipos de zod dinámicos son un dolor:** hoy mismo hay un `// @ts-expect-error - Complex Zod type compatibility issue` en `ContentForm.tsx` (ver backlog). Es la versión "lite" del problema clásico de tipar shapes dinámicos.
- Validación 100% en cliente. **El backend (Functions / Firestore) no valida nada hoy.** Si alguien escribe directo en Firestore, no hay garantías.

**Compromisos asumidos:**

- **Mantener la validación dinámica solo en cliente** por ahora. Si añadimos escritura via API, debemos validar también allí (potencialmente compartiendo el schema zod entre paquetes — ver roadmap "tipos compartidos").
- Nuevos tipos de `Field` requieren: (1) componente de input, (2) entrada en el switch de `zodForField`, (3) entrada en el render.

## Referencias

- [`src/components/screens/Content/common/ContentForm.tsx`](../../src/components/screens/Content/common/ContentForm.tsx)
- [`src/components/ui/form.tsx`](../../src/components/ui/form.tsx)
- [`src/types/model.ts`](../../src/types/model.ts) (lista de tipos de field)
