import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { candidateService } from '../../services/candidateService';
import { Briefcase, Eye, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchApplications = async () => {
    try {
      const res = await candidateService.getApplications();
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;

    try {
      const res = await candidateService.withdrawApplication(appId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Application withdrawn successfully.' });
        fetchApplications();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Withdrawal failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to withdraw application.' });
    }
  };

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>My Job Applications</h2>
          <p>Track progress and status updates for your submitted applications</p>
        </div>
        <Link to="/jobs" className="btn btn-primary btn-sm">Browse More Jobs</Link>
      </div>

      {feedback.message && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px' }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {feedback.message}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading submitted applications...</div>
      ) : applications.length > 0 ? (
        <div className="dashboard-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Cover Letter</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <Link to={`/jobs/${app.job}`} className="table-link">
                        {app.job_details?.title || 'Job Position'}
                      </Link>
                    </td>
                    <td>{app.job_details?.company_name || 'Company'}</td>
                    <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.cover_letter || 'None provided'}
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/jobs/${app.job}`} className="btn btn-outline btn-sm">
                          <Eye size={14} /> View
                        </Link>
                        {['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW'].includes(app.status) && (
                          <button
                            onClick={() => handleWithdraw(app.id)}
                            className="btn btn-danger-outline btn-sm"
                            title="Withdraw Application"
                          >
                            <XCircle size={14} /> Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="dashboard-card empty-state">
          <Briefcase size={40} className="empty-icon" />
          <h3>No applications found</h3>
          <p>Start applying to open job positions to track them here.</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '16px' }}>Find Jobs</Link>
        </div>
      )}
    </div>
  );
};

export default Applications;
