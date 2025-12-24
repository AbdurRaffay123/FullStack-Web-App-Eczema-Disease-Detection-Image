import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ImageUpload from './pages/ImageUpload';
import ImageHistory from './pages/ImageHistory';
import SymptomLog from './pages/SymptomLog';
import Tips from './pages/Tips';
import Reminders from './pages/Reminders';
import Consultation from './pages/Consultation';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460]">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/upload" element={<ImageUpload />} />
                        <Route path="/images" element={<ImageHistory />} />
                        <Route path="/log" element={<SymptomLog />} />
                        <Route path="/tips" element={<Tips />} />
                        <Route path="/reminders" element={<Reminders />} />
                        <Route path="/consult" element={<Consultation />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toast />
          </div>
        </Router>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;