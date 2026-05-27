# ADR 0005 — rolldown-vite (override de Vite) como bundler

- **Estado:** Aceptado (retrospectivo)
- **Fecha:** 2025-03-25
- **Decisores:** Tonio

## Contexto

El proyecto usa Vite como bundler. En `package.json` vemos un override pnpm que sustituye `vite` por `rolldown-vite`:

```json
"pnpm": {
  "overrides": {
    "vite": "npm:rolldown-vite@7.1.14"
  }
}
```

`rolldown-vite` es la variante de Vite que reemplaza Rollup (JS) por **Rolldown** (Rust) como motor de bundling. Apuesta de futuro de Vite, aún en pre-1.0.

## Decisión

Mantenemos el override a `rolldown-vite@7.1.14`. Adoptamos la versión "early" porque:

- Tiempos de build/HMR notablemente mejores [SUPUESTO basado en claims públicos de Vite].
- API compatible con Vite estándar — si rompe, podemos quitar el override y volver a Rollup.

## Alternativas consideradas

- **Vite "estable" sobre Rollup.** Lo seguro. Más lento.
- **esbuild a pelo.** Menos features, sin plugin ecosystem.
- **Webpack / Rspack.** Innecesariamente complejos para una SPA.
- **Turbopack.** Pensado para Next, no se usa fuera bien.

## Consecuencias

**Positivas:**

- Builds y HMR más rápidos.
- Mismo API que Vite — ningún cambio en `vite.config.ts`.

**Negativas / coste:**

- **Riesgo de incompatibilidad** con plugins Vite que asuman APIs de Rollup específicas. Hoy usamos: `@vitejs/plugin-react-swc`, `@tailwindcss/vite`, `vite-plugin-svgr`. Todos ok hasta ahora.
- Una versión pinneada (`7.1.14`) — hay que decidir manualmente cuándo subirla.

**Compromisos asumidos:**

- Si algún plugin se rompe → primero quitamos el override (`pnpm overrides`), no migramos.
- Vigilar el [changelog de rolldown-vite](https://github.com/rolldown/vite) ocasionalmente.

## Referencias

- [`package.json`](../../package.json)
- [`vite.config.ts`](../../vite.config.ts)
