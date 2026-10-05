import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, CheckCircle, Clock, Calendar, Bookmark, Eye, AlertCircle, Award } from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsRes, savedRes, intRes] = await Promise.all([
          candidateService.getApplications(),
          candidateService.getSavedJobs(),
          candidateService.getInterviews(),
        ]);

        if (appsRes.success) setApplications(appsRes.data || []);
        if (savedRes.success) setSavedJobs(savedRes.data || []);
        if (intRes.success) setInterviews(intRes.data || []);
      } catch (err) {
        console.error("Failed to load candidate dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalApps = applications.length;
  const underReview = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
  const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED').length;
  const interviewCount = interviews.length;
  const selectedCount = applications.filter((a) => a.status === 'SELECTED').length;
  const savedCount = savedJobs.length;

  const getStatusBadge = (status) => {
    const badgeMap = {
      APPLIED: { label: 'Applied', class: 'badge-blue' },
      UNDER_REVIEW: { label: 'Under Review', class: 'badge-orange' },
      SHORTLISTED: { label: 'Shortlisted', class: 'badge-purple' },
      INTERVIEW: { label: 'Interview', class: 'badge-teal' },
      SELECTED: { label: 'Selected', class: 'badge-green' },
      REJECTED: { label: 'Rejected', class: 'badge-red' },
      WITHDRAWN: { label: 'Withdrawn', class: 'badge-gray' },
    };
    const badge = badgeMap[status] || { label: status, class: 'badge-gray' };
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}>Loading candidate dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Welcome back, {user?.first_name || 'Candidate'}!</h2>
          <p>Track your job applications, saved listings, and scheduled interviews</p>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/jobs" className="btn btn-primary btn-sm">Find New Jobs</Link>
          <Link to="/candidate/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue"><Briefcase size={22} /></div>
          <div>
            <h3>{totalApps}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange"><Clock size={22} /></div>
          <div>
            <h3>{underReview}</h3>
            <p>Under Review</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-purple"><Award size={22} /></div>
          <div>
            <h3>{shortlisted}</h3>
            <p>Shortlisted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-teal"><Calendar size={22} /></div>
          <div>
            <h3>{interviewCount}</h3>
            <p>Interviews Scheduled</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green"><CheckCircle size={22} /></div>
          <div>
            <h3>{selectedCount}</h3>
            <p>Selected</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-gray"><Bookmark size={22} /></div>
          <div>
            <h3>{savedCount}</h3>
            <p>Saved Jobs</p>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="dashboard-card" style={{ marginTop: '32px' }}>
        <div className="card-header">
          <h3>Recent Applications</h3>
          <Link to="/candidate/applications" className="view-link">View All Applications</Link>
        </div>

        {applications.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id}>
                    <td>
                      <Link to={`/jobs/${app.job}`} className="table-link">
                        {app.job_details?.title || 'Job Title'}
                      </Link>
                    </td>
                    <td>{app.job_details?.company_name || 'Company'}</td>
                    <td>{app.job_details?.location || 'Location'}</td>
                    <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>
                      <Link to={`/jobs/${app.job}`} className="btn btn-outline btn-sm">
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <AlertCircle size={32} className="empty-icon" />
            <p>You haven't submitted any job applications yet.</p>
            <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Explore Jobs Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
