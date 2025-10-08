import Dashboard from '@/components/Dashboard';
import Login from '@/components/Login';
import Models from '@/components/Models';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Content from '@/screens/Content';
import Media from '@/screens/Media';
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
          user ? <Models user={user} /> : <Navigate to="/login" replace />
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
