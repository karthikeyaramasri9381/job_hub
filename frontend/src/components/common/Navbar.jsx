import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, User, LogOut, ChevronDown, PlusCircle, LayoutDashboard, Bookmark, Calendar } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isCandidate, isRecruiter, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Briefcase className="brand-icon" />
          <span className="brand-text">Job<span className="brand-highlight">Hub</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/jobs" className="nav-link">Find Jobs</Link>
          
          {isAuthenticated && isRecruiter && (
            <>
              <Link to="/recruiter/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm">
                <PlusCircle size={16} /> Post a Job
              </Link>
            </>
          )}

          {isAuthenticated && isCandidate && (
            <>
              <Link to="/candidate/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/candidate/applications" className="nav-link">Applications</Link>
              <Link to="/candidate/saved-jobs" className="nav-link">Saved Jobs</Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <Link to="/admin/dashboard" className="nav-link">Admin Console</Link>
          )}

          {!isAuthenticated ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          ) : (
            <div className="profile-dropdown-container">
              <button 
                className="profile-btn" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar">
                  {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user?.first_name || user?.email?.split('@')[0]}</span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu" onClick={() => setDropdownOpen(false)}>
                  <div className="dropdown-header">
                    <p className="user-email">{user?.email}</p>
                    <span className="role-badge">{user?.role}</span>
                  </div>
                  <hr />
                  {isCandidate && (
                    <>
                      <Link to="/candidate/dashboard" className="dropdown-item">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link to="/candidate/profile" className="dropdown-item">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/candidate/saved-jobs" className="dropdown-item">
                        <Bookmark size={16} /> Saved Jobs
                      </Link>
                      <Link to="/candidate/interviews" className="dropdown-item">
                        <Calendar size={16} /> Interviews
                      </Link>
                    </>
                  )}
                  {isRecruiter && (
                    <>
                      <Link to="/recruiter/dashboard" className="dropdown-item">
                        <LayoutDashboard size={16} /> Recruiter Dashboard
                      </Link>
                      <Link to="/recruiter/company" className="dropdown-item">
                        <Briefcase size={16} /> Company Profile
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link to="/admin/dashboard" className="dropdown-item">
                      <LayoutDashboard size={16} /> Admin Overview
                    </Link>
                  )}
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
