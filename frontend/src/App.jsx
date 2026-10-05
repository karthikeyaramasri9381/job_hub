import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Temporary placeholder homepage
const HomePlaceholder = () => (
  <div style={{ padding: '80px 20px', textAlign: 'center' }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>
      Find the right opportunity for your future.
    </h1>
    <p style={{ color: '#475569', fontSize: '1.2rem', marginTop: '12px' }}>
      Connecting top software engineers & recruiters on JobHub.
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePlaceholder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
