import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { Users, FileText, Calendar, CheckCircle, XCircle, ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';

const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Interview Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    interview_type: 'VIDEO',
    interview_date: '',
    interview_time: '14:00',
    meeting_link: '',
    interviewer_name: '',
    notes: '',
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const fetchApplicants = async () => {
    try {
      const res = await recruiterService.getJobApplicants(jobId);
      if (res.success) {
        setApplicants(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load applicants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await recruiterService.updateApplicantStatus(appId, newStatus);
      if (res.success) {
        setFeedback({ type: 'success', message: `Applicant status updated to ${newStatus}.` });
        fetchApplicants();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update status.' });
    }
  };

  const handleOpenScheduleModal = (appId) => {
    setSelectedAppId(appId);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleLoading(true);
    try {
      const res = await recruiterService.scheduleInterview(selectedAppId, interviewForm);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Interview scheduled successfully!' });
        setShowScheduleModal(false);
        fetchApplicants();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to schedule interview.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Interview scheduling failed.' });
    } finally {
      setScheduleLoading(false);
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
      <button onClick={() => navigate('/recruiter/jobs')} className="btn btn-outline btn-sm back-btn">
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="dashboard-header">
        <div>
          <h2>Job Applicants Review</h2>
          <p>Review candidate profiles, submitted resumes, and schedule interviews</p>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px' }}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {feedback.message}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading job applicants...</div>
      ) : applicants.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {applicants.map((app) => {
            const cand = app.candidate_details || {};
            return (
              <div key={app.id} className="dashboard-card" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{cand.full_name || cand.user_email}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '2px' }}>{cand.headline || 'Candidate'}</p>
                  <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '4px' }}>
                    Email: <strong>{cand.user_email}</strong> • Location: <strong>{cand.location || 'N/A'}</strong>
                  </p>

                  {app.cover_letter && (
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '0.9rem' }}>
                      <p style={{ fontWeight: 600, color: '#334155' }}>Cover Letter:</p>
                      <p style={{ color: '#475569', whiteSpace: 'pre-line', marginTop: '4px' }}>{app.cover_letter}</p>
                    </div>
                  )}

                  {cand.skills && cand.skills.length > 0 && (
                    <div className="skills-list" style={{ marginTop: '12px' }}>
                      {cand.skills.map((s) => (
                        <span key={s.id} className="skill-pill" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                          {s.skill_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                  {app.resume || cand.resume ? (
                    <a
                      href={app.resume || cand.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <FileText size={16} /> View Submitted Resume <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No resume link provided</span>
                  )}

                  <button
                    onClick={() => handleOpenScheduleModal(app.id)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Calendar size={16} /> Schedule Interview
                  </button>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button
                      onClick={() => handleStatusChange(app.id, 'SHORTLISTED')}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, fontSize: '0.8rem', color: '#16a34a' }}
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusChange(app.id, 'REJECTED')}
                      className="btn btn-danger-outline btn-sm"
                      style={{ flex: 1, fontSize: '0.8rem' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-card empty-state">
          <Users size={40} className="empty-icon" />
          <h3>No applications received yet</h3>
          <p>Applications submitted by candidates for this job listing will appear here.</p>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule Candidate Interview</h3>
              <button className="close-btn" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Interview Format</label>
                <select
                  value={interviewForm.interview_type}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interview_type: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="VIDEO">Video Call (Google Meet / Zoom)</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="IN_PERSON">In Person</option>
                </select>
              </div>

              <div className="form-row" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.interview_date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interview_date: e.target.value })}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    required
                    value={interviewForm.interview_time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interview_time: e.target.value })}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Meeting Link / Location</label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={interviewForm.meeting_link}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Interviewer Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith (Tech Lead)"
                  value={interviewForm.interviewer_name}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewer_name: e.target.value })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Interview Agenda / Notes</label>
                <textarea
                  rows={3}
                  placeholder="System design & technical deep dive..."
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={scheduleLoading}>
                  {scheduleLoading ? 'Scheduling...' : 'Confirm & Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;
