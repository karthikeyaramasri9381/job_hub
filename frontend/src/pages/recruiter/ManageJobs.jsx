import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { Briefcase, Users, PlusCircle, Edit3, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchJobs = async () => {
    try {
      const res = await recruiterService.getJobs();
      if (res.success) {
        setJobs(res.data?.results || res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePublish = async (jobId) => {
    try {
      const res = await recruiterService.publishJob(jobId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Job published successfully!' });
        fetchJobs();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Publish failed.' });
    }
  };

  const handleClose = async (jobId) => {
    try {
      const res = await recruiterService.closeJob(jobId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Job status set to CLOSED.' });
        fetchJobs();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Close failed.' });
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to permanently delete this job listing?")) return;
    try {
      const res = await recruiterService.deleteJob(jobId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Job deleted successfully.' });
        fetchJobs();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Manage Posted Jobs</h2>
          <p>Create, publish, edit, or close job listings for your company</p>
        </div>
        <Link to="/recruiter/jobs/create" className="btn btn-primary btn-sm">
          <PlusCircle size={16} /> Post a New Job
        </Link>
      </div>

      {feedback.message && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px' }}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {feedback.message}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading job listings...</div>
      ) : jobs.length > 0 ? (
        <div className="dashboard-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Type & Mode</th>
                  <th>Status</th>
                  <th>Posted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link to={`/jobs/${job.id}`} className="table-link">{job.title}</Link>
                    </td>
                    <td>{job.location}</td>
                    <td>{job.work_mode} ({job.employment_type})</td>
                    <td>
                      <span className={`status-badge ${job.status === 'PUBLISHED' ? 'badge-green' : job.status === 'DRAFT' ? 'badge-orange' : 'badge-gray'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{new Date(job.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn btn-outline btn-sm">
                          <Users size={14} /> Applicants
                        </Link>
                        {job.status === 'DRAFT' && (
                          <button onClick={() => handlePublish(job.id)} className="btn btn-primary btn-sm">
                            Publish
                          </button>
                        )}
                        {job.status === 'PUBLISHED' && (
                          <button onClick={() => handleClose(job.id)} className="btn btn-outline btn-sm">
                            Close
                          </button>
                        )}
                        <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn btn-outline btn-sm">
                          <Edit3 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(job.id)} className="btn btn-danger-outline btn-sm">
                          <Trash2 size={14} />
                        </button>
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
          <h3>No posted jobs</h3>
          <p>Start hiring by posting your first job opportunity on JobHub.</p>
          <Link to="/recruiter/jobs/create" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Post a New Job
          </Link>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
