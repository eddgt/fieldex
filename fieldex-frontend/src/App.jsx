import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/useAuth';
import Login from './features/auth/Login';
import Layout from './components/layout/Layout';
import Dashboard from './features/dashboard/Dashboard';
import ClientList from './features/clients/ClientList';
import ClientDetail from './features/clients/ClientDetail';
import ClientForm from './features/clients/ClientForm';
import VisitList from './features/visits/VisitList';
import VisitForm from './features/visits/VisitForm';
import VisitDetail from './features/visits/VisitDetail';
import UserList from './features/users/UserList';
import UserForm from './features/users/UserForm';
import NotificationList from './features/notifications/NotificationList';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><span className="text-slate-400">Cargando...</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/visits" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="clients" element={<ClientList />} />
        <Route path="clients/new" element={<ProtectedRoute adminOnly><ClientForm /></ProtectedRoute>} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="clients/:id/edit" element={<ProtectedRoute adminOnly><ClientForm /></ProtectedRoute>} />
        <Route path="visits" element={<VisitList />} />
        <Route path="visits/new" element={<VisitForm />} />
        <Route path="visits/:id" element={<VisitDetail />} />
        <Route path="visits/:id/edit" element={<VisitForm />} />
        <Route path="users" element={<ProtectedRoute adminOnly><UserList /></ProtectedRoute>} />
        <Route path="users/new" element={<ProtectedRoute adminOnly><UserForm /></ProtectedRoute>} />
        <Route path="users/:id/edit" element={<ProtectedRoute adminOnly><UserForm /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute adminOnly><NotificationList /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
