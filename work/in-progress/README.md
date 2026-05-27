# work/in-progress/

Una entrada por tarea activa. Vive aquí desde que se empieza hasta que se cierra.

## Formato

`<num-del-backlog>-<slug>.md`. Ejemplo: `3-fix-mediafield-asterisk-color.md`.

Estructura sugerida:

```markdown
# <Tarea>

- **Origen:** backlog #N
- **Owner:** <quién>
- **Empezada:** YYYY-MM-DD
- **Branch:** fix/<slug>

## Contexto

¿Qué problema resuelve?

## Plan

1. ...
2. ...

## Archivos que va a tocar

- ...

## Notas / hallazgos

(Se va llenando durante el trabajo.)

## Verificación

Cómo se prueba que está hecho.
```

## Reglas

- **No más de 2-3 entradas activas a la vez.** Si hay más, algo no se está cerrando.
- Si una tarea se bloquea: déjala aquí con "Bloqueada por: …" y muévete a otra.
- Al cerrar: mueve el archivo a `work/done/`, deja solo 1 línea (fecha + commit hash + branch / PR).
