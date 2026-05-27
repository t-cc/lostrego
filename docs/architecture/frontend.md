# Frontend — estructura

SPA en React 19 + Vite. Punto de entrada: [`src/main.tsx`](../../src/main.tsx) → [`src/App.tsx`](../../src/App.tsx).

## Árbol

```
src/
├── App.tsx                 ← Routes + providers
├── main.tsx                ← ReactDOM.createRoot
├── index.css               ← Tailwind v4 + tokens shadcn
│
├── assets/
│   ├── lostrego.svg
│   └── icons/              ← SVGs (convención: iconos externos, no inline)
│
├── components/
│   ├── ui/                 ← shadcn components (button, dialog, form, …)
│   ├── layout/             ← Layout, MenuSidebar, NavUser
│   └── screens/            ← <----- rutas vivas (ver nota de convención más abajo)
│       ├── Login/
│       ├── Dashboard/
│       ├── Models/
│       │   ├── List/
│       │   ├── Add/
│       │   ├── Edit/
│       │   └── common/     ← compartido entre Add/Edit/List
│       ├── Content/
│       │   ├── List/
│       │   ├── Add/
│       │   ├── Edit/
│       │   └── common/
│       └── Media/
│
├── context/
│   ├── SiteContext.tsx     ← sites accesibles + currentSite
│   └── (AuthProvider vive dentro de hooks/useAuth.tsx)
│
├── hooks/
│   ├── useAuth.tsx
│   ├── useModels.tsx
│   └── use-mobile.ts
│
├── lib/
│   ├── firebase.ts         ← initializeApp + exports auth/db/storage/googleProvider
│   ├── siteService.ts      ← getUserSites, getSiteById
│   ├── models.ts           ← modelService.{getAll, getBySite, getById, create, update, delete}
│   ├── content.ts          ← contentService (idem)
│   ├── userService.ts      ← checkUserExistsAndUpdateAvatar
│   └── utils.ts            ← cn() de shadcn
│
├── types/
│   ├── auth.ts
│   ├── site.ts
│   ├── model.ts
│   ├── content.ts
│   └── layout.ts
│
└── config/
    └── menu.ts             ← items del sidebar
```

## Providers (orden importa)

```tsx
<BrowserRouter>
  <AuthProvider>
    {' '}
    // user + loading + error
    <SiteProvider>
      {' '}
      // depende de user
      <Routes>...</Routes>
    </SiteProvider>
  </AuthProvider>
</BrowserRouter>
```

## Rutas

| Path                           | Screen         | Notas                                                         |
| ------------------------------ | -------------- | ------------------------------------------------------------- |
| `/`                            | Redirect       | a `/dashboard` o `/login` según sesión.                       |
| `/login`                       | `Login`        |                                                               |
| `/dashboard`                   | `Dashboard`    | Placeholder con métricas hardcoded — ver backlog.             |
| `/media`                       | `Media`        |                                                               |
| `/models`                      | `Models/List`  |                                                               |
| `/models/add`                  | `Models/Add`   |                                                               |
| `/models/:id`                  | `Models/Edit`  |                                                               |
| `/content/:modelId`            | `Content/List` | `:modelId` aquí es el **document ID interno**, no el `appId`. |
| `/content/:modelId/add`        | `Content/Add`  |                                                               |
| `/content/:modelId/:contentId` | `Content/Edit` |                                                               |
| `*`                            | —              | **Falta catch-all 404** (ver backlog).                        |

## Patrón de ruta protegida (anti-patrón actual)

Cada `<Route element={…}>` repite:

```tsx
user ? <Screen user={user} /> : <Navigate to="/login" replace />;
```

Esto debe migrarse a un wrapper `<ProtectedRoute>` (ver backlog P1).

## Patrón de servicios (lib/\*)

Servicios exportan un objeto con métodos CRUD. Ejemplo: [`modelService`](../../src/lib/models.ts).

- **Reciben/devuelven tipos de `src/types/`.**
- **No conocen el contexto:** no leen `currentSite` por dentro. Quien llama pasa el `siteId`.
- **Hidratan timestamps:** convierten `Timestamp` de Firestore a `Date` antes de devolver.

## Patrón de hook (useX)

Wrap del servicio con state local. Ejemplo: [`useModels`](../../src/hooks/useModels.tsx).

```tsx
function useModels() {
  const { currentSite } = useSite();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  // ...
  return { models, loading, error, refetch };
}
```

Convención:

- Hook consume el contexto si la query depende de él.
- Expone `{ data, loading, error, refetch }`.
- Resetea state si cambia el `currentSite`.

## Formularios dinámicos

El caso interesante: [`Content/common/ContentForm.tsx`](../../src/components/screens/Content/common/ContentForm.tsx).

- Recibe un `Model` (con `fields[]`).
- Construye un **schema zod al vuelo** según los tipos de campo.
- Pasa el schema a `react-hook-form` via `zodResolver`.
- Renderiza un componente distinto por `field.type` (TextField, BooleanField, MediaField, MarkdownField, …).

**Cuidado:**

- Hay `// @ts-expect-error - Complex Zod type compatibility issue` en `ContentForm.tsx`. Esto enmascara un gap real de tipos (ver backlog).
- `model.fields?.sort(...)` muta el array — usar `[...fields].sort(...)` (P0 backlog).

## Convenciones de componentes

Ver [`docs/engineering/conventions.md`](../engineering/conventions.md). Resumen:

- Named exports.
- `function FooBar()` no arrow.
- Una screen = una carpeta = un `index.tsx`.
- Subcomponentes y helpers en la misma carpeta.

## Estado pendiente

- **Error Boundary** global: no existe.
- **Code splitting:** todas las screens se importan eagerly → bundle ~1MB (ver backlog P1).
- **Data caching:** cada `useX` refetch desde cero al montar; no hay TanStack Query ni similar.
