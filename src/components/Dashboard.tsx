import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import type { User } from '@/types/auth';
import { signOut } from 'firebase/auth';

interface DashboardProps {
  user: User;
}

function handleLogout() {
  signOut(auth);
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido de vuelta</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Cerrar sesión
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">Perfil</h3>
            <div className="mt-4 space-y-2">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-16 w-16 rounded-full"
                />
              )}
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
              <Button variant="secondary" className="w-full">
                Ver contenido
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
