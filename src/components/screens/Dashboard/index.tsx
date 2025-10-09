import Layout from '@/components/layout/Layout';
import { menuItems } from '@/config/menu';
import type { User } from '@/types/auth';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const breadcrumbs = [{ label: 'Dashboard' }];
  return (
    <Layout menuItems={menuItems} user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6 py-2 px-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.displayName || 'User'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
            <div className="mt-4 space-y-2">
              {user.avatar ? (
                <img
                  src={`data:image/jpeg;base64,${user.avatar}`}
                  alt="Profile"
                  className="h-16 w-16 rounded-full"
                />
              ) : null}
              <p className="text-sm text-gray-600">
                <span className="font-medium">Nombre:</span>{' '}
                {user.displayName || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID:</span> {user.uid}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Estadísticas
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sesiones activas</span>
                <span className="font-semibold">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Último acceso</span>
                <span className="font-semibold">Ahora</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Contenido</h3>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                Este es el contenido protegido que solo pueden ver los usuarios
                autenticados.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Usa el menú lateral para navegar por las diferentes secciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
