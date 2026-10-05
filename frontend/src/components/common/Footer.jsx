import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="navbar-brand">
            <Briefcase className="brand-icon" />
            <span className="brand-text">Job<span className="brand-highlight">Hub</span></span>
          </Link>
          <p className="footer-desc">
            JobHub connects top talent with high-growth companies. Find your next career opportunity today.
          </p>
        </div>

        <div className="footer-links-group">
          <h4>For Candidates</h4>
          <Link to="/jobs">Browse Jobs</Link>
          <Link to="/candidate/dashboard">Candidate Dashboard</Link>
          <Link to="/candidate/profile">Profile & Resume</Link>
        </div>

        <div className="footer-links-group">
          <h4>For Employers</h4>
          <Link to="/recruiter/jobs/create">Post a Job</Link>
          <Link to="/recruiter/dashboard">Recruiter Dashboard</Link>
          <Link to="/recruiter/company">Company Setup</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} JobHub Recruitment Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
