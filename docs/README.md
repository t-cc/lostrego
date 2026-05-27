# Documentación de Lostrego CMS

Esta carpeta contiene **toda la documentación viva** del proyecto.
El punto de entrada para agentes está en [`/AGENTS.md`](../AGENTS.md).

## Mapa

```
docs/
├── product/         ← qué construimos y para quién (vision, personas, glossary, roadmap)
├── prd/             ← Product Requirements Documents — uno por feature
├── adr/             ← Architecture Decision Records — decisiones técnicas con su porqué
├── architecture/    ← cómo está construido HOY (vivo, debe seguir al código)
├── design/          ← UI, UX, i18n
├── engineering/     ← convenciones, seguridad, performance, testing, workflow
└── operations/      ← deployment, variables, runbooks
```

Y fuera de `docs/`:

- [`/AGENTS.md`](../AGENTS.md) — guía para agentes.
- [`/work/`](../work/) — backlog vivo y tareas en curso/hechas.

## Convenciones de documentación

- **Idioma:** la documentación se escribe en castellano. El código y los identificadores van en inglés. La UI del producto va en castellano (ver [`design/i18n.md`](design/i18n.md)).
- **Inferencias:** los documentos marcados con `[SUPUESTO]` o un bloque `> ⚠️ Pendiente de confirmar` son inferencias del agente a partir del código, no afirmaciones del dueño del producto. Hay que revisarlos.
- **Foto vs decisión:**
  - `architecture/` describe el estado **actual** del sistema. Si el código cambia, esto se actualiza.
  - `adr/` describe **decisiones** en un momento dado. Una vez firmadas, no se reescriben — se supersede con un nuevo ADR.
- **Plantillas:**
  - PRD: [`prd/_template.md`](prd/_template.md)
  - ADR: [`adr/_template.md`](adr/_template.md)

## Por dónde empezar a leer

| Si eres…                                        | Lee primero                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| Un agente que va a implementar algo             | `/AGENTS.md`                                                             |
| Un humano nuevo en el proyecto                  | `product/vision.md` → `product/glossary.md` → `architecture/overview.md` |
| Alguien que quiere entender por qué se eligió X | `adr/`                                                                   |
| Alguien que va a desplegar                      | `operations/deployment.md`                                               |
