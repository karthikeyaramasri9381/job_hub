import React, { useState, useEffect } from 'react';
import { recruiterService } from '../../services/recruiterService';
import { Calendar, Video, Phone, MapPin, ExternalLink, Clock, UserCheck } from 'lucide-react';

const InterviewManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await recruiterService.getInterviews();
        if (res.success) {
          setInterviews(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load recruiter interviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const getInterviewIcon = (type) => {
    if (type === 'VIDEO') return <Video size={18} className="text-primary" />;
    if (type === 'PHONE') return <Phone size={18} className="text-primary" />;
    return <MapPin size={18} className="text-primary" />;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Scheduled Interviews Overview</h2>
          <p>Manage candidate interviews scheduled across your company's job listings</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading scheduled interviews...</div>
      ) : interviews.length > 0 ? (
        <div className="interviews-list-grid">
          {interviews.map((int) => (
            <div key={int.id} className="interview-card">
              <div className="interview-card-header">
                <div className="interview-type-tag">
                  {getInterviewIcon(int.interview_type)}
                  <span>{int.interview_type} Interview</span>
                </div>
                <span className={`status-badge ${int.status === 'SCHEDULED' ? 'badge-teal' : int.status === 'COMPLETED' ? 'badge-green' : 'badge-red'}`}>
                  {int.status}
                </span>
              </div>

              <h3 className="job-title-text">{int.job_title}</h3>
              <p className="company-text">Candidate: <strong>{int.candidate_name || int.candidate_email}</strong></p>

              <div className="interview-details">
                <div className="detail-item">
                  <Calendar size={16} /> {new Date(int.interview_date).toLocaleDateString()}
                </div>
                <div className="detail-item">
                  <Clock size={16} /> {int.interview_time}
                </div>
                {int.interviewer_name && (
                  <div className="detail-item">
                    <UserCheck size={16} /> Interviewer: {int.interviewer_name}
                  </div>
                )}
              </div>

              {int.notes && (
                <div className="interview-notes">
                  <p><strong>Notes:</strong> {int.notes}</p>
                </div>
              )}

              {int.meeting_link && (
                <div className="interview-card-footer">
                  <a
                    href={int.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm btn-block"
                  >
                    Open Meeting Link <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-card empty-state">
          <Calendar size={40} className="empty-icon" />
          <h3>No scheduled interviews</h3>
          <p>Review candidate applications and click "Schedule Interview" to invite applicants.</p>
        </div>
      )}
    </div>
  );
};

export default InterviewManagement;
