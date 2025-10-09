# Lostrego CMS - Firebase Functions API

Este proyecto incluye funciones de Firebase para exponer una API REST que proporciona acceso a los modelos y contenidos del CMS.

## Funciones Disponibles

### Endpoints

- `GET /` - Health check
- `GET /api/models` - Obtiene todos los modelos
- `GET /api/models/:modelId` - Obtiene un modelo específico por ID
- `GET /api/content/:modelId` - Obtiene todo el contenido de un modelo específico

### Ejemplos de Uso

#### Obtener todos los modelos

```bash
GET /api/models
```

#### Obtener un modelo específico

```bash
GET /api/models/{modelId}
```

#### Obtener contenido de un modelo

```bash
GET /api/content/{modelId}
```

## Configuración

### Variables de Entorno

Asegúrate de configurar las siguientes variables de entorno en Firebase Functions:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

## Despliegue

### Construir funciones

```bash
cd functions
pnpm build
```

### Desplegar funciones

```bash
cd functions
pnpm deploy
```

### Ejecutar en emulador local

```bash
cd functions
pnpm serve
```

## Tecnologías

- **Hono**: Framework web moderno y rápido para la API
- **Firebase Functions**: Plataforma serverless
- **Firebase Admin SDK**: Para acceder a Firestore
- **TypeScript**: Tipado estático para JavaScript

## Estructura del Proyecto

```
functions/
├── src/
│   ├── index.ts          # Punto de entrada de la función
│   ├── routes.ts         # Definición de rutas de la API
│   └── services/
│       └── contentService.ts  # Servicios para acceder a datos
├── package.json
├── tsconfig.json
└── lib/                 # Archivos compilados
```

## Desarrollo

Para desarrollar localmente:

1. Instala dependencias: `pnpm install`
2. Construye: `pnpm build`
3. Ejecuta pruebas o emulador

## Notas

La API está diseñada para ser consumida por aplicaciones externas que necesiten acceder a los datos del CMS sin requerir autenticación directa en Firebase.
