import Content from '@/components/screens/Content';
import { Dashboard } from '@/components/screens/Dashboard';
import { Login } from '@/components/screens/Login';
import Media from '@/components/screens/Media';
import AddModel from '@/components/screens/Models/Add';
import EditModel from '@/components/screens/Models/Edit';
import ListModels from '@/components/screens/Models/List';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

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
        element={
          user ? <Content user={user} /> : <Navigate to="/login" replace />
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
