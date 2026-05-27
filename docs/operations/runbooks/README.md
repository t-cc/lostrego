# Runbooks

Cómo recuperarse de problemas comunes. Aún sin contenido — añadir conforme aparezcan incidentes.

## Estructura propuesta

Un archivo por escenario, formato:

```markdown
# Runbook: <síntoma del problema>

## Síntomas

- Lo que ve el usuario / lo que aparece en logs.

## Diagnóstico

1. Comprueba X.
2. Comprueba Y.

## Solución

- Pasos concretos.

## Prevención

- Cómo evitar que vuelva a pasar.
```

## Candidatos (cuando ocurran)

- `api-500.md` — la API REST devuelve 500.
- `deploy-failed.md` — `firebase deploy` falla a mitad.
- `user-cannot-login.md` — un usuario válido no puede entrar.
- `firestore-quota.md` — superamos la cuota de lecturas.
- `bundle-too-big.md` — la build avisa de bundle > 500KB.
