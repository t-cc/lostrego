# Testing

## Estado actual

**Cero tests.** Cero configuración de testing.

No es una omisión sin justificación: el proyecto es pequeño, un solo dueño, evoluciona rápido, y los tests apresurados ralentizan sin aportar (los modelos y schemas cambian seguido).

## Cuándo añadirlos

**Triggers para empezar a testear:**

1. Tres veces seguidas que un cambio rompe algo "viejo" → tenemos suficientes regresiones para justificar tests.
2. Entra un segundo dev → ya no basta con confianza personal.
3. La API REST gana un consumidor externo → su contrato necesita garantías.
4. Mutaciones desde la API (si se añade) → validación crítica.

## Estrategia propuesta (cuando llegue el momento)

> ⚠️ Propuesta a confirmar con ADR cuando se aborde.

### Capa 1 — Tests unitarios de lógica pura

- **Herramienta:** Vitest.
- **Qué:** transformación de `data[fieldId]` → `data[fieldAppId]` en `routes.ts`, builder del schema zod dinámico, helpers.
- **Coste:** bajo, ROI alto.

### Capa 2 — Tests de integración de la API

- **Herramienta:** Vitest + Firebase Emulator Suite.
- **Qué:** golden path de cada endpoint contra Firestore emulado.
- **Coste:** medio, ROI alto.

### Capa 3 — Tests de UI

- **Herramienta:** Playwright (más útil que React Testing Library para flows reales del CMS).
- **Qué:** smoke de login → seleccionar site → crear contenido → borrar.
- **Coste:** alto, ROI medio. Empezar con 2-3 flows críticos.

### Lo que NO

- **No tests "por cobertura".** Cobertura no es señal.
- **No mockear Firestore con jest.mock.** Si necesitamos, usamos el emulador.
- **No snapshots de componentes** sin un motivo (frágiles, no aportan).

## Convención

Cuando lleguen tests:

- Archivos: `Foo.test.ts` o `Foo.test.tsx` junto al archivo testeado.
- Helpers: `__tests__/` solo si es necesario (preferimos colocar).
- Una test suite por unidad lógica.
- Setup en `vitest.config.ts` + un `setup.ts` para `firebase-mock` / emulador.

## Hasta entonces

- **Pre-commit es el safety net.** ESLint + Prettier + tsc deben pasar.
- **Type checking en CI** debe estar activo (revisa que `pnpm build` pasa).
- **Trabajo manual:** cada PR no trivial → probar el camino dorado manualmente antes de mergear.
