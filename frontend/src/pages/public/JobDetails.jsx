import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, DollarSign, Bookmark, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCandidate } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState({ success: false, message: '' });

  const fetchJob = async () => {
    try {
      const res = await jobService.getPublicJobDetail(id);
      if (res.success && res.data) {
        setJob(res.data);
      } else {
        setError('Job position not found.');
      }
    } catch {
      setError('Job details could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated || !isCandidate) {
      alert("Please log in as a candidate to save jobs.");
      return;
    }
    try {
      if (job.is_saved) {
        await jobService.unsaveJob(job.id);
        setJob({ ...job, is_saved: false });
      } else {
        await jobService.saveJob(job.id);
        setJob({ ...job, is_saved: true });
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyFeedback({ success: false, message: '' });

    try {
      const res = await jobService.applyForJob(job.id, { cover_letter: coverLetter });
      if (res.success) {
        setApplyFeedback({ success: true, message: 'Application submitted successfully!' });
        setTimeout(() => {
          setShowApplyModal(false);
        }, 1500);
      } else {
        setApplyFeedback({ success: false, message: res.message || 'Application failed.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      setApplyFeedback({ success: false, message: msg });
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading job details...</div>;
  if (error || !job) return <div style={{ textAlign: 'center', padding: '100px', color: '#dc2626' }}>{error || 'Job not found'}</div>;

  return (
    <div className="job-details-page">
      <div className="job-details-container">
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm back-btn">
          <ArrowLeft size={16} /> Back to Jobs
        </button>

        <div className="job-details-card">
          <div className="job-header-main">
            <div>
              <h1 className="job-title">{job.title}</h1>
              <p className="company-name">{job.company_name} • {job.company_location || job.location}</p>
            </div>

            <div className="job-actions">
              <button
                className={`btn btn-outline ${job.is_saved ? 'saved' : ''}`}
                onClick={handleToggleSave}
              >
                <Bookmark size={18} fill={job.is_saved ? '#2563eb' : 'none'} color={job.is_saved ? '#2563eb' : 'currentColor'} />
                {job.is_saved ? 'Saved' : 'Save Job'}
              </button>

              {isCandidate ? (
                <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
                  Apply Now
                </button>
              ) : !isAuthenticated ? (
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                  Log In to Apply
                </button>
              ) : null}
            </div>
          </div>

          <div className="job-key-metrics">
            <div className="metric-item">
              <MapPin size={20} className="metric-icon" />
              <div>
                <span className="metric-label">Location</span>
                <span className="metric-value">{job.location}</span>
              </div>
            </div>
            <div className="metric-item">
              <Clock size={20} className="metric-icon" />
              <div>
                <span className="metric-label">Work Mode & Type</span>
                <span className="metric-value">{job.work_mode} ({job.employment_type})</span>
              </div>
            </div>
            <div className="metric-item">
              <DollarSign size={20} className="metric-icon" />
              <div>
                <span className="metric-label">Offered Salary</span>
                <span className="metric-value">
                  {job.salary_min ? `$${Number(job.salary_min).toLocaleString()} - $${Number(job.salary_max).toLocaleString()}` : 'Negotiable'}
                </span>
              </div>
            </div>
          </div>

          <hr />

          <div className="job-description-section">
            <h2>Job Description</h2>
            <div className="content-text">{job.description}</div>
          </div>

          {job.responsibilities && (
            <div className="job-description-section">
              <h2>Key Responsibilities</h2>
              <div className="content-text">{job.responsibilities}</div>
            </div>
          )}

          {job.qualifications && (
            <div className="job-description-section">
              <h2>Qualifications & Requirements</h2>
              <div className="content-text">{job.qualifications}</div>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="job-description-section">
              <h2>Required Skills</h2>
              <div className="skills-list">
                {job.skills.map((s) => (
                  <span key={s.id} className="skill-pill">{s.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Apply for {job.title}</h3>
              <button className="close-btn" onClick={() => setShowApplyModal(false)}>×</button>
            </div>

            {applyFeedback.message && (
              <div className={`alert ${applyFeedback.success ? 'alert-success' : 'alert-danger'}`}>
                {applyFeedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {applyFeedback.message}
              </div>
            )}

            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label>Cover Letter / Additional Notes (Optional)</label>
                <textarea
                  rows={5}
                  placeholder="Introduce yourself and explain why you're a great fit for this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={applyLoading}>
                  {applyLoading ? 'Submitting...' : <><Send size={16} /> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
