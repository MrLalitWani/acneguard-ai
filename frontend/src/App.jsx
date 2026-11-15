import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Assessment from './pages/Assessment';
import AIResults from './pages/AIResults';
import DietCheck from './pages/DietCheck';
import DietResults from './pages/DietResults';
import History from './pages/History';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Secure/Protected Pages */}
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <Layout>
                  <Assessment />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-results"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIResults />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-check"
            element={
              <ProtectedRoute>
                <Layout>
                  <DietCheck />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-results"
            element={
              <ProtectedRoute>
                <Layout>
                  <DietResults />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <History />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
