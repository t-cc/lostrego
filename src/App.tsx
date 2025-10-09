import { useEffect } from 'react';

import { AddContent } from '@/components/screens/Content/Add';
import { EditContent } from '@/components/screens/Content/Edit';
import { ContentList } from '@/components/screens/Content/List';
import { Dashboard } from '@/components/screens/Dashboard';
import { Login } from '@/components/screens/Login';
import { Media } from '@/components/screens/Media';
import { AddModel } from '@/components/screens/Models/Add';
import { EditModel } from '@/components/screens/Models/Edit';
import { ListModels } from '@/components/screens/Models/List';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { modelService } from '@/lib/models';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

const ContentRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const models = await modelService.getAll();
        if (models.length > 0) {
          const sorted = [...models].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          navigate(`/content/${sorted[0].id}`, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error(error);
        navigate('/dashboard', { replace: true });
      }
    };
    load();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          user ? <Dashboard user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/media"
        element={
          user ? <Media user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/models"
        element={
          user ? <ListModels user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/models/add"
        element={
          user ? <AddModel user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/models/:id"
        element={
          user ? <EditModel user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/content"
        element={user ? <ContentRedirect /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/content/:modelId"
        element={
          user ? <ContentList user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/content/:modelId/add"
        element={
          user ? <AddContent user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/content/:modelId/:contentId"
        element={
          user ? <EditContent user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
