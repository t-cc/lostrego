# Visión de producto

## Qué es Lostrego CMS

Lostrego es un **CMS headless multi-sitio** pensado para que un equipo pequeño
(estudio / agencia / dev solo) administre el contenido de varios sitios web desde
una sola consola, y exponga ese contenido a través de una **API REST pública**
para que cada front-end (Next.js, Astro, app móvil, etc.) la consuma.

Es un **producto pensado para abrirse al público**, no una herramienta interna.
Hoy lo usa al menos un cliente real (**Seragro**) y la intención es que más
clientes externos lo adopten.

## El problema que resuelve

Estudios pequeños construyen varios sitios para clientes. Cada cliente quiere
editar sus contenidos sin depender de despliegues. Soluciones existentes
(Strapi, Sanity, Contentful) son caras, sobredimensionadas para sitios
pequeños, o requieren mantener infraestructura propia.

Lostrego ofrece un punto medio:

- **Multi-tenant nativo** desde el primer día (un usuario, varios sitios).
- **Modelado libre** de tipos de contenido por sitio.
- **Coste casi cero** apoyándose en Firebase free tier.
- **Sin servidor propio** que mantener (Firestore + Functions + Hosting).

## Propuesta de valor

- **Para el dueño del estudio:** un solo panel para todos los clientes, sin SaaS por proyecto.
- **Para el cliente final:** editor web visual, sin tocar Git ni esperar despliegues.
- **Para el desarrollador del front:** API REST estable consumible desde cualquier framework.

## Clientes actuales

- **Seragro** — primer cliente real en producción.

(Lista que crecerá. Mantener al día.)

## Para quién NO es

- No es un sustituto de **WordPress**: no hay temas, plugins, ni renderizado de páginas. El front lo hace el consumidor.
- No es **Strapi enterprise**: no aspira a roles complejos, workflows de aprobación, ni i18n profundo (al menos por ahora).
- No es para **sitios de altísimo tráfico** que requieran CDN delante de la API.

## Principios

1. **El sitio (Site) es la unidad de aislamiento.** Todo dato pertenece a un sitio. El admin nunca mezcla datos entre sitios.
2. **Los modelos son del cliente, no del desarrollador.** Quien edita debe poder crear sus tipos de contenido sin tocar código.
3. **La API es contrato.** Cambiar la forma de la respuesta es una decisión consciente (ver ADRs).
4. **Firebase es un detalle de implementación.** No estamos casados con él para siempre, pero no migraremos sin razón fuerte.

## Estado actual

- En producción con Seragro.
- Stack estabilizado.
- Pendiente endurecer auth de la API y limpiar bugs P0/P1 del backlog.

## Horizonte

No definido todavía. La prioridad inmediata es endurecer y pulir lo que hay para que más
clientes externos puedan adoptarlo sin fricción.
