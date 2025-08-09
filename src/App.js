import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';

import AdminDashboard from './pages/AdminDashboard';
import SupportCases from './pages/SupportCases';

import { useAuth } from './hooks/useAuth'; // Custom hook to get user and role info

// Public Route (Login/Signup) or redirect if already authenticated
function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to='/home' replace />;
}

// Protected Route for authenticated users (normal user)
function PrivateRoute({ children }) {
  const { user, role } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  if (role !== 'user') return <Navigate to='/login' replace />; // restrict non-users
  return children;
}

// Protected Route for admins
function AdminRoute({ children }) {
  const { user, role } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  if (role !== 'admin') return <Navigate to='/login' replace />; // restrict non-admins
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
        <Route path='/signup' element={<PublicRoute><Signup /></PublicRoute>} />

        {/* User */}
        <Route path='/home' element={<PrivateRoute><Home /></PrivateRoute>} />

        {/* Admin */}
        <Route path='/admin-dashboard' element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path='/supportcases' element={<AdminRoute><SupportCases /></AdminRoute>} />

        {/* Redirect any unknown routes to login */}
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </Router>
  );
}

export default App;
