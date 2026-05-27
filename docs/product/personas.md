# Personas

Tres personas identificables en el sistema actual. **Diana y Edu pueden ser la misma persona** en muchos
casos (un dev/admin que también edita contenido), pero conviene separarlas porque tendrán
roles distintos cuando exista sistema de roles (ver [roadmap](roadmap.md)).

---

## 1. Diana — Desarrolladora / Administradora del CMS

**Quién es:** dev front-end o full-stack del estudio. Conoce React, Firebase, sabe usar Postman.

**Qué hace en Lostrego:**

- Da de alta nuevos sitios (manualmente en Firestore, hoy — no hay UI para ello).
- Define los **modelos** y sus campos en la consola.
- Conecta un nuevo `siteUser` para que un cliente acceda.
- Consume la API REST desde el front que está construyendo.

**Dolor:**

- No hay UI para crear sitios ni para gestionar usuarios.
- La API no tiene autenticación, así que cualquiera con el endpoint puede leer.

---

## 2. Edu — Editor de contenido del cliente

**Quién es:** persona no técnica del cliente final. Trabajo: marketing, comms, o el propio dueño del negocio.

**Qué hace:**

- Entra con Google al CMS.
- Ve su sitio (o cambia entre los suyos si tiene varios).
- Crea, edita y borra entradas de contenido según los modelos que Diana le ha definido.
- Sube imágenes a la **media library**.

**Dolor:**

- Si Diana cambia el modelo, sus contenidos pueden quedar inconsistentes.
- No hay borradores ni previsualización (solo "guardado / publicado" inmediato).

---

## 3. Carlos — Consumidor de la API (front del cliente)

**Quién es:** otro desarrollador, o un servicio (build de Next.js, app móvil) que necesita los contenidos.

**Qué hace:**

- Llama a `GET /api/:siteAppId/models` para descubrir qué modelos hay.
- Llama a `GET /api/:siteAppId/content/:modelAppId?page=…` para listar entradas.
- Llama a `GET /api/:siteAppId/content/:modelAppId/:contentId` para una entrada concreta.

**Dolor:**

- La API es pública: cualquiera puede leerla.
- Sin SDK ni tipos exportados → tiene que reescribir tipos en su proyecto.
- Sin webhook ni invalidación de cache → tiene que rebuildear o hacer ISR a mano.

---

## Roles (futuro)

Va a existir un sistema de roles dentro de un site. Por ahora todos los que están en
`siteUser` pueden hacer todo en su sitio (modelo binario). Cuando entren los roles, una
misma persona (Diana=Edu) podrá llevar varios o uno solo según el caso.

Diseño concreto pendiente — entrará por un PRD propio cuando se aborde.

## Quién NO es persona (hoy)

### Visitante anónimo del front público

No es persona hoy. Nunca interactúa con Lostrego directamente — solo a través
del consumidor (Carlos).

**Cambiará en el futuro:** está previsto que el visitante anónimo pueda
interactuar con la API para **enviar formularios** (contacto, newsletter,
similares). Esto implicará añadir endpoints `POST` públicos con su propia
estrategia de protección (rate limit, captcha, validación). Cuando se
aborde, será un PRD nuevo.
