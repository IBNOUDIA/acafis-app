import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Finance        from './pages/Finance';
import Meetings       from './pages/Meetings';
import Members        from './pages/Members';
import Vote           from './pages/Vote';
import Documents      from './pages/Documents';
import Communications from './pages/Communications';
import Ndianda from './pages/Ndianda';
import ChangePassword from './pages/ChangePassword';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  console.log('URL ACTUELLE:', window.location.pathname);
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />
      <Route path="/profile/password" element={
        <PrivateRoute><ChangePassword /></PrivateRoute>
      } />
      <Route path="/project" element={
        <PrivateRoute><Ndianda /></PrivateRoute>
      } />
      <Route path="/payments" element={
        <PrivateRoute><Finance /></PrivateRoute>
      } />
      <Route path="/meetings" element={
        <PrivateRoute><Meetings /></PrivateRoute>
      } />
      <Route path="/members" element={
        <PrivateRoute><Members /></PrivateRoute>
      } />
      <Route path="/votes" element={
        <PrivateRoute><Vote /></PrivateRoute>
      } />
      <Route path="/documents" element={
        <PrivateRoute><Documents /></PrivateRoute>
      } />
      <Route path="/communications" element={
        <PrivateRoute><Communications /></PrivateRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}