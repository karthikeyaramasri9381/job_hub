import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/common/GoogleSignInButton';
import { User, Mail, Lock, AlertCircle, UserPlus, Building, Briefcase } from 'lucide-react';

const Register = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('CANDIDATE');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData, role };
      const res = await register(payload);
      if (res.success && res.data?.user) {
        if (res.data.user.role === 'RECRUITER') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/candidate/dashboard');
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.data && typeof errData.data === 'object') {
        const firstKey = Object.keys(errData.data)[0];
        const firstVal = errData.data[firstKey];
        const msg = Array.isArray(firstVal) ? firstVal[0] : firstVal;
        setError(`${firstKey.replace('_', ' ')}: ${msg}`);
      } else {
        setError(errData?.message || err.message || 'Registration failed. Please check input fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setError('');
    setLoading(true);
    try {
      const res = await googleLogin(idToken, role);
      if (res.success && res.data?.user) {
        if (res.data.user.role === 'RECRUITER') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/candidate/dashboard');
        }
      } else {
        setError(res.message || 'Google registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google registration failed server-side.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Your JobHub Account</h2>
          <p>Join thousands of candidates & hiring managers on JobHub</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-tab ${role === 'CANDIDATE' ? 'active' : ''}`}
            onClick={() => setRole('CANDIDATE')}
          >
            <Briefcase size={18} /> Candidate
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'RECRUITER' ? 'active' : ''}`}
            onClick={() => setRole('RECRUITER')}
          >
            <Building size={18} /> Recruiter / Employer
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (min 6 characters)</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> Register as {role === 'RECRUITER' ? 'Recruiter' : 'Candidate'}
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="google-auth-wrapper">
          <GoogleSignInButton
            role={role}
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
          />
        </div>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
