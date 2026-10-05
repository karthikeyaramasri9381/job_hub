import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/common/GoogleSignInButton';
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectUser = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'CANDIDATE') navigate('/candidate/dashboard');
    else if (role === 'RECRUITER') navigate('/recruiter/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(formData);
      if (res.success && res.data?.user) {
        redirectUser(res.data.user.role);
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setError('');
    setLoading(true);
    try {
      const res = await googleLogin(idToken, 'CANDIDATE');
      if (res.success && res.data?.user) {
        redirectUser(res.data.user.role);
      } else {
        setError(res.message || 'Google login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed server-side.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Log in to your JobHub account to manage your profile & opportunities</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : (
              <>
                <LogIn size={18} /> Log In
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="google-auth-wrapper">
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
          />
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up on JobHub</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
