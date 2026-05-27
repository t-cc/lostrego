# ADR 0003 — shadcn/ui + Radix + Tailwind v4

- **Estado:** Aceptado (retrospectivo)
- **Fecha:** 2025-03-25
- **Decisores:** Tonio

## Contexto

Necesitamos un sistema de UI para un panel CMS interno (admin). Restricciones:

- Velocidad de prototipado alta.
- Accesibilidad de base (los componentes complejos como Select, Dialog, Tabs deben ser accesibles por defecto).
- No depender de una librería con tema fuerte impuesto (estilo Material).
- Posibilidad de **editar el componente** si hace falta — sin pelearse con `!important` ni APIs cerradas.
- Tipografía moderna sin pelear con CSS clásico.

## Decisión

Usamos **[shadcn/ui](https://ui.shadcn.com/)** (los componentes se copian al repo, no son una dependencia npm), construidos sobre **[Radix UI](https://www.radix-ui.com/)** como primitivas accesibles y **[Tailwind v4](https://tailwindcss.com/)** como sistema de estilos.

- Componentes shadcn viven en [`src/components/ui/`](../../src/components/ui/) — son código nuestro.
- Variables CSS de tokens (colores, radios) en [`src/index.css`](../../src/index.css).
- Soporte de dark mode estructural ya presente (sin toggle aún — ver backlog).

## Alternativas consideradas

- **Material UI / Mantine / Chakra.** Más completos out-of-the-box. Pero tematizar para que no parezca Material es trabajo, y los runtime CSS-in-JS pesan.
- **Headless UI + Tailwind.** Aceptable, pero Radix tiene más componentes complejos resueltos (Sheet, Dropdown, Tooltip).
- **CSS Modules sin Tailwind.** Más verboso, menos consistente al escalar.

## Consecuencias

**Positivas:**

- **Cero "magia de librería":** los componentes están en nuestro repo y se editan a placer.
- Accesibilidad de Radix gratis (focus management, ARIA, keyboard nav).
- Tailwind v4 con `@tailwindcss/vite` da builds rápidos.
- DX excelente con `class-variance-authority` y `clsx` para variantes.

**Negativas / coste:**

- Cada componente nuevo de shadcn hay que **añadirlo manualmente** (`pnpm dlx shadcn@latest add ...`) y revisarlo.
- Si Radix saca una breaking change, hay que actualizar nuestros componentes a mano.
- Tailwind v4 es relativamente nuevo: documentación de algunos plugins (`tw-animate-css`) puede estar verde.

**Compromisos asumidos:**

- **No introducir otras librerías de UI** (MUI, Chakra, Ant) sin un nuevo ADR.
- Para iconos: **lucide-react** (ya en package.json), salvo SVGs custom de marca que viven en `src/assets/icons/`.
- Para iconos personalizados: archivo SVG en `src/assets/icons/`, **nunca inline** (ver [`docs/design/ui-guidelines.md`](../design/ui-guidelines.md)).

## Referencias

- [`components.json`](../../components.json)
- [`src/components/ui/`](../../src/components/ui/)
- [`src/index.css`](../../src/index.css)
- [docs/design/ui-guidelines.md](../design/ui-guidelines.md)
