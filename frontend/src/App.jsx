import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Jobs from './pages/public/Jobs';
import JobDetails from './pages/public/JobDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import Applications from './pages/candidate/Applications';
import SavedJobs from './pages/candidate/SavedJobs';
import Interviews from './pages/candidate/Interviews';
import CandidateProfilePage from './pages/candidate/CandidateProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Candidate Protected Routes */}
            <Route
              path="/candidate/dashboard"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/applications"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/saved-jobs"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <SavedJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/interviews"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <Interviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate/profile"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE']}>
                  <CandidateProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
